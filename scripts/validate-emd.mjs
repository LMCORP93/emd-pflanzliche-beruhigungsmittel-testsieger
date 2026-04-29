#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const fail = [];
const warn = [];
const read = (p) => readFileSync(join(root, p), 'utf8');

const config = read('src/data/site.config.ts');
if (/isIndexable\s*:\s*false/.test(config) && process.env.ALLOW_NOINDEX !== 'true') {
  fail.push('src/data/site.config.ts: isIndexable:false interdit pour un EMD livrable. Utiliser ALLOW_NOINDEX=true uniquement pour un brouillon explicite.');
}

const robots = read('src/pages/robots.txt.ts');
if (!robots.includes('Allow: /') || !robots.includes('Sitemap:')) {
  fail.push('src/pages/robots.txt.ts: robots doit autoriser le crawl et exposer le sitemap quand isIndexable=true.');
}

const pageDir = join(root, 'src/pages');
const pages = readdirSync(pageDir).filter((f) => f.endsWith('.astro'));
const excluded = /^(index|comparatif|mentions-legales|politique-de-confidentialite)\.astro$/;

for (const file of pages) {
  const src = read(`src/pages/${file}`);
  const isArticle = src.includes('<BlogHero') && src.includes('<TableOfContents') && !excluded.test(file);
  if (!isArticle) continue;

  if (!src.includes("import FirstReview")) fail.push(`${file}: import FirstReview manquant.`);
  if (!src.includes('<FirstReview')) fail.push(`${file}: bloc FirstReview / En bref obligatoire juste après le hero.`);
  if (!src.includes('<div id="intro">')) fail.push(`${file}: ancre #intro obligatoire autour du bloc En bref pour le sommaire.`);
  if (!/tag=["']En bref["']/.test(src)) fail.push(`${file}: le bloc résumé doit utiliser tag="En bref".`);
  if (!/heading=["']Résumé rapide["']/.test(src)) fail.push(`${file}: le bloc résumé doit utiliser heading="Résumé rapide".`);
  if (/<h2>\s*(Conclusion rapide|Notre avis rapide|Le point clé|Notre verdict|Le bon réflexe)\s*<\/h2>/.test(src)) {
    fail.push(`${file}: ancien titre d'intro détecté. Remplacer par le composant En bref.`);
  }
  const firstReviewPos = src.indexOf('<FirstReview');
  const tocPos = src.indexOf('<TableOfContents');
  const promoPos = src.indexOf('<ReviewPromoCard');
  if (!(firstReviewPos > -1 && promoPos > firstReviewPos && tocPos > promoPos)) {
    fail.push(`${file}: ordre attendu = FirstReview → ReviewPromoCard → TableOfContents.`);
  }
}

if (existsSync(join(root, 'public/robots.txt'))) {
  warn.push('public/robots.txt existe: vérifier qu’il ne bypass pas src/pages/robots.txt.ts.');
}

if (fail.length) {
  console.error('\n❌ EMD quality gate failed:\n' + fail.map((x) => `- ${x}`).join('\n'));
  if (warn.length) console.warn('\n⚠️ Warnings:\n' + warn.map((x) => `- ${x}`).join('\n'));
  process.exit(1);
}

console.log(`✅ EMD quality gate OK (${pages.length} pages scannées)`);
if (warn.length) console.warn('\n⚠️ Warnings:\n' + warn.map((x) => `- ${x}`).join('\n'));
