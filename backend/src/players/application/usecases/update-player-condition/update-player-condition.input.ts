import { Condition } from '../../../../domain/condition.js';

/**
 * Dados de entrada para o caso de uso de alteração de condição física.
 *
 * @export
 * @interface UpdatePlayerConditionInput
 */
export interface UpdatePlayerConditionInput {
  id: number;
  condition: Condition;
}
