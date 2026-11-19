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

## Phase 10 verification

Windows Edge 157 headless via DevTools Protocol. Tested desktop at 900 × 1100 and mobile emulation at 360 × 800.

| Check | Result | Evidence |
| --- | --- | --- |
| Offline file and hard reload | PASS | Actual file URL opened and hard-reloaded with the network disabled and cache bypassed. All three scripts and the stylesheet used v=10, Phaser reported 3.80.1, and there were zero external requests or console warnings. |
| State and interaction captures | PASS | Captured start, playing, pause, game over, new best, hover and focus at both widths. A seeded score exercised each results state. The header and result updated to the new record. No horizontal overflow, and visible buttons were at least 44 px tall. |
| Keyboard traversal and activation | PASS | Tab reached Start, Pause/Resume, Sound, both stores, the inventory link and Play again. Enter started, toggled sound, selected Sterling Heights and replayed. Space paused, resumed and selected DeWitt. The inventory link was focused and its destination checked without navigating away. |
| Reduced motion and art fallback | PASS | Reduced motion removed pulse and shine animations. A temporary legacy bundle enabled Start with generated drone art and legacy Taggy without warnings. The current bundle was restored. |
| Gameplay and frame cadence | PASS | The gameplay diff contains no input, canvas-sizing, or simulation changes. A scripted 12.016-second max-speed flight through the normal game loop produced 720 frame intervals, 16.69 ms mean, 16.70 ms median, 16.80 ms p95, 33.30 ms max, and one interval above 20 ms. No crash or console warning. |
| Physical phone and audible audio | NOT TESTED | The narrow screen was emulated and sound state was inspected programmatically. |

The Phase 10 capture folder includes the fourteen screenshots and frame-times.json.

## Phase 11 verification

Lot Hero was absent from the repair tree, scaffold and master. The Worker has distinct RV Dash and Lot Hero keys.

- **PASS, unit tests.** node --test leaderboard-worker/worker.test.mjs reported 5 tests, 5 passed, 0 failed. Covered malformed, blocked and look-alike initials, integer limits, the sixth attempt, content type and size, invalid board, sorted top 25 and tie order.
- **PASS, local runtime.** Wrangler 4.162.0 ran in local mode with simulated KV. No login, deploy or production resource operations were run.
- **PASS, HTTP checks.** Requests to the same handler through the Node mock produced empty GET 200, valid POST 201, invalid initials 400, blocked look-alike 400, over-cap 400, oversized 413, sixth submit 429, and unknown game 404. Independent GETs returned each board's own score.
- **PASS, Edge.** The locally configured Wrangler Worker accepted keyboard submissions at desktop and 360 px, persisted rows across reload, prefilled initials and ranked the second higher score first. Screenshots cover start, empty board, initials, populated board and offline state at both widths. Escape and Skip closed the panel. Reduced motion stayed static. No uncaught exceptions.
- **PASS, offline and file.** The default empty config produced no leaderboard requests on file launch. A dead port showed the offline message while keeping the local best and allowing replay.
- **PASS, frame sample.** A 12.016-second maximum-speed run in headless Edge recorded 721 intervals, mean 16.67 ms, p95 16.70 ms, p99 and max 16.80 ms, and none above 20 ms. Phase 10 mean and p95 were 16.69 and 16.80 ms. No simulation changes were made.
- **NOT TESTED.** Real deployment, real KV consistency, live-site CORS, physical phone, and audio by ear.

Secret scan before commit used `git grep --cached -l -i -E PATTERN -- ':!*.png'` on tracked text and `git diff --cached --unified=0 | rg --count -i PATTERN` on the staged patch. Patterns covered GitHub/AWS token prefixes, private-key headers, token/account/API-key assignments, emails, 32-hex identifiers and IPv4 literals. Reviewed matches were loopback addresses needed for local testing and incidental embedded-art text. No credentials, account IDs, real namespace IDs or personal data were found. The namespace configuration and Wrangler state are ignored.

## Phase 10b control-panel verification

Windows Edge headless via DevTools, actual file URL, offline network emulation. Tested at 1280 × 1100 and 360 × 800.

- PASS: ready, playing, paused and game-over readouts followed the existing DOM state. Tab reached the utility row and Skip intro with visible focus. Enter skipped the intro, started the game, opened and closed the controls dialog, and entered and exited fullscreen. The dialog returned focus to Controls.
- PASS: both viewport widths had no horizontal overflow. Two locked slots had no actionable link. Both shopping links had the exact requested destinations and opened a new browsing context by markup. External destinations were not navigated in the offline run.
- PASS: reduced motion skipped the intro and disabled decorative animations. File startup and gameplay made zero external HTTP requests with the default empty leaderboard configuration. No uncaught browser exceptions were observed.
- PASS: the existing Phase 11 leaderboard mounted and showed its disabled-default status. The gameplay file, existing stylesheet, leaderboard client and sprite assets had no diff.
- PASS: keyboard flight, steering, and shooting worked. A 120-second scripted flight through production simulation steps cleared all ten hazard/enemy patterns with two HP, reaching level 14 and 3,349 points. Two controlled hits exercised game over and results. Start during the intro dismissed it immediately.
- NOT TESTED: physical phone, audio by ear, or separate hardware frame-time profiling. Cabinet effects animate transform, opacity and stepped clipping. Intro captures, ready layouts, pause and results are in the control-panel screenshot folder.

## Phase 10c tuning verification

Baseline ff72cd435d04584aad5889c5272d806ad5b48b83. Windows Edge headless through DevTools Protocol, offline file URL, 1100 px desktop and 360 px touch emulation. The comparison called the baseline and current production methods with identical fixtures and 4, 8 and 16 ms step sizes.

