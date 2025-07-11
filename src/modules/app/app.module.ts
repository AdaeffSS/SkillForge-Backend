import { MiddlewareConsumer, Module, NestModule, DynamicModule } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule } from "@nestjs/config";
import { User } from "../users/entities/user.entity";
import { Otp } from "../auth/entites/otp.entity";
import { AuthModule } from "../auth/auth.module";
import * as process from "node:process";
import { LoggerMiddleware } from "../logger/logger.middleware";
import { LoggerModule } from "../logger/logger.module";
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

@Module({})
export class AppModule implements NestModule {
  static async forRootAsync(tasksClasses: any[], taskLoader: TaskLoaderService): Promise<DynamicModule> {
    return {
      module: AppModule,
      imports: [
        SessionsModule,
        MediaModule,
        S3Module,
        TasksModule.forRoot(tasksClasses, taskLoader),
        LoggerModule,
        JwtModule,
        AuthModule,
        await ConfigModule.forRoot({
          envFilePath: ".env",
        }),
        SequelizeModule.forRoot({
          dialect: "postgres",
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT) || 5432,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          models: [User, Otp, Task, Session, SessionEvent, TrainSession, SessionConfiguration],
          autoLoadModels: true,
          synchronize: true,
          logging: (msg: string) => {
            const logger = new Logger();
            logger.setContext("Sequelize");
            logger.debug(msg);
          },
        }),
      ],
      providers: [TokensUtils],
    };
  }


  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtDecodeMiddleware, LoggerMiddleware).forRoutes("{*path}");
  }
}
