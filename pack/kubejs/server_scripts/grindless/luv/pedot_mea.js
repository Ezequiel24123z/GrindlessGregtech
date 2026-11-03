// priority: -18877
// LuV living-circuit line L2, last step of the polymer (docs/eras/lines-ev-zpm.md section 4): the PEDOT:PSS microelectrode array.
// The laser engraver has no fluid slot, so the coating and bonding run in a cleanroom assembler: sapphire substrate, gold contacts, PEDOT:PSS film.
// The NPU row in orbital_biology.js takes one array instead of its 8 electrum plates.
(function () {
  var G = global.grindless
  var CleanroomType = Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType')
  var MEA = G.pedotMea || (G.pedotMea = {})
  MEA.recipe = { eut: 30720, duration: 400, sapphire: 4, gold: 16, pedot: 2000 }

  global.grindless.recipes('luv/pedot_mea', function (event) {
    var r = MEA.recipe
    event.recipes.gtceu.assembler('grindless:pedot_microelectrode_array')
      .itemInputs(r.sapphire + 'x gtceu:sapphire_plate', r.gold + 'x gtceu:gold_foil')
      .inputFluids(Fluid.of('gtceu:pedot_pss', r.pedot))
      .itemOutputs('grindless:pedot_microelectrode_array')
      .cleanroom(CleanroomType.CLEANROOM)
      .EUt(r.eut).duration(r.duration)
  })
})()
