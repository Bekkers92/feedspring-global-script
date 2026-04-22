/**
 * Page | Components
 * Search shortcut, platform label, and grid toggle behavior for the components library page.
 */

import { PageBase, page } from "@sygnal/sse-core";

const PLATFORM_LABELS: Record<string, string> = {
  "ai-agents": "AI Agents",
  webflow: "Webflow",
  framer: "Framer",
  html: "HTML",
};

@page('/components')
export class ComponentsPage extends PageBase {

  protected onPrepare(): void {
  }

  protected async onLoad(): Promise<void> {
    this.initSearchShortcut();
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
