// priority: -6700
// -----------------------------------------------------------------------------------------------
// OpV's census IV (docs/eras/opv.md, process lines 43 and 44; package OpV-B2). No new machine: the rows go to older machines
// (tables electron_beam.json c23, isotopes.json calutron c11, superheavy.json cyclotron c11 and c13, recoil separator c10 and c11,
// chemistry lab c11). F1's items (element_124_recoil, element_126_recoil, superheavy_census_iv; opv/foundation.js) and A0's
// caged_ni_chain are not registered again.
//
// New ids:
//   materials thawed_chain_nickel, nickel_64 (dusts); element_124_recoil_gas, element_126_recoil_gas (gases)
// GTM draws the material icons (no textures). Names: client_scripts/grindless/opv_census_iv_lang.js.
(function () {
  var G = global.grindless || (global.grindless = {})
  var C4 = G.opvCensusIvReg || (G.opvCensusIvReg = {})

  C4.materials = {
    thawed_chain_nickel: { form: 'dust', colour: 0xB4C8A0, formula: 'Ni' },
    nickel_64: { form: 'dust', colour: 0x9CD49C, formula: '64Ni' },
    element_124_recoil_gas: { form: 'gas', colour: 0xD8A0E8, formula: '124*' },
    element_126_recoil_gas: { form: 'gas', colour: 0xA8B0F8, formula: '126*' }
  }

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(C4.materials).forEach(function (name) {
      var spec = C4.materials[name]
      var material = event.create(name)
      if (spec.form === 'gas') material.gas()
      else material.dust()
      material.color(spec.colour).formula(spec.formula)
      if (spec.form === 'gas') material.radioactiveHazard(1)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
