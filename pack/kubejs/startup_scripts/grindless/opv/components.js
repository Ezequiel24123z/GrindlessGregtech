// priority: -6741
// -----------------------------------------------------------------------------------------------
// OpV components (package OpV-A1, docs/eras/opv.md "A1. Components", lines 4-10): the intermediates of the seven component lines. The final
// parts (chain_field_coil, chain_composite_rod, chain_composite_rotor, superfluid_he3_seal, chain_mesh_belt, opv_harmonic_drive,
// th229_lasing_crystal, hpge_compton_crystal) and the fluid gtceu:superfluid_helium_3 are F1's (opv/foundation.js); the components
// themselves are GTM's gtceu:opv_* ids (highTierContent). No machine, no recipe type: every step runs on an older machine or GTM's
// assembler (server_scripts/grindless/opv/components.js and the older machines' rows, each marked OpV-A1).
//
//   line 4  SiC fibre -> chain_sic_preform (assembler) -> densified_chain_preform (CVI c6) -> rod and rotor (SPS c16, c17)
//   line 5  6N He-3 -> liquid_helium_3 (cryogenic plant) -> superfluid He-3 (cryostat c4) -> superleak_plug (cryostat c5) -> seal
//   line 6  chain_mesh_weave (A0, laminator c5) -> welded_mesh_belt + pbo_belt_trim (EB c21) -> chain_mesh_belt (He refrigerator, 4 K)
//   line 7  gum metal blank + lamina -> chain_flexspline_cup (megabar c7) -> toothed_flexspline_cup + gum_metal_swarf (femtosecond c5;
//           the swarf atomised back to gum metal blend) -> opv_harmonic_drive (SPS c10)
//   line 8  grindless:itbtc_coated_conductor + chain wire -> rebco_pancake (HTS works c7) -> potted_rebco_pancake (CVI c7, epoxy)
//           -> trained_rebco_pancake (HTS works c8) -> chain_field_coil (assembler)
//   line 9  Th-229 -> thorium_229_nitrate (hot cell c21) -> laser_grade_thf4 (fluorspar kiln) -> th_caf2_lasing_boule (crystal growth c19)
//           -> coated_th_caf2_crystal (MOCVD c20) -> th229_lasing_crystal (nuclear clock c4)
//   line 10 GeCl4 -> pure_germanium_tetrachloride (extraction cascade c23) -> thirteen_n_germanium (zone refiner c10) -> hpge_compton_boule
//           (crystal growth c20) -> contacted_hpge_crystal (ion implanter c15) -> hpge_compton_crystal (He refrigerator, 77 K)
//
// Textures: tools/assets/Build-OpVComponentsTextures.ps1. Names: client_scripts/grindless/opv_components_lang.js.
(function () {
  const G = global.grindless || (global.grindless = {})
  const OPVC = G.opvComponents || (G.opvComponents = {})

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    // line 4: the composite rod and rotor
    chain_sic_preform: { stack: 64 },
    densified_chain_preform: { stack: 64 },
    // line 5: the superfluid seal
    superleak_plug: { stack: 64 },
    // line 6: the mesh belt
    welded_mesh_belt: { stack: 64 },
    pbo_belt_trim: { stack: 64 },
    // line 7: the harmonic drive
    chain_flexspline_cup: { stack: 64 },
    toothed_flexspline_cup: { stack: 64 },
    gum_metal_swarf: { stack: 64 },
    // line 8: the field coil
    rebco_pancake: { stack: 64 },
    potted_rebco_pancake: { stack: 64 },
    trained_rebco_pancake: { stack: 64 },
    // line 9: the lasing crystal
    thorium_229_nitrate: { stack: 64 },
    laser_grade_thf4: { stack: 64 },
    th_caf2_lasing_boule: { stack: 64 },
    coated_th_caf2_crystal: { stack: 64 },
    // line 10: the Compton crystal
    thirteen_n_germanium: { stack: 64 },
    hpge_compton_boule: { stack: 64 },
    contacted_hpge_crystal: { stack: 64 }
  }

  // material key -> form, colour and formula (fluids: gtceu:<name>)
  const MATERIALS = {
    'grindless:liquid_helium_3': { form: 'liquid', colour: 0xC8E0FF, formula: '3He(l)' },
    'grindless:pure_germanium_tetrachloride': { form: 'liquid', colour: 0xD8E4D0, formula: 'GeCl4' }
  }

  OPVC.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  OPVC.materials = Object.keys(MATERIALS)

  function tooltips(item, name) {
    item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
      tooltips(item, name)
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(MATERIALS).forEach(function (key) {
      var spec = MATERIALS[key]
      var material = event.create(key)
      if (spec.form === 'gas') material.gas()
      else material.liquid()
      material.color(spec.colour).formula(spec.formula)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
