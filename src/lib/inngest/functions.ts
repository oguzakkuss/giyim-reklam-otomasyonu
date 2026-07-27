import { inngest } from "./client";
import { runGenerationPipeline } from "@/lib/ai/pipeline";

/** Video/icerik uretimini arka planda calistiran Inngest fonksiyonu. */
export const generateContentFn = inngest.createFunction(
  { id: "generate-content", name: "Icerik + Video Uretimi" },
  { event: "content/generate.requested" },
  async ({ event }) => {
    await runGenerationPipeline(event.data.productId);
    return { productId: event.data.productId, done: true };
  },
);

export const functions = [generateContentFn];
