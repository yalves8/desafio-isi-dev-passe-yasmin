import { describe, expect, it, vi } from 'vitest';
import { readClubLineup } from '../infrastructure/queries/club-lineup.query.js';

const jogador = {
  id: 5,
  nome: 'Davi Melo',
  posicao: 'GOL',
  agilidade: 70,
  idade: 30,
  valor_base: '20.00',
  condicao: 'APTO',
  clube_id: 1,
  velocidade: 50,
  finalizacao: 40,
  passe: 50,
  drible: 45,
  defesa: 80,
  fisico: 70,
  potencial: 80,
  excluido_em: null,
  criado_em: new Date('2026-01-01T00:00:00Z'),
};

describe('readClubLineup', () => {
  it('lê o clube com os titulares não excluídos e devolve formação e jogadores', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 1,
      nome: 'Águias FC',
      formacao: '2-2',
      escalacoes: [{ jogador }],
    });

    const lineup = await readClubLineup({ clube: { findUnique } } as never, 1);

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        escalacoes: {
          where: { jogador: { excluido_em: null } },
          include: { jogador: true },
        },
      },
    });
    expect(lineup?.id).toBe(1);
    expect(lineup?.name).toBe('Águias FC');
    expect(lineup?.formation).toBe('2-2');
    expect(lineup?.starters.map((p) => p.id)).toEqual([5]);
  });

  it('devolve formação null quando o clube ainda não escalou, e null quando o clube não existe', async () => {
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce({
        id: 1,
        nome: 'Águias FC',
        formacao: null,
        escalacoes: [],
      })
      .mockResolvedValueOnce(null);
    const client = { clube: { findUnique } } as never;

    expect(await readClubLineup(client, 1)).toEqual({
      id: 1,
      name: 'Águias FC',
      formation: null,
      starters: [],
    });
    expect(await readClubLineup(client, 2)).toBeNull();
  });
});
