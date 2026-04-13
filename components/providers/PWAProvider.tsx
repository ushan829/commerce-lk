"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Exposes a global install button via a toast notification
export function PWAProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll animations
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.error("SW registration failed:", err));
    }

    // Listen for the install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;

      // Show a custom install toast (only once per session)
      if (sessionStorage.getItem("pwa-install-dismissed")) return;

      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900">
              Install Commerce.lk for quick access
            </span>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await prompt.prompt();
                const { outcome } = await prompt.userChoice;
                if (outcome === "dismissed") {
                  sessionStorage.setItem("pwa-install-dismissed", "1");
                }
              }}
              className="shrink-0 px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full hover:bg-emerald-600"
            >
              Install
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                sessionStorage.setItem("pwa-install-dismissed", "1");
              }}
              className="shrink-0 text-gray-400 hover:text-gray-600 text-xs"
            >
              Later
            </button>
          </div>
        ),
        { duration: 12000, id: "pwa-install" }
      );
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return null;
}

// Small hook for manual install — can be used in header/settings
export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setPrompt(null);
      setIsInstalled(true);
    }
  };

  return { canInstall: !!prompt && !isInstalled, isInstalled, install };
}
