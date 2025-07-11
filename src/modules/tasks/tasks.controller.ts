import {
  Body,
  Controller,
  Get,
  HttpCode, Param,
  Post, Put,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import { Request } from "express";
import { TasksManager } from "./tasks.manager";
import { TasksService } from "./tasks.service";
import { JwtAuthGuard } from "modules/auth/guards/auth.guard";
import { Exam, Sub } from "@tasks/enums";

@UseGuards(JwtAuthGuard)
@Controller("tasks")
export class TasksController {
  constructor(
    private readonly taskManager: TasksManager,
    private readonly tasksService: TasksService,
  ) {}

  //
  // @HttpCode(200)
  // @Post()
  // async checkTask(
  //   @Body("task") task: string,
  //   @Body("answer") answer: string,
  //   @Req() req: Request,
  // ) {
  //   return await this.tasksService.answerTask(task, answer, req);
  // }
}
