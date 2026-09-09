# SmartSaver — front-end structure proposal (v1)

## Structure

Planner stays home. A list icon and a gear icon in the header open the
Grocery List and Settings overlays; the overlay's own `‹` back returns to
the Planner. Nothing here is new UI — both overlays exist in the codebase
today, just unreachable.

```
Planner (home)
  ├─ list icon tap ──▶ Grocery List overlay ──▶ ‹ back ──▶ Planner
  └─ gear icon tap ──▶ Settings overlay      ──▶ ‹ back ──▶ Planner
```

Responsive (already in `app.css`, unchanged by this proposal):
- **≥861px** — overlay = 404px panel column, map stays visible.
- **<861px** — overlay = full screen, panel becomes a bottom sheet.

## Screens

- **[Planner](./home.render.html)** — map + panel, panel sections grouped
  instead of one flat stack: Trip · origin & stops, Staples & deals,
  Worth-it · route, Handoff.
- **[Grocery List](./grocery-list.render.html)** (`GroceryListEditor.tsx`) —
  Shop/Edit modes, categories, per-item deal chips. Already built.
- **[Settings](./settings.render.html)** (`SettingsScreen.tsx`) —
  vehicle/fuel presets, rewards editor. Already built.

## Status

Static structural proposal, not a clickable prototype. Open questions for
v2: where the two header icons actually sit in the brand row, and whether
panel sections collapse by default or start expanded.
