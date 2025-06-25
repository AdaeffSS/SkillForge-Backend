import { HttpException, Injectable, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from '@nestjs/core';
import { tasksRegistry } from './tasks.registry';
import { BaseTask } from './baseTask';
import { RandomProvider } from "../random-provider/random-provider.service";

@Injectable()
export class TasksManager implements OnModuleInit {
  private readonly registry = new Map<string, BaseTask>();

  constructor(
    private readonly moduleRef: ModuleRef
  ) {}

  async onModuleInit() {
    for (const taskClass of tasksRegistry) {
      const taskInstance = this.moduleRef.get(taskClass, { strict: false });
      if (!taskInstance) continue;

      const exam = Reflect.getMetadata('exam', taskClass);
      const subject = Reflect.getMetadata('subject', taskClass);
      const taskKey = Reflect.getMetadata('taskKey', taskClass);

      if (!exam || !subject || !taskKey) {
        throw new Error(`Task ${taskClass.name} is missing metadata`);
      }

      const compositeKey = `${exam}.${subject}.${taskKey}`;
      this.registry.set(compositeKey, taskInstance);
    }
  }

  getTask<T>(exam: string, subject: string, key: string, random: RandomProvider): BaseTask {
    const compositeKey = `${exam}.${subject}.${key}`;

    const exactTask = this.registry.get(compositeKey);
    if (exactTask) {
      return exactTask;
    }

    const matchingKeys = Array.from(this.registry.keys()).filter(k => k.startsWith(`${compositeKey}_`));

    if (matchingKeys.length === 0) {
      throw new HttpException(`Task not found: ${compositeKey}`, 404);
    }

    const task_type = random.pick(matchingKeys)
    console.log(task_type)

    return this.registry.get(task_type)!;
  }
}
