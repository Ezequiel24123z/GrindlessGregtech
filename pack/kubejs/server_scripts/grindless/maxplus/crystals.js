// priority: -20164
// MAX+ machines 12 and 13, the multi-plasma blender and the horizon crystal furnace, and lines T8, T9 and T10 (docs/eras/maxplus.md, machines 12
// and 13 and 'Lines'; package XP-H2).
//
//   T8  horizon crystal slurry   stellar forge (an existing row of the star-lifting line) -> stellar_plasma; stellar elevator c5 (Cygnus X-1) ->
//                                lifted_stellar_plasma; plasma mass filter c8 (Cygnus X-1) -> filtered_stellar_plasma; blender c1 (eight plasmas,
//                                1,000 mB each, at Sgr A*) -> 1,000 mB horizon_crystal_slurry
//   T9  horizon core crystal     crystal growth c32 -> sapphire_seed_plate; refinery c6 -> condensate_doped_dust; furnace c1 (+ slurry, P3) ->
//                                core_crystal_boule; femto writer c22 (on P14's lattice) -> inscribed_core_crystal; mK cryostat c12 ->
//                                horizon_core_crystal
//   T10 controller crystal       levitation melter c25 (P3 ingot) -> molten_kerr_strange; crystal growth c32 -> controller_seed; furnace c2 ->
//                                controller_crystal_boule; BEUV c23 -> horizon_controller_crystal
//
// The furnace pays the design's 1.28e9 mB of slurry for 64 core crystals as 20,000,000 mB per run, many runs in parallel, 2,400 t each; heat comes
// from kerr condensate, not coils. Older-machine rows live here. Circuits are the first free ones of each older machine type (crystal growth is full
// at 32, which rows share by item inputs). Every older machine keeps its site: the stellar elevator and the plasma mass filter run only at Cygnus X-1
// (the site rule of tiers/uxv.json), the others are home rows; the refinery, the blender and the furnace sit at Sgr A* orbit.
// Published for the tests: global.grindless.maxPlusCrystals { rows, blender, furnace, controllers, skipped }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_crystals] '
  var G = global.grindless || (global.grindless = {})
  var MC = G.maxPlusCrystals || (G.maxPlusCrystals = {})
  MC.skipped = []

  function va(t) { return Number(GTValues.VA[t]) }
  var VA_MAX = va(14)
  var V_MAX = Number(GTValues.V[14])
  var KERR = 'gtceu:kerr_condensate'
  var HULL = 'gtceu:max_machine_hull'
  var SGRA = (G.maxTravel && G.maxTravel.places && G.maxTravel.places.sgra ? G.maxTravel.places.sgra.dimension : 'gcyr:black_hole_orbit')
  var CYGNUS = 'grindless:cygnus_x1_orbit'
  var SLURRY = 'gtceu:horizon_crystal_slurry'
  var MOLTEN = 'gtceu:molten_kerr_strange'

  // type, name, circuit, items in, fluids in, items out, fluids out, EU/t, ticks, data key, dimension
  var ROWS = [
    // T8
    { type: 'star_lifting', name: 'lifted_stellar_plasma', circuit: 5, eut: va(12), duration: 1200, key: 'grindless_star_lifting', dimension: CYGNUS,
      fluids: [['gtceu:stellar_plasma', 16000]],
      fluidOuts: [['gtceu:lifted_stellar_plasma', 12000], ['gtceu:hydrogen', 4000]] },
    { type: 'plasma_mass_filtering', name: 'filtered_stellar_plasma', circuit: 8, eut: V_MAX, duration: 600, key: 'grindless_plasma_mass_filtering', dimension: CYGNUS,
      fluids: [['gtceu:lifted_stellar_plasma', 12000]],
      fluidOuts: [['gtceu:filtered_stellar_plasma', 8000], ['gtceu:helium', 4000]] },
    // T9
    { type: 'crystal_growth', name: 'sapphire_seed_plate', circuit: 32, eut: va(12), duration: 2400, key: 'grindless_crystal_growth',
      items: [['gtceu:sapphire_plate', 2], ['grindless:iridium_crucible', 1]], fluids: [['gtceu:argon', 1000]],
      outs: [['grindless:sapphire_seed_plate', 2], ['grindless:worn_iridium_crucible', 1]] },
    { type: 'condensate_refinery', name: 'condensate_doped_dust', circuit: 6, eut: VA_MAX, duration: 600, key: 'grindless_condensate_refinery', dimension: SGRA,
      items: [['gtceu:sapphire_dust', 16]], fluids: [['gtceu:settled_condensate', 4000]],
      outs: [['grindless:condensate_doped_dust', 16]] },
    { type: 'femtosecond_writing', name: 'inscribed_core_crystal', circuit: 22, eut: va(13), duration: 1500, key: 'grindless_femtosecond_writing',
      items: [['grindless:core_crystal_boule', 1], ['grindless:void_crystal_lattice', 1]], fluids: [['gtceu:argon', 1000]],
      outs: [['grindless:inscribed_core_crystal', 1]] },
    { type: 'nuclear_demagnetisation', name: 'horizon_core_crystal', circuit: 12, eut: va(13), duration: 1800, key: 'grindless_nuclear_demagnetisation',
      items: [['grindless:inscribed_core_crystal', 1]], fluids: [['gtceu:liquid_helium', 4000]],
      outs: [['grindless:horizon_core_crystal', 1]], fluidOuts: [['gtceu:helium', 4000]] },
    // T10
    { type: 'levitation_melting', name: 'molten_kerr_strange', circuit: 25, eut: va(13), duration: 1200, key: 'grindless_levitation_melting',
      items: [['grindless:kerr_strange_ingot', 2]], fluids: [['gtceu:argon', 1000]],
      fluidOuts: [[MOLTEN, 1000000]] },
    { type: 'crystal_growth', name: 'controller_seed', circuit: 32, eut: va(13), duration: 2400, key: 'grindless_crystal_growth',
      items: [['grindless:sapphire_seed_plate', 1], ['grindless:iridium_crucible', 1]], fluids: [[MOLTEN, 500000], ['gtceu:argon', 1000]],
      outs: [['grindless:controller_seed', 1], ['grindless:worn_iridium_crucible', 1]] },
    { type: 'beuv_lithography', name: 'horizon_controller_crystal', circuit: 23, eut: va(13), duration: 1800, key: 'grindless_beuv_lithography',
      items: [['grindless:controller_crystal_boule', 1]], fluids: [['gtceu:argon', 1000]],
      outs: [['grindless:horizon_controller_crystal', 1]] }
  ]
  MC.rows = ROWS

  // the blender: one plasma from each place the pack has worked, plus hot flow and kerr condensate (V[MAX] x 64 A, 100 t)
  var BLEND = [
    { type: 'multi_plasma_blender', name: 'horizon_crystal_slurry', eut: V_MAX * 64, duration: 100, key: 'grindless_multi_plasma_blender', dimension: SGRA,
      fluids: [['gtceu:stellar_plasma', 1000], ['gtceu:lifted_stellar_plasma', 1000], ['gtceu:filtered_stellar_plasma', 1000],
        ['gtceu:confined_vms_plasma', 1000], ['gtceu:p_process_plasma', 1000], ['gtceu:jet_proton_beam', 1000],
        ['gtceu:hot_flow_plasma', 1000], [KERR, 1000]],
      fluidOuts: [[SLURRY, 1000]] }
  ]
  MC.blender = BLEND

  // the furnace (V[MAX] x 256 A, 2,400 t): 20,000,000 mB of slurry per core crystal, 5,000,000 mB per controller crystal; P3's plate lines the crucible
  var FURNACE = [
    { type: 'horizon_crystal_furnace', name: 'core_crystal_boule', circuit: 1, eut: V_MAX * 256, duration: 2400, key: 'grindless_horizon_crystal_furnace', dimension: SGRA,
      items: [['grindless:sapphire_seed_plate', 1], ['grindless:condensate_doped_dust', 64], ['grindless:kerr_strange_plate', 4]],
      fluids: [[SLURRY, 20000000], [KERR, 100000]],
      outs: [['grindless:core_crystal_boule', 1]] },
    { type: 'horizon_crystal_furnace', name: 'controller_crystal_boule', circuit: 2, eut: V_MAX * 256, duration: 2400, key: 'grindless_horizon_crystal_furnace', dimension: SGRA,
      items: [['grindless:controller_seed', 1], ['grindless:condensate_doped_dust', 64], ['grindless:kerr_strange_plate', 4]],
      fluids: [[SLURRY, 5000000], [KERR, 100000]],
      outs: [['grindless:controller_crystal_boule', 1]] }
  ]
  MC.furnace = FURNACE

  var COMPS = ['2x grindless:maxplus_conveyor_module', '2x grindless:maxplus_robot_arm', '2x grindless:maxplus_field_generator', '2x grindless:maxplus_sensor']
  var CONTROLLERS = [
    { name: 'multi_plasma_blender', machine: 'gtceu:multi_plasma_blender', research: 'grindless:condensate_doped_dust', casing: 'grindless:horizon_machine_casing',
      comps: COMPS, plates: ['4x grindless:horizon_compressed_plate', '4x grindless:kerr_strange_ingot'] },
    { name: 'horizon_crystal_furnace', machine: 'gtceu:horizon_crystal_furnace', research: 'grindless:sapphire_seed_plate', casing: 'grindless:horizon_machine_casing',
      comps: COMPS, plates: ['4x gtceu:sapphire_plate', '4x grindless:kerr_strange_plate'] }
  ]
  MC.controllers = CONTROLLERS

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return String(id).charAt(0) !== '#' && ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id, k) { return fluids.indexOf(id) === k && !Fluid.exists(id) }))
  }

  function pairs(list, k) { return (list[k] || []).map(function (x) { return x[0] }) }
  function idOf(s) { return s.replace(/^\d+x /, '') }

  function skip(name, reason) {
    MC.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function addRow(event, r) {
    var ids = pairs(r, 'items').concat(pairs(r, 'outs'))
    var fluids = pairs(r, 'fluids').concat(pairs(r, 'fluidOuts'))
    var missing = missingIds(ids, fluids)
    if (missing.length > 0) return skip(r.type + '/' + r.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
    ;(r.items || []).forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    if (r.circuit) b.circuit(r.circuit)
    ;(r.fluids || []).forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
    ;(r.outs || []).forEach(function (x) { b.itemOutputs(x[1] + 'x ' + x[0]) })
    ;(r.fluidOuts || []).forEach(function (x) { b.outputFluids(Fluid.of(x[0], x[1])) })
    if (r.key) b.addDataString(r.key, r.name)
    if (r.dimension) b.dimension(r.dimension)
    b.EUt(r.eut).duration(r.duration)
  }

  function addAssemblyLine(event, c, items, fluids) {
    var ids = items.map(idOf).concat([c.research])
    var missing = missingIds(ids, fluids.map(function (f) { return f[0] }))
    if (missing.length > 0) return skip(c.name, 'unknown id(s): ' + missing.join(', '))
    var a = event.recipes.gtceu.assembly_line('grindless:' + c.name)
    items.forEach(function (s) { a.itemInputs(s) })
    fluids.forEach(function (f) { a.inputFluids(Fluid.of(f[0], f[1])) })
    a.itemOutputs(c.machine)
    a.stationResearch(function (r) { return r.researchStack(Item.of(c.research)).CWUt(64).EUt(VA_MAX) })
    a.EUt(VA_MAX).duration(4800)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      MC.skipped = []
      ROWS.forEach(function (r) { addRow(event, r) })
      BLEND.forEach(function (r) { addRow(event, r) })
      FURNACE.forEach(function (r) { addRow(event, r) })
      CONTROLLERS.forEach(function (c) {
        var items = ['1x ' + HULL, '2x ' + c.casing, '8x grindless:horizon_processor', '4x #gtceu:circuits/max'].concat(c.comps, c.plates)
        addAssemblyLine(event, c, items, [[KERR, 2000]])
      })
      console.info(LOG + (ROWS.length + BLEND.length + FURNACE.length + CONTROLLERS.length) + ' rows; skipped ' + MC.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
