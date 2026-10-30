// -----------------------------------------------------------------------------------------------
// OpV components (package OpV-A1, docs/eras/opv.md "A1. Components", lines 4-10): the steps of the component lines that run on GTM's own
// assembler. The steps on older custom machines are their own rows, each marked OpV-A1 (tables/composites.json CVI c6, uhv/propulsion.js SPS
// c16-17, ev/cryogenic_plant.js liquid helium-3, tables/memories_cryostat.json c4-5, tables/electron_beam.json c21,
// luv/helium_refrigerator.js, uhv/elevator.js PBO c9). Items: startup_scripts/grindless/opv/components.js and opv/foundation.js (F1).
//
//   assembler  chain_sic_preform     4 SiC fibre + 2 chain strand wire -> 1 chain SiC preform (line 4)
//   assembler  superfluid_he3_seal   superleak plug + 2 chain lamina stacks + 100 mB superfluid He-3 -> 1 seal (line 5)
//
// Every row runs at 2^28 EU/t (two UXV amps of a 4 A hatch pair: the OpV assembler or the GCYM large assembler). An unknown id skips its
// row with a console error. Published in global.grindless.opvComponents: .rows ([{ id, path, type, circuit, itemsIn, fluidsIn, itemsOut,
// fluidsOut, eut, duration }]), .skipped ([{ id, reason }]).
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var OPVC = G.opvComponents || (G.opvComponents = {})

  var OPV_EUT = 268435456

  var WIRE = 'gtceu:chain_strand_single_wire'
  var STACK = 'grindless:chain_lamina_stack'
  var SUPERFLUID = 'gtceu:superfluid_helium_3'

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }
  function row(path, type, circuit, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration) {
    return { id: 'grindless:' + type + '/' + path, path: path, type: type, circuit: circuit, itemsIn: itemsIn, fluidsIn: fluidsIn, itemsOut: itemsOut,
      fluidsOut: fluidsOut, eut: eut, duration: duration }
  }

  OPVC.rows = [
    // line 4: SiC fibre wound on chain strand wire, before the CVI furnace densifies it (c6)
    row('chain_sic_preform', 'assembler', null, [item('grindless:sic_fibre', 4), item(WIRE, 2)], [],
      [item('grindless:chain_sic_preform', 1)], [], OPV_EUT, 200),
    // line 5: the superleak plug sealed between two lamina stacks and charged with superfluid helium-3
    row('superfluid_he3_seal', 'assembler', null, [item('grindless:superleak_plug', 1), item(STACK, 2)], [fluid(SUPERFLUID, 100)],
      [item('grindless:superfluid_he3_seal', 1)], [], OPV_EUT, 400)
  ]
  OPVC.skipped = []

  function missingIds(r) {
    var missing = []
    r.itemsIn.concat(r.itemsOut).forEach(function (x) {
      if (x.id.charAt(0) !== '#' && !Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id)
    })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function add(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      OPVC.skipped.push({ id: r.id, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'opv_components recipe skipped ' + r.id + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var b = event.recipes.gtceu[r.type]('grindless:' + r.path)
    r.itemsIn.forEach(function (x) { b.itemInputs(x.count + 'x ' + x.id) })
    if (r.circuit !== null) b.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { b.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { b.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { b.outputFluids(Fluid.of(x.id, x.amount)) })
    b.EUt(r.eut).duration(r.duration)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      OPVC.rows.forEach(function (r) { add(event, r) })
      console.info(LOG + 'opv_components: ' + (OPVC.rows.length - OPVC.skipped.length) + ' rows added, ' + OPVC.skipped.length + ' skipped')
    } catch (e) {
      console.error(LOG + 'opv_components recipes failed: ' + e)
    }
  })
})()
