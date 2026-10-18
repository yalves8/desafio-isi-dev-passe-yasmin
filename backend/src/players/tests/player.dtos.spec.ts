import { describe, expect, it } from 'vitest';
import { createPlayerSchema } from '../presentation/dtos/create-player.dto.js';
import { updatePlayerSchema } from '../presentation/dtos/update-player.dto.js';

const valid = {
  name: 'Davi  Melo',
  position: 'ATA',
  agility: 85,
  age: 35,
  pace: 50,
  shooting: 60,
  passing: 50,
  dribbling: 50,
  defending: 40,
  physical: 50,
  potential: 60,
};

const issues = (result: {
  success: boolean;
  error?: { issues: { message: string; path: PropertyKey[] }[] };
}) => result.error?.issues.map((i) => [i.path.join('.'), i.message]) ?? [];

describe.each([
  ['createPlayerSchema', createPlayerSchema],
  ['updatePlayerSchema', updatePlayerSchema],
] as const)('%s: nome e agilidade do veterano', (_, schema) => {
  it('normaliza os espaços do nome', () => {
    const parsed = schema.parse(valid);
    expect(parsed.name).toBe('Davi Melo');
  });

  it.each([
    ['Da\u0007vi Melo', ['Caracteres de controle não são permitidos no nome']],
    // As checagens depois da normalização acumulam as mensagens.
    [
      '  D  ',
      [
        'Nome deve ter entre 3 e 100 caracteres',
        'Nome deve ter pelo menos duas palavras',
      ],
    ],
    ['Davi Melo 2', ['Nome não pode conter dígitos']],
    ['Davi', ['Nome deve ter pelo menos duas palavras']],
    ['Davi -', ['Nome deve ter pelo menos duas palavras']],
  ])('recusa o nome %j com %j', (name, messages) => {
    expect(issues(schema.safeParse({ ...valid, name }))).toEqual(
      messages.map((message) => ['name', message]),
    );
  });

  it('recusa nome ausente com "name é obrigatório"', () => {
    expect(issues(schema.safeParse({ ...valid, name: undefined }))).toEqual([
      ['name', 'name é obrigatório'],
    ]);
  });

  it('aceita 85 de agilidade aos 35 anos e 86 aos 34', () => {
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, age: 34, agility: 86 }).success).toBe(
      true,
    );
  });

  it('recusa mais de 85 de agilidade com 35 anos ou mais', () => {
    expect(issues(schema.safeParse({ ...valid, agility: 86 }))).toEqual([
      [
        'agility',
        'Jogador com 35 anos ou mais pode ter agilidade de no máximo 85',
      ],
    ]);
  });
});

describe('createPlayerSchema: regras do cadastro', () => {
  it('mantém a ordem das mensagens das regras cruzadas', () => {
    expect(
      issues(
        createPlayerSchema.safeParse({
          ...valid,
          agility: 90,
          pace: 99,
          shooting: 99,
          passing: 99,
          dribbling: 99,
          defending: 99,
          physical: 99,
          potential: 98,
        }),
      ),
    ).toEqual([
      [
        'agility',
        'Jogador com 35 anos ou mais pode ter agilidade de no máximo 85',
      ],
      ['pace', 'A soma dos seis atributos não pode passar de 480'],
      [
        'potential',
        'Potencial não pode ser menor que o maior atributo técnico',
      ],
      [
        'potential',
        'No cadastro com 33 anos ou mais, o potencial deve ser igual ao maior dos seis atributos',
      ],
    ]);
  });
});
