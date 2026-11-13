# RV Dash art

All game textures come from makeTextures in game.js. Phaser Graphics draws on a four-pixel grid and generates textures at startup. Pixel-art rendering and CSS nearest-neighbor scaling keep edges sharp. Responsive viewports can use fractional scale.

| Key | Logical pixels | Frames or role |
| --- | --- | --- |
| taggy-0 to taggy-4 | 56 × 64 | Neutral, raised idle, two run strides, jump |
| token-gold, token-blue | 32 × 32 | Neutral collectibles |
| cone, robot | 48 × 44 | Road cone and fictional toy robot |
| lot | 600 × 800 | Repeating RV lot, road and lane markers |

Idle uses frames 0 and 1 at 2 fps. Run uses 2, 0, 3, 0 at 9 fps. Jump uses frame 4. Taggy uses red and coral with cream features and dark ink. The lot uses muted slate and teal. Gold, cyan, orange and violet distinguish moving objects. HTML and CSS provide HUD and controls.

Taggy is procedural placeholder art. To use the approved sheet, load it in the scene preload and replace the marked Taggy generation block and animation frame map in makeTextures. Update the initial player sprite key to the approved sheet and preserve the 56 × 64 frame bounds or retune the body and floor alignment to match. The original text asset placeholders stay in source control.
