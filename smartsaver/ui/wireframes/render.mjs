#!/usr/bin/env node
// Regenerates each wireframe screen's *.render.html from its *.md source,
// in one process, using wiremd's programmatic API (parse + renderToHTML)
// rather than shelling out to the CLI per file.
//
// home.md additionally gets a small CSS patch for its Panel/Map grid:
// wiremd's grid columns are always equal-fraction (repeat(N, 1fr)) with
// no span/width override, so this is the only way to show the real
// .app proportions (404px fixed panel | flexible map, per app.css).
//
// Run: npm run render (or: node render.mjs)
import { parse, renderToHTML } from 'wiremd';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));

// Explicit list, not every *.md in the folder — v1-proposal.md is prose
// (links to these pages), not a wiremd screen.
const PAGES = ['home.md', 'grocery-list.md', 'settings.md'];

for (const src of PAGES) {
  const md = readFileSync(join(dir, src), 'utf8');
  const ast = parse(md);
  let html = renderToHTML(ast, { style: 'wireframe' });

  if (src === 'home.md') {
    const override = '<style>.wmd-grid-2{grid-template-columns:404px 1fr !important;}</style>';
    html = html.replace('</head>', `${override}\n</head>`);
  }

  const out = src.replace(/\.md$/, '.render.html');
  writeFileSync(join(dir, out), html);
  console.log(`Rendered ${src} -> ${out}`);
}
