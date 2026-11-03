// priority: -5579
// -----------------------------------------------------------------------------------------------
// MAX+ foundation (package XP-F1, docs/eras/maxplus.md "Build order", F1): the shared registrations the MAX+ packages build on. No
// controller, no recipe type, no worldgen and no recipe. Published in global.grindless.maxPlusFoundation. The load order is stamped
// by the integrator in tools/analysis/script_order.json.
//
//   Items: the 9 MAX+ components (grindless:maxplus_*), grindless:horizon_processor (the MAX+ circuit), every intermediate and
//     product of the line tables of docs/eras/maxplus.md "Lines" that no earlier era registers, the creative stand-ins (plain,
//     non-placeable items: never gtceu:creative_*, ae2: or appflux ids) and the probes.
//   Blocks: the six casings of the MAX+ multiblocks.
//   Fluids: GT materials in the grindless: namespace, as MAX does.
//   Machine: a 1,024 A energy hatch at tier 14 (S0-2): an EnergyHatchPartMachine, input only. GTM's highTierContent owns
//     gtceu:max_machine_hull; no second hull is registered (DECISIONS.md:526).
//   Already registered elsewhere (read, never created here): MXP.existing.
//
// Names: client_scripts/grindless/maxplus_foundation_lang.js. Controllers are named here, registered by the machine packages.
(function () {
  var G = global.grindless || (global.grindless = {})
  var MXP = G.maxPlusFoundation || (G.maxPlusFoundation = {})
  var MAXT = 14

  var COMPONENTS = ['maxplus_electric_motor', 'maxplus_electric_pump', 'maxplus_electric_piston', 'maxplus_robot_arm', 'maxplus_emitter',
    'maxplus_sensor', 'maxplus_field_generator', 'maxplus_conveyor_module', 'maxplus_fluid_regulator']
  // single-stack probes, the circuit and the creative stand-ins
  var UNIQUE = ['bound_probe_pair', 'launched_ig_probe', 'ig_relay_probe']
  var CIRCUITS = ['horizon_processor']
  var STANDINS = ['bottomless_store_core', 'bottomless_tank_core', 'horizon_cloud_core', 'horizon_computation_core']
  var LINE_ITEMS = ('condensate_boil_off condensate_cell addressed_holo_block addressed_holo_slab balanced_bound_billet be_foil be_ingot be_pebbles beam_neutraliser ' +
    'beryllium_hydroxide bound_coated_ribbon bound_degenerate_billet bound_degenerate_powder bound_matter_rotor bound_neutronium_ingot bound_rotor_blank braced_kerr_toroid ' +
    'burned_pattern_crystal burned_store_block c12_photonic_plate c12_seed_plate cabled_conductor caesium_chloride caged_kugelblitz calibrated_condensate_leak calibrated_gyro ' +
    'canned_counterweight canned_ni56 chevron_core cloud_loaded_cage co56_cask coated_absorber_sheet coated_be_window coated_iris_blade coated_mesh coated_resonance_cell ' +
    'coated_telescope_optic coated_truss_billet cold_horizon_conduit cold_horizon_waveguide cold_kerr_fcl cold_kerr_gyro cold_kerr_toroid cold_reference_assembly cold_scoop_coil ' +
    'cold_snspd_module compressed_neutronium_core condensate_aerogel condensate_alcogel condensate_doped_dust condensate_field_cell condensate_loaded_cavity ' +
    'condensate_superleak_plug condensate_wetted_core conduit_tape confinement_cavity controller_crystal_boule controller_seed core_crystal_boule crucible_liner cured_bound_ribbon ' +
    'deep_horizon_tether degenerate_compact dense_counterweight_core densified_blade densified_liner densified_truss_billet detector_layer_wafer direct_converter_stack edged_blade ' +
    'electroded_pmn_stack electronic_grade_silicon enriched_mo_target er_amplifier_fibre fe_ln_boule fe16n2_absorber_ring field_frozen_hoop flux_absorber_casing ' +
    'fused_quartz_sphere_blank gamma_focus_element gan_laser_array gd_absorber_tile gd_hfb2_cermet graded_horizon_laminate graded_z_billet he4_dewar holographic_slab ' +
    'horizon_actuator_stack horizon_alignment_matrix horizon_belt horizon_comm_terminal horizon_compressed_plate horizon_conduit horizon_containment_plate ' +
    'horizon_controller_crystal horizon_core_crystal horizon_frame_part horizon_frame_truss horizon_interposer horizon_logic_die horizon_logic_wafer horizon_mesh horizon_phase_sensor_core ' +
    'horizon_photonic_engine horizon_shielding horizon_storage_die horizon_valve horizon_valve_body horizon_waveguide ime_ash impregnated_kerr_coil impregnated_kerr_winding ' +
    'impregnated_nozzle infiltrated_liner infiltrated_mesh inp_1550_laser_die inscribed_core_crystal inscribed_reference_crystal insulated_hoop insulated_kerr_wire interposer_die ' +
    'interposer_waveguides iris_blade jacketed_condensate_cell kerr_braid_sleeve kerr_braided_web kerr_clad_strand kerr_coated_tape kerr_coil_winding kerr_fcl_buffer_tape ' +
    'kerr_fcl_coil kerr_field_coil kerr_mesh_preform kerr_ribbon kerr_smes_winding kerr_strand_wire kerr_strange_ingot kerr_strange_plate laminated_absorber_sheet ' +
    'laminated_containment_core lapped_quartz_sphere large_resonance_cell laser_array_wafer laser_comm_engine ln_modulator_array ln_on_diamond ln_on_insulator_plus ' +
    'magnetic_scoop_module mo_grid_billet mo_powder molybdenum_oxide mram_stack_plus multilayer_xray_mirror nb_coated_cavity nb_coated_sphere nb_lined_tube neutral_beam_injector ' +
    'ni56_slug nozzle_tape nozzle_winding nuclear_clock_reference nv_engineered_diamond optical_frequency_divider optical_matrix_die optical_nav_core oriented_blade_blank ' +
    'p_nuclide_concentrate pair_confined_cage pattern_memory_unit patterned_engine_wafer patterned_mram pche_recuperator_foil phase_modulator_chip photonic_coprocessor photonic_qpu ' +
    'photonic_qpu_wafer piezo_transducer_layer pmn_precursor_oxides pmn_pt_boule pmn_pt_plate polished_resonance_cell polished_waveguide_tube primed_kerr_web ' +
    'proof_loaded_kerr_ribbon racetrack_3d_stack readout_die readout_wafer recovered_silicon refined_mo_grid refractory_coated_web resonance_chamber rfq_cavity sapphire_seed_plate ' +
    'sco2_turbine_module scoop_coil scoop_web sealed_field_cavity sealed_liner shielded_absorber shielded_ni56_cask si28_boule si28_feed sic_chamber_flange sic_nozzle_former ' +
    'sic_waveguide_tube six_n_caesium snspd_array_die spent_fe56_cask spin_interconnect_wafer stabilised_kerr_wire stacked_logic_wafer strange_alloy_charge strange_cage_lining ' +
    'superfluid_reservoir_core sx_turbine_blade tbc_coated_blade thick_conduit_tape thick_kerr_fcl_tape thorium_nav_clock turbine_disc vms_lift_nozzle void_crystal_lattice ' +
    'void_grown_diamond void_holographic_block wear_coated_rotor zone_plate_wafer ' +
    'frozen_spin_hd polarized_hd_pellet ' +
    'stacked_horizon_module linked_horizon_module condensate_cooled_module tested_horizon_module horizon_module_scrap').split(' ')

  var ITEMS = {}
  COMPONENTS.concat(LINE_ITEMS, CIRCUITS).forEach(function (name) { ITEMS[name] = { stack: 64 } })
  STANDINS.concat(UNIQUE).forEach(function (name) { ITEMS[name] = { stack: 1 } })

  // no texture yet: each casing shows the missing-texture cube until the asset phase
  var BLOCKS = {}
  ;['horizon_machine_casing', 'condensate_vessel_casing', 'bound_press_casing', 'slingshot_coil_casing', 'lift_nozzle_casing', 'crucible_liner_casing',
    'bound_lattice_casing', 'kerr_coil_casing', 'fe56_shield_casing', 'primordial_cryostat_casing', 'void_diamond_window', 'horizon_gate_casing']
    .forEach(function (name) { BLOCKS[name] = { texture: 'grindless:block/maxplus/' + name } })
  // the horizon family (D5-CAS-MAXP, docs/eras/lines-opv-maxplus.md 7.3): names and tooltips client_scripts/grindless/maxplus_casings_lang.js,
  // recipes server_scripts/grindless/maxplus/casings.js; the first six casings above keep no tooltip
  var FAMILY = ['bound_lattice_casing', 'kerr_coil_casing', 'fe56_shield_casing', 'primordial_cryostat_casing', 'void_diamond_window', 'horizon_gate_casing']

  // controllers of machines 1-17, named here and registered by the machine packages
  MXP.controllers = ['gtceu:condensate_refinery', 'gtceu:bound_matter_press', 'gtceu:hills_slingshot', 'gtceu:tarantula_stellar_lift',
    'gtceu:pair_instability_crucible', 'gtceu:nickel_56_burner', 'gtceu:pristine_gas_works', 'gtceu:primordial_fusion_torus', 'gtceu:blueshift_forge',
    'gtceu:void_crystal_fab', 'gtceu:meta_material_loom', 'gtceu:horizon_crystal_furnace', 'gtceu:condensate_assembler',
    'gtceu:horizon_capacitor_bank', 'gtceu:hyper_assembly_array', 'gtceu:hyperstargate', 'gtceu:polarized_fusion_stellarator']

  var GAS = 'gas'
  var LIQ = 'liquid'
  var FLUIDS = {
    raw_vms_plasma: [GAS, 0xFFB060, 'VMS(raw)'],
    confined_vms_plasma: [GAS, 0xFFC080, 'VMS(c)'],
    vms_core_plasma: [GAS, 0xFFD0A0, 'VMS(core)'],
    filtered_stellar_plasma: [GAS, 0xFFE0A0, 'Star(f)'],
    lifted_stellar_plasma: [GAS, 0xFFF0C0, 'Star(l)'],
    p_process_plasma: [GAS, 0xC0A0FF, 'P(pl)'],
    pristine_gas: [GAS, 0xD0E8FF, 'Pr(g)'],
    primordial_deuterium: [GAS, 0xB0D0FF, 'D(pr)'],
    pristine_helium: [GAS, 0xE0F0FF, 'He(pr)'],
    pristine_helium_3: [GAS, 0xE8F8FF, '3He(pr)'],
    crude_helium_3: [GAS, 0xC8D8E0, '3He(c)'],
    he3_enriched_helium: [GAS, 0xD8E8F0, 'He(3)'],
    he_rich_fraction: [GAS, 0xD0E0F0, 'He(rich)'],
    hd_fraction: [GAS, 0xC0D0F0, 'HD(f)'],
    photonuclear_mix: [GAS, 0x90FF90, 'Pn(mix)'],
    kerr_condensate: [LIQ, 0x5060C0, 'Kc'],
    settled_condensate: [LIQ, 0x6070D0, 'Kc(s)'],
    liquid_helium_4: [LIQ, 0xE0F4FF, '4He(l)'],
    superfluid_helium_4: [LIQ, 0xF0FAFF, '4He(sf)'],
    liquid_pristine_hydrogen: [LIQ, 0xC0E0FF, 'H(pr)'],
    molten_kerr_strange: [LIQ, 0x8040C0, 'KsM'],
    horizon_crystal_slurry: [LIQ, 0x203060, 'Hz(sl)'],
    ime_leach_fractions: [LIQ, 0xB0A070, 'IME(l)'],
    hd_equilibrium_mix: [GAS, 0xA8C0F0, 'HD(eq)'],
    pure_hd: [LIQ, 0xB8D0FF, 'HD'],
    polarized_helium_3: [GAS, 0xF0FCFF, '3He(pol)']
  }

  var HATCH = 'maxplus_energy_hatch_1024a'

  // registered elsewhere: read, never created here
  MXP.existing = ['grindless:chain_lamina_stack', 'grindless:cmc_coil_former', 'grindless:degenerate_matter_slug', 'grindless:fcl_substrate_strip', 'grindless:fed_strangelet',
    'gtceu:gadolinium_oxide_dust', 'grindless:hawking_drive', 'grindless:metal_rich_bloom', 'grindless:neutronium_pellet', 'grindless:nsc_planetesimal', 'grindless:probe_seed',
    'grindless:seed_wave_packet', 'grindless:segment_truss_billet', 'grindless:stellar_plasma']
  MXP.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  MXP.blocks = Object.keys(BLOCKS).map(function (name) { return 'grindless:' + name })
  MXP.fluids = Object.keys(FLUIDS).map(function (name) { return 'grindless:' + name })
  MXP.hatch = 'gtceu:max_' + HATCH
  MXP.hatchAmps = 1024
  MXP.components = COMPONENTS.map(function (name) { return 'grindless:' + name })
  MXP.standins = STANDINS.map(function (name) { return 'grindless:' + name })

  MXP.ids = {}
  function camel(name) { return name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() }) }
  Object.keys(ITEMS).concat(Object.keys(BLOCKS), Object.keys(FLUIDS)).forEach(function (name) { MXP.ids[camel(name)] = 'grindless:' + name })
  MXP.existing.forEach(function (id) { MXP.ids[camel(id.slice(id.indexOf(':') + 1))] = id })

  StartupEvents.registry('block', function (event) {
    Object.keys(BLOCKS).forEach(function (name) {
      event.create('grindless:' + name)
        .stoneSoundType()
        .hardness(5)
        .resistance(6)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .textureAll(BLOCKS[name].texture)
        .item(function (item) {
          if (FAMILY.indexOf(name) < 0) return
          item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
          item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
        })
    })
  })

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
    })
  })

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    Object.keys(FLUIDS).forEach(function (name) {
      var spec = FLUIDS[name]
      var material = event.create('grindless:' + name)
      if (spec[0] === GAS) material.gas()
      else material.liquid()
      material.color(spec[1]).formula(spec[2]).flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
    })
    // iron-56 (X5, the pack's isotope naming as gtceu:tungsten_184): dust, ingot and plate; the spent cask's hot cell row returns the dust
    event.create('gtceu:iron_56').ingot().iconSet(GTMaterialIconSet.METALLIC).color(0x8C93A6).formula('56Fe')
      .flags(GTMaterialFlags.GENERATE_PLATE, GTMaterialFlags.DISABLE_DECOMPOSITION)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var EHPM = Java.loadClass('com.gregtechceu.gtceu.common.machine.multiblock.part.EnergyHatchPartMachine')
    var IO = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.IO')
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    event.create(HATCH, 'custom')
      .tiers(MAXT)
      .machine(function (holder, tier) { return new EHPM(holder, tier, IO.IN, 1024) })
      .definition(function (tier, builder) {
        builder
          .langValue('MAX+ 1,024 A Energy Hatch')
          .rotationState(RotationState.ALL)
          .abilities(PartAbility.INPUT_ENERGY)
        builder.modelPropertyBool(GTModelProperties.IS_FORMED, false)
        builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](new RL('grindless', 'block/machines/maxplus/energy_hatch_1024a'))
      })
  })
})()
