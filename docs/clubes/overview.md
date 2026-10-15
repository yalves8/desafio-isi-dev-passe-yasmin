# Clubes — Visão Geral da Feature

A feature Clubes cobre o módulo 2 do desafio: cadastro de clubes (nome e sigla), com caixa inicial de 300,00 e limite de 20 clubes na liga, listagem ordenável por nome ou patrimônio e detalhe do clube com o elenco ordenado (RN11) e o contrato de cada jogador. Caixa, valor do elenco e patrimônio vêm calculados pela API. A compra e a venda de jogadores, que alteram o caixa e o elenco, têm documentos próprios: [Compra](../compra/overview.md) e [Venda](../venda/overview.md).

---

## Arquitetura

O backend segue camadas de arquitetura limpa dentro do módulo NestJS `ClubsModule`; o frontend concentra a feature no módulo `clubs`.

| Camada | Caminho | Responsabilidade |
|--------|---------|------------------|
| Módulo (backend) | `backend/src/clubs/clubs.module.ts` | Liga o controller, os casos de uso e o repositório (`IClubRepository` → `PrismaClubRepository`) |
| Domínio (backend) | `backend/src/clubs/domain/entities/club.entity.ts` | `ClubEntity`: caixa, formação, cálculo do valor do elenco e do patrimônio, ordenação do elenco (RN11) |
| Domínio (backend) | `backend/src/clubs/domain/enums/club-sort.enum.ts` | `ClubSortEnum` (`name`, `net_worth_asc`, `net_worth_desc`) e `compareClubsBySortCriteria` (desempate por nome e id) |
| Domínio (backend) | `backend/src/contracts/domain/entities/contract.entity.ts` | `ContractEntity`: vigência do contrato e `calculatePenalty` (dias restantes e % de multa, RN15) |
| Domínio compartilhado (backend) | `backend/src/domain/trade.ts`, `backend/src/common/utils/date.ts` | `loyaltyPenalty` (faixas de 0/5/10/20% e teto de 10,00) e `remainingDays` |
| Aplicação (backend) | `backend/src/clubs/application/usecases/` | `CreateClubUseCase`, `FindClubsUseCase`, `FindClubByIdUseCase` |
| Interface do repositório (backend) | `backend/src/clubs/application/interfaces/repositories/club.repository.interface.ts` | Contrato abstrato `IClubRepository` |
| Infraestrutura (backend) | `backend/src/clubs/infrastructure/repositories/prisma-club.repository.ts` | Persistência via Prisma e mapeamento de `Clube`/`Jogador`/`Contrato` para entidades |
| Apresentação (backend) | `backend/src/clubs/presentation/controllers/clubs.controller.ts` | Rotas `POST /clubs`, `GET /clubs`, `GET /clubs/:id` |
| Apresentação (backend) | `backend/src/clubs/presentation/dtos/` | `createClubSchema` (Zod, V4 e regras de nome/sigla) e `parseQueryClubs` (validação do `sort`) |
| Testes (backend) | `backend/src/clubs/tests/clubs.usecases.spec.ts` | Casos de uso e ordenação do elenco na entidade |
| Cliente HTTP (frontend) | `frontend/src/api/clubs.service.ts`, `frontend/src/api/types.ts` | Chamadas à API e tipos `Club`, `ClubSort`, `Lineup`, `TransactionsResponse` |
| Páginas (frontend) | `frontend/src/modules/clubs/pages/clubs-page/`, `frontend/src/modules/clubs/pages/club-details-page/` | Listagem (`/clubes`) e detalhe (`/clubes/:id`), com hooks e utils de URL |
| Componentes (frontend) | `frontend/src/modules/clubs/components/` | Tabelas, diálogo de criação, cabeçalho, indicadores, abas, escalação, histórico e venda |
| Validação (frontend) | `frontend/src/modules/clubs/club-form.validation.ts` | Schema Zod do formulário "Novo clube", espelhando a API |
| Constantes (frontend) | `frontend/src/modules/clubs/clubs.constants.ts` | `MAX_CLUBS = 20`, `INITIAL_CASH = 300`, `MAX_SQUAD = 12`, opções de ordenação, abas e formações |
| Rotas (frontend) | `frontend/src/routes/router.tsx` | `/clubes` → `ClubsPage`, `/clubes/:id` → `ClubDetailsPage` |

