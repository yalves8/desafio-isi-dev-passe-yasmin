import { charCount, normalizeSpaces } from './text.js';

describe('normalizeSpaces (V4)', () => {
  it('remove os espaços das pontas e junta os repetidos', () => {
    expect(normalizeSpaces('  Meia   Zeta ')).toBe('Meia Zeta');
  });

  it('trata como espaço só o U+0020', () => {
    expect(normalizeSpaces('Meia Lua')).toBe('Meia Lua');
  });
});

describe('charCount', () => {
  it('conta pontos de código Unicode', () => {
    expect(charCount('𝒜b')).toBe(2);
  });
});
