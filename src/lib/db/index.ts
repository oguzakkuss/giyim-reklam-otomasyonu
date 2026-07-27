import { config } from "@/lib/config";
import { LocalRepository } from "./local";
import { SupabaseRepository } from "./supabase";
import type { Repository } from "./types";

let instance: Repository | null = null;

/**
 * Aktif veri deposunu dondurur.
 * Supabase env'leri tanimliysa Supabase, degilse yerel JSON store kullanilir.
 */
export function getRepository(): Repository {
  if (instance) return instance;
  instance = config.supabase.enabled ? new SupabaseRepository() : new LocalRepository();
  return instance;
}

export function usingSupabase(): boolean {
  return config.supabase.enabled;
}

export * from "./types";
