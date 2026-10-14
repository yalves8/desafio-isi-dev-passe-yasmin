import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { applyGlobalConfig, setupSwagger } from './app.setup.js';
import { EnvService } from './common/config/env.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
  applyGlobalConfig(app);
  setupSwagger(app);
  await app.listen(app.get(EnvService).get('PORT'));
}
await bootstrap();
