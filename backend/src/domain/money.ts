/** Dinheiro em centavos inteiros: evita erro de ponto flutuante e dá o arredondamento exato da regra geral. */
export type Cents = number;

/** Divide e arredonda para o inteiro mais próximo, com o meio indo para longe do zero. */
export function roundDiv(numerator: number, denominator: number): number {
  const quotient =
    Math.abs(numerator * 2 + denominator * Math.sign(numerator)) /
    (denominator * 2);
  return Math.sign(numerator) * Math.floor(quotient);
}

export function toCents(
  decimal: { toString(): string } | string | number,
): Cents {
  const [integer, fraction = ''] = decimal.toString().split('.');
  const sign = integer.startsWith('-') ? -1 : 1;
  const cents =
    Math.abs(Number(integer)) * 100 +
    Number(fraction.padEnd(2, '0').slice(0, 2));
  return sign * cents;
}

export function fromCents(cents: Cents): number {
  return cents / 100;
}

/** Texto com 2 casas e vírgula decimal, como na exportação CSV (RN18). */
export function formatCents(cents: Cents): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)},${String(abs % 100).padStart(2, '0')}`;
}
