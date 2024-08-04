import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

// somewhere in your initialization file
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 모든 경로가 /api로 시작하도록 설정
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  // swagger
  const config = new DocumentBuilder()
    .setTitle('Foot Prints Swagger')
    .setDescription('Foot Prints API description')
    .setVersion('1.0')
    .addTag('foot-prints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(7001);
}
bootstrap();
