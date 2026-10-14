import { Module } from '@nestjs/common';
import { ITransferRepository } from './application/interfaces/repositories/transfer.repository.interface.js';
import { BuyPlayerUseCase } from './application/usecases/buy-player/buy-player.usecase.js';
import { SellPlayerUseCase } from './application/usecases/sell-player/sell-player.usecase.js';
import { PrismaTransferRepository } from './infrastructure/repositories/prisma-transfer.repository.js';
import { TransfersController } from './presentation/controllers/transfers.controller.js';

@Module({
  controllers: [TransfersController],
  providers: [
    {
      provide: ITransferRepository,
      useClass: PrismaTransferRepository,
    },
    {
      provide: BuyPlayerUseCase,
      useFactory: (repo: ITransferRepository) => new BuyPlayerUseCase(repo),
      inject: [ITransferRepository],
    },
    {
      provide: SellPlayerUseCase,
      useFactory: (repo: ITransferRepository) => new SellPlayerUseCase(repo),
      inject: [ITransferRepository],
    },
  ],
  exports: [ITransferRepository, BuyPlayerUseCase, SellPlayerUseCase],
})
export class TransfersModule {}
