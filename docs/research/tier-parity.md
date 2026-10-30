# Tier parity retrofit (TP)

Owner request (2026-10-30, Spanish, summarised): every tier needs its own components (motor, robot arm...) and basic machines, and recipes must
use them; UEV recipes ask for UV voltage and UV components, and too few of them; multiblock tooltips must be short (what it does, what it
accepts), not long texts; and "if that gating exists, remove it: all it does is show that recipes 'don't exist'".

## Findings (native dump of UXV-B4, audit script in the integrator's session files)

- GTM components exist only up to UV. We added grindless:uev/uiv/uxv_* (8 families each), but recipes barely use them (uev motor in 4 recipes,
  uv motor in 43). There is no UHV component at all, and no basic machine above UV.
- Machine recipes per era (controllers, hatches, parts; arc furnace, macerator and recycling skipped):

  | Era | Recipes | Components below era | EU/t below era | Circuits below era | Avg components |
  |---|---|---|---|---|---|
  | UV | 32 | 0 | 0 | 0 | 4.0 |
  | UHV | 32 | 32 (UV parts x2-8) | 0 | 0 | 2.4 |
  | UEV | 27 | 16 | 26 (VA[UV]) | 26 (UHV) | 2.4 |
  | UIV | 24 | 8 | 23 (VA[UEV]) | 9 | 1.9 |
  | UXV | 19 | 6 | 19 (VA[UEV]) | 18 (UIV) | 4.2 |

- "The gating" is `highTierContent: false` in `pack/config/gtceu.yaml` (DECISIONS 2026-10-27/28, UEV-F1 S0-1). With it off GTM registers no
  UHV+ component and no UHV+ basic machine, so nothing can use them. The EMI era hiding (`integration/hidden.js`) is not it: it only hides items
  that have no recipe yet, and it stays.

GTM 7.5.3 with `highTierContent: true` (source, tag v7.5.3-1.20.1):

- `GTItems`: `gtceu:<t>_electric_motor`, `_electric_pump`, `_fluid_regulator`, `_conveyor_module`, `_electric_piston`, `_robot_arm`,
  `_field_generator`, `_emitter`, `_sensor` for t = uhv, uev, uiv, uxv, opv. GTM adds no recipe for any of them (`ComponentRecipes` stops at UV).
  Our grindless:uev/uiv/uxv_* use the same paths.
- `GTMachineUtils`: ELECTRIC_TIERS LV-OpV (basic machines), ALL_TIERS ULV-MAX (hulls, buses, hatches), MULTI_HATCH_TIERS EV-MAX,
  DUAL_HATCH_TIERS LuV-MAX, HIGH_TIERS IV-OpV; rotor holders HV-OpV; covers LV-OpV.
- `GTCraftingComponents` gains UEV-MAX hull and casing and UHV-OpV motor, pump, piston, emitter, sensor, conveyor, robot arm and field generator,
  so `MetaTileEntityLoader` generates the shaped basic-machine recipes (hull plus components plus circuits) for UHV-OpV, and hull recipes to MAX.
- Energy hatch 2 A recipes stop at UHV (UHV at VA[UHV] on the assembly line); 4 A, 16 A, substation hatches, transformers and buffers loop over
  every registered tier.
- GCYM parallel hatches stay IV-UV: no clash with our `lib/parallel_hatch.js` (UHV-UXV).
- Clash: our KubeJS `machine_hull` and four energy hatch builders (`startup_scripts/grindless/uev/foundation.js`, `.tiers(UEV, UIV, UXV)`)
  register the ids GTM now registers. They go; the ids do not change, so saves keep their blocks.

## Decisions

1. **TP-D1.** `highTierContent: true`. Supersedes the "kept off" decisions (UEV-F1 S0-1 and its UIV/UXV repeats). OpV is built on GTM's own OpV
   components, hulls and basic machines.
2. **TP-D2. Components.** The tier components are GTM's `gtceu:<tier>_<family>` (nine families, UHV-OpV). grindless:uev/uiv/uxv_* (24 ids) are
   retired: still registered (saves), hidden in EMI, a 1:1 shapeless conversion to the gtceu: id, and every recipe that made or used them now
   makes or uses the gtceu: id. We make every UHV+ component: assembly line with station research of the tier below's same component, at least
   VA[N-1], GT's shape (Monifactory Post_UV_Components pattern, LGPL, credited) with era materials.
