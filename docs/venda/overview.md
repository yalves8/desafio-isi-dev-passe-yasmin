# Venda — Visão Geral da Feature

A feature de Venda permite que um clube venda um jogador do seu elenco pelo valor de mercado do momento. Numa única operação, a API calcula a multa por fidelidade (RN15), o lucro e a comissão progressiva (RN16), credita o caixa do clube, libera o jogador, encerra ou rescinde o contrato, tira o jogador da escalação quando ele é titular (RN19) e grava a transação `VENDA` (RN17). O frontend expõe a venda na aba Elenco da página do clube, com confirmação antes de vender e o resultado devolvido pela API depois.

---

## Arquitetura

A venda fica no módulo `transfers` do backend, junto com a compra, separada do cadastro de jogadores: as duas operações mexem em clube, contrato, escalação e histórico ao mesmo tempo.

| Camada | Caminho | Responsabilidade |
|--------|---------|------------------|
| Controller | `backend/src/transfers/presentation/controllers/transfers.controller.ts` | Rota `POST /players/:id/sell`; valida o id com `ParseIdPipe` e chama o caso de uso. Não lê corpo |
| Caso de uso | `backend/src/transfers/application/usecases/sell-player/` | `SellPlayerUseCase`: regras da venda no método `decide` e montagem da resposta (`SellPlayerInput`, `SellPlayerOutput`) |
| Contrato do repositório | `backend/src/transfers/application/interfaces/repositories/transfer.repository.interface.ts` | `ITransferRepository.sale(playerId, decide)` e os tipos `SaleState` (o que é lido) e `SaleRecord` (o que é gravado) |
| Repositório Prisma | `backend/src/transfers/infrastructure/repositories/prisma-transfer.repository.ts` | `PrismaTransferRepository.sale`: transação interativa, travas `SELECT ... FOR UPDATE`, leitura do estado e gravação |
| Domínio (cálculos) | `backend/src/domain/trade.ts` | `loyaltyPenalty` (RN15) e `saleCommission` (RN16) |
| Domínio (dinheiro) | `backend/src/domain/money.ts` | Centavos inteiros (`Cents`), `roundDiv`, `toCents`, `fromCents` |
| Utilitário de data | `backend/src/common/utils/date.ts` | `remainingDays` (dias restantes arredondados para cima) e `formatBrasiliaDateTime` |
| Erros | `backend/src/common/errors/domain.errors.ts`, `backend/src/common/filters/http-error.filter.ts` | `NotFoundError` → 404, `ConflictError` → 409; resposta no formato `{ "message": "..." }` |
| Módulo | `backend/src/transfers/transfers.module.ts` | Liga `ITransferRepository` a `PrismaTransferRepository` e instancia `SellPlayerUseCase` |
| Testes (backend) | `backend/src/transfers/tests/transfers.usecases.spec.ts` | Exemplo 2.3.2, tabelas da RN15 e da RN16, erros 404 e 409 |
| Serviço HTTP (frontend) | `frontend/src/api/players.service.ts`, `frontend/src/api/types.ts` | `playersService.sell(id)` e o tipo `SaleResult` |
| Tabela do elenco | `frontend/src/modules/clubs/components/squad-table/` | Contrato de cada jogador e botão "Vender" |
| Confirmação | `frontend/src/modules/clubs/components/sell-player-dialog/` | `SellPlayerDialog`: diálogo de confirmação com o contrato atual |
| Resultado | `frontend/src/modules/clubs/components/sale-result-dialog/` | `SaleResultDialog`: multa, lucro, comissão, crédito e novo caixa |
| Página do clube | `frontend/src/modules/clubs/pages/club-details-page/` | Hook `useClubDetailsPage`: chama a venda, abre os diálogos e recarrega os dados |

### Regra no caso de uso, "tudo ou nada" no repositório

A regra de negócio fica inteira em `SellPlayerUseCase.decide(state, now)`. O repositório não decide nada: trava as linhas, lê o estado (`SaleState`: jogador, clube atual e contrato `ATIVO`), entrega esse estado ao `decide` e grava o `SaleRecord` devolvido. Tudo acontece dentro de uma única `prisma.$transaction`: se `decide` lançar um erro (404, 409 ou inconsistência), a transação é desfeita e nada é gravado.

O instante da venda (`now`) é o relógio do servidor no momento da chamada (RN01), passado ao `decide`.

---

## Endpoint

```
POST /api/v1/players/{id}/sell
```

