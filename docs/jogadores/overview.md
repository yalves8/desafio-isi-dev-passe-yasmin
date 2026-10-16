# Jogadores — Visão Geral da Feature

A feature Jogadores cobre o ciclo de vida do atleta na liga: cadastro, listagem paginada com busca, filtros e ordenação, consulta, edição cadastral, alteração da condição física e exclusão lógica. A API calcula o **overall** e o **valor de mercado** a cada consulta e o **valor base** uma única vez, no cadastro. O backend segue arquitetura limpa (domínio, aplicação, infraestrutura e apresentação) em NestJS + Prisma, e o frontend expõe tudo na tela `/jogadores`.

A compra e a venda de jogadores ficam no módulo de transferências e têm documentos próprios: [Compra](../compra/overview.md) e [Venda](../venda/overview.md).

---

## Arquitetura

### Backend (`backend/src/`)

| Camada | Caminho | Responsabilidade |
|--------|---------|------------------|
| Domínio (cálculos) | `domain/player-rating.ts` | Pesos por posição, `overall()` e `baseValue()` em centavos (RN06) |
| Domínio (cálculos) | `domain/market-value.ts` | `marketValue()`: desconto por condição, efeito da agilidade, ajuste por idade, teto e piso (RN02 a RN05) |
| Domínio (cálculos) | `domain/money.ts` | Dinheiro em centavos inteiros, `roundDiv` (meio para longe do zero), `toCents` e `fromCents` |
| Domínio (ordenação) | `domain/enums/position.enum.ts` | `comparePositions()`: ordem GOL, ZAG, LAT, MEI, ATA |
| Domínio (listagem) | `players/domain/player-listing.ts` | Busca sem acento, faixa de valor, ordenação com desempate e paginação da RN07 |
| Presenter | `players/presentation/presenters/player.presenter.ts` | `toPlayerResponse` e `toPlayersPageResponse`: a entidade no formato de `GET /players/{id}` e a página da listagem; os casos de uso devolvem `PlayerEntity` e o controller aplica o presenter |
| Entidade | `players/domain/entities/player.entity.ts` | `PlayerEntity`: `calculateOverall()`, `calculateMarketValue()`, `update()` (RN08), `changeCondition()` (DOENTE → APTO bloqueado), `isFree()`, `isDeleted()` |
| Casos de uso | `players/application/usecases/` | `CreatePlayerUseCase`, `FindPlayersUseCase`, `FindPlayerByIdUseCase`, `UpdatePlayerUseCase`, `UpdatePlayerConditionUseCase`, `DeletePlayerUseCase` |
| Contrato do repositório | `players/application/interfaces/repositories/player.repository.interface.ts` | Classe abstrata `IPlayerRepository` (`findById`, `create`, `update`, `updateCondition`, `softDelete`, `findMany`, `checkClubExists`) |
| Repositório | `players/infrastructure/repositories/prisma-player.repository.ts` | `PrismaPlayerRepository`: acesso à tabela `jogadores`, sempre com `excluido_em: null` |
| Mapper | `players/infrastructure/mappers/player.mapper.ts` | `playerFromRow()`: linha de `jogadores` → `PlayerEntity` |
| Controller | `players/presentation/controllers/players.controller.ts` | `PlayersController` (`@Controller('players')`) |
| DTOs | `players/presentation/dtos/` | `createPlayerSchema`, `updatePlayerSchema`, `updateConditionSchema` (Zod) e `parseQueryPlayers()` |
| Módulo | `players/players.module.ts` | Liga `IPlayerRepository` a `PrismaPlayerRepository` e instancia os casos de uso por factory |
| Compartilhado | `common/pipes/zod-validation.pipe.ts`, `common/pipes/parse-id.pipe.ts` | Validação do corpo (400 com a primeira mensagem do Zod) e do id da URL (404) |
| Compartilhado | `common/errors/domain.errors.ts`, `common/filters/http-error.filter.ts` | `ValidationError` (400), `NotFoundError` (404), `ConflictError` (409) e tradução para `{ "message": "..." }` |
| Compartilhado | `common/utils/text.ts` | V4 (`normalizeSpaces`, `containsControlChars`), `removeAccents` e `compareNames` |

