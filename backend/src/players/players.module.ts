import { Module } from '@nestjs/common';
import { IPlayerRepository } from './application/interfaces/repositories/player.repository.interface.js';
import { CreatePlayerUseCase } from './application/usecases/create-player/create-player.usecase.js';
import { DeletePlayerUseCase } from './application/usecases/delete-player/delete-player.usecase.js';
import { FindPlayerByIdUseCase } from './application/usecases/find-player-by-id/find-player-by-id.usecase.js';
import { FindPlayersUseCase } from './application/usecases/find-players/find-players.usecase.js';
import { UpdatePlayerConditionUseCase } from './application/usecases/update-player-condition/update-player-condition.usecase.js';
import { UpdatePlayerUseCase } from './application/usecases/update-player/update-player.usecase.js';
import { PrismaPlayerRepository } from './infrastructure/repositories/prisma-player.repository.js';
import { PlayersController } from './presentation/controllers/players.controller.js';

@Module({
  controllers: [PlayersController],
  providers: [
    {
      provide: IPlayerRepository,
      useClass: PrismaPlayerRepository,
    },
    {
      provide: CreatePlayerUseCase,
      useFactory: (repo: IPlayerRepository) => new CreatePlayerUseCase(repo),
      inject: [IPlayerRepository],
    },
    {
      provide: FindPlayerByIdUseCase,
      useFactory: (repo: IPlayerRepository) => new FindPlayerByIdUseCase(repo),
      inject: [IPlayerRepository],
    },
    {
      provide: FindPlayersUseCase,
      useFactory: (repo: IPlayerRepository) => new FindPlayersUseCase(repo),
      inject: [IPlayerRepository],
    },
    {
      provide: UpdatePlayerUseCase,
      useFactory: (repo: IPlayerRepository) => new UpdatePlayerUseCase(repo),
      inject: [IPlayerRepository],
    },
    {
      provide: UpdatePlayerConditionUseCase,
      useFactory: (repo: IPlayerRepository) =>
        new UpdatePlayerConditionUseCase(repo),
      inject: [IPlayerRepository],
    },
    {
      provide: DeletePlayerUseCase,
      useFactory: (repo: IPlayerRepository) => new DeletePlayerUseCase(repo),
      inject: [IPlayerRepository],
    },
  ],
  exports: [
    IPlayerRepository,
    CreatePlayerUseCase,
    FindPlayerByIdUseCase,
    FindPlayersUseCase,
    UpdatePlayerUseCase,
    UpdatePlayerConditionUseCase,
    DeletePlayerUseCase,
  ],
})
export class PlayersModule {}
