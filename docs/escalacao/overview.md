# Escalação — Visão Geral da Feature

A feature de Escalação permite escolher a **formação** e os **5 titulares** de um clube (1 goleiro e 4 jogadores de linha) e consultar a escalação atual (RN19). É a escalação completa que deixa o clube jogar partidas (RN20). No frontend, fica na aba **Escalação** da página do clube (`/clubes/{id}?aba=escalacao`).

---

## Arquitetura

A escalação tem um módulo próprio no backend, `lineups`, porque cruza clube e jogadores e será usada também pelas partidas. As rotas ficam sob `/clubs/{id}/lineup`, como no enunciado.

| Camada | Caminho | Responsabilidade |
|--------|---------|------------------|
| Domínio | `backend/src/lineups/domain/formation.ts` | `FORMATIONS` (3-1, 2-2, 2-1-1, 1-2-1), `fitsFormation`, `formationRequirement` e `isLineupComplete` (formação salva e 5 titulares; também usado pela partida) |
| Caso de uso | `backend/src/lineups/application/usecases/get-lineup/` | `GetLineupUseCase`: escalação do clube (404 se o clube não existe) |
| Resultado | `backend/src/lineups/application/lineup-result.ts` | `describeLineup`: titulares na ordem do elenco e `complete`; usado pela consulta e pela troca |
| Presenter | `backend/src/lineups/presentation/presenters/lineup.presenter.ts` | `toLineupResponse`: a escalação no formato da API, aplicado pelo controller |
| Caso de uso | `backend/src/lineups/application/usecases/update-lineup/` | `UpdateLineupUseCase`: regras da RN19 sobre o estado travado e substituição da escalação |
| Contrato do repositório | `backend/src/lineups/application/interfaces/repositories/lineup.repository.interface.ts` | `findByClub` e `replace` (unidade de trabalho com validação) |
| Repositório Prisma | `backend/src/lineups/infrastructure/repositories/prisma-lineup.repository.ts` | Lê `clubes.formacao` e `escalacoes`; na troca, trava jogadores e clube e regrava tudo numa transação |
| DTO | `backend/src/lineups/presentation/dtos/update-lineup.dto.ts` | `updateLineupSchema` (Zod): formação e os 5 ids (400) |
| Controller | `backend/src/lineups/presentation/controllers/lineups.controller.ts` | `GET` e `PUT /clubs/:id/lineup` |
| Compartilhado | `backend/src/players/domain/squad-order.ts`, `backend/src/players/presentation/presenters/player.presenter.ts` | `compareSquadOrder` (ordem da RN11) e `toPlayerResponse` (campos de `GET /players/{id}`) |
| Frontend | `frontend/src/modules/clubs/components/lineup-editor/` e vizinhos (`formation-picker`, `lineup-slots`, `lineup-pitch`, `lineup-reserves`) | Editor da aba Escalação; `clubsService.getLineup` e `updateLineup` |

---

## Endpoints

### `PUT /api/v1/clubs/{id}/lineup`

```json
{ "formation": "2-1-1", "player_ids": [34, 31, 30, 33, 32] }
```

Substitui a escalação inteira e responde `200` com a escalação gravada, no formato do `GET`.

### `GET /api/v1/clubs/{id}/lineup`

```json
{
  "club_id": 1,
  "formation": "2-1-1",
  "complete": true,
  "players": [ { "id": 30, "name": "Rui Prado", "position": "GOL", "...": "campos de GET /players/{id}" } ]
}
```

| Situação | `formation` | `players` | `complete` |
|----------|-------------|-----------|------------|
| Clube que nunca escalou | `null` | `[]` | `false` |
| Escalação com os 5 titulares | a salva | os 5, na ordem do elenco | `true` |
| Titular vendido ou que passou a `DOENTE` | a salva | os que sobraram | `false` |

### Erros

| Status | Quando | `message` |
|--------|--------|-----------|
| 404 | Id da URL inválido | `Recurso não encontrado` |
| 400 | `formation` ausente ou fora da lista | `formation deve ser 3-1, 2-2, 2-1-1 ou 1-2-1` |
| 400 | `player_ids` ausente ou que não é lista | `player_ids é obrigatório e deve ser uma lista` |
| 400 | Tamanho diferente de 5 | `player_ids deve ter exatamente 5 jogadores` |
| 400 | Id que não é inteiro positivo | `player_ids deve ter só inteiros positivos` |
| 400 | Ids repetidos | `player_ids não pode repetir jogadores` |
| 404 | Clube inexistente | `Clube não encontrado` |
| 404 | Jogador inexistente ou excluído | `Jogador {id} não encontrado` |
| 409 | Jogador de outro clube ou livre | `{nome} não é do elenco do {clube}.` |
| 409 | Jogador `DOENTE` | `{nome} está DOENTE e não pode ser escalado.` |
| 409 | Posições que não fecham a formação | `As posições não fecham a formação {f}: são precisos 1 GOL, ...` |

---

## Regras de Negócio (RN19)

