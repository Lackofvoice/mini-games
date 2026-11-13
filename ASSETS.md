# RV Dash art

## Taggy

The official PNGs were extracted on 2026-11-13 from the inline script on the [approved Price Right RV source page](https://www.pricerightrv.com/product/used-2019-forest-river-rv-surveyor-251rks-3815962-29?taggy=test). Files are in game_assets/taggy.

| Variable | Filename | Geometry and use |
| --- | --- | --- |
| IDLE | taggy_idle.png | 160 × 144, right idle |
| WALK | taggy_walk.png | 640 × 144, four right-facing 160 × 144 frames |
| IDLE_L | taggy_idle_l.png | 160 × 144, left idle |
| WALK_L | taggy_walk_l.png | 640 × 144, four left-facing 160 × 144 frames |
| KEYS | taggy_keys.png | 72 × 68, archived reference |

Run uses four frames at 140 ms per frame. Jump holds walk frame 1 for the current direction. The sheet frames display at 80 × 72 logical pixels, with visible art approximately 64 px high. Collision size is 36 × 60. Phaser pixel-art mode and CSS pixelated scaling use nearest-neighbor sampling.

The keys are kept as an approved source asset and are never loaded during gameplay. A dealership game can make a key pickup look like winning a vehicle.

## Sim Lab

Original paths below are relative to D:/GAMES/RV-Dealership-Simulation/ASSETS/sprites. Copies under game_assets/simlab retain their filenames and were downscaled with nearest-neighbor to reduce the browser payload. The source folder was read-only.

| Original path | Manifest key | Use |
| --- | --- | --- |
| rvs/lite_tt_v2.png | lite_tt_v2 | Travel trailer on the RV row |
| rvs/generic_bunkhouse_fifth_wheel_teal.png | generic_bunkhouse_fifth_wheel_teal | Fifth wheel on the RV row |
| props/prop_tree_pine.png | prop_tree_pine | Far tree layer |
| props/prop_fence_segment.png | prop_fence_segment | Lot boundary behind the RVs |

makeTextures generates the sky, hills, track, pickups and hazards. The track scrolls at gameplay speed, RVs and fences at 36%, trees at 18%, and the sky at 8%. Reduced motion holds scenery in place.
