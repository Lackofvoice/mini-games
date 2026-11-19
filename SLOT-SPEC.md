# RV Dash v22i slot specification

Measured the local v22h page in windowed Edge on `rv-dash-repair`, with the RV Dash cabinet active and scroll position (0, 0). Each viewport was measured separately at device pixel ratios 1 and 2. Layout dimensions were identical at the two ratios. Device dimensions below are exact layout equivalents (CSS size × DPR), before raster rounding. Actual PNG dimensions must be integers. Sizes are width × height.

| Art slot | Viewport in CSS px | Rendered CSS px | Device px at 1× | Device px at 2× |
|---|---|---:|---:|---:|
| Marquee `.cabinet-marquee` | All three | 916 × 60 | 916 × 60 | 1832 × 120 |
| Left insert | 1366 × 768 | 276.890625 × 426.953125 | 276.890625 × 426.953125 | 553.78125 × 853.90625 |
| Right insert | 1366 × 768 | 276.890625 × 426.953125 | 276.890625 × 426.953125 | 553.78125 × 853.90625 |
| Left insert | 1536 × 864 | 240.890625 × 522.953125 | 240.890625 × 522.953125 | 481.78125 × 1045.90625 |
| Right insert | 1536 × 864 | 240.890625 × 522.953125 | 240.890625 × 522.953125 | 481.78125 × 1045.90625 |
| Left insert | 1920 × 1080 | 159.890625 × 738.953125 | 159.890625 × 738.953125 | 319.78125 × 1477.90625 |
| Right insert | 1920 × 1080 | 159.890625 × 738.953125 | 159.890625 × 738.953125 | 319.78125 × 1477.90625 |
| Deck art `.painted-deck` | All three | 620 × 85.625 | 620 × 85.625 | 1240 × 171.25 |

The marquee measurement includes its 2 px border. Its usable artwork area is **912 × 56 CSS px** (912 × 56 at 1×, 1824 × 112 at 2×). The deck measurement is the image layer itself. The outer `#arcade-deck` frame measures **622 × 90.625 CSS px** (622 × 90.625 at 1×, 1244 × 181.25 at 2×).

## Current fit rules

The four visible art layers are CSS backgrounds, so `object-fit` has no effect on them. Each is non-repeating, positioned relative to the padding box, and clipped at the border box. Their present fitting rules scale the PNGs proportionally. Cropping comes from the sizing and placement.

| Slot | Image fit and position | Box sizing and clipping |
|---|---|---|
| Marquee | `background-size: auto 173%`; `background-position: center 48%`. The 2172 × 724 PNG is scaled from the 56 px inner height, then clipped vertically. | `height: var(--marquee-height)` resolves to 60 px. Width fills the cabinet screen grid. `aspect-ratio: auto`, `box-sizing: border-box`, `overflow: hidden`, 2 px solid border on all sides, 0 padding, 5 px rounded corners. |
| Left insert | `background-size: cover`; `background-position: 65% center`. | Absolute, inset 7 px at the top, bottom and left of the game area. Width is `max(0px, calc((100% - var(--field-width)) / 2 - 18px))`. `aspect-ratio: auto`, `box-sizing: border-box`, `overflow: hidden`, no border or padding. |
| Right insert | `background-size: cover`; `background-position: 47% center`. The old mirror transform is disabled for RV Dash. | Same as the left, anchored 7 px from the right. Both insert widths change when the playfield size changes. Both are hidden outside the desktop rule (at least 1000 CSS px wide and 700 CSS px tall, with a fine pointer). |
| Deck | `background-size: 100% auto`; `background-position: center 47.169811%`. This exposes approximately source rows 200–500 of the 2172 × 724 PNG. | Absolute layer at `inset: 0`, no border or padding, `aspect-ratio: auto`, `overflow: visible`. The background still ends at its paint box. The parent uses `width: min(100%, 620px)`, `max-width: calc(100% - 2px)`, `aspect-ratio: 2172 / 300`, `box-sizing: content-box`, no padding, and borders of 2 px top, 1 px inline and 3 px bottom. The legacy `#deck-image` has `object-fit: cover` but is hidden in these RV Dash views. Below 730 CSS px the painted layer is hidden. |

## Art to generate

