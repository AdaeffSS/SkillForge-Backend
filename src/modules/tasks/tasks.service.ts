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
    }).then()

    task.save().then()
  }

  async generateTask(exam: Exam, subject: Sub, task: string) {
    const random = new RandomProvider();
    const taskInstance = this.tasksManager.getTask(exam, subject, task, random);
    return taskInstance.createTask(random);
  }

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
        )
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
