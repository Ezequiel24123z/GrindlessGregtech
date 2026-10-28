// -----------------------------------------------------------------------------------------------
// Controller recipe of the ZPM Assembly Hall (startup_scripts/grindless/zpm/mega_assembly_hall.js, docs/eras/mega.md 4.9, family
// rule 6): an assembler recipe built from the machines it replaces, 16 ZPM assemblers + 16 ZPM circuit assemblers, plus 4 ZPM
// circuits and 16 assembly line casings. It does not fit a crafting grid, so it is an assembler recipe, the same way GTM builds its
// own large controllers. Nothing else here: the machine runs GTM's assembler and circuit assembler recipes untouched.
(function () {
  const G = global.grindless
  const AH = G.megaAssemblyHall || (G.megaAssemblyHall = {})

  const INPUTS = ['16x gtceu:zpm_assembler', '16x gtceu:zpm_circuit_assembler', '4x #gtceu:circuits/zpm', '16x gtceu:assembly_line_casing']
  const MACHINES = ['gtceu:zpm_assembler', 'gtceu:zpm_circuit_assembler', 'gtceu:assembly_line_casing']

  // read by the bench test
  AH.crafting = 'grindless:assembly_hall'
  AH.craftingInputs = INPUTS.slice()

  ServerEvents.recipes(function (event) {
    try {
      var missing = MACHINES.concat(['gtceu:assembly_hall']).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error('[grindless/zpm] assembly hall recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.assembler(AH.crafting)
        .itemInputs(INPUTS[0], INPUTS[1], INPUTS[2], INPUTS[3])
        .itemOutputs('gtceu:assembly_hall')
        .EUt(30720)
        .duration(1200)
      console.info('[grindless/zpm] assembly hall: controller assembler recipe added')
    } catch (e) {
      console.error('[grindless/zpm] assembly hall recipe failed: ' + e)
    }
  })
})()