- **PASS, horizontal response.** At 8 ms, +245 px/s release settled below 2 px/s in 128 ms at +5.46 px and held that position. Baseline crossed zero near 112 ms at +9.85 px but slid back to −16.70 px versus the starting position by 500 ms. Reversal crossed zero at 32 ms instead of 64 ms. Across all cadences the tuned release drift was 4.62–5.92 px and took 128 ms. Opposed directions braked. Touch drag stayed responsive and stopped locally on release.
- **PASS, descent.** Natural gravity 690 px/s², extra 55.2 px/s² when Down is held without lift. At 8 ms the assisted fixture fell 7.81 px farther over about 0.63 s. Natural and boosted caps were 330 and 346 px/s. Releasing at the assisted cap restored the natural cap on the next step. Upward cap remains 330 px/s. Initial ascent stayed upward under Down until gravity reversed it. Keyboard and pointer lift produced identical priority results.
- **PASS, browser controls and state.** ArrowLeft and D worked together as opposed keys. Down was accepted on the focused playfield, cleared on blur and pause, and stayed out of modal and leaderboard input. Flight, shooting, score progression, game over, replay and disabled-default leaderboard passed. No uncaught runtime errors or external requests in the file-mode test.
- **PASS, cabinet.** Desktop primary face moved 7 px and released into one native activation. Utility raised/pressed/returned pixels were captured, including an outside release with no activation. Space held the Pause face and resumed once on release. At 360 px, touch drag and release passed. A live reduced-motion change kept the face stationary with no horizontal overflow. Captures and raw movement.json are in the Phase 10c screenshots directory.
- **PASS, syntax and test suite.** node --check game.js; node --check cabinet.js; node --test leaderboard-worker/worker.test.mjs (5 passed). Reviewed staged scope for unrelated changes and credentials. Audio code, sprites, embedded art, course and scoring parameters were preserved.
- **NOT TESTED.** Physical device, subjective playtest, audio, exhaustive rapid/disabled press coverage, or a hosted build.

## Phase 11 visuals

- PASS: Start, Q/E grounded lane controls, and Shift+P overlay in Edge from the approved local HTTP origin. The live board rendered through the existing leaderboard. No score writes were made.
- PASS: A scripted 60.08-second production simulation traversed levels 1 to 4 and finished with two HP. Contact probes for all 24 variants exercised damage for solids and a speed reduction with no damage for puddles. Every ground group reserves an unused lane.
- PASS: The layer debug values at base world speed were 7.96 clouds, 13.2 mountains, 29.04 distant tree line, 59.4 trees, 99 fencing, 47.52 lot and 132 road/foreground, in px/s. Advancing increased and retreating decreased the intended layers while retaining nonzero rollback speed. Decorative RVs retain their own speed and approved artwork. The foreground speed readout represents the visual ground rate. Physical hazards retain the ordinary world scroll.
- PASS: Four Edge captures and raw data in docs/phase11 show staged cone, pothole, overhead and debug cases. Captures are staged to isolate appearance. The new art, data bundle and capture set total about 2.15 MB. A seven-second live opening sample with the debug overlay averaged 60.0 fps (16.8 ms p95). Browser assertions saw no console errors or warnings. Six leaderboard tests passed.
- NOT TESTED: a full minute confined to level 1, exhaustive visual seam review at every offset, physical phone, or human difficulty judgment. The ordinary one-minute run reached level 4.

## Phase 11b road and motion correction

- PASS: clean tracked start at 5c3a2efcd25d758913c4cc9ff05ce560816a714a, matching the configured repair branch and remote. Unrelated untracked art folders were excluded.
- PASS: Edge at desktop and 360 px loaded all eight mapped frames from the supplied 512 × 256 RGBA sheet. Inspected screenshots showed multiple tree silhouettes, no background fences, and road art on asphalt. The road speed factor is 1.0, mountains .025, intermediate terrain .065, distant trees .095, near trees .17 and RV lot .23. Motion uses delta time and fractional offsets; reduced-motion early return is preserved. Subjective smoothness across all devices was not tested.
- PASS: W moved continuously, Up and S reached both road bounds, and Q stepped to the middle. Space tap jumped and landed at the original depth. Held Space entered flight. Airborne Down changed altitude without changing depth and lost priority to lift. F shot independently. Coffee retained scoring and launched Taggy. Emulated left vertical drag steered road depth at 360 px with no horizontal overflow.
- PASS: 360 seeded groups at the maximum scroll speed across levels 1–15 left at least one clear depth band and had a minimum measured interval of 1.66 seconds after a group. Repeating the level-one seed reproduced placement. A controlled contact probe verified grounded damage and altitude clearance. This geometry check does not measure human difficulty across every enemy combination.
- PASS: file mode started with the optional bundle blocked and rendered existing fallback art. Controlled game over and DeWitt store link worked. Existing leaderboard configuration and logic were preserved. Six Worker tests passed. The main browser pass had no uncaught runtime exceptions.
- NOT TESTED: physical-phone feel, exhaustive collision checks for every art cell, production leaderboard writes, and human playtest approval. See the Phase 11b screenshot folder for desktop and touch captures.

## Synthwave UI skin

- PASS: local and fetched rv-dash-repair started at 95ce5a0b9b773c210e350ca50c615eb6135f63a2, equal to the required baseline and zero commits ahead or behind.
- PASS: Edge on local HTTP at 1366 × 768 and 360 px with v17. Long scores fit, canvas dimensions matched expectations, keyboard focus was visible, and mobile had no horizontal overflow. Reviewed the desktop start, mobile HUD and mobile leaderboard captures. The screenshot folder is rv-dash-synthwave in the session's visualizations output.
- PASS: grounded road controls, jump into flight, F to shoot, opening Controls pauses, controlled collision reaches results, DeWitt inventory selection, replay and held-input clearing on blur. Emulated touch started the game without hover. Reduced-motion suppressed the intro and primary animation.
- PASS: mocked loading, empty, offline and populated leaderboard views, initials focus isolated from gameplay, and a pending score could not be submitted twice across close/reopen. Mock success refreshed the board. No live leaderboard API calls, missing assets or uncaught exceptions were recorded during this pass. All six Worker unit tests passed.
- PASS: game.js and leaderboard.js syntax checks and git diff whitespace check. The Phaser diff is limited to UI colors.
- PENDING: the official Khand and Hind font packages and redistribution licenses could not be verified. System fallback stacks are active.
- NOT TESTED: physical phone, audio by ear, file URL in this pass, full human playthrough, or hardware frame-time profiling.

## Phase 11c

