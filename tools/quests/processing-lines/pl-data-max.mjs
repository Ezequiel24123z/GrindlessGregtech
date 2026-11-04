// pl_max: the MAX lines (docs/eras/lines-opv-maxplus.md, section 3), checked against the built tables and a recipe dump by pl-check.mjs.
// ROWS holds the 57 design rows: a row is [number, nodes]; a node is [kind, id, [from...], side] with kind i (item), f (fluid) or m (machine),
// from = earlier node indexes and side = where a side output goes. Machines are the mod's own multiblocks; GTM steps are plain item-to-item arrows.
// The chart draws one cluster per line, as pl_opv does: M1 (the staged Si-28 line, MAX stage), M2 to M8 and the kept lines. A cluster takes a
// trunk row and the feeder rows that end in one of its steps (a join); a feeder that serves another line or era ends as a dest node.
// Rows are cut where another row already makes the step, and laid out by the engine below (the same rules as pl-model's layoutFindings).
import { I, F, M, n, L, KINDS } from './pl-lib.mjs';

const ROWS = {
  1: [['i', 'grindless:stable_exotic_matter'], ['m', 'gtceu:strangelet_vault', [0]], ['i', 'grindless:exotic_cladding_foil', [1]], ['i', 'grindless:clad_chain_strand', [2]], ['m', 'gtceu:pasta_phase_sorter', [3]], ['i', 'grindless:horizon_strand_preform', [4]], ['m', 'gtceu:pasta_phase_sorter'], ['i', 'gtceu:horizon_strand_single_wire', [6]], ['i', 'gtceu:horizon_strand_single_wire'], ['m', 'gtceu:pbo_plant', [8]], ['i', 'grindless:pbo_braid_sleeve', [9]], ['i', 'gtceu:horizon_strand_single_cable', [10]]],
  2: [['i', 'grindless:electropolished_cu111_foil'], ['m', 'gtceu:vdw_stacker', [0]], ['i', 'grindless:graphene_hbn_film', [1]], ['i', 'grindless:pbo_fibre'], ['m', 'gtceu:pbo_plant', [3]], ['i', 'grindless:pbo_carrier_web', [4]], ['m', 'gtceu:mocvd_reactor', [5]], ['i', 'grindless:buffered_pbo_web', [6]], ['m', 'gtceu:coated_conductor_line', [7]], ['i', 'grindless:rebco_on_pbo_web', [8]], ['m', 'gtceu:hts_magnet_works', [9]], ['i', 'grindless:pinned_rebco_web', [10]], ['m', 'gtceu:membrane_line', [11]], ['i', 'grindless:superconducting_membrane', [12]]],
  3: [['i', 'gtceu:silicon_dioxide_dust'], ['m', 'gtceu:zone_refining_tower', [0]], ['i', 'grindless:ultrapure_silica_target', [1]], ['i', 'grindless:hafnium_chloride_dust'], ['m', 'gtceu:extraction_cascade', [3]], ['i', 'grindless:hafnia_powder', [4]], ['m', 'gtceu:electron_beam_furnace', [5]], ['i', 'grindless:hafnia_target', [6]], ['m', 'gtceu:mtj_sputter_cluster', [7]], ['i', 'grindless:hfo2_sio2_stack', [8]], ['m', 'gtceu:membrane_line', [9]], ['i', 'grindless:albedo_multilayer_panel', [10]]],
  4: [['i', 'grindless:strontium_carbonate_dust'], ['m', 'gtceu:calutron', [0]], ['i', 'grindless:sr88_isotope', [1]], ['m', 'gtceu:quantum_gas_lab', [2]], ['i', 'grindless:degenerate_sr_cartridge', [3]], ['i', 'grindless:lithium_niobate_wafer'], ['m', 'gtceu:tfln_fab', [5]], ['i', 'grindless:atom_optics_modulator', [6]], ['i', 'grindless:cryo_cmos_die'], ['m', 'gtceu:shequid_works', [8]], ['i', 'grindless:shequid_rotation_ref', [9]], ['m', 'gtceu:atom_interferometer_works', [10]], ['i', 'grindless:matter_wave_gradiometer', [11]]],
  5: [['i', 'gtceu:lithium_dust'], ['m', 'gtceu:crystal_growth_furnace', [0]], ['i', 'grindless:ppln_boule', [1]], ['m', 'gtceu:tfln_fab', [2]], ['i', 'grindless:ppln_thin_film_wafer', [3]], ['m', 'gtceu:femtosecond_writer', [4]], ['i', 'grindless:squeezer_waveguide_die', [5]], ['m', 'gtceu:mocvd_reactor', [6]], ['i', 'grindless:pump_laser_bonded_die', [7]], ['m', 'gtceu:snspd_foundry', [8]], ['i', 'grindless:squeezed_light_chip', [9]]],
  6: [['i', 'gtceu:silicon_dioxide_dust'], ['m', 'gtceu:crystal_growth_furnace', [0]], ['i', 'grindless:quartz_crystal_wafer', [1]], ['m', 'gtceu:beuv_scanner', [2]], ['i', 'grindless:metalens_wafer', [3]], ['m', 'gtceu:mtj_sputter_cluster', [4]], ['i', 'grindless:coated_metalens', [5]], ['m', 'gtceu:quantum_gas_lab', [6]], ['i', 'grindless:tweezer_calibrated_lens', [7]], ['i', 'grindless:tweezer_array_die', [8]]],
  7: [['i', 'grindless:aln_wafer'], ['m', 'gtceu:mocvd_reactor', [0]], ['i', 'grindless:aln_on_si_wafer', [1]], ['m', 'gtceu:mtj_sputter_cluster', [2]], ['i', 'grindless:nb_coplanar_film', [3]], ['m', 'gtceu:mbe_reactor', [4]], ['i', 'grindless:piezo_optomech_layer', [5]], ['m', 'gtceu:tfln_fab', [6]], ['i', 'grindless:transducer_wafer', [7]], ['m', 'gtceu:millikelvin_cryostat_works', [8]], ['i', 'grindless:cryo_photonic_interposer', [9]]],
  8: [['i', 'grindless:cvd_diamond_plate'], ['m', 'gtceu:diamond_lattice_fab', [0]], ['i', 'grindless:power_diamond_plate', [1]], ['m', 'gtceu:ion_implanter', [2]], ['i', 'grindless:boron_delta_diamond', [3]], ['m', 'gtceu:mtj_sputter_cluster', [4]], ['i', 'grindless:metallised_diamond', [5]], ['m', 'gtceu:sic_device_fab', [6]], ['i', 'grindless:diamond_power_wafer', [7]], ['i', 'grindless:diamond_power_die', [8]]],
  9: [['i', 'grindless:itbtc_coated_conductor'], ['m', 'gtceu:coated_conductor_line', [0]], ['i', 'grindless:rebco_tape_max', [1]], ['i', 'grindless:stabilised_rebco_tape', [2]], ['m', 'gtceu:cvi_furnace', [3]], ['i', 'grindless:cmc_coil_former', [4]], ['m', 'gtceu:hts_magnet_works', [5]], ['i', 'grindless:max_coil_winding', [6]], ['i', 'grindless:max_field_coil', [7]]],
  10: [['i', 'grindless:sic_fibre'], ['m', 'gtceu:sic_fibre_plant', [0]], ['i', 'grindless:sic_tow', [1]], ['m', 'gtceu:cvi_furnace', [2]], ['i', 'grindless:sic_sic_preform', [3]], ['i', 'grindless:exotic_infiltrated_preform', [4]], ['m', 'gtceu:spark_plasma_sinterer', [5]], ['i', 'grindless:exotic_composite_billet', [6]], ['m', 'gtceu:shequid_works', [7]], ['i', 'grindless:balanced_composite_billet', [8]], ['i', 'grindless:exotic_composite_rod', [9]]],
  11: [['i', 'grindless:pbo_fibre'], ['m', 'gtceu:pbo_plant', [0]], ['i', 'grindless:pbo_belt_web', [1]], ['i', 'grindless:primed_belt_web', [2]], ['m', 'gtceu:electron_beam_furnace', [3]], ['i', 'grindless:refractory_wear_coat', [4]], ['m', 'gtceu:helium_refrigerator', [5]], ['i', 'grindless:cryo_conditioned_web', [6]], ['m', 'gtceu:membrane_line', [7]], ['i', 'grindless:membrane_belt', [8]]],
  12: [['i', 'gtceu:phosphorus_dust'], ['m', 'gtceu:biofoundry', [0]], ['i', 'grindless:synthetic_oligo_pool', [1]], ['m', 'gtceu:organoid_lab', [2]], ['i', 'grindless:organoid_genome_extract', [3]], ['m', 'gtceu:ark_biosphere', [4]], ['i', 'grindless:ark_genome_set', [5]], ['m', 'gtceu:xenobotany_greenhouse', [6]], ['i', 'grindless:xeno_genome_set', [7]], ['m', 'gtceu:aerogel_works', [8]], ['i', 'grindless:encapsulated_genome_library', [9]], ['m', 'gtceu:gene_ark', [10]], ['i', 'grindless:genome_archive', [11]]],
  13: [['i', 'grindless:nsc_planetesimal'], ['m', 'gtceu:cluster_light_furnace', [0]], ['i', 'grindless:metal_rich_bloom', [1]], ['m', 'gtceu:carbonyl_refinery', [2]], ['i', 'grindless:carbonyl_fe_ni_powder', [3]], ['m', 'gtceu:levitation_melter', [4]], ['i', 'grindless:segment_alloy_ingot', [5]], ['m', 'gtceu:cluster_light_furnace', [6]], ['i', 'grindless:segment_truss_billet', [7]], ['i', 'grindless:segment_truss', [8]]],
  14: [['i', 'grindless:metal_rich_bloom'], ['m', 'gtceu:cluster_light_furnace', [0]], ['i', 'grindless:pellet_blank', [1]], ['m', 'gtceu:megabar_press', [2]], ['i', 'grindless:dense_pellet', [3]], ['i', 'grindless:turned_pellet_core', [4]], ['m', 'gtceu:srf_cavity_works', [5]], ['i', 'grindless:sc_jacketed_pellet', [6]], ['i', 'grindless:stream_pellet', [7]]],
  15: [['i', 'gtceu:lithium_dust'], ['m', 'gtceu:extraction_cascade', [0]], ['f', 'fluid:gtceu:sn_li_eutectic', [1]], ['i', 'gtceu:tungsten_plate'], ['m', 'gtceu:femtosecond_writer', [3]], ['i', 'grindless:droplet_nozzle_plate', [4]], ['i', 'grindless:sic_sic_plate'], ['m', 'gtceu:spark_plasma_sinterer', [6]], ['i', 'grindless:radiator_collector_shell', [7]], ['m', 'gtceu:droplet_radiator_works', [8]], ['i', 'grindless:shell_droplet_radiator', [9]]],
  16: [['i', 'grindless:mh_winding'], ['m', 'gtceu:accretion_disk_skimmer', [0]], ['f', 'fluid:gtceu:hot_flow_plasma', [1]], ['m', 'gtceu:plasma_mass_filter', [2]], ['f', 'fluid:gtceu:filtered_hot_flow', [3]], ['m', 'gtceu:frc_former', [4]], ['f', 'fluid:gtceu:flux_loaded_frc', [5]], ['m', 'gtceu:bz_dynamo', [6]], ['f', 'fluid:gtceu:cooled_exhaust', [7]]],
  17: [['i', 'gtnn:radioactive_waste'], ['m', 'gtceu:waste_retrieval_plant', [0]], ['i', 'grindless:retrieved_waste_mix', [1]], ['m', 'gtceu:decay_heat_vault', [2]], ['i', 'grindless:cooled_waste_mix', [3]], ['m', 'gtceu:hot_cell', [4]], ['i', 'grindless:vitrified_waste_log', [5]], ['i', 'grindless:sealed_waste_log', [6]], ['i', 'grindless:geroch_canister', [7]]],
  18: [['i', 'grindless:thorium_229'], ['m', 'gtceu:nuclear_clock_lab', [0]], ['i', 'grindless:thorium_clock_reference', [1]], ['m', 'gtceu:srf_cavity_works', [2]], ['i', 'grindless:max_srf_cavity', [3]], ['i', 'grindless:polished_srf_cavity', [4]], ['m', 'gtceu:millikelvin_cryostat_works', [5]], ['i', 'grindless:cooled_cavity_mode', [6]], ['m', 'gtceu:kugelblitz_forge', [7]], ['i', 'grindless:seed_wave_packet', [8]]],
  19: [['i', 'grindless:gallium_arsenide_wafer'], ['m', 'gtceu:mocvd_reactor', [0]], ['i', 'grindless:rydberg_laser_die', [1]], ['i', 'gtceu:lepidolite_dust'], ['m', 'gtceu:calutron', [3]], ['i', 'grindless:rb87_isotope', [4]], ['m', 'gtceu:quantum_gas_lab', [5]], ['i', 'grindless:atom_cartridge_rb87', [6]], ['m', 'gtceu:rydberg_array_works', [7]], ['i', 'grindless:rydberg_logic_array', [8]]],
  20: [['i', 'grindless:tether_ribbon_segment'], ['m', 'gtceu:tether_ribbon_works', [0]], ['i', 'grindless:strand_ribbon', [1]], ['m', 'gtceu:stellar_elevator', [2]], ['i', 'grindless:proof_loaded_ribbon', [3]], ['i', 'grindless:exotic_coated_ribbon', [4]], ['i', 'grindless:cured_exotic_ribbon', [5]], ['i', 'grindless:horizon_tether', [6]]],
  21: [['i', 'grindless:sic_fibre'], ['m', 'gtceu:sic_fibre_plant', [0]], ['i', 'grindless:sic_mirror_tow', [1]], ['m', 'gtceu:cvi_furnace', [2]], ['i', 'grindless:sic_dish_blank', [3]], ['m', 'gtceu:ion_implanter', [4]], ['i', 'grindless:figured_dish_blank', [5]], ['m', 'gtceu:mtj_sputter_cluster', [6]], ['i', 'grindless:gold_coated_dish', [7]], ['i', 'grindless:imager_dish_panel', [8]]],
  22: [['i', 'gtceu:niobium_dust'], ['m', 'gtceu:mtj_sputter_cluster', [0]], ['i', 'grindless:nb_alox_nb_trilayer', [1]], ['m', 'gtceu:beuv_scanner', [2]], ['i', 'grindless:sis_junction_wafer', [3]], ['i', 'grindless:anodised_junction_wafer', [4]], ['i', 'grindless:sis_die', [5]], ['m', 'gtceu:millikelvin_cryostat_works', [6]], ['i', 'grindless:tested_sis_die', [7]], ['i', 'grindless:sis_mixer', [8]]],
  23: [['i', 'gtceu:yttrium_dust'], ['m', 'gtceu:crystal_growth_furnace', [0]], ['i', 'grindless:eu_yso_boule', [1]], ['i', 'grindless:eu_yso_slab', [2]], ['m', 'gtceu:spectral_hole_burner', [3]], ['i', 'grindless:burned_memory_crystal', [4]], ['m', 'gtceu:fibre_draw_tower', [5]], ['i', 'grindless:memory_fibre_pigtail', [6]], ['i', 'grindless:quantum_memory_node', [7]]],
  24: [['i', 'grindless:degenerate_eos_model'], ['m', 'gtceu:degenerate_harvester', [0]], ['i', 'grindless:degenerate_matter_slug', [1]], ['m', 'gtceu:megabar_press', [2]], ['i', 'grindless:compressed_payload_core', [3]], ['i', 'grindless:turned_payload_core', [4]], ['i', 'grindless:sic_sic_plate'], ['m', 'gtceu:spark_plasma_sinterer', [6]], ['i', 'grindless:payload_casing', [7]], ['i', 'grindless:max_penrose_payload', [8]]],
  25: [['i', 'grindless:nsc_planetesimal'], ['m', 'gtceu:cluster_light_furnace', [0]], ['i', 'grindless:silicate_slag', [1]], ['m', 'gtceu:solar_vapour_furnace', [2]], ['i', 'grindless:devolatilised_slag', [3]], ['m', 'gtceu:regolith_cell', [4]], ['i', 'grindless:ca_al_oxide_residue', [5]], ['i', 'grindless:slag_compact', [6]], ['m', 'gtceu:spark_plasma_sinterer', [7]], ['i', 'grindless:slag_pellet', [8]]],
  26: [['i', 'grindless:cvd_diamond_plate'], ['m', 'gtceu:diamond_lattice_fab', [0]], ['i', 'grindless:collector_diamond_plate', [1]], ['m', 'gtceu:ion_implanter', [2]], ['i', 'grindless:pin_diamond_plate', [3]], ['m', 'gtceu:betavoltaic_fab', [4]], ['i', 'grindless:diamond_photocell', [5]], ['m', 'gtceu:mtj_sputter_cluster', [6]], ['i', 'grindless:metallised_photocell', [7]], ['m', 'gtceu:solar_array_fab', [8]], ['i', 'grindless:xuv_collector_panel', [9]]],
  27: [['i', 'grindless:itbtc_coated_conductor'], ['m', 'gtceu:coated_conductor_line', [0]], ['i', 'grindless:smes_buffered_tape', [1]], ['m', 'gtceu:mtj_sputter_cluster', [2]], ['i', 'grindless:thick_rebco_tape', [3]], ['m', 'gtceu:hts_magnet_works', [4]], ['i', 'grindless:smes_toroid_winding', [5]], ['m', 'gtceu:naquadria_magnet_works', [6]], ['i', 'grindless:braced_smes_toroid', [7]], ['m', 'gtceu:helium_refrigerator', [8]], ['i', 'grindless:cold_smes_toroid', [9]]],
  28: [['i', 'grindless:synthetic_oligo_pool'], ['m', 'gtceu:biofoundry', [0]], ['i', 'grindless:syn3_genome_cassettes', [1]], ['m', 'gtceu:vent_bioreactor', [2]], ['i', 'grindless:recipient_mycoplasma_culture', [3]], ['m', 'gtceu:xenobiochem_plant', [4]], ['i', 'grindless:transplanted_minimal_cell', [5]], ['m', 'gtceu:radiotrophic_vat', [6]], ['i', 'grindless:hardened_minimal_cell', [7]], ['m', 'gtceu:aerogel_works', [8]], ['i', 'grindless:vitrified_cell_capsule', [9]]],
  29: [['i', 'gtceu:silicon_wafer'], ['m', 'gtceu:mocvd_reactor', [0]], ['i', 'grindless:nitride_film_wafer', [1]], ['m', 'gtceu:beuv_scanner', [2]], ['i', 'grindless:microring_wafer', [3]], ['m', 'gtceu:femtosecond_writer', [4]], ['i', 'grindless:trimmed_microring', [5]], ['m', 'gtceu:photonic_foundry', [6]], ['i', 'grindless:packaged_microcomb', [7]], ['m', 'gtceu:nuclear_clock_lab', [8]], ['i', 'grindless:clock_locked_microcomb', [9]]],
  30: [['i', 'gtceu:mixed_rare_earth_chloride_dust'], ['m', 'gtceu:extraction_cascade', [0]], ['i', 'grindless:er_ho_oxide', [1]], ['m', 'gtceu:levitation_melter', [2]], ['i', 'grindless:er3ni_ingot', [3]], ['i', 'grindless:er3ni_spheres', [4]], ['i', 'grindless:charged_pulse_tube', [5]], ['i', 'grindless:shell_cryocooler', [6]]],
  31: [['i', 'gtceu:fe16n2_dust'], ['m', 'gtceu:nitride_magnet_works', [0]], ['i', 'grindless:fe16n2_ring_magnet', [1]], ['i', 'grindless:yig_film_wafer'], ['m', 'gtceu:yig_lpe_furnace', [3]], ['i', 'grindless:bi_yig_film', [4]], ['m', 'gtceu:tfln_fab', [5]], ['i', 'grindless:yig_on_ln_wafer', [6]], ['m', 'gtceu:femtosecond_writer', [7]], ['i', 'grindless:isolator_waveguide_die', [8]], ['i', 'grindless:max_optical_isolator', [9]]],
  32: [['i', 'grindless:yttrium_oxide_dust'], ['m', 'gtceu:extraction_cascade', [0]], ['i', 'grindless:ybco_precursor_powder', [1]], ['m', 'gtceu:single_crystal_foundry', [2]], ['i', 'grindless:tsmg_ybco_bulk', [3]], ['m', 'gtceu:high_flux_reactor', [4]], ['i', 'grindless:irradiated_ybco_bulk', [5]], ['m', 'gtceu:nitride_magnet_works', [6]], ['i', 'grindless:bearing_rotor_ring', [7]], ['i', 'grindless:sc_magnetic_bearing', [8]]],
  33: [['i', 'gtceu:silicon_dust'], ['m', 'gtceu:crystal_growth_furnace', [0]], ['i', 'grindless:silicon_cavity_spacer', [1]], ['i', 'grindless:gallium_arsenide_wafer'], ['m', 'gtceu:mbe_reactor', [3]], ['i', 'grindless:algaas_bragg_stack', [4]], ['i', 'grindless:released_algaas_film', [5]], ['i', 'grindless:transferred_crystalline_mirror', [6]], ['m', 'gtceu:helium_refrigerator', [7]], ['i', 'grindless:cryo_reference_cavity', [8]]],
  34: [['i', 'gtceu:malachite_dust'], ['m', 'gtceu:extraction_cascade', [0]], ['i', 'grindless:cathode_copper', [1]], ['m', 'gtceu:hot_strip_mill', [2]], ['i', 'grindless:rolled_cu_foil', [3]], ['m', 'gtceu:single_crystal_foundry', [4]], ['i', 'grindless:cu111_foil', [5]], ['i', 'grindless:electropolished_cu111_foil', [6]]],
  35: [['i', 'gtceu:mixed_rare_earth_chloride_dust'], ['m', 'gtceu:extraction_cascade', [0]], ['i', 'grindless:tb_dy_oxide', [1]], ['m', 'gtceu:levitation_melter', [2]], ['i', 'grindless:terfenol_ingot', [3]], ['m', 'gtceu:single_crystal_foundry', [4]], ['i', 'grindless:oriented_terfenol_rod', [5]], ['i', 'grindless:laminated_terfenol_stack', [6]]],
  36: [['i', 'grindless:k2taf7_dust'], ['m', 'gtceu:extraction_cascade', [0]], ['i', 'grindless:hafnium_tantalum_oxide', [1]], ['i', 'grindless:ta_hf_c_powder', [2]], ['m', 'gtceu:spark_plasma_sinterer', [3]], ['i', 'grindless:ta_hf_c_billet', [4]], ['m', 'gtceu:cvi_furnace', [5]], ['i', 'grindless:sealed_hearth_liner', [6]]],
  37: [['i', 'grindless:nsc_planetesimal'], ['m', 'gtceu:asteroid_processor', [0]], ['i', 'grindless:iron_core_fragment', [1]], ['m', 'gtceu:helium_refrigerator', [2]], ['i', 'grindless:cryo_milled_core', [3]], ['i', 'grindless:tetrataenite_concentrate', [4]], ['i', 'grindless:cold_pressed_tetrataenite', [5]], ['m', 'gtceu:nitride_magnet_works', [6]], ['i', 'grindless:halbach_segment_coupler', [7]]],
  38: [['i', 'gtca:silicon_carbide_dust'], ['m', 'gtceu:crystal_growth_furnace', [0]], ['i', 'grindless:sic_substrate_wafer', [1]], ['m', 'gtceu:sic_device_fab', [2]], ['i', 'grindless:sic_cmos_wafer', [3]], ['m', 'gtceu:mtj_sputter_cluster', [4]], ['i', 'grindless:mram_stack_wafer', [5]], ['m', 'gtceu:mtj_sputter_cluster', [6]], ['i', 'grindless:racetrack_memory_die', [7]], ['i', 'grindless:segment_controller', [8]]],
  39: [['i', 'gtceu:hastelloy_c_276_plate'], ['i', 'grindless:fcl_substrate_strip', [0]], ['m', 'gtceu:coated_conductor_line', [1]], ['i', 'grindless:fcl_tape', [2]], ['m', 'gtceu:mtj_sputter_cluster', [3]], ['i', 'grindless:thick_film_fcl_tape', [4]], ['m', 'gtceu:hts_magnet_works', [5]], ['i', 'grindless:fcl_coil', [6]], ['m', 'gtceu:helium_refrigerator', [7]], ['i', 'grindless:cold_fcl_module', [8]]],
  40: [['i', 'gtca:silicon_tetrachloride_dust'], ['i', 'grindless:synthetic_silica_soot', [0]], ['m', 'gtceu:zone_refining_tower', [1]], ['i', 'grindless:ultrapure_silica_tube', [2]], ['m', 'gtceu:fibre_draw_tower', [3]], ['i', 'grindless:hollow_core_fibre', [4]], ['m', 'gtceu:femtosecond_writer', [5]], ['i', 'grindless:endcapped_hc_fibre', [6]], ['i', 'grindless:uv_fibre_harness', [7]]],
  41: [['i', 'gtceu:silicon_dioxide_dust'], ['i', 'grindless:silica_alcogel', [0]], ['i', 'grindless:silylated_alcogel', [1]], ['m', 'gtceu:aerogel_works', [2]], ['i', 'grindless:aerogel_superleak_plug', [3]], ['i', 'grindless:potted_superleak', [4]], ['m', 'gtceu:shequid_works', [5]], ['i', 'grindless:calibrated_superleak', [6]], ['m', 'gtceu:millikelvin_cryostat_works', [7]], ['i', 'grindless:cold_tested_superleak', [8]], ['i', 'grindless:superfluid_valve', [9]]],
  42: [['i', 'grindless:pgm_residue'], ['m', 'gtceu:platinum_plant', [0]], ['i', 'grindless:iridium_sponge', [1]], ['m', 'gtceu:electron_beam_furnace', [2]], ['i', 'grindless:iridium_target', [3]], ['i', 'grindless:sic_mirror_tow'], ['m', 'gtceu:cvi_furnace', [5]], ['i', 'grindless:sic_grazing_shell', [6]], ['m', 'gtceu:mtj_sputter_cluster', [7]], ['i', 'grindless:iridium_coated_shell', [8]], ['i', 'grindless:wolter_mirror_module', [9]]],
  43: [['i', 'gtceu:silicon_dioxide_dust'], ['m', 'gtceu:zone_refining_tower', [0]], ['i', 'grindless:ultrapure_silica_plate', [1]], ['m', 'gtceu:femtosecond_writer', [2]], ['i', 'grindless:laser_welded_glass_cell', [3]], ['i', 'grindless:annealed_glass_cell', [4]], ['m', 'gtceu:mtj_sputter_cluster', [5]], ['i', 'grindless:ar_coated_glass_cell', [6]], ['m', 'gtceu:helium_refrigerator', [7]], ['i', 'grindless:cold_qualified_cell', [8]]],
  44: [['i', 'grindless:semi_insulating_inp_wafer'], ['m', 'gtceu:mocvd_reactor', [0]], ['i', 'grindless:inp_utc_epi_wafer', [1]], ['m', 'gtceu:beuv_scanner', [2]], ['i', 'grindless:utc_photodiode_wafer', [3]], ['i', 'grindless:passivated_utc_wafer', [4]], ['i', 'grindless:utc_die', [5]], ['m', 'gtceu:photonic_foundry', [6]], ['i', 'grindless:photonic_lo_module', [7]]],
  45: [['i', 'gtceu:indium_dust'], ['m', 'gtceu:crystal_growth_furnace', [0]], ['i', 'grindless:semi_insulating_inp_wafer', [1]], ['m', 'gtceu:mbe_reactor', [2]], ['i', 'grindless:inp_hemt_epi', [3]], ['m', 'gtceu:beuv_scanner', [4]], ['i', 'grindless:hemt_gate_wafer', [5]], ['i', 'grindless:hemt_die', [6]], ['m', 'gtceu:helium_refrigerator', [7]], ['i', 'grindless:cryo_tested_lna', [8]], ['i', 'grindless:cryo_lna_module', [9]]],
  46: [['i', 'gtceu:tellurium_dust'], ['m', 'gtceu:crystal_growth_furnace', [0]], ['i', 'grindless:teo2_boule', [1]], ['i', 'grindless:teo2_aod_blank', [2]], ['m', 'gtceu:tfln_fab', [3]], ['i', 'grindless:ln_transducer_bonded_blank', [4]], ['m', 'gtceu:mtj_sputter_cluster', [5]], ['i', 'grindless:electroded_aod', [6]], ['i', 'grindless:crossed_aod_pair', [7]]],
    // L47-L57 (RF-7A, built by MX-S1 to MX-S4). A fourth element is where a side output goes; the main end is the last node without one.
    47: [['i', 'gtceu:platinum_dust'], ['m', 'gtceu:platinum_plant', [0]], ['i', 'grindless:gr_platinum_sponge', [1]], ['m', 'gtceu:levitation_melter', [2]], ['i', 'grindless:au_pt_ingot', [3]], ['i', 'grindless:au_pt_test_mass', [4]], ['m', 'gtceu:mtj_sputter_cluster', [5]], ['i', 'grindless:coated_test_mass', [6]], ['i', 'grindless:gravitational_reference_sensor', [7]], ['m', 'gtceu:horizon_interferometer', [8]],     ['i', 'grindless:cloud_phase_map', [9]], ['i', 'grindless:aln_wafer', []], ['m', 'gtceu:mocvd_reactor', [11]], ['i', 'grindless:uv_led_die', [12], 'the gravitational reference sensor']],
    48: [['i', 'gtceu:silicon_dioxide_dust'], ['m', 'gtceu:zone_refining_tower', [0]], ['i', 'grindless:ultrapure_silica_plate', [1]], ['i', 'grindless:zero_expansion_baseplate', [2]], ['m', 'gtceu:mtj_sputter_cluster', [3]], ['i', 'grindless:coated_bench_optics', [4]], ['i', 'grindless:hydroxide_bonded_bench', [5]], ['m', 'gtceu:photonic_foundry', [6]], ['i', 'grindless:bonded_optical_bench', [7]], ['m', 'gtceu:horizon_interferometer', [8]],     ['i', 'grindless:cloud_phase_map', [9]]],
    49: [['i', 'gtceu:indium_dust'], ['m', 'gtceu:extraction_cascade', [0]], ['i', 'grindless:indium_sulfate', [1]], ['m', 'gtceu:zone_refining_tower', [2]], ['i', 'grindless:six_n_indium', [3]], ['i', 'grindless:wetted_emitter_crown', [4]], ['i', 'grindless:feep_thruster', [5]], ['m', 'gtceu:horizon_interferometer', [6]], ['i', 'grindless:cloud_phase_map', [7]], ['i', 'gtceu:tungsten_dust', []], ['m', 'gtceu:electron_beam_furnace', [9]], ['i', 'grindless:porous_tungsten_crown', [10], 'the wetted emitter crown']],
    50: [['i', 'gtceu:vanadium_magnetite_dust'], ['m', 'gtceu:extraction_cascade', [0]], ['i', 'grindless:vanadium_pentoxide', [1]], ['m', 'gtceu:mtj_sputter_cluster', [2]], ['i', 'grindless:vo2_on_sapphire', [3]], ['m', 'gtceu:beuv_scanner', [4]], ['i', 'grindless:patterned_vo2_metasurface', [5]], ['m', 'gtceu:mtj_sputter_cluster', [6]], ['i', 'grindless:metallised_metasurface', [7]], ['i', 'grindless:tunable_impedance_sheet', [8]], ['m', 'gtceu:ergoregion_synchroniser', [9]], ['i', 'grindless:horizon_phase_lock', [10]], ['m', 'gtceu:mirror_shell', [11]], ['i', 'grindless:horizon_lock', [12]], ['i', 'gtceu:sapphire_dust', []], ['m', 'gtceu:crystal_growth_furnace', [14]], ['i', 'grindless:sapphire_web_wafer', [15], 'the Spintronic Cluster Tool']],
    51: [['i', 'gtceu:niobium_ingot'], ['m', 'gtceu:single_crystal_foundry', [0]], ['i', 'grindless:large_grain_nb_disc', [1]], ['m', 'gtceu:srf_cavity_works', [2]], ['i', 'grindless:nb_driver_cell', [3]], ['i', 'grindless:polished_driver_cell', [4]], ['i', 'grindless:nb3sn_driver_cell', [5]], ['m', 'gtceu:helium_refrigerator', [6]], ['i', 'grindless:conduction_cooled_cell', [7]], ['i', 'grindless:srf_driver_module', [8]], ['m', 'gtceu:ergoregion_synchroniser', [9]], ['i', 'grindless:horizon_phase_lock', [10]], ['m', 'gtceu:mirror_shell', [11]], ['i', 'grindless:horizon_lock', [12]]],
    52: [['i', 'grindless:ablated_shell_segment'], ['m', 'gtceu:segment_reclamation_works', [0]], ['i', 'grindless:stripped_membrane_scrap', [1]], ['m', 'gtceu:biofoundry', [2]], ['i', 'grindless:bioleached_re_liquor', [3]], ['m', 'gtceu:extraction_cascade', [4]], ['i', 'grindless:y_ba_cu_raffinate', [5]], ['i', 'grindless:ybco_oxalate', [6]], ['i', 'grindless:ybco_precursor_powder', [7]]],
    53: [['i', 'grindless:ablated_shell_segment'], ['m', 'gtceu:segment_reclamation_works', [0]], ['i', 'grindless:cryocooler_scrap', [1]], ['i', 'grindless:er3ni_grit', [2]], ['i', 'grindless:er_rich_fraction', [3]], ['m', 'gtceu:extraction_cascade', [4]], ['i', 'grindless:er_ho_oxide', [5]]],
    54: [['i', 'grindless:itbtc_coated_conductor'], ['m', 'gtceu:coated_conductor_line', [0]], ['i', 'grindless:pump_buffered_tape', [1]], ['m', 'gtceu:mtj_sputter_cluster', [2]], ['i', 'grindless:thick_pump_tape', [3]], ['m', 'gtceu:hts_magnet_works', [4]], ['i', 'grindless:flux_pump_stator', [5]], ['m', 'gtceu:nitride_magnet_works', [6]], ['i', 'grindless:fe16n2_rotor_magnet', [7]], ['m', 'gtceu:helium_refrigerator', [8]], ['i', 'grindless:cold_flux_pump', [9]], ['i', 'grindless:hts_flux_pump', [10]], ['m', 'gtceu:horizon_flux_clamp', [11]], ['i', 'grindless:horizon_flux_clamp', [12]], ['m', 'gtceu:mirror_shell', [13]], ['i', 'grindless:horizon_lock', [14]]],
    55: [['i', 'gtceu:sapphire_dust'], ['m', 'gtceu:crystal_growth_furnace', [0]], ['i', 'grindless:sapphire_resonator_disc', [1]], ['i', 'grindless:polished_sapphire_disc', [2]], ['m', 'gtceu:helium_refrigerator', [3]], ['i', 'grindless:cryo_sapphire_oscillator', [4]], ['m', 'gtceu:nuclear_clock_lab', [5]], ['i', 'grindless:clock_steered_oscillator', [6]], ['m', 'gtceu:photonic_foundry', [7]], ['i', 'grindless:optical_phase_lock_unit', [8]], ['i', 'grindless:phase_lock_oscillator_bank', [9]], ['m', 'gtceu:horizon_interferometer', [10]], ['i', 'grindless:calibrated_oscillator_bank', [11]]],
    56: [['i', 'gtceu:neodymium_dust'], ['m', 'gtceu:crystal_growth_furnace', [0]], ['i', 'grindless:nd_yag_boule', [1]], ['i', 'grindless:npro_crystal', [2]], ['m', 'gtceu:photonic_foundry', [3]], ['i', 'grindless:stabilised_npro_laser', [4]], ['m', 'gtceu:horizon_interferometer', [5]], ['i', 'grindless:cloud_phase_map', [6]], ['i', 'grindless:gallium_arsenide_wafer', []], ['m', 'gtceu:mocvd_reactor', [8]], ['i', 'grindless:gaas_808_pump_bar', [9], 'the photonic foundry'], ['i', 'grindless:ultrapure_silica_tube', []], ['m', 'gtceu:fibre_draw_tower', [11]], ['i', 'grindless:yb_doped_fibre', [12], 'the photonic foundry']],
    57: [['i', 'gtceu:silicon_dust'], ['m', 'gtceu:zone_refining_tower', [0]], ['i', 'grindless:fz_silicon_rod', [1]], ['i', 'grindless:fz_wafer', [2]], ['m', 'gtceu:ion_implanter', [3]], ['i', 'grindless:simox_soi_wafer', [4]], ['m', 'gtceu:beuv_scanner', [5]], ['i', 'grindless:rad_hard_fpga_wafer', [6]], ['i', 'grindless:fpga_die', [7]], ['i', 'grindless:phasemeter_board', [8]], ['m', 'gtceu:horizon_interferometer', [9]], ['i', 'grindless:cloud_phase_map', [10]]],
  };
