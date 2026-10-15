# Compra — Visão Geral da Feature

A feature de compra permite que um clube compre um **jogador livre** pelo valor de mercado do momento, mais a taxa de compra, e assine com ele um **contrato de fidelidade**. A operação é exposta por `POST /api/v1/players/{id}/buy` e, numa única transação, desconta o custo do caixa, coloca o jogador no elenco, cria o contrato `ATIVO` e grava a transação `COMPRA` no histórico do clube (RN12 a RN14 do desafio). No frontend, a compra é feita na tela de jogadores (`/jogadores`), por um diálogo que escolhe o clube comprador e o fim da fidelidade.

---

## Arquitetura

A compra fica no módulo `transfers` do backend (junto com a venda), separado do cadastro de jogadores, porque mexe em clube, contrato e histórico ao mesmo tempo. A rota continua sob `/players/{id}`, como no enunciado.

| Camada | Caminho | Responsabilidade |
|--------|---------|------------------|
| Controller | `backend/src/transfers/presentation/controllers/transfers.controller.ts` | Recebe `POST /players/:id/buy`, valida o id com `ParseIdPipe` e o corpo com `ZodValidationPipe`, responde `200` |
| DTO | `backend/src/transfers/presentation/dtos/buy-player.dto.ts` | Schema zod `buyPlayerSchema`: `club_id` inteiro positivo e `loyalty_until` no formato da RN01, já convertido em instante |
| Caso de uso | `backend/src/transfers/application/usecases/buy-player/` | `BuyPlayerUseCase`: valida a janela da fidelidade, chama o repositório e, no método `decide`, aplica as regras RN12 a RN14 sobre o estado travado; monta a resposta |
| Contrato do repositório | `backend/src/transfers/application/interfaces/repositories/transfer.repository.interface.ts` | `ITransferRepository.purchase(playerId, clubId, decide)` e os tipos `PurchaseState` (o que é lido) e `PurchaseRecord` (o que é gravado) |
| Repositório Prisma | `backend/src/transfers/infrastructure/repositories/prisma-transfer.repository.ts` | Transação interativa: trava jogador e clube com `SELECT ... FOR UPDATE`, lê o estado, chama `decide` e grava tudo ou nada |
| Domínio | `backend/src/domain/trade.ts`, `backend/src/domain/money.ts` | `purchaseFee` (taxa de 5%), `isWithinCashLimit` (limite de 50%), dinheiro em centavos (`toCents`, `fromCents`, `formatCents`, `roundDiv`) |
| Datas | `backend/src/common/utils/date.ts` | `parseBrasiliaDateTime` (RN01), `formatBrasiliaDateTime` (formato das respostas) e `addDays` |
| Erros | `backend/src/common/errors/domain.errors.ts`, `backend/src/common/filters/http-error.filter.ts` | `ValidationError` → 400, `NotFoundError` → 404, `ConflictError` → 409, sempre como `{ "message": "..." }` |
| Módulo | `backend/src/transfers/transfers.module.ts` | Liga `ITransferRepository` a `PrismaTransferRepository` e cria o `BuyPlayerUseCase` |
| Service (frontend) | `frontend/src/api/players.service.ts`, `frontend/src/api/types.ts` | `playersService.buy(id, input)`; tipos `BuyPlayerInput` e `PurchaseResult` |
| Validação (frontend) | `frontend/src/modules/players/player-buy.validation.ts` | `buildBuyPlayerSchema`, `defaultLoyaltyUntil` (sugestão de 1 ano), `loyaltyDateRange` (datas do calendário), `toLoyaltyUntil` |
| Diálogo de compra | `frontend/src/modules/players/components/buy-player-dialog/` | Formulário (clube e fim da fidelidade), envio, recusa e falha de rede |
| Resultado | `frontend/src/modules/players/components/purchase-result-dialog/` | "Compra concluída" com os valores devolvidos pela API e o atalho "Ver clube" |
| Botão e menu | `frontend/src/modules/players/components/buy-button/`, `player-row-menu/`, `player-details-sheet/` | Pontos de entrada do "Comprar" (linha da tabela, menu "…" e painel de detalhes) |
| Página | `frontend/src/modules/players/pages/players-page/` | Diálogos `buy` e `bought`, `buyDisabledReason`, `onBought` e `viewClub` |

