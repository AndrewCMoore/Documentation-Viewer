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
//   items into two columns. A CSS grid doesn't work either: with the panel
//   and map as siblings sharing the same row tracks, the map's own height
//   forces every row it shares to match, pushing the panel's later items
//   down below the map instead of letting the panel run its full height
//   alongside it.
// - Instead, planner.md puts the map first and the panel second (source
//   order only — the map is still the second screen section visually),
//   and this patch floats the map right so the panel's items, which come
//   after it in the document, wrap to its left at their normal height.
// - the fake map image has no wiremd style rule to fill its column, so
//   it's stretched to fill the float's width here.
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
      + 'body.wmd-root>:nth-child(1),body.wmd-root>:nth-child(2){float:right;width:65%;box-sizing:border-box;}'
      + 'body.wmd-root>:nth-child(2){clear:right;}'
      + 'body.wmd-root>:nth-child(n+3){width:30%;box-sizing:border-box;}'
      + '.wmd-image{display:block;width:100%;object-fit:cover;}'
      + '</style>';
    html = html.replace('</head>', `${override}\n</head>`);
  }

  const out = src.replace(/\.md$/, '.render.html');
  writeFileSync(join(dir, out), html);
  console.log(`Rendered ${src} -> ${out}`);
}
