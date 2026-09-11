# Windows installation
1. Install Node.js 22 LTS and Git.
2. Install Docker Desktop.
3. Install pnpm: `npm install -g pnpm`.
4. Extract the ZIP.
5. Open PowerShell in the folder.
6. Run: `copy .env.example .env`
7. Run: `pnpm install`
8. Run: `docker compose up -d`
9. Run: `pnpm db:push`
10. Run: `pnpm db:seed`
11. Run: `pnpm dev`
12. Visit `http://localhost:3000`.
