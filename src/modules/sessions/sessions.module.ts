import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SequelizeModule } from "@nestjs/sequelize";
import { Session } from "./entities/session.entity";
import { SessionEvent } from "./entities/session-event.entity";
import { User } from "../users/entities/user.entity";
import { Task } from "@tasks/entities/task.entity";
import { SessionConfiguration } from "./entities/session-configuration.entity";
import { TrainSession } from "./entities/train-session.entity";
import { TasksModule } from "@tasks/tasks.module";
import { TasksService } from "@tasks/tasks.service";
import { TasksManager } from "@tasks/tasks.manager";

@Module({
  imports: [
    TasksModule,
    SequelizeModule.forFeature([Session, SessionEvent, SessionConfiguration, TrainSession, User, Task]),
  ],
  controllers: [SessionsController],
  providers: [SessionsService, TasksService, TasksManager],
})
export class SessionsModule {}
