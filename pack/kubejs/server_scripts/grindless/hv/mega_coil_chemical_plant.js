// -----------------------------------------------------------------------------------------------
// Controller recipe of the HV Coil Chemical Plant (startup_scripts/grindless/hv/mega_coil_chemical_plant.js, docs/eras/mega.md 4.5,
// family rule 6): an HV assembler recipe built from the machines it replaces, 2 large chemical reactor controllers + 4 HV chemical
// reactors, plus 4 HV circuits, 8 PTFE plates and 4 Kanthal coil blocks. It does not fit a crafting grid, so it is an assembler recipe,
// the way GTM builds its own large controllers. Nothing else here: the machine runs GTM's large_chemical_reactor recipes untouched.
(function () {
  const G = global.grindless
  const CP = G.megaCoilChemicalPlant || (G.megaCoilChemicalPlant = {})

  const INPUTS = [
    '2x gtceu:large_chemical_reactor', '4x gtceu:hv_chemical_reactor', '4x #gtceu:circuits/hv',
    '8x #forge:plates/polytetrafluoroethylene', '4x gtceu:kanthal_coil_block'
  ]
  const MACHINES = ['gtceu:large_chemical_reactor', 'gtceu:hv_chemical_reactor', 'gtceu:kanthal_coil_block']

  // read by the bench test
  CP.crafting = 'grindless:coil_chemical_plant'
  CP.craftingInputs = INPUTS.slice()

  ServerEvents.recipes(function (event) {
    try {
      var missing = MACHINES.concat(['gtceu:coil_chemical_plant']).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error('[grindless/hv] coil chemical plant recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.assembler(CP.crafting)
        .itemInputs(INPUTS[0], INPUTS[1], INPUTS[2], INPUTS[3], INPUTS[4])
        .itemOutputs('gtceu:coil_chemical_plant')
        .EUt(120)
        .duration(600)
      console.info('[grindless/hv] coil chemical plant: controller assembler recipe added')
    } catch (e) {
      console.error('[grindless/hv] coil chemical plant recipe failed: ' + e)
    }
  })
})()
