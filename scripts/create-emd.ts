#!/usr/bin/env node

/**
 * create-emd.ts — Scaffolding script for new EMD sites
 *
 * Usage:
 *   npx tsx scripts/create-emd.ts --domain meilleur-lion-mane.com --product "Lion's Mane" --category "Compléments Alimentaires"
 *
 * This modifies site.config.ts in-place with the new domain/product info.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONFIG_PATH = resolve(ROOT, 'src/data/site.config.ts');

// ── Parse args ──
const args = process.argv.slice(2);
let domain = '';
let product = '';
let category = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--domain' && args[i + 1]) domain = args[++i];
  if (args[i] === '--product' && args[i + 1]) product = args[++i];
  if (args[i] === '--category' && args[i + 1]) category = args[++i];
}

if (!domain || !product) {
  console.log(`
📦 EMD Site Scaffolder

Usage:
  npx tsx scripts/create-emd.ts --domain <domain> --product <name> [--category <cat>]

Options:
  --domain     Domain name (ex: meilleur-lion-mane.com)
  --product    Product name (ex: Lion's Mane)
  --category   Product category (default: "Compléments Alimentaires")

Example:
  npx tsx scripts/create-emd.ts --domain meilleur-lion-mane.com --product "Lion's Mane"
`);
  process.exit(0);
}

category = category || 'Compléments Alimentaires';
const siteName = domain.replace(/\.\w+$/, '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const slug = domain.replace(/\.\w+$/, '').replace(/^-/, '');
const httpsDomain = `https://${domain}`;

console.log(`\n🚀 Creating EMD site: ${siteName}`);
console.log(`   Domain:    ${httpsDomain}`);
console.log(`   Product:   ${product}`);
console.log(`   Category:  ${category}\n`);

// ── Generate config ──
const productSlug = product.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const config = `// ── Types ──────────────────────────────────────────────────────────────

export interface Product {
  rank: number;
  name: string;
  brand: string;
  slug: string;
  image: string;
  brandLogo: string;
  rating: number;
  reviewCount: number;
  promoCode: string;
  promoPercent: number;
  originalPrice: string;
  discountPrice: string;
  affiliateLink: string;
  origin: string;
  availability: string;
  productType: string;
  pros: string[];
  cons: string[];
  description: string;
}

export interface SiteConfig {
  domain: string;
  siteName: string;
  brand: string;
  product: string;
  productCategory: string;
  tagline: string;
  affiliateLink: string;
  promoCode: string;
  originalPrice: string;
  discountPrice: string;
  rating: number;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
  breadcrumbs: { label: string; href: string }[];
  quickSummary: {
    assets: string[];
    considerations: string[];
  };
  pros: string[];
  cons: string[];
  faq: { question: string; answer: string }[];
  products: Product[];
  tocItems: { id: string; label: string }[];
}

// ── Config ─────────────────────────────────────────────────────────────

const config: SiteConfig = {
  domain: '${httpsDomain}',
  siteName: '${siteName}',
  brand: '${siteName}',
  product: '${product}',
  productCategory: '${category}',
  tagline: '${product} — Le guide complet pour faire le bon choix',

  affiliateLink: '',
  promoCode: '',
  originalPrice: '',
  discountPrice: '',
  rating: 0,

  author: {
    name: 'Tim',
    avatar: '/author-avatar.png',
    bio: 'Expert en ${category.toLowerCase()} et nutrition. Testeur et rédacteur chez LMC.',
  },

  seo: {
    title: '${product} — Meilleur Test & Avis 2026',
    description: 'Découvrez notre analyse complète du ${product}. Avantages, inconvénients, prix et code promo exclusif. Comparatif avec les meilleures alternatives.',
    ogImage: '/og-image.jpg',
  },

  breadcrumbs: [
    { label: '${category}', href: '/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}' },
    { label: '${product}', href: '/${productSlug}' },
  ],

  quickSummary: {
    assets: [
      'À remplir',
    ],
    considerations: [
      'À remplir',
    ],
  },

  pros: [
    'À remplir après test',
  ],

  cons: [
    'À remplir après test',
  ],

  faq: [
    {
      question: 'Qu\\'est-ce que ${product} ?',
      answer: 'À remplir — Description du produit et de ses principaux ingrédients.',
    },
    {
      question: 'Comment utiliser ${product} ?',
      answer: 'À remplir — Posologie et mode d\\'emploi recommandé.',
    },
    {
      question: 'Quels sont les effets de ${product} ?',
      answer: 'À remplir — Résultats attendus et délais d\\'observation.',
    },
    {
      question: 'Y a-t-il des effets secondaires ?',
      answer: 'À remplir — Précautions d\\'emploi et contre-indications.',
    },
    {
      question: 'Où acheter ${product} au meilleur prix ?',
      answer: 'À remplir — Lien vers l\\'offre recommandée avec code promo.',
    },
  ],

  tocItems: [
    { id: 'quick-summary', label: 'En bref' },
    { id: 'introduction', label: 'Introduction' },
    { id: 'composition', label: 'Composition & Ingrédients' },
    { id: 'efficacite', label: 'Efficacité & Résultats' },
    { id: 'prix', label: 'Prix & Offres' },
    { id: 'avis', label: 'Avis Clients' },
    { id: 'pros-cons', label: 'Avantages & Inconvénients' },
    { id: 'faq', label: 'Questions Fréquentes' },
    { id: 'conclusion', label: 'Conclusion' },
  ],

  products: [],
};

export default config;
`;

writeFileSync(CONFIG_PATH, config, 'utf-8');

// ── Update astro.config.mjs site URL ──
const astroConfigPath = resolve(ROOT, 'astro.config.mjs');
let astroConfig = readFileSync(astroConfigPath, 'utf-8');
astroConfig = astroConfig.replace(/site: 'https?:\/\/[^']+'/, `site: '${httpsDomain}'`);
writeFileSync(astroConfigPath, astroConfig, 'utf-8');

// ── Update robots.txt ──
const robotsPath = resolve(ROOT, 'public/robots.txt');
let robots = readFileSync(robotsPath, 'utf-8');
robots = robots.replace(/https:\/\/[^\s]+\/sitemap/, `${httpsDomain}/sitemap`);
writeFileSync(robotsPath, robots, 'utf-8');

console.log(`✅ Config updated:`);
console.log(`   📄 src/data/site.config.ts`);
console.log(`   📄 astro.config.mjs (site: ${httpsDomain})`);
console.log(`   📄 public/robots.txt`);
console.log(`\n📋 Next steps:`);
console.log(`   1. Fill in products[] with real product data`);
console.log(`   2. Generate images: npx node scripts/fal-generate.mjs --type banner --prompt "${product}"`);
console.log(`   3. Generate OG image: npx node scripts/fal-generate.mjs --type og --prompt "${product}"`);
console.log(`   4. Write article content in src/pages/index.astro`);
console.log(`   5. Build & deploy: npx astro build && npx wrangler pages deploy dist --project-name=${slug}`);
console.log();
