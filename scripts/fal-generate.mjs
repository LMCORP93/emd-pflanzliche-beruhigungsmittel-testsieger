#!/usr/bin/env node

/**
 * fal-generate.mjs — Generate images using Fal.AI for EMD sites
 *
 * Usage:
 *   node scripts/fal-generate.mjs --type banner --prompt "coffee supplement product" --output public/banner.jpg
 *   node scripts/fal-generate.mjs --type og --prompt "lion mane mushroom" --output public/og-image.jpg
 *   node scripts/fal-generate.mjs --type product --prompt "supplement bottle" --output public/product.jpg
 *
 * Types:
 *   banner  → 1440x600 (hero banner)
 *   og      → 1200x630 (Open Graph social image)
 *   product → 800x800 (product photo)
 */

const SIZES = {
  banner:  { width: 1440, height: 600, label: 'Hero banner' },
  og:      { width: 1200, height: 630, label: 'OG image' },
  product: { width: 800,  height: 800, label: 'Product image' },
};

// ── Parse args ──
const args = process.argv.slice(2);
let type = '';
let prompt = '';
let output = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--type' && args[i + 1]) type = args[++i];
  if (args[i] === '--prompt' && args[i + 1]) prompt = args[++i];
  if (args[i] === '--output' && args[i + 1]) output = args[++i];
}

if (!type || !prompt || !output) {
  console.log(`
🎨 Fal.AI Image Generator for EMD sites

Usage:
  node scripts/fal-generate.mjs --type <type> --prompt <prompt> --output <path>

Types:
  banner  → 1440x600 (hero banner)
  og      → 1200x630 (Open Graph social image)
  product → 800x800 (product photo)

Options:
  --type     Image type (banner, og, product)
  --prompt   Text description for image generation
  --output   Output file path (ex: public/banner.jpg)

Examples:
  node scripts/fal-generate.mjs --type banner --prompt "premium coffee supplement on marble" --output public/banner.jpg
  node scripts/fal-generate.mjs --type og --prompt "lion mane mushroom supplement" --output public/og-image.jpg

Environment:
  FAL_KEY    Your Fal.AI API key (get one at https://fal.ai/dashboard/keys)
`);
  process.exit(0);
}

if (!SIZES[type]) {
  console.error(`❌ Unknown type: "${type}". Use: banner, og, or product`);
  process.exit(1);
}

const FAL_KEY = process.env.FAL_KEY;

if (!FAL_KEY) {
  console.error(`
❌ FAL_KEY environment variable not set.

Get your API key:
  1. Go to https://fal.ai/dashboard/keys
  2. Create a new API key
  3. Set it: export FAL_KEY="your_key_here"

Then retry:
  FAL_KEY="your_key" node scripts/fal-generate.mjs --type ${type} --prompt "${prompt}" --output ${output}
`);
  process.exit(1);
}

const size = SIZES[type];

async function generateImage() {
  console.log(`🎨 Generating ${size.label} (${size.width}x${size.height})...`);
  console.log(`   Prompt: "${prompt}"`);
  console.log(`   Output: ${output}`);

  try {
    // Submit the generation request
    const submitRes = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: {
          width: size.width,
          height: size.height,
        },
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!submitRes.ok) {
      const err = await submitRes.text();
      console.error(`❌ Submit failed (${submitRes.status}): ${err}`);
      process.exit(1);
    }

    const { request_id } = await submitRes.json();
    console.log(`   Request ID: ${request_id}`);
    console.log(`   ⏳ Processing...`);

    // Poll for result
    let status = 'IN_QUEUE';
    let result = null;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes max

    while (status === 'IN_QUEUE' && attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 1000));
      attempts++;

      const statusRes = await fetch(`https://queue.fal.run/fal-ai/flux/schnell/requests/${request_id}/status`, {
        headers: { 'Authorization': `Key ${FAL_KEY}` },
      });

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        status = statusData.status;

        if (status === 'COMPLETED') {
          // Fetch the result
          const resultRes = await fetch(`https://queue.fal.run/fal-ai/flux/schnell/requests/${request_id}`, {
            headers: { 'Authorization': `Key ${FAL_KEY}` },
          });

          if (resultRes.ok) {
            result = await resultRes.json();
          }
        }
      }

      if (attempts % 5 === 0) {
        process.stdout.write(`   ${status} (${attempts}s)\n`);
      }
    }

    if (!result || !result.images || result.images.length === 0) {
      console.error(`❌ Generation failed or timed out`);
      process.exit(1);
    }

    // Download the image
    const imageUrl = result.images[0].url;
    console.log(`   📥 Downloading image...`);

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      console.error(`❌ Download failed: ${imgRes.status}`);
      process.exit(1);
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const fs = await import('fs');
    const path = await import('path');

    // Ensure output directory exists
    const outDir = path.dirname(output);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(output, buffer);
    const sizeKB = (buffer.length / 1024).toFixed(0);
    console.log(`\n✅ Image saved: ${output} (${sizeKB} KB)`);
    console.log(`   URL: ${imageUrl}`);

  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

generateImage();
