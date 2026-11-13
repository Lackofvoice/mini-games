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

## Phase 2 verification

Tested on Windows using headless Edge and the same loopback server and CDP setup described above. The preview was also inspected at 390 × 844. Art milestone: daf3a96e0ca6303c04878b8df92cd5cc37b6c937. Pickup milestone: dd34bd3d9bee823f4041e4e5db46c2d2b7237c6c.

| ID | Method | Status | Observed result and evidence | Remaining limitation |
| --- | --- | --- | --- | --- |
| P2-A1 | PNG inspection and live Phaser frame inspection | PASS | Both idle sheets exposed one 160 × 144 frame. Both walk animations exposed four frames at 140 ms per frame. | Actual display inspected in Edge only. |
| P2-A2 | Keyboard left and right, then jump | PASS | Left and right loaded their respective native sheets with flipX off. Taggy landed on the same ground line and jumped using a held directional walk frame. | Physical keyboard traversal across every UI control remains pending. |
| P2-B | Phaser texture inspection and 390 px screenshot | PASS | Travel trailer, fifth wheel, trees and fence rendered behind the track. All 18 repeating scene images loaded. Reduced-motion emulation held scrolling in place. | Physical-device appearance remains pending. |
| P2-C1 | Phaser overlaps and natural play | PASS | Marshmallow and mile marker each awarded 10 points. Score and power-up popups appeared. The normal schedule delivered both power-ups during live play. | Targeted checks moved spawned items into the collision path to isolate each case. |
| P2-C2 | Spawn and speed probes with pause and expiry | PASS | Coffee showed 5s, increased movement from 210 to 283.5 logical px/s, and skipped an obstacle 3.75 seconds after the previous one. Pausing froze the effect. The indicator cleared at expiry. | Expiry check advanced active time near the five-second boundary. |
| P2-C3 | Consecutive obstacle overlaps | PASS | Spare tire appeared in the HUD, absorbed one hit without a score penalty, and then cleared. The following hit deducted five points. Replay cleared both effects. | None identified. |
| P2-C4 | Spawn pattern and jump clearance | PASS | Hazards are separated by at least three slots, or 3.75 seconds at base cadence. All items share travel speed and each slot has at most one item. Calculated jump clearance exceeds obstacle height. Live play reached 85 points through normal overlaps. | Individual human reaction times were not measured. |
| P2-C5 | Source, browser requests and UI inspection | PASS | Bright octagonal pickups and angular warning-toned hazards use distinct silhouettes. Archived key art and legacy text placeholders made no runtime requests. Shipped UI contains no coupon, prize, email form, or implied dealership offer. | Keys are excluded from the playable loop by design. |
| P2-R1 | Desktop controls, simulated visibility and three rounds | PASS | Movement, jump, ground, pause, explicit resume, visibility handler, timer and replay passed. Observed one win and two losses across three starts and completions. | Regression harness advanced the clock to finish successive rounds. Actual OS tab switching remains pending. |
| P2-R2 | Edge touch and responsive emulation | PASS | Touch movement, release, jump, canvas proportions and active/result layouts passed at 360×800, 390×844, 600×900, 844×390 and 1280×900. | Real-device touch remains pending. |
| P2-R3 | Result DOM and link routing | PASS | RV Dash naming remained. The CTA was gated until a store was picked. Both exact DeWitt and Sterling Heights hrefs were selectable and reversible. Results offered inventory after a loss too. | External navigation was intercepted during regression QA. Phase 1 records the live destination HTTP checks. |
| P2-R4 | WebAudio and reduced-motion emulation | PASS | No audio context before opt-in. A genuine pointer click unlocked WebAudio. Score and power-up pickups scheduled distinct oscillator sequences. Reduced motion held scenery. | Audible playback was not assessed by ear on physical speakers. |
| P2-R5 | Browser gtag, standalone dataLayer and absent hooks | PASS | All five Phase 1 event names fired. Starts and completions matched three rounds. Standalone dataLayer received pickup_collect with only event, game_name and type. Gameplay also worked without either hook. | Vendor delivery was not tested. |
| P2-R6 | Browser runtime and blocked CDN | PASS | No uncaught runtime errors in the Phase 2 checks. Blocking Phaser displayed recovery text. | Browser and screen-reader coverage beyond Edge remains pending. |
| P2-R7 | Physical-device and OS checks | NOT TESTED | Physical touch, real tab switching, keyboard focus traversal and assistive technology require a manual pass. | Use the manual follow-up above and verify both pickup sounds after opting in. |

## Phase 3 verification

Windows Explorer double-click opened the checkout in the default Comet browser. The address and accessibility tree showed the file URL. The start screen rendered Taggy, RVs, trees, road, and six legend icons with no status error. The run advanced through scrolling gates and reached the result screen. Headless Edge 157 independently tested the same file URL and loopback HTTP. A later visible Edge UI inspection stopped when Computer Use could not verify the browser URL.

| Check | Status | Evidence and limits |
| --- | --- | --- |
| Explorer double-click and file-mode gameplay | PASS | Actual Explorer double-click opened Comet. Edge CDP also started, steered, leveled up and completed a run from the tuned file URL. |
| Embedded art and loader diagnostics | PASS | Nine source PNGs reproduce the checked-in bundle. The browser displayed the scene and a deliberately corrupt Taggy sheet named taggy-walk-left in the error line. |
| Eight-way steering and ramp | PASS | Edge exercised the four diagonals and four cardinal directions. Steering through eight live gates reached Level 2 and 165 points. Speed rose from 148 to 161.32 logical px/s, opening shrank from 292 to 280 px, and spacing fell from 334 to 324 px. The tuned beginner route crashes an idle player at gate three after two forgiving gaps. |
| Crash, replay and saved records | PASS | A live crash ended the run and focused the result. Replay reset score, level, effects and store. Best score and level survived reload. |
| Coffee and spare tire | PASS | Browser collision probes confirmed five active seconds, 35% faster steering, doubled points and expiry. The shield destroyed one hazard, and the next hit ended the run. Targeted probes repositioned objects to isolate effects. |
| Pickups and close-call feedback | PASS | Live play showed +5, +10 and BOOST! popups. Collision probes showed SHIELD! and CLOSE! +5, including the close-pass sparkle implementation. |
| 360 px touch and reduced motion | PASS | Edge touch emulation moved Taggy diagonally and stopped on release. Legend fit without horizontal overflow. Decorative scenery and tilt were held under reduced motion. |
| Pause, visibility and store routing | PASS | Pause froze scrolling and the active clock. Returning after a simulated hidden event required explicit resume. Both approved CTA hrefs were selected in turn, and the CTA reset on replay. |
| Analytics, branding and audio default | PASS | Browser checks observed the view, run, pickup, store and CTA paths. Three crash results emitted three completion events. The game started muted and also ran without analytics. The intro and result contained no form or dealership reward. |
| Physical and cross-browser checks | NOT TESTED | Physical touch, audible crash and pickup sounds, full keyboard focus traversal and screen-reader operation were not verified. |
