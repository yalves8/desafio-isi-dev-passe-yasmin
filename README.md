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
Cada feature tem uma documentação detalhada (arquitetura, regras de negócio, endpoints, banco, tela e como testar) em [`docs/`](docs/README.md): [tela inicial](docs/home-page/overview.md), [jogadores](docs/jogadores/overview.md), [clubes](docs/clubes/overview.md), [compra](docs/compra/overview.md), [venda](docs/venda/overview.md), [histórico](docs/historico/overview.md), [escalação](docs/escalacao/overview.md) e [liga](docs/liga/overview.md); os estados de carregando, vazio e erro de todas as telas estão em [estados](docs/estados/overview.md).

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
- **Compra** de jogador livre (na linha, no menu "…" e no painel de detalhes): escolhe o clube comprador (com o caixa atual) e o fim da fidelidade, sugerido para um ano depois e validado antes de enviar (depois de agora e até 1.095 dias, enviado com `-03:00`). Caixa, elenco cheio e recompra só a API decide: a recusa (`409`) aparece no diálogo, e uma falha de rede oferece "Tentar de novo". Concluída, mostra valor, taxa, custo, fim da fidelidade, contrato e novo caixa como a API devolveu, com atalho para o clube. Sem clube cadastrado, "Comprar" fica desabilitado.

### Clubes (`/clubes` e `/clubes/:id`)
- **Lista** com caixa, valor do elenco e patrimônio, ordenada por nome ou por patrimônio (nos dois sentidos), com a ordenação na URL e o uso do limite da liga ("6 de 20").
- **Novo clube**: valida nome e sigla antes de enviar (3 letras do nome, nessa ordem, começando pela inicial). Nome ou sigla repetidos e o limite de 20 clubes chegam como `409` e aparecem dentro do diálogo. O "+" da sidebar abre o mesmo diálogo (`/clubes?novo=1`).
- **Detalhe do clube**: caixa, valor do elenco, patrimônio e lotação do elenco, como a API calcula. A trilha mostra o nome do clube.
  - **Elenco**: ordem da RN11, com valor de compra, fim da fidelidade, dias restantes e % de multa de cada contrato. **Vender** pede confirmação e mostra o resultado devolvido pela API (multa, lucro, comissão, crédito e novo caixa).
  - **Escalação**: formação (3-1, 2-2, 2-1-1 ou 1-2-1), um titular por vaga (sem jogador `DOENTE`), atributos usados na partida pela RN20, prévia no campo e reservas. Mostra quando a escalação está incompleta e por quê, avisa sobre titulares mal condicionados e exibe a recusa da API (`409`) no próprio card, recarregando o que ficou gravado.
  - **Histórico**: compras e vendas da mais recente para a mais antiga, com o nome e os valores do momento; filtro por tipo (Compra e/ou Venda) e por jogador; totais do `summary` no rodapé; exportação CSV com os mesmos filtros. Filtro recusado pela API (ex.: jogador excluído depois de a tela abrir) aparece no próprio card.
- **Comprar jogadores** e **Ver jogadores livres** levam para a aba "Livres" da tela de jogadores.

### Liga (`/partidas`, `/partidas/:id` e `/classificacao`)
- **Partidas**: última partida da liga e histórico da mais recente para a mais antiga, com filtro por clube (na URL). **Nova partida** escolhe mandante e visitante, valida os dois antes de enviar e mostra a recusa da API no próprio diálogo (ex.: escalação incompleta), marcando o clube citado. O botão fica desabilitado durante o envio: um clique duplo não cria duas partidas.
- **Partida**: placar, formações, os titulares dos dois clubes no campo com os valores usados (já com o efeito da condição) e os 6 duelos agrupados pelos ataques do mandante e do visitante, tudo como a API gravou.
- **Classificação**: tabela na ordem de `GET /standings`, com links para os clubes, últimas partidas e os critérios de desempate.
- O menu mostra o total de partidas e a última partida, e a tela inicial mostra o total e o líder.

