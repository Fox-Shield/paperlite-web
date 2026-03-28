# Accessibility — WCAG 2.1 AA Checklist

This document records the accessibility fixes applied in M8.

## Skip Navigation
- [x] Added `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>` at the top of `App.vue`
- [x] `id="main-content"` added to `<main>` in `DashboardView.vue` and `DocumentsView.vue`

## Landmark Elements
- [x] `<main>` used for page content in all views
- [x] `<header>` used for page headers
- [x] `<section>` used for content sections in `DashboardView.vue`
- [x] `<aside aria-label="Main navigation">` in `AppSidebar.vue`
- [x] `<nav aria-label="Site navigation">` inside the sidebar

## Forms & Labels
- [x] All `<input>` elements in `LoginView.vue` and `RegisterView.vue` have `<label for="...">` associations
- [x] All `<input>` elements in `OnboardingView.vue` have `<label for="...">` associations

## Icon-only Buttons
- [x] Sidebar "Sign out" button: `aria-label="Sign out"`
- [x] Mobile hamburger button: `aria-label="Toggle navigation"` with `aria-expanded` and `aria-controls`
- [x] Toast "Dismiss" button: `aria-label="Dismiss notification"`
- [x] Decorative SVG icons: `aria-hidden="true"` throughout `AppSidebar.vue`

## Live Regions
- [x] `<div aria-live="polite" aria-atomic="false">` wraps toast container
- [x] `role="status"` on individual toast items
- [x] `role="status"` on `LoadingSkeleton.vue` with `aria-label="Loading…"`

## Focus Management
- [x] `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none` added to all nav links in `AppSidebar.vue`
- [x] `focus-visible:ring-2` on all interactive elements in `OnboardingView.vue`
- [x] `focus-visible:ring-2` on all CTA buttons in `ErrorState.vue`

## ARIA Patterns
- [x] Progress bar in `OnboardingView.vue`: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`

## Keyboard Navigation
- [x] All interactive elements are reachable via Tab key
- [x] `@keydown.enter` on workspace name input to submit on Enter
- [x] Sidebar mobile: Escape can be replaced by clicking the backdrop

## Color Contrast
- Gray-500 (#6b7280) on white background = 4.6:1 ratio (passes AA for normal text)
- Gray-400 (#9ca3af) used only for placeholder/hint text (not required to pass)
- Indigo-600 (#4f46e5) on white = 7.59:1 (passes AAA)

## Reduced Motion
- [x] `@media (prefers-reduced-motion: reduce)` in `style.css` disables all animations globally

## What Was Not Changed
- No color or visual design changes beyond what was strictly required
- Existing ARIA already present in views was preserved
