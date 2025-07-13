import { HttpException, Injectable } from "@nestjs/common";
import mustache from "mustache";

import { Logger } from "../logger/logger.service";
import { RandomProvider } from "../random-provider/random-provider.service";
import { ParamsGeneratorService } from "../params-generator/params-generator.service";
import { TaskLoaderService } from "@tasks/tasks.loader";
import { Task, TaskStatus } from "@tasks/entities/task.entity";

@Injectable()
export abstract class TaskConfigurer {
  /**
   * Схема параметров для генерации.
   * Должна быть реализована в потомках.
   */
  protected abstract readonly paramsSchema: any;

  /**
   * Параметры, загруженные из файла parameters.yaml
   */
  protected parameters!: Record<string, any>;

  /**
   * Провайдер случайных чисел
   */
  protected random: RandomProvider;

  private readonly logger = new Logger();

  /**
   * Конструктор класса.
   * @param paramsGenerator Сервис генерации параметров по схеме
   * @param taskLoader Сервис загрузки шаблонов и параметров задания
   */
  constructor(
    protected readonly paramsGenerator: ParamsGeneratorService,
    protected readonly taskLoader: TaskLoaderService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  /**
   * Получить метаданные (exam, subject, taskKey) из декораторов класса
   * @throws HttpException если метаданные не найдены
   */
  private getMetadata() {
    const constructor = this.constructor as any;
    const exam = Reflect.getMetadata("exam", constructor);
    const subject = Reflect.getMetadata("subject", constructor);
    const taskKey = Reflect.getMetadata("taskKey", constructor);

    if (!exam || !subject || !taskKey) {
      throw new HttpException("Task metadata not found", 500);
    }

    return { exam, subject, taskKey };
  }

  /**
   * Создать задачу, сгенерировать параметры и срендерить тело задания
   * @param random Провайдер случайных чисел
   * @returns Объект с моделью задачи и отрендеренным телом задания
   * @throws HttpException если шаблон не найден
   */
  async createTask(
    random: RandomProvider,
  ): Promise<{ task: any; body: string }> {
    const { exam, subject, taskKey } = this.getMetadata();

    this.random = random;
    this.parameters = this.taskLoader.getParameters(exam, subject, taskKey);

    const generatedParams = await this.paramsGenerator.generateParams(this.paramsSchema);
    const combinedParams = { ...this.parameters, ...generatedParams };

    const template = this.taskLoader.getTemplate(exam, subject, taskKey);
    if (!template) {
      throw new HttpException("Template not found.", 500);
    }

    const seed = random.getSeed();

    const task = await Task.create({
      seed: String(seed),
      task: `${exam}.${subject}.${taskKey}`,
    });

    return { task, body: mustache.render(template, combinedParams) };
  }

  /**
   * Восстановить параметры задачи по сиду (seed)
   * @param random Провайдер случайных чисел
   * @returns Объект с объединёнными параметрами
   */
  protected async regenerateParams(
    random: RandomProvider,
  ): Promise<Record<string, any>> {
    const { exam, subject, taskKey } = this.getMetadata();

    this.random = random;
    this.parameters = this.taskLoader.getParameters(exam, subject, taskKey);

    const generatedParams = await this.paramsGenerator.generateParams(this.paramsSchema);
    return { ...this.parameters, ...generatedParams };
  }

  /**
   * Проверить ответ пользователя
   * @param random Провайдер случайных чисел
   * @param userAnswer Ответ пользователя в виде строки
   * @returns Статус проверки задачи (решена или неверный ответ)
   * @throws Error если в параметрах нет правильного ответа
   */
  async checkAnswer(
    random: RandomProvider,
    userAnswer: string,
  ): Promise<{ status: TaskStatus }> {
    const combinedParams = await this.regenerateParams(random);

    if (!("answer" in combinedParams)) {
      throw new Error("Answer not found in taskCreator.");
    }

    const expected = String(combinedParams.answer).trim();
    const actual = String(userAnswer).trim();

    this.logger.debug(`Expected: "${expected}", actual: "${actual}", seed: ${random.getSeed()}`);

    return {
      status:
        expected.toLowerCase() === actual.toLowerCase()
          ? TaskStatus.SOLVED
          : TaskStatus.INCORRECT,
    };
  }
}
