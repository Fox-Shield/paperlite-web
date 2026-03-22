# paperlite-web

PaperLite frontend — a Vue 3 single-page application for document management, built with Vite and Tailwind CSS v4.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API) |
| Build tool | Vite 8 |
| State management | Pinia |
| Routing | Vue Router 4 |
| HTTP client | Axios |
| Styling | Tailwind CSS v4 |
| Package manager | pnpm |

---

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **pnpm** — `npm install -g pnpm`
- **Backend running** — the frontend proxies all `/api/*` requests to `http://localhost:8080`. See [backend_paperlite_pro](https://github.com/Fox-Shield/backend_paperlite_pro).

---

## Quick Start

```bash
# 1. Clone and enter the repo
git clone https://github.com/Fox-Shield/paperlite-web.git
cd paperlite-web

# 2. Install dependencies
pnpm install

# 3. Start the dev server
pnpm dev
```

The app will be available at **http://localhost:5173**.

Make sure the backend API is running at `http://localhost:8080` before using the app.

---

## Installation

```bash
pnpm install
```

---

## Running Locally

```bash
pnpm dev
```

Starts a Vite dev server at `http://localhost:5173`. Hot module replacement (HMR) is enabled by default.

All requests to `/api/*` are transparently proxied to `http://localhost:8080` — no CORS issues, no manual URL configuration needed.

---

## Building for Production

```bash
# Build optimised assets to dist/
pnpm build

# Preview the production build locally
pnpm preview
```

The `pnpm preview` command serves the `dist/` folder at `http://localhost:4173`.

---

## Environment & Proxy Config

No `.env` file is required for local development. The Vite proxy configuration in `vite.config.js` handles API routing:

```js
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

For production deployments, configure your web server (nginx, etc.) to proxy `/api/*` to the backend service. The frontend itself is a static bundle with no environment-specific build flags needed.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server at http://localhost:5173 |
| `pnpm build` | Build for production (output: `dist/`) |
| `pnpm preview` | Preview the production build locally |

---

## Project Structure

```
paperlite-web/
├── index.html
├── vite.config.js              # Vite config, API proxy, path aliases
├── package.json
└── src/
    ├── main.js                 # App entry point — mounts Vue, Pinia, Router
    ├── App.vue                 # Root component (renders <RouterView />)
    ├── style.css               # Global styles — imports Tailwind
    ├── router/
    │   └── index.js            # Route definitions and navigation guards
    ├── stores/
    │   └── auth.js             # Pinia auth store — tokens, user, login/logout
    ├── services/
    │   └── api.js              # Axios instance with auth interceptors
    └── views/
        ├── DashboardView.vue   # Main dashboard (requires auth)
        ├── WorkspaceView.vue   # Workspace detail view (requires auth)
        └── auth/
            ├── LoginView.vue   # Login page (guest only)
            └── RegisterView.vue # Registration page (guest only)
```

### Key files

- **`src/services/api.js`** — Axios instance configured with `baseURL: '/api'`. Attaches the `Authorization: Bearer <token>` header from `localStorage` on every request. Redirects to `/login` on 401 responses.
- **`src/stores/auth.js`** — Pinia store managing `accessToken` and `user`. Persists both to `localStorage`. Exposes `login()`, `register()`, `logout()`, and `fetchMe()`.
- **`src/router/index.js`** — Navigation guard enforces `requiresAuth` (redirects unauthenticated users to `/login`) and `requiresGuest` (redirects logged-in users to `/dashboard`).

---

## Working with the Backend

The frontend is paired with [backend_paperlite_pro](https://github.com/Fox-Shield/backend_paperlite_pro) — a Spring Boot 3.2 REST API.

To run the full stack locally:

1. Follow the backend setup guide to start PostgreSQL and the Spring Boot API on port `8080`.
2. Run `pnpm dev` in this repo.
3. Open http://localhost:5173.
