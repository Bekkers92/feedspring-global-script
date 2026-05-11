/**
 * Page | Platform Webflow
 * Smooth tab behavior for the Webflow platform route.
 */

import { PageBase, page } from "@sygnal/sse-core";

type PlatformWebflowSmoothTabGroup = {
  navList: HTMLElement;
  indicator: HTMLElement;
  customButtons: HTMLElement[];
  webflowTabs: HTMLElement[];
};

const PLATFORM_WEBFLOW_SMOOTH_TAB_STYLE_ID = "feedspring-platform-webflow-smooth-tabs";
const PLATFORM_WEBFLOW_SMOOTH_TAB_STYLES = `
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

@page('/platform/webflow')
export class PlatformWebflowPage extends PageBase {

  protected onPrepare(): void {
    this.injectPlatformWebflowSmoothTabStyles();
  }

  protected async onLoad(): Promise<void> {
    this.initPlatformWebflowSmoothTabs();
  }

  private initPlatformWebflowSmoothTabs(): void {
    const tabGroups = document.querySelectorAll('[fb-smooth-tab="true"]');

    tabGroups.forEach((group) => {
      const smoothTabGroup = this.getPlatformWebflowSmoothTabGroup(group);
      if (!smoothTabGroup) return;

      this.bindPlatformWebflowSmoothTabGroup(smoothTabGroup);
    });
  }

  private getPlatformWebflowSmoothTabGroup(group: Element): PlatformWebflowSmoothTabGroup | null {
    const navList = group.querySelector<HTMLElement>('[fb-smooth-tab="nav"]');
    const indicator = group.querySelector<HTMLElement>('[fb-smooth-tab="indicator"]');
    const customButtons = Array.from(
      group.querySelectorAll<HTMLElement>('[fb-smooth-tab="button"]')
    );
    const webflowTabs = Array.from(
      group.querySelectorAll<HTMLElement>('[fb-smooth-tab="hidden"] .w-tab-link')
    );

    if (!navList || !indicator || customButtons.length === 0 || webflowTabs.length === 0) {
      return null;
    }

    if (customButtons.length !== webflowTabs.length) {
      return null;
    }

    return {
      navList,
      indicator,
      customButtons,
      webflowTabs,
    };
  }

  private bindPlatformWebflowSmoothTabGroup(tabGroup: PlatformWebflowSmoothTabGroup): void {
    const syncFromWebflow = () => {
      const activeIndex = tabGroup.webflowTabs.findIndex((tab) =>
        tab.classList.contains("w--current")
      );

      this.setPlatformWebflowActiveButton(tabGroup, activeIndex >= 0 ? activeIndex : 0);
    };

    tabGroup.customButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        const matchingTab = tabGroup.webflowTabs[index];
        if (!matchingTab) return;

        matchingTab.click();
        this.setPlatformWebflowActiveButton(tabGroup, index);
      });
    });

    syncFromWebflow();
    window.addEventListener("resize", syncFromWebflow);
  }

  private setPlatformWebflowActiveButton(
    tabGroup: PlatformWebflowSmoothTabGroup,
    activeIndex: number
  ): void {
    tabGroup.customButtons.forEach((button, index) => {
      button.classList.toggle("is-active", index === activeIndex);
    });

    this.movePlatformWebflowIndicator(tabGroup, tabGroup.customButtons[activeIndex]);
  }

  private movePlatformWebflowIndicator(
    tabGroup: PlatformWebflowSmoothTabGroup,
    button?: HTMLElement
  ): void {
    if (!button) return;

    const navRect = tabGroup.navList.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const left = buttonRect.left - navRect.left;

    tabGroup.indicator.style.width = `${buttonRect.width}px`;
    tabGroup.indicator.style.transform = `translate(${left}px, -50%)`;
  }

  private injectPlatformWebflowSmoothTabStyles(): void {
    if (document.getElementById(PLATFORM_WEBFLOW_SMOOTH_TAB_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = PLATFORM_WEBFLOW_SMOOTH_TAB_STYLE_ID;
    style.textContent = PLATFORM_WEBFLOW_SMOOTH_TAB_STYLES;

    document.head.appendChild(style);
  }
}
