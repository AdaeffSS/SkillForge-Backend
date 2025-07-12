import { Module, DynamicModule } from "@nestjs/common";

import { TasksController } from "./tasks.controller";
import { ParamsGeneratorService } from "../params-generator/params-generator.service";
import { TasksManager } from "./tasks.manager";
import { TaskLoaderService } from "./tasks.loader";
import { LoggerModule } from "../logger/logger.module";
import { Logger } from "../logger/logger.service";
import { TasksService } from "@tasks/tasks.service";

@Module({})
export class TasksModule {

  static forRoot(
    tasksClasses: any[],
    taskLoader: TaskLoaderService,
  ): DynamicModule {

    return {
      module: TasksModule,
      imports: [LoggerModule],
      controllers: [TasksController],
      providers: [
        ...tasksClasses,
        TasksService,
        ParamsGeneratorService,
        Logger,
        TasksManager,
        {
          provide: TaskLoaderService,
          useValue: taskLoader,
        },
      ],
      exports: [...tasksClasses, TaskLoaderService, TasksService, TasksManager],
    };
  }
}
