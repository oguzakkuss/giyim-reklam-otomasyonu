/**
 * Merkezi ortam degiskeni / yapilandirma erisimi.
 * Her ozellik, ilgili key tanimliysa "aktif" kabul edilir. Boylece proje
 * hicbir harici servis olmadan da (mock / yerel store ile) calisabilir.
 */

function env(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

export const config = {
  site: {
    url: env("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
    name: env("NEXT_PUBLIC_SITE_NAME") ?? "ModaVitrin",
  },
  admin: {
    password: env("ADMIN_PASSWORD"),
    sessionSecret: env("ADMIN_SESSION_SECRET") ?? "dev-insecure-secret-change-me",
  },
  supabase: {
    url: env("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: env("SUPABASE_SERVICE_ROLE_KEY"),
    bucket: env("SUPABASE_STORAGE_BUCKET") ?? "media",
    get enabled(): boolean {
      return Boolean(env("NEXT_PUBLIC_SUPABASE_URL") && env("SUPABASE_SERVICE_ROLE_KEY"));
    },
  },
  amazon: {
    associateTag: env("AMAZON_ASSOCIATE_TAG"),
    paapiAccessKey: env("AMAZON_PAAPI_ACCESS_KEY"),
    paapiSecretKey: env("AMAZON_PAAPI_SECRET_KEY"),
    paapiHost: env("AMAZON_PAAPI_HOST") ?? "webservices.amazon.com",
    paapiRegion: env("AMAZON_PAAPI_REGION") ?? "us-east-1",
    get paapiEnabled(): boolean {
      return Boolean(env("AMAZON_PAAPI_ACCESS_KEY") && env("AMAZON_PAAPI_SECRET_KEY") && env("AMAZON_ASSOCIATE_TAG"));
    },
  },
  llm: {
    baseUrl: env("LLM_API_BASE_URL") ?? "https://api.openai.com/v1",
    apiKey: env("LLM_API_KEY"),
    model: env("LLM_MODEL") ?? "gpt-4o-mini",
    get enabled(): boolean {
      return Boolean(env("LLM_API_KEY"));
    },
  },
  luma: {
    apiKey: env("LUMA_API_KEY"),
    get enabled(): boolean {
      return Boolean(env("LUMA_API_KEY"));
    },
  },
  analytics: {
    gaId: env("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
  },
  adsense: {
    client: env("NEXT_PUBLIC_ADSENSE_CLIENT"),
    slotTop: env("NEXT_PUBLIC_ADSENSE_SLOT_TOP"),
    slotInline: env("NEXT_PUBLIC_ADSENSE_SLOT_INLINE"),
    get enabled(): boolean {
      return Boolean(env("NEXT_PUBLIC_ADSENSE_CLIENT"));
    },
  },
  inngest: {
    eventKey: env("INNGEST_EVENT_KEY"),
    signingKey: env("INNGEST_SIGNING_KEY"),
    get enabled(): boolean {
      return Boolean(env("INNGEST_EVENT_KEY") && env("INNGEST_SIGNING_KEY"));
    },
  },
  publish: {
    pinterest: {
      token: env("PINTEREST_ACCESS_TOKEN"),
      boardId: env("PINTEREST_BOARD_ID"),
      get enabled() {
        return Boolean(env("PINTEREST_ACCESS_TOKEN") && env("PINTEREST_BOARD_ID"));
      },
    },
    youtube: {
      clientId: env("YOUTUBE_CLIENT_ID"),
      clientSecret: env("YOUTUBE_CLIENT_SECRET"),
      refreshToken: env("YOUTUBE_REFRESH_TOKEN"),
      get enabled() {
        return Boolean(env("YOUTUBE_CLIENT_ID") && env("YOUTUBE_CLIENT_SECRET") && env("YOUTUBE_REFRESH_TOKEN"));
      },
    },
    meta: {
      token: env("META_ACCESS_TOKEN"),
      igUserId: env("META_IG_USER_ID"),
      fbPageId: env("META_FB_PAGE_ID"),
      get igEnabled() {
        return Boolean(env("META_ACCESS_TOKEN") && env("META_IG_USER_ID"));
      },
      get fbEnabled() {
        return Boolean(env("META_ACCESS_TOKEN") && env("META_FB_PAGE_ID"));
      },
    },
    tiktok: {
      token: env("TIKTOK_ACCESS_TOKEN"),
      get enabled() {
        return Boolean(env("TIKTOK_ACCESS_TOKEN"));
      },
    },
  },
};

export type AppConfig = typeof config;
