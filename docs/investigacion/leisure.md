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

## 4. QoL y multibloques propios — lista completa por era

Fuente primaria de esta sección: `machines_table2.md` (las 158 estructuras de GTLCore, generadas del bytecode decompilado: id, tier de receta, crédito en el tooltip, tipo(s) de receta, tamaño) cruzado con la prosa por era de `gtl_body.md` (qué gana cada una). Columna **Reutilizable**: todo es "solo ideas" (§1); indico entre paréntesis si GTL mismo créditó una fuente externa (esa fuente tiene su propia licencia, no la de GTL). Columna **Conflicto** marca choques con nuestras reglas: **[V]** minero/recurso sin veta o planeta, **[C]** "creativo"/sin coste real, **[P]** paralelos/cantidades absurdas, **[$]** mercado de monedas, **[Pl]** rompe exclusividad planetaria (extrae de un planeta sin ir).

### 4.1 QoL que no es un multibloque (herramientas, red, entorno)

| Función | Tier | Qué gana | Implementación | Reutilizable | Conflicto |
|---|---|---|---|---|---|
| Red de energía inalámbrica (hatches por frecuencia) | LV (1 bloque) → HV (multibloque) → 16A | Evita tender cable | GTMThings (Java, ARR) | No (ARR) — ver §3 | — |
| Wireless covers / wireless monitor / wireless interface | LV | Ver/gestionar una máquina a distancia | GTMThings (Java, ARR) | No (ARR) | — |
| Scanner de datos mundiales (World Data Scanner) → `overworld/nether/end_data` | LV→EV | "Escanea una vez" y el dato (no consumible) habilita recolectores de gas/mineros de vacío/incubadoras para siempre | GTLCore (Java) | Idea sí | [V] si se usa para minar sin veta |
| Patrones AE2: wildcard pattern tool, throughput monitor, ME Pattern Relay, Pattern Modifier, Configuration Copy Tool, Pattern Box (36/página), ME Pattern Buffer (aislado, proxy, 72 slots) | LV→UHV | Logística de patrones a gran escala sin miles de Interfaces | `wildcard_pattern` (MIT, reusable tal cual) + GTLCore (mixins AE2, no reusable) | Parcial (solo la MIT) | — |
| Hatches de ambiente: Cleaning (HV) → Sterile (ZPM) → Law (UEV); Gravity Control Hatch (0/1-99/100, UV) | HV→UEV | Sustituyen la sala limpia / emulan gravedad cero o alta sin ir a una estación | GTLCore (Java) | Idea sí — GTM ya trae cleanroom y hatch de limpieza; lo nuevo es "ambiente como pieza" | — |
| Mantenimiento: Auto Maintenance Hatch, Configurable Maintenance Hatch | HV→IV | Nunca se avería / tiempo de receta ajustable sin más EU | GTLCore (Java) | Idea con matiz | [C] la Configurable (tiempo gratis, ver §4.4) |
| Pila de investigación: Research Station + Object Holder + HPCA + fibra óptica, Data Access Hatch → Data Bank → hatches ópticos (cableados/inalámbricos) | LuV→UHV | Investigación como recurso (CWU/t) | GTM de serie + GTLCore (hatches inalámbricos) | Idea sí (ya tenemos Extended Features con hatches ópticos inalámbricos, LGPL) | — |
| Pequeño mercado de misiones ("Small Market"): créditos → Bottle of Time, Fermium flight armour, Vajra, ítems de Avaritia | — | Atajos comprables | Misiones + Re-Avaritia | No | [$] |

### 4.2 Multibloques — Vapor, LV, MV (ULV→MV)

