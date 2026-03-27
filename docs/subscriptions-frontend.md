# Subscriptions, Billing & Multi-tenancy Frontend (M7)

## Overview

M7 adds subscription management, Stripe billing, usage metering, and organization/team management to the PaperLite frontend.

## Store Shape

### `useSubscriptionStore` (`src/stores/subscription.ts`)

| State | Type | Description |
|---|---|---|
| `plans` | `SubscriptionPlan[]` | All available plans fetched from API |
| `mySubscription` | `UserSubscription \| null` | Authenticated user's current subscription |
| `usage` | `UsageRecord \| null` | Current billing period usage |
| `loading` | `boolean` | Async loading flag |

Key actions: `fetchPlans`, `fetchMySubscription`, `fetchUsage`, `startCheckout(planId, billingCycle)`, `openPortal()`.

### `useOrganizationStore` (`src/stores/organization.ts`)

| State | Type | Description |
|---|---|---|
| `organizations` | `Organization[]` | All orgs the user belongs to |
| `currentOrg` | `Organization \| null` | Currently selected org with members |
| `loading` | `boolean` | Async loading flag |

Key actions: `fetchOrganizations`, `fetchOrganization(id)`, `createOrganization(name)`, `inviteMember`, `removeMember`, `updateMemberRole`.

## Stripe Redirect Flow

1. User clicks **Upgrade plan** → selects a plan in the modal → clicks **Select**
2. Frontend calls `subscriptionApi.createCheckout(planId, billingCycle)` → backend creates Stripe Checkout Session
3. Backend returns `{ checkoutUrl }` → frontend redirects via `window.location.href`
4. After payment, Stripe redirects back to the app (success/cancel URL configured server-side)

For portal access (manage existing subscription):
1. User clicks **Manage billing**
2. Frontend calls `subscriptionApi.createPortal()` → backend creates Stripe Billing Portal Session
3. Backend returns `{ portalUrl }` → frontend redirects

## Component Breakdown

| Component | Path | Purpose |
|---|---|---|
| `PlanBadge` | `src/components/PlanBadge.vue` | Colored tier badge (FREE/PRO/ENTERPRISE) |
| `UsageMeter` | `src/components/UsageMeter.vue` | Progress bar with color thresholds (>80% orange, >95% red) |
| `SettingsLayout` | `src/views/settings/SettingsLayout.vue` | Tab nav wrapper for settings sub-views |
| `AccountSettingsView` | `src/views/settings/AccountSettingsView.vue` | Profile info + delete account |
| `BillingSettingsView` | `src/views/settings/BillingSettingsView.vue` | Plan card, usage meters, upgrade/portal |
| `OrganizationSettingsView` | `src/views/settings/OrganizationSettingsView.vue` | Create org or view existing |
| `TeamSettingsView` | `src/views/settings/TeamSettingsView.vue` | Member table, pending invites, invite form |

## Routes

All settings routes are nested under `SettingsLayout` at `/settings`:

```
/settings             → redirect to /settings/account
/settings/account     → AccountSettingsView
/settings/billing     → BillingSettingsView
/settings/organization → OrganizationSettingsView
/settings/team        → TeamSettingsView
```

## API Services (`src/services/api.ts`)

- `subscriptionApi` — plan listing, current subscription, Stripe checkout/portal
- `usageApi` — current period usage record
- `organizationApi` — CRUD for organizations and member management
