// priority: -20270
// Gregtech Grindless - the MAX+ wireless energy hatches' recipes (package XP-W2, docs/eras/maxplus.md 'Hatches'). The hatches themselves
// (gtceu:max_wireless_energy_hatch_1024a and _4096a) are registered by startup_scripts/grindless/lv/wireless_energy.js from the table's
// maxplusHatchAmps. Both are assembly-line rows at VA[MAX] with station research on the MAX 64 A wireless hatch (the controller precedent of
// maxplus/assembler.js):
//
//   1,024 A  the wired MAX+ 1,024 A hatch (maxplus/power.js), the MAX 64 A wireless hatch's own wireless parts (link repeaters, emitter,
//            sensor) and MAX+ components
//   4,096 A  one wireless 1,024 A hatch, four wired 1,024 A hatches and more of the same parts: clearly dearer than four 1,024 A hatches
//
// Published for the tests: global.grindless.maxplusWireless { hatches, skipped }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/maxplus_wireless] '
  var MAXT = 14
  var G = global.grindless || (global.grindless = {})
  var MW = G.maxplusWireless || (G.maxplusWireless = {})
  var VA_MAX = Number(GTValues.VA[MAXT])

  var HULL = 'gtceu:max_machine_hull'
  var CIRCUIT = '#gtceu:circuits/max'
  var WIRED = 'gtceu:max_maxplus_energy_hatch_1024a'
  var RESEARCH = 'gtceu:max_wireless_energy_hatch_64a'
  var SOLDER = { id: 'gtceu:soldering_alloy', amount: 2304 }
  var CABLE = 'gtceu:horizon_strand_single_cable'

  var HATCHES = [
    { name: 'max_wireless_energy_hatch_1024a', out: 'gtceu:max_wireless_energy_hatch_1024a', duration: 1200, circuits: 4,
      parts: [[WIRED, 1], ['grindless:horizon_strand_repeater', 8], ['grindless:max_emitter', 2], ['grindless:max_sensor', 2],
        ['grindless:maxplus_emitter', 4], ['grindless:maxplus_sensor', 4], ['grindless:maxplus_field_generator', 4]] },
    { name: 'max_wireless_energy_hatch_4096a', out: 'gtceu:max_wireless_energy_hatch_4096a', duration: 2400, circuits: 8,
      parts: [['gtceu:max_wireless_energy_hatch_1024a', 1], [WIRED, 4], ['grindless:horizon_strand_repeater', 32], ['grindless:max_emitter', 8],
        ['grindless:max_sensor', 8], ['grindless:maxplus_emitter', 16], ['grindless:maxplus_sensor', 16],
        ['grindless:maxplus_field_generator', 16], ['grindless:maxplus_electric_motor', 16]] }
  ]
  MW.hatches = HATCHES
  MW.skipped = []

  function addHatch(event, h) {
    var ids = [h.out, HULL, CABLE, RESEARCH].concat(h.parts.map(function (x) { return x[0] }))
    var missing = ids.filter(function (id, k) { return ids.indexOf(id) === k && !Item.exists(id) })
    if (!Fluid.exists(SOLDER.id)) missing.push(SOLDER.id)
    if (missing.length > 0) {
      MW.skipped.push({ name: h.name, reason: 'unknown id(s): ' + missing.join(', ') })
      console.error(LOG + 'skipped ' + h.name + ': unknown id(s): ' + missing.join(', '))
      return
    }
    var a = event.recipes.gtceu.assembly_line('grindless:' + h.name)
    a.itemInputs('1x ' + HULL)
    h.parts.forEach(function (x) { a.itemInputs(x[1] + 'x ' + x[0]) })
    a.itemInputs(h.circuits + 'x ' + CIRCUIT)
    a.itemInputs((h.circuits * 2) + 'x ' + CABLE)
    a.inputFluids(Fluid.of(SOLDER.id, SOLDER.amount))
    a.itemOutputs('1x ' + h.out)
    a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
    a.EUt(VA_MAX).duration(h.duration)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      MW.skipped = []
      HATCHES.forEach(function (h) { addHatch(event, h) })
      console.info(LOG + HATCHES.length + ' hatch recipes; skipped ' + MW.skipped.length)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
