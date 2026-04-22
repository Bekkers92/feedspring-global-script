/**
 * Page | Home
 */

import { PageBase, page } from "@sygnal/sse-core";

type SmoothTabGroup = {
  group: Element;
  navList: HTMLElement;
  indicator: HTMLElement;
  customButtons: HTMLElement[];
  webflowTabs: HTMLElement[];
};

@page('/')
export class HomePage extends PageBase {

  protected onPrepare(): void {
  }

  protected async onLoad(): Promise<void> {
    this.initSmoothTabs();
  }

  private initSmoothTabs(): void {
    const tabGroups = document.querySelectorAll('[fb-smooth-tab="true"]');

    tabGroups.forEach((group) => {
      const smoothTabGroup = this.getSmoothTabGroup(group);
      if (!smoothTabGroup) return;

      this.bindSmoothTabGroup(smoothTabGroup);
    });
  }

  private getSmoothTabGroup(group: Element): SmoothTabGroup | null {
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
      group,
      navList,
      indicator,
      customButtons,
      webflowTabs,
    };
  }

  private bindSmoothTabGroup(tabGroup: SmoothTabGroup): void {
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

    const navRect = tabGroup.navList.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const left = buttonRect.left - navRect.left;

    tabGroup.indicator.style.width = `${buttonRect.width}px`;
    tabGroup.indicator.style.transform = `translate(${left}px, -50%)`;
  }
}
