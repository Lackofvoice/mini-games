ROLLBACK_POINT: 093ccfd92cc7d6c3df53dd1c41376e2305498d18

# Phase 11 visuals

0. Checkpoint: clean baseline, local tag before-phase-11.
1. Source inspection: done. drawScenery offsets cached sky/cloud/hill/lot/road textures and scenery images. scrollSpeed(distance) caps the ramp at 230 px/s. moveHorizontally eases keyboard or touch velocity. advance selects a pattern; spawnPattern draws its sprite and coins, and checkPattern uses inset rectangles. The old upper hazard is a procedural branch alongside a sign. makeTextures draws the track and the floor clamps above its road line.
2. Parallax: done. Independent seeded scenery and Shift+P overlay preserve plain P for pause.
3. Ground obstacles: done. Generated 19 ground PNGs plus the overhead source set, with a shared manifest and offline bundle. Four existing ground hazards now use sprite art.
4. Overhead hazards: done. Replaced procedural branch/sign art with five rope-hung sprite variants. The lowest solid part follows the pivot; reduced motion holds it still.
5. Walkable road and lanes: done. Taggy walks on three asphalt lanes and casts a shadow. Q/E step while grounded, preserving existing lift and Down actions. The next step wires lane collisions to the new ground patterns.
6. Obstacle patterns: done. Seeded decks unlock groups by level. Each ground group leaves a lane clear. Timing uses current world speed. Slows reduce horizontal speed by 20% for 650 ms. Existing bosses and combat remain separate.
7. Browser verification: done. Edge scripted run reached level 4; all 24 contacts checked, live leaderboard read passed, approximately 60 fps with overlay. Captures are in docs/phase11.
8. Push and pinned preview: release checkpoint. Verify the pinned index.html after the normal branch push.
# Lot Hero discovery

No Lot Hero game was found in the repair tree, the old rv-sale-dash-game scaffold or master. Lot Hero appears as a locked cabinet slot. Phase 11 reserves a separate Lot Hero board.

# DONE

Phase 10b is layered on top of Phase 11. Cabinet styles and behavior are in cabinet.css and cabinet.js. Status indicators observe the existing start/result visibility and body state classes. Utility buttons use the existing sound control, native Fullscreen, and the accessible controls dialog. The original CSS camper and existing Taggy and coin art make up the 3.2-second skippable intro.

The cabinet leaderboard mount is #leaderboard-mount. It wraps the existing Phase 11 #leaderboard node. Preserve its child IDs and RVLeaderboard.attach(gameId) lifecycle. The client owns visibility, focus, board requests and rendering. The shipped URL remains empty.

All page asset URLs use v=12. No gameplay source or sprite assets changed.

# NEXT STEP

Try keyboard and touch on a physical device. Future game slots are added to the list in cabinet.js. Jay deploy steps are in leaderboard-worker/README.md. Deployment is NOT done.

# OPEN ISSUES

Physical phone, audio by ear, separate hardware frame-time profiling, real Cloudflare deployment, production KV consistency and live-site CORS remain unverified.

# Phase 10c checkpoint

Started at ff72cd435d04584aad5889c5272d806ad5b48b83 on rv-dash-repair. Changed game.js, cabinet.css, cabinet.js, index.html, README.md, VERIFY.md and this handoff. Page asset versions are v=13.

Steering response is 25/s, braking 38/s, touch gain 13/s and stop threshold 2 px/s. Peak speed is 245 px/s. Release holds position after braking. Down adds 55.2 px/s² when the focused playfield is playing with no lift input. Rise and natural fall remain capped at 330 px/s. Assisted fall caps at 346 px/s. Lift takes priority. Cabinet faces travel 7 px for primary and 6 px for utility/Pause over 55 ms with a 210 ms return.

Ran node syntax checks, all five leaderboard unit tests, and Edge offline desktop/360 px interaction and production-method comparisons. See the Phase 10c VERIFY.md section. No audio changes, deployment or leaderboard activation.

Next action: open index.html locally and try steering release, Down descent and button feel. Physical-device and subjective checks remain open. Normal Git push requires authentication on this checkout.

# Leaderboard activation

The Worker was redeployed with raw.githack.com in its CORS allowlist. Both boards passed read-only live GET and POST preflight checks from the preview and dealership origins. An unlisted origin still returned 403. All six Worker tests passed. The client endpoint is configured and page assets use v=14. The pinned preview requires the activation commit to be pushed.


# Phase 11b

Started at 5c3a2efcd25d758913c4cc9ff05ce560816a714a. Free-road is the default in GROUND_MOVEMENT_MODE. Up/W and Down/S walk across the road while grounded. Q/E still steps between three fallback positions. Space taps jump, holds fly, and F shoots. Coffee keeps its multiplier and gives an initial launch. Airborne Down/S assists descent with lift taking priority. Mouse hold flies; touch retains left hold for lift and right taps for shots, with a vertical left drag from the road steering depth.

The supplied source is assets/road-obstacles-128.png. The offline derivative is game_assets/road-obstacle-sheet.js. The game validates the 512 × 256 dimensions, maps eight cropped frames, and keeps existing PNG fallbacks. The other untracked art folders were left outside the commit. Page assets use v=16.

Next action: try free road movement and short jumps on a physical phone or desktop, and judge depth spacing and obstacle difficulty. See VERIFY.md for Edge, fallback and deterministic group evidence.

# Synthwave UI checkpoint

Start and verified remote: 95ce5a0b9b773c210e350ca50c615eb6135f63a2 on rv-dash-repair, equal to required baseline. Six unrelated untracked art directories are outside scope. DOM owns cabinet, controls, HUD, results, personal best and online board. Phaser owns the game canvas, speech position, banner, debug text and score popups. No separate local board, tabs or boss resource indicator exists. Safe next action: add the skin, then use mocked leaderboard responses in Edge.

Implemented the v17 synthwave stylesheet, page hooks and Phaser UI colors. Gameplay parameters and Worker/config are intact. The online score form now guards pending and completed attempts per run, including across Close and View scores. Khand and Hind are pending verified official packages and licenses. Edge desktop and mobile-emulated evidence is in VERIFY.md. Next action: review the pinned build and try the cabinet on a physical phone.

# Phase 11c

Starting HEAD and fetched rv-dash-repair both match required v17 UI-skin baseline 64b054a51111e05c32c7c71f03e14a8e34cad6b9. Ancestry checks passed, divergence 0/0. Six unrelated art directories excluded. Inspected the v17 cabinet markup, both base styles and synthwave overrides, Phaser road and input flow, and board focus. Scope is control convenience, road art mapping, viewport fit and optional original art hooks.

Phase 11c implementation and Edge verification completed with page assets at v18. Auto-fire defaults on and persists, quick taps share the normal shot cadence, jump forgiveness is 120 ms in both directions, and ordinary jump speed is 300 px/s. Play Again is above the visible final course. Box displays the crate frame and the first-level chock slot uses tread. The optional art paths are wired into tools/embed-assets.py with runtime dimension checks and fallback art. No source sheets supplied, so no bundle regeneration was needed. Next action: try the jump and Auto-fire defaults on a physical phone, then drop approved original sheets under assets/sprites and run python tools/embed-assets.py when ready. See VERIFY.md for measured fit and regression checks.

# Boss Battles checkpoint

Started on rv-dash-repair at 291b9ec850d0db848b5ff0935afaa182ec833109. Required baseline matches local HEAD and fetched origin. Both ancestry checks passed, ahead/behind 0/0. Six unrelated untracked art directories and the local boss originals/working files are outside the commit unless a production sheet is validated for this phase. Source inspection confirmed the old level % 5 queue, positive-x shots at a shared 350 ms cadence, 21 × 25 half extents, road depth 633–743, 1.5 s damage immunity and a 600 × 800 logical game.

Implemented v19 pre-level boss arenas, supplied six validated production sheets, procedural fallbacks, a pause-aware shared attack clock, accessible Jump and HP controls, safe debug selection and APPROVED. Normal course motion resumes with the existing speed curve and settings. Scoped tests passed, and leaderboard implementation/config remained untouched. The original companion sheets, references and unrelated art remain untracked. Next action: human-playtest duration, aim and escape windows, particularly the fast Lowballer Auto-fire result and late Merger phases. See VERIFY.md for evidence and limits.

# Backgrounds + Boss Balance checkpoint

Starting HEAD and fetched origin/rv-dash-repair were both 5f415a98d5c6dbb5a9b141843a298f906b80b84a. Both required ancestry checks passed; divergence 0/0. No tracked changes at entry. The local tow archives and nested RV lot sheet are candidate inputs. Preserve all originals and unrelated art. Scope is v19 visual and input repair, scenery, boss balance, and verification. Next action: inspect framing and reproduce the v19 Lowballer result.

Source inspection reproduced the v19 6.384 s stationary Lowballer result. Found all 27 original tow frames and the companion lot sheet. v20 separates Taggy body poses from muzzle feedback, gives mobile flight its own hold control, uses static upper-world background crops and the side-view lot sheet, and introduces readable boss vulnerabilities. Next action: fixed-step balance runs and rendered viewport checks.

v20 is implemented and browser-verified locally. Theme assets and provenance manifest are ready, and all unrelated source art remains untouched. Recorded Taggy pose measurements, touch/auto-fire results, 24 debug boss samples and startup timings in VERIFY.md. Lowballer meets its minimum; the other five measured fights remain shorter than the proposed hypotheses. Next action: review local diff and human-playtest boss pacing and physical touch. This handoff did not independently authorize commit or push, so changes are left unstaged.

Git delivery approved by Jay. Starting branch and fetched origin were rechecked with zero divergence and all ten Node tests passed again. Only the v20 code, verified lot sheet, derived theme bundle and manifest, tests, and handoff notes are included in the delivery commit.

# RV Dash v21 owner playtest repair

Required and actual starting HEAD fa85b862ea7042d2f92a31300b5e1896e112cea7 on rv-dash-repair. Commit exists, both ancestry checks passed, baseline and upstream divergence were 0/0, and tracked/staged work was clean. Pre-existing tow archives, boss working art, and other inputs remain local. The initial parallel preflight fetched the existing branch before the attachment's no-fetch direction was read. The fetched SHA matched HEAD and no checkout or local history changed. Baseline config actually points at the enabled Worker. Preserve it byte-for-byte and use debug/mocks only.

v21 is implemented and remains uncommitted and unstaged. Modified game.js, boss-arena.js, index.html, synthwave.css, tools/embed-assets.py, game_assets/embedded-assets.js, tests/boss-arena.test.mjs, VERIFY.md and this file. The existing untracked boss-props.png was validated and used without source edits; other originals stay out of scope. No optional production walk sheets were found. Edge and Node verification are in VERIFY.md. Normal boss hits use actual moving bounds, stagger is +1 for 1350 ms, flight is available in the first arena, Auto-fire starts OFF for new players and Taggy's visual body is 66 logical px. All 24 fixed-step outcomes repeated and the moving wins fell at 14.43–19.72 s. Next safe action: review the unstaged diff and try a physical-phone run. No commit, push, merge, or deployment was performed.

## RV Dash v21b three-regression checkpoint

Started on rv-dash-repair at fa85b862ea7042d2f92a31300b5e1896e112cea7 with the nine v21 files unstaged. The complete read-only binary diff and inventory are in C:/Users/Jay/AppData/Local/Temp/rv-dash-v21b-preflight-20261115-163904. Existing untracked cabinet/panel PNGs and the prior asset archives and source art were left alone.

• Parallax: v20 and v21 intentionally advanced arena decor only during intro coast. Rendered road tiles and trailers still advanced before the repair. game.js now advances existing layers at 20% of current road speed during active combat, with no gameplay distance advancement. Intro coast, paused/intermission/defeat states, ordinary road speed, trailer geometry, and reduced-motion behavior are preserved. Tested equal elapsed time at 30/60 FPS and checked serialized painted positions and actual screenshot pairs on the native 600 px field.
• Props: the prior scale clamped trimmed art to combat clearance or width. boss-arena.js now enlarges display only. Measured widths in logical pixels were clipboard 29.28→62, tire 39.69→64, paper 58→87, invoice 30→58, money 30→48, minion 28→48. Wide paper and minion silhouettes extend past their original collision footprints by design. Collision width, altitude rules, speed, trajectories, timing and damage were untouched. Validated all six with mid-flight screenshots at native 600 px and 360 px portrait. Missing/wrong-size/corrupt prop selection and the original sprite fallbacks passed.
• Walking: default bosses used an idle frame with less than 0.4 px of peak-to-peak feet movement in the baseline probe. Boss pacing now adds up to 4.2 px of decorative, distance-driven step lift and directional lean. Combat poses take priority, and reduced motion suppresses gait. Logical position and original optional-sheet loader remain unchanged; a temporary six-frame fixture passed. Taggy's existing cycle already advanced all four frames. Edge rechecked right, left and depth movement while firing, transition to idle, flight and landing. No Taggy animation change.

