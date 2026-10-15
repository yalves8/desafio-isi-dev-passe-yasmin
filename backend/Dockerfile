# ---- dependências de produção ----
FROM node:22-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json .npmrc prisma.config.ts ./
COPY prisma ./prisma
# - postinstall (prisma generate) precisa do schema; o client gerado aqui é descartado
# - o client só carrega o motor do PostgreSQL: remove os dos outros bancos (~54 MB) e os source maps (~20 MB)
RUN npm ci --omit=dev \
  && rm -rf src/generated \
  && find node_modules/@prisma/client/runtime -regextype posix-extended \
       -regex '.*_bg\.(mysql|sqlite|sqlserver|cockroachdb)\..*' -delete \
  && find node_modules -name '*.map' -delete \
  && npm cache clean --force

# ---- build ----
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:22-slim
ENV NODE_ENV=production TZ=America/Sao_Paulo PRISMA_HIDE_UPDATE_MESSAGE=1
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json prisma.config.ts docker-entrypoint.sh ./
COPY prisma ./prisma
USER node
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