| Nombre (id) | Tier | Qué gana | Impl | Reutilizable | Conflicto |
|---|---|---|---|---|---|
| Familia de multibloques de vapor pequeños (martillo, compresor, fundición de aleación, mezclador, baño, lavadora — 6 bloques) | Vapor | **8 paralelos** sobre la receta de un bloque | GTLCore (`LargeSteamParallelMultiblockMachine`) | Idea sí | — |
| Familia "Large Steam X" (macerador, centrífuga, térmica, baño, lavadora, ensamblador — 7 bloques) | Vapor→LV | **64 paralelos**; el de circuitos usa un núcleo de Ensamblador Molecular de AE2 | GTLCore | Idea sí | — |
| Steam Oven (de serie, retocado) | Vapor | 256 paralelos en horno | GTM + ajuste | Idea sí | — |
| **Dimensionally Transcendent Steam Oven / Dirt Forge** (`dimensionally_transcendent_steam_oven`, `_dirt_forge`) | Vapor | Sin energía, **524 288 paralelos** | GTLCore (créd. GTNH) | Idea (GTNH, sin licencia clara → solo ideas) | **[C][P]** atajo puro, puente de acero sin coste |
| **Primitive Void Ore Miner** (`primitive_void_ore`, apagado por config) | Vapor | 64 minerales en bruto aleatorios **por tick** | GTLCore | Idea | **[V][P]** |
| Ancient Reactor Core (altar 3×3) | Vapor | Abre la dimensión "Ancient World" (mineral más rico) | KubeJS | Idea | — |
| Generator Array (`generator_array`) | LV | Hasta 16 generadores apilados, salida ×2; modo "red inalámbrica" | GTLCore | Idea | — |
| Industrial Slaughterhouse (`slaughterhouse`) | LV | Granja de mobs: circuito 1/2 elige lista pasiva/hostil, drops virtuales (sirve en Pacífico) o entidades reales | GTLCore | Idea | — |
| Universal Factories: Processing (11 tipos), Assembly (2), Separation (7), Mixing (4) — `processing_plant`, `assemble_plant`, `separated_plant`, `mixed_plant` | MV | Metes el bloque de un solo tier dentro del controlador; un 3×3×3 cubre 11-24 tipos de receta | GTLCore (créd. GTNH) | Idea (GTNH) | — |
| Advanced Multi Smelter (`advanced_multi_smelter`) | MV | Funde **recetas distintas a la vez** (paralelo cruzado); +2× paralelo por cada 900 K de más | GTLCore | Idea | [P] si se deja crecer sin tope |
| Greenhouse (`greenhouse`) | MV | Auto madera/resina/cultivos con luz de cielo | GTLCore | Idea — ya tenemos el equivalente en GTCA (`green_house`), **retirado por nuestro propio `gtca.js`** por ser más barato que nuestra familia de invernaderos | — |
| Weather Controller (`weather_control`) | MV | Circuito 1/2/3 = clima despejado/lluvia/tormenta | GTLCore | Idea | — |
| Lava Furnace (`lava_furnace`) | MV | Horno sin combustible, alimentado por lava | GTLCore | Idea | — |

### 4.3 Multibloques — HV, EV, IV

