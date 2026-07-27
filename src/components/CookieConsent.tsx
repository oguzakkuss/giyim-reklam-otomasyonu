"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie-consent-v1";

/** KVKK/GDPR cerez onay banneri. Onay verilene kadar gosterilir. */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function decide(value: "accepted" | "rejected") {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* no-op */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="container-max flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-600">
          Deneyiminizi iyilestirmek ve reklam/analitik amaciyla cerezler kullaniyoruz.
          Detaylar icin{" "}
          <Link href="/cerez-politikasi" className="font-medium text-brand-600 underline">
            Cerez Politikasi
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => decide("rejected")}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Reddet
          </button>
          <button
            onClick={() => decide("accepted")}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