- **Sem corpo.** A venda não recebe parâmetros além do id da URL; um corpo enviado é ignorado.
- O jogador é vendido pelo **clube atual dele**; não há `club_id` na requisição.
- O id passa pelo `ParseIdPipe`: precisa ser inteiro positivo, só com dígitos, sem zeros à esquerda e até 2.147.483.647. Fora disso, conta como inexistente (404).

### Resposta 200

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | inteiro | Id da transação `VENDA` gravada |
| `club_id` | inteiro | Clube que vendeu (clube atual do jogador antes da venda) |
| `player_id` | inteiro | Jogador vendido |
| `player_name` | string | Nome do jogador no momento da venda |
| `type` | `"VENDA"` | Tipo da transação |
| `value` | número (2 casas) | Valor de venda = valor de mercado no momento |
| `fee` | número | Comissão de venda (RN16) |
| `penalty` | número | Multa por fidelidade (RN15) |
| `profit` | número | Lucro = `value` − `purchase_value`; pode ser negativo |
| `cash_change` | número | Crédito no caixa = `value` − `penalty` − `fee` |
| `created_at` | string | Instante da venda, no formato `AAAA-MM-DDTHH:MM:SS-03:00` |
| `purchase_value` | número | Valor de compra gravado no contrato `ATIVO` (sem a taxa) |
| `remaining_days` | inteiro | Dias restantes de fidelidade, arredondados para cima |
| `penalty_rate` | inteiro | Percentual da multa: 0, 5, 10 ou 20 |
| `contract_status` | `"RESCINDIDO"` \| `"ENCERRADO"` | Situação final do contrato |
| `club_cash` | número | Novo caixa do clube |

Exemplo do caso 2.3.2 do desafio (Águias FC vende o Meia Lua em 2026-11-05 às 16:40, contrato com valor de compra 37,00 e fidelidade até 2027-03-02 10:15, caixa antes da venda 261,15):

```json
{
  "id": 11,
  "club_id": 1,
  "player_id": 2,
  "player_name": "Meia Lua",
  "type": "VENDA",
  "value": 40.00,
  "fee": 0.30,
  "penalty": 4.00,
  "profit": 3.00,
  "cash_change": 35.70,
  "created_at": "2026-11-05T16:40:00-03:00",
  "purchase_value": 37.00,
  "remaining_days": 117,
  "penalty_rate": 10,
  "contract_status": "RESCINDIDO",
  "club_cash": 296.85
}
```

### Erros

Todos os erros seguem o formato `{ "message": "..." }` do `HttpErrorFilter`.

| Status | Quando | `message` |
|--------|--------|-----------|
| 404 | Id inválido na URL (`abc`, `0`, `007`, acima de 2.147.483.647) | `Recurso não encontrado` |
| 404 | Jogador inexistente ou excluído logicamente (RN09) | `Jogador não encontrado` |
| 409 | Jogador livre, sem clube (RN16, item 6) | `{nome} está livre: só jogador de um clube pode ser vendido.` |
| 500 | Jogador com clube mas sem contrato `ATIVO` (dado inconsistente; não ocorre pela API, pois toda compra cria o contrato na mesma operação) | `Erro interno do servidor` |

---

## Regras de Negócio

### RN15 — Multa por fidelidade

Implementada em `loyaltyPenalty` (`backend/src/domain/trade.ts`) com `remainingDays` (`backend/src/common/utils/date.ts`).

1. **Dias restantes** = (fim da fidelidade − momento da venda), em dias com fração, **arredondado para cima** (`Math.ceil`). Se o fim já passou ou é o próprio momento, 0. Ex.: 116 dias, 17 horas e 35 minutos → 117.
2. **Percentual** pelos dias restantes: 0 dia → 0%; 1 a 30 → 5%; 31 a 180 → 10%; 181 ou mais → 20%.
3. **Multa** = valor de mercado × percentual, arredondada (meio para longe do zero, em centavos) e **limitada a 10,00**.
4. **Situação do contrato:** com multa maior que 0,00 o contrato passa a `RESCINDIDO`; com multa 0,00 (fidelidade cumprida) passa a `ENCERRADO`.

| Fim da fidelidade, a partir do momento da venda | Dias restantes | Multa |
|------|------|------|
| Já passou | 0 | 0% (contrato ENCERRADO) |
| 10 dias e 2 horas | 11 | 5% |
| Exatamente 30 dias | 30 | 5% |
| 30 dias e 1 minuto | 31 | 10% |
| Exatamente 180 dias | 180 | 10% |
| 180 dias e 1 minuto | 181 | 20% |
| 200 dias | 200 | 20% |