v21b changed only game.js, boss-arena.js, tests/boss-arena.test.mjs and this checkpoint. Fourteen tests passed via node --test tests/boss-arena.test.mjs leaderboard-worker/worker.test.mjs. Edge file:// passed at native 600 px and 360 px portrait, showed reduced-motion stillness, and recorded no uncaught runtime exceptions or live Worker requests. Screenshots are in the session visualization directory rv-dash-v21b. Twenty-four deterministic combat repeats preserved the v21 fight outcomes and all six moving victory times. Physical phone and owner judgment of gait and prop/collision readability remain unverified. HEAD and branch remained fixed, no files staged, and no Git publishing, fetch, or deployment actions occurred.

## RV Dash v21c world-scroll checkpoint

Started and ended on rv-dash-repair at fa85b862ea7042d2f92a31300b5e1896e112cea7 with the same pre-existing unstaged v21/v21b files and art. Under Edge's explicit reduce override the old shared scenery gate froze painted road and background pixels while obstacles advanced. v21c changes only game.js, its existing test in tests/boss-arena.test.mjs, VERIFY.md, this checkpoint, and before/after evidence under docs/v21c/. Essential road scenery now advances in both media modes and Shift+P reports its real speed. v21b arena motion and its reduced-motion opt-out are preserved. Edge captured matching native-scale sequences and verified visible road scroll under both preferences. Fourteen tests passed, shell checks and file:// smoke passed. Next action for Jay: hard refresh the local build and confirm road and potholes travel together on the original device. Work remains unstaged and uncommitted; no fetch, push, or deployment occurred.

## RV Dash v21d checkpoint

Started and ended on rv-dash-repair at fa85b862ea7042d2f92a31300b5e1896e112cea7. The pre-existing v21/v21b/v21c work remains unstaged. Normal Start and Play Again now open on level 1 road. Lowballer is earned at 3000 run-distance units and Tire Kicker at 6000, with level/theme advancing after each victory. Deliberate debug arenas remain directly available. The two small parked tow rigs now share a higher, slower plane with opposite facing, while the large camper remains on the near row. v21d changes game.js, tests/boss-arena.test.mjs, VERIFY.md, this checkpoint and evidence under docs/v21d/. Edge and 15 Node tests passed. Next action: owner playtest of the new road opening and lot depth on the actual phone. No staging, fetch, commit, push, deployment, leaderboard or Worker changes.

## RV Dash v21e ambient sprite checkpoint

Started and ended on rv-dash-repair at fa85b862ea7042d2f92a31300b5e1896e112cea7 with existing unstaged v21 through v21d work. Edge HTTP and file:// showed bird, drone, cart and coin frames cycling under standard motion and intentionally staying on frame 0 in reduced motion while gameplay objects, road and scenery continued moving. Captured visual pixel evidence and repeated the measurement on unchanged gameplay code. Jay's real Edge preference remains unverified. Added the focused spawn-policy test in tests/boss-arena.test.mjs and evidence under docs/v21e/. Sixteen Node tests passed; browser checks also preserved road-first start, collisions/replay, boss order, arena motion and lot depth. Next action: on the affected device, read matchMedia('(prefers-reduced-motion: reduce)').matches and compare the symptom. No source gameplay, art, configuration or leaderboard change; no staging, fetch, commit, push or deployment.

## RV Dash v22 R2 checkpoint

The work began and ended on `rv-dash-repair` at `fa85b862ea7042d2f92a31300b5e1896e112cea7`. The cached upstream showed 0 ahead and 0 behind. The v21–v21e gate and all 16 baseline tests passed.

The page scene tracks the canonical game theme. The deck adds joystick, Fire, Fly/Jump, Coin/Start, and a momentary flight lever with independent input ownership. Both supplied PNGs were copied unchanged into `assets/cabinet/`. The panel is embedded and displays where there is room, with the compact CSS deck on phones. The missing `assets/cabinet/cabinet-rv-dash.json` blocks desktop frame acceptance. The build uses the slim bezel. See the v22 R2 section of `VERIFY.md` for measurements, tests, and captures.

Terminal state is **blocked**. All changes are unstaged. No fetch, commit, push, or deployment occurred. Jay's next step is to supply the original geometry JSON that goes with the cabinet PNG. With that file and explicit approval to continue, round-trip the embed and measure the illustrated frame in Edge.

### v22 R2 frame alignment follow-up

The supplied cabinet JSON passed transparent-opening validation and the bundle now includes the illustrated frame. Edge measured the rendered opening against the bezel at three desktop sizes and on desktop file launch. Under touch emulation, the slim bezel remained active at tablet and phone widths. See the frame alignment follow-up in VERIFY.md. The missing-metadata blocker is cleared. The local changes remain unstaged for owner review before any staging, commit or push.

## RV Dash v22b checkpoint

2026-11-15T23:08:46.2885860-05:00. Project C:/Games/mini-games/rv-dash, branch rv-dash-repair, HEAD fa85b862ea7042d2f92a31300b5e1896e112cea7. Job 1 and Job 2 NOT STARTED. No staged files. All pre-existing work below is protected. The baseline passed 17 Node tests and the cabinet embed command. Job 1 is limited to orange Fire and the existing flight lever visual states. Job 2 is limited to the selected self-hosted faces after source and license verification. Gameplay, geometry, leaderboard and navigation are excluded. No staging, commit, push or deployment.

Initial status (all paths):
~~~~
 M RESUME.md
 M VERIFY.md
 M boss-arena.js
 M cabinet.css
 M cabinet.js
 M game.js
 M game_assets/embedded-assets.js
 M index.html
 M synthwave.css
 M tests/boss-arena.test.mjs
 M tools/embed-assets.py
