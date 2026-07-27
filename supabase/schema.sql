-- ============================================================================
-- Giyim Reklam Otomasyonu - Supabase / Postgres Semasi
-- Supabase SQL Editor'de calistirin. (Plan bolum 3)
-- ============================================================================

-- --- products -------------------------------------------------------------
create table if not exists public.products (
  id            text primary key,
  slug          text unique not null,
  amazon_url    text not null,
  affiliate_url text not null,
  title         text not null,
  description   text not null default '',
  image_url     text not null,
  price         text,
  created_at    timestamptz not null default now()
);

-- --- assets (uretilen video + prompt) -------------------------------------
create table if not exists public.assets (
  id               text primary key,
  product_id       text not null references public.products(id) on delete cascade,
  video_url        text,
  generated_prompt text,
  status           text not null default 'idle', -- idle | pending | ready | failed
  error            text,
  updated_at       timestamptz not null default now(),
  unique (product_id)
);

-- --- captions (platform basi aciklama metni) ------------------------------
create table if not exists public.captions (
  id          text primary key,
  product_id  text not null references public.products(id) on delete cascade,
  platform    text not null, -- tiktok | instagram | facebook | youtube | pinterest
  text        text not null default '',
  updated_at  timestamptz not null default now(),
  unique (product_id, platform)
);

-- --- posts (yayin durumu) -------------------------------------------------
create table if not exists public.posts (
  id            text primary key,
  product_id    text not null references public.products(id) on delete cascade,
  platform      text not null,
  status        text not null default 'draft', -- draft | approved | published | failed
  external_url  text,
  error         text,
  published_at  timestamptz,
  updated_at    timestamptz not null default now(),
  unique (product_id, platform)
);

-- --- clicks (tiklama / trafik logu) ---------------------------------------
create table if not exists public.clicks (
  id           text primary key,
  product_id   text not null references public.products(id) on delete cascade,
  timestamp    timestamptz not null default now(),
  referrer     text,
  is_affiliate boolean not null default false
);

create index if not exists clicks_product_id_idx on public.clicks (product_id);
create index if not exists clicks_timestamp_idx on public.clicks ("timestamp");
create index if not exists posts_product_id_idx on public.posts (product_id);

-- ============================================================================
-- Row Level Security
-- Sunucu tarafi service_role key kullandigi icin RLS'yi bypass eder.
-- Anon anahtarla dogrudan erisim istemiyorsak RLS'yi acip policy vermeyebiliriz.
-- Guvenli varsayilan: RLS acik, policy yok (sadece service_role erisir).
-- ============================================================================
alter table public.products enable row level security;
alter table public.assets   enable row level security;
alter table public.captions enable row level security;
alter table public.posts    enable row level security;
alter table public.clicks   enable row level security;

-- Herkese acik sitede urunleri anon key ile okumak isterseniz asagiyi acin:
-- create policy "public read products" on public.products for select using (true);
-- create policy "public read assets"   on public.assets   for select using (true);
-- create policy "public read captions" on public.captions for select using (true);

-- ============================================================================
-- Storage bucket (video + gorseller icin)
-- Supabase Dashboard > Storage'dan 'media' adinda public bir bucket olusturun,
-- ya da asagidaki komutu SQL Editor'de calistirin:
-- ============================================================================
-- insert into storage.buckets (id, name, public) values ('media', 'media', true)
--   on conflict (id) do nothing;
