// priority: -20082
// MAX+ machine 14, the condensate assembler, and the older steps of lines T1 to T3, T14 to T16 and P25 (docs/eras/maxplus.md, machine 14 and
// 'Lines'; package XP-H3).
//
//   T1 containment core   hot cell c25 -> gd_absorber_tile; SPS c26 -> graded_z_billet; press c3 (maxplus/condensate.js) -> laminated_containment_core;
//                         assembler c1 -> horizon_containment_plate
//   T2 X-ray optics       BEUV c17 -> zone_plate_wafer; MTJ (32) -> multilayer_xray_mirror; gamma optics c3 -> gamma_focus_element; assembler c2 -> chevron_core
//   T3 mesh               PBO c16 -> kerr_mesh_preform; CVI c19 -> infiltrated_mesh; EB furnace -> coated_mesh; assembler c3 -> horizon_mesh
//   T14 kerr toroid       oxide PLD c10 -> kerr_coated_tape; HTS works c20 -> kerr_smes_winding; chemical reactor -> impregnated_kerr_winding;
//                         ZPM magnet works c12 -> braced_kerr_toroid; helium refrigerator (keyed) -> cold_kerr_toroid
//   T15 absorber casing   nitride works c22 -> fe16n2_absorber_ring; hot strip mill c17 -> laminated_absorber_sheet; chemical bath -> coated_absorber_sheet;
//                         HTS works c21 -> shielded_absorber; helium refrigerator (keyed) -> flux_absorber_casing
//   T16 frame truss       cluster-light furnace c2 (maxplus/furnace rows, existing) -> segment_truss_billet; megabar c17 -> densified_truss_billet;
//                         EB furnace -> coated_truss_billet; extruder -> horizon_frame_truss
//   P25 helium-4          plasma mass filter c7 (30 Doradus) -> he_rich_fraction; cryogenic plant -> liquid_helium_4; superfluid helium plant -> superfluid_helium_4;
//                         canner -> he4_dewar
//
// The assembler runs at home in Sgr A*'s orbit (gcyr:black_hole_orbit) at V[MAX] x 256 for 1200 to 2400 ticks per row; the older rows run at their own
// machine's VA. Older-machine rows live here (the circuits are the first free ones of each older machine type counted in line-id order; extraction,
// MTJ, the electron-beam furnace and the extruder differ by item inputs). Published for the tests:
// global.grindless.maxPlusAssembler { rows, assembler, skipped, controller }. Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_assembler] '
  var G = global.grindless || (global.grindless = {})
  var MA = G.maxPlusAssembler || (G.maxPlusAssembler = {})
  MA.skipped = []
  MA.controller = 'grindless:assembly_line/condensate_assembler'

  function va(t) { return Number(GTValues.VA[t]) }
  var VA_MAX = va(14)
  var V_MAX = Number(GTValues.V[14])
  var EPOXY = 'gtceu:epoxy'
  var LHE = 'gtceu:liquid_helium'
  var TARANTULA = 'grindless:tarantula_orbit'
  var KERR = 'gtceu:kerr_condensate'
  var HULL = 'gtceu:max_machine_hull'
  var SITE = (G.maxTravel && G.maxTravel.places && G.maxTravel.places.sgra ? G.maxTravel.places.sgra.dimension : 'gcyr:black_hole_orbit')

  // type, name, circuit (none for item-keyed rows), items in, kept items, fluids in, kept fluids, items out, fluids out, EU/t, ticks, data key
  var ROWS = [
    // T1
    { type: 'hot_cell', name: 'gd_absorber_tile', circuit: 25, eut: 7680, duration: 600,
      items: [['gtceu:gadolinium_oxide_dust', 4], ['gtceu:boron_carbide_dust', 2], ['gtceu:tungsten_plate', 2]], fluids: [['gtceu:helium', 1000]],
      outs: [['grindless:gd_absorber_tile', 4]] },
    { type: 'spark_plasma_sintering', name: 'graded_z_billet', circuit: 26, eut: va(9), duration: 900,
      items: [['grindless:gd_hfb2_cermet', 2], ['grindless:hafnium_sponge', 2], ['gtceu:tungsten_dust', 4]],
      outs: [['grindless:graded_z_billet', 2]] },
    // T2
    { type: 'beuv_lithography', name: 'zone_plate_wafer', circuit: 17, eut: va(12), duration: 900, key: 'grindless_beuv_lithography',
      items: [['grindless:gd_absorber_tile', 2], ['gtceu:gold_plate', 4]], fluids: [['gtceu:argon', 1000]],
      outs: [['grindless:zone_plate_wafer', 2]] },
    { type: 'mtj_sputtering', name: 'multilayer_xray_mirror', eut: va(12), duration: 900, key: 'grindless_mtj_sputtering',
      items: [['grindless:zone_plate_wafer', 1], ['grindless:nb_target', 1], ['gtceu:molybdenum_plate', 4]], fluids: [['gtceu:argon', 1000]],
      outs: [['grindless:multilayer_xray_mirror', 2]], fluidOuts: [['gtceu:argon', 800]] },
    { type: 'gamma_optics', name: 'gamma_focus_element', circuit: 3, eut: V_MAX, duration: 1200, key: 'grindless_gamma_optics',
      items: [['grindless:zone_plate_wafer', 2], ['gtceu:iridium_plate', 4]],
      outs: [['grindless:gamma_focus_element', 1]] },
    // T3
    { type: 'pbo_synthesis', name: 'kerr_mesh_preform', circuit: 16, eut: va(8), duration: 800,
      items: [['grindless:kerr_braid_sleeve', 4], ['grindless:kerr_strand_wire', 4]], fluids: [[EPOXY, 288]],
      outs: [['grindless:kerr_mesh_preform', 2]] },
    { type: 'chemical_vapour_infiltration', name: 'infiltrated_mesh', circuit: 19, eut: va(10), duration: 1200, key: 'grindless_chemical_vapour_infiltration',
      items: [['grindless:kerr_mesh_preform', 2]], fluids: [['gtceu:methyltrichlorosilane', 1000], ['gtceu:hydrogen', 2000]],
      outs: [['grindless:infiltrated_mesh', 2]], fluidOuts: [['gtceu:hydrochloric_acid', 3000]] },
    { type: 'electron_beam_refining', name: 'coated_mesh', eut: va(9), duration: 900, key: 'grindless_electron_beam',
      items: [['grindless:infiltrated_mesh', 2], ['grindless:gd_hfb2_cermet', 1]],
      outs: [['grindless:coated_mesh', 2]] },
    // T14
    { type: 'pulsed_laser_deposition', name: 'kerr_coated_tape', circuit: 10, eut: va(12), duration: 1000, key: 'grindless_pulsed_laser_deposition',
      items: [['grindless:kerr_strand_wire', 4], ['gtceu:gd_123_dust', 4]], kept: [['grindless:krf_excimer_laser', 1]], fluids: [['gtceu:oxygen', 4000]],
      outs: [['grindless:kerr_coated_tape', 4]] },
    { type: 'magnet_winding', name: 'kerr_smes_winding', circuit: 20, eut: va(6), duration: 800, key: 'grindless_magnet_winding',
      items: [['grindless:kerr_coated_tape', 16], ['grindless:kerr_strand_wire', 4]], fluids: [[EPOXY, 288]], keptFluids: [[LHE, 1000]],
      outs: [['grindless:kerr_smes_winding', 1]] },
    { type: 'chemical_reactor', name: 'impregnated_kerr_winding', circuit: 30, eut: va(6), duration: 400,
      items: [['grindless:kerr_smes_winding', 1]], fluids: [[EPOXY, 576]],
      outs: [['grindless:impregnated_kerr_winding', 1]] },
    { type: 'naquadria_magnets', name: 'braced_kerr_toroid', circuit: 12, eut: va(7), duration: 900,
      items: [['grindless:impregnated_kerr_winding', 2], ['gtceu:naquadria_ingot', 4]],
      outs: [['grindless:braced_kerr_toroid', 1]] },
    // T15
    { type: 'nitride_magnet_synthesis', name: 'fe16n2_absorber_ring', circuit: 22, eut: va(9), duration: 1200, key: 'grindless_nitride_magnet_synthesis',
      items: [['gtceu:iron_dust', 16]], fluids: [['gtceu:nitrogen', 4000]],
      outs: [['grindless:fe16n2_absorber_ring', 2]] },
    { type: 'hot_rolling', name: 'laminated_absorber_sheet', circuit: 17, eut: va(7), duration: 400,
      items: [['grindless:fe16n2_absorber_ring', 2], ['grindless:gd_absorber_tile', 2]],
      outs: [['grindless:laminated_absorber_sheet', 2]] },
    { type: 'chemical_bath', name: 'coated_absorber_sheet', circuit: 6, eut: va(8), duration: 400,
      items: [['grindless:laminated_absorber_sheet', 2]], fluids: [[EPOXY, 144]],
      outs: [['grindless:coated_absorber_sheet', 2]] },
    { type: 'magnet_winding', name: 'shielded_absorber', circuit: 21, eut: va(6), duration: 800, key: 'grindless_magnet_winding',
      items: [['grindless:coated_absorber_sheet', 4], ['grindless:kerr_coated_tape', 4]], fluids: [[EPOXY, 288]], keptFluids: [[LHE, 1000]],
      outs: [['grindless:shielded_absorber', 1]] },
    // T16
    { type: 'megabar_synthesis', name: 'densified_truss_billet', circuit: 17, eut: va(10), duration: 900, key: 'grindless_megabar',
      items: [['grindless:segment_truss_billet', 2], ['grindless:graded_z_billet', 1]],
      outs: [['grindless:densified_truss_billet', 2]] },
    { type: 'electron_beam_refining', name: 'coated_truss_billet', eut: va(9), duration: 900, key: 'grindless_electron_beam',
      items: [['grindless:densified_truss_billet', 2], ['grindless:gd_hfb2_cermet', 1]],
      outs: [['grindless:coated_truss_billet', 2]] },
    { type: 'extruder', name: 'horizon_frame_truss', eut: va(9), duration: 600,
      items: [['grindless:coated_truss_billet', 1]], kept: [['gtceu:rod_extruder_mold', 1]],
      outs: [['grindless:horizon_frame_truss', 2]] },
    // P25
    { type: 'plasma_mass_filtering', name: 'he_rich_fraction', circuit: 7, eut: V_MAX, duration: 600, key: 'grindless_plasma_mass_filtering', dimension: TARANTULA,
      fluids: [['gtceu:raw_vms_plasma', 10000]],
      outs: [], fluidOuts: [['gtceu:he_rich_fraction', 5000], ['gtceu:stellar_heavy_cut', 1000]] },
    { type: 'cryogenic_processing', name: 'liquid_helium_4', eut: 7680, duration: 400,
      fluids: [['gtceu:he_rich_fraction', 2000]], fluidOuts: [['gtceu:liquid_helium_4', 1000]] },
    { type: 'superfluid_helium', name: 'superfluid_helium_4', eut: va(7), duration: 200,
      fluids: [['gtceu:liquid_helium_4', 1000]], fluidOuts: [['gtceu:superfluid_helium_4', 1000]] },
    { type: 'canner', name: 'he4_dewar', circuit: 25, eut: va(6), duration: 200,
      items: [['gtceu:steel_drum', 1]], fluids: [['gtceu:superfluid_helium_4', 1000]],
      outs: [['grindless:he4_dewar', 1]] }
  ]

  // the helium refrigerator's keyed rows (maxplus/loom.js addCool's shape)
  var COOLS = [
    { name: 'cold_kerr_toroid', input: 'grindless:braced_kerr_toroid', output: 'grindless:cold_kerr_toroid', eut: va(6), duration: 800 },
    { name: 'flux_absorber_casing', input: 'grindless:shielded_absorber', output: 'grindless:flux_absorber_casing', eut: va(6), duration: 800 }
  ]
  var COOL_FLUIDS = {
    makeUp: { id: 'gtceu:liquid_helium', amount: 25 }, precoolIn: { id: 'gtceu:liquid_nitrogen', amount: 50 },
    precoolOut: { id: 'gtceu:nitrogen', amount: 50 }, charge: { id: 'gtceu:liquid_helium', amount: 4000 }
  }

  MA.rows = ROWS
  MA.coolRows = COOLS

  // the assembler's own rows at Sgr A*: plates, mesh and condensate bath assembled into the four frame-part precursors; the boil-off goes back to the
  // refinery's c10. Row c4 needs grindless:horizon_frame_part, which XP-F1 has not registered: it is skipped silently until the id exists.
  var ASM_EUT = V_MAX * 256
  var ASM_KEY = 'grindless_condensate_assembler'
  var ASM = [
    { type: 'condensate_assembler', name: 'horizon_containment_plate', circuit: 1, eut: ASM_EUT, duration: 1200, key: ASM_KEY,
      items: [['grindless:laminated_containment_core', 32], ['grindless:horizon_compressed_plate', 16], ['grindless:kerr_strange_plate', 8]], fluids: [[KERR, 200000]],
      outs: [['grindless:horizon_containment_plate', 1], ['grindless:condensate_boil_off', 4]] },
    { type: 'condensate_assembler', name: 'chevron_core', circuit: 2, eut: ASM_EUT, duration: 1800, key: ASM_KEY,
      items: [['grindless:zone_plate_wafer', 16], ['grindless:multilayer_xray_mirror', 16], ['grindless:gamma_focus_element', 8], ['grindless:horizon_compressed_plate', 16]], fluids: [[KERR, 300000]],
      outs: [['grindless:chevron_core', 1], ['grindless:condensate_boil_off', 4]] },
    { type: 'condensate_assembler', name: 'horizon_mesh', circuit: 3, eut: ASM_EUT, duration: 2400, key: ASM_KEY,
      items: [['grindless:coated_mesh', 24], ['grindless:kerr_strange_plate', 16], ['grindless:kerr_clad_strand', 16]], fluids: [[KERR, 500000]],
      outs: [['grindless:horizon_mesh', 1], ['grindless:condensate_boil_off', 6]] },
    { type: 'condensate_assembler', name: 'horizon_frame_part', circuit: 4, eut: ASM_EUT, duration: 2400, key: ASM_KEY, optional: true,
      items: [['grindless:horizon_shielding', 4], ['grindless:horizon_waveguide', 4], ['grindless:horizon_conduit', 4], ['grindless:horizon_valve', 4],
        ['grindless:horizon_mesh', 4], ['grindless:horizon_containment_plate', 4]], fluids: [[KERR, 1000000]],
      outs: [['grindless:horizon_frame_part', 1], ['grindless:condensate_boil_off', 8]] }
  ]
  MA.assembler = ASM

  // research item, then the machine itself on the assembly line (Research Station)
  var CONTROLLER = { machine: 'gtceu:condensate_assembler', research: 'grindless:horizon_alignment_matrix', casing: 'grindless:horizon_machine_casing',
    comps: ['2x grindless:max_conveyor_module', '2x grindless:max_robot_arm', '2x grindless:max_field_generator', '2x grindless:max_sensor'],
    plates: ['4x grindless:horizon_compressed_plate', '4x grindless:kerr_strange_plate'] }

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return String(id).charAt(0) !== '#' && ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id, k) { return fluids.indexOf(id) === k && !Fluid.exists(id) }))
  }

  function pairs(list, k) { return (list[k] || []).map(function (x) { return x[0] }) }

  function skip(name, reason) {
    MA.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function addRow(event, r, site) {
    var ids = pairs(r, 'items').concat(pairs(r, 'kept'), pairs(r, 'outs'))
    var fluids = pairs(r, 'fluids').concat(pairs(r, 'keptFluids'), pairs(r, 'fluidOuts'))
    var missing = missingIds(ids, fluids)
    if (missing.length > 0) return skip(r.type + '/' + r.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
    ;(r.items || []).forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    ;(r.kept || []).forEach(function (x) { b.notConsumable(x[1] + 'x ' + x[0]) })
    if (r.circuit) b.circuit(r.circuit)
    ;(r.fluids || []).forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
    ;(r.keptFluids || []).forEach(function (x) { b.notConsumableFluid(Fluid.of(x[0], x[1])) })
    ;(r.outs || []).forEach(function (x) { b.itemOutputs(x[1] + 'x ' + x[0]) })
    ;(r.fluidOuts || []).forEach(function (x) { b.outputFluids(Fluid.of(x[0], x[1])) })
    if (r.key) b.addDataString(r.key, r.name)
    if (r.dimension) b.dimension(r.dimension)
    if (site) b.dimension(SITE)
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

  function addAsm(event, r) {
    var ids = pairs(r, 'items').concat(pairs(r, 'outs'))
    if (r.optional && missingIds(ids, pairs(r, 'fluids')).length > 0) return
    addRow(event, r, true)
  }

  function addController(event) {
    var c = CONTROLLER
    var strip = function (s) { return s.replace(/^\d+x /, '') }
    var ins = [HULL, c.research, c.casing, 'grindless:horizon_processor', c.machine].concat(c.comps.map(strip), c.plates.map(strip))
    var missing = missingIds(ins, [KERR])
    if (missing.length > 0) return skip('condensate_assembler controller', 'unknown id(s): ' + missing.join(', '))
    var a = event.recipes.gtceu.assembly_line('grindless:condensate_assembler')
    a.itemInputs(HULL, '2x ' + c.casing, '8x grindless:horizon_processor', '4x #gtceu:circuits/max')
    c.comps.concat(c.plates).forEach(function (s) { a.itemInputs(s) })
    a.inputFluids(Fluid.of(KERR, 2000))
    a.itemOutputs(c.machine)
    a.stationResearch(function (r) { return r.researchStack(Item.of(c.research)).CWUt(64).EUt(VA_MAX) })
    a.EUt(VA_MAX).duration(4800)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      MA.skipped = []
      ROWS.forEach(function (r) { addRow(event, r) })
      COOLS.forEach(function (c) { addCool(event, c) })
      ASM.forEach(function (r) { addAsm(event, r) })
      addController(event)
      console.info(LOG + 'assembler: ' + (ROWS.length + COOLS.length + ASM.length + 1) + ' rows; skipped ' + MA.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
