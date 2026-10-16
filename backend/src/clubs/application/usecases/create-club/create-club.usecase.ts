import { ConflictError } from '../../../../common/errors/domain.errors.js';
import { INITIAL_CASH, MAX_CLUBS } from '../../../../domain/league.js';
import { ClubEntity } from '../../../domain/entities/club.entity.js';
import { summarizeClub } from '../../club-summary.js';
import { IClubRepository } from '../../interfaces/repositories/club.repository.interface.js';
import { CreateClubInput } from './create-club.input.js';
import { CreateClubOutput } from './create-club.output.js';

/**
 * Caso de uso responsável pela criação de um novo clube na liga.
 *
 * Valida o limite de participantes da liga, a unicidade do nome e da sigla,
 * e inicializa o clube com saldo financeiro inicial padrão.
 *
 * Fluxo principal:
 * 1. Verifica se o limite máximo de 20 clubes já foi atingido.
 * 2. Verifica a unicidade do nome do clube (case-insensitive, sensível a acentos - RN10).
 * 3. Verifica a unicidade da sigla do clube.
 * 4. Persiste a entidade no repositório de clubes com 300,00 de caixa.
 * 5. Retorna o resumo do clube criado com os valores de patrimônio.
 *
 * @export
 * @class CreateClubUseCase
 */
export class CreateClubUseCase {
  /**
   * Cria uma nova instância de CreateClubUseCase.
   *
   * @param {IClubRepository} clubRepository - Repositório desacoplado para operações de clubes.
   */
  constructor(private readonly clubRepository: IClubRepository) {}

  /**
   * Executa a criação do clube.
   *
   * @param {CreateClubInput} input - Dados de entrada contendo nome e sigla.
   * @returns {Promise<CreateClubOutput>} Dados do clube recém-criado.
   * @throws {ConflictError} Se a liga já possuir 20 clubes ou se houver duplicidade de nome ou sigla.
   */
  async execute(input: CreateClubInput): Promise<CreateClubOutput> {
    const totalClubs = await this.clubRepository.count();
    if (totalClubs >= MAX_CLUBS) {
      throw new ConflictError(`A liga aceita no máximo ${MAX_CLUBS} clubes`);
    }

    const normalizedName = ClubEntity.normalizeName(input.name);
    const existingName =
      await this.clubRepository.findByNormalizedName(normalizedName);
    if (existingName) {
      throw new ConflictError('Clube com este nome já cadastrado');
    }

    const existingAcronym = await this.clubRepository.findByAcronym(
      input.acronym,
    );
    if (existingAcronym) {
      throw new ConflictError('Clube com esta sigla já cadastrado');
    }

    const created = await this.clubRepository.create({
      name: input.name,
      normalizedName,
      acronym: input.acronym,
      cash: INITIAL_CASH,
    });

    // Clube novo: sem jogadores, valor do elenco 0,00 e patrimônio igual ao caixa
    return summarizeClub(created, []);
  }
}