3. **TP-D3. Machine recipes from UHV up** (era N = the era directory). Enforced by `recipe-quality.mjs` with a baseline ratchet:
   - **T-COMP**: controllers, hatches/buses, single-block machines and complex parts use only components of tier N or above. The era's own
     components may use tier N-1 ones (GT convention).
   - **T-COUNT**: controllers take at least 8 tier-N components from at least 3 families (GT-like: 2-4 of each); hatches, buses and complex parts
     at least 2. Principle 2 still holds: the count follows what the machine is, not padding.
   - **T-CIRC**: the highest circuit tag is the era's (`#gtceu:circuits/<era>`); controllers take at least 4 of them.
   - **T-HULL**: a hull, if any, is of tier N.
   - **T-VOLT**: EU/t at least VA[N] for controllers, parts, hatches and machines; at least VA[N-1] for the era's components, its hull, its energy
     hatches and the `voltBootstrap` list (each entry justified in `docs/quality/recipes.md`). VA[N] is reachable on tier N-1 power: two 2 A
     tier N-1 hatches carry 4 A of V[N-1] = V[N], as GTM bootstraps its own UHV hatch.
   VA: UV 491,520; UHV 1,966,080; UEV 7,864,320; UIV 31,457,280; UXV 125,829,120; OpV 503,316,480.
4. **TP-D4. Basic machines** UHV-UXV: GTM's generated shaped recipes (hull plus components plus circuits), the GTM convention that QR's
   exemption (1) already allows. OpV and MAX content stays hidden by the era hiding until the OpV and MAX eras give them recipes and uses.
5. **TP-D5. Tooltips** (every multiblock of ours, steam to UXV): at most 4 lines.
   - Line 0, gray (`§7`): one sentence, at most 80 characters, of what it does.
   - Then only feature lines, one fact each, at most 60 characters, from GTM's keys as GCYM uses them: the recipe types it runs
     (`gtceu.machine.available_recipe_map_N.tooltip`, N 1-4, with `Text.translate('gtceu.<type>')` arguments; more types share one argument
     joined with `, `), `gtceu.multiblock.parallelizable.tooltip`, `gtceu.machine.perfect_oc`; or the shared `grindless.tooltip.laser`,
     `.wireless`, `.site` (with the place's name) and `.steam` (with the EU/t cap). Not `gtceu.universal.tooltip.parallel`: its `%d` does not
     format in a translatable component, so a fixed base parallel is a machine-specific line.
     `client_scripts/grindless/tooltip_lang.js` holds them and the es_es text of those GTM keys (GTM 7.5.3 ships no es_es). A package that
     needs another shared fact proposes the key in its handoff; the integrator adds it.
   - No numbers tables, part lists, circuits, lore or prose. Everything else moves to the controller's EMI info page
     (`emi.grindless.info.<id>.N`, same lang file).
   - A T0 lint (lines, lengths, gray first line) runs with a baseline ratchet.

## Packages (serial where files are shared; at most two workers at a time)

| Id | What | Files | Tests |
|---|---|---|---|
| TP-S0F | Flip the config; remove the KubeJS hull and hatch builders; keep our hull and hatch recipes and remove GTM's duplicates for UEV-UXV; inventory every id and recipe high tier adds, classed keep, hide-until-era or remove | `pack/config/gtceu.yaml`, `startup uev/uiv/uxv/foundation.js` (builders and comments), `server uev/uiv/uxv/foundation.js`, new `server integration/high_tier.js`, its node test | T0; T1: boot, the 54 component ids and UHV-OpV basic machines exist, the UEV/UIV/UXV foundation tests pass unchanged (hull and hatches form), our hull recipe is the only one |
| TP-INT | Integrator: `grindless:<t>_<family>` to `gtceu:<t>_<family>` in every script, table and quest source; conversions and hiding for the 24 retired ids; regenerate quests and hidden_until | about 55 files, integrator-owned | T0, obtain |
| TP-G | Gate: T-COMP, T-COUNT, T-CIRC, T-HULL, T-VOLT in `recipe-quality.mjs` (the stand-in records EU/t); the tooltip lint; baselines written; gtceu UHV+ components tracked as ours in `recipe-cycles` | `tools/analysis/**` | node tests |
| TP-C | Components: UHV x9 (new), fluid regulators UEV-UXV (new), UEV-UXV component recipes to T-VOLT and GT shape; every UHV-UXV basic machine craftable | component tables and scripts named in the contract | T0, gate, obtain |
| TP-R-uhv, -uev, -uiv, -uxv | Re-tier one era: every controller, hatch and part recipe passes T-* (era baseline emptied); bootstrap list justified | that era's server scripts and tables | T0, gate, obtain |
| TP-T-a...e | Tooltips: a steam-HV plus misc (about 50), b EV-LuV (51), c ZPM-UV (37), d UHV-UEV (46), e UIV-UXV (about 45); en_us and es_es; long text moves to the EMI info page | `client *_lang.js` and the startup tooltip arrays of those eras | T0 lint |

Order: TP-S0F, then TP-INT (after UXV-B5), then TP-G alongside UXV-B6, then TP-C, then the TP-R and TP-T packages two at a time, then UXV C1-C3.
v0.15.0 ships UXV with the retrofit. Release notes: GTM high-tier content on; retired grindless:uev/uiv/uxv_* components convert 1:1 in a
crafting grid.
