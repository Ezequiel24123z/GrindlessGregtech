// priority: -24484
// Gregtech Grindless - the Neutronium Compression Hall's controller recipe (package UIV-M2; the machine is in startup_scripts/grindless/uiv/compression_hall.js).
//
//   gtceu:neutronium_compression_hall -> grindless:assembly_line/neutronium_compression_hall (assembly line, research: grindless:neutron_guide)
//   Inputs: the UIV hull, 2 UIV electric pistons (the press), 2 optical mainframes, 4 UIV circuits, 3 domain inputs (supermirror, target wheel
//   blank, cage part), soldering alloy, lubricant and liquid para-hydrogen (the cooling of the cell). Not the pellet: the cage makes it with this
//   machine's tooling, and not GTM's neutronium either.
//
// Published for the smoke test: global.grindless.compressionHallRecipe { recipeId, output, missing, done }.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uiv] '
  var G = global.grindless || (global.grindless = {})
  var R = G.compressionHallRecipe || (G.compressionHallRecipe = {})

  var OUTPUT = 'gtceu:neutronium_compression_hall'
  var HULL = 'gtceu:uiv_machine_hull'
  var PART = 'gtceu:uiv_electric_piston'
  var MAINFRAME = 'gtnn:optical_mainframe'
  var RESEARCH = 'grindless:neutron_guide'
  var DOMAIN = ['2x grindless:neutron_supermirror', '2x grindless:target_wheel_blank', '2x grindless:cage_part']
  var COOLANT = 'gtceu:liquid_para_hydrogen'

  R.recipeId = 'grindless:assembly_line/neutronium_compression_hall'
  R.output = OUTPUT
  R.missing = []
  R.done = false

  ServerEvents.recipes(function (event) {
    try {
      var ids = [OUTPUT, HULL, PART, MAINFRAME, RESEARCH].concat(DOMAIN.map(function (s) { return s.replace(/^\d+x /, '') }))
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        R.missing = missing
        console.info(LOG + R.recipeId + ' skipped, unknown item(s): ' + missing.join(', '))
      } else {
        var b = event.recipes.gtceu.assembly_line('grindless:neutronium_compression_hall')
        b.itemInputs(HULL)
        b.itemInputs('2x ' + PART)
        b.itemInputs('2x ' + MAINFRAME)
        b.itemInputs('4x #gtceu:circuits/uiv')
        DOMAIN.forEach(function (s) { b.itemInputs(s) })
        b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000), Fluid.of(COOLANT, 4000))
        b.itemOutputs(OUTPUT)
        b.stationResearch(function (r) { return r.researchStack(Item.of(RESEARCH)).CWUt(64).EUt(7864320) })
        b.EUt(7864320).duration(1500)
      }
    } catch (e) {
      R.missing.push('error: ' + e)
      console.info(LOG + R.recipeId + ' failed: ' + e)
    }
    R.done = true
  })
})()
