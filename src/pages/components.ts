/**
 * Page | Components
 * Search shortcut, filter counters, platform label, and grid toggle behavior for the components library page.
 */

import { PageBase, page } from "@sygnal/sse-core";

type FilterCounterConfig = {
  key: string;
  label: string;
  countTargetSelectors: string[];
  scopeSelectors: string[];
};

const PLATFORM_LABELS: Record<string, string> = {
  "ai-agents": "AI Agents",
  webflow: "Webflow",
  framer: "Framer",
  html: "HTML",
};

const FILTER_COUNTER_TARGET_SELECTOR = '[fs-component-filter="target"], #fs-component-filter';

const FILTER_COUNTERS: FilterCounterConfig[] = [
  {
    key: "platform",
    label: "Platform",
    countTargetSelectors: [
      '#fs-platform-count',
      '[fs-filter-count="platform"]',
      '[data-filter-count="platform"]',
    ],
    scopeSelectors: [
      '[fs-filter-group="platform"]',
      '[data-filter-group="platform"]',
      '[fb-filter-group="platform"]',
    ],
  },
  {
    key: "feeds",
    label: "Feeds",
    countTargetSelectors: [
      '#fs-feeds-count',
      '[fs-filter-count="feeds"]',
      '[data-filter-count="feeds"]',
    ],
    scopeSelectors: [
      '[fs-filter-group="feeds"]',
      '[data-filter-group="feeds"]',
      '[fb-filter-group="feeds"]',
    ],
  },
  {
    key: "tags",
    label: "Tags",
    countTargetSelectors: [
      '#fs-tags-count',
      '[fs-filter-count="tags"]',
      '[data-filter-count="tags"]',
    ],
    scopeSelectors: [
      '[fs-filter-group="tags"]',
      '[data-filter-group="tags"]',
      '[fb-filter-group="tags"]',
    ],
  },
];

@page('/product/components')
export class ComponentsPage extends PageBase {

  protected onPrepare(): void {
  }

  protected async onLoad(): Promise<void> {
    this.initSearchShortcut();
    this.initFilterCounters();
    this.initPlatformLabel();
    this.initGridToggle();
  }

  private initSearchShortcut(): void {
    // Focus the component search input when users press Cmd+K or Ctrl+K.
    document.addEventListener("keydown", (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;

      event.preventDefault();

      const searchInput = document.getElementById("fs-search") as HTMLInputElement | null;
      if (!searchInput) return;

      searchInput.focus();
      searchInput.select();
    });
  }

  private initFilterCounters(): void {
    const updateFilterCounters = () => {
      FILTER_COUNTERS.forEach((config) => {
        this.updateFilterCounter(config);
      });
    };

    updateFilterCounters();
    document.addEventListener("click", () => window.setTimeout(updateFilterCounters, 50));
    document.addEventListener("change", () => window.setTimeout(updateFilterCounters, 50));
    window.addEventListener("popstate", updateFilterCounters);

    const observer = new MutationObserver(updateFilterCounters);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  private updateFilterCounter(config: FilterCounterConfig): void {
    const scope = this.getFilterCounterScope(config);
    const target = this.getFilterCounterTarget(config, scope);
    if (!scope || !target) return;

    const activeCount = scope.querySelectorAll(
      ".jetboost-filter-trigger.jetboost-filter-active"
    ).length;

    target.textContent = activeCount > 0 ? `(${activeCount})` : "";
    target.style.display = activeCount > 0 ? "" : "none";
    target.setAttribute("aria-label", `${activeCount} ${config.label} filters selected`);
  }

  private getFilterCounterScope(config: FilterCounterConfig): HTMLElement | null {
    for (const selector of config.scopeSelectors) {
      const scope = document.querySelector<HTMLElement>(selector);
      if (scope) return scope;
    }

    return this.getDropdownByLabel(config.label);
  }

  private getFilterCounterTarget(
    config: FilterCounterConfig,
    scope: HTMLElement | null
  ): HTMLElement | null {
    const dropdown = scope?.closest<HTMLElement>(".w-dropdown") ?? this.getDropdownByLabel(config.label);
    const toggle = dropdown?.querySelector<HTMLElement>(".w-dropdown-toggle");
    if (!toggle) return null;

    const sharedTarget = toggle.querySelector<HTMLElement>(FILTER_COUNTER_TARGET_SELECTOR);
    if (sharedTarget) return sharedTarget;

    for (const selector of config.countTargetSelectors) {
      const target = toggle.querySelector<HTMLElement>(selector);
      if (target) return target;
    }

    let target = toggle.querySelector<HTMLElement>(`[fs-filter-count="${config.key}"]`);
    if (target) return target;

    target = document.createElement("span");
    target.className = "fs-filter-count";
    target.setAttribute("fs-filter-count", config.key);
    target.setAttribute("aria-live", "polite");

    const arrow = toggle.querySelector<HTMLElement>(".w-icon-dropdown-toggle, .icon-small");
    if (arrow) {
      toggle.insertBefore(target, arrow);
    } else {
      toggle.appendChild(target);
    }

    return target;
  }

  private getDropdownByLabel(label: string): HTMLElement | null {
    const dropdowns = Array.from(document.querySelectorAll<HTMLElement>(".w-dropdown"));
    const normalizedLabel = label.toLowerCase();

    return dropdowns.find((dropdown) => {
      const toggle = dropdown.querySelector<HTMLElement>(".w-dropdown-toggle");
      if (!toggle) return false;

      return (toggle.textContent ?? "").trim().toLowerCase().includes(normalizedLabel);
    }) ?? null;
  }

  private initPlatformLabel(): void {
    // This label mirrors the current ?platform= query parameter used by filtering.
    const target = document.getElementById("fs-component-platform");
    if (!target) return;

    const updatePlatformText = () => {
      const params = new URLSearchParams(window.location.search);
      const platformParam = params.get("platform");

      if (!platformParam || platformParam.trim() === "") {
        target.textContent = "All";
        return;
      }

      const selectedPlatforms = platformParam
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean);

      if (selectedPlatforms.length === 0) {
        target.textContent = "All";
      } else if (selectedPlatforms.length === 1) {
        target.textContent = this.formatPlatformName(selectedPlatforms[0]);
      } else {
        target.textContent = "Multiple";
      }
    };

    updatePlatformText();
    window.addEventListener("popstate", updatePlatformText);

    // Webflow/filter libraries often change query params with History API calls,
    // so patch pushState/replaceState to refresh the label immediately.
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      updatePlatformText();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      updatePlatformText();
    };
  }

  private initGridToggle(): void {
    // Toggle between the default Webflow grid and a one-column list-style layout.
    const grid = document.querySelector<HTMLElement>(".component_grid");
    const toggle1 = document.querySelector(".toggle-grid-1");
    const toggle2 = document.querySelector(".toggle-grid-2");

    if (!grid || !toggle1 || !toggle2) return;

    toggle1.addEventListener("click", () => {
      grid.style.gridTemplateColumns = "";
    });

    toggle2.addEventListener("click", () => {
      grid.style.gridTemplateColumns = "repeat(1, minmax(0, 1fr))";
    });
  }

  private formatPlatformName(slug: string): string {
    if (PLATFORM_LABELS[slug]) return PLATFORM_LABELS[slug];

    // Fallback for future platform slugs not listed in PLATFORM_LABELS.
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}
