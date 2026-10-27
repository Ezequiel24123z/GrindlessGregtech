// -----------------------------------------------------------------------------------------------
// UHV foundation (package UHV-F1, docs/eras/uhv.md "Build order", F1): the shared registrations the UHV packages build on. No machines,
// no recipe types, no recipes, no planets, orbits, dimensions or station items (B1 owns them), no wireless hatches, covers or cell (the
// UHV cell, grindless:uhv_smes_cell, is a block of the wireless table, UHV-A9), no ICAN motor (grindless:ican_rocket_motor is a GCYR
// tier 6 RocketMotorBlock that A8 registers with createCustom, S0-2) and no UHV components or parallel hatch (S0-1: none exist, and
// the controllers use UV components, uhv.md:230). Every other UHV package uses exactly these ids; they are published in
// global.grindless.uhvFoundation.
//
//   Items (grindless:), names in client_scripts/grindless/uhv_foundation_lang.js; package that makes each one -> packages that read it:
//     berkelium_249, californium_252                    A1 transuranium facility (2) -> the UEV reserve; A1 HFIR c3
//     californium_252_source                            A1 HFIR c3 -> B5 cold-trap drill (29)
//     thorium_229                                       A1 transuranium facility c3 -> A2 crystal growth furnace c3
//     nickel_62_target, nickel_63_target                A1 hot cell row and HFIR c2 -> A3 betavoltaic fab (9)
//     hfir_driver_element, spent_hfir_driver_element    A1 fuel fabrication and pyroprocessing rows, HFIR (1)
//     transcurium_target, irradiated_transcurium_target A1 HFIR (1) and transuranium facility (2)
//     nuclear_clock                                     A2 nuclear clock lab (3) -> A6 Casimir array, A9 the UHV link, B7 warp gate
//     lithium_niobate_boule, lithium_niobate_wafer      A2 crystal growth furnace (4) -> A4 photonic foundry c1
//     vuv_caf2_boule, thorium_caf2_crystal              A2 crystal growth furnace (4) -> nuclear clock lab
//     eu_yso_boule                                      A2 crystal growth furnace c4 -> A4 photonic foundry c3
//     inp_boule, inp_wafer                              A2 crystal growth furnace c5 -> A4 MBE reactor c1 (GTM's InP dust is not re-registered)
//     quantum_cascade_laser, thin_film_ln_modulator     A4 MBE reactor (5), photonic foundry (6) -> A4 c4, B7 gate and astrometer
//     sic_power_module, sic_mirror_blank                A5 SiC device fab (7) -> A5 arrays, A8 ICAN motor, B3 segments, B7 astrometer
//     nbn_coated_sic_plate                              A5 MOCVD row -> A6 Casimir array c1
//     imm_solar_array, red_tuned_solar_array            A5 solar array fab (8) -> B3 swarm segments, B5 Proxima solar field
//     betavoltaic_cell                                  A3 betavoltaic fab (9) -> B3 segments and solar probe, B4 rover
//     c12_diamond_spreader                              A3 diamond lattice fab c6 -> B3 segment foundry
//     positron_cartridge, antihydrogen_cartridge        A6 positron accumulator (13), antimatter trap row
//     exotic_matter_cell                                A6 Casimir array (17) -> B7 warp gate
//     zblan_fibre                                       A10 ZBLAN draw tower (19) -> B7 gate and astrometer
//     pbo_fibre, tether_ribbon_segment, tether_climber  A7 PBO plant (14), tether ribbon works (15) -> GTCA's space elevator
//     uhtc_tile, uhtc_nozzle                            A8 spark plasma sinterer (16) -> A8 ICAN motor row, B3 solar probe
//     organoid_processor                                B6 organoid array (11)
//     proxima_flora_sample, proxima_regolith_survey     B4 xenoflora rover bay (26) -> B4 sample receiving and greenhouse, B5 drill
//     characterised_xeno_strain, xeno_genome_data       B4 sample receiving facility (12) -> greenhouse, biofoundry rows
//     proxima_ice_core, cold_trap_regolith              B5 cold-trap drill (29) -> B4 sample receiving c3, B5 heap and heavy water rows
//     chitosan_scaffold, xeno_radioprotectant           B4 xenobiochemistry plant (28) -> B6 organoid array and organoid lab row
//     infrared_pigment                                  B4 xenobiochemistry plant c2 -> B7 astrometer coatings
//     aluminium_reflector_film                          B3 light sail fab row -> B3 segment foundry
//     swarm_segment, worn_swarm_segment                 B3 segment foundry (22) <-> swarm control station (23)
//     coronal_field_map                                 B3 solar probe bay (24) -> swarm control station c2
//     stellar_neighbourhood_chart, proxima_gate_seed    B7 baseline astrometer (25) and the AE2 seed -> gate, UEV casing research
//   Materials (GT materials, gtceu: ids as UV's and ZPM's, DECISIONS UV-F1; uhv.md writes the water and the two liquors with grindless:):
//     dusts: zirconia (A8 c1, A10 ZrF4), zirconium_diboride (A8 line 26), niobium_oxide (A2 c1), lead_fluoride (A2 c2)
//     fluids: ultrapure_water (A3 -> A2, A4, A5, B6), proxima_pgm_liquor and proxima_ree_liquor (B5), sterilised_growth_medium (B6),
//             hdehp_solvent (A1 line 25), pbo_dope (A7), oganesson_propellant (B3 line 30), deuterium_enriched_water (B5 line 18)
//   Blocks (grindless:), the shared casings of uhv.md "Our multiblocks":
//     bsl4_casing (12, 27, 28), warp_gate_casing (18, both ends), hangar_casing (24, 26). GTM's uhv_machine_casing serves (S0-1).
//
//   Not here: GTM's californium, oganesson, thorium, nickel and InP dust, GTCA's silicon carbide, our curium and uranium_233; the
//   intermediates one package makes and uses alone (vuv_frequency_comb, quantum_memory_chip, casimir_cavity_stack, tantalum_carbide_liner,
//   solar_probe, proxima_rover, xeno_biomass, xeno_mushroom, far_red_pigment, melanised_biomass, mercury_regolith, biocemented_regolith...).
//   Every id has no recipe until its package lands: tools/analysis/emi-coverage.mjs lists them as expected-unobtained.
//
// Textures: tools/assets/Build-UHVFoundationTextures.ps1.
(function () {
  const G = global.grindless
  const UHVF = G.uhvFoundation || (G.uhvFoundation = {})

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    berkelium_249: { stack: 16 },
    californium_252: { stack: 16 },
    californium_252_source: { stack: 16 },
    thorium_229: { stack: 16 },
    nickel_62_target: { stack: 16 },
    nickel_63_target: { stack: 16 },
    hfir_driver_element: { stack: 16 },
    spent_hfir_driver_element: { stack: 16 },
    transcurium_target: { stack: 16 },
    irradiated_transcurium_target: { stack: 16 },
    nuclear_clock: { stack: 16 },
    lithium_niobate_boule: { stack: 16 },
    lithium_niobate_wafer: { stack: 64 },
    vuv_caf2_boule: { stack: 16 },
    thorium_caf2_crystal: { stack: 16 },
    eu_yso_boule: { stack: 16 },
    inp_boule: { stack: 16 },
    inp_wafer: { stack: 64 },
    quantum_cascade_laser: { stack: 64 },
    thin_film_ln_modulator: { stack: 64 },
    sic_power_module: { stack: 64 },
    sic_mirror_blank: { stack: 16 },
    nbn_coated_sic_plate: { stack: 16 },
    imm_solar_array: { stack: 16 },
    red_tuned_solar_array: { stack: 16 },
    betavoltaic_cell: { stack: 64 },
    c12_diamond_spreader: { stack: 64 },
    positron_cartridge: { stack: 16 },
    antihydrogen_cartridge: { stack: 16 },
    exotic_matter_cell: { stack: 16 },
    zblan_fibre: { stack: 64 },
    pbo_fibre: { stack: 64 },
    tether_ribbon_segment: { stack: 16 },
    tether_climber: { stack: 16 },
    uhtc_tile: { stack: 64 },
    uhtc_nozzle: { stack: 16 },
    organoid_processor: { stack: 64 },
    proxima_flora_sample: { stack: 16 },
    proxima_regolith_survey: { stack: 16 },
    characterised_xeno_strain: { stack: 16 },
    xeno_genome_data: { stack: 16 },
    proxima_ice_core: { stack: 16 },
    cold_trap_regolith: { stack: 64 },
    chitosan_scaffold: { stack: 64 },
    xeno_radioprotectant: { stack: 64 },
    infrared_pigment: { stack: 64 },
    aluminium_reflector_film: { stack: 64 },
    swarm_segment: { stack: 16 },
    worn_swarm_segment: { stack: 16 },
    coronal_field_map: { stack: 16 },
    stellar_neighbourhood_chart: { stack: 16 },
    proxima_gate_seed: { stack: 16 }
  }

  const BLOCKS = {
    bsl4_casing: { texture: 'grindless:block/uhv/bsl4_casing' },
    warp_gate_casing: { texture: 'grindless:block/uhv/warp_gate_casing' },
    hangar_casing: { texture: 'grindless:block/uhv/hangar_casing' }
  }

  // GT material name -> form, colour and formula; GTM colours the dusts and buckets the fluids
  const MATERIALS = {
    zirconia: { form: 'dust', colour: 0xE8E2D0, formula: 'ZrO2' },
    zirconium_diboride: { form: 'dust', colour: 0x707684, formula: 'ZrB2' },
    niobium_oxide: { form: 'dust', colour: 0xE2DCB8, formula: 'Nb2O5' },
    lead_fluoride: { form: 'dust', colour: 0xD4D4E6, formula: 'PbF2' },
    ultrapure_water: { form: 'liquid', colour: 0xD6F2FF, formula: 'H2O' },
    proxima_pgm_liquor: { form: 'liquid', colour: 0x8E7040, formula: '(Pt)(Ir)(Ru)(H2O)' },
    proxima_ree_liquor: { form: 'liquid', colour: 0xB49CC8, formula: '(Nd)(Y)(Ce)(H2O)' },
    sterilised_growth_medium: { form: 'liquid', colour: 0xE6D48A, formula: '(C6H12O6)(H2O)' },
    hdehp_solvent: { form: 'liquid', colour: 0xD6C474, formula: '(C16H35O4P)(C12H26)' },
    pbo_dope: { form: 'liquid', colour: 0xC8962E, formula: '(C14H6N2O2)n(H3PO4)' },
    oganesson_propellant: { form: 'gas', colour: 0x8A4A9A, formula: 'Og' },
    deuterium_enriched_water: { form: 'liquid', colour: 0xB8D8F0, formula: '(H2O)(HDO)' }
  }

  UHVF.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  UHVF.blocks = Object.keys(BLOCKS).map(function (name) { return 'grindless:' + name })
  UHVF.materials = Object.keys(MATERIALS).map(function (name) { return 'gtceu:' + name })

  // every id by camelCase name, as the other UHV packages read them (ids.nuclearClock, ids.ultrapureWater...)
  UHVF.ids = {}
  Object.keys(ITEMS).concat(Object.keys(BLOCKS), Object.keys(MATERIALS)).forEach(function (name) {
    var key = name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() })
    UHVF.ids[key] = (MATERIALS[name] ? 'gtceu:' : 'grindless:') + name
  })

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
    Object.keys(MATERIALS).forEach(function (name) {
      var spec = MATERIALS[name]
      var material = event.create(name)
      if (spec.form === 'gas') material.gas()
      else if (spec.form === 'liquid') material.liquid()
      else material.dust()
      material.color(spec.colour).formula(spec.formula)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
