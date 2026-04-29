#!/usr/bin/env python3
"""
sync-webflow-to-supabase.py
Sync tous les partenaires publiés de Webflow CMS vers Supabase.
Usage: python3 sync-webflow-to-supabase.py
"""

import json
import re
import sys
import subprocess

# ── Config ────────────────────────────────────────────────────────────
import os

def load_env(path="~/.hermes/.env"):
    """Load env vars from file."""
    env_path = os.path.expanduser(path)
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, val = line.partition("=")
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key and val and key not in os.environ:
                        os.environ[key] = val

load_env()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://jybouyfqjyeelrzfyxqj.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

WEBFLOW_SITE_ID = os.environ.get("WEBFLOW_SITE_ID", "68c013208f7e62f7f4cdd72e")
WEBFLOW_COLLECTION_ID = "68c037ebd75bb59d010b737d"
WEBFLOW_TOKEN = os.environ.get("WEBFLOW_API_TOKEN", "")

PARTNER_COLLECTION_ID = "68c037ebd75bb59d010b737d"
PROMO_COLLECTION_ID = "68c0526af0c6806e50bdf19f"  # Codes promos
ORIGINS_COLLECTION_ID = "68dd2880e3eb56af4b6ae99b"  # Origines


def webflow_get(collection_id, limit=100, offset=0):
    """Fetch items from Webflow CMS."""
    import urllib.request, urllib.parse
    url = f"https://api.webflow.com/v2/collections/{collection_id}/items?limit={limit}&offset={offset}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {WEBFLOW_TOKEN}",
        "Accept": "application/json"
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read().decode("utf-8", errors="replace")
    # Clean control characters
    cleaned = re.sub(r'[\ud800-\udfff\x00-\x08\x0b\x0c\x0e-\x1f]', '', raw)
    return json.loads(cleaned)


def webflow_get_reference(ref_id):
    """Fetch a reference item (origins, categories, etc)."""
    # Try origins collection first, then categories
    for coll_id in [ORIGINS_COLLECTION_ID]:
        try:
            data = webflow_get(coll_id, limit=100)
            for item in data.get("items", []):
                if item.get("id") == ref_id:
                    fd = item.get("fieldData", {})
                    return fd.get("name", fd.get("slug", ref_id))
        except Exception:
            pass
    return ref_id


def clean_html(html):
    """Strip HTML tags from a string."""
    if not html:
        return ""
    return re.sub(r'<[^>]+>', '', html).strip()


def clean_price(price_str):
    """Normalize price string."""
    if not price_str:
        return ""
    return price_str.replace(" ", "").replace("€", "€").strip()


def parse_promo_percent(montant):
    """Extract percentage from string like '-10%', '-15%'."""
    if not montant:
        return 0
    match = re.search(r'(\d+)', montant)
    return int(match.group(1)) if match else 0


def upsert_to_supabase(partner_data):
    """Call the RPC function to upsert a partner."""
    import urllib.request
    url = f"{SUPABASE_URL}/rest/v1/rpc/upsert_partner_from_webflow"
    data = json.dumps(partner_data).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode()
            return json.loads(raw)
    except Exception as e:
        return {"error": str(e)}


def get_logo_url(fd):
    """Extract logo URL from Webflow image field."""
    logo = fd.get("logo")
    if isinstance(logo, dict) and "url" in logo:
        return logo["url"]
    return ""


def get_product_image_url(fd):
    """Extract product image URL."""
    img = fd.get("photo-produit-phare")
    if isinstance(img, dict) and "url" in img:
        return img["url"]
    return ""


def get_screenshot_url(fd):
    """Extract screenshot URL."""
    img = fd.get("screen-shot-du-site")
    if isinstance(img, dict) and "url" in img:
        return img["url"]
    return ""


def main():
    print("🔄 Webflow → Supabase Sync")
    print("=" * 50)

    # 1. Fetch all published partners from Webflow
    all_items = []
    offset = 0
    while True:
        print(f"📄 Fetching partners (offset {offset})...")
        data = webflow_get(PARTNER_COLLECTION_ID, limit=100, offset=offset)
        items = data.get("items", [])
        if not items:
            break
        all_items.extend(items)
        if len(items) < 100:
            break
        offset += 100

    published = [i for i in all_items if not i.get("isDraft", False)]
    print(f"📊 Total: {len(all_items)} | Published: {len(published)} | Draft: {len(all_items) - len(published)}")

    # 2. Upsert each partner
    success = 0
    errors = 0
    for item in published:
        fd = item.get("fieldData", {})
        wf_id = item.get("id", "")
        slug = fd.get("slug", "")
        name = fd.get("name", "?")

        # Resolve origin reference
        origin_raw = fd.get("origine-des-produits", "")
        origin_name = webflow_get_reference(origin_raw) if origin_raw else ""

        payload = {
            "p_webflow_id": wf_id,
            "p_slug": slug,
            "p_name": name,
            "p_logo_url": get_logo_url(fd),
            "p_affiliate_url": fd.get("lien-d-affiliation", ""),
            "p_product_image_url": get_product_image_url(fd),
            "p_screenshot_url": get_screenshot_url(fd),
            "p_rating": fd.get("note", 0) or 0,
            "p_review_count": fd.get("nombre-d-avis-trustpilot", ""),
            "p_price": clean_price(fd.get("prix-du-produit-phare", "")),
            "p_promo_code": fd.get("code-promo", ""),
            "p_promo_percent": parse_promo_percent(fd.get("montant-du-code-promo", "")),
            "p_product_type": fd.get("categorie-2", ""),  # Category reference
            "p_origin": origin_name,
            "p_shipping": fd.get("methode-de-livraison", ""),
            "p_contact_email": fd.get("email-partenaire", ""),
            "p_meta_title": fd.get("meta-titre", ""),
            "p_meta_description": fd.get("meta-description", ""),
            "p_short_description": clean_html(fd.get("comparatif---text-court-carte-top", "")),
            "p_long_description": fd.get("presentation-longue-de-la-marque", ""),
            "p_affiliate_platform_url": fd.get("lien-de-la-plateforme-d-affiliation", ""),
            "p_product_name": fd.get("photo-produit-phare", ""),  # placeholder
            "p_sort_order": fd.get("ordre", 0) or 0,
            "p_is_best_brand": fd.get("meilleure-marque", False) or False,
            "p_delivery_method": fd.get("methode-de-livraison", ""),
            "p_availability": fd.get("ou-acheter-leur-produit", ""),
            "p_review_date": fd.get("date-de-referencement-de-la-fiche", ""),
            "p_h2_marketing": fd.get("phrase-marketing-h2-sur-profil-page", ""),
        }

        result = upsert_to_supabase(payload)
        if isinstance(result, dict) and result.get("code") and str(result.get("code")) != str(result.get("id")):
            print(f"  ❌ {name:<25} | {str(result)[:100]}")
            errors += 1
        else:
            print(f"  ✅ {name:<25} | {slug}")
            success += 1

    print(f"\n{'=' * 50}")
    print(f"✨ Sync terminé: {success} succès, {errors} erreurs")


if __name__ == "__main__":
    main()