Os erros de domínio (`ConflictError` → 409, `NotFoundError` → 404) são convertidos em resposta `{ message }` pelo filtro global `backend/src/common/filters/http-error.filter.ts`.

---

## Entidade de Domínio

A entidade central é `ClubEntity`, em `backend/src/clubs/domain/entities/club.entity.ts`.

| Campo da API | Coluna (`clubes`) | Tipo | Regra |
|--------------|-------------------|------|-------|
| `id` | `id` | inteiro, autoincremento | Gerado pelo banco |
| `name` | `nome` | `VARCHAR(60)` | 3 a 60 caracteres após a V4, 2 a 5 palavras, só letras (com ou sem acento), espaços, hífen e ponto |
| — | `nome_normalizado` | `VARCHAR(60)`, `UNIQUE` | Nome após a V4 em minúsculas (`name.toLowerCase()`), com acentos preservados; garante a unicidade no banco (RN10) |
| `acronym` | `sigla` | `CHAR(3)`, `UNIQUE` | 3 letras de A a Z maiúsculas, não todas iguais, a primeira igual à primeira letra do nome, todas aparecendo no nome nessa ordem |
| `cash` | `caixa` | `DECIMAL(10,2)`, padrão `300.00` | Nasce com 300,00; só muda por compra e venda |
| — | `formacao` | `VARCHAR(5)`, nulo | Formação da escalação; `null` na criação (não é exposta pelos endpoints de clube) |
| — | `criado_em` | `TIMESTAMPTZ`, padrão `now()` | Data de criação |

### Valores calculados (nunca gravados)

| Campo da API | Cálculo | Onde |
|--------------|---------|------|
| `squad_value` | Soma dos valores de mercado dos jogadores do clube (não excluídos), em centavos e convertida para 2 casas | `ClubEntity.calculateSquadValue` |
| `net_worth` | `cash` + `squad_value` | `ClubEntity.calculateNetWorth` |
| `players[].contract.remaining_days` | Dias até `fidelidade_ate`, arredondado para cima, mínimo 0 | `remainingDays` em `common/utils/date.ts` |
| `players[].contract.penalty_rate` | 0% (0 dias), 5% (até 30), 10% (até 180), 20% (acima de 180) | `penaltyPercent` / `loyaltyPenalty` em `domain/trade.ts` |

---

## Endpoints

Base URL: `/api/v1`. Implementados em `backend/src/clubs/presentation/controllers/clubs.controller.ts`:

| Método | Rota | Sucesso | Erros | Descrição |
|--------|------|---------|-------|-----------|
| `POST` | `/clubs` | `201` + cabeçalho `Location: /api/v1/clubs/{id}` | `400` (corpo não objeto, nome ou sigla inválidos), `409` (limite de 20, nome ou sigla repetidos) | Cria o clube com `name` e `acronym`; responde `id`, `name`, `acronym`, `cash`, `squad_value` (0) e `net_worth` (300) |
| `GET` | `/clubs` | `200` (array) | `400` (`sort` inválido ou parâmetro vazio) | Lista os clubes, sem elenco, com `cash`, `squad_value` e `net_worth` |
| `GET` | `/clubs/:id` | `200` | `404` (clube inexistente ou id fora do padrão, via `ParseIdPipe`) | Clube com `players` na ordem da RN11, cada jogador com os campos do jogador e `contract` (`purchase_value`, `loyalty_until`, `remaining_days`, `penalty_rate`) |

A escalação (`GET/PUT /clubs/:id/lineup`) e o histórico (`GET /clubs/:id/transactions[/export]`) ficam em módulos próprios: ver [Escalação](../escalacao/overview.md) e [Histórico](../historico/overview.md).

