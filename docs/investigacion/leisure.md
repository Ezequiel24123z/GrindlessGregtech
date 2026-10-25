# GregTech Leisure (GTL) → Gregtech Grindless: what we take away

Pure research, without touching the repo. User's question: power boost (boilers/turbines/fuel), wireless energy network (covers?, LV?), and all of GTL's own QoL/multiblocks.

## 0. Sources and method

- **Local copy of GTL** (instance `GTL1452-CurseForge-original`, "Factoria Plana EN", GTL **1.4.5.2**, GTLCore **1.2.3.1-fix9**, mc1.20.1): `session-state/.../research/gtl-raw/` — the real `cfg/gtceu.yaml` and `cfg/gtlcore.yaml`, the real `kubejs/` (startup/server scripts, 17 300 lines in `gtceu.js`), `jars/_list_*.txt` (.jar listings, no binaries), `jars/gtlcore_classes_*.txt` (class names from the decompiled bytecode, only to locate what each thing does — no code is reproduced), `gtceu_recipes.tsv` (recipe dump), `machines_table2.md` (the 158 structures, generated in an earlier session).
- There was already earlier research (previous session) stored in `gtl_body.md`/`gtl_appx.md` inside that same folder: I reused it and verified/extended it instead of repeating it. `CREDITS.md` and `docs/viaje.md` already had a prior verdict, "GTL: unclear license, ideas only" (translated from Spanish). I confirm it with the exact legal text below.
- **Web/GitHub:** the modpack repo (`EasterFG/GTLCore` is the only public remnant of the core, `nutant233/*` returns 404 today), Modrinth/CurseForge for each addon, and the source code of the mods that ARE ours (LGPL/MIT) via semantic search of their repo.
- Our pack: `pack/mods/*.pw.toml`, `pack/config/gtceu.yaml` (the real one, 7 lines), `AGENTS.md`, `CREDITS.md`, `docs/viaje.md`, and the script `pack/kubejs/server_scripts/grindless/integration/gtca.js` (decisions already taken about GTCA that directly affect the power question).

---

## 1. Licenses

### 1.1 The GTL modpack (configs, KubeJS, quests)

| Where | Declared license | Evidence |
|---|---|---|
| Instance zip (root) | **CC BY-NC-SA 4.0** (Attribution-NonCommercial-ShareAlike) | `LICENSE` file at the root of the instance, verbatim CC text, dated 2026-08-14. Local copy: `research/gtl-raw/LICENSE`. |
| The same CurseForge page of the modpack | **LGPLv3** | "License" field of the CurseForge project `gregtech-leisure` (id 1695369, author **nutant233**). |

