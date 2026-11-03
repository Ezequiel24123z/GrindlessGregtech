// priority: -23001
// UEV casing family recipes (package D4-CASE-UEV, docs/eras/lines-uev-uxv.md section 9). Ids: startup_scripts/grindless/uev/casings.js.
// All at VA[UEV] = 7,864,320 EU/t. photonic_casing (tables/photonics_uev.json) and degenerate_containment_casing (tables/sirius.json)
// are rows of their own tables. The composite casing is an assembler recipe because the infiltration furnace takes at most 2 items.
global.grindless.recipes('uev/casings', function (event) {
  var UEV_EUT = 7864320

  event.recipes.gtceu.assembler('grindless:sic_composite_casing')
    .itemInputs('16x grindless:sic_sic_plate', '8x grindless:sic_fibre_preform', '8x grindless:six_n_tantalum')
    .inputFluids(Fluid.of('gtceu:epoxy', 144))
    .itemOutputs('2x grindless:sic_composite_casing')
    .EUt(UEV_EUT)
    .duration(400)

  // no bonded Fe16N2 magnets (batch 16): their carbonyl iron comes from Barnard b only, and Earth's and Alpha Centauri's UEV
  // machines are bodied in this casing (reachability's era rule); the field is the LaH10 winding's
  event.recipes.gtceu.naquadria_magnets('grindless:superhydride_magnet_casing')
    .circuit(11)
    .itemInputs('64x gtceu:lay_superhydride_single_wire', '16x grindless:sic_sic_plate', '1x gtceu:uev_sensor')
    .itemOutputs('16x grindless:superhydride_magnet_casing')
    .EUt(UEV_EUT)
    .duration(600)

  event.recipes.gtceu.spark_plasma_sintering('grindless:hftacn_lining_casing')
    .circuit(20)
    .itemInputs('20x grindless:hftacn_powder', '4x grindless:sic_sic_plate', '2x grindless:ysz_ingot')
    .itemOutputs('2x grindless:hftacn_lining_casing')
    .EUt(UEV_EUT)
    .duration(500)
})
