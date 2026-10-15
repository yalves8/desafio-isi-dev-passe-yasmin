# Histórico — Visão Geral da Feature

A feature de Histórico mostra todas as compras e vendas de um clube, com os valores e o nome do jogador **do momento de cada operação** (nada é recalculado), filtros por tipo e por jogador, os totais das transações filtradas (`summary`) e a exportação em CSV com os mesmos filtros (RN17 e RN18). As transações são gravadas pela [Compra](../compra/overview.md) e pela [Venda](../venda/overview.md); o histórico só as lê. No frontend, fica na aba **Histórico** da página do clube (`/clubes/{id}?aba=historico`).

---

## Arquitetura

O histórico fica no módulo `transfers` do backend, o mesmo que grava as transações. As rotas ficam sob `/clubs/{id}`, como no enunciado.

| Camada | Caminho | Responsabilidade |
|--------|---------|------------------|
| Controller | `backend/src/transfers/presentation/controllers/club-transactions.controller.ts` | `GET /clubs/:id/transactions` e `GET /clubs/:id/transactions/export`; id da URL pelo `ParseIdPipe` |
| DTO | `backend/src/transfers/presentation/dtos/transaction-filters.dto.ts` | `parseTransactionFilters`: valida `type` e `player_id` (400) |
| Caso de uso | `backend/src/transfers/application/usecases/find-club-transactions/` | `FindClubTransactionsUseCase`: confere clube e jogador (404), mapeia as transações e soma o `summary` em centavos; `loadClubTransactions` é compartilhado com a exportação |
| Caso de uso | `backend/src/transfers/application/usecases/export-club-transactions/` | `ExportClubTransactionsUseCase`: monta o CSV da RN18 |
| Contrato do repositório | `backend/src/transfers/application/interfaces/repositories/transfer.repository.interface.ts` | `clubExists`, `activePlayerExists`, `findClubTransactions` e os tipos `TransactionRecord` e `TransactionFilter` |
| Repositório Prisma | `backend/src/transfers/infrastructure/repositories/prisma-transfer.repository.ts` | Consulta `transacoes` com os filtros, ordenada por `criado_em` e `id` decrescentes |
| Dinheiro e datas | `backend/src/domain/money.ts`, `backend/src/common/utils/date.ts` | `toCents`, `fromCents`, `formatCents` (vírgula decimal do CSV) e `formatBrasiliaDateTime` |
| Serviço HTTP (frontend) | `frontend/src/api/clubs.service.ts`, `frontend/src/api/types.ts` | `getTransactions` e `exportTransactions`; `TransactionFilters.types` vira `type=COMPRA,VENDA` |
| Aba Histórico | `frontend/src/modules/clubs/components/transactions-history/` | Card com filtros, tabela, totais, estados (vazio, carregando, recusado) e exportação |
| Tabela | `frontend/src/modules/clubs/components/transactions-table/` | Linhas como foram gravadas, com sinal e cor |
| Totais | `frontend/src/modules/clubs/components/transactions-summary/` | Faixa com os 5 totais do `summary` |

---

## Endpoints

### `GET /api/v1/clubs/{id}/transactions`

Resposta `200` com `data` (transações) e `summary` (totais das transações filtradas). Exemplo do desafio (2.3.3), com `type=VENDA`:

```json
{
  "data": [
    {
      "id": 11, "club_id": 1, "player_id": 2, "player_name": "Meia Lua", "type": "VENDA",
      "value": 40.00, "fee": 0.30, "penalty": 4.00, "profit": 3.00, "cash_change": 35.70,
      "created_at": "2026-11-05T16:40:00-03:00"
    }
  ],
  "summary": {
    "total_spent": 0.00, "total_received": 35.70, "total_fees": 0.30,
    "total_penalties": 4.00, "total_profit": 3.00
  }
}
```

| Campo da transação | Na compra | Na venda |
|--------------------|-----------|----------|
| `player_name` | Nome no momento da compra | Nome no momento da venda |
| `value` | Valor de mercado no momento | Valor de mercado no momento |
| `fee` | Taxa de compra (RN13) | Comissão de venda (RN16) |
| `penalty` | `0` | Multa por fidelidade (RN15) |
| `profit` | `null` | Lucro, com sinal (RN16) |
| `cash_change` | −(`value` + `fee`) | `value` − `penalty` − `fee` |

### `GET /api/v1/clubs/{id}/transactions/export`

Resposta `200` com `Content-Type: text/csv; charset=utf-8` e `Content-Disposition: attachment; filename="historico-clube-{id}.csv"`. Os erros continuam em JSON.

```text
data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa
2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70
2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85
```

### Filtros (os mesmos nos dois endpoints)

