/**
 * Page | Pricing
 * Smooth tabs and price count animation for tabbed pricing cards.
 */

import { PageBase, page } from "@sygnal/sse-core";

type PricingSmoothTabGroup = {
  navList: HTMLElement;
  indicator: HTMLElement;
  customButtons: HTMLElement[];
  webflowTabs: HTMLElement[];
};

// Pricing uses the same attribute-based tab controller as home, but has a
// separate indicator class so the CSS stays aligned with the pricing markup.
const PRICING_SMOOTH_TAB_STYLE_ID = "feedspring-pricing-smooth-tabs";
const PRICING_SMOOTH_TAB_STYLES = `
.pricing_tabs_indicator {
  pointer-events: none;
  transition:
    transform 0.735s cubic-bezier(0.625, 0.05, 0, 1),
    width 0.735s cubic-bezier(0.625, 0.05, 0, 1);
}

@media (max-width: 767px) {
  .pricing_tabs_indicator {
    display: none;
  }

  .tabs_button.is-active {
    background: var(--Neutral-White, #fff);
    box-shadow: 0 2px 4px 0 rgba(23, 23, 23, 0.05);
  }
}
`;

@page('/pricing')
export class PricingPage extends PageBase {

  protected onPrepare(): void {
    this.injectPricingSmoothTabStyles();
  }

  protected async onLoad(): Promise<void> {
    this.initPricingSmoothTabs();
    this.initPriceCountAnimations();
  }

  private initPricingSmoothTabs(): void {
    // Each [fb-smooth-tab="true"] wrapper is treated as its own independent pricing tab group.
    const tabGroups = document.querySelectorAll('[fb-smooth-tab="true"]');

    tabGroups.forEach((group) => {
      const smoothTabGroup = this.getPricingSmoothTabGroup(group);
      if (!smoothTabGroup) return;

      this.bindPricingSmoothTabGroup(smoothTabGroup);
    });
  }

  private getPricingSmoothTabGroup(group: Element): PricingSmoothTabGroup | null {
    // Collect the custom nav, pricing indicator, and hidden Webflow tab links.
    const navList = group.querySelector<HTMLElement>('[fb-smooth-tab="nav"]');
    const indicator = group.querySelector<HTMLElement>('[fb-smooth-tab="indicator"]');
    const customButtons = Array.from(
      group.querySelectorAll<HTMLElement>('[fb-smooth-tab="button"]')
    );
    const webflowTabs = Array.from(
      group.querySelectorAll<HTMLElement>('[fb-smooth-tab="hidden"] .w-tab-link')
    );

    // Exit quietly if the expected Webflow markup is incomplete.
    if (!navList || !indicator || customButtons.length === 0 || webflowTabs.length === 0) {
      return null;
    }

    // Each custom button maps by index to one hidden Webflow tab link.
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

  private bindPricingSmoothTabGroup(tabGroup: PricingSmoothTabGroup): void {
    // Webflow owns the actual tab state; this mirrors that state in the custom buttons.
    const syncFromWebflow = () => {
      const activeIndex = tabGroup.webflowTabs.findIndex((tab) =>
        tab.classList.contains("w--current")
      );

      this.setPricingActiveButton(tabGroup, activeIndex >= 0 ? activeIndex : 0);
    };

    tabGroup.customButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        const matchingTab = tabGroup.webflowTabs[index];
        if (!matchingTab) return;

        matchingTab.click();
        this.setPricingActiveButton(tabGroup, index);
      });
    });

    syncFromWebflow();
    window.addEventListener("resize", syncFromWebflow);
  }

  private setPricingActiveButton(tabGroup: PricingSmoothTabGroup, activeIndex: number): void {
    tabGroup.customButtons.forEach((button, index) => {
      button.classList.toggle("is-active", index === activeIndex);
    });

    this.movePricingIndicator(tabGroup, tabGroup.customButtons[activeIndex]);
  }

  private movePricingIndicator(tabGroup: PricingSmoothTabGroup, button?: HTMLElement): void {
    if (!button) return;

    // Position the pricing indicator relative to the custom nav list.
    const navRect = tabGroup.navList.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const left = buttonRect.left - navRect.left;

    tabGroup.indicator.style.width = `${buttonRect.width}px`;
    tabGroup.indicator.style.transform = `translate(${left}px, -50%)`;
  }

  private initPriceCountAnimations(): void {
    // Reuse the same smooth-tab wrapper so each pricing tab group is scoped independently.
    const tabGroups = document.querySelectorAll('[fb-smooth-tab="true"]');

    tabGroups.forEach((group) => {
      const tabPanes = Array.from(group.querySelectorAll<HTMLElement>(".w-tab-pane"));
      if (tabPanes.length === 0) return;

      let hasInitialized = false;

      // On first load, show the active prices instantly. Animation only runs after tab changes.
      setTimeout(() => {
        this.setActivePaneValuesInstantly(group);
        hasInitialized = true;
      }, 200);

      const observer = new MutationObserver(() => {
        if (!hasInitialized) return;

        // Webflow updates tab classes asynchronously, so wait briefly before reading the active pane.
        setTimeout(() => {
          this.animateActivePane(group);
        }, 50);
      });

      tabPanes.forEach((pane) => {
        observer.observe(pane, {
          attributes: true,
          attributeFilter: ["class"],
        });
      });
    });
  }

  private setActivePaneValuesInstantly(group: Element): void {
    // Find the active Webflow tab pane and set all configured prices to their final values.
    const activePane = group.querySelector(".w-tab-pane.w--tab-active");
    if (!activePane) return;

    const countElements = activePane.querySelectorAll<HTMLElement>('[fb-price-count="true"]');

    countElements.forEach((element) => {
      const targetValue = Number(element.getAttribute("fb-price-value"));
      if (Number.isNaN(targetValue)) return;

      element.textContent = targetValue.toString();
    });
  }

  private animateActivePane(group: Element): void {
    // On tab change, restart each visible price from its configured start value.
    const activePane = group.querySelector(".w-tab-pane.w--tab-active");
    if (!activePane) return;

    const countElements = activePane.querySelectorAll<HTMLElement>('[fb-price-count="true"]');

    countElements.forEach((element) => {
      const startValue = Number(element.getAttribute("fb-price-start"));
      const targetValue = Number(element.getAttribute("fb-price-value"));

      if (Number.isNaN(startValue) || Number.isNaN(targetValue)) return;

      element.textContent = startValue.toString();
      this.animateCount(element, startValue, targetValue, 850);
    });
  }

  private animateCount(
    element: HTMLElement,
    startValue: number,
    endValue: number,
    duration = 850
  ): void {
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Quadratic ease-out gives the count a softer finish than a linear animation.
      const eased = 1 - Math.pow(1 - progress, 2);
      const currentValue = startValue + (endValue - startValue) * eased;

      element.textContent = Math.round(currentValue).toString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = endValue.toString();
      }
    };

    requestAnimationFrame(update);
  }

  private injectPricingSmoothTabStyles(): void {
    // Avoid adding duplicate style tags if this module is ever initialized twice.
    if (document.getElementById(PRICING_SMOOTH_TAB_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = PRICING_SMOOTH_TAB_STYLE_ID;
    style.textContent = PRICING_SMOOTH_TAB_STYLES;

    document.head.appendChild(style);
  }
}
