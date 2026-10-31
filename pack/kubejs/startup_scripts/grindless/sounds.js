// priority: -6861
// -----------------------------------------------------------------------------------------------
// Working-sound loops of our special multiblocks (QR-E0, docs/quality/sounds.md).
//
// GTM 7.5.3 plays a machine's working sound per recipe type: RecipeLogic.updateSound() (client) looks up
// getRecipeType().getSound() and starts an AutoReleasedSound (looping, linear attenuation) on the SoundEvent of that SoundEntry.
// KubeJS cannot register a GTM SoundEntry (GTRegistries.SOUNDS is frozen after GTSoundEntries.init), but GTM's ExistingSoundEntry
// wraps any SoundEvent, so: 1. register the SoundEvent with KubeJS (sound_event registry), 2. after every recipe type exists (the
// machine registry fires after the recipe_type one) wrap it and call GTRecipeType.setSound. Era files stay untouched.
//
// Adding a sound: a row in tools/assets/sounds.json, run tools/assets/New-MachineSound.ps1, one line in WIRING below.
// -----------------------------------------------------------------------------------------------
(function () {
  const NS = 'grindless'

  // recipe type id -> sound event path (a key of assets/grindless/sounds.json). Keep in step with tools/assets/sounds.json.
  const WIRING = {
    'gtceu:radio_astronomy': 'loop_observatory',
    'gtceu:mega_chemical_complex': 'loop_mega_chemical_complex',
    'gtceu:plasma_quench': 'loop_plasma_quench_caster',
    'gtceu:horizon_collection': 'loop_horizon_collector',
    'gtceu:coking': 'loop_coking_battery',
    'gtceu:steelmaking': 'loop_steam_blast_furnace',
    'gtceu:sulfide_roasting': 'loop_sulfide_roaster',
    'gtceu:solar_steam': 'loop_heliostat_tower',
    'gtceu:ore_processing': 'loop_ore_plant',
    'gtceu:bio_distillation': 'loop_biorefinery',
    'gtceu:polymer_works': 'loop_polymer_works',
    'gtceu:refining': 'loop_refinery',
    'gtceu:reforming': 'loop_reformer',
    'gtceu:syngas': 'loop_syngas_plant',
    'gtceu:solvent_extraction': 'loop_extraction_cascade',
    'gtceu:cryogenic_processing': 'loop_cryogenic_plant',
    'gtceu:combined_cycle': 'loop_combined_cycle',
    'gtceu:hot_rolling': 'loop_hot_strip_mill',
    'gtceu:pgm_refining': 'loop_platinum_plant',
    'gtceu:lunar_solar': 'loop_lunar_power',
    'gtceu:deep_space_tracking': 'loop_deep_space_antenna',
    'gtceu:fission_core': 'loop_fission_reactor',
    'gtceu:hot_cell': 'loop_hot_cell',
    'gtceu:isotope_exchange': 'loop_heavy_water_plant',
    'gtceu:fluorspar_digestion': 'loop_fluorspar_kiln',
    'gtceu:naquadah_refining': 'loop_naquadah_plant',
    'gtceu:in_situ_leaching': 'loop_uranium_leaching',
    'gtceu:fuel_fabrication': 'loop_fuel_fabrication',
    'gtceu:detritiation': 'loop_tritium_removal',
    'gtceu:magnet_winding': 'loop_hts_magnet_works',
    'gtceu:closed_loop_cooling': 'loop_helium_refrigerator',
    'gtceu:electrodynamic_tether': 'loop_io_tether',
    'gtceu:thermochemical_hydrogen': 'loop_io_hydrogen_plant',
    'gtceu:asteroid_processing': 'loop_asteroid_processor',
    'gtceu:optical_mining': 'loop_optical_miner',
    'gtceu:sterile_culture': 'loop_biofoundry',
    'gtceu:naquadria_magnets': 'loop_naquadria_magnet_works',
    'gtceu:gas_giant_siphon': 'loop_gas_giant_siphon',
    'gtceu:qubit_fabrication': 'loop_qubit_fab',
    'gtceu:naquadria_refining': 'loop_naquadria_refinery',
    'gtceu:laser_fusion': 'loop_laser_fusion_chamber',
    'gtceu:light_sail': 'loop_light_sail_works',
    'gtceu:pyroprocessing': 'loop_thorium_pyro',
    'gtceu:synchrotron': 'loop_synchrotron',
    'gtceu:superfluid_helium': 'loop_superfluid_helium',
    'gtceu:fibre_draw': 'loop_fibre_draw_tower',
    'gtceu:dyson_swarm': 'loop_dyson_swarm',
    'gtceu:positron_accumulation': 'loop_antimatter_accumulator',
    'gtceu:warp_gate': 'loop_warp_gate',
    'gtceu:silicon_carbide': 'loop_power_devices_fab',
    'gtceu:pbo_synthesis': 'loop_space_elevator',
    'gtceu:megabar_synthesis': 'loop_megabar_press',
    'gtceu:electron_beam_refining': 'loop_electron_beam_furnace',
    'gtceu:quantum_degenerate_gas': 'loop_earth_orbit_lab',
    'gtceu:chemical_vapour_infiltration': 'loop_cvi_furnace',
    'gtceu:mtj_sputtering': 'loop_mtj_sputter_cluster',
    'gtceu:pulsed_laser_deposition': 'loop_oxide_pld_chamber',
    'gtceu:vdw_stacking': 'loop_vdw_stacking_cell',
    'gtceu:racetrack_patterning': 'loop_racetrack_fab',
    'gtceu:liquid_phase_epitaxy': 'loop_yig_lpe_furnace',
    'gtceu:shequid_assembly': 'loop_shequid_works',
    'gtceu:multinucleon_transfer': 'loop_mnt_collider',
    'gtceu:star_lifting': 'loop_stellar_elevator',
    'gtceu:plasma_mass_filtering': 'loop_plasma_mass_filter',
    'gtceu:stellar_condensation': 'loop_stellar_condensation_tower',
    'gtceu:disk_skimming': 'loop_accretion_disk_skimmer',
    'gtceu:frc_forming': 'loop_frc_former',
    'gtceu:blandford_znajek': 'loop_bz_dynamo',
    'gtceu:pasta_extraction': 'loop_pasta_extractor',
    'gtceu:pasta_sorting': 'loop_pasta_phase_sorter',
    'gtceu:pasta_drawing': 'loop_pasta_draw_bench',
    'gtceu:pasta_lamination': 'loop_pasta_laminator',
    'gtceu:polar_cap_tapping': 'loop_polar_cap_tap',
    'gtceu:ejecta_sweeping': 'loop_ejecta_knot_sweeper',
    'gtceu:annihilation_lasing': 'loop_annihilation_laser_works',
    'gtceu:field_freezing': 'loop_field_frozen_press',
    'gtceu:tetron_assembly': 'loop_tetron_fab',
    'gtceu:gamma_optics': 'loop_gamma_optics_works',
    'gtceu:magnetic_pair_production': 'loop_magnetic_pair_converter',
    'gtceu:antihydrogen_synthesis': 'loop_antihydrogen_foundry',
    'gtceu:annihilation_power': 'loop_annihilation_engine',
    'gtceu:jet_beam_extraction': 'loop_jet_beam_line',
    'gtceu:antiproton_production': 'loop_spallation_target_station',
    'gtceu:beam_cooling': 'loop_antiproton_decelerator',
    'gtceu:strangelet_growth': 'loop_strangelet_vault',
    'gtceu:strangelet_distillation': 'loop_strangelet_distiller',
    'gtceu:kugelblitz_forming': 'loop_kugelblitz_forge',
    'gtceu:hawking_power': 'loop_hawking_collector',
    'gtceu:atom_interferometry': 'loop_atom_interferometer_works',
    'gtceu:membrane_rolling': 'loop_membrane_line',
    'gtceu:rydberg_assembly': 'loop_rydberg_array_works',
    'gtceu:photon_ring_imaging': 'loop_photon_ring_imager',
    'gtceu:geroch_power': 'loop_geroch_winch',
    'gtceu:genome_archiving': 'loop_gene_ark',
    'gtceu:cluster_light_smelting': 'loop_cluster_light_furnace',
    'gtceu:mass_stream_injection': 'loop_mass_stream_injector',
    'gtceu:accretion_power': 'loop_accretion_feeder'
  }

  StartupEvents.registry('sound_event', function (event) {
    Object.keys(WIRING).forEach(function (typeId) {
      event.create(NS + ':' + WIRING[typeId])
    })
  })

  GTCEuStartupEvents.registry('gtceu:machine', function () {
    var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var SoundEvent = Java.loadClass('net.minecraft.sounds.SoundEvent')
    var SoundSource = Java.loadClass('net.minecraft.sounds.SoundSource')
    var Entry = Java.loadClass('com.gregtechceu.gtceu.api.sound.ExistingSoundEntry')
    var Registries = Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')

    Object.keys(WIRING).forEach(function (typeId) {
      var type = Registries.RECIPE_TYPES.get(new RL(typeId))
      if (type == null) {
        // Io's slot registers only one of thermochemical_hydrogen / electrodynamic_tether (tables/stations.json), or neither while pending
        console.info('[grindless sounds] recipe type not registered, no sound: ' + typeId)
        return
      }
      var entry = new Entry(SoundEvent.createVariableRangeEvent(new RL(NS, WIRING[typeId])), SoundSource.BLOCKS)
      type.setSound(entry)
    })
  })
})()