| Nombre (id) | Tier | Qué gana | Impl | Reutilizable | Conflicto |
|---|---|---|---|---|---|
| Cleaning Maintenance Hatch | HV | Sala limpia dentro de cualquier multibloque | GTLCore | Idea | — |
| Desulfurizer (`desulfurizer`) | HV | Desulfuración en un paso, paralelo cruzado | GTLCore | Idea | — |
| **Fishing Ground** (`fishing_ground`) | HV→EV | Catalizador de pesca + tabla de botín: comida, Damascus, **moneda de oro antigua, fragmentos de Zero-Point-Module** | GTLCore | Idea | **[C]** el botín de ZPM es batería creativa por azar |
| Void Miner (`void_miner`) | EV (receta HV) | Fluido + lechada de gema + dato → 1 de 22 vetas del Overworld, ~20 %/intento | GTLCore | Idea | **[V]** mineral sin veta real, aunque exige una línea previa |
| Large Greenhouse (`large_greenhouse`) | EV | Cultivos/árboles con sol simulado, sin necesitar cielo | GTLCore | Idea | — |
| Large Gas Collector (`large_gas_collector`) | EV→LuV | Gases simulados por catalizador de datos, sin estar en la dimensión | GTLCore | Idea | [Pl] roza la exclusividad planetaria |
| Large Recycler (`large_recycler`) | EV | Basura/objetos → chatarra, ×4 paralelo/tier sobre EV | GTLCore (créd. ninguno) | Idea — nosotros ya quitamos el equivalente de GTCA (`recycler`, scrap box de ítem aleatorio) por `gtca.js` | — |
| Wireless ME Network (núcleo AE2 + marcador) | EV | Cualquier hatch de ME se une a la red sin cable, cruzando dimensión | GTLCore + mixins AE2 | No (mixins) | — |
| **24 máquinas "Large X" estilo GCyM** (Arc Smelter, Assembler, Autoclave, Brewer, Centrifuge, Chemical Bath, Circuit Assembler, Cutter, Distillery, Electrolyzer, Electromagnet, Engraving Laser, Extractor, Extruder, Maceration Tower, Material Press, Mixer, Packer, Pyrolyse Oven, Rock Crusher, Sifting Funnel, Solidifier, Wiremill — ver `machines_table2.md` filas `large_*`) | IV | ×0,6 tiempo, ×0,8 EU, hatch de paralelo; algunas fusionan 2-4 tipos de receta | GTLCore | Idea | — ("mismo bloque, más grande" — solo las que fusionan tipos aportan complejidad real) |
| Alloy Blast Smelter / Blaze Blast Furnace (créd. GT++) / Cold Ice Freezer (créd. GT++) | IV | Funde mezclador+EBF en un paso; BBF fijo ×64 con Liquid Blaze; freezer fijo ×64 con Liquid Ice | GTLCore | Idea (GT++, sin licencia confirmada) | — |
| **Fission Reactor** (`fission_reactor`) | IV | Barras de combustible/refrigerante reales, calor con límite de explosión, refrigerante NaK→vapor supercrítico, auto-OC | GTLCore | Idea | — (central gestionada, con riesgo real: encaja con nuestras reglas) |
| Heat Exchanger (`heat_exchanger`, créd. GTNH) | IV→LuV | Fluido caliente → vapor/vapor supercrítico en un solo paso | GTLCore | Idea (GTNH) — ya tuvimos el equivalente de GTCA y lo retiramos (§2.5) | — |
| Chemical Energy Devourer (`chemical_energy_devourer`) | IV | Combustión + semifluido + turbina de gas + motor de cohete en un controlador | GTLCore | Idea | — |
| Digestion Tank / Dissolving Tank (créd. GTNH) | IV | Química de tierras raras; proporción de fluido incorrecta devora la entrada sin dar nada | GTLCore | Idea (GTNH) | — |
| Disassembler (`disassembly`) | LuV (receta IV) | Deshace hatches/máquinas en piezas | GTLCore | Idea | — |

### 4.4 Multibloques — LuV, ZPM, UV

