# RV Dash verification

Source: Lackofvoice/mini-games, rv-sale-dash-game, 70fd287fc72d7b6e54f64d3a2447442ad8bfacdd. Remote source head matched at checkout.

## Scaffold inspection

Text placeholders were loaded as textures and spritesheets. World bounds acted as the floor, while collectible heights and obstacle positions followed unrelated coordinates. Background speed depended on frame rate. Replay left physics paused and reused partially elapsed timers. Hit flashes could outlive a round. Canvas-only controls offered no keyboard focus, and the result included an incentive, email collection and a browse stub.

## Test environment

Windows, Edge 157.0.4341.46 in headless mode, Chrome DevTools Protocol through Node 22.14.0, and a Python 3.13.1 HTTP server on loopback. Phaser 3.80.1 loaded from jsDelivr. The local HTML and JS total about 20.5 kB. The CDN script is about 1.18 MB before compression. Browser performance profiling and production field measurements were outside this run.

| ID | Method | Status | Observed result and evidence | Remaining limitation |
| --- | --- | --- | --- | --- |
| A | Remote Git, DOM and live scene inspection | PASS | Source head matched the pinned SHA. Browser title was RV Dash and the scene loaded the generated Taggy frames. | Official Taggy artwork pending. |
| B | Browser network and animation state | PASS | Procedural player and obstacle textures were used, the run animation was active, and no request targeted a text placeholder. | Visual review on physical displays pending. |
| C | Browser keyboard and scene observations | PASS | Start, movement, jump, landing, collection and timer progression worked. A playthrough reached 65 points through normal overlap scoring. A zero-score result showed the loss message. | Replay test advanced the browser scene clock just before the natural finish boundary to exercise successive outcomes. |
| D | Browser controls, simulated visibility change and three rounds | PASS | Pause held elapsed time, player position and spawn count. Resume continued play. The hidden handler paused and visibility restoration required explicit resume. Results stopped gameplay. Replays reset score, spawn schedule and store. | Real OS tab switching and manual pause across actual visibility changes were not tested. |
| E | Edge touch and viewport emulation | PASS | Movement held and released cleanly, touch jump worked, and active layout and result controls fit at 360×800, 390×844, 600×900, 844×390 and 1280×900. Canvas retained 3:4 aspect. | Physical devices and other browsers were not tested. Landscape can use vertical scrolling. |
| F | Browser anchor assertions and separate HTTP GETs | PASS | CTA began hidden. Both exact hrefs were selectable and reversible after a win. Loss also offered store selection. Both approved destinations returned 200 and showed the expected store in the page title. | Link activation was intercepted to preserve the QA tab. Same-tab behavior was checked through the anchor target. |
| G | Source and browser runtime | PASS | The game ran silently. It contains no audio references or browser-audio dependency. | Sound is omitted. |
| H | Browser gtag and dataLayer doubles, then both absent | PASS | Observed one view, three starts, three completions, three actual selection changes and one activation. The simultaneous dataLayer remained empty. Payloads contained only the documented fields. Gameplay also ran with both hooks absent. | Standalone dataLayer fallback and third-party delivery were not exercised. |
| I | Browser replay, motion emulation and blocked network | PASS | Three rounds used one control path per action and produced no uncaught exceptions. Reduced motion froze scenery. Blocking Phaser showed a recovery message and kept Start disabled. | Listener counts, full focus traversal and assistive technology were not instrumented. CDP Enter injection did not trigger Start in the full-round harness, so that run began through the DOM button click. |
| J | Shipped HTML/JS and both rendered outcomes | PASS | Results show points and store choice. The UI requests no personal information and promises no incentive. Original placeholder files remain in source control. | None identified. |

## Manual follow-up

1. Start the Python server from README.md. On a phone, open the game from a locally reachable host, hold each direction, drag off a button before releasing, and jump from both the playfield and the Jump button.
2. Pause mid-jump, switch tabs and return. Verify the round stays paused. Resume, then switch away during play and check that it pauses again.
3. Play through three rounds and switch stores after both outcomes. Use keyboard Tab and Enter to activate the CTA, then confirm the selected location opens in the same tab.
4. Check focus outlines and controls in portrait and landscape, including at increased browser zoom.

## Full-duration follow-up

A separate unmodified 60-second simulation finished naturally at 0 seconds with 165 points and 47 spawns. Score dropped during the round, confirming obstacle penalties. Focus moved to the result heading, and the browser reported zero uncaught exceptions. A loss was verified separately by advancing the scene clock to the finish boundary with a score of zero.
