import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { AppExpressAdapter } from './common/adapters/app-express.adapter.js';
import { applyGlobalConfig, setupSwagger } from './app.setup.js';
import { EnvService } from './common/config/env.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new AppExpressAdapter(), {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
  applyGlobalConfig(app);
  setupSwagger(app);
  await app.listen(app.get(EnvService).get('PORT'));
}
await bootstrap();
