// priority: -7000
// -----------------------------------------------------------------------------------------------
// Steam era: the Horizon Collector (docs/eras/steam.md, "The Horizon Collector (the start)"; package STEAM-X1). The machine the
// player arrives with: a shard (never used up) + a programmed circuit pull a flood of ordinary matter (logs, cobblestone, sand,
// gravel, clay, coal, flint, raw copper, tin and iron: several stacks every 8 s) out of nowhere. It is never craftable; the Welcome quest gives it once per player.
//
//   gtceu:horizon_collection      recipe type. in: grindless:horizon_shard (not consumed) + a programmed circuit   out: up to 4 stacks.
//                                 The recipes are generated from data/grindless/tables/horizon_collector.json by
//                                 server_scripts/grindless/steam/horizon_collector.js.
//   gtceu:lv_horizon_collector    single-block machine, LV only (GTM's 'simple' builder). A GTM solar panel cover fits only on
//                                 its top face (CoverSolarPanel#canAttach) and powers it by day.
//   grindless:horizon_shard       the catalyst. Never craftable.
//
// Names / tooltips: client_scripts/grindless/steam_horizon_lang.js. Textures (tools/assets/Build-HorizonCollectorTextures.ps1):
// item/horizon_shard and block/machines/horizon_collector/overlay_front(_active).
//
// Everything is wrapped in a function: all startup scripts share one scope (see lib/patterns.js).
(function () {
  // ---------------------------------------------------------------- recipe type
  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // 2 item inputs: the shard and the (ghost) circuit; 4 outputs (up to four full stacks per run). No fluids.
    event.create('horizon_collection')
      .category('electric')
      .setEUIO('in')
      .setMaxIOSize(2, 4, 0, 0)
      .setSlotOverlay(false, false, true, GuiTextures.INT_CIRCUIT_OVERLAY)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.SCIENCE)
  })

  // ---------------------------------------------------------------- machine
  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    event.create('horizon_collector', 'simple')
      .tiers(GTValues.LV)
      .addDefaultModel(false)
      .definition(function (tier, builder) {
        builder
          .recipeType('horizon_collection')
          .workableTieredHullModel('grindless:block/machines/horizon_collector')
        builder["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.horizon_collector.tooltip.0'),
          Text.translate('grindless.machine.horizon_collector.tooltip.1'),
          Text.translate('grindless.machine.horizon_collector.tooltip.2')
        ])
      })
  })

  // ---------------------------------------------------------------- items
  StartupEvents.registry('item', function (event) {
    // texture: item/horizon_shard (the KubeJS default for this id)
    event.create('grindless:horizon_shard')
      .maxStackSize(1)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.horizon_shard')))
      .tooltip(Text.darkGray(Text.translate('tooltip.grindless.horizon_shard.use')))
  })
})()