O prefixo global `api/v1` é aplicado em `backend/src/app.setup.ts` (`setGlobalPrefix('api/v1', { exclude: ['health'] })`), junto com o CORS e o `HttpErrorFilter` global.

### Frontend (`frontend/src/`)

| Camada | Caminho | Responsabilidade |
|--------|---------|------------------|
| Rota | `routes/router.tsx` | `{ path: '/jogadores', element: <PlayersPage /> }` |
| Página | `modules/players/pages/players-page/players-page.tsx` | Cabeçalho, filtros, chips, tabela e diálogos |
| Hook da página | `modules/players/pages/players-page/players-page.hook.ts` | `usePlayersPage()`: estado na URL, busca com debounce de 300 ms, contagem das abas, ações de condição e exclusão |
| Utilitários | `modules/players/pages/players-page/players-page.utils.ts` | `parsePlayersParams`, `toSearchParams`, `toApiFilters`, chips e paginação |
| Componentes principais | `modules/players/components/` | `player-filters`, `active-filters`, `players-table`, `players-toolbar`, `players-pagination`, `player-row-menu`, `player-create-dialog`, `player-created-dialog`, `player-edit-dialog`, `player-condition-dialog`, `player-delete-dialog`, `player-details-sheet` |
| Validação | `modules/players/player-form.validation.ts` | `createPlayerSchema` e `buildEditPlayerSchema(currentAge)`, espelhando os DTOs da API |
| Constantes | `modules/players/players.constants.ts` | `PAGE_SIZE = 10`, `AGE_LIMITS`, `MARKET_VALUE_LIMITS`, posições, condições, ordenações, `MAX_ATTRIBUTES_TOTAL = 480` |
| Serviço HTTP | `api/players.service.ts` | `playersService.list/get/create/update/updateCondition/delete` (e `buy`/`sell`, das outras features) |
| Tipos | `api/types.ts` | `Player`, `PaginatedPlayers`, `CreatePlayerInput`, `UpdatePlayerInput`, `Condition`, `Position`, `PlayerSort` |
| Cliente | `api/client.ts` | Axios com base `VITE_API_URL` (padrão `http://localhost:3000`) acrescida de `/api/v1` |

---

## Entidade de Domínio

A entidade central é `PlayerEntity`, em `backend/src/players/domain/entities/player.entity.ts`, persistida na tabela `jogadores` (model `Jogador` em `backend/prisma/schema.prisma`).

| Campo da API | Coluna no banco | Tipo no banco | Regra / limite |
|--------------|-----------------|---------------|----------------|
| `id` | `id` | `Int` autoincremento | Gerado pelo banco; na URL, inteiro positivo sem zeros à esquerda e até 2.147.483.647 (senão 404) |
| `name` | `nome` | `VARCHAR(100)` | 3 a 100 caracteres após V4 (trim e espaços repetidos viram um), sem dígitos, pelo menos 2 palavras, sem caracteres de controle |
| `position` | `posicao` | `VARCHAR(3)` | `GOL`, `ZAG`, `LAT`, `MEI` ou `ATA`; com clube, não muda no `PUT` (409) |
| `agility` | `agilidade` | `Int` | 1 a 100; com 35 anos ou mais, no máximo 85 |
| `age` | `idade` | `Int` | 16 a 45; no `PUT`, não pode diminuir (409) |
| `condition` | `condicao` | `VARCHAR(20)`, padrão `APTO` | `APTO`, `MAL_CONDICIONADO` ou `DOENTE`; nasce `APTO`; muda só pelo `PATCH /players/{id}/condition` |
| `base_value` | `valor_base` | `DECIMAL(6,2)` | Calculado no cadastro (RN06) e nunca mais alterado |
| `pace` | `velocidade` | `Int` | 1 a 99, só no cadastro |
| `shooting` | `finalizacao` | `Int` | 1 a 99, só no cadastro |
| `passing` | `passe` | `Int` | 1 a 99, só no cadastro |
| `dribbling` | `drible` | `Int` | 1 a 99, só no cadastro |
| `defending` | `defesa` | `Int` | 1 a 99, só no cadastro |
| `physical` | `fisico` | `Int` | 1 a 99, só no cadastro; a soma dos seis atributos não passa de 480 |
| `potential` | `potencial` | `Int` | 1 a 99, maior ou igual ao maior atributo; com 33 anos ou mais no cadastro, igual ao maior atributo |
| `club_id` | `clube_id` | `Int?` | `null` no cadastro (jogador livre); muda só por compra e venda |
| `overall` | — (não gravado) | — | Calculado a cada consulta pela posição atual (RN06) |
| `market_value` | — (não gravado) | — | Calculado a cada consulta (RN05) |
| — | `excluido_em` | `TIMESTAMPTZ?` | Momento da exclusão lógica (RN09); `null` = ativo |
| — | `criado_em` | `TIMESTAMPTZ`, padrão `now()` | Data de cadastro |
| — | `atualizado_em` | `TIMESTAMPTZ` (`@updatedAt`) | Atualizado pelo Prisma a cada escrita |

