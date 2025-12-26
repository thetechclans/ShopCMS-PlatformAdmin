# ShopCMS Dynamic Content Performance – AI Agent Prompt

Use this prompt with another Codex/AI agent to eliminate **visible delays and stale content** for CMS‑driven pages in ShopCMS.

The core business requirement is:

- When a tenant updates content in the CMS, **end users must only see the latest dynamic content**.
- The app must **not show “old” or placeholder template data for 2–5 seconds** while fresh data is loading.
- It is acceptable to show a loading/skeleton state; it is **not acceptable** to show incorrect or outdated content, even briefly.

This document describes **phases and tasks** to make dynamic content loading feel instant and consistent, while respecting technical reality (network and database latency cannot be literally 0ms).

---

## Phase 1 – Map Current Dynamic Content & Stale UI Cases

**Goal:** Precisely understand where and why users see 2–5 seconds of wrong/static content.

**Tasks:**

- Identify all **CMS‑driven pages** in the Tenant app (`ShopCMS-Tenant`) that show delayed or stale content:
  - Public storefront:
    - `PublicHome.tsx` (home page sections, carousel, menus, footer).
    - `CategoryProducts.tsx`, `ProductDetail.tsx`, `StaticPage.tsx`.
  - Admin:
    - `Dashboard.tsx`, `HomePageBuilder.tsx`, `Pages.tsx`, `Products.tsx`, `Categories.tsx`, etc.
- For each page:
  - Trace how data is loaded:
    - Which hooks are used (`useHomePageData`, `useTenantQuery`, direct Supabase queries).
    - How TanStack Query is configured (`staleTime`, `refetchOnMount`, `keepPreviousData`, etc.).
  - Note where the UI:
    - Shows **static fallback content** (e.g. default template sections).
    - Renders **previous data** while new data is refetching.
    - Shows **no explicit loading state** during the 2–5s delay.
- Document a short list of **problem routes** and the exact symptoms:
  - “Home page shows old carousel for ~3s after updating in CMS.”
  - “Static text from template flashes before real CMS content appears.”

No code changes yet; just a clear inventory of where stale content appears.

---

## Phase 2 – Standardize Data Fetching & Loading States

**Goal:** Ensure that **no page renders stale content** while fetching; show loaders/skeletons instead.

**Tasks:**

- Create a **data‑fetching guideline** for all CMS pages:
  - Use TanStack Query for all dynamic data loads where possible.
  - Configure queries to avoid stale UI:
    - Prefer `keepPreviousData: false` so old data is not reused while refetching.
    - Use `refetchOnMount: "always"` for key CMS pages where freshness is critical.
    - Set `staleTime` appropriately (often `0` or very low for CMS content that must always be current).
- Implement or reuse **consistent loading states**:
  - For public pages:
    - Skeleton banners, cards, or sections instead of template defaults.
  - For admin pages:
    - Clear loading spinners or skeletons for tables, forms, and builders.
- Refactor pages that currently:
  - Render hard‑coded “example” content before data arrives.
  - Show previous query results while new content is being requested.
  - To instead:
    - Render nothing or a skeleton while `isLoading` (no data yet).
    - Optionally show a subtle “Refreshing…” indicator when `isFetching` with existing data.

The key rule: **during loading, show loading states — never stale content.**

---

## Phase 3 – Real‑Time Invalidations & Instant Content Refresh

**Goal:** Make newly published CMS content appear in the UI as soon as possible **without manual reload**.

**Tasks:**

- Use **Supabase Realtime** (or similar) to push content changes:
  - Subscribe to changes on key tables:
    - `pages`, `carousel_slides`, `categories`, `products`, `footer_config`, `menu_items`, etc.
  - Scope subscriptions by `tenant_id` so each tenant only receives their own updates.
- Integrate realtime events with TanStack Query:
  - On relevant insert/update/delete events:
    - Call `queryClient.invalidateQueries` for the affected queries:
      - e.g. `["home-page-sections", tenantId]`, `["products", tenantId]`, etc.
  - This triggers a refetch so freshly updated content is pulled immediately.
- In key CMS editors (e.g. `HomePageBuilder`, `Pages`):
  - After a successful write:
    - Invalidate or update query caches immediately.
    - Optionally optimistically update the cache to reflect the new state.

Result: As soon as a CMS update is saved, any open storefront/Admin pages refetch or update content automatically, minimizing the window where old content might appear.

---

## Phase 4 – Query & Database Performance Optimization

**Goal:** Reduce actual server and database latency so “fresh” content arrives quickly.

