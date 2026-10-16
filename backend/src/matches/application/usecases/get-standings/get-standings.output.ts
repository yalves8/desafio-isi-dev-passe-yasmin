import { StandingRow } from '../../../domain/standings.js';

/** Classificação com todos os clubes, na ordem da RN21, calculada a cada consulta */
export type GetStandingsOutput = StandingRow[];