### RN16 — Venda, comissão e crédito

Implementada em `SellPlayerUseCase.decide` e `saleCommission` (`backend/src/domain/trade.ts`).

1. **Valor de compra** = `valor_compra` do contrato `ATIVO` (o valor de mercado pago na compra, sem a taxa).
2. **Lucro** = valor de mercado no momento da venda − valor de compra.
3. **Comissão progressiva**, só quando o lucro é maior que zero (sem lucro, 0,00): 10% sobre a parte do lucro até 10,00 + 20% sobre a parte acima de 10,00, somadas e arredondadas uma única vez no final.
4. **Crédito no caixa** = valor de mercado − multa − comissão.
5. O jogador volta a ficar livre e a transação `VENDA` é gravada na mesma operação.
6. Jogador livre não pode ser vendido (409).

| Lucro | Cálculo da comissão | Comissão |
|------|------|------|
| 3,00 | 10% × 3,00 | 0,30 |
| 3,85 | 10% × 3,85 = 0,385 | 0,39 |
| 10,00 | 10% × 10,00 | 1,00 |
| 10,01 | 10% × 10,00 + 20% × 0,01 = 1,002 | 1,00 |
| 15,00 | 10% × 10,00 + 20% × 5,00 = 1,00 + 1,00 | 2,00 |
| −7,50 | sem lucro | 0,00 |

Exemplos completos (cobertos por teste em `transfers.usecases.spec.ts`):

| Valor de compra | Valor na venda | Multa | Lucro | Comissão | Crédito no caixa |
|------|------|------|------|------|------|
| 37,00 | 40,00 | 10% = 4,00 | 3,00 | 0,30 | 35,70 |
| 50,00 | 42,50 | 20% = 8,50 | −7,50 | 0,00 | 34,00 |
| 26,15 | 30,00 | 5% = 1,50 | 3,85 | 0,39 (0,385 arredondado) | 28,11 |
| 25,00 | 25,00 | 0% (encerrado) | 0,00 | 0,00 | 25,00 |
| 60,00 | 75,00 | 20% = 15,00, limitada a 10,00 | 15,00 | 2,00 | 63,00 |

Todos os valores são calculados em centavos inteiros e devolvidos com 2 casas.

### RN19 — Titular vendido sai da escalação

