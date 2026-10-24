// -----------------------------------------------------------------------------------------------
// LV era: the Creature Simulator. Mob drops without mobs: the model of a creature (never used up) + biomass + the
// creature's mineral + a programmed circuit give its drops. Nobody is hunted and nothing is farmed by hand.
//
//   gtceu:creature_simulation          recipe type. in: model (not consumed) + mineral + biomass (fluid) + a programmed
//                                      circuit (selects the drop roll)   out: the drops. The recipes are generated from
//                                      data/grindless/tables/mobs.json by server_scripts/grindless/lv/creatures.js.
//   gtceu:<tier>_creature_simulator    single-block machine, tiers LV, MV, HV and EV (GTM's 'simple' machine builder:
//                                      same GUI, circuit slot and overclocking as every GT single block; the hull is
//                                      the voltage hull of the tier). GTM refuses a recipe above the machine's voltage,
//                                      so the tier of a creature (mobs.json) is its EU/t.
//   grindless:blank_creature_model     ingredient of every model, made in the LV assembler
//   grindless:creature_model_<id>      one per creature of mobs.json, printed from a blank model
//
// Names / tooltips: client_scripts/grindless/lv_creatures_lang.js. Textures: item/blank_creature_model (blank model),
// item/creature_model_base (layer0) and item/creature_model_core (layer1, tinted with the colour of the creature);
// machine overlay in the grindless namespace: block/machines/creature_simulator/overlay_front(_active).png.
//
// Everything is wrapped in a function: all startup scripts share one scope (see lib/patterns.js).
(function () {
  const G = global.grindless || (global.grindless = {})
  if (typeof G.readJsonTable !== 'function') {
    throw new Error('[grindless/creatures] lib/tables.js has to load first (it has priority 900)')
  }
  G.tables = G.tables || {}
  G.tables.mobs = G.readJsonTable('kubejs/data/grindless/tables/mobs.json')

  const TABLE = G.tables.mobs
  if (!TABLE || !TABLE.mobs || TABLE.mobs.length === 0 || !TABLE.biomass) {
    throw new Error('[grindless/creatures] mobs.json has no mobs / no biomass')
  }
  console.info('[grindless/creatures] loaded ' + TABLE.mobs.length + ' creatures')

  const TIER_NAMES = ['', 'LV', 'MV', 'HV', 'EV']

  // "Tricalcium Phosphate Dust" for the GT dusts (their lang entries are built from the material), the vanilla
  // item name for everything else. Both keys resolve at render time, so this works before the items exist.
  function itemName(id) {
    var parts = String(id).split(':')
    var path = parts[1]
    if (parts[0] === 'gtceu' && /_dust$/.test(path)) {
      return Text.translate('tagprefix.dust', Text.translate('material.gtceu.' + path.substring(0, path.length - 5)))
    }
    return Text.translate('item.' + parts[0] + '.' + path)
  }

  // ---------------------------------------------------------------- recipe type
  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    // 3 item inputs: model, mineral and the (ghost) circuit; 4 drops; biomass in. No fluid out.
    event.create('creature_simulation')
      .category('electric')
      .setEUIO('in')
      .setMaxIOSize(3, 4, 1, 0)
      .setSlotOverlay(false, false, true, GuiTextures.INT_CIRCUIT_OVERLAY)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.CHEMICAL)
  })

  // ---------------------------------------------------------------- machine
  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    event.create('creature_simulator', 'simple')
      .tiers(GTValues.LV, GTValues.MV, GTValues.HV, GTValues.EV)
      .addDefaultModel(false)
      .definition(function (tier, builder) {
        builder
          .recipeType('creature_simulation')
          .workableTieredHullModel('grindless:block/machines/creature_simulator')
        builder["tooltips(net.minecraft.network.chat.Component[])"]([
          Text.translate('grindless.machine.creature_simulator.tooltip.0'),
          Text.translate('grindless.machine.creature_simulator.tooltip.1'),
          Text.translate('grindless.machine.creature_simulator.tooltip.2')
        ])
      })
  })

  // ---------------------------------------------------------------- items
  StartupEvents.registry('item', function (event) {
    // texture: item/blank_creature_model (the KubeJS default for this id)
    event.create('grindless:blank_creature_model')
      .tooltip(Text.gray(Text.translate('tooltip.grindless.blank_creature_model')))

    TABLE.mobs.forEach(function (mob) {
      var model = event.create('grindless:creature_model_' + mob.id)
        .texture('layer0', 'grindless:item/creature_model_base')
        .texture('layer1', 'grindless:item/creature_model_core')
        .color(1, mob.color)
        .maxStackSize(16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.creature_model')))

      if (mob.mineral) {
        model.tooltip(Text.darkGray(Text.translate('tooltip.grindless.creature_model.mineral',
          String(mob.biomass_mb), String(mob.mineral.n), itemName(mob.mineral.item))))
      } else {
        model.tooltip(Text.darkGray(Text.translate('tooltip.grindless.creature_model.biomass_only',
          String(mob.biomass_mb))))
      }
      if (mob.tier > 1) {
        model.tooltip(Text.darkGray(Text.translate('tooltip.grindless.creature_model.tier', TIER_NAMES[mob.tier])))
      }
      model.tag('grindless:creature_models')
    })
  })
})()
