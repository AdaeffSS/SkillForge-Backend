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

  private createTrainSession(id: number, body: any, req: Request): void {
    TrainSession.create({
      id: id,
      task: body.task,
    }).then();
    if (body.task) {
      this.registerEvent({
        sessionId: id,
        type: EventType.SET_TASK_TYPE,
        context: {
          taskType: body.task,
        },
      }, req).then()
    }
  }
  async createSession(body: CreateSessionDto, req: Request): Promise<any> {
    const session = await Session.create({
      userId: req.user.sub,
      type: body.type,
      code: body.code,
      ...(body.name ? { name: body.name } : {}),
      ...(body.expireAt ? { expireAt: body.expireAt } : {}),
    });
    this.registerEvent(
      {
        sessionId: session.id,
        type: EventType.CREATE,
        context: {
          sessionId: session.id,
          sessionType: session.type
        }
      },
      req,
    ).then();
    if (body.type == SessionType.TRAIN)
      this.createTrainSession(session.id, body, req);
    return `/sessions/${session.id}`;
  }
  async registerEvent(event: RegisterEventDto, req: Request) {
    const session: Session | null = await Session.findByPk(event.sessionId);
    if (!session) throw new NotFoundException("Session does not exist");

    switch (event.type) {
      case EventType.CREATE:
        if (
          await SessionEvent.findOne({
            where: { sessionId: event.sessionId, type: EventType.CREATE },
          })
        )
          throw new ConflictException("This session has already been created");
        break;
      case EventType.START:
        session.isOpen = true;
        session.save().then();
        break;
      case EventType.ADD_TASK:
        session.taskCount += 1;
        session.save().then();
        break;
    }

    if (session!.userId != req.user.sub)
      throw new ForbiddenException("The session was created by another user");

    await SessionEvent.create({
      sessionId: event.sessionId,
      type: event.type,
      ...(event.context ? { context: event.context } : {}),
    });
  }

  async addTasks(id: any, body: any, req: Request): Promise<any> {
    const session = await Session.findByPk(id, {
      include: [TrainSession],
    });
    if (!session)
      throw new NotFoundException(`Session with id: ${id} does not exist`);
    if (session?.userId != req.user.sub)
      throw new ForbiddenException({
        message:
          "The session was created by another user. You do not have access to add tasks to this session",
        error: "TooManyTasks",
      });

    let tasks: any[] = [];

    const taskTypeFromTrainSession = session.trainSession?.task;

    if (taskTypeFromTrainSession) {
      const invalid = body.some(
        (item: any) => item.type && item.type !== taskTypeFromTrainSession,
      );
      if (invalid) {
        throw new BadRequestException({
          message: `This session is configured to use only task type "${taskTypeFromTrainSession}"`,
          error: "InvalidTaskType",
        });
      }
    }

    const summa: number = body.reduce(
      (sum: number, item: any) => sum + item.count,
      0,
    );

    if (summa > 100)
      throw new BadRequestException({
        message: `Too big request (${summa} tasks). The simultaneous generation of more than 100 tasks is prohibited`,
        error: "TooManyTasks",
      });

    for (const item of body) {
      for (let i = 0; i < item.count; i++) {
        const task = await this.tasksService.generateTask(
          Exam.OGE,
          Sub.INFO,
          taskTypeFromTrainSession || item.type,
        );
        task.task.sessionId = id;
        task.task.save().then();
        this.logger.debug(
          `Successfully generated task: ${task.task.id} in the request: ${req.requestId}`,
        );
        tasks.push({ id: task.task.id, body: task.body });
        await this.registerEvent(
          {
            sessionId: id,
            type: EventType.ADD_TASK,
            context: {
              taskId: task.task.id,
            },
          },
          req,
        ).then(() =>
          this.logger.debug(
            `Task ${task.task.id} added in session successfully (req: ${req.requestId})`,
          ),
        );
      }
    }
    this.logger.log(`${tasks.length} tasks added to session ${id}`);
    return tasks;
  }
}