### Ordenação de `GET /clubs`

Validada por `parseQueryClubs` (`backend/src/clubs/presentation/dtos/query-clubs.dto.ts`):

| Valor de `sort` | Ordenação |
|-----------------|-----------|
| ausente ou `name` | Nome em ordem alfabética (padrão) |
| `net_worth_desc` | Patrimônio do maior para o menor |
| `net_worth_asc` | Patrimônio do menor para o maior |
| qualquer outro valor | `400` — "Critério de ordenação inválido para clubes" |
| vazio (`?sort=`) | `400` — "Parâmetro sort não pode ser vazio" |

Em qualquer ordenação, o empate é desfeito pelo nome (`compareNames`: minúsculas, sem acentos, comparação por Unicode) e depois pelo id crescente.

---

## Regras de Negócio

### RN10 — Criação do clube, nome único e sigla

A validação de formato fica no `createClubSchema` (400) e a de conflito no `CreateClubUseCase` (409), nesta ordem:

| Etapa | Verificação | Resposta |
|-------|-------------|----------|
| 1 | Corpo é objeto JSON (`ZodValidationPipe`) | `400` "O corpo da requisição deve ser um objeto JSON" |
| 2 | Nome sem caracteres de controle; espaços nas pontas removidos e repetidos reduzidos (V4) | `400` |
| 3 | Nome com 3 a 60 caracteres, 2 a 5 palavras, só letras, espaços, hífen e ponto | `400` |
| 4 | Sigla com exatamente 3 letras `A-Z` | `400` |
| 5 | Sigla sem as três letras iguais; primeira letra = primeira letra do nome; letras em subsequência do nome (sem acento, sem diferenciar maiúsculas) | `400` |
| 6 | Liga com menos de 20 clubes | `409` "A liga aceita no máximo 20 clubes" |
| 7 | Nome normalizado (V4 + minúsculas, acentos mantidos) ainda não cadastrado | `409` "Clube com este nome já cadastrado" |
| 8 | Sigla ainda não cadastrada | `409` "Clube com esta sigla já cadastrado" |
| 9 | Persiste com `caixa = 300.00` e `formacao = null` | `201` |

Exemplo do enunciado: com "Águias FC" cadastrado, "  águias   fc " é recusado (409) e "Aguias FC" é aceito. A unicidade também é garantida no banco pelos índices `UNIQUE` em `nome_normalizado` e `sigla`.

### RN11 — Elenco e valores do clube

| Regra | Implementação |
|-------|---------------|
| Elenco ordenado por posição **GOL, ZAG, LAT, MEI, ATA**, depois nome, depois id | `ClubEntity.sortSquad` (`comparePositions`, `compareNames`, `id`) |
| Cada jogador mostra o contrato: valor de compra, fim da fidelidade, dias restantes e % de multa se vendido agora | `FindClubByIdUseCase` com o contrato `ATIVO`; `loyalty_until` no formato `AAAA-MM-DDTHH:MM:SS-03:00` (`formatBrasiliaDateTime`); `contract` vem `null` sem contrato ativo |
| Valor do elenco = soma dos valores de mercado | `calculateSquadValue` |
| Patrimônio = caixa + valor do elenco | `calculateNetWorth` |
| Valores, dias restantes e % de multa calculados a cada consulta | Nenhum desses campos existe no schema; são calculados com `now = new Date()` |
| `GET /clubs` ordena por nome ou patrimônio, com desempate por nome e id | `compareClubsBySortCriteria` |

Jogadores com exclusão lógica (`excluido_em` preenchido) não entram no elenco nem nos valores (`where: { excluido_em: null }` no repositório).

---

## Schema de Banco de Dados

Definido em `backend/prisma/schema.prisma`.

### `clubes` — Tabela principal

