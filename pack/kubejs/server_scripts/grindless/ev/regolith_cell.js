// priority: -12924
// -----------------------------------------------------------------------------------------------
// gtceu:regolith_processing recipes of the Regolith Cell (gtceu:regolith_cell, startup_scripts/grindless/ev/regolith_cell.js) and the
// recipe that makes the cell (EV era, docs/eras/ev.md "Regolith cell"). GTM has no lunar chemistry, so these five recipes are ours,
// written from the real processes in a table. Every recipe carries the Moon's dimension condition (the dimension of
// data/grindless/tables/veins_moon.json, like every lunar recipe): the cell only works on the Moon. The programmed circuit picks the mode:
//
//   circuit 1  volatiles            16 lunar regolith dust -> 2,000 mB hydrogen + 250 helium + 200 nitrogen + 1 helium-3
//   circuit 2  regolith electrolysis 16 lunar regolith dust + platinum anode -> 7,000 mB oxygen + 3 silicon dust + 1 iron dust
//              titanium              5 ilmenite dust + platinum anode + Molten Salt Charge -> 3 titanium ingots + 1 iron dust + 3,000 oxygen
//              Proxima tailings      16 leached tailings + platinum anode -> 3 silicon dioxide dust + 1 iron dust + 1,000 mB oxygen (UHV-B5)
//   circuit 3  sintering             16 lunar regolith dust -> 4 Sintered Regolith Bricks
//
// Volatiles. The solar wind implants hydrogen, helium and a trace of helium-3 in the regolith grains (lunar soil also holds nitrogen);
// heating gives them back (the Wisconsin FTI lunar miner heats to ~700 C; the cell heats until the whole inventory comes out). Mature
// mare soil holds by mass about 50 ppm hydrogen, 20 ppm helium-4, 80 ppm nitrogen and 0.01 ppm helium-3: per atom (GTM's hydrogen and
// nitrogen fluids count atoms) that is 2,000 H : 200 He : 230 N, so lots of hydrogen and helium. Helium-3 is a pinch, about 8 times its
// real share (the HV Lunar Drill's regolith vein is generous too). A little water comes out as well (about 60 mB a batch): it is inert,
// so it is vented. 1,920 EU/t, 50 ticks (96,000 EU a batch).
//
// Regolith electrolysis (NASA and MIT's molten regolith electrolysis). The cell melts the regolith (~1,600 C) and electrolyzes it with an
// inert anode: oxygen bubbles off the platinum, the metals collect at the cathode. Iron and silicon are the oxides that give way first;
// the calcium, magnesium and aluminium oxides stay behind as an inert slag that is dumped. Mare soil is about 21 % silicon and 12 % iron
// by mass, which per 16 dust (GTM counts a dust per atom) is about 2.6 silicon and 0.7 iron, rounded up to 3 and 1; the oxygen is the
// oxygen those oxides held, counted as GTM counts it (its electrolyzer gives 2,000 mB of oxygen per silicon of silicon dioxide):
// 3 x 2,000 + 1 x 1,000 = 7,000 mB. 1,920 EU/t, 200 ticks (384,000 EU, about 55 EU per mB of oxygen against 45 for GTM's water
// electrolysis, and the Moon has no water to spare).
//
// Titanium (Cambridge's FFC process). The ilmenite sits in the cathode basket of the Molten Salt Charge, a crucible of calcium chloride:
// in the molten salt the oxide ions leave the metal and go to the platinum anode as oxygen. No chlorine, no magnesium, no carbon. The
// yield is the Kroll chain's own (GTM: 5 ilmenite -> 3 rutile -> 3 TiCl4 -> 3 titanium ingots), the iron is the ilmenite's iron
// (the Kroll's first stage gives it as wrought iron) and the oxygen is the 3 oxygen of FeTiO3 (3,000 mB). The energy is the sum of the
// Kroll stages it replaces, with no discount (docs/eras/ev.md), read in GTM 7.5.3's recipes (STAGES below, checked by the smoke test):
//   rutile  EBF 1,600 t x 480 EU/t, once per 5 ilmenite       768,000
//   TiCl4   chemical reactor 400 t x 480, once per ingot     3 x 192,000
//   Kroll   EBF 800 t x 480, once per ingot                  3 x 384,000
//   cooling vacuum freezer 144 t x 480, once per ingot       3 x  69,120
//   total                                                    2,703,360 EU = 1,408 ticks at 1,920 EU/t
// The Kroll's magnesium and chlorine loop (magnesium chloride + sodium in the chemical reactor, salt electrolysis) is not counted: ev.md
// names the four stages above. The cell pays with the platinum anode, the charge, the trip and the site instead.
//
// Proxima tailings (UHV-B5, docs/eras/uhv.md line 16). The biomining heap's leached tailings (Proxima b's basalt, its PGM, rare earths
// and part of its calcium taken by the cultures) come to the Moon by AE2. The cell runs the melt below silicon's potential: the iron
// and its oxygen come off (1 iron, as in the regolith row, and its 1,000 mB of oxygen), the silica crystallises from the cooled melt (the
// regolith row's 3 silicon, left as 3 silicon dioxide dust) and the rest (calcium, magnesium and aluminium oxides) is dumped as slag. Energy: the
// regolith row's EU per mB of oxygen for the iron's 1,000 mB plus the volatiles row's 96,000 EU to heat a batch = 150,858 EU, 79 ticks.
// The row is skipped alone (logged) if a UHV id is missing, so the EV rows never depend on it.
//
// Sintering. Lunar regolith dust fused into bricks: the same 4 dust per brick and the same energy per brick (48,000 EU) as the electric
// furnace that makes the first ones on the Moon (server_scripts/grindless/ev/foundation.js: 120 EU/t, 400 ticks), four at a time: 1,920
// EU/t, 100 ticks. Four times an EV electric furnace (which overclocks to the same 1,920 EU/t but makes one brick in 100 ticks), at a
// quarter of its energy per brick.
//
// The anode (grindless:platinum_electrode, the platinum plant's) is a chanced input of both electrolysis recipes, used up in 0.1 % of the
// runs; the charge (grindless:molten_salt_charge) is an input that is never used up. Volatiles and sintering need neither.
//
// Destinations (docs/eras/ev.md): oxygen and nitrogen -> the cryogenic plant, suits or the network; helium -> the cryogenic plant (liquid
// helium for IV); helium-3 -> the fusion reserve (LuV); hydrogen -> the home network (the refinery); iron -> steel for the base; silicon ->
// the solar array's panels and wafers; titanium -> EV hulls, pipes and drums; bricks -> every lunar structure; silicon dioxide (the
// Proxima row) -> glass and GTM's silicon chain. Water and slag: inert, vented and dumped.
//
// Each recipe of the type has its own circuit or its own first ingredient (GTM's lookup prefix rule, lv/multis.js).
// Published in global.grindless.regolithCell for the smoke test:
//   .recipes   [{ name, recipeId, mode, circuit, itemsIn: [{ id, count, chance }], itemsOut: [{ id, count }], fluidsOut: [{ id, amount }],
//                 eut, duration, energy, vented }]
//   .stages, .krollEnergy, .dimension, .craftingRecipes, .craftingParts
(function () {
  const G = global.grindless || (global.grindless = {})
  const RC = G.regolithCell || (G.regolithCell = {})

  const ID_PREFIX = 'grindless:ev/'
  const EUT = 1920

  const REGOLITH = 'gtceu:lunar_regolith_dust'
  const ILMENITE = 'gtceu:ilmenite_dust'
  const ELECTRODE = 'grindless:platinum_electrode'
  const ELECTRODE_WEAR = 10
  const CHARGE = 'grindless:molten_salt_charge'
  const BRICK = 'grindless:sintered_regolith'

  const H2 = 'gtceu:hydrogen'
  const HE = 'gtceu:helium'
  const N2 = 'gtceu:nitrogen'
  const HE3 = 'gtceu:helium_3'
  const O2 = 'gtceu:oxygen'
  const SI = 'gtceu:silicon_dust'
  const FE = 'gtceu:iron_dust'
  const TI = 'gtceu:titanium_ingot'
  const TAILINGS = 'grindless:leached_tailings'
  const SILICA = 'gtceu:silicon_dioxide_dust'

  // GTM 7.5.3's titanium chain (the recipes the titanium mode replaces): EU/t, ticks and runs per batch of 5 ilmenite (3 ingots)
  const STAGES = [
    { name: 'rutile', id: 'gtceu:electric_blast_furnace/rutile_from_ilmenite', eut: 480, duration: 1600, runs: 1 },
    { name: 'chloride', id: 'gtceu:chemical_reactor/titanium_tetrachloride', eut: 480, duration: 400, runs: 3 },
    { name: 'kroll', id: 'gtceu:electric_blast_furnace/titanium_from_tetrachloride', eut: 480, duration: 800, runs: 3 },
    { name: 'cooling', id: 'gtceu:vacuum_freezer/cool_hot_titanium_ingot', eut: 480, duration: 144, runs: 3 }
  ]
  const KROLL_ENERGY = STAGES.reduce(function (sum, s) { return sum + s.eut * s.duration * s.runs }, 0)

  // the electric furnace's sintering (ev/foundation.js): 4 dust -> 1 brick, 120 EU/t, 400 ticks
  const FURNACE_BRICK_ENERGY = 120 * 400

  // feed: [item, count]; out: items [id, count]; fluids: [id, mB]; energy in EU (the duration is energy / 1,920, rounded up)
  const TABLE = [
    {
      name: 'volatiles', mode: 'volatiles', circuit: 1, feed: [REGOLITH, 16],
      fluids: [[H2, 2000], [HE, 250], [N2, 200], [HE3, 1]], vented: 'about 60 mB of water', energy: 96000
    },
    {
      name: 'regolith_electrolysis', mode: 'electrolysis', circuit: 2, feed: [REGOLITH, 16], electrode: true,
      out: [[SI, 3], [FE, 1]], fluids: [[O2, 7000]], vented: 'the slag (calcium, magnesium and aluminium oxides)', energy: 384000
    },
    {
      name: 'titanium_from_ilmenite', mode: 'electrolysis', circuit: 2, feed: [ILMENITE, 5], electrode: true, charge: true,
      out: [[TI, 3], [FE, 1]], fluids: [[O2, 3000]], vented: '', energy: KROLL_ENERGY
    },
    {
      name: 'proxima_tailings', mode: 'electrolysis', circuit: 2, feed: [TAILINGS, 16], electrode: true,
      out: [[SILICA, 3], [FE, 1]], fluids: [[O2, 1000]], vented: 'the slag (calcium, magnesium and aluminium oxides)',
      energy: Math.ceil(384000 / 7000 * 1000) + 96000
    },
    {
      name: 'sintering', mode: 'sintering', circuit: 3, feed: [REGOLITH, 16],
      out: [[BRICK, 4]], fluids: [], vented: '', energy: 4 * FURNACE_BRICK_ENERGY
    },
    // MAX-E1 (max.md, L25 step 3, c5): the devolatilised belt slag electrolysed; oxygen and silicon (the ferrosilicon's share) are the way back
    {
      name: 'slag_reduction', mode: 'electrolysis', circuit: 5, feed: ['grindless:devolatilised_slag', 4], electrode: true,
      out: [['grindless:ca_al_oxide_residue', 2], [SI, 1]], fluids: [[O2, 3000]], vented: '', energy: 384000
    }
  ]

  function planOf(t) {
    var itemsIn = [{ id: t.feed[0], count: t.feed[1], chance: 10000 }]
    if (t.electrode) itemsIn.push({ id: ELECTRODE, count: 1, chance: ELECTRODE_WEAR })
    if (t.charge) itemsIn.push({ id: CHARGE, count: 1, chance: 0 })
    var duration = Math.ceil(t.energy / EUT)
    return {
      name: t.name,
      recipeId: 'grindless:regolith_processing/ev/' + t.name,
      mode: t.mode,
      circuit: t.circuit,
      itemsIn: itemsIn,
      itemsOut: (t.out || []).map(function (o) { return { id: o[0], count: o[1] } }),
      fluidsOut: t.fluids.map(function (f) { return { id: f[0], amount: f[1] } }),
      eut: EUT,
      duration: duration,
      energy: duration * EUT,
      vented: t.vented
    }
  }

  function moonDimension() {
    var table = G.tables && G.tables.veins_moon
    return table && table.dimension ? table.dimension : 'gcyr:luna'
  }

  RC.electrode = ELECTRODE
  RC.electrodeWear = ELECTRODE_WEAR
  RC.charge = CHARGE
  RC.stages = STAGES
  RC.krollEnergy = KROLL_ENERGY
  RC.furnaceBrickEnergy = FURNACE_BRICK_ENERGY
  RC.recipes = TABLE.map(planOf)

  const HULL = 'gtceu:ev_machine_hull'
  const ELECTROLYZER = 'gtceu:ev_electrolyzer'
  const FURNACE = 'gtceu:ev_electric_furnace'
  const PUMP = 'gtceu:ev_electric_pump'
  RC.craftingParts = [HULL, ELECTROLYZER, FURNACE, PUMP, ELECTRODE, 'grindless:graphite_electrode', 'gtceu:regolith_cell']
  RC.craftingRecipes = { cell: 'grindless:assembler/regolith_cell' }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addRecipes(event)
    } catch (e) {
      console.error('[grindless/ev] regolith cell recipes failed: ' + e)
    }
    try {
      addCrafting(event)
    } catch (e2) {
      console.error('[grindless/ev] regolith cell crafting recipe failed: ' + e2)
    }
  })

  function addRecipes(event) {
    var missing = [REGOLITH, ILMENITE, ELECTRODE, CHARGE, BRICK, SI, FE, TI].filter(function (id) { return !Item.exists(id) })
      .concat([H2, HE, N2, HE3, O2].filter(function (id) { return !Fluid.exists(id) }))
    if (missing.length > 0) {
      console.error('[grindless/ev] regolith cell recipes skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    var dimension = moonDimension()
    RC.dimension = dimension
    var added = 0
    RC.recipes.forEach(function (r) {
      var unknown = r.itemsIn.concat(r.itemsOut).filter(function (x) { return !Item.exists(x.id) }).map(function (x) { return x.id })
      if (unknown.length > 0) {
        console.error('[grindless/ev] regolith cell recipe ' + r.name + ' skipped, unknown id(s): ' + unknown.join(', '))
        return
      }
      added++
      var recipe = event.recipes.gtceu.regolith_processing(ID_PREFIX + r.name)
      r.itemsIn.forEach(function (x) {
        if (x.chance >= 10000) recipe.itemInputs(x.count + 'x ' + x.id)
        else if (x.chance === 0) recipe.notConsumable(x.id)
        else recipe.chancedInput(x.id, x.chance, 0)
      })
      recipe.circuit(r.circuit)
      r.itemsOut.forEach(function (o) { recipe.itemOutputs(o.count + 'x ' + o.id) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      recipe.dimension(dimension)
      recipe.EUt(r.eut).duration(r.duration)
    })
    console.info('[grindless/ev] regolith cell recipes added: ' + added + ' (only in ' + dimension + '; titanium at ' +
      KROLL_ENERGY + ' EU, the Kroll stages)')
  }

  // CRAFTING TABLE: EV hull + EV electrolyzer (the electrolysis) + EV electric furnace (the melt and the sintering) + 2 EV electric pumps
  // (the gases) + 4 EV circuits
  function addCrafting(event) {
    var missing = RC.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error('[grindless/ev] regolith cell crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:regolith_cell')
      .itemInputs(HULL, ELECTROLYZER, FURNACE, '2x ' + PUMP, '4x #gtceu:circuits/ev', '2x ' + ELECTRODE, '2x grindless:graphite_electrode')
      .inputFluids(Fluid.of(O2, 1000))
      .itemOutputs('gtceu:regolith_cell')
      .EUt(120).duration(400)
  }
})()