Even though we hide loading with skeletons, we still want fast responses.

**Tasks:**

- Profile **supabase queries** for slow pages:
  - Use Supabase logs or local profiling to find queries taking > 300–500ms.
  - Focus on:
    - Home page data (`useHomePageData`).
    - Product/category listings.
    - Complex joins (e.g. products + images + categories).
- Optimize queries:
  - Add or refine indexes on:
    - `tenant_id`, `slug`, `is_published`, `display_order`, and other high‑cardinality filters.
  - Avoid over‑fetching:
    - Select only the columns needed by the UI.
    - Avoid deep nested selects unless necessary.
  - Extract expensive aggregations into:
    - Materialized views or pre‑computed tables.
- Apply pagination & limits where needed:
  - Don’t load hundreds of items when only a handful are visible.
  - Use server‑side pagination for admin lists.

Goal is not literal 0.1ms, but to keep most content queries comfortably under a few hundred milliseconds.

---

## Phase 5 – Prefetching & Navigation Optimizations

**Goal:** Hide remaining latency by **pre‑loading** content before the user navigates to it.

**Tasks:**

- Implement **prefetch on intent** in the Tenant app:
  - When the user hovers or focuses a link to a CMS-heavy page (e.g. a product detail or category page):
    - Call `queryClient.prefetchQuery` for that page’s query key.
  - This way, by the time the user clicks, most data is already in cache.
- Preload **home page sections**:
  - During initial load, fetch all necessary CMS blocks in parallel:
    - Carousel, categories, text sections, menu, footer.
  - Use TanStack Query’s multiple queries rather than sequential `await`s.
- In Admin:
  - Prefetch frequently used data (e.g. product/categories counts) on dashboard load.

These techniques do not reduce network latency, but they make pages appear ready to the user as soon as they navigate.

---

## Phase 6 – Strict “No Stale Content” UI Rules

**Goal:** Enforce across the codebase that **stale or placeholder content must never show in place of real CMS data**.

**Tasks:**

- Define a simple rule in code and docs:
  - “If data is not loaded yet, show a loading/skeleton state. Once loaded, show only current data. Do not render hard‑coded sample content that mimics real data.”
- Create a checklist for any CMS‑driven component:
  - Does it rely on TanStack Query (or similar) with correct `isLoading`/`isFetching` handling?
  - Does it ever use static fallback content in place of real data?
  - Does it ever show previous data while a refetch is happening, when that would be misleading?
- Refactor legacy components that violate this:
  - Replace “placeholder real‑looking data” with neutral skeletons or “Loading…” states.
  - Limit the use of `keepPreviousData` to cases where showing old data is acceptable (e.g. paginated lists, not CMS content).

This phase is about UX correctness: users should never see content that looks “real” but is actually stale.

---

## Phase 7 – Configuration, Tuning & Monitoring

**Goal:** Make it easy to tune freshness/latency trade‑offs and monitor whether the new system is working.

**Tasks:**

- Centralize TanStack Query defaults for CMS content:
  - In the QueryClient configuration:
    - Define sensible global defaults (`staleTime`, `refetchOnWindowFocus`, `retry`).
  - Override per‑query only where necessary (e.g. home page vs dashboard).
- Add lightweight analytics/telemetry for:
  - Average API response time per key CMS query.
  - Frequency of realtime invalidations.
  - Percentage of page loads that use fresh vs cached data.
- Periodically review logs and adjust:
  - If certain queries are consistently slow, optimize or precompute.
  - If certain pages show too many refetches, adjust cache settings.

---

## Phase 8 – Developer Documentation & Guardrails

**Goal:** Ensure future changes do not accidentally reintroduce visible delays or stale content.

**Tasks:**

- Write a short **developer guideline** (in README or a dedicated doc):
  - How to fetch CMS data with TanStack Query in this project.
  - How to use `useFavicon`, `useHomePageData`, and any realtime hooks correctly.
  - Examples of correct loading states vs. incorrect placeholder content.
- Add simple tests or automated checks where feasible:
  - E2E tests that validate:
    - After editing content in admin, the storefront updates without showing old data.
    - A new tenant with no content doesn’t show someone else’s content or demo content.
- Encourage code review checks:
  - Reviewers confirm new CMS pages follow the “no stale content” rule and use the standard patterns.

---

Use this roadmap as a guide when updating the Tenant app and backing Supabase schema.  
The aim is to make dynamic content feel **immediate and trustworthy**: users either see a clear loading state or the correct, freshly updated CMS data — never misleading, outdated content. 

