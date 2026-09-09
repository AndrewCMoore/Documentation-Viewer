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
                          └─ + Add a rewards program ──▶ ‹ back ──▶ Settings
```

Responsive (already in `app.css`, unchanged by this proposal):
- **≥861px** — overlay = 404px panel column, map stays visible.
- **<861px** — overlay = full screen, panel becomes a bottom sheet.

## Screens

Each screen is its own page — the header icon-taps and each overlay's `‹`
back are real links between them, matching the flow above.

- **[Planner](./planner.render.html)** — map + panel, panel sections
  grouped instead of one flat stack: Trip · origin & stops, Staples & deals,
  Handoff.
- **[Grocery List](./grocery-list.render.html)**
  (`GroceryListEditor.tsx`) — Shop/Edit modes, categories, per-item deal
  chips. Already built.
- **[Settings](./settings.render.html)** (`SettingsScreen.tsx`) —
  vehicle/fuel presets, rewards editor. Already built.
- **[Add a rewards program](./add-reward.render.html)** — new screen, not
  built yet. Reached from Settings' `+ Add a rewards program` button;
  search plus a popular-programs list.

## Status

Clickable prototype — the icon-taps navigate between screens. Open
questions for v2: where the two header icons actually sit in the brand
row, and whether panel sections collapse by default or start expanded.
