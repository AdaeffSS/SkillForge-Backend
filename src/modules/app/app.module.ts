import { MiddlewareConsumer, Module, NestModule, DynamicModule } from "@nestjs/common";
import { SequelizeModule, SequelizeModuleOptions } from "@nestjs/sequelize";
import { ConfigModule } from "@nestjs/config";
import * as process from "node:process";
import { JwtModule } from "@nestjs/jwt";

import { TokensUtils } from "../auth/utils/tokens.util";
import { TasksModule } from "@tasks/tasks.module";
import { TaskLoaderService } from "@tasks/tasks.loader";
import { S3Module } from "../s3/s3.module";
import { MediaModule } from "../media/media.module";
import { Task } from "@tasks/entities/task.entity";
import { JwtDecodeMiddleware } from "../auth/middlewares/jwt.middleware";
import { SessionsModule } from "../sessions/sessions.module";
import { Session } from "modules/sessions/entities/session.entity";
import { SessionEvent } from "../sessions/entities/session-event.entity";
import { SessionConfiguration } from "../sessions/entities/session-configuration.entity";
import { Logger } from "../logger/logger.service";
import { TrainSession } from "../sessions/entities/train-session.entity";
import { User } from "../users/entities/user.entity";
import { Otp } from "../auth/entites/otp.entity";
import { AuthModule } from "../auth/auth.module";
import { LoggerMiddleware } from "../logger/logger.middleware";
import { LoggerModule } from "../logger/logger.module";

const sequelizeModels = [
  User,
  Otp,
  Task,
  Session,
  SessionEvent,
  TrainSession,
  SessionConfiguration,
];
function buildSequelizeOptions(logger: Logger): SequelizeModuleOptions {
  return {
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    models: sequelizeModels,
    autoLoadModels: true,
    synchronize: true,
    logging: (msg: string) => {
      logger.setContext("Sequelize");
      logger.debug(msg);
    },
  };
}

@Module({})
export class AppModule implements NestModule {

  static async forRootAsync(
    tasksClasses: any[],
    taskLoader: TaskLoaderService,
    logger: Logger
  ): Promise<DynamicModule> {
    const tasksModule = TasksModule.forRoot(tasksClasses, taskLoader);

    return {
      module: AppModule,
      imports: [
        tasksModule,
        SessionsModule.forRoot(tasksModule),
        MediaModule,
        S3Module,
        LoggerModule,
        JwtModule,
        AuthModule,
        await ConfigModule.forRoot({
          envFilePath: ".env",
        }),
        SequelizeModule.forRoot(buildSequelizeOptions(logger)),
      ],
      providers: [TokensUtils],
    };
  }



  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtDecodeMiddleware, LoggerMiddleware).forRoutes("{*path}");
  }
}