| Parâmetro | Aceito | Recusado com `400` |
|-----------|--------|--------------------|
| `type` | `COMPRA`, `VENDA` ou `COMPRA,VENDA` (em qualquer ordem) | Vazio, minúsculas (`venda`), espaço (`COMPRA, VENDA`), repetição (`VENDA,VENDA`), vírgula sobrando ou outro valor |
| `player_id` | Inteiro positivo só com dígitos, sem zeros à esquerda, até 2.147.483.647 | Vazio, `0`, negativo, `01`, `1.0`, `1e2`, texto |

Parâmetros fora da tabela são ignorados. Os filtros se combinam, e o `summary` respeita todos.

### Erros

| Status | Quando | `message` |
|--------|--------|-----------|
| 404 | Id da URL inválido (`abc`, `0`, `01`) | `Recurso não encontrado` |
| 400 | Parâmetro vazio | `Parâmetro {nome} não pode ser vazio` |
| 400 | `type` inválido | `type aceita COMPRA e VENDA, separados por vírgula e sem repetição` |
| 400 | `player_id` inválido | `player_id deve ser um inteiro positivo` |
| 404 | Clube inexistente | `Clube não encontrado` |
| 404 | Jogador do filtro inexistente ou excluído (V8, RN09) | `Jogador não encontrado` |

Jogador existente mas sem transações no clube responde `200` com `data` vazio e `summary` zerado.

---

## Regras de Negócio

### RN17 — Histórico de transações

- Toda compra e toda venda gravam uma transação na mesma operação; operação recusada não grava nada (ver [Compra](../compra/overview.md) e [Venda](../venda/overview.md)).
- A transação guarda os **valores e o nome do momento** e nunca é recalculada: o histórico só lê `transacoes`.
- **Ordem:** da mais recente para a mais antiga; no empate de data e hora, id decrescente (`orderBy: [{ criado_em: 'desc' }, { id: 'desc' }]`).
- **Conferência do caixa:** para qualquer clube, 300,00 + soma de `cash_change` = caixa atual.
- **`summary`**, somado em centavos e devolvido com 2 casas:

| Campo | O que soma |
|-------|------------|
| `total_spent` | `value` + `fee` das transações `COMPRA` |
| `total_received` | `cash_change` das transações `VENDA` |
| `total_fees` | `fee` de todas as transações |
| `total_penalties` | `penalty` das transações `VENDA` |
| `total_profit` | `profit` das transações `VENDA`, com sinal |

Sem transações, todos os totais são `0`. Com `type=VENDA`, `total_spent` é `0`.

### RN18 — Exportação CSV

1. Primeira linha: `data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa`.
2. Uma linha por transação, na mesma ordem do histórico.
3. Separador `;`; `data_hora` no formato das respostas (RN01); valores com 2 casas e vírgula decimal, negativo com `-` (`formatCents`); `lucro` vazio quando nulo.
4. Sem transações: só a linha de cabeçalho.
5. Nome com `;` ou aspas vai entre aspas duplas, com cada aspa interna duplicada (`"Zé ""Foguete"" Lima"`).
6. UTF-8 sem BOM; cada linha termina em `\n`, inclusive a última.

---

## Schema de Banco de Dados

O histórico só lê a tabela `transacoes` (`backend/prisma/schema.prisma`), gravada pela compra e pela venda.

| Coluna | Campo da API |
|--------|--------------|
| `id` | `id` |
| `clube_id`, `jogador_id` | `club_id`, `player_id` |
| `nome_jogador` (`VARCHAR(100)`) | `player_name` |
| `tipo` (`VARCHAR(6)`) | `type` |
| `valor`, `taxa`, `multa` (`DECIMAL(6,2)`) | `value`, `fee`, `penalty` |
| `lucro` (`DECIMAL(7,2)`, nulo na compra) | `profit` |
| `variacao_caixa` (`DECIMAL(8,2)`) | `cash_change` |
| `criado_em` (`TIMESTAMPTZ`) | `created_at` |

Os filtros consultam também `clubes` (existência do clube) e `jogadores` (`excluido_em` nulo, para o `player_id`).

---

## Tela (frontend)

A aba **Histórico** da página do clube segue os frames H01 a H05 do Figma, num card único:

| Elemento | Comportamento |
|----------|---------------|
| Cabeçalho | "Histórico de transações", a explicação da ordem e o botão **Exportar CSV** |
| Filtro **Tipo** | Duas caixas, Compra e Venda, marcadas por padrão. Desmarcar uma filtra pela outra (`type=VENDA`); a última marcada não pode ser desmarcada. As duas marcadas equivalem a não filtrar por tipo |
| Filtro **Jogador** | "Jogador: todos" ou o nome escolhido. As opções vêm do histórico completo do clube, então incluem jogadores já vendidos |
| **Limpar filtros** | Aparece com qualquer filtro ativo e volta ao padrão |
| Tabela | Data e hora na mesma linha; tipo com ícone; avatar e nome do momento; valor, taxa ou comissão, multa, lucro (`–` na compra) e variação do caixa. Lucro e variação com sinal (`+3,00`, `−38,85`) em verde ou vermelho |
| Totais | Faixa no rodapé do card com os 5 totais do `summary`: total pago em compras, total recebido em vendas, taxas e comissões, multas e lucro total (com sinal e cor) |
| Nota | "Os totais respeitam os filtros. 300,00 + soma das variações = caixa atual (X)", com o caixa devolvido pela API |

