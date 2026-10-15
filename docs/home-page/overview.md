# Tela inicial — Visão Geral da Feature

A tela inicial (rota `/`) é a porta de entrada do Passe, o sistema de gestão da "Liga Fictícia 2026". Ela apresenta a marca, a proposta de valor, os números atuais da liga (jogadores, jogadores livres, clubes e partidas) e as seis etapas do fluxo do sistema (Jogadores → Clubes → Compra → Venda → Histórico → Liga). É voltada a quem administra a liga: não há login (o README do desafio define o sistema como "Sem login"), e a única ação da tela é **Iniciar**, que leva à listagem de jogadores (`/jogadores`).

Pelo README do desafio, a tela inicial é um item **opcional** do mockup ("O que o mockup mostra além dessa lista (como a tela inicial, ...) é opcional"), e a fidelidade visual ao mockup não conta ponto.

---

## Arquitetura

A feature existe só no frontend; não há endpoint próprio no backend. Os números vêm de endpoints de listagem já existentes.

| Camada | Caminho | Responsabilidade |
|--------|---------|------------------|
| Rota | `frontend/src/routes/router.tsx` | Registra `path: '/'` com `<HomePage />`, **fora** do `AppLayout` (a tela não tem barra lateral nem cabeçalho) |
| Página | `frontend/src/pages/home/home-page.tsx` | Renderiza marca, selo da liga, título, botão Iniciar, números da liga, cards das 6 etapas e rodapé |
| Hook | `frontend/src/pages/home/home-page.hook.ts` | Busca as estatísticas, controla `loading`, expõe `startNavigation` e escuta a tecla Enter |
| Serviço | `frontend/src/api/league.service.ts` | `leagueService.getStats()`: agrega as três chamadas à API em um `LeagueStats` |
| Serviços base | `frontend/src/api/players.service.ts`, `frontend/src/api/clubs.service.ts` | `playersService.list()` (`GET /players`) e `clubsService.list()` (`GET /clubs`) |
| Cliente HTTP | `frontend/src/api/client.ts` | Instância Axios com base `VITE_API_URL` (padrão `http://localhost:3000`) normalizada para terminar em `/api/v1` |
| Tipos | `frontend/src/api/types.ts` | `LeagueStats`, `PaginatedPlayers`, `Club` |
| Assets | `frontend/public/assets/campo-decoracao.svg`, `frontend/public/assets/logo-passe.svg` | Desenho do campo (1234×702) ao fundo e logo da marca |
| Testes | `frontend/src/pages/home/home-page.test.tsx` | Testes de renderização, navegação e estado sem partidas |
| API (consumida) | `backend/src/players/presentation/controllers/players.controller.ts` | `GET /api/v1/players` paginado, com filtro `free` |
| API (consumida) | `backend/src/clubs/presentation/controllers/clubs.controller.ts` | `GET /api/v1/clubs`, lista de clubes |

---

## Dados exibidos

| Informação | Origem | Regra |
|------------|--------|-------|
| Total de jogadores (`jogadores`) | `GET /players?limit=1` → `meta.total_items` | Usa só o total da paginação; jogadores com exclusão lógica (`excluido_em` preenchido) não entram na contagem |
| Jogadores livres (`livres`) | `GET /players?limit=1&free=true` → `meta.total_items` | `free=true` filtra `clube_id = null` no repositório (`prisma-player.repository.ts`) |
| Clubes (`clubes`) | `GET /clubs` → tamanho do array | `clubsRes.length` |
| Partidas (`partidas`) | Nenhuma (fixo) | `leagueService.getStats()` sempre devolve `totalMatches: 0`; não há módulo de partidas no backend |
| Líder no selo da liga | Nenhuma (fixo) | `leader` é sempre `null`, então o selo mostra "nenhuma partida ainda". O texto `líder: <nome>, <pontos> pontos` só aparece se `leader` vier preenchido (hoje, apenas no mock dos testes) |
| Nome da liga | Texto fixo | "Liga Fictícia 2026" no selo e no rodapé |
| 6 etapas do sistema | Constante `STEPS` em `home-page.tsx` | Número (`01`–`06`), título, descrição e ícone de cada etapa; texto estático |
| "Não precisa de login" | Texto fixo | Último item da linha de números |
| Rodapé | Texto fixo | "Liga Fictícia 2026 · Horário de Brasília (UTC−3)" |

Valores iniciais: o hook começa com todos os contadores em `0` e `leader: null`, e os substitui quando `getStats()` resolve.

---

## Endpoints consumidos

Base: `http://localhost:3000/api/v1` (prefixo global definido em `backend/src/app.setup.ts`). As três chamadas são feitas em paralelo (`Promise.all`) ao montar a tela.

| Método | Rota | Uso na tela |
|--------|------|-------------|
| `GET` | `/players?limit=1` | Lê `meta.total_items` para o total de jogadores (o `data` com 1 item é descartado) |
| `GET` | `/players?limit=1&free=true` | Lê `meta.total_items` para o total de jogadores livres |
| `GET` | `/clubs` | Conta os itens do array para o total de clubes |

### Formato das respostas usado

| Endpoint | Retorno | Campo lido |
|----------|---------|------------|
| `GET /players` | `{ data: Player[], meta: { page, limit, total_items, total_pages } }` | `meta.total_items` |
| `GET /clubs` | `Club[]` (`id`, `name`, `acronym`, `cash`, `squad_value`, `net_worth`, ...) | `length` |

---

## Comportamento da tela

