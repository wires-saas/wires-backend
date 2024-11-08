import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { config as readEnvFile } from 'dotenv';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(compression({ threshold: '1KB' }));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('v1', {
    exclude: [{ path: 'health', method: RequestMethod.ALL }],
  });

  // Protecting the documentation with basic auth
  if (process.env.API_DOCS_PASSWORD) {
    app.use(
      '/docs*',
      basicAuth({
        challenge: true,
        users: {
          documentation: process.env.API_DOCS_PASSWORD,
        },
        realm: process.env.APP_NAME,
      }),
    );
  }

  const config = new DocumentBuilder()
    .setTitle('Documentation')
    .setDescription('API Endpoints with Swagger integration')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      persistAuthorization: true,
    },
  });

  // EJS view engine for debugging mail
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  readEnvFile();
  const appUrl = process.env.APP_URL;

  app.enableCors({
    origin: [appUrl],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3000);
}
bootstrap().then(() => {
  // ...
});