?? assets/cabinet/cabinet-rv-dash.json
?? assets/cabinet/cabinet-rv-dash.png
?? assets/cabinet/control-panel-rv-dash.png
?? assets/rvdash-original-motorhome-part1of3/original-motorhome/darksynth-1.png
?? assets/rvdash-original-motorhome-part1of3/original-motorhome/darksynth-2.png
?? assets/rvdash-original-motorhome-part1of3/original-motorhome/darksynth-3.png
?? assets/rvdash-original-motorhome-part1of3/original-motorhome/dreamwave-1.png
?? assets/rvdash-original-motorhome-part1of3/original-motorhome/dreamwave-2.png
?? assets/rvdash-original-motorhome-part1of3/original-motorhome/dreamwave-3.png
?? assets/rvdash-original-motorhome-part1of3/original-motorhome/nostalgiawave-1.png
?? assets/rvdash-original-motorhome-part1of3/original-motorhome/nostalgiawave-2.png
?? assets/rvdash-original-motorhome-part1of3/original-motorhome/nostalgiawave-3.png
?? assets/rvdash-original-motorhome-part2of3/original-motorhome/outrun-1.png
?? assets/rvdash-original-motorhome-part2of3/original-motorhome/outrun-2.png
?? assets/rvdash-original-motorhome-part2of3/original-motorhome/outrun-3.png
?? assets/rvdash-original-motorhome-part2of3/original-motorhome/tokyo-1.png
?? assets/rvdash-original-motorhome-part2of3/original-motorhome/tokyo-2.png
?? assets/rvdash-original-motorhome-part2of3/original-motorhome/tokyo-3.png
?? assets/rvdash-original-motorhome-part2of3/original-motorhome/vapor-1.png
?? assets/rvdash-original-motorhome-part2of3/original-motorhome/vapor-2.png
?? assets/rvdash-original-motorhome-part2of3/original-motorhome/vapor-3.png
?? assets/rvdash-original-motorhome-part3of3/original-motorhome/bitwave-1.png
?? assets/rvdash-original-motorhome-part3of3/original-motorhome/bitwave-2.png
?? assets/rvdash-original-motorhome-part3of3/original-motorhome/bitwave-3.png
?? assets/rvdash-original-motorhome-part3of3/original-motorhome/futuresynth-1.png
?? assets/rvdash-original-motorhome-part3of3/original-motorhome/futuresynth-2.png
?? assets/rvdash-original-motorhome-part3of3/original-motorhome/futuresynth-3.png
?? assets/rvdash-original-motorhome-part3of3/original-motorhome/rad-1.png
?? assets/rvdash-original-motorhome-part3of3/original-motorhome/rad-2.png
?? assets/rvdash-original-motorhome-part3of3/original-motorhome/rad-3.png
?? assets/rvdash-tow-part1of3/tow/darksynth-tow-1.png
?? assets/rvdash-tow-part1of3/tow/darksynth-tow-2.png
?? assets/rvdash-tow-part1of3/tow/darksynth-tow-3.png
?? assets/rvdash-tow-part1of3/tow/dreamwave-tow-1.png
?? assets/rvdash-tow-part1of3/tow/dreamwave-tow-2.png
?? assets/rvdash-tow-part1of3/tow/dreamwave-tow-3.png
?? assets/rvdash-tow-part1of3/tow/nostalgiawave-tow-1.png
?? assets/rvdash-tow-part1of3/tow/nostalgiawave-tow-2.png
?? assets/rvdash-tow-part1of3/tow/nostalgiawave-tow-3.png
?? assets/rvdash-tow-part2of3/tow/outrun-tow-1.png
?? assets/rvdash-tow-part2of3/tow/outrun-tow-2.png
?? assets/rvdash-tow-part2of3/tow/outrun-tow-3.png
?? assets/rvdash-tow-part2of3/tow/tokyo-tow-1.png
?? assets/rvdash-tow-part2of3/tow/tokyo-tow-2.png
?? assets/rvdash-tow-part2of3/tow/tokyo-tow-3.png
?? assets/rvdash-tow-part2of3/tow/vapor-tow-1.png
?? assets/rvdash-tow-part2of3/tow/vapor-tow-2.png
?? assets/rvdash-tow-part2of3/tow/vapor-tow-3.png
?? assets/rvdash-tow-part3of3/tow/bitwave-tow-1.png
?? assets/rvdash-tow-part3of3/tow/bitwave-tow-2.png
?? assets/rvdash-tow-part3of3/tow/bitwave-tow-3.png
?? assets/rvdash-tow-part3of3/tow/dashboard-base.png
?? assets/rvdash-tow-part3of3/tow/futuresynth-tow-1.png
?? assets/rvdash-tow-part3of3/tow/futuresynth-tow-2.png
?? assets/rvdash-tow-part3of3/tow/futuresynth-tow-3.png
?? assets/rvdash-tow-part3of3/tow/rad-tow-1.png
?? assets/rvdash-tow-part3of3/tow/rad-tow-2.png
?? assets/rvdash-tow-part3of3/tow/rad-tow-3.png
?? assets/rvdash-tow-part3of3/tow/tron-tow-1.png
?? assets/rvdash-tow-part3of3/tow/tron-tow-2.png
?? assets/rvdash-tow-part3of3/tow/tron-tow-3.png
?? assets/sprites/assets/sprites/rv-lot-set.png
?? assets/sprites/boss-greeter-original.png
?? assets/sprites/boss-invoice-original.png
?? assets/sprites/boss-lowballer-original.png
?? assets/sprites/boss-merger-original.png
?? assets/sprites/boss-props-orig.png
?? assets/sprites/boss-props-preview.png
?? assets/sprites/boss-props.png
?? assets/sprites/boss-tirekicker-original.png
?? assets/sprites/boss-warranty-original.png
?? assets/sprites/cabinet-orig.png
?? assets/sprites/cabinet-preview.png
?? assets/sprites/cabinet-rv-dash.png
?? assets/sprites/control-panel-rv-dash.png
?? assets/sprites/panel-orig.png
?? assets/sprites/panel-preview.png
?? assets/sprites/rv-dash-boss-art/PROMPT-CHANGES.txt
?? assets/sprites/rv-dash-boss-art/README.txt
?? assets/sprites/rv-dash-boss-art/asset-qa.json
?? assets/sprites/rv-dash-boss-art/boss-sheets-preview.png
?? assets/sprites/rv-dash-boss-art/manifest.json
?? assets/sprites/rv-dash-boss-art/references/approved-stamp-reference.png
?? assets/sprites/rv-dash-boss-art/rv-dash-boss-chatgpt-reviewed.txt
?? assets/sprites/rv-lot-set-preview.png
?? assets/sprites/rv-lot-source.png
?? assets/sprites/source-sprites-inspection.png
?? docs/v21c/after/no-preference-fight-0-background-crop.png
?? docs/v21c/after/no-preference-fight-0-road-crop.png
?? docs/v21c/after/no-preference-fight-0.png
?? docs/v21c/after/no-preference-fight-1-background-crop.png
?? docs/v21c/after/no-preference-fight-1-background-diff.png
?? docs/v21c/after/no-preference-fight-1-road-crop.png
?? docs/v21c/after/no-preference-fight-1-road-diff.png
?? docs/v21c/after/no-preference-fight-1.png
?? docs/v21c/after/no-preference-fight-2-background-crop.png
?? docs/v21c/after/no-preference-fight-2-background-diff.png
?? docs/v21c/after/no-preference-fight-2-road-crop.png
?? docs/v21c/after/no-preference-fight-2-road-diff.png
?? docs/v21c/after/no-preference-fight-2.png
?? docs/v21c/after/no-preference-intro-0-background-crop.png
?? docs/v21c/after/no-preference-intro-0-road-crop.png
?? docs/v21c/after/no-preference-intro-0.png
?? docs/v21c/after/no-preference-intro-1-background-crop.png
?? docs/v21c/after/no-preference-intro-1-background-diff.png
?? docs/v21c/after/no-preference-intro-1-road-crop.png
?? docs/v21c/after/no-preference-intro-1-road-diff.png
?? docs/v21c/after/no-preference-intro-1.png
?? docs/v21c/after/no-preference-intro-2-background-crop.png
?? docs/v21c/after/no-preference-intro-2-background-diff.png
?? docs/v21c/after/no-preference-intro-2-road-crop.png
?? docs/v21c/after/no-preference-intro-2-road-diff.png
?? docs/v21c/after/no-preference-intro-2.png
?? docs/v21c/after/no-preference-road-0-background-crop.png
?? docs/v21c/after/no-preference-road-0-road-crop.png
?? docs/v21c/after/no-preference-road-0.png
?? docs/v21c/after/no-preference-road-1-background-crop.png
?? docs/v21c/after/no-preference-road-1-background-diff.png
?? docs/v21c/after/no-preference-road-1-road-crop.png
?? docs/v21c/after/no-preference-road-1-road-diff.png
?? docs/v21c/after/no-preference-road-1.png
?? docs/v21c/after/no-preference-road-2-background-crop.png
?? docs/v21c/after/no-preference-road-2-background-diff.png
?? docs/v21c/after/no-preference-road-2-road-crop.png
?? docs/v21c/after/no-preference-road-2-road-diff.png
?? docs/v21c/after/no-preference-road-2.png
?? docs/v21c/after/pixel-measurements.json
?? docs/v21c/after/reduce-fight-0-background-crop.png
?? docs/v21c/after/reduce-fight-0-road-crop.png
?? docs/v21c/after/reduce-fight-0.png
?? docs/v21c/after/reduce-fight-1-background-crop.png
?? docs/v21c/after/reduce-fight-1-background-diff.png
?? docs/v21c/after/reduce-fight-1-road-crop.png
?? docs/v21c/after/reduce-fight-1-road-diff.png
?? docs/v21c/after/reduce-fight-1.png
?? docs/v21c/after/reduce-fight-2-background-crop.png
?? docs/v21c/after/reduce-fight-2-background-diff.png
?? docs/v21c/after/reduce-fight-2-road-crop.png
?? docs/v21c/after/reduce-fight-2-road-diff.png
?? docs/v21c/after/reduce-fight-2.png
?? docs/v21c/after/reduce-intro-0-background-crop.png
?? docs/v21c/after/reduce-intro-0-road-crop.png
?? docs/v21c/after/reduce-intro-0.png
?? docs/v21c/after/reduce-intro-1-background-crop.png
?? docs/v21c/after/reduce-intro-1-background-diff.png
?? docs/v21c/after/reduce-intro-1-road-crop.png
?? docs/v21c/after/reduce-intro-1-road-diff.png
?? docs/v21c/after/reduce-intro-1.png
?? docs/v21c/after/reduce-intro-2-background-crop.png
?? docs/v21c/after/reduce-intro-2-background-diff.png
?? docs/v21c/after/reduce-intro-2-road-crop.png
?? docs/v21c/after/reduce-intro-2-road-diff.png
?? docs/v21c/after/reduce-intro-2.png
?? docs/v21c/after/reduce-road-0-background-crop.png
?? docs/v21c/after/reduce-road-0-road-crop.png
?? docs/v21c/after/reduce-road-0.png
?? docs/v21c/after/reduce-road-1-background-crop.png
?? docs/v21c/after/reduce-road-1-background-diff.png
?? docs/v21c/after/reduce-road-1-road-crop.png
?? docs/v21c/after/reduce-road-1-road-diff.png
?? docs/v21c/after/reduce-road-1.png
?? docs/v21c/after/reduce-road-2-background-crop.png
?? docs/v21c/after/reduce-road-2-background-diff.png
?? docs/v21c/after/reduce-road-2-road-crop.png
?? docs/v21c/after/reduce-road-2-road-diff.png
?? docs/v21c/after/reduce-road-2.png
?? docs/v21c/after/runtime.json
?? docs/v21c/before/diagnosis.md
?? docs/v21c/before/no-preference-fight-0-background-crop.png
?? docs/v21c/before/no-preference-fight-0-road-crop.png
?? docs/v21c/before/no-preference-fight-0.png
?? docs/v21c/before/no-preference-fight-1-background-crop.png
?? docs/v21c/before/no-preference-fight-1-background-diff.png
?? docs/v21c/before/no-preference-fight-1-road-crop.png
?? docs/v21c/before/no-preference-fight-1-road-diff.png
?? docs/v21c/before/no-preference-fight-1.png
?? docs/v21c/before/no-preference-fight-2-background-crop.png
?? docs/v21c/before/no-preference-fight-2-background-diff.png
?? docs/v21c/before/no-preference-fight-2-road-crop.png
?? docs/v21c/before/no-preference-fight-2-road-diff.png
?? docs/v21c/before/no-preference-fight-2.png
?? docs/v21c/before/no-preference-intro-0-background-crop.png
?? docs/v21c/before/no-preference-intro-0-road-crop.png
?? docs/v21c/before/no-preference-intro-0.png
?? docs/v21c/before/no-preference-intro-1-background-crop.png
?? docs/v21c/before/no-preference-intro-1-background-diff.png
?? docs/v21c/before/no-preference-intro-1-road-crop.png
?? docs/v21c/before/no-preference-intro-1-road-diff.png
?? docs/v21c/before/no-preference-intro-1.png
?? docs/v21c/before/no-preference-intro-2-background-crop.png
?? docs/v21c/before/no-preference-intro-2-background-diff.png
?? docs/v21c/before/no-preference-intro-2-road-crop.png
?? docs/v21c/before/no-preference-intro-2-road-diff.png
?? docs/v21c/before/no-preference-intro-2.png
?? docs/v21c/before/no-preference-road-0-background-crop.png
?? docs/v21c/before/no-preference-road-0-road-crop.png
?? docs/v21c/before/no-preference-road-0.png
?? docs/v21c/before/no-preference-road-1-background-crop.png
?? docs/v21c/before/no-preference-road-1-background-diff.png
?? docs/v21c/before/no-preference-road-1-road-crop.png
?? docs/v21c/before/no-preference-road-1-road-diff.png
?? docs/v21c/before/no-preference-road-1.png
?? docs/v21c/before/no-preference-road-2-background-crop.png
?? docs/v21c/before/no-preference-road-2-background-diff.png
?? docs/v21c/before/no-preference-road-2-road-crop.png
?? docs/v21c/before/no-preference-road-2-road-diff.png
?? docs/v21c/before/no-preference-road-2.png
?? docs/v21c/before/pixel-measurements.json
?? docs/v21c/before/reduce-fight-0-background-crop.png
?? docs/v21c/before/reduce-fight-0-road-crop.png
?? docs/v21c/before/reduce-fight-0.png
?? docs/v21c/before/reduce-fight-1-background-crop.png
?? docs/v21c/before/reduce-fight-1-background-diff.png
?? docs/v21c/before/reduce-fight-1-road-crop.png
?? docs/v21c/before/reduce-fight-1-road-diff.png
?? docs/v21c/before/reduce-fight-1.png
?? docs/v21c/before/reduce-fight-2-background-crop.png
?? docs/v21c/before/reduce-fight-2-background-diff.png
?? docs/v21c/before/reduce-fight-2-road-crop.png
?? docs/v21c/before/reduce-fight-2-road-diff.png
?? docs/v21c/before/reduce-fight-2.png
?? docs/v21c/before/reduce-intro-0-background-crop.png
?? docs/v21c/before/reduce-intro-0-road-crop.png
?? docs/v21c/before/reduce-intro-0.png
?? docs/v21c/before/reduce-intro-1-background-crop.png
?? docs/v21c/before/reduce-intro-1-background-diff.png
?? docs/v21c/before/reduce-intro-1-road-crop.png
?? docs/v21c/before/reduce-intro-1-road-diff.png
?? docs/v21c/before/reduce-intro-1.png
?? docs/v21c/before/reduce-intro-2-background-crop.png
?? docs/v21c/before/reduce-intro-2-background-diff.png
?? docs/v21c/before/reduce-intro-2-road-crop.png
?? docs/v21c/before/reduce-intro-2-road-diff.png
?? docs/v21c/before/reduce-intro-2.png
?? docs/v21c/before/reduce-road-0-background-crop.png
?? docs/v21c/before/reduce-road-0-road-crop.png
?? docs/v21c/before/reduce-road-0.png
?? docs/v21c/before/reduce-road-1-background-crop.png
?? docs/v21c/before/reduce-road-1-background-diff.png
?? docs/v21c/before/reduce-road-1-road-crop.png
?? docs/v21c/before/reduce-road-1-road-diff.png
?? docs/v21c/before/reduce-road-1.png
?? docs/v21c/before/reduce-road-2-background-crop.png
?? docs/v21c/before/reduce-road-2-background-diff.png
?? docs/v21c/before/reduce-road-2-road-crop.png
?? docs/v21c/before/reduce-road-2-road-diff.png
?? docs/v21c/before/reduce-road-2.png
?? docs/v21c/before/runtime.json
?? docs/v21d/after/arena-and-wrap-runtime.json
?? docs/v21d/after/arena-death-replay-496.png
?? docs/v21d/after/arena-death-replay-first.png
?? docs/v21d/after/arena-death-setup.png
?? docs/v21d/after/arena-no-preference-fight-0.png
?? docs/v21d/after/arena-no-preference-fight-496.png
?? docs/v21d/after/arena-no-preference-first.png
?? docs/v21d/after/arena-reduce-fight-0.png
?? docs/v21d/after/arena-reduce-fight-496.png
?? docs/v21d/after/arena-reduce-first.png
?? docs/v21d/after/debug-first.png
?? docs/v21d/after/fresh-start-496.png
?? docs/v21d/after/fresh-start-992.png
?? docs/v21d/after/fresh-start-first.png
?? docs/v21d/after/mobile-reduced-file-496.png
?? docs/v21d/after/mobile-reduced-file-992.png
?? docs/v21d/after/mobile-reduced-file-first.png
?? docs/v21d/after/natural-death-replay-496.png
?? docs/v21d/after/natural-death-replay-first.png
?? docs/v21d/after/progression-setup.png
?? docs/v21d/after/progression-theme-8.png
?? docs/v21d/after/progression.json
?? docs/v21d/after/replay-setup.png
?? docs/v21d/after/returning-start-496.png
?? docs/v21d/after/returning-start-992.png
?? docs/v21d/after/returning-start-first.png
?? docs/v21d/after/runtime.json
?? docs/v21d/after/vehicle-wrap-cycle-desktop.png
?? docs/v21d/after/wrap-edges.json
?? docs/v21d/after/wrap-fixture-start.png
?? docs/v21d/after/wrap-left-after.png
?? docs/v21d/after/wrap-left-before.png
?? docs/v21d/after/wrap-probe.json
?? docs/v21d/before/fresh-start-496.png
?? docs/v21d/before/fresh-start-992.png
?? docs/v21d/before/fresh-start-first.png
?? docs/v21d/before/returning-start-496.png
?? docs/v21d/before/returning-start-992.png
?? docs/v21d/before/returning-start-first.png
?? docs/v21d/before/runtime.json
?? docs/v21e/after/no-preference-00.png
?? docs/v21e/after/no-preference-01.png
?? docs/v21e/after/no-preference-02.png
?? docs/v21e/after/no-preference-03.png
?? docs/v21e/after/no-preference-04.png
?? docs/v21e/after/no-preference-05.png
?? docs/v21e/after/no-preference-06.png
?? docs/v21e/after/no-preference-07.png
?? docs/v21e/after/no-preference-08.png
?? docs/v21e/after/no-preference-09.png
?? docs/v21e/after/no-preference-10.png
?? docs/v21e/after/no-preference-11.png
?? docs/v21e/after/no-preference-12.png
?? docs/v21e/after/no-preference-13.png
?? docs/v21e/after/no-preference-14.png
?? docs/v21e/after/no-preference-15.png
?? docs/v21e/after/no-preference-16.png
?? docs/v21e/after/no-preference-17.png
?? docs/v21e/after/no-preference-18.png
?? docs/v21e/after/no-preference-19.png
?? docs/v21e/after/no-preference-20.png
?? docs/v21e/after/no-preference-bird-a-masked.png
?? docs/v21e/after/no-preference-bird-b-masked.png
?? docs/v21e/after/no-preference-bird-diff.png
?? docs/v21e/after/no-preference-bird-source-0.png
?? docs/v21e/after/no-preference-bird-source-1.png
?? docs/v21e/after/no-preference-bird-source-2.png
?? docs/v21e/after/no-preference-bird-source-3.png
?? docs/v21e/after/no-preference-cart-a-masked.png
?? docs/v21e/after/no-preference-cart-b-masked.png
?? docs/v21e/after/no-preference-cart-diff.png
?? docs/v21e/after/no-preference-cart-source-0.png
?? docs/v21e/after/no-preference-cart-source-1.png
?? docs/v21e/after/no-preference-cart-source-2.png
?? docs/v21e/after/no-preference-cart-source-3.png
?? docs/v21e/after/no-preference-coin-a-masked.png
?? docs/v21e/after/no-preference-coin-b-masked.png
?? docs/v21e/after/no-preference-coin-diff.png
?? docs/v21e/after/no-preference-coin-source-0.png
?? docs/v21e/after/no-preference-coin-source-1.png
?? docs/v21e/after/no-preference-coin-source-2.png
?? docs/v21e/after/no-preference-coin-source-3.png
?? docs/v21e/after/no-preference-coin-source-4.png
?? docs/v21e/after/no-preference-coin-source-5.png
?? docs/v21e/after/no-preference-drone-a-masked.png
?? docs/v21e/after/no-preference-drone-b-masked.png
?? docs/v21e/after/no-preference-drone-diff.png
?? docs/v21e/after/no-preference-drone-source-0.png
?? docs/v21e/after/no-preference-drone-source-1.png
?? docs/v21e/after/no-preference-drone-source-2.png
?? docs/v21e/after/no-preference-drone-source-3.png
?? docs/v21e/after/no-preference-normal-start.png
?? docs/v21e/after/pixels.json
?? docs/v21e/after/reduce-00.png
?? docs/v21e/after/reduce-01.png
?? docs/v21e/after/reduce-02.png
?? docs/v21e/after/reduce-03.png
?? docs/v21e/after/reduce-04.png
?? docs/v21e/after/reduce-05.png
?? docs/v21e/after/reduce-06.png
?? docs/v21e/after/reduce-07.png
?? docs/v21e/after/reduce-08.png
?? docs/v21e/after/reduce-09.png
?? docs/v21e/after/reduce-10.png
?? docs/v21e/after/reduce-11.png
?? docs/v21e/after/reduce-12.png
?? docs/v21e/after/reduce-13.png
?? docs/v21e/after/reduce-14.png
?? docs/v21e/after/reduce-15.png
?? docs/v21e/after/reduce-16.png
?? docs/v21e/after/reduce-17.png
?? docs/v21e/after/reduce-18.png
?? docs/v21e/after/reduce-19.png
?? docs/v21e/after/reduce-20.png
?? docs/v21e/after/reduce-bird-a-masked.png
?? docs/v21e/after/reduce-bird-b-masked.png
?? docs/v21e/after/reduce-bird-diff.png
?? docs/v21e/after/reduce-bird-source-0.png
?? docs/v21e/after/reduce-cart-a-masked.png
?? docs/v21e/after/reduce-cart-b-masked.png
?? docs/v21e/after/reduce-cart-diff.png
?? docs/v21e/after/reduce-cart-source-0.png
?? docs/v21e/after/reduce-coin-a-masked.png
?? docs/v21e/after/reduce-coin-b-masked.png
?? docs/v21e/after/reduce-coin-diff.png
?? docs/v21e/after/reduce-coin-source-0.png
?? docs/v21e/after/reduce-drone-a-masked.png
?? docs/v21e/after/reduce-drone-b-masked.png
?? docs/v21e/after/reduce-drone-diff.png
?? docs/v21e/after/reduce-drone-source-0.png
?? docs/v21e/after/reduce-normal-start.png
?? docs/v21e/after/runtime.json
?? docs/v21e/before/no-preference-00.png
?? docs/v21e/before/no-preference-01.png
?? docs/v21e/before/no-preference-02.png
?? docs/v21e/before/no-preference-03.png
?? docs/v21e/before/no-preference-04.png
?? docs/v21e/before/no-preference-05.png
?? docs/v21e/before/no-preference-06.png
?? docs/v21e/before/no-preference-07.png
?? docs/v21e/before/no-preference-08.png
?? docs/v21e/before/no-preference-09.png
?? docs/v21e/before/no-preference-10.png
?? docs/v21e/before/no-preference-11.png
?? docs/v21e/before/no-preference-12.png
?? docs/v21e/before/no-preference-13.png
?? docs/v21e/before/no-preference-14.png
?? docs/v21e/before/no-preference-15.png
?? docs/v21e/before/no-preference-16.png
?? docs/v21e/before/no-preference-17.png
?? docs/v21e/before/no-preference-18.png
?? docs/v21e/before/no-preference-19.png
?? docs/v21e/before/no-preference-20.png
?? docs/v21e/before/no-preference-bird-a-masked.png
?? docs/v21e/before/no-preference-bird-b-masked.png
?? docs/v21e/before/no-preference-bird-diff.png
?? docs/v21e/before/no-preference-bird-source-0.png
?? docs/v21e/before/no-preference-bird-source-1.png
?? docs/v21e/before/no-preference-bird-source-2.png
?? docs/v21e/before/no-preference-bird-source-3.png
?? docs/v21e/before/no-preference-cart-a-masked.png
?? docs/v21e/before/no-preference-cart-b-masked.png
?? docs/v21e/before/no-preference-cart-diff.png
?? docs/v21e/before/no-preference-cart-source-0.png
?? docs/v21e/before/no-preference-cart-source-1.png
?? docs/v21e/before/no-preference-cart-source-2.png
?? docs/v21e/before/no-preference-cart-source-3.png
?? docs/v21e/before/no-preference-coin-a-masked.png
?? docs/v21e/before/no-preference-coin-b-masked.png
?? docs/v21e/before/no-preference-coin-diff.png
?? docs/v21e/before/no-preference-coin-source-0.png
?? docs/v21e/before/no-preference-coin-source-1.png
?? docs/v21e/before/no-preference-coin-source-2.png
?? docs/v21e/before/no-preference-coin-source-3.png
?? docs/v21e/before/no-preference-coin-source-4.png
?? docs/v21e/before/no-preference-coin-source-5.png
?? docs/v21e/before/no-preference-drone-a-masked.png
?? docs/v21e/before/no-preference-drone-b-masked.png
?? docs/v21e/before/no-preference-drone-diff.png
?? docs/v21e/before/no-preference-drone-source-0.png
?? docs/v21e/before/no-preference-drone-source-1.png
?? docs/v21e/before/no-preference-drone-source-2.png
?? docs/v21e/before/no-preference-drone-source-3.png
?? docs/v21e/before/no-preference-normal-start.png
?? docs/v21e/before/pixels.json
?? docs/v21e/before/reduce-00.png
?? docs/v21e/before/reduce-01.png
?? docs/v21e/before/reduce-02.png
?? docs/v21e/before/reduce-03.png
?? docs/v21e/before/reduce-04.png
?? docs/v21e/before/reduce-05.png
?? docs/v21e/before/reduce-06.png
?? docs/v21e/before/reduce-07.png
?? docs/v21e/before/reduce-08.png
?? docs/v21e/before/reduce-09.png
?? docs/v21e/before/reduce-10.png
?? docs/v21e/before/reduce-11.png
?? docs/v21e/before/reduce-12.png
?? docs/v21e/before/reduce-13.png
?? docs/v21e/before/reduce-14.png
?? docs/v21e/before/reduce-15.png
?? docs/v21e/before/reduce-16.png
?? docs/v21e/before/reduce-17.png
?? docs/v21e/before/reduce-18.png
?? docs/v21e/before/reduce-19.png
?? docs/v21e/before/reduce-20.png
?? docs/v21e/before/reduce-bird-a-masked.png
?? docs/v21e/before/reduce-bird-b-masked.png
?? docs/v21e/before/reduce-bird-diff.png
?? docs/v21e/before/reduce-bird-source-0.png
?? docs/v21e/before/reduce-cart-a-masked.png
?? docs/v21e/before/reduce-cart-b-masked.png
?? docs/v21e/before/reduce-cart-diff.png
?? docs/v21e/before/reduce-cart-source-0.png
?? docs/v21e/before/reduce-coin-a-masked.png
?? docs/v21e/before/reduce-coin-b-masked.png
?? docs/v21e/before/reduce-coin-diff.png
?? docs/v21e/before/reduce-coin-source-0.png
?? docs/v21e/before/reduce-drone-a-masked.png
?? docs/v21e/before/reduce-drone-b-masked.png
?? docs/v21e/before/reduce-drone-diff.png
?? docs/v21e/before/reduce-drone-source-0.png
?? docs/v21e/before/reduce-normal-start.png
?? docs/v21e/before/runtime.json
?? docs/v21e/file-smoke/no-preference-00.png
?? docs/v21e/file-smoke/no-preference-01.png
?? docs/v21e/file-smoke/no-preference-02.png
?? docs/v21e/file-smoke/no-preference-bird-source-0.png
?? docs/v21e/file-smoke/no-preference-bird-source-1.png
?? docs/v21e/file-smoke/no-preference-cart-source-0.png
?? docs/v21e/file-smoke/no-preference-cart-source-1.png
?? docs/v21e/file-smoke/no-preference-coin-source-0.png
?? docs/v21e/file-smoke/no-preference-coin-source-1.png
?? docs/v21e/file-smoke/no-preference-drone-source-0.png
?? docs/v21e/file-smoke/no-preference-drone-source-1.png
?? docs/v21e/file-smoke/no-preference-normal-start.png
?? docs/v21e/file-smoke/runtime.json
?? docs/v21e/regressions/after/arena-and-wrap-runtime.json
?? docs/v21e/regressions/after/arena-no-preference-fight-0.png
?? docs/v21e/regressions/after/arena-no-preference-fight-496.png
?? docs/v21e/regressions/after/arena-no-preference-first.png
?? docs/v21e/regressions/after/arena-reduce-fight-0.png
?? docs/v21e/regressions/after/arena-reduce-fight-496.png
?? docs/v21e/regressions/after/arena-reduce-first.png
?? docs/v21e/regressions/after/wrap-edges.json
?? docs/v21e/regressions/after/wrap-fixture-start.png
?? docs/v21e/regressions/after/wrap-left-after.png
?? docs/v21e/regressions/after/wrap-left-before.png
?? docs/v21e/regressions/flow/after/arena-death-replay-496.png
?? docs/v21e/regressions/flow/after/arena-death-replay-first.png
?? docs/v21e/regressions/flow/after/arena-death-setup.png
?? docs/v21e/regressions/flow/after/debug-first.png
?? docs/v21e/regressions/flow/after/fresh-start-496.png
?? docs/v21e/regressions/flow/after/fresh-start-992.png
?? docs/v21e/regressions/flow/after/fresh-start-first.png
?? docs/v21e/regressions/flow/after/mobile-reduced-file-496.png
?? docs/v21e/regressions/flow/after/mobile-reduced-file-992.png
?? docs/v21e/regressions/flow/after/mobile-reduced-file-first.png
?? docs/v21e/regressions/flow/after/natural-death-replay-496.png
?? docs/v21e/regressions/flow/after/natural-death-replay-first.png
?? docs/v21e/regressions/flow/after/progression-setup.png
?? docs/v21e/regressions/flow/after/progression-theme-8.png
?? docs/v21e/regressions/flow/after/progression.json
?? docs/v21e/regressions/flow/after/replay-setup.png
?? docs/v21e/regressions/flow/after/returning-start-496.png
?? docs/v21e/regressions/flow/after/returning-start-992.png
?? docs/v21e/regressions/flow/after/returning-start-first.png
?? docs/v21e/regressions/flow/after/runtime.json
?? docs/v21e/regressions/flow/after/vehicle-wrap-cycle-desktop.png
?? docs/v21e/regressions/flow/after/wrap-probe.json
?? game_assets/cabinet-art.js
?? tests/cabinet.test.mjs
~~~~