A regra de negócio fica no caso de uso: o método privado `decide` recebe o `PurchaseState` lido com as linhas travadas e devolve o `PurchaseRecord` ou lança um erro de domínio. O repositório não conhece regra nenhuma; ele só garante que leitura, decisão e gravação aconteçam na mesma transação. Se `decide` lançar, a transação é desfeita e nada é gravado.

---

## Endpoint

### `POST /api/v1/players/{id}/buy`

- `{id}`: jogador da URL. Validado pelo `ParseIdPipe`: só dígitos, sem zero à esquerda e até 2.147.483.647; fora disso, conta como inexistente (`404`).
- Resposta de sucesso: `200 OK` (`@HttpCode(HttpStatus.OK)`).

### Corpo

| Campo | Tipo | Regra |
|-------|------|-------|
| `club_id` | inteiro (número JSON) | Obrigatório; inteiro positivo. Texto (`"1"`), fração (`1.5`), `0` ou negativo → `400`. Clube inexistente → `404` |
| `loyalty_until` | texto | Obrigatório; formato `AAAA-MM-DDTHH:MM-03:00` (RN01). Formato diferente ou data inexistente (ex.: `2027-02-30T10:15-03:00`) → `400`. Precisa ser depois do momento da compra e no máximo 1.095 dias depois dele → senão `400` |

Campos a mais no corpo são ignorados (V7).

```json
{ "club_id": 1, "loyalty_until": "2027-03-02T10:15-03:00" }
```

### Resposta 200

Exemplo do caso 2.3.1 do desafio (valor 37,00; taxa 1,85; custo 38,85, abaixo de 50% de 300,00), no formato montado pelo `BuyPlayerUseCase`:

