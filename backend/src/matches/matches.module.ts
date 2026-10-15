import { Module } from '@nestjs/common';
import { IMatchRepository } from './application/interfaces/repositories/match.repository.interface.js';
import { FindMatchByIdUseCase } from './application/usecases/find-match-by-id/find-match-by-id.usecase.js';
import { FindMatchesUseCase } from './application/usecases/find-matches/find-matches.usecase.js';
import { GetStandingsUseCase } from './application/usecases/get-standings/get-standings.usecase.js';
import { PlayMatchUseCase } from './application/usecases/play-match/play-match.usecase.js';
import { PrismaMatchRepository } from './infrastructure/repositories/prisma-match.repository.js';
import { MatchesController } from './presentation/controllers/matches.controller.js';
import { StandingsController } from './presentation/controllers/standings.controller.js';

@Module({
  controllers: [MatchesController, StandingsController],
  providers: [
    {
      provide: IMatchRepository,
      useClass: PrismaMatchRepository,
    },
    {
      provide: PlayMatchUseCase,
      useFactory: (repo: IMatchRepository) => new PlayMatchUseCase(repo),
      inject: [IMatchRepository],
    },
    {
      provide: FindMatchesUseCase,
      useFactory: (repo: IMatchRepository) => new FindMatchesUseCase(repo),
      inject: [IMatchRepository],
    },
    {
      provide: FindMatchByIdUseCase,
      useFactory: (repo: IMatchRepository) => new FindMatchByIdUseCase(repo),
      inject: [IMatchRepository],
    },
    {
      provide: GetStandingsUseCase,
      useFactory: (repo: IMatchRepository) => new GetStandingsUseCase(repo),
      inject: [IMatchRepository],
    },
  ],
  exports: [
    IMatchRepository,
    PlayMatchUseCase,
    FindMatchesUseCase,
    FindMatchByIdUseCase,
    GetStandingsUseCase,
  ],
})
export class MatchesModule {}