- PASS: rv-dash-repair started at 64b054a51111e05c32c7c71f03e14a8e34cad6b9, equal to the required synthwave baseline and fetched remote, with ancestry checks passing on both and zero divergence.
- PASS: Edge at 1280 × 800 and touch emulation at 360 × 800. At scrollY 0, Start and Play Again each fit with the full 3:4 canvas. Measured canvas sizes were 411 × 548 and 306 × 408 CSS px. Canvas bottoms were 785.4 and 709.4 px. No horizontal overflow or clipping of a 12-digit best-score fixture. Start, gameplay, game-over and eight-frame captures are in the session's rv-dash-phase11c output folder.
- PASS: default Auto-fire, shared manual cooldown, hold F, a single shot on a quick click or tap on either half, held mouse/left-touch flight, and diagonal touch steer/depth drag with no shot. Pause and game over blocked shooting. Replay reset the run and stayed at scrollY 0. The off state was restored after hard reload. Verified a buffered landing jump and coyote acceptance at 70 ms with rejection after 120 ms. Jump speed is 300; coffee keeps its prior 265 launch.
- PASS: spawned all eight road sheet frames through the production group path at both sizes. Checked proportions and reviewed sprites in Edge, including the full-height crate, tread and fallen limb. The box uses the crate frame, tall crate contact damages at matching road depth and clears above its 45 px threshold. First-level chock uses the tread family, old art remains in the repo. Pothole and puddle semantics remain unchanged in code. Exhaustive per-frame boundary tests were not run.
- PASS: hard reload, reduced motion and file launch, with absent optional sheets falling back. No uncaught exceptions or gameplay asset 404s in the browser test. Local HTTP had a harmless automatic favicon.ico 404. Mocked score offer appeared and no production API calls occurred. All six Worker tests passed.
- NOT TESTED: optional art appearance with real source sheets, physical phone, subjective jump feel and audio by ear. Lot life defaults off. The same view uses system font fallbacks because official Khand/Hind files and licenses remain unverified.

## Boss Battles

- PASS (checks 1–4, 22–23): Edge advanced seven consecutive level entries through production advance(), using controlled boss hits to finish each fight and a distance fixture to reach the next boundary. The six names appeared in order and level 7 repeated Lowballer. Each defeat showed APPROVED. Removed the obsolete SOLD texture, optional bundle key and level-modulo queue. Existing source PNG and history are preserved.
- PASS (5–11, 15, 21, 25–26): fixed-step Edge probes verified scroll and layer freeze, eased normal scrolling on exit, unchanged normal Space flight, arena jumping without thrust, shared auto/manual cooldown, ordinary projectile damage, one-shot phase threshold handling, clean pause/retry and lethal cleanup. Transition removes current/pending attacks and gates damage for 1 s; first warning is after 800 ms of fight grace. Scene shutdown uses the same cleanup entry point; repeated explicit Phaser scene shutdown was not tested.
- PASS (12–14, 16–20): warnings lock one 44 px road-depth band for at least 1500 ms before launch, plus travel time for moving threats. Every pattern, including follow-ups, uses only that band. Real production depth movement in Edge escaped all three Invoice patterns and the Merger minion/paper pair with a 300 ms scripted reaction delay. Tire escalation capped at +60% and −30%, with a 500 ms double-roll stagger. Greeter's five-minion two-HP wave shields the boss. Killing a flank unit increased speed and killing the middle unit produced harmless scatter. Warranty shield took six shots, regenerated after five seconds, and let shots through the front window. Tests covered the maximum-size configured formation and the double roll. Full human dodge coverage and every starting coordinate remain NOT TESTED.
- PASS (24, 27–29): six supplied 1024 × 256 RGBA sheets decoded with four transparent registered frames each. Runtime accepted all six and used fallback with a missing and a wrong-size fixture. Bundle comparison found only six additions and removal of boss-sold. Debug mode suppresses board attachment, score storage and tracking. Normal leaderboard offer worked with a mock, with zero live requests. Reduced motion froze immediately, showed a static approval seal, and preserved jumping. Nine Node tests passed (three arena, six existing Worker).
- PASS: pixel inspection in Edge at 1280 × 800 and 360 × 800. Mobile Jump was accessible by emulated touch with a 44 px minimum target and no horizontal overflow. Screenshots cover intro, telegraph, fight, phase, approval and game over in the session rv-dash-boss output.
- Tuning: Lowballer 14 HP / 1800 ms base interval with arcs, staggered repeat and clipboard; Tire Kicker 18 / 2000 with rolls and hit escalation; Greeter 20 / 6000 with a protected wave; Warranty 24 / 3000 with a six-hit shield and same-lane paper; Invoice 28 / 3800 with three grid geometries; Merger 42 / 4000 with three phases and same-lane combined waves. Intervals are cooldown floors, since new volleys wait for the threat field to clear. Base HP rises by 15% per roster cycle. Existing 250-point boss reward uses normal bonus scoring. Player health is carried through with no free heal.
- NOT TESTED: physical phone, audio by ear, complete manual campaign, human difficulty, later-cycle endurance, and Corporate Merger duration. A stationary Auto-fire Lowballer fixture defeated the boss in about 6.4 simulation seconds. That is below the suggested 30–45 s and should be reviewed in playtest. Try each boss via ?boss=1…6, optionally specifying a matching level (example ?boss=1&level=7). Check readability on a physical phone and how often phase mechanics appear before Auto-fire wins. The local test path did not surface runtime exceptions.

## Backgrounds + Boss Balance (v20)

Baseline 5f415a98d5c6dbb5a9b141843a298f906b80b84a, exact starting local and fetched remote tip on rv-dash-repair. Both ancestry checks passed and divergence was 0/0. Existing source confirmed the portrait 600 × 800 field, depth 633–743, shared 350 ms shot cadence, arena freeze and the shot-pose override after every shot.

### Art, controls and appearance

