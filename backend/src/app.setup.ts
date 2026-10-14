import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvService } from './common/config/env.service.js';
import { HttpErrorFilter } from './common/filters/http-error.filter.js';

/** Configuração global compartilhada entre main.ts e os testes e2e. */
export function applyGlobalConfig(app: INestApplication) {
  const env = app.get(EnvService);
  app.enableCors({ origin: env.get('CORS_ORIGIN').split(',') });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpErrorFilter());
}

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('Documentação da API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
}
