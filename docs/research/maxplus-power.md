# MAX+ power density (B13-PWRD, #234)

The question: how one 2^39 EU/t consumer can be fed by a small number of MAX+ plants (audit M6-06, #200; owner's answer on #230, 2026-11-02), within rule 8 (generous, never free; same or better fuels; more complex plants). The design is in `docs/eras/maxplus.md`, *Power*, machine 18.

## What limits a MAX+ plant today

- The torus and the nickel-56 burner register through `lib/generators.js` with `maxParallels: 1` (`startup_scripts/grindless/maxplus/stream.js:122`, `tarantula.js:163`): one 2^34 EU/t run at a time, whatever their dynamo hatches carry.
- The helper already scales generator recipes safely: n copies, n = min(cap, dynamo capacity / EU per run, fuel present), inputs, outputs and EU multiplied together, no overclock (`startup_scripts/grindless/lib/generators.js:94-120`). The LV generator array proved it on the bench; S0-4 proved one run above 2^30 on a custom MAX+ type. No proof yet covers both at once.
- Dynamo capacity is the sum of V x A over the dynamo hatches (`lib/generators.js:67-77`). The largest dynamo that fits an `energy_output` cell is our MAX 64 A wireless dynamo (`gtceu:max_wireless_dynamo_hatch_64a`, `tables/wireless_energy.json` `hatchAmps`), 2^37 EU/t. GTM's 64 A substation dynamo carries `SUBSTATION_OUTPUT_ENERGY` and does not fit. There is no MAX+ cable (S0-3).
- The settlement drains each wireless dynamo by at most V x A x 10 per 10-tick settlement (`server_scripts/grindless/lv/wireless_energy.js:517-518`), so N hatches pass N x 2^37 EU/t in steady state, 19/20 of it into the store.

## Options weighed

| Option | Verdict |
|---|---|
| Raise the torus and burner caps (M6-06's own suggestion) | Density without complexity: the same plant, more output. Rule 8 asks for a more complex plant for the next step, and the issue asks for a new machine. Kept as the fallback. |
| Raise EU/t or shorten runs | Excluded by the contract and rule 2. |
| A MAX+ wireless dynamo at 1,024 A | Shared wireless code (lib and `lv/wireless_energy.js`), a new `maxplusCaps` deposit path and a new T1; 8 existing 64 A hatches already carry 2^40. Not needed. |
| Same fuel, bigger torus | Satisfies density but adds no better fuel and no new chain; the fuel bill stays 72 gas works per consumer. |
| **Spin-polarized D-He3 in a stellarator** | Chosen: real physics for a better fuel (x1.5 cross-section), a real 5-step line on the existing P9/P10 products with two old-era crossings, no new site, no shared-code change. |

## Physics checked

- Kulsrud, Furth, Valeo and Goldhaber 1982, PRL 49:1248: fully polarized D-T and D-He3 fuel raises the reactivity by about 1.5, and depolarization in the plasma is slow.
- Baylor et al. 2023, Nucl. Fusion 63:076009 (open access, verified): proposes DIII-D tests of polarization survival on D + He-3 itself, with pellets of frozen-spin HD (vector polarization 40%) or dynamically polarized LiD (70%) and optically pumped He-3 (65%). This is the plant's fuel route almost as written.
- Colegrove, Schearer and Walters 1963, Phys. Rev. 132:2561: metastability-exchange optical pumping of He-3 at 1,083 nm.
- HD + H2 + D2 exchange over platinum reaches the statistical mix (25/50/25 at high temperature; the real constant is a little below 4 at room temperature, rounded here); HD is then separated by cryogenic distillation. Cryogenic pellets are extruded by screw extruders (ORNL pellet injectors).
- Pack abstraction, marked as named fiction in the design: all of the polarization survives, and the 1.5x reactivity becomes 1.5x EU per fuel (a higher burn-up).

## Arithmetic (node, exact to the EU)

```
torus run          2^34 x 2,400 = 41,231,686,041,600
stellarator run    2^34 x 3,600 = 61,847,529,062,400   (1.5x on the same D and He-3)
gas works run      2^33 x 2,400 = 20,615,843,020,800
d3 (VA[MAX] x 2,400)             =  4,831,838,208,000
h1 (VA[OpV] x 1,200)             =    603,979,776,000
calutrons x2, d1 x2, d2 x2, d4   =      3,760,128,000
fuel chain per stellarator run   = 26,055,421,132,800  -> ratio 2.37x (torus 2.0x)

2^39 consumer, today:  32 gross; ceil(32/0.95) = 34; net of the works' 2^33: 2^39 / (0.95*2^34 - 2^33) = 71.1 -> 72 + 72 works
stellarator, 64 runs:  2^40 gross = 2 consumers; 0.95 * 2^40 = 1.9 * 2^39 into the store
                       fuel chain 64 * 26,055,421,132,800 / 3,600 = 463,207,486,805 EU/t = 0.843 * 2^39
                       net 1.057 * 2^39: one stellarator per consumer, with 42.7 -> 43 gas works
one dial (1.111e16 generated): 179.6 stellarator runs; 10,105 t gross at 2^40; 18,157 t (15.1 min) on the net 1.057 * 2^39
```

## What stays open

- The gas works stay one run each, so the fuel side still needs 43 works per consumer (72 today). Parallel gas works (scoop-module-limited) would be a second package and an owner decision.
- Chanced wear under 64 parallels: unproven whether GTM 7.5.3 rolls a multiplied chanced input once or per run; the T1 checks that it costs about one part per 64 runs, not 0 or 64.