```json
{
  "id": 10,
  "club_id": 1,
  "player_id": 2,
  "player_name": "Meia Lua",
  "type": "COMPRA",
  "value": 37.00,
  "fee": 1.85,
  "penalty": 0.00,
  "profit": null,
  "cash_change": -38.85,
  "created_at": "2026-11-02T10:15:00-03:00",
  "contract": { "purchase_value": 37.00, "loyalty_until": "2027-03-02T10:15:00-03:00", "status": "ATIVO" },
  "club_cash": 261.15
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | inteiro | Id da transação `COMPRA` gravada |
| `club_id` | inteiro | Clube comprador |
| `player_id` | inteiro | Jogador comprado |
| `player_name` | texto | Nome do jogador no momento da compra |
| `type` | `"COMPRA"` | Tipo da transação |
| `value` | número | Valor de mercado no momento da compra |
| `fee` | número | Taxa de compra (RN13) |
| `penalty` | número | Sempre `0` na compra |
| `profit` | `null` | Sempre `null` na compra |
| `cash_change` | número | Variação do caixa: `-(value + fee)` |
| `created_at` | texto | Instante da compra, `AAAA-MM-DDTHH:MM:SS-03:00` |
| `contract.purchase_value` | número | Valor de compra gravado no contrato (= `value`) |
| `contract.loyalty_until` | texto | Fim da fidelidade, `AAAA-MM-DDTHH:MM:SS-03:00` |
| `contract.status` | `"ATIVO"` | Situação do contrato criado |
| `club_cash` | número | Caixa do clube depois da compra |

Os valores são calculados em centavos e devolvidos como número JSON (`fromCents`).

### Erros

Todo erro tem o corpo `{ "message": "..." }`, sem stack trace, e nada é gravado.

| Status | Quando | Mensagem (exata, do código) |
|--------|--------|-----------------------------|
| 404 | Id da URL inválido (ex.: `abc`, `0`, `01`) | `Recurso não encontrado` |
| 400 | Corpo que não é objeto JSON (ex.: array) | `O corpo da requisição deve ser um objeto JSON` |
| 400 | JSON malformado | `Corpo da requisição inválido` |
| 400 | `club_id` ausente ou não numérico | `club_id é obrigatório e deve ser um inteiro` |
| 400 | `club_id` com parte fracionária | `club_id deve ser um inteiro` |
| 400 | `club_id` `0` ou negativo | `club_id deve ser um inteiro positivo` |
| 400 | `loyalty_until` ausente ou não texto | `loyalty_until é obrigatório` |
| 400 | `loyalty_until` fora do formato da RN01 ou data inexistente | `loyalty_until deve ser uma data e hora existente no formato AAAA-MM-DDTHH:MM-03:00` |
| 400 | Fim da fidelidade igual ou anterior ao momento da compra | `O fim da fidelidade precisa ser depois do momento da compra` |
| 400 | Fim da fidelidade mais de 1.095 dias depois da compra | `O fim da fidelidade pode ser no máximo 1.095 dias depois da compra` |
| 404 | Jogador inexistente ou excluído | `Jogador não encontrado` |
| 404 | `club_id` inexistente | `Clube não encontrado` |
| 409 | Jogador já pertence a um clube | `{nome} não está livre: já pertence a um clube.` |
| 409 | O clube já vendeu esse jogador | `O {clube} já vendeu o {nome} e não pode comprá-lo de novo.` |
| 409 | Elenco com 12 jogadores | `O elenco do {clube} já tem 12 jogadores, o limite da liga.` |
| 409 | Custo acima de 50% do caixa | `O custo da compra ({custo}) passa do limite de 50% do caixa ({metade}).` |

Quando há mais de um problema no corpo, o `ZodValidationPipe` devolve a primeira mensagem (o `club_id` é validado antes de `loyalty_until`).

---

## Regras de Negócio

### RN12 — Compra e contrato

- O jogador precisa estar livre (`player.isFree()`); senão, `409`.
- O preço é sempre o **valor de mercado no momento** (`player.calculateMarketValue()`), nunca o valor base.
- Um clube **não pode comprar um jogador que ele mesmo já vendeu**: o repositório conta as transações `VENDA` do par clube e jogador (`soldBefore`). Outros clubes podem comprá-lo.
- Numa única operação: desconta o custo do caixa, coloca o jogador no elenco, cria o contrato `ATIVO` (valor de compra e fim da fidelidade) e grava a transação `COMPRA`.

### RN13 — Taxa de compra e limite de 50% do caixa

- Taxa = 5% do valor de mercado, arredondada (`roundDiv`, meio para longe do zero), cobrada **somente quando o valor de mercado é maior que 30,00** (`purchaseFee`).
- Custo total = valor de mercado + taxa.
- O custo total não pode passar de 50% do caixa antes da compra (pode ser igual). A comparação é exata, em centavos: `totalCost * 2 <= cash` (`isWithinCashLimit`). Com caixa de 261,15 o limite é 130,575, e um custo de 130,58 é recusado. A mensagem de recusa mostra esse limite exato, sem arredondar (`formatHalf`: 261,15 → `130,575`). Por consequência, o caixa nunca fica negativo.

| Caixa antes | Valor de mercado | Taxa | Custo total | Limite (50% do caixa) | Resultado |
|-------------|------------------|------|-------------|-----------------------|-----------|
| 300,00 | 28,00 | 0,00 | 28,00 | 150,00 | Aceita |
| 300,00 | 30,00 | 0,00 (não é maior que 30,00) | 30,00 | 150,00 | Aceita |
| 300,00 | 30,01 | 1,50 (1,5005 arredondado) | 31,51 | 150,00 | Aceita |
| 100,00 | 47,62 | 2,38 | 50,00 | 50,00 | Aceita (igual ao limite) |
| 100,00 | 48,00 | 2,40 | 50,40 | 50,00 | Recusada (409) |

### RN14 — Limite de elenco

No máximo **12 jogadores** por clube (`MAX_SQUAD = 12`). O tamanho do elenco é contado no banco considerando só jogadores não excluídos (`excluido_em: null`); com 12, a compra é recusada com `409`.

### Janela da fidelidade

`loyalty_until` precisa ser **depois do momento da compra** e **até 1.095 dias depois dele** (`MAX_LOYALTY_DAYS = 1095`; o limite é inclusivo). Vale o relógio do servidor no instante da operação (RN01). O formato é verificado no DTO; a janela, no caso de uso, porque depende do instante da compra.

### Ordem das verificações no código

1. `ParseIdPipe`: id da URL (`404`).
2. `ZodValidationPipe` com `buyPlayerSchema`: corpo objeto, `club_id`, `loyalty_until` no formato da RN01 (`400`).
3. `BuyPlayerUseCase.execute`: fim da fidelidade depois de agora e até 1.095 dias (`400`), **antes** de abrir a transação.
4. Dentro da transação, em `decide`, com jogador e clube travados:
   1. jogador inexistente ou excluído (`404`);
   2. clube inexistente (`404`);
   3. jogador não está livre (`409`);
   4. recompra pelo clube que vendeu o jogador (`409`);
   5. elenco com 12 jogadores (`409`);
   6. custo acima de 50% do caixa (`409`).
5. Gravação (caixa, jogador, contrato, transação) e resposta `200`.

---

## Concorrência e Atomicidade

`PrismaTransferRepository.purchase` roda tudo numa transação interativa do Prisma (`prisma.$transaction(async (tx) => ...)`):

1. `SELECT id FROM jogadores WHERE id = ${playerId} FOR UPDATE`
2. `SELECT id FROM clubes WHERE id = ${clubId} FOR UPDATE`
3. Leitura do estado (`PurchaseState`): jogador não excluído, clube, tamanho do elenco e quantidade de vendas anteriores desse jogador pelo clube.
4. `decide(state)`: as regras do caso de uso. Se lançar, a transação é desfeita.
5. Gravações, todas na mesma transação:
   - `clubes.caixa` = novo caixa;
   - `jogadores.clube_id` = clube comprador;
   - novo registro em `contratos` com `situacao = 'ATIVO'`;
   - novo registro em `transacoes` com `tipo = 'COMPRA'`.

**Ordem das travas:** sempre jogador e depois clube, a mesma ordem usada na venda (que trava o jogador e só então o clube dele). Com uma ordem fixa, duas operações nunca esperam uma pela outra em ciclo, então não há deadlock. As travas fazem com que pedidos simultâneos sobre o mesmo jogador ou o mesmo clube sejam atendidos um de cada vez: cada um lê o estado já atualizado pelo anterior, e o mesmo jogador não é comprado duas vezes, o caixa não fica abaixo do permitido e o limite de 12 jogadores não é ultrapassado.

**Verificação manual:** 10 compras simultâneas do mesmo jogador resultaram em **1 aceita (`200`) e 9 recusadas (`409`)**. A primeira compra trava o jogador; as outras esperam, leem o jogador já com clube e recebem `{nome} não está livre: já pertence a um clube.`

---

## Schema de Banco de Dados

Tabelas definidas em `backend/prisma/schema.prisma` (migration `20261014040630_init_desafio`). A compra lê e grava:

### `clubes`

| Coluna | Tipo | Na compra |
|--------|------|-----------|
| `caixa` | `DECIMAL(10,2)`, padrão `300.00` | Lida (com trava) e atualizada para `caixa - (valor + taxa)` |

### `jogadores`

| Coluna | Tipo | Na compra |
|--------|------|-----------|
| `clube_id` | `INT NULL` | Precisa ser `NULL` (livre); passa a ser o clube comprador |
| `excluido_em` | `TIMESTAMPTZ NULL` | Jogador com valor preenchido conta como inexistente; também fica fora da contagem do elenco |

### `contratos` — registro novo

| Coluna | Valor gravado |
|--------|---------------|
| `jogador_id` | Jogador comprado |
| `clube_id` | Clube comprador |
| `valor_compra` (`DECIMAL(6,2)`) | Valor de mercado no momento |
| `fidelidade_ate` (`TIMESTAMPTZ`) | `loyalty_until` informado |
| `situacao` (`VARCHAR(12)`) | `ATIVO` |
| `iniciado_em` (`TIMESTAMPTZ`) | Instante da compra |
| `encerrado_em` | Fica `NULL` (preenchido na venda) |

### `transacoes` — registro novo

| Coluna | Valor gravado |
|--------|---------------|
| `clube_id`, `jogador_id` | Clube comprador e jogador |
| `nome_jogador` | Nome do jogador no momento |
| `tipo` | `COMPRA` |
| `valor` | Valor de mercado |
| `taxa` | Taxa de compra |
| `multa` | `0.00` |
| `lucro` | `NULL` |
| `variacao_caixa` | `-(valor + taxa)` |
| `criado_em` | Instante da compra |

As quantias são convertidas de centavos para o texto decimal das colunas (`toDecimal`, ex.: `-3885` → `"-38.85"`), sem ponto flutuante.

---

## Tela (frontend)

### Onde aparece "Comprar"

Só para jogador livre (`club_id === null`), em três lugares da tela de jogadores (`/jogadores`):

- na linha da tabela (`players-table.tsx`, com o `BuyButton`);
- no menu "…" da linha (`player-row-menu.tsx`);
- no rodapé do painel de detalhes (`player-details-sheet.tsx`).

Todos abrem o mesmo diálogo (`dialog.open('buy')`). **Sem clube cadastrado**, "Comprar" fica desabilitado com o motivo `Cadastre um clube para comprar.` (`buyDisabledReason` em `players-page.hook.ts`; o `BuyButton` mostra o motivo pelo `DisabledHint`, e o menu, abaixo do item).

### Diálogo "Comprar jogador"

- Resumo do jogador com o **valor de mercado**.
- **Clube comprador**: seleção com `nome (sigla) · caixa X`. Com o clube escolhido, a dica mostra `Caixa atual: X. O custo total (valor + taxa) pode ir até 50% do caixa.`
- **Fim da fidelidade**: data e hora separadas, com a dica `Depois do momento da compra e até 1.095 dias. Horário de Brasília; enviado com o fuso (-03:00).`
  - **Sugestão**: um ano depois de agora, no horário de Brasília (`defaultLoyaltyUntil`); 29/02 vira 28/02 quando o ano seguinte não é bissexto.
  - **Calendário limitado** (`loyaltyDateRange`): `min` é hoje e `max` é o dia em que se completam 1.095 dias, ambos calculados no fuso `America/Sao_Paulo`, não no do navegador. Nos extremos, quem decide é a hora, e a validação avisa.
  - Sugestão e limites são calculados uma vez, ao abrir o diálogo.
- Aviso: `A taxa é de 5% do valor de mercado, só quando ele passa de 30,00. Taxa, custo e novo caixa são calculados ao confirmar.` A tela não calcula taxa, custo nem caixa.
- **Validação antes de enviar** (`buildBuyPlayerSchema`, com o `now` lido no envio): `Escolha o clube comprador.`, `Informe a data.`, `Informe a hora.`, `Data ou hora inválida.` (data inexistente nunca é ajustada), `O fim da fidelidade precisa ser depois de agora.` e `No máximo 1.095 dias depois de agora.` O corpo enviado é `{ club_id: number, loyalty_until: "AAAA-MM-DDTHH:MM-03:00" }`.
- Caixa, elenco cheio e recompra (RN12 a RN14) **só a API decide**.

### Estados (frames do Figma)

| Frame | Estado | Comportamento no código |
|-------|--------|-------------------------|
| M01 | Confirmação | `BuyPlayerDialog` aberto, com o botão `Confirmar compra` |
| M02 | Enviando | `isSubmitting`: botão `Comprando…` com spinner, campos e "Cancelar" desabilitados, o diálogo não fecha (`ActionDialog` com `busy`) e aparece `Enviando a compra. Os botões ficam desabilitados até a resposta.`; o `useAction` não envia a mesma ação duas vezes |
| M03 | Falha de rede | Resposta sem status: alerta `Sem conexão` com `A compra não foi confirmada. Verifique a conexão e tente de novo.`, e o botão vira `Tentar de novo` |
| M04 | Recusada por caixa | `409` da API: alerta `Compra recusada` com o `message` devolvido (ex.: `O custo da compra (...) passa do limite de 50% do caixa (...).`), dentro do diálogo e sem toast (`toastOnError: false`) |
| M05 | Concluída | `onBought`: recarrega a lista e a sidebar, destaca a linha do jogador e abre o `PurchaseResultDialog` |
| M06 | Filtro por clube após a compra | Com a lista recarregada, o jogador deixa a aba "Livres" e passa a aparecer com o clube na linha e no filtro por clube; não há código específico além do `refresh()` do `afterChange` |
| M07 | Elenco cheio | Mesmo fluxo do M04, com a mensagem `O elenco do {clube} já tem 12 jogadores, o limite da liga.` |
| M08 | Recompra | Mesmo fluxo do M04, com a mensagem `O {clube} já vendeu o {nome} e não pode comprá-lo de novo.` |

Qualquer outra recusa da API (`400` ou `404`) também aparece no alerta `Compra recusada` do diálogo.

### Resultado (M05)

O diálogo **"Compra concluída"** (`{jogador} agora é do {clube}.`) mostra os valores exatamente como a API devolveu:

| Item | Origem |
|------|--------|
| Valor | `value` |
| Taxa | `fee`, com `5% do valor, porque passa de 30,00` ou `Sem taxa: o valor não passa de 30,00` |
| Custo total | `-cash_change` (o que saiu do caixa) |
| Fim da fidelidade | `contract.loyalty_until` (data e hora) |
| Contrato | `contract.status` (`ATIVO`) |
| Novo caixa do {clube} | `club_cash` |

O nome do clube vem da lista de clubes da página (a resposta traz só o `club_id`). **Ver clube** fecha o diálogo e navega para `/clubes/{club_id}`; **Fechar** só fecha.

---

## Como testar

### Testes automatizados

```bash
# Backend: caso de uso (2.3.1, RN12 a RN14, janela da fidelidade) e schema do corpo
cd backend && npx vitest run src/transfers