| Nombre (id) | Tier | Qué gana | Impl | Reutilizable | Conflicto |
|---|---|---|---|---|---|
| Fusion Reactor MK1 (de serie) + Compressed Fusion Reactor | LuV | OC sin pérdidas + paralelos + hatch láser en la versión comprimida | GTM + GTLCore | Idea | — |
| Neutron Activator (créd. GTNH), ISA Mill (créd. GTNH), Industrial Flotation Cell (créd. GT++), Vacuum Drying Furnace (créd. GT++) | LuV | Línea alterna de minerales (Rh/Ru/Ir/Os/La/Er/Eu directo); OC sin pérdidas | GTLCore | Idea (GTNH/GT++) — **ya instalamos el equivalente real en GTCA** (IsaMill, Flotation Cell Regulator) y lo re-gateamos a ZPM, no lo quitamos (`gtca.js`, bloque `FROTH`) | — |
| Chemical Plant (créd. GCY/Gregicality Legacy, GPL-3.0) | LuV | LCR con paralelos | GTLCore | Idea (GCY=GPL-3.0, solo ideas) | — |
| Wood Distillation Plant (`wood_distillation`) | LuV | 16 troncos + N₂ → ceniza + ~15 fluidos orgánicos sin petróleo | GTLCore | Idea | — |
| Incubator / Large Incubator (`incubator`) | ZPM | Cultivos (células madre, esencias, espíritu de Glacio) | GTLCore | Idea | [Pl] si genera recursos de otro planeta sin ir |
| **Large Void Miner** (`large_void_miner`, créd. GCY) | ZPM | Modo preciso (esencia de veta) o aleatorio (≤216 minerales/intento) | GTLCore | Idea (GCY=GPL-3.0) | **[V][P]** el modo aleatorio |
| Integrated Ore Processor (créd. GTNH) | ZPM | Un circuito (1-7) elige la cadena completa de proceso de mineral | GTLCore | Idea (GTNH) | — |
| Petrochemical Plant | ZPM | Petróleo+vapor → todas las fracciones sin intermedios | GTLCore | Idea | — |
| Mega Alloy Blast Smelter / Mega Blast Furnace | ZPM | Versión láser de ABS/EBF | GTLCore | Idea | — |
| Block Conversion Room / Large (+Conversion Simulation Card, Fast card) | ZPM | Convierte bloques del mundo en otros (incl. esencias de veta) | GTLCore | Idea | [V] ruta alternativa de minerales |
| Decay Hastener (`decay_hastener`) | ZPM | Acelera cadenas de desintegración (no se mina radio, se desintegra) | GTLCore | Idea | — |
| Super Particle Collider (créd. TST, GPL-3.0) | ZPM | Antimateria desde fluidos acelerados | GTLCore | Idea (TST=GPL-3.0) | — |
| Nano Forge T1 (créd. GTNH) | ZPM | Economía de "enjambre" nano como catalizador de paralelo | GTLCore | Idea (GTNH) | [P] si se deja crecer en cascada (T1→T2→T3) |
| Void Fluid Drilling Rig (fluidos atados al planeta) | ZPM | Cada destino da su propia familia de fluidos (He/He-3 Luna, Rn Marte…) | GTLCore | Idea — esto sí respeta "lo de un planeta no sale en la Tierra" si se ata a la dimensión | — |
| Space Elevator + módulos (Resource Collection, Assembly, Power Module MK1-6) | UV | Mina/perfora planetas lejanos sin bajar, con drones no consumibles | GTLCore (créd. GTNH) | Idea (GTNH) | **[Pl]** explota un planeta sin ir — choca directo con "lo que sale de un planeta no se hace en la Tierra" salvo que se interprete como "ya fuiste una vez, ahora drones" |
| Circuit Assembly Line, Advanced Assembly Line, Component Assembly Line (créd. GTNH) | UV | Robots/catalizadores en el bus de entrada deciden el paralelo | GTLCore | Idea (GTNH) | — |
| Deep Chemical Distorter (créd. TST, GPL-3.0) | UV | Colapsa una línea entera (PGM, PPS, epoxi…) en una receta con catalizador de enjambre | GTLCore | Idea (TST=GPL-3.0) | — |
| Super Blast Smelter, Mega Vacuum Freezer, Plasma Condenser | UV | Versión láser de ABS+Smelter+EBF / freezer / condensador de plasma | GTLCore | Idea | — |
| **Large Naquadah Reactor** (créd. GTNH) | UV | Hasta 1A MAX; primer generador láser | GTLCore | Idea (GTNH) | — |
| Molecular Assembler Matrix (+ núcleos) | UV | "Ensamblador molecular" de AE2 sin EU, autocraft sin máquinas | GTLCore + AE2 | No (mixins AE2) | **[C]** autocraft sin coste de energía |
| Gravity Control Hatch | UV | Emula gravedad cero/alta en cualquier sitio | GTLCore | Idea | — |

### 4.5 Multibloques — UHV en adelante (megaestructuras)

