# ShopCMS Platform Admin – Project Overview

## High-Level Purpose

ShopCMS is a multi-tenant e‑commerce CMS built on Supabase, React, Vite, React Router, and TanStack Query.
This repository (`ShopCMS-PlatformAdmin`) is the **platform owner’s control panel**:

- Manages tenants (shops) and their lifecycle.
- Controls subscription **plans** (Basic / Silver / Gold) and usage limits.
- Manages plan‑based **home page templates** and design defaults.
- Coordinates with the tenant application (`ShopCMS-Tenant`) that each shop owner uses.

The companion repo `../ShopCMS-Tenant` is the **tenant-facing app**:

- Public storefront (home page, categories, product pages, static pages).
- Tenant admin panel (Dashboard, Products, Categories, Pages, Users, Settings, Home Page Builder).
- Enforces plan limits and features per tenant.

Together they form a small SaaS: the Platform Admin sells plans and configures defaults, and each Tenant app renders content and tools based on the tenant’s plan and data.

## Main Business Flows (End-to-End)

### 1. Tenant Creation & Plan Assignment (Platform Admin → Tenant App)
- Platform admin logs in and navigates to `/platform/admin/tenants` via `PlatformAdminLayout.tsx`.
- In `TenantsTab.tsx`, the admin creates a new tenant with:
  - `name`, `slug`, `subdomain`, `status`.
  - `plan_type` (Basic / Silver / Gold) chosen once at creation.
- On create, `TenantsTab.tsx`:
  - Inserts a row in `tenants`.
  - Inserts matching limits in `tenant_limits` based on plan presets (max products, categories, carousel slides, static pages, image size).
- Tenant app (`ShopCMS-Tenant`) later reads from `tenant_limits` (e.g. via `usePlanFeatures` and `TenantTemplateRouter`) to:
  - Enforce **usage limits**.
  - Decide which **template** and features are available.

### 2. Plan Limits & Upgrades
- Platform admin uses `/platform/admin/limits` (see `TenantLimitsTab.tsx`) to:
  - Inspect and edit per-tenant `tenant_limits` rows.
  - Change `plan_type` and adjust limits (max products, categories, etc.).
- Tenant code uses:
  - `usePlanFeatures.ts` to derive `PlanFeatures` such as `canAccessThemes`, `canAccessAdvancedFeatures`, and limits.
  - `FeatureGate.tsx` and `UpgradePrompt.tsx` to hide or lock features and prompt tenants to upgrade.
- `UsageMeter.tsx` provides visual meters for usage vs. limit and encourages upgrades when near or at limit.

### 3. Template Configuration by Plan (Platform Admin)
- `PlatformAdminLayout.tsx` sidebar exposes:
  - **Plan Templates** links: `/platform/admin/templates/basic`, `/templates/silver`, `/templates/gold`.
- `TemplateEditor.tsx` and `TemplateHomePageDesigner.tsx` manage template configurations stored in `plan_template_configs` and related tables:
  - Colors, fonts, layout options, default sections, carousel style, etc.
  - Each record is tied to a `plan_type`.
- These settings define default “look and feel” for each plan.

### 4. Tenant Home Page Rendering & Themes (Tenant App)
- Tenant public home (`PublicHome.tsx` in `ShopCMS-Tenant`) fetches:
  - Carousel slides, categories, sections, navbar/footer configs.
- `TenantTemplateRouter.tsx` (in Platform Admin shared components) picks the correct React template based on `tenant_limits.plan_type`:
  - `BasicTemplate.tsx` for `basic`.
  - `SilverTemplate.tsx` for `silver`.
  - `GoldTemplate.tsx` for `gold`, optionally reading a selected `theme_id` from `profiles` and `themes`.
- Gold tenants can have additional theming (e.g. dark / light variants) based on the stored theme information.

### 5. Tenant Content Management (Tenant App)
- Authenticated tenant users access `/admin` inside `TenantApp.tsx`, which wraps pages in `AdminLayout`.
- Important admin pages:
  - `Dashboard.tsx` – summary stats (products, categories, pages, published products).
  - `Products.tsx`, `Categories.tsx`, `Pages.tsx` – CRUD for core content tables.
  - `HomePageBuilder.tsx` – tenant-specific home page layout builder.
  - `Users.tsx`, `Settings.tsx` – user management and general shop settings.
- Plan limits influence:
  - How many products/categories/pages can be created.
  - Which advanced features are accessible via `FeatureGate` and `usePlanFeatures`.

### 6. Platform vs Tenant Routing
- Platform admin app entry: `PlatformApp.tsx`:
  - Defines `/` (landing), `/auth` (platform auth), `/platform/admin/*` (secured admin routes).
  - Uses `PlatformAdminGuard.tsx` with Supabase auth to protect admin routes.
