import { HttpException, Injectable } from "@nestjs/common";
import mustache from "mustache";

import { Logger } from "../logger/logger.service";
import { RandomProvider } from "../random-provider/random-provider.service";
import { ParamsGeneratorService } from "../params-generator/params-generator.service";
import { TaskLoaderService } from "@tasks/tasks.loader";
import { Task, TaskStatus } from "@tasks/entities/task.entity";

@Injectable()
export abstract class BaseTask {
  protected abstract readonly paramsSchema: any;
  protected parameters!: Record<string, any>;
  protected random: RandomProvider;

  private readonly logger = new Logger();

  constructor(
    protected readonly paramsGenerator: ParamsGeneratorService,
    protected readonly taskLoader: TaskLoaderService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

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

  protected async regenerateParams(
    random: RandomProvider,
  ): Promise<Record<string, any>> {
    const { exam, subject, taskKey } = this.getMetadata();

    this.random = random;
    this.parameters = this.taskLoader.getParameters(exam, subject, taskKey);

    const generatedParams = await this.paramsGenerator.generateParams(this.paramsSchema);
    return { ...this.parameters, ...generatedParams };
  }

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