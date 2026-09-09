#!/usr/bin/env node
// Regenerates each *.render.html from its *.md source, using wiremd's
// programmatic API (parse + renderToHTML).
//
// prototype.md is all three core screens (Home/Grocery List/Settings) in
// one document, each anchored (`<a id="...">`) and linked to the others
// via real `<a href="#...">` wired into the header icon-taps — see the
// "Structure" diagram in v1-proposal.md. add-reward.md is a separate
// screen, linked from Settings' "+ Add a rewards program" button.
//
// prototype.md additionally gets a small CSS patch:
// - wiremd's grid columns are always equal-fraction (repeat(N, 1fr)) with
//   no span/width override, so this is the only way to show a 30% panel |
//   70% map split.
// - the fake map image has no wiremd style rule to fill its column, so
//   it's stretched to cover the map cell here.
//
// Run: npm run render (or: node render.mjs)
import { parse, renderToHTML } from 'wiremd';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const PAGES = ['prototype.md', 'add-reward.md'];

for (const src of PAGES) {
  const md = readFileSync(join(dir, src), 'utf8');
  const ast = parse(md);
  let html = renderToHTML(ast, { style: 'wireframe' });

  if (src === 'prototype.md') {
    const override = '<style>.wmd-container-grid-2{grid-template-columns:30% 70% !important;}'
      + '.wmd-image{display:block;width:100%;height:100%;object-fit:cover;}</style>';
    html = html.replace('</head>', `${override}\n</head>`);
  }

  const out = src.replace(/\.md$/, '.render.html');
  writeFileSync(join(dir, out), html);
  console.log(`Rendered ${src} -> ${out}`);
}
