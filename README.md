# Expera monorepo

| Package | Path | Description |
|---------|------|-------------|
| `@expera/web` | `apps/web` | Next.js product (labs, hubs, landing) |
| `@expera/api` | `apps/api` | NestJS API (module metadata, future services) |
| `@expera/shared` | `packages/shared` | Shared types and module catalogue |

## Commands (from repo root)

```bash
npm install
npm run dev          # Next.js on http://127.0.0.1:3100
npm run dev:api      # Nest API on http://127.0.0.1:4000
npm run typecheck
```

## Module API

- `GET http://127.0.0.1:4000/api/v1/health` — includes `version` and `apiVersion`
- `GET http://127.0.0.1:4000/api/v1/modules/:subject/:kind/:id` — same JSON as topic pages
- `POST http://127.0.0.1:4000/api/v1/early-access` — waitlist sign-up

Set `MODULES_API_BASE_URL=http://127.0.0.1:4000` in `.env.local` (see `.env.example`) so Next can load module details from the API instead of the local catalogue.
