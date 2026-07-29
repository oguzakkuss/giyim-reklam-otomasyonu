import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const email = `info@${new URL(config.site.url).hostname.replace("www.", "")}`;

  return (
    <div className="container-max max-w-3xl py-12">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-4 leading-relaxed text-neutral-600">
        Have a question, correction, or partnership inquiry? We&apos;d be happy to hear
        from you.
      </p>
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="text-sm font-semibold text-neutral-800">Email</div>
        <a href={`mailto:${email}`} className="mt-1 inline-block text-brand-600 hover:underline">
          {email}
        </a>
        <p className="mt-4 text-xs text-neutral-400">
          We aim to respond to legitimate inquiries within five business days.
        </p>
      </div>
    </div>
  );
}
