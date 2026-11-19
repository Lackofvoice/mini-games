# RV Dash fonts

Array Regular is the display face for headings and Phaser announcements. Khand Regular is the body face for HUD numbers, menus, buttons, forms, and score effects. Fontshare lists the pairing with Array as the headline and Khand as the body (pair ID `8b3097ee-08e7-4d4d-bb48-631999705b92`). Both Regular WOFF2 files were verified and downloaded from the official family download links on November 15, 2026 (ET).

- [Fontshare Pairs](https://www.fontshare.com/pairs) and [official pair catalogue response](https://api.fontshare.com/v2/fonts/pairs?limit=250)
- [Array family](https://www.fontshare.com/fonts/array) and [official Array archive](https://api.fontshare.com/v2/fonts/download/array)
- [Khand family](https://www.fontshare.com/fonts/khand) and [official Khand archive](https://api.fontshare.com/v2/fonts/download/khand)
- [Fontshare licenses](https://www.fontshare.com/licenses)

## Local files and license

Both WOFF2 files are local-only for this project. On another machine, download the official archives and extract the unmodified WOFF2 files to these exact paths. Apply the local `/assets/fonts/*.woff2` exclusion in `.git/info/exclude` before adding the files. Preserve the notices that came with the archives.

| File | Weight | License and redistribution |
|---|---:|---|
| `assets/fonts/Array-Regular.woff2` | 400 | ITF Free Font License 2.0, August 17, 2026. Section 01 permits use “for personal or commercial purposes” and says “You may self-host the Font Software on your own servers or infrastructure”. Section 02 lists repositories among restricted distribution channels. Keep the original `FFL.txt` with the downloaded archive. |
| `assets/fonts/Khand-Regular.woff2` | 400 | SIL Open Font License 1.1, February 26, 2007. The supplied terms permit redistribution with software “provided that each copy contains the above copyright notice and this license”. The project keeps the notice in `assets/fonts/Khand-OFL.txt` and keeps the binary local alongside Array. |

## Rendering and verification

The stylesheet declares local WOFF2 URLs and `font-display: swap`. The `--font-display` stack is Array, system-ui, sans-serif. The `--font-body` stack is Khand, system-ui, sans-serif. Phaser text goes through `arcadeText` in `game.js`. If a requested face is still loading, existing text is redrawn once after it loads. Gameplay startup continues independently. Missing files fall back to system-ui.

The existing health glyphs retain system-ui, the optional diagnostic layer readout retains monospace for column alignment, and raster lettering retains the original artwork.

Edge verified both FontFaceSet loads and actual custom glyph rendering for the heading, HUD, Fire, Start, Game Select, controls dialog, leaderboard, and game-over heading at 1440 × 900 and 390 × 844 using local HTTP. The browser also inspected the actual Phaser banner, score effect, and boss stamp text styles. Desktop `file://` loaded both fonts. Blocking the local WOFF2 URLs verified system fallback and successful Start. The browser made no Fontshare requests at runtime.

## v22c UI font

Satoshi replaced Khand in the UI/body stack. Its normal-width letters and distinct numbers read comfortably at the measured HUD sizes without extra tracking. General Sans also offers Regular and Bold WOFF2 under the same license. Satoshi is the preferred candidate and fit the existing controls at the required sizes. Array Regular remains the display face.

The official Fontshare download was verified on November 16, 2026 (ET). Install the unmodified `Satoshi-Regular.woff2` (400) and `Satoshi-Bold.woff2` (700) in `assets/fonts/`. The archive's ITF Free Font License 2.0, August 17, 2026, permits commercial use and local self-hosting under section 01 and restricts redistribution through repositories under section 02. The files remain local-only. Their exact paths are excluded through `.git/info/exclude` and neither path is tracked. Existing local Khand files were preserved.

- [Satoshi](https://www.fontshare.com/fonts/satoshi) · [Official archive](https://api.fontshare.com/v2/fonts/download/satoshi)
- [General Sans](https://www.fontshare.com/fonts/general-sans) · [Fontshare licenses](https://www.fontshare.com/licenses)

`--font-body` and `--font-display` supply both CSS and Phaser text. The system-ui fallback, health glyphs, monospace diagnostic readout, and lettering baked into sprite and cabinet artwork are preserved.
