/** Maior id aceito (inteiro de 32 bits com sinal), como o enunciado limita ids e query params */
export const MAX_ID = 2_147_483_647;

/** Inteiro positivo escrito só com dígitos, sem sinal e sem zeros à esquerda (V8 e query params) */
export const POSITIVE_INT_REGEX = /^[1-9]\d*$/;
