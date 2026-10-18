import { BadRequestException } from '@nestjs/common';
import { MAX_ID, POSITIVE_INT_REGEX } from './id.js';

/**
 * Recusa com 400 o primeiro parâmetro presente com valor vazio (`?x=`), na ordem recebida.
 *
 * @param {Record<string, unknown>} query - Query params recebidos.
 * @throws {BadRequestException} Parâmetro vazio.
 */
export function rejectEmptyParams(query: Record<string, unknown>): void {
  for (const [key, val] of Object.entries(query)) {
    if (val === '') {
      throw new BadRequestException(`Parâmetro ${key} não pode ser vazio`);
    }
  }
}

/**
 * Converte um inteiro positivo escrito só com dígitos, sem sinal e sem zeros à esquerda.
 *
 * @param {string} name - Nome do parâmetro, usado na mensagem.
 * @param {string} value - Valor recebido.
 * @returns {number} O inteiro.
 * @throws {BadRequestException} `<name> deve ser um inteiro positivo`.
 */
export function parsePositiveInt(name: string, value: string): number {
  if (!POSITIVE_INT_REGEX.test(value)) {
    throw new BadRequestException(`${name} deve ser um inteiro positivo`);
  }
  return Number(value);
}

/**
 * Converte um id de query param: inteiro positivo até 2.147.483.647 (MAX_ID).
 *
 * @param {string} name - Nome do parâmetro, usado na mensagem.
 * @param {string} value - Valor recebido.
 * @param {string} [tooLargeMessage] - Mensagem para o id acima do limite; por padrão, a mesma do formato inválido.
 * @returns {number} O id.
 * @throws {BadRequestException} Formato inválido ou id acima do limite.
 */
export function parseQueryId(
  name: string,
  value: string,
  tooLargeMessage = `${name} deve ser um inteiro positivo`,
): number {
  const id = parsePositiveInt(name, value);
  if (id > MAX_ID) {
    throw new BadRequestException(tooLargeMessage);
  }
  return id;
}
