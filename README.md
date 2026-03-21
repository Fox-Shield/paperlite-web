# PaperLite Web

Vue 3 + Vite frontend for PaperLite — document management platform.

## Tech Stack

- Vue 3 (Composition API)
- Vite
- Vue Router 4
- Pinia (state management)
- Axios (API client)
- Tailwind CSS v4

## Development

```bash
pnpm install
pnpm dev       # starts at http://localhost:5173
```

API proxy: `/api/*` → `http://localhost:8080` (backend must be running)

## Environment

No `.env` needed for local dev — the Vite proxy handles API routing.
