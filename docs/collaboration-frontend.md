# M6 Collaboration Frontend

## Overview

The collaboration layer adds real-time commenting and document sharing to PaperLite. It consists of types, API services, a WebSocket service, two Pinia stores, two new components, and one new view.

## Types — `src/types/collaboration.ts`

| Type | Purpose |
|------|---------|
| `SharePermission` | `'READ' \| 'COMMENT' \| 'WRITE'` |
| `DocumentShare` | A share record (who, which document, what permission) |
| `UserSummary` | Lightweight user reference (id, name, email) |
| `Comment` | Comment with nested `replies: Comment[]` |
| `CreateCommentRequest` | Payload for POST/PUT comment endpoints |
| `ShareDocumentRequest` | Payload for POST share endpoint |
| `DocumentWithShare` | Used on the Shared-with-Me list view |

## API Service — `src/services/api.ts`

### `sharesApi`
| Method | HTTP | Path |
|--------|------|------|
| `getShares(documentId)` | GET | `/api/documents/:id/shares` |
| `shareDocument(documentId, data)` | POST | `/api/documents/:id/shares` |
| `updatePermission(documentId, shareId, permission)` | PUT | `/api/documents/:id/shares/:shareId` |
| `revokeShare(documentId, shareId)` | DELETE | `/api/documents/:id/shares/:shareId` |
| `getSharedWithMe()` | GET | `/api/documents/shared-with-me` |

### `commentsApi`
| Method | HTTP | Path |
|--------|------|------|
| `getComments(documentId)` | GET | `/api/documents/:id/comments` |
| `addComment(documentId, data)` | POST | `/api/documents/:id/comments` |
| `updateComment(documentId, commentId, data)` | PUT | `/api/documents/:id/comments/:commentId` |
| `deleteComment(documentId, commentId)` | DELETE | `/api/documents/:id/comments/:commentId` |

## WebSocket Service — `src/services/websocket.ts`

Uses `@stomp/stompjs`. Connects to `ws://localhost:8080/ws?token=<JWT>` with a 5-second reconnect delay.

```
wsService.subscribeToDocumentComments(documentId, callback)
  → subscribes to /topic/documents/{docId}/comments
  → returns a StompSubscription (call .unsubscribe() on unmount)

wsService.disconnect()
  → deactivates and clears the client
```

The singleton `wsService` lazily creates the STOMP client on first subscription, reading the JWT from `localStorage.getItem('access_token')`.

## Pinia Stores

### `src/stores/shares.ts`
```
state:
  shares: DocumentShare[]        — shares for the current document
  sharedWithMe: DocumentWithShare[]
  loading: boolean

actions:
  fetchShares(docId)
  shareDocument(docId, data)
  updatePermission(docId, shareId, permission)
  revokeShare(docId, shareId)
  fetchSharedWithMe()
```

### `src/stores/comments.ts`
```
state:
  comments: Comment[]   — top-level comments; replies nested inside
  loading: boolean

actions:
  fetchComments(docId)
  addComment(docId, data)          — appends to root or to parent.replies
  updateComment(docId, commentId, data)
  deleteComment(docId, commentId)
  receiveRealtimeComment(comment)  — idempotent push from WebSocket
```

## Components

### `ShareModal.vue`
- Opens as a fixed-position modal with backdrop click-to-dismiss.
- Email input + permission dropdown (READ/COMMENT/WRITE) + Share button.
- Lists current shares with avatar, name, permission badge, and revoke button.
- Permission badge colors: READ=gray, COMMENT=blue, WRITE=green.

### `CommentsPanel.vue`
- 288px right-side panel, rendered inside `DocumentDetailView`'s flex row.
- Textarea at top for new top-level comments.
- Threaded list: top-level comments with indented replies.
- Inline reply input toggled per comment.
- Edit/Delete actions visible on hover, own comments only.
- Connects to WebSocket `onMounted`, unsubscribes `onUnmounted`.

## Views

### `SharedWithMeView.vue` — `/documents/shared-with-me`
- Lists `DocumentWithShare` rows: name, owner, permission badge, last modified.
- Clicking a row navigates to `/documents/:id`.
- Styled consistently with `DocumentsView` (scoped CSS, same table structure).

## Integration

### `DocumentDetailView.vue`
Added to the header toolbar:
- **Share button** → opens `ShareModal`
- **Comments toggle** → shows/hides `CommentsPanel` as a third column

### `DocumentsView.vue`
A "Shared with me →" text link below the subtitle routes to `/documents/shared-with-me`.

### Router
```ts
{ path: '/documents/shared-with-me', name: 'shared-with-me', ... }
```
Registered **before** `/documents/:id` so Vue Router doesn't treat `shared-with-me` as a dynamic segment.

### Sidebar (`AppSidebar.vue`)
"Shared with Me" nav item added between Documents and Clause Library. The Documents link active-class check excludes the `/documents/shared-with-me` path.
