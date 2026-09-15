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
const PAGES = [
  'planner.md', 'grocery-list.md', 'settings.md', 'add-reward.md',
  'mobile-planner.md', 'mobile-grocery-list.md', 'mobile-settings.md', 'mobile-add-reward.md',
];

for (const src of PAGES) {
  const md = readFileSync(join(dir, src), 'utf8');
  const ast = parse(md);
  let html = renderToHTML(ast, { style: 'wireframe' });

  if (src === 'planner.md') {
    const override = '<style>'
      + 'body.wmd-root>:nth-child(1),body.wmd-root>:nth-child(2){float:right;width:65%;box-sizing:border-box;}'
      + 'body.wmd-root>:nth-child(2){clear:right;}'
      + 'body.wmd-root>:nth-child(n+3):not(button){width:30%;box-sizing:border-box;}'
      + '.wmd-image{display:block;width:100%;object-fit:cover;}'
      + '</style>';
    html = html.replace('</head>', `${override}\n</head>`);
  }

  // Every mobile-*.md screen renders inside a fixed-size device frame (a
  // capped height with its own internal scroll, not the full browser
  // viewport) so it reads as one phone screen instead of an endless column,
  // with a sticky notch/home-indicator so it reads as a phone at a glance.
  if (src.startsWith('mobile-')) {
    const frame = '<style>'
      // overflow set directly on <body> propagates to the viewport instead
      // of clipping body's own box (CSS overflow-propagation rule) — html
      // {overflow:hidden} opts out of that so the frame's height/border-
      // radius actually clip its content and only the frame itself scrolls.
      + 'html{overflow:hidden;}'
      + 'body.wmd-root{width:390px;height:844px;margin:32px auto;box-sizing:border-box;overflow-y:auto;overflow-x:hidden;border:14px solid #000;border-radius:54px;}'
      + 'body.wmd-root::before{content:"";position:sticky;top:0;display:block;width:120px;height:26px;margin:0 auto;background:#000;border-radius:0 0 16px 16px;z-index:2;}'
      + 'body.wmd-root::after{content:"";position:sticky;bottom:0;display:block;width:134px;height:5px;margin:-13px auto 8px;background:#000;opacity:.6;border-radius:3px;z-index:2;}'
      // Real actionable buttons get a ~44px touch target (the usual mobile
      // minimum) and bigger type; chips are inline deal badges, not tap
      // targets, so they're excluded and stay at their normal small size.
      + '.wmd-button:not(.wmd-chip){min-height:44px;padding:12px 18px;margin:4px 8px 4px 0;font-size:14px;box-sizing:border-box;}'
      + '.wmd-button.wmd-icon:not(.wmd-chip){min-width:44px;padding:10px;}'
      + '</style>';
    html = html.replace('</head>', `${frame}\n</head>`);
  }

  // mobile-planner.md additionally gets the <861px behaviour described in
  // v1-proposal.md: the map fills the screen and the panel becomes a
  // bottom sheet, instead of the desktop panel|map column split above. The
  // "Map & navigator"/"Panel" annotation headings from planner.md are
  // dropped from mobile-planner.md's source (not just hidden here) since
  // there's no room for design-annotation labels on a phone screen.
  if (src === 'mobile-planner.md') {
    const sheet = '<style>'
      // Flush the map to the frame's edges and pull the notch back over it
      // (the frame CSS above otherwise reserves space for the notch, which
      // is right for text screens but wrong for planner's full-bleed map).
      + 'body.wmd-root{padding:0;}'
      + 'body.wmd-root::before{margin-bottom:-26px;}'
      + '.wmd-image{display:block;width:100%;height:380px;object-fit:cover;}'
      + 'body.wmd-root>:nth-child(n+2){background:#f0f0f0;padding-left:20px;padding-right:20px;box-sizing:border-box;}'
      + 'body.wmd-root>:nth-child(2){position:relative;top:-16px;margin-top:0;padding-top:20px;border-top:3px solid #000;border-radius:16px 16px 0 0;box-shadow:0 -6px 14px rgba(0,0,0,.25);}'
      + 'body.wmd-root>:nth-child(2)::before{content:"";display:block;width:40px;height:4px;margin:0 auto 12px;background:#000;opacity:.3;border-radius:2px;}'
      + '</style>';
    html = html.replace('</head>', `${sheet}\n</head>`);
  }

  // Planner/Grocery List/Settings are peer tabs, so each of their sources
  // ends with the same 3-item tab-bar link row (the active tab marked
  // wmd-primary) — pin it to the bottom of the frame. Add-reward is a
  // pushed sub-screen under Settings (its own ‹ back), not a tab, so it's
  // excluded.
  //
  // Targeted by a class marked onto its <p>, not :last-child/:nth-child —
  // a browser extension (or anything else) appending its own node to
  // <body> shifts what :last-child matches out from under it.
  if (['mobile-planner.md', 'mobile-grocery-list.md', 'mobile-settings.md'].includes(src)) {
    html = html.replace(
      '<p class="wmd-paragraph"><a href="./mobile-planner.render.html"',
      '<p class="wmd-paragraph wmd-tabbar"><a href="./mobile-planner.render.html"',
    );
    const tabbar = '<style>'
      + '.wmd-tabbar{position:sticky;bottom:0;display:flex;gap:8px;margin:16px 0 -8px;padding:10px 0 6px;background:#f0f0f0;border-top:3px solid #000;z-index:3;}'
      + '.wmd-tabbar a.wmd-button{flex:1;margin:0;text-align:center;}'
      + '</style>';
    html = html.replace('</head>', `${tabbar}\n</head>`);
  }

  const out = src.replace(/\.md$/, '.render.html');
  writeFileSync(join(dir, out), html);
  console.log(`Rendered ${src} -> ${out}`);
}
