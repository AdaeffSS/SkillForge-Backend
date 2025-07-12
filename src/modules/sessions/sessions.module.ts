import { DynamicModule, Module } from "@nestjs/common";
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SequelizeModule } from "@nestjs/sequelize";
import { Session } from "./entities/session.entity";
import { SessionEvent } from "./entities/session-event.entity";
import { User } from "../users/entities/user.entity";
import { Task } from "@tasks/entities/task.entity";
import { SessionConfiguration } from "./entities/session-configuration.entity";
import { TrainSession } from "./entities/train-session.entity";
import { LoggerModule } from "modules/logger/logger.module";

@Module({})
export class SessionsModule {
  static forRoot(tasksModule: DynamicModule): DynamicModule {
    return {
      module: SessionsModule,
      imports: [
        tasksModule,
        LoggerModule,
        SequelizeModule.forFeature([Session, SessionEvent, SessionConfiguration, TrainSession, User, Task]),
      ],
      controllers: [SessionsController],
      providers: [SessionsService],
      exports: [SessionsService],
    };
  }
}