- PASS: 27 distinct tow images, 1672 × 941 RGB8 with no alpha, total 43,497,111 bytes. The source/derived paths, byte counts, crops and SHA-256 values are in game_assets/tow-themes-manifest.json. Retained motorhomes, variant frames, Tron and dashboard originals in place. Each theme uses frame 1 as a static, aspect-preserving nearest-neighbor upper-world crop with a derived sky-color extension. Existing moving layers and the sole interactive road still render independently.
- PASS: requested theme order and independent six-boss cycle exercised in Edge at levels 1–10, 18 and 19. Nine distinct 540 × 387 textures total 1,168,449 compressed PNG bytes and 7,523,280 estimated decoded RGBA bytes (7.17 MiB), excluding GPU/browser overhead. No duplicate theme texture. Missing and malformed themes retained procedural scenery. Reduced-motion file launch verified a static backdrop and immediate offset freeze. The nine intro captures are theme-1 through theme-9 in the session rv-dash-backgrounds screenshot folder.
- PASS: 512 × 256 RGBA companion lot sheet SHA-256 6929f6140e5e67750a54f019066d128b6b9da5501daf53705ca80d3a55690f26, 94,107 bytes. Source contains generic side views, and runtime replaces the two steep yaw decorations with four wheel-grounded frames behind the far road edge, at lot factor .23. Inspected desktop and mobile screenshots. Frame 3 is a trailer with pickup. Lots remain scenery-only.
- PASS: Edge at 1280 × 800 and 360 × 800 DPR1, and 390 × 844 DPR2. Start plus full 3:4 canvas fit at origin, no horizontal overflow. Local HTTP single navigation samples to game-ready including automation overhead were 1012 / 951 / 1133 ms, document interactive was 34.7 / 59.3 / 61.3 ms. Normal asset pass had zero 404s or runtime exceptions. File launch worked.
- PASS A/B/E: Auto-fire ON and OFF labels track aria-pressed and the existing setting. Grounded walk remained upright with shots on. OFF had no autonomous shots on the road or after retry into the arena. Quick touch fired one shot without lift. A held horizontal drag stayed grounded. A second simultaneous pointer holding the dedicated Fly button lifted Taggy. Cancellation cleared both pointers. Browser fixture captured grounded firing, OFF, flight, hit and death. Keyboard and mouse bindings keep the same source paths and cadence. Hardware touch, full blur/pause input combinations and a separate persistent-preference reload test were not remeasured.
- PASS C: pose anchors are measured on the red tag, with per-frame uniform scale and the existing 0.94–1.06 road size factor. Approximate first-frame total alpha bounds at middle depth, before → after logical width × height: walk 54 × 64 → 52 × 63, fly 86 × 53 → 76 × 47, hit 46 × 45 → 59 × 57, dead 47 × 48 → 55 × 57. Approximate isolated red-body long axes: 47 → 46, 52 → 46, 36 → 46 and 39 → 46. The legacy shoot frame measured 82 × 60 total and 56 body. In play, firing uses the unchanged movement body (46 body units) plus separate projectile/muzzle feedback. Frame anchors preserve the pose proportions. Collision remains 21 × 25 half extents.
- PASS D: active lot uses side elevation instead of the old steep angled sprites. Screenshot checks confirmed the ground registration and that the active gameplay road is independent. The cropped landscape edges retain scenery transitions by design.

### Bosses

HP stays 14 / 18 / 20 / 24 / 28 / 42, standard hits still deal one damage and Lowballer retains a two-damage weak hit. No global fire, movement, damage, reward, power-up or leaderboard rule changes. Lowballer opens only after a clean coin volley, for up to two damage. Tire, Greeter, Invoice and Merger show an aimed height. Greeter exposes a depth offset from the formation lane. Warranty retains six shield HP, its five-second regen and front window. Greeter, Invoice and Merger require an opening volley before damaging opportunities; Merger repeats this in each phase and clears prior attacks. Aim, phase/cooldown and reaction data are centralized. Tire ramp remains capped at +60% speed / −30% interval.

24 deterministic Edge debug runs (six bosses × four policies; no seed variation in the boss engine). Production substeps at 8 ms, stationary X, actual projectile collisions and damage. Moving bots tracked indicated depth, waited 300 ms after a warning before departing the marked band, and used existing movement. Manual fired only in usable windows or at the formation. No invulnerability or injected damage. Timings run from fight start, exclude intro/seal, and are synthetic.

| Boss | Stationary Auto-fire | Moving auto seconds / fired:landed | Moving manual seconds / fired:landed | Auto opportunity / threat / intermission seconds |
| --- | --- | --- | --- | --- |
| Lowballer | died 9.94 s, 0 hits | 40.57 / 119:12 | 41.16 / 19:12 | 3.55 / 38.26 / 1 |
| Tire Kicker | died 5.94 s, 9 hits | 7.83 / 26:18 | 8.18 / 24:18 | 7.82 / 7.02 / 0 |
| Greeter | 118.95 s timeout, 0 hits | 21.21 / 64:20 | 15.41 / 38:20 | 7.63 / 14.27 / 0 |
| Warranty | died 8.17 s, 14 hits | 12.41 / 39:24 | 12.76 / 37:24 | 12.40 / 11.60 / 0 |
| Invoice | died 6.78 s, 6 hits | 22.97 / 69:28 | 23.60 / 38:28 | 11.93 / 12.96 / 2 |
| Merger | died 7.77 s, 0 hits | 36.34 / 107:42 | 36.46 / 66:42 | 13.43 / 29.93 / 2 |

All six idle runs died and all 12 moving runs retained both opening HP. Opportunity and threat time may overlap. Warranty opportunity time includes shield-chip availability. Landed counts boss HP hit events rather than points, and exclude shield/minion damage.

- PASS required Lowballer bound: first-cycle 14 HP requires seven clean openings at two damage maximum each, even with a weak hit. Each requires at least 1500 ms of warning plus (548 + 40)/155 seconds for a coin to exit; the first warning has 800 ms grace. Earliest is at least 37.85 s, ignoring the dual-throw stagger, intermission, discrete update and shot travel. v19 stationary result reproduced at 6.384 s from run start. The v20 moving bots won in 40.57–41.16 s.
- Remaining bosses' conservative cadence floors (HP−1) × .35 s before travel: Tire 5.95 s, Greeter 6.65 s plus a first volley, Warranty 8.05 s (10.15 s if all six shield hits are necessary), Invoice 9.45 s plus opening/phase gates, Merger 14.35 s plus three opening volleys. These are lower bounds, not exact optimal-kill times. Five moving results remain below their proposed balance hypotheses. Other v19 boss runtimes were not measured in this phase.
- PASS: ten Node tests (four arena, six existing Worker), including the proof inputs for the Lowballer floor, Merger old-threat cleanup and Tire caps. Local synthetic runs used visible isolated debug mode. No live leaderboard requests. No Worker/config diff. Use of a single warning lane and zero damage in both moving policies verified reachable gaps for the tested paths, not exhaustive fairness.
- NOT TESTED: physical phone, audio by ear, full human campaign, randomized start depths, every hover/focus variant and precise optimal-kill routes for the other five bosses. Next playtest should focus on moving fire pacing and later-stage human difficulty.

