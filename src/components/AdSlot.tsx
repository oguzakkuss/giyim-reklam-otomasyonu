"use client";

import { useEffect } from "react";
import { config } from "@/lib/config";

interface AdSlotProps {
  slot?: string;
  format?: string;
  label?: string;
  className?: string;
}

/**
 * Google AdSense reklam blogu.
 * NEXT_PUBLIC_ADSENSE_CLIENT tanimli degilse, reklamin gelecegi yeri gosteren
 * bir placeholder cizer (gelistirme sirasinda layout'u dogru gormek icin).
 */
export function AdSlot({ slot, format = "auto", label = "Advertisement", className = "" }: AdSlotProps) {
  const enabled = config.adsense.enabled && Boolean(slot);

  useEffect(() => {
    if (!enabled) return;
    try {
      // @ts-expect-error adsbygoogle global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* no-op */
    }
  }, [enabled]);

  if (!enabled) {
    return (
      <div
        className={`flex min-h-[120px] w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-100 text-xs uppercase tracking-widest text-neutral-400 ${className}`}
      >
        {label}
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle block ${className}`}
      style={{ display: "block" }}
      data-ad-client={config.adsense.client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
