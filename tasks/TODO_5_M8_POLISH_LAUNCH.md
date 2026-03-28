# TODO: M8 Polish & Launch

## Issues
- #49 Accessibility (WCAG 2.1 AA)
- #50 Responsive Design Polish
- #51 Onboarding Flow
- #52 Comprehensive Error Handling
- #53 Motion Design & prefers-reduced-motion
- #54 Performance Optimization
- #57 End-to-End Tests

## Todo

### Foundation
- [ ] Create toast store (`src/stores/toast.ts`)
- [ ] Build `ToastNotification.vue` component
- [ ] Update `api.ts` — 401, 402, 429, 500+ interceptors with toast
- [ ] Mount `<ToastNotification>` in `App.vue`

### Error Handling (#52)
- [ ] Build `ErrorState.vue` (types: empty, error, not-found, unauthorized, limit-exceeded)
- [ ] Build `LoadingSkeleton.vue` (variants: card, list, table, text)

### Onboarding (#51)
- [ ] Build `OnboardingView.vue` (4-step wizard)
- [ ] Add route `/onboarding` to `router/index.ts`
- [ ] Update `LoginView.vue` post-login redirect to check `onboarding_complete`

### Motion Design (#53)
- [ ] Add `prefers-reduced-motion` CSS to `style.css`
- [ ] Wrap `<RouterView>` in `<Transition name="fade">` in `App.vue`
- [ ] Toast slide-in animation

### Accessibility (#49)
- [ ] Add skip-to-content link in `App.vue`
- [ ] Add `aria-label` to icon-only buttons in `AppSidebar.vue`
- [ ] Add landmark elements to `DashboardView.vue`
- [ ] Add `role="status"` / `aria-live="polite"` to loading/toast
- [ ] Ensure focus rings with `focus-visible:ring-2`

### Responsive Design (#50)
- [ ] Mobile hamburger toggle in `AppSidebar.vue`
- [ ] Stack panels vertically on mobile in `DocumentDetailView.vue`
- [ ] Horizontal-scroll settings tabs in `SettingsLayout.vue`

### Performance (#54)
- [ ] Add manual chunks in `vite.config.ts`
- [ ] Add `lastFetched` cache TTL to `templates.ts` and `clauses.ts` stores

### E2E Tests (#57)
- [ ] Install Playwright
- [ ] `e2e/auth.spec.ts`
- [ ] `e2e/documents.spec.ts`
- [ ] `e2e/templates.spec.ts`

### Docs
- [ ] `docs/accessibility.md`
- [ ] `docs/performance.md`

### Finalize
- [ ] `pnpm run type-check` — fix all TypeScript errors
- [ ] `pnpm exec prettier --write src/`
- [ ] Commit all changes with conventional commits
- [ ] Open PR linking issues #49, #50, #51, #52, #53, #54, #57

## Bugs Found
_none yet_

## Review
_to be filled after implementation_