## v21 owner playtest verification

- Baseline: fa85b862ea7042d2f92a31300b5e1896e112cea7 on rv-dash-repair. Both ancestry checks returned 0; baseline and upstream counts 0/0. No tracked or staged work at entry. Leaderboard URL was enabled at baseline and no leaderboard files were edited.
- Flight and firing: Space jumps then thrusts after 48 ms, with gravity on release. Arena ceiling is y=165 and the lower boundary remains the selected road depth (633–743). Arena in-air depth steering preserves altitude. Mobile Fly taps jump and holds thrust; Fire taps/holds, right-half touch holds, F and right mouse share the 350 ms cadence. The 44 px mobile controls sit below the canvas so they do not cover Taggy. Fresh/malformed preference is OFF; valid ON/OFF persistence remains. Verified on desktop and in browser touch emulation, including three-pointer flight plus steering plus shooting and cancellation. No autonomous shots with OFF in arena or road. A one-time road flight hint and per-boss intro guidance use safe localStorage.
- Damage and move: Shots intersect the moving pose bounds; the yellow lane is purely a hazard warning. Valid unblocked shots do 1 damage. A clean volley gives 1350 ms of stagger and +1 damage. Explicit clipboard, formation and paper defenses flash on block. All bosses pace, advance, retreat, lunge and briefly recoil with deterministic substeps. Pose scale is .85/.83/.85/.84/.83/.87, arena x starts around 510 and is constrained to x>=463 with per-sheet right limits computed from opaque frame bounds. Shots spawn from the current boss anchor; moving hazards have a 190 ms travel-to-lane lead-in and grids can be cleared with 85 px of altitude. Player half extents stay 21 × 25. Taggy's uniform red-body target is 66 vs 46, a 1.435× visual increase with the existing road perspective. Pixel inspection showed a larger logo on the emulated portrait canvas. Physical readability is not measured.
- RV clipping: all four opaque source bounds lie inside their 256 × 128 cells and end at row 117. The road begins at y=586 on a higher rendering layer and covered the old wheel anchors at y=587/600. All four now ground at y=579. -WIDTH/base/+WIDTH copies use one normalized position plus integral offsets. Nine test offsets from −3600 to +3600 verified 600 px separation and a common wheel line. Inspected a screenshot near the viewport edge.
- Art: Phaser loaded the existing coin (48 × 48, six), bill (52 × 52, four), six 1024 × 256 boss sheets and 512 × 256 lot sheet. Supplied boss-props.png decoded as 768 × 128 RGBA8 with six inset alpha regions ordered clipboard, tire, warranty papers, invoice, bundle, minion. File-safe embedded art displays those props; every third Lowballer volley uses the existing coin. Missing, wrong-size and corrupt sheet fixtures retained existing coin, bill and tire art where applicable and vector fallbacks. No production -walk sheets are present. A temporary synthetic 1536 × 256 six-frame browser fixture verified opt-in independently of another boss; wrong-size optional sheet fell back. The fixture is not an art deliverable.
- Browser: file://, Edge 1280 × 800 and 360 × 800 at DPR 1/2. Real key, mouse and emulated touch events, screenshots for flight, grounded fire, windup, the clipboard, lot, approval and result. Victorious arena can transition to flight on the road. Game over, DeWitt CTA and Play Again + canvas fit passed. No runtime exceptions or live leaderboard requests in the harness. Malformed assets tested deliberately. No new dependency, boss, enemy, audio or leaderboard changes.

### Pacing evidence

Two repeats for each moving-manual and stationary-Auto-fire scenario (24 total), using actual production collision and 8 ms updates. Moving policy held the existing fire input and steered out of the marked band after 300 ms; stationary had no dodge input. Timing begins at interactive fight start, repeats matched, and all moving wins kept 2 HP. Normal damage 1, stagger +1 across the roster.

| Boss | HP | Moving win | Shots fired / boss HP hits | Stationary Auto-fire |
| --- | ---: | ---: | ---: | --- |
| Lowballer | 43 | 14.462 s | 45 / 36 | lost 9.014 s |
| Tire Kicker | 58 | 14.430 s | 44 / 42 | lost 5.726 s |
| Greeter | 44 | 19.718 s | 59 / 36 | lost 13.790 s |
| Warranty Guy | 50 | 18.646 s | 56 / 36 | lost 7.566 s |
| Invoice Price | 54 | 15.558 s | 48 / 45 | lost 9.366 s |
| Corporate Merger | 59 | 19.342 s | 58 / 50 | lost 12.254 s |

Lowballer and Tire Kicker are within 0.6 s of the approximate lower target. Greeter's initial unchanged 2 HP wave permitted stationary victory; the final 4 HP wave, 1.48× Greeter-only movement and 4.5 s resummon delay repaired it while both test dodges stayed healthy. The Tire escalation caps still passed. The discrete aim/source geometry and prop flight are measured on the tested paths, not exhaustive proof of every dodge and starting coordinate.

Eleven Node tests passed (six unchanged Worker, four existing arena tests including two updated for intended behavior, one new movement test). Physical phone, complete manual campaign, audio by ear, sustained mobile performance and human balance are not tested. The v21 capture folder is rv-dash-v21 in the session visualization workspace.

## v21c world scroll

**Reproduced.** Edge 157.0.4341.46 in the established headless CDP context on port 9326, using local Python HTTP (python -m http.server 8765 --bind 127.0.0.1), cache disabled, no service worker, 1440 × 1080 DPR 1, native 600 × 800. Used the isolated ?boss=1 route. Verified current v21b prop scale and Taggy size, then captured intro, active fight, and steady road. A controlled final boss hit advanced to road without changing production progression. A real pothole sprite at a safe depth served as a positive control. Media values were explicit CDP overrides of no-preference and reduce, not observations about Jay's browser or OS.

**Cause and repair.** v21b game.js:1109 sent a positive gameplay distance to advanceScenery(), but game.js:1287 returned early under reduced motion, before updating any layer. In the same substeps, game.js:1133 moved the pothole. At baseline, reduce road samples recorded 62 calls per 496 ms, 66.259501 px of gameplay distance, zero offsets and rendered tile movement, and 66.259501 px of pothole movement. Shift+P reported all zero. The theme image was visible at depth -4.5, behind the moving layers; the same image and camera stack worked under no-preference. Removed the common gate and the debug overlay's unconditional reduced-motion zero. Existing arena callers still suppress decorative motion in reduce. No road speed, physics, arts, or obstacle changes.

