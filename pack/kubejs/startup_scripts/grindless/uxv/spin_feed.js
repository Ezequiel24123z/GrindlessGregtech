// priority: -10932
// -----------------------------------------------------------------------------------------------
// UXV spintronic feedstock (package UXV-A2, docs/eras/uxv.md "A2"): the intermediates of the older plants' new rows. Recipes: the older
// machines' own files (ev/extraction_cascade.js, ev/platinum_plant.js, iv/fluorspar_kiln.js, zpm/europium.js, uv/detectors.js,
// tables/am_powders.json) and server_scripts/grindless/uxv/spin_feed.js. No machine, no recipe type. Published in global.grindless.spinFeed.
//
//   GTM has no dysprosium, scandium or strontium material in this pack's dump, so those oxides are plain grindless: dusts. The 5N and 7N
//   grades, the fume and dross of the oxide lines, the powder bed's powders, near-net parts and HIP blanks, and a spent CoFeB target are ours.
// Textures: not drawn by this package (tools/assets is not in its contract). Names: client_scripts/grindless/uxv_spin_feed_lang.js.
(function () {
  const G = global.grindless
  const SF = G.spinFeed || (G.spinFeed = {})

  // item name -> stack size; every item carries one tooltip line (tooltip.grindless.<name>.0)
  const ITEMS = {
    dysprosium_oxide_dust: 64,
    dysprosium_dust: 64,
    scandium_oxide_dust: 64,
    strontium_carbonate_dust: 64,
    magnesium_hydroxide_dust: 64,
    five_n_magnesia_dust: 64,
    five_n_platinum: 64,
    five_n_ruthenium: 64,
    five_n_iridium: 64,
    seven_n_tellurium: 64,
    seven_n_germanium: 64,
    bfo_fume: 64,
    lpe_dross: 64,
    dysco3_charge_dust: 64,
    ggg_charge_dust: 64,
    srruo3_charge_dust: 64,
    la_bfo_charge_dust: 64,
    gum_metal_blend: 64,
    cofeb_am_powder: 64,
    heusler_am_powder: 64,
    mgo_am_powder: 64,
    ruthenium_am_powder: 64,
    srruo3_am_powder: 64,
    la_bfo_am_powder: 64,
    near_net_cofeb_blank: 16,
    near_net_heusler_blank: 16,
    near_net_mgo_blank: 16,
    near_net_saf_blank: 16,
    near_net_srruo3_blank: 16,
    near_net_la_bfo_blank: 16,
    cofeb_hip_blank: 16,
    heusler_hip_blank: 16,
    mgo_hip_blank: 16,
    saf_hip_blank: 16,
    srruo3_hip_blank: 16,
    la_bfo_hip_blank: 16,
    spent_cofeb_target: 16
  }

  SF.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name])
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    })
  })
})()
