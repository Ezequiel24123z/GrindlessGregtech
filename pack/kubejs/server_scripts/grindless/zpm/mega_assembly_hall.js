// priority: -26574
// -----------------------------------------------------------------------------------------------
// Controller recipe of the ZPM Assembly Hall (startup_scripts/grindless/zpm/mega_assembly_hall.js, docs/eras/mega.md 4.9, family
// rule 6): an assembly-line recipe built from the machines it replaces, 16 ZPM assemblers + 16 ZPM circuit assemblers, plus 4 ZPM
// circuits, 16 assembly line casings, the line's magnetic bearings and LuV SMES cells (its buffer), soldering alloy and lubricant.
// Research: the ZPM assembler, scanned. Nothing else here: the machine runs GTM's assembler and circuit assembler recipes untouched.
(function () {
  const G = global.grindless
  const AH = G.megaAssemblyHall || (G.megaAssemblyHall = {})

  const INPUTS = ['16x gtceu:zpm_assembler', '16x gtceu:zpm_circuit_assembler', '4x #gtceu:circuits/zpm', '16x gtceu:assembly_line_casing',
    '8x grindless:magnetic_bearing', '2x grindless:luv_smes_cell']
  const MACHINES = ['gtceu:zpm_assembler', 'gtceu:zpm_circuit_assembler', 'gtceu:assembly_line_casing', 'grindless:magnetic_bearing', 'grindless:luv_smes_cell']

  // read by the bench test
  AH.crafting = 'grindless:assembly_line/assembly_hall'
  AH.craftingInputs = INPUTS.slice()

  ServerEvents.recipes(function (event) {
    try {
      var missing = MACHINES.concat(['gtceu:assembly_hall']).filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error('[grindless/zpm] assembly hall recipe skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:assembly_hall')
      b.itemInputs(INPUTS[0], INPUTS[1], INPUTS[2], INPUTS[3], INPUTS[4], INPUTS[5])
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 2304), Fluid.of('gtceu:lubricant', 2000))
      b.itemOutputs('gtceu:assembly_hall')
      b.scannerResearch(Item.of('gtceu:zpm_assembler'))
      b.EUt(122880).duration(2400)
      console.info('[grindless/zpm] assembly hall: controller assembly-line recipe added')
    } catch (e) {
      console.error('[grindless/zpm] assembly hall recipe failed: ' + e)
    }
  })
})()
