// priority: -10935
// -----------------------------------------------------------------------------------------------
// UXV spintronic rows (package UXV-A3, docs/eras/uxv.md "A3"): the intermediates between the older shared machines' new rows (the tables
// of the UEV electron beam furnace, nitride magnet works, crystal growth, levitation melter, megabar press, UHV foundry, UV MOCVD and ZPM
// ion implanter) and the F1 ids they end in. No machine, no recipe type. Recipes: those tables and server_scripts/grindless/uxv/spin_rows.js.
// Published in global.grindless.spinRows.items.
//
//   5N metals: the electron beam furnace's new grades (Ta and Pt already have a grade: 6N Ta, and A2's 5N Pt).
//   Wafer stages: the stack from the deposition machines (UXV-A4) passes anneal, etch and cap stages here before it is an F1 die.
//   Raw crystals and boules: the CVT, Czochralski and EFG growth rows end here; the own server file slices, polishes and anneals them.
// Textures: not drawn by this package (tools/assets is not in its contract). Names: client_scripts/grindless/uxv_spin_rows_lang.js.
(function () {
  const G = global.grindless
  const SR = G.spinRows || (G.spinRows = {})

  // item name -> stack size; every item carries one tooltip line (tooltip.grindless.<name>.0)
  const ITEMS = {
    five_n_cobalt: 64,
    five_n_iron: 64,
    five_n_manganese: 64,
    five_n_silicon: 64,
    five_n_nickel: 64,
    five_n_gallium: 64,
    mu_metal_blend: 64,
    mu_metal_ingot: 64,
    mu_metal_hot_band: 64,
    annealed_mu_foil: 64,
    mu_metal_shield_can: 16,
    finemet_charge_dust: 64,
    heusler_cast_ingot: 64,
    ni_mn_ga_raw_crystal: 16,
    raw_hbn_crystal: 16,
    wte2_raw_crystal: 16,
    fgt_raw_crystal: 16,
    dysco3_boule: 16,
    ggg_boule: 16,
    ga2o3_efg_plate: 16,
    dysco3_slice: 64,
    dysco3_polished_slice: 64,
    ggg_slice: 64,
    ggg_polished_slice: 64,
    ga2o3_slice: 64,
    annealed_mtj_wafer: 16,
    etched_mtj_wafer: 16,
    annealed_mram_wafer: 16,
    etched_mram_wafer: 16,
    annealed_saf_wafer: 16,
    written_track_wafer: 16,
    sot_heterostack: 16,
    contacted_sot_stack: 16,
    cofe_me_wafer: 16,
    yig_film_wafer: 16,
    yig_waveguide_wafer: 16,
    stno_defined_wafer: 16,
    stno_milled_wafer: 16,
    stno_clean_wafer: 16,
    stno_planarised_wafer: 16,
    stno_redeposit_dust: 64,
    ga2o3_epi_wafer: 16,
    ga2o3_gated_wafer: 16
  }

  SR.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name])
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    })
  })
})()
