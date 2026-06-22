# Samyoga Admin

Next.js **platform super-admin** console for Samyoga operators — tenant provisioning, feature catalog, internal feedback triage, and admin profile/security. Separate app and auth session from the HMS staff portal ([samyoga-fe-core](../samyoga-fe-core)).

## Samyoga repos

| Repo | Role | Local port |
|------|------|------------|
| [samyoga-be](../samyoga-be) | REST API + Better Auth | `3000` |
| [samyoga-fe-core](../samyoga-fe-core) | HMS portal (tenant staff) | `3002` |
| **samyoga-admin** (this) | Platform super-admin | `3003` |
| [samyoga-fe](../samyoga-fe) | Marketing site | `3004` |

## What this app does

| Area | Routes | Backend |
|------|--------|---------|
| Dashboard | `/` | Internal APIs |
| Tenants | `/tenants`, `/tenants/new` | `POST/GET /api/v1/internal/...` |
| Feature catalog | `/features` | Plan / feature management |
| Feedback triage | `/feedback` | `GET /api/v1/internal/feedback` (from HMS user reports) |
| Profile / security | `/profile` | Better Auth admin session |
| Sign-in | `/signin`, `/two-factor` | `/api/v1/internal-auth` |

Only **`superAdmin`** (or equivalent internal roles) should use this app. HMS tenant admins use **fe-core**, not admin.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4, TanStack Query, Zustand, React Hook Form
- Better Auth (admin cookie prefix — separate from HMS sessions)

## Quick start

```bash
yarn install
cp .env.example .env
yarn dev    # http://localhost:3003
```

**Backend required:** [samyoga-be](../samyoga-be) with:

- `ADMIN_PORTAL_ORIGINS=http://localhost:3003` (or your admin URL)
- A seeded super-admin user (`yarn db:seed_dev`)

**Do not set `NEXT_PUBLIC_API_DOMAIN` for local dev** unless you understand cross-origin cookies — session cookies are on `localhost:3003`; the default server proxy via `INTERNAL_API_URL` is the supported path.

## How it talks to the API

- **Auth:** Better Auth at `/api/v1/internal-auth` (proxied or direct to Express)
- **Data:** Server-side calls to `INTERNAL_API_URL` + `/api/v1/internal/*` routes
- **No `x-tenant-id`:** admin APIs are platform-scoped, not hospital-scoped

HMS deep links (e.g. open a captured feedback route in fe-core) use optional `NEXT_PUBLIC_HMS_APP_URL` (default `http://localhost:3002`).

## Environment

Copy [`.env.example`](.env.example) → `.env`:

| Variable | Purpose |
|----------|---------|
| `INTERNAL_API_URL` | Express API (default `http://127.0.0.1:3000`) |
| `NEXT_PUBLIC_SITE_URL` | This app origin (`http://localhost:3003`) |
| `NEXT_PUBLIC_HMS_APP_URL` | Link out to HMS for feedback context |

Backend must list this origin in `ADMIN_PORTAL_ORIGINS`.

## Scripts

```bash
yarn dev      # port 3003
yarn build
yarn start
yarn lint
```

## Related docs

- [samyoga-be README](../samyoga-be/README.md) — API modules, `internal` routes, admin auth
- [samyoga-be/docs/ROADMAP.md](../samyoga-be/docs/ROADMAP.md) — platform vs tenant features