A entidade também carrega `activeContract` (contrato ativo, usado no cálculo da multa da venda) — detalhes em [Venda](../venda/overview.md).

---

## Endpoints

Base: `http://localhost:3000/api/v1`. Todos os erros saem do `HttpErrorFilter` no formato `{ "message": "..." }`.

| Método | Rota | Status de sucesso | Erros | Descrição |
|--------|------|-------------------|-------|-----------|
| `POST` | `/players` | `201` + cabeçalho `Location: /api/v1/players/{id}` | `400` | Cadastra jogador livre e `APTO`, com valor base calculado (RN06) |
| `GET` | `/players` | `200` (`{ data, meta }`) | `400`, `404` (`club_id` inexistente: "Clube não encontrado") | Lista paginada com busca, filtros e ordenação (RN07) |
| `GET` | `/players/:id` | `200` | `404` ("Jogador não encontrado" ou "Recurso não encontrado" para id inválido) | Detalhes com `overall` e `market_value` calculados na hora |
| `PUT` | `/players/:id` | `200` | `400`, `404`, `409` | Edita `name`, `position`, `agility` e `age` (RN08) |
| `PATCH` | `/players/:id/condition` | `200` | `400`, `404`, `409` | Altera a condição física; enviar a condição atual devolve `200` sem gravar |
| `DELETE` | `/players/:id` | `204` (sem corpo) | `404`, `409` | Exclusão lógica de jogador livre (RN09) |

Mensagens de conflito (`409`) lançadas pelo domínio:

| Situação | Mensagem | Origem |
|----------|----------|--------|
| Jogador com clube muda de posição | `Jogador vinculado a um clube não pode mudar de posição` | `PlayerEntity.update()` |
| Idade menor que a atual | `A idade não pode ser menor que a idade atual` | `PlayerEntity.update()` |
| `DOENTE` direto para `APTO` | `Jogador doente não pode passar diretamente para apto` | `PlayerEntity.changeCondition()` |
| Exclusão de jogador com clube | `Jogador que pertence a um clube não pode ser excluído` | `DeletePlayerUseCase` |

Formato de cada jogador nas respostas (igual em `POST`, `GET /players/:id`, `PUT`, `PATCH` e em cada item de `data`): `id`, `name`, `position`, `agility`, `age`, `condition`, `base_value`, `market_value`, `pace`, `shooting`, `passing`, `dribbling`, `defending`, `physical`, `potential`, `overall`, `club_id`.

### Filtros e ordenação de `GET /players`

Validados por `parseQueryPlayers()` em `backend/src/players/presentation/dtos/query-players.dto.ts`. Qualquer parâmetro presente com valor vazio (ex.: `position=`) é recusado com `400` (`Parâmetro <nome> não pode ser vazio`).

