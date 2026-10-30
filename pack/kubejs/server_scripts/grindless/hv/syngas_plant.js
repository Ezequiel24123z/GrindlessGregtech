// priority: -13824
// -----------------------------------------------------------------------------------------------
// gtceu:syngas recipes of the Syngas and Shift Plant (gtceu:syngas_plant), its feed tag and the recipes that make the plant and its
// catalyst (HV era). GTM has no steam gasification and no water-gas shift, so these six recipes are ours, written from the real chemistry
// in a table. The programmed circuit picks the mode:
//
//   circuit 1  gasification          C + H2O -> CO + H2                 1 dust + 1 000 mB steam -> 1 000 CO + 2 000 hydrogen (+ ash)
//                                    CH2 + H2O -> CO + 2 H2             1 000 mB heavy fuel + 1 000 steam -> 1 000 CO + 4 000 hydrogen
//   circuit 2  methanol syngas       3 C + 4 H2O -> 2 CO + 4 H2 + CO2   3 dust + 4 000 steam -> 2 000 CO + 8 000 hydrogen + 1 000 CO2 (+ ash)
//              (one CO in three shifted: exactly CO + 4 H, the ratio of GTM's methanol_from_monoxide; heavy fuel already gives it in mode 1)
//   circuit 3  hydrogen              C + 2 H2O -> CO2 + 2 H2            1 dust + 2 000 steam -> 4 000 hydrogen + 1 000 CO2 (+ ash)
//                                    CH2 + 2 H2O -> CO2 + 3 H2          1 000 heavy fuel + 2 000 steam -> 6 000 hydrogen + 1 000 CO2
//   circuit 4  shift                 CO + H2O -> CO2 + H2               1 000 CO + 1 000 steam -> 2 000 hydrogen + 1 000 CO2
//   circuit 5  Pluto shift (UV-B3)   CO + H2O -> CO2 + H2               2 000 CO + 2 000 water -> 4 000 hydrogen + 2 000 CO2
//              grindless:pluto_orbit only: one Sputnik ice core's CO (uv/pluto_ices.js) with Charon's water, fed liquid; in orbit the
//              reaction heat and the radiators vaporise it, so it needs no boiler. Same stages and energy as circuit 4 per mole. It is
//              published apart (.orbitRecipes) so the six rows above, and their checks, stay as they were.
//   circuit 6  CO-rich (UEV-B3)      C + CO2 -> 2 CO                    1 dust + 1 000 CO2 -> 2 000 CO (+ ash); the Boudouard row, published
//              apart (.uevRecipes): Barnard b's carbonyl refinery takes its CO through AE2 and gives it back in the iron route.
//
// Units are GTM's: 1 000 mB of a fluid is one mole of its formula, and GTM's hydrogen and oxygen fluids are atoms (water electrolysis gives
// 2 000 mB of hydrogen per 1 000 mB of water). Steam is H2O in GTM's own material (components H2 O1), and 1 000 mB of it is one mole of
// water, as when GTM's cracker and pyrolyse oven take steam as a reagent. The pulverized feed is one mole of carbon per dust (GTM's coal and
// coke are carbon) and the heavy fuel is counted as CH2 per 1 000 mB (a long alkane chain). So every recipe balances carbon, hydrogen and
// oxygen; the smoke test checks it. The ash is the feed's mineral matter: GTM's own chance for coal and charcoal, 1 in 9 per mole.
//
// Energy: the sum of the stages, no discount. A gasification costs 28 800 EU (it is endothermic, +131 kJ/mol) and a shift with the CO2
// capture 19 200 EU (the reaction gives heat, -41 kJ/mol, the amine regeneration takes more). All recipes are HV (480 EU/t), no parallels.
// Hydrogen costs 12 EU per mB in mode 3 (9.6 in the shift, 8 from heavy fuel), against 22.5 for water electrolysis at LV (90 overclocked to
// HV) and 9 + the methane in GTM's methane reformer. No loop beats what GTM already gets: two coal through modes 1 and 3 and GTM's
// methane_shortcut give one methane (112 000 EU in a gas turbine) for 81 600 EU, about 15 000 EU per coal, less than GTM's pyrolysis
// (about 22 000 EU of coal gas per coal, and the coke stays); three coal through mode 2 and the methanol reactor give two methanol
// (128 000 EU) for 128 640 EU.
//
// The catalyst (grindless:shift_catalyst, magnetite + chromium: the iron-chromium oxide of real high-temperature shift) is a chanced input
// used up in 0.05 % of the runs, only in the recipes that shift (modes 2, 3 and 4). Pure gasification needs none.
//
// Destinations (docs/eras/hv.md): hydrogen -> the Refinery (heavy crude comes up short), ammonia, HF, methanol and the rocket (GCYR burns it
// as a tier 1 fuel; GTM's rocket fuel takes about 27 B of it per 8 B through methanol and ammonia); carbon monoxide -> methanol (mode 2 is
// its exact syngas), acetic acid, butyraldehyde, or back as feed in mode 4; CO2 is inert in GTM (no hazard): it can be vented, or feed the
// MV and HV greenhouses, ethylene from glycerol, methanol from CO2, soda ash, or the electrolyzer; ash -> GTM's centrifuge or fertilizer.
//
// Published in global.grindless.syngas for the smoke test:
//   .recipes  [{ id, name, circuit, feed: { tag, count } | null, fluidsIn: [{ id, amount }], fluidsOut: [...], ash: chance | 0,
//                catalyst: bool, stages: { gasify, shift }, eut, duration, energy, atoms: { c, h, o } (in - out, all 0) }]
//   .orbitRecipes  the same fields + dim, for the rows locked to a dimension (circuit 5)
//   .feedTag, .feedItems, .craftingRecipes, .craftingParts
(function () {
  const G = global.grindless || (global.grindless = {})
  const SYN = G.syngas || (G.syngas = {})

  const CATALYST = 'grindless:shift_catalyst'
  const CATALYST_WEAR = 5
  const ID_PREFIX = 'grindless:hv/'

  const FEED_TAG = 'grindless:gasifier_feed'
  const FEED_ITEMS = ['gtceu:coal_dust', 'gtceu:coke_dust', 'gtceu:charcoal_dust', 'gtceu:carbon_dust']
  const FEED_SOURCES = ['#forge:dusts/coal', '#forge:dusts/coke', '#forge:dusts/charcoal', '#forge:dusts/carbon']
  const ASH = 'gtceu:ash_dust'
  const ASH_PER_MOLE = 1111

  const STEAM = 'gtceu:steam'
  const CO = 'gtceu:carbon_monoxide'
  const CO2 = 'gtceu:carbon_dioxide'
  const H2 = 'gtceu:hydrogen'
  const HEAVY = 'gtceu:heavy_fuel'
  const WATER = 'minecraft:water'

  const EUT = 480
  const GASIFY_EU = 28800
  const SHIFT_EU = 19200

  // atoms per 1 000 mB (or per dust) for the balance check
  const ATOMS = {}
  ATOMS[STEAM] = { c: 0, h: 2, o: 1 }
  ATOMS[CO] = { c: 1, h: 0, o: 1 }
  ATOMS[CO2] = { c: 1, h: 0, o: 2 }
  ATOMS[H2] = { c: 0, h: 1, o: 0 }
  ATOMS[HEAVY] = { c: 1, h: 2, o: 0 }
  ATOMS[WATER] = { c: 0, h: 2, o: 1 }
  const FEED_ATOMS = { c: 1, h: 0, o: 0 }

  // feed: dusts of the feed tag; heavy / co: mB of that fluid; gasify / shift: moles through each stage
  const TABLE = [
    { name: 'gasify_carbon', circuit: 1, feed: 1, steam: 1000, out: { co: 1000, h2: 2000 }, gasify: 1, shift: 0 },
    { name: 'methanol_syngas', circuit: 2, feed: 3, steam: 4000, out: { co: 2000, h2: 8000, co2: 1000 }, gasify: 3, shift: 1 },
    { name: 'hydrogen_carbon', circuit: 3, feed: 1, steam: 2000, out: { h2: 4000, co2: 1000 }, gasify: 1, shift: 1 },
    { name: 'shift', circuit: 4, co: 1000, steam: 1000, out: { h2: 2000, co2: 1000 }, gasify: 0, shift: 1 },
    { name: 'gasify_heavy_fuel', circuit: 1, heavy: 1000, steam: 1000, out: { co: 1000, h2: 4000 }, gasify: 1, shift: 0 },
    { name: 'hydrogen_heavy_fuel', circuit: 3, heavy: 1000, steam: 2000, out: { h2: 6000, co2: 1000 }, gasify: 1, shift: 1 }
  ]
  // rows locked to a dimension; water: mB of liquid water instead of steam
  const ORBIT_TABLE = [
    { name: 'pluto_shift', circuit: 5, co: 2000, water: 2000, out: { h2: 4000, co2: 2000 }, gasify: 0, shift: 2, dim: 'grindless:pluto_orbit' }
  ]

  // UEV-B3's CO-rich setting (circuit 6): the Boudouard reaction, C + CO2 -> 2 CO, feeds Barnard b's carbonyl refinery (through AE2)
  const UEV_TABLE = [
    { name: 'co_rich', circuit: 6, feed: 1, co2: 1000, out: { co: 2000 }, gasify: 1, shift: 0 }
  ]

  // UIV-A10 (docs/eras/uiv.md, line 21): C-12 methanation of the fusion ash, C + 2 H2 -> CH4 with the carbon-12 kept apart; the 12C dust is
  // the ash centrifuge's (UIV-A9). c12: dust of C12; methanate: moles through a methanation stage
  const C12 = 'gtceu:carbon_12_dust'
  const C12_METHANE = 'gtceu:carbon_12_methane'
  const METHANATE_EU = 19200
  ATOMS[C12_METHANE] = { c: 1, h: 4, o: 0 }
  const UIV_TABLE = [
    { name: 'c12_methanation', circuit: 7, c12: 1, h2: 2000, out: { ch4: 1000 }, gasify: 0, shift: 0, methanate: 1 }
  ]

  // UXV-B2 (docs/eras/uxv.md, machine 12): the condensation tower's volatile condensate (1 000 mB = one mole each of CH4, NH3 and H2O) is
  // reformed with one mole of steam: CH4 + H2O -> CO + 3 H2, CO + H2O -> CO2 + H2, NH3 -> N + 3/2 H2 (GTM's nitrogen is atoms like its
  // hydrogen). Circuit 8: the contract's 7 is UIV-A10's. gasify and shift 1 each; the nitrogen is not in the balance check (c, h, o only).
  const VOLATILE = 'gtceu:volatile_condensate'
  const NITROGEN = 'gtceu:nitrogen'
  ATOMS[VOLATILE] = { c: 1, h: 9, o: 1 }
  ATOMS[NITROGEN] = { c: 0, h: 0, o: 0 }
  const UXV_TABLE = [
    { name: 'volatile_reform', circuit: 8, volatile: 1000, steam: 1000, out: { h2: 11000, co2: 1000, n: 1000 }, gasify: 1, shift: 1 }
  ]

  function addAtoms(sum, atoms, moles, sign) {
    sum.c += sign * atoms.c * moles
    sum.h += sign * atoms.h * moles
    sum.o += sign * atoms.o * moles
  }

  function planOf(t) {
    var fluidsIn = []
    if (t.heavy) fluidsIn.push({ id: HEAVY, amount: t.heavy })
    if (t.co) fluidsIn.push({ id: CO, amount: t.co })
    if (t.co2) fluidsIn.push({ id: CO2, amount: t.co2 })
    if (t.volatile) fluidsIn.push({ id: VOLATILE, amount: t.volatile })
    if (t.steam) fluidsIn.push({ id: STEAM, amount: t.steam })
    if (t.water) fluidsIn.push({ id: WATER, amount: t.water })
    if (t.h2) fluidsIn.push({ id: H2, amount: t.h2 })
    var fluidsOut = []
    if (t.out.ch4) fluidsOut.push({ id: C12_METHANE, amount: t.out.ch4 })
    if (t.out.co) fluidsOut.push({ id: CO, amount: t.out.co })
    if (t.out.h2) fluidsOut.push({ id: H2, amount: t.out.h2 })
    if (t.out.co2) fluidsOut.push({ id: CO2, amount: t.out.co2 })
    if (t.out.n) fluidsOut.push({ id: NITROGEN, amount: t.out.n })
    var atoms = { c: 0, h: 0, o: 0 }
    if (t.feed) addAtoms(atoms, FEED_ATOMS, t.feed, 1)
    if (t.c12) addAtoms(atoms, FEED_ATOMS, t.c12, 1)
    fluidsIn.forEach(function (f) { addAtoms(atoms, ATOMS[f.id], f.amount / 1000, 1) })
    fluidsOut.forEach(function (f) { addAtoms(atoms, ATOMS[f.id], f.amount / 1000, -1) })
    var energy = t.gasify * GASIFY_EU + t.shift * SHIFT_EU + (t.methanate || 0) * METHANATE_EU
    var plan = {
      id: 'grindless:syngas/hv/' + t.name,
      name: t.name,
      circuit: t.circuit,
      feed: t.feed ? { tag: FEED_TAG, count: t.feed } : null,
      c12: t.c12 ? { id: C12, count: t.c12 } : null,
      fluidsIn: fluidsIn,
      fluidsOut: fluidsOut,
      ash: t.feed ? Math.min(9999, ASH_PER_MOLE * t.feed) : 0,
      catalyst: t.shift > 0,
      stages: { gasify: t.gasify, shift: t.shift },
      eut: EUT,
      duration: energy / EUT,
      energy: energy,
      atoms: atoms
    }
    if (t.dim) plan.dim = t.dim
    return plan
  }

  SYN.catalyst = CATALYST
  SYN.catalystWear = CATALYST_WEAR
  SYN.feedTag = FEED_TAG
  SYN.feedItems = FEED_ITEMS
  SYN.eut = EUT
  SYN.stageEnergy = { gasify: GASIFY_EU, shift: SHIFT_EU }
  SYN.recipes = TABLE.map(planOf)
  SYN.orbitRecipes = ORBIT_TABLE.map(planOf)
  SYN.uevRecipes = UEV_TABLE.map(planOf)
  SYN.uivRecipes = UIV_TABLE.map(planOf)
  SYN.uxvRecipes = UXV_TABLE.map(planOf)

  const HULL = 'gtceu:hv_machine_hull'
  const REACTOR = 'gtceu:hv_chemical_reactor'
  const CENTRIFUGE = 'gtceu:hv_centrifuge'
  const PUMP = 'gtceu:hv_electric_pump'
  const PLANT_PARTS = [HULL, REACTOR, CENTRIFUGE, PUMP, 'gtceu:syngas_plant']
  const CATALYST_PARTS = ['gtceu:magnetite_dust', 'gtceu:chromium_dust', CATALYST]
  SYN.craftingParts = PLANT_PARTS.concat(CATALYST_PARTS)
  SYN.craftingRecipes = { plant: 'grindless:crafting/syngas_plant', catalyst: 'grindless:mixer/shift_catalyst' }

  // the feed: the four pulverized carbons, through their forge tags (the Ore Plant gives coal dust, a macerator the rest)
  ServerEvents.tags('item', function (event) {
    try {
      event.add(FEED_TAG, FEED_SOURCES)
    } catch (e) {
      console.error('[grindless/hv] syngas feed tag failed: ' + e)
    }
  })

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addRecipes(event)
    } catch (e) {
      console.error('[grindless/hv] syngas recipes failed: ' + e)
    }
    try {
      addCrafting(event)
    } catch (e2) {
      console.error('[grindless/hv] syngas plant crafting recipes failed: ' + e2)
    }
  })

  function addRecipes(event) {
    var missing = [CATALYST, ASH].concat(FEED_ITEMS).filter(function (id) { return !Item.exists(id) })
      .concat([STEAM, CO, CO2, H2, HEAVY, WATER].filter(function (id) { return !Fluid.exists(id) }))
    if (missing.length > 0) {
      console.error('[grindless/hv] syngas recipes skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    SYN.recipes.concat(SYN.orbitRecipes, SYN.uevRecipes, SYN.uivRecipes, SYN.uxvRecipes).forEach(function (r) {
      if (r.c12 && !Item.exists(r.c12.id)) return console.error('[grindless/hv] syngas row ' + r.name + ' skipped, unknown ' + r.c12.id)
      var unknown = r.fluidsIn.concat(r.fluidsOut).filter(function (f) { return !Fluid.exists(f.id) })
      if (unknown.length > 0) return console.error('[grindless/hv] syngas row ' + r.name + ' skipped, unknown ' + unknown[0].id)
      var recipe = event.recipes.gtceu.syngas(ID_PREFIX + r.name)
      if (r.feed) recipe.itemInputs(r.feed.count + 'x #' + r.feed.tag)
      if (r.c12) recipe.itemInputs(r.c12.count + 'x ' + r.c12.id)
      if (r.catalyst) recipe.chancedInput(CATALYST, CATALYST_WEAR, 0)
      recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      if (r.ash > 0) recipe.chancedOutput('1x ' + ASH, r.ash, 0)
      if (r.dim) recipe.dimension(r.dim)
      recipe.EUt(r.eut).duration(r.duration)
    })
    console.info('[grindless/hv] syngas recipes added: ' + (SYN.recipes.length + SYN.orbitRecipes.length + SYN.uevRecipes.length + SYN.uivRecipes.length + SYN.uxvRecipes.length))
  }

  // Plant: CRAFTING TABLE, HV hull + HV chemical reactor (the shift) + HV centrifuge (the gas separation) + 2 HV electric pumps + 4 HV
  // circuits. Catalyst: MIXER, 3 magnetite dust (the Overworld vein) + 1 chromium dust (the chromium of stainless steel) -> 4 catalysts
  function addCrafting(event) {
    var missing = SYN.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error('[grindless/hv] syngas plant crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped('gtceu:syngas_plant', ['CRC', 'PHP', 'CGK'], {
      K: CATALYST,
      C: '#gtceu:circuits/hv',
      R: REACTOR,
      P: PUMP,
      H: HULL,
      G: CENTRIFUGE
    }).id(SYN.craftingRecipes.plant)

    event.recipes.gtceu.mixer('grindless:shift_catalyst')
      .itemInputs('3x gtceu:magnetite_dust', '1x gtceu:chromium_dust')
      .itemOutputs('4x ' + CATALYST)
      .EUt(120).duration(300)
    console.info('[grindless/hv] syngas plant crafting recipes added')
  }
})()
