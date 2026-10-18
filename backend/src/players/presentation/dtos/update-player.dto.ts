import { z } from 'zod';
import {
  playerProfileFields,
  veteranAgilityRule,
} from './player-fields.schema.js';

/**
 * Schema Zod de validação do payload HTTP para atualização cadastral de jogador (PUT /api/v1/players/{id}).
 *
 * Exige todos os 4 campos principais (RN08), mesmo que apenas um deles seja alterado.
 */
export const updatePlayerSchema = z
  .object(playerProfileFields)
  .superRefine(veteranAgilityRule);

export type UpdatePlayerDto = z.infer<typeof updatePlayerSchema>;
