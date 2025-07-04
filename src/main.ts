import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from 'cookie-parser'
import { Logger } from "./modules/logger/logger.service";
import chalk from "chalk";
import { TaskLoaderService } from "@tasks/tasks.loader";

async function bootstrap () {
  const logger = new Logger();
  logger.setContext('Bootstrap');

  const taskLoader = new TaskLoaderService(logger);
  const tasksClasses = await taskLoader.importAllTasks();

  const app = await NestFactory.create(await AppModule.forRootAsync(tasksClasses, taskLoader), {
    logger: logger,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api/v1/')
  app.enableCors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
  app.use(cookieParser())

  app.useLogger(logger)

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(chalk.greenBright.bgGreen.bold(` Server started on port ${port} `));
}

bootstrap().then(() => {});