const ENDS = {"1":"the MAX hull and every strand cable","2":"the MAX membrane and belt web","3":"the albedo shell panels","4":"the MAX gradiometer","5":"the squeezed-light chip","6":"the tweezer arrays","7":"the cryogenic interposer","8":"the MAX power die","9":"the MAX field coil","10":"the MAX motor rod and rotor","11":"the membrane belt","12":"the genome archive","13":"the belt segment truss","14":"the stream bundle pellets","15":"the shell droplet radiator","16":"the Sgr A* power loop","17":"the Geroch canister","18":"the shell seed wave packet","19":"the Rydberg logic array","20":"the horizon tether","21":"the imager dish panel","22":"the SIS mixer","23":"the quantum memory node","24":"the Penrose payload","25":"the belt slag pellets","26":"the XUV collector panel","27":"the MAX SMES cell","28":"the Ark capsule","29":"the clock-locked microcomb","30":"the shell cryocooler","31":"the optical isolator","32":"the magnetic bearing","33":"the reference cavity","34":"the copper foil for the vdW cell","35":"the Terfenol stack","36":"the sealed hearth liner","37":"the Halbach coupler","38":"the segment controller","39":"the cold FCL module","40":"the UV fibre harness","41":"the superfluid valve","42":"the Wolter mirror module","43":"the cold-qualified cell","44":"the photonic LO module","45":"the cryo LNA module","46":"the crossed AOD pair","47":"the horizon interferometer (machine 11)","48":"the horizon interferometer (machine 11)","49":"the horizon interferometer (machine 11)","50":"the shell's c3 horizon lock","51":"the shell's c3 horizon lock","52":"the precursor powder of line 32","53":"the Er-Ho oxide of line 30","54":"the shell's c3 horizon lock","55":"the horizon interferometer (machine 11)","56":"the horizon interferometer (machine 11)","57":"the horizon interferometer (machine 11)"};

