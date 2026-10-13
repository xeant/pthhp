"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const PwaInstallButton = ({ className = "" }: { className?: string }) => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch("/api/pwa/config", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (mounted) setEnabled(Boolean(data?.pwaEnabled));
      })
      .catch(() => {
        if (mounted) setEnabled(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) {
      setShowGuide((prev) => !prev);
      return;
    }

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;

    if (choice.outcome === "accepted") {
      setInstalled(true);
    }

    setPromptEvent(null);
    setShowGuide(false);
  };

  if (!enabled || installed) return null;

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={handleInstall}
        className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 shadow-sm shadow-gray-900/5 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-300 dark:shadow-black/20 dark:hover:border-dark-700 dark:hover:bg-dark-800 dark:hover:text-dark-100 ${promptEvent ? "" : "opacity-90"}`}
        aria-label="앱 설치"
        title="앱 설치"
      >
        <Download size={14} />
        <span className="hidden lg:inline">앱 설치</span>
      </button>

      {showGuide && (
        <div className="absolute right-0 top-11 z-50 w-64 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-xl shadow-gray-900/10 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/30">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-dark-100">앱 설치</div>
              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-dark-400">
                주소창 오른쪽 설치 아이콘이나 Chrome 메뉴의 페이지 앱 설치를 사용해주세요.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-dark-800 dark:hover:text-dark-100"
              aria-label="설치 안내 닫기"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PwaInstallButton;