**Frame method.** Captured three original PNG frames per phase and preference in both builds. Game time advanced in 8 ms increments and was sampled 256 ms apart for intro, 496 ms for road and fight. UTC screenshot times and bounded calls with distance/dt are recorded in runtime.json. Fixed road ROI (525,850,165,43), 7,095 pixels, and background ROI (345,565,490,166), 81,340 pixels, exclude Taggy, the moving pothole, boss, warning and HUD. Mean is absolute RGB channel difference on an 8-bit scale; change rate uses max channel delta >8; displacement is a best leftward alignment search on the textured crops. Diff PNGs amplify absolute differences 4× for display. Full per-pair values, including the percent above threshold, remain in each pixel-measurements.json.

| Phase / preference | Road pixels left, before → after | Road RGB mean before → after | Background pixels left / RGB mean before → after | Road offset / rendered tile delta before → after | Outcome |
| --- | --- | --- | --- | --- | --- |
| Road / no-preference | 66 → 66 | 7.168 → 7.168 | 2 / 4.897 → 2 / 4.897 | 66.042 / 66.042 → 66.042 / 66.042 | Existing motion preserved |
| Road / reduce | 0 → 66 | 0 → 6.387 | 0 / 0 → 2 / 4.936 | 0 / 0 → 66.260 / 66.260 | Road and world now track the moving pothole |
| Arena intro / no-preference | 25 then 9 → 25 then 9 | 5.640 then 1.761, unchanged | 1 / 2.778, then 0 / 1.048, unchanged | 25.412 then 8.119 on both runtime measures, unchanged | Existing coast decelerates to zero |
| Arena intro / reduce | 0 → 0 | 0 → 0 | 0 / 0 → 0 / 0 | 0 / 0 → 0 / 0 | Existing reduced-motion behavior |
| Arena fight / no-preference | 13 → 13 | 2.579 → 2.579 | 1 / 1.653 → 1 / 1.653 | 13.094 / 13.094 → 13.094 / 13.094 | v21b ambient scroll preserved |
| Arena fight / reduce | 0 → 0 | 0 → 0 | 0 / 0 → 0 / 0 | 0 / 0 → 0 / 0 | Ambient motion intentionally off |

Road and fight table entries use sample pair 0→1. The normal-motion arena measured 26.40 px/s against 133.15 px/s of nearby normal-road scrolling, ratio 0.1983; visible road displacement ratio was 13/66 = 0.1970. After repair the reduced-motion road debug overlay reported 134.7 px/s at the final sample, in agreement with the increasing runtime rate and tile offsets. Normal-motion before/after road and arena metrics are identical. The static theme art remains in place by design.

- Evidence: [before frames and measurements](docs/v21c/before/) and [after frames and measurements](docs/v21c/after/). The 36 original captures form the requested frame sequences. No runtime/console errors, failed resource loads, service-worker responses, or disk-cache substitution in the HTTP comparison. Separate Edge file:// shell, boss prop, road transition and result/CTA smoke passed.
- PASS, exit 0: node --check game.js; node --check boss-arena.js; node --test tests/boss-arena.test.mjs leaderboard-worker/worker.test.mjs (14 passed, zero failed). Regression coverage includes road offsets in both media modes, individual parallax factors, no arena multiplier leakage, paused state and reduced arena behavior. No separate build needed for the existing static entrypoint. git diff --check passed.
- Remaining limitation: Jay's actual browser configuration and physical-phone presentation were not inspected. The report was reproduced by the explicit reduce override, and not under no-preference.

## v21d road-first start and parked-vehicle depth

**Baseline and reproduction.** rv-dash-repair at fa85b862ea7042d2f92a31300b5e1896e112cea7 with all pre-existing unstaged v21/v21b/v21c work. Established Edge 157 headless CDP profile on port 9326 and existing local Python HTTP on port 8765. Ordinary /index.html loaded without query flags. Fresh fixture and returning fixture (saved best 54,321, level 7) used isolated automation storage. Both genuine Start clicks rendered the Lowballer intro, level 1, distance 0, while the road threshold was 3000. Three frames per profile are in docs/v21d/before. One baseline incidental favicon 404 occurred, with no failing game resource.

**Cause and repair.** Prepatch game.js:948 called enterArena() unconditionally after start() entered PLAYING. Prepatch road step incremented this.level before opening the arena. The first call now belongs to the existing positive road threshold (game.js LEVEL_DISTANCE = 3000 game-distance units). Level 1 and Nostalgiawave persist through Lowballer at 3000, then level 2 and Dreamwave begin on victory. Tire Kicker opens at 6000, then Greeter, Warranty, Invoice, Merger and the next Lowballer on successive 3000-unit boundaries. Multiple ticks at an occupied boundary keep the same arena. The existing flight hint is shown at the first road start. Deliberate debug URLs still directly open the selected arena, seeded at that encounter threshold so finishing it cannot repeat the same tier; Debug remains isolated from best records and live submissions.

**Startup evidence.** Captured first POST_RENDER after genuine native Start and Play Again clicks by pausing the frame loop in the observer. The browser start and replay path did not inject scene state. First frame distances were approximately two units because the initial game update had run. Clean and returning normal Start plus road death at about 1213 units and arena death after a separately accelerated boundary fixture all showed level 1 road, no arena/HUD/old segments. Returning saved best persisted. Pause held distance and Resume preserved it. The separately identified deterministic progression fixture used real arena construction, threshold capping and victory transition with staged remaining HP and distance. It reached level 8 road after the roster wrapped. There is no separate campaign completion state; the endless loop resumes road after arena victory and Play Again is available after death.

**Vehicle sources and measurements.** These are individual rv-lot-set sprites from a 512 × 256 sheet, not pixels baked into the scenery texture. The four alpha-cropped cells have source bounds (x,y,w,h) (12,43,232,75), (268,40,232,78), (49,142,158,104), (268,185,232,61). Their tire contact occupies the last native alpha row in each trimmed frame. All use bottom-center origin (0.5,1) and three copies separated by 600 px. World x is driven by the existing layer offsets. Parked units have no independent travel.

