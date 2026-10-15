import { Module } from '@nestjs/common';
import { ILineupRepository } from './application/interfaces/repositories/lineup.repository.interface.js';
import { GetLineupUseCase } from './application/usecases/get-lineup/get-lineup.usecase.js';
import { UpdateLineupUseCase } from './application/usecases/update-lineup/update-lineup.usecase.js';
import { PrismaLineupRepository } from './infrastructure/repositories/prisma-lineup.repository.js';
import { LineupsController } from './presentation/controllers/lineups.controller.js';

@Module({
  controllers: [LineupsController],
  providers: [
    {
      provide: ILineupRepository,
      useClass: PrismaLineupRepository,
    },
    {
      provide: GetLineupUseCase,
      useFactory: (repo: ILineupRepository) => new GetLineupUseCase(repo),
      inject: [ILineupRepository],
    },
    {
      provide: UpdateLineupUseCase,
      useFactory: (repo: ILineupRepository) => new UpdateLineupUseCase(repo),
      inject: [ILineupRepository],
    },
  ],
  exports: [ILineupRepository, GetLineupUseCase, UpdateLineupUseCase],
})
export class LineupsModule {}
