# Estados das telas — Visão Geral

Toda tela de lista mostra três estados além do conteúdo: **carregando**, **lista vazia** e **erro** (critério F3 do barema e seção "7 · Estados" do Figma, frames E01 a E07). Nenhuma tela fica muda: enquanto a resposta não chega, aparece um esqueleto; sem dados, um convite para a próxima ação; e, numa falha, o que não carregou, o `message` da API e "Tentar de novo".

---

## Arquitetura

| Peça | Caminho | Responsabilidade |
|------|---------|------------------|
| Painel de estado | `frontend/src/components/feedback/states.tsx` | `ErrorState` e `EmptyState` (ícone num quadrado, título, explicação e ação); `bordered` para usar fora de um card |
| Tabela | `frontend/src/components/data-display/data-table/` | `DataTable`: cabeçalho, linhas e os estados de carregando (esqueleto), vazio e erro, usada por todas as tabelas (jogadores, clubes, elenco, escalação, histórico, partidas, duelos e classificação) |
| Aviso | `frontend/src/components/feedback/alert-message/` | `AlertMessage`: recusa da API (`error`, `role="alert"`) ou aviso (`warning`) dentro de diálogos e cards |
| Busca de dados | `frontend/src/hooks/use-fetch.ts` | `useFetch` devolve `data`, `loading`, `error` (o `message` da API ou o aviso de conexão) e `errorStatus` (status HTTP; ausente sem resposta) |
| Mensagem do erro | `frontend/src/api/client.ts` | `getErrorMessage`: o `message` devolvido pela API ou "Não foi possível conectar ao servidor. Verifique sua conexão." |
| Recarregar | `frontend/src/hooks/use-league-data.ts` | `refresh()`: "Tentar de novo" busca de novo a tela e o menu |

### Padrão de cada estado

| Estado | Como aparece |
|--------|--------------|
| Carregando | Esqueleto com a forma do conteúdo (linhas da tabela, cards) e `role="status"` com o rótulo do que carrega; na lista de jogadores, também "Carregando jogadores…" |
| Lista vazia | `EmptyState`: ícone da tela, título ("Nenhum … "), explicação e a ação que resolve (cadastrar, limpar filtros, comprar, jogar) |
| Erro | `ErrorState` com `role="alert"`: ícone de servidor fora do ar, título "Não foi possível carregar …", o `message` da API e o botão "Tentar de novo" |
| Recurso inexistente | `EmptyState` com o caminho de volta, quando a API responde `404` (ex.: clube inexistente) |

Com a lista já carregada, uma nova busca (filtro, página, atualizar) mantém os dados na tela até a resposta chegar (`keepPreviousData`), sem piscar o esqueleto; nas listas de jogadores e de clubes, as linhas ficam esmaecidas enquanto isso.

---

## Estados das 6 telas de lista (E07)

| Tela | Endpoint | Carregando | Lista vazia | Erro |
|------|----------|------------|-------------|------|
| Jogadores | `GET /players` | "Carregando jogadores…" e 10 linhas-esqueleto com a forma de cada coluna (E01) | Sem filtros: "Nenhum jogador cadastrado" com **Novo jogador**. Com filtros: "Nenhum jogador encontrado para “zzz”" (ou "Nenhum jogador encontrado"), com **Limpar filtros** (E02) | "Não foi possível carregar os jogadores" no lugar do card (E03) |
| Clubes | `GET /clubs` | Linhas-esqueleto na tabela | "Nenhum clube cadastrado", com o caixa inicial e **Novo clube** (C09) | "Não foi possível carregar os clubes" |
| Elenco do clube | `GET /clubs/{id}` | Esqueleto do cabeçalho, dos 4 cards e da tabela | "Nenhum jogador no elenco", com as regras de compra e **Ver jogadores livres** | "Não foi possível carregar o clube", com **Tentar de novo** e **Voltar para clubes**; `404`: "Clube não encontrado" (E04) |
| Histórico de transações | `GET /clubs/{id}/transactions` | Esqueleto dentro do card | "Nenhuma transação ainda", com os totais zerados; com filtros, "Nenhuma transação com esses filtros" (H04) | Sem filtros: "Não foi possível carregar o histórico" no lugar do card, avisando que os totais e a exportação ficam indisponíveis (E05). Com filtros: "O filtro foi recusado", mantendo os filtros (H05) |
| Histórico de partidas | `GET /matches` | Esqueleto na tabela e no card da última partida | Liga sem partidas: só "Nenhuma partida jogada", com **Nova partida** (E06). Com filtro por clube: "Nenhuma partida desse clube" | "Não foi possível carregar as partidas" |
| Classificação | `GET /standings` | Esqueleto na tabela | "Nenhum clube cadastrado": a classificação mostra todos os clubes, mesmo os que ainda não jogaram | "Não foi possível carregar a classificação" |

Outras telas com estado próprio: a **partida** (`GET /matches/{id}`) mostra esqueleto, "Não foi possível carregar a partida" e **Voltar para partidas**; a **escalação** (`GET /clubs/{id}/lineup`) mostra esqueleto e "Não foi possível carregar a escalação". O menu lateral mostra "Nenhum clube ainda." e, sem partidas, "Última partida: nenhuma ainda".

---

## Clube não encontrado (E04)

`useFetch` guarda o status da falha (`errorStatus`). Na página do clube, `404` (clube inexistente ou id inválido na URL, que a API trata como inexistente) mostra:

- a trilha "Mercado › Clubes › Clube {id}";
- o painel "Clube não encontrado" — "O endereço pode estar errado ou o clube não existe.";
- o botão **Voltar para clubes**.

Qualquer outra falha mostra o erro com **Tentar de novo** e **Voltar para clubes**.

---

## Como testar

### Testes automatizados

```bash
cd frontend && npx vitest run src/modules/players src/modules/clubs src/modules/league src/components/layout
```

Os estados estão cobertos em `players-table.test.tsx` e `players-page.test.tsx` (carregando, vazio com busca e erro), `club-details-page.test.tsx` (404 e erro genérico), `transactions-history.test.tsx` (vazio, H05 e E05), `matches-page.test.tsx` (E06) e `standings-page.test.tsx` (vazio e erro).

### Na tela

| Estado | Como provocar |
|--------|---------------|
| Carregando | DevTools → Network → "Slow 3G" e recarregar a tela |
| Lista vazia | Banco recém-criado (`docker compose down -v` e subir de novo), um clube recém-criado ou uma busca sem resultado (`/jogadores?search=zzz`) |
| Erro | Parar a API (`docker compose stop api`) com a tela aberta e clicar em atualizar |
| Clube não encontrado | Abrir `/clubes/99` |

### Verificação feita

As telas E01 a E06 foram conferidas no navegador contra o Figma, com a API simulada em cada estado (rede lenta, lista vazia, falha de conexão e `404`).
