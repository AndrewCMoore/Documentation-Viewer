#!/usr/bin/env node
// Regenerates prototype.render.html from prototype.md, using wiremd's
// programmatic API (parse + renderToHTML).
//
// prototype.md is all three screens (Home/Grocery List/Settings) in one
// document, each anchored (`<a id="...">`) and linked to the others via
// real `<a href="#...">` wired into the header icon-taps — see the
// "Structure" diagram in v1-proposal.md. It also needs a small CSS patch
// for the Home panel/map grid: wiremd's grid columns are always
// equal-fraction (repeat(N, 1fr)) with no span/width override, so this is
// the only way to show the real .app proportions (404px fixed panel |
// flexible map, per app.css).
//
// Run: npm run render (or: node render.mjs)
import { parse, renderToHTML } from 'wiremd';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const src = 'prototype.md';

const md = readFileSync(join(dir, src), 'utf8');
const ast = parse(md);
let html = renderToHTML(ast, { style: 'wireframe' });

const override = '<style>.wmd-grid-2{grid-template-columns:404px 1fr !important;}</style>';
html = html.replace('</head>', `${override}\n</head>`);

const out = src.replace(/\.md$/, '.render.html');
writeFileSync(join(dir, out), html);
console.log(`Rendered ${src} -> ${out}`);
