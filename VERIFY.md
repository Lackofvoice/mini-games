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

## Phase 4 verification

Windows, headless Microsoft Edge 157, DevTools Protocol and the Phase 4 checkout. Browser assertions ran before committing.

| Check | Status | Observed result |
| --- | --- | --- |
| File launch and hard reload | PASS | Edge opened the actual file URL, displayed the assets and allowed Start. Both classic local scripts used v=4. Reload with the cache disabled also passed. No uncaught browser exceptions in the interaction suite. |
| Hold-to-thrust and steering | PASS | Space and mouse hold lifted Taggy. D moved him horizontally during thrust. Release returned him to the floor. Sustained thrust stopped at the ceiling. |
| Beginner course and levels | PASS | A normal unattended run passed three gates and made first contact at 15.26 active seconds. A browser probe crossed the eighth gate and displayed the Level 2 banner and speech, with the next speed 9% faster. |
| Pickups, hits and shields | PASS | Targeted in-browser pickups gave +5 and +10, activated five seconds of coffee and armed a shield. The shield absorbed one hit. Separate cone and robot collision probes each initiated an unshielded crash. |
| Speech and copy | PASS | Observed start, marshmallow, mile marker, coffee, close call, crash, level up and idle, plus tire feedback. Triggered lines were under 40 characters and free of em dashes and emoji. A single bubble is positioned outside live hazards and hidden when no candidate fits. |
| 360 px touch and accessibility labels | PASS | Emulated hold and horizontal slide moved Taggy upward and sideways. Release cleared pointer state and restored falling. Speech fit and the playfield label described the current controls. |
| Scenery and brand | PASS | Inspected captures at 600 px canvas width and at 360 px viewport width. Trees and fences sit in one spaced band, with RVs in their own foreground band. Red primary buttons and accents, dark panels, white type, and the warm gray road and sky were visible at both sizes. |
| Kept results and audio controls | PASS | Best score and level were stored. Both exact store URLs were selectable and remained gated until selection. Sound started muted and a real pointer activation opened a running WebAudio context. |
| Physical-device play and audio by ear | NOT TESTED | Touch was emulated and audio was inspected programmatically. Full keyboard traversal and screen-reader operation remain open. |

## Phase 5 verification

Windows Edge 157 via DevTools Protocol. Tests used the actual checkout from file URLs and loopback HTTP.

| Check | Result | Observed evidence |
| --- | --- | --- |
| Local file and hard reload | PASS | Edge opened the file URL, loaded embedded art and reached Start with both scripts at v=5. Cache-disabled reload also passed. |
| Losing runs | PASS | Idle flight hit a floor fence at 6.17 active seconds. Keeping Space held hit the overhead sign. Horizontal input never moved Taggy. |
| Maximum-speed passability | PASS | In the live Phaser scene, a scripted hold/release controller used the production advance method at 8 ms substeps for 60 simulated seconds at 230 logical px/s. It cleared the repeating fence, sign, stump, branch, cone and tire patterns without a crash and collected coins. It picked a reachable target height by lane and never teleported Taggy or removed hazards during the proof. |
| Hitbox and coin scoring | PASS | The collision probe cleared an edge 8 logical px outside the inset boundary and crashed at the center. The first coin awarded 5 points, and the maximum-speed route ended with 735 bonus points. |
| Restart and records | PASS | Space started another run after game over. Input during the 520 ms crash lock did not restart. Best score matched localStorage and survived reload. |
| 360 px touch | PASS | Edge touch held and moved diagonally across the playfield. Taggy rose without horizontal motion. Release restored falling. Scroll position stayed at zero and visual viewport scale stayed at one. Reduced motion held decorative scenery. |
| Physical phone and sound by ear | NOT TESTED | Touch was emulated. The existing synthesized audio path was retained. |

## Phase 6 verification

Windows Edge 157 via DevTools Protocol. Tested the actual file URL and loopback HTTP.

