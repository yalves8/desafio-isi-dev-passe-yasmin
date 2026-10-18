export const CONDITIONS = ['APTO', 'MAL_CONDICIONADO', 'DOENTE'] as const;

export type Condition = (typeof CONDITIONS)[number];

interface ConditionRule {
  /** RN03: desconto no valor de mercado, em décimos de ponto percentual (15% = 150) */
  marketDiscount: number;
  /** RN20 passo 3: percentual do atributo usado no duelo */
  duelFactorPercent: number;
  /** RN19: pode ser titular */
  canStart: boolean;
  /** RN19: ao entrar nesta condição, o jogador sai da escalação */
  leavesLineup: boolean;
  /** RN19: condições para as quais pode passar */
  canBecome: readonly Condition[];
}

/** O que cada condição física muda no jogo, numa tabela só. */
export const CONDITION_RULES: Record<Condition, ConditionRule> = {
  APTO: {
    marketDiscount: 0,
    duelFactorPercent: 100,
    canStart: true,
    leavesLineup: false,
    canBecome: CONDITIONS,
  },
  MAL_CONDICIONADO: {
    marketDiscount: 150,
    duelFactorPercent: 85,
    canStart: true,
    leavesLineup: false,
    canBecome: CONDITIONS,
  },
  DOENTE: {
    marketDiscount: 300,
    duelFactorPercent: 100,
    canStart: false,
    leavesLineup: true,
    canBecome: ['MAL_CONDICIONADO', 'DOENTE'],
  },
};

export function canChangeCondition(from: Condition, to: Condition): boolean {
  return CONDITION_RULES[from].canBecome.includes(to);
}
