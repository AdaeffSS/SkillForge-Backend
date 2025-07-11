import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Exam, Sub } from "@tasks/enums";
import { Request } from "express";
import { RandomProvider } from "../random-provider/random-provider.service";
import { TasksManager } from "./tasks.manager";
import { Task, TaskStatus } from "@tasks/entities/task.entity";
import { TrainSession } from "../sessions/entities/train-session.entity";
import { Session } from "../sessions/entities/session.entity";
import { EventType, SessionEvent } from "../sessions/entities/session-event.entity";

@Injectable()
export class TasksService {
  constructor(private readonly tasksManager: TasksManager) {}

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
    if (!taskId || !answer || !req?.user?.sub || !sessionId) {
      throw new BadRequestException(
        "The fields are incorrectly filled. Repeat the attempt.",
      );
    }

    let taskFromDb: Task | null;

    try {
      taskFromDb = await Task.findByPk(taskId, {
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

    if (taskFromDb?.session.userId !== req.user.sub) {
      throw new ForbiddenException("You have no access to this session.");
    }

    if (!taskFromDb) {
      throw new NotFoundException(`Task with ID ${taskId} not found.`);
    }

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
        taskFromDb.status = TaskStatus.INCORRECT;
        taskFromDb.solvedAt = new Date();
        SessionEvent.create({
          sessionId: taskFromDb.session.id,
          type: EventType.SOLVE_INCORRECTLY,
          context: { taskId: taskFromDb.id, taskType: taskFromDb.task }
        }).then()
      }

      if (result.status == TaskStatus.SOLVED) {
        taskFromDb.status = TaskStatus.SOLVED;
        taskFromDb.solvedAt = new Date();
        SessionEvent.create({
          sessionId: taskFromDb.session.id,
          type: EventType.SOLVE_INCORRECTLY,
          context: { taskId: taskFromDb.id, taskType: taskFromDb.task }
        }).then()
      }
      await taskFromDb.save();
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