| Check | Result | Observed evidence |
| --- | --- | --- |
| File launch and cache bypass | PASS | Local classic scripts loaded with matching v=6 and started after cache-disabled reload. |
| Controls and fixed position | PASS | Up and W each lifted Taggy at x=150. Held Space fired repeatedly while Taggy remained on the floor. P froze elapsed time and Escape resumed. |
| 360 px touch and motion | PASS | Right tap shot without thrust. Left hold lifted Taggy and release restored falling. Page scroll stayed zero and viewport scale stayed one. Reduced motion held clouds and tilt still. |
| Combat | PASS | Controlled hits checked the 350 ms cooldown, single-use projectile, one-hit drone, two-hit cart, and a fence remaining visible while the shot passed through it. Drone and cart yielded 50 total points. |
| Maximum-speed course | PASS | A scripted flight-only controller stepped the live scene for 120 simulated seconds at the 230 px/s cap, reaching level 14. It cleared six dodge hazards, all three enemies, and the boss pattern with drops active. No shots or teleports during the route. |
| Boss | PASS | Crossing into level five queued and spawned the ten-hit SOLD stamp. The tire drop fired. Nine hits left one HP, and the tenth awarded 250 points and removed the boss body. |
| Art fallback and replacement | PASS | With optional files absent, fallback textures loaded without console warnings or uncaught exceptions. A temporary 384 × 64 drone strip, processed by the committed embed workflow, loaded as four 96 × 64 frames at 10 fps. The fixture was removed and the original bundle restored. |
| Mute, pause, restart and best | PASS | Started muted. A touch gesture opened a running WebAudio context. Pause and resume held and restarted gameplay. Space during crash lock did not restart. The result best matched localStorage. |
| Physical phone and audio by ear | NOT TESTED | Touch was emulated and sound state was inspected programmatically. |

## Phase 7 verification

Windows Edge 157 via DevTools Protocol. The source files all matched the supplied dimensions. The original PNGs are committed without edits.

| Check | Result | Evidence |
| --- | --- | --- |
| File launch and hard reload | PASS | Opened the checkout through file:// and reloaded with browser cache disabled. Both local scripts used v=7. The finished build produced no uncaught errors or console warnings. |
| Frames and cadence | PASS | Phaser reported all ten specified frame counts and frame rates. Taggy was captured in flight, shooting, and hit states. Shooting consumed a real bill projectile and a kill showed the supplied pop sprite. |
| Desktop and 360 px | PASS | Inspected 600-logical-pixel desktop and 360 px viewport captures. Edges remained pixelated and the 360 px page had no horizontal overflow. Desktop captures cover start, flight, shot, hit, drone, bird, cart, boss, coin pickup and pop. |
| Alignment and collision | PASS | Runtime strips center Taggy on the red tag body with one common scale per pose. Enemy boxes were adjusted to inset the centered art, with the larger SOLD body receiving a larger box. The projectile still passed through fences, and drone and cart HP and boss defeat behavior passed. |
| Passability and controls | PASS | A 120-second scripted route at maximum speed cleared all six dodge hazards, three enemies and the enlarged boss with drops active. 360 px left touch held flight and right touch fired. Pause, restart lockout and saved best matched Phase 6. |
| Missing optional files | PASS | Temporarily loaded the legacy bundle without optional strips. Start was enabled, the procedural drone loaded, and Taggy reverted to the original pose without warnings or exceptions. |
| Source issue | OBSERVED | The first SOLD frame shows a thin stray mark to the right. The PNG remains unchanged. |
| Physical phone and audio by ear | NOT TESTED | Touch was emulated. WebAudio unlock passed after a touch gesture. |

## Phase 8 verification

Windows Edge 157, headless, on ThinkServer TS140 with Xeon E3-1246 v3 and GTX 750 Ti installed. The DevTools launch used --disable-gpu. Browser requestAnimationFrame intervals were measured at a 900 × 1100 viewport with the 600 × 800 logical canvas. This measures delivered frame cadence on this machine, rather than isolated render cost or performance on a mid-range laptop.

