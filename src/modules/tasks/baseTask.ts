import { ParamsGeneratorService } from "../params-generator/params-generator.service";
import { HttpException, Injectable } from "@nestjs/common";
import mustache from "mustache";
import { TaskLoaderService } from "./tasks.loader";
import 'reflect-metadata'
import { Task } from "@tasks/entities/task.entity";
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

  async createTask(random: RandomProvider, userId: string): Promise<{ id: string, body: string }> {
    const constructor = this.constructor as any;

    const exam = Reflect.getMetadata("exam", constructor);
    const subject = Reflect.getMetadata("subject", constructor);
    const taskKey = Reflect.getMetadata("taskKey", constructor);

    if (!exam || !subject || !taskKey) {
      throw new HttpException("Task metadata not found", 500);
    }

    this.random = random;
    this.parameters = this.taskLoader.getParameters(exam, subject, taskKey);

    const generatedParams = await this.paramsGenerator.generateParams(
      this.paramsSchema,
    );
    const combinedParams = { ...this.parameters, ...generatedParams };

    const template = this.taskLoader.getTemplate(exam, subject, taskKey);
    if (!template) {
      throw new HttpException("Template not found.", 500);
    }

    const seed = random.getSeed();

    const task = await Task.create({
      seed: String(seed),
      userId,
      task: `${exam}.${subject}.${taskKey}`,
    });

    return { id: task.id, body: mustache.render(template, combinedParams) };
  }
}