const title = (id) => id.replace(/^(fluid:)?[a-z0-9_]+:/, '').split('_').map((w) => (w.length <= 3 && /^(sic|pbo|tfln|mtj|snspd|beuv|frc|bz|fcl|smes|yig|hbn|ybco|rebco|aod|lna|utc|inp|hemt|sis|uv|cvi|ppln|eu|yso|teo2|sn|li|cu111|mram|srf|he|gr|npro|nd|yag|simox|soi|fpga|feep|gaas|nb3sn|yb|led|vo2)$/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');

// -- layout engine (as pl-data-opv.mjs): units are runs of nodes; the first is the spine, the rest hang on the nodes already placed
const STEP = 2.5;
const LANE = 2;
const half = (nd) => (nd.size ?? KINDS[nd.kind].size) / 2;

function segHitsBox(a, b, box) {
  let t0 = 0, t1 = 1;
  const dx = b.x - a.x, dy = b.y - a.y;
  const p = [-dx, dx, -dy, dy];
  const q = [a.x - box.x0, box.x1 - a.x, a.y - box.y0, box.y1 - a.y];
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-12) { if (q[i] < 0) return false; continue; }
    const t = q[i] / p[i];
    if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return t1 - t0 > 1e-6;
}

function segCross(a, b, c, d) {
  const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
}

function layout(paths, name, seed = 0) {
  // seeds 0 and 1 are the plain layout; a later seed (tried only when both fail) draws each unit's lane side, and now and then the next unit
  let r = seed;
  const rnd = seed > 1 ? () => { r = (r + 0x6d2b79f5) | 0; let t = Math.imul(r ^ (r >>> 15), 1 | r); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; } : null;
  const nodes = paths.flat();
  const byKey = new Map(nodes.map((nd) => [nd.key, nd]));
  const edges = [];
  for (const nd of nodes) for (const k of nd.from || []) if (byKey.has(k)) edges.push({ a: byKey.get(k), b: nd });
  const placed = new Set();
  const placedEdges = new Set();
  const lane = new Map();
  const put = (nd, x, l) => { nd.x = x; nd.y = LANE * l; lane.set(nd.key, l); };
  paths[0].forEach((nd, i) => put(nd, STEP * i, 0));
  const commit = (unit) => {
    for (const nd of unit) placed.add(nd.key);
    for (const e of edges) if (!placedEdges.has(e) && placed.has(e.a.key) && placed.has(e.b.key)) placedEdges.add(e);
  };
  commit(paths[0]);

  const hits = (a, b, nds, skip) => {
    for (const o of nds) {
      if (o === a || o === b || skip.has(o.key)) continue;
      const h = half(o) * 0.9;
      if (segHitsBox(a, b, { x0: o.x - h, x1: o.x + h, y0: o.y - h, y1: o.y + h })) return true;
    }
    return false;
  };
  const valid = (unit) => {
    const fresh = new Set(unit.map((nd) => nd.key));
    const live = nodes.filter((nd) => placed.has(nd.key) || fresh.has(nd.key));
    for (const nd of unit) {
      for (const o of live) {
        if (o === nd) continue;
        const gap = Math.max(Math.abs(nd.x - o.x), Math.abs(nd.y - o.y)) - half(nd) - half(o);
        if (gap < 0.25) return false;
      }
    }
    const fresher = edges.filter((e) => !placedEdges.has(e) && live.includes(e.a) && live.includes(e.b));
    const all = [...placedEdges, ...fresher];
    for (const e of fresher) {
      const { a, b } = e;
      if (b.x < a.x - 0.01) return false;
      if (Math.abs(b.x - a.x) <= 0.01 && Math.abs(b.y - a.y) > 3.01) return false;
      if (Math.hypot(b.x - a.x, b.y - a.y) > 5.01) return false;
      if (hits(a, b, live, new Set())) return false;
      for (const o of all) {
        if (o === e || o.a === a || o.a === b || o.b === a || o.b === b) continue;
        if (segCross(a, b, o.a, o.b)) return false;
      }
    }
    for (const o of placedEdges) if (hits(o.a, o.b, unit, new Set())) return false;
    return true;
  };

  const todo = new Set(paths.slice(1).map((_, i) => i + 1));
  while (todo.size) {
    let best = null;
    const cands = [];
    for (const ui of todo) {
      const unit = paths[ui];
      const keys = new Set(unit.map((nd) => nd.key));
      const out = edges.filter((e) => keys.has(e.a.key) && placed.has(e.b.key));
      const inn = edges.filter((e) => keys.has(e.b.key) && placed.has(e.a.key));
      if (!out.length && !inn.length) continue;
      let anchor;
      if (out.length) {
        const e = out.reduce((m, o) => (o.b.x < m.b.x ? o : m));
        anchor = { node: e.a, x: e.b.x - STEP, lane: lane.get(e.b.key), dir: 'out' };
      } else {
        const e = inn.reduce((m, o) => (o.a.x < m.a.x ? o : m));
        anchor = { node: e.b, x: e.a.x + STEP, lane: lane.get(e.a.key), dir: 'in' };
      }
      if (!best || anchor.x < best.anchor.x) best = { ui, anchor };
      cands.push({ ui, anchor });
    }
    if (rnd && cands.length > 1 && rnd() < 0.3) best = cands[Math.floor(rnd() * cands.length)];
    if (!best) {
      // a unit with nothing placed to hang on: start it on a fresh lane, taking the unit the most others lead into first
      const deg = (ui) => { const ks = new Set(paths[ui].map((nd) => nd.key)); return edges.filter((e) => (ks.has(e.b.key) && !placed.has(e.a.key) && !ks.has(e.a.key)) || (ks.has(e.a.key) && !placed.has(e.b.key) && !ks.has(e.b.key))).length; };
      const ui = [...todo].reduce((m, o) => (deg(o) > deg(m) ? o : m));
      const l = Math.max(...lane.values()) + 1;
      paths[ui].forEach((nd, j) => put(nd, STEP * j, l));
      commit(paths[ui]);
      todo.delete(ui);
      continue;
    }
    const unit = paths[best.ui];
    const at = unit.indexOf(best.anchor.node);
    const side = rnd ? (rnd() < 0.5 ? 1 : -1) : ((best.ui * 7 + seed) % 2 ? 1 : -1);
    let ok = false;
    for (const gap of [0, STEP, 2 * STEP, 3 * STEP]) {
      for (let d = gap ? 0 : 1; d <= 40 && !ok; d++) {
        for (const l of [best.anchor.lane + d, best.anchor.lane - d].sort((p, q) => Math.abs(p) - Math.abs(q) || (side * (q - p)))) {
          const x0 = best.anchor.x + (best.anchor.dir === 'out' ? -gap : gap);
          unit.forEach((nd, j) => put(nd, x0 + STEP * (j - at), l));
          if (valid(unit)) { ok = true; break; }
        }
      }
      if (ok) break;
    }
    if (!ok) throw new Error(`pl_max: ${name}: no lane for ${unit[0].key}..${unit[unit.length - 1].key}`);
    commit(unit);
    todo.delete(best.ui);
  }
  return nodes;
}

// -- clusters from rows
const P = (prefix, num) => (prefix ? `${prefix}x${num}_` : `l${num}_`);
const resOf = (t, id) => (t === 'm' ? M(id) : t === 'f' ? F(id.replace(/^fluid:/, '')) : I(id));

// a path is a list of [type, id, title, options?]: 'i' item, 'f' fluid, 'm' machine, 'l' link; each step comes from the one before it (keys <prefix>_<index>)
function path(p, spec) {
  return spec.map(([t, id, ttl, o = {}], i) => {
    const key = `${p}_${i}`;
    if (t === 'l') return L(key, 0, 0, id);
    return n(key, 0, 0, resOf(t, id), ttl, { ...(i > 0 ? { from: [`${p}_${i - 1}`] } : {}), ...o, kind: o.kind || (i === 0 ? 'raw' : t === 'm' ? 'ours' : 'product') });
  });
}

// One cluster. spec: rows (the first is the trunk), cut {row: [indexes]} (steps another row already makes), tail {row: [[type, id], ...]} (steps
// that follow a row's end), joins [[to, from]] and set {ref: [from refs]} (refs are 'row.index', 'row.end' or 'h.index' for the head path),
// links [[chapter ref, to]] (a quest link that feeds a step), head (a path that replaces the trunk as the spine), end (the trunk's end text).
function cluster(prefix, name, spec, extra = {}) {
  const { rows, cut = {}, tail = {}, joins = [], set = {}, links = [], head = null } = spec;
  const mainEnd = {};
  const lists = [];
  const sides = new Map();
  for (const num of rows) {
    const p = P(prefix, num);
    const skip = cut[num] || [];
    const ns = [];
    ROWS[num].forEach(([t, id, from, side], i) => {
      if (skip.includes(i)) return;
      const f = (from || []).filter((k) => !skip.includes(k)).map((k) => `${p}${k}`);
      ns.push(n(`${p}${i}`, 0, 0, resOf(t, id), title(id), { kind: i === 0 ? 'raw' : t === 'm' ? 'ours' : 'product', ...(f.length ? { from: f } : {}) }));
      if (side) sides.set(`${p}${i}`, side);
      else mainEnd[num] = `${p}${i}`;
    });
    (tail[num] || []).forEach(([t, id], j) => {
      const key = `${p}${ROWS[num].length + j}`;
      ns.push(n(key, 0, 0, resOf(t, id), title(id), { kind: t === 'm' ? 'ours' : 'product', from: [mainEnd[num]] }));
      mainEnd[num] = key;
    });
    lists.push([num, ns]);
  }
  const ref = (s) => {
    const [r, i] = s.split('.');
    return r === 'h' ? `${prefix}_${i}` : i === 'end' ? mainEnd[r] : `${P(prefix, r)}${i}`;
  };
  const all = lists.flatMap(([, ns]) => ns);
  const head0 = head ? path(prefix, head) : [];
  const byKey = new Map([...all, ...head0].map((nd) => [nd.key, nd]));
  const link = (to, from) => {
    const nd = byKey.get(to);
    if (!nd) throw new Error(`pl_max: ${name}: unknown step ${to}`);
    nd.from = [...(nd.from || []), from];
  };
  for (const [to, from] of joins) link(ref(to), ref(from));
  for (const [r, from] of Object.entries(set)) byKey.get(ref(r)).from = from.map(ref);
  const linkUnits = links.map(([chapterRef, to], i) => {
    const nd = L(`${prefix}lk${i}`, 0, 0, chapterRef);
    link(ref(to), nd.key);
    return [nd];
  });
  // leaves: a step nobody takes is where its row ends (a branch end is a dest node)
  const taken = new Set([...all, ...head0].flatMap((nd) => nd.from || []));
  for (const [num, ns] of lists) {
    for (const nd of ns) {
      if (nd.machine || taken.has(nd.key)) continue;
      nd.end = sides.get(nd.key) || (num === rows[0] && !head ? spec.end : null) || ENDS[num];
      if (nd.key === mainEnd[num] && (num !== rows[0] || head)) nd.kind = 'dest';
    }
  }
  const units = [];
  for (const [, ns] of lists) {
    let cur = null;
    for (const nd of ns) {
      const prev = cur && cur[cur.length - 1];
      if (prev && (nd.from || []).includes(prev.key)) cur.push(nd);
      else { cur = [nd]; units.push(cur); }
    }
  }
  const trunkUnits = units.filter((u) => u.includes(byKey.get(mainEnd[rows[0]])));
  const spine = head ? head0 : trunkUnits[0];
  // long branches are cut into short pieces so each can find its own lane
  for (const u of [...units]) {
    if (u === spine || u.length < 6) continue;
    const pieces = [];
    for (let e = u.length; e > 0; e -= 4) pieces.unshift(u.slice(Math.max(0, e - 4), e));
    units.splice(units.indexOf(u), 1, ...pieces);
  }
  const rest = units.filter((u) => u !== spine);
  const paths = [spine, ...rest, ...linkUnits];
  for (let seed = 0; ; seed++) {
    try { layout(paths, name, seed); break; } catch (e) { if (seed >= 400) throw e; }
  }
  return { name, ...extra, nodes: paths.flat() };
}

// -- the clusters (docs/eras/lines-opv-maxplus.md, section 3)
const m1 = cluster('m1', 'M1 Si-28 qubit line: the MAX stage', {
  rows: [5, 6, 7],
  head: [
    ['l', 'pl_opv:o1_44', 'Tested Tetron Die'],
    ['m', 'gtceu:tfln_fab', 'TFLN Fab'],
    ['i', 'grindless:transducer_bonded_stack', 'Transducer-Bonded Stack'],
    ['m', 'gtceu:photonic_foundry', 'Photonic Foundry'],
    ['i', 'grindless:photonic_tetron_module', 'Photonic Tetron Module'],
    ['m', 'gtceu:millikelvin_cryostat_works', 'Millikelvin Cryostat Works'],
    ['i', 'grindless:calibrated_photonic_module', 'Calibrated Photonic Module'],
    ['m', 'gtceu:membrane_line', 'Membrane Line'],
    ['i', 'grindless:shielded_quantum_module', 'Shielded Quantum Module'],
    ['m', 'gtceu:photonic_integration_hall', 'Photonic Integration Hall'],
    ['i', 'gtnn:supracausal_mainframe', 'Supracausal Mainframe', { end: 'the MAX circuit networks' }],
  ],
  joins: [['h.1', '7.end'], ['h.3', '5.end'], ['h.9', '6.end']],
}, { line: 'si28' });

const m2 = cluster('m2', 'M2 Horizon strand and the tether', {
  rows: [20, 1],
  cut: { 20: [0], 1: [8] },
  set: { '1.6': ['1.5'], '1.9': ['1.7'] },
  joins: [['20.1', '1.7']],
});

const lock = cluster('lk', 'M3 The horizon lock', {
  rows: [50, 18, 14, 51, 54, 55, 48, 47, 49, 56, 57],
  cut: { 51: [10, 11, 12, 13], 54: [14, 15], 47: [9, 10], 49: [7, 8], 56: [6, 7], 57: [10, 11] },
  joins: [
    ['50.12', '54.end'], ['50.10', '51.end'],
    ['48.9', '47.8'],['47.8', '47.13'], ['49.5', '49.11'], ['56.4', '56.10'], ['56.4', '56.13'],
    ['50.3', '50.16'], ['48.9', '56.5'],
  ],
  links: [['pl_opv:o3_11', '18.8']],
});

const m4 = cluster('m4', 'M4 The belt and the mirror segment', {
  rows: [13, 37, 30, 38, 15, 53, 25, 36, 42],
  cut: { 53: [6] },
  tail: { 13: [['m', 'gtceu:swarm_segment_foundry'], ['i', 'grindless:mirror_shell_segment']] },
  joins: [['13.10', '37.end'], ['13.10', '30.end'], ['30.2', '53.5'], ['42.8', '42.4']],
  set: { '15.9': ['15.2', '15.5', '15.8'] },
  end: 'the mirror shell segment',
});

const m5 = cluster('m5', 'M5 MAX components', {
  rows: [41, 4, 9, 10, 11, 31, 32, 35, 52],
  cut: { 52: [8] },
  tail: { 41: [['i', 'grindless:max_fluid_regulator']] },
  joins: [['32.2', '52.7'], ['32.7', '31.2']],
  set: { '4.11': ['4.4', '4.7', '4.10'] },
  end: 'the MAX fluid regulator',
});

const m6 = cluster('m6', 'M6 Gene ark', {
  rows: [12, 28],
  cut: { 28: [0] },
  joins: [['28.1', '12.2']],
});

const m7 = cluster('m7', 'M7 Photon ring imager parts', {
  rows: [21, 22, 44, 45],
  tail: { 21: [['m', 'gtceu:photon_ring_imager'], ['i', 'grindless:sgr_a_spin_map']] },
  joins: [['21.10', '22.end'], ['21.10', '44.end'], ['21.10', '45.end']],
  end: 'the Sgr A* spin map',
});

const m8 = cluster('m8', 'M8 Neutral-atom logic', {
  rows: [19, 40, 46],
  joins: [['19.8', '40.end'], ['19.8', '46.end'], ['19.8', '19.2']],
});

const membrane = cluster('ms', 'Superconducting membrane', { rows: [2, 34], cut: { 2: [0] }, joins: [['2.1', '34.end']] });
const one = (num, name) => cluster('', name, { rows: [num] });

export default {
  file: 'pl_max',
  order: 14,
  title: 'MAX Lines',
  subtitle: 'The qubit line, strand and tether, the horizon lock, the mirror segment, components, the gene ark, imaging and neutral-atom logic',
  icon: 'gtceu:max_machine_casing',
  focus: 'm1_1',
  bands: [['m1', 'm2'], ['lock', 'm4'], ['m5', 'm6'], ['m7', 'm8'], ['membrane', 'albedo'], ['diamond', 'frc'], ['geroch', 'memory'], ['penrose', 'xuv'], ['smes', 'microcomb'], ['refcavity', 'fcl'], ['cell']],
  clusters: {
    m1, m2, lock, m4, m5, m6, m7, m8,
    membrane,
    albedo: one(3, 'Albedo panel'),
    diamond: one(8, 'Diamond power die'),
    frc: one(16, 'Flux-loaded FRC'),
    geroch: one(17, 'Geroch canister'),
    memory: one(23, 'Quantum memory node'),
    penrose: cluster('', 'Penrose payload', { rows: [24], set: { '24.9': ['24.5', '24.8'] } }),
    xuv: one(26, 'XUV collector panel'),
    smes: one(27, 'SMES toroid'),
    microcomb: one(29, 'Microcomb'),
    refcavity: one(33, 'Reference cavity'),
    fcl: one(39, 'Fault-current limiter'),
    cell: one(43, 'Cold glass cell'),
  },
};
