import { Controller, Get } from "@nestjs/common";
import { TasksManager } from "./tasks.manager";
import { Exam, Sub } from "./enums";

@Controller("tasks")
export class TasksController {
  constructor(private readonly taskManager: TasksManager) {}

  @Get()
  async getTask(): Promise<string> {
    return await this.taskManager.getTask(Exam.OGE, Sub.INFO, 't_1_2').createTask();
  }
}