```prisma
model Clube {
  id               Int       @id @default(autoincrement())
  nome             String    @db.VarChar(60)
  nome_normalizado String    @unique @db.VarChar(60)
  sigla            String    @unique @db.Char(3)
  caixa            Decimal   @default(300.00) @db.Decimal(10, 2)
  formacao         String?   @db.VarChar(5)
  criado_em        DateTime  @default(now()) @db.Timestamptz
}
```

### Relações

| Tabela | Ligação com `clubes` | Uso na feature |
|--------|----------------------|----------------|
| `jogadores` | `clube_id` (nulo = jogador livre) | Forma o elenco e o valor do elenco |
| `contratos` | `clube_id`, `jogador_id`; `situacao` (`ATIVO`, `ENCERRADO` ou `RESCINDIDO`), `valor_compra`, `fidelidade_ate` | Contrato ativo exibido em cada jogador do detalhe |
| `escalacoes` | PK composta (`clube_id`, `jogador_id`), `jogador_id` único | Titulares do clube; a formação fica em `clubes.formacao`. A venda já remove o jogador daqui (`prisma-transfer.repository.ts`) |
| `transacoes` | `clube_id`, `jogador_id`; `tipo`, `valor`, `taxa`, `multa`, `lucro`, `variacao_caixa` | Histórico de compras e vendas, gravado pelo módulo de transferências |
| `partidas`, `duelos_partida` | mandante/visitante e clube atacante | Módulo Liga (fora desta feature) |

---

## Tela (frontend)

### Rotas

| Rota | Página | Comportamento |
|------|--------|---------------|
| `/clubes` | `ClubsPage` | Tabela com clube, sigla, caixa, valor do elenco e patrimônio, na ordem devolvida pela API; ordenação na URL (`?sort=net_worth_desc`, ausente = `name`; valor inválido volta para `name`) |
| `/clubes?novo=1` | `ClubsPage` + `ClubCreateDialog` | Abre o diálogo "Novo clube"; fechar remove o parâmetro. Ao criar: toast, atualização dos dados da liga e navegação para `/clubes/{id}` |
| `/clubes/:id` | `ClubDetailsPage` | Cabeçalho, indicadores e abas; a aba fica em `?aba=` (`escalacao` ou `historico`; ausente ou inválida = elenco), traduzida pela constante `CLUB_TAB_SLUGS` para as abas `squad`, `lineup` e `history` |

O botão "Novo clube" fica desabilitado com explicação quando a lista já tem 20 clubes.

### Componentes (`frontend/src/modules/clubs/components/`)

| Componente | Papel |
|------------|-------|
| `clubs-table`, `clubs-toolbar` | Listagem com estados de carregando, vazio e erro; total, uso do limite e menu de ordenação |
| `club-create-dialog` | Formulário com `createClubSchema` (react-hook-form + Zod) |
| `club-badge` | Escudo simplificado com a sigla |
| `club-header`, `club-stats` | Nome, sigla e lotação do elenco (`MAX_SQUAD = 12`); caixa, valor do elenco e patrimônio |
| `club-tabs` | Abas Elenco, Escalação e Histórico, com contadores de elenco e histórico |
| `squad-table`, `penalty-rate-tag` | Elenco na ordem da RN11 com valor de mercado, valor de compra, fim da fidelidade, dias restantes e % de multa (0% verde, 5%/10% âmbar, 20% vermelho) |
| `sell-player-dialog`, `sale-result-dialog` | Venda a partir do elenco (detalhes em [Venda](../venda/overview.md)) |
| `lineup-editor`, `formation-picker`, `lineup-slots`, `lineup-pitch`, `lineup-reserves` | Aba Escalação (RN19) — ver [Escalação](../escalacao/overview.md) |
| `transactions-history`, `transactions-summary`, `transactions-table` | Aba Histórico, totais e CSV (RN17/RN18) — ver [Histórico](../historico/overview.md) |

### Erros 409 no diálogo

As validações de formato são feitas no formulário antes do envio. Nome repetido, sigla repetida e limite de 20 clubes só a API sabe: o `409` aparece como alerta dentro do diálogo (`toastOnError: false`), e `conflictField` (`club-create-dialog.utils.ts`) marca em vermelho o campo citado na mensagem ("sigla" → `acronym`, "nome" → `name`; o limite de clubes não marca campo).

