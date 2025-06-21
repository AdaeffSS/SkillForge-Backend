import { Controller, Get, Query } from "@nestjs/common";
import { TasksManager } from "./tasks.manager";
import { Exam, Sub } from "./enums";

@Controller("tasks")
export class TasksController {
  constructor(private readonly taskManager: TasksManager) {}

  @Get()
  async getTask(
    @Query('exam') exam: Exam,
    @Query('subject') subject: Sub,
    @Query('task') task: string
  ) {
    return this.taskManager.getTask(exam, subject, task).createTask()
  }
}