| Parâmetro | Aceito | Padrão | Validação / erro 400 |
|-----------|--------|--------|----------------------|
| `search` | Texto de 2 a 100 caracteres | — | Sem caracteres de controle; busca no nome ignorando maiúsculas e acentos |
| `position` | `GOL`, `ZAG`, `LAT`, `MEI`, `ATA` | — | `Posição inválida no filtro` |
| `condition` | `APTO`, `MAL_CONDICIONADO`, `DOENTE` | — | `Condição inválida no filtro` |
| `free` | `true` ou `false` | — | `free deve ser true ou false` |
| `club_id` | Inteiro positivo, sem zeros à esquerda, até 2.147.483.647 | — | `400` se inválido; `404` se o clube não existir; `free=true` com `club_id` → `400` |
| `min_age` / `max_age` | Inteiro de 16 a 45 | — | `min_age não pode ser maior que max_age` |
| `min_value` / `max_value` | Decimal de 0 a 550, até 2 casas (`10`, `10.5`, `0.5`) | — | `min_value não pode ser maior que max_value`; filtra pelo **valor de mercado** |
| `sort` | `name`, `value_asc`, `value_desc`, `age_asc`, `age_desc`, `position`; até 2, separados por vírgula | `name` | `sort aceita no máximo 2 critérios`; campo repetido (ex.: `value_asc,value_desc`) → `400` |
| `page` | Inteiro ≥ 1 | `1` | `page deve ser um inteiro positivo` |
| `limit` | Inteiro de 1 a 50 | `10` | `limit deve estar entre 1 e 50` |

Parâmetros fora da tabela são ignorados. A resposta traz `meta` com `page`, `limit`, `total_items` e `total_pages`.

---

## Regras de Negócio

| Regra | O que diz | Onde está implementada |
|-------|-----------|------------------------|
| RN02 | Desconto por condição: APTO 0%, MAL_CONDICIONADO 15%, DOENTE 30% | `CONDITION_DISCOUNT` em `domain/market-value.ts` |
| RN03 | Agilidade só age fora de APTO: 80 a 100 corta o desconto pela metade; 1 a 30 soma 10 pontos | `conditionDiscount()` em `domain/market-value.ts` |
| RN04 | Ajuste por idade atual: até 21 anos +10%; 32 ou mais −10%; demais 0% | `ageAdjustment()` em `domain/market-value.ts` |
| RN05 | Valor de mercado = valor base × (100 + ajuste por idade − desconto) ÷ 100, com teto de −40%, arredondado uma vez e com piso de 1,00; calculado a cada consulta | `marketValue()` e `PlayerEntity.calculateMarketValue()` |
| RN06 | Overall = soma dos atributos × pesos da posição ÷ 100, arredondado com meio para cima, recalculado a cada consulta. Valor base progressivo (0,50 por ponto de 41 a 60, 2,00 de 61 a 75, 6,00 de 76 a 99), multiplicado por (100 + potencial − overall) ÷ 100 se a idade no cadastro for até 21, piso 1,00; gravado só no cadastro | `overall()` e `baseValue()` em `domain/player-rating.ts`; `CreatePlayerUseCase` |
| RN07 | Filtros e ordenação de valor usam o valor de mercado; `sort=position` segue GOL, ZAG, LAT, MEI, ATA; empate por nome e depois id; busca dentro do nome sem acentos e sem diferenciar maiúsculas; paginação depois de buscar, filtrar e ordenar; página além da última devolve `data: []` | `FindPlayersUseCase` (filtros de banco no repositório; busca, faixa de valor, ordenação e paginação em memória) |
| RN08 | `PUT` muda só nome, posição, agilidade e idade (exige os 4); atributos, potencial e valor base não mudam; com clube não muda de posição; idade não diminui (409) | `updatePlayerSchema`, `PlayerEntity.update()`, `PrismaPlayerRepository.update()` |
| RN09 | `DELETE` preenche `excluido_em` e responde 204; só jogador livre (senão 409); excluído vira inexistente (404) e some da listagem | `DeletePlayerUseCase`, `PrismaPlayerRepository.softDelete()` e `excluido_em: null` em `findById`/`findMany` |
| RN19 (item 5) | Titular que passa a DOENTE sai da escalação na mesma operação | `PrismaPlayerRepository.updateCondition()`: `escalacao.deleteMany` + `jogador.update` em `$transaction` |
| V4 | Nome com trim e espaços colapsados antes de validar; caracteres de controle recusados | `normalizeSpaces` e `containsControlChars` nos DTOs |
| V7 | Campos calculados ou de outro endpoint são ignorados sem erro | Schemas Zod `z.object` (campos desconhecidos são descartados) |
| V8 | Id de URL inválido conta como inexistente (404) | `ParseIdPipe` |

