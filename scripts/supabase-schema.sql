-- ═══════════════════════════════════════════════════════════════════════
-- LMC EMD Dashboard — Supabase Schema
-- Exécuter dans le SQL Editor de Supabase Dashboard
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. Enrichir la table partners existante ───────────────────────────
-- Ajout des colonnes manquantes pour synchronisation Webflow

ALTER TABLE partners ADD COLUMN IF NOT EXISTS webflow_id TEXT UNIQUE;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS webflow_slug TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS promo_code TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS promo_percent INTEGER DEFAULT 0;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS trustpilot_reviews TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS meta_title TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS short_description TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS long_description TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS affiliate_platform_url TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS product_name TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS is_best_brand BOOLEAN DEFAULT FALSE;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS review_date TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS h2_marketing TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS product_image_url_2 TEXT; -- screen-shot-du-site


-- ── 2. Tables EMD ─────────────────────────────────────────────────────

-- 2a. emd_sites — Un site = un domaine EMD
CREATE TABLE IF NOT EXISTS emd_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,              -- ex: mush-n-go-avis.fr
  cloudflare_project TEXT,                  -- ex: emd-mush-n-go
  cloudflare_branch TEXT DEFAULT 'main',
  primary_partner_id UUID REFERENCES partners(id),
  keyword TEXT,                             -- mot-clé principal ciblé
  site_name TEXT NOT NULL DEFAULT '',       -- ex: "Mush N Go Avis"
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'building', 'published', 'archived')),
  last_deploy_at TIMESTAMPTZ,
  last_deploy_url TEXT,
  config JSONB DEFAULT '{}'::jsonb,        -- config spécifique au site
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2b. emd_pages — Une page par contenu (article, comparatif, legal)
CREATE TABLE IF NOT EXISTS emd_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES emd_sites(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,                        -- ex: "mush-n-go-avis", "comparatif-cafe-champignons"
  type TEXT NOT NULL CHECK (type IN ('blog', 'comparatif', 'legal', 'homepage')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),

  -- SEO
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  og_image TEXT,

  -- Contenu éditorial (UNIQUE par page — anti-duplicate)
  h1 TEXT DEFAULT '',
  content_html TEXT DEFAULT '',             -- Corps de l'article rédigé (UNIQUE)
  content_summary TEXT DEFAULT '',          -- En bref / résumé

  -- Données structurées
  faq JSONB DEFAULT '[]'::jsonb,            -- [{question, answer}]
  pros JSONB DEFAULT '[]'::jsonb,           -- ["pro 1", "pro 2"]
  cons JSONB DEFAULT '[]'::jsonb,           -- ["con 1", "con 2"]

  -- Métadonnées
  word_count INTEGER DEFAULT 0,
  toc_items JSONB DEFAULT '[]'::jsonb,      -- [{id, label}]

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,

  UNIQUE(site_id, slug)
);

-- 2c. emd_page_products — Produits liés à une page (many-to-many)
-- Chaque page peut mentionner des partenaires avec un ANGLE UNIQUE
CREATE TABLE IF NOT EXISTS emd_page_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES emd_pages(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id),
  rank INTEGER DEFAULT 0,

  -- Contenu UNIQUE pour cette page (anti-duplicate)
  custom_description TEXT DEFAULT '',        -- Description réécrite pour CETTE page
  custom_pros JSONB DEFAULT '[]'::jsonb,     -- Pros/cons avec l'angle du KW
  custom_cons JSONB DEFAULT '[]'::jsonb,

  -- Override si besoin (sinon on prend les data du partner)
  override_price TEXT,
  override_promo_code TEXT,
  override_promo_percent INTEGER,
  override_affiliate_link TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(page_id, partner_id)
);

-- 2d. emd_media — Images uploadées
CREATE TABLE IF NOT EXISTS emd_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES emd_sites(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,                   -- chemin dans Supabase Storage
  alt_text TEXT DEFAULT '',
  usage TEXT DEFAULT 'content' CHECK (usage IN ('hero', 'content', 'og', 'favicon', 'logo', 'product')),
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2e. emd_rebuilds — Log des déploiements
CREATE TABLE IF NOT EXISTS emd_rebuilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES emd_sites(id) ON DELETE CASCADE,
  trigger TEXT NOT NULL CHECK (trigger IN ('content_change', 'manual', 'cron', 'initial')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'success', 'failed')),
  deploy_url TEXT,
  duration_seconds INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ── 3. Index ──────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_emd_sites_status ON emd_sites(status);
CREATE INDEX IF NOT EXISTS idx_emd_sites_partner ON emd_sites(primary_partner_id);
CREATE INDEX IF NOT EXISTS idx_emd_pages_site ON emd_pages(site_id);
CREATE INDEX IF NOT EXISTS idx_emd_pages_status ON emd_pages(status);
CREATE INDEX IF NOT EXISTS idx_emd_pages_type ON emd_pages(type);
CREATE INDEX IF NOT EXISTS idx_emd_page_products_page ON emd_page_products(page_id);
CREATE INDEX IF NOT EXISTS idx_emd_page_products_partner ON emd_page_products(partner_id);
CREATE INDEX IF NOT EXISTS idx_emd_media_site ON emd_media(site_id);
CREATE INDEX IF NOT EXISTS idx_emd_rebuilds_site ON emd_rebuilds(site_id);


-- ── 4. RPC Functions ─────────────────────────────────────────────────

