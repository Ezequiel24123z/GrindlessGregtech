// priority: -26069
// UXV casing family recipes (package D4-CASE-UXV, docs/eras/lines-uev-uxv.md section 9). Ids: startup_scripts/grindless/uxv/casings.js.
// uxv_fusion_casing is a row of tables/fusion_mk6.json. No Vela or Cas A product goes in: these bodies are built before Vela
// (docs/eras/uxv.md, bootstrap check), so the pasta casing takes the UIV field generator and the pulsed field casing the UIV emitter.
// The mu-metal casing is an assembler recipe because the nitride magnet works holds only two items beside its circuit.
// The family casings are UXV's bootstrap material (tools/analysis/recipe_quality.json familyCasings): the pulsed field casing is wound at
// VA[UIV] on the naquadria magnet works with two UEV hatches (the two-hatch rule); the assembler rows run at VA[UXV].
global.grindless.recipes('uxv/casings', function (event) {
  var UIV_EUT = 31457280
  var UXV_EUT = 125829120

  event.recipes.gtceu.assembler('grindless:gum_metal_casing')
    .itemInputs('8x grindless:gum_metal_billet', '4x grindless:w184_cvi_preform', '4x grindless:annealed_mu_foil', '8x gtceu:tungsten_184_single_wire')
    .inputFluids(Fluid.of('gtceu:epoxy', 288))
    .itemOutputs('2x grindless:gum_metal_casing')
    .EUt(UXV_EUT)
    .duration(400)

  // two UIV sensors, not a UXV one: the Spintronic Cluster Tool is built from this casing and makes the MTJ dies every UXV sensor needs
  // (bootstrap; the UXV gate failed on dump 9f6c318722c0)
  event.recipes.gtceu.assembler('grindless:mu_metal_shield_casing')
    .itemInputs('16x grindless:annealed_mu_foil', '4x grindless:gum_metal_billet', '4x grindless:w184_cvi_preform', '2x gtceu:uiv_sensor')
    .inputFluids(Fluid.of('gtceu:epoxy', 288))
    .itemOutputs('8x grindless:mu_metal_shield_casing')
    .EUt(UXV_EUT)
    .duration(500)

  event.recipes.gtceu.naquadria_magnets('grindless:pulsed_field_casing')
    .circuit(15)
    .itemInputs('12x grindless:mh_winding', '6x grindless:ga2o3_power_die', '3x grindless:finemet_core', '6x grindless:gum_metal_billet', '4x gtceu:uiv_emitter')
    .itemOutputs('12x grindless:pulsed_field_casing')
    .EUt(UIV_EUT)
    .duration(700)

  event.recipes.gtceu.assembler('grindless:pasta_containment_casing')
    .itemInputs('32x grindless:frc_cartridge', '32x grindless:cage_part', '32x grindless:gum_metal_billet', '1x gtceu:uiv_field_generator')
    .inputFluids(Fluid.of('gtceu:epoxy', 576))
    .itemOutputs('64x grindless:pasta_containment_casing')
    .EUt(UXV_EUT)
    .duration(600)
})
