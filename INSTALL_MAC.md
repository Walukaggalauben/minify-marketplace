# macOS installation
1. Install Node.js 22 LTS, Git and Docker Desktop.
2. Install pnpm: `npm install -g pnpm`.
3. Extract the ZIP and open Terminal in it.
4. Run `cp .env.example .env`.
5. Run `pnpm install`.
6. Run `docker compose up -d`.
7. Run `pnpm db:push && pnpm db:seed`.
8. Run `pnpm dev`.
9. Visit `http://localhost:3000`.
