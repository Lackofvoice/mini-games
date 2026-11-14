# RV Dash

Fly Taggy through a scrolling Price Right RV lot. Dodge low fences, stumps, cones and rolling tires, and drop below signs and branches. The course speeds up gradually with distance and a hit ends the run.

## Play on Windows

Double-click **index.html** in File Explorer. Phaser 3.80.1 and its MIT license are bundled under vendor/. Game art uses the embedded PNG bundle and the page uses system fonts, so the game opens offline. Browsing dealership inventory still requires a connection.

A local server is optional. From this folder, run:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/ in your browser.

## Controls and scoring

Hold Up, W, the mouse button, or the left half of the playfield on touch to rise. Release to fall. Shoot with Space or tap the right half on touch. Holding Space fires every 350 ms. Use P, Escape, or Pause to pause or resume. Space or Play Again starts another run after the crash lockout.

- Distance earns one point per 20 logical pixels. Red tag coins earn 5 points, and a near miss earns 5 more.
- Coffee doubles coin points for five active seconds. It leaves flight and course speed predictable.
- Levels advance every 3,000 logical pixels. Course speed gradually rises from 132 to a cap of 230 logical pixels per second.
- Drones, birds and carts arrive after the first level-up and at least 20 seconds of play. Each fifth level introduces a ten-hit SOLD stamp that drops tires. Its defeat adds 250 points.
- Best score and best level are saved separately in browser storage where available. File and server URLs may have separate records. If storage is blocked, records last for the current page session.
- Pause freezes the course and effects. Returning to a hidden tab requires explicit resume. Reduced motion holds decorative scrolling, tilt and particles.
- Sound starts muted. Use the Sound toggle for synthesized pickup and crash cues.

After a run, choose DeWitt or Sterling Heights to enable its inventory link, or play again. Points have no cash value. No personal information is required.

## Files and settings

- index.html holds the layout and classic script tags. game.js contains gameplay, rendering, difficulty and store routes. Bump the matching version on the stylesheet and all three local scripts in index.html when releasing changes.
- game_assets/embedded-assets.js contains the embedded artwork. Regenerate it with `python tools/embed-assets.py` after changing the originals.
- ASSETS.md records art provenance. VERIFY.md contains browser evidence. RESUME.md contains the handoff.
- The game originated at Lackofvoice/mini-games commit 70fd287fc72d7b6e54f64d3a2447442ad8bfacdd. The Phase 6 baseline was ff4e281.

The analytics helper uses an existing gtag function or dataLayer. Events are game_view, game_start, game_complete, store_selected, cta_click and pickup_collect. Completion records crash, score, level and active duration. The helper sends no personal data and loads no vendor script.

The project has no build step. The intended deployment surface is a dedicated games page. No deployment was performed.
