import { FileLoaderService } from "../file-loader/file-loader.service";
import { ParamsGeneratorService } from "../params-generator/params-generator.service";
import { Injectable } from "@nestjs/common";
import mustache from "mustache";

@Injectable()
export abstract class BaseTask<TParams> {
  constructor(
    protected readonly paramsGenerator: ParamsGeneratorService,
    protected readonly fileLoader: FileLoaderService,
  ) {}

  protected abstract taskKey: string;
  protected abstract paramsSchema: any;

  protected get taskFolder(): string {
    const parts = this.taskKey.split('_');
    parts.pop();
    return parts.join('_');
  }

  async createTask(): Promise<string> {
    const params = await this.paramsGenerator.generateParams(this.paramsSchema);
    const template = this.fileLoader.getTasks()[this.taskFolder][this.taskKey];
    return mustache.render(template, params);
  }
}
