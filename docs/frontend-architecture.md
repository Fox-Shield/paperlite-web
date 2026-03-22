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

---

## M3 — Document Generation Flow

### Overview

The generation flow lets users fill in template field values, trigger PDF generation, and download the result. The flow has three logical phases:

1. **Field entry** — user populates form fields on `DocumentDetailView`
2. **Generation** — backend processes the document and produces a PDF
3. **Download** — user retrieves the finished PDF

### Route Map

| Route | Name | Component |
|---|---|---|
| `/documents` | `documents` | `DocumentsView` |
| `/documents/:id` | `document-detail` | `DocumentDetailView` |

### Generation Store (`src/stores/generation.ts`)

The `useGenerationStore` manages all generation-related state:

```
State
  fieldValues        FieldValue[]          — loaded from GET /field-values
  generationRequest  GenerationRequest|null — active generation job
  isGenerating       boolean               — true while polling
  pollingInterval    number|null           — setInterval handle

Actions
  fetchFieldValues(documentId)             — load fields from API
  saveFieldValues(documentId, values)      — persist field values to API
  scheduleSave(documentId, values)         — debounced save (1.5 s)
  generateDocument(documentId)             — POST /generate, start polling
  pollStatus(documentId, requestId)        — GET /status, stop when done
  stopPolling()                            — clear interval
  downloadPdf(documentId, requestId)       — GET /download as Blob, trigger save
  reset()                                  — clear state on unmount
```

### Polling Pattern

After `generateDocument` succeeds the store starts a `setInterval` at **2-second** intervals calling `pollStatus`. Once the status reaches `COMPLETED` or `FAILED`, `stopPolling` is called automatically. The component also calls `stopPolling` in its `onUnmounted` hook to prevent dangling timers if the user navigates away.

```
generateDocument()
  → POST /generate
  → set generationRequest
  → setInterval(pollStatus, 2000)
      → GET /status
      → if COMPLETED|FAILED: clearInterval, isGenerating = false
```

### Auto-save Debounce

Every field change in `DocumentDetailView` calls `store.scheduleSave()`. This clears any pending debounce timer and sets a new one for **1.5 seconds**. If the user keeps typing the timer resets, so only one save is issued 1.5 s after the last keystroke.

```
onFieldChange()
  → scheduleSave(documentId, payload)
      → clearTimeout(previous)
      → setTimeout(saveFieldValues, 1500)
```

The `showAutoSave` ref in `DocumentDetailView` shows an "Auto-saving…" indicator when a change is made. A watcher hides it 2 s after the last field update.

### Field Type Rendering

`DocumentDetailView` maps each `FieldType` to the correct HTML input:

| FieldType | Input rendered |
|---|---|
| `TEXT` | `<input type="text">` |
| `NUMBER` | `<input type="number">` |
| `DATE` | `<input type="date">` |
| `BOOLEAN` | `<input type="checkbox">` (true-value/false-value) |
| `TEXTAREA` | `<textarea>` |
| `SELECT` | `<select>` with options from `fv.options` |

### Generation Status Banner (`GenerationStatusBanner.vue`)

A stateless presentational component that accepts a `GenerationRequest` prop and emits `download` / `retry` events. It renders three states via `v-if`:

- **PENDING / PROCESSING** — yellow banner, spinner
- **COMPLETED** — green banner, Download PDF button
- **FAILED** — red banner, error message, Try Again button

### API Service (`src/services/generationApi.ts`)

Typed wrapper over the shared Axios instance:

```ts
getFieldValues(documentId)               → FieldValue[]
saveFieldValues(documentId, req)         → void
generateDocument(documentId)             → GenerationRequest
getGenerationStatus(documentId, reqId)   → GenerationRequest
downloadPdf(documentId, reqId)           → Blob
```

All methods are `async` and throw on non-2xx responses (handled by the Axios interceptors in `src/services/api.ts` — 401 clears auth and redirects to `/login`).
