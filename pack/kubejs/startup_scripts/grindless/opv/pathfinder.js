// priority: -6811
// Gregtech Grindless - the intermediates of OpV-R1 "Pathfinder" (docs/eras/opv.md R1, process lines 41 and 42). The probe, the launched probe,
// the XNAV unit, the node power transmitter and the vitamin kit are F1's (startup_scripts/grindless/opv/foundation.js); only the steps
// between the older machines' rows and those products are registered here:
//
//   line 41, XNAV unit:        polycapillary_optic -> xray_timing_head (+ sdd_die; the rejected heads go to the extraction cascade)
//                              -> clock_locked_head -> xnav_unit (X-ray pulse profiler, at J0437 only)
//   line 42, node transmitter: gan_mmic -> gan_mmic_tile (SiC device fab) -> tested_mmic_tile (hot cell; the rejected tiles go to the
//                              extraction cascade) -> sealed_mmic_tile (electron beam furnace, circuit 24) -> node_power_transmitter
//
// Textures: tools/assets/Build-OpVPathfinderTextures.ps1. Names: client_scripts/grindless/opv_pathfinder_lang.js.
(function () {
  const G = global.grindless || (global.grindless = {})
  const OPR = G.opvPathfinder || (G.opvPathfinder = {})

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    polycapillary_optic: { stack: 64 },
    xray_timing_head: { stack: 16 },
    rejected_timing_head: { stack: 64 },
    clock_locked_head: { stack: 16 },
    gan_mmic_tile: { stack: 64 },
    tested_mmic_tile: { stack: 64 },
    rejected_mmic_tile: { stack: 64 },
    sealed_mmic_tile: { stack: 64 }
  }

  OPR.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })

  function tooltips(item, name) {
    item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
    item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
      tooltips(item, name)
    })
  })
})()