# Frontend: validação, diálogos, botão, menu, painel e página de jogadores
cd frontend && npx vitest run src/modules/players
```

Arquivos principais: `backend/src/transfers/tests/transfers.usecases.spec.ts`, `backend/src/transfers/tests/buy-player.dto.spec.ts`, `frontend/src/modules/players/player-buy.validation.test.ts`, `frontend/src/modules/players/components/buy-player-dialog/buy-player-dialog.test.tsx`, `frontend/src/modules/players/components/purchase-result-dialog/purchase-result-dialog.test.tsx` e `frontend/src/modules/players/pages/players-page/players-page.test.tsx`.

### Subindo a aplicação

Com Docker:

```bash
docker compose up -d --build
```

Ou em modo de desenvolvimento:

```bash
docker compose up -d db
cd backend && cp .env.example .env && npm install && npm run prisma:deploy && npm run start:dev
# em outro terminal
cd frontend && cp .env.example .env && npm install && npm run dev
```

API em `http://localhost:3000/api/v1`, frontend em `http://localhost:5173`. O banco começa vazio.

### Preparação

```bash
API=http://localhost:3000/api/v1

# Clube 1 (caixa inicial 300,00)
curl -s -X POST $API/clubs -H 'Content-Type: application/json' \
  -d '{ "name": "Águias FC", "acronym": "AGU" }'

# Jogador livre (exemplo do desafio)
curl -s -X POST $API/players -H 'Content-Type: application/json' \
  -d '{ "name": "Meia Lua", "position": "MEI", "agility": 85, "age": 25,
        "pace": 70, "shooting": 68, "passing": 82, "dribbling": 79, "defending": 55,
        "physical": 64, "potential": 86 }'
```