| Slot | Generate one PNG | Lock this ratio on the future art layer | Fit |
|---|---:|---:|---|
| Marquee | **1824 × 112 px** | **114:7** | Match the 912 × 56 inner area. Center and contain for smaller widths. Keep borders outside the art dimensions. |
| Left insert | **690 × 1500 px** | **23:50** | Center and contain within the existing insert. Fill the remaining space with matching cabinet trim or a solid color. |
| Right insert | **690 × 1500 px** | **23:50** | Same fit as the left. Compose each portrait independently. |
| Deck | **1267 × 175 px** | **181:25** | Same ratio as 2172:300, with enough pixels for the measured 2× deck. Center and contain, with the new artwork composed edge to edge and the labels and controls rendered in HTML. |

One portrait cannot fill all three side boxes without cropping or stretching. The actual width-to-height ratios are approximately **0.649, 0.461, and 0.216**. Use **23:50** for a near-exact fit at 1536 × 864 and keep the whole portrait visible at the other sizes. A contained portrait would render at approximately **196.40 × 426.95**, **240.56 × 522.95**, and **159.89 × 347.59 CSS px**. At 1366 the extra space is to the sides. At 1920 it is above and below. Lock the **art layer** to that ratio and let the insert itself follow the playfield. Forcing the entire insert to that ratio would change the cabinet layout. The new PNGs require the future fit-rule changes above. Replacing PNGs alone would retain v22h's cropping.

## What the deck does today

| Visible element | Live? | Code behavior |
|---|---|---|
| Red round knob at the far left | Yes, `#deck-stick` | A directional pad styled as a stick. Press or drag off center to steer left/right and change road depth up/down. The arrow keys work while it has focus. Release clears its direction. Pressing its center has a dead zone. |
| “Hold to fly” tile with cyan knob | Yes, `#deck-lever` | A second input for jump/flight. The first active flight press can trigger a jump, and holding the lever requests sustained flight. It has its own held-input state, so releasing it does not cancel an independently held FLY button. |
| Painted FLY | Yes, through `#deck-fly` | Transparent button over the printed face. Tap requests a jump, hold requests sustained flight, release clears this source. |
| Painted FIRE | Yes, through `#deck-fire` | Transparent button over the printed face. Press requests a shot, hold repeats through the existing cooldown, release clears this source. |
| Painted START | Yes, through `#deck-start` | Transparent button over the printed face. A release inside the button activates the available Start or Play again action. It is unavailable while those actions are unavailable. |
| Painted red joystick behind the live controls | Decoration | Pixels in the PNG. It has no hit target or event handler. Separate from the live red knob. |
| Taggy mascots, trailer emblem, neon trim, cabinet lettering, and printed face graphics | Decoration | Pixels in the PNG and no handlers. The three printed faces are active only because separate HTML buttons sit above them and supply focus, hover and press feedback. |

The deck contains a decorative `.painted-deck` layer, the hidden legacy `#deck-image`, and a separate `.deck-controls` layer with five native buttons. `cabinet.js` captures pointers and handles release or cancellation. It forwards held controls to `game.js` through `rvdash:panelinput`; Coin/Start delegates to the existing Start or Replay element. Fly, Fire, the lever and Start accept Enter/Space while focused. The stick accepts the arrow keys.

## Proposed simpler deck

Use four live, visibly labeled controls. Give **STEER** directional marks and keep the existing pad behavior. Combine the duplicate flight controls into one **JUMP / FLY** button with a short “Tap to jump · Hold to fly” cue. Use **FIRE** and **START** (show **PLAY AGAIN** when replay is available). Keep the current game bindings and actions. Generate the deck PNG as a plain arcade surface with trim. Draw all labels, arrows, and interactive faces in HTML/CSS. Omit the painted joystick, fake button shapes, and mascots from the control strip so every visible control is actionable.

| Layout | Art/control area in CSS px | Exact targets | Spacing and positions |
|---|---:|---|---|
| Desktop at all three measured viewports | **620 × 85.625** | Four **140 × 54** buttons in one row | 12 px horizontal inset and gaps. Button top-left positions relative to the art are **(12, 15.8125)**, **(164, 15.8125)**, **(316, 15.8125)**, **(468, 15.8125)**. |
| Compact phone reference | **340 × 132** | Four **152 × 48** buttons in two rows | 12 px perimeter and gaps. Positions are **(12, 12)**, **(176, 12)**, **(12, 72)**, **(176, 72)**. Use a solid/gradient cabinet surface at this breakpoint so the desktop image ratio does not dictate touch target sizes. |

Use the same four controls at intermediate widths. Switch to the two-row layout before the labels or 44 px minimum targets would be squeezed. The mobile 340 px reference can shrink by using fluid equal-width columns.

Verification: `node --test tests/boss-arena.test.mjs tests/cabinet.test.mjs leaderboard-worker/worker.test.mjs` passed all **25** tests. This pass adds this report only. No commit, push, or deployment.
