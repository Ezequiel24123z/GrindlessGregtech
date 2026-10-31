// priority: -6775
// -----------------------------------------------------------------------------------------------
// OpV foundation (package OpV-F1, docs/eras/opv.md "Build order", F1): the shared registrations the OpV packages build on. No machine of
// our own, no recipe type, no worldgen, no dimension and no recipe. Every other OpV package uses exactly these ids; they are published in
// global.grindless.opvFoundation. The load order is stamped by the integrator in tools/analysis/script_order.json.
//
//   GTM's highTierContent is on (TP-S0F): GTM registers every gtceu:opv_* id (the 8 components, the hull, the energy hatches, the buses
//     and hatches and the basic machines, OpV-S0-1) and every gtceu:max_* id. None of them is created here; tables/opv_ids.json lists
//     them. There is no gtceu:opv_parallel_hatch in GTM: M1 registers it through lib/parallel_hatch.js.
//   Items made by one package and used by another (docs/eras/opv.md F1): the relay seed, chain matter parts, crystals, wafers and dies,
//     gamma optics, the antiproton beam line, antimatter cells, exotic matter, the Terzan 5 probe economy and the era's data items.
//   Blocks (grindless:): field_frozen_casing, annihilation_shield_casing, neg_xhv_casing.
//   Materials: gtceu:chain_strand is a GT material with an ingot, a wire and a single cable, 16 A at V[OpV] with no loss (S0-7); the
//     three fluids keep the grindless: namespace like UXV's plasmas.
//   Not registered here: grindless:si28_soi_wafer exists already (uiv/tfln_femtosecond.js); grindless:opv_smes_cell is W's; each
//     machine's own intermediates are its package's. The places are opv/travel.js's.
//
// Textures: tools/assets/Build-OpVFoundationTextures.ps1. Names: client_scripts/grindless/opv_foundation_lang.js.
(function () {
  const G = global.grindless || (global.grindless = {})
  const OPVF = G.opvFoundation || (G.opvFoundation = {})
  const OPV = 13

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    // the c11 jump to SGR 1806-20 (A0)
    bulge_relay_seed: { stack: 1 },
    launched_bulge_seed: { stack: 1 },
    // chain matter and the component parts
    chain_lamina_stack: { stack: 64 },
    ni_chain_slab: { stack: 16 },
    chain_field_coil: { stack: 64 },
    chain_composite_rod: { stack: 64 },
    chain_composite_rotor: { stack: 64 },
    superfluid_he3_seal: { stack: 64 },
    chain_mesh_belt: { stack: 64 },
    opv_harmonic_drive: { stack: 64 },
    // crystals, wafers and dies
    th229_lasing_crystal: { stack: 16 },
    hpge_compton_crystal: { stack: 16 },
    inas_al_wafer: { stack: 64 },
    gated_2deg_wafer: { stack: 64 },
    tetron_die: { stack: 64 },
    cryo_cmos_die: { stack: 64 },
    nb_tsv_interposer: { stack: 64 },
    cryo_optical_link: { stack: 64 },
    hemt_amplifier: { stack: 64 },
    gan_mmic: { stack: 64 },
    sdd_die: { stack: 64 },
    field_frozen_plate: { stack: 64 },
    aln_power_die: { stack: 64 },
    tetron_array: { stack: 16 },
    // gamma optics and the antiproton beam line
    gamma_multilayer_mirror: { stack: 16 },
    laue_lens: { stack: 16 },
    be_beam_window: { stack: 16 },
    ir_spallation_target: { stack: 16 },
    spent_ir_target: { stack: 16 },
    li6_hydride_shield: { stack: 16 },
    electron_cooler: { stack: 16 },
    stochastic_cooling_pickup: { stack: 16 },
    pb208_beam_cell: { stack: 16 },
    // antimatter
    octupole_trap_magnet: { stack: 16 },
    levitation_trap_cell: { stack: 16 },
    lyman_alpha_laser: { stack: 16 },
    gamma_absorber_tile: { stack: 64 },
    tpv_panel: { stack: 64 },
    acmf_pellet: { stack: 16 },
    seed_positron_plasma: { stack: 16 },
    dense_positron_cell: { stack: 16 },
    cold_antiproton_cell: { stack: 16 },
    antiproton_stack_opv: { stack: 16 },
    antihydrogen_ice_cell: { stack: 16 },
    // exotic matter and the hole
    strangelet_seed: { stack: 16 },
    stable_exotic_matter: { stack: 16 },
    kugelblitz_core: { stack: 16 },
    hawking_drive: { stack: 16 },
    // Terzan 5: navigation, power, debris and the probe economy
    xnav_unit: { stack: 16 },
    node_power_transmitter: { stack: 16 },
    bulge_debris: { stack: 64 },
    metal_feedstock: { stack: 64 },
    silicate_debris_fraction: { stack: 64 },
    si_alloy_powder: { stack: 64 },
    cluster_sinter_casing: { stack: 64 },
    collector_node: { stack: 16 },
    spent_collector_node: { stack: 16 },
    deployed_node_pack: { stack: 16 },
    probe_seed: { stack: 16 },
    vitamin_kit: { stack: 16 },
    // the c12 jump to Terzan 5 (R1)
    pathfinder_probe: { stack: 1 },
    launched_pathfinder: { stack: 1 },
    pathfinder_probe_core: { stack: 16 },
    // data, superheavies and links
    bulge_light_census: { stack: 16 },
    superheavy_census_iv: { stack: 16 },
    element_124_recoil: { stack: 16 },
    element_126_recoil: { stack: 16 },
    chain_strand_repeater: { stack: 16 },
    sgr_a_chart: { stack: 16 }
  }

  const BLOCKS = {
    field_frozen_casing: { texture: 'grindless:block/opv/field_frozen_casing' },
    annihilation_shield_casing: { texture: 'grindless:block/opv/annihilation_shield_casing' },
    neg_xhv_casing: { texture: 'grindless:block/opv/neg_xhv_casing' }
  }

  // material key (with its namespace) -> form, colour and formula. cable: a 16 A wire and cable at V[OpV] with no loss (S0-7)
  const MATERIALS = {
    'gtceu:chain_strand': { form: 'ingot', colour: 0x90A0D0, formula: 'Fe(chain)', cable: true },
    'grindless:superfluid_helium_3': { form: 'liquid', colour: 0xD8F0FF, formula: '3He(sf)' },
    'grindless:jet_proton_beam': { form: 'gas', colour: 0xFF9CB8, formula: 'p(+)' },
    'grindless:hot_pair_plasma': { form: 'gas', colour: 0xF4E4FF, formula: 'e(+)e(-)' }
  }

  OPVF.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  OPVF.blocks = Object.keys(BLOCKS).map(function (name) { return 'grindless:' + name })
  OPVF.materials = Object.keys(MATERIALS)
  // registered elsewhere: read, never created here
  OPVF.existing = ['grindless:si28_soi_wafer']

  // every id by camelCase name, as the other OpV packages read them (ids.tetronDie, ids.chainStrand...)
  OPVF.ids = {}
  function camel(name) { return name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() }) }
  Object.keys(ITEMS).concat(Object.keys(BLOCKS)).forEach(function (name) { OPVF.ids[camel(name)] = 'grindless:' + name })
  Object.keys(MATERIALS).forEach(function (key) { OPVF.ids[camel(key.slice(key.indexOf(':') + 1))] = key })
  OPVF.ids.si28SoiWafer = 'grindless:si28_soi_wafer'

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
      // the strand is a 16 A wire at V[OpV] with no loss and no superconductor flag (S0-7): 16 x 2^29 = 2^33 EU/t per run
      if (spec.cable) material.cableProperties(GTValues.V[OPV], 16, 0, false)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
