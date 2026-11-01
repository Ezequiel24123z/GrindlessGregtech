// priority: -20240
// MAX+ machines 7 and 8 at the Magellanic Stream and lines P9, P10, P11, P22 and P23 (docs/eras/maxplus.md, machines 7-8 and 'Lines'; package XP-B2).
//
//   P9  pristine hydrogen   gas works (c1) -> pristine_gas; cryogenic plant -> liquid_pristine_hydrogen; distillation -> hd_fraction;
//                           calutron c20 -> primordial_deuterium
//   P10 pristine helium-3   cryogenic plant -> pristine_helium; superfluid plant -> he3_enriched_helium; distillation -> crude_helium_3;
//                           calutron c21 -> pristine_helium_3
//   P11 direct converter    solvent extraction c28 -> molybdenum_oxide; EBF (hydrogen reduction) -> mo_powder; SPS c25 -> mo_grid_billet;
//                           electron beam -> refined_mo_grid; assembler c27 -> direct_converter_stack
//   P22 neutral beam        solvent extraction -> caesium_chloride; zone refining c18 -> six_n_caesium; SRF cavity c12 -> rfq_cavity;
//                           jet beam line c3 (Cygnus) -> beam_neutraliser; assembler -> neutral_beam_injector
//   P23 magnetic scoop      PBO synthesis c6 -> scoop_web; field press c4 (SGR 1806-20) -> field_frozen_hoop; MTJ sputtering c29 -> insulated_hoop;
//                           magnet winding c18 -> scoop_coil; closed-loop cooling -> cold_scoop_coil; assembler -> magnetic_scoop_module
//
// One gas works run (64,000 mB) makes 1,000 mB of deuterium and 1,000 mB of helium-3, which is exactly one torus run: the torus c1 makes 2^34 x 2,400
// EU, the gas works c1 uses 2^33 x 2,400 (a net of 2.0 x). The gas works wears a magnetic scoop module (1 in 64); the torus a neutral beam injector (1 in 64)
// and a direct converter stack (1 in 128). The two machines run only at the Stream; every older machine keeps its own site (the cryogenic plant on the
// Moon, the field press at SGR 1806-20, the jet beam line at Cygnus X-1, the rest at home).
// Circuits: the first free one of each older machine type (an assembler has only 27 free, so the other two assembler rows carry none).
// Published for the tests: global.grindless.maxPlusStream { rows, cools, controllers, skipped }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_stream] '
  var G = global.grindless || (global.grindless = {})
  var MS = G.maxPlusStream || (G.maxPlusStream = {})
  MS.skipped = []

  function va(t) { return Number(GTValues.VA[t]) }
  var VA_MAX = va(14)
  var V_MAX = Number(GTValues.V[14])
  var KERR = 'gtceu:kerr_condensate'
  var HULL = 'gtceu:max_machine_hull'
  var STREAM = (G.maxPlusTravel && G.maxPlusTravel.places && G.maxPlusTravel.places.stream && G.maxPlusTravel.places.stream.dimension) || 'grindless:magellanic_stream'
  var LUNA = 'gcyr:luna'
  var SGR = 'grindless:sgr1806_orbit'
  var CYGNUS = 'grindless:cygnus_x1_orbit'
  var WORKS_KEY = 'grindless_pristine_gas_works'
  var TORUS_KEY = 'grindless_primordial_fusion_torus'

  // type, name, circuit (none: 0), items in, wear (chanced inputs: [id, chance of 10000]), fluids in, items out, fluids out, EU/t, ticks, dim (site)
  var ROWS = [
    // P9
    { type: 'cryogenic_processing', name: 'liquid_pristine_hydrogen', eut: 7680, duration: 400, dim: LUNA,
      fluids: [['gtceu:pristine_gas', 16000]], fluidOuts: [['gtceu:liquid_pristine_hydrogen', 12000], ['gtceu:pristine_helium', 4000]] },
    { type: 'distillation_tower', name: 'hd_fraction', eut: va(7), duration: 400,
      fluids: [['gtceu:liquid_pristine_hydrogen', 12000]], fluidOuts: [['gtceu:hd_fraction', 3000], ['gtceu:hydrogen', 9000]] },
    { type: 'calutron_separation', name: 'primordial_deuterium', circuit: 20, eut: 1966080, duration: 900, key: 'grindless_calutron_separation',
      fluids: [['gtceu:hd_fraction', 12000]], fluidOuts: [['gtceu:primordial_deuterium', 1000]] },
    // P10
    { type: 'superfluid_helium', name: 'he3_enriched_helium', eut: va(7), duration: 300,
      fluids: [['gtceu:pristine_helium', 4000]], fluidOuts: [['gtceu:he3_enriched_helium', 2000], ['gtceu:liquid_helium_4', 2000]] },
    { type: 'distillation_tower', name: 'crude_helium_3', eut: va(7), duration: 400,
      fluids: [['gtceu:he3_enriched_helium', 2000]], fluidOuts: [['gtceu:crude_helium_3', 500], ['gtceu:helium', 1500]] },
    { type: 'calutron_separation', name: 'pristine_helium_3', circuit: 21, eut: 1966080, duration: 900, key: 'grindless_calutron_separation',
      fluids: [['gtceu:crude_helium_3', 2000]], fluidOuts: [['gtceu:pristine_helium_3', 1000]] },
    // P11
    { type: 'solvent_extraction', name: 'molybdenum_oxide', circuit: 28, eut: va(7), duration: 600,
      items: [['gtceu:molybdenite_dust', 8]], fluids: [['gtceu:nitric_acid', 2000], ['gtceu:ammonia', 1000]],
      outs: [['grindless:molybdenum_oxide', 4], ['gtceu:sulfur_dust', 8]], fluidOuts: [['gtceu:nitric_oxide', 1000]] },
    { type: 'electric_blast_furnace', name: 'mo_powder', eut: va(7), duration: 800, temp: 2800,
      items: [['grindless:molybdenum_oxide', 4]], fluids: [['gtceu:hydrogen', 4000]], outs: [['grindless:mo_powder', 4]] },
    { type: 'spark_plasma_sintering', name: 'mo_grid_billet', circuit: 25, eut: va(9), duration: 1200,
      items: [['grindless:mo_powder', 4], ['gtceu:molybdenum_plate', 4], ['gtceu:niobium_titanium_plate', 2]], outs: [['grindless:mo_grid_billet', 1]] },
    { type: 'electron_beam_refining', name: 'refined_mo_grid', eut: va(9), duration: 600, key: 'grindless_electron_beam',
      items: [['grindless:mo_grid_billet', 1], ['gtceu:molybdenum_dust', 2]], fluids: [['gtceu:argon', 1000]], outs: [['grindless:refined_mo_grid', 1]] },
    { type: 'assembler', name: 'direct_converter_stack', circuit: 27, eut: va(10), duration: 900,
      items: [['grindless:refined_mo_grid', 8], ['gtceu:superconducting_coil', 2], ['gtceu:tungsten_steel_plate', 4]], fluids: [['gtceu:soldering_alloy', 2304]],
      outs: [['grindless:direct_converter_stack', 1]] },
    // P22
    { type: 'solvent_extraction', name: 'caesium_chloride', eut: va(7), duration: 600,
      items: [['gtceu:pollucite_dust', 8]], fluids: [['gtceu:hydrochloric_acid', 4000], ['gtceu:hydrofluoric_acid', 1000]],
      outs: [['grindless:caesium_chloride', 4]] },
    { type: 'zone_refining', name: 'six_n_caesium', circuit: 18, eut: va(7), duration: 900,
      items: [['grindless:caesium_chloride', 4]], fluids: [['gtceu:argon', 1000]], outs: [['grindless:six_n_caesium', 2]] },
    { type: 'srf_cavity', name: 'rfq_cavity', circuit: 12, eut: va(8), duration: 900,
      items: [['grindless:six_n_caesium', 2], ['gtceu:niobium_titanium_plate', 8], ['gtceu:lead_plate', 4]], fluids: [['gtceu:liquid_helium', 1000]],
      outs: [['grindless:rfq_cavity', 1]] },
    { type: 'jet_beam_extraction', name: 'beam_neutraliser', circuit: 3, eut: 503316480, duration: 400, dim: CYGNUS,
      items: [['grindless:rfq_cavity', 1], ['gtceu:lithium_dust', 4]], fluids: [['gtceu:hydrogen', 2000]],
      outs: [['grindless:beam_neutraliser', 1]], fluidOuts: [['gtceu:hydrogen', 1000]] },
    { type: 'assembler', name: 'neutral_beam_injector', eut: va(10), duration: 900,
      items: [['grindless:beam_neutraliser', 4], ['gtceu:superconducting_coil', 2], ['gtceu:tungsten_steel_plate', 4]], fluids: [['gtceu:soldering_alloy', 2304]],
      outs: [['grindless:neutral_beam_injector', 1]] },
    // P23
    { type: 'pbo_synthesis', name: 'scoop_web', circuit: 6, eut: va(8), duration: 800,
      items: [['gtceu:carbon_fibers', 8], ['gtceu:boron_carbide_dust', 4]], fluids: [['gtceu:nitric_acid', 1000], ['gtceu:hydrochloric_acid', 1000]],
      outs: [['grindless:scoop_web', 1]] },
    { type: 'field_freezing', name: 'field_frozen_hoop', circuit: 4, eut: 268435456, duration: 1000, dim: SGR, key: 'grindless_field_freezing',
      items: [['grindless:scoop_web', 1], ['gtceu:niobium_titanium_plate', 4]], outs: [['grindless:field_frozen_hoop', 1]] },
    { type: 'mtj_sputtering', name: 'insulated_hoop', circuit: 29, eut: va(12), duration: 900, key: 'grindless_mtj_sputtering',
      items: [['grindless:field_frozen_hoop', 1], ['gtceu:molybdenum_plate', 4]], fluids: [['gtceu:argon', 1000]], outs: [['grindless:insulated_hoop', 1]] },
    { type: 'magnet_winding', name: 'scoop_coil', circuit: 18, eut: va(6), duration: 800, key: 'grindless_magnet_winding',
      items: [['grindless:insulated_hoop', 1], ['gtceu:superconducting_coil', 2]], fluids: [['gtceu:liquid_helium', 1000]], outs: [['grindless:scoop_coil', 1]] },
    { type: 'assembler', name: 'magnetic_scoop_module', eut: va(10), duration: 900,
      items: [['grindless:cold_scoop_coil', 4], ['grindless:scoop_web', 4], ['gtceu:tungsten_steel_plate', 4]], fluids: [['gtceu:soldering_alloy', 2304]],
      outs: [['grindless:magnetic_scoop_module', 1]] },
    // the machines' own rows (the gas works 2^33 EU/t in on one 1,024 A hatch; the torus 2^34 EU/t out)
    { type: 'pristine_gas_works', name: 'pristine_gas', circuit: 1, eut: V_MAX * 4, duration: 2400, key: WORKS_KEY, machine: true, dim: STREAM,
      wear: [['grindless:magnetic_scoop_module', 156]], fluidOuts: [['gtceu:pristine_gas', 64000]] },
    { type: 'primordial_fusion_torus', name: 'helium_4_ash', circuit: 1, eut: -Math.pow(2, 34), duration: 2400, key: TORUS_KEY, machine: true, dim: STREAM,
      wear: [['grindless:neutral_beam_injector', 156], ['grindless:direct_converter_stack', 78]],
      fluids: [['gtceu:primordial_deuterium', 1000], ['gtceu:pristine_helium_3', 1000]],
      fluidOuts: [['gtceu:helium_4_ash', 1000], ['gtceu:hydrogen', 1000]] }
  ]
  MS.rows = ROWS

  // cold_scoop_coil: the closed-loop cooling row (assembler.js addCool's shape)
  var COOLS = [{ name: 'cold_scoop_coil', input: 'grindless:scoop_coil', output: 'grindless:cold_scoop_coil', eut: va(6), duration: 800 }]
  var COOL_FLUIDS = {
    makeUp: { id: 'gtceu:liquid_helium', amount: 25 }, precoolIn: { id: 'gtceu:liquid_nitrogen', amount: 50 },
    precoolOut: { id: 'gtceu:nitrogen', amount: 50 }, charge: { id: 'gtceu:liquid_helium', amount: 4000 }
  }
  MS.cools = COOLS

  var COMPS = ['2x grindless:maxplus_conveyor_module', '2x grindless:maxplus_robot_arm', '2x grindless:maxplus_field_generator', '2x grindless:maxplus_sensor']
  var CASING = 'grindless:horizon_machine_casing'
  var CONTROLLERS = [
    { name: 'pristine_gas_works', machine: 'gtceu:pristine_gas_works', research: 'grindless:cold_scoop_coil', casing: CASING, comps: COMPS,
      plates: ['4x grindless:magnetic_scoop_module', '2x grindless:scoop_web'] },
    { name: 'primordial_fusion_torus', machine: 'gtceu:primordial_fusion_torus', research: 'grindless:refined_mo_grid', casing: CASING, comps: COMPS,
      plates: ['2x grindless:direct_converter_stack', '2x grindless:neutral_beam_injector'] }
  ]
  MS.controllers = CONTROLLERS

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return String(id).charAt(0) !== '#' && ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id, k) { return fluids.indexOf(id) === k && !Fluid.exists(id) }))
  }
  function pairs(list, k) { return (list[k] || []).map(function (x) { return x[0] }) }
  function idOf(s) { return s.replace(/^\d+x /, '') }

  function skip(name, reason) {
    MS.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function addRow(event, r) {
    var ids = pairs(r, 'items').concat(pairs(r, 'wear'), pairs(r, 'outs'))
    var fluids = pairs(r, 'fluids').concat(pairs(r, 'fluidOuts'))
    var missing = missingIds(ids, fluids)
    if (missing.length > 0) return skip(r.type + '/' + r.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
    ;(r.items || []).forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    ;(r.wear || []).forEach(function (x) { b.chancedInput('1x ' + x[0], x[1], 0) })
    if (r.circuit) b.circuit(r.circuit)
    ;(r.fluids || []).forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
    ;(r.outs || []).forEach(function (x) { b.itemOutputs(x[1] + 'x ' + x[0]) })
    ;(r.fluidOuts || []).forEach(function (x) { b.outputFluids(Fluid.of(x[0], x[1])) })
    if (r.key) b.addDataString(r.key, r.name)
    if (r.temp) b.blastFurnaceTemp(r.temp)
    if (r.dim) b.dimension(r.dim)
    b.EUt(r.eut).duration(r.duration)
  }

  function addCool(event, c) {
    var cfg = (G.heliumRefrigerator && G.heliumRefrigerator.config) || COOL_FLUIDS
    var fl = [cfg.makeUp.id, cfg.precoolIn.id, cfg.precoolOut.id, cfg.charge.id]
    var missing = missingIds([c.input, c.output], fl)
    if (missing.length > 0) return skip('closed_loop_cooling/' + c.name, 'unknown id(s): ' + missing.join(', '))
    var dataKey = (G.heliumRefrigerator && G.heliumRefrigerator.dataKey) || 'grindless_closed_loop'
    event.recipes.gtceu.closed_loop_cooling('grindless:' + c.name)
      .itemInputs('1x ' + c.input)
      .inputFluids(Fluid.of(cfg.makeUp.id, cfg.makeUp.amount))
      .inputFluids(Fluid.of(cfg.precoolIn.id, cfg.precoolIn.amount))
      .notConsumableFluid(Fluid.of(cfg.charge.id, cfg.charge.amount))
      .itemOutputs('1x ' + c.output)
      .outputFluids(Fluid.of(cfg.precoolOut.id, cfg.precoolOut.amount))
      .addDataString(dataKey, 'grindless:closed_loop_cooling/' + c.name)
      .EUt(c.eut).duration(c.duration)
  }

  function addAssemblyLine(event, name, spec, items, fluids, out, research, cwut, duration) {
    var ids = items.map(idOf).concat([out, research])
    var missing = missingIds(ids, fluids.map(function (f) { return f[0] }))
    if (missing.length > 0) return skip(name, 'unknown id(s): ' + missing.join(', '))
    var a = event.recipes.gtceu.assembly_line('grindless:' + name)
    items.forEach(function (s) { a.itemInputs(s) })
    fluids.forEach(function (f) { a.inputFluids(Fluid.of(f[0], f[1])) })
    a.itemOutputs(out)
    a.stationResearch(function (r) { return r.researchStack(Item.of(research)).CWUt(cwut).EUt(VA_MAX) })
    a.EUt(VA_MAX).duration(duration)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      MS.skipped = []
      ROWS.forEach(function (r) { addRow(event, r) })
      COOLS.forEach(function (c) { addCool(event, c) })
      CONTROLLERS.forEach(function (c) {
        var items = ['1x ' + HULL, '2x ' + c.casing, '8x grindless:horizon_processor', '4x #gtceu:circuits/max'].concat(c.comps, c.plates)
        addAssemblyLine(event, c.name, c, items, [[KERR, 2000]], c.machine, c.research, 64, 4800)
      })
      console.info(LOG + (ROWS.length + COOLS.length + CONTROLLERS.length) + ' rows; skipped ' + MS.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
