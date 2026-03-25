# TODO_4 — M6 Collaboration UI

## Plan

### Phase 1 — Setup & Types
- [ ] Install `@stomp/stompjs` via pnpm
- [ ] Create `src/types/collaboration.ts` with all collaboration types

### Phase 2 — API & WebSocket Services
- [ ] Add `sharesApi` and `commentsApi` to `src/services/api.ts`
- [ ] Create `src/services/websocket.ts` with StompJS singleton

### Phase 3 — Pinia Stores
- [ ] Create `src/stores/shares.ts`
- [ ] Create `src/stores/comments.ts`

### Phase 4 — Components & Views
- [ ] Create `src/components/ShareModal.vue`
- [ ] Create `src/components/CommentsPanel.vue`
- [ ] Create `src/views/documents/SharedWithMeView.vue`

### Phase 5 — Integration
- [ ] Update `src/views/documents/DocumentDetailView.vue` — Share button + CommentsPanel toggle
- [ ] Update `src/views/documents/DocumentsView.vue` — "Shared with Me" link
- [ ] Update `src/router/index.ts` — add shared-with-me route
- [ ] Update `src/components/AppSidebar.vue` — add "Shared with Me" nav item

### Phase 6 — Polish & Docs
- [ ] Run `pnpm run type-check` and fix any TypeScript errors
- [ ] Run `pnpm exec prettier --write src/`
- [ ] Create `docs/collaboration-frontend.md`
- [ ] Commit (atomic conventional commits)

## Review
<!-- filled in after completion -->
