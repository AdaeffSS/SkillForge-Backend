import { BadRequestException, ForbiddenException, Injectable, Query, Req } from "@nestjs/common";
import { Exam, Sub } from "@tasks/enums";
import { Request } from "express";
import { RandomProvider } from "../random-provider/random-provider.service";
import { TasksManager } from "./tasks.manager";
import { BaseTask } from "@tasks/baseTask";
import { Task } from "@tasks/entities/task.entity";


@Injectable()
export class TasksService {

  constructor(
    private readonly tasksManager: TasksManager,
  ) {}

  async getTask(exam: Exam, subject: Sub, task: string, seed: number | undefined, req?: Request) {
    const random = new RandomProvider(seed);
    const taskInstance = this.tasksManager.getTask(exam, subject, task, random);
    return taskInstance.createTask(random, req!.user.sub);
  }

  async answerTask(taskId: string, answer: string, req: Request): Promise<any> {
    if (!answer || !taskId || !req)
      throw new BadRequestException(
        "The fields are incorrectly filled. Repeat the attempt",
      );
    try {
      const taskFromDb = await Task.findByPk(taskId);
      if (taskFromDb!.userId != req.user.sub) {
        throw new ForbiddenException(`This task exists, but was issued to another user.`)
      }
      const random = new RandomProvider(Number(taskFromDb!.seed));
      const [ exam, subject, task ] = taskFromDb!.task.split('.')
      const taskInstance = this.tasksManager.getTask(exam, subject, task, random);
      return taskInstance.checkAnswer(random, answer);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}