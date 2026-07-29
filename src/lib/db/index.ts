import { config } from "@/lib/config";
import { LocalRepository } from "./local";
import { SupabaseRepository } from "./supabase";
import type { Repository } from "./types";

/**
 * Returns the active data store.
 * Always resolve fresh based on current env (no sticky singleton) so a cold
 * start cannot lock the process into the empty local JSON store.
 */
export function getRepository(): Repository {
  return config.supabase.enabled ? new SupabaseRepository() : new LocalRepository();
}

export function usingSupabase(): boolean {
  return config.supabase.enabled;
}

export * from "./types";
