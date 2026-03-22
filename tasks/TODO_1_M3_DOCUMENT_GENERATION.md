# TODO: M3 — Document Generation UI

## Context

Implementing the full document generation flow on top of the M1 Vue 3 + Vite scaffold.
The project is currently plain JavaScript; we're adding TypeScript support alongside it
(new files only — existing .js files are left in place).

---

## Pre-flight

- [ ] Add TypeScript devDependencies (`typescript`, `vue-tsc`, `@types/node`)
- [ ] Create `tsconfig.json`
- [ ] Create `src/env.d.ts` (declare `*.vue` module for TS)
- [ ] Add `.prettierrc` (no semi, single quote, tabWidth 4, printWidth 90)
- [ ] Update `package.json` build script: `vue-tsc --noEmit && vite build`
- [ ] Move GitHub issues #19, #20, #21, #23, #24, #25 → "In Progress"
- [ ] Create branch `feature/m3-document-generation` from main

---

## Commit 1 — Types + Pinia store

- [ ] Create `src/types/generation.ts` — FieldType, FieldValue, SaveFieldValuesRequest, GenerationRequest, Document interfaces
- [ ] Create `src/stores/generation.ts` — fetchFieldValues, saveFieldValues (debounced 1.5s), generateDocument, pollStatus (2s interval), downloadPdf

## Commit 2 — Document list page

- [ ] Create `src/views/documents/DocumentsView.vue` — list, status badges, "Generate PDF" button, "New Document" modal, empty state

## Commit 3 — Document detail page

- [ ] Create `src/views/documents/DocumentDetailView.vue` — two-panel layout, field entry form with correct input types per FieldType, inline validation, auto-save indicator, right-panel mock preview, bottom action bar

## Commit 4 — Generation status banner

- [ ] Create `src/components/GenerationStatusBanner.vue` — PENDING/PROCESSING spinner, COMPLETED download, FAILED retry

## Commit 5 — Router + Sidebar

- [ ] Create `src/components/AppSidebar.vue` with "Documents" nav link → `/documents`
- [ ] Update `src/router/index.js` — add `/documents` and `/documents/:id` routes; update DocumentsView import
- [ ] Update `DashboardView.vue` and other views that have inline nav to use AppSidebar

## Commit 6 — API service

- [ ] Create `src/services/generationApi.ts` — typed wrapper: getFieldValues, saveFieldValues, generateDocument, getGenerationStatus, downloadPdf
  (Keep existing `api.js` untouched; new file imports and re-exports the axios instance)

## Commit 7 — Docs

- [ ] Create `docs/` directory
- [ ] Create `docs/frontend-architecture.md` — M3 section: generation flow, store design, polling pattern, auto-save debounce

## Commit 8 — Build + PR

- [ ] Run `pnpm run build` — verify zero TS errors
- [ ] Push branch
- [ ] Open PR to main with `gh pr create`, include Closes #19–#25
- [ ] Move issues #19, #20, #21, #23, #24, #25 → "Review"

---

## Bugs Found

- **TS7016 errors on JS imports** — `vue-tsc` couldn't resolve `@/services/api.js` and `@/stores/auth.js` from TypeScript files (implicit `any`). Fixed by adding `"allowJs": true` to `tsconfig.json`. This allows TypeScript to accept the existing `.js` modules without requiring a full JS → TS migration.

---

## Review

All M3 deliverables implemented across 8 commits on `feature/m3-document-generation`.

### What changed
| File | Change |
|---|---|
| `package.json` | Added `typescript`, `vue-tsc`, `@types/node` devDeps; updated build script to `vue-tsc --noEmit && vite build` |
| `tsconfig.json` | New — strict TS config with `allowJs`, path alias `@/*` |
| `src/env.d.ts` | New — `*.vue` module declaration for vue-tsc |
| `.prettierrc` | New — no semi, single quote, tabWidth 4, printWidth 90 |
| `src/types/generation.ts` | New — FieldType, FieldValue, GenerationRequest, Document, Template, CreateDocumentRequest |
| `src/stores/generation.ts` | New — Pinia store with polling (2s), debounced save (1.5s), download |
| `src/services/generationApi.ts` | New — typed API wrapper for 5 generation endpoints |
| `src/views/documents/DocumentsView.vue` | New — list page with status badges, New Document modal, empty state |
| `src/views/documents/DocumentDetailView.vue` | New — two-panel field form + mock preview, validation, action bar |
| `src/components/GenerationStatusBanner.vue` | New — stateless banner for PENDING/COMPLETED/FAILED states |
| `src/components/AppSidebar.vue` | New — sidebar with Dashboard + Documents nav, sign-out |
| `src/router/index.js` | Updated — added `/documents` and `/documents/:id` routes |
| `docs/frontend-architecture.md` | New — full M3 architecture documentation |

### PR
https://github.com/Fox-Shield/paperlite-web/pull/64 — Closes #19, #20, #21, #23, #24, #25
