// priority: -23000
// UIV casing family recipes (package D4-CASE-UIV, docs/eras/lines-uev-uxv.md section 9). Ids: startup_scripts/grindless/uiv/casings.js.
// The rhea casing is printed on the UV powder bed printer, so it runs at VA[UV]; the other three at VA[UIV] = 31,457,280 EU/t.
// neutron_star_site_casing (tables/rx_j1856.json) and uiv_fusion_casing (tables/mk5.json) are rows of their own tables.
// The printer takes 3 inputs and the cryostat works 4, so the rhea casing has no circuit.
global.grindless.recipes('uiv/casings', function (event) {
  var UV_EUT = 1966080
  var UIV_EUT = 31457280

  event.recipes.gtceu.powder_bed_fusion('grindless:rhea_casing')
    .itemInputs('12x grindless:rhea_am_powder', '4x gtceu:rhea_plate', '2x grindless:wf_rhea_billet')
    .itemOutputs('2x grindless:rhea_casing')
    .EUt(UV_EUT)
    .duration(400)

  event.recipes.gtceu.naquadria_magnets('grindless:mh_field_casing')
    .circuit(12)
    .itemInputs('16x grindless:mh_winding', '8x gtceu:rhea_plate', '4x grindless:rad_hard_controller')
    .itemOutputs('16x grindless:mh_field_casing')
    .EUt(UIV_EUT)
    .duration(600)

  event.recipes.gtceu.assembler('grindless:multilayer_optics_casing')
    .itemInputs('8x grindless:la_b4c_multilayer', '8x gtceu:rhea_plate', '4x grindless:glass_interposer', '1x gtceu:uiv_sensor')
    .itemOutputs('8x grindless:multilayer_optics_casing')
    .EUt(UIV_EUT)
    .duration(400)

  event.recipes.gtceu.nuclear_demagnetisation('grindless:dilution_cryostat_casing')
    .circuit(8)
    .itemInputs('8x grindless:mk_cryostat_module', '8x gtceu:rhea_plate', '1x gtceu:uiv_electric_pump')
    .inputFluids(Fluid.of('gtceu:helium_3', 500))
    .itemOutputs('8x grindless:dilution_cryostat_casing')
    .EUt(UIV_EUT)
    .duration(600)
})
