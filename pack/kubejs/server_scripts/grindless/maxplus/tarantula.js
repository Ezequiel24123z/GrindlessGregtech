// priority: -20240
// MAX+ machines 4 to 6 at 30 Doradus and lines P6, P7, P8, P17, P20 and P21 (docs/eras/maxplus.md, machines 4-6 and 'Lines'; package XP-B1).
//
//   P6  VMS plasma     lift (c1) -> raw_vms_plasma; mass filter c6 -> vms_core_plasma; FRC forming c4 -> confined_vms_plasma
//   P7  nickel-56      crucible (c1) -> ni56_slug + ime_ash; canner -> canned_ni56; hot cell c24 -> shielded_ni56_cask; burner c1 -> co56_cask,
//                      c2 -> spent_fe56_cask (both GENERATOR rows: 2^34 and 2^33 EU/t out); hot cell c26 returns the iron
//   P8  ime ash        solvent extraction c16 -> ime_leach_fractions; EBF -> recovered_silicon; zone refining c17 -> electronic_grade_silicon
//   P17 sCO2 module    SCC c4 -> sx_turbine_blade; electron beam -> tbc_coated_blade; SPS c24 -> turbine_disc; hot rolling c15 -> pche_recuperator_foil;
//                      assembler c28 -> sco2_turbine_module
//   P20 lift nozzle    CVI c17 -> sic_nozzle_former; coated conductor c11 -> nozzle_tape; magnet winding c17 -> nozzle_winding; chemical reactor c8 ->
//                      impregnated_nozzle; closed-loop cooling -> vms_lift_nozzle
//   P21 crucible liner CVI c18 -> infiltrated_liner; electron beam -> sealed_liner; megabar c15 -> densified_liner; lathe -> crucible_liner
//
// Circuits: the first free one of each older machine type in line-id order (item-keyed rows have none). Every row of an older machine carries the
// 30 Doradus dimension (grindless:tarantula_orbit); the three machines of this package run only there. Casings: assembler c29 and c30.
// Published for the tests: global.grindless.maxPlusTarantula { rows, cools, controllers, skipped }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_tarantula] '
  var G = global.grindless || (global.grindless = {})
  var MT = G.maxPlusTarantula || (G.maxPlusTarantula = {})
  MT.skipped = []

  function va(t) { return Number(GTValues.VA[t]) }
  var VA_MAX = va(14)
  var V_MAX = Number(GTValues.V[14])
  var KERR = 'gtceu:kerr_condensate'
  var HULL = 'gtceu:max_machine_hull'
  var TARANTULA = 'grindless:tarantula_orbit'
  var M_EUT = V_MAX * 16
  var LIFT_KEY = 'grindless_tarantula_stellar_lift'
  var CRUCIBLE_KEY = 'grindless_pair_instability_crucible'
  var BURNER_KEY = 'grindless_nickel_56_burner'

  // type, name, circuit (none for item-keyed rows), items in, wear (chanced inputs: [id, chance of 10000]), fluids in, items out, fluids out, EU/t, ticks
  var ROWS = [
    // P6
    { type: 'plasma_mass_filtering', name: 'vms_core_plasma', circuit: 6, eut: V_MAX, duration: 600, key: 'grindless_plasma_mass_filtering',
      fluids: [['gtceu:raw_vms_plasma', 10000]], fluidOuts: [['gtceu:vms_core_plasma', 6000], ['gtceu:stellar_heavy_cut', 1000]] },
    { type: 'frc_forming', name: 'confined_vms_plasma', circuit: 4, eut: va(11), duration: 900, key: 'grindless_frc_forming',
      items: [['gtceu:tungsten_steel_plate', 2]], fluids: [['gtceu:vms_core_plasma', 8000]], fluidOuts: [['gtceu:confined_vms_plasma', 8000]] },
    // P7
    { type: 'canner', name: 'canned_ni56', eut: va(6), duration: 300,
      items: [['grindless:ni56_slug', 1], ['grindless:chain_lamina_stack', 1]], outs: [['grindless:canned_ni56', 1]] },
    { type: 'hot_cell', name: 'shielded_ni56_cask', circuit: 24, eut: 7680, duration: 600, key: 'grindless_hot_cell',
      items: [['grindless:canned_ni56', 1], ['gtceu:lead_plate', 8], ['gtceu:boron_carbide_dust', 4]], outs: [['grindless:shielded_ni56_cask', 1]] },
    { type: 'hot_cell', name: 'spent_fe56_cask_iron', circuit: 26, eut: 7680, duration: 600, key: 'grindless_hot_cell',
      items: [['grindless:spent_fe56_cask', 1]], outs: [['minecraft:iron_ingot', 64], ['gtceu:lead_plate', 8]] },
    // P8
    { type: 'solvent_extraction', name: 'ime_leach_fractions', circuit: 16, eut: va(7), duration: 600,
      items: [['grindless:ime_ash', 4]], fluids: [['gtceu:sulfuric_acid', 4000]],
      outs: [['gtceu:sulfur_dust', 4], ['gtceu:calcium_dust', 2]], fluidOuts: [['gtceu:ime_leach_fractions', 3000]] },
    { type: 'electric_blast_furnace', name: 'recovered_silicon', eut: va(7), duration: 800, temp: 4200,
      items: [['gtceu:graphite_dust', 4]], fluids: [['gtceu:ime_leach_fractions', 2000]], outs: [['grindless:recovered_silicon', 4]] },
    { type: 'zone_refining', name: 'electronic_grade_silicon', circuit: 17, eut: va(7), duration: 900,
      items: [['grindless:recovered_silicon', 4]], fluids: [['gtceu:argon', 1000]], outs: [['grindless:electronic_grade_silicon', 4]] },
    // P17
    { type: 'single_crystal_casting', name: 'sx_turbine_blade', circuit: 4, eut: va(9), duration: 900, key: 'grindless_single_crystal_casting',
      items: [['gtceu:hastelloy_x_plate', 4], ['gtceu:cobalt_plate', 2], ['gtceu:iridium_plate', 1]], fluids: [['gtceu:argon', 2000]],
      outs: [['grindless:sx_turbine_blade', 1]] },
    { type: 'electron_beam_refining', name: 'tbc_coated_blade', eut: va(9), duration: 600, key: 'grindless_electron_beam',
      items: [['grindless:sx_turbine_blade', 1], ['gtceu:silicon_dioxide_dust', 2]], fluids: [['gtceu:argon', 1000]],
      outs: [['grindless:tbc_coated_blade', 1]] },
    { type: 'spark_plasma_sintering', name: 'turbine_disc', circuit: 24, eut: va(9), duration: 1200,
      items: [['gtceu:hastelloy_x_plate', 8], ['gtceu:nickel_plate', 4], ['gtceu:molybdenum_plate', 4]], outs: [['grindless:turbine_disc', 1]] },
    { type: 'hot_rolling', name: 'pche_recuperator_foil', circuit: 15, eut: va(7), duration: 600,
      items: [['gtceu:stainless_steel_plate', 8]], fluids: [['gtceu:nitrogen', 2000]], outs: [['grindless:pche_recuperator_foil', 4]] },
    { type: 'assembler', name: 'sco2_turbine_module', circuit: 28, eut: va(10), duration: 900,
      items: [['grindless:tbc_coated_blade', 12], ['grindless:turbine_disc', 2], ['grindless:pche_recuperator_foil', 8]], fluids: [['gtceu:soldering_alloy', 2304]],
      outs: [['grindless:sco2_turbine_module', 1]] },
    // P20
    { type: 'chemical_vapour_infiltration', name: 'sic_nozzle_former', circuit: 17, eut: va(10), duration: 1200, key: 'grindless_chemical_vapour_infiltration',
      items: [['gtceu:tungsten_steel_plate', 4]], fluids: [['gtceu:hydrogen', 4000]], outs: [['grindless:sic_nozzle_former', 1]] },
    { type: 'coated_conductor', name: 'nozzle_tape', circuit: 11, eut: va(6), duration: 600, key: 'grindless_coated_conductor',
      items: [['grindless:sic_nozzle_former', 1], ['gtceu:niobium_titanium_plate', 4]], fluids: [['gtceu:argon', 1000]], outs: [['grindless:nozzle_tape', 1]] },
    { type: 'magnet_winding', name: 'nozzle_winding', circuit: 17, eut: va(6), duration: 900, key: 'grindless_magnet_winding',
      items: [['grindless:nozzle_tape', 2], ['gtceu:superconducting_coil', 2]], fluids: [['gtceu:liquid_helium', 1000]], outs: [['grindless:nozzle_winding', 1]] },
    { type: 'chemical_reactor', name: 'impregnated_nozzle', circuit: 8, eut: va(6), duration: 600,
      items: [['grindless:nozzle_winding', 1]], fluids: [['gtceu:epoxy', 2304]], outs: [['grindless:impregnated_nozzle', 1]] },
    // P21
    { type: 'chemical_vapour_infiltration', name: 'infiltrated_liner', circuit: 18, eut: va(10), duration: 1200, key: 'grindless_chemical_vapour_infiltration',
      items: [['grindless:bound_degenerate_billet', 2]], fluids: [['gtceu:hydrogen', 4000]], outs: [['grindless:infiltrated_liner', 1]] },
    { type: 'electron_beam_refining', name: 'sealed_liner', eut: va(9), duration: 600, key: 'grindless_electron_beam',
      items: [['grindless:infiltrated_liner', 1], ['gtceu:tungsten_plate', 4]], fluids: [['gtceu:argon', 1000]], outs: [['grindless:sealed_liner', 1]] },
    { type: 'megabar_synthesis', name: 'densified_liner', circuit: 15, eut: va(10), duration: 900, key: 'grindless_megabar',
      items: [['grindless:sealed_liner', 1], ['grindless:graded_z_billet', 2]], outs: [['grindless:densified_liner', 1]] },
    { type: 'lathe', name: 'crucible_liner', eut: va(7), duration: 400,
      items: [['grindless:densified_liner', 1]], outs: [['grindless:crucible_liner', 1]] },
    // casings (the machines' blocks)
    { type: 'assembler', name: 'lift_nozzle_casing', circuit: 29, eut: va(12), duration: 300, site: false,
      items: [['grindless:vms_lift_nozzle', 1], ['gtceu:hastelloy_x_plate', 8], ['gtceu:titanium_plate', 4]], fluids: [['gtceu:soldering_alloy', 1152]],
      outs: [['grindless:lift_nozzle_casing', 2]] },
    { type: 'assembler', name: 'crucible_liner_casing', circuit: 30, eut: va(12), duration: 300, site: false,
      items: [['grindless:crucible_liner', 1], ['gtceu:tungsten_steel_plate', 8], ['gtceu:iridium_plate', 4]], fluids: [['gtceu:soldering_alloy', 1152]],
      outs: [['grindless:crucible_liner_casing', 2]] },
    // the machines' own rows (V[MAX] x 16 = 2^35 EU/t in; the burner makes 2^34 and 2^33 EU/t)
    { type: 'tarantula_stellar_lift', name: 'raw_vms_plasma', circuit: 1, eut: M_EUT, duration: 2400, key: LIFT_KEY, machine: true,
      wear: [['grindless:vms_lift_nozzle', 312]], fluidOuts: [['gtceu:raw_vms_plasma', 160000]] },
    { type: 'pair_instability_crucible', name: 'ni56_slug', circuit: 1, eut: M_EUT, duration: 1200, key: CRUCIBLE_KEY, machine: true,
      wear: [['grindless:crucible_liner', 625]], fluids: [['gtceu:confined_vms_plasma', 16000]],
      outs: [['grindless:ni56_slug', 1], ['grindless:ime_ash', 8]] },
    { type: 'nickel_56_burner', name: 'co56_cask', circuit: 1, eut: -Math.pow(2, 34), duration: 4800, key: BURNER_KEY, machine: true,
      items: [['grindless:shielded_ni56_cask', 1]], outs: [['grindless:co56_cask', 1]] },
    { type: 'nickel_56_burner', name: 'spent_fe56_cask', circuit: 2, eut: -Math.pow(2, 33), duration: 4800, key: BURNER_KEY, machine: true,
      items: [['grindless:co56_cask', 1]], outs: [['grindless:spent_fe56_cask', 1]] }
  ]
  MT.rows = ROWS

  // vms_lift_nozzle: the closed-loop cooling row (assembler.js addCool's shape)
  var COOLS = [{ name: 'vms_lift_nozzle', input: 'grindless:impregnated_nozzle', output: 'grindless:vms_lift_nozzle', eut: va(6), duration: 800 }]
  var COOL_FLUIDS = {
    makeUp: { id: 'gtceu:liquid_helium', amount: 25 }, precoolIn: { id: 'gtceu:liquid_nitrogen', amount: 50 },
    precoolOut: { id: 'gtceu:nitrogen', amount: 50 }, charge: { id: 'gtceu:liquid_helium', amount: 4000 }
  }
  MT.cools = COOLS

  var COMPS = ['2x grindless:maxplus_conveyor_module', '2x grindless:maxplus_robot_arm', '2x grindless:maxplus_field_generator', '2x grindless:maxplus_sensor']
  var CASING = 'grindless:horizon_machine_casing'
  var CONTROLLERS = [
    { name: 'tarantula_stellar_lift', machine: 'gtceu:tarantula_stellar_lift', research: 'grindless:impregnated_nozzle', casing: CASING, comps: COMPS,
      plates: ['16x grindless:lift_nozzle_casing', '1x grindless:vms_lift_nozzle'] },
    { name: 'pair_instability_crucible', machine: 'gtceu:pair_instability_crucible', research: 'grindless:densified_liner', casing: CASING, comps: COMPS,
      plates: ['16x grindless:crucible_liner_casing', '1x grindless:crucible_liner'] },
    { name: 'nickel_56_burner', machine: 'gtceu:nickel_56_burner', research: 'grindless:turbine_disc', casing: CASING, comps: COMPS,
      plates: ['1x grindless:sco2_turbine_module', '4x grindless:turbine_disc'] }
  ]
  MT.controllers = CONTROLLERS

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return String(id).charAt(0) !== '#' && ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id, k) { return fluids.indexOf(id) === k && !Fluid.exists(id) }))
  }
  function pairs(list, k) { return (list[k] || []).map(function (x) { return x[0] }) }
  function idOf(s) { return s.replace(/^\d+x /, '') }

  function skip(name, reason) {
    MT.skipped.push({ name: name, reason: reason })
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
    if (r.site !== false) b.dimension(TARANTULA)
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
      .dimension(TARANTULA)
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
      MT.skipped = []
      ROWS.forEach(function (r) { addRow(event, r) })
      COOLS.forEach(function (c) { addCool(event, c) })
      CONTROLLERS.forEach(function (c) {
        var items = ['1x ' + HULL, '2x ' + c.casing, '8x grindless:horizon_processor', '4x #gtceu:circuits/max'].concat(c.comps, c.plates)
        addAssemblyLine(event, c.name, c, items, [[KERR, 2000]], c.machine, c.research, 64, 4800)
      })
      console.info(LOG + (ROWS.length + COOLS.length + CONTROLLERS.length) + ' rows; skipped ' + MT.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
