// priority: -12624
// -----------------------------------------------------------------------------------------------
// gtceu:atmosphere_processing recipes of the Atmosphere Processor (gtceu:atmosphere_processor, the Mars base, EV era; registered in
// startup_scripts/grindless/ev/mars_site.js) and the recipe of its controller. GTM has no Sabatier reaction, so these recipes are ours,
// written from the real chemistry in a table. Every one carries .dimension(<Mars>): the processor breathes the air of Mars, which only
// exists there. The programmed circuit picks the mode:
//
//   circuit 1  Sabatier   CO2 + 2 H2O -> CH4 + 2 O2      2 000 mB water + the CO2 of the air -> 1 000 mB methane + 4 000 mB oxygen
//   circuit 2  intake     the air of Mars, 95% CO2     -> 10 000 mB carbon dioxide (the dust stays in the filters, the nitrogen and argon go
//                                                         back out)
//
// Units are GTM's: 1 000 mB of a fluid is one mole of its formula, and GTM's hydrogen and oxygen fluids are atoms (water electrolysis gives
// 2 000 mB of hydrogen and 1 000 mB of oxygen per 1 000 mB of water; ev/foundation.js's methalox is 1 000 methane + 2 000 oxygen). The CO2
// of the Sabatier mode comes from the air, like the gas collector's air, so it is not an input. Mode 1 balances carbon, hydrogen and oxygen
// (the smoke test checks it): inside, 4 000 mB of water are electrolyzed into 8 000 mB of hydrogen and 4 000 mB of oxygen, the hydrogen
// turns 1 000 mB of CO2 into 1 000 mB of methane and 2 000 mB of water, and that water goes back to the stack.
//
// Energy: the sum of GTM's stages, no discount, at EV (1 920 EU/t), rounded up to a whole tick:
//   intake       GTM's gas collector, its costliest air (ender air: 256 EU/t x 200 t per 10 000 mB): 5.12 EU per mB, since the air of
//                Mars is thin (0.6 kPa)                                                     5 120 EU per 1 000 mB of CO2
//   electrolysis GTM's water_electrolysis (30 EU/t x 1 500 t per 1 000 mB of water), 4 000 mB 180 000 EU
//   methanation  GTM's carbon_dioxide_from_methane run backwards (480 EU/t x 150 t)         72 000 EU
//   Sabatier mode: 257 120 EU -> 134 t (257 280 EU). Intake mode: 51 200 EU -> 27 t (51 840 EU).
// No energy from nothing (AGENTS.md rule 8): 1 000 mB of methane gives 224 000 EU in a gas turbine (GTM's 112 000, doubled by
// power/generators.js), 87% of what the processor spent on it, and as methalox on Mars 224 000 EU for 257 280 + 38 400 (the mixer), 76%.
// Mars power still comes from home through the bridge or from the light; methane and methalox carry and store it.
//
// The catalyst (grindless:ruthenium_catalyst, ruthenium on alumina from ev/foundation.js, with the platinum plant's ruthenium) is a chanced
// input used up in 0.1% of the Sabatier runs. The intake needs none. The water is water from home (the ice of Mars is rich in deuterium
// and is saved for IV): this recipe takes minecraft:water itself, not a tag.
//
// Destinations (docs/eras/ev.md): oxygen -> the suits and methalox (the mixer takes 2 000 mB of oxygen per 1 000 mB of methane, so half
// of it is spare for the suits and the network); methane -> methalox for the gas turbines of Mars (it carries its own oxygen, so it burns
// there, see power/generators.js and data/grindless/tables/site_fuels.json) or the home network; CO2 -> the sealed dome on Mars, or vented
// (inert).
//
// Published in global.grindless.marsSite for the smoke test:
//   .recipes  [{ id, name, circuit, catalyst: bool, fluidsIn: [{ id, amount }], fluidsOut: [...], eut, duration, energy,
//                stages: { intake, electrolysis, methanation }, atoms: { c, h, o } (in - out, all 0; the CO2 from the air counts in) }]
//   .dimension, .catalystWear, .craftingRecipe, .craftingParts
(function () {
  const G = global.grindless || (global.grindless = {})
  const MS = G.marsSite || (G.marsSite = {})

  const CATALYST = 'grindless:ruthenium_catalyst'
  const CATALYST_WEAR = 10
  const ID_PREFIX = 'grindless:ev/'
  const EUT = 1920

  const WATER = 'minecraft:water'
  const CH4 = 'gtceu:methane'
  const O2 = 'gtceu:oxygen'
  const CO2 = 'gtceu:carbon_dioxide'

  // GTM's stages (see the header): the gas collector's ender air (EU/t, ticks, mB per run), water electrolysis (EU/t, ticks per 1 000 mB of
  // water) and carbon_dioxide_from_methane (EU/t, ticks per 1 000 mB of methane). Integer arithmetic: EU = mB * eut * ticks / mB per run
  const INTAKE = { eut: 256, ticks: 200, mb: 10000 }
  const ELECTROLYSIS = { eut: 30, ticks: 1500, mb: 1000 }
  const METHANATION = { eut: 480, ticks: 150 }

  // atoms per 1 000 mB for the balance check
  const ATOMS = {}
  ATOMS[WATER] = { c: 0, h: 2, o: 1 }
  ATOMS[CH4] = { c: 1, h: 4, o: 0 }
  ATOMS[O2] = { c: 0, h: 0, o: 1 }
  ATOMS[CO2] = { c: 1, h: 0, o: 2 }

  // air: mB of CO2 taken from the air; electrolyzed: mB of water through the stack; methanation: moles of methane made
  const TABLE = [
    { name: 'sabatier', circuit: 1, catalyst: true, water: 2000, air: 1000, out: { ch4: 1000, o2: 4000 }, electrolyzed: 4000, methanation: 1 },
    { name: 'co2_intake', circuit: 2, catalyst: false, water: 0, air: 10000, out: { co2: 10000 }, electrolyzed: 0, methanation: 0 }
  ]

  function addAtoms(sum, atoms, moles, sign) {
    sum.c += sign * atoms.c * moles
    sum.h += sign * atoms.h * moles
    sum.o += sign * atoms.o * moles
  }

  function planOf(t) {
    var fluidsIn = t.water > 0 ? [{ id: WATER, amount: t.water }] : []
    var fluidsOut = []
    if (t.out.ch4) fluidsOut.push({ id: CH4, amount: t.out.ch4 })
    if (t.out.o2) fluidsOut.push({ id: O2, amount: t.out.o2 })
    if (t.out.co2) fluidsOut.push({ id: CO2, amount: t.out.co2 })
    var atoms = { c: 0, h: 0, o: 0 }
    addAtoms(atoms, ATOMS[CO2], t.air / 1000, 1)
    fluidsIn.forEach(function (f) { addAtoms(atoms, ATOMS[f.id], f.amount / 1000, 1) })
    fluidsOut.forEach(function (f) { addAtoms(atoms, ATOMS[f.id], f.amount / 1000, -1) })
    var stages = {
      intake: t.air * INTAKE.eut * INTAKE.ticks / INTAKE.mb,
      electrolysis: t.electrolyzed * ELECTROLYSIS.eut * ELECTROLYSIS.ticks / ELECTROLYSIS.mb,
      methanation: t.methanation * METHANATION.eut * METHANATION.ticks
    }
    var sum = stages.intake + stages.electrolysis + stages.methanation
    var duration = Math.ceil(sum / EUT)
    return {
      id: 'grindless:atmosphere_processing/ev/' + t.name,
      name: t.name,
      circuit: t.circuit,
      catalyst: t.catalyst,
      air: t.air,
      fluidsIn: fluidsIn,
      fluidsOut: fluidsOut,
      eut: EUT,
      duration: duration,
      energy: duration * EUT,
      stageSum: sum,
      stages: stages,
      atoms: atoms
    }
  }

  // the Mars of the vein table when the Mars travel package has loaded it, else GCYR's id
  function marsDimension() {
    var table = G.tables && G.tables.veins_mars
    return table && table.dimension ? String(table.dimension) : 'gcyr:mars'
  }

  MS.catalyst = CATALYST
  MS.catalystWear = CATALYST_WEAR
  MS.eut = EUT
  MS.recipes = TABLE.map(planOf)
  MS.dimension = marsDimension()

  const HULL = 'gtceu:ev_machine_hull'
  const COLLECTOR = 'gtceu:ev_gas_collector'
  const ELECTROLYZER = 'gtceu:ev_electrolyzer'
  const REACTOR = 'gtceu:ev_chemical_reactor'
  MS.craftingParts = [HULL, COLLECTOR, ELECTROLYZER, REACTOR, 'gtceu:atmosphere_processor']
  MS.craftingRecipe = 'grindless:crafting/atmosphere_processor'

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addRecipes(event)
    } catch (e) {
      console.error('[grindless/ev] atmosphere processor recipes failed: ' + e)
    }
    try {
      addCrafting(event)
    } catch (e2) {
      console.error('[grindless/ev] atmosphere processor crafting recipe failed: ' + e2)
    }
  })

  function addRecipes(event) {
    var missing = [CATALYST].filter(function (id) { return !Item.exists(id) })
      .concat([WATER, CH4, O2, CO2].filter(function (id) { return !Fluid.exists(id) }))
    if (missing.length > 0) {
      console.error('[grindless/ev] atmosphere processor recipes skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    MS.dimension = marsDimension()
    MS.recipes.forEach(function (r) {
      var recipe = event.recipes.gtceu.atmosphere_processing(ID_PREFIX + r.name)
      recipe.circuit(r.circuit)
      if (r.catalyst) recipe.chancedInput(CATALYST, CATALYST_WEAR, 0)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
      r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
      recipe.dimension(MS.dimension)
      recipe.EUt(r.eut).duration(r.duration)
    })
    console.info('[grindless/ev] atmosphere processor recipes added: ' + MS.recipes.length + ' (only in ' + MS.dimension + ')')
  }

  // Processor: CRAFTING TABLE, EV hull + EV gas collector (the intake) + EV electrolyzer (the stack) + EV chemical reactor (the Sabatier
  // reactor) + 4 EV circuits (docs/eras/ev.md)
  function addCrafting(event) {
    var missing = MS.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error('[grindless/ev] atmosphere processor crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped('gtceu:atmosphere_processor', ['CGC', 'EHR', 'C C'], {
      C: '#gtceu:circuits/ev',
      G: COLLECTOR,
      E: ELECTROLYZER,
      H: HULL,
      R: REACTOR
    }).id(MS.craftingRecipe)
    console.info('[grindless/ev] atmosphere processor crafting recipe added')
  }
})()
