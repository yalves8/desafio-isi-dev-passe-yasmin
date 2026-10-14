# Nome do Sistema

Descrição em 2 linhas do que o sistema faz. _(preencher após o enunciado)_

## Pré-requisitos
- Docker e Docker Compose **ou** Node 24 LTS (npm 11) e PostgreSQL 16
- Para contribuir (hooks de Git): [gitleaks](https://github.com/gitleaks/gitleaks#installing)

## Como executar

### Com Docker
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- Health check: http://localhost:3000/health

Migrations e seed rodam automaticamente na subida da API.

### Sem Docker (desenvolvimento)
```bash
docker compose up -d db          # ou um PostgreSQL 16 local
cd backend
cp .env.example .env
npm install
npm run prisma:deploy
npm run db:seed
npm run start:dev

# em outro terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Usuários de teste (seed)
| Perfil | E-mail | Senha |
|---|---|---|
| ADMIN | admin@teste.com | Admin@123 |
| USER | usuario@teste.com | Usuario@123 |

## Variáveis de ambiente (backend)
| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta da API | `3000` |
| `DATABASE_URL` | Conexão PostgreSQL | `postgresql://postgres:postgres@localhost:5433/app?schema=public` |
| `JWT_SECRET` | Segredo do JWT (mín. 32 caracteres) | — |
| `JWT_EXPIRES_IN` | Validade do token | `1d` |
| `CORS_ORIGIN` | Origens permitidas, separadas por vírgula | `http://localhost:5173` |
| `TZ` | Fuso do processo | `America/Sao_Paulo` |

As variáveis são validadas com zod na subida: se faltar alguma obrigatória, a API não sobe e informa qual.

### Frontend
| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL da API (embutida no build) | `http://localhost:3000` |

## Estrutura de pastas
```
/
├─ backend/
│  ├─ prisma/                (schema.prisma, migrations/, seed.ts)
│  ├─ src/
│  │  ├─ common/             (config/, errors/, filters/, guards/, decorators/, pipes/, prisma/, types/, utils/)
│  │  ├─ auth/               (login, cadastro, /me)
│  │  ├─ users/              (gestão de usuários — ADMIN)
│  │  ├─ rooms/              (recurso de exemplo: copiar o padrão)
│  │  │  ├─ application/     (service + repository abstrato)
│  │  │  ├─ infrastructure/  (repository Prisma)
│  │  │  └─ presentation/    (controller + DTOs)
│  │  ├─ health/
│  │  └─ main.ts
│  ├─ test/                  (helpers/builders, helpers/mocks, e2e/)
│  └─ Dockerfile
├─ frontend/
│  ├─ src/
│  │  ├─ api/                (client Axios com interceptor + um service por recurso)
│  │  ├─ components/         (ui/ do shadcn, layout/, feedback/ com estados de carregando/erro/vazio)
│  │  ├─ contexts/           (AuthContext + AuthProvider)
│  │  ├─ hooks/              (useAuth, useFetch, useDebouncedValue, useBrasiliaClock)
│  │  ├─ pages/<página>/     (<página>.tsx só renderiza; <página>.hook.ts tem a lógica)
│  │  ├─ routes/             (router, PrivateRoute com perfil)
│  │  └─ test/               (setup e renderPage)
│  ├─ Dockerfile             (build Vite → nginx)
│  └─ nginx.conf
├─ docs/adr/
├─ .github/workflows/ci.yml
├─ lefthook.yml              (hooks de Git)
├─ commitlint.config.mjs
├─ .gitleaks.toml
├─ package.json              (só ferramentas do repositório: lefthook e commitlint)
└─ docker-compose.yml
```

## Arquitetura
```
[Frontend React] --HTTP/JSON--> [API NestJS] --SQL--> [PostgreSQL]

Controller (presentation) → Service (application) → Repository abstrato
                                                    ↳ PrismaRepository (infrastructure) → banco
```
- **Controller:** só recebe e devolve; validação de entrada via DTO + `ValidationPipe`.
- **Service:** toda a regra de negócio; lança erros de domínio (`ValidationError`, `ConflictError`...), sem depender do Nest HTTP.
- **Repository:** `abstract class` como token de DI; a implementação Prisma fica em `infrastructure/`.
- **HttpErrorFilter:** único lugar que traduz erros para HTTP: `{ "statusCode": 409, "message": ["..."] }`.

## Endpoints principais
| Método | Rota | Acesso |
|---|---|---|
| GET | `/health` | público |
| POST | `/auth/login` | público |
| POST | `/auth/register` | público (cria perfil USER) |
| GET | `/auth/me` | autenticado |
| GET/POST | `/users`, `GET /users/:id`, `PATCH /users/:id/deactivate` | ADMIN |
| GET | `/rooms?name=&minCapacity=&sort=name\|capacity\|createdAt&order=asc\|desc`, `/rooms/:id` | autenticado |
| POST/PATCH | `/rooms`, `/rooms/:id`, `/rooms/:id/deactivate` | ADMIN |

## Testes
```bash
cd backend
npm test            # unitários (services, filtro de erro, guard, datas)
npm run test:cov    # com cobertura (mínimo 60% em application/ e common/)
npm run test:e2e    # e2e — requer banco com migrations e seed

cd frontend
npm test            # login, rotas protegidas, sessão, formulários, listagens e estados
npm run test:cov    # com cobertura (mínimo 60%)
```

## Qualidade: CI e hooks de Git

### Hooks (Lefthook)
Instalados automaticamente por `npm install` na raiz, depois de `git init`/`git clone`:
```bash
npm install        # na raiz do repositório
```
| Hook | O que faz |
|---|---|
| `pre-commit` | gitleaks nos arquivos staged; Prettier corrige a formatação e re-adiciona; oxlint barra warnings (incluindo `console.log` e `debugger`) |
| `commit-msg` | commitlint exige [Conventional Commits](https://www.conventionalcommits.org/pt-br/) |

Exemplos de mensagem válida:
```
feat(bookings): bloqueia reservas sobrepostas na mesma sala
fix(auth): retorna 401 para token expirado
test(bookings): cobre intervalos que apenas encostam
docs: adiciona variáveis de ambiente ao README
```

### CI (GitHub Actions)
Roda em todo push e pull request (`.github/workflows/ci.yml`):

| Job | Etapas |
|---|---|
| Segredos | gitleaks em todo o histórico |
| Commits | commitlint (commits do PR ou último commit do push) |
| Backend | lint, formatação, typecheck, testes unitários com cobertura ≥ 60%, migrations + seed num Postgres 16, testes e2e, build |
| Frontend | lint, formatação, typecheck, testes com cobertura ≥ 60%, build |
| Imagens Docker | `docker compose build` (após backend e frontend passarem) |

Para rodar localmente o mesmo que o CI: `npm run lint`, `npm run test:cov` e `npm run build` em cada projeto.

## Frontend: padrões
- **Estados de tela:** toda listagem mostra carregando (skeleton), erro (com "Tentar novamente"), vazio (com ação) e conteúdo.
- **Erros da API:** `getErrorMessage` lê o `message[]` padronizado. 409 aparece no campo correspondente; demais erros viram toast.
- **Filtros na URL:** recarregar ou compartilhar o link mantém busca e ordenação.
- **Rotas:** `PrivateRoute` redireciona para `/login` sem sessão e para `/` sem o perfil exigido; ações de admin ficam ocultas para usuário comum.
- **Responsivo:** tabelas viram cards abaixo de `md` (testado em 375 px).
- **Horário:** o cabeçalho mostra a hora de Brasília, a mesma referência das regras da API.

## Decisões e premissas
ADRs completos em [`docs/adr/`](docs/adr).
- Backend e frontend no mesmo repositório ([ADR 0001](docs/adr/0001-monorepo.md)).
- CI no GitHub Actions e hooks com Lefthook, commitlint e gitleaks ([ADR 0004](docs/adr/0004-ci-e-hooks.md)).
- Exclusão lógica (`active = false`) em todas as entidades; listagens trazem só ativos; inativo responde 404.
- E-mail único apenas entre usuários ativos (índice parcial).
- Login com mensagem genérica: "E-mail ou senha inválidos".
- Horário de referência: `America/Sao_Paulo`.
- Data e horário de negócio como texto AAAA-MM-DD e HH:MM ([ADR 0003](docs/adr/0003-datas-como-texto.md)).
- Intervalos que apenas encostam não são conflito (`[início, fim)`).

## Implantação e atualização
- Migrations: `npm run prisma:deploy` (no Docker, roda na subida da API).
- Reverter: criar uma nova migration desfazendo a anterior (o Prisma não tem `down`); em desenvolvimento, `npm run prisma:reset`.
- Monitoramento: `GET /health` verifica a API e a conexão com o banco (503 se o banco cair).
- Imagem da API: só dependências de produção. O Prisma CLI fica no runtime porque o container aplica as migrations ao subir (`docker-entrypoint.sh`), e o seed é empacotado com esbuild (`dist/seed.js`).

## Problemas encontrados e soluções adotadas
- _(preencher durante o desenvolvimento)_

## Funcionalidades não implementadas
- _(preencher)_

## Uso de inteligência artificial
- _(ferramenta, em que partes ajudou, o que foi revisado e alterado manualmente)_
