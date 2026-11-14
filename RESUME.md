# DONE

Phase 6 separates flight (Up, W, mouse hold, left touch) and shooting (Space, right touch). P and Escape pause. Smoothed flight, the 350 ms shot meter, three enemies, and the ten-hit SOLD stamp are in place. Missing optional artwork falls back to the original Taggy pose or generated textures. See VERIFY.md for browser evidence.

Both local scripts use v=6. Bump both URLs together after changing game.js or the embedded bundle. Place optional strips in assets/sprites and regenerate the bundle with python tools/embed-assets.py. ASSETS.md lists frame sizes and rates.

# NEXT STEP

Try the opening flight and combat on a physical phone, including two-thumb input and sound.

# OPEN ISSUES

Physical-phone feel and audio by ear remain unverified. Optional production sprite strips are pending. Phaser still requires a reachable CDN or browser cache.