### Sidebar

`frontend/src/components/layout/app-sidebar.tsx` lista os clubes (`clubsService.list('name')`) com link para `/clubes/{id}`, um "+" que leva a `/clubes?novo=1` e o contador de clubes ao lado do item "Clubes".

### Estados da tela

| Tela | Carregando | Vazio | Erro |
|------|------------|-------|------|
| Lista (`/clubes`) | Linhas-esqueleto | "Nenhum clube cadastrado" com **Novo clube** | "Não foi possível carregar os clubes" com **Tentar de novo** |
| Detalhe (`/clubes/:id`) | Esqueleto do cabeçalho, dos cards e da tabela | Elenco: "Nenhum jogador no elenco" com **Ver jogadores livres** | `404`: "Clube não encontrado", trilha "Clube {id}" e **Voltar para clubes** (E04); outra falha: "Não foi possível carregar o clube" com **Tentar de novo** |

Padrão comum a todas as telas em [Estados das telas](../estados/overview.md).

---


## Como testar

### Testes automatizados

```bash
cd backend && npx vitest run src/clubs
cd frontend && npx vitest run src/modules/clubs
```

### Subindo a aplicação

Tudo em contêineres (API em `http://localhost:3000`, web em `http://localhost:5173`):

```bash
docker compose up -d --build
```

Modo desenvolvimento:

```bash
docker compose up -d db
cd backend && npm run start:dev
cd frontend && npm run dev
```

A documentação Swagger fica em `http://localhost:3000/docs`.

### Exemplos com `curl`

**Criar um clube:**

```bash
curl -i -X POST http://localhost:3000/api/v1/clubs \
  -H 'Content-Type: application/json' \
  -d '{"name": "Águias FC", "acronym": "AFC"}'
```

**Criar um clube com nome repetido (409):**

```bash
curl -i -X POST http://localhost:3000/api/v1/clubs \
  -H 'Content-Type: application/json' \
  -d '{"name": "  águias   fc ", "acronym": "AGF"}'
```

**Criar um clube com sigla inválida (400):**

```bash
curl -i -X POST http://localhost:3000/api/v1/clubs \
  -H 'Content-Type: application/json' \
  -d '{"name": "Águias FC", "acronym": "FCA"}'
```

**Listar clubes pelo nome (padrão):**

```bash
curl -s http://localhost:3000/api/v1/clubs
```

**Listar clubes pelo patrimônio, do maior para o menor:**

```bash
curl -s 'http://localhost:3000/api/v1/clubs?sort=net_worth_desc'
```

**Ordenação inválida (400):**

```bash
curl -i 'http://localhost:3000/api/v1/clubs?sort=cash'
```

**Detalhar um clube com elenco e contratos:**

```bash
curl -s http://localhost:3000/api/v1/clubs/1
```

**Clube inexistente (404):**

```bash
curl -i http://localhost:3000/api/v1/clubs/999
```

---

## Dependências

| Dependência | Uso |
|-------------|-----|
| NestJS (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) | Módulo, controller, pipes e filtro de erros |
| Prisma (`@prisma/client`, `@prisma/adapter-pg`) + PostgreSQL 16 | Persistência de `clubes`, `jogadores`, `contratos`, `escalacoes` e `transacoes` |
| Zod | `createClubSchema` no backend e no formulário do frontend |
| Módulo `players` (`PlayerEntity`) | Valor de mercado, overall e contrato ativo de cada jogador do elenco |
| Módulo `contracts` (`ContractEntity`) e `domain/trade.ts` | Dias restantes e % de multa (RN15) |
| Módulo `transfers` | Compra e venda, que alteram caixa, elenco, contratos e transações |
| React 19, React Router, react-hook-form, axios, sonner | Páginas, rotas `/clubes`, formulário, chamadas HTTP e toasts no frontend |
