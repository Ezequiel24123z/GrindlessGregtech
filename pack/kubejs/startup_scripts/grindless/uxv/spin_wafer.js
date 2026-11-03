// priority: -10934
// -----------------------------------------------------------------------------------------------
// UXV's spintronic wafer (package D4-UXV-SPIN, docs/eras/lines-uev-uxv.md section 4, X1 steps 7, 8 and 25 to 28): the 28Si wafer takes a CMOS
// layer and a metal layer, then the MRAM, racetrack, STNO bus and MESO layers, and is cut into the dies of the spintronic mainframe.
// No machine, no recipe type. Recipes: data/grindless/tables/spin_logic.json. Names: client_scripts/grindless/uxv_spin_wafer_lang.js.
// Textures: tools/assets/Build-UXVSpinWaferTextures.ps1.
(function () {
  const G = global.grindless
  const SW = G.spinWafer || (G.spinWafer = {})

  // item name -> stack size; every item carries one tooltip line (tooltip.grindless.<name>.0)
  const ITEMS = {
    si28_cmos_wafer: 16,
    si28_m1_wafer: 16,
    me_on_spin_wafer: 16,
    meso_spin_wafer: 16,
    spintronic_wafer: 16,
    spintronic_die: 64
  }

  SW.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name])
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    })
  })
})()