### Transições de condição física

| Condição atual | Nova condição | Resultado |
|----------------|---------------|-----------|
| Qualquer | A mesma | `200`, sem gravar (retorno antecipado em `UpdatePlayerConditionUseCase`) |
| `APTO` | `MAL_CONDICIONADO` ou `DOENTE` | `200` |
| `MAL_CONDICIONADO` | `APTO` ou `DOENTE` | `200` |
| `DOENTE` | `MAL_CONDICIONADO` | `200` |
| `DOENTE` | `APTO` | `409` |
| Qualquer | `DOENTE` | Além de gravar, remove o jogador de `escalacoes` |

### Validações extras do cadastro (`createPlayerSchema`)

| Regra | Mensagem (400) |
|-------|----------------|
| Idade ≥ 35 e agilidade > 85 | `Jogador com 35 anos ou mais pode ter agilidade de no máximo 85` |
| Soma dos seis atributos > 480 | `A soma dos seis atributos não pode passar de 480` |
| Potencial < maior atributo | `Potencial não pode ser menor que o maior atributo técnico` |
| Idade ≥ 33 e potencial ≠ maior atributo | `No cadastro com 33 anos ou mais, o potencial deve ser igual ao maior dos seis atributos` |

---

## Schema de Banco de Dados

O model `Jogador` é mapeado para a tabela `jogadores` (`@@map("jogadores")`). Colunas e tipos estão em [Entidade de Domínio](#entidade-de-domínio).

### Relações

| Relação | Model | Cardinalidade | Uso |
|---------|-------|---------------|-----|
| `clube` | `Clube` (`clubes`) | N:1 opcional via `clube_id` | `null` = jogador livre; preenchido pela compra e limpo pela venda |
| `contratos` | `Contrato` (`contratos`) | 1:N | Histórico de contratos (valor de compra, `fidelidade_ate`, `situacao`) |
| `transacoes` | `Transacao` (`transacoes`) | 1:N | Compras e vendas, com `nome_jogador` gravado no momento |
| `escalacao` | `Escalacao` (`escalacoes`) | 1:0..1 (`jogador_id` é `@unique`) | Titularidade; removida quando o jogador passa a `DOENTE` |
| `duelos_como_atacante` / `duelos_como_defensor` | `DueloPartida` (`duelos_partida`) | 1:N | Duelos de partidas, com nome, posição e condição gravados |

### Soft delete (`excluido_em`)

A exclusão é apenas lógica (RN09): `softDelete()` faz `UPDATE jogadores SET excluido_em = now()` e nada é apagado. Toda leitura do repositório filtra `excluido_em: null`, então o jogador excluído:

- não aparece em `GET /players`;
- responde `404` em `GET`, `PUT`, `PATCH` e `DELETE` pelo id;
- continua referenciado em `contratos`, `transacoes` e `duelos_partida`, que guardam os dados do momento (RN09, item 4).

Como só jogador livre pode ser excluído, `clube_id` é sempre `null` em linhas com `excluido_em` preenchido.

---

## Tela (frontend)

Rota `/jogadores` (`PlayersPage`). O cabeçalho tem o botão **Novo jogador**; abaixo ficam os filtros, os chips de filtros ativos, a tabela com abas e a paginação. Um texto de rodapé lembra que overall e valor de mercado são calculados a cada consulta.

### Estado na URL

Lido por `parsePlayersParams()` (valores inválidos são ignorados) e escrito por `toSearchParams()` (só o que difere do padrão). Qualquer mudança de filtro volta para a página 1.

| Query param da tela | Campo de estado | Vira na API |
|---------------------|-----------------|-------------|
| `search` | `search` | `search`, só com 2 caracteres ou mais (debounce de 300 ms) |
| `position` | `position` | `position` |
| `condition` | `condition` | `condition` |
| `club` | `clubId` | `club_id` (ignorado na aba Livres) |
| `min_age` / `max_age` | `minAge` / `maxAge` | `min_age` / `max_age` |
| `min_value` / `max_value` | `minValue` / `maxValue` | `min_value` / `max_value` |
| `tab` (`all`, `free`, `clubs`; padrão `all`) | `tab` | `free` ausente, `true` ou `false` |
| `sort` (padrão `name`) | `sort` | `sort` (um dos 6 critérios) |
| `page` (padrão 1) | `page` | `page`, com `limit = 10` |

As abas mostram contagens obtidas com os mesmos filtros e `limit=1`; a contagem de Livres não é pedida quando há filtro por clube, porque a API recusa `free=true` com `club_id`. Pela mesma razão, o filtro de clube fica desabilitado na aba Livres e a aba Livres fica desabilitada com clube filtrado.

### Diálogos

| Diálogo | Componente | Comportamento |
|---------|-----------|---------------|
| Cadastro | `player-create-dialog` | Formulário com `createPlayerSchema` e prévia dos atributos (`getAttributesPreview`) |
| Criado | `player-created-dialog` | Mostra o jogador criado e leva aos detalhes |
| Detalhes | `player-details-sheet` | Painel lateral com dados, indicadores e atalhos para editar, alterar condição e comprar |
| Edição | `player-edit-dialog` | `buildEditPlayerSchema(currentAge)`; com clube, as outras posições ficam desabilitadas |
| Condição | `player-condition-dialog` | Bloqueia `DOENTE` → `APTO` (`isConditionBlocked`); avisa que o titular sai da escalação ao passar a Doente (`showLineupNotice`, só com clube) |
| Exclusão | `player-delete-dialog` | Confirmação; no menu da linha, **Excluir** só fica habilitado para jogador livre |
| Compra / resultado da compra | `buy-player-dialog`, `purchase-result-dialog` | Ver [Compra](../compra/overview.md) |

Depois de cada ação a lista e a barra lateral são recarregadas, a linha alterada é destacada e um toast confirma (ex.: "Condição alterada", "Jogador excluído"). Se a exclusão esvaziar a página atual, a tela volta uma página.

### Validações espelhando a API (`player-form.validation.ts`)

| Campo | Regra na tela | Regra na API |
|-------|---------------|--------------|
| Nome | Normaliza espaços; 3 a 100 caracteres; sem números; nome e sobrenome | V4, 3 a 100, sem dígitos, 2 palavras |
| Idade | 16 a 45; na edição, não pode diminuir | 16 a 45; `PUT` com idade menor → 409 |
| Agilidade | 1 a 100; até 85 com 35 anos ou mais | Igual |
| Atributos | 1 a 99 cada; soma até 480 | Igual |
| Potencial | 1 a 99; ≥ maior atributo; igual ao maior com 33 anos ou mais | Igual |
| Posição | Uma das 5 | Uma das 5; com clube não muda (409) |

### Estados da tela

| Estado | Comportamento (Figma E01 a E03) |
|--------|---------------------------------|
| Carregando | "Carregando jogadores…" no lugar das abas e 10 linhas-esqueleto com a forma de cada coluna |
| Lista vazia | Sem filtros: "Nenhum jogador cadastrado" com **Novo jogador**. Com filtros: "Nenhum jogador encontrado para “{busca}”" com **Limpar filtros**; os chips de filtros continuam acima |
| Erro | "Não foi possível carregar os jogadores" no lugar do card, com o `message` da API e **Tentar de novo** |

Padrão comum a todas as telas em [Estados das telas](../estados/overview.md).

---

## Como testar

### Testes automatizados

```bash
# Backend: casos de uso de jogadores (src/players/tests/players.usecases.spec.ts)
cd backend && npx vitest run src/players

# Backend: cálculos de domínio (overall, valor base, valor de mercado)
cd backend && npx vitest run src/domain

# Frontend: página, componentes e validações do módulo
cd frontend && npx vitest run src/modules/players
```

### Subir a aplicação

**Com Docker (tudo):**

```bash
docker compose up -d --build
```

- Frontend: `http://localhost:5173/jogadores`
- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/docs`

**Modo desenvolvimento:**

```bash
docker compose up -d db
cd backend && cp .env.example .env && npm install && npm run prisma:deploy && npm run start:dev

# em outro terminal
cd frontend && cp .env.example .env && npm install && npm run dev
```

### Exemplos com `curl`

**Cadastrar jogador (201 + `Location`):**

```bash
curl -i -X POST http://localhost:3000/api/v1/players \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Meia Lua", "position": "MEI", "agility": 85, "age": 25,
    "pace": 70, "shooting": 68, "passing": 82, "dribbling": 79,
    "defending": 55, "physical": 64, "potential": 86
  }'