| Check | Result | Observed evidence |
| --- | --- | --- |
| File launch and hard reload | PASS | Both local scripts loaded with v=8 from the file URL. A cache-disabled hard reload reached Start. No uncaught exceptions or console warnings in the completed profile. |
| Sky stages and HUD | PASS | Captured dawn, midday, sunset, dusk and night at 900 px desktop and 360 px viewport widths. The browser measured alpha 0.5 halfway through each transition and the new base palette after 2 seconds. Drone, bill, coin and HUD text were visible. The horizon stayed inside the playfield. |
| Impact and speed FX | PASS | Captured boss and crash. Browser probes verified a white boss hit flash, retained pop sprite and shake on boss defeat, and active crash shake. Speed streaks and trail are drawn above the road and behind gameplay sprites. Transient effects are capped at 28 and trail samples at six. |
| Reduced motion | PASS | Browser preference emulation applied the palette immediately and kept decorative parallax, streaks, trail and shake off. |
| Missing optional sprites | PASS | A temporary Phase 6 bundle without optional art still enabled Start and rendered the procedural drone and original Taggy art without errors. Restored the shipped bundle afterwards. |
| Maximum-speed frame cadence | PASS | 60.014 seconds at 230 logical px/s using scripted vertical input and the normal game loop. 3,601 frame intervals, 16.666 ms mean, 16.700 ms median and p95, 16.800 ms p99 and max, zero over 20 ms. No crash and level 9 reached. |
| Physical phone, laptop and audible sound | NOT TESTED | 360 px was emulated. The workstation profile does not establish mid-range laptop performance. Audio was not listened to. |

Capture filenames: dawn-900.png, midday-900.png, sunset-900.png, dusk-900.png, night-900.png, the corresponding five -360 captures, boss-fight.png, and crash-shake.png. The raw frame summary is frame-times.json beside the captures.

## Phase 9 verification

Windows Edge 157 via DevTools Protocol, with the actual file URL at a 900 px desktop viewport and loopback HTTP at a 360 px emulated touch viewport.

| Check | Result | Observed evidence |
| --- | --- | --- |
| Launch and fallback | PASS | File launch and cache-disabled reload reached Start with matching v=9. No console warnings or uncaught exceptions in the interaction suite. The temporary pre-strip bundle still enabled Start and used the procedural drone and legacy Taggy fallback. |
| Keyboard movement | PASS | Left arrow reached x=54, then release drifted toward home x=150. D moved right to x=546. Desktop captures record motion and both edges. |
| 360 px touch | PASS | A left-origin hold dragged across the midpoint and continued flying and steering. A simultaneous separate right touch fired a shot. No horizontal overflow, page scroll or zoom was observed. |
| Health and pickup | PASS | Started at two HP. A repeated hit during the same 1.5-second protection window left one HP and the hit pose blinked. A queued boss deferred a due pickup. Collecting one gave +1 HP and repeated pickups capped at five. Reduced motion kept the player opaque and showed Protected. |
| Game over and records | PASS | Zero HP reached game over, best score matched localStorage, and replay reset health and home position. |
| Pose alignment | PASS | All nine fly, shoot and hit frames measured 36 logical px for the red tag body, centered at source row 63.5 of the normalized 128 px cell. Draw scale is 1.0 for all three strips. |
| Maximum-speed patterns | PASS | 15,000 production advance calls at 8 ms each covered 120 simulated seconds at the 230 logical px/s cap, reaching level 14. The flight-only route cleared all ten pattern types with two HP remaining and health pickups disabled for the proof. Left/right movement gives extra positioning choice, and the existing flight-only route remains viable. |
| Physical phone and audio by ear | NOT TESTED | Touch was emulated. |

Source-to-output scale by frame in order: fly 0.176471 / 0.179104 / 0.175610 / 0.169811; shoot 0.145161 / 0.146939 / 0.147541; hit 0.059406 / 0.061224. Factors are uniform within each frame. The original PNGs and 42 × 50 player hitbox are unchanged. Hazard collisions and shot origins use Taggy's current x.

Desktop and mobile captures and the measured pose comparison are in the Phase 9 screenshots folder. Captures cover left and right motion, both edges, 2 and 5 HP, damage blink, health pickup, game over, and 360 px touch.
