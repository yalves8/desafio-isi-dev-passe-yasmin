import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvService } from './common/config/env.service.js';
import { HttpErrorFilter } from './common/filters/http-error.filter.js';

/** Configuração global compartilhada entre main.ts e os testes e2e. */
export function applyGlobalConfig(app: INestApplication) {
  const env = app.get(EnvService);

  // Prefixo global obrigatório /api/v1 (exclui /health para checagens diretas)
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });

  // CORS habilitado estritamente para a origem configurada do frontend (sem '*')
  app.enableCors({ origin: env.get('CORS_ORIGIN').split(',') });

  // Filtro padronizado de erros { message: string }
  app.useGlobalFilters(new HttpErrorFilter());
}

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Liga Fictícia API')
    .setDescription('Documentação dos endpoints do desafio SENAI/PE')
    .setVersion('1.0')
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
}