Nos exemplos abaixo, `1` é o id do jogador e do clube criados acima. O `loyalty_until` precisa estar entre agora e 1.095 dias depois; ajuste a data se necessário.

### Sucesso (200)

```bash
curl -s -X POST $API/players/1/buy -H 'Content-Type: application/json' \
  -d '{ "club_id": 1, "loyalty_until": "2027-03-02T10:15-03:00" }'
```

### Erros

**404 — id da URL inválido:**

```bash
curl -s -X POST $API/players/abc/buy -H 'Content-Type: application/json' \
  -d '{ "club_id": 1, "loyalty_until": "2027-03-02T10:15-03:00" }'
```

**400 — JSON malformado:**

```bash
curl -s -X POST $API/players/1/buy -H 'Content-Type: application/json' -d '{ "club_id": 1,'
```

**400 — `club_id` ausente, como texto ou não positivo:**

```bash
curl -s -X POST $API/players/1/buy -H 'Content-Type: application/json' \
  -d '{ "loyalty_until": "2027-03-02T10:15-03:00" }'
curl -s -X POST $API/players/1/buy -H 'Content-Type: application/json' \
  -d '{ "club_id": "1", "loyalty_until": "2027-03-02T10:15-03:00" }'
curl -s -X POST $API/players/1/buy -H 'Content-Type: application/json' \
  -d '{ "club_id": 0, "loyalty_until": "2027-03-02T10:15-03:00" }'
```

