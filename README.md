# RV Dash

RV Dash is a short Price Right RV arcade runner. Guide Taggy through the lot, collect tokens and dodge obstacles. Reach 50 points by the end of a 60-second round. Every result offers a reversible choice of DeWitt or Sterling Heights before opening the selected store’s inventory page.

## Run locally

From this folder, run:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/ in your browser. Arrow Left and Right move, and Arrow Up or Space jumps. The on-screen buttons also work with pointer and touch input. Tap the playfield to jump. Pause holds the round, and a hidden tab requires explicit resume.

The game targets current browsers with Phaser support and Pointer Events. Edge is the tested browser. See VERIFY.md for viewport and device coverage.

## Files and settings

- index.html contains the layout, controls and result panel.
- game.js contains the scene, procedural art, round tuning, routes and optional host analytics.
- ASSETS.md describes the graphics and the Taggy replacement point.
- VERIFY.md records observed behavior. RESUME.md records the handoff.

Source was Lackofvoice/mini-games at 70fd287fc72d7b6e54f64d3a2447442ad8bfacdd. The original asset placeholders are retained for provenance.

Gameplay constants are at the top of game.js. The 600 × 800 playfield uses one ground line at y=644. Items spawn every 1.25 seconds in a repeating pattern and travel at 235 logical pixels per second. Tokens award 10 points and obstacles deduct up to 5. STORE_URLS maps each store identifier to its approved Price Right RV location page.

## Analytics and sound

The helper sends game_view once per page and game_start and game_complete once per round. Completion includes result, score and active duration. A changed choice emits store_selected. Inventory-link activation emits cta_click. Both store events include the selected store identifier. Every event includes game_name. The helper uses a pre-existing gtag function first, then a pre-existing dataLayer array. Play and navigation work without either integration. The game runs silently.

## CDN and embedding

The page loads Phaser 3.80.1 from jsDelivr. An offline browser may start from its cache. An uncached dependency requires network access, and a failed load displays a retry message. The proposed embedding is a self-contained page in a dedicated games section. This work performed no deployment or website integration. Taggy is placeholder art pending the approved sprite sheet.
