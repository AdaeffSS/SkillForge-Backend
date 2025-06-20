import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { tasksRegistry } from './tasks.registry';
import { BaseTask } from './baseTask';

@Injectable()
export class TasksManager implements OnModuleInit {
  private readonly registry = new Map<string, BaseTask<any>>();

  constructor(private readonly moduleRef: ModuleRef) {}

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

  getTask<T>(exam: string, subject: string, key: string): BaseTask<T> {
    const compositeKey = `${exam}.${subject}.${key}`;
    const task = this.registry.get(compositeKey);
    if (!task) {
      throw new Error(`Task not found: ${compositeKey}`);
    }
    return task;
  }
}
