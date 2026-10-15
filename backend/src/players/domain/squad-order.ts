import { compareNames } from '../../common/utils/text.js';
import { comparePositions } from '../../domain/enums/position.enum.js';
import { PlayerEntity } from './entities/player.entity.js';

/**
 * Ordem do elenco (RN11): posição (GOL, ZAG, LAT, MEI, ATA), depois nome (sem acentos e
 * sem diferenciar maiúsculas) e, no empate, id crescente. Usada no detalhe do clube,
 * na escalação (RN19) e na numeração dos titulares da partida (RN20).
 *
 * @param {PlayerEntity} a - Primeiro jogador.
 * @param {PlayerEntity} b - Segundo jogador.
 * @returns {number} Negativo se `a` vem antes, positivo se vem depois.
 */
export function compareSquadOrder(a: PlayerEntity, b: PlayerEntity): number {
  const position = comparePositions(a.getPosition(), b.getPosition());
  if (position !== 0) return position;
  const name = compareNames(a.getName(), b.getName());
  if (name !== 0) return name;
  return a.id - b.id;
}