**This is already a contradiction at the source**: the author declares two incompatible licenses for the same content (CC-BY-NC-SA is *share-alike*, "viral" over the text/data; LGPLv3 is a library software license, meant for code, not for assets/quests). There is no way both are true at once. The user believes GTL is permissive: **it is not** — in the best case (LGPLv3) it only covers code with attribution and a notice of changes; in the worst case (CC-BY-NC-SA, which is what the zip's `LICENSE` actually states) any literal copy of its scripts/quests would pass *ShareAlike* on to ours.

### 1.2 GTL's own mods

| Mod | Declared license | Evidence | Note |
|---|---|---|---|
| **GTLCore** (core: 158 multiblocks, 74 recipe types, ~270 mixins) | "LGPLv3.0" (`mod_license` field) | `gradle.properties` of the public repo `EasterFG/GTLCore` (branch `gtl-1431`, v1.1.1): `mod_license=LGPLv3.0`, no `LICENSE` file. | The public repo stops at v1.1.1; our copy is 1.2.3.1-fix9, private code with no visible repo (`nutant233/GTLCore` → 404 today). GTL's own README admits parts from Gregicality Legacy (GPL-3.0), GTNH (LGPL-3.0/"Other"), Twist Space Technology (GPL-3.0) and **Epimorphism Modern (AGPL-3.0)** — an "LGPL" label does not hold up over code derived from GPL/AGPL. |
| **GTMThings** (wireless hatches/covers — see §3) | `mods.toml` internal says `license = "LGPLv3.0"` | `other/gtmthings_mods.toml` in the local copy | **CurseForge and the author's repo (`liansishen/GTMThings`) mark it "All Rights Reserved"** (no LICENSE on GitHub). The `1.3.5.b` build used by GTL is a private fork, not on Modrinth. Verdict: **not redistributable**, despite the `mods.toml`. |
| ad_astra_rocketed (rockets T5-T7) | **All rights reserved** (celsiusqc) | embedded `mods.toml` | Hard dependency of GTL's interplanetary journey. |
| ae2CraftingTree / Useful Clipboard | All rights reserved | embedded `mods.toml` | GTL's AE2 QoL. |
| wildcard_pattern (build `-gtl`) | MIT | embedded `mods.toml` | The only "pack-specific" mod with a clean license. |
| GTMUtils / GTCA / GTM Extended Features (**already in our pack**, not GTL's) | **LGPL-3.0** all three | Modrinth API: `KMnOsM3N`, `jIPykDYO`, `9MCfIDeI` | They are not GTL mods; I mention them because they solve pieces equivalent to GTLCore/GTMThings (§2 and §3). |

### 1.3 Textures

GTL's own `README.md` admits (section "鸣谢作品" = "acknowledged works") that they are not its own:

> 部分处理线，多方块结构，**纹理**来自 Gregicality Legacy / GTNH / Twist Space Technology / Gregicality Science / **Mekanism** / Deeper And Darker.

GTL has no right to re-license those textures either (Gregicality Legacy GPL-3.0, GTNH LGPL-3.0, Twist Space Tech GPL-3.0, Mekanism MIT, Deeper And Darker AGPL-3.0). **Never copy a PNG from GTL.**

### 1.4 Honest verdict (the user believes it is permissive — it is not entirely)

| What | Verdict |
|---|---|
| Include the GTLCore or GTMThings jar via packwiz? | **No.** GTLCore: no public repo for our version, mixins tied to GTM 1.4.4, GPL/AGPL origin under an untenable LGPL label. GTMThings: ARR on CurseForge. |
| Copy KubeJS scripts or quests literally? | **No.** CC-BY-NC-SA (ShareAlike) would spread its license to ours; and CurseForge itself says LGPL for the same content — too contradictory to rely on. |
| Copy textures? | **Never** — GTL has no right to pass them on either. |
| Reimplement the idea/mechanic/numbers with our own code? | **Yes.** Ideas, proportions and topologies are not copyrightable; that is what `CREDITS.md` already does ("ideas only"). Give credit to "GregTech Leisure (nutant233 et al.)" and, when GTL itself cites it, to GTNH/TST/Gregicality Legacy/GT++ in our `CREDITS.md`. |
| Minor note | Our `CREDITS.md` cites "GT Community Pack… LGPL-2.1"; the repo's actual `LICENSE` (`GregTechCEu/GregTech-Community-Pack`, verified via the GitHub API) is **LGPL-3.0** (matching what GTL also declares for the same origin). The citation is worth correcting; it changes no conclusion. |

---

## 2. Power: how GTL inflates generation

**Our current `pack/config/gtceu.yaml` has 7 lines** (`enableFEConverters: true`, `infiniteBedrockOresFluids: true`, `enableMaintenance: false`) — it does not touch a single energy key. We start from GTM 7.5.3's default values at 100%.

### 2.1 Small boilers (single-block) — `machines.smallBoilers` in `cfg/gtceu.yaml`

Real file from the GTL instance: `research/gtl-raw/cfg/gtceu.yaml`. The file itself carries, in a comment, the GTM default value (the same mod, same Modrinth project `7tG215v7` as ours — see §3.3 for the proof that it is the same mod, not a fork):

| Key | GTM default | Value in GTL | Factor |
|---|---|---|---|
| `solidBoilerBaseOutput` (solid boiler) | 120 | **960** | ×8 |
| `hpSolidBoilerBaseOutput` (solid, high pressure) | 300 | **2400** | ×8 |
| `liquidBoilerBaseOutput` (liquid boiler) | 240 | **1920** | ×8 |
| `hpLiquidBoilerBaseOutput` (liquid, high pressure) | 600 | **4800** | ×8 |
| `solarBoilerBaseOutput` (solar boiler) | 120 | **960** | ×8 |
| `hpSolarBoilerBaseOutput` (solar, high pressure) | 360 | **2880** | ×8 |

All six variants are multiplied by **exactly ×8**, mB of steam/second at maximum temperature. It is a single global factor, applied manually to each key (there is no single "boiler multiplier" key).

### 2.2 Large boilers (multiblock) — `machines.largeBoilers`

| Key | GTM default | Value in GTL | Factor |
|---|---|---|---|
| `steamPerWater` (water→steam conversion) | 160 | **160** | **×1 — no change** |
| `bronzeBoilerMaxTemperature` | 800 | **6400** | ×8 |
| `bronzeBoilerHeatSpeed` | 1 | 1 | ×1 |
| `steelBoilerMaxTemperature` | 1800 | **12800** | ×7.11 |
| `steelBoilerHeatSpeed` | 1 | **2** | ×2 |
| `titaniumBoilerMaxTemperature` | 3200 | **25600** | ×8 |
| `titaniumBoilerHeatSpeed` | 1 | **4** | ×4 |
| `tungstensteelBoilerMaxTemperature` | 6400 | **51200** | ×8 |
| `tungstensteelBoilerHeatSpeed` | 2 | **8** | ×4 |

Reading: **the steam:water ratio does not change** (it still costs 1 mB of water per 160 mB of steam); what goes up is the **temperature ceiling** (×8, less for the steel boiler, which goes up "only" ×7.11 — possibly so as not to break the LV-steam/MV-steel ladder) and the **heating speed** (bronze the same, steel ×2, titanium ×4, tungstensteel ×4). With the higher ceiling and faster heating, a boiler reaches, sooner, an operating point that used to be unreachable and sustains it with the same fuel per heat cycle — hence the "much more steam" without touching the water cost.

### 2.3 Burners/turbines (EU per mB of fuel): **no changes found**

I searched the three places where GTM lets this be changed, and **none of them touches standard combustion/gas/semi-fluid/steam**:

1. `cfg/gtceu.yaml` has no generator efficiency key at all (reviewed in full; the only energy block is shown above).
2. The 74 recipe types that GTLCore registers (`research/gtl-raw/recipetypes.txt`) add only **4** in the `generator` category: `SEMI_FLUID_GENERATOR_FUELS` (same id as GTM's — a reference, not a redefinition, used by the IV "Chemical Energy Devourer" to merge several fuels into one controller), `ROCKET_ENGINE_FUELS` and `NAQUADAH_REACTOR` (new, GTLCore's own generators), and `SUPERCRITICAL_STEAM_TURBINE_FUELS` (new turbine of its own, id `supercritical_steam_turbine`). **`combustion_generator`, `gas_turbine`, `steam_turbine` and `plasma_generator` do not appear** in that list — that is, GTLCore does not touch them.
3. `kubejs/server_scripts/gtceu.js` (17 300 lines) has only two recipes that *mention* turbines, and both are **item assembly** recipes (crafting the "Supercritical Steam Turbine"/"Supercritical Mega Steam Turbine" block in an assembler), not fuel recipes.

**Important conclusion for the user's request**: GTL **does not** make "turbines consume less" (translated from Spanish), nor does it raise the EU/mB of the standard generators — normal steam, combustion, gas and semi-fluid keep GTM's factory values. What GTL does is **feed the same turbines with far more steam** (bigger/hotter boilers) and, for anyone who wants more, it offers *new and alternative* generators (Supercritical Steam Turbine, Naquadah Reactor, Chemical Energy Devourer) with their own numbers — not a global efficiency multiplier.

### 2.4 Global fuel/duration multiplier?

`cfg/gtlcore.yaml` (the *mod's* config, not GTM's) sets `durationMultiplier: 1.0` — that is, **GTL does not even speed up recipes globally**; its `oreMultiplier: 4` is only for mining and does not apply to fuel. There is no global "fuel multiplier" in either of the two config files.

### 2.5 We have already had this conversation: GTCA and "energy out of nothing"

Before recommending anything, note this: **we have already installed GT Community Additions (GTCA, LGPL-3.0, we have it)**, which includes a *Steam Pressurizer* → *High-pressure/superheated steam turbine* and an *Extreme Heat Exchanger* → *Supercritical (SHD) Steam Turbine* — mechanically **the same kind of chain** we would want to copy from GTL (normal steam → process it → much more EU per mB). But `pack/kubejs/server_scripts/grindless/integration/gtca.js` already **removed all of them**, with this reason written in the script itself:

> «the mod has no config switch and builds its recipes in Java, so everything is done here» … «Steam Pressurizer (HV) 6 400 mB of steam + 480 EU → 640 mB of high pressure steam worth 8 000 EU in a steam turbine (the steam was worth 3 200): **energy out of nothing**» … «Extreme Heat Exchanger + SHD turbine: fusion plasma → supercritical steam → 3.4-3.7× the EU of GTM's plasma turbine for the same plasma» (translated from Spanish)

That is: **we already identified and explicitly rejected** a chain of "improved steam = much more EU for the same fuel", because it breaks the rule that "no addon processes more cheaply than GT in its era" (translated from Spanish). If the user now wants more power "Leisure-style", we must decide **consciously** whether to:
- (a) raise a boiler multiplier in the GTL style (as in §2.1/2.2: transparent, affects everyone equally, does not reintroduce the recipes already removed), or
- (b) reconsider the GTCA chain that was already removed (reopen that decision).

I do not make that decision here (this is research); I only flag it because the user asked to "verify honestly" (translated from Spanish) and this is a direct clash with a decision already taken in this same pack.

### 2.6 Where each thing lives (summary for later implementation)

| What | Where |
|---|---|
| Output of small/large boilers, temperature, heating speed | `pack/config/gtceu.yaml` → add block `machines.smallBoilers` / `machines.largeBoilers` (absent today = factory values) |
| EU/mB of combustion, gas, semi-fluid, standard steam | **Not configurable via YAML or KubeJS in a supported way** — these are Java properties per fuel/tier in GTM; GTL does not touch them either. A change here would require a Java addon or accepting that only the "boilers" side is touched. |
| New generators with their own EU/mB (Naquadah Reactor, Supercritical Steam Turbine, Chemical Energy Devourer) | Specific to GTLCore, not redistributable (§1). Our already-installed, compatible equivalent is GTCA (removed by prior decision, §2.5) and GTM Extended Features (does not touch fuels). |

---

## 3. Wireless energy network

### 3.1 How it works in GTL — not covers, but hatches with a "frequency"

GTL's mechanism **does not live in GTLCore**: it lives in a separate mod, **GTMThings** (author `liansishen`, mod id `gtmthings`, build `1.3.5.b` bundled inside GTL). Evidence: `other/gtmthings_mods.toml` (hard dependency `gtceu [1.4.2-SNAPSHOT,)`) and the asset listing of the jar (`jars/_list_gtmthings.txt`), which contains the models `assets/gtmthings/models/block/machine/part/wireless_energy_hatch.json` and `wireless_energy_hatch_16a.json` — these are **part hatches** (`part/`), not covers.

Functional description (核心模组/CurseForge, verified by web search aimed at the page and the author's repo):

- The "无线能源仓" (**wireless energy hatch**) is a normal hatch that is placed on a multiblock (or on a single-block machine) just like any energy hatch.
- Each hatch has a **frequency** and **links automatically to your power network or your FTB Teams team** (right-click to change owner/unlink).
- It **fills/drains by itself, every tick**, from that frequency — it works **across dimensions**.
- There are variants per amperage band: **LV-HV** and **EV-MAX** (multiple amperages). That is, there is a low-voltage hatch usable from LV, and others of higher voltage/amperage for later — **it is not a single piece "unlocked at LV that already serves everything"**: the power ceiling of each hatch follows the tier at which it is crafted.
- Apart from energy, GTL also has, separately (credits from `gtl_appx.md`, confirmed in the catalog by era): **wireless covers**, **wireless monitor/interface** (to view/manage a machine remotely) — these are indeed covers, but they are for *monitoring*, not for transporting EU.

**License (repeated from §1 because it is the critical piece here): GTMThings is "All Rights Reserved"** according to CurseForge and the author's own repo (no LICENSE). **We cannot include that jar.** And GTL uses a private `1.3.5.b` build that is not even published on Modrinth, tied to GTM `1.4.2+` (an old version, see §3.3).

### 3.2 Does what we already have serve us? — yes, with nuances, and we already have it installed

I went through exactly the mods the user cites (`pack/mods/*.pw.toml`):

| Our mod | License | What it really does (source code, not just the description) | Does it serve "wireless EU from LV, few cables"? |
|---|---|---|---|
| **eup2p** "EU P2P Tunnel" (`pack/mods/eup2p.pw.toml`, MIT, repo `lostmyself8/EUP2P`) | MIT | It is an **AE2 P2P Tunnel** (like the existing item/fluid/FE ones), specialized in EU: `EUP2PTunnelPart extends CapabilityP2PTunnelPart<…, IEnergyContainer>`. Two tunnels with the same frequency on **the same ME network** carry EU between each other without laying GT cable between both points. It is obtained in the AE2 tab and tuned by right-clicking it with a GTM cable/wire. | **Yes, already available, no changes needed.** It requires an ME network already present at both ends (which is exactly our transport column between eras, per `docs/viaje.md`); it does not require any specific GT tier beyond what AE2 already asks for. |
| **gregtech-modern-utilities** "GTMUtils" (`pack/mods/gregtech-modern-utilities.pw.toml`, LGPL-3.0, repo `Omicron-Industries/GregTech-Modern-Utilities`) | LGPL-3.0 | It brings a real **multiblock wireless bridge**: `WEBHubMachine` / `WEBReceiverMachine` (formerly called "Wireless Active Transformer"/PTERB). Each one has a `frequency` (int); the Hub collects the energy from its local input hatches and dumps it into a global map indexed by frequency **and dimension** (`ResourceKey<Level>` + `BlockPos`), and the Receiver takes it out from there — **it does cross dimensions**, just like GTMThings. It has an optional coolant system (`UtilConfig.webCoolantBaseDrain`/`webCoolantIOMultiplier`, both 0 by default = disabled) and it can explode if GTM does not have "harmless active transformers". | **Mechanically yes, but it is NOT at LV**: its recipe (`UtilRecipes.java`, assembly line) asks for **Neutronium ×32** plates, **UV** field sensors/emitters/generators, **UHV** circuits — that is, it is gated to **UHV**, as the successor of the Active Transformer. This mod has no "single-block" hatch for standalone machines. |
| **gtm-extended-features** "Extended Features" (LGPL-3.0-only) | LGPL-3.0 | It has wireless optical hatches (data/research) and admits so in its own README: *"Potential additions: Wireless ME/Stocking hatches, **Wireless EU**, Wireless CWU"* — **it does not exist yet**; it is on its plans list, not implemented. | No, not today. |
| **appflux** "Applied Flux" (LGPL-3.0, repo `GlodBlock/ExtendedAE`) | LGPL-3.0 | ME cells that store **FE** (Forge Energy), not GT EU directly. | It is not EU; it is only useful if it goes through an EU↔FE converter (GTMUtils' 64A Energy Converters, or the `enableFEConverters` we already have enabled in `gtceu.yaml`). |
| **gtca** / **gtnn** / **gtceu-terminals** | LGPL-3.0 | None brings wireless EU transport. | No. |

### 3.3 About "option A" (including the GTM/GTLCore jar)

I confirmed with the Modrinth API that **our GTM (`gtceu-1.20.1-7.5.3`) and GTL's (`GregTechCEu 1.20.1-1.4.4`) are the same Modrinth project, `7tG215v7`** (our `.pw.toml` downloads from `cdn.modrinth.com/data/7tG215v7/…`, exactly the same id that the earlier research cites for GTL's build). That is: **GTL does not use a fork of GTM**; it uses a *much* older build of the same mod (its "1.4.4" numbering is a version scheme that predates the "7.x" we use now; same project, roughly a year and a half apart, with constant API changes: the 7.5.3 changelog itself touches internal recipe/hatch code). GTLCore is built from ~270 mixins against that old build and depends on `kubejs:*` blocks that only exist if you also load GTL's KubeJS (CC-BY-NC-SA). **Option A discarded**, confirming what the earlier research already concluded.

### 3.4 Recommendation

**Combine Option C (what we already have) with a small adaptation, not pure Option A or Option B:**

1. **Already today, no changes:** whoever does not want to lay GT cable can use the **EU P2P Tunnel** as soon as they have an ME network — in our pack that comes early (LV/MV, transport column already decided in `docs/viaje.md`). This already covers the real use case the user describes (translated from Spanish: "help for those who don't want to use many cables") without writing a single line of code.
2. **For a true "wireless hatch" like GTL's, with frequency-based sharing and across dimensions:** the only route with a clean license and already installed is the **WEB Hub/Receiver of GTMUtils (LGPL-3.0)** — mechanically it is *the same thing* as GTMThings (both are cousins of GTM's Active Transformer), but it is gated to **UHV**, not LV. To resemble GTL, one would have to **re-tier it via KubeJS**: remove its assembly recipe (`assembly_line`, UHV) and add one of our own at a low tier — this is legal (LGPL allows modification) and technically simple (it is an `assembly_line` recipe, which can be replaced with the pattern `gtca.js` already uses for other recipes). I do **not** recommend lowering it to LV literally as the user asks: our own progression rule (translated from Spanish: "energy is a skill of each era") and the precedent in §2.5 (a GTCA mechanic was already removed for "cheap power too early"; translated from Spanish) point to **HV** as the more correct point — which is, in fact, the same tier at which **GTL itself** starts allowing wireless hatches on *multiblocks* (GTL's LV is only for standalone single-block machines). Leaving single-block / P2P at LV and the multiblock bridge at HV reproduces GTL's real curve, not just its marketing headline (translated from Spanish: "it's at LV").
3. **Do not touch GTMThings or any GTL jar** — its only clean route is to reimplement the idea (which is exactly what GTMUtils already did independently).

---

## 4. QoL and our own multiblocks — full list by era

Primary source for this section: `machines_table2.md` (the 158 GTLCore structures, generated from the decompiled bytecode: id, recipe tier, tooltip credit, recipe type(s), size) cross-checked with the per-era prose in `gtl_body.md` (what each one gains). **Reusable** column: everything is "ideas only" (§1); I note in parentheses if GTL itself credited an external source (that source has its own license, not GTL's). **Conflict** column marks clashes with our rules: **[V]** miner/resource without a vein or planet, **[C]** "creative"/no real cost, **[P]** parallels/absurd quantities, **[$]** coin market, **[Pl]** breaks planetary exclusivity (extracts from a planet without going there).

### 4.1 QoL that is not a multiblock (tools, network, environment)

| Function | Tier | What it gains | Implementation | Reusable | Conflict |
|---|---|---|---|---|---|
| Wireless energy network (frequency hatches) | LV (1 block) → HV (multiblock) → 16A | Avoids laying cable | GTMThings (Java, ARR) | No (ARR) — see §3 | — |
| Wireless covers / wireless monitor / wireless interface | LV | View/manage a machine remotely | GTMThings (Java, ARR) | No (ARR) | — |
| World Data Scanner → `overworld/nether/end_data` | LV→EV | "Scan once" and the data (not consumed) unlocks gas collectors, void miners and incubators forever | GTLCore (Java) | Yes, as an idea | [V] if used to mine without a vein |
| AE2 patterns: wildcard pattern tool, throughput monitor, ME Pattern Relay, Pattern Modifier, Configuration Copy Tool, Pattern Box (36/page), ME Pattern Buffer (isolated, proxy, 72 slots) | LV→UHV | Large-scale pattern logistics without thousands of Interfaces | `wildcard_pattern` (MIT, reusable as is) + GTLCore (AE2 mixins, not reusable) | Partial (only the MIT part) | — |
| Environment hatches: Cleaning (HV) → Sterile (ZPM) → Law (UEV); Gravity Control Hatch (0/1-99/100, UV) | HV→UEV | They replace the cleanroom / emulate zero or high gravity without going to a station | GTLCore (Java) | Yes, as an idea — GTM already has a cleanroom and a cleaning hatch; the new part is "environment as a piece" | — |
| Maintenance: Auto Maintenance Hatch, Configurable Maintenance Hatch | HV→IV | Never breaks down / adjustable recipe time without extra EU | GTLCore (Java) | Idea, with a caveat | [C] the Configurable one (free time, see §4.4) |
| Research stack: Research Station + Object Holder + HPCA + optical fiber, Data Access Hatch → Data Bank → optical hatches (wired/wireless) | LuV→UHV | Research as a resource (CWU/t) | GTM stock + GTLCore (wireless hatches) | Yes, as an idea (we already have Extended Features with wireless optical hatches, LGPL) | — |
| Small quest market ("Small Market"): credits → Bottle of Time, Fermium flight armour, Vajra, Avaritia items | — | Buyable shortcuts | Quests + Re-Avaritia | No | [$] |

### 4.2 Multiblocks — Steam, LV, MV (ULV→MV)

| Name (id) | Tier | What it gains | Impl | Reusable | Conflict |
|---|---|---|---|---|---|
| Small steam multiblock family (hammer, compressor, alloy smelter, mixer, bath, washer — 6 blocks) | Steam | **8 parallels** over the single-block recipe | GTLCore (`LargeSteamParallelMultiblockMachine`) | Yes, as an idea | — |
| "Large Steam X" family (macerator, centrifuge, thermal, bath, washer, assembler — 7 blocks) | Steam→LV | **64 parallels**; the circuit one uses an AE2 Molecular Assembler core | GTLCore | Yes, as an idea | — |
| Steam Oven (stock, tweaked) | Steam | 256 parallels in the oven | GTM + tweak | Yes, as an idea | — |
| **Dimensionally Transcendent Steam Oven / Dirt Forge** (`dimensionally_transcendent_steam_oven`, `_dirt_forge`) | Steam | No energy, **524 288 parallels** | GTLCore (credit: GTNH) | Idea (GTNH, no clear license → ideas only) | **[C][P]** pure shortcut, steel bridge at no cost |
| **Primitive Void Ore Miner** (`primitive_void_ore`, disabled by config) | Steam | 64 random raw ores **per tick** | GTLCore | Idea | **[V][P]** |
| Ancient Reactor Core (3×3 altar) | Steam | Opens the "Ancient World" dimension (richest ore) | KubeJS | Idea | — |
| Generator Array (`generator_array`) | LV | Up to 16 stacked generators, ×2 output; "wireless network" mode | GTLCore | Idea | — |
| Industrial Slaughterhouse (`slaughterhouse`) | LV | Mob farm: circuit 1/2 picks the passive/hostile list, virtual drops (works on Peaceful) or real entities | GTLCore | Idea | — |
| Universal Factories: Processing (11 types), Assembly (2), Separation (7), Mixing (4) — `processing_plant`, `assemble_plant`, `separated_plant`, `mixed_plant` | MV | You place a single-tier block inside the controller; a 3×3×3 covers 11-24 recipe types | GTLCore (credit: GTNH) | Idea (GTNH) | — |
| Advanced Multi Smelter (`advanced_multi_smelter`) | MV | Smelts **different recipes at the same time** (cross parallel); +2× parallel for every extra 900 K | GTLCore | Idea | [P] if left to grow without a cap |
| Greenhouse (`greenhouse`) | MV | Automatic wood/resin/crops under sky light | GTLCore | Idea — we already have the GTCA equivalent (`green_house`), **removed by our own `gtca.js`** for being cheaper than our greenhouse family | — |
| Weather Controller (`weather_control`) | MV | Circuit 1/2/3 = clear/rain/storm | GTLCore | Idea | — |
| Lava Furnace (`lava_furnace`) | MV | Furnace with no fuel, fed by lava | GTLCore | Idea | — |

### 4.3 Multiblocks — HV, EV, IV

| Name (id) | Tier | What it gains | Impl | Reusable | Conflict |
|---|---|---|---|---|---|
| Cleaning Maintenance Hatch | HV | Cleanroom inside any multiblock | GTLCore | Idea | — |
| Desulfurizer (`desulfurizer`) | HV | Desulfurization in one step, cross parallel | GTLCore | Idea | — |
| **Fishing Ground** (`fishing_ground`) | HV→EV | Fishing catalyst + loot table: food, Damascus, **ancient gold coin, Zero-Point-Module fragments** | GTLCore | Idea | **[C]** the ZPM loot is a creative battery by chance |
| Void Miner (`void_miner`) | EV (HV recipe) | Fluid + gem slurry + data → 1 of 22 Overworld veins, ~20 %/attempt | GTLCore | Idea | **[V]** ore without a real vein, although it needs a prior line |
| Large Greenhouse (`large_greenhouse`) | EV | Crops/trees under simulated sun, no sky needed | GTLCore | Idea | — |
| Large Gas Collector (`large_gas_collector`) | EV→LuV | Gases simulated by a data catalyst, without being in the dimension | GTLCore | Idea | [Pl] brushes against planetary exclusivity |
| Large Recycler (`large_recycler`) | EV | Trash/items → scrap, ×4 parallel per tier above EV | GTLCore (credit: none) | Idea — we already removed the GTCA equivalent (`recycler`, scrap box with a random item) via `gtca.js` | — |
| Wireless ME Network (AE2 core + marker) | EV | Any ME hatch joins the network without cable, across dimensions | GTLCore + AE2 mixins | No (mixins) | — |
| **24 "Large X" machines in the GCyM style** (Arc Smelter, Assembler, Autoclave, Brewer, Centrifuge, Chemical Bath, Circuit Assembler, Cutter, Distillery, Electrolyzer, Electromagnet, Engraving Laser, Extractor, Extruder, Maceration Tower, Material Press, Mixer, Packer, Pyrolyse Oven, Rock Crusher, Sifting Funnel, Solidifier, Wiremill — see `machines_table2.md` rows `large_*`) | IV | ×0.6 time, ×0.8 EU, parallel hatch; some merge 2-4 recipe types | GTLCore | Idea | — ("same block, bigger" — only the ones that merge types add real complexity) |
| Alloy Blast Smelter / Blaze Blast Furnace (credit: GT++) / Cold Ice Freezer (credit: GT++) | IV | Combines mixer + EBF in one step; BBF fixed ×64 with Liquid Blaze; freezer fixed ×64 with Liquid Ice | GTLCore | Idea (GT++, no confirmed license) | — |
| **Fission Reactor** (`fission_reactor`) | IV | Real fuel/coolant rods, heat with an explosion limit, NaK coolant → supercritical steam, auto-OC | GTLCore | Idea | — (managed plant with real risk: fits our rules) |
| Heat Exchanger (`heat_exchanger`, credit: GTNH) | IV→LuV | Hot fluid → steam/supercritical steam in one step | GTLCore | Idea (GTNH) — we already had the GTCA equivalent and removed it (§2.5) | — |
| Chemical Energy Devourer (`chemical_energy_devourer`) | IV | Combustion + semi-fluid + gas turbine + rocket engine in one controller | GTLCore | Idea | — |
| Digestion Tank / Dissolving Tank (credit: GTNH) | IV | Rare-earth chemistry; wrong fluid ratio eats the input and gives nothing back | GTLCore | Idea (GTNH) | — |
| Disassembler (`disassembly`) | LuV (IV recipe) | Takes hatches/machines apart into parts | GTLCore | Idea | — |

### 4.4 Multiblocks — LuV, ZPM, UV

| Name (id) | Tier | What it gains | Impl | Reusable | Conflict |
|---|---|---|---|---|---|
| Fusion Reactor MK1 (stock) + Compressed Fusion Reactor | LuV | Lossless OC + parallels + laser hatch in the compressed version | GTM + GTLCore | Idea | — |
| Neutron Activator (credit: GTNH), ISA Mill (credit: GTNH), Industrial Flotation Cell (credit: GT++), Vacuum Drying Furnace (credit: GT++) | LuV | Alternate ore line (Rh/Ru/Ir/Os/La/Er/Eu directly); lossless OC | GTLCore | Idea (GTNH/GT++) — **we already installed the real equivalent in GTCA** (IsaMill, Flotation Cell Regulator) and re-gated it to ZPM instead of removing it (`gtca.js`, `FROTH` block) | — |
| Chemical Plant (credit: GCY/Gregicality Legacy, GPL-3.0) | LuV | LCR with parallels | GTLCore | Idea (GCY=GPL-3.0, ideas only) | — |
| Wood Distillation Plant (`wood_distillation`) | LuV | 16 logs + N₂ → ash + ~15 organic fluids with no petroleum | GTLCore | Idea | — |
| Incubator / Large Incubator (`incubator`) | ZPM | Cultures (stem cells, essences, Glacio spirit) | GTLCore | Idea | [Pl] if it generates resources from another planet without going there |
| **Large Void Miner** (`large_void_miner`, credit: GCY) | ZPM | Precise mode (vein essence) or random (≤216 ores/attempt) | GTLCore | Idea (GCY=GPL-3.0) | **[V][P]** the random mode |
| Integrated Ore Processor (credit: GTNH) | ZPM | One circuit (1-7) picks the full ore-processing chain | GTLCore | Idea (GTNH) | — |
| Petrochemical Plant | ZPM | Oil + steam → all fractions with no intermediates | GTLCore | Idea | — |
| Mega Alloy Blast Smelter / Mega Blast Furnace | ZPM | Laser version of ABS/EBF | GTLCore | Idea | — |
| Block Conversion Room / Large (+Conversion Simulation Card, Fast card) | ZPM | Converts world blocks into others (incl. vein essences) | GTLCore | Idea | [V] alternative ore route |
| Decay Hastener (`decay_hastener`) | ZPM | Speeds up decay chains (radium is not mined, it decays) | GTLCore | Idea | — |
| Super Particle Collider (credit: TST, GPL-3.0) | ZPM | Antimatter from accelerated fluids | GTLCore | Idea (TST=GPL-3.0) | — |
| Nano Forge T1 (credit: GTNH) | ZPM | "Swarm" nano economy as a parallel catalyst | GTLCore | Idea (GTNH) | [P] if it is allowed to grow in cascade (T1→T2→T3) |
| Void Fluid Drilling Rig (fluids tied to the planet) | ZPM | Each destination has its own fluid family (He/He-3 Moon, Rn Mars…) | GTLCore | Idea — this does respect "what comes from a planet does not exist on Earth" if it is tied to the dimension | — |
| Space Elevator + modules (Resource Collection, Assembly, Power Module MK1-6) | UV | Mines/drills distant planets without landing, with non-consumable drones | GTLCore (credit: GTNH) | Idea (GTNH) | **[Pl]** exploits a planet without going there — clashes directly with "what comes from a planet does not exist on Earth" unless it is read as "you already went once, now drones" |
| Circuit Assembly Line, Advanced Assembly Line, Component Assembly Line (credit: GTNH) | UV | Robots/catalysts on the input bus decide the parallel | GTLCore | Idea (GTNH) | — |
| Deep Chemical Distorter (credit: TST, GPL-3.0) | UV | Collapses a whole line (PGM, PPS, epoxy…) into one recipe with a swarm catalyst | GTLCore | Idea (TST=GPL-3.0) | — |
| Super Blast Smelter, Mega Vacuum Freezer, Plasma Condenser | UV | Laser version of ABS+Smelter+EBF / freezer / plasma condenser | GTLCore | Idea | — |
| **Large Naquadah Reactor** (credit: GTNH) | UV | Up to 1A MAX; first laser generator | GTLCore | Idea (GTNH) | — |
| Molecular Assembler Matrix (+ cores) | UV | AE2 "Molecular Assembler" with no EU, autocraft without machines | GTLCore + AE2 | No (AE2 mixins) | **[C]** autocraft with no energy cost |
| Gravity Control Hatch | UV | Emulates zero/high gravity anywhere | GTLCore | Idea | — |

### 4.5 Multiblocks — UHV and up (megastructures)

| Name (id) | Tier | What it gains | Impl | Reusable | Conflict |
|---|---|---|---|---|---|
| Laser "Mega X" family (Stellar Forge (credit: GCY), Engraving Laser Plant (credit: TST), PCB Factory (credit: GTNH), Suprachronal Assembly Line (credit: TST), Dimensional Focus Engraving Array, Cooling Tower, Field Extruder Factory (credit: TST), Mega Wiremill/Presser/Extractor/Canner/Distillery (credit: TST), Mega Assembly Plant (credit: GTNH), Crystalline Infinity (credit: TST), Holy Separator (credit: TST), Large Chemical Plant, Rare Earth Centrifuge, Superconducting EM Factory, Transfinite Computation Array) | UHV | Lossless OC + hatch parallel; several merge 3-5 recipe types | GTLCore | Idea (mixed TST/GTNH/GCY credits = all GPL-3.0 or no clear license, ideas only) | — |
| Matter Fabricator (scrap → matter ball / UU amplifier) | UHV | Closes the scrap cycle | GTLCore | Idea | — |
| Advanced Infinite Driller | UEV | Drills all fluids in a 5×5 chunk area at once | GTLCore | Idea | **[V][Pl]** |
| Advanced Integrated Ore Processor (credit: TST) | UEV | Cross parallel of **2.1 billion** | GTLCore | Idea (TST) | **[P]** absurd quantity |
| SPS Crafting / Advanced SPS, Aggregation Device, Magic Manufacturer, Super Computer, Bedrock Drilling Rig | UEV | Makes impossible plasmas/materials in a single block; "cores" (draconic core, etc.); mana as a fluid; infinite bedrock dust | GTLCore | Idea | **[V]** the Bedrock Drilling Rig (infinite bedrock) |
| Neutron Vortex (credit: none) | UIV | **16 777 216 parallels** at speed 2 | GTLCore | Idea | **[P]** |
| Mass Fabricator (credit: GCY), DT Plasma Forge (credit: GTNH), Nano Forge T2 (credit: GTNH), Cosmic Probe Surface Reception (credit: GCY), Stellar Ultimate Material Forge Factory | UIV | Endless UU-matter; cosmic probes as a non-consumable catalyst | GTLCore | Idea (GCY/GTNH) | **[V]** the cosmic probes (resources without going there) |
| **Element Copier** (credit: GCY), **Dragon Egg Copier** | UXV | Duplicates **any** element dust/fluid or world fragment | GTLCore | Idea (GCY=GPL-3.0) | **[C][V]** a copier = the end of scarcity, breaks "every byproduct has an honest destination" |
| Nano Forge T3 (credit: GTNH) + **Nano Core** (credit: TST) | UXV | Stacked swarm economy; successor with no EU except laser | GTLCore | Idea | — |
| **Dyson Sphere Control System** (credit: GTNH) | UXV | Launches up to 10 000 modules; each one +2A MAX | GTLCore | Idea (GTNH) | **[P]** number of modules |
| QFT (credit: GT++) | UXV | Condenses Radox/spacetime wire | GTLCore | Idea | — |
| **Annihilate Generator "Artificial Star"** | OpV | Up to **67 108 864 A MAX** | GTLCore | Idea | **[P][C]** |
| **Eye of Harmony** (credit: GTNH) | OpV (MAX recipe) | "Cosmos simulation": charge goes in, **all** element dusts come out | GTLCore | Idea (GTNH) | **[C]** a truly creative ending (what `docs/viaje.md` already warned about: *"the ending: MAX ends in "creative mode", a dull ending; it has to be avoided"*) |
| Door of Creation, Creative Computer, Creative Aggregator, Creative Power Source, Creative Data Access Hatch, Gravitation Shockburst (command chests) | MAX | Infinite computing, MAX+16 energy, command-block crafting | GTLCore | Not applicable | **[C]** explicit creative mode |

**Count:** 158 cataloged multiblocks (`machines_table2.md`), of which I estimate roughly **25-30 have a marked conflict** (miners/copiers/absurd parallels/creative/market), and the rest (~130) are reusable ideas with no rule clash, although **none** can be copied as a jar/texture/text (§1). On top of that come the non-multiblock QoL items from §4.1 (wireless network, patterns, environment, research, market).

---

## 5. Porting plan — recommendation by group

| Group | Recommendation | Why |
|---|---|---|
| **Boiler boost, small/large (§2.1-2.2)** | **Reimplement via config**: add a `machines.smallBoilers`/`largeBoilers` block with our own factors to `pack/config/gtceu.yaml` (there is no need to copy GTL's exact ×8 — they are just GTM's factory numbers, there is nothing to "port" really, it is our own config key). Zero license risk (it is our own GTM). | It is the part GTL really changes for "more steam"; it does not touch turbines. |
| **EU/mB of combustion/gas/semi-fluid/standard steam** | **Leave alone / nothing to port.** If we really want to lower global fuel consumption, we would have to: (a) accept that it can only be done through a GTCA-style process chain (see next row), or (b) our own Java addon (outside KubeJS scope). | GTL does not do it either; there is no GTL piece to copy here. |
| **Chain "improved steam → much more EU" (Steam Pressurizer/Heat Exchanger/Supercritical Turbine)** | **Gate it to a later era and decide again explicitly; do not reinstate it outright.** It was already removed from GTCA in `integration/gtca.js` for "energy out of nothing". If the user wants it back after reading why, re-enabling it with more expensive recipes (gated to IV/LuV with a real cost) is technically trivial (it is already in the jar we have, LGPL; it is enough to not remove it or to add a more expensive version in KubeJS) — but it is a design decision, not a research finding. | It clashes with an explicit earlier decision of this same pack; it is not an automatic "no", it is an "ask before touching" case. |
| **Wireless network — single-block / "few cables"** | **Document and use what already exists:** EU P2P Tunnel (MIT, already installed). No development task. | It already solves the real use case described by the user, with the best possible license (MIT) and nothing to port. |
| **Wireless network — multiblock bridge between bases/dimensions** | **Adapt via KubeJS**: re-gate the assembly recipe of GTMUtils' WEB Hub/Receiver (currently UHV) to a lower tier (HV, to match the stage where GTL enables its multiblock hatches) by replacing its `assembly_line` recipe with one of ours. Legal (LGPL-3.0, we already have it), technically limited (it is a recipe, not a mixin). | It is the only clean-license path that truly replicates "frequency + dimension crossing"; GTMThings (the one GTL uses) is ARR. |
| **AE2 pattern QoL** (wildcard, pattern box/modifier/relay, buffers) | **Mixed:** `wildcard_pattern` (MIT) can already be installed as is if wanted; the rest (72-slot buffers, isolation, proxy) are GTLCore mixins on AE2 → **reimplementing it in KubeJS is not feasible** (it would need to change AE2 network behavior) and copying it is not legal. First check whether **Extended Features / GTMUtils** (LGPL, already installed) already cover the same gap (several do: expanded buffers, stocking hatches with labels). | It avoids reinventing what the LGPL addons we already have solve. |
| **Environment hatches** (Cleaning/Sterile/Law, Gravity Control) | **Reimplement in KubeJS, gated to a later era** (HV for cleaning — GTM already ships a cleanroom and a standard cleaning hatch, so it is only a recipe/tier variant — and UV/UEV for gravity/sterility when we reach those design eras). | Low complexity; it fits "difficulty from conditions, not from a giant room", which we already use. |
| **Slaughterhouse (automatic mob farm)** | **Reimplement in KubeJS** as a new recipe type gated to LV, with a mob list per circuit and a "virtual drops" mode (works on Peaceful). The only thing we do not have today, and it fills a real gap (auto food/leather/gunpowder from LV). | It does not overlap any existing family of ours; GTL itself gates it at LV, consistent with our own schedule. |
| **Universal Factories / merging several recipe types in one controller** | **Take the idea, not the scale.** When we design a new MV/HV multiblock, use "merges N recipe types" as the test of what it "gains" (it is already rule 4 of `AGENTS.md`), not as a 1:1 copy of the Universal Factories. | We already have our own family per era; we do not need one more piece competing with it. |
| **The 24 IV "Large X" machines (GCyM family)** | **Skip.** Earlier research (`gtl_body.md` §4) already marked them as "same block, bigger" with no real gain in complexity, except those that merge 2-4 types (those yes, see the previous row). | Repeating that only inflates the count, against rule 2. |
| **Managed fission reactor (rods, heat, explosion, NaK coolant)** | **Adapt/gate to a later era** (IV, as in GTL) and design it in detail when that era comes up — it is the best candidate in all of GTL for "power from real complexity" (explosion risk, coolant with a coefficient, auto-OC). | GTM does not ship fission as standard; it adds something we really do not have and fits rule 2. |
| **Research stack (Research Station/HPCA/Data Bank)** | **Already exists in stock GTM.** Only port what GTL adds on top: wireless optical hatches — and we already have that via Extended Features (LGPL). | Zero real extra work. |
| **UHV+ laser "Mega X" family (merges 3-5 types, lossless OC)** | **Defer** until we design those eras (today the pack is at HV/EV/IV, per the checkpoints). Good pattern to reimplement then. | Not urgent; it keeps the principle "each era is designed when we get to it" from `AGENTS.md`. |
| **Void miners (Void Miner, Large Void Miner, Advanced Infinite Driller, Bedrock Drilling Rig, Primitive Void Ore Miner)** | **Skip.** | Direct conflict with the rule "no resource without a vein or planet" — these are mining without a vein by design. |
| **Space Elevator + drones (mining another planet without going there)** | **Skip as is; adapt with nuance if something similar is wanted.** If the idea of "scan and automate from a distance" is reintroduced, it must first require **a real base already built on the planet** (consistent with our own rule that "what comes from a planet does not exist on Earth" and with the play mode already decided: first you visit and automate in person, EV-LuV, then you operate from orbit). | We already flagged it as a conflict in `docs/viaje.md`/`CREDITS.md` (veins scanned once = ideas only). |
| **Element Copier / Dragon Egg Copier** | **Skip.** | Removes scarcity; breaks rule 3 ("every byproduct has an honest destination"). |
| **Absurd parallels** (Neutron Vortex 16.7M, Advanced Integrated Ore Processor 2.1 billion, Infinity+ coils, MAX parallel hatch) | **Skip the number; keep the "catalyst/condition" if there is one** (e.g. "+2 parallel for every extra 900 K" is a good rule if it is capped low, ≤64). | Rule 2: difficulty does not rise through raw quantity. |
| **"Creative" ending (Eye of Harmony, Door of Creation, Creative Computer/Aggregator/Power Source, command chests)** | **Skip entirely.** | `docs/viaje.md` already says it: *"the ending: MAX ends in "creative mode", a dull ending; it has to be avoided"*. Our own ending (the mirror shell over Sagittarius A\*) is already the alternative. |
| **Small Market (buying shortcuts with quest credits)** | **Skip.** | Rule 5: quests give small rewards, never progression shortcuts. |

---

## Executive summary

| Question | Short answer |
|---|---|
| **Is GTL permissive?** | Not as much as the user thinks. The modpack itself declares **CC BY-NC-SA 4.0** in the zip and **LGPLv3** on CurseForge — a contradiction at the source. GTLCore says "LGPL" over a base that admits GPL/AGPL code (Epimorphism Modern). GTMThings (the wireless hatch mod) is **All Rights Reserved** despite what its `mods.toml` says. The textures are borrowed from 5 other projects (GPL/LGPL/MIT/AGPL), and GTL has no right to pass them on either. Verdict, unchanged: **ideas only, never jar/texture/text**. |
| **Power** | GTL multiplies the output of the 6 small boilers by **×8**, and the temperature ceiling of the 4 large boilers (`machines.smallBoilers`/`largeBoilers` in `cfg/gtceu.yaml`); the water→steam conversion (`steamPerWater`) **does not change** (160). **No change was found** to the EU/mB of combustion, gas, semi-fluid or standard steam — the turbines are still GTM's factory ones; GTL only feeds them much more steam and offers optional new generators (Naquadah Reactor, its own Supercritical Steam Turbine, Chemical Energy Devourer). Important: we already **removed an almost identical chain from GTCA** (Steam Pressurizer → Supercritical Turbine) for being "energy out of nothing" — any reintroduction must be a conscious decision, not a copy. |
| **Wireless energy** | They are not covers: they are **hatches with a frequency** (GTMThings mod, ARR, not redistributable) that link to your network/team and cross dimensions; LV only for standalone blocks, multiblocks wait for higher amperage bands. Option A (including the jar) discarded: same Modrinth project as our GTM but a much older build (1.4.4 vs 7.5.3), with ~270 mixins and a dependency on GTL's KubeJS. **We already have two real pieces with a clean license**: EU P2P Tunnel (MIT, works now, via the ME network) for "few cables" from early on, and the WEB Hub/Receiver of GregTech Modern Utilities (LGPL-3.0, already installed) as a truly frequency-based multiblock bridge — but it comes gated to UHV out of the box, so it would need re-tiering via KubeJS to HV to match how GTL feels. Recommendation: **Option C combined**, neither pure A nor pure B. |
| **QoL and multiblocks** | **158 multiblocks** cataloged, plus a group of non-multiblock QoL (wireless network, AE2 patterns, environment hatches, maintenance, research stack, quest market). About **25-30** clash with our rules (miners/copiers without a vein, million-scale parallels, "creative" ending, coin market, planetary mining without going there) — they are all listed and flagged alike, nothing is hidden. The rest (~130) are ideas with no rule clash, but **none** is literally copyable (§1). |
| **Top conflicts to watch** | (1) Void miners/drills and element copiers — they mine or duplicate without a vein/planet. (2) Million-scale parallels (Neutron Vortex, Advanced Integrated Ore Processor, Infinity+ coils). (3) MAX ending in "creative mode" (Eye of Harmony, Door of Creation, Creative Computer). (4) Small Market (quest credits → shortcuts). (5) Space Elevator with drones mining planets without going there — clashes with our own planetary exclusivity rule. (6) We already rejected the "cheap" power chain once in GTCA; repeating it with another mod would contradict ourselves without meaning to. |

---

*Research report only — no file in `pack/` has been touched. File: `research/gtl/leisure-port.md`.*

