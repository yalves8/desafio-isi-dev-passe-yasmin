/** Faixas que mudam o desconto da condição (RN03): ≥ 80 em verde, ≤ 30 em vermelho */
export function getAgilityTone(value: number) {
  if (value >= 80) return 'bg-green-700'
  if (value <= 30) return 'bg-red-600'
  return 'bg-zinc-500'
}
