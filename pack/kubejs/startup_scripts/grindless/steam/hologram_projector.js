// priority: -6900
// -----------------------------------------------------------------------------------------------
// Hologram Projector (grindless:hologram_projector), the Steam Age multiblock helper:
//   right-click a multiblock controller       a hologram of the structure for 30 s (GTM's in-world preview; click again to hide it)
//   sneak + right-click a controller          builds the structure's default blocks from the inventory: casings, coils, glass,
//                                             frames, pipes... Never a hatch, bus or any other part, and it never breaks a block
// Logic: server_scripts/grindless/steam/hologram_projector.js. Hologram: client_scripts/grindless/hologram_projector.js.
// Names and tooltips: client_scripts/grindless/hologram_projector_lang.js. Texture: tools/assets/Build-HologramProjectorTextures.ps1.
(function () {
  StartupEvents.registry('item', function (event) {
    event.create('grindless:hologram_projector')
      .texture('grindless:item/hologram_projector')
      .maxStackSize(1)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.hologram_projector.0')))
      .tooltip(Text.gray(Text.translate('tooltip.grindless.hologram_projector.1')))
      .tooltip(Text.darkGray(Text.translate('tooltip.grindless.hologram_projector.2')))
  })
})()
