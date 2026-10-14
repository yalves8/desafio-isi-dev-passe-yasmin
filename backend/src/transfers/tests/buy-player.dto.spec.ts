import { buyPlayerSchema } from '../presentation/dtos/buy-player.dto.js';

describe('buyPlayerSchema', () => {
  const valid = { club_id: 1, loyalty_until: '2027-03-02T10:15-03:00' };

  it('deve aceitar o corpo da RN01 e devolver a data como instante', () => {
    const parsed = buyPlayerSchema.parse({ ...valid, cash: 999 });
    expect(parsed.club_id).toBe(1);
    expect(parsed.loyalty_until.toISOString()).toBe('2027-03-02T13:15:00.000Z');
    expect(parsed).not.toHaveProperty('cash');
  });

  it.each([
    [{ ...valid, club_id: 0 }],
    [{ ...valid, club_id: -1 }],
    [{ ...valid, club_id: 1.5 }],
    [{ ...valid, club_id: '1' }],
    [{ loyalty_until: valid.loyalty_until }],
    [{ ...valid, loyalty_until: null }],
    [{ ...valid, loyalty_until: '2027-03-02T10:15' }],
    [{ ...valid, loyalty_until: '2027-03-02T10:15:00-03:00' }],
    [{ ...valid, loyalty_until: '2027-02-30T10:15-03:00' }],
    [{ ...valid, loyalty_until: '2027-03-02T24:00-03:00' }],
  ])('deve recusar %j', (body) => {
    expect(buyPlayerSchema.safeParse(body).success).toBe(false);
  });
});
