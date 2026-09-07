FROM node:20-slim

RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
RUN pnpm install

COPY . .

EXPOSE 3000
CMD ["pnpm", "dev"]