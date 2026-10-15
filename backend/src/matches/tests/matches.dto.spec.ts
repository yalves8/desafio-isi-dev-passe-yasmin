import { BadRequestException } from '@nestjs/common';
import { parseMatchesQuery } from '../presentation/dtos/matches-query.dto.js';
import { playMatchSchema } from '../presentation/dtos/play-match.dto.js';

describe('playMatchSchema', () => {
  it('deve aceitar mandante e visitante diferentes', () => {
    expect(
      playMatchSchema.parse({ home_club_id: 1, away_club_id: 2, x: 1 }),
    ).toEqual({
      home_club_id: 1,
      away_club_id: 2,
    });
  });

  it.each([
    [{ away_club_id: 2 }],
    [{ home_club_id: 1, away_club_id: 1 }],
    [{ home_club_id: 0, away_club_id: 2 }],
    [{ home_club_id: -1, away_club_id: 2 }],
    [{ home_club_id: 1.5, away_club_id: 2 }],
    [{ home_club_id: '1', away_club_id: 2 }],
    [{ home_club_id: 1, away_club_id: null }],
  ])('deve recusar %j', (body) => {
    expect(playMatchSchema.safeParse(body).success).toBe(false);
  });
});

describe('parseMatchesQuery', () => {
  it('deve aceitar a ausência do filtro e o club_id válido', () => {
    expect(parseMatchesQuery({})).toEqual({});
    expect(parseMatchesQuery({ club_id: '3', page: '2' })).toEqual({
      clubId: 3,
    });
  });

  it.each(['', '0', '-1', '01', '1.0', 'abc', '2147483648'])(
    'deve recusar club_id=%s com 400',
    (value) => {
      expect(() => parseMatchesQuery({ club_id: value })).toThrow(
        BadRequestException,
      );
    },
  );
});
