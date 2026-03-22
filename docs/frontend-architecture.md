# PaperLite Frontend Architecture

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build tool | Vite 8 |
| State | Pinia 3 |
| Routing | Vue Router 4 |
| HTTP | Axios (with auth interceptors) |
| Styling | Tailwind CSS v4 |
| Types | TypeScript 5 |

---

## Directory Layout

```
src/
├── components/          # Shared UI components
│   ├── AppSidebar.vue
│   └── GenerationStatusBanner.vue
├── router/
│   └── index.js         # Route definitions + auth guards
├── services/
│   ├── api.js           # Axios instance (auth interceptors)
│   └── generationApi.ts # Typed generation API methods
├── stores/
│   ├── auth.js          # Auth Pinia store
│   └── generation.ts    # Generation Pinia store
├── types/
│   └── generation.ts    # Shared TypeScript interfaces/types
└── views/
    ├── auth/
    │   ├── LoginView.vue
    │   └── RegisterView.vue
    ├── documents/
    │   ├── DocumentsView.vue
    │   └── DocumentDetailView.vue
    └── DashboardView.vue
```

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

All methods are `async` and throw on non-2xx responses (handled by the Axios interceptors in `api.js` — 401 clears auth and redirects to `/login`).

---

## Authentication

Auth state lives in `src/stores/auth.js` (Pinia). JWT tokens are stored in `localStorage` and attached to every request by the Axios request interceptor in `src/services/api.js`. A 401 response clears tokens and redirects to `/login`.

Route-level guards in `src/router/index.js` use `meta.requiresAuth` / `meta.requiresGuest` to protect routes.

---

## Styling Conventions

- Tailwind CSS v4 utility classes throughout
- Nested styles inside `<style>` blocks when component-specific CSS is needed
- No global component library — all UI is hand-rolled with Tailwind
- `rounded-2xl`, `shadow-sm`, `border border-gray-100` card pattern used consistently
