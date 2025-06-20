import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from 'cookie-parser'
import { Logger } from "./modules/logger/logger.service";
import chalk from "chalk";

async function bootstrap () {
  const dynamicAppModule = await AppModule.forRootAsync();
  const app = await NestFactory.create(dynamicAppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api/v1/')
  app.enableCors()
  app.use(cookieParser())

  const logger = new Logger();
  logger.setContext('Bootstrap');
  app.useLogger(logger)

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(chalk.greenBright.bgGreen.bold(` Server started on port ${port} `));
}

bootstrap();
