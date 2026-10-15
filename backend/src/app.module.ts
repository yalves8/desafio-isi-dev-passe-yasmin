import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ClubsModule } from './clubs/clubs.module.js';
import { EnvModule } from './common/config/env.module.js';
import { EnvService } from './common/config/env.service.js';
import { PrismaModule } from './common/prisma/prisma.module.js';
import { HealthModule } from './health/health.module.js';
import { LineupsModule } from './lineups/lineups.module.js';
import { PlayersModule } from './players/players.module.js';
import { TransfersModule } from './transfers/transfers.module.js';

@Module({
  imports: [
    EnvModule,
    LoggerModule.forRootAsync({
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        pinoHttp: {
          level: env.get('NODE_ENV') === 'test' ? 'silent' : 'info',
          transport:
            env.get('NODE_ENV') === 'development'
              ? { target: 'pino-pretty', options: { singleLine: true } }
              : undefined,
          redact: ['req.headers.authorization'],
        },
      }),
    }),
    PrismaModule,
    HealthModule,
    PlayersModule,
    ClubsModule,
    TransfersModule,
    LineupsModule,
  ],
})
export class AppModule {}
