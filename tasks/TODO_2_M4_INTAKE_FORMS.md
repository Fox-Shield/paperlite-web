# TODO: M4 Client Intake Forms UI

## Tasks

- [ ] 1. Move GitHub issues #26–#32 to "In Progress"
- [ ] 2. Create `src/types/intakeForm.ts` — all intake form types
- [ ] 3. Create `src/stores/intakeForms.ts` — Pinia store
- [ ] 4. Add intake form API methods to `src/services/api.ts`
- [ ] 5. Add intake form routes to `src/router/index.ts`
- [ ] 6. Create `src/views/intake/IntakeFormsView.vue` — list view
- [ ] 7. Create `src/views/intake/IntakeFormBuilderView.vue` — builder
- [ ] 8. Create `src/views/intake/PublicIntakeFormView.vue` — public form
- [ ] 9. Create `src/views/intake/IntakeFormSubmissionsView.vue` — submissions
- [ ] 10. Update `src/components/AppSidebar.vue` — add Intake Forms nav item
- [ ] 11. Create `docs/intake-forms-frontend.md` — documentation
- [ ] 12. Commit #1: types + store
- [ ] 13. Commit #2: API service methods
- [ ] 14. Commit #3: list view
- [ ] 15. Commit #4: builder view
- [ ] 16. Commit #5: public form
- [ ] 17. Commit #6: submissions view
- [ ] 18. Commit #7: routes + sidebar
- [ ] 19. Commit #8: docs
- [ ] 20. Run `pnpm run build` — must pass zero TS errors
- [ ] 21. Open PR, move issues to "Review"

## Notes

- Working in main repo: `/Users/dominic/Documents/Projects/PaperLite/App/paperlite-web`
- Branch: `feature/m4-intake-forms`
- FieldType is enum from `src/types/template.ts` (TEXT, NUMBER, DATE, BOOLEAN, Select)
- AppSidebar uses Tailwind-only (no scoped CSS now)
- Public form route `/forms/:formId` — no auth, no AppSidebar
- Save/resume via localStorage + sessionToken

## Review

_To be filled in after completion._