| Frame / unit | Display width × height before → after | Scale before → after | Tire y / depth / parallax before → after |
| --- | --- | --- | --- |
| 0, short tow rig | 121 × 39.12 → 110 × 35.56 | 0.522 → 0.474 | 579 / 1 / lot 0.230 → 521 / 0.5 / treeLine 0.065 |
| 1, fifth wheel | 137 × 46.06, unchanged | 0.591 | 579 / 1 / lot 0.230, unchanged |
| 2, tall truck camper | 97.23 × 64, unchanged | 0.615 | 579 / 1 / lot 0.230, unchanged |
| 3, long tow rig | 137 × 36.02 → 116 × 30.50 | 0.591 → 0.500 | 579 / 1 / lot 0.230 → 521 / 0.5 / treeLine 0.065 |

The distant tires meet the upper lot stripe (y=517–521) and near tires stay above the foreground road (y=586). Frame 0 faces left. Frame 3 flips horizontally as a complete unbranded rig, putting the towing truck on the right at the leading end of the trailer. Neither facing changes the shared world scroll. Camera x was static. Over 496 ms, before both rows moved 7.21 px in the starting arena coast (14.54 px/s averaged). After on the same-theme road, far sprites moved 4.27 px (8.61 px/s) and near sprites moved 15.10 px (30.45 px/s), measured from rendered sprite transforms. Reduced-motion file:// road measured the same row displacements and 65.66 px of visible road tile advancement. A 120-sample deterministic far-row repeat advanced 600 px, returned the same far transforms, and kept all copies exactly 600 px apart. Edge captures straddling both edges during a 4 px far-row crossing show the intact rigs continuing. Inspected Nostalgiawave desktop and 360 px and Bitwave desktop; not all themes were visually inspected.

**Checks.** node --check game.js and node --check boss-arena.js passed. node --test tests/boss-arena.test.mjs leaderboard-worker/worker.test.mjs passed 15/15. Browsers used normal HTTP and 360 × 800 reduced-motion file://. Road moved in both settings, standard arena intro coast still decelerated, standard sustained arena measured 0.2000 of its base speed, and reduced intro/fight decor held still. No runtime exceptions or live leaderboard calls. Browser captures and state logs are under docs/v21d/before and docs/v21d/after. Physical phone, Jay's own motion settings, and all-theme visual coverage remain untested.

## RV Dash v21e ambient animation investigation

**Local baseline.** rv-dash-repair at fa85b862ea7042d2f92a31300b5e1896e112cea7 with unstaged v21 through v21d. Edge headless 157.0.4341.46 on the established isolated CDP profile, existing Python local HTTP server at http://127.0.0.1:8765/index.html, no debug query for animation/main-road captures. 1440 × 1080 DPR 1, 600 × 800 playfield, Nostalgiawave. game.js?v=21 returned 200 without disk cache or service worker. Genuine Start opened on the road in both explicit matchMedia overrides. No real user storage, profile preference or OS setting was read or changed. **JAY'S REAL EDGE PREFERENCE: UNVERIFIED.**

**Mechanism.** game.js:505–510 loads the embedded sprite sheets and game.js:575–581 registers looping animations over the frame ranges below. For the production road ENEMIES patterns there is no obstacle replacement texture. The lookup and play calls at game.js:1458–1484 use the pattern key for the enemy and the explicit coin animation key for the sentinels. In standard motion the production sprites started their registered animations and completed repeated cycles, with no unexpected pause, stop or texture replacement. Under reduce the explicit spawn gate at game.js:1472 and 1483 leaves the decorative animation at frame 0. Both modes move each gameplay object through game.js:1141 and scroll the scenery through game.js:1118. Missing definitions, static obstacle substitution, interrupted standard playback and scenery freeze were ruled out for these tested instances. A reduced-motion explanation for Jay's observation is plausible but unverified in his actual profile.

| Sprite | Texture and requested animation | Runtime frames | Standard before → after | Reduce before → after |
| --- | --- | --- | --- | --- |
| Bird | bird / bird | 0–3, 96 × 96, 10 fps, repeat -1 | all 4 frames → all 4 | frame 0 → frame 0 |
| Drone | drone / drone | 0–3, 96 × 96, 12 fps, repeat -1 | all 4 frames → all 4 | frame 0 → frame 0 |
| Shopping cart | cart / cart | 0–3, 120 × 100, 12 fps, repeat -1 | all 4 frames → all 4 | frame 0 → frame 0 |
| Coin control | coin / coin | 0–5, 48 × 48, 10 fps, repeat -1 | all 6 frames → all 6 | frame 0 → frame 0 |

**Visual method and evidence.** After ordinary Start, the Edge fixture called production spawnPattern directly for the three existing ENEMIES patterns and a coin. It positioned containers within the viewport for one continuous capture and allowed production update, gameplay motion and animation to run. It did not call play() on the sprites or replace their frames. First sample rendered after spawn at zero delta; next 20 frames were captured at 64 ms game-time intervals (1280 ms total). Matched screen crops account for scrolling and the bird's vertical movement. Both compared frames must be nearly opaque (source alpha >=248) with a one-pixel interior margin. A ±1 px registration against the source image accounts for pixel rounding; only mask intersection pixels contribute to the actual screenshot differences. All four sprites moved left ~170.19 px during the interval in both modes; near and far lot offsets increased ~39.14 and ~11.06 px. Background changes were excluded from the measured masks. Matched 128 ms sample-pair stats follow (count uses max RGB channel delta >8). Units for mean RGB are 8-bit levels.

| Sprite and sample | Changed pixels / eligible, before → after | Mean absolute RGB after |
| --- | --- | --- |
| Bird standard, frames 0→1 | 867/1286 → 867/1286 | 27.0547 |
| Drone standard, frames 0→1 | 684/1918 → 684/1918 | 23.7364 |
| Cart standard, frames 0→1 | 1274/1814 → 1274/1814 | 56.9849 |
| Coin standard, frames 0→1 | 499/851 → 499/851 | 42.7924 |
| Bird reduce, frames 0→0 | 0/1936 → 0/1936 | 0.1393 |
| Drone reduce, frames 0→0 | 0/2133 → 0/2133 | 0.2754 |
| Cart reduce, frames 0→0 | 0/2359 → 0/2359 | 0.0000 |
| Coin reduce, frames 0→0 | 0/1063 → 0/1063 | 0.1173 |

