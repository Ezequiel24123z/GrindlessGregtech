// priority: -7400
// -----------------------------------------------------------------------------------------------
// Recipe types of the custom Steam Age multiblocks. GTM registers recipe types (and machines) in its own
// namespace, so the ids are gtceu:vein_drilling and gtceu:greenhouse. The same two types are shared by
// the electric drills / greenhouses of later tiers.
//
//   vein_drilling   in : 1 vein sample (not consumed) + 1 drill bit (consumed by chance)   out: raw ores + stone
//   greenhouse      in : 1 sapling / seed (not consumed) [+ fertilizer]                     out: logs, crops, resin...
//
// Steam machines have no fluid hatch that is craftable without electricity, so neither type takes fluids
// (see DECISIONS / the vapor era notes): max fluid inputs/outputs = 0.
// Names: assets/grindless/lang/*.json (gtceu.vein_drilling, gtceu.greenhouse).
(function () {
  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create('vein_drilling')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(2, 8, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.MINER)

    event.create('greenhouse')
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(2, 4, 0, 0)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.BOILER)
  })
})()
