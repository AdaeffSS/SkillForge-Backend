import {
  BadRequestException,
  ForbiddenException,
  Injectable, InternalServerErrorException,
  NotFoundException,
  Query,
  Req
} from "@nestjs/common";
import { Exam, Sub } from "@tasks/enums";
import { Request } from "express";
import { RandomProvider } from "../random-provider/random-provider.service";
import { TasksManager } from "./tasks.manager";
import { BaseTask } from "@tasks/baseTask";
import { Task } from "@tasks/entities/task.entity";
import { Sequelize } from "sequelize";

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
        "The fields are incorrectly filled. Repeat the attempt."
      );
    }

    let taskFromDb: Task | null;

    try {
      taskFromDb = await Task.findByPk(taskId);
    } catch (err) {
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
        `This task exists, but was issued to another user.`
      );
    }

    const [exam, subject, task] = taskFromDb.task.split(".");

    if (!exam || !subject || !task) {
      throw new BadRequestException(
        `Invalid task identifier format: "${taskFromDb.task}"`
      );
    }

    const random = new RandomProvider(Number(taskFromDb.seed));

    try {
      const taskInstance = this.tasksManager.getTask(
        exam as Exam,
        subject as Sub,
        task,
        random
      );

      return taskInstance.checkAnswer(random, answer);
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof ForbiddenException) {
        throw err;
      }

      throw new InternalServerErrorException("Task execution failed", { cause: err });
    }
  }

}
