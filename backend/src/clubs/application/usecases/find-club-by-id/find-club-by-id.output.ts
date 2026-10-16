import { PlayerEntity } from '../../../../players/domain/entities/player.entity.js';
import { ClubSummary } from '../find-clubs/find-clubs.output.js';

/** Contrato ativo de um jogador do elenco, com a multa se fosse vendido agora (RN15) */
export interface ActiveContract {
  purchaseValue: number;
  loyaltyUntil: Date;
  remainingDays: number;
  penaltyRate: number;
}

/** Jogador do elenco com o contrato */
export interface SquadMember {
  player: PlayerEntity;
  contract: ActiveContract | null;
}

/**
 * Clube com o elenco na ordem da RN11 e o contrato de cada jogador.
 *
 * @export
 * @interface FindClubByIdOutput
 */
export interface FindClubByIdOutput extends ClubSummary {
  squad: SquadMember[];
}
