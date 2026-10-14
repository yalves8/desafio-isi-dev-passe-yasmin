import { Module } from '@nestjs/common';
import { IClubRepository } from './application/interfaces/repositories/club.repository.interface.js';
import { CreateClubUseCase } from './application/usecases/create-club/create-club.usecase.js';
import { FindClubByIdUseCase } from './application/usecases/find-club-by-id/find-club-by-id.usecase.js';
import { FindClubsUseCase } from './application/usecases/find-clubs/find-clubs.usecase.js';
import { PrismaClubRepository } from './infrastructure/repositories/prisma-club.repository.js';
import { ClubsController } from './presentation/controllers/clubs.controller.js';

@Module({
  controllers: [ClubsController],
  providers: [
    {
      provide: IClubRepository,
      useClass: PrismaClubRepository,
    },
    {
      provide: CreateClubUseCase,
      useFactory: (repo: IClubRepository) => new CreateClubUseCase(repo),
      inject: [IClubRepository],
    },
    {
      provide: FindClubsUseCase,
      useFactory: (repo: IClubRepository) => new FindClubsUseCase(repo),
      inject: [IClubRepository],
    },
    {
      provide: FindClubByIdUseCase,
      useFactory: (repo: IClubRepository) => new FindClubByIdUseCase(repo),
      inject: [IClubRepository],
    },
  ],
  exports: [
    IClubRepository,
    CreateClubUseCase,
    FindClubsUseCase,
    FindClubByIdUseCase,
  ],
})
export class ClubsModule {}
