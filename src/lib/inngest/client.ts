import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "giyim-reklam-otomasyonu" });

export type Events = {
  "content/generate.requested": {
    data: { productId: string };
  };
};
