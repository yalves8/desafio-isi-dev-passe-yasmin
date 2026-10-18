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

/**
 * Value Object de dinheiro: centavos inteiros e imutáveis.
 *
 * As entidades guardam e calculam em `Money`; a conversão para número em moedas (API) ou para o
 * decimal das colunas (Prisma) fica nas bordas: mappers, repositórios e presenters.
 *
 * @export
 * @class Money
 */
export class Money {
  /** Zero moedas: elemento neutro da soma */
  static readonly ZERO = new Money(0);

  private constructor(public readonly cents: Cents) {}

  /**
   * Dinheiro a partir de centavos inteiros.
   *
   * @param {Cents} cents - Centavos.
   * @returns {Money} O valor.
   * @throws {RangeError} Se os centavos não forem inteiros.
   */
  static ofCents(cents: Cents): Money {
    if (!Number.isInteger(cents)) {
      throw new RangeError(`Centavos precisam ser inteiros: ${cents}`);
    }
    return new Money(cents);
  }

  /**
   * Dinheiro a partir do decimal em moedas (coluna Decimal, texto ou número), sem ponto flutuante.
   *
   * @param {{ toString(): string } | string | number} decimal - Valor em moedas, até 2 casas.
   * @returns {Money} O valor.
   */
  static fromDecimal(decimal: { toString(): string } | string | number): Money {
    return new Money(toCents(decimal));
  }

  /** Soma de vários valores; lista vazia dá zero */
  static sum(values: readonly Money[]): Money {
    return values.reduce((total, value) => total.plus(value), Money.ZERO);
  }

  plus(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  minus(other: Money): Money {
    return new Money(this.cents - other.cents);
  }

  /** Negativo se este valor é menor, zero se igual, positivo se maior (serve ao `sort`) */
  compareTo(other: Money): number {
    return this.cents - other.cents;
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  /** Número em moedas, para a resposta da API */
  toNumber(): number {
    return fromCents(this.cents);
  }

  /** Texto decimal com ponto e 2 casas, para as colunas Decimal (ex.: -3885 → "-38.85") */
  toDecimalString(): string {
    const sign = this.cents < 0 ? '-' : '';
    const abs = Math.abs(this.cents);
    return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
  }
}

/** Texto com 2 casas e vírgula decimal, como na exportação CSV (RN18). */
export function formatCents(cents: Cents): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)},${String(abs % 100).padStart(2, '0')}`;
}

/** Metade exata de um valor, sem arredondar (limite de 50% do caixa, RN13): 261,15 → "130,575" */
export function formatHalfCents(cents: Cents): string {
  return cents % 2 === 0
    ? formatCents(cents / 2)
    : `${formatCents((cents - 1) / 2)}5`;
}
