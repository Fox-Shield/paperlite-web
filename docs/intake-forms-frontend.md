# Intake Forms — Frontend Documentation

## Overview

The intake forms feature lets users build embeddable client intake forms from
their document templates. Clients fill them out via a public, auth-free URL.
Responses are stored as submissions that can be reviewed from the dashboard.

---

## Routes

| Path | Component | Auth |
|---|---|---|
| `/intake-forms` | `IntakeFormsView` | Required |
| `/intake-forms/new` | `IntakeFormBuilderView` | Required |
| `/intake-forms/:id/edit` | `IntakeFormBuilderView` | Required |
| `/intake-forms/:id/submissions` | `IntakeFormSubmissionsView` | Required |
| `/forms/:formId` | `PublicIntakeFormView` | **None** |

The public route (`/forms/:formId`) intentionally has no `requiresAuth` meta
and no `AppSidebar`. It is the client-facing URL shared via the copy-link
button in the list view.

---

## Public Form Page (`PublicIntakeFormView`)

### Layout

The page is standalone — no sidebar, no nav. It renders:

1. **Header card** — accent colour bar, optional logo, title, welcome message,
   and a save-progress indicator when `allowSaveResume` is true.
2. **Fields card** — one input per `IntakeFormField`, rendered by `fieldType`.
3. **Submitter details card** — name + email inputs, error message, submit
   button (labelled by `form.submitButtonText`, coloured by `brandingColor`).

### Field type rendering

| `fieldType` | Input element |
|---|---|
| `TEXT` | `<input type="text">` |
| `NUMBER` | `<input type="number">` |
| `DATE` | `<input type="date">` |
| `BOOLEAN` | `<input type="checkbox">` with `true-value="true"` |
| `TEXTAREA` | `<textarea>` |
| `SELECT` | `<select>` with options from `field.options` |

### Conditional logic

Each `IntakeFormField` may have `isConditional: true` with a
`conditionalFieldId` and `conditionalValue`. The helper `isFieldVisible(field)`
performs a reactive lookup:

```ts
function isFieldVisible(field: IntakeFormField): boolean {
    if (!field.isConditional || !field.conditionalFieldId) return true
    const trigger = form.value?.fields.find(
        (f) => f.templateFieldId === field.conditionalFieldId
    )
    if (!trigger) return true
    return fieldValues.value[trigger.id] === field.conditionalValue
}
```

Fields are wrapped in `v-if="isFieldVisible(field)"`. Because `fieldValues` is
reactive and `isFieldVisible` reads from it, Vue automatically re-evaluates
visibility as the user types.

---

## Save & Resume Pattern

### How it works

1. On mount, `publicIntakeApi.start(formId)` is called to obtain a
   `sessionToken` (a UUID from the backend) and a `submissionId`.
2. If `allowSaveResume` is true, the token is persisted to localStorage under
   the key `intake_token_{formId}`.
3. When the page loads and a stored token is found, `publicIntakeApi.resume()`
   is called to restore previously saved field values.
4. As the user fills in fields, a debounced watcher (1 500 ms) calls
   `publicIntakeApi.save()` with the current values.
5. On successful submit, the localStorage entry is deleted.

### Storage key format

```
intake_token_{formId}
```

e.g. `intake_token_42`

### Resume failure

If the resume endpoint returns an error (e.g. token expired or submission
already processed), the stored token is removed and a fresh session is started.
This is silent to the user — they simply start with an empty form.

---

## Builder UI (`IntakeFormBuilderView`)

### Two-panel layout

- **Left (320 px)** — form settings: title, description, welcome message,
  submit button text, branding colour (colour picker + hex input), logo URL,
  allow save/resume toggle.
- **Right (flex-1)** — field configurator: one card per template field, showing
  label override, help text, required toggle, conditional toggle (expands to
  show field selector + value input when enabled).

### Create vs edit mode

The route param `:id` determines the mode. In create mode:
- A template selector is shown at the top of the left panel.
- When a template is selected, the watcher `watch(selectedTemplate, …)` builds
  `fieldRows` from the template's fields.
- On save, `createForm()` is called and the user is redirected to the edit
  route for the newly created form.

In edit mode the template selector is hidden and existing field configs are
loaded from `store.fetchForm(id)`.

### Drag-to-reorder

Each field card is `draggable="true"`. `@dragstart` records the source index;
`@drop` splices the array and resets `sortOrder` on every row. `sortOrder` is
sent to the API on save.

---

## Submissions View (`IntakeFormSubmissionsView`)

A table of all submissions for a given form. Clicking any row toggles an
expanded section beneath it that shows every `fieldId → value` pair, with the
field label resolved from `store.currentForm.fields`.

Status badges:
- `DRAFT` → grey
- `SUBMITTED` → blue
- `PROCESSED` → green

---

## Pinia Store (`intakeForms`)

```ts
// State
forms: IntakeForm[]
currentForm: IntakeForm | null
submissions: IntakeFormSubmission[]
loading: boolean

// Actions
fetchForms()           // GET /api/intake-forms
fetchForm(id)          // GET /api/intake-forms/:id
createForm(req)        // POST /api/intake-forms
updateForm(id, req)    // PUT /api/intake-forms/:id
deleteForm(id)         // DELETE /api/intake-forms/:id  (deactivates)
fetchSubmissions(id)   // GET /api/intake-forms/:id/submissions
```

---

## API Service (`src/services/api.ts`)

Two named exports are added alongside the default `api` axios instance:

- **`intakeFormsApi`** — authenticated methods (list, get, create, update,
  remove, submissions).
- **`publicIntakeApi`** — unauthenticated methods using a separate axios
  instance with no 401-redirect interceptor (getForm, start, save, submit,
  resume).

The store uses the default `api` instance directly (consistent with other
stores). The public form view uses `publicIntakeApi`.
