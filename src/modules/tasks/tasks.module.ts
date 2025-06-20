import { TasksController } from './tasks.controller'
import { ParamsGeneratorService } from '../params-generator/params-generator.service'
import { TasksManager } from "./tasks.manager";
import { tasksRegistry } from "./tasks.registry";
import { TaskOgeInfT11 } from "./oge/inf/t_1_1";
import { Module, DynamicModule } from '@nestjs/common';
import { TaskLoaderService } from "./tasks.loader";
import { LoggerModule } from "../logger/logger.module";
import { FileLoaderModule } from "../file-loader/file-loader.module";
import { FileLoaderService } from "../file-loader/file-loader.service";

@Module({})
export class TasksModule {
  static forRoot(tasksClasses: any[]): DynamicModule {
    return {
      module: TasksModule,
      imports: [LoggerModule, FileLoaderModule],
      controllers: [TasksController],
      providers: [...tasksClasses, ParamsGeneratorService, TasksManager, TaskLoaderService, FileLoaderService],
      exports: [...tasksClasses, TaskLoaderService],
    };
  }
}