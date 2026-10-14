# Passe — Gestão da Liga

Sistema de gestão de uma liga fictícia de futebol (Liga Fictícia 2026). Permite cadastrar jogadores e clubes e acompanhar o mercado: valor base, overall e valor de mercado são calculados pela API a partir dos atributos, da idade, da agilidade e da condição física de cada jogador.

Projeto do desafio de desenvolvedor fullstack do SENAI (ISI).

## Pré-requisitos
- Docker e Docker Compose **ou** Node 24 LTS (npm 11) e PostgreSQL 16
- Para contribuir (hooks de Git): [gitleaks](https://github.com/gitleaks/gitleaks#installing)

## Como executar

### Com Docker
```bash
docker compose up -d --build
```
- Frontend: http://localhost:5173
- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/docs
- Health check: http://localhost:3000/health

As migrations rodam automaticamente na subida da API. O banco começa vazio (exigência do desafio).

> **VPN corporativa:** clientes como o Cisco AnyConnect podem capturar as rotas `172.16.0.0/12` usadas pelas redes do Docker. Nesse caso, nem o host alcança os containers. Desconecte a VPN, ou rode o frontend fora do Docker (`npm run dev`).

### Sem Docker (desenvolvimento)
```bash
docker compose up -d db          # ou um PostgreSQL 16 local (porta 5433 no compose)
cd backend
cp .env.example .env
npm install
npm run prisma:deploy
npm run start:dev

# em outro terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Variáveis de ambiente

### Backend
| Variável | Descrição | Padrão |
|---|---|---|
| `NODE_ENV` | `development`, `test` ou `production` | `development` |
| `PORT` | Porta da API | `3000` |
| `DATABASE_URL` | Conexão PostgreSQL (obrigatória) | — |
| `CORS_ORIGIN` | Origens permitidas | `http://localhost:5173` |

As variáveis são validadas com zod na subida: se faltar `DATABASE_URL`, a API não sobe e informa o motivo.

### Frontend
| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL da API, embutida no build. O prefixo `/api/v1` é adicionado se faltar | `http://localhost:3000` |

## Funcionalidades

### Tela inicial (`/`)
Apresenta a liga sobre um campo de futebol, com números da liga (jogadores, livres, clubes) e as 6 etapas do sistema. **Iniciar** (ou a tecla Enter) leva à tela de jogadores.

### Jogadores (`/jogadores`)
- **Lista** com 10 jogadores por página: nome, posição, overall, agilidade, idade, condição, valor base, valor de mercado e clube ("Livre" quando não há clube).
- **Busca por nome**, que ignora maiúsculas, minúsculas e acentos.
- **Filtros combináveis**: posição, condição, clube, faixa de idade e faixa de valor de mercado.
- **Abas** Todos / Livres / Em clubes, com contagem. "Livres" e o filtro por clube não se combinam, porque a API recusa; a tela desabilita a combinação e explica o motivo.
- **Ordenação** por nome, valor de mercado (nos dois sentidos), idade (nos dois sentidos) e posição (GOL → ATA).
- **Estado na URL**: filtros, aba, ordenação e página ficam na URL, então recarregar ou compartilhar o link mantém a visão.
- **Cadastro** com os 7 indicadores técnicos. Valida, antes de enviar, as mesmas regras da API, com a mensagem junto ao campo, e mostra uma prévia dos atributos. Ao salvar, exibe o valor base, o valor de mercado e o overall devolvidos pela API.
- **Edição** de nome, posição, idade e agilidade. Jogador com clube não muda de posição, e a idade não pode diminuir.
- **Alteração de condição física**. De Doente não se passa direto para Apto. Se um jogador com clube for marcado como Doente, a tela avisa que, caso seja titular, ele sai da escalação.
- **Detalhes** do jogador num painel lateral: valores, overall, potencial e indicadores técnicos.
- **Exclusão** só de jogador livre, com confirmação. A exclusão é lógica: transações e partidas antigas continuam gravadas.

### Em toda ação
- Mostra sucesso ou o `message` devolvido pela API.
- O botão fica desabilitado durante o envio, e a mesma ação não é enviada duas vezes.
- Toda lista mostra os estados de carregando, vazio e erro (com "Tentar novamente").
- Valores em moedas aparecem com 2 casas e vírgula decimal, e o horário de referência é o de Brasília (UTC−3).
- O layout é responsivo: em telas pequenas, o menu lateral vira uma gaveta.

## Endpoints

Prefixo `/api/v1`, exceto `/health`. A documentação completa está no Swagger (`/docs`).

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Saúde da API e do banco |
| POST | `/players` | Cadastra jogador (nasce livre e `APTO`) |
| GET | `/players` | Lista paginada. Query: `page`, `limit` (1–50), `search`, `position`, `condition`, `free`, `club_id`, `min_age`, `max_age`, `min_value`, `max_value`, `sort` (`name`, `value_asc`, `value_desc`, `age_asc`, `age_desc`, `position`) |
| GET | `/players/:id` | Detalhe do jogador |
| PUT | `/players/:id` | Edita nome, posição, agilidade e idade |
| PATCH | `/players/:id/condition` | Altera a condição física |
| DELETE | `/players/:id` | Exclusão lógica; só para jogador livre (409 se tiver clube) |
| POST | `/clubs` | Cadastra clube (nome e sigla de 3 letras) |
| GET | `/clubs` | Lista clubes. Query: `sort` (`name`, `net_worth_asc`, `net_worth_desc`) |
| GET | `/clubs/:id` | Detalhe do clube com elenco |

Erros seguem um formato único, `{ "message": "..." }`, aplicado pelo filtro global de erros.

## Estrutura de pastas
```
/
├─ backend/
│  ├─ prisma/                 (schema.prisma com 7 tabelas, migrations/, seed.ts)
│  ├─ src/
│  │  ├─ common/              (config/ validada com zod, errors/, filters/, pipes/ zod, prisma/, utils/)
│  │  ├─ domain/              (regras puras: valor de mercado, overall, dinheiro, negociação, motor de partida)
│  │  ├─ players/             (application/, domain/, infrastructure/, presentation/, tests/)
│  │  ├─ clubs/               (mesma divisão de camadas)
│  │  ├─ contracts/           (entidade de contrato)
│  │  ├─ health/
│  │  └─ main.ts
│  └─ Dockerfile
├─ frontend/
│  ├─ public/assets/          (logo e desenho do campo)
│  ├─ src/
│  │  ├─ api/                 (client Axios + um service por recurso + tipos da API)
│  │  ├─ components/
│  │  │  ├─ ui/               (shadcn)
│  │  │  ├─ layout/           (AppLayout, sidebar, PageHeader)
│  │  │  ├─ feedback/         (ActionDialog, DisabledHint, estados de carregando/erro/vazio)
│  │  │  ├─ form/             (FormField, InputWithIcon, NumberField)
│  │  │  └─ data-display/     (Tag, InfoList, StatCard)
│  │  ├─ contexts/            (LeagueData: recarrega lista e sidebar após cada ação)
│  │  ├─ hooks/               (useFetch, useAction, useDebouncedValue, useLeagueData)
│  │  ├─ modules/players/
│  │  │  ├─ components/<componente>/   (.tsx, .types.ts, .test.tsx e, quando há lógica, .hook.ts/.utils.ts)
│  │  │  ├─ pages/players-page/        (.tsx só renderiza; .hook.ts tem a lógica)
│  │  │  ├─ players.constants.ts, players.types.ts, player-form.validation.ts
│  │  │  └─ index.ts                   (API pública do módulo)
│  │  ├─ pages/home/          (tela inicial)
│  │  ├─ routes/
│  │  └─ test/                (setup e renderPage)
│  ├─ Dockerfile              (build Vite → nginx)
│  └─ nginx.conf
├─ docs/adr/
├─ .github/workflows/ci.yml
├─ lefthook.yml               (hooks de Git)
├─ commitlint.config.mjs
├─ .gitleaks.toml
└─ docker-compose.yml
```

## Arquitetura
```
[Frontend React] --HTTP/JSON--> [API NestJS] --SQL--> [PostgreSQL]

Controller (presentation) → Use case (application) → Repositório abstrato
                                                     ↳ Repositório Prisma (infrastructure) → banco
                         ↘ Regras puras em src/domain (sem dependência de framework)
```
- **Controller:** só recebe e devolve. A entrada é validada com schemas zod.
- **Use case:** orquestra a regra de negócio e lança erros de domínio, sem depender do HTTP do Nest.
- **Domínio:** cálculos de valor de mercado, overall e dinheiro (em centavos) com testes próprios.
- **Filtro de erros:** é o único lugar que traduz erros para HTTP.

### Frontend: padrões
Seguem o padrão de frontend da FCx:
- **Página e hook:** a página só desestrutura o seu `*.hook.ts`, que concentra estado, buscas e handlers.
- **Componentes:** cada um tem sua pasta, com tipos e teste próprios. Componentes reaproveitáveis entre telas ficam em `modules/<domínio>/components` ou em `components/`.
- **Modais de confirmação:** só exibem; quem chama a API é o hook da página, via `useAction`. Diálogos com formulário têm hook próprio.
- **Validação:** os formulários replicam os limites da API (`player-form.validation.ts`). A tela não recalcula valores que a API devolve.

## Testes
```bash
cd backend
npm test            # unitários (domínio, use cases, schemas)
npm run test:cov    # com cobertura (mínimo 60%)
npm run test:e2e    # e2e — requer banco com migrations

cd frontend
npm test            # componentes, hooks, validações e telas
npm run test:cov    # com cobertura (mínimo 60%)
```

## Qualidade: CI e hooks de Git

### Hooks (Lefthook)
São instalados por `npm install` na raiz do repositório.

| Hook | O que faz |
|---|---|
| `pre-commit` | gitleaks nos arquivos staged; Prettier corrige a formatação; oxlint barra warnings |
| `commit-msg` | commitlint exige [Conventional Commits](https://www.conventionalcommits.org/pt-br/) |

### CI (GitHub Actions)
Roda em todo push e pull request (`.github/workflows/ci.yml`).

| Job | Etapas |
|---|---|
| Segredos | gitleaks em todo o histórico |
| Commits | commitlint |
| Backend | lint, formatação, typecheck, testes com cobertura ≥ 60%, migrations num Postgres 16, testes e2e, build |
| Frontend | lint, formatação, typecheck, testes com cobertura ≥ 60%, build |
| Imagens Docker | `docker compose build` |

## Decisões e premissas
Os ADRs completos estão em [`docs/adr/`](docs/adr).
- Backend e frontend no mesmo repositório ([ADR 0001](docs/adr/0001-monorepo.md)).
- Prisma como ORM e ferramenta de migrations ([ADR 0002](docs/adr/0002-prisma.md)).
- Data e horário de negócio como texto ([ADR 0003](docs/adr/0003-datas-como-texto.md)).
- CI no GitHub Actions e hooks com Lefthook, commitlint e gitleaks ([ADR 0004](docs/adr/0004-ci-e-hooks.md)).
- Valores em moedas são calculados em centavos e devolvidos com 2 casas.
- Exclusão de jogador é lógica: ele sai das listagens, mas o histórico fica.
- O horário de referência é `America/Sao_Paulo`.

## Funcionalidades não implementadas
- **Compra e venda de jogadores** (contrato de fidelidade, taxa, multa e comissão). O botão "Comprar" aparece desabilitado, à espera da API de compra.
- **Histórico de transações** com totais e exportação CSV.
- **Escalação e partidas**: o card "Última partida" e o contador de partidas mostram um placeholder.
- **Classificação** da liga.
- **Tela de clubes**: `/clubes` ainda é um placeholder; a API de clubes já existe.

## Uso de inteligência artificial
- **Claude Code:** usado no frontend, na tela inicial e na tela de jogadores (layout a partir do Figma, componentização no padrão FCx e testes). Também foi usado na verificação visual com Playwright e na redação deste README. Todo o código gerado foi revisado e validado com testes, lint e typecheck.
- _(complementar com as demais partes em que a IA ajudou e o que foi alterado manualmente)_
