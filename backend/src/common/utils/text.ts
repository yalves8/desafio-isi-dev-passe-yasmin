/**
 * Utilitários de texto conforme a regra V4 e convenções do enunciado:
 * - V4: trim, espaços múltiplos viram um só, caracteres de controle recusados.
 * - Ignorar acentos: decomposição NFD e remoção de marcas diacríticas (Mn).
 */

export function containsControlChars(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if ((code >= 0 && code <= 31) || (code >= 127 && code <= 159)) {
      return true;
    }
  }
  return false;
}

export function normalizeSpaces(text: string): string {
  return text.replace(/^ +| +$/g, '').replace(/ {2,}/g, ' ');
}

/** Tamanho em caracteres (pontos de código Unicode), como o enunciado define */
export function charCount(text: string): number {
  return Array.from(text).length;
}

export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Compara dois textos para ordenação alfabética (Premissas): minúsculas, sem acento, caractere por caractere */
export function compareNames(a: string, b: string): number {
  const normA = removeAccents(a).toLowerCase();
  const normB = removeAccents(b).toLowerCase();
  if (normA < normB) return -1;
  if (normA > normB) return 1;
  return 0;
}

/** Verifica se 'sub' é uma subsequência de 'full' (para a sigla do clube) */
export function isSubsequence(sub: string, full: string): boolean {
  let subIndex = 0;
  for (let i = 0; i < full.length && subIndex < sub.length; i++) {
    if (full[i] === sub[subIndex]) {
      subIndex++;
    }
  }
  return subIndex === sub.length;
}
