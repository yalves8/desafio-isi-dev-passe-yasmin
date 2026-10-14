import { NotFoundError } from '../../../../common/errors/domain.errors.js';
import { compareNames, removeAccents } from '../../../../common/utils/text.js';
import { comparePositions } from '../../../../domain/enums/position.enum.js';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository.interface.js';
import { FindPlayerByIdOutput } from '../find-player-by-id/find-player-by-id.output.js';
import { FindPlayersInput } from './find-players.input.js';
import { FindPlayersOutput } from './find-players.output.js';

/**
 * Caso de uso responsável por listar os atletas paginados, aplicando busca, filtros e ordenações (RN07).
 *
 * Filtros de valor e ordenação de valor utilizam o valor de mercado calculado na hora.
 *
 * Fluxo principal:
 * 1. Se club_id foi informado, valida se o clube existe (404 caso não).
 * 2. Consulta atletas ativos no repositório com filtros de banco aplicáveis.
 * 3. Mapeia as entidades calculando overall e valor de mercado em memória.
 * 4. Aplica busca textual insensível a maiúsculas e acentos (search).
 * 5. Aplica filtro de faixa de valor de mercado (min_value e max_value).
 * 6. Ordena a lista com até 2 critérios encadeados, desempate por nome e ID crescente.
 * 7. Pagina o resultado calculando total_items e total_pages.
 *
 * @export
 * @class FindPlayersUseCase
 */
export class FindPlayersUseCase {
  /**
   * Construtor do `FindPlayersUseCase`.
   *
   * @param {IPlayerRepository} playerRepository - Repositório desacoplado de atletas.
   */
  constructor(private readonly playerRepository: IPlayerRepository) {}

  /**
   * Executa a busca paginada de atletas.
   *
   * @param {FindPlayersInput} input - Parâmetros de consulta e filtros.
   * @returns {Promise<FindPlayersOutput>} Lista paginada e metadados.
   * @throws {NotFoundError} Se um club_id fornecido não existir.
   */
  async execute(input: FindPlayersInput): Promise<FindPlayersOutput> {
    if (input.club_id !== undefined) {
      const exists = await this.playerRepository.checkClubExists(input.club_id);
      if (!exists) {
        throw new NotFoundError('Clube não encontrado');
      }
    }

    const rawPlayers = await this.playerRepository.findMany({
      clubId: input.club_id,
      free: input.free,
      position: input.position,
      condition: input.condition,
      minAge: input.min_age,
      maxAge: input.max_age,
    });

    let mapped: FindPlayerByIdOutput[] = rawPlayers.map((player) => ({
      id: player.id,
      name: player.getName(),
      position: player.getPosition(),
      agility: player.getAgility(),
      age: player.getAge(),
      condition: player.getCondition(),
      base_value: player.baseValue,
      market_value: player.calculateMarketValue(),
      pace: player.attributes.pace,
      shooting: player.attributes.shooting,
      passing: player.attributes.passing,
      dribbling: player.attributes.dribbling,
      defending: player.attributes.defending,
      physical: player.attributes.physical,
      potential: player.potential,
      overall: player.calculateOverall(),
      club_id: player.getClubId(),
    }));

    if (input.search) {
      const searchNorm = removeAccents(input.search).toLowerCase();
      mapped = mapped.filter((p) =>
        removeAccents(p.name).toLowerCase().includes(searchNorm),
      );
    }

    if (input.min_value !== undefined || input.max_value !== undefined) {
      const minVal = input.min_value ?? 0;
      const maxVal = input.max_value ?? 550;
      mapped = mapped.filter(
        (p) => p.market_value >= minVal && p.market_value <= maxVal,
      );
    }

    const sortCriteria = input.sort;
    mapped.sort((a, b) => {
      for (const crit of sortCriteria) {
        let diff = 0;
        if (crit === 'name') {
          diff = compareNames(a.name, b.name);
        } else if (crit === 'value_asc') {
          diff = a.market_value - b.market_value;
        } else if (crit === 'value_desc') {
          diff = b.market_value - a.market_value;
        } else if (crit === 'age_asc') {
          diff = a.age - b.age;
        } else if (crit === 'age_desc') {
          diff = b.age - a.age;
        } else if (crit === 'position') {
          diff = comparePositions(a.position, b.position);
        }
        if (diff !== 0) return diff;
      }
      const nameDiff = compareNames(a.name, b.name);
      if (nameDiff !== 0) return nameDiff;
      return a.id - b.id;
    });

    const total_items = mapped.length;
    const total_pages =
      total_items === 0 ? 0 : Math.ceil(total_items / input.limit);
    const offset = (input.page - 1) * input.limit;
    const data =
      offset >= total_items ? [] : mapped.slice(offset, offset + input.limit);

    return {
      data,
      meta: {
        page: input.page,
        limit: input.limit,
        total_items,
        total_pages,
      },
    };
  }
}