- Tenant app entry: `TenantApp.tsx`:
  - Public routes: `/`, `/category/:slug`, `/product/:slug`, `/page/:slug`, `/auth`.
  - Tenant admin routes under `/admin` with `AdminLayout`.
- `platformConfig.ts` defines `PLATFORM_DOMAIN` and `isPlatformDomain` to distinguish between platform and tenant domains.

## Key Files and Responsibilities

**Platform Admin (`ShopCMS-PlatformAdmin`):**
- `src/PlatformApp.tsx:1` – React Router setup for platform landing, auth, and admin.
- `src/pages/platform/PlatformAdminLayout.tsx:1` – Shell layout and sidebar for admin section.
- `src/pages/platform/PlatformAdminGuard.tsx:1` – Supabase-based gate for `/platform/admin` routes.
- `src/pages/platform/TenantsTab.tsx:1` – Full tenant CRUD, plan selection, and default limit creation.
- `src/pages/platform/TenantLimitsTab.tsx:1` – Per-tenant plan limits editing and plan upgrades/downgrades.
- `src/pages/platform/TemplatesBasic.tsx`, `TemplatesSilver.tsx`, `TemplatesGold.tsx` – Entry points for plan template editing.
- `src/pages/platform/TemplateEditor.tsx:1` – Generic editor for `plan_type` template configuration.
- `src/templates/BasicTemplate.tsx`, `SilverTemplate.tsx`, `GoldTemplate.tsx` – Rendered templates for tenant storefronts.
- `src/components/TenantTemplateRouter.tsx:1` – Chooses template based on `tenant_limits.plan_type` and optional theme for Gold.
- `src/hooks/usePlanFeatures.ts:1` – Derives plan features and limits from `tenant_limits`.
- `src/components/FeatureGate.tsx:1` – Reusable plan-based access control wrapper.
- `src/components/UpgradePrompt.tsx:1` – UI shown when feature requires higher plan.
- `src/components/UsageMeter.tsx:1` – Usage vs limit visualization for products/categories/etc.
- `src/lib/tenantCache.ts:1` – Cache invalidation helpers for tenant-specific queries.
- `src/lib/platformConfig.ts:1` – Platform domain and helper to distinguish platform vs tenant domain.
- `src/integrations/supabase/client.ts` – Supabase client initialization (shared dependency).
- `src/integrations/supabase/types.ts:1` – Typed shapes of the Supabase DB (including `tenants`, `tenant_limits`, `plan_template_configs`).

**Tenant App (`ShopCMS-Tenant`):**
- `src/TenantApp.tsx:1` – Routing for tenant public site and admin panel, wired to `TenantProvider`.
- `src/contexts/TenantContext.tsx` – Provides `tenantId` and context for tenant-specific queries.
- `src/pages/Dashboard.tsx:1` – Tenant content stats dashboard (products, categories, pages, published count).
- `src/pages/Products.tsx`, `Categories.tsx`, `Pages.tsx` – CRUD experiences for main content.
- `src/pages/HomePageBuilder.tsx` – Layout builder for home page sections and carousel.
- `src/pages/PublicHome.tsx`, `CategoryProducts.tsx`, `ProductDetail.tsx`, `StaticPage.tsx` – Public storefront pages.

## Current Drawbacks and Mistakes (High-Level)

**Architecture & Separation:**
- Platform and Tenant apps share concepts (`tenant_limits`, `plan_type`, templates) but do not share a common TypeScript library:
  - Risk of duplicated logic (e.g. plan features, types) diverging over time.
  - Plan rules and analytics logic may be implemented twice if not centralized.

**Plan Handling & Safety:**
- `plan_type` is usually a loose `string` coming from Supabase and then cast to `'basic' | 'silver' | 'gold'` in hooks/components instead of being validated:
  - If new plan types are added or DB values get out of sync, the UI will silently treat them as basic or break in non-obvious ways.
  - There is no central `enum` or “plan registry” module.
- Tenant creation (`TenantsTab.tsx`) always creates `tenant_limits` but does not handle idempotency or concurrency:
  - Multiple attempts could create inconsistent state if not guarded by DB constraints.

**Feature Gating & Usage Limits:**
- `FeatureGate` currently only knows about **Silver** and **Gold**; there is no explicit representation of what Basic plan *can* do, only what it cannot:
  - Harder to reason about exactly which screens are plan-restricted.
  - Adding new plans or feature tiers will require ad hoc updates instead of configuration-driven changes.
- Usage limits enforcement is mostly UI‑side (via counts, `UsageMeter`, etc.):
  - It’s unclear if the backend/Supabase functions enforce limits or constraints (e.g. triggers), which is important for preventing bypass via direct API calls.

**Routing & Domain Logic:**
- `platformConfig.ts` uses a single `PLATFORM_DOMAIN` string and `isPlatformDomain` helper:
  - Multi-environment (dev/staging/prod) handling is not clearly expressed here.
  - There is no shared “tenant routing” helper to translate `subdomain` and `slug` into URLs consistently across Platform and Tenant UIs.

