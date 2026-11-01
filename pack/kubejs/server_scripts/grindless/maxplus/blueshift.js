// priority: -20166
// MAX+ machine 9, the blueshift forge, and lines P12, P13 and P24 (docs/eras/maxplus.md, machine 9 and 'Lines'; package XP-B3). Gate c18 to the
// M31 nucleus is a row of data/grindless/tables/gate.json.
//
//   P12 p-process plasma     calutron c30 -> enriched_mo_target; blueshift forge c1 -> photonuclear_mix; extraction cascade c30 -> p_nuclide_concentrate;
//                            stellar forge (an electric blast furnace row) -> p_process_plasma
//   P13 deep horizon tether  tether ribbon works c14 -> kerr_ribbon; stellar elevator c4 (Cygnus X-1) -> proof_loaded_kerr_ribbon;
//                            chemical bath -> bound_coated_ribbon; autoclave -> cured_bound_ribbon; assembler c7 -> deep_horizon_tether
//   P24 beryllium window     extraction cascade c32 -> beryllium_hydroxide; electric blast furnace -> be_pebbles; levitation melter c24 -> be_ingot;
//                            hot strip mill c16 -> be_foil; MTJ sputter cluster c28 -> coated_be_window
//   forge                    c1 turns enriched_mo_target into photonuclear_mix at V[MAX] x 16 A for 1,200 t at the M31 nucleus; the tether (P13) and the
//                            window (P24) are each worn 1 run in 32
//
// Older-machine rows live here. Circuits are the first free ones of each older machine type in line-id order (the extraction cascade's 28 and 29 stay
// for P8 and P11; its P24 row is the 32 that other rows share by item inputs). Every older machine keeps its site: the stellar elevator runs only at
// Cygnus X-1, the others are home rows. Published for the tests: global.grindless.maxPlusBlueshift { rows, forge, controller, skipped }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_blueshift] '
  var G = global.grindless || (global.grindless = {})
  var MB = G.maxPlusBlueshift || (G.maxPlusBlueshift = {})
  MB.skipped = []
  MB.controller = 'grindless:assembly_line/blueshift_forge'

  function va(t) { return Number(GTValues.VA[t]) }
  var VA_MAX = va(14)
  var V_MAX = Number(GTValues.V[14])
  var KERR = 'gtceu:kerr_condensate'
  var HULL = 'gtceu:max_machine_hull'
  var SITE = (G.maxPlusTravel && G.maxPlusTravel.places && G.maxPlusTravel.places.m31 ? G.maxPlusTravel.places.m31.dimension : 'grindless:m31_nucleus_orbit')
  var CYGNUS = 'grindless:cygnus_x1_orbit'
  // 1 run in 32, of 10 000
  var WEAR = 313

  // type, name, circuit (none for item-keyed rows), items in, fluids in, items out, fluids out, EU/t, ticks, data key, blast temperature, dimension
  var ROWS = [
    // P12
    { type: 'calutron_separation', name: 'enriched_mo_target', circuit: 30, eut: va(10), duration: 1200, key: 'grindless_calutron_separation',
      items: [['gtceu:molybdenum_dust', 32]],
      outs: [['grindless:enriched_mo_target', 4], ['gtceu:molybdenum_dust', 24]] },
    { type: 'solvent_extraction', name: 'p_nuclide_concentrate', circuit: 30, eut: va(10), duration: 800,
      fluids: [['gtceu:photonuclear_mix', 8000], ['gtceu:hydrochloric_acid', 3000]],
      outs: [['grindless:p_nuclide_concentrate', 4]], fluidOuts: [['gtceu:diluted_hydrochloric_acid', 3000], ['gtceu:helium', 6000]] },
    { type: 'electric_blast_furnace', name: 'p_process_plasma', circuit: 24, eut: va(10), duration: 1600, ebf: 9000,
      items: [['grindless:p_nuclide_concentrate', 4]], fluids: [['gtceu:helium', 1000]],
      fluidOuts: [['gtceu:p_process_plasma', 4000]] },
    // P13
    { type: 'tether_ribbon', name: 'kerr_ribbon', circuit: 14, eut: va(9), duration: 800,
      items: [['grindless:kerr_strand_wire', 16], ['grindless:tether_ribbon_segment', 1]],
      outs: [['grindless:kerr_ribbon', 1]] },
    { type: 'star_lifting', name: 'proof_loaded_kerr_ribbon', circuit: 4, eut: va(12), duration: 1200, key: 'grindless_star_lifting', dimension: CYGNUS,
      items: [['grindless:kerr_ribbon', 2]], fluids: [['gtceu:liquid_helium', 4000]],
      outs: [['grindless:proof_loaded_kerr_ribbon', 2]], fluidOuts: [['gtceu:helium', 4000]] },
    { type: 'chemical_bath', name: 'bound_coated_ribbon', circuit: 7, eut: va(9), duration: 400,
      items: [['grindless:proof_loaded_kerr_ribbon', 2]], fluids: [['gtceu:settled_condensate', 144]],
      outs: [['grindless:bound_coated_ribbon', 2]] },
    { type: 'autoclave', name: 'cured_bound_ribbon', eut: va(8), duration: 600,
      items: [['grindless:bound_coated_ribbon', 2]], fluids: [['gtceu:epoxy', 288]],
      outs: [['grindless:cured_bound_ribbon', 2]] },
    { type: 'assembler', name: 'deep_horizon_tether', circuit: 7, eut: va(10), duration: 800,
      items: [['grindless:cured_bound_ribbon', 4], ['grindless:horizon_compressed_plate', 2]],
      outs: [['grindless:deep_horizon_tether', 1]] },
    // P24
    { type: 'solvent_extraction', name: 'beryllium_hydroxide', circuit: 32, eut: va(8), duration: 600,
      items: [['gtceu:emerald_dust', 8]], fluids: [['gtceu:sulfuric_acid', 3000], ['gtceu:water', 4000]],
      outs: [['grindless:beryllium_hydroxide', 2], ['gtceu:silicon_dioxide_dust', 6], ['gtceu:alumina_dust', 1]], fluidOuts: [['gtceu:diluted_sulfuric_acid', 3000]] },
    { type: 'electric_blast_furnace', name: 'be_pebbles', circuit: 25, eut: va(5), duration: 600, ebf: 1700,
      items: [['grindless:beryllium_hydroxide', 4], ['gtceu:magnesium_dust', 2]],
      outs: [['grindless:be_pebbles', 2], ['gtceu:magnesia_dust', 2]] },
    { type: 'levitation_melting', name: 'be_ingot', circuit: 24, eut: va(9), duration: 600, key: 'grindless_levitation_melting',
      items: [['grindless:be_pebbles', 4]], fluids: [['gtceu:argon', 1000]],
      outs: [['grindless:be_ingot', 4]], fluidOuts: [['gtceu:argon', 800]] },
    { type: 'hot_rolling', name: 'be_foil', circuit: 16, eut: va(7), duration: 400,
      items: [['grindless:be_ingot', 2]],
      outs: [['grindless:be_foil', 4]] },
    { type: 'mtj_sputtering', name: 'coated_be_window', circuit: 28, eut: va(12), duration: 900, key: 'grindless_mtj_sputtering',
      items: [['grindless:be_foil', 2], ['grindless:nb_target', 1]], fluids: [['gtceu:argon', 1000]],
      outs: [['grindless:coated_be_window', 2]], fluidOuts: [['gtceu:argon', 800]] }
  ]
  MB.rows = ROWS

  // the forge's own row (V[MAX] x 16 A: the 1,024 A MAX+ hatch); the tether and the window wear 1 run in 32
  var FORGE = [
    { type: 'blueshift_forge', name: 'photonuclear_mix', circuit: 1, eut: V_MAX * 16, duration: 1200, key: 'grindless_blueshift_forge', dimension: SITE,
      items: [['grindless:enriched_mo_target', 8]], chanced: [['grindless:deep_horizon_tether', WEAR], ['grindless:coated_be_window', WEAR]],
      outs: [['gtceu:molybdenum_dust', 6]], fluidOuts: [['gtceu:photonuclear_mix', 8000]] }
  ]
  MB.forge = FORGE

  var CONTROLLER = { machine: 'gtceu:blueshift_forge', research: 'grindless:coated_be_window', casing: 'grindless:horizon_machine_casing',
    comps: ['2x grindless:maxplus_conveyor_module', '2x grindless:maxplus_robot_arm', '2x grindless:maxplus_field_generator', '2x grindless:maxplus_sensor'],
    plates: ['4x grindless:horizon_compressed_plate', '2x grindless:deep_horizon_tether', '2x grindless:coated_be_window'] }
  MB.controllerSpec = CONTROLLER

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return String(id).charAt(0) !== '#' && ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id, k) { return fluids.indexOf(id) === k && !Fluid.exists(id) }))
  }

  function pairs(list, k) { return (list[k] || []).map(function (x) { return x[0] }) }
  function idOf(s) { return s.replace(/^\d+x /, '') }

  function skip(name, reason) {
    MB.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function addRow(event, r) {
    var ids = pairs(r, 'items').concat(pairs(r, 'chanced'), pairs(r, 'outs'))
    var fluids = pairs(r, 'fluids').concat(pairs(r, 'fluidOuts'))
    var missing = missingIds(ids, fluids)
    if (missing.length > 0) return skip(r.type + '/' + r.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
    ;(r.items || []).forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    ;(r.chanced || []).forEach(function (x) { b.chancedInput('1x ' + x[0], x[1], 0) })
    if (r.circuit) b.circuit(r.circuit)
    ;(r.fluids || []).forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
    ;(r.outs || []).forEach(function (x) { b.itemOutputs(x[1] + 'x ' + x[0]) })
    ;(r.fluidOuts || []).forEach(function (x) { b.outputFluids(Fluid.of(x[0], x[1])) })
    if (r.key) b.addDataString(r.key, r.name)
    if (r.ebf) b.blastFurnaceTemp(r.ebf)
    if (r.dimension) b.dimension(r.dimension)
    b.EUt(r.eut).duration(r.duration)
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
      MB.skipped = []
      ROWS.forEach(function (r) { addRow(event, r) })
      FORGE.forEach(function (r) { addRow(event, r) })
      var c = CONTROLLER
      var items = ['1x ' + HULL, '2x ' + c.casing, '8x grindless:horizon_processor', '4x #gtceu:circuits/max'].concat(c.comps, c.plates)
      addAssemblyLine(event, 'blueshift_forge', c, items, [[KERR, 2000]], c.machine, c.research, 64, 4800)
      console.info(LOG + (ROWS.length + FORGE.length + 1) + ' rows; skipped ' + MB.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
