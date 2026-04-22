/**
 * Page | Pricing
 */

import { PageBase, page } from "@sygnal/sse-core";

@page('/pricing')
export class PricingPage extends PageBase {

  protected onPrepare(): void {
  }

  protected async onLoad(): Promise<void> {
    this.initPriceCountAnimations();
  }

  private initPriceCountAnimations(): void {
    const tabGroups = document.querySelectorAll('[fb-smooth-tab="true"]');

    tabGroups.forEach((group) => {
      const tabPanes = Array.from(group.querySelectorAll<HTMLElement>(".w-tab-pane"));
      if (tabPanes.length === 0) return;

      let hasInitialized = false;

      setTimeout(() => {
        this.setActivePaneValuesInstantly(group);
        hasInitialized = true;
      }, 200);

      const observer = new MutationObserver(() => {
        if (!hasInitialized) return;

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
}