### Em toda ação
- Mostra sucesso ou o `message` devolvido pela API.
- O botão fica desabilitado durante o envio, e a mesma ação não é enviada duas vezes.
- As 6 telas de lista (jogadores, clubes, elenco, histórico, partidas e classificação) mostram carregando, vazio e erro no padrão do Figma (seção Estados): o erro diz o que não carregou, traz o `message` da API e oferece "Tentar de novo"; clube inexistente mostra "Clube não encontrado" com o caminho de volta.
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
| GET | `/clubs/:id/lineup` | Escalação atual: formação, `complete` e titulares na ordem do elenco (RN19) |
| PUT | `/clubs/:id/lineup` | Substitui a escalação: `formation` e os 5 `player_ids` (1 GOL e os setores da formação; sem `DOENTE`) |
| POST | `/matches` | Joga a partida na hora entre `home_club_id` e `away_club_id` (os dois com escalação completa) e grava placar, formações e os 6 duelos; `201` com `Location` (RN20) |
| GET | `/matches` | Partidas da mais recente para a mais antiga, sem duelos. Query: `club_id` (mandante ou visitante) (RN21) |
| GET | `/matches/:id` | Partida com os 6 duelos gravados (RN21) |
| GET | `/standings` | Classificação de todos os clubes, calculada a cada consulta (RN21) |
| GET | `/clubs/:id/transactions` | Histórico do clube com `summary`. Query: `type` (`COMPRA`, `VENDA` ou os dois, separados por vírgula) e `player_id` (RN17) |
| GET | `/clubs/:id/transactions/export` | Histórico em CSV (`text/csv`, `;`, vírgula decimal), com os mesmos filtros (RN18) |
| POST | `/players/:id/buy` | Compra jogador livre: desconta o caixa, cria o contrato `ATIVO` e grava a transação `COMPRA` numa única operação (RN12 a RN14) |
| POST | `/players/:id/sell` | Venda pelo clube atual: multa por fidelidade, comissão sobre o lucro, contrato `RESCINDIDO` ou `ENCERRADO`, saída da escalação e transação `VENDA` numa única operação (RN15 e RN16) |

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
│  │  ├─ transfers/           (compra, venda, histórico de transações e CSV)
│  │  ├─ lineups/             (escalação: formação e titulares)
│  │  ├─ matches/             (partidas, duelos e classificação)
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
│  │  ├─ modules/clubs/            (lista, detalhe, elenco, venda, escalação e histórico)
│  │  ├─ modules/league/           (partidas, partida com duelos e classificação)
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
├─ docs/                     (README.md com o índice, uma pasta por feature com overview.md, e adr/)
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
- Compra e venda rodam numa transação que trava o jogador e o clube (`SELECT ... FOR UPDATE`, sempre nessa ordem): pedidos simultâneos são atendidos um de cada vez, então o mesmo jogador não é comprado nem vendido duas vezes, e o caixa e o limite de 12 jogadores não são ultrapassados. A regra fica no caso de uso; o repositório só garante o "tudo ou nada".
- Na venda, o contrato vira `RESCINDIDO` quando há multa a pagar e `ENCERRADO` quando a multa é 0,00 (fidelidade cumprida), como a RN15 descreve.
- A recusa pelo limite de 50% do caixa mostra o limite exato, sem arredondar (caixa 261,15 → limite 130,575), como a RN13 define.

## Funcionalidades não implementadas
Todo o fluxo do desafio está implementado: jogadores → clubes → compra → venda → histórico → escalação → partidas e classificação.

## Uso de inteligência artificial
- **Claude Code:** usado no frontend, nas telas inicial, de jogadores e de clubes (layout a partir do Figma, componentização no padrão FCx e testes). Também foi usado na verificação visual com Playwright e na redação deste README. Todo o código gerado foi revisado e validado com testes, lint e typecheck.
- _(complementar com as demais partes em que a IA ajudou e o que foi alterado manualmente)_
