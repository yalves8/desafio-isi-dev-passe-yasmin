# ADR 0003 — Data e horário de negócio como texto (AAAA-MM-DD e HH:MM)

**Status:** aceito (revisar se o enunciado exigir DATE/TIME nativos)

## Contexto
Com `DateTime @db.Date / @db.Time`, o Prisma exige objetos `Date`: `"14:00"` vira `1970-01-01T14:00:00Z`, com risco de fuso.

## Decisão
Guardar data e horário de negócio como `VARCHAR(10)` e `VARCHAR(5)`. Strings nesses formatos comparam na ordem cronológica, então filtros como `startTime < endTime` funcionam direto no banco. Campos de auditoria (`created_at`, `updated_at`) continuam `TIMESTAMPTZ`.

Regras de "agora" usam `America/Sao_Paulo` (`src/common/utils/date.ts`), independentemente do fuso do servidor.

## Consequências
- Validação de formato por regex no DTO e de existência (ex.: `2026-02-30`) no service com `isValidDate`.
- Se o enunciado exigir tipos nativos, usar `$queryRaw` com template tag.
