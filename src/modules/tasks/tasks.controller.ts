import { Controller, Get, Query, Res } from "@nestjs/common";
import { createWriteStream } from 'fs';
import { TasksManager } from "./tasks.manager";
import { Exam, Sub } from "./enums";
import { writeFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller("tasks")
export class TasksController {
  constructor(private readonly taskManager: TasksManager) {
  }

  @Get()
  async getTask(
    @Query('exam') exam: Exam,
    @Query('subject') subject: Sub,
    @Query('task') task: string
  ) {
    return this.taskManager.getTask(exam, subject, task).createTask()
  }
}
