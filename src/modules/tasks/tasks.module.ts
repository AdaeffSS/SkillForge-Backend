import { TasksController } from "./tasks.controller";
import { ParamsGeneratorService } from "../params-generator/params-generator.service";
import { TasksManager } from "./tasks.manager";
import { Module, DynamicModule } from "@nestjs/common";
import { TaskLoaderService } from "./tasks.loader";
import { LoggerModule } from "../logger/logger.module";
import { Logger } from "../logger/logger.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Task } from "@tasks/entities/task.entity";
import { User } from "../users/entities/user.entity";
import { TasksService } from "@tasks/tasks.service";
import { Session } from "../sessions/entities/session.entity";

@Module({})
export class TasksModule {
  static forRoot(
    tasksClasses: any[],
    taskLoader: TaskLoaderService,
  ): DynamicModule {
    return {
      module: TasksModule,
      imports: [LoggerModule, SequelizeModule],
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
