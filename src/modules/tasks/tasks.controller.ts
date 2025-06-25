import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { TasksManager } from "./tasks.manager";
import { Exam, Sub } from "./enums";
import { RandomProvider } from "../random-provider/random-provider.service";
import { JwtAuthGuard } from "../auth/guards/auth.guard";

@Controller("tasks")
export class TasksController {
  constructor(private readonly taskManager: TasksManager) {
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTask(
    @Query('exam') exam: Exam,
    @Query('subject') subject: Sub,
    @Query('task') task: string,
    @Query('seed') seed?: number,
    @Req() req?: Request
  ) {
    const random = new RandomProvider(seed);
    const taskInstance = this.taskManager.getTask(exam, subject, task, random);
    return taskInstance.createTask(random, req!.user.sub);
  }
}
