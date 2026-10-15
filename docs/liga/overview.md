# Liga — Visão Geral da Feature

A Liga reúne as **partidas** e a **classificação**. Uma partida é jogada na hora entre dois clubes com a escalação completa: o placar sai dos atributos dos titulares, sem sorteio, em 6 duelos (RN20). A API grava a partida com os valores do momento, lista o histórico e calcula a classificação a cada consulta (RN21). No frontend, ficam em `/partidas`, `/partidas/{id}` e `/classificacao`.

---

## Arquitetura

| Camada | Caminho | Responsabilidade |
|--------|---------|------------------|
| Motor | `backend/src/domain/match-engine.ts` | `playMatch`: 6 duelos, efeito da condição (× 0,85 arredondado com o meio para cima), gols e `result` |
| Domínio | `backend/src/matches/domain/standings.ts` | `computeStandings`: pontos, saldo, gols e ordem da RN21 |
| Casos de uso | `backend/src/matches/application/usecases/` | `PlayMatchUseCase`, `FindMatchesUseCase`, `FindMatchByIdUseCase`, `GetStandingsUseCase` |
| Presenter | `backend/src/matches/application/presenters/match.presenter.ts` | `toMatchOutput`: formato da API, com ou sem `duels` |
| Repositório | `backend/src/matches/infrastructure/repositories/prisma-match.repository.ts` | Lê as escalações com os clubes travados (`FOR SHARE`), grava `partidas` e `duelos_partida` numa transação |
| DTOs | `backend/src/matches/presentation/dtos/` | `playMatchSchema` (corpo) e `parseMatchesQuery` (`club_id`) |
| Controllers | `backend/src/matches/presentation/controllers/` | `MatchesController` (`/matches`) e `StandingsController` (`/standings`) |
| Frontend | `frontend/src/modules/league/` | Páginas de partidas, partida e classificação; `api/matches.service.ts` |

A ordem dos titulares (goleiro e jogadores de linha do 1º ao 4º) usa `compareSquadOrder`, a mesma ordem do elenco (RN11).

---

## Endpoints

| Método | Rota | Sucesso | Erros | Descrição |
|--------|------|---------|-------|-----------|
| `POST` | `/matches` | `201` + `Location: /api/v1/matches/{id}` | `400`, `404`, `409` | Joga e grava a partida; responde com os 6 duelos |
| `GET` | `/matches` | `200` (array) | `400`, `404` | Histórico da mais recente para a mais antiga, sem duelos; `club_id` filtra mandante ou visitante |
| `GET` | `/matches/:id` | `200` | `404` | Partida com os 6 duelos |
| `GET` | `/standings` | `200` (array) | — | Classificação de todos os clubes |

```json
{
  "id": 1,
  "played_at": "2026-11-12T15:00:00-03:00",
  "home": { "club_id": 1, "club_name": "Águias FC", "formation": "2-1-1", "goals": 1 },
  "away": { "club_id": 2, "club_name": "Delta FC", "formation": "2-1-1", "goals": 2 },
  "result": "VISITANTE",
  "duels": [
    { "order": 1, "attacking_club_id": 1,
      "attacker": { "player_id": 34, "player_name": "Otto Rangel", "position": "ATA", "condition": "APTO", "attribute": "shooting", "value": 75 },
      "defender": { "player_id": 40, "player_name": "Ivo Teles", "position": "GOL", "condition": "APTO", "attribute": "defending", "value": 72 },
      "goal": true }
  ]
}
```

### Erros

| Status | Quando | `message` |
|--------|--------|-----------|
| 400 | Clube ausente ou que não é inteiro positivo | `home_club_id ...` / `away_club_id ...` |
| 400 | Mandante igual ao visitante | `O mandante e o visitante precisam ser clubes diferentes` |
| 404 | Mandante ou visitante inexistente | `Clube mandante não encontrado` / `Clube visitante não encontrado` |
| 409 | Clube sem a formação ou sem os 5 titulares | `Escalação incompleta: o {clube} não tem os 5 titulares.` |
| 400 | `club_id` vazio ou fora do formato (`GET /matches`) | `Parâmetro club_id não pode ser vazio` / `club_id deve ser um inteiro positivo` |
| 404 | Clube do filtro inexistente | `Clube não encontrado` |
| 404 | Partida inexistente ou id inválido | `Partida não encontrada` / `Recurso não encontrado` |

---

## Regras de Negócio

### RN20 — Partida

| Duelo (mandante) | Duelo (visitante) | Atacante | Defensor | Valores |
|------------------|-------------------|----------|----------|---------|
| 1 | 4 | 4º jogador de linha | Goleiro | Ataque: ATA finalização, MEI passe, ZAG/LAT drible; defesa: sempre `defending` |
| 2 | 5 | 3º jogador de linha | 1º jogador de linha | |
| 3 | 6 | 2º jogador de linha | 2º jogador de linha | |

- Titular `MAL_CONDICIONADO` joga com 15% a menos: atributo × 0,85, arredondado com o meio para cima (74 → 63; 50 → 43). Só vale na partida.
- É gol quando o ataque é **maior** que a defesa; empate no duelo não é gol. `result`: `MANDANTE`, `VISITANTE` ou `EMPATE`.
- A partida grava data e hora, placar, formações e os 6 duelos com nomes, posições, condições, atributos e valores do momento; nada é recalculado depois. Não muda caixa, escalação nem jogadores.

