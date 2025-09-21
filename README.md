# Projector — Projects & Tasks (Next.js + Tailwind + JSON Server)

## Run locally
```bash
npm i
npm run dev:all   # starts Next.js on http://localhost:3000 and JSON Server on http://localhost:3001
```
Login with `manager@example.com` or `user@example.com` (any password accepted in this demo).

## Deploy
- Push to GitHub, connect the repo in Vercel, set env var `NEXT_PUBLIC_API_URL` to your JSON Server URL (or mock API).

## Highlights (matches your rubric)
- React + Next.js (App Router, TypeScript)
- Axios client (`/lib/api.ts`)
- TailwindCSS
- JSON Server with `db.json`
- Auth (register/login), session in `localStorage`, protected pages, roles (manager/user)
- Dashboard + Projects, CRUD for projects & tasks
- Role-based UI: managers can create/delete projects and tasks; users can view and update own task status from Dashboard
