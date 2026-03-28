# TODO_6: M6 Version History & Approval Workflow UI

## Feature 1: Document Version History

- [x] Update `src/types/document.ts` — rewrite `DocumentVersion` to match API spec
- [x] Update `src/services/api.ts` — add `documentsApi` with version endpoints
- [x] Update `src/stores/documents.ts` — add `versions` state + `fetchVersions` / `restoreVersion` actions
- [x] Create `src/components/VersionHistoryPanel.vue` — right-side collapsible panel
- [x] Create `src/components/VersionPreviewModal.vue` — single-version read-only view
- [x] Create `src/components/VersionCompareModal.vue` — side-by-side diff view
- [x] Update `DocumentDetailView.vue` — "History" toggle + VersionHistoryPanel

## Feature 2: Approval Workflow

- [x] Create `src/types/approval.ts`
- [x] Update `src/services/api.ts` — add `approvalsApi`
- [x] Create `src/stores/approvals.ts`
- [x] Create `src/components/ApprovalBar.vue` — sticky status bar
- [x] Create `src/components/RequestApprovalModal.vue` — multi-email input
- [x] Create `src/components/ApprovalRequestModal.vue` — full request detail
- [x] Create `src/views/approvals/PendingApprovalsView.vue`
- [x] Update `src/router/index.ts` — add `/approvals/pending` route
- [x] Update `src/components/AppSidebar.vue` — add "Pending Approvals" nav item
- [x] Update `DocumentDetailView.vue` — ApprovalBar + "Request Approval" button

## Post-implementation

- [x] Run type-check and fix all errors
- [x] Run prettier
- [x] Commit (version history) + commit (approvals)
- [x] Open PR

## Review

All files implemented. Key decisions:
- `DocumentVersion` uses numeric IDs to match `generation.ts` Document type (documentId: number)
- `UserSummary` imported from `@/types/collaboration` (string id)
- `approvalStatus` added to `Document` type in `generation.ts` as optional field
- Version panel follows CommentsPanel.vue pattern (w-72, shrink-0, right side)
- ApprovalBar uses top sticky bar pattern (above the two-panel layout)
