# Documentação do Passe

Documentação por feature, no formato de visão geral de cada contexto: arquitetura, regras de negócio, endpoints, banco de dados, tela e como testar. O README da raiz traz a visão geral do projeto e como rodá-lo.

## Features

| Feature | Documento | Backend | Frontend |
| --- | --- | --- | --- |
| Tela inicial | [home-page/overview.md](home-page/overview.md) | consome endpoints de jogadores e clubes | `frontend/src/pages/home/` |
| Jogadores | [jogadores/overview.md](jogadores/overview.md) | `backend/src/players/` | `frontend/src/modules/players/` |
| Clubes | [clubes/overview.md](clubes/overview.md) | `backend/src/clubs/` | `frontend/src/modules/clubs/` |
| Compra | [compra/overview.md](compra/overview.md) | `backend/src/transfers/` | `frontend/src/modules/players/` (diálogos de compra) |
| Venda | [venda/overview.md](venda/overview.md) | `backend/src/transfers/` | `frontend/src/modules/clubs/` (aba Elenco) |
| Histórico | [historico/overview.md](historico/overview.md) | `backend/src/transfers/` | `frontend/src/modules/clubs/` (aba Histórico) |
| Escalação | [escalacao/overview.md](escalacao/overview.md) | `backend/src/lineups/` | `frontend/src/modules/clubs/` (aba Escalação) |
| Liga (partidas e classificação) | [liga/overview.md](liga/overview.md) | `backend/src/matches/` (motor em `backend/src/domain/match-engine.ts`) | `frontend/src/modules/league/` |
| Estados das telas | [estados/overview.md](estados/overview.md) | — | `frontend/src/components/feedback/states.tsx` e cada tela de lista |

## Decisões de arquitetura (ADRs)

| ADR | Decisão |
| --- | --- |
| [0001](adr/0001-monorepo.md) | Backend e frontend no mesmo repositório |
| [0002](adr/0002-prisma.md) | Prisma como ORM e ferramenta de migrations |
| [0003](adr/0003-datas-como-texto.md) | Data e horário de negócio como texto |
| [0004](adr/0004-ci-e-hooks.md) | CI no GitHub Actions e hooks com Lefthook, commitlint e gitleaks |
