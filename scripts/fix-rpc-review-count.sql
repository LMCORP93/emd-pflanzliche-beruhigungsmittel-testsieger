-- Fix: review_count type mismatch + re-run RPC
-- Le champ review_count dans partners est INTEGER mais Webflow envoie du TEXT ("+170")
-- On cast dans la fonction

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
  v_review_count_int INTEGER;
BEGIN
  -- Essayer de convertir review_count en integer, sinon 0
  BEGIN
    v_review_count_int := CAST(REGEXP_REPLACE(p_review_count, '[^0-9]', '', 'g') AS INTEGER);
  EXCEPTION WHEN OTHERS THEN
    v_review_count_int := 0;
  END;

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
    p_rating, v_review_count_int, p_price, p_promo_code, p_promo_percent,
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
