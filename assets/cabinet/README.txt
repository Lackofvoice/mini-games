RV DASH v22l - ALTERNATE CABINET ART SETS
Produced via ChatGPT (Chat mode, MINI GAME MARKETING project, v22l thread) on Nov 18-19, 2026.
Nothing is built, committed, or published. This zip is artwork only; the Codex dissolve-cycle
prompt in the v22l package wires these in after Jay approves the art.

INSTALL
Drop the PNG files into:
  C:\Games\mini-games\rv-dash\assets\cabinet
Keep the filenames exactly as shipped. The existing default cabinet art (set 00) is untouched.

SLOT SIZES (measured in the v22i SLOT-SPEC work)
  set-<id>-marquee.png   1824 x 112    title strip above the play screen
  set-<id>-left.png       690 x 1980   left side art (renders about 160-277 CSS px wide)
  set-<id>-right.png      690 x 1980   right side art
Deck: no per-set deck in this batch; every set uses the existing shared realistic deck.

INCLUDED SETS
  set-01  Neon Heritage        Classic Outrun     pure art
  set-02  Find Your Weekend    Dreamwave          ad (travel trailer)
  set-03  Bring The Toys       Darksynth dusk     ad (toy hauler)
  set-04  More Room To Roam    Nostalgiawave      ad (fifth wheel)
  set-05  Find Your Overlook   Tokyo Retrowave    ad (truck camper)
  set-06  Tron Grid Lot        Tron grid          pure art
  set-07  80s Rad Taggy        80s Rad            pure art
  set-08  Vaporsynth Escape    Vaporsynth         ad (travel trailer)
  set-09  Futuresynth Drive    Futuresynth        pure art
  set-10  Bitwave Trails       Bitwave pixel      pure art
  set-11  Holiday Camping      Vaporsynth frost   seasonal ad, MANUAL ENABLE ONLY

MANIFEST NOTES FOR CODEX
  - IDs are stable lowercase, zero-padded two digits, matching the package's filename spec.
  - Default set stays first and never depends on the cycling feature.
  - Ad sets carry ad: true. Set 11 carries seasonal: true and stays disabled unless
    Jay explicitly enables it.
  - Missing slot art invalidates the whole set; never mix slots across sets.

PRODUCTION NOTES
  - Scene art generated in ChatGPT with the approved Taggy panel as the in-thread reference;
    every Taggy panel was checked against canon (ring hole, two eyes, no nose, gloves,
    boots, PRICE RIGHT RV readable and not mirrored).
  - All headlines, the PRICE RIGHT RV brand line, and the RV DASH marquee title were
    composited afterward in a controlled typography pass (Montserrat ExtraBold), not by
    the image generator, per the package workflow.
  - Vehicles are towables and truck campers only. No prices, no store addresses,
    no urgency copy, no fake buttons or QR codes.