| Nombre (id) | Tier | Qué gana | Impl | Reutilizable | Conflicto |
|---|---|---|---|---|---|
| Familia "Mega X" láser (Stellar Forge créd. GCY, Engraving Laser Plant créd. TST, PCB Factory créd. GTNH, Suprachronal Assembly Line créd. TST, Dimensional Focus Engraving Array, Cooling Tower, Field Extruder Factory créd. TST, Mega Wiremill/Presser/Extractor/Canner/Distillery créd. TST, Mega Assembly Plant créd. GTNH, Crystalline Infinity créd. TST, Holy Separator créd. TST, Large Chemical Plant, Rare Earth Centrifuge, Superconducting EM Factory, Transfinite Computation Array) | UHV | OC sin pérdidas + paralelo de hatch; varias fusionan 3-5 tipos de receta | GTLCore | Idea (créditos mixtos TST/GTNH/GCY = todos GPL-3.0 o sin licencia clara, solo ideas) | — |
| Matter Fabricator (chatarra→bola de materia/amplificador UU) | UHV | Cierra el ciclo de la chatarra | GTLCore | Idea | — |
| Advanced Infinite Driller | UEV | Perfora todos los fluidos de un área de 5×5 chunks a la vez | GTLCore | Idea | **[V][Pl]** |
| Advanced Integrated Ore Processor (créd. TST) | UEV | Paralelo cruzado de **2,1 mil millones** | GTLCore | Idea (TST) | **[P]** cantidad absurda |
| SPS Crafting / Advanced SPS, Aggregation Device, Magic Manufacturer, Super Computer, Bedrock Drilling Rig | UEV | Fabrica plasmas/materiales imposibles en bloque suelto; "núcleos" (core draconico, etc.); maná como fluido; polvo de bedrock infinito | GTLCore | Idea | **[V]** el Bedrock Drilling Rig (bedrock infinito) |
| Neutron Vortex (créd. ninguno) | UIV | **16 777 216 paralelos** a la velocidad de 2 | GTLCore | Idea | **[P]** |
| Mass Fabricator (créd. GCY), DT Plasma Forge (créd. GTNH), Nano Forge T2 (créd. GTNH), Cosmic Probe Surface Reception (créd. GCY), Stellar Ultimate Material Forge Factory | UIV | UU-matter sin fin; sondas cósmicas como catalizador no consumible | GTLCore | Idea (GCY/GTNH) | **[V]** las sondas cósmicas (recursos sin ir) |
| **Element Copier** (créd. GCY), **Dragon Egg Copier** | UXV | Duplica **cualquier** polvo/fluido de elemento o fragmento de mundo | GTLCore | Idea (GCY=GPL-3.0) | **[C][V]** copiadora = fin de la escasez, rompe "cada subproducto tiene un destino honesto" |
| Nano Forge T3 (créd. GTNH) + **Nano Core** (créd. TST) | UXV | Economía de enjambre apilada; sucesor sin EU salvo láser | GTLCore | Idea | — |
| **Dyson Sphere Control System** (créd. GTNH) | UXV | Lanza hasta 10 000 módulos; cada uno +2A MAX | GTLCore | Idea (GTNH) | **[P]** número de módulos |
| QFT (créd. GT++) | UXV | Condensa Radox/alambre de espacio-tiempo | GTLCore | Idea | — |
| **Annihilate Generator "Artificial Star"** | OpV | Hasta **67 108 864 A MAX** | GTLCore | Idea | **[P][C]** |
| **Eye of Harmony** (créd. GTNH) | OpV (receta MAX) | "Simulación del cosmos": entra carga, salen **todos** los polvos de elemento | GTLCore | Idea (GTNH) | **[C]** final creativo de verdad (lo que `docs/viaje.md` ya advirtió: *"el final: MAX acaba en modo creativo, un final sin gracia; hay que evitarlo"*) |
| Door of Creation, Creative Computer, Creative Aggregator, Creative Power Source, Creative Data Access Hatch, Gravitation Shockburst (cofres de comandos) | MAX | Cómputo infinito, energía MAX+16, crafteo de bloques de comando | GTLCore | No procede | **[C]** modo creativo explícito |

**Recuento:** 158 multibloques catalogados (`machines_table2.md`), de los cuales calculo del orden de **25-30 con conflicto marcado** (mineros/copiadoras/paralelos absurdos/creativo/mercado), y el resto (~130) son ideas reutilizables sin choque de regla, aunque **ninguno** se puede copiar como jar/textura/texto (§1). A eso se suman los QoL no-multibloque de §4.1 (red inalámbrica, patrones, entorno, investigación, mercado).

