import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ClubsModule } from './clubs/clubs.module.js';
import { EnvModule } from './common/config/env.module.js';
import { EnvService } from './common/config/env.service.js';
import { PrismaModule } from './common/prisma/prisma.module.js';
import { formatBrasiliaDateTime } from './common/utils/date.js';
import { HealthModule } from './health/health.module.js';
import { LineupsModule } from './lineups/lineups.module.js';
import { MatchesModule } from './matches/matches.module.js';
import { PlayersModule } from './players/players.module.js';
import { TransfersModule } from './transfers/transfers.module.js';

/** Uma linha por requisição: método, caminho e status */
function requestLogMessage(
  req: { method?: string; url?: string },
  res: { statusCode: number },
): string {
  return `${req.method} ${req.url} ${res.statusCode}`;
}

@Module({
  imports: [
    EnvModule,
    LoggerModule.forRootAsync({
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        pinoHttp: {
          level: env.get('NODE_ENV') === 'test' ? 'silent' : 'info',
          base: undefined,
          timestamp: () => `,"time":"${formatBrasiliaDateTime(new Date())}"`,
          serializers: {
            req: (req: { method: string; url: string }) => ({
              method: req.method,
              url: req.url,
            }),
            res: (res: { statusCode: number }) => ({
              statusCode: res.statusCode,
            }),
          },
          customSuccessMessage: requestLogMessage,
          customErrorMessage: requestLogMessage,
          transport:
            env.get('NODE_ENV') === 'development'
              ? {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    translateTime: false,
                    ignore: 'req,res,responseTime',
                  },
                }
              : undefined,
        },
      }),
    }),
    PrismaModule,
    HealthModule,
    PlayersModule,
    ClubsModule,
    TransfersModule,
    LineupsModule,
    MatchesModule,
  ],
})
export class AppModule {}
