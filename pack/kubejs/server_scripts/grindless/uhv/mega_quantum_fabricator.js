// -----------------------------------------------------------------------------------------------
// Recipes of the UHV Quantum Fabricator (startup_scripts/grindless/uhv/mega_quantum_fabricator.js, docs/eras/mega.md 4.11, family
// rule 6): assembler recipes built from the machines they replace, the same way GTM builds its own large controllers.
//   controller   16 UV assemblers + 1 assembly hall + 4 UHV machine hulls + 4 UV robot arms + 4 UV field generators + 4 UHV circuits,
//                at UHV EU/t (GTM registers no UHV single-block machines with highTierContent off; the hall with a UHV energy hatch
//                runs it)
//   ring casing  1 UV field generator + 1 UHV machine casing + 1 neutronium plate -> 2 field ring casings
// Nothing else here: the machine runs GTM's own recipes untouched.
(function () {
  const G = global.grindless
  const QF = G.megaQuantumFabricator || (G.megaQuantumFabricator = {})

  const UHV_EUT = 2097152
  const UV_EUT = 524288
  const CONTROLLER_INPUTS = [
    '16x gtceu:uv_assembler', '1x gtceu:assembly_hall', '4x gtceu:uhv_machine_hull', '4x gtceu:uv_robot_arm',
    '4x gtceu:uv_field_generator', '4x #gtceu:circuits/uhv'
  ]
  const RING_INPUTS = ['1x gtceu:uv_field_generator', '1x gtceu:uhv_machine_casing', '1x gtceu:neutronium_plate']
  const RING_COUNT = 2

  // read by the bench test
  QF.crafting = 'grindless:quantum_fabricator'
  QF.craftingInputs = CONTROLLER_INPUTS.slice()
  QF.ringCrafting = 'grindless:field_ring_casing'
  QF.ringInputs = RING_INPUTS.slice()
  QF.ringCount = RING_COUNT

  ServerEvents.recipes(function (event) {
    try {
      var ids = ['gtceu:quantum_fabricator', 'gtceu:assembly_hall', 'gtceu:uv_assembler', 'gtceu:uhv_machine_hull', 'gtceu:uv_robot_arm',
        'gtceu:uv_field_generator', 'gtceu:uhv_machine_casing', 'gtceu:neutronium_plate', 'grindless:field_ring_casing']
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error('[grindless/uhv] quantum fabricator recipes skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.assembler(QF.crafting)
        .itemInputs(CONTROLLER_INPUTS[0], CONTROLLER_INPUTS[1], CONTROLLER_INPUTS[2], CONTROLLER_INPUTS[3], CONTROLLER_INPUTS[4], CONTROLLER_INPUTS[5])
        .itemOutputs('gtceu:quantum_fabricator')
        .EUt(UHV_EUT)
        .duration(2400)
      event.recipes.gtceu.assembler(QF.ringCrafting)
        .itemInputs(RING_INPUTS[0], RING_INPUTS[1], RING_INPUTS[2])
        .itemOutputs(RING_COUNT + 'x grindless:field_ring_casing')
        .EUt(UV_EUT)
        .duration(200)
      console.info('[grindless/uhv] quantum fabricator: controller and field ring casing assembler recipes added')
    } catch (e) {
      console.error('[grindless/uhv] quantum fabricator recipes failed: ' + e)
    }
  })
})()
