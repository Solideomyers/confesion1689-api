import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { envs } from 'src/config/envs';

async function bootstrap() {
  const logger = new Logger('ConfessionApp');

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Confession App API')
    .setDescription('The Confession App API description')
    .setVersion('1.0')
    // .addBearerAuth(
    //   {
    //     type: 'http',
    //     scheme: 'bearer',
    //     bearerFormat: 'JWT',
    //     name: 'JWT',
    //     description: 'Enter JWT token',
    //     in: 'header',
    //   },
    //   'access-token',
    // )
    .addTag('confession')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      // persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? envs.port);

  logger.log(`Application is running on: ${envs.port}`);
  logger.log(`Swagger is running on: ${envs.port}/api/v1/docs`);
}
bootstrap();
