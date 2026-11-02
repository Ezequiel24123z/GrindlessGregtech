// priority: -20140
// MAX+ machine 15, the horizon capacitor bank: its controller on the assembly line (docs/eras/maxplus.md, Controllers and machine 15; package XP-H5).
//
// The design's base (MAX hull, 2 horizon_machine_casing, 8 horizon_processor, 4 MAX circuits, 8 MAX+ components from 3 families, a plate,
// 2,000 mB kerr_condensate, station research, VA[MAX] for 4,800 t) plus what the bank is made of: the T14 toroid and the P18 limiter, both
// cold. Station research scans one horizon_capacitor, which only the bank researches. The bank itself (the store, its ring and its cell) is
// startup_scripts/grindless/maxplus/capacitor_bank.js and the wireless network. Rhino: var + function inside every callback.
(function () {
  var LOG = '[grindless/maxplus_capacitor_bank] '
  var VA_MAX = Number(GTValues.VA[14])
  var MACHINE = 'gtceu:horizon_capacitor_bank'
  var RESEARCH = 'grindless:horizon_capacitor'
  var KERR = 'gtceu:kerr_condensate'
  var HULL = 'gtceu:max_machine_hull'
  var CASING = 'grindless:horizon_machine_casing'
  var COMPS = ['2x grindless:maxplus_field_generator', '2x grindless:maxplus_sensor', '2x grindless:maxplus_conveyor_module', '2x grindless:maxplus_robot_arm']
  var EXTRA = ['4x grindless:cold_kerr_toroid', '2x grindless:cold_kerr_fcl', '4x grindless:horizon_compressed_plate']

  function strip(s) { return s.replace(/^\d+x /, '') }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try {
      var ins = [HULL, RESEARCH, CASING, 'grindless:horizon_processor', MACHINE].concat(COMPS.map(strip), EXTRA.map(strip))
      var missing = ins.filter(function (id, k) { return ins.indexOf(id) === k && !Item.exists(id) })
      if (!Fluid.exists(KERR)) missing.push(KERR)
      if (missing.length > 0) {
        console.error(LOG + 'skipped the controller: unknown id(s): ' + missing.join(', '))
        return
      }
      var a = event.recipes.gtceu.assembly_line('grindless:horizon_capacitor_bank')
      a.itemInputs(HULL, '2x ' + CASING, '8x #gtceu:circuits/maxplus', '4x #gtceu:circuits/max')
      COMPS.concat(EXTRA).forEach(function (s) { a.itemInputs(s) })
      a.inputFluids(Fluid.of(KERR, 2000))
      a.itemOutputs(MACHINE)
      a.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(VA_MAX) })
      a.EUt(VA_MAX).duration(4800)
    } catch (e) {
      console.error(LOG + 'failed: ' + e)
    }
  })
})()
