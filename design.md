# Spurs Pay: Design System & UI Guidelines

This document outlines the design principles, color palettes, typography, component standards, and copywriting guidelines for the Spurs Pay platform. The goal is to maintain a cohesive, enterprise-grade B2B SaaS experience that prioritizes data density, readability, secure transactions, and a frictionless developer experience.

## 1. Design Principles
*   **Data-First & High-Density:** Merchants need immediate access to revenue metrics and transaction statuses. Prioritize numbers, trends, and actionable alerts.
*   **Clear Hierarchy:** Use subtle background variations (e.g., `bg-neutral-50` to `bg-white`) and borders to separate content areas rather than heavy drop shadows.
*   **Accessible & Compliant:** Ensure all text passes WCAG AA contrast standards, particularly semantic colors used for success, error, and pending states. 
*   **Developer-Centric:** Integration tools, API keys, and code snippets must be as prominent and thoughtfully designed as financial operations.

---

## 2. Color Palette (Tailwind CSS)

We use Tailwind's default color system with strict semantic mapping to ensure consistency across Light and Dark modes.

### Brand & Primary
*   **Primary Accent:** `blue-600` (Light) / `blue-500` (Dark)
    *   *Usage:* Primary buttons, active navigation states, primary text links, focus rings.

### Semantic & Status
Used heavily in `StatusBadge`, alerts, and `StatCard` trend indicators.
*   **Success (Successful payments, positive trends):** `emerald-600` / `emerald-400`
*   **Warning (Pending, Test Mode, expiring keys):** `amber-600` / `amber-500`
*   **Danger (Failed payments, negative trends, destructive actions):** `red-600` / `red-400`
*   **Neutral (Refunded, disabled states):** `neutral-600` / `neutral-400`
*   **Info (Partial refunds, system updates):** `violet-600` / `violet-400`

### Backgrounds & Surfaces
*   **App Background (Light):** `bg-neutral-50`
*   **App Background (Dark):** `bg-slate-950` (Provides deeper contrast than standard neutral)
*   **Card/Surface (Light):** `bg-white` with `border-neutral-200`
*   **Card/Surface (Dark):** `bg-neutral-900/40` or `bg-slate-900` with `border-neutral-800`

---

## 3. Typography & Data Formatting

*   **Font Family:** Default Next.js sans-serif stack (`font-sans`).
*   **Headings:** Use `tracking-tight` to give a modern, compact enterprise feel.
*   **Data/Numbers:** 
    *   Use `font-mono` for transaction references, API keys, webhook secrets, and database IDs.
    *   Use standard sans-serif for currency amounts, formatted consistently with `font-semibold` or `font-bold`.
*   **Secondary Text:** `text-neutral-500`. Used for table headers, input hints, and subtitles.

---

## 4. Iconography

We use **Lucide React** exclusively for icons. 
*   **Stroke Width:** Default (2px).
*   **Size:** 
    *   `w-5 h-5` (or `size={20}`) for navigation, buttons, and card headers.
    *   `w-4 h-4` (or `size={16}`) for inline text icons or smaller badges.
*   **Consistent Mapping:**
    *   `CreditCard` / `Landmark` / `Hash` for payment methods.
    *   `CheckCircle2` / `XCircle` / `AlertCircle` for broad statuses.
    *   `Copy` / `Check` for clipboard interactions.

---

## 5. Core Components

### Cards & Layout (`<Card />`)
All data blocks should be wrapped in the base `<Card />` component to ensure consistent border radii and background styling.
*   **Style:** Rounded corners (`rounded-2xl`), subtle border, no heavy shadows.

### Status Badges (`<StatusBadge />`)
Used to indicate the state of a transaction, invoice, or virtual account.
*   **Style:** Pill shape (`rounded-full`), small text (`text-[11px]`), medium font weight, translucent background (`bg-emerald-500/10 text-emerald-600`).

### Forms & Validation
*   **Inputs:** `rounded-lg`, border `ring-1 ring-inset ring-neutral-300`, with a `focus:ring-2 focus:ring-blue-600` state.
*   **Labels:** `text-sm font-medium leading-6 text-neutral-900 dark:text-white`.
*   **Validation:** Inline error messages must appear below the input in `text-red-500 text-sm`, accompanied by a red border on the input field itself.

### Developer Experience (DX) UI
*   **Code Snippets:** Wrap code blocks in a dark surface (`bg-slate-900`) regardless of the user's theme to maintain syntax highlighting contrast.
*   **API Keys:** Always mask sensitive keys by default (e.g., `sk_live_••••••••••••••••`). Require a user interaction (click to reveal) before showing the full key. Include a one-click copy button.

---

## 6. Animation & Transitions

Enterprise software should feel snappy, not floaty. 
*   **Hover States:** Use `transition-colors duration-200` for buttons and links.
*   **Interactions:** Use `transition-all duration-300 ease-in-out` for structural shifts (like collapsing the sidebar or opening a modal).
*   Avoid bounce effects or overly long fades.

---

## 7. Voice and Tone

The copy within the dashboard must inspire trust and clarity.
*   **Be Direct:** Use active voice. (e.g., "Refund payment" instead of "Issue a refund for this payment").
*   **Be Precise:** When explaining errors or API payloads, use exact technical terminology. 
*   **Avoid Jargon (Unless Technical):** Do not use overly casual language, slang, or aggressive marketing speak within the dashboard.
*   **Empty States:** Always provide actionable guidance. (e.g., "No webhooks configured. Add an endpoint to receive real-time payment updates.")