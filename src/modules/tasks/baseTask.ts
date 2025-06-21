import { ParamsGeneratorService } from "../params-generator/params-generator.service";
import { HttpException, Injectable } from "@nestjs/common";
import mustache from "mustache";
import { TaskLoaderService } from "./tasks.loader";
import 'reflect-metadata'

@Injectable()
export abstract class BaseTask<TParams> {
  constructor(
    protected readonly paramsGenerator: ParamsGeneratorService,
    protected readonly taskLoader: TaskLoaderService,
  ) {}

  protected abstract taskKey: string;
  protected abstract paramsSchema: any;


  async createTask() {
    const constructor = this.constructor as any;
    const exam = Reflect.getMetadata('exam', constructor);
    const subject = Reflect.getMetadata('subject', constructor);
    const taskKey = Reflect.getMetadata('taskKey', constructor);

    if (!exam || !subject || !taskKey) {
      throw new HttpException('Task metadata not found', 500);
    }

    const params = await this.paramsGenerator.generateParams(this.paramsSchema);
    const template = this.taskLoader.getTemplate(exam, subject, taskKey);

    if (!template) {
      throw new HttpException("Template not found.", 500);
    }

    return mustache.render(template, params);
  }
}
