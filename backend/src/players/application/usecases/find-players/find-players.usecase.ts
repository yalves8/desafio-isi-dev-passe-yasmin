import { NotFoundError } from '../../../../common/errors/domain.errors.js';
import {
  comparePlayers,
  isWithinValueRange,
  ListedPlayer,
  matchesSearch,
  paginate,
} from '../../../domain/player-listing.js';
import { PlayerEntity } from '../../../domain/entities/player.entity.js';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository.interface.js';
import { FindPlayersInput } from './find-players.input.js';
import { FindPlayersOutput } from './find-players.output.js';

type Row = ListedPlayer & { player: PlayerEntity };

function toRow(player: PlayerEntity): Row {
  return {
    id: player.id,
    name: player.getName(),
    age: player.getAge(),
    position: player.getPosition(),
    marketValue: player.calculateMarketValue().toNumber(),
    player,
  };
}

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
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(input: FindPlayersInput): Promise<FindPlayersOutput> {
    if (
      input.clubId !== undefined &&
      !(await this.playerRepository.checkClubExists(input.clubId))
    ) {
      throw new NotFoundError('Clube não encontrado');
    }

    // O banco filtra o que é coluna; busca e valor de mercado (calculado) ficam aqui
    const players = await this.playerRepository.findMany({
      clubId: input.clubId,
      free: input.free,
      position: input.position,
      condition: input.condition,
      minAge: input.minAge,
      maxAge: input.maxAge,
    });

    const rows = players
      .map(toRow)
      .filter(
        (row) =>
          (!input.search || matchesSearch(row.name, input.search)) &&
          isWithinValueRange(row.marketValue, input.minValue, input.maxValue),
      )
      .sort(comparePlayers(input.sort));

    const page = paginate(rows, input.page, input.limit);
    return {
      players: page.items.map((row) => row.player),
      page: input.page,
      limit: input.limit,
      totalItems: page.totalItems,
      totalPages: page.totalPages,
    };
  }
}
