// -----------------------------------------------------------------------------------------------
// The IV drill bit of the Vein Drill family (docs/eras/iv.md, "Family steps"):
//
//   grindless:tungsten_steel_drill_bit   the wear part of the IV drills: the Mercury vein drill (startup_scripts/grindless/iv/mercury.js)
//                                        and the pressurized vein drill (Venus and Mars). Item tag grindless:drill_bits, like every bit
//                                        of the family. Turned on the IV lathe from a long tungsten steel rod
//                                        (server_scripts/grindless/iv/mercury.js, grindless:lathe/tungsten_steel_drill_bit): IV has
//                                        tungsten from Mars, and nothing below IV can turn it.
//
// One registration for both IV drills: published as global.grindless.ivDrillBit (.item, .lathe), so no other script registers it
// again. Name and tooltips: client_scripts/grindless/iv_mercury_lang.js. Texture: item/tungsten_steel_drill_bit, drawn by
// tools/assets/Build-EVTextures.ps1 -Only bit (the bit EV's generator already drew when the bit was planned for EV).
(function () {
  const G = global.grindless || (global.grindless = {})

  G.ivDrillBit = {
    item: 'grindless:tungsten_steel_drill_bit',
    lathe: 'grindless:lathe/tungsten_steel_drill_bit',
    rod: 'gtceu:long_tungsten_steel_rod',
    eut: 7680,
    duration: 200
  }

  StartupEvents.registry('item', function (event) {
    event.create(G.ivDrillBit.item)
      .texture('grindless:item/tungsten_steel_drill_bit')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.tungsten_steel_drill_bit.0')))
      .tooltip(Text.darkGray(Text.translate('tooltip.grindless.tungsten_steel_drill_bit.1')))
      .tag('grindless:drill_bits')
  })
})()
