import { updateLineupSchema } from '../presentation/dtos/update-lineup.dto.js';

describe('updateLineupSchema', () => {
  const valid = { formation: '2-1-1', player_ids: [34, 31, 30, 33, 32] };

  it('deve aceitar a formação e os 5 ids, ignorando campos a mais', () => {
    expect(updateLineupSchema.parse({ ...valid, club_id: 9 })).toEqual(valid);
  });

  it.each([
    [{ player_ids: valid.player_ids }],
    [{ ...valid, formation: '4-0' }],
    [{ ...valid, formation: '2-1-1 ' }],
    [{ formation: '2-1-1' }],
    [{ ...valid, player_ids: '34,31,30,33,32' }],
    [{ ...valid, player_ids: [34, 31, 30, 33] }],
    [{ ...valid, player_ids: [34, 31, 30, 33, 32, 35] }],
    [{ ...valid, player_ids: [34, 34, 30, 33, 32] }],
    [{ ...valid, player_ids: [34, 31, 30, 33, 0] }],
    [{ ...valid, player_ids: [34, 31, 30, 33, 1.5] }],
    [{ ...valid, player_ids: [34, 31, 30, 33, '32'] }],
  ])('deve recusar %j', (body) => {
    expect(updateLineupSchema.safeParse(body).success).toBe(false);
  });
});
