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

  function line(name, research, ins, out) {
    event.recipes.gtceu.assembly_line('grindless:' + name)
      .itemInputs(ins)
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 500), Fluid.of('gtceu:helium_plasma', 576))
      .itemOutputs(out)
      .stationResearch(function (r) { return r.researchStack(Item.of(research)).CWUt(64).EUt(UHV_EUT) })
      .EUt(UHV_EUT)
      .duration(600)
  }

  line('uev_machine_hull', 'gtceu:uev_machine_casing',
    ['gtceu:uev_machine_casing', '2x gtceu:lay_superhydride_single_cable', '4x grindless:sic_sic_plate', '2x grindless:faraday_isolator', '2x grindless:ule_cavity'],
    'gtceu:uev_machine_hull')

  // 2 A hatches take single cables, the 16 A ones quadruple cables; the domain part keeps the four apart
  line('uev_energy_input_hatch', 'gtceu:uev_machine_hull',
    ['gtceu:uev_machine_hull', '2x gtceu:lay_superhydride_single_cable', '2x grindless:faraday_isolator', '1x grindless:ule_cavity'],
    'gtceu:uev_energy_input_hatch')

  line('uev_energy_output_hatch', 'gtceu:uev_machine_hull',
    ['gtceu:uev_machine_hull', '2x gtceu:lay_superhydride_single_cable', '2x grindless:faraday_isolator', '1x grindless:ule_cavity'],
    'gtceu:uev_energy_output_hatch')

  line('uev_energy_input_hatch_16a', 'gtceu:uev_machine_hull',
    ['gtceu:uev_machine_hull', '2x gtceu:lay_superhydride_quadruple_cable', '4x grindless:faraday_isolator', '2x grindless:ule_cavity'],
    'gtceu:uev_energy_input_hatch_16a')

  line('uev_energy_output_hatch_16a', 'gtceu:uev_machine_hull',
    ['gtceu:uev_machine_hull', '2x gtceu:lay_superhydride_quadruple_cable', '4x grindless:faraday_isolator', '2x grindless:ule_cavity'],
    'gtceu:uev_energy_output_hatch_16a')
})