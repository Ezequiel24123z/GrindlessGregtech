// priority: -19474
// -----------------------------------------------------------------------------------------------
// Controller recipe of the LV Wire Works (startup_scripts/grindless/lv/mega_wire_works.js, docs/eras/mega.md 4.3, family rule 6): an
// assembler recipe built from the machines it replaces, 4 LV wiremills + 4 LV benders, plus 4 LV circuits and 8 steel plates.
// It does not fit a crafting grid (12 machines and circuits), so it is an LV assembler recipe, the same way GTM builds its own large
// controllers. Nothing else here: the machine runs GTM's wiremill and bender recipes untouched.
(function () {
  const G = global.grindless
  const WW = G.megaWireWorks || (G.megaWireWorks = {})

  const INPUTS = ['4x gtceu:lv_wiremill', '4x gtceu:lv_bender', '4x #gtceu:circuits/lv', '8x #forge:plates/steel']
  const MACHINES = ['gtceu:lv_wiremill', 'gtceu:lv_bender']

  // read by the bench test
  WW.crafting = 'grindless:wire_works'
  WW.craftingInputs = INPUTS.slice()

  ServerEvents.recipes(function (event) {
    try {
      var missing = MACHINES.concat(['gtceu:wire_works']).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error('[grindless/lv] wire works recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.assembler(WW.crafting)
        .itemInputs(INPUTS[0], INPUTS[1], INPUTS[2], INPUTS[3])
        .itemOutputs('gtceu:wire_works')
        .EUt(30)
        .duration(400)
      console.info('[grindless/lv] wire works: controller assembler recipe added')
    } catch (e) {
      console.error('[grindless/lv] wire works recipe failed: ' + e)
    }
  })
})()
