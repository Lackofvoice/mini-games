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

Run uses four frames at 140 ms per frame. Phase 3 uses idle and walk frames for free steering. The sheet frames display at 80 × 72 logical pixels, with visible art approximately 64 px high. Collision size is 36 × 60. Phaser pixel-art mode and CSS pixelated scaling use nearest-neighbor sampling.

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

## Generated track items

The generated 64 × 64 icons include a shaded marshmallow, green MILE sign, steaming coffee, tire with hub, striped cone, robot, hydrant, branch, banner and overhead sign. Gameplay and the intro legend share the textures.

## Phase 3 rendering and embedding

The original nine PNGs are retained byte-for-byte. Run `python tools/embed-assets.py` to regenerate the classic data-URI script from them. The archived keys are bundled with the source art and remain unused by the game. Taggy now uses the native directional walk sheets while steering and the corresponding idle sheet when still. The two RV sprites also mark low hazards. Phaser Graphics produces the course obstacles, pickup art, legend icons, gradient sky, clouds and road.

## Phase 4 scenery

The distant trees and fences share a continuous ground band and scroll together. Foreground RVs have a separate depth and parking band. Each repeating band fits within the 600 px logical width, with clearance between adjacent copies. The road, interactive hazards, and Taggy sit above the decorative layers. The original sprite files and embedded artwork are unchanged.