Original gameplay sequences, source frame crops, aligned masks, diffs and runtime JSON are in [before](docs/v21e/before/) and [after](docs/v21e/after/). After is an independent confirmation on the same gameplay code. No functional repair was justified. Reduced-motion tolerance reflects near-opaque pixels and rounding, with zero samples exceeding the visible-change threshold. Added a targeted Node test exercising the actual spawn path and assigned playback keys in both modes.

**Checks.** node --check game.js and node --check boss-arena.js exited 0. node --test tests/boss-arena.test.mjs leaderboard-worker/worker.test.mjs exited 0, 16/16 passing. Edge local HTTP and file:// passed, with no game errors or live leaderboard requests. Browser regressions confirmed road-first normal Start, natural collision and road death, replay after road and arena deaths, threshold and roster wrap, 600 px tow-rig copy spacing, ordinary arena intro coast and sustained 0.2000 ratio, and the reduced-motion arena freeze. Evidence is under docs/v21e/file-smoke/ and docs/v21e/regressions/. Physical phone, natural spawn timing for the three sprites and Jay's actual Edge profile remain untested in this round. V1 PASS, V2 PASS, V3 BLOCKED/UNVERIFIED, V4 PASS.

## RV Dash v22 R2 cabinet verification

**Baseline.** The nested checkout started on `rv-dash-repair` at `fa85b862ea7042d2f92a31300b5e1896e112cea7`, with v20 ancestry and the required v21–v21e work present. The pre-edit gate passed 16 tests. The cached remote-tracking comparison was 0/0. Prior worktree changes and untracked assets were preserved.

**Art and geometry.** The cabinet PNG is 1024 × 1536 and 74,456 bytes. FFmpeg RGBA inspection found a clear rectangle at source pixels x=267, y=299, width=490, height=652, giving a 0.75153 aspect ratio. The independent percentage measurements are 26.0742, 19.4661, 47.8516, and 42.4479. The pipeline accepts an edge difference of up to two source pixels and a ratio difference of up to 0.003 from 0.75. The required owner JSON is absent, so the build emits no illustrated frame and rendered opening alignment remains blocked. The 1774 × 878 panel PNG is 131,676 bytes. Its embedded URI is 175,590 bytes and the generated module is 175,812 bytes. The originals match the canonical copies byte for byte.

**Commands and results.**

- `node --check game.js`, `node --check cabinet.js`, and `node --check boss-arena.js` passed.
- `node --test tests/boss-arena.test.mjs tests/cabinet.test.mjs leaderboard-worker/worker.test.mjs` passed 17/17. The added synthetic registry test selects a second fixed room, frame and panel, then checks locked selection and missing or invalid art fallback.
- `python tools/embed-assets.py --cabinet-only` succeeded with the expected missing-metadata fallback. `Get-FileHash game_assets/cabinet-art.js` matched before and after regeneration.
- `git diff --check` passed. `git diff --cached --quiet` confirmed no staged changes. `git rev-list --left-right --count HEAD...origin/rv-dash-repair` returned 0/0 from local refs.

**Edge.** The uncached local HTTP run covered 320 × 800, 375 × 812, 390 × 844, 768 × 1024, 1024 × 768, 1440 × 900, and 812 × 375. It checked the embedded room and panel, 3:4 field, deck placement beneath the screen, and no horizontal overflow. Browser input checks covered joystick depth and horizontal movement, focused arrow control, five-pixel Fire press, one shot on press, keyboard Fire ownership after pointer release, Fly/Jump, lever hold and release, blur and pause resets, game over, road-first replay, locked slots, canonical theme update, and fullscreen. At 390 × 844, file launch with emulated touch and reduced motion passed simultaneous Fire and lever hold, instant press and room transitions, the existing touch flight and shoot buttons, touch cancellation, and the missing-room fallback. The final run recorded zero runtime exceptions and zero live Worker requests. Leaderboard responses were mocked and its existing configuration was preserved.

**Captures.** The evidence directory is `C:/Users/Jay/.codex/visualizations/2026/11/13/01a1d5a5-6c89-7621-9450-9c63805c59a6/rv-dash-v22/verification`. It contains page and deck views at 320, 390 and 1440 px, `pressed-fire-desktop.png`, `mobile-touch-held.png`, and `checks.json`.

**Open checks.** The illustrated frame and marquee require the owner metadata and a desktop alignment pass. Physical phone, listening tests, full manual playthrough, and hosted verification are outstanding. No staging, commit, push, deployment or live leaderboard changes occurred.

### v22 R2 frame alignment follow-up

The owner supplied `assets/cabinet/cabinet-rv-dash.json`. Its percentages (26.1, 19.5, 47.9, 42.4) imply pixel edges (267.264, 299.520, 757.760, 950.784). FFmpeg RGBA validation measured the fully transparent opening at edges (267, 299, 757, 951), with a maximum discrepancy of 0.76 source pixels against the two-pixel tolerance. Measured aspect is 490/652 = 0.75153 against the 0.750 target. The source JSON and PNG stayed byte-for-byte as supplied during this follow-up.

`python tools/embed-assets.py --cabinet-only` embedded the validated frame (99,298-byte URI) and panel (175,590-byte URI) in a repeatable 275,390-byte module. The browser uses the independently measured opening. At 1440 × 900, the opening measured 341.660 × 454.617 CSS px, the outer bezel 341.656 × 454.609, and the canvas 329.656 × 439.531. The maximum alignment error across all opening and bezel edges was below 0.02 CSS px at all tested desktop sizes. Edge confirmed proportional scaling, a pointer-triggered start, and no horizontal overflow at 1024 × 768, 1440 × 900 and 1920 × 1080. The marquee was readable in captured desktop views at 1024 and 1440 px. The frame extends below the initial viewport at shorter desktop heights. The slim bezel was confirmed under the 768 × 1024 and 390 × 844 touch emulations.

Uncached local HTTP and desktop `file://` passed with zero runtime errors, loose cabinet requests, or live Worker requests. All 17 Node tests and `git diff --check` passed. Screenshots and raw measurements are in `C:/Users/Jay/.codex/visualizations/2026/11/13/01a1d5a5-6c89-7621-9450-9c63805c59a6/rv-dash-v22/frame-verification`. The frame metadata and desktop geometry checks pass. Physical device and hosted status remain as previously documented.
