import cookieParser from 'cookie-parser'
import chalk from "chalk";
import { NestFactory } from "@nestjs/core";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import "reflect-metadata";

import { AppModule } from "./modules/app/app.module";
import { Logger } from "./modules/logger/logger.service";
import { TaskLoaderService } from "@tasks/tasks.loader";
import { ClassConstructor } from "class-transformer";
import { LoggerModule } from "./modules/logger/logger.module";

interface DynamicTaskConfig {
  taskLoader: TaskLoaderService;
  tasksClasses: ClassConstructor<any>[];
}

async function bootstrap () {

  const loggerAppContext = await NestFactory.createApplicationContext(LoggerModule);
  const logger = loggerAppContext.get(Logger);

  const { taskLoader, tasksClasses } = await loadDynamicTaskConfig(logger);

  const app = await NestFactory.create(await AppModule.forRootAsync(tasksClasses, taskLoader, logger), {
    logger: logger,
  });
  configureApp(app)

  const port: number = Number(process.env.PORT) || 4000;
  await app.listen(port);

  logger.setContext('Bootstrap');
  logger.log(chalk.greenBright.bgGreen.bold(` Server started on port ${port} `));
}

async function loadDynamicTaskConfig(logger: Logger): Promise<DynamicTaskConfig> {
  const taskLoader = new TaskLoaderService(logger);
  const tasksClasses = await taskLoader.importAllTasks();
  return { taskLoader, tasksClasses };
}

function configureApp(app: INestApplication): void {
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api/v1/');
  app.enableCors({
    credentials: true,
    origin: 'http://localhost:3000',
  });
  app.use(cookieParser());
}

bootstrap().then(() => {});
