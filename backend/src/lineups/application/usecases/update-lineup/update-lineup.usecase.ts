import {
  ConflictError,
  NotFoundError,
} from '../../../../common/errors/domain.errors.js';
import {
  fitsFormation,
  formationRequirement,
} from '../../../domain/formation.js';
import {
  ILineupRepository,
  LineupChangeState,
} from '../../interfaces/repositories/lineup.repository.interface.js';
import { toLineupOutput } from '../get-lineup/get-lineup.usecase.js';
import { LineupOutput } from '../get-lineup/lineup.output.js';
import { UpdateLineupInput } from './update-lineup.input.js';

/**
 * Caso de uso da troca de escalação (RN19).
 *
 * Regras aplicadas, nesta ordem:
 * 1. Clube inexistente → 404; jogador inexistente ou excluído → 404.
 * 2. Jogador fora do elenco do clube → 409; jogador DOENTE → 409 (MAL_CONDICIONADO pode).
 * 3. As posições precisam fechar a formação: 1 GOL e os setores da tabela → senão 409.
 * 4. Substitui a formação e os 5 titulares numa única operação; o caixa não muda.
 *
 * @export
 * @class UpdateLineupUseCase
 */
export class UpdateLineupUseCase {
  /**
   * Construtor do `UpdateLineupUseCase`.
   *
   * @param {ILineupRepository} lineupRepository - Repositório de escalação.
   */
  constructor(private readonly lineupRepository: ILineupRepository) {}

  /**
   * Executa a troca e devolve a escalação gravada.
   *
   * @param {UpdateLineupInput} input - Clube, formação e titulares.
   * @returns {Promise<LineupOutput>} Escalação no formato de GET /clubs/{id}/lineup.
   * @throws {NotFoundError} Clube ou jogador inexistente.
   * @throws {ConflictError} Fora do elenco, DOENTE ou posições que não fecham a formação.
   */
  async execute(input: UpdateLineupInput): Promise<LineupOutput> {
    await this.lineupRepository.replace(
      input.clubId,
      input.formation,
      input.playerIds,
      (state) => this.validate(state, input),
    );
    const lineup = await this.lineupRepository.findByClub(input.clubId);
    if (!lineup) throw new NotFoundError('Clube não encontrado');
    return toLineupOutput(lineup);
  }

  /** Regras da RN19 sobre o estado travado; lançar aqui desfaz a troca */
  private validate(
    { club, players }: LineupChangeState,
    { formation }: UpdateLineupInput,
  ): void {
    if (!club) throw new NotFoundError('Clube não encontrado');
    const missing = players.find((p) => p.player === null);
    if (missing)
      throw new NotFoundError(`Jogador ${missing.id} não encontrado`);

    const starters = players.map((p) => p.player!);
    const outsider = starters.find((p) => p.getClubId() !== club.id);
    if (outsider) {
      throw new ConflictError(
        `${outsider.getName()} não é do elenco do ${club.name}.`,
      );
    }
    const sick = starters.find((p) => p.getCondition() === 'DOENTE');
    if (sick) {
      throw new ConflictError(
        `${sick.getName()} está DOENTE e não pode ser escalado.`,
      );
    }
    if (
      !fitsFormation(
        formation,
        starters.map((p) => p.getPosition()),
      )
    ) {
      throw new ConflictError(
        `As posições não fecham a formação ${formation}: são precisos ${formationRequirement(formation)}.`,
      );
    }
  }
}
