# Noder Enterprise

A scalable monorepo with a Next.js frontend, Node.js API, and MongoDB database.

## Structure

```text
apps/
  api/          Express API, MongoDB models, feature modules
  web/          Next.js App Router frontend
packages/
  shared/       Shared TypeScript types
```

## Prerequisites

- Node.js 20+
- MongoDB running locally or a MongoDB Atlas connection string

## Setup

```bash
npm install
npm run build -w @noder/shared
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run seed
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:4000

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start API and web together |
| `npm run dev:web` | Start Next.js only |
| `npm run dev:api` | Start API only |
| `npm run seed` | Seed MongoDB with sample projects |
| `npm run build` | Build shared package, API, and web |

## API

- `GET /api/projects` — list projects (`?search=` and `?tags=Web Design,UI Design`)
- `GET /api/projects/tags` — list distinct tags
- `GET /health` — health check

## Adding Features

1. Add shared types in `packages/shared/src/types/`
2. Create a module under `apps/api/src/modules/<feature>/`
3. Add UI under `apps/web/src/components/<feature>/`
4. Wire routes in `apps/api/src/server.ts` and pages in `apps/web/src/app/`