**400 — `loyalty_until` sem o fuso ou com data inexistente:**

```bash
curl -s -X POST $API/players/1/buy -H 'Content-Type: application/json' \
  -d '{ "club_id": 1, "loyalty_until": "2027-03-02T10:15" }'
curl -s -X POST $API/players/1/buy -H 'Content-Type: application/json' \
  -d '{ "club_id": 1, "loyalty_until": "2027-02-30T10:15-03:00" }'
```

**400 — fim da fidelidade no passado ou além de 1.095 dias:**

```bash
curl -s -X POST $API/players/1/buy -H 'Content-Type: application/json' \
  -d '{ "club_id": 1, "loyalty_until": "2020-01-01T10:00-03:00" }'
curl -s -X POST $API/players/1/buy -H 'Content-Type: application/json' \
  -d '{ "club_id": 1, "loyalty_until": "2035-01-01T10:00-03:00" }'
```

**404 — jogador ou clube inexistente:**

```bash
curl -s -X POST $API/players/999/buy -H 'Content-Type: application/json' \
  -d '{ "club_id": 1, "loyalty_until": "2027-03-02T10:15-03:00" }'
curl -s -X POST $API/players/1/buy -H 'Content-Type: application/json' \
  -d '{ "club_id": 999, "loyalty_until": "2027-03-02T10:15-03:00" }'
```

**409 — jogador que não está livre** (repita a compra de sucesso):

```bash
curl -s -X POST $API/players/1/buy -H 'Content-Type: application/json' \
  -d '{ "club_id": 1, "loyalty_until": "2027-03-02T10:15-03:00" }'
```

**409 — recompra pelo clube que vendeu o jogador** (vende e tenta comprar de novo pelo mesmo clube):

```bash
curl -s -X POST $API/players/1/sell
curl -s -X POST $API/players/1/buy -H 'Content-Type: application/json' \
  -d '{ "club_id": 1, "loyalty_until": "2027-03-02T10:15-03:00" }'
```

**409 — custo acima de 50% do caixa:** compre, com um clube, jogadores até que o custo do próximo passe da metade do caixa restante (ou escolha um jogador cujo valor de mercado mais taxa passe de 150,00 para um clube novo) e repita o comando de compra. A mensagem traz o custo e o limite exato.

**409 — elenco cheio:** com um clube que já tenha 12 jogadores no elenco, tente comprar mais um jogador livre:

```bash
curl -s -X POST $API/players/{id_livre}/buy -H 'Content-Type: application/json' \
  -d '{ "club_id": {id_clube_cheio}, "loyalty_until": "2027-03-02T10:15-03:00" }'
```

### Concorrência (10 compras simultâneas do mesmo jogador)

Com um jogador livre (`ID`) e um clube com caixa suficiente (`CLUB`):

```bash
ID=2; CLUB=1
for i in $(seq 1 10); do
  curl -s -o /dev/null -w '%{http_code}\n' -X POST $API/players/$ID/buy \
    -H 'Content-Type: application/json' \
    -d "{ \"club_id\": $CLUB, \"loyalty_until\": \"2027-03-02T10:15-03:00\" }" &
done | sort | uniq -c
wait
```

Resultado esperado: `1 200` e `9 409`. No banco, deve existir um único contrato `ATIVO` e uma única transação `COMPRA` para o jogador, e o caixa do clube deve ter sido descontado uma única vez.

---

## Dependências

| Dependência | Uso |
|-------------|-----|
| NestJS (`@nestjs/core` ^12) | Controller, pipes, módulo e injeção do repositório e do caso de uso |
| Prisma (`prisma` e `@prisma/client` ^7.10) | Transação interativa (`$transaction`), `$queryRaw` com `FOR UPDATE` e migrations |
| PostgreSQL 16 | Banco; travas de linha (`SELECT ... FOR UPDATE`) e tabelas `clubes`, `jogadores`, `contratos` e `transacoes` |
| zod (^4.6) | Schema do corpo no backend (`buyPlayerSchema`) e do formulário no frontend (`buildBuyPlayerSchema`) |
| React (^19.2), react-hook-form (^7.89) e `@hookform/resolvers` (^5.9) | Diálogo de compra e formulário |
| axios (^1.20) | Chamada `POST /players/{id}/buy` em `playersService.buy` |
| react-router (^8.4) | Navegação do "Ver clube" para `/clubes/{id}` |
| lucide-react, sonner | Ícones dos diálogos e toasts das demais ações (a compra mostra os erros no próprio diálogo) |
| Vitest | Testes do backend e do frontend |
| Módulo `players` | `PlayerEntity` (`isFree`, `getName`, `calculateMarketValue`) e `playerFromRow` (mapper compartilhado) |
