// priority: -23074
// UEV foundation recipes (package UEV-F1): only the machine casing, the hull and the four hatches every UEV machine needs. Every other UEV
// recipe is made by the package that makes its parts. Ids: startup_scripts/grindless/uev/foundation.js. All run in GTM's assembler at UHV
// voltage (V[UHV] = 2,097,152 EU/t, one tier under the UEV hull they make).
ServerEvents.recipes(function (event) {
  const UHV_EUT = 2097152

  event.recipes.gtceu.assembler('grindless:uev_machine_casing')
    .itemInputs('6x gtceu:tritanium_plate', '2x grindless:sic_sic_plate')
    .inputFluids(Fluid.of('gtceu:helium_plasma', 1000))
    .itemOutputs('2x gtceu:uev_machine_casing')
    .EUt(UHV_EUT)
    .duration(100)

  event.recipes.gtceu.assembler('grindless:uev_machine_hull')
    .itemInputs('gtceu:uev_machine_casing', '2x gtceu:lay_superhydride_single_cable', '4x grindless:sic_sic_plate')
    .itemOutputs('gtceu:uev_machine_hull')
    .EUt(UHV_EUT)
    .duration(50)

  // 2 A hatches take two single cables, the 16 A ones two quadruple cables; the circuit number keeps the four apart
  event.recipes.gtceu.assembler('grindless:uev_energy_input_hatch')
    .itemInputs('gtceu:uev_machine_hull', '2x gtceu:lay_superhydride_single_cable')
    .circuit(1)
    .itemOutputs('gtceu:uev_energy_input_hatch')
    .EUt(UHV_EUT)
    .duration(100)

  event.recipes.gtceu.assembler('grindless:uev_energy_output_hatch')
    .itemInputs('gtceu:uev_machine_hull', '2x gtceu:lay_superhydride_single_cable')
    .circuit(2)
    .itemOutputs('gtceu:uev_energy_output_hatch')
    .EUt(UHV_EUT)
    .duration(100)

  event.recipes.gtceu.assembler('grindless:uev_energy_input_hatch_16a')
    .itemInputs('gtceu:uev_machine_hull', '2x gtceu:lay_superhydride_quadruple_cable')
    .circuit(3)
    .itemOutputs('gtceu:uev_energy_input_hatch_16a')
    .EUt(UHV_EUT)
    .duration(200)

  event.recipes.gtceu.assembler('grindless:uev_energy_output_hatch_16a')
    .itemInputs('gtceu:uev_machine_hull', '2x gtceu:lay_superhydride_quadruple_cable')
    .circuit(4)
    .itemOutputs('gtceu:uev_energy_output_hatch_16a')
    .EUt(UHV_EUT)
    .duration(200)
})
