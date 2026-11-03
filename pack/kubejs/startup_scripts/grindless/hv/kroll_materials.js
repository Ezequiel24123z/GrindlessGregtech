// priority: -1825
// -----------------------------------------------------------------------------------------------
// D1-KROLL (docs/eras/lines-steam-hv.md, H4): the crude titanium tetrachloride of the Kroll line.
//   gtceu:crude_titanium_tetrachloride   the chlorinator's raw liquid: TiCl4 with its real impurities (VOCl3, SiCl4).
//                                        server_scripts/grindless/hv/kroll.js distils it into pure TiCl4 and brine.
// Name: client_scripts/grindless/hv_kroll_lang.js.
(function () {
  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create('crude_titanium_tetrachloride')
      .liquid()
      .color(0xD9C27A)
      .formula('TiCl4(VOCl3)(SiCl4)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
  })
})()
