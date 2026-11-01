// priority: -5356
// -----------------------------------------------------------------------------------------------
// MAX foundation (package MAX-F1, docs/eras/max.md "Build order", F1): the shared registrations the MAX packages build on. No machine of
// our own, no recipe type, no worldgen and no recipe. Every other MAX package uses exactly these ids; they are published in
// global.grindless.maxFoundation. The load order is stamped by the integrator in tools/analysis/script_order.json.
//
//   GTM's highTierContent is on: GTM registers every gtceu:max_* id (the 29 hull, hatch and basic machine ids). None of them is created
//     here; tables/max_ids.json lists them. gtceu:max_machine_hull is GTM's own. grindless:max_parallel_hatch is M1's.
//   Items: the 9 MAX components (grindless:max_*), every intermediate and final product of the line tables L1-L46 (the lines of
//     docs/eras/max.md "Lines") and the items one package makes and another uses (maps, spent parts, scrap, the two place seeds).
//   Blocks (grindless:): the 7 casings and segments of the MAX multiblocks.
//   Materials: gtceu:horizon_strand is a GT material with an ingot, a wire and a single cable, 16 A at V[MAX] with a loss of 1 EU per
//     amp per block (S0-3: proven at 16 A x V[MAX] with loss 1; never lossless); the five fluids keep the grindless: namespace.
//   Not registered here: grindless:eu_yso_boule, grindless:mram_stack_wafer and grindless:hollow_core_fibre exist already. The places are
//     max/travel.js's.
//
// Textures: tools/assets/Build-MaxFoundationTextures.ps1. Names: client_scripts/grindless/max_foundation_lang.js.
(function () {
  const G = global.grindless || (global.grindless = {})
  const MAXF = G.maxFoundation || (G.maxFoundation = {})
  const MAXT = 14

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    max_electric_motor: { stack: 64 },
    max_electric_pump: { stack: 64 },
    max_electric_piston: { stack: 64 },
    max_robot_arm: { stack: 64 },
    max_emitter: { stack: 64 },
    max_fluid_regulator: { stack: 64 },
    max_conveyor_module: { stack: 64 },
    max_sensor: { stack: 64 },
    max_field_generator: { stack: 64 },
    sgr_a_spin_map: { stack: 16 },
    nsc_ephemeris: { stack: 16 },
    shell_gradient_map: { stack: 16 },
    final_spin_map: { stack: 16 },
    stream_bundle: { stack: 16 },
    spent_stream_pellet: { stack: 64 },
    spent_tether_segment: { stack: 16 },
    spent_wave_packet: { stack: 16 },
    spent_rydberg_array: { stack: 16 },
    spent_sr_cartridge: { stack: 16 },
    rb_getter_scrap: { stack: 64 },
    sis_scrap: { stack: 64 },
    spent_ferric_chloride: { stack: 64 },
    membrane_scrap: { stack: 64 },
    mirror_shell_scrap: { stack: 64 },
    gc_relay_probe: { stack: 1 },
    launched_gc_probe: { stack: 1 },
    nsc_belt_seed: { stack: 1 },
    launched_belt_seed: { stack: 1 },
    epilogue: { stack: 16 },
    horizon_strand_repeater: { stack: 16 },
    silicate_slag: { stack: 64 },
    iron_core_fragment: { stack: 64 },
    spent_collector_panel: { stack: 16 },
    spent_wolter_module: { stack: 16 },
    pgm_residue: { stack: 64 },
    exotic_cladding_foil: { stack: 64 },
    clad_chain_strand: { stack: 16 },
    horizon_strand_preform: { stack: 16 },
    pbo_braid_sleeve: { stack: 16 },
    graphene_hbn_film: { stack: 64 },
    pbo_carrier_web: { stack: 16 },
    buffered_pbo_web: { stack: 16 },
    rebco_on_pbo_web: { stack: 16 },
    pinned_rebco_web: { stack: 16 },
    superconducting_membrane: { stack: 16 },
    hafnia_powder: { stack: 64 },
    ultrapure_silica_target: { stack: 16 },
    hafnia_target: { stack: 16 },
    hfo2_sio2_stack: { stack: 16 },
    albedo_multilayer_panel: { stack: 16 },
    sr88_isotope: { stack: 16 },
    degenerate_sr_cartridge: { stack: 16 },
    atom_optics_modulator: { stack: 16 },
    shequid_rotation_ref: { stack: 16 },
    matter_wave_gradiometer: { stack: 16 },
    ppln_boule: { stack: 16 },
    ppln_thin_film_wafer: { stack: 64 },
    squeezer_waveguide_die: { stack: 64 },
    pump_laser_bonded_die: { stack: 64 },
    squeezed_light_chip: { stack: 16 },
    quartz_crystal_wafer: { stack: 64 },
    metalens_wafer: { stack: 64 },
    coated_metalens: { stack: 16 },
    tweezer_calibrated_lens: { stack: 16 },
    tweezer_array_die: { stack: 64 },
    aln_on_si_wafer: { stack: 64 },
    nb_coplanar_film: { stack: 64 },
    piezo_optomech_layer: { stack: 16 },
    transducer_wafer: { stack: 64 },
    cryo_photonic_interposer: { stack: 16 },
    power_diamond_plate: { stack: 64 },
    boron_delta_diamond: { stack: 16 },
    metallised_diamond: { stack: 16 },
    diamond_power_wafer: { stack: 64 },
    diamond_power_die: { stack: 64 },
    rebco_tape_max: { stack: 16 },
    stabilised_rebco_tape: { stack: 64 },
    cmc_coil_former: { stack: 16 },
    max_coil_winding: { stack: 16 },
    max_field_coil: { stack: 16 },
    sic_tow: { stack: 64 },
    sic_sic_preform: { stack: 16 },
    exotic_infiltrated_preform: { stack: 16 },
    exotic_composite_billet: { stack: 16 },
    balanced_composite_billet: { stack: 16 },
    exotic_composite_rod: { stack: 16 },
    exotic_composite_rotor: { stack: 16 },
    pbo_belt_web: { stack: 16 },
    primed_belt_web: { stack: 16 },
    refractory_wear_coat: { stack: 16 },
    cryo_conditioned_web: { stack: 16 },
    membrane_belt: { stack: 16 },
    synthetic_oligo_pool: { stack: 16 },
    organoid_genome_extract: { stack: 16 },
    ark_genome_set: { stack: 16 },
    xeno_genome_set: { stack: 16 },
    encapsulated_genome_library: { stack: 16 },
    genome_archive: { stack: 16 },
    metal_rich_bloom: { stack: 16 },
    carbonyl_fe_ni_powder: { stack: 64 },
    segment_alloy_ingot: { stack: 16 },
    segment_truss_billet: { stack: 16 },
    segment_truss: { stack: 16 },
    pellet_blank: { stack: 16 },
    dense_pellet: { stack: 16 },
    turned_pellet_core: { stack: 16 },
    sc_jacketed_pellet: { stack: 16 },
    stream_pellet: { stack: 16 },
    droplet_nozzle_plate: { stack: 64 },
    radiator_collector_shell: { stack: 16 },
    shell_droplet_radiator: { stack: 16 },
    retrieved_waste_mix: { stack: 16 },
    cooled_waste_mix: { stack: 16 },
    vitrified_waste_log: { stack: 16 },
    sealed_waste_log: { stack: 16 },
    geroch_canister: { stack: 16 },
    thorium_clock_reference: { stack: 16 },
    max_srf_cavity: { stack: 16 },
    polished_srf_cavity: { stack: 16 },
    cooled_cavity_mode: { stack: 16 },
    seed_wave_packet: { stack: 16 },
    rb87_isotope: { stack: 16 },
    rydberg_laser_die: { stack: 64 },
    atom_cartridge_rb87: { stack: 16 },
    rydberg_logic_array: { stack: 16 },
    strand_ribbon: { stack: 16 },
    proof_loaded_ribbon: { stack: 16 },
    exotic_coated_ribbon: { stack: 16 },
    cured_exotic_ribbon: { stack: 16 },
    horizon_tether: { stack: 16 },
    sic_mirror_tow: { stack: 64 },
    sic_dish_blank: { stack: 16 },
    figured_dish_blank: { stack: 16 },
    gold_coated_dish: { stack: 16 },
    imager_dish_panel: { stack: 16 },
    nb_alox_nb_trilayer: { stack: 16 },
    sis_junction_wafer: { stack: 64 },
    anodised_junction_wafer: { stack: 64 },
    sis_die: { stack: 64 },
    tested_sis_die: { stack: 64 },
    sis_mixer: { stack: 16 },
    eu_yso_slab: { stack: 16 },
    burned_memory_crystal: { stack: 16 },
    memory_fibre_pigtail: { stack: 16 },
    quantum_memory_node: { stack: 16 },
    degenerate_matter_slug: { stack: 16 },
    compressed_payload_core: { stack: 16 },
    turned_payload_core: { stack: 16 },
    payload_casing: { stack: 16 },
    max_penrose_payload: { stack: 16 },
    devolatilised_slag: { stack: 16 },
    ca_al_oxide_residue: { stack: 16 },
    slag_compact: { stack: 16 },
    slag_pellet: { stack: 16 },
    collector_diamond_plate: { stack: 64 },
    pin_diamond_plate: { stack: 64 },
    diamond_photocell: { stack: 16 },
    metallised_photocell: { stack: 16 },
    xuv_collector_panel: { stack: 16 },
    smes_buffered_tape: { stack: 64 },
    thick_rebco_tape: { stack: 64 },
    smes_toroid_winding: { stack: 16 },
    braced_smes_toroid: { stack: 16 },
    cold_smes_toroid: { stack: 16 },
    syn3_genome_cassettes: { stack: 16 },
    recipient_mycoplasma_culture: { stack: 16 },
    transplanted_minimal_cell: { stack: 16 },
    hardened_minimal_cell: { stack: 16 },
    vitrified_cell_capsule: { stack: 16 },
    nitride_film_wafer: { stack: 64 },
    microring_wafer: { stack: 64 },
    trimmed_microring: { stack: 16 },
    packaged_microcomb: { stack: 16 },
    clock_locked_microcomb: { stack: 16 },
    er_ho_oxide: { stack: 16 },
    er3ni_ingot: { stack: 16 },
    er3ni_spheres: { stack: 16 },
    charged_pulse_tube: { stack: 16 },
    shell_cryocooler: { stack: 16 },
    fe16n2_ring_magnet: { stack: 16 },
    bi_yig_film: { stack: 64 },
    yig_on_ln_wafer: { stack: 64 },
    isolator_waveguide_die: { stack: 64 },
    max_optical_isolator: { stack: 16 },
    ybco_precursor_powder: { stack: 64 },
    tsmg_ybco_bulk: { stack: 16 },
    irradiated_ybco_bulk: { stack: 16 },
    bearing_rotor_ring: { stack: 16 },
    sc_magnetic_bearing: { stack: 16 },
    silicon_cavity_spacer: { stack: 16 },
    algaas_bragg_stack: { stack: 16 },
    released_algaas_film: { stack: 64 },
    transferred_crystalline_mirror: { stack: 16 },
    cryo_reference_cavity: { stack: 16 },
    cathode_copper: { stack: 16 },
    rolled_cu_foil: { stack: 64 },
    cu111_foil: { stack: 64 },
    electropolished_cu111_foil: { stack: 64 },
    tb_dy_oxide: { stack: 16 },
    terfenol_ingot: { stack: 16 },
    oriented_terfenol_rod: { stack: 16 },
    laminated_terfenol_stack: { stack: 16 },
    hafnium_tantalum_oxide: { stack: 16 },
    ta_hf_c_powder: { stack: 64 },
    ta_hf_c_billet: { stack: 16 },
    sealed_hearth_liner: { stack: 16 },
    cryo_milled_core: { stack: 16 },
    tetrataenite_concentrate: { stack: 16 },
    cold_pressed_tetrataenite: { stack: 16 },
    halbach_segment_coupler: { stack: 16 },
    sic_substrate_wafer: { stack: 64 },
    sic_cmos_wafer: { stack: 64 },
    racetrack_memory_die: { stack: 64 },
    segment_controller: { stack: 16 },
    fcl_substrate_strip: { stack: 64 },
    fcl_tape: { stack: 64 },
    thick_film_fcl_tape: { stack: 64 },
    fcl_coil: { stack: 16 },
    cold_fcl_module: { stack: 16 },
    synthetic_silica_soot: { stack: 64 },
    ultrapure_silica_tube: { stack: 16 },
    endcapped_hc_fibre: { stack: 16 },
    uv_fibre_harness: { stack: 16 },
    silica_alcogel: { stack: 16 },
    silylated_alcogel: { stack: 16 },
    aerogel_superleak_plug: { stack: 16 },
    potted_superleak: { stack: 16 },
    calibrated_superleak: { stack: 16 },
    cold_tested_superleak: { stack: 16 },
    superfluid_valve: { stack: 16 },
    iridium_sponge: { stack: 64 },
    iridium_target: { stack: 16 },
    sic_grazing_shell: { stack: 16 },
    iridium_coated_shell: { stack: 16 },
    wolter_mirror_module: { stack: 16 },
    ultrapure_silica_plate: { stack: 64 },
    laser_welded_glass_cell: { stack: 16 },
    annealed_glass_cell: { stack: 16 },
    ar_coated_glass_cell: { stack: 16 },
    cold_qualified_cell: { stack: 16 },
    inp_utc_epi_wafer: { stack: 64 },
    utc_photodiode_wafer: { stack: 64 },
    passivated_utc_wafer: { stack: 64 },
    utc_die: { stack: 64 },
    photonic_lo_module: { stack: 16 },
    semi_insulating_inp_wafer: { stack: 64 },
    inp_hemt_epi: { stack: 16 },
    hemt_gate_wafer: { stack: 64 },
    hemt_die: { stack: 64 },
    cryo_tested_lna: { stack: 16 },
    cryo_lna_module: { stack: 16 },
    teo2_boule: { stack: 16 },
    teo2_aod_blank: { stack: 16 },
    ln_transducer_bonded_blank: { stack: 16 },
    electroded_aod: { stack: 16 },
    crossed_aod_pair: { stack: 16 },
    // RF-7A (MX-F1): lines L47-L57 and the items of machines 11-14 (docs/eras/max.md "Lines" and machines 11-14); ids only
    gr_platinum_sponge: { stack: 64 },
    au_pt_ingot: { stack: 16 },
    au_pt_test_mass: { stack: 16 },
    coated_test_mass: { stack: 16 },
    uv_led_die: { stack: 64 },
    gravitational_reference_sensor: { stack: 16 },
    zero_expansion_baseplate: { stack: 16 },
    coated_bench_optics: { stack: 16 },
    hydroxide_bonded_bench: { stack: 16 },
    bonded_optical_bench: { stack: 16 },
    indium_sulfate: { stack: 64 },
    six_n_indium: { stack: 64 },
    porous_tungsten_crown: { stack: 16 },
    wetted_emitter_crown: { stack: 16 },
    feep_thruster: { stack: 16 },
    vanadium_pentoxide: { stack: 64 },
    sapphire_web_wafer: { stack: 64 },
    vo2_on_sapphire: { stack: 64 },
    patterned_vo2_metasurface: { stack: 64 },
    metallised_metasurface: { stack: 16 },
    tunable_impedance_sheet: { stack: 16 },
    large_grain_nb_disc: { stack: 16 },
    nb_driver_cell: { stack: 16 },
    polished_driver_cell: { stack: 16 },
    nb3sn_driver_cell: { stack: 16 },
    conduction_cooled_cell: { stack: 16 },
    srf_driver_module: { stack: 16 },
    stripped_membrane_scrap: { stack: 64 },
    bioleached_re_liquor: { stack: 64 },
    y_ba_cu_raffinate: { stack: 64 },
    ybco_oxalate: { stack: 64 },
    cryocooler_scrap: { stack: 64 },
    er3ni_grit: { stack: 64 },
    er_rich_fraction: { stack: 64 },
    pump_buffered_tape: { stack: 64 },
    thick_pump_tape: { stack: 64 },
    flux_pump_stator: { stack: 16 },
    fe16n2_rotor_magnet: { stack: 16 },
    cold_flux_pump: { stack: 16 },
    hts_flux_pump: { stack: 16 },
    sapphire_resonator_disc: { stack: 16 },
    polished_sapphire_disc: { stack: 16 },
    cryo_sapphire_oscillator: { stack: 16 },
    clock_steered_oscillator: { stack: 16 },
    optical_phase_lock_unit: { stack: 16 },
    phase_lock_oscillator_bank: { stack: 16 },
    nd_yag_boule: { stack: 16 },
    npro_crystal: { stack: 16 },
    gaas_808_pump_bar: { stack: 64 },
    yb_doped_fibre: { stack: 16 },
    stabilised_npro_laser: { stack: 16 },
    fz_silicon_rod: { stack: 16 },
    fz_wafer: { stack: 64 },
    simox_soi_wafer: { stack: 64 },
    rad_hard_fpga_wafer: { stack: 64 },
    fpga_die: { stack: 64 },
    phasemeter_board: { stack: 16 },
    cloud_phase_map: { stack: 16 },
    calibrated_oscillator_bank: { stack: 16 },
    horizon_phase_lock: { stack: 16 },
    spent_phase_lock: { stack: 16 },
    horizon_flux_clamp: { stack: 16 },
    reconnection_plasmoid: { stack: 16 },
    ablated_shell_segment: { stack: 16 },
    coupler_scrap: { stack: 64 },
    sn_li_dross: { stack: 64 },
    segment_electronics_scrap: { stack: 64 },
    fatigued_vo2_sheet: { stack: 64 },
    spent_feep_crown: { stack: 64 },
    used_reference_sensor: { stack: 16 },
    used_optical_bench: { stack: 16 },
    horizon_lock: { stack: 16 }
  }

  const BLOCKS = {
    max_optical_table_casing: { texture: 'grindless:block/max/max_optical_table_casing' },
    membrane_roller_casing: { texture: 'grindless:block/max/membrane_roller_casing' },
    geroch_drum_casing: { texture: 'grindless:block/max/geroch_drum_casing' },
    stream_turn_casing: { texture: 'grindless:block/max/stream_turn_casing' },
    mirror_shell_segment: { texture: 'grindless:block/max/mirror_shell_segment' },
    stream_bundle_block: { texture: 'grindless:block/max/stream_bundle_block' },
    feeder_coil_casing: { texture: 'grindless:block/max/feeder_coil_casing' },
    // RF-7A casings of machines 11-14 (textures: Build-MaxHorizonInterferometerTextures.ps1, Build-MaxSynchroniserTextures.ps1,
    // Build-MaxFluxClampTextures.ps1, Build-MaxReclamationTextures.ps1)
    test_mass_enclosure_casing: { texture: 'grindless:block/max/test_mass_enclosure_casing' },
    laser_link_casing: { texture: 'grindless:block/max/laser_link_casing' },
    driver_ring_casing: { texture: 'grindless:block/max/driver_ring_casing' },
    clamp_coil_casing: { texture: 'grindless:block/max/clamp_coil_casing' },
    reclamation_bay_casing: { texture: 'grindless:block/max/reclamation_bay_casing' }
  }

  // RF-7A controllers (machines 11-14, docs/eras/max.md:194-197): named here, registered by MX-S1 to MX-S4
  MAXF.controllers = ['gtceu:horizon_interferometer', 'gtceu:ergoregion_synchroniser', 'gtceu:horizon_flux_clamp', 'gtceu:segment_reclamation_works']

  // material key (with its namespace) -> form, colour and formula. cable: a 16 A wire and cable at V[MAX], loss 1 (S0-3)
  const MATERIALS = {
    'gtceu:horizon_strand': { form: 'ingot', colour: 0x101830, formula: 'Fe(horizon)', cable: true },
    'grindless:hot_flow_plasma': { form: 'gas', colour: 0xFF7040, formula: 'Plasma(hot)' },
    'grindless:filtered_hot_flow': { form: 'gas', colour: 0xF0A070, formula: 'Plasma(f)' },
    'grindless:flux_loaded_frc': { form: 'gas', colour: 0x70C0FF, formula: 'FRC(flux)' },
    'grindless:cooled_exhaust': { form: 'gas', colour: 0xA0B0C0, formula: 'Exh(c)' },
    'grindless:sn_li_eutectic': { form: 'liquid', colour: 0xC8D0D8, formula: 'SnLi' }
  }

  MAXF.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  MAXF.blocks = Object.keys(BLOCKS).map(function (name) { return 'grindless:' + name })
  MAXF.materials = Object.keys(MATERIALS)
  // registered elsewhere: read, never created here
  MAXF.existing = ['grindless:eu_yso_boule', 'grindless:mram_stack_wafer', 'grindless:hollow_core_fibre']

  // every id by camelCase name, as the other MAX packages read them (ids.gcRelayProbe, ids.horizonStrand...)
  MAXF.ids = {}
  function camel(name) { return name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() }) }
  Object.keys(ITEMS).concat(Object.keys(BLOCKS)).forEach(function (name) { MAXF.ids[camel(name)] = 'grindless:' + name })
  Object.keys(MATERIALS).forEach(function (key) { MAXF.ids[camel(key.slice(key.indexOf(':') + 1))] = key })
  MAXF.existing.forEach(function (id) { MAXF.ids[camel(id.slice(id.indexOf(':') + 1))] = id })

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
      // the strand is a 16 A wire at V[MAX] that loses 1 EU per amp per block (S0-3); no superconductor flag: 16 x 2^31 = 2^35 EU/t per run
      if (spec.cable) material.cableProperties(GTValues.V[MAXT], 16, 1, false)
      material.flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
  })
})()
