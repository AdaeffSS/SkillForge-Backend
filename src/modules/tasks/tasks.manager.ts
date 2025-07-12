import { HttpException, Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import { BaseTask } from "@tasks/baseTask";
import { RandomProvider } from "../random-provider/random-provider.service";
import { TaskLoaderService } from "./tasks.loader";
import { ModuleRef } from "@nestjs/core";

@Injectable()
export class TasksManager implements OnModuleInit {
  private readonly registry = new Map<string, BaseTask>();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly taskLoaderService: TaskLoaderService
  ) {}

  private buildKey(exam: string, subject: string, taskKey: string): string {
    return `${exam}.${subject}.${taskKey}`;
  }

  async onModuleInit() {
    const taskClasses = await this.taskLoaderService.importAllTasks();

    for (const taskClass of taskClasses) {
      const taskInstance = this.moduleRef.get(taskClass, { strict: false });
      if (!taskInstance) continue;

      const exam = Reflect.getMetadata('exam', taskClass);
      const subject = Reflect.getMetadata('subject', taskClass);
      const taskKey = Reflect.getMetadata('taskKey', taskClass);

      if (!exam || !subject || !taskKey) {
        throw new InternalServerErrorException(`Task ${taskClass.name} is missing required metadata (exam, subject, taskKey)`);
      }

      const compositeKey = this.buildKey(exam, subject, taskKey);
      this.registry.set(compositeKey, taskInstance);
    }
  }

  private getVariantTasks(prefix: string): string[] {
    return Array.from(this.registry.keys()).filter(k => k.startsWith(prefix));
  }

  getTask(exam: string, subject: string, key: string, random: RandomProvider): BaseTask {
    const compositeKey = this.buildKey(exam, subject, key);

    const exactTask = this.registry.get(compositeKey);
    if (exactTask) {
      random.next();
      return exactTask;
    }

    const matchingKeys = this.getVariantTasks(`${compositeKey}_`);

    if (matchingKeys.length === 0) {
      throw new HttpException(`Task not found: ${compositeKey}`, 404);
    }

    const selectedKey = random.pick(matchingKeys);
    const selectedTask = this.registry.get(selectedKey);
    if (!selectedTask) {
      throw new InternalServerErrorException(`Task not found for key: ${selectedKey}`);
    }

    return selectedTask;
  }
}