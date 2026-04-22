/**
 * Page | Home
 * Home-only smooth tab behavior for FeedSpring's attribute-based tab UI.
 */

import { PageBase, page } from "@sygnal/sse-core";

type SmoothTabGroup = {
  group: Element;
  navList: HTMLElement;
  indicator: HTMLElement;
  customButtons: HTMLElement[];
  webflowTabs: HTMLElement[];
};

// The original Webflow snippet included CSS. Inject it here so the styles
// only exist on the home route where this page module runs.
const SMOOTH_TAB_STYLE_ID = "feedspring-smooth-tabs";
const SMOOTH_TAB_STYLES = `
.tabs_indicator {
  pointer-events: none;
  transition:
    transform 0.735s cubic-bezier(0.625, 0.05, 0, 1),
    width 0.735s cubic-bezier(0.625, 0.05, 0, 1);
}

@media (max-width: 767px) {
  .tabs_indicator {
    display: none;
  }

  .tabs_button.is-active {
    background: var(--Neutral-White, #fff);
    box-shadow: 0 2px 4px 0 rgba(23, 23, 23, 0.05);
  }
}
`;

@page('/')
export class HomePage extends PageBase {

  protected onPrepare(): void {
    this.injectSmoothTabStyles();
  }

  protected async onLoad(): Promise<void> {
    this.initSmoothTabs();
  }

  private initSmoothTabs(): void {
    // Each [fb-smooth-tab="true"] wrapper is treated as its own independent tab group.
    const tabGroups = document.querySelectorAll('[fb-smooth-tab="true"]');

    tabGroups.forEach((group) => {
      const smoothTabGroup = this.getSmoothTabGroup(group);
      if (!smoothTabGroup) return;

      this.bindSmoothTabGroup(smoothTabGroup);
    });
  }

  private getSmoothTabGroup(group: Element): SmoothTabGroup | null {
    // Collect the custom navigation pieces and the hidden Webflow tabs inside this group.
    const navList = group.querySelector<HTMLElement>('[fb-smooth-tab="nav"]');
    const indicator = group.querySelector<HTMLElement>('[fb-smooth-tab="indicator"]');
    const customButtons = Array.from(
      group.querySelectorAll<HTMLElement>('[fb-smooth-tab="button"]')
    );
    const webflowTabs = Array.from(
      group.querySelectorAll<HTMLElement>('[fb-smooth-tab="hidden"] .w-tab-link')
    );

    // Exit quietly if the Webflow markup is incomplete on this page.
    if (!navList || !indicator || customButtons.length === 0 || webflowTabs.length === 0) {
      return null;
    }

    // Each custom button maps by index to one hidden Webflow tab link.
    if (customButtons.length !== webflowTabs.length) {
      return null;
    }

    return {
      group,
      navList,
      indicator,
      customButtons,
      webflowTabs,
    };
  }

  private bindSmoothTabGroup(tabGroup: SmoothTabGroup): void {
    // Webflow owns the real tab state; this keeps the custom UI synced to it.
    const syncFromWebflow = () => {
      const activeIndex = tabGroup.webflowTabs.findIndex((tab) =>
        tab.classList.contains("w--current")
      );

      this.setActiveButton(tabGroup, activeIndex >= 0 ? activeIndex : 0);
    };

    tabGroup.customButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        const matchingTab = tabGroup.webflowTabs[index];
        if (!matchingTab) return;

        matchingTab.click();
        this.setActiveButton(tabGroup, index);
      });
    });

    syncFromWebflow();
    window.addEventListener("resize", syncFromWebflow);
  }

  private setActiveButton(tabGroup: SmoothTabGroup, activeIndex: number): void {
    tabGroup.customButtons.forEach((button, index) => {
      button.classList.toggle("is-active", index === activeIndex);
    });

    this.moveIndicator(tabGroup, tabGroup.customButtons[activeIndex]);
  }

  private moveIndicator(tabGroup: SmoothTabGroup, button?: HTMLElement): void {
    if (!button) return;

    // Position the sliding indicator relative to the custom nav list.
    const navRect = tabGroup.navList.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const left = buttonRect.left - navRect.left;

    tabGroup.indicator.style.width = `${buttonRect.width}px`;
    tabGroup.indicator.style.transform = `translate(${left}px, -50%)`;
  }

  private injectSmoothTabStyles(): void {
    // Avoid adding duplicate style tags if this module is ever initialized twice.
    if (document.getElementById(SMOOTH_TAB_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = SMOOTH_TAB_STYLE_ID;
    style.textContent = SMOOTH_TAB_STYLES;

    document.head.appendChild(style);
  }
}
