import { Injectable } from "@nestjs/common";
import { Exam, Sub } from "./enums";
import { BaseTask } from "./baseTask";
import { TaskOgeInfT11 } from "./oge/inf/t_1_1";
import { TaskOgeInfT12 } from "./oge/inf/t_1_2";

@Injectable()
export class TasksManager {
  private readonly registry = new Map<string, BaseTask<any>>();

  constructor(
    private readonly taskOgeInfT11: TaskOgeInfT11,
    private readonly taskOgeInfT12: TaskOgeInfT12
  ) {
    this.register(Exam.OGE, Sub.INFO, "t_1_1", taskOgeInfT11);
    this.register(Exam.OGE, Sub.INFO, 't_1_2', taskOgeInfT12);
  }

  private register(exam: Exam, subject: Sub, key: string, task: BaseTask<any>) {
    const compositeKey = this.composeKey(exam, subject, key);
    this.registry.set(compositeKey, task);
  }

  private composeKey(exam: Exam, subject: Sub, key: string): string {
    return `${exam}_${subject}_${key}`;
  }

  getTask<T>(exam: Exam, subject: Sub, key: string): BaseTask<T> {
    const compositeKey = this.composeKey(exam, subject, key);
    const task = this.registry.get(compositeKey);

    if (!task) {
      throw new Error(`Task not found: ${compositeKey}`);
    }

    return task;
  }
}
