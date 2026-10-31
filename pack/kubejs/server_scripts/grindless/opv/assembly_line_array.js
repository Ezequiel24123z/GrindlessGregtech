// priority: -21574
// Gregtech Grindless - the OpV assembly line array's controller recipe (package OpV-M2; the machine is registered in
// startup_scripts/grindless/opv/assembly_line_array.js).
//
//   gtceu:assembly_line_array (Assembly Line Array) -> grindless:assembly_line/assembly_line_array
//   An assembly line at VA[OpV] for 2,400 ticks behind station research on a tetron array: an OpV hull, 8 robot arms, 8 conveyor modules,
//   4 sensors, 4 field generators, 8 OpV circuits, an OpV harmonic drive, a cryo optical link and a Nb TSV interposer, with 1,000 mB of
//   superfluid helium-3. Nine different ingredients, none from UXV or below. GTM has no recipe for it, so nothing is removed.
//   The inputs are made by other OpV packages (hull A0; robot arm, conveyor module and sensor A1; circuits A2; field generator A3;
//   tetron array B1; harmonic drive, cryo optical link and interposer F1 / A2).
//
// Published for the smoke test: global.grindless.assemblyLineArrayRecipe { recipeId, output, inputs, missing, done }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var R = G.assemblyLineArrayRecipe || (G.assemblyLineArrayRecipe = {})

  var OUTPUT = 'gtceu:assembly_line_array'
  var RESEARCH = 'grindless:tetron_array'
  var HELIUM = 'gtceu:superfluid_helium_3'
  var CIRCUIT = '#gtceu:circuits/opv'
  var INPUTS = [
    ['', 'gtceu:opv_machine_hull'],
    ['8x ', 'gtceu:opv_robot_arm'],
    ['8x ', 'gtceu:opv_conveyor_module'],
    ['4x ', 'gtceu:opv_sensor'],
    ['4x ', 'gtceu:opv_field_generator'],
    ['8x ', CIRCUIT],
    ['2x ', 'grindless:opv_harmonic_drive'],
    ['2x ', 'grindless:cryo_optical_link'],
    ['2x ', 'grindless:nb_tsv_interposer']
  ]
  var VA_OPV = 503316480
  var VA_UXV = 125829120

  R.recipeId = 'grindless:assembly_line/assembly_line_array'
  R.output = OUTPUT
  R.inputs = INPUTS.map(function (p) { return p[0] + p[1] })
  R.missing = []
  R.done = false

  ServerEvents.recipes(function (event) {
    try {
      var ids = [OUTPUT, RESEARCH]
      INPUTS.forEach(function (p) { if (p[1].charAt(0) !== '#') ids.push(p[1]) })
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (!Fluid.exists(HELIUM)) missing.push(HELIUM)
      if (missing.length > 0) {
        R.missing = missing
        console.error(LOG + R.recipeId + ' skipped, unknown item(s): ' + missing.join(', '))
      } else {
        var b = event.recipes.gtceu.assembly_line('grindless:assembly_line_array')
        INPUTS.forEach(function (p) { b.itemInputs(p[0] + p[1]) })
        b.inputFluids(Fluid.of(HELIUM, 1000))
        b.itemOutputs(OUTPUT)
        b.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(128).EUt(VA_UXV) })
        b.EUt(VA_OPV).duration(2400)
      }
    } catch (e) {
      console.error(LOG + R.recipeId + ' failed: ' + e)
    }
    R.done = true
  })
})()
