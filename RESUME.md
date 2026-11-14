ROLLBACK_POINT: 093ccfd92cc7d6c3df53dd1c41376e2305498d18

# Phase 11 visuals

0. Checkpoint: clean baseline, local tag before-phase-11.
1. Source inspection: done. drawScenery offsets cached sky/cloud/hill/lot/road textures and scenery images. scrollSpeed(distance) caps the ramp at 230 px/s. moveHorizontally eases keyboard or touch velocity. advance selects a pattern; spawnPattern draws its sprite and coins, and checkPattern uses inset rectangles. The old upper hazard is a procedural branch alongside a sign. makeTextures draws the track and the floor clamps above its road line.
2. Parallax: done. Independent seeded scenery and Shift+P overlay preserve plain P for pause.
3. Ground obstacles: done. Generated 19 ground PNGs plus the overhead source set, with a shared manifest and offline bundle. Four existing ground hazards now use sprite art.
4. Overhead hazards: done. Replaced procedural branch/sign art with five rope-hung sprite variants. The lowest solid part follows the pivot; reduced motion holds it still.
5. Walkable road and lanes: done. Taggy walks on three asphalt lanes and casts a shadow. Q/E step while grounded, preserving existing lift and Down actions. The next step wires lane collisions to the new ground patterns.
6. Obstacle patterns: pending.
7. Browser verification: pending.
8. Push and pinned preview: pending.
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