O exemplo completo da RN20 (Águias FC 1 × 2 Delta FC) está nos testes de `backend/src/matches/tests/match-domain.spec.ts`, duelo a duelo.

### RN21 — Histórico e classificação

- `GET /matches`: mais recente primeiro; no mesmo instante, maior id. `result` sai do placar gravado.
- Classificação com **todos** os clubes (os sem partida zerados), vitória 3, empate 1, derrota 0, ordenada por pontos, saldo, gols marcados e nome (sem acentos, minúsculas; no empate de nome, id). `position` de 1 ao total, sem repetir; nunca gravada.

---

## Concorrência e Atomicidade

`POST /matches` lê as duas escalações dentro de uma transação que trava os dois clubes em modo compartilhado (`SELECT ... FOR SHARE`, em ordem de id). Uma troca de escalação ou uma venda, que travam o clube para escrita, esperam a partida terminar, e a partida nunca lê uma escalação pela metade. A partida e os 6 duelos são gravados juntos; se a conferência recusar, nada é gravado.

---

## Schema de Banco de Dados

| Tabela | Colunas gravadas |
|--------|------------------|
| `partidas` | `mandante_id`, `visitante_id`, `gols_mandante`, `gols_visitante`, `formacao_mandante`, `formacao_visitante`, `jogada_em` |
| `duelos_partida` | `partida_id`, `ordem` (1 a 6), `clube_atacante_id`, `atacante_id`/`defensor_id`, nomes, posições, condições, `atributo_ataque`/`atributo_defesa`, `valor_ataque`/`valor_defesa`, `gol` |

A classificação não tem tabela: é calculada de `clubes` e `partidas` a cada consulta.

---

## Tela (frontend)

| Frame | Tela | Comportamento |
|-------|------|---------------|
| L01 | `/partidas` | Última partida da liga (placar, data, resultado e "Ver duelos") e histórico com filtro por clube (`?clube=`), vencedor em destaque, contagem e estados de carregando, vazio e erro |
| L02 | Nova partida (`?nova=1`) | Mandante e visitante; valida os dois e que são diferentes; explica como sai o placar; botão desabilitado durante o envio (clique duplo não cria duas partidas) |
| L04 | Nova partida recusada | Alerta "Não foi possível jogar a partida" com o `message` da API e o clube citado em vermelho |
| L03 | `/partidas/{id}` | Placar com as formações, campo com os titulares dos dois clubes (valores usados, marca de mal condicionado e de gol no duelo) e os 6 duelos agrupados por time, com o total de gols; trilha "Liga › Partidas › Delta FC 2 × 1 Águias FC"; aviso "Partida jogada" depois de jogar |
| L05 | `/classificacao` | Tabela na ordem da API (líder em destaque, saldo com sinal, links para os clubes), últimas partidas e ordem da tabela; "Nova partida" abre o diálogo em `/partidas` |

Os titulares no campo e nos duelos são montados só a partir dos duelos gravados (`startersFromDuels`): a tela não recalcula valores. O menu mostra o total de partidas e a última partida; a tela inicial, o total e o líder.

---

## Como testar

```bash
cd backend && npx vitest run src/matches
cd frontend && npx vitest run src/modules/league
```

```bash
API=http://localhost:3000/api/v1

# Os dois clubes precisam da escalação completa (ver docs/escalacao)
curl -s -i -X POST $API/matches -H 'Content-Type: application/json' \
  -d '{ "home_club_id": 1, "away_club_id": 2 }'

curl -s $API/matches
curl -s "$API/matches?club_id=1"
curl -s $API/matches/1
curl -s $API/standings

# 400 (mesmo clube), 404 (clube inexistente) e 409 (escalação incompleta)
curl -s -X POST $API/matches -H 'Content-Type: application/json' -d '{ "home_club_id": 1, "away_club_id": 1 }'
curl -s -X POST $API/matches -H 'Content-Type: application/json' -d '{ "home_club_id": 1, "away_club_id": 99 }'
```

### Verificação feita contra o PostgreSQL

Com dois clubes escalados no 2-1-1, `POST /matches` respondeu `201` com `Location`, e os 6 duelos conferiram com as escalações (Tubarões EC 2 × 2 Águias FC). A classificação desempatou os dois pelo nome e listou o clube sem partidas zerado. Na tela integrada, um clique duplo em "Jogar partida" criou uma só partida, e o clube sem escalação foi recusado no diálogo com o clube marcado.

---

## Dependências

| Dependência | Uso |
|-------------|-----|
| NestJS, Zod | Controllers, `ParseIdPipe`, validação do corpo e do filtro |
| Prisma + PostgreSQL 16 | `partidas`, `duelos_partida`, escalações e travas `FOR SHARE` |
| Módulos `lineups` e `players` | Formação, titulares, `compareSquadOrder` e `playerFromRow` |
| React, React Router, lucide-react, sonner | Páginas, filtro e diálogo na URL, ícones e aviso "Partida jogada" |
| `@/modules/clubs` e `@/modules/players` | `ClubBadge` e `PlayerAvatar` |
