# Frontend Architecture

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Vue 3 (Composition API + `<script setup>`) | ^3.5 |
| Language | TypeScript | ^5.9 |
| Build tool | Vite | ^8.0 |
| State management | Pinia | ^3.0 |
| Routing | Vue Router | ^4.6 |
| HTTP client | Axios | ^1.13 |
| Styling | Tailwind CSS v4 | ^4.2 |
| Utilities | @vueuse/core | ^14.2 |
| Package manager | pnpm | — |
| Type checking | vue-tsc | ^3.2 |
| Formatter | Prettier | ^3.8 |

The `build` script runs `vue-tsc && vite build`, so TypeScript errors fail the build before Vite even runs.

---

## Store Architecture

Pinia stores live in `src/stores/`. All stores use the **Composition API style** (`defineStore` with a setup function).

### `useAuthStore` (`src/stores/auth.ts`)

Manages authentication state.

| Export | Type | Description |
|---|---|---|
| `user` | `Ref<User \| null>` | Logged-in user, hydrated from `localStorage` on init |
| `accessToken` | `Ref<string \| null>` | JWT access token, persisted to `localStorage` |
| `isAuthenticated` | `ComputedRef<boolean>` | `true` when both token and user are present |
| `login(email, password)` | `Promise<AuthResponse>` | POST `/auth/login`, persists tokens and user |
| `register(...)` | `Promise<AuthResponse>` | POST `/auth/register`, persists tokens and user |
| `fetchMe()` | `Promise<User>` | GET `/auth/me`, refreshes local user object |
| `logout()` | `void` | Clears state and all `localStorage` keys |

### `useDocumentsStore` (`src/stores/documents.ts`)

Manages documents for the current workspace.

| Export | Type | Description |
|---|---|---|
| `documents` | `Ref<Document[]>` | Cached documents for the active workspace |
| `loading` | `Ref<boolean>` | Request-in-flight flag |
| `fetchDocuments(workspaceId)` | `Promise<Document[]>` | GET `/workspaces/:id/documents` |
| `createDocument(payload)` | `Promise<Document>` | POST `/documents`, appends to local list |
| `updateDocument(id, payload)` | `Promise<Document>` | PATCH `/documents/:id`, updates in-place |
| `deleteDocument(id)` | `Promise<void>` | DELETE `/documents/:id`, removes from list |

### `useTemplatesStore` (`src/stores/templates.ts`)

Manages templates for the current workspace. Mirrors the same CRUD pattern as `useDocumentsStore`.

---

## Type System

All TypeScript types live in `src/types/` and are re-exported from `src/types/index.ts`.

### Mapping to Backend Models

| File | Types | Backend entity |
|---|---|---|
| `api.ts` | `ApiResponse<T>`, `PaginatedResponse<T>` | Generic API envelope |
| `auth.ts` | `User`, `LoginRequest`, `RegisterRequest`, `AuthResponse` | `UserEntity`, auth DTOs |
| `document.ts` | `Document`, `DocumentVersion`, `DocumentStatus`, `CreateDocumentRequest`, `UpdateDocumentRequest` | `DocumentEntity`, `DocumentVersionEntity` |
| `template.ts` | `Template`, `TemplateField`, `FieldType`, `CreateTemplateRequest`, `UpdateTemplateRequest` | `TemplateEntity`, `TemplateFieldEntity` |
| `workspace.ts` | `Workspace` | `WorkspaceEntity` |

**Enums** (`DocumentStatus`, `FieldType`) use string values that match the backend's Java enum `name()` serialisation (e.g. `DocumentStatus.Draft = 'DRAFT'`).

**Request types** (`Create*Request`, `Update*Request`) are the shapes sent in POST/PATCH bodies. `Update*` types use optional fields so callers only include changed properties.

Import pattern:
```ts
import type { User, AuthResponse, Document } from '@/types'
```

---

## Router Structure

The router is defined in `src/router/index.ts`.

### Routes

| Path | Name | Component | Guard |
|---|---|---|---|
| `/` | — | redirect → `/dashboard` | — |
| `/login` | `Login` | `LoginView` | `requiresGuest` |
| `/register` | `Register` | `RegisterView` | `requiresGuest` |
| `/dashboard` | `Dashboard` | `DashboardView` | `requiresAuth` |
| `/workspace/:id` | `Workspace` | `WorkspaceView` | `requiresAuth` |
| `/:pathMatch(.*)` | — | redirect → `/dashboard` | — |

All view components are **lazy-loaded** (`() => import(...)`) so they are code-split automatically by Vite.

### Auth Guards

`RouteMeta` is augmented with two boolean flags:

```ts
declare module 'vue-router' {
    interface RouteMeta {
        requiresAuth?: boolean
        requiresGuest?: boolean
    }
}
```

The `beforeEach` guard checks these flags against `useAuthStore().isAuthenticated`:

- `requiresAuth` + not authenticated → redirect to `/login`
- `requiresGuest` + authenticated → redirect to `/dashboard`

---

## API Service Pattern

`src/services/api.ts` exports a single configured Axios instance.

**Base URL:** `/api` — proxied by Vite dev server to `http://localhost:8080`. In production, configure your reverse proxy to forward `/api/*` to the backend.

**Request interceptor** — attaches `Authorization: Bearer <token>` from `localStorage` on every outbound request.

**Response interceptor** — on 401, clears tokens from `localStorage` and hard-navigates to `/login`.

**Usage in stores:**
```ts
import api from '@/services/api'

const { data } = await api.get<User>('/auth/me')
const { data } = await api.post<AuthResponse>('/auth/login', payload)
```

The generic type parameter on Axios methods (e.g. `api.get<T>`) types `response.data` as `T`, removing the need for manual casts at the call site.
