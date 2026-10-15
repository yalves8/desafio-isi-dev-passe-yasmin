import { Module } from '@nestjs/common';
import { ITransferRepository } from './application/interfaces/repositories/transfer.repository.interface.js';
import { BuyPlayerUseCase } from './application/usecases/buy-player/buy-player.usecase.js';
import { ExportClubTransactionsUseCase } from './application/usecases/export-club-transactions/export-club-transactions.usecase.js';
import { FindClubTransactionsUseCase } from './application/usecases/find-club-transactions/find-club-transactions.usecase.js';
import { SellPlayerUseCase } from './application/usecases/sell-player/sell-player.usecase.js';
import { PrismaTransferRepository } from './infrastructure/repositories/prisma-transfer.repository.js';
import { ClubTransactionsController } from './presentation/controllers/club-transactions.controller.js';
import { TransfersController } from './presentation/controllers/transfers.controller.js';

@Module({
  controllers: [TransfersController, ClubTransactionsController],
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
    {
      provide: FindClubTransactionsUseCase,
      useFactory: (repo: ITransferRepository) =>
        new FindClubTransactionsUseCase(repo),
      inject: [ITransferRepository],
    },
    {
      provide: ExportClubTransactionsUseCase,
      useFactory: (repo: ITransferRepository) =>
        new ExportClubTransactionsUseCase(repo),
      inject: [ITransferRepository],
    },
  ],
  exports: [
    ITransferRepository,
    BuyPlayerUseCase,
    SellPlayerUseCase,
    FindClubTransactionsUseCase,
    ExportClubTransactionsUseCase,
  ],
})
export class TransfersModule {}
