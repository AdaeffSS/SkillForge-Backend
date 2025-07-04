import {
  BadRequestException, ConflictException,
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

@Injectable()
export class TasksService {
  constructor(private readonly tasksManager: TasksManager) {}

  async getTask(
    exam: Exam,
    subject: Sub,
    task: string,
    seed: number | undefined,
    req?: Request,
  ) {
    const random = new RandomProvider(seed);
    const taskInstance = this.tasksManager.getTask(exam, subject, task, random);
    return taskInstance.createTask(random, req!.user.sub);
  }

  async answerTask(taskId: string, answer: string, req: Request): Promise<any> {
    if (!taskId || !answer || !req?.user?.sub) {
      throw new BadRequestException(
        "The fields are incorrectly filled. Repeat the attempt.",
      );
    }

    let taskFromDb: Task | null;

    try {
      taskFromDb = await Task.findByPk(taskId);
    } catch (err) {
      if (err.status === 404) throw new NotFoundException('The task with such ID was not found')
      if (err.name === "SequelizeDatabaseError") {
        throw new BadRequestException("Invalid task ID format");
      }
      throw new InternalServerErrorException("Database error", { cause: err });
    }

    if (!taskFromDb) {
      throw new NotFoundException(`Task with ID ${taskId} not found.`);
    }

    if (taskFromDb.userId !== req.user.sub) {
      throw new ForbiddenException(
        `This task exists, but was issued to another user.`,
      );
    }

    if (taskFromDb.status == TaskStatus.SOLVED)
      throw new ConflictException("The task has already been solved");

    const [exam, subject, task] = taskFromDb.task.split(".");

    if (!exam || !subject || !task) {
      throw new BadRequestException(
        `Invalid task identifier format: "${taskFromDb.task}"`,
      );
    }

    const random = new RandomProvider(Number(taskFromDb.seed));

    try {
      const taskInstance = this.tasksManager.getTask(
        exam as Exam,
        subject as Sub,
        task,
        random,
      );

      const result = await taskInstance.checkAnswer(random, answer);
      taskFromDb.attempts += 1;

      if (result.status == "success") {
        taskFromDb.status = TaskStatus.SOLVED;
        taskFromDb.solvedAt = new Date();
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
