# Giyim Reklam Otomasyonu (ModaVitrin)

Manuel urun girisiyle beslenen, fotograftan **Luma** ile Shorts video ureten,
yari otomatik olarak **TikTok / Instagram / Facebook / YouTube Shorts** ve
**Pinterest**'e yayinlayan; **Google AdSense + Amazon affiliate** ile gelir
kazanan bir Next.js "paravan" giyim sitesi ve icerik otomasyon paneli.

> Onemli: Bu proje **hicbir API anahtari olmadan da calisir**. Anahtar yoksa
> yerel JSON veri deposu + mock (sablon) icerik uretimi devreye girer.

## Otomasyon Akisi

```
Sen (Amazon urun linki + foto)
      -> Admin Panel: Urun Ekle
      -> Urun verisi (PA-API veya manuel) + affiliate link
      -> LLM: video prompt + platform aciklamalari
      -> Luma: fotograftan 9:16 Shorts video
      -> Onay ekrani (onizle / duzenle / onayla)
      -> Video:  TikTok / Instagram / Facebook / YouTube Shorts
         Gorsel: Pinterest
      -> Her gonderide site linki
Ziyaretci siteye gelir -> urun sayfasinda AdSense reklamlari
      -> "Satin Al" -> Amazon affiliate link (komisyon) + tiklama logu
```

## Teknoloji

- **Next.js 14** (App Router, TypeScript) + **Tailwind CSS**
- Veri: **Supabase** (env varsa) ya da **yerel JSON store** (`data/db.json`, dev)
- Async video pipeline: **Inngest** (env varsa) ya da inline calisma
- Metin: **OpenAI uyumlu** LLM (opsiyonel) ya da sablon
- Video: **Luma Dream Machine** (opsiyonel) ya da mock

## Hizli Baslangic

```bash
npm install
cp .env.example .env.local   # degerleri doldurun (bos da birakabilirsiniz)
npm run seed                 # (opsiyonel) 6 ornek urun ekler
npm run dev                  # http://localhost:3000
```

- Site: `http://localhost:3000`
- Admin: `http://localhost:3000/admin` (ADMIN_PASSWORD bos ise dev modunda acik)

## Klasor Yapisi

```
src/
  app/
    (site)/            # ziyaretci sitesi (anasayfa, urun, yasal sayfalar)
    admin/             # admin panel (login, panel, urun-ekle, studyo, analitik)
    git/[id]/          # affiliate yonlendirme + tiklama logu
    api/               # admin API'leri + inngest handler
  components/          # UI bilesenleri (site + admin)
  lib/
    config.ts          # tum env erisimi tek yerde
    db/                # repository: local (JSON) + supabase
    amazon.ts          # affiliate link + PA-API
    ai/                # captions (LLM) + luma (video) + pipeline
    publish/           # pinterest/youtube/meta/tiktok adaptorleri
    inngest/           # async pipeline
supabase/schema.sql    # Postgres semasi
```

---

## SENDEN GEREKENLER (hesaplar / anahtarlar)

Anahtarlari `.env.local` dosyasina (yerel) veya Vercel ortam degiskenlerine
(production) girin. Hangi anahtarin nereye gittigi asagida.

### Faz 1 - Website + gelir (once bunlar)

| Ihtiyac | Nasil / Nereden | Env degiskeni |
|---|---|---|
| Domain | Namecheap / Cloudflare (~10$/yil) | `NEXT_PUBLIC_SITE_URL` |
| Hosting | Vercel (ucretsiz) | - |
| Admin sifresi | Kendiniz belirleyin | `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` |
| Domain e-postasi | Zoho Mail (ucretsiz) / Google Workspace | - (hesap kayitlari icin) |
| Amazon Associates | affiliate.amazon.com.tr | `AMAZON_ASSOCIATE_TAG` |
| Google AdSense | adsense.google.com (site icerik dolunca basvurun) | `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_*` |
| Supabase (onerilir) | supabase.com (ucretsiz) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |

### Faz 2 - AI icerik uretimi