Job 1 DONE. Pre-edit cabinet.css 279–286 applied the same eased travel in both directions and had no Fire hover rule. Pre-edit cabinet.js 144–170 cleared the only held attribute on release, so taps could disappear before paint. The old lever in cabinet.css 306–312 had no hover highlight and retained its travel in reduced motion. Changed cabinet.js, cabinet.css and tests/cabinet.test.mjs. Edge confirmed Fire and lever hit targets, desktop hover and press, Space and Enter, normal and reduced feedback, touch hold and cancel at 390 px, immediate gameplay release and one shot. Job 2 IN PROGRESS. No commit, push or deployment.

Job 2 DONE (local-only). Fontshare's official catalogue confirmed the Array/Khand pairing, and the official archives supplied the two unmodified Regular WOFF2 files. Array's ITF Free Font License 2.0 permits commercial use and self-hosting and restricts redistribution through repositories. Khand's SIL OFL 1.1 allows redistribution with the notice. The requested local-only mode excludes both WOFF2 binaries in .git/info/exclude. Khand's notice is preserved. See docs/FONTS.md for downloads, terms, setup, and intentional typography exceptions. Runtime fonts use relative URLs, and the Phaser text helper refreshes objects once if a face finishes loading late.

Final verification DONE. Baseline 17/17 and final 18/18 with node --test tests/boss-arena.test.mjs tests/cabinet.test.mjs leaderboard-worker/worker.test.mjs. Node syntax checks passed for cabinet.js, game.js, and boss-arena.js. python tools/embed-assets.py --cabinet-only regenerated identical output. git diff --check passed. Edge local HTTP at 1440 × 900 and 390 × 844 verified the controls and font usage. Desktop file launch loaded both fonts. An intentionally blocked font route demonstrated system fallback and playable Start. The board was mocked. The baseline leaderboard URL was already configured and stayed byte-for-byte as found. Physical phone and hosted verification were outside these checks.

