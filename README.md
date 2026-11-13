# RV Dash

Fly Taggy through a scrolling Price Right RV lot. Dodge low fences, stumps, cones and rolling tires, and drop below signs and branches. The course speeds up gradually with distance and a hit ends the run.

## Play on Windows

Double-click **index.html** in File Explorer. Use a browser with internet access for Phaser 3.80.1 on jsDelivr, or one that already cached it. All game art is loaded from the same embedded PNG bundle on a file URL and on a server.

A local server is optional. From this folder, run:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/ in your browser.

## Controls and scoring

Hold Space, the mouse button, or a finger on the playfield to rise. Release to fall. Taggy stays one quarter of the way across the playfield. Space or Play Again starts another run after the brief crash lockout.

- Distance earns one point per 20 logical pixels. Red tag coins earn 5 points, and a near miss earns 5 more.
- Coffee doubles coin points for five active seconds. It leaves flight and course speed predictable.
- Levels advance every 2,400 logical pixels. Course speed gradually rises from 132 to a cap of 230 logical pixels per second.
- Best score and best level are saved separately in browser storage where available. File and server URLs may have separate records. If storage is blocked, records last for the current page session.
- Pause freezes the course and effects. Returning to a hidden tab requires explicit resume. Reduced motion holds decorative scrolling, tilt and particles.
- Sound starts muted. Use the Sound toggle for synthesized pickup and crash cues.

After a run, choose DeWitt or Sterling Heights to enable its inventory link, or play again. Points have no cash value. No personal information is required.

## Files and settings

- index.html holds the layout and classic script tags. game.js contains gameplay, rendering, difficulty and store routes. Bump the matching version on both local scripts in index.html whenever game.js or embedded-assets.js changes.
- game_assets/embedded-assets.js contains nine PNG data URIs. Regenerate it with `python tools/embed-assets.py` after changing the originals.
- ASSETS.md records art provenance. VERIFY.md contains browser evidence. RESUME.md contains the handoff.
- The game originated at Lackofvoice/mini-games commit 70fd287fc72d7b6e54f64d3a2447442ad8bfacdd. The Phase 5 baseline was ade531c.

The analytics helper uses an existing gtag function or dataLayer. Events are game_view, game_start, game_complete, store_selected, cta_click and pickup_collect. Completion records crash, score, level and active duration. The helper sends no personal data and loads no vendor script.

The project has no build step. The intended deployment surface is a dedicated games page. No deployment was performed.
