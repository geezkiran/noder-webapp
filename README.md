# Noder Enterprise

A Next.js frontend. The API is the separate [`NoderBackend-Fable`](../NoderBackend-Fable)
repo (Fastify + Postgres + Redis) — run it alongside this repo during development.

`apps/api` (Express + MongoDB) is a retired stub, left on disk but no longer
started by `npm run dev` or built by `npm run build`. Nothing in `apps/web`
calls it anymore.

## Structure

```text
apps/
  web/          Next.js App Router frontend
  api/          Retired Express/Mongo stub (unused, kept for reference)
packages/
  shared/       Shared TypeScript types (currently only used by the retired apps/api)
```

## Prerequisites

- Node.js 20+
- `NoderBackend-Fable` running locally on port 3000 (see its own README)

## Setup

```bash
npm install
npm run build -w @noder/shared
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

- Web: http://localhost:3002
- API: http://localhost:3000 (from the `NoderBackend-Fable` repo — run `npm run dev` there separately)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js web app (port 3002) |
| `npm run dev:web` | Same as `npm run dev` |
| `npm run build` | Build shared package and web |

## Adding Features

1. Add UI under `apps/web/src/components/<feature>/`
2. Add API client functions under `apps/web/src/lib/api/`
3. Wire pages in `apps/web/src/app/`
