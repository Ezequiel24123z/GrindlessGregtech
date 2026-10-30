// priority: -10833
// -----------------------------------------------------------------------------------------------
// UXV foundation (package UXV-F1, docs/eras/uxv.md "Build order", F1): the shared registrations the UXV packages build on. No machine of
// our own, no recipe type, no worldgen, no dimension and no recipe. Every other UXV package uses exactly these ids; they are published in
// global.grindless.uxvFoundation. The load order is stamped by the integrator in tools/analysis/script_order.json (uxv.md, File order).
//
//   The UXV hull and the four hatches (2 A and 16 A, input and output) are GTM's gtceu:uxv_* ids (highTierContent on, TP-S0F). They are NOT created here. Their recipes are B4's (server_scripts/grindless/uxv/foundation.js). gtceu:uxv_machine_casing is GTM's.
//
//   Components (grindless:, Monifactory's Post_UV_Components.js pattern, LGPL, credited): uxv_sensor (A6), uxv_electric_motor,
//     uxv_electric_pump, uxv_electric_piston, uxv_conveyor_module, uxv_robot_arm (A8), uxv_field_generator (B3), uxv_emitter (B5).
//   Items made by one package and used by another (docs/eras/uxv.md F1): spintronics, lines 44-49, superheavy, parts, far products, data.
//   Blocks (grindless:): uxv_fusion_casing (S0-4, the Mk6 ring).
//   Materials: the gtceu: ones are GT materials (S0-1: every element they need exists; S0-8: pasta_strand is a 4 A cable at V[UXV]); the
//     fluids keep the grindless: namespace like UIV's plasmas and fuels. Not registered here, they exist already: gtceu:curium_248
//     (uev/foundation.js), grindless:cage_part (uiv/foundation.js), grindless:es254_target and grindless:polar_cap_electrode
//     (uiv/rx_j1856.js), grindless:nv_diamond_chip (zpm/qubits.js).
//   Not here: uxv_smes_cell (W), each machine's own intermediates (its package). volatile_condensate is a fluid (the design's recipe gives
//     100 mB of it), the other three condensates are items.
//
// Textures: tools/assets/Build-UXVFoundationTextures.ps1. Names: client_scripts/grindless/uxv_foundation_lang.js.
(function () {
  const G = global.grindless
  const UXVF = G.uxvFoundation || (G.uxvFoundation = {})
  const UXV = 12

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    uxv_electric_motor: { stack: 64 },
    uxv_electric_pump: { stack: 64 },
    uxv_conveyor_module: { stack: 64 },
    uxv_electric_piston: { stack: 64 },
    uxv_robot_arm: { stack: 64 },
    uxv_sensor: { stack: 64 },
    uxv_emitter: { stack: 64 },
    uxv_field_generator: { stack: 64 },
    cofeb_target: { stack: 16 },
    mgo_target: { stack: 16 },
    heusler_target: { stack: 16 },
    saf_target_set: { stack: 16 },
    ta_seed_target: { stack: 16 },
    srruo3_target: { stack: 16 },
    la_bfo_target: { stack: 16 },
    cofeb_ingot: { stack: 64 },
    heusler_ingot: { stack: 64 },
    terfenol_d_ingot: { stack: 64 },
    ni_mn_ga_ingot: { stack: 64 },
    ta_foil: { stack: 64 },
    pt_sheet: { stack: 64 },
    dysco3_substrate: { stack: 64 },
    ggg_wafer: { stack: 64 },
    hbn_crystal: { stack: 64 },
    wte2_crystal: { stack: 64 },
    fgt_crystal: { stack: 64 },
    mtj_stack_wafer: { stack: 64 },
    mram_stack_wafer: { stack: 64 },
    saf_track_wafer: { stack: 64 },
    mtj_die: { stack: 64 },
    mram_wafer: { stack: 64 },
    srruo3_electrode_wafer: { stack: 64 },
    me_switch_wafer: { stack: 64 },
    sot_readout_stack: { stack: 64 },
    meso_logic_die: { stack: 64 },
    racetrack_chip: { stack: 64 },
    magnonic_bus: { stack: 64 },
    sin_membrane: { stack: 64 },
    nanoaperture_array: { stack: 64 },
    rf_carpet_board: { stack: 64 },
    kr_f2_premix: { stack: 16 },
    krf_excimer_laser: { stack: 16 },
    pt_lpe_crucible: { stack: 16 },
    gas_stopping_cell: { stack: 16 },
    shequid_gyro: { stack: 16 },
    stno_stack_wafer: { stack: 64 },
    stno_array: { stack: 64 },
    gum_metal_billet: { stack: 64 },
    gum_metal_blank: { stack: 16 },
    gum_metal_flexspline: { stack: 16 },
    uxv_strain_wave_gear: { stack: 16 },
    encoder_ring: { stack: 64 },
    multipole_encoder_ring: { stack: 64 },
    tmr_encoder: { stack: 64 },
    ga2o3_wafer: { stack: 64 },
    ga2o3_power_die: { stack: 64 },
    mu_metal_foil: { stack: 64 },
    shielded_interposer: { stack: 64 },
    finemet_ribbon: { stack: 64 },
    finemet_toroid: { stack: 64 },
    finemet_core: { stack: 64 },
    uxv_voltage_coil: { stack: 64 },
    fm257_target: { stack: 16 },
    cm248_target: { stack: 16 },
    element_121_recoil: { stack: 16 },
    element_122_recoil: { stack: 16 },
    superheavy_census_iii: { stack: 16 },
    spent_actinide_target: { stack: 16 },
    u238_ion_source: { stack: 16 },
    u238_beam_charge: { stack: 16 },
    island_nuclide: { stack: 16 },
    island_chart: { stack: 16 },
    tetrataenite_lamination: { stack: 64 },
    tetrataenite_rotor: { stack: 64 },
    strand_stator: { stack: 64 },
    strand_tape: { stack: 64 },
    alip_duct: { stack: 64 },
    w184_cvi_preform: { stack: 64 },
    terfenol_d_rod: { stack: 64 },
    ni_mn_ga_crystal: { stack: 64 },
    cnt_bumper_weave: { stack: 64 },
    cnt_whipple_shield: { stack: 64 },
    frc_cartridge: { stack: 16 },
    gamma_laser_module: { stack: 16 },
    positron_stack: { stack: 16 },
    ti44_core: { stack: 16 },
    si28_ash: { stack: 64 },
    raw_pasta: { stack: 16 },
    spaghetti_phase: { stack: 16 },
    lasagna_phase: { stack: 16 },
    gnocchi_fragment: { stack: 16 },
    anti_phase_residue: { stack: 16 },
    lasagna_plate: { stack: 64 },
    pasta_core_sample: { stack: 16 },
    ejecta_knot_dust: { stack: 64 },
    refractory_condensate: { stack: 64 },
    metal_condensate: { stack: 64 },
    silicate_condensate: { stack: 64 },
    vela_glitch_timing: { stack: 16 },
    vela_glitch_record: { stack: 16 },
    cygnus_vlbi_record: { stack: 16 },
    elevator_log: { stack: 16 },
    ti44_map: { stack: 16 },
    arm_chart: { stack: 16 },
    bulge_chart: { stack: 16 },
    pasta_strand_repeater: { stack: 16 }
  }

  const BLOCKS = {
    uxv_fusion_casing: { texture: 'grindless:block/uxv/uxv_fusion_casing' }
  }

  // material key (with its namespace) -> form, colour and formula. cable: a 4 A wire at V[UXV] with no loss; wire: a plain EV wire (the CVI
  // preform's fibre, line 38)
  const MATERIALS = {
    'gtceu:pasta_strand': { form: 'ingot', colour: 0xF0D890, formula: 'Pa(str)', cable: true },
    'gtceu:titanium_44': { form: 'dust', colour: 0xB4B8C8, formula: '44Ti' },
    'gtceu:fermium_257': { form: 'dust', colour: 0xC8A0B8, formula: '257Fm' },
    'gtceu:tungsten_184': { form: 'ingot', colour: 0x4A4E5C, formula: '184W', wire: true },
    'gtceu:oxygen_16': { form: 'gas', colour: 0xA8D8F0, formula: '16O' },
    'gtceu:cofeb': { form: 'ingot', colour: 0x7A88A8, formula: 'CoFeB' },
    'gtceu:co2mnsi': { form: 'ingot', colour: 0xA89878, formula: 'Co2MnSi' },
    'gtceu:terfenol_d': { form: 'ingot', colour: 0x9A8E7A, formula: 'Tb0.3Dy0.7Fe2' },
    'gtceu:ni2mnga': { form: 'ingot', colour: 0xB0B8A0, formula: 'Ni2MnGa' },
    'gtceu:dysco3': { form: 'dust', colour: 0xE8E0D0, formula: 'DyScO3' },
    'gtceu:srruo3': { form: 'dust', colour: 0x3A3238, formula: 'SrRuO3' },
    'gtceu:la_bfo': { form: 'dust', colour: 0xC87858, formula: 'La:BiFeO3' },
    'gtceu:ggg': { form: 'dust', colour: 0xD8E4C8, formula: 'Gd3Ga5O12' },
    'gtceu:yig': { form: 'dust', colour: 0x78B890, formula: 'Y3Fe5O12' },
    'gtceu:hbn': { form: 'dust', colour: 0xF0F0F8, formula: 'BN(hex)' },
    'gtceu:wte2': { form: 'dust', colour: 0x58606E, formula: 'WTe2' },
    'gtceu:fe3gete2': { form: 'dust', colour: 0x6E5A58, formula: 'Fe3GeTe2' },
    'grindless:stellar_plasma': { form: 'gas', colour: 0xFFD060, formula: 'H/He(+)' },
    'grindless:disk_plasma': { form: 'gas', colour: 0xE8A050, formula: 'H/He/C(+)' },
    'grindless:filtered_disk_plasma': { form: 'gas', colour: 0xF0C878, formula: 'H/He(+)' },
    'grindless:flux_loaded_plasma': { form: 'gas', colour: 0x78C0FF, formula: 'H/He(+)B' },
    'grindless:stellar_hydrogen_cut': { form: 'gas', colour: 0xC8D8F8, formula: 'H' },
    'grindless:stellar_helium_cut': { form: 'gas', colour: 0xF8E8A0, formula: 'He' },
    'grindless:stellar_cno_cut': { form: 'gas', colour: 0x98C8B8, formula: 'C/N/O' },
    'grindless:stellar_heavy_cut': { form: 'gas', colour: 0xB8A8A0, formula: 'Ne/Mg/Si/Fe' },
    'grindless:triple_alpha_fuel': { form: 'gas', colour: 0xF0A860, formula: '(4He)3' },
    'grindless:carbon_burning_fuel': { form: 'gas', colour: 0xD08860, formula: '(12C)(12C)' },
    'grindless:oxygen_burning_fuel': { form: 'gas', colour: 0x88B8E0, formula: '(16O)(16O)' },
    'grindless:cno_ash_plasma': { form: 'gas', colour: 0x80D0B0, formula: '14N(+)' },
    'grindless:helium_burning_ash_plasma': { form: 'gas', colour: 0xE8C068, formula: '12C/16O(+)' },
    'grindless:carbon_burning_ash_plasma': { form: 'gas', colour: 0xD87848, formula: 'Ne/Na/Mg(+)' },
    'grindless:oxygen_burning_ash_plasma': { form: 'gas', colour: 0x6898E0, formula: 'Si/S/P(+)' },
    'grindless:lpe_flux': { form: 'liquid', colour: 0xD8C070, formula: 'PbO/B2O3' },
    'grindless:he_6n': { form: 'gas', colour: 0xE8F4FF, formula: 'He(6N)' },
    'grindless:mnt_product_gas': { form: 'gas', colour: 0xC8B8E0, formula: 'MNT' },
    'grindless:finemet_melt': { form: 'liquid', colour: 0xA8A8B8, formula: 'FeSiBNbCu' },
    'grindless:volatile_condensate': { form: 'gas', colour: 0xB0C8A8, formula: 'CH4/NH3/H2O' }
  }

  UXVF.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  UXVF.blocks = Object.keys(BLOCKS).map(function (name) { return 'grindless:' + name })
  UXVF.materials = Object.keys(MATERIALS)
  // the hull and hatches are GTM's (highTierContent on, TP-S0F)
  UXVF.machines = ['machine_hull', 'energy_input_hatch', 'energy_input_hatch_16a', 'energy_output_hatch', 'energy_output_hatch_16a']
    .map(function (name) { return 'gtceu:uxv_' + name })

  // every id by camelCase name, as the other UXV packages read them (ids.uxvRobotArm, ids.pastaStrand...)
  UXVF.ids = {}
  function camel(name) { return name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() }) }
  Object.keys(ITEMS).concat(Object.keys(BLOCKS)).forEach(function (name) { UXVF.ids[camel(name)] = 'grindless:' + name })
  Object.keys(MATERIALS).forEach(function (key) { UXVF.ids[camel(key.slice(key.indexOf(':') + 1))] = key })

  function tooltips(item, name) {
    item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
  }

  StartupEvents.registry('block', function (event) {
    Object.keys(BLOCKS).forEach(function (name) {
      event.create('grindless:' + name)
        .stoneSoundType()
        .hardness(5)
        .resistance(6)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .textureAll(BLOCKS[name].texture)
        .item(function (item) { tooltips(item, name) })
    })
  })

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
      else if (spec.form === 'liquid') material.liquid()
      else if (spec.form === 'ingot') material.ingot().iconSet(GTMaterialIconSet.METALLIC)
      else material.dust()
      material.color(spec.colour).formula(spec.formula)
      // the strand is a 4 A wire at V[UXV] with no loss and no superconductor flag (S0-8)
      if (spec.cable) material.cableProperties(GTValues.V[UXV], 4, 0, false)
      if (spec.wire) material.cableProperties(GTValues.V[GTValues.EV], 2, 2, false)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
