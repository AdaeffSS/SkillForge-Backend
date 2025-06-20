import { TasksController } from './tasks.controller'
import { ParamsGeneratorService } from '../params-generator/params-generator.service'
import { FileLoaderModule } from "../file-loader/file-loader.module";
import { TasksManager } from "./tasks.manager";
import { tasksRegistry } from "./tasks.registry";
import { TaskOgeInfT11 } from "./oge/inf/t_1_1";
import { Module, DynamicModule } from '@nestjs/common';
import { importAllTasks } from "../../import";

// const tasksProviders = tasksRegistry.map(taskClass => taskClass)


@Module({})
export class TasksModule {
  static forRoot(tasksClasses: any[]): DynamicModule {
    return {
      module: TasksModule,
      imports: [FileLoaderModule],
      controllers: [TasksController],
      providers: [...tasksClasses, ParamsGeneratorService, TasksManager],
      exports: [...tasksClasses],
    };
  }
}