import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('v1', {
    exclude: [{ path: 'health', method: RequestMethod.ALL }],
  });

  const config = new DocumentBuilder()
    .setTitle('Documentation')
    .setDescription('API Endpoints with Swagger integration')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  /*
  repl(AppModule).then((replServer) => {
    replServer.setupHistory('.nestjs_repl_history', (err) => {
      if (err) {
        console.error(err);
      }
    });
  }); */

  await app.listen(3000);
}
bootstrap().then(() => {
  // console.log('Application is running on: http://localhost:3000'),
});
