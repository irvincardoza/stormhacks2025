## Core Principles

* **DRY always.** Reuse existing code; do not duplicate logic. You have full freedom to search the codebase for reusable pieces.
* **No artifacts.** Remove dead code, unused imports, and leftover comments.
* **Less is more.** Prefer smaller, simpler solutions; rewrite existing components over adding new ones when possible.
* **No hidden fallbacks.** Let failures be visible; don’t silently mask errors.
* **Flag obsolete files** for removal to keep the repo lean.
* **Avoid race conditions** at all costs.
* **Think first, then code.** Deep reasoning upfront is cheaper than fixing later.

## Process / Output Rules

* **Do not use `git` to get context** (it can be outdated/wrong).
* **Show full code for changed sections.** Never say “unchanged”; output the full component unless told otherwise.
* **Be explicit about snippet placement** (e.g., “below ‘abc’”, “above ‘xyz’”).
* If only one function changes, **show just that function**.

---

## React/Next.js + Data Fetching Rules

### Don’t fetch or derive app state in `useEffect`

Reserve `useEffect` (or `useLayoutEffect`) **only** for real external side-effects (DOM, subscriptions, analytics, non-React widgets/listeners). Compute derived state during render (use `useMemo` only if expensive).

#### If your `useEffect` was doing X → Use Y

* **Fetching on mount/params change** → use a **route loader / server fetch** (SSR + streaming). With TanStack, use **Router loaders** and optionally seed React Query with `queryClient.ensureQueryData`. In Next.js, prefer **Server Components**, **Route Handlers**, or `getServerSideProps`/`generateStaticParams` where applicable.
* **Submitting/mutating** → do work in a **Server Function / Route Handler / Server Action**, then **invalidate** caches:

  * TanStack: `router.invalidate()` and/or `queryClient.invalidateQueries()`.
  * Next.js App Router: `revalidatePath`/`revalidateTag` and/or `queryClient.invalidateQueries()`.
* **Syncing UI to the query string** → **typed search params** + navigation (`validateSearch`, `Route.useSearch`, `navigate`). In Next.js, model state in the URL with the **`searchParams`** prop and typed parsers (e.g., Zod).
* **Subscribing to external stores** → `useSyncExternalStore`.
* **Pure derived state** → compute in render (no effect).

#### Idiomatic patterns

* **Preload on navigation**: `queryClient.ensureQueryData(queryOptions({ queryKey, queryFn }))`; read with `useSuspenseQuery` from a hydrated cache.
* **Mutations**: `createServerFn(...).handler(...)` (TanStack Start) or **Server Actions/Route Handlers** (Next.js). On success: `queryClient.invalidateQueries()` and/or `router.invalidate()`. Progressive enhancement supported via `<form action={serverFn.url}>`.
* **Search params as state**: `validateSearch` → `Route.useSearch` → `navigate({ search })` (TanStack) or **typed `searchParams`** (Next.js).
* **External store reads**: `useSyncExternalStore(subscribe, getSnapshot)`.

#### Decision checklist

* **Needed at render?** Fetch in a **loader/server** path (can defer/stream).
* **User changed data?** Use a **Server Function/Action**, then **invalidate**.
* **Belongs in URL?** Use **typed search params**.
* **Purely derived?** Compute in render.
* **External system only?** Use a **small `useEffect`/`useLayoutEffect`**.
* **SSR/SEO needed?** Prefer loader-based/server fetching; configure streaming/deferred where supported.

#### React 19 helpers

* `useActionState` for form pending/error/result (pairs with Server Functions, Server Actions, or TanStack Form).
* `use` to suspend on promises (client or server) where appropriate.

---

## Frontend Timing Rule

Avoid using `setTimeout` to manage UI state (e.g., toggling `setState` after a delay). It causes race conditions and inconsistent UIs. If a delay is truly necessary, **encapsulate it in a custom hook with cleanup** and cancellation.

---

## State Management

### React Query / TanStack Query

* Keep **server data** in loaders/queries, not in ad-hoc effects.
* Use **prefetch/ensureQueryData** on navigation to hydrate caches for `useSuspenseQuery`.
* After mutations, **invalidate** relevant queries and/or **router**.

### Zustand (with SSR: TanStack Start or Next.js)

* Use for **client/UI/session** and push-based domain state (theme, modals, wizards, optimistic UI, WebSocket buffers).
* **Per-request store instance** to avoid SSR leaks; inject via context/provider.
* **Dehydrate/hydrate** with the router or app (e.g., `router.dehydrate/router.hydrate` or Next.js serialize on the server and rehydrate on the client) so snapshots stream with the page.
* After navigation resolution, **clear transient UI** (e.g., `router.subscribe('onResolved', …)`).
* Mutations: perform on the **server**; optionally update the store **optimistically**, then reconcile via **invalidate**.
* Add **persist middleware** only for **client/session** state; **avoid touching storage during SSR**.
* Use **atomic selectors** (`useStore(s => slice)`) and **equality helpers** to limit re-renders.

---

## Expert Development Guidelines

### Objective

Produce optimized, secure, and maintainable **Next.js + TypeScript + Prisma** code.

### Code Style & Structure

* Concise, technical **TypeScript**; **functional/declarative** patterns (avoid classes).
* Favor composition & modularization over duplication.
* Descriptive names with auxiliaries (`isLoading`, `hasError`).
* Recommended file structure: exported component → subcomponents → helpers → static content → types.
* **Directories**: lowercase-with-dashes (e.g., `components/auth-wizard`).

### Optimization & Best Practices

* Prefer **React Server Components (RSC)** and SSR features; **minimize** `'use client'`, `useEffect`, and `setState`.
* Use **dynamic imports** for code splitting when modules are optional/heavy.
* **Responsive**, mobile-first design.
* **Image optimizations**: WebP/AVIF where possible, include intrinsic size data, lazy-load.

### Error Handling & Validation

* Prioritize edge cases with **early returns** and **guard clauses**.
* Use **custom error types** for consistency.
* Validate inputs and schemas with **Zod**.

### UI & Styling

* PLEASE! Use modern frameworks (Tailwind CSS, Shadcn UI, Radix UI).
* Keep patterns consistent and responsive across platforms.

### Security & Performance

* Validate user input, sanitize outputs, and follow secure coding practices.
* Reduce load times via streaming, caching, code splitting, and efficient data access.
* Avoid race conditions (see `setTimeout` and `useEffect` guidance above).

### Testing & Documentation

* Add clear, concise comments for complex logic.
* Prefer small, testable units and deterministic behavior (no time-based flakiness).



---