```

Resposta esperada (README do desafio): `overall` 75, `base_value` 40.00, `market_value` 40.00, `condition` `APTO`, `club_id` `null`.

**Listar com busca, filtro e ordenação:**

```bash
curl 'http://localhost:3000/api/v1/players?search=lua&position=MEI&sort=value_desc&page=1&limit=10'
```

**Listar livres por faixa de idade e valor de mercado, com dois critérios de ordenação:**

```bash
curl 'http://localhost:3000/api/v1/players?free=true&min_age=18&max_age=30&min_value=10&max_value=100.50&sort=position,age_desc'
```

**Combinação contraditória (400):**

```bash
curl -i 'http://localhost:3000/api/v1/players?free=true&club_id=1'
```

**Consultar por id:**

```bash
curl http://localhost:3000/api/v1/players/2
```

**Editar (o `PUT` exige os 4 campos):**

```bash
curl -X PUT http://localhost:3000/api/v1/players/2 \
  -H 'Content-Type: application/json' \
  -d '{ "name": "Meia Lua", "position": "MEI", "agility": 70, "age": 26 }'
```

**Alterar a condição física:**

```bash
curl -X PATCH http://localhost:3000/api/v1/players/2/condition \
  -H 'Content-Type: application/json' \
  -d '{ "condition": "MAL_CONDICIONADO" }'
