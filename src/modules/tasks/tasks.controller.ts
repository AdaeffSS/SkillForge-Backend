import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { TasksManager } from "./tasks.manager";
import { Exam, Sub } from "./enums";
import { TasksService } from "./tasks.service";
import { JwtAuthGuard } from "modules/auth/guards/auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("tasks")
export class TasksController {
  constructor(
    private readonly taskManager: TasksManager,
    private readonly tasksService: TasksService,
  ) {}

  @Get()
  async getTask(
    @Query("exam") exam: Exam,
    @Query("subject") subject: Sub,
    @Query("task") task: string,
    @Query("seed") seed?: number,
    @Req() req?: Request,
  ) {
    return this.tasksService.getTask(exam, subject, task, seed, req);
  }

  @HttpCode(200)
  @Post()
  async checkTask(
    @Body("task") task: string,
    @Body("answer") answer: string,
    @Req() req: Request,
  ) {
    return await this.tasksService.answerTask(task, answer, req);
  }
}