| Ihtiyac | Nereden | Env degiskeni |
|---|---|---|
| Luma API | lumalabs.ai (Dream Machine API) | `LUMA_API_KEY` |
| LLM API | OpenAI / Groq / Gemini (uyumlu) | `LLM_API_KEY`, `LLM_MODEL`, `LLM_API_BASE_URL` |
| Amazon PA-API (yasal gorsel) | Associates onayindan sonra | `AMAZON_PAAPI_ACCESS_KEY`, `AMAZON_PAAPI_SECRET_KEY`, `AMAZON_PAAPI_HOST`, `AMAZON_PAAPI_REGION` |

### Faz 3 - Yayinlama (sosyal API'ler; hepsi opsiyonel)

Token yoksa panel "indir + kopyala" manuel modunu gosterir.

| Platform | Gereken | Env degiskeni |
|---|---|---|
| Pinterest | Business hesap + Developer App | `PINTEREST_ACCESS_TOKEN`, `PINTEREST_BOARD_ID` |
| YouTube | Google Cloud + OAuth (Data API) | `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN` |
| Instagram + Facebook | Meta Developer App + IG Business hesabi + FB Sayfasi | `META_ACCESS_TOKEN`, `META_IG_USER_ID`, `META_FB_PAGE_ID` |
| TikTok | TikTok for Developers (Content Posting API onayi) | `TIKTOK_ACCESS_TOKEN` |

### Inngest (opsiyonel - arka plan video pipeline)

| Ihtiyac | Env degiskeni |
|---|---|
| Inngest Cloud | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` |

---

## Supabase Kurulumu (production icin onerilir)

1. supabase.com'da proje olusturun.
2. SQL Editor'de `supabase/schema.sql` dosyasini calistirin.
3. Storage'da `media` adinda **public** bir bucket olusturun.
4. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` degerlerini env'e girin.

> Yerel JSON store (`data/db.json`) yalnizca gelistirme icindir; Vercel'de
> dosya sistemi kalici olmadigi icin production'da Supabase sart.

## Admin Kullanimi

1. `/admin` -> giris (ADMIN_PASSWORD).
2. **Urun Ekle** -> Amazon linkini yapistir -> **Getir** (PA-API varsa otomatik
   doldurur, yoksa baslik/gorseli elle gir) -> **Kaydet**.
3. **Studyo** -> **Icerik + Video Uret** (LLM + Luma; anahtar yoksa mock).
4. Her platform icin aciklamayi duzenle -> **Onayla**.
5. **Yayinla** (API varsa otomatik) ya da **Videoyu/Gorseli indir + Aciklamayi
   kopyala** ile elle paylas.

## Deployment (Vercel)

```bash
# GitHub'a push edin, sonra Vercel'e import edin. Ya da:
npx vercel
```

1. Vercel > Project > Settings > Environment Variables: `.env.local`'daki
   degerleri girin.
2. Domain'i Vercel > Domains'ten baglayin, `NEXT_PUBLIC_SITE_URL`'i guncelleyin.
3. Inngest kullanacaksaniz Inngest Cloud'da uygulamayi `/api/inngest`
   endpoint'i ile baglayin.

> Not: `/api/admin/generate` ve `/api/admin/publish` uzun surebilir. Vercel
> Hobby plani 10-60sn ile sinirlidir; Luma bekleme suresi icin **Inngest** veya
> Vercel Pro onerilir.

---

## Onemli Uyarilar (Yasal / Platform Kurallari)

- **Amazon gorselleri:** Scraping Amazon sartlarini ihlal eder. Gorselleri
  **PA-API** ile cekin (Associates onayindan sonra).
- **AdSense:** Ince/paravan icerik reddedilir/banlanir. Urun basina ozgun
  aciklama + yasal sayfalar sart (bu proje bunlari icerir). Alternatif:
  Media.net, Ezoic, Adsterra.
- **Otomatik paylasim:** Ozdes icerigi toplu atmak spam sayilir; ban riski.
  Yari otomatik + cesitlendirme + gunluk limit + hesap isitma onerilir.
- **Affiliate aciklamasi:** "As an Amazon Associate we earn from qualifying
  purchases" ibaresi (footer'da mevcut) yasal olarak gerekli.
- **KVKK/GDPR:** Cerez onay banneri mevcut. Reklam/analitik cerezleri icin
  gerekli.
- **Muzik telifi:** Videolarda telifsiz muzik kullanin.
```
