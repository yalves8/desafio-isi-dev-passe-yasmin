# ADR 0002 — Prisma como ORM e ferramenta de migrations

**Status:** aceito

## Alternativas avaliadas
- **TypeORM:** padrão do dia a dia no trabalho, mas migrations geradas exigem mais ajuste manual e os tipos das consultas são mais fracos.
- **Drizzle:** ótimo controle de SQL, porém menos familiar sob prazo.
- **Prisma 7:** schema declarativo, migrations SQL versionadas e legíveis, client tipado, consultas parametrizadas por padrão e `$queryRaw` com template tag para SQL manual.

## Decisão
Prisma 7.10 (estável), com o generator `prisma-client` (client gerado em `src/generated/`, ESM) e o driver adapter `@prisma/adapter-pg`.

## Consequências
- O repository de infraestrutura é o único que conhece o Prisma; os services dependem de uma `abstract class` usada como token de DI.
- Restrições que o schema não expressa (ex.: índice único parcial `users_email_uk ... WHERE active`) ficam no SQL da migration.