-- 4a. Sync un partenaire depuis Webflow (upsert)
CREATE OR REPLACE FUNCTION upsert_partner_from_webflow(
  p_webflow_id TEXT,
  p_slug TEXT,
  p_name TEXT,
  p_logo_url TEXT DEFAULT '',
  p_affiliate_url TEXT DEFAULT '',
  p_product_image_url TEXT DEFAULT '',
  p_screenshot_url TEXT DEFAULT '',
  p_rating FLOAT DEFAULT 0,
  p_review_count TEXT DEFAULT '',
  p_price TEXT DEFAULT '',
  p_promo_code TEXT DEFAULT '',
  p_promo_percent INTEGER DEFAULT 0,
  p_product_type TEXT DEFAULT '',
  p_origin TEXT DEFAULT '',
  p_shipping TEXT DEFAULT '',
  p_contact_email TEXT DEFAULT '',
  p_meta_title TEXT DEFAULT '',
  p_meta_description TEXT DEFAULT '',
  p_short_description TEXT DEFAULT '',
  p_long_description TEXT DEFAULT '',
  p_affiliate_platform_url TEXT DEFAULT '',
  p_product_name TEXT DEFAULT '',
  p_sort_order INTEGER DEFAULT 0,
  p_is_best_brand BOOLEAN DEFAULT FALSE,
  p_delivery_method TEXT DEFAULT '',
  p_availability TEXT DEFAULT '',
  p_review_date TEXT DEFAULT '',
  p_h2_marketing TEXT DEFAULT ''
)
RETURNS UUID AS $$
DECLARE
  v_partner_id UUID;
BEGIN
  INSERT INTO partners (
    webflow_id, webflow_slug, name, slug, brand_name, logo_url,
    affiliate_url, product_image_url, screenshot_url,
    rating, review_count, price, promo_code, promo_percent,
    product_type, origin, shipping, contact_email,
    meta_title, meta_description, short_description, long_description,
    affiliate_platform_url, product_name, sort_order, is_best_brand,
    delivery_method, availability, review_date, h2_marketing,
    status, updated_at
  ) VALUES (
    p_webflow_id, p_slug, p_name, p_slug, LOWER(p_name),
    p_logo_url, p_affiliate_url, p_product_image_url, p_screenshot_url,
    p_rating, p_review_count, p_price, p_promo_code, p_promo_percent,
    p_product_type, p_origin, p_shipping, p_contact_email,
    p_meta_title, p_meta_description, p_short_description, p_long_description,
    p_affiliate_platform_url, p_product_name, p_sort_order, p_is_best_brand,
    p_delivery_method, p_availability, p_review_date, p_h2_marketing,
    'active', now()
  )
  ON CONFLICT (webflow_id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    brand_name = EXCLUDED.brand_name,
    logo_url = EXCLUDED.logo_url,
    affiliate_url = EXCLUDED.affiliate_url,
    product_image_url = EXCLUDED.product_image_url,
    screenshot_url = EXCLUDED.screenshot_url,
    rating = EXCLUDED.rating,
    review_count = EXCLUDED.review_count,
    price = EXCLUDED.price,
    promo_code = EXCLUDED.promo_code,
    promo_percent = EXCLUDED.promo_percent,
    product_type = EXCLUDED.product_type,
    origin = EXCLUDED.origin,
    shipping = EXCLUDED.shipping,
    contact_email = EXCLUDED.contact_email,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    short_description = EXCLUDED.short_description,
    long_description = EXCLUDED.long_description,
    affiliate_platform_url = EXCLUDED.affiliate_platform_url,
    product_name = EXCLUDED.product_name,
    sort_order = EXCLUDED.sort_order,
    is_best_brand = EXCLUDED.is_best_brand,
    delivery_method = EXCLUDED.delivery_method,
    availability = EXCLUDED.availability,
    review_date = EXCLUDED.review_date,
    h2_marketing = EXCLUDED.h2_marketing,
    updated_at = now()
  RETURNING id INTO v_partner_id;

  RETURN v_partner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4b. Log un rebuild
CREATE OR REPLACE FUNCTION log_rebuild(
  p_site_id UUID,
  p_trigger TEXT DEFAULT 'manual'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO emd_rebuilds (site_id, trigger, status) VALUES (p_site_id, p_trigger, 'pending')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4c. Mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER emd_sites_updated_at BEFORE UPDATE ON emd_sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER emd_pages_updated_at BEFORE UPDATE ON emd_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── 5. RLS (Row Level Security) ─────────────────────────────────────
-- Pour l'instant tout ouvert avec le service_role key
-- À restreindre plus tard quand on aura de vrais users

ALTER TABLE emd_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE emd_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE emd_page_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE emd_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE emd_rebuilds ENABLE ROW LEVEL SECURITY;

-- Service role a tout accès
CREATE POLICY "Service role full access on emd_sites" ON emd_sites
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on emd_pages" ON emd_pages
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on emd_page_products" ON emd_page_products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on emd_media" ON emd_media
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on emd_rebuilds" ON emd_rebuilds
  FOR ALL USING (true) WITH CHECK (true);

-- Anon key : lecture seule pour les EMD publiés
CREATE POLICY "Anon read published emd_sites" ON emd_sites
  FOR SELECT USING (status = 'published');

CREATE POLICY "Anon read published emd_pages" ON emd_pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Anon read emd_page_products" ON emd_page_products
  FOR SELECT USING (true);
