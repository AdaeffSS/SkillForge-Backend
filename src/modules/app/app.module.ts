import { MiddlewareConsumer, Module, NestModule, DynamicModule } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule } from "@nestjs/config";
import { User } from "../users/entities/user.entity";
import { Otp } from "../auth/entites/otp.entity";
import { AuthModule } from "../auth/auth.module";
import { Logger } from "../logger/logger.service";
import * as process from "node:process";
import { LoggerMiddleware } from "../logger/logger.middleware";
import { LoggerModule } from "../logger/logger.module";
import { FileLoaderService } from "../file-loader/file-loader.service";
import { JwtDecodeMiddleware } from "../auth/middlewares/jwt.middleware";
import { JwtModule } from "@nestjs/jwt";
import { TokensUtils } from "../../utils/tokens.util";
import { TasksModule } from "../tasks/tasks.module";
import { importAllTasks } from "../../import";

@Module({})
export class AppModule implements NestModule {
  static async forRootAsync(): Promise<DynamicModule> {
    const tasksClasses = await importAllTasks();

    return {
      module: AppModule,
      imports: [
        TasksModule.forRoot(tasksClasses),
        LoggerModule,
        JwtModule,
        AuthModule,
        ConfigModule.forRoot({
          envFilePath: ".env",
        }),
        SequelizeModule.forRoot({
          dialect: "postgres",
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT) || 5432,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          models: [User, Otp],
          autoLoadModels: true,
          synchronize: true,
          logging: (msg: string) => {
            const logger = new Logger();
            logger.setContext("Sequelize");
            logger.log(msg);
          },
        }),
      ],
      providers: [FileLoaderService, TokensUtils],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtDecodeMiddleware, LoggerMiddleware).forRoutes("{*path}");
  }
}
