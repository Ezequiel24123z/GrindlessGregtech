// priority: -23470
// -----------------------------------------------------------------------------------------------
// UHV W11, the gate ring's MgB2 coils (package D3-GATERING, docs/eras/lines-uv-uhv.md "W11" rows 5-9; row 10, the casing, is in uhv/gate.js).
// Items: startup_scripts/grindless/uhv/gate_ring.js. All at VA[UHV] = 1,966,080 EU/t except the HV autoclave's row.
//   naquadria_magnets  c13  8 MgB2 single wires + 2 copper foils -> 1 MgB2 cable
//   naquadria_magnets  c14  4 cables + 4 Kapton K foils -> 1 gate coil winding
//   electric_blast_furnace  973 K, argon (the atmosphere, returned) -> reacted gate coil (the MgB2 forms in the wire)
//   composite_curing   HV   reacted coil + 288 mB epoxy -> impregnated gate coil
//   naquadria_magnets  c15  impregnated coil, the 1,000 mB liquid helium charge (not consumed: the magnet works' cold test) -> qualified gate coil
// Tuned here: the spec gives no EU/t or time; times match the neighbouring rows of each machine.
global.grindless.recipes('uhv/gate_ring', function (event) {
  var VA_UHV = 1966080
  var HV = 480
  var ids = ['grindless:mgb2_cable', 'grindless:gate_coil_winding', 'grindless:reacted_gate_coil', 'grindless:impregnated_gate_coil',
    'grindless:qualified_gate_coil', 'gtceu:magnesium_diboride_single_wire']
  var missing = ids.filter(function (x) { return !Item.exists(x) })
  ;['gtceu:epoxy', 'gtceu:argon', 'gtceu:liquid_helium'].forEach(function (f) { if (!Fluid.exists(f)) missing.push(f) })
  if (!event.recipes.gtceu.composite_curing) missing.push('gtceu:composite_curing')
  if (missing.length > 0) throw new Error('unknown: ' + missing.join(', '))

  event.recipes.gtceu.naquadria_magnets('grindless:mgb2_cable')
    .circuit(13)
    .itemInputs('8x gtceu:magnesium_diboride_single_wire', '2x #forge:foils/copper')
    .itemOutputs('grindless:mgb2_cable')
    .addDataString('grindless_naquadria_magnets', 'mgb2_cable')
    .EUt(VA_UHV).duration(300)

  event.recipes.gtceu.naquadria_magnets('grindless:gate_coil_winding')
    .circuit(14)
    .itemInputs('4x grindless:mgb2_cable', '4x #forge:foils/kapton_k')
    .itemOutputs('grindless:gate_coil_winding')
    .addDataString('grindless_naquadria_magnets', 'gate_coil_winding')
    .EUt(VA_UHV).duration(400)

  event.recipes.gtceu.electric_blast_furnace('grindless:reacted_gate_coil')
    .itemInputs('grindless:gate_coil_winding')
    .inputFluids(Fluid.of('gtceu:argon', 1000))
    .itemOutputs('grindless:reacted_gate_coil')
    .outputFluids(Fluid.of('gtceu:argon', 1000))
    .blastFurnaceTemp(973)
    .EUt(VA_UHV).duration(600)

  event.recipes.gtceu.composite_curing('grindless:impregnated_gate_coil')
    .itemInputs('grindless:reacted_gate_coil')
    .inputFluids(Fluid.of('gtceu:epoxy', 288))
    .itemOutputs('grindless:impregnated_gate_coil')
    .EUt(HV).duration(400)

  event.recipes.gtceu.naquadria_magnets('grindless:qualified_gate_coil')
    .circuit(15)
    .itemInputs('grindless:impregnated_gate_coil')
    .notConsumableFluid(Fluid.of('gtceu:liquid_helium', 1000))
    .itemOutputs('grindless:qualified_gate_coil')
    .addDataString('grindless_naquadria_magnets', 'qualified_gate_coil')
    .EUt(VA_UHV).duration(300)
})