**Analytics (Current State):**
- Supabase analytics is wired via:
  - `public.analytics_events` and `public.tenant_daily_metrics` (see `supabase/migrations/20251212090000_analytics_events.sql`).
  - RLS policies that restrict analytics reads to Silver/Gold tenants whose `profiles.tenant_id` matches.
  - Platform reads are enabled for `super_admin` users via `supabase/migrations/20251213091000_analytics_super_admin.sql`.
- Tenant app (`../ShopCMS-Tenant`) now has:
  - A shared analytics helper (`src/lib/analytics.ts`) and `useAnalytics` hook for page/product/category events.
  - Route-based page view tracking and a plan-gated `/admin/analytics` dashboard that only Silver/Gold tenants can access.
- Platform Admin exposes:
  - `src/pages/platform/PlatformAnalytics.tsx` under `/platform/admin/analytics`, which shows:
    - Tenant counts per plan.
    - Time-windowed KPIs using the `platform_kpis(p_days)` RPC.
    - Top tenants by traffic using the `top_tenants_by_traffic_in_range(p_days)` RPC.

**Documentation & Discoverability:**
- Existing README files in both projects are minimal and do not document:
  - How plans work (limits, features) end to end.
  - How platform and tenant apps communicate conceptually.
  - How to extend with new plans or themes.

## Project Motive and Achievements

**Motive:**
- Provide a multi-tenant, low-code e‑commerce CMS where:
  - Platform admins sell tiered plans (Basic / Silver / Gold).
  - Tenant owners can quickly configure a storefront, pages, and products.
  - Visual templates and limits are plan-driven, enabling clear pricing tiers.

**Key Achievements So Far:**
- Multi-tenant architecture with Supabase backing:
  - Separate `tenants`, `tenant_limits`, and content tables.
- Clean plan-based UX:
  - Plan badges and visual cues (`PlanBadge`, `UsageMeter`, template selection).
  - `FeatureGate` and `UpgradePrompt` provide a solid foundation for upsells.
- Theming & templates:
  - Three plan-specific templates with a router (`TenantTemplateRouter`) that chooses correctly per tenant plan.
  - Gold-specific theme support via `themes` and `profiles.theme_id`.
- Organized React/Vite stack:
  - Vite + React + TanStack Query + Tailwind + Radix UI.
  - Clear separation between Platform Admin and Tenant apps.

## Important Notes (For Future Development)

- **Plan Types as a Source of Truth:**
  Introduce a central `plans` module (shared between Platform and Tenant) that defines:
  - Plan IDs (`basic`, `silver`, `gold`).
  - Display names, feature flags, and default limits.
  - Mapping from DB values to TypeScript types.

- **Feature/Limit Enforcement:**
  Move towards a combination of:
  - UI gating (`FeatureGate`, `UsageMeter`).
  - Backend enforcement (Postgres constraints or Supabase functions) for critical limits.

- **Analytics Integration (Current State & Extensibility):**
  Analytics is wired end-to-end with clear plan rules:
  - Only **Silver** and **Gold** plan tenants see analytics menus and dashboards.
  - Basic plan tenants do not see analytics menu items or pages and cannot read analytics tables due to RLS.
  As you extend analytics:
  - Add new event types or dimensions to `analytics_events` and update aggregation views/RPCs.
  - Grow `PlatformAnalytics.tsx` into a richer cross-tenant analytics and health overview.

- **Shared Code Between Platform and Tenant:**
  Consider a small shared library or internal package (e.g. `ShopCMS-core`) for:
  - Supabase schema types (generated once).
  - Plan definitions and feature flags.
  - Analytics event names and payload typings.

- **Environment and Multi-Domain:**
  As you grow:
  - Make `PLATFORM_DOMAIN` and tenant URL construction environment-aware.
  - Standardize URL schemes for tenant subdomains and slugs so both apps generate consistent links.

- **Extensibility for New Plans:**
  Design with future plans in mind (e.g. Platinum):
  - Avoid hard-coded plan checks scattered across code.
  - Use configuration-driven plan capabilities so adding a new plan is mostly data work.

---

This README is meant as a high-level architecture and business-flow overview for the Platform Admin and its relationship with the Tenant app. For detailed implementation, consult the referenced file paths in each section.







# Get Changes
git diff --patch origin/Original_Code_v3-3..Development > changes.patch


# Deploy Database Migrations
supabase migration up --linked

# Deploy Functions First
supabase functions deploy tenant-signup --project-ref biofpmqafyjcemhffnus

supabase functions deploy tenant-signup --project-ref default

supabase db push --db-url "postgresql://postgres:Amira%402594@168.220.234.220:5433/postgres?sslmode=disable" --debug


supabase db push --db-url "postgresql://postgres:Amira_2594@168.220.234.220:5433/postgres?sslmode=disable" --debug
