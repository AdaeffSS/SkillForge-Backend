import { ParamsGeneratorService } from "../params-generator/params-generator.service";
import { HttpException, Injectable } from "@nestjs/common";
import mustache from "mustache";
import { TaskLoaderService } from "./tasks.loader";
import "reflect-metadata";
import { Task, TaskStatus } from "@tasks/entities/task.entity";
import { RandomProvider } from "../random-provider/random-provider.service";

@Injectable()
export abstract class BaseTask {
  protected abstract readonly paramsSchema: any;
  protected parameters!: Record<string, any>;
  protected random: RandomProvider;

  constructor(
    protected readonly paramsGenerator: ParamsGeneratorService,
    protected readonly taskLoader: TaskLoaderService,
  ) {}

  async createTask(
    random: RandomProvider,
  ): Promise<{
    task: any; body: string }> {
    const constructor = this.constructor as any;

    const exam = Reflect.getMetadata("exam", constructor);
    const subject = Reflect.getMetadata("subject", constructor);
    const taskKey = Reflect.getMetadata("taskKey", constructor);

    if (!exam || !subject || !taskKey) {
      throw new HttpException("Task metadata not found", 500);
    }

    this.random = random;
    this.parameters = this.taskLoader.getParameters(exam, subject, taskKey);

    const combinedParams = await this.paramsGenerator.generateParams(
      this.paramsSchema,
    );

    const template = this.taskLoader.getTemplate(exam, subject, taskKey);
    if (!template) {
      throw new HttpException("Template not found.", 500);
    }

    const seed = random.getSeed();

    const task = await Task.create({
      seed: String(seed),
      task: `${exam}.${subject}.${taskKey}`,
    });

    return { task: task, body: mustache.render(template, combinedParams) };
  }

  protected async regenerateParams(
    random: RandomProvider,
  ): Promise<Record<string, any>> {
    const constructor = this.constructor as any;
    const exam = Reflect.getMetadata("exam", constructor);
    const subject = Reflect.getMetadata("subject", constructor);
    const taskKey = Reflect.getMetadata("taskKey", constructor);

    this.random = random;
    this.parameters = this.taskLoader.getParameters(exam, subject, taskKey);

    const generatedParams = await this.paramsGenerator.generateParams(
      this.paramsSchema,
    );
    return { ...generatedParams };
  }

  async checkAnswer(random: RandomProvider, userAnswer: string): Promise<{ status: string }> {
    const combinedParams = await this.regenerateParams(random);

    if (!("answer" in combinedParams)) {
      throw new Error("Answer not found in taskCreator.");
    }

    const expected = String(combinedParams.answer).trim();
    const actual = String(userAnswer).trim();

    console.log(combinedParams);
    console.log('chAns', random.getSeed());
    console.log(expected, actual);

    return { status: expected.toLowerCase() === actual.toLowerCase() ? TaskStatus.SOLVED : TaskStatus.INCORRECT };
  }
}