v22b edited arcade.css, boss-arena.js, cabinet.css, cabinet.js, game.js, index.html, synthwave.css, tests/cabinet.test.mjs and RESUME.md. Added docs/FONTS.md and assets/fonts/Khand-OFL.txt. Local-only inputs are assets/fonts/Array-Regular.woff2, assets/fonts/Khand-Regular.woff2 and the project-local Git exclude entry. The previous dirty files and untracked art remain. No staged files, commits, pushes, deployment, or new dependencies. Next safe action is review the unstaged work and copy the local fonts from Fontshare on any other development machine.

## RV Dash v22c checkpoints

Baseline: branch rv-dash-repair, HEAD fa85b862ea7042d2f92a31300b5e1896e112cea7, no staged files. The exact pre-edit inventory is in docs/v22c/baseline-git.txt. All 18 baseline tests passed. Edge pointer Start and road advancement passed at 1440 × 900 and 1366 × 768. Both sizes displayed a 329.656 × 439.531 CSS px canvas and 714 × 358.375 deck, with the deck starting at y=1306.375. The fixed 600 × 800 Phaser coordinate system is protected. No staging, commit, push or deployment.

Job 1: Desktop layout and controls verified at both requested sizes. The existing frame is cropped to the marquee above a 4:3 surround, with the original proportional portrait canvas inside and the panel print behind the inline deck. Both desktop layouts showed the complete marquee, field and deck with no page scrolling. The 390 × 844 touch layout has no horizontal overflow. Simultaneous mobile Fire and lever presses and cancellation passed. Art fallback and final screenshots are part of the final Edge audit.

Job 2: Removed only the yellow pre-launch lane outline and directional marks from BossArena.paint (previously boss-arena.js 450–458), shared across plan and follow-up attacks. It appeared at full-opacity yellow during the scheduled wind-up (1500 ms for a normal plan). Boss poses, status, attack selection, timers, sounds, hitboxes and projectile rendering remain in their existing paths. Added the focused render-command and launch test. Browser wind-up capture is part of the final Edge audit.

Job 3: Satoshi Regular and true Bold are installed locally and excluded by exact paths. Array remains the display face. CSS tokens now feed Phaser and the required DOM sizes were measured at both desktop widths. The font source, license and local setup are in docs/FONTS.md. Final effective canvas and blocked-font measurements are part of the Edge audit.

Job 4 DONE. Edge verified full desktop play at 1440 × 900 and 1366 × 768, both with zero page overflow. The playing canvases measured 431.44 × 575.25 and 332.44 × 443.25 CSS px, up from 329.66 × 439.53 at baseline. The 4:3 desktop surrounds measured 783.02 × 587.27 and 607.02 × 455.27, and both decks began 5 px below the surround. At 390 × 844, the 330 × 440 canvas fit the viewport width and the page scrolled vertically to reach the whole deck. Normal Fire and lever hover/hold/return, off-target release, the brief Fire visual latch, mobile simultaneous hold/cancel, reduced-motion feedback, and pointer hit testing passed. A rendered Lowballer wind-up capture showed the retained status without the lane guide, and a rendered projectile followed. A browser-only test slot swapped to an alternate theme and fallback marquee/deck, then RV Dash restored the embedded art. The actual non-RV slots remain locked. Desktop file launch, blocked-font fallback, and actual local Regular and Bold glyph rendering passed. Measured mounted DOM HUD/menu/result/board text is 16 px, deck and utility buttons 15 px, gameplay banner about 25.17/19.39 px and score popup 21.57/16.62 px at the two desktop widths. No unexpected browser errors or live Worker requests.

Final tests: 19 passed, zero failures, skips or cancellations. Cabinet-only embed matched the previous SHA-256. Evidence and runtime measurements are in docs/v22c. The only new entries relative to the Git inventory are verification files under docs/v22c plus the ignored local font files and exact local excludes. The v22c edits within previous paths are RESUME.md, docs/FONTS.md, arcade.css, synthwave.css, cabinet.css, cabinet.js, index.html, game.js, boss-arena.js and the two focused test files. No Worker configuration or endpoint change. No staged files, commit, push or deployment. Ready for Jay's local playtest. Physical phone and hosted browser verification remain open.

## RV Dash v22d checkpoint

Repository C:/Games/mini-games/rv-dash, origin Lackofvoice/mini-games, branch rv-dash-repair, HEAD fa85b862ea7042d2f92a31300b5e1896e112cea7. The complete starting porcelain inventory is docs/v22d/baseline-git.txt. Baseline had 19 passing Node tests and no staged files. Edge baseline captures show the cropped marquee, dark side voids and internal rail overflow.

Implemented the day-glow presentation across arcade.css, cabinet.css and synthwave.css, with exact CSS-only outer button travel and shadow. The native button/link semantics remain and the deck keeps its existing held and lever feedback. The console shows a proportionally fitted portrait canvas, fully contained marquee art, illuminated side trim and connected deck. The right rail prioritizes active results and leaderboard and uses a native Track guide disclosure. The browser Fullscreen API is still the sole controller. index.html and cabinet.js add the once-per-tab invitation, windowed result nudge and fullscreen-only presentation, with the existing store selectors retained in the result. Fullscreen cosmetics are scoped to main:fullscreen. A future approved cosmetic treatment can use that selector. No perk was added.

Final Node command: node --test tests/boss-arena.test.mjs tests/cabinet.test.mjs leaderboard-worker/worker.test.mjs. It passed 20/20 with zero failures, skips or cancellations. The new test checks once-per-tab and blocked-storage behavior. Browser verification used node docs/v22d/edge-verification.mjs. See docs/v22d/browser-results.txt and docs/v22d/measurements.json for the actual output. At 1366x768 and 1440x900 there was no document scroll, and the closed rail's scroll size matched its client size. The canvases were 320.11x426.81 and 419.11x558.81 CSS px. The full marquee uses slightly more height than v22c. At 390x844 the canvas was 328x437.33, with only vertical page scrolling. Expanded guide and board do not shift the cabinet outside the desktop viewport.

Edge passed Tab focus, native Enter/Space and guide disclosure, hover, exact preview press, disabled and reduced-motion buttons, touch Fire and Flight Hold, outside release, and representative text contrast from 4.83:1 to 13.29:1. One controlled run went through natural hits and game over at score 63, followed by Play Again. The fullscreen invitation entered through a user gesture, stayed dismissed across reload, and passed resize, menu and result store strips, exit via the button, and forced rejection. Headless Escape did not exit browser fullscreen. The live headed v22d Escape check remains open. Game Select swapped art using a browser-only fixture. Missing art and desktop file launch passed. No live Worker requests were made. The existing endpoint was already configured, contrary to the brief's description, so it was preserved. The disabled endpoint path was verified using an empty-URL browser fixture and exposed no submission form.

Evidence is under docs/v22d, including both desktop layouts, mobile, fullscreen menu/play/result, and closeups of the marquee, side-fill/deck, rail, and button rest and press. v22d edited arcade.css, cabinet.css, synthwave.css, index.html, cabinet.js, tests/cabinet.test.mjs and this checkpoint. Gameplay and Worker files were untouched by this pass. Array and Satoshi remain ignored local files. git diff --check passed and the index remains empty. No staging, commit, push or deployment. Next action: use the local fullscreen invitation in a headed browser, press native Escape and confirm windowed controls and lighting return. Review the fullscreen presentation before authorizing further design work.

## RV Dash v22e checkpoint

Baseline: C:/Games/mini-games/rv-dash, origin Lackofvoice/mini-games, branch rv-dash-repair, HEAD fa85b862ea7042d2f92a31300b5e1896e112cea7. Empty index, 20/20 Node tests. Exact status in docs/v22e/baseline-git.txt. Existing v22d browser evidence supplies the pre-edit viewport measurements. The v22d 13% page-scene opacity is the confirmed artwork visibility regression. The nine-texture canvas cycle remained intact. The 400 ms outer button press intentionally superseded v22b's short spring; the lever's knob feedback and Fire's short latch remain.

Job 1. Restored full-viewport scene coverage and applied separate CSS grading. Scene selection and its existing theme texture contract are reused. Browser tests reached all nine actual canvas textures and the tenth wrapped to the first. A synthetic game slot tested the matching scene, marquee and deck fallback paths.

Jobs 2–3. Added shared decorative beams and purple haze beneath the cabinet, with fixed clipping, reduced-motion stills and two beams plus two smoke spans on phones. Desktop uses six beams and four visible smoke spans after the first performance sample. Reference durations remain 4/5.5 seconds for beams and 9 seconds for smoke.

Jobs 4–5. Built a wide backlit Array sign and mirrored CSS side art. Pixel uses printed bands and stepped silhouettes. Realistic uses shaded surfaces, reflections and softer light. The same root attribute controls both finishes and the measured bounds match.

