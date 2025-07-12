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

  /**
   * Построить составной ключ задачи из экзамена, предмета и ключа задачи
   * @param exam Экзамен
   * @param subject Предмет
   * @param taskKey Ключ задачи
   * @returns Составной ключ
   */
  private buildKey(exam: string, subject: string, taskKey: string): string {
    return `${exam}.${subject}.${taskKey}`;
  }

  /**
   * Инициализация модуля: импорт всех классов задач и регистрация их экземпляров
   */
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

  /**
   * Получить все ключи задач, начинающиеся с заданного префикса
   * @param prefix Префикс ключа задачи
   * @returns Массив ключей задач, начинающихся с prefix
   */
  private getVariantTasks(prefix: string): string[] {
    return Array.from(this.registry.keys()).filter(k => k.startsWith(prefix));
  }

  /**
   * Получить задачу по экзамену, предмету и ключу задачи. Если точная задача не найдена,
   * ищутся варианты с постфиксом, и выбирается случайная.
   * @param exam Экзамен
   * @param subject Предмет
   * @param key Ключ задачи
   * @param random Провайдер случайных чисел
   * @returns Экземпляр задачи
   * @throws HttpException 404 если задача не найдена
   * @throws InternalServerErrorException если задача с выбранным ключом отсутствует в реестре
   */
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
