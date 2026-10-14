import { Cents } from '../../../../domain/money.js';
import { PlayerEntity } from '../../../../players/domain/entities/player.entity.js';

/**
 * Estado lido com o jogador e o clube travados (`FOR UPDATE`), dentro da transação da compra.
 *
 * @export
 * @interface PurchaseState
 */
export interface PurchaseState {
  /** Jogador ativo; null se inexistente ou excluído (RN09) */
  player: PlayerEntity | null;
  /** Clube comprador; null se inexistente */
  club: { id: number; name: string; cash: Cents } | null;
  /** Jogadores no elenco do clube antes da compra (RN14) */
  squadSize: number;
  /** O clube já vendeu este jogador antes (RN12) */
  soldBefore: boolean;
}

/**
 * O que a compra grava: caixa, clube do jogador, contrato `ATIVO` e transação `COMPRA` (RN12).
 *
 * @export
 * @interface PurchaseRecord
 */
export interface PurchaseRecord {
  playerId: number;
  playerName: string;
  clubId: number;
  value: Cents;
  fee: Cents;
  newCash: Cents;
  loyaltyUntil: Date;
  now: Date;
}

/**
 * Estado lido com o jogador e o clube dele travados, dentro da transação da venda.
 *
 * @export
 * @interface SaleState
 */
export interface SaleState {
  /** Jogador ativo; null se inexistente ou excluído (RN09) */
  player: PlayerEntity | null;
  /** Clube atual do jogador; null se ele está livre */
  club: { id: number; name: string; cash: Cents } | null;
  /** Contrato `ATIVO` do jogador com o clube atual; null se ele está livre */
  contract: { id: number; purchaseValue: Cents; loyaltyUntil: Date } | null;
}

/**
 * O que a venda grava: caixa, jogador livre, contrato encerrado ou rescindido,
 * saída da escalação e transação `VENDA` (RN15, RN16 e RN19).
 *
 * @export
 * @interface SaleRecord
 */
export interface SaleRecord {
  playerId: number;
  playerName: string;
  clubId: number;
  contractId: number;
  contractStatus: 'RESCINDIDO' | 'ENCERRADO';
  purchaseValue: Cents;
  value: Cents;
  penalty: Cents;
  penaltyRate: number;
  remainingDays: number;
  profit: Cents;
  commission: Cents;
  credit: Cents;
  newCash: Cents;
  now: Date;
}

/**
 * Contrato do repositório de compra e venda.
 *
 * A regra fica no caso de uso; o repositório garante que leitura, decisão e gravação
 * aconteçam numa única transação, com as linhas travadas: compras simultâneas do mesmo
 * jogador ou do mesmo clube não leem um estado já ultrapassado.
 *
 * @export
 * @abstract
 * @class ITransferRepository
 */
export abstract class ITransferRepository {
  /**
   * Trava jogador e clube, lê o estado, pede a decisão e grava a compra, tudo ou nada.
   * Se `decide` lançar um erro, nada é gravado.
   *
   * @param {number} playerId - Jogador da URL.
   * @param {number} clubId - Clube comprador.
   * @param {(state: PurchaseState) => PurchaseRecord} decide - Regras da compra (RN12 a RN14).
   * @returns {Promise<{ record: PurchaseRecord; transactionId: number }>} O que foi gravado.
   */
  abstract purchase(
    playerId: number,
    clubId: number,
    decide: (state: PurchaseState) => PurchaseRecord,
  ): Promise<{ record: PurchaseRecord; transactionId: number }>;

  /**
   * Trava o jogador e o clube dele, lê o contrato ativo, pede a decisão e grava a venda,
   * tudo ou nada. Se `decide` lançar um erro, nada é gravado.
   *
   * @param {number} playerId - Jogador da URL.
   * @param {(state: SaleState) => SaleRecord} decide - Regras da venda (RN15 e RN16).
   * @returns {Promise<{ record: SaleRecord; transactionId: number }>} O que foi gravado.
   */
  abstract sale(
    playerId: number,
    decide: (state: SaleState) => SaleRecord,
  ): Promise<{ record: SaleRecord; transactionId: number }>;
}
