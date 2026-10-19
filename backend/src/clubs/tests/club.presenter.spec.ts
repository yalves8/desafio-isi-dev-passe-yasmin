import { DUEL_ROLES } from '../../domain/match-engine.js';
import { Money } from '../../domain/money.js';
import { aPlayer } from '../../players/tests/player.builder.js';
import { FindClubByIdOutput } from '../application/usecases/find-club-by-id/find-club-by-id.output.js';
import {
  toClubDetailsResponse,
  toClubDuelAttributesResponse,
} from '../presentation/presenters/club.presenter.js';

const club: FindClubByIdOutput = {
  id: 1,
  name: 'Águias FC',
  acronym: 'AGU',
  cash: Money.fromDecimal(300),
  squadValue: Money.ZERO,
  netWorth: Money.fromDecimal(300),
  squad: [
    {
      player: aPlayer().withId(31).withPosition('LAT').withClub(1).build(),
      contract: null,
      duel: {
        attack: { attribute: 'dribbling', value: 74, matchValue: 63 },
        defense: { attribute: 'defending', value: 66, matchValue: 56 },
      },
    },
  ],
};

describe('club.presenter', () => {
  it('deve manter GET /clubs/{id} no formato do enunciado, sem dados de duelo', () => {
    expect(toClubDetailsResponse(club).players[0]).not.toHaveProperty('duel');
  });

  it('deve devolver o papel de cada vaga e os atributos de duelo de cada jogador do elenco', () => {
    expect(toClubDuelAttributesResponse(club)).toEqual({
      club_id: 1,
      roles: DUEL_ROLES,
      players: [
        {
          id: 31,
          attack: { attribute: 'dribbling', value: 74, match_value: 63 },
          defense: { attribute: 'defending', value: 66, match_value: 56 },
        },
      ],
    });
  });
});
