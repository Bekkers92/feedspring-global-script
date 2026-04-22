
/*
 * Site
 */

import { IModule } from "@sygnal/sse-core";

// import gsap from 'gsap'; 
 
type LenisInstance = {
  raf: (time: number) => void;
};

type LenisConstructor = new (options: {
  wrapper: HTMLElement | null;
  content: HTMLElement | null;
  duration: number;
  easing: (t: number) => number;
  orientation: "vertical" | "horizontal";
  smoothWheel: boolean;
}) => LenisInstance;

declare global {
  interface Window {
    Lenis?: LenisConstructor;
  }
}

const LENIS_CDN_URL = "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js";
const NAV_GRADIENT_TO = "rgba(255,255,255,1)";

export class Site implements IModule {

  constructor() {
  }

  /**
   * Setup code runs synchronously, inline, at the end of the </head>. 
   * It's used for special init tasks that must be performed early, and which do not require
   * the DOM to be loaded. 
   */
  setup() {

//    Page.loadEngineCSS("site.css"); 
   
  }

  /**
   * Exec code runs after the DOM has processed. 
   */
  exec() {
    this.initLenisSmoothScroll();
    this.initColorNav();
  }

  private initLenisSmoothScroll(): void {
    this.loadScript(LENIS_CDN_URL)
      .then(() => {
        if (!window.Lenis) return;

        const body = document.querySelector<HTMLElement>(".body");
        const lenis = new window.Lenis({
          wrapper: body,
          content: body,
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          smoothWheel: true,
        });

        const raf = (time: number) => {
          lenis.raf(time);
          requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);
      })
      .catch((error) => {
        console.error("Failed to load Lenis smooth scroll:", error);
      });
  }

  private initColorNav(): void {
    const btn = document.querySelector(".nav_menu-button.w-nav-button");
    const nav = document.querySelector<HTMLElement>(".nav_bar");

    if (!btn || !nav) return;

    const gradient = `linear-gradient(to bottom, rgba(255,255,255,0), ${NAV_GRADIENT_TO})`;
    const update = () => {
      nav.style.background = btn.classList.contains("w--open") ? gradient : "";
    };

    new MutationObserver(update).observe(btn, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  private loadScript(src: string): Promise<void> {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

    if (existingScript) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(src));

      document.head.appendChild(script);
    });
  }
}
