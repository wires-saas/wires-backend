import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  // TODO if localhost/dev
  app.enableCors({ origin: '*' });

  const config = new DocumentBuilder()
    .setTitle('Documentation')
    .setDescription('API Endpoints with Swagger integration')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(3000);
}
bootstrap().then(() => {
  // console.log('Application is running on: http://localhost:3000'),
});
