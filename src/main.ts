import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import helmet from 'helmet';
import { HttpStatus, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  config()
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    errorHttpStatusCode: HttpStatus.BAD_REQUEST}));
  await app.listen(process.env.MAIN_PORT || 80);
}
bootstrap();
