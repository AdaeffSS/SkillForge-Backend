import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from 'cookie-parser'


async function bootstrap () {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/api/v1/')
  app.enableCors()
  app.use(cookieParser())

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Listening on port ${port}`);
}

bootstrap().then(() => {});