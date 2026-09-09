#!/usr/bin/env node
// Regenerates each *.render.html from its *.md source, using wiremd's
// programmatic API (parse + renderToHTML).
//
// Each screen (Planner/Grocery List/Settings/Add a rewards program) is its
// own document, linked to the others via real `<a href="...">` wired into
// the header icon-taps and each overlay's `‹` back — see the "Structure"
// diagram in v1-proposal.md.
//
// planner.md additionally gets a small CSS patch for the 30% panel | 70%
// map split:
// - wiremd's `:::` fences don't nest — starting any new fence while one is
//   already open closes the outer one instead of nesting inside it — so
//   there's no wiremd-native way to group the panel's items and the map's
//   items into two columns. Instead, planner.md's markup stays one flat
//   list of top-level elements, and this patch turns the page body itself
//   into the 30/70 grid: everything defaults to column 1, and the second
//   `<h3>` ("Map & navigator") plus everything after it moves to column 2.
// - the fake map image has no wiremd style rule to fill its column, so
//   it's stretched to cover the map cell here.
//
// Run: npm run render (or: node render.mjs)
import { parse, renderToHTML } from 'wiremd';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const PAGES = ['planner.md', 'grocery-list.md', 'settings.md', 'add-reward.md'];

for (const src of PAGES) {
  const md = readFileSync(join(dir, src), 'utf8');
  const ast = parse(md);
  let html = renderToHTML(ast, { style: 'wireframe' });

  if (src === 'planner.md') {
    const override = '<style>'
      + 'body.wmd-root{display:grid;grid-template-columns:30% 70% !important;column-gap:20px;}'
      + 'body.wmd-root>*{grid-column:1;}'
      + 'body.wmd-root>h3:nth-of-type(2){grid-column:2;grid-row:1;}'
      + 'body.wmd-root>h3:nth-of-type(2)~*{grid-column:2;grid-row:2;}'
      + '.wmd-image{display:block;width:100%;height:100%;object-fit:cover;}'
      + '</style>';
    html = html.replace('</head>', `${override}\n</head>`);
  }

  const out = src.replace(/\.md$/, '.render.html');
  writeFileSync(join(dir, out), html);
  console.log(`Rendered ${src} -> ${out}`);
}