Job 6. Added label spans and a CSS-only stepped glitch while leaving the exact outer press constants in v22d CSS. The sound, pause, auto-fire and fullscreen text updates preserve the wrappers. The icon-only stick retains its accessible name and has no text to animate. Node coverage now includes decorative markup and labels.

Job 7. Replaced the 440 px contained print with a full-width proportional crop. The desktop grid follows the printed button columns; the mobile grid preserves touch target spacing. Both styles use the same source and hit geometry.

Job 8. Artwork, smoke and lasers are inside the fullscreen element’s stacking context. Both styles were exercised in Edge at 1366x768, 1440x900 and emulated 390x844, including native Fullscreen API entry and button exit. Headed native Escape remains outstanding. No fullscreen perk was added. Final performance figures and exact test results follow the final browser rerun.

Changes stay unstaged. No commit, push or deployment. Keep the pre-existing endpoint and fonts as found. Local style switching and matching evidence are in docs/v22e/ART-STYLES.md.

Final v22e verification: node --test tests/boss-arena.test.mjs tests/cabinet.test.mjs leaderboard-worker/worker.test.mjs passed 21/21, no failures, skips or cancellations. node docs/v22e/edge-check.mjs passed the windowed and fullscreen matrices with equal bounds across the two styles, field ratio 3:4, no horizontal overflow, and no desktop vertical page scroll. At 390x844, vertical scroll still allows access to the deck and rail. Browser results include Edge focus and hover, exact pressed translation and shadow, disabled and reduced-motion styling, simultaneous touch holds and cancel, theme cycling, live score and store preservation, fixture game switch, file launch, and zero final console exceptions or live Worker requests. Primary, secondary and utility contrast samples had a minimum of 4.83:1.

Headless software Edge sampled 75 frame intervals per finish. At 1440x900 median was 33.3 ms for both, p95 50.0 ms pixel and 33.4 ms realistic. Temporarily hiding smoke and lasers on the same page yielded 16.7 ms median and p95. At 390x844 both finished at 16.7 ms median with p95 within 16.8 ms. These are local browser timing samples. Hardware desktop and physical phone timing remain open. Headed Edge was unavailable in the browser tool, so native Escape was not verified. Button exit passed for both finishes.

Final verification is PARTIAL on native Escape. Jay's finish selection and any fullscreen perk remain pending. Final files changed by v22e: index.html, cabinet.css, cabinet.js, game.js (button label updates only), dayglow-art.css, tests/cabinet.test.mjs, tests/boss-arena.test.mjs (DOM fixture), RESUME.md and docs/v22e evidence. The leaderboard URL was already set in the baseline and the configuration was preserved. git diff --check passed, the index is empty, HEAD is unchanged, and the font files remain excluded. Leave everything unstaged. Do not commit, push or deploy.

## RV Dash v22f checkpoint

Repository C:/Games/mini-games/rv-dash, branch rv-dash-repair, starting HEAD fa85b862ea7042d2f92a31300b5e1896e112cea7. The index was empty. See docs/v22f/baseline-git.txt for the existing dirty paths and evidence directories. The owner-selected realistic finish is preserved. The baseline ran 20 passing tests and one stale assertion that required Pixel as the default. The corrected test accepts either supported finish and the browser confirms the selected Realistic default. Existing v22e evidence remains under docs/v22e.

The v22e .smoke span used four visible desktop puffs, a 16 px blur, and one 9-second rise. The .laser elements used one sweep with two alternating durations. The .side-illustration artwork used mirrored ridges. v22f keeps the existing cabinet geometry and layers denser haze, four timed beam families, and the owner's three twinkle groups with a 29-second comet behind the cabinet. The art group uses scene 0, stars 1, lasers 2, haze 3 within its isolated stacking context. Taggy's original idle and walk art, a Price Right RV lot and an RV Dash road make up distinct side panels. cabinet.js selectArt sets the game ID on the cabinet screen so .rv-panel follows Game Select.

BossArena.moveThreats compares health across the existing hitObstacle call and checks that the source arena still exists before requesting a taunt. Sprite frames use the arena clock, with a 750 ms window and a 2000 ms per-instance cooldown. BossArena.paint keeps existing pose priority and bounds. Missing sheets render a visual-only scale-pop, warm tint and marks. Reduced motion suppresses the cosmetic taunt. A future sheet is assets/sprites/boss-<id>-taunt.png, one transparent 1536x256 PNG containing six contiguous 256x256 frames. Frames 0–2 jeer, 3–5 point. Each displays for 125 ms at the existing feet anchor, scale and pixel-art rendering. Match the existing boss sheet's bounds and transparent margins. The first valid decode is cached. A late sheet applies to the next taunt.

v22f edits index.html, dayglow-art.css, cabinet.js, boss-arena.js, game.js, tests/boss-arena.test.mjs, tests/cabinet.test.mjs and this checkpoint. New verification scripts, JSON, text and browser captures are in docs/v22f. No dependency, leaderboard or production configuration changes. The existing leaderboard URL is configured in this checkout and the browser checks use a fixture. Leave every change unstaged. Do not commit, push, publish or deploy.

Run node --test tests/boss-arena.test.mjs tests/cabinet.test.mjs leaderboard-worker/worker.test.mjs, node docs/v22f/edge-check.mjs, and node docs/v22f/performance.mjs. The browser scripts use the existing local HTTP server at 8765 and headless Edge debugging endpoint at 9326. Native Escape requires headed browser verification. Use the fullscreen control on the local game, press browser-native Escape and confirm the button and cabinet return to windowed state.

Final verification: the Node suite returned exit 0 with 25 passed, zero failures, skips or cancellations. Tests cover damage attribution, per-instance cooldown, reduced motion, late asset selection, optional decode and dimension checks, six registered frames, frame timing and normal pose recovery. The final Edge matrix returned exit 0. Both finishes passed windowed and fullscreen at 1366x768, 1440x900 and emulated 390x844. The wider 1600 px and sub-820 px checks passed. Edge exercised a real Lowballer arena with a deterministic projectile placement, verified the fallback after health loss and observed immunity, pause, recovery, road damage isolation and replay cleanup. The one missing optional Lowballer sheet was expected. No unexpected runtime exceptions or live Worker requests. Both styles passed the synthetic Game Select round trip. Fullscreen button exit passed, with native Escape still unverified in headless Edge.

At the same 1440x900 foreground menu and 2-second warm-up with GPU disabled, the 30-second v22e Realistic sample was 16.8 ms median and 33.4 ms p95 across 1183 intervals. Final v22f was 16.7 ms median and 16.7 ms p95 across 1802 intervals. The 45.1-second observation logged a live comet appearance. See baseline-performance.json and performance.json under docs/v22f. These are local software-rendered samples. The historical v22e 33 ms median is a separate sample. Both notes and captures are unstaged. git diff --check returned exit 0. HEAD remains unchanged.

## RV Dash v22h checkpoint

Working tree on rv-dash-repair at fa85b86. v22g added two page-wide 3:1 banner rows and two outer side columns. The extra tracks pushed the playfield below the initial laptop view and narrowed the console. v22h removes those tracks and fits the four existing PNGs into the inner 60 px sign, the two existing inserts, and the real deck. The sidebar remains outside the cabinet. Files edited this pass are index.html, cabinet.css, and RESUME.md. The presentation stylesheet uses ?v=22h. Earlier working changes are preserved. Nothing was staged, committed, pushed, or deployed.

The three deck buttons reuse the existing semantic elements, accessibility labels and cabinet.js handlers. Fly/Jump and Fire emit press and release to the game. The existing Fly/Jump handler attempts a jump on the down edge and tracks held flight, while Fire shoots on the down edge and uses the existing held repeat and cooldown. Coin/Start delegates to the currently available Start or Replay on a valid release. The existing input path captures the pointer, handles pointer-up/cancel/lost capture and window blur, and handles keyboard Enter/Space with repeat suppressed for activation. Fly and the distinct physical-style flight lever are separate held sources. The painted stick is scenery. The existing live stick remains separate. Painted button feedback is local shading and an inset highlight. The cropped deck retains source rows 200–500, and the face centers in the 2172 × 724 image are (896,330), (1266,330), (1592,344). The image and controls share the same rectangle. The browser center comparison uses a 1 CSS px tolerance. Below 730 CSS px, the same buttons use their conventional faces and keep accessible scrolling.

Edge windowed initial load, scroll (0,0), CSS pixels. At 1366×768 the console went from 587.91×730 to 938×680.58, and the canvas went from 310.13×413.50 to 320.20×426.94. Deck bottom moved from y=1247.75 to y=756. At 1536×864 the console went from 755×819 to 938×776.58, and the canvas went from 377.91×503.88 to 392.20×522.94. Deck bottom moved from y=1393.42 to y=852. With the new art rules disabled in the browser, the recovered pre-art canvases were 320.11×426.81 and 392.11×522.81 respectively. The two inserts track the canvas edges within 0.02 CSS px at desktop widths. The title keeps the center of the marquee image and crops its top and bottom. The side portraits crop more tightly on the taller desktop layout. The deck crops above and below the painted faces so it stays compact.

The existing Node suite passed 25/25. The local Edge captures cover 1366×768, 1536×864, 1920×1080, emulated 390×844 and 768×1024, and a 683×384 CSS viewport as a 200% reflow proxy. Browser probes cover Start exactly once, Fly/Fire/lever press and release, one emitted projectile, simultaneous touch and cancel, window blur, focused Enter/Space and game key F, the fixture leaderboard, and fullscreen entry/resize/button exit. No runtime exceptions or leaderboard submissions were recorded. Desktop file launch passed. Physical touch hardware, native browser 200% zoom, native Escape from fullscreen, and live leaderboard were outside this verification.

Screenshots, full boxes and test logs are in C:/Users/Jay/.codex/visualizations/2026/11/13/01a1d5a5-6c89-7621-9450-9c63805c59a6/rv-dash-v22h. The before subfolder contains the exact starting copies of the three edited files, Git status, unstaged and staged diffs, and protected-file hashes. To undo only this pass, from C:/Games/mini-games/rv-dash copy before/index.html, before/cabinet.css, and before/RESUME.md over their matching files, provided there have been no later edits to those files. If they have changed again, reverse only the v22h hunks against those backups. Next action is Jay's review of the local page and screenshot captures.

## RV Dash v22i checkpoint

Local branch rv-dash-repair. The four supplied, size-suffixed PNGs are used directly from assets/cabinet. The active RV Dash artwork uses centered, non-repeating contain backgrounds. The marquee retains its 912 × 56 inner surface and the deck retains 620 × 85.625 on desktop. The left and right art layers use 23:50 inside the same full-height inserts. Dark cabinet color fills any unused space. The existing cabinet-rv-dash.json contains geometry only, so the active PNG references are in cabinet.css.

Edited index.html, cabinet.css, cabinet.js, tests/cabinet.test.mjs, and RESUME.md. The deck has four native controls. Steer keeps the same pointer/arrow input, Jump / Fly retains the existing fly source, Fire keeps its hold/cooldown path, and Start switches its text and accessible name to Play Again when the replay control becomes available. The deck follows the existing cabinet button motion and focus styles. Playfield dimensions, gameplay code, fullscreen code, font styling, and the two art finishes were preserved. The local cache queries for cabinet.css and cabinet.js use v22i.

Edge at initial scrollY=0 verified 140 × 54 targets at 1366×768, 1536×864, and 1920×1080. The desktop marquee frame stayed 916×60 and the deck art stayed 620×85.625. Both insert boxes respectively stayed 276.891×426.953, 240.891×522.953, and 159.891×738.953. Their contained artwork measured approximately 196.391×426.922, 240.547×522.922, and 159.891×347.578. On the 390×1000 phone viewport the marquee stayed 346×60, the inserts remained hidden, the deck frame went from 346×105.5 to 342×137, and the new art/control area is 340×132 with 152×48 targets. All buttons are above y=938. At 390×844 the controls still require vertical scroll. This keeps the existing playfield and mobile header sizes.

