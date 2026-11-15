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
