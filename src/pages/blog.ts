/**
 * Page | Blog
 * Smooth tab behavior for the blog listing route.
 */

import { PageBase, page } from "@sygnal/sse-core";

type BlogSmoothTabGroup = {
  navList: HTMLElement;
  indicator: HTMLElement;
  customButtons: HTMLElement[];
  webflowTabs: HTMLElement[];
};

// Blog tabs use the same class names as home, but the styles are injected from
// this page module so they only exist on blog routes.
const BLOG_SMOOTH_TAB_STYLE_ID = "feedspring-blog-smooth-tabs";
const BLOG_SMOOTH_TAB_STYLES = `
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

@page('/blog')
export class BlogPage extends PageBase {

  protected onPrepare(): void {
    this.injectBlogSmoothTabStyles();
  }

  protected async onLoad(): Promise<void> {
    this.initBlogSmoothTabs();
  }

  private initBlogSmoothTabs(): void {
    // Each [fb-smooth-tab="true"] wrapper is treated as its own independent tab group.
    const tabGroups = document.querySelectorAll('[fb-smooth-tab="true"]');

    tabGroups.forEach((group) => {
      const smoothTabGroup = this.getBlogSmoothTabGroup(group);
      if (!smoothTabGroup) return;

      this.bindBlogSmoothTabGroup(smoothTabGroup);
    });
  }

  private getBlogSmoothTabGroup(group: Element): BlogSmoothTabGroup | null {
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
      navList,
      indicator,
      customButtons,
      webflowTabs,
    };
  }

  private bindBlogSmoothTabGroup(tabGroup: BlogSmoothTabGroup): void {
    // Webflow owns the real tab state; this keeps the custom UI synced to it.
    const syncFromWebflow = () => {
      const activeIndex = tabGroup.webflowTabs.findIndex((tab) =>
        tab.classList.contains("w--current")
      );

      this.setBlogActiveButton(tabGroup, activeIndex >= 0 ? activeIndex : 0);
    };

    tabGroup.customButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        const matchingTab = tabGroup.webflowTabs[index];
        if (!matchingTab) return;

        matchingTab.click();
        this.setBlogActiveButton(tabGroup, index);
      });
    });

    syncFromWebflow();
    window.addEventListener("resize", syncFromWebflow);
  }

  private setBlogActiveButton(tabGroup: BlogSmoothTabGroup, activeIndex: number): void {
    tabGroup.customButtons.forEach((button, index) => {
      button.classList.toggle("is-active", index === activeIndex);
    });

    this.moveBlogIndicator(tabGroup, tabGroup.customButtons[activeIndex]);
  }

  private moveBlogIndicator(tabGroup: BlogSmoothTabGroup, button?: HTMLElement): void {
    if (!button) return;

    // Position the sliding indicator relative to the custom nav list.
    const navRect = tabGroup.navList.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const left = buttonRect.left - navRect.left;

    tabGroup.indicator.style.width = `${buttonRect.width}px`;
    tabGroup.indicator.style.transform = `translate(${left}px, -50%)`;
  }

  private injectBlogSmoothTabStyles(): void {
    // Avoid adding duplicate style tags if this module is ever initialized twice.
    if (document.getElementById(BLOG_SMOOTH_TAB_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = BLOG_SMOOTH_TAB_STYLE_ID;
    style.textContent = BLOG_SMOOTH_TAB_STYLES;

    document.head.appendChild(style);
  }
}