The Node suite went from 25/25 to 26/26 via node --test tests/boss-arena.test.mjs tests/cabinet.test.mjs leaderboard-worker/worker.test.mjs. Edge decoded and checked contain settings for all four textures, verified Start and Play Again, keyboard Start and steer, simultaneous emulated touch flight/fire and cancellation, fullscreen entry/button exit, Pixel finish and file launch. No runtime exceptions. The 200% browser zoom path and physical touch were not part of this pass. The shorter phone viewport was measured as an additional layout check.

Evidence and pre-edit copies of the five edited files are under C:/Users/Jay/.codex/visualizations/2026/11/13/01a1d5a5-6c89-7621-9450-9c63805c59a6/rv-dash-v22i. The copy of cabinet.test.mjs belongs back under tests/ if restoring. The before and after layout JSON records include all measured playfield and art dimensions. Changes remain local and unstaged. No commit, push, or deployment. Next action is Jay’s local visual review.

## RV Dash v22j checkpoint

Local branch rv-dash-repair. The left and right insert paths in cabinet.css and assets/cabinet/cabinet-rv-dash.json point to the supplied 690×1980 PNGs. Each 23:66 art layer centers and contains the PNG inside the existing dark insert. The old PNGs remain available on disk. Marquee, deck, four HTML controls and gameplay were preserved. index.html bumps the two changed styles to v22j and loads atmosphere.js as a classic deferred script so file launch works.

The atmosphere uses 12 drifting smoke patches on desktop and six below 820 CSS px. The existing four desktop and two small-screen beams keep their locations and colors. Smoke animates only transform and opacity in CSS. One animation-frame loop schedules the six laser patterns, each with 15 steps and a blackout step. Updates are at least 400 ms apart. The strobe uses three 800 ms-spaced peaks on the narrow colored beams. The layer is behind the cabinet and pointer-inert. Hidden tabs pause smoke and stop the laser loop. Reduced motion shows three static patches and steady beams.

Edge windowed slot and art measurements, in CSS px, are the same for left and right. At 1366×768 the slot is 276.891×426.953 and art is 148.781×426.938. At 1536×864 the slot is 240.891×522.953 and art is 182.234×522.922. Those two have side padding only to whole-pixel accuracy. At 1920×1080 the slot is 159.891×738.953 and art is 159.891×458.812, leaving about 140 px of dark padding at each vertical edge. At 390×844 both slots and art are hidden. Insert tops match the playfield and bottoms differ by under 0.02 px.

At 1366×768 headless Edge measured four 10-second sequences of Phaser pre-step intervals while PLAYING. Median/p95 in ms were 16.7/17.9 with both layers display-hidden, 16.7/18.1 with lasers only, 16.7/17.8 with smoke only, and 16.6/18.1 with both visible. Counts were 600, 599, 601 and 598 respectively. The hidden-layer modes remove painting while leaving laser scheduling available. Obstacle damage was bypassed in the timing fixture to keep all samples in play. Browser checks covered PNG decoding, contain fit, count caps, zero horizontal overflow, file launch, Start hit testing, simulated hidden-tab pause, reduced-motion rest state and zero runtime exceptions.

