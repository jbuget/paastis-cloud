This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database & Prisma

- Local env: copy `.env.example` to `.env.local` and set `DATABASE_URL` & `AUTH_SECRET`. For Prisma CLI, also ensure `DATABASE_URL` is available (either export it or duplicate into a local `.env`).
- Install deps: `npm install` (adds Prisma and bcryptjs).
- Start Postgres via Docker: `docker compose up -d db`.
- Create the schema:

```
npx prisma generate
npx prisma migrate dev --name init
```

- Run app: `npm run dev` and open `/signup` to create a user.

### Seed demo user

Seed a demo account (idempotent upsert):

```
npm run seed
# Uses defaults: DEMO_EMAIL=demo@local.test, DEMO_PASSWORD=demo1234

# Optionally customize:
DEMO_EMAIL=alice@example.com DEMO_PASSWORD=s3cret npm run seed
```

### One-step DB setup

To generate the client, run initial migrations, and seed in one go:

```
npm run db:setup
```

Reset the DB and reseed (destructive):

```
npm run db:reset
```

### Docker Compose (full stack)

Build and run the app and database together:

```
docker compose up --build
```

This starts Postgres on `5432` and the web app on `3000`. Migrations are applied on container start.

For development, you can also auto-seed on container start using the dev override:

```
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

This runs `prisma migrate deploy` followed by `npm run seed` before starting the app.

## Encryption Key Management

- Default (legacy) encryption derives a key from `AUTH_SECRET`. For stronger security, configure a keyring:
  - `ENCRYPTION_KEYS`: comma-separated `id:base64key` entries. Each key must be 32 bytes (AES-256) encoded in base64.
  - `ENCRYPTION_PRIMARY_KEY_ID`: the key id used for new encryptions.
- Ciphertext format with keyring: `v1:keyId:iv:ciphertext:tag` (base64 segments). Legacy entries use `iv:ciphertext:tag` and are still readable.
- Rotation procedure:
  1. Generate a new 32-byte key: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
  2. Prepend it to `ENCRYPTION_KEYS` with a new id (e.g., `k3:...`) and set `ENCRYPTION_PRIMARY_KEY_ID=k3`.
  3. Restart the app. New writes use `k3`. Revealing a key will opportunistically re-encrypt it with the primary.
  4. Bulk re-encrypt existing records to the current primary key:
     - Dry-run: `npm run keys:reenc -- --dry-run`
     - Execute: `npm run keys:reenc`
     - Options: `--batch-size=500` to tune batch size.
  5. After confirming all keys are on the new key id, remove old keys from `ENCRYPTION_KEYS`.

Notes:
- The reveal endpoint never logs plaintext; consider adding rate limits and audit logs in production.