---

## 5. Plan de portado — recomendación por grupo

| Grupo | Recomendación | Por qué |
|---|---|---|
| **Boost de calderas pequeñas/grandes (§2.1-2.2)** | **Reimplementar vía config**: añadir a `pack/config/gtceu.yaml` un bloque `machines.smallBoilers`/`largeBoilers` con factores propios (no hace falta copiar el ×8 exacto de GTL — son solo números de fábrica de GTM, no hay nada que "portar" realmente, es una clave de config nuestra). Cero riesgo de licencia (es nuestro propio GTM). | Es la pieza que GTL de verdad cambia para "más vapor"; no toca turbinas. |
| **EU/mB de combustión/gas/semifluido/vapor estándar** | **No tocar / no hay nada que portar.** Si de verdad se quiere bajar el consumo global de combustible habría que: (a) aceptar que solo se puede hacer vía una cadena de proceso tipo GTCA (ver siguiente fila), o (b) un addon Java propio (fuera de alcance de KubeJS). | GTL tampoco lo hace; no existe una pieza de GTL que copiar aquí. |
| **Cadena "vapor mejorado → mucho más EU" (Steam Pressurizer/Heat Exchanger/Supercritical Turbine)** | **Gatear a una era posterior y re-decidir explícitamente, no reinstaurar sin más.** Ya se quitó de GTCA en `integration/gtca.js` por "energía de la nada". Si el usuario, tras leer el porqué, la quiere de vuelta, re-habilitarla con recetas más caras (gated a IV/LuV con coste real) es técnicamente trivial (ya está en el jar que tenemos, LGPL, basta con no removerla o añadir una versión más cara en KubeJS) — pero es una decisión de diseño, no un hallazgo de investigación. | Choca con una decisión previa explícita de este mismo pack; no es un "no" automático, es un "pregunta antes de tocar". |
| **Red inalámbrica — single-block / "pocos cables"** | **Documentar y usar lo que ya existe:** EU P2P Tunnel (MIT, ya instalado). Ninguna tarea de desarrollo. | Ya resuelve el caso de uso real descrito por el usuario, con la mejor licencia posible (MIT) y sin nada que portar. |
| **Red inalámbrica — puente multibloque entre bases/dimensiones** | **Adaptar vía KubeJS**: re-gatear la receta de ensamblaje del WEB Hub/Receiver de GTMUtils (hoy UHV) a un tier más bajo (HV, para igualar el tramo en que GTL habilita sus hatches de multibloque) sustituyendo su receta `assembly_line` por una nuestra. Legal (LGPL-3.0, ya lo tenemos), técnicamente acotado (es una receta, no un mixin). | Es el único camino con licencia limpia que replica de verdad "frecuencia + cruce de dimensión"; GTMThings (el que usa GTL) es ARR. |
| **QoL de patrones de AE2** (wildcard, pattern box/modifier/relay, buffers) | **Mezcla:** `wildcard_pattern` (MIT) ya es instalable tal cual si se desea; el resto (buffers de 72 slots, aislamiento, proxy) son mixins de GTLCore sobre AE2 → **reimplementar en KubeJS es inviable** (hace falta tocar comportamiento de red AE2) y copiarlo no es legal. Mirar antes si **Extended Features / GTMUtils** (LGPL, ya instalados) ya cubren el mismo hueco (varios lo hacen: buffers expandidos, hatches de stock con etiqueta). | Evita reinventar lo que addons LGPL ya instalados resuelven. |
| **Hatches de ambiente** (Cleaning/Sterile/Law, Gravity Control) | **Reimplementar en KubeJS, gateado a una era posterior** (HV para limpieza — GTM ya trae cleanroom y un hatch de limpieza de serie, así que es solo una variante de recipe/tier — y UV/UEV para gravedad/esterilidad cuando lleguemos a esas eras de diseño). | Baja complejidad, encaja con "la dificultad por condiciones, no por sala gigante" que ya usamos. |
| **Slaughterhouse (granja de mobs automática)** | **Reimplementar en KubeJS** como type de receta nuevo gateado a LV, con lista de mobs por circuito y modo "drops virtuales" (sirve en Pacífico). Lo único que no tenemos hoy y llena un hueco real (auto-comida/cuero/pólvora desde LV). | No pisa ninguna familia nuestra existente; GTL mismo lo gatea en LV, coherente con nuestro propio calendario. |
| **Universal Factories / fusión de varios tipos de receta en un controlador** | **Tomar la idea, no la escala.** Cuando diseñemos un multibloque nuevo de MV/HV, usar "fusiona N tipos de receta" como criterio de qué "gana" (ya es la regla 4 de `AGENTS.md`), no como copia 1:1 de las Universal Factories. | Ya tenemos nuestra propia familia por era; no hace falta una pieza más que compita con ella. |
| **Las 24 "Large X" de IV (familia GCyM)** | **Omitir.** La investigación previa (`gtl_body.md` §4) ya las marcó como "mismo bloque, más grande" sin ganar complejidad real, salvo las que fusionan 2-4 tipos (esas sí, ver fila anterior). | Repetir eso solo infla cantidad, contra la regla 2. |
| **Fission Reactor gestionado (barras, calor, explosión, refrigerante NaK)** | **Adaptar/gatear a una era posterior** (IV, como en GTL) y diseñarlo cuando toque esa era en detalle — es el mejor candidato de todo GTL para "potencia por complejidad real" (riesgo de explosión, refrigerante con coeficiente, auto-OC). | GTM no trae fisión de serie; aporta algo que de verdad no tenemos y encaja con la regla 2. |
| **Pila de investigación (Research Station/HPCA/Data Bank)** | **Ya existe en GTM de serie.** Solo portar lo que GTL añade encima: hatches ópticos inalámbricos — y eso ya lo tenemos vía Extended Features (LGPL). | Cero trabajo adicional real. |
| **Familia "Mega X" láser de UHV+ (fusiona 3-5 tipos, OC sin pérdidas)** | **Diferir** a cuando diseñemos esas eras (hoy el pack va por HV/EV/IV según los checkpoints). Buen patrón a reimplementar entonces. | No es urgente; mantiene el principio de "cada era se diseña al llegar a ella" de `AGENTS.md`. |
| **Mineros de vacío (Void Miner, Large Void Miner, Advanced Infinite Driller, Bedrock Drilling Rig, Primitive Void Ore Miner)** | **Omitir.** | Conflicto directo con la regla "ningún recurso sin veta o planeta" — son minería sin veta por diseño. |
| **Space Elevator + drones (minar otro planeta sin ir)** | **Omitir tal cual; adaptar con matiz si se quiere algo similar.** Si se reintroduce la idea de "escanear y automatizar a distancia", debe exigir **una base real ya construida en el planeta** primero (coherente con nuestra propia regla de "lo que sale de un planeta no se hace en la Tierra" y con el modo de juego ya decidido: primero se visita y automatiza en persona, EV-LuV, luego se opera desde la órbita). | Ya lo marcamos como conflicto en `docs/viaje.md`/`CREDITS.md` (vetas escaneadas una vez = solo ideas). |
| **Element Copier / Dragon Egg Copier** | **Omitir.** | Elimina la escasez; rompe la regla 3 ("cada subproducto tiene un destino honesto"). |
| **Paralelos absurdos** (Neutron Vortex 16,7M, Advanced Integrated Ore Processor 2,1 mil millones, Infinity+ coils, MAX parallel hatch) | **Omitir el número; quedarse con el "catalizador/condición" si lo hay** (p. ej. "+2 paralelo por cada 900 K de más" es una buena regla si se tapa con un techo bajo, ≤64). | Regla 2: la dificultad no sube por cantidad bruta. |
| **Final "creativo" (Eye of Harmony, Door of Creation, Creative Computer/Aggregator/Power Source, cofres de comando)** | **Omitir por completo.** | Ya lo dice `docs/viaje.md`: *"el final: MAX acaba en modo creativo, un final sin gracia; hay que evitarlo"*. Nuestro propio final (la concha de espejos sobre Sagitario A\*) ya es la alternativa. |
| **Small Market (comprar atajos con créditos de misión)** | **Omitir.** | Regla 5: las misiones dan premio pequeño, nunca atajos de progresión. |

