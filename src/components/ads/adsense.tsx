"use client";

import * as React from "react";

const CONSENT_KEY = "madina-cookie-consent-v1";

type AdSenseProps = {
  client: string;
  slot: string;
  format?: "auto" | "fluid" | "rectangle";
  responsive?: boolean;
  className?: string;
  label?: string;
};

export function AdSenseScript({ client, enabled }: { client: string; enabled: boolean }) {
  React.useEffect(() => {
    if (!enabled || !client) return;
    const ensureScript = () => {
      if (document.querySelector(`script[data-adsense-client="${client}"]`)) return;
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
      script.crossOrigin = "anonymous";
      script.dataset.adsenseClient = client;
      document.head.appendChild(script);
    };
    try {
      if (window.localStorage.getItem(CONSENT_KEY) === "accepted") ensureScript();
    } catch { /* consent unavailable */ }
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail === "accepted") ensureScript();
    };
    window.addEventListener("madina:cookie-consent", handler);
    return () => window.removeEventListener("madina:cookie-consent", handler);
  }, [client, enabled]);
  return null;
}

export function AdSenseUnit({ client, slot, format = "auto", responsive = true, className, label = "Iklan" }: AdSenseProps) {
  const [allowed, setAllowed] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return window.localStorage.getItem(CONSENT_KEY) === "accepted"; } catch { return false; }
  });
  const pushAd = React.useCallback(() => {
    try {
      const queue = (window as typeof window & { adsbygoogle?: unknown[] }).adsbygoogle;
      if (queue) queue.push({});
    } catch { /* AdSense can be unavailable during local development */ }
  }, []);

  React.useEffect(() => {
    const handler = (event: Event) => setAllowed((event as CustomEvent<string>).detail === "accepted");
    window.addEventListener("madina:cookie-consent", handler);
    return () => window.removeEventListener("madina:cookie-consent", handler);
  }, []);

  React.useEffect(() => {
    if (!allowed || !client || !slot) return;
    const timer = window.setTimeout(pushAd, 50);
    return () => window.clearTimeout(timer);
  }, [allowed, client, slot, pushAd]);

  if (!allowed || !client || !slot) return null;

  return (
    <div className={className} aria-label={label}>
      <div className="mb-1 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-dark-400">{label}</div>
      <ins
        className="adsbygoogle block min-h-[90px] w-full overflow-hidden"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
