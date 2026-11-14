# DONE

Phase 9 adds eased horizontal movement with home drift, two starting HP, a five-HP cap, and 1.5 seconds of post-hit protection. A health pickup is scheduled every 52 active seconds and deferred during the boss. Left-origin touch holds fly and drag to steer, even across the midpoint. A separate right-origin tap shoots.

Fly, shoot and hit sprites use a 36 logical-pixel tag body and a common center anchor. Source art and hitbox dimensions are unchanged. The 120-second flight-only maximum-speed test passed without damage. See VERIFY.md for scaling factors, captures and verification.

Both local scripts use v=9. Bump both URLs together after changing game.js or the embedded bundle.

# NEXT STEP

Play on a physical phone and check two-thumb movement, aiming and the health pickup rhythm.

# OPEN ISSUES

Physical-phone play and audio by ear remain unverified. Phaser still requires a reachable CDN or browser cache.