---

## Resumen ejecutivo

| Pregunta | Respuesta corta |
|---|---|
| **¿Es GTL permisivo?** | No tanto como cree el usuario. El propio modpack se autodeclara **CC BY-NC-SA 4.0** en el zip y **LGPLv3** en CurseForge — contradicción de origen. GTLCore dice "LGPL" sobre una base que admite código GPL/AGPL (Epimorphism Modern). GTMThings (el mod del hatch inalámbrico) es **All Rights Reserved** pese a lo que diga su `mods.toml`. Las texturas son prestadas de otros 5 proyectos (GPL/LGPL/MIT/AGPL) y ni GTL tiene derecho a cederlas. Veredicto que se mantiene: **solo ideas, nunca jar/textura/texto**. |
| **Power** | GTL multiplica **×8** la salida de las 6 calderas pequeñas y el techo de temperatura de las 4 calderas grandes (`machines.smallBoilers`/`largeBoilers` en `cfg/gtceu.yaml`); la conversión agua→vapor (`steamPerWater`) **no cambia** (160). **No se encontró ningún cambio** al EU/mB de combustión, gas, semifluido ni vapor estándar — las turbinas siguen siendo las de GTM de fábrica; GTL solo las alimenta con mucho más vapor y ofrece generadores nuevos opcionales (Naquadah Reactor, Supercritical Steam Turbine propio, Chemical Energy Devourer). Importante: ya **retiramos una cadena casi idéntica de GTCA** (Steam Pressurizer → Supercritical Turbine) por ser "energía de la nada" — cualquier reintroducción debe ser una decisión consciente, no un calco. |
| **Energía inalámbrica** | No son covers: son **hatches con frecuencia** (mod GTMThings, ARR, no redistribuible) que se vinculan a tu red/equipo y cruzan dimensión; LV solo para bloques sueltos, los multibloques esperan a tramos de amperaje mayores. Opción A (incluir el jar) descartada: mismo proyecto Modrinth que nuestro GTM pero una build mucho más vieja (1.4.4 vs 7.5.3), con ~270 mixins y dependencia del KubeJS de GTL. **Ya tenemos dos piezas reales y con licencia limpia**: EU P2P Tunnel (MIT, funciona ya, vía red ME) para "pocos cables" desde pronto, y el WEB Hub/Receiver de GregTech Modern Utilities (LGPL-3.0, ya instalado) como puente multibloque de verdad por frecuencia — pero viene gateado a UHV de fábrica, habría que re-tierarlo por KubeJS a HV para igualar la sensación de GTL. Recomendación: **Opción C combinada**, no A ni B puras. |
| **QoL y multibloques** | **158 multibloques** catalogados + un bloque de QoL no-multibloque (red inalámbrica, patrones AE2, hatches de ambiente, mantenimiento, pila de investigación, mercado de misiones). Unos **25-30** chocan con nuestras reglas (mineros/copiadoras sin veta, paralelos de millones, final "creativo", mercado de monedas, minería planetaria sin ir) — se listan y flagean todos igualmente, no se ocultan. El resto (~130) son ideas sin choque de regla pero **ninguno** es copiable literalmente (§1). |
| **Top conflictos a vigilar** | (1) Mineros/perforadoras de vacío y copiadoras de elemento — minan o duplican sin veta/planeta. (2) Paralelos de millones (Neutron Vortex, Advanced Integrated Ore Processor, Infinity+ coils). (3) Final de MAX en "modo creativo" (Eye of Harmony, Door of Creation, Creative Computer). (4) Small Market (créditos de misión → atajos). (5) Space Elevator con drones minando planetas sin ir — choca con nuestra propia regla de exclusividad planetaria. (6) La propia cadena de power "barata" ya la rechazamos una vez en GTCA; repetirla con otro mod sería contradecirnos sin querer. |

---

*Informe de investigación únicamente — no se ha tocado ningún archivo de `pack/`. Archivo: `research/gtl/leisure-port.md`.*

