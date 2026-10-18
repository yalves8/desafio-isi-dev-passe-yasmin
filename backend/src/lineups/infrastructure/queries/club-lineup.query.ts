import { Prisma } from '../../../generated/prisma/client.js';
import { PlayerEntity } from '../../../players/domain/entities/player.entity.js';
import { playerFromRow } from '../../../players/infrastructure/mappers/player.mapper.js';
import { Formation } from '../../domain/formation.js';

/**
 * Escalação gravada de um clube: formação (`clubes.formacao`) e titulares ativos (`escalacoes`).
 *
 * @export
 * @interface ClubLineup
 */
export interface ClubLineup {
  id: number;
  name: string;
  /** null enquanto o clube não escalou */
  formation: Formation | null;
  starters: PlayerEntity[];
}

/**
 * Lê a escalação do clube com os titulares não excluídos (RN09).
 *
 * Recebe o client de quem chama: o `PrismaService` numa leitura avulsa ou o `tx` de uma
 * transação interativa, que mantém as travas e a transação de quem chamou.
 *
 * @param {Pick<Prisma.TransactionClient, 'clube'>} client - Prisma ou transação em andamento.
 * @param {number} clubId - Clube a ler.
 * @returns {Promise<ClubLineup | null>} null se o clube não existe.
 */
export async function readClubLineup(
  client: Pick<Prisma.TransactionClient, 'clube'>,
  clubId: number,
): Promise<ClubLineup | null> {
  const club = await client.clube.findUnique({
    where: { id: clubId },
    include: {
      escalacoes: {
        where: { jogador: { excluido_em: null } },
        include: { jogador: true },
      },
    },
  });
  if (!club) return null;
  return {
    id: club.id,
    name: club.nome,
    formation: (club.formacao as Formation | null) ?? null,
    starters: club.escalacoes.map((row) => playerFromRow(row.jogador)),
  };
}
