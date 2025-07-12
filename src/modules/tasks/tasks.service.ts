import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Request } from "express";

import { RandomProvider } from "../random-provider/random-provider.service";
import { TasksManager } from "./tasks.manager";
import { Task, TaskStatus } from "@tasks/entities/task.entity";
import { Session } from "../sessions/entities/session.entity";
import { EventType, SessionEvent } from "../sessions/entities/session-event.entity";
import { Exam, Sub } from "@tasks/enums";

@Injectable()
export class TasksService {
  constructor(private readonly tasksManager: TasksManager) {}

  /**
   * Валидация параметров для ответа на задачу
   * @param taskId ID задачи
   * @param answer Ответ пользователя
   * @param sessionId ID сессии
   * @param userId ID пользователя (опционально)
   * @throws BadRequestException при отсутствии необходимых параметров
   */
  private validateAnswerTaskParams(
    taskId: string,
    answer: string,
    sessionId: number,
    userId?: string,
  ): void {
    if (!taskId || !answer || !userId || !sessionId) {
      throw new BadRequestException(
        "The fields are incorrectly filled. Repeat the attempt.",
      );
    }
  }

  /**
   * Поиск задачи по ID и проверка прав доступа пользователя
   * @param taskId ID задачи
   * @param userId ID пользователя
   * @returns Найденная задача
   * @throws NotFoundException если задача не найдена
   * @throws ForbiddenException если пользователь не имеет доступа к сессии задачи
   * @throws BadRequestException при ошибке формата ID
   * @throws InternalServerErrorException при ошибках базы данных
   */
  private async findTaskAndCheckAccess(
    taskId: string,
    userId: string,
  ): Promise<Task> {
    let task: Task | null;
    try {
      task = await Task.findByPk(taskId, {
        include: [Session],
      });
    } catch (err) {
      if (err.status === 404)
        throw new NotFoundException("The task with such ID was not found");
      if (err.name === "SequelizeDatabaseError") {
        throw new BadRequestException("Invalid task ID format");
      }
      throw new InternalServerErrorException("Database error", { cause: err });
    }

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found.`);
    }

    if (task.session.userId !== userId) {
      throw new ForbiddenException("You have no access to this session.");
    }

    return task;
  }

  /**
   * Обновить статус задачи, установить время решения и зарегистрировать событие сессии
   * @param task Задача для обновления
   * @param newStatus Новый статус задачи
   * @param eventType Тип события сессии для логирования
   */
  private updateTaskStatusAndLogEvent(
    task: Task,
    newStatus: TaskStatus,
    eventType: EventType,
  ) {
    task.status = newStatus;
    task.solvedAt = new Date();

    SessionEvent.create({
      sessionId: task.session.id,
      type: eventType,
      context: { taskId: task.id, taskType: task.task },
    }).then();

    task.save().then();
  }

  /**
   * Сгенерировать новую задачу по экзамену, предмету и ключу
   * @param exam Экзамен
   * @param subject Предмет
   * @param task Ключ задачи
   * @returns Сгенерированная задача
   */
  async generateTask(exam: Exam, subject: Sub, task: string) {
    const random = new RandomProvider();
    const taskInstance = this.tasksManager.getTask(exam, subject, task, random);
    return taskInstance.createTask(random);
  }

  /**
   * Обработать ответ на задачу пользователя
   * @param taskId ID задачи
   * @param answer Ответ пользователя
   * @param sessionId ID сессии
   * @param req Объект запроса Express (используется для получения пользователя)
   * @returns Результат проверки ответа и количество попыток
   * @throws BadRequestException при некорректных параметрах или формате идентификатора задачи
   * @throws ForbiddenException при отсутствии доступа к сессии
   * @throws ConflictException если задача уже решена
   * @throws InternalServerErrorException при ошибках выполнения задачи
   */
  async answerTask(
    taskId: string,
    answer: string,
    sessionId: number,
    req: Request,
  ): Promise<any> {
    this.validateAnswerTaskParams(taskId, answer, sessionId, req.user.sub);

    const taskFromDb = await this.findTaskAndCheckAccess(taskId, req.user.sub);

    if (taskFromDb.status == TaskStatus.SOLVED)
      throw new ConflictException("The task has already been solved");

    const [exam, subject, task] = taskFromDb.task.split(".");

    if (!exam || !subject || !task) {
      throw new BadRequestException(
        `Invalid task identifier format: "${taskFromDb.task}"`,
      );
    }

    const random = new RandomProvider(taskFromDb.seed);

    try {
      const taskInstance = this.tasksManager.getTask(
        exam as Exam,
        subject as Sub,
        task,
        random,
      );

      const result = await taskInstance.checkAnswer(random, answer);
      taskFromDb.attempts += 1;

      if (
        result.status == TaskStatus.INCORRECT &&
        taskFromDb.status != TaskStatus.INCORRECT
      ) {
        this.updateTaskStatusAndLogEvent(
          taskFromDb,
          TaskStatus.INCORRECT,
          EventType.SOLVE_INCORRECTLY
        );
      }

      if (result.status == TaskStatus.SOLVED) {
        this.updateTaskStatusAndLogEvent(
          taskFromDb,
          TaskStatus.SOLVED,
          EventType.SOLVE_CORRECTLY,
        );
      }

      return { ...result, attempts: taskFromDb.attempts };
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }

      throw new InternalServerErrorException("Task execution failed", {
        cause: err,
      });
    }
  }
}