| Formação | Defesa (ZAG ou LAT) | Meio (MEI) | Ataque (ATA) |
|----------|---------------------|------------|--------------|
| `3-1` | 3 | 0 | 1 |
| `2-2` | 2 | 0 | 2 |
| `2-1-1` | 2 | 1 | 1 |
| `1-2-1` | 1 | 2 | 1 |

1. Sempre 5 titulares: exatamente 1 GOL e os jogadores de linha de cada setor da formação. O clube nasce sem escalação.
2. O `PUT` recebe os ids em qualquer ordem e **substitui** a escalação inteira numa única operação.
3. Cada titular precisa ser do elenco do clube e não estar `DOENTE`; `MAL_CONDICIONADO` pode ser escalado (joga com 15% a menos na partida, RN20).
4. O titular sai da escalação quando é **vendido** ou passa a **`DOENTE`**, na mesma operação; a formação continua salva e o clube não joga até escalar de novo. O jogador **não volta sozinho**: deixar de estar `DOENTE` não o devolve à escalação.
5. Escalar não muda o caixa.

Ordem das verificações: corpo (400) → clube (404) → jogadores (404) → elenco (409) → `DOENTE` (409) → formação (409).

---

## Concorrência e Atomicidade

A troca roda numa transação que trava os 5 jogadores (em ordem crescente de id) e depois o clube com `SELECT ... FOR UPDATE`, a mesma ordem jogador → clube da compra e da venda. Assim:

- uma **venda** simultânea de um titular espera a troca terminar e, ao vender, já o remove da escalação gravada;
- uma **troca para `DOENTE`** simultânea também espera: a alteração de condição atualiza o jogador **antes** de removê-lo da escalação (ordem ajustada em `prisma-player.repository.ts`), então a remoção sempre enxerga o titular que a troca gravou.

Verificação contra o PostgreSQL: em 15 rodadas disparando a troca de escalação e a mudança para `DOENTE` do mesmo jogador ao mesmo tempo, nenhuma terminou com titular `DOENTE`.

---

## Schema de Banco de Dados

| Tabela/coluna | Uso |
|---------------|-----|
| `clubes.formacao` (`VARCHAR(5)`, nulo) | Formação salva; continua quando um titular sai |
| `escalacoes` (`clube_id`, `jogador_id` único) | Os titulares; a troca apaga as linhas do clube e grava as 5 novas |
| `jogadores` (`clube_id`, `condicao`, `excluido_em`) | Elenco, condição e existência de cada titular |

---

## Tela (frontend)

A aba Escalação (frames C06 a C11 do Figma) mostra a formação com mini campo, uma vaga por titular com a condição, o overall e os atributos usados devolvidos pela API (os candidatos vêm na ordem do elenco da API, sem reordenar na tela), a prévia no campo, as reservas e os avisos de escalação incompleta e de mal condicionados. Salvar valida antes de enviar: com vaga vazia, nada é enviado e cada vaga sem titular mostra a mensagem junto ao seletor; completa, envia a formação e os 5 titulares. A tela não decide quem ataca ou defende nem aplica o efeito da condição (isso é da partida, RN20): a coluna "Atributos usados" vem de `GET /clubs/{id}/duel-attributes` (papel de cada vaga em `roles` e atributos de cada jogador do elenco), calculado pelo motor da partida e fora das respostas de `GET /clubs/{id}` e `GET /clubs/{id}/lineup`, que seguem o formato do enunciado, e mostra o atributo cadastrado, como no Figma; a recusa da API (`409`) aparece no próprio card e a tela recarrega o que ficou gravado.

---

## Como testar

```bash
cd backend && npx vitest run src/lineups
cd frontend && npx vitest run src/modules/clubs/components/lineup-editor
```

```bash
API=http://localhost:3000/api/v1

# Escalação atual (sem escalação: formation null)
curl -s $API/clubs/1/lineup

# Escalar no 2-1-1 (ids de um GOL, um ZAG, um LAT, um MEI e um ATA do elenco)
curl -s -X PUT $API/clubs/1/lineup -H 'Content-Type: application/json' \
  -d '{ "formation": "2-1-1", "player_ids": [34, 31, 30, 33, 32] }'

# 409: posições que não fecham a formação
curl -s -X PUT $API/clubs/1/lineup -H 'Content-Type: application/json' \
  -d '{ "formation": "2-2", "player_ids": [34, 31, 30, 33, 32] }'

# Titular passa a DOENTE: a escalação fica incompleta, com a mesma formação
curl -s -X PATCH $API/players/33/condition -H 'Content-Type: application/json' \
  -d '{ "condition": "DOENTE" }'
curl -s $API/clubs/1/lineup
```

---

## Dependências

| Dependência | Uso |
|-------------|-----|
| NestJS, Zod | Controller, `ParseIdPipe` e validação do corpo |
| Prisma + PostgreSQL 16 | `clubes.formacao`, `escalacoes` e travas `FOR UPDATE` |
| Módulo `players` | `PlayerEntity`, `playerFromRow`, `compareSquadOrder` e `toPlayerResponse` |
| Módulos `transfers` e `players` | A venda e a troca para `DOENTE` removem o titular da escalação |