Se o jogador vendido é titular, a linha dele em `escalacoes` é removida na mesma transação da venda. A formação do clube (`clubes.formacao`) **continua gravada**: a escalação fica incompleta e o clube não joga até escalar de novo. Pelo contrato do desafio, `GET /clubs/{id}/lineup` vai devolver a formação salva, os titulares restantes e `complete: false`; esse endpoint ainda não existe no backend (ver [Clubes › Pendências](../clubes/overview.md#pendências)).

### Efeito na recompra (RN12)

A transação `VENDA` gravada é o que a compra consulta para aplicar a RN12: o clube que vendeu o jogador **não pode comprá-lo de novo** (409, `O {clube} já vendeu o {jogador} e não pode comprá-lo de novo.`). Outros clubes podem comprá-lo normalmente, já que ele fica livre.

---

## Concorrência e Atomicidade

### O que é gravado numa única transação

`PrismaTransferRepository.sale` executa, dentro de uma só `prisma.$transaction`:

1. `clubes.caixa` ← novo caixa (caixa anterior + crédito);
2. `jogadores.clube_id` ← `NULL` (jogador livre);
3. `contratos.situacao` ← `RESCINDIDO` ou `ENCERRADO`, e `contratos.encerrado_em` ← instante da venda;
4. `DELETE` em `escalacoes` da linha do jogador (se ele era titular);
5. `INSERT` em `transacoes` com `tipo = 'VENDA'`, `valor`, `taxa` (comissão), `multa`, `lucro`, `variacao_caixa` (crédito) e `criado_em`.

Se qualquer passo falhar, ou se o `decide` recusar a venda, nada é gravado: não existe venda parcial e operação recusada não grava transação (RN17).

### Ordem das travas

As linhas são travadas com `SELECT ... FOR UPDATE` na mesma ordem da compra, **jogador → clube**:

1. `SELECT id FROM jogadores WHERE id = $1 FOR UPDATE`;
2. lê o jogador e descobre o clube atual dele;
3. se ele tem clube, `SELECT id FROM clubes WHERE id = $2 FOR UPDATE`;
4. lê o clube e o contrato `ATIVO` do jogador com esse clube.

Como compra e venda travam sempre na mesma ordem, operações simultâneas sobre o mesmo jogador ou o mesmo clube são atendidas uma depois da outra, sem deadlock, e cada uma lê o estado já atualizado pela anterior.

### Resultado verificado

Verificação manual contra o PostgreSQL:

- 10 vendas simultâneas do mesmo jogador → **1 aceita (200)** e **9 recusadas (409)**: depois da primeira, o jogador já está livre.
- Venda de titular removeu a linha de `escalacoes` e manteve `clubes.formacao`.
- O contrato ficou `RESCINDIDO` com `encerrado_em` preenchido.
- Recompra pelo mesmo clube recusada (409); compra por outro clube aceita.

---

## Schema de Banco de Dados

Tabelas tocadas pela venda (`backend/prisma/schema.prisma`):

### `jogadores`

| Coluna | Leitura/Escrita | Uso |
|--------|-----------------|-----|
| `id` | trava (`FOR UPDATE`) | Jogador da URL |
| `excluido_em` | leitura | Excluído conta como inexistente (404) |
| `clube_id` | leitura e escrita | Clube atual; vira `NULL` na venda |
| atributos, `idade`, `agilidade`, `condicao`, `valor_base` | leitura | Cálculo do valor de mercado |

### `clubes`

| Coluna | Leitura/Escrita | Uso |
|--------|-----------------|-----|
| `id` | trava (`FOR UPDATE`) | Clube atual do jogador |
| `caixa` (`DECIMAL(10,2)`) | leitura e escrita | Recebe o crédito da venda |
| `formacao` | não alterada | Mantida mesmo quando o titular sai (RN19) |

### `contratos`

| Coluna | Leitura/Escrita | Uso |
|--------|-----------------|-----|
| `situacao` | leitura e escrita | Busca o `ATIVO`; grava `RESCINDIDO` ou `ENCERRADO` |
| `valor_compra` (`DECIMAL(6,2)`) | leitura | Base do lucro (RN16) |
| `fidelidade_ate` | leitura | Base dos dias restantes (RN15) |
| `encerrado_em` | escrita | Instante da venda |

### `escalacoes`

| Coluna | Leitura/Escrita | Uso |
|--------|-----------------|-----|
| `jogador_id` (único) | exclusão | A linha do jogador vendido é removida |

### `transacoes`

| Coluna | Valor gravado na venda |
|--------|------------------------|
| `clube_id`, `jogador_id` | Clube vendedor e jogador |
| `nome_jogador` | Nome do jogador no momento da venda |
| `tipo` | `VENDA` |
| `valor` (`DECIMAL(6,2)`) | Valor de mercado no momento |
| `taxa` (`DECIMAL(6,2)`) | Comissão (RN16) |
| `multa` (`DECIMAL(6,2)`) | Multa por fidelidade (RN15) |
| `lucro` (`DECIMAL(7,2)`) | Lucro, positivo ou negativo |
| `variacao_caixa` (`DECIMAL(8,2)`) | Crédito no caixa |
| `criado_em` | Instante da venda |

---

## Tela (frontend)

A venda fica na página de detalhes do clube, aba **Elenco**.

1. **Tabela do elenco** (`SquadTable`): cada jogador mostra posição, overall, condição, valor de mercado, valor de compra, fim da fidelidade, dias restantes e % de multa, calculados pela API "para uma venda agora". Cada linha tem o botão **Vender** (`aria-label` "Vender {nome}").
2. **Confirmação** (`SellPlayerDialog`): diálogo de alerta "Vender {nome}?" com o aviso "O jogador sai do {clube} e fica livre. Se for titular, sai da escalação." e o contrato atual (valor de mercado agora, valor de compra, fim da fidelidade, dias restantes e multa por fidelidade, com teto de 10,00). A tela não calcula multa, comissão nem crédito: esses valores vêm da API no momento da venda. Enquanto a requisição está em andamento, o botão vira "Vendendo…" e fica desabilitado; um segundo clique é ignorado (`useAction`).
3. **Resultado** (`SaleResultDialog`): "Jogador vendido", com "{nome} ficou livre. Contrato rescindido, com multa" ou "encerrado, sem multa", e a lista exatamente como a API devolveu: valor de venda, multa (percentual e dias restantes), lucro (sobre o valor de compra), comissão, crédito no caixa e novo caixa.
4. **Depois da venda:** o hook chama `refresh()`, que recarrega o clube, o elenco, a escalação e a contagem do histórico. O jogador some da lista do elenco e o caixa do cabeçalho é atualizado. Quando o endpoint de escalação existir, a aba Escalação passará a mostrar a escalação incompleta se ele era titular.
5. **Recusa:** em caso de erro (por exemplo 409 porque o jogador já foi vendido em outra aba), aparece um toast "Não foi possível vender" com o `message` da API, e o diálogo de confirmação continua aberto.

---

## Como testar

### Testes automatizados

```bash
cd backend && npx vitest run src/transfers
cd frontend && npx vitest run src/modules/clubs
```

O primeiro cobre o caso 2.3.2, as tabelas da RN15 e da RN16 e os erros 404 e 409 do `SellPlayerUseCase`. O segundo cobre `SquadTable`, `SellPlayerDialog`, `SaleResultDialog` e o fluxo de venda na `ClubDetailsPage`.

### Subindo a aplicação

Com Docker:

```bash
docker compose up -d --build
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api/v1

Ou em modo de desenvolvimento:

```bash
docker compose up -d db
cd backend && cp .env.example .env && npm install && npm run prisma:deploy && npm run start:dev
# em outro terminal
cd frontend && cp .env.example .env && npm install && npm run dev
```

O banco começa vazio: cadastre um clube e um jogador e faça a compra antes de vender. Nos exemplos abaixo, o jogador `2` pertence ao clube `1`.

### Exemplos com `curl`

**Venda com sucesso (200):**

```bash
curl -s -X POST http://localhost:3000/api/v1/players/2/sell
```

**Jogador livre (409)** — repetir a mesma venda:

```bash
curl -s -X POST http://localhost:3000/api/v1/players/2/sell
# {"message":"Meia Lua está livre: só jogador de um clube pode ser vendido."}
```

**Jogador inexistente ou excluído (404):**

```bash
curl -s -X POST http://localhost:3000/api/v1/players/999999/sell
# {"message":"Jogador não encontrado"}
```

**Id inválido na URL (404):**

```bash
curl -s -X POST http://localhost:3000/api/v1/players/abc/sell
# {"message":"Recurso não encontrado"}
```

**Recompra pelo clube que vendeu (409):**

```bash
curl -s -X POST http://localhost:3000/api/v1/players/2/buy \
  -H 'Content-Type: application/json' \
  -d '{"club_id": 1, "loyalty_until": "2027-03-02T10:15-03:00"}'
# {"message":"O Águias FC já vendeu o Meia Lua e não pode comprá-lo de novo."}
```

**Conferir a escalação depois de vender um titular** (enquanto `GET /clubs/{id}/lineup` não existe, direto no banco):

```bash
docker compose exec -T db psql -U postgres -d app \
  -c "select id, formacao from clubes where id = 1;" \
  -c "select * from escalacoes where clube_id = 1;"
# formacao mantida; a linha do jogador vendido não aparece mais em escalacoes
```

### Teste de concorrência

Com o jogador `2` de volta a um clube (comprado por outro clube, por exemplo), dispare 10 vendas ao mesmo tempo:

```bash
for i in $(seq 1 10); do
  curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3000/api/v1/players/2/sell &
done; wait
```

Resultado esperado: uma linha `200` e nove `409`. No banco, uma única transação `VENDA` nova, um único crédito no caixa e o contrato encerrado uma vez.

---

## Dependências

| Dependência | Uso |
|-------------|-----|
| NestJS (`@nestjs/core`, `@nestjs/common`) | Controller, pipes, injeção do repositório e filtro de erros |
| Prisma (`@prisma/client`, `@prisma/adapter-pg`) | Transação interativa (`$transaction`), `$queryRaw` com `FOR UPDATE` e acesso às tabelas |
| PostgreSQL 16 | Banco relacional com as travas de linha |
| Módulo `players` do backend | `PlayerEntity` e `playerFromRow` (cálculo do valor de mercado e `isFree`) |
| `domain/trade.ts`, `domain/money.ts`, `common/utils/date.ts` | Cálculos da RN15 e RN16 em centavos e datas no horário de Brasília |
| axios | Chamada `POST /players/{id}/sell` no frontend |
| React, radix-ui, lucide-react | Tabela do elenco e diálogos de confirmação e resultado |
| sonner | Toast de erro "Não foi possível vender" |
| Vitest | Testes do backend e do frontend |
