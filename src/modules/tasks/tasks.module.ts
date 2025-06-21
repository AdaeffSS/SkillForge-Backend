import { TasksController } from './tasks.controller'
import { ParamsGeneratorService } from '../params-generator/params-generator.service'
import { TasksManager } from "./tasks.manager";
import { Module, DynamicModule } from '@nestjs/common';
import { TaskLoaderService } from "./tasks.loader";
import { LoggerModule } from "../logger/logger.module";

@Module({})
export class TasksModule {
  static forRoot(tasksClasses: any[]): DynamicModule {
    return {
      module: TasksModule,
      imports: [LoggerModule],
      controllers: [TasksController],
      providers: [...tasksClasses, ParamsGeneratorService, TasksManager, TaskLoaderService],
      exports: [...tasksClasses, TaskLoaderService],
    };
  }
}