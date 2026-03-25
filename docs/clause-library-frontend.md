# Clause Library — Frontend Documentation

## Overview

The M5 Clause Library module provides a reusable clause management system within PaperLite. Users can create, browse, edit, and insert legal clauses into templates. All routes require authentication.

---

## Routes

| Path | Name | Component | Description |
|---|---|---|---|
| `/clause-library` | `clause-library` | `ClauseLibraryView` | Browse all clauses |
| `/clause-library/new` | `clause-new` | `ClauseEditorView` | Create a new clause |
| `/clause-library/:id/edit` | `clause-edit` | `ClauseEditorView` | Edit an existing clause |
| `/clause-library/:id` | `clause-detail` | `ClauseDetailView` | View a clause (read-only) |

---

## Components

### `ClauseLibraryView` (`src/views/clauses/ClauseLibraryView.vue`)

Main library page. Features:
- **Search bar** — filters by title, category, or tags
- **Category tabs** — derived dynamically from clause data; includes "All"
- **Tag filter chips** — multi-select; clauses must match all active tags
- **Card grid** — responsive 1/2/3-column layout using `ClauseCard`
- **New Clause button** — navigates to `/clause-library/new`
- Loading skeleton and empty states

### `ClauseCard` (`src/components/ClauseCard.vue`)

Card displayed in the library grid. Shows:
- Title + version badge (`v3`)
- Category badge with color-coded background (8 preset categories; falls back to gray)
- Public/Private indicator
- Up to 4 tag chips (overflow shown as `+N`)
- View / Edit action buttons (emit `view` and `edit` events)

### `ClauseEditorView` (`src/views/clauses/ClauseEditorView.vue`)

Create and edit view. Used for both `/clause-library/new` and `/:id/edit`. Features:
- **Two-panel layout** — form on the left, live preview panel on the right (hidden on smaller screens)
- **Tag input** — press Enter or comma to commit a tag; click `×` chip to remove
- **isPublic toggle** — accessible switch
- **Change note** — shown only when editing an existing clause
- **Version history sidebar** — toggled via "History" button; lazy-loads via `store.fetchVersions`; clicking a version opens a read-only modal

### `ClauseDetailView` (`src/views/clauses/ClauseDetailView.vue`)

Read-only clause view. Features:
- Metadata: category, tags, version badge, public indicator, author, created/updated dates
- Full clause text rendered in a serif font for document feel
- **Insert into Template** button — opens a modal to select a template and enter a section name; calls `clausesApi.addToTemplate`
- **Edit** button — shown only to the clause owner (`createdBy === authStore.user?.id`)
- **Delete** button — shown only to the clause owner

---

## Store — `useClausesStore` (`src/stores/clauses.ts`)

```ts
// State
clauses: ClauseSummary[]       // flat list for the library grid
currentClause: Clause | null   // full clause loaded in detail/editor
versions: ClauseVersion[]      // version history for the current clause
loading: boolean
error: string | null

// Actions
fetchClauses(workspaceId?)     // populates clauses[]
fetchClause(id)                // populates currentClause
createClause(req)              // POST and appends to clauses[]
updateClause(id, req)          // PUT and syncs clauses[] + currentClause
deleteClause(id)               // DELETE and removes from clauses[]
fetchVersions(id)              // populates versions[]
```

---

## API Service — `clausesApi` (`src/services/api.ts`)

| Method | Endpoint | Description |
|---|---|---|
| `list(workspaceId?)` | `GET /api/clauses` | List all clauses (optionally scoped to workspace) |
| `get(id)` | `GET /api/clauses/:id` | Get full clause |
| `create(data)` | `POST /api/clauses` | Create a new clause |
| `update(id, data)` | `PUT /api/clauses/:id` | Update a clause (bumps version) |
| `delete(id)` | `DELETE /api/clauses/:id` | Delete a clause |
| `getVersions(id)` | `GET /api/clauses/:id/versions` | List version history |
| `addToTemplate(templateId, data)` | `POST /api/templates/:templateId/clauses` | Insert clause into template |
| `removeFromTemplate(templateId, clauseId)` | `DELETE /api/templates/:templateId/clauses/:clauseId` | Remove clause from template |
| `getTemplateClauses(templateId)` | `GET /api/templates/:templateId/clauses` | List clauses on a template |

---

## Types (`src/types/clause.ts`)

- `Clause` — full clause object returned by `GET /api/clauses/:id`
- `ClauseSummary` — lightweight projection used in list views
- `ClauseVersion` — snapshot of a clause at a point in time
- `TemplateClause` — join record linking a clause to a template section
- `CreateClauseRequest` — payload for creating a clause
- `UpdateClauseRequest` — partial update payload (includes optional `changeNote`)
- `InsertClauseRequest` — payload for inserting a clause into a template

---

## Sidebar

The "Clause Library" nav item is added to `AppSidebar.vue` after "Intake Forms". It uses a document-stack SVG icon and is active whenever the route starts with `/clause-library`.