```

Com agilidade 85 e idade 25, o `market_value` passa de 40.00 para 37.00 (desconto de 15% pela metade).

**Excluir jogador livre (204):**

```bash
curl -i -X DELETE http://localhost:3000/api/v1/players/2
```

Depois disso, `GET /api/v1/players/2` responde `404` e o jogador some da listagem.

---

## Dependências

| Dependência | Uso |
|-------------|-----|
| NestJS (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) | Controller, módulo, injeção de dependência e pipes |
| Prisma (`prisma`, `@prisma/client`, `@prisma/adapter-pg`) | Model `Jogador`, consultas, `$transaction` na troca para `DOENTE` |
| PostgreSQL 16 | Tabela `jogadores` e relacionadas (`docker-compose.yml`, serviço `db`) |
| Zod (backend e frontend) | Schemas do corpo (`createPlayerSchema`, `updatePlayerSchema`, `updateConditionSchema`) e dos formulários |
| `backend/src/domain/` | Cálculos puros em centavos (overall, valor base, valor de mercado) |
| `backend/src/common/` | Pipes (`ZodValidationPipe`, `ParseIdPipe`), erros de domínio, `HttpErrorFilter`, utilitários de texto, `PrismaService` |
| Módulo de clubes | `checkClubExists()` no filtro `club_id` e nomes dos clubes na tela (`clubsService.list`) |
| Módulo de transferências | Compra e venda (`POST /players/{id}/buy` e `/sell`), documentadas em [Compra](../compra/overview.md) e [Venda](../venda/overview.md) |
| React 19, React Router, React Hook Form, Axios, Sonner | Tela, estado na URL (`useSearchParams`), formulários, chamadas HTTP e toasts |
| Vitest (+ Testing Library no frontend) | Testes unitários e de componentes |
