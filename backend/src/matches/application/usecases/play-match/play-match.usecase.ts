import {
  ConflictError,
  NotFoundError,
} from '../../../../common/errors/domain.errors.js';
import { PlayMatchInput } from './play-match.input.js';
import { playMatch, Starter } from '../../../../domain/match-engine.js';
import {
  isLineupComplete,
  LINEUP_SIZE,
} from '../../../../lineups/domain/formation.js';
import { compareSquadOrder } from '../../../../players/domain/squad-order.js';
import {
  DuelPlayerRecord,
  IMatchRepository,
  MatchRecord,
  MatchTeamState,
  PlayMatchState,
} from '../../interfaces/repositories/match.repository.interface.js';
import { toMatchOutput } from '../../presenters/match.presenter.js';
import { MatchOutput } from '../find-match-by-id/match.output.js';

/** Titulares na ordem do elenco: o goleiro e os jogadores de linha do 1º ao 4º (RN20, passo 2) */
function startersOf(team: MatchTeamState): Starter[] {
  return [...team.starters].sort(compareSquadOrder).map((p) => ({
    id: p.id,
    name: p.getName(),
    position: p.getPosition(),
    condition: p.getCondition(),
    attributes: { ...p.attributes },
  }));
}

function duelPlayer(side: {
  player: Starter;
  attribute: DuelPlayerRecord['attribute'];
  value: number;
}): DuelPlayerRecord {
  return {
    playerId: side.player.id,
    playerName: side.player.name,
    position: side.player.position,
    condition: side.player.condition,
    attribute: side.attribute,
    value: side.value,
  };
}

/**
 * Caso de uso que joga uma partida na hora e a grava (POST /matches, RN20).
 *
 * Regras aplicadas:
 * 1. Mandante e visitante precisam existir (404).
 * 2. Os dois precisam da escalação completa, com a formação e os 5 titulares (409).
 * 3. Titulares na ordem do elenco; 6 duelos sem sorteio, com o efeito da condição (motor da RN20).
 * 4. Grava data e hora, placar, formações e os 6 duelos com os valores usados; não muda caixa,
 *    escalação nem jogadores.
 *
 * @export
 * @class PlayMatchUseCase
 */
export class PlayMatchUseCase {
  /**
   * Construtor do `PlayMatchUseCase`.
   *
   * @param {IMatchRepository} matchRepository - Repositório de partidas.
   */
  constructor(private readonly matchRepository: IMatchRepository) {}

  /**
   * Joga e grava a partida.
   *
   * @param {{ homeClubId: number; awayClubId: number }} input - Mandante e visitante, já diferentes.
   * @param {Date} [now=new Date()] - Momento da partida (`played_at`).
   * @returns {Promise<MatchOutput>} Partida com os 6 duelos.
   * @throws {NotFoundError} Clube inexistente.
   * @throws {ConflictError} Escalação incompleta no mandante ou no visitante.
   */
  async execute(
    input: PlayMatchInput,
    now: Date = new Date(),
  ): Promise<MatchOutput> {
    const match = await this.matchRepository.play(
      input.homeClubId,
      input.awayClubId,
      (state) => this.play(state, now),
    );
    return toMatchOutput(match, true);
  }

  /** Conferências e motor da partida sobre o estado lido; lançar aqui não grava nada */
  private play({ home, away }: PlayMatchState, now: Date): MatchRecord {
    if (!home) throw new NotFoundError('Clube mandante não encontrado');
    if (!away) throw new NotFoundError('Clube visitante não encontrado');
    for (const team of [home, away]) {
      if (!isLineupComplete(team.formation, team.starters.length)) {
        throw new ConflictError(
          `Escalação incompleta: o ${team.name} não tem os ${LINEUP_SIZE} titulares.`,
        );
      }
    }

    const outcome = playMatch(startersOf(home), startersOf(away));
    return {
      playedAt: now,
      home: {
        clubId: home.id,
        clubName: home.name,
        formation: home.formation!,
        goals: outcome.homeGoals,
      },
      away: {
        clubId: away.id,
        clubName: away.name,
        formation: away.formation!,
        goals: outcome.awayGoals,
      },
      result: outcome.result,
      duels: outcome.duels.map((d) => ({
        order: d.order,
        attackingClubId: d.attackingSide === 'home' ? home.id : away.id,
        attacker: duelPlayer(d.attacker),
        defender: duelPlayer(d.defender),
        goal: d.goal,
      })),
    };
  }
}
