# Performance — M8 Optimization Notes

## Code Splitting (Lazy Loading)

All route components were already using dynamic imports (`() => import(...)`) in `src/router/index.ts` as of M7.
`LoginView` and `RegisterView` remain as dynamic imports since they are guest-only entry points and small enough not to warrant eager loading.

## Manual Chunks (`vite.config.ts`)

```ts
rollupOptions: {
    output: {
        manualChunks: {
            'vendor-vue': ['vue', 'vue-router', 'pinia'],
            'vendor-axios': ['axios']
        }
    }
}
```

This prevents the Vue runtime, router, Pinia and Axios from being bundled into every route chunk, reducing initial parse time for large routes.

## API Response Caching

Two stores have a 5-minute TTL cache to avoid redundant fetches on repeated navigation:

### `src/stores/templates.ts`
- Added `lastFetched: Ref<number | null>`
- `fetchTemplates(workspaceId, force = false)` skips the network call if data is less than 5 minutes old
- Pass `force: true` to bypass (e.g. after creating/deleting a template)

### `src/stores/clauses.ts`
- Added `lastFetched: Ref<number | null>`
- `fetchClauses(workspaceId?, force = false)` applies the same 5-minute TTL
- Pass `force: true` after mutations

### Cache TTL constant
```ts
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
```

## CSS Minification

`cssMinify: false` is intentionally kept to work around a Vite 8 + rolldown + `@tailwindcss/vite` upstream bug where `@keyframes` blocks are misparsed.

## Bundle Analysis

To analyze the bundle, run:
```bash
pnpm build
npx vite-bundle-visualizer
```
