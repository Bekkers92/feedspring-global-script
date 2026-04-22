# FeedSpring Code Blocks

Quick reference for custom Webflow code that has been moved into this SSE repo.

## Global Site Code

### Lenis Smooth Scroll
- File: `src/site.ts`
- Runs on: all pages
- Purpose: loads Lenis from CDN and starts the smooth-scroll animation loop.
- Original Webflow location: global custom code.

### Color Nav
- File: `src/site.ts`
- Runs on: all pages
- Purpose: watches the Webflow mobile nav button and applies a temporary gradient background to `.nav_bar` while the menu is open.
- Original Webflow location: global custom code.

## Page Code

### Home Tabs Controller
- File: `src/pages/home.ts`
- Runs on: `/`
- Purpose: controls custom smooth tab buttons, syncs them to hidden Webflow tab links, moves the sliding indicator, and injects the home-only tab styles.
- Original Webflow location: home page custom code.

### Blog Tabs Controller
- File: `src/pages/blog.ts`
- Runs on: `/blog`
- Purpose: controls custom blog tab buttons, syncs them to hidden Webflow tab links, moves the sliding indicator, and injects the blog-only tab styles.
- Original Webflow location: blog page custom code.

### Pricing Count Up
- File: `src/pages/pricing.ts`
- Runs on: `/pricing`
- Purpose: updates pricing values instantly on first load, then animates `[fb-price-count="true"]` values when Webflow tabs change.
- Original Webflow location: pricing page custom code.

### Pricing Tabs Controller
- File: `src/pages/pricing.ts`
- Runs on: `/pricing`
- Purpose: controls custom pricing tab buttons, syncs them to hidden Webflow tab links, moves the pricing sliding indicator, and injects the pricing-only tab styles.
- Original Webflow location: pricing page custom code.

### Components Search Shortcut
- File: `src/pages/components.ts`
- Runs on: `/components`
- Purpose: focuses and selects `#fs-search` when the user presses `Cmd+K` or `Ctrl+K`.
- Original Webflow location: components page custom code.

### Components Platform Label
- File: `src/pages/components.ts`
- Runs on: `/components`
- Purpose: reads the `platform` query parameter and updates `#fs-component-platform` to `All`, one platform name, or `Multiple`.
- Original Webflow location: components page custom code.

### Components Grid Toggle
- File: `src/pages/components.ts`
- Runs on: `/components`
- Purpose: switches `.component_grid` between the default Webflow grid and a one-column layout using `.toggle-grid-1` and `.toggle-grid-2`.
- Original Webflow location: components page custom code.

## Registration

Page files only run when they are imported in `src/registry.ts` and decorated with `@page(...)`.

Current active page imports:
- `src/pages/home.ts`
- `src/pages/blog.ts`
- `src/pages/components.ts`
- `src/pages/pricing.ts`
- `src/pages/valet.ts`

## Webflow Include

Keep only this SSE include in Webflow site-wide before `</head>`:

```html
<script
  src="https://feedspring.netlify.app/index.js"
  dev-src="http://127.0.0.1:3000/dist/index.js"
></script>
```
