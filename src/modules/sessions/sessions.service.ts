import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Request } from "express";
import { CreateSessionDto } from "./dto/create-session.dto";
import { Session } from "./entities/session.entity";
import { RegisterEventDto } from "./dto/register-event.dto";
import { EventType, SessionEvent } from "./entities/session-event.entity";
import { TrainSession } from "./entities/train-session.entity";
import { TasksService } from "@tasks/tasks.service";
import { Exam, Sub } from "@tasks/enums";
import { Logger } from "../logger/logger.service";
import { SessionType } from "./unums/session-type.enum";

@Injectable()
export class SessionsService {
  constructor(
    private readonly tasksService: TasksService,
    private readonly logger: Logger,
  ) {
    logger.setContext(SessionsService.name);
  }

  /**
   * Ищет сессию по ID или выбрасывает исключение 404, если не найдена.
   * @param id - Идентификатор сессии.
   * @returns Promise, который резолвится в объект сессии.
   * @throws NotFoundException если сессия не найдена.
   */
  private async findSessionOrFail(id: number): Promise<Session> {
    const session = await Session.findByPk(id, { include: [TrainSession] });
    if (!session)
      throw new NotFoundException(`Session with id: ${id} does not exist`);
    return session;
  }

  /**
   * Проверяет, что текущий пользователь является владельцем сессии.
   * @param session - объект сессии.
   * @param userId - идентификатор пользователя.
   * @throws ForbiddenException если пользователь не является владельцем сессии.
   */
  private assertUserOwnsSession(session: Session, userId: string): void {
    if (session.userId !== userId) {
      throw new ForbiddenException(
        "The session was created by another user. You do not have access to modify this session",
      );
    }
  }

  /**
   * Проверяет, что событие создания сессии еще не зарегистрировано.
   * @param event - DTO события регистрации.
   * @throws ConflictException если событие создания уже существует.
   */
  private async createEventIfNotExists(event: RegisterEventDto): Promise<void> {
    const exists = await SessionEvent.findOne({
      where: { sessionId: event.sessionId, type: event.type },
    });
    if (exists)
      throw new ConflictException("This session has already been created");
  }

  /**
   * Асинхронно сохраняет сессию.
   * @param session - объект сессии.
   */
  private saveSession(session: Session): void {
    session.save().then();
  }

  /**
   * Создает сессию типа TRAIN и регистрирует соответствующее событие.
   * @param id - Идентификатор сессии.
   * @param body - Тело запроса с данными сессии.
   * @param req - HTTP-запрос для получения данных пользователя.
   */
  private async createTrainSession(id: number, body: any, req: Request): Promise<void> {
    await TrainSession.create({ id, task: body.task });

    if (body.task) {
      await this.registerEvent(
        {
          sessionId: id,
          type: EventType.SET_TASK_TYPE,
          context: { taskType: body.task },
        },
        req,
      );
    }
  }

  /**
   * Создает новую сессию, регистрирует событие создания и, если нужно, создает тренировочную сессию.
   * @param body - DTO создания сессии.
   * @param req - HTTP-запрос для получения данных пользователя.
   * @returns URL созданной сессии.
   */
  async createSession(body: CreateSessionDto, req: Request): Promise<string> {
    const session = await Session.create({
      userId: req.user.sub,
      type: body.type,
      code: body.code,
      ...(body.name ? { name: body.name } : {}),
      ...(body.expireAt ? { expireAt: body.expireAt } : {}),
    });

    await this.registerEvent(
      {
        sessionId: session.id,
        type: EventType.CREATE,
        context: {
          sessionId: session.id,
          sessionType: session.type,
        },
      },
      req,
    );

    if (body.type === SessionType.TRAIN)
      await this.createTrainSession(session.id, body, req);

    this.logger.log(`Session created: ${session.id} (user: ${req.user.sub})`);
    return `/sessions/${session.id}`;
  }

  /**
   * Регистрирует событие сессии с проверкой доступа и обновлением состояния сессии.
   * @param event - DTO события регистрации.
   * @param req - HTTP-запрос для получения данных пользователя.
   */
  async registerEvent(event: RegisterEventDto, req: Request): Promise<void> {
    const session = await this.findSessionOrFail(event.sessionId);
    this.assertUserOwnsSession(session, req.user.sub);

    if (event.type === EventType.CREATE) {
      await this.createEventIfNotExists(event);
    }

    if (event.type === EventType.START) {
      session.isOpen = true;
      this.saveSession(session);
      this.logger.debug(`Session ${session.id} started`);
    }

    if (event.type === EventType.ADD_TASK) {
      session.taskCount += 1;
      this.saveSession(session);
      this.logger.debug(`Task added to session ${session.id}, total: ${session.taskCount}`);
    }

    await SessionEvent.create({
      sessionId: event.sessionId,
      type: event.type,
      ...(event.context ? { context: event.context } : {}),
    });

    this.logger.log(`Event ${event.type} registered for session ${event.sessionId}`);
  }

  /**
   * Добавляет задачи в сессию с проверкой прав, ограничений по типу и количеству.
   * @param id - Идентификатор сессии.
   * @param body - Массив объектов с описанием задач.
   * @param req - HTTP-запрос для получения данных пользователя.
   * @returns Массив добавленных задач с их идентификаторами и телом.
   * @throws BadRequestException при превышении лимита задач или несоответствии типа задачи.
   */
  async addTasks(id: number, body: any[], req: Request): Promise<any[]> {
    const session = await this.findSessionOrFail(id);
    this.assertUserOwnsSession(session, req.user.sub);

    const taskTypeFromTrainSession = session.trainSession?.task;

    if (taskTypeFromTrainSession) {
      const invalid = body.some(
        (item) => item.type && item.type !== taskTypeFromTrainSession,
      );
      if (invalid) {
        throw new BadRequestException({
          message: `This session is configured to use only task type "${taskTypeFromTrainSession}"`,
          error: "InvalidTaskType",
        });
      }
    }

    const totalCount = body.reduce((sum, item) => sum + item.count, 0);
    if (totalCount > 100) {
      throw new BadRequestException({
        message: `Too big request (${totalCount} tasks). The simultaneous generation of more than 100 tasks is prohibited`,
        error: "TooManyTasks",
      });
    }

    const tasks: any[] = [];

    for (const item of body) {
      const type = taskTypeFromTrainSession || item.type;

      for (let i = 0; i < item.count; i++) {
        const result = await this.tasksService.generateTask(Exam.OGE, Sub.INFO, type);
        result.task.sessionId = id;
        this.saveSession(result.task);

        this.logger.debug(`Generated task: ${result.task.id} (req: ${req.requestId})`);

        tasks.push({ id: result.task.id, body: result.body });

        await this.registerEvent(
          {
            sessionId: id,
            type: EventType.ADD_TASK,
            context: { taskId: result.task.id },
          },
          req,
        );

        this.logger.debug(
          `Task ${result.task.id} added to session (req: ${req.requestId})`,
        );
      }
    }

    this.logger.log(`${tasks.length} tasks added to session ${id}`);
    return tasks;
  }
}
