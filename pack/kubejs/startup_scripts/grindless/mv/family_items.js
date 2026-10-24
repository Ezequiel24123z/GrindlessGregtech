// -----------------------------------------------------------------------------------------------
// MV item of the Vein Drill family:
//   grindless:vanadium_steel_drill_bit   wear part of the MV Vein Drill, the third bit after the bronze and steel ones (item tag
//                                        grindless:drill_bits): consumed by chance, ~1 % of the runs (~0.5 % with drilling fluid)
//                                        against 4 % / 2 % for the steel bit. Its recipes only run in the MV drill.
// Name / tooltip: client_scripts/grindless/mv_family_lang.js. Texture: item/vanadium_steel_drill_bit (drawn separately).
(function () {
  StartupEvents.registry('item', function (event) {
    event.create('grindless:vanadium_steel_drill_bit')
      .texture('grindless:item/vanadium_steel_drill_bit')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.vanadium_steel_drill_bit')))
      .tag('grindless:drill_bits')
  })
})()
