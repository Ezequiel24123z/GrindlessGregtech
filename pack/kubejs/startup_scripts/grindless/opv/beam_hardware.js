// priority: -6600
// -----------------------------------------------------------------------------------------------
// OpV beam hardware (package OpV-D1, docs/eras/opv.md "D1" and process lines 20-25): the intermediates of the antiproton source's
// beam hardware. No machine, no recipe type and no recipe here; the recipes are server_scripts/grindless/opv/beam_hardware.js and the
// rows D1 adds to the older machines' tables and scripts.
//
//   The six products (be_beam_window, ir_spallation_target, li6_hydride_shield, electron_cooler, stochastic_cooling_pickup and the
//   neg_xhv_casing block) and spent_ir_target are F1's (opv/foundation.js): read, never created here.
//   Not registered here: grindless:spent_li6_shield (B3's spent shield, line 22); the rows that take it skip themselves until B3 registers
//   it. The pickup array (EB c31) takes A2's grindless:nbtin_film_wafer (opv/circuits.js, line 24's NbTiN film).
//   Material: grindless:bred_tritium_gas, the gas a spent shield gives off when it is baked (tritium, its helium-3 and the helium-4 of
//     the Li-6(n,alpha) reaction); GTM registers its fluid as gtceu:bred_tritium_gas.
//
// Textures: tools/assets/Build-OpVBeamHardwareTextures.ps1. Names: client_scripts/grindless/opv_beam_hardware_lang.js.
(function () {
  const G = global.grindless || (global.grindless = {})
  const OPVB = G.opvBeamHardware || (G.opvBeamHardware = {})

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    // line 20: the beryllium beam window
    be_fluoride_dust: { stack: 64 },
    eb_beryllium_ingot: { stack: 64 },
    be_window_foil: { stack: 64 },
    brazed_be_window: { stack: 16 },
    be_window_scrap: { stack: 64 },
    // line 21: the iridium spallation target and its recovery
    ir_target_rod: { stack: 64 },
    ta_clad_ir_rod: { stack: 64 },
    decladded_ir_core: { stack: 16 },
    ir_spallation_residue: { stack: 64 },
    // line 22: the lithium-6 hydride shield
    li6h_tile: { stack: 64 },
    canned_li6h_block: { stack: 16 },
    // line 23: the electron cooler
    ceb6_powder: { stack: 64 },
    ceb6_boule: { stack: 16 },
    ceb6_cathode: { stack: 64 },
    cooler_electron_gun: { stack: 16 },
    // line 24: the stochastic cooling pickup
    pickup_array: { stack: 16 },
    brazed_pickup_tank: { stack: 16 },
    // line 25: the NEG casing
    tizrv_ingot: { stack: 64 },
    tizrv_target: { stack: 16 },
    neg_coated_chamber: { stack: 64 },
    activated_neg_chamber: { stack: 64 },
    spent_neg_chamber: { stack: 64 }
  }

  // material key (with its namespace) -> form, colour and formula
  const MATERIALS = {
    'grindless:bred_tritium_gas': { form: 'gas', colour: 0xB8F0C8, formula: 'T2(3He)(4He)' }
  }

  OPVB.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  OPVB.materials = Object.keys(MATERIALS)
  OPVB.fluids = ['gtceu:bred_tritium_gas']
  // other packages' ids this package's rows read (the rows skip themselves while one is missing)
  OPVB.pending = { 'grindless:spent_li6_shield': 'B3' }

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
      material.gas()
      material.color(spec.colour).formula(spec.formula)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
