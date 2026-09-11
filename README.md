# MINIFY MARKET

A production-oriented marketplace for MINIFY GADGETS, inspired by the **workflow** of Jiji: browse/search → filter → open advert → contact seller → chat/call → favorite → review/report. It is not a copy of Jiji's source code, branding, or proprietary UI.

## Stack
- Next.js 16 + React + TypeScript
- NestJS + TypeScript
- PostgreSQL 18
- Prisma ORM
- Redis-ready architecture
- JWT authentication
- Responsive PWA-style web experience
- Docker Compose for local infrastructure

## Included marketplace workflow
- Registration/login
- Seller profiles
- Categories and subcategories
- Create/edit/publish ads
- Moderation status: DRAFT → PENDING_REVIEW → ACTIVE → SOLD/REJECTED/EXPIRED
- Multiple product photos
- Search, category, price and condition filters
- Advert detail pages
- Favorites
- Seller contact actions
- Buyer/seller conversations and messages
- Seller dashboard
- Reviews and seller ratings
- Reports/moderation
- Admin moderation endpoints
- Seed data for MINIFY GADGETS

## Local installation
### Prerequisites
1. Node.js 22+
2. pnpm 10+
3. Docker Desktop

### Windows / macOS / Linux
```bash
unzip minify-marketplace.zip
cd minify-marketplace
cp .env.example .env
pnpm install
docker compose up -d
pnpm db:push
pnpm db:seed
pnpm dev
```
Open http://localhost:3000
API: http://localhost:4000/api

### Demo accounts
- Admin: admin@minifygadgets.com / ChangeMe123!
- Seller: seller@minifygadgets.com / ChangeMe123!
- Buyer: buyer@minifygadgets.com / ChangeMe123!

Change these passwords before production.

## Production notes
- Use managed PostgreSQL and Redis.
- Put the API behind HTTPS.
- Replace local uploads with S3-compatible object storage.
- Configure transactional email/SMS and Uganda phone verification.
- Add Cloudflare/WAF/rate limiting.
- Rotate JWT secrets and use strong password policies.
- Configure real-time WebSocket scaling through Redis adapter.
