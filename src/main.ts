import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from 'cookie-parser'
import { Logger } from "./modules/logger/logger.service";
import { LoggerMiddleware } from "./modules/logger/logger.middleware";


async function bootstrap () {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api/v1/')
  app.enableCors()
  app.use(cookieParser())

  const logger = new Logger();
  logger.setContext('Bootstrap');
  app.useLogger(logger)
  

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Listening on port ${port}`);
}

bootstrap().then(() => {});