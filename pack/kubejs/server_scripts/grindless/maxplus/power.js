// Gregtech Grindless - MAX+ power plumbing (package XP-W, docs/eras/maxplus.md 'Hatches', 'Older machines' and line P18):
//
//   line P18, the Kerr fault-current limiter, five steps with four crossings:
//     bender            grindless:bender/fcl_substrate_strip (max/parts.js, shared with L39)
//     coated conductor  grindless:coated_conductor/kerr_fcl_buffer_tape   (circuit 10)
//     pulsed laser dep  grindless:pulsed_laser_deposition/thick_kerr_fcl_tape (circuit 8)
//     magnet winding    grindless:magnet_winding/kerr_fcl_coil           (circuit 16, charged with liquid helium)
//     closed loop cool  grindless:closed_loop_cooling/cold_kerr_fcl
//   assembly line       grindless:max_maxplus_energy_hatch_1024a (the 1,024 A hatch the Hyperstargate dial needs four of)
//   The MAX 64 A substation hatches keep MAX's rows (max_parts.json, cold_fcl_module): a dearer MAX+ copy would be a dominated recipe.
//   P18's other outlet is the horizon capacitor bank (2 cold_kerr_fcl, its own package).
//
// Circuits are the first free ones of each older machine type, counted in line-id order (maxplus.md 'Older machines'): P18 comes before every
// other MAX+ row on these three tables. Lookup safety: the hatch row takes MAX+ ingredients only (the MAX hatches take cold_fcl_module).
// Published for the smoke test: global.grindless.maxplusPower { line, cool, hatches, skipped }.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/maxplus_power] '
  var MAXT = 14
  var G = global.grindless || (global.grindless = {})
  var MP = G.maxplusPower || (G.maxplusPower = {})

  var HULL = 'gtceu:max_machine_hull'
  var CIRCUIT = '#gtceu:circuits/max'
  // the recipe-quality gates count only MAX-named tier components, so each hatch also takes two of those
  var MAX_PARTS = [['grindless:max_sensor', 1], ['grindless:max_electric_motor', 1]]
  var CABLE = 'gtceu:horizon_strand_single_cable'
  var LAMINA = 'grindless:chain_lamina_stack'
  var SOLDER = { id: 'gtceu:soldering_alloy', amount: 1152 }
  var HATCH_DURATION = 600

  var LINE = [
    { type: 'coated_conductor', name: 'kerr_fcl_buffer_tape', circuit: 10, eut: 7864320, duration: 500,
      items: [['grindless:fcl_substrate_strip', 8], ['grindless:kerr_strand_wire', 4]], fluids: [['gtceu:epoxy', 288]], out: ['grindless:kerr_fcl_buffer_tape', 2],
      dataKey: 'grindless_coated_conductor' },
    { type: 'pulsed_laser_deposition', name: 'thick_kerr_fcl_tape', circuit: 8, eut: 67108864, duration: 1000,
      items: [['grindless:kerr_fcl_buffer_tape', 4], ['gtceu:gd_123_dust', 4]], fluids: [['gtceu:oxygen', 4000]], out: ['grindless:thick_kerr_fcl_tape', 4],
      kept: [['grindless:krf_excimer_laser', 1]], dataKey: 'grindless_pulsed_laser_deposition' },
    { type: 'magnet_winding', name: 'kerr_fcl_coil', circuit: 16, eut: 31457280, duration: 800, charge: true,
      items: [['grindless:thick_kerr_fcl_tape', 16], ['grindless:kerr_strand_wire', 4]], fluids: [['gtceu:epoxy', 288]], out: ['grindless:kerr_fcl_coil', 1],
      dataKey: 'grindless_magnet_winding' }
  ]
  // the helium refrigerator's keyed row: the potted coil run cold until it holds its critical current
  var COOL = { name: 'cold_kerr_fcl', input: 'grindless:kerr_fcl_coil', output: 'grindless:cold_kerr_fcl', eut: 7864320, duration: 800 }
  var COOL_FLUIDS = {
    makeUp: { id: 'gtceu:liquid_helium', amount: 25 }, precoolIn: { id: 'gtceu:liquid_nitrogen', amount: 50 },
    precoolOut: { id: 'gtceu:nitrogen', amount: 50 }, charge: { id: 'gtceu:liquid_helium', amount: 4000 }
  }
  var WINDING_CHARGE = { id: 'gtceu:liquid_helium', amount: 1000 }

  var HATCHES = [
    { name: 'max_maxplus_energy_hatch_1024a', out: 'gtceu:max_maxplus_energy_hatch_1024a',
      parts: [['grindless:cold_kerr_fcl', 16], ['grindless:maxplus_field_generator', 4], ['grindless:maxplus_electric_motor', 4]] }
  ]

  MP.line = LINE
  MP.cool = COOL
  MP.hatches = HATCHES
  MP.skipped = []

  function missingIds(ids, fluids) {
    return ids.filter(function (id, k) { return ids.indexOf(id) === k && !Item.exists(id) })
      .concat(fluids.filter(function (id) { return !Fluid.exists(id) }))
  }
  function skip(name, reason) {
    MP.skipped.push({ name: name, reason: reason })
    console.error(LOG + 'skipped ' + name + ': ' + reason)
  }

  function addStep(event, r) {
    var ids = r.items.map(function (x) { return x[0] }).concat([r.out[0]]).concat((r.kept || []).map(function (x) { return x[0] }))
    var fluids = r.fluids.map(function (x) { return x[0] }).concat(r.charge ? [WINDING_CHARGE.id] : [])
    var missing = missingIds(ids, fluids)
    if (missing.length > 0) return skip(r.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu[r.type]('grindless:' + r.name)
    r.items.forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    ;(r.kept || []).forEach(function (x) { b.notConsumable(x[1] + 'x ' + x[0]) })
    b.circuit(r.circuit)
    r.fluids.forEach(function (x) { b.inputFluids(Fluid.of(x[0], x[1])) })
    if (r.charge) b.notConsumableFluid(Fluid.of(WINDING_CHARGE.id, WINDING_CHARGE.amount))
    b.itemOutputs(r.out[1] + 'x ' + r.out[0])
    b.addDataString(r.dataKey, r.name)
    b.EUt(r.eut).duration(r.duration)
  }

  function addCool(event) {
    var cfg = (G.heliumRefrigerator && G.heliumRefrigerator.config) || COOL_FLUIDS
    var fl = [cfg.makeUp.id, cfg.precoolIn.id, cfg.precoolOut.id, cfg.charge.id]
    var missing = missingIds([COOL.input, COOL.output], fl)
    if (missing.length > 0) return skip(COOL.name, 'unknown id(s): ' + missing.join(', '))
    var dataKey = (G.heliumRefrigerator && G.heliumRefrigerator.dataKey) || 'grindless_closed_loop'
    event.recipes.gtceu.closed_loop_cooling('grindless:' + COOL.name)
      .itemInputs('1x ' + COOL.input)
      .inputFluids(Fluid.of(cfg.makeUp.id, cfg.makeUp.amount))
      .inputFluids(Fluid.of(cfg.precoolIn.id, cfg.precoolIn.amount))
      .notConsumableFluid(Fluid.of(cfg.charge.id, cfg.charge.amount))
      .itemOutputs('1x ' + COOL.output)
      .outputFluids(Fluid.of(cfg.precoolOut.id, cfg.precoolOut.amount))
      .addDataString(dataKey, 'grindless:closed_loop_cooling/' + COOL.name)
      .EUt(COOL.eut).duration(COOL.duration)
  }

  function addHatch(event, h) {
    var ids = [h.out, HULL, CABLE, LAMINA].concat(MAX_PARTS.map(function (x) { return x[0] })).concat(h.parts.map(function (x) { return x[0] }))
    var missing = missingIds(ids, [SOLDER.id])
    if (missing.length > 0) return skip(h.name, 'unknown id(s): ' + missing.join(', '))
    var b = event.recipes.gtceu.assembly_line('grindless:' + h.name)
    b.itemInputs('1x ' + HULL)
    h.parts.forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    MAX_PARTS.forEach(function (x) { b.itemInputs(x[1] + 'x ' + x[0]) })
    b.itemInputs('2x ' + CIRCUIT)
    b.itemInputs('2x ' + CABLE)
    b.itemInputs('1x ' + LAMINA)
    b.inputFluids(Fluid.of(SOLDER.id, SOLDER.amount))
    b.itemOutputs('1x ' + h.out)
    b.EUt(Number(GTValues.VA[MAXT])).duration(HATCH_DURATION)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      MP.skipped = []
      LINE.forEach(function (r) { addStep(event, r) })
      addCool(event)
      HATCHES.forEach(function (h) { addHatch(event, h) })
      console.info(LOG + 'P18 (' + (LINE.length + 1) + ' rows) and ' + HATCHES.length + ' hatch recipes; skipped ' + MP.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
