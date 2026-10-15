# ADR 0004 — CI no GitHub Actions e hooks de Git com Lefthook

**Status:** aceito

## Contexto
A avaliação pede CI verde no último commit, commits descritivos e nenhum segredo versionado.

## Alternativas avaliadas
| Necessidade | Escolha | Alternativas | Motivo |
|---|---|---|---|
| Hooks de Git | **Lefthook** | Husky + lint-staged | Um arquivo (`lefthook.yml`) faz o papel dos dois, roda comandos em paralelo e por subpasta (`root:`), sem workspaces |
| Mensagens | **commitlint** (Conventional Commits) | regex própria no hook | Padrão de mercado, mensagens de erro claras |
| Segredos | **gitleaks** | trufflehog, git-secrets | Binário único, rápido no pre-commit e com allowlist por valor |
| CI | **GitHub Actions** | GitLab CI | O repositório de entrega fica no GitHub |

## Decisão
- `pre-commit`: gitleaks nos arquivos staged, Prettier (corrige e re-adiciona) e oxlint com `--deny-warnings` nos arquivos alterados.
- `commit-msg`: commitlint.
- CI em todo push e PR: gitleaks no histórico inteiro, commitlint, lint/format/typecheck/testes com cobertura mínima de 60% em cada projeto, migrations do backend num Postgres real, build e `docker compose build`.

## Consequências
- O hook é a barreira rápida e local; o CI é a garantia (hooks podem ser pulados com `--no-verify`).
- O `package.json` da raiz existe só para essas ferramentas: backend e frontend continuam independentes (ADR 0001).
- A cobertura unitária do backend mede `domain/`, `application/` e `common/`; o comportamento dos endpoints é conferido pela API em execução.