| Situação | Comportamento |
|----------|---------------|
| Clique em **Iniciar** | `startNavigation()` navega para `/jogadores` |
| Tecla **Enter** | Listener em `window` (`keydown`) chama `startNavigation()`; repetições da tecla pressionada (`event.repeat`) são ignoradas. O listener é removido ao desmontar a tela |
| Carregando | O hook expõe `loading`, mas a página não o usa: enquanto a resposta não chega, os contadores aparecem como `0` |
| Erro de rede/API | Cada chamada tem `.catch(() => null)` e o serviço tem `try/catch`; a falha vira `0` no contador correspondente. Não há mensagem de erro nem toast |
| Liga sem partidas/líder | Selo exibe "nenhuma partida ainda" (situação atual, pois `leader` é sempre `null`) |
| Desmontagem durante a requisição | Flag `mounted` evita `setState` depois que a tela sai |

### Acessibilidade

| Elemento | Tratamento |
|----------|------------|
| Desenho do campo | `alt=""`, `aria-hidden="true"` e `pointer-events-none` (decorativo) |
| Logo | `alt=""` (o nome "Passe" aparece em texto ao lado) |
| Separadores dos números e setas entre etapas | `aria-hidden="true"` |
| Etapas | Lista ordenada semântica (`<ol>` / `<li>`) |
| Título | Único `<h1>`: "Gestão da liga, do mercado à classificação" |
| Atalho | Tecla indicada visualmente com `<kbd>Enter</kbd>` |

---

## Layout e fidelidade ao mockup

Os comentários no código referenciam as medidas do Figma (mockup em `desafio-isi-dev-1/docs/mockup-tela-inicial.png`).

| Decisão | Implementação |
|---------|---------------|
| Moldura do campo | Container com `xl:h-[702px] xl:w-[1234px]` (campo 1200×700 + traves = 1234×702, tamanho nativo do SVG); abaixo de `xl`, `w-full max-w-[1234px]` |
| Desenho do campo | `campo-decoracao.svg` em `absolute inset-0`, visível só a partir de `xl` (`hidden xl:block`) |
| Escala em telas grandes | `min-[1800px]:[zoom:1.2]` amplia o conjunto em 20% a partir de 1800 px de largura |
| Centralização | `min-h-dvh`, `flex items-center justify-center`; em `xl` sem padding externo |
| Bloco central | `xl:w-[720px]`, padding 32px/48px, `gap-[22px]`, `rounded-[24px]`, fundo branco que cobre a linha do meio-campo |
| Marca | Logo 56×56 (`size-14`, raio 16px), "Passe" 32px, `tracking-[-0.03em]` |
| Selo da liga | Pílula com borda, ponto verde `#00813A` |
| Título | 28px → `sm:text-4xl` → `xl:text-[40px]` com `xl:whitespace-nowrap` |
| Botão Iniciar | `h-10 w-[200px]`, `rounded-lg`, azul `#155DFC`, ícone `ArrowRight` |
| Cards das etapas | Em `xl`: linha flex de 1192px, cards 172×157 com 32px entre eles (chevron no espaço); abaixo de `xl`: grade de 1, 2 (`sm`) ou 3 (`md`) colunas, sem chevrons |
| Tipografia | `font-heading` e `font-sans` = Geist Variable; números das etapas em `font-mono` (Geist Mono) — `frontend/src/index.css` |

O README do desafio informa que a banca usa o Chrome em janela de 1366 × 768; nessa largura vale o layout `xl` (≥ 1280 px) de 1234×702.

---

## Como testar

### Testes automatizados

```bash
cd frontend && npx vitest run src/pages/home
```

Cobertura de `home-page.test.tsx` (com `leagueService.getStats` mockado):

| Teste | Verifica |
|-------|----------|
| Marca e proposta de valor | "Passe", título, descrição, botão Iniciar e "Não precisa de login" |
| 6 etapas | Jogadores, Clubes, Compra, Venda, Histórico, Liga |
| Clique em Iniciar | Navega para `/jogadores` |
| Tecla Enter | Navega para `/jogadores` |
| Liga sem partidas | Exibe "nenhuma partida ainda" quando `totalMatches: 0` e `leader: null` |

### Subir a aplicação

**Tudo em contêineres:**

```bash
docker compose up -d --build
# Frontend: http://localhost:5173
# API:      http://localhost:3000/api/v1
```

**Modo desenvolvimento:**

```bash
docker compose up -d db
cd backend && npm run start:dev
cd frontend && npm run dev   # http://localhost:5173
```

### Exemplos `curl` dos endpoints consumidos

**Total de jogadores:**

```bash
curl -s "http://localhost:3000/api/v1/players?limit=1"
```

**Total de jogadores livres:**

```bash
curl -s "http://localhost:3000/api/v1/players?limit=1&free=true"
```

**Lista de clubes:**

```bash
curl -s "http://localhost:3000/api/v1/clubs"
```

---

## Dependências

| Dependência | Uso |
|-------------|-----|
| `react` / `react-router` | Componente da página, `useNavigate` para ir a `/jogadores`, rota `/` em `createBrowserRouter` |
| `axios` | Cliente HTTP em `frontend/src/api/client.ts` |
| `lucide-react` | Ícones (`ArrowRight`, `Users`, `UserRound`, `Shield`, `Swords`, `CheckCircle2`, `ShoppingCart`, `HandCoins`, `History`, `Trophy`, `ChevronRight`, `Clock`) |
| `@/components/ui/button` | Botão Iniciar (shadcn, `class-variance-authority`) |
| `tailwindcss` (v4) | Estilos e breakpoints (`sm`, `md`, `xl`, `min-[1800px]`) |
| `@fontsource-variable/geist`, `@fontsource-variable/geist-mono` | Fontes da marca, título e numeração das etapas |
| `vitest`, `@testing-library/react`, `@testing-library/user-event` | Testes da página |
| `frontend/src/test/render.tsx` | `renderPage()`: `MemoryRouter` com rotas stub (`/jogadores` → "tela de jogadores") usadas nos testes de navegação |
