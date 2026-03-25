# TODO_3 — M5 Clause Library

## Plan

- [x] 1. Create `src/types/clause.ts` — all clause-related TypeScript interfaces
- [x] 2. Add `clausesApi` to `src/services/api.ts`
- [x] 3. Create `src/stores/clauses.ts` — Pinia store
- [x] 4. Create `src/views/clauses/ClauseLibraryView.vue` — main library page
- [x] 5. Create `src/components/ClauseCard.vue` — card component
- [x] 6. Create `src/views/clauses/ClauseEditorView.vue` — create/edit view
- [x] 7. Create `src/views/clauses/ClauseDetailView.vue` — read-only detail view
- [x] 8. Add clause routes to `src/router/index.ts`
- [x] 9. Add "Clause Library" nav item to `src/components/AppSidebar.vue`
- [x] 10. Run `vue-tsc --noEmit` — passed with zero errors
- [x] 11. Run `prettier --write src/` and commit
- [x] 12. Create `docs/clause-library-frontend.md`
- [x] 13. Open PR #66 targeting issues #33–#37

## Review

All 13 tasks completed. PR: https://github.com/Fox-Shield/paperlite-web/pull/66

### Files created
- `src/types/clause.ts` — 7 interfaces/request types
- `src/stores/clauses.ts` — Pinia store with full CRUD + version fetching
- `src/views/clauses/ClauseLibraryView.vue` — search + category tabs + tag filters + card grid
- `src/views/clauses/ClauseEditorView.vue` — two-panel form/preview, tag chip input, version history sidebar
- `src/views/clauses/ClauseDetailView.vue` — read-only view with Insert into Template modal
- `src/components/ClauseCard.vue` — compact card with color-coded category badge
- `docs/clause-library-frontend.md` — full module documentation

### Files modified
- `src/services/api.ts` — added `clausesApi` with 9 endpoints
- `src/router/index.ts` — added 4 clause library routes
- `src/components/AppSidebar.vue` — added Clause Library nav item after Intake Forms

### Notes
- `vue-tsc --noEmit` passed clean — no TypeScript errors introduced
- Prettier reformatted some pre-existing files (no logic changes) — committed in a separate `style:` commit
