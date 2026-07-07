# Deployment

## Targets

| Target | Notes |
|--------|-------|
| Docker container | Uses the shared framework Dockerfile |
| Cloudflare Workers + Neon | Edge deployment, lower latency, free tier available |

Both read from `CONFIG.yaml` (copy from `CONFIG.template.yaml`): `local`/`production` profiles, each with `database` (Postgres connection string) and `session_secret`.

## Docker

1. `bun install && bun run build`
2. `docker build -f node_modules/@chromatis/base/infra/docker/Dockerfile -t studyluma .`
3. `bun run db:deploy` — shows pending migrations, confirms, applies. Run on a fresh DB and again after each migration-bearing release.
4. In `studyluma-content`: set the production DB URL in `CONFIG.yaml`, then `bun run publish`
5. `docker run --rm -p 3000:3000 -e DATABASE_URL=<url> -e SESSION_SECRET=<secret> -e NODE_ENV=production studyluma` — listens on port 3000

## Cloudflare Workers + Neon

Needs: Wrangler CLI (dev dependency), a Neon database, Cloudflare account.

1. Create a Neon project, put its connection string in `CONFIG.yaml` → `production.database`
2. `bun run db:deploy` — same confirm-then-apply flow, against Neon
3. In `studyluma-content`: set the Neon URL in `CONFIG.yaml` production profile, then `bun run publish`
4. `bun run cf:deploy` — syncs `CONFIG.yaml` production values to Worker secrets, builds, deploys, all in one step
5. Local Workers testing: `bun run cf:dev` (writes `.dev.vars` from the local profile, starts Wrangler)

## Planned: GitHub Release Artifacts (not yet implemented)

Goal: teachers deploy without cloning. Docker image → `ghcr.io/yourorg/studyluma:<version>`/`:latest`; Workers bundle → zipped `build/server/` attached to the GitHub release. CI on a `v*` tag: build both targets, push the image, attach the zip. Until this exists, Cloudflare deploys require cloning and running `bun run cf:deploy` directly.

## Environment Variables Reference

Set automatically by `bun run cf:deploy` (from `CONFIG.yaml`), or passed manually for Docker.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `SESSION_SECRET` | Yes | Secret key for signing session cookies |
| `NODE_ENV` | No | Use `production` for Docker deployments |
