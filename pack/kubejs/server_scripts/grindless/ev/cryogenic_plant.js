// priority: -12224
// -----------------------------------------------------------------------------------------------
// gtceu:cryogenic_processing recipes of the Cryogenic Plant (gtceu:cryogenic_plant, startup_scripts/grindless/ev/cryogenic_plant.js), and
// the recipes that make the plant and its radiators (EV era, docs/eras/ev.md, "Cryogenic plant").
//
//   liquid_oxygen     1,000 mB oxygen   -> 1,000 mB liquid oxygen     the freezer's own recipe: 1,920 EU/t, 240 ticks
//   liquid_helium     1,000 mB helium   -> 1,000 mB liquid helium     the freezer's own recipe: 1,920 EU/t, 240 ticks
//   liquid_nitrogen   1,000 mB nitrogen -> 1,000 mB liquid nitrogen   GTM has none; the same figures as oxygen (77 K against 90 K:
//                                                                     the difference in ideal work is a few percent)
// Every recipe carries .dimension('gcyr:luna') (only the Moon's cold and black sky make the plant worth it) and the data key
// grindless_night_eut: the EU/t the startup modifier gives a run that starts in the lunar night with every radiator open to the sky
// (half). The EMI line of the type reads that key. Recipe time is never changed.
//
// Where the gases come from: oxygen and nitrogen from the regolith cell (EV, on the Moon) or from home through the bridge (GTM's air
// distillation, electrolysis); helium from the regolith cell or the home network.
// Destinations: liquid nitrogen -> coolant of the EV tripod drill (and of the Mercury drill in IV); liquid oxygen -> IV extreme engines;
// liquid helium -> ingots of 5,000 K or more (IV; GTM's freezer already takes it). Nothing is voided: each output hatch holds one liquid,
// and a recipe only starts when its liquid has room.
//
//   Plant: ASSEMBLER (grindless:assembler/cryogenic_plant), EV hull + GTM vacuum freezer + 2 EV electric pumps + 4 night-sky radiators
//          + 8 sintered regolith (the cold hall) + 4 EV circuits + 2 B ammonia (the first coolant charge).
//   Night-Sky Radiator: ASSEMBLER (MV), 2 aluminium small fluid pipes (the heat pipes) + 4 aluminium plates (the face sheets) + 1 aluminium
//   frame (the core) + 100 mB ammonia (the heat pipes' working fluid, as in real spacecraft radiators) -> 2 radiators, 120 EU/t, 200 ticks.
//   The pipe goes first: GTM's frost-proof casing recipe starts with aluminium plates and a frame, and the lookup must keep both.
//
// Published in global.grindless.cryogenicPlant for the smoke test:
//   .recipes  [{ id, name, gas, liquid, amount, eut, nightEut, duration }]
//   .craftingRecipes { plant, radiator }, .craftingParts
(function () {
  const G = global.grindless || (global.grindless = {})
  const CRYO = G.cryogenicPlant || (G.cryogenicPlant = {})
  const LOG = '[grindless/ev] '

  const DIMENSION = 'gcyr:luna'
  const NIGHT_KEY = CRYO.nightKey || 'grindless_night_eut'
  const NIGHT_FACTOR = CRYO.nightFactor || 0.5
  const AMOUNT = 1000
  const EUT = 1920
  const DURATION = 240

  const TABLE = [
    { name: 'liquid_oxygen', gas: 'gtceu:oxygen', liquid: 'gtceu:liquid_oxygen' },
    { name: 'liquid_helium', gas: 'gtceu:helium', liquid: 'gtceu:liquid_helium' },
    { name: 'liquid_nitrogen', gas: 'gtceu:nitrogen', liquid: 'gtceu:liquid_nitrogen' }
  ]

  CRYO.recipes = TABLE.map(function (t) {
    return {
      id: 'grindless:cryogenic_processing/' + t.name,
      name: t.name,
      gas: t.gas,
      liquid: t.liquid,
      amount: AMOUNT,
      eut: EUT,
      nightEut: Math.round(EUT * NIGHT_FACTOR),
      duration: DURATION
    }
  })

  const PLANT = 'gtceu:cryogenic_plant'
  const RADIATOR = 'grindless:night_sky_radiator'
  const HULL = 'gtceu:ev_machine_hull'
  const FREEZER = 'gtceu:vacuum_freezer'
  const PUMP = 'gtceu:ev_electric_pump'
  const HEAT_PIPE = 'gtceu:aluminium_small_fluid_pipe'
  const PLATE = 'gtceu:aluminium_plate'
  const FRAME = 'gtceu:aluminium_frame'
  const AMMONIA = 'gtceu:ammonia'

  const BRICK = 'grindless:sintered_regolith'

  CRYO.craftingRecipes = { plant: 'grindless:assembler/cryogenic_plant', radiator: 'grindless:assembler/night_sky_radiator' }
  CRYO.craftingParts = [PLANT, RADIATOR, HULL, FREEZER, PUMP, HEAT_PIPE, PLATE, FRAME, BRICK]

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      addRecipes(event)
    } catch (e) {
      console.error(LOG + 'cryogenic plant recipes failed: ' + e)
    }
    try {
      addCrafting(event)
    } catch (e2) {
      console.error(LOG + 'cryogenic plant crafting recipes failed: ' + e2)
    }
  })

  function addRecipes(event) {
    var missing = []
    CRYO.recipes.forEach(function (r) {
      if (!Fluid.exists(r.gas)) missing.push(r.gas)
      if (!Fluid.exists(r.liquid)) missing.push(r.liquid)
    })
    if (missing.length > 0) {
      console.error(LOG + 'cryogenic plant recipes skipped, unknown fluid(s): ' + missing.join(', '))
      return
    }
    CRYO.recipes.forEach(function (r) {
      event.recipes.gtceu.cryogenic_processing('grindless:' + r.name)
        .inputFluids(Fluid.of(r.gas, r.amount))
        .outputFluids(Fluid.of(r.liquid, r.amount))
        .dimension(DIMENSION)
        .addDataNumber(NIGHT_KEY, r.nightEut)
        .EUt(r.eut).duration(r.duration)
    })
    console.info(LOG + 'cryogenic plant recipes added: ' + CRYO.recipes.length)
    addTritonNitricOxide(event)
    addKuiperNobleGas(event)
    addHighPurityNeon(event)
    addOganessonPropellant(event)
    addXenonCut(event)
    addHelium3SixN(event)
    addHelium4Ash(event)
    addInterstellarGas(event)
    addParaHydrogen(event)
    addLiquidParaHydrogen(event)
    addNeonSixN(event)
    addSpinFeedRows(event)
  }

  // UXV-A2 (docs/eras/uxv.md, "Cryogenic plant"): four rows keyed by their one input. The plant has one fluid slot in, so the second inputs
  // of the design are met by the input itself: liquid helium (already cooled with liquid nitrogen) and a real boil-off or tail in each cut.
  var SPIN_FEED_ROWS = [
    // line 27: the stellar helium cut, the Mk6 triple-alpha fuel; the cut's hydrogen and neon are real outputs
    { name: 'triple_alpha_fuel', label: 'triple-alpha fuel', eut: 7680, duration: 400,
      input: { id: 'gtceu:stellar_helium_cut', amount: 2000 },
      outputs: [{ id: 'gtceu:triple_alpha_fuel', amount: 1500 }, { id: 'gtceu:hydrogen', amount: 300 }, { id: 'gtceu:neon', amount: 200 }] },
    // line 29: O-16 to the oxygen-burning fuel; the uncondensed tail comes back as O-16 and goes into the next run
    { name: 'oxygen_burning_fuel', label: 'oxygen-burning fuel', eut: 7680, duration: 400,
      input: { id: 'gtceu:oxygen_16', amount: 1000 },
      outputs: [{ id: 'gtceu:oxygen_burning_fuel', amount: 900 }, { id: 'gtceu:oxygen_16', amount: 100 }] },
    // line 41 (KrF premix): air to krypton; nitrogen and oxygen go back to the air users
    { name: 'krypton_from_air', label: 'krypton from air', eut: 7680, duration: 600,
      input: { id: 'gtceu:liquid_air', amount: 10000 },
      outputs: [{ id: 'gtceu:krypton', amount: 100 }, { id: 'gtceu:nitrogen', amount: 7800 }, { id: 'gtceu:oxygen', amount: 2000 }] },
    // he_6n, the Earth controllers' era fluid: liquid helium (the precooled input; plain helium is the liquefier's) to the 6N grade; the boil-off goes back as helium
    { name: 'he_6n', label: 'helium 6N', eut: 7680, duration: 400,
      input: { id: 'gtceu:liquid_helium', amount: 1000 },
      outputs: [{ id: 'gtceu:he_6n', amount: 950 }, { id: 'gtceu:helium', amount: 50 }] }
  ]
  CRYO.spinFeedRows = SPIN_FEED_ROWS

  function addSpinFeedRows(event) {
    SPIN_FEED_ROWS.forEach(function (row) {
      addCryoRow(event, { id: 'grindless:cryogenic_processing/' + row.name, eut: row.eut, duration: row.duration, input: row.input, outputs: row.outputs },
        row.name, row.label)
    })
  }

  // UIV-B3 (docs/eras/uiv.md, line 45): the 5N neon of UHV's moderator is distilled once more to 6N, the grade of the solid-neon cone that
  // moderates the positronium lab's positrons (Mills & Gullikson 1986). The impurity-rich cut goes back as neon. The only input is 5N neon.
  var NEON_6N = { id: 'grindless:cryogenic_processing/neon_6n', eut: 7680, duration: 600,
    input: { id: 'gtceu:high_purity_neon', amount: 1000 },
    outputs: [{ id: 'gtceu:neon_6n', amount: 900 }, { id: 'gtceu:neon', amount: 100 }] }
  CRYO.neon6nRow = NEON_6N

  function addNeonSixN(event) {
    addCryoRow(event, NEON_6N, 'neon_6n', 'neon 6N')
  }

  // UIV-A2 (docs/eras/uiv.md, line 1): protium (the heavy water plant's draw-off, and the ramp-compression pulser's H2 shards) is converted
  // from ortho to para hydrogen over a catalyst bed in the cold, then liquefied. Only the gas goes in; the liquid is the target's coolant.
  var PARA_HYDROGEN = { id: 'grindless:cryogenic_processing/para_hydrogen', eut: 7680, duration: 400,
    input: { id: 'gtceu:protium', amount: 1000 },
    outputs: [{ id: 'gtceu:para_hydrogen', amount: 1000 }] }
  CRYO.paraHydrogenRow = PARA_HYDROGEN
  var LIQUID_PARA_HYDROGEN = { id: 'grindless:cryogenic_processing/liquid_para_hydrogen', eut: 7680, duration: 400,
    input: { id: 'gtceu:para_hydrogen', amount: 1000 },
    outputs: [{ id: 'gtceu:liquid_para_hydrogen', amount: 1000 }] }
  CRYO.liquidParaHydrogenRow = LIQUID_PARA_HYDROGEN

  function addParaHydrogen(event) {
    addCryoRow(event, PARA_HYDROGEN, 'para_hydrogen', 'para hydrogen')
  }

  function addLiquidParaHydrogen(event) {
    addCryoRow(event, LIQUID_PARA_HYDROGEN, 'liquid_para_hydrogen', 'liquid para hydrogen')
  }

  // UEV-B2 (docs/eras/uev.md, line 26): the nebula collector's compressed interstellar gas is split by boiling point. Hydrogen and deuterium
  // come out as one fraction (the H/D distillation tower splits it), helium as another (helium-3 and helium-4), and the neon is drawn off.
  // The only input is the compressed gas, which exists only after the Alpha Centauri orbit's collector.
  var INTERSTELLAR_GAS = { id: 'grindless:cryogenic_processing/interstellar_gas', eut: 7680, duration: 600,
    input: { id: 'gtceu:compressed_interstellar_gas', amount: 4000 },
    outputs: [{ id: 'gtceu:hydrogen_deuterium_fraction', amount: 2400 }, { id: 'gtceu:helium_fraction', amount: 1200 }, { id: 'gtceu:neon', amount: 400 }] }
  CRYO.interstellarGasRow = INTERSTELLAR_GAS

  function addInterstellarGas(event) {
    addCryoRow(event, INTERSTELLAR_GAS, 'interstellar_gas', 'interstellar gas')
  }

  // UEV-A7 (docs/eras/uev.md, line 23): helium-3 to 6N helium-3, the fusion fuel's grade. The impurities (helium-4 and the hydrogen
  // isotopologues) condense first and come out as helium. The only input is helium-3: the depolarised gas of the polariser comes back here.
  var HELIUM3_6N = { id: 'grindless:cryogenic_processing/helium_3_6n', eut: 7680, duration: 400,
    input: { id: 'gtceu:helium_3', amount: 1000 },
    outputs: [{ id: 'gtceu:helium_3_6n', amount: 950 }, { id: 'gtceu:helium', amount: 50 }] }
  CRYO.helium3Row = HELIUM3_6N

  // UEV-A7 (line 23): the ash of the Mk4 ring's plasma, after the direct energy converter, is helium-4: it is recovered as helium. The only
  // input is the ash.
  var HELIUM4_ASH = { id: 'grindless:cryogenic_processing/helium_4_ash', eut: 7680, duration: 200,
    input: { id: 'gtceu:helium_4_ash', amount: 1000 },
    outputs: [{ id: 'gtceu:helium', amount: 1000 }] }
  CRYO.helium4Row = HELIUM4_ASH

  function addCryoRow(event, row, name, label) {
    var ids = [row.input.id].concat(row.outputs.map(function (f) { return f.id }))
    var missing = ids.filter(function (id) { return !Fluid.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'cryogenic plant ' + label + ' row skipped, unknown fluid(s): ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu.cryogenic_processing('grindless:' + name)
      .inputFluids(Fluid.of(row.input.id, row.input.amount))
    row.outputs.forEach(function (o) { b.outputFluids(Fluid.of(o.id, o.amount)) })
    b.dimension(DIMENSION)
      .addDataNumber(NIGHT_KEY, Math.round(row.eut * NIGHT_FACTOR))
      .EUt(row.eut).duration(row.duration)
    console.info(LOG + 'cryogenic plant ' + label + ' row added')
  }
  function addHelium3SixN(event) {
    addCryoRow(event, HELIUM3_6N, 'helium_3_6n', 'helium-3 6N')
  }

  function addHelium4Ash(event) {
    addCryoRow(event, HELIUM4_ASH, 'helium_4_ash', 'helium-4 ash')
  }

  // UEV-A2 (docs/eras/uev.md, line 6): the xenon of the heavy ion cyclotron's track-etch beam. Liquid nether air is cooled further:
  // xenon (165 K) condenses first and is drawn off; the rest of the nether air is given back as gas. The only input is liquid nether air.
  var XENON_CUT = { id: 'grindless:cryogenic_processing/xenon_cut', eut: 7680, duration: 400,
    input: { id: 'gtceu:liquid_nether_air', amount: 2000 },
    outputs: [{ id: 'gtceu:xenon', amount: 100 }, { id: 'gtceu:nether_air', amount: 1900 }] }
  CRYO.xenonRow = XENON_CUT

  function addXenonCut(event) {
    var ids = [XENON_CUT.input.id].concat(XENON_CUT.outputs.map(function (f) { return f.id }))
    var missing = ids.filter(function (id) { return !Fluid.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'cryogenic plant xenon row skipped, unknown fluid(s): ' + missing.join(', '))
      return
    }
    var out = XENON_CUT.outputs
    event.recipes.gtceu.cryogenic_processing('grindless:xenon_cut')
      .inputFluids(Fluid.of(XENON_CUT.input.id, XENON_CUT.input.amount))
      .outputFluids(Fluid.of(out[0].id, out[0].amount), Fluid.of(out[1].id, out[1].amount))
      .dimension(DIMENSION)
      .addDataNumber(NIGHT_KEY, Math.round(XENON_CUT.eut * NIGHT_FACTOR))
      .EUt(XENON_CUT.eut).duration(XENON_CUT.duration)
    console.info(LOG + 'cryogenic plant xenon row added')
  }

  // UV-A1 (docs/eras/uv.md, line 3): distillation of Triton nitrogen's oxide. The 15N isotopologue of the oxide is lighter and stays
  // in the cold, so the plant splits the mixture into 15NO (-> 15N in a chemical reactor) and ordinary NO (-> nitric acid lines).
  // The only input is that oxide: it is the one recipe that runs with Triton nitrogen's oxide and nothing else.
  var TRITON_NO = { id: 'grindless:cryogenic_processing/triton_nitric_oxide', eut: 7680, duration: 400 }
  CRYO.tritonRow = TRITON_NO

  function addTritonNitricOxide(event) {
    var ids = ['gtceu:triton_nitric_oxide', 'gtceu:nitrogen_15_oxide', 'gtceu:nitric_oxide']
    var missing = ids.filter(function (id) { return !Fluid.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'cryogenic plant Triton nitric oxide row skipped, unknown fluid(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.cryogenic_processing('grindless:triton_nitric_oxide')
      .inputFluids(Fluid.of('gtceu:triton_nitric_oxide', 2000))
      .outputFluids(Fluid.of('gtceu:nitrogen_15_oxide', 1000), Fluid.of('gtceu:nitric_oxide', 1000))
      .dimension(DIMENSION)
      .addDataNumber(NIGHT_KEY, Math.round(TRITON_NO.eut * NIGHT_FACTOR))
      .EUt(TRITON_NO.eut).duration(TRITON_NO.duration)
    console.info(LOG + 'cryogenic plant Triton nitric oxide row added')
  }

  // UV-B4 (docs/eras/uv.md, line 17): fractional distillation of the Kuiper noble gas the amorphous ice annealer releases on Pluto's
  // station. Argon boils first (87 K), then krypton (120 K), then xenon (165 K): argon -> the printer, krypton -> the Hall thruster,
  // xenon -> the ion thruster (UV-A11's thruster works). The only input is the mix: the one recipe that runs with it and nothing else.
  var KUIPER_NOBLE = { id: 'grindless:cryogenic_processing/kuiper_noble_gas', eut: 7680, duration: 400,
    input: { id: 'gtceu:kuiper_noble_gas', amount: 1000 },
    outputs: [{ id: 'gtceu:argon', amount: 400 }, { id: 'gtceu:krypton', amount: 400 }, { id: 'gtceu:xenon', amount: 200 }] }
  CRYO.kuiperRow = KUIPER_NOBLE

  function addKuiperNobleGas(event) {
    var ids = [KUIPER_NOBLE.input.id].concat(KUIPER_NOBLE.outputs.map(function (f) { return f.id }))
    var missing = ids.filter(function (id) { return !Fluid.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'cryogenic plant Kuiper noble gas row skipped, unknown fluid(s): ' + missing.join(', '))
      return
    }
    var out = KUIPER_NOBLE.outputs
    event.recipes.gtceu.cryogenic_processing('grindless:kuiper_noble_gas')
      .inputFluids(Fluid.of(KUIPER_NOBLE.input.id, KUIPER_NOBLE.input.amount))
      .outputFluids(Fluid.of(out[0].id, out[0].amount), Fluid.of(out[1].id, out[1].amount), Fluid.of(out[2].id, out[2].amount))
      .dimension(DIMENSION)
      .addDataNumber(NIGHT_KEY, Math.round(KUIPER_NOBLE.eut * NIGHT_FACTOR))
      .EUt(KUIPER_NOBLE.eut).duration(KUIPER_NOBLE.duration)
    console.info(LOG + 'cryogenic plant Kuiper noble gas row added')
  }

  // UHV-A6 (docs/eras/uhv.md, line 27): 99.999 % neon for the positron accumulator's moderator (a film of solid neon slows sodium-22's
  // positrons). Neon from GTM's nether air distillation, or the neon a spent positron source gives back, is distilled again: the helium
  // (boils at 4 K against neon's 27 K) comes off the top -> the superfluid helium plant. The only input is neon: the one recipe that runs
  // with it and nothing else.
  var HIGH_PURITY_NEON = { id: 'grindless:cryogenic_processing/high_purity_neon', eut: 7680, duration: 600,
    input: { id: 'gtceu:neon', amount: 1000 },
    outputs: [{ id: 'gtceu:high_purity_neon', amount: 950 }, { id: 'gtceu:helium', amount: 50 }] }
  CRYO.neonRow = HIGH_PURITY_NEON

  function addHighPurityNeon(event) {
    var ids = [HIGH_PURITY_NEON.input.id].concat(HIGH_PURITY_NEON.outputs.map(function (f) { return f.id }))
    var missing = ids.filter(function (id) { return !Fluid.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'cryogenic plant high-purity neon row skipped, unknown fluid(s): ' + missing.join(', '))
      return
    }
    var out = HIGH_PURITY_NEON.outputs
    event.recipes.gtceu.cryogenic_processing('grindless:high_purity_neon')
      .inputFluids(Fluid.of(HIGH_PURITY_NEON.input.id, HIGH_PURITY_NEON.input.amount))
      .outputFluids(Fluid.of(out[0].id, out[0].amount), Fluid.of(out[1].id, out[1].amount))
      .dimension(DIMENSION)
      .addDataNumber(NIGHT_KEY, Math.round(HIGH_PURITY_NEON.eut * NIGHT_FACTOR))
      .EUt(HIGH_PURITY_NEON.eut).duration(HIGH_PURITY_NEON.duration)
    console.info(LOG + 'cryogenic plant high-purity neon row added')
  }

  // UHV-B3 (docs/eras/uhv.md, line 30): the Mk3 fusion reactor's crude oganesson (its off-gas carries the lighter noble gases it was
  // bred among) is distilled to pure oganesson, the swarm control station's propellant (-> UHV-A8's propellant pods). Krypton (120 K)
  // and xenon (165 K) boil off first; oganesson, a solid near room temperature, stays: krypton -> the swarm station's spare fuel or the
  // Hall thruster, xenon -> the ion thruster (UV-A11's thruster works). The only input is crude oganesson: the one recipe that runs
  // with it and nothing else.
  var OGANESSON_PROPELLANT = { id: 'grindless:cryogenic_processing/oganesson_propellant', eut: 7680, duration: 400,
    input: { id: 'gtceu:oganesson', amount: 1000 },
    outputs: [{ id: 'gtceu:oganesson_propellant', amount: 900 }, { id: 'gtceu:krypton', amount: 60 }, { id: 'gtceu:xenon', amount: 40 }] }
  CRYO.oganessonRow = OGANESSON_PROPELLANT

  function addOganessonPropellant(event) {
    var ids = [OGANESSON_PROPELLANT.input.id].concat(OGANESSON_PROPELLANT.outputs.map(function (f) { return f.id }))
    var missing = ids.filter(function (id) { return !Fluid.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'cryogenic plant oganesson propellant row skipped, unknown fluid(s): ' + missing.join(', '))
      return
    }
    var out = OGANESSON_PROPELLANT.outputs
    event.recipes.gtceu.cryogenic_processing('grindless:oganesson_propellant')
      .inputFluids(Fluid.of(OGANESSON_PROPELLANT.input.id, OGANESSON_PROPELLANT.input.amount))
      .outputFluids(Fluid.of(out[0].id, out[0].amount), Fluid.of(out[1].id, out[1].amount), Fluid.of(out[2].id, out[2].amount))
      .dimension(DIMENSION)
      .addDataNumber(NIGHT_KEY, Math.round(OGANESSON_PROPELLANT.eut * NIGHT_FACTOR))
      .EUt(OGANESSON_PROPELLANT.eut).duration(OGANESSON_PROPELLANT.duration)
    console.info(LOG + 'cryogenic plant oganesson propellant row added')
  }

  function addCrafting(event) {
    var missing = CRYO.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (!Fluid.exists(AMMONIA)) missing.push(AMMONIA)
    if (missing.length > 0) {
      console.error(LOG + 'cryogenic plant crafting skipped, unknown id(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:cryogenic_plant')
      .itemInputs(HULL, FREEZER, '2x ' + PUMP, '4x ' + RADIATOR, '8x ' + BRICK, '4x #gtceu:circuits/ev')
      .inputFluids(Fluid.of(AMMONIA, 2000))
      .itemOutputs(PLANT)
      .EUt(120).duration(400)

    event.recipes.gtceu.assembler('grindless:night_sky_radiator')
      .itemInputs('2x ' + HEAT_PIPE, '4x ' + PLATE, '1x ' + FRAME)
      .inputFluids(Fluid.of(AMMONIA, 100))
      .itemOutputs('2x ' + RADIATOR)
      .EUt(120).duration(200)
    console.info(LOG + 'cryogenic plant and night-sky radiator crafting recipes added')
  }
})()