| Frame | Estado | Comportamento |
|-------|--------|---------------|
| H01 | Histórico completo | Tabela, totais e nota |
| H02 | Só vendas e CSV exportado | Filtro por tipo; o CSV usa os mesmos filtros e o aviso "CSV baixado" diz o arquivo e os filtros (ex.: `historico-clube-1.csv, com o filtro de tipo Venda aplicado.`) |
| H03 | Por jogador | Só as transações do jogador, com os totais delas |
| H04 | Vazio | "Nenhuma transação ainda", com os totais zerados; com filtros, "Nenhuma transação com esses filtros" |
| H05 | Filtro recusado | Com filtro ativo e erro da API (ex.: jogador excluído depois de a tela abrir), alerta "O filtro foi recusado" com o `message`, sem tabela, totais nem nota; os filtros continuam na tela. Sem filtro, o erro aparece com "Tentar de novo" |

O contador da aba Histórico mostra o total sem filtros. A tela nunca recalcula valores: tudo vem da API.

---

## Como testar

### Testes automatizados

```bash
# Backend: casos de uso do histórico e do CSV e validação dos filtros
cd backend && npx vitest run src/transfers

# Frontend: aba, tabela, totais e utilitários
cd frontend && npx vitest run src/modules/clubs/components/transactions-history \
  src/modules/clubs/components/transactions-table src/modules/clubs/components/transactions-summary
```

Arquivos principais: `backend/src/transfers/tests/club-transactions.usecases.spec.ts`, `backend/src/transfers/tests/transaction-filters.dto.spec.ts` e os `.test.tsx` das três pastas do frontend.

### Subindo a aplicação

```bash
docker compose up -d --build
```

Ou em modo de desenvolvimento:

```bash
docker compose up -d db
cd backend && npm run start:dev
# em outro terminal
cd frontend && npm run dev
```

O banco começa vazio: crie um clube e um jogador, compre e venda (ver [Compra](../compra/overview.md) e [Venda](../venda/overview.md)) para ter transações. Nos exemplos, o clube é o `1`.

### Exemplos com `curl`

```bash
API=http://localhost:3000/api/v1

# Histórico completo e só as vendas
curl -s $API/clubs/1/transactions
curl -s "$API/clubs/1/transactions?type=VENDA"

# Por jogador e com os dois tipos
curl -s "$API/clubs/1/transactions?type=COMPRA,VENDA&player_id=2"

# CSV (cabeçalhos e corpo)
curl -s -D - "$API/clubs/1/transactions/export?type=VENDA"

# 400: tipo em minúsculas, repetido ou player_id com zero à esquerda
curl -s "$API/clubs/1/transactions?type=venda"
curl -s "$API/clubs/1/transactions?type=VENDA,VENDA"
curl -s "$API/clubs/1/transactions?player_id=01"

# 404: clube ou jogador inexistente
curl -s $API/clubs/999/transactions
curl -s "$API/clubs/1/transactions?player_id=999"
```

### Verificação feita contra o PostgreSQL

Com o banco local, o histórico do Águias FC trouxe as 5 transações na ordem certa (as duas vendas no mesmo segundo por id decrescente) e a conta fechou: 300,00 − 42,00 − 39,90 − 105,00 + 36,00 + 34,20 = 183,30, o caixa atual. O CSV saiu com LF, sem BOM, `text/csv` e o nome `historico-clube-1.csv`. Na tela integrada, os estados H01 a H05 se comportaram como no Figma, inclusive a recusa real da API ao filtrar por um jogador excluído depois de a tela abrir.

---

## Dependências

| Dependência | Uso |
|-------------|-----|
| NestJS (`@nestjs/common`, `@nestjs/platform-express`) | Controller, `ParseIdPipe`, `@Res` para o corpo em texto do CSV |
| Prisma (`@prisma/client`) + PostgreSQL 16 | Consulta de `transacoes`, `clubes` e `jogadores` |
| Módulo `transfers` | Compra e venda, que gravam as transações lidas aqui |
| `domain/money.ts`, `common/utils/date.ts` | Centavos, vírgula decimal do CSV e datas no horário de Brasília |
| React, lucide-react, Radix Select, sonner | Card, ícones, filtro por jogador e aviso "CSV baixado" |
| `@/modules/players` (`PlayerAvatar`) | Avatar do jogador em cada linha |
| Vitest + Testing Library | Testes do backend e do frontend |