Changed index.html, cabinet.css, dayglow-art.css, assets/cabinet/cabinet-rv-dash.json, and RESUME.md. Added atmosphere.js and tests/atmosphere.test.mjs. The existing suite had 26 tests, and node --test tests/*.test.mjs leaderboard-worker/worker.test.mjs passed 28/28 after adding the two laser tests. git diff --check passed. Evidence is under C:/Users/Jay/.codex/visualizations/2026/11/13/01a1d5a5-6c89-7621-9450-9c63805c59a6/rv-dash-v22j. Work remains local and unstaged. No commit, push, or deployment. Next action is local visual review, especially the 1920×1080 letterboxing.

## RV Dash v22k checkpoint

Terminal state is success on the local rv-dash-repair branch. Game over waits until the leaderboard and initials UI are closed, then begins an idle countdown. Trusted activity resets the countdown. When DEMO_IDLE_MS (8000) elapses, Taggy uses the existing cabinet flight and fire inputs to jump over nearby obstacles, aim vertically during boss encounters and fire on the existing cooldown. A demo crash shows a labeled game over and starts a fresh idle cycle. A trusted key, click or tap returns to the main menu and consumes that interaction. The demo has no leaderboard qualification, best-score write, boss tutorial unlock or live play analytics. The existing leaderboard start/ready hooks isolate stale requests. Hidden tabs reset idle timing and suspend the demo. The first visible frame is skipped to discard a stale delta. Reduced motion keeps the new prompt steady and uses the existing reduced-motion game rendering.

Replay is deferred. Road choices use a seeded generator, but the game consumes variable Phaser deltas in bounded substeps, tap handling depends on performance.now(), and there is no normalized input timeline or deterministic replay contract. Peak recording buffer use was 0 bytes because this version implements no recording. Autopilot can lose and intentionally uses no additional gameplay abilities.

Changed index.html, cabinet.css, game.js, boss-arena.js and RESUME.md. Added demo-mode.js and tests/demo-mode.test.mjs. The boss change only gates tutorial persistence for demo rounds. Baseline working-tree copies, status and diff were saved before edits in the before folder in the evidence directory. The boss file was also already modified by earlier phases. The v22k change to it is limited to the tutorial persistence guard in BossArena.step.

The Node suite passed 31/31 via node --test tests/*.test.mjs leaderboard-worker/worker.test.mjs, up from 28. Desktop and 390×844 emulated-touch Edge checks exercised initial score entry, the eight-second delay and reset, delayed fixture GET and POST responses, live demo movement and firing, the normal crash path with an induced final hit, persistence isolation, repeated cycles, keyboard and deck exits, fresh real play, hidden-tab freeze and resume, touch exit, steady reduced-motion prompt, and file launch. No runtime exceptions. The browser test uses a fixture leaderboard and emulated mobile input.

Comparable v22j and v22k performance samples used the same headless Edge profile at 1366×768, atmosphere enabled, and 10 seconds of Phaser pre-step intervals while PLAYING. The fixture bypassed obstacle damage in both runs. Baseline median/p95 was 16.8/21.2 ms over 561 intervals. Final median/p95 was 16.7/18.0 ms over 599 intervals. The short samples show no regression in this setup.

Evidence is under C:/Users/Jay/.codex/visualizations/2026/11/13/01a1d5a5-6c89-7621-9450-9c63805c59a6/rv-dash-v22k. The browser script and screenshots capture the desktop and touch prompts. For the next local review, start a real run from index.html, let it die, finish or close the board, and leave the screen idle for eight seconds. Let the demo play unattended, then press a key or tap once to return to the main menu. A separate accelerated browser run advanced the normal game in 16 ms frames, with no injected hits or controls. Autopilot reached normal game over at 26.071 simulated seconds with 165 points, zero demo submissions, and the real run count still at one. Physical touch hardware was not tested. No commit, push, or deployment.

## RV Dash v22m checkpoint

Terminal state is success on local rv-dash-repair. Attract uses direct scene entry, with DEMO_SCENES in this order: Level 1 road (Nostalgiawave), Level 3 road (Outrun), Level 2 arena (Dreamwave, The Tire Kicker), then wrap. The two road stages start at their normal distance boundaries, and the boss uses the existing direct arena initialization at the encounter boundary. Rotation survives demo deaths and exits for the loaded cabinet session. Each run resets transient state. The remaining tracks and bosses are outside this deliberately short showcase. No fallback was needed, and recorded replay remains deferred. The boss autopilot uses the existing flight and fire logic and can lose. Nothing about real progression, persistent scores, boss tutorials or the art assets was changed.

Real game over opens the existing leaderboard and initials form in one native modal dialog, including offline and zero-score cases. The top-layer dialog is centered against the visible playfield when it fits and against the visible viewport when the playfield is offscreen or the available height is short. Close remains outside the internal scrolling area. Native modal behavior makes underlying controls inert, Tab cycles inside, Escape dismisses, and focus returns to Play Again after automatic game-over presentation or to the opener after a manual view. Existing qualification and submission rules remain in the existing leaderboard path. An unsubmitted initials draft stays in memory for the same result. Version checks reject responses from dismissed or superseded dialogs. A successful submission refreshes scores inside the current open dialog. Explicit dismissal releases the pending attract state and the existing DEMO_IDLE_MS default of 8000 starts fresh. Repeat dismissals leave the timer alone. No demo opens the modal.

Modified demo-mode.js, game.js, leaderboard.js, cabinet.css, synthwave.css, index.html, tests/demo-mode.test.mjs and RESUME.md. Existing uncommitted changes and art were preserved. Baseline status, affected diff and file backups are in the before folder of the evidence directory.

Baseline 31 and final 32 Node tests passed with node --test tests/*.test.mjs leaderboard-worker/worker.test.mjs. Browser evidence covers 1366×768, 1440×900, 1920×1080, emulated touch at 390×844 and 320×420, and a 390×360 shortened-viewport proxy with initials and Submit visible. Edge exercised focus entry and containment, Escape and touch dismissal, draft restoration, invalid and valid submissions, networking errors, no-score offline dismissal, one full wall-clock countdown, late GET during demo, late POST during a fresh real run, clean rotation and wraparound, hidden tab and reduced-motion behavior, and file launch. Three accelerated, unassisted runs reached game over at approximately 26.1 s, 29.3 s and 7.3 s of simulation respectively. Each advanced the rotation with no board opening, score submission or boss tutorial persistence.

Matched 10-second, 1366×768 headless Edge Phaser pre-step samples with atmosphere enabled and obstacle damage bypassed measured baseline 16.6 ms median and 18.1 ms p95 over 598 intervals. Final was 16.7 ms median and 17.9 ms p95 over 600 intervals. These are short active-gameplay measurements on this machine. Physical touch, the native mobile virtual keyboard and the live service were not exercised.

Evidence is under C:/Users/Jay/.codex/visualizations/2026/11/13/01a1d5a5-6c89-7621-9450-9c63805c59a6/rv-dash-v22m. The next local playtest can complete one real run, enter initials or dismiss the modal, wait eight idle seconds, and leave the cabinet through three demo cycles. Work remains unstaged. No commit, push, publish or deployment.

## RV Dash v22n checkpoint

Terminal state is success on local rv-dash-repair. The read-only side board shows the top five official ranks, initials and scores in the existing right rail. It remains mounted during real and demo play. The board is visible at widths of at least 1000 CSS px and heights of at least 700 CSS px with a fine pointer, matching the existing desktop cabinet layout. Narrow, short or coarse-pointer layouts retain the centered dialog and demo overlay. The side board has no focus targets and does not intercept pointer input.

leaderboard.js owns one authoritative snapshot and deduplicates in-flight GETs. The first cabinet load, opening the existing dialog and confirming a submission use the same load path. Both read-only boards use returned standings and do not insert a local score. A highlight requires the confirmed rank, initials and score to match the displayed row. A confirmed score with a null rank can still show standings without an entry highlight. A failed or stale submission is ineligible. Only a validated successful response accepted by the current open-modal/run guards can arm the current real result. Explicit dismissal is required before demo startup can claim it. Claiming consumes it, and a real replay clears an obsolete token.

A claimed presentation appears once after DEMO_BOARD_DELAY_MS (500) and stays for DEMO_BOARD_HOLD_MS (4500) in active simulation time. Both edges are immediate, including in reduced motion. The existing hidden-tab gate suspends both thresholds. Early exit and game over clear the pending or shown board. Attract rendering performs no network request. When there are no refreshed ranked rows at the show boundary, it skips the presentation and leaves no-ranked-data on the demo element for inspection. The rotation remains Nostalgiawave road, Outrun road, and Dreamwave Tire Kicker. Recorded replay remains deferred.

Changed index.html and cabinet.css for the two read-only views, leaderboard.js for shared data and confirmed-result handoff, demo-mode.js and game.js for one-time active-time timing and cleanup, tests/demo-mode.test.mjs for timing coverage, and RESUME.md for this checkpoint. The existing centered modal keeps its positioning, focus and submission flow. The Worker and protocol remain untouched. Pre-edit copies, status and affected diff are under the before folder in the evidence directory.

Baseline 32 and final 34 Node tests passed with node --test tests/*.test.mjs leaderboard-worker/worker.test.mjs. Edge checked the side board and real modal at 1366×768, 1440×900, 1920×1080, 390×844 and 320×420. The demo board was rendered and inspected at desktop and 390×844. Fixtures verified official refresh/highlight, pending and rejected scores, stale success, Skip, empty and failed reads, early exit, real replay, one-time consumption, a later confirmation, rank-null rendering and no accelerators for hidden time. The real-time browser observation showed at 500.92 active ms and observed removal at 5037.43 ms from demo start, including inspection polling. Keyboard, pointer and emulated touch exits, reduced-motion immediate display and file launch passed. No browser exceptions. Physical mobile and the live service were not exercised.

Matched headless Edge active-play samples at 1366×768 used the atmosphere and the same 10-second Phaser pre-step interval method with obstacle damage bypassed. Before was 16.7 ms median and 18.6 ms p95 across 588 intervals. After was 16.7 ms median and 18.1 ms p95 across 600. This is a short local gameplay comparison.

Evidence is under C:/Users/Jay/.codex/visualizations/2026/11/13/01a1d5a5-6c89-7621-9450-9c63805c59a6/rv-dash-v22n. Next local playtest: finish a qualifying real run, submit initials, close the dialog after confirmation, wait eight idle seconds, and observe the standings appear and disappear on only the first demo. Work remains local and unstaged. No commit, push, publish or deployment.

## RV Dash v22o checkpoint

Terminal state is success for the local patch on rv-dash-repair. The configured Worker is https://rv-dash-leaderboard.jay-62c.workers.dev and requests use /api/leaderboard/rv-dash. The live GET and JSON POST preflight both returned HTTP 403 without Access-Control-Allow-Origin for file origin null and http://127.0.0.1:8766. Edge reported MissingAllowOriginHeader on both GETs. At http://127.0.0.1:8000 Edge read HTTP 200 and four valid official rows. The direct OPTIONS probe on 8000 returned 200 with the exact origin, Content-Type, and GET/POST/OPTIONS allowed. Port 8787 also passed the header probes. No live POST was made. Port 8000 already works for reads without a Worker change. If keeping 8766 is necessary, add the exact string 'http://127.0.0.1:8766' to ORIGINS in leaderboard-worker/worker.mjs and deploy that separately. An exact loopback allowlist entry permits browser pages served on that port, regardless of which local process serves them. It does not authenticate players. Do not allow null because other opaque origins would gain access. Worker code and configuration were preserved.

The prior offline message described the local best but the client had no local ranked-save path. The rejected origin prevented official confirmation, so there was nothing eligible to arm the earlier demo overlay. The local fallback now uses rv-dash-local-scores-v1 in localStorage, with up to 10 validated records containing initials, integer score 1–100000, positive integer level and ISO timestamp. Descending score with earlier insertion first for ties. A save is confirmed only after successful write and exact readback. Invalid input, storage exceptions, quota errors and an outside-Top-10 result do not confirm a save. Failed persistence keeps the score and initials in the current result and allows retry. Local data stays separate by profile and browser origin.

leaderboard.js selects a single labeled source shared by the modal, dock and demo overlay. Failure to read official standings selects the local board for that result. With a readable official board, a rejected POST explains the rejection and offers a separate local action. A timeout, interruption, uncertain HTTP result or invalid successful POST response keeps the remote outcome unknown and blocks another online attempt for that result. A separate local save preserves that uncertainty. Successful official POST keeps the confirmed result official, and its refresh updates rankings when authoritative data is available. Official recovery is checked on the existing menu or later game-over request path. Local records are retained and never uploaded, merged or automatically retried.

The same lifecycle guards accept a verified local or official confirmation. After dismissal the 8000 ms idle countdown runs. The first demo claims it, shows the matching board after 500 ms active time and holds for 4500 ms. The actual local observation was 500.01 ms to show and 5049.84 ms to observed removal, including polling. Reload restored the saved row on both HTTP and file origins. Edge verified isolated online success and recovery with fixtures, one pending POST, ambiguous and rejected results, quota failure and retry, stale response isolation, the full eight-second local sequence, once-only overlay, emulated touch exit, hidden-time hold and reduced motion. Replay and synchronization remain deferred.

The baseline dock changed height from 71.94 to 201.42 px and shifted 501.16 px vertically between demo play and demo results as the right rail reordered. Rail scrollbar appearance changed the dock width by 10 px. Independently, the HUD wrapped or collapsed as controls and stats changed, moving the marquee and playfield up to 52 px and changing playfield width by 39 px. The fix reserves a 210 px dock, keeps it and Game Select ahead of changing result content, reserves the existing rail scrollbar gutter, and allocates fixed HUD action/shot tracks with stable readout width. The 1000×700 fine-pointer dock breakpoint is unchanged. At narrower desktop sizes the utility strip gets its own grid row. Artwork files and game canvas resolution were preserved.

At 1366×768, full 1 → 3 → 2 → 1 rotations with empty official, populated official and populated local boards measured 0 px maximum rectangle delta for the cabinet frame, marquee, playfield, inserts, dock and four control targets. The dock was x=1014, y=336.625, w=272, h=210 in all states. The dock table itself was hidden when empty, 250×151.78 when showing five and 250×50.59 with one local entry. Document width, height and scroll offsets stayed constant in those desktop rotations. Non-input layout-shift sums during the rotations were approximately 0.00, 0.00 and 0.03 respectively. This does not imply zero movement in transient content. The baseline rotation captured rectangles but did not record layout-shift entries. At 1440×900, 1920×1080, 390×844 and 320×420 the measured cabinet elements likewise stayed fixed across game over to demo. Mobile widths stayed unchanged with existing vertical scrolling. The full mobile page shortened by 453/473 px as the below-cabinet result cleared. Exact breakpoint checks included 1000×700, 999×700, 1000×699, and coarse-pointer emulation.

Changed leaderboard.js for shared-source selection and confirmation, game.js for the reached-level handoff, index.html for the helper and cache versions, cabinet.css and synthwave.css for geometry, and RESUME.md. Added local-scores.js and tests/local-scores.test.mjs. Baseline 34 and final 36 tests passed with node --test tests/*.test.mjs leaderboard-worker/worker.test.mjs. Matched 10-second headless Edge at 1366×768 with atmosphere enabled, active gameplay and obstacle damage bypassed measured 16.7 ms median and 21.1 ms p95 over 572 intervals before, and 16.7 ms median and 18.4 ms p95 over 597 intervals after.

Evidence and pre-edit backups are under C:/Users/Jay/.codex/visualizations/2026/11/13/01a1d5a5-6c89-7621-9450-9c63805c59a6/rv-dash-v22o. Next local playtest: open index.html directly, finish a real run, save initials locally, dismiss the dialog and wait eight seconds. Observe the first demo board, then reload the same file and check the side board. Physical mobile and live POST were not tested. No commit, push, publish or deployment.

## RV Dash v22l cabinet art checkpoint, integrated after v22o

Terminal state is success. The actual branch is rv-dash-repair at fa85b862ea7042d2f92a31300b5e1896e112cea7. The v22k attract mode and v22m–v22o follow-ups are installed in the local working tree. Pre-existing changes and the supplied PNGs were preserved. All 33 supplied PNGs have the expected slot dimensions. The current realistic cabinet remains the immediate CSS fallback.

The separate valid JSON manifest in index.html is read directly in file and HTTP play. It leaves the legacy cabinet-rv-dash.json geometry and existing art loader intact. The enabled order is Default Realistic, Neon Heritage, Find Your Weekend, Bring The Toys, More Room To Roam, Find Your Overlook, Tron Grid Lot, 80s Rad Taggy, Vaporsynth Escape, Futuresynth Drive, and Bitwave Trails, then default again. Holiday Camping is installed but disabled. To enable it manually, change enabled to true on the seasonal set-11 manifest entry. To add another set, insert a unique lowercase set-NN object with a label and the three local PNG paths matching the existing dimensions. Advertising is metadata only. The optional deck must match 1267×175. All supplied sets share the existing deck. Turn the feature off via the manifest enabled field, or run with ?cabinetArt=off for a session.

The cabinet-only controller preloads one candidate, waits for every required decode, and retains the current complete set on failure. Failed sets are skipped for the session, and a failed optional deck inherits the shared deck. One 15-second visible eligible dwell and one 1200 ms dissolve use the existing menu, result, demo and native dialog signals. Real play and interactive dialogs cancel a partial fade and hold the last complete set. Hidden tabs cancel and restart a full dwell when visible. Reduced motion returns to static default art. All art remains decorative, and the shared deck, gameplay, atmosphere, Worker and leaderboard files were preserved. The browser checks used a stub leaderboard.

Changes are cabinet-art-cycle.js, index.html, cabinet.css, tests/cabinet-art-cycle.test.mjs and RESUME.md. Baseline 36 and final 41 tests passed with node --test tests/*.test.mjs leaderboard-worker/worker.test.mjs. Edge cycled 01–10 and default, checked no requests for set 11 or incoming files during fades, blocked one required PNG to verify a whole-set skip, loaded a dissolve directly from file, and checked the opt-out, game start mid-fade, modal pause, demo exit, visibility resume, reduced motion, and mobile Fire touch. Desktop 1366×768, 1536×864 and 1920×1080 preserved cabinet and control bounds with no document scroll. At 390×844 the side art remained hidden and the marquee dissolved with no horizontal overflow. Existing vertical phone scrolling was preserved. No browser runtime exceptions were observed.

Comparable headless Edge at 1366×768 used Phaser pre-step intervals and enabled atmosphere. Each steady sample was six seconds. Median/p95 ms and interval counts were baseline idle 16.7/17.9 (360), enabled idle 16.7/18.1 (359), active idle dissolve 16.9/18.0 (144 across two fades), baseline real 16.7/17.9 (361), frozen real 16.6/17.9 (361), baseline demo 16.6/18.1 (357), enabled demo 16.7/17.9 (361), and demo dissolve 16.7/17.7 (72). Timed dissolves used production dwell and duration. The functional cycle matrix used a shorter test dwell with the full fade. No performance repair was required.

One three-slot RGBA set is estimated at 11.2 MiB before browser overhead. Current and candidate total 22.4 MiB, plus roughly 12.1 MiB for the existing default and shared deck if still retained by the browser. Mounted alternate image layers are at most three at rest and six during a supplied-set fade. The controller does not retain all decoded sets. These are decoded pixel estimates, not GPU or browser-cache measurements.

Evidence and pre-edit copies are under C:/Users/Jay/.codex/visualizations/2026/11/13/01a1d5a5-6c89-7621-9450-9c63805c59a6/rv-dash-v22l. Next local review: leave the menu visible for 15 seconds to watch the first fade, then start a run during a later fade to confirm the cabinet freezes. Review in a headed browser or on physical touch hardware if desired. Board requests in tests were mocked. No commit, push, publication or deployment.

## RV Dash v21–v22o online playtest checkpoint

This release includes the integrated v21–v22o gameplay, cabinet, attract mode and leaderboard work, plus the v22l alternate cabinet art cycle. All 11 supplied alternate sets are included. The seasonal set still requires manual enablement. This release operation adds no gameplay edits.

Before staging, `node --test tests/*.test.mjs leaderboard-worker/worker.test.mjs` passed all 41 tests. Local screenshot and browser-audit dumps, redundant asset copies, source-art archives, previews and local-only font binaries were kept on disk. The playtest uses the existing public repository and its established commit-pinned RawGitHack route. The game entry point is `index.html` at the repository root.

The game commit is the commit that adds this checkpoint. Its pinned URL uses `https://raw.githack.com/Lackofvoice/mini-games/<game-commit>/index.html`. Remote publication and HTTPS gameplay verification are pending at this checkpoint.

Online verification completed. GitHub accepted game commit `ff8dbf57d26adf3e4d3c149955d2ab4c023a0f27` on `rv-dash-repair`. [Verified pinned playtest](https://raw.githack.com/Lackofvoice/mini-games/ff8dbf57d26adf3e4d3c149955d2ab4c023a0f27/index.html). First-time visitors may see RawGitHack's External Content Notice. Choose **Open the page** to continue. The repository is public and the link is shareable.

All 59 checked HTTPS files matched the release, including 37 cabinet PNGs. Headless Edge at 1366 × 768 loaded the pinned page, rendered the playfield, completed the first cabinet dissolve, and verified Start, Space jump, F fire, active run progression, fixed cabinet art during play, and Pause. No uncaught browser exceptions or leaderboard submissions occurred. The local-only font requests used the existing system fallback. Physical-device and audio playtesting were outside this check.
