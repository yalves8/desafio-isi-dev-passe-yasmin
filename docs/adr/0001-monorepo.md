# ADR 0001 — Backend e frontend no mesmo repositório (monorepo)

**Status:** aceito

## Contexto
O estudo de caso é avaliado por uma pessoa que clona o projeto, sobe tudo e confere os requisitos. A entrega costuma ser um link de repositório e o hash de um commit.

## Alternativas avaliadas
| Opção | Prós | Contras |
|---|---|---|
| **Monorepo simples** (`backend/` + `frontend/`, cada um com seu `package.json`) | Um clone, um `docker compose up`, um hash de entrega; commits mostram a feature de ponta a ponta; um CI e um README | CI precisa filtrar por pasta |
| Repositórios separados | Deploy e versionamento independentes | Dois links e dois hashes; o compose precisa referenciar o outro repo; README e ADRs duplicados ou espalhados; risco de versões incompatíveis entre API e web na avaliação |
| Monorepo com workspaces (npm/pnpm/Turborepo/Nx) | Dependências compartilhadas, cache de build | Configuração extra sem ganho para dois projetos; dificulta o Dockerfile de cada um |

## Decisão
Monorepo simples, **sem workspaces**: cada projeto é independente (próprio `package.json`, lockfile, Dockerfile e `.env.example`), unidos pelo `docker-compose.yml`, pelo CI e pelo README da raiz.

## Consequências
- O avaliador roda tudo com um comando, a partir de um clone.
- Separar em dois repositórios no futuro é trivial (`git subtree split`), já que nada é compartilhado entre as pastas.
