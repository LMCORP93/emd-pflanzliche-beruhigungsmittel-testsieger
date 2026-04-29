#!/usr/bin/env node
// ── fetch-product.mjs ─────────────────────────────────────────────
// Fetch product + brand data from Webflow CMS and output EMD-ready config
// Usage: node scripts/fetch-product.mjs "Mush N Go"
//        node scripts/fetch-product.mjs --list
//        node scripts/fetch-product.mjs --list-brands
// ─────────────────────────────────────────────────────────────────

const WEBFLOW_TOKEN = process.env.WEBFLOW_TOKEN || '5ddaf23f71c5b4c288f05a30fdc5201e33cdf19c69f356218361c53570f98688';
const SITE_ID = process.env.WEBFLOW_SITE_ID || '68c013208f7e62f7f4cdd72e';

const COLLECTIONS = {
  products: '68c0380b263e7833b8371628',
  partners: '68c037ebd75bb59d010b737d',
  origins: '68dd2880e3eb56af4b6ae99b',
  categories: '68c02c2cdef2da2fda5a7205',
  promoCodes: '68c0526af0c6806e50bdf19f',
};

// ── Helpers ───────────────────────────────────────────────────────

async function webflowFetch(path) {
  const res = await fetch(`https://api.webflow.com/v2${path}`, {
    headers: {
      'Authorization': `Bearer ${WEBFLOW_TOKEN}`,
      'accept': 'application/json',
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Webflow API ${res.status}: ${err}`);
  }
  return res.json();
}

function imageUrl(img) {
  if (!img) return null;
  if (typeof img === 'string') return img;
  return img.url || null;
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

function parsePromoPercent(montant) {
  if (!montant) return 0;
  const match = montant.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function normalizePrice(price) {
  if (!price) return '';
  return price.replace(/\s/g, '').trim();
}

// ── Fetch all reference data (origins, categories) ───────────────

async function fetchReferences() {
  const [originsRes, categoriesRes] = await Promise.all([
    webflowFetch(`/collections/${COLLECTIONS.origins}/items?limit=100`),
    webflowFetch(`/collections/${COLLECTIONS.categories}/items?limit=100`),
  ]);

  const origins = {};
  for (const item of originsRes.items || []) {
    origins[item.id] = {
      name: item.fieldData.name,
      slug: item.fieldData.slug,
      flag: imageUrl(item.fieldData.drapeau),
    };
  }

  const categories = {};
  for (const item of categoriesRes.items || []) {
    categories[item.id] = {
      name: item.fieldData.name,
      slug: item.fieldData.slug,
    };
  }

  return { origins, categories };
}

// ── Find product by name/slug ────────────────────────────────────

async function findProduct(query) {
  const res = await webflowFetch(`/collections/${COLLECTIONS.products}/items?limit=100`);
  const q = query.toLowerCase();

  for (const item of res.items || []) {
    const fd = item.fieldData;
    if (
      fd.name?.toLowerCase().includes(q) ||
      fd.slug?.toLowerCase().includes(q)
    ) {
      return item;
    }
  }
  return null;
}

// ── Find partner by name/slug ────────────────────────────────────

async function findPartner(query) {
  const res = await webflowFetch(`/collections/${COLLECTIONS.partners}/items?limit=100`);
  const q = query.toLowerCase();

  for (const item of res.items || []) {
    const fd = item.fieldData;
    if (
      fd.name?.toLowerCase().includes(q) ||
      fd.slug?.toLowerCase().includes(q)
    ) {
      return item;
    }
  }
  return null;
}

// ── Build EMD product config from CMS data ───────────────────────

function buildProductConfig(productItem, partnerItem, refs) {
  const pf = productItem.fieldData;
  const bf = partnerItem?.fieldData || {};

  // Resolve origin
  const originId = pf['origine-de-la-marque'] || bf['origine-de-la-marque-v2'] || bf['origine-des-produits'];
  const origin = refs.origins[originId] || { name: 'France', slug: 'france', flag: null };

  // Resolve category
  const catId = pf.categorie || bf['categorie-2'];
  const category = refs.categories[catId] || { name: 'Compléments alimentaires', slug: 'complements-alimentaires' };

  // Partner data takes priority for promo/pricing (it's more curated)
  const promoCode = bf['code-promo'] || '';
  const promoPercent = parsePromoPercent(bf['montant-du-code-promo']);
  const originalPrice = normalizePrice(bf['prix-du-produit-phare'] || pf['prix-standard-2'] || '');
  const discountPrice = normalizePrice(bf['prix-avec-reduction'] || pf['prix-remise-avec-code-promo-2'] || '');
  const affiliateLink = bf['lien-d-affiliation'] || pf['lien-d-affiliation-qui-mene-directement-au-produit'] || '';
  const rating = bf.note || 0;

  // Product image: prefer product image, fallback to partner phare
  const productImage = imageUrl(pf['produit-image']) || imageUrl(bf['photo-produit-phare']);
  const brandLogo = imageUrl(bf.logo);
  const partnerName = bf.name || 'Marque';
  const slug = pf.slug || bf.slug || 'produit';

  // Parse pros/cons from rich text (may contain <li> tags or be plain text)
  function parseListItems(html) {
    if (!html) return [];
    // Try <li> tags first
    const liMatches = html.match(/<li[^>]*>(.*?)<\/li>/gs);
    if (liMatches && liMatches.length > 0) {
      return liMatches.map(li => stripHtml(li)).filter(Boolean);
    }
    // Fallback: split on double newlines or periods followed by uppercase
    const stripped = stripHtml(html);
    // Split on sentence boundaries (period+space+uppercase) or double newlines
    const parts = stripped.split(/(?<=[.!?])\s+(?=[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ])|\n\s*\n/);
    return parts.map(s => s.trim()).filter(s => s.length > 10);
  }

  const pros = parseListItems(pf['benefices-points-cles']);
  const cons = parseListItems(pf['points-faibles--']);

  // Description (strip HTML)
  const description = stripHtml(pf['desription-longue-du-produit'] || '');

  // Shipping
  const shippingRaw = bf['methode-de-livraison'] || '';
  const shipping = shippingRaw.includes('France') || shippingRaw.includes('national')
    ? 'France'
    : shippingRaw.split(',')[0].trim() || 'France';

  // Product type
  const productType = pf['format-du-produit'] || category.name || 'Complément alimentaire';

  // Flag emoji mapping
  const flagEmojis = {
    'france': '🇫🇷', 'allemagne': '🇩🇪', 'royaume-uni': '🇬🇧', 'etat-unis': '🇺🇸',
    'suisse': '🇨🇭', 'belgique': '🇧🇪', 'pays-bas': '🇳🇱', 'espagne': '🇪🇸',
    'italie': '🇮🇹', 'japon': '🇯🇵', 'chine': '🇨🇳', 'inde': '🇮🇳',
    'bresil': '🇧🇷', 'canada': '🇨🇦', 'australie': '🇦🇺', 'luxembourg': '🇱🇺',
    'slovenie': '🇸🇮', 'croatie': '🇭🇷', 'bulgarie': '🇧🇬',
  };
  const originFlag = flagEmojis[origin.slug] || '🇫🇷';
  const originName = origin.name || 'France';

  return {
    // ── Product data for ReviewPromoCard ──
    product: {
      name: pf.name || partnerName,
      image: productImage,
      rating: typeof rating === 'number' ? rating : parseFloat(rating) || 0,
      productType,
      origin: `${originFlag} ${originName}`,
      originFlag,
      shipping,
      promoCode,
      promoPercent,
      originalPrice,
      discountPrice,
      affiliateLink,
    },

    // ── Full Product interface for site.config.ts ──
    fullProduct: {
      rank: 1,
      name: pf.name || partnerName,
      brand: partnerName,
      slug,
      image: productImage,
      brandLogo: brandLogo || '',
      rating: typeof rating === 'number' ? rating : parseFloat(rating) || 0,
      reviewCount: parseInt(bf['nombre-d-avis-trustpilot']?.replace(/\D/g, '') || '0', 10) || 0,
      promoCode,
      promoPercent,
      originalPrice,
      discountPrice,
      affiliateLink,
      origin: `${originFlag} ${originName}`,
      availability: 'En stock',
      productType,
      pros,
      cons,
      description,
    },

    // ── Brand data for BrandReviewCard ──
    brand: {
      name: partnerName,
      slug: bf.slug || slug,
      logo: brandLogo,
      rating: typeof rating === 'number' ? rating : parseFloat(rating) || 0,
      coupDeCoeur: !!bf['meilleure-marque'],
      trustpilotCount: bf['nombre-d-avis-trustpilot'] || '',
      trustpilotLink: bf['lien-trus-pilote-ou-google-review'] || '',
      instagram: bf['lien-instagram'] || '',
      presentationLongue: bf['presentation-longue-de-la-marque'] || '',
      originName,
      originFlag,
      originFlagUrl: origin.flag,
    },

    // ── Raw field data (for debugging) ──
    raw: {
      productFields: pf,
      partnerFields: bf,
    },
  };
}

// ── List all products ────────────────────────────────────────────

async function listProducts() {
  const res = await webflowFetch(`/collections/${COLLECTIONS.products}/items?limit=100`);
  const { origins } = await fetchReferences();

  const rows = [];
  for (const item of res.items || []) {
    const fd = item.fieldData;
    const partnerId = fd.partenaire;
    let partnerName = '';

    // Quick fetch partner name
    if (partnerId) {
      try {
        const pRes = await webflowFetch(`/collections/${COLLECTIONS.partners}/items/${partnerId}`);
        partnerName = pRes.fieldData?.name || '';
      } catch {}
    }

    rows.push({
      name: fd.name,
      slug: fd.slug,
      partner: partnerName,
      price: fd['prix-standard-2'] || '',
      format: fd['format-du-produit'] || '',
      image: imageUrl(fd['produit-image']) ? '✅' : '❌',
    });
  }

  console.log(`\n📦 ${rows.length} produits dans le CMS:\n`);
  console.log(
    'NAME'.padEnd(35) +
    'PARTNER'.padEnd(22) +
    'PRICE'.padEnd(12) +
    'FORMAT'.padEnd(15) +
    'IMG'
  );
  console.log('─'.repeat(95));
  for (const r of rows) {
    console.log(
      r.name.padEnd(35) +
      r.partner.padEnd(22) +
      r.price.padEnd(12) +
      r.format.padEnd(15) +
      r.image
    );
  }
}

// ── List all brands/partners ─────────────────────────────────────

async function listBrands() {
  const res = await webflowFetch(`/collections/${COLLECTIONS.partners}/items?limit=100`);
  const { origins } = await fetchReferences();

  const rows = [];
  for (const item of res.items || []) {
    const fd = item.fieldData;
    const originId = fd['origine-de-la-marque-v2'] || fd['origine-des-produits'];
    const origin = origins[originId] || { name: '?', slug: '' };
    const logo = imageUrl(fd.logo);
    const phare = imageUrl(fd['photo-produit-phare']);

    rows.push({
      name: fd.name,
      slug: fd.slug,
      note: fd.note || 0,
      promo: fd['code-promo'] || '',
      promoAmt: fd['montant-du-code-promo'] || '',
      price: fd['prix-du-produit-phare'] || '',
      origin: origin.name,
      logo: logo ? '✅' : '❌',
      phare: phare ? '✅' : '❌',
      affiliate: fd['lien-d-affiliation'] ? '✅' : '❌',
      coeur: fd['meilleure-marque'] ? '❤️' : '',
    });
  }

  console.log(`\n🏪 ${rows.length} partenaires dans le CMS:\n`);
  console.log(
    'NAME'.padEnd(22) +
    'NOTE'.padEnd(6) +
    'PROMO'.padEnd(10) +
    'AMT'.padEnd(7) +
    'PRICE'.padEnd(12) +
    'ORIGIN'.padEnd(14) +
    'LG PH AF'.padEnd(10) +
    '❤️'
  );
  console.log('─'.repeat(90));
  for (const r of rows) {
    console.log(
      r.name.padEnd(22) +
      String(r.note).padEnd(6) +
      r.promo.padEnd(10) +
      r.promoAmt.padEnd(7) +
      r.price.padEnd(12) +
      r.origin.padEnd(14) +
      (r.logo + ' ' + r.phare + ' ' + r.affiliate).padEnd(10) +
      r.coeur
    );
  }
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (!args[0] || args[0] === '--help' || args[0] === '-h') {
    console.log(`
📦 fetch-product.mjs — Webflow CMS → EMD data bridge

Usage:
  node scripts/fetch-product.mjs "Product Name"     Fetch product + partner data
  node scripts/fetch-product.mjs --list              List all products
  node scripts/fetch-product.mjs --list-brands       List all partners/brands

Output: JSON with product, fullProduct, and brand data ready for site.config.ts
`);
    process.exit(0);
  }

  if (args[0] === '--list') {
    await listProducts();
    return;
  }

  if (args[0] === '--list-brands') {
    await listBrands();
    return;
  }

  const query = args.join(' ');
  console.log(`🔍 Searching for "${query}"...\n`);

  const refs = await fetchReferences();

  // Try as product first, then as partner
  let productItem = await findProduct(query);
  let partnerItem = null;

  if (productItem) {
    console.log(`✅ Product found: ${productItem.fieldData.name}`);

    // Resolve partner reference
    const partnerId = productItem.fieldData.partenaire;
    if (partnerId) {
      try {
        const pRes = await webflowFetch(`/collections/${COLLECTIONS.partners}/items/${partnerId}`);
        partnerItem = pRes;
        console.log(`✅ Partner found: ${pRes.fieldData.name}`);
      } catch (e) {
        console.log(`⚠️  Partner reference failed: ${e.message}`);
      }
    }
  }

  // If no product found, try as partner
  if (!productItem) {
    partnerItem = await findPartner(query);
    if (partnerItem) {
      console.log(`✅ Partner found: ${partnerItem.fieldData.name}`);

      // Get the partner's main product (produit-reference-1)
      const productId = partnerItem.fieldData['produit-reference-1'];
      if (productId) {
        try {
          const pRes = await webflowFetch(`/collections/${COLLECTIONS.products}/items/${productId}`);
          productItem = pRes;
          console.log(`✅ Main product found: ${pRes.fieldData.name}`);
        } catch (e) {
          console.log(`⚠️  Product reference failed: ${e.message}`);
        }
      }
    }
  }

  if (!productItem && !partnerItem) {
    console.log(`❌ No product or partner found for "${query}"`);
    console.log('   Use --list or --list-brands to see available items');
    process.exit(1);
  }

  // Build config
  const config = buildProductConfig(
    productItem?.fieldData ? productItem : { fieldData: {} },
    partnerItem,
    refs
  );

  // Output
  console.log('\n' + '═'.repeat(60));
  console.log('📋 EMD-READY PRODUCT DATA');
  console.log('═'.repeat(60));

  console.log('\n── ReviewPromoCard props ──');
  console.log(JSON.stringify(config.product, null, 2));

  console.log('\n── Full Product (site.config.ts) ──');
  console.log(JSON.stringify(config.fullProduct, null, 2));

  console.log('\n── Brand data ──');
  const brandOut = { ...config.brand };
  delete brandOut.presentationLongue; // too long for summary
  delete brandOut.originFlagUrl;
  console.log(JSON.stringify(brandOut, null, 2));

  // Also output a TypeScript snippet ready to paste
  console.log('\n' + '═'.repeat(60));
  console.log('📝 COPY-PASTE FOR site.config.ts products[]');
  console.log('═'.repeat(60));
  const p = config.fullProduct;
  console.log(`{
    rank: ${p.rank},
    name: '${p.name.replace(/'/g, "\\'")}',
    brand: '${p.brand.replace(/'/g, "\\'")}',
    slug: '${p.slug}',
    image: '${p.image}',
    brandLogo: '${p.brandLogo}',
    rating: ${p.rating},
    reviewCount: ${p.reviewCount},
    promoCode: '${p.promoCode}',
    promoPercent: ${p.promoPercent},
    originalPrice: '${p.originalPrice}',
    discountPrice: '${p.discountPrice}',
    affiliateLink: '${p.affiliateLink}',
    origin: '${p.origin}',
    availability: '${p.availability}',
    productType: '${p.productType.replace(/'/g, "\\'")}',
    pros: ${JSON.stringify(p.pros)},
    cons: ${JSON.stringify(p.cons)},
    description: '${(p.description || '').substring(0, 150).replace(/'/g, "\\'")}...',
  },`);

  // Save full JSON to file for programmatic use
  const outPath = new URL('../src/data/cms-product.json', import.meta.url);
  const fs = await import('fs');
  fs.writeFileSync(outPath, JSON.stringify(config, null, 2));
  console.log(`\n💾 Full JSON saved to: src/data/cms-product.json`);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
