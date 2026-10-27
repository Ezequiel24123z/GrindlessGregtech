// priority: -2600
// -----------------------------------------------------------------------------------------------
// IV foundation: the shared registrations that the IV packages build on (docs/eras/iv.md, "Raising IV to the target"). No machines
// and no recipe types here. Every other IV package uses exactly these ids; they are published in global.grindless.ivFoundation.
//
//   GT materials (their items and fluids are gtceu:, like every GTM material):
//     heavy_water               D2O, a liquid. Electrolysis splits it into deuterium and oxygen (server script: GTM's own water
//                               electrolysis numbers), so GTM's automatic decomposition is off. The reactor's moderator, and the
//                               pack's first deuterium.
//     heavy_water_concentrate   the heavy-water plant's exchange product: water at about 20 % D2O, the real product of the Girdler
//                               sulfide towers. A liquid; nothing splits it but the plant's finishing mode.
//     tritiated_heavy_water     the reactor's activated moderator: heavy water carrying DTO. A liquid with GTM's radioactive hazard
//                               (GTM's tritium has the same, multiplier 1). Only the tritium removal facility on the Moon splits it.
//     zircaloy                  Zircaloy-4 cladding alloy: zirconium with about 1.5 % tin (63 Zr : 1 Sn in atoms, 2 % by mass). Ingot,
//                               nugget and dust; blast temperature 2,100 K under argon (zirconium melts at 2,128 K and real zircaloy is
//                               vacuum-arc melted), so GTM's EBF makes the hot ingot and the vacuum freezer cools it. The fuel
//                               fabrication plant draws it into cladding tubes.
//     hermean_regolith          dust only (gtceu:hermean_regolith_dust): ground Mercury rock, for the Mercury solar works' bricks.
//                               DISABLE_DECOMPOSITION, like the lunar regolith.
//     iridosmine                the iridium-osmium alloy of Mercury's vein: ore (gtceu:mercury_iridosmine_ore through GCYR's mercury
//                               prefix, placed by data/grindless/tables/veins_mercury.json), raw, crushed, purified, refined and dust
//                               forms. DISABLE_DECOMPOSITION and NO_ORE_SMELTING: only the platinum plant's mode 3 splits it into
//                               iridium and osmium. Ore byproducts graphite and sulfur, the minerals it grows with on Mercury.
//   GCYR's fluorite (gcyr:fluorite, CaF2) gets DISABLE_DECOMPOSITION (materialModification): with its IV vein it would otherwise be
//   split by GTM's automatic electrolysis, a fluorine route around the fluorspar kiln.
//
//   Items (grindless:), names in client_scripts/grindless/iv_foundation_lang.js; each recipe belongs to the package that makes it:
//     leu_pellet, zircaloy_cladding_tube, leu_fuel_assembly          fuel fabrication plant (uranium cycle)
//     mox_fuel_assembly, breeder_fuel_assembly, pube_neutron_source, rtg_pellet   hot cell
//     spent_fuel_assembly, spent_breeder_assembly                    what the fission reactor leaves (LEU and MOX cores / the breeder)
//     ion_exchange_resin, platinum_gauze                             recipes here (server_scripts/grindless/iv/foundation.js)
//     inner_planets_chart                                            the deep space antenna writes it (travel and network)
//   Blocks (grindless:):
//     hermean_heat_shield_brick   Mercury's casing (its texture is the casing texture of the Mercury multiblocks); the solar works sinters it
//     hermean_thin_film_panel     the Mercury solar field's panel, a thin slab like the Solar Wing Panel; the solar works makes it
//
//   Vein samples (grindless:vein_sample_<id>), one per vein of these tables, also loaded here into global.grindless.tables.<name>:
//     data/grindless/tables/veins_venus.json     naquadah_venus       (the pressurized vein drill, on Venus)
//     data/grindless/tables/veins_mercury.json   iridosmine_mercury   (the Mercury vein drill)
//     data/grindless/tables/veins_leach.json     pitchblende_end      (the in-situ leach field, in the End; no drill takes it)
//   The fluorite vein's sample (grindless:vein_sample_fluorite) comes from veins_overworld_extra.json, like the other Overworld veins.
//
// Textures: tools/assets/Build-IVFoundationTextures.ps1.
(function () {
  const G = global.grindless
  const IVF = G.ivFoundation || (G.ivFoundation = {})
  const LOG = '[grindless/iv] '

  // ---------------------------------------------------------------- tables

  ;['veins_venus', 'veins_mercury', 'veins_leach'].forEach(function (name) {
    G.tables[name] = G.readJsonTable('kubejs/data/grindless/tables/' + name + '.json')
    if (!G.tables[name] || !G.tables[name].veins || G.tables[name].veins.length === 0) {
      throw new Error(LOG + name + '.json has no veins')
    }
  })
  console.info(LOG + 'loaded ' + G.tables.veins_venus.veins.length + ' Venus, ' + G.tables.veins_mercury.veins.length + ' Mercury and ' +
    G.tables.veins_leach.veins.length + ' leach-field veins')

  // ---------------------------------------------------------------- ids

  IVF.materials = {
    heavyWater: 'heavy_water',
    heavyWaterConcentrate: 'heavy_water_concentrate',
    tritiatedHeavyWater: 'tritiated_heavy_water',
    zircaloy: 'zircaloy',
    hermeanRegolith: 'hermean_regolith',
    iridosmine: 'iridosmine'
  }

  IVF.ids = {
    heavyWater: 'gtceu:heavy_water',
    heavyWaterConcentrate: 'gtceu:heavy_water_concentrate',
    tritiatedHeavyWater: 'gtceu:tritiated_heavy_water',
    zircaloyIngot: 'gtceu:zircaloy_ingot',
    zircaloyNugget: 'gtceu:zircaloy_nugget',
    zircaloyDust: 'gtceu:zircaloy_dust',
    hotZircaloyIngot: 'gtceu:hot_zircaloy_ingot',
    hermeanRegolithDust: 'gtceu:hermean_regolith_dust',
    iridosmineDust: 'gtceu:iridosmine_dust',
    iridosmineRaw: 'gtceu:raw_iridosmine',
    iridosmineCrushed: 'gtceu:crushed_iridosmine_ore',
    iridosmineMercuryOre: 'gtceu:mercury_iridosmine_ore',
    leuPellet: 'grindless:leu_pellet',
    zircaloyCladdingTube: 'grindless:zircaloy_cladding_tube',
    leuFuelAssembly: 'grindless:leu_fuel_assembly',
    moxFuelAssembly: 'grindless:mox_fuel_assembly',
    breederFuelAssembly: 'grindless:breeder_fuel_assembly',
    spentFuelAssembly: 'grindless:spent_fuel_assembly',
    spentBreederAssembly: 'grindless:spent_breeder_assembly',
    pubeNeutronSource: 'grindless:pube_neutron_source',
    rtgPellet: 'grindless:rtg_pellet',
    ionExchangeResin: 'grindless:ion_exchange_resin',
    platinumGauze: 'grindless:platinum_gauze',
    innerPlanetsChart: 'grindless:inner_planets_chart',
    hermeanHeatShieldBrick: 'grindless:hermean_heat_shield_brick',
    hermeanThinFilmPanel: 'grindless:hermean_thin_film_panel',
    radiationProofCasing: 'gtnn:radiation_proof_machine_casing',
    fluoriteDust: 'gcyr:fluorite_dust',
    fluoriteRaw: 'gcyr:raw_fluorite'
  }

  IVF.samples = {
    naquadahVenus: 'grindless:vein_sample_naquadah_venus',
    iridosmineMercury: 'grindless:vein_sample_iridosmine_mercury',
    pitchblendeEnd: 'grindless:vein_sample_pitchblende_end',
    fluorite: 'grindless:vein_sample_fluorite'
  }

  IVF.dimensions = { venus: 'gcyr:venus', mercury: 'gcyr:mercury', end: 'minecraft:the_end' }

  // the casing texture of the Mercury multiblocks and the panel's faces
  IVF.textures = {
    heatShieldBrick: 'grindless:block/hermean_heat_shield_brick',
    thinFilmCells: 'grindless:block/iv/thin_film_cells',
    thinFilmFrame: 'grindless:block/iv/thin_film_frame'
  }

  IVF.zircaloy = { blastTemperature: 2100, blastEUt: 1920, blastDuration: 200 }
  IVF.fluorite = { material: 'gcyr:fluorite', decompositionRecipe: 'gtceu:electrolyzer/decomposition_electrolyzing_fluorite' }

  // item name -> tooltip lines (tooltip.grindless.<name>.<n>) and stack size
  const ITEMS = {
    leu_pellet: { lines: 2, stack: 64 },
    zircaloy_cladding_tube: { lines: 2, stack: 64 },
    leu_fuel_assembly: { lines: 2, stack: 16 },
    mox_fuel_assembly: { lines: 2, stack: 16 },
    breeder_fuel_assembly: { lines: 2, stack: 16 },
    spent_fuel_assembly: { lines: 2, stack: 16 },
    spent_breeder_assembly: { lines: 2, stack: 16 },
    pube_neutron_source: { lines: 2, stack: 16 },
    rtg_pellet: { lines: 2, stack: 16 },
    ion_exchange_resin: { lines: 2, stack: 64 },
    platinum_gauze: { lines: 2, stack: 16 },
    inner_planets_chart: { lines: 2, stack: 16 }
  }
  IVF.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })

  // ---------------------------------------------------------------- GT materials

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create(IVF.materials.heavyWater)
      .liquid()
      .color(0x4F7FD6)
      .components('2x deuterium', '1x oxygen')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(IVF.materials.heavyWaterConcentrate)
      .liquid()
      .color(0x3E6FCF)
      .formula('(H2O)4(D2O)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(IVF.materials.tritiatedHeavyWater)
      .liquid()
      .color(0x63B7B0)
      .formula('D2O + DTO')
      .radioactiveHazard(1)
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    var zircaloy = event.create(IVF.materials.zircaloy)
      .ingot()
      .color(0xB4B8A6).secondaryColor(0x4C4F45)
      .iconSet(GTMaterialIconSet.METALLIC)
      .components('63x zirconium', '1x tin')
    try {
      var GasTier = Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.material.properties.BlastProperty$GasTier')
      zircaloy.blastTemp(IVF.zircaloy.blastTemperature, GasTier.HIGH, IVF.zircaloy.blastEUt, IVF.zircaloy.blastDuration)
    } catch (e) {
      console.error(LOG + 'zircaloy: blast temperature with argon not set (' + e + '), using the plain one')
      zircaloy.blastTemp(IVF.zircaloy.blastTemperature)
    }

    event.create(IVF.materials.hermeanRegolith)
      .dust()
      .color(0x6F6A64).secondaryColor(0x3A3733)
      .iconSet(GTMaterialIconSet.ROUGH)
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(IVF.materials.iridosmine)
      .dust(3)
      .ore()
      .addOreByproducts(GTMaterials.Graphite, GTMaterials.Sulfur)
      .color(0xB9C6D2).secondaryColor(0x3F4D78)
      .iconSet(GTMaterialIconSet.METALLIC)
      .formula('(Ir,Os)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION, GTMaterialFlags.NO_ORE_SMELTING)
  })

  // ---------------------------------------------------------------- GCYR's fluorite: no decomposition

  // GCYR registers fluorite (CaF2) with components, so GTM gives it an automatic electrolysis (3 dust -> calcium + 2,000 mB fluorine at
  // 30 EU/t). Until IV the hidden table removed that recipe with the rest of the unused material; with the fluorite vein it would come
  // back as a fluorine route that skips the fluorspar kiln (docs/eras/iv.md, the fluorine budget). materialModification runs before
  // GTM generates the recipes, and the decomposition handler checks this flag then.
  GTCEuStartupEvents.materialModification(function (event) {
    try {
      var fluorite = GTMaterials.get(IVF.fluorite.material)
      if (fluorite == null || fluorite.isNull()) {
        console.error(LOG + 'fluorite left as it is: GT material ' + IVF.fluorite.material + ' not found')
        return
      }
      if (!fluorite.hasFlag(GTMaterialFlags.DISABLE_DECOMPOSITION)) fluorite.addFlags(GTMaterialFlags.DISABLE_DECOMPOSITION)
      console.info(LOG + IVF.fluorite.material + ': decomposition disabled')
    } catch (e) {
      console.error(LOG + 'fluorite decomposition not disabled: ' + e)
    }
  })

  // ---------------------------------------------------------------- blocks

  StartupEvents.registry('block', function (event) {
    event.create(IVF.ids.hermeanHeatShieldBrick)
      .stoneSoundType()
      .hardness(3)
      .resistance(9)
      .requiresTool(true)
      .tagBlock('minecraft:mineable/pickaxe')
      .textureAll(IVF.textures.heatShieldBrick)
      .item(function (item) {
        item.tooltip(Text.gray(Text.translate('tooltip.grindless.hermean_heat_shield_brick.0')))
        item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.hermean_heat_shield_brick.1')))
      })

    // a thin slab on its frame, like the EV tripod's Solar Wing Panel (models/block/iv/hermean_thin_film_panel.json)
    event.create(IVF.ids.hermeanThinFilmPanel)
      .glassSoundType()
      .hardness(3)
      .resistance(6)
      .requiresTool(true)
      .tagBlock('minecraft:mineable/pickaxe')
      .box(0, 6, 0, 16, 9, 16, true)
      .notSolid()
      .textureAll(IVF.textures.thinFilmCells)
      .model('grindless:block/iv/hermean_thin_film_panel')
      .item(function (item) {
        item.tooltip(Text.gray(Text.translate('tooltip.grindless.hermean_thin_film_panel.0')))
        item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.hermean_thin_film_panel.1')))
      })
  })

  // ---------------------------------------------------------------- items

  // GTM material name -> lang key; a material of an addon mod keeps its namespace (gcyr:fluorite -> material.gcyr.fluorite)
  function materialKey(id) {
    var i = id.indexOf(':')
    return i < 0 ? 'material.gtceu.' + id : 'material.' + id.substring(0, i) + '.' + id.substring(i + 1)
  }

  function joined(keys) {
    var text = Text.translate(keys[0])
    for (var i = 1; i < keys.length; i++) text = text.append(', ').append(Text.translate(keys[i]))
    return text
  }

  // sample icon (frame and tinted core), the machine line, the where line and the planet tag of every table
  const SAMPLE_STYLE = {
    veins_venus: { frame: 'grindless:item/venusian_vein_sample_frame', core: 'grindless:item/venusian_vein_sample_core', drill: 'drill_venus', where: 'venus', tag: 'grindless:venusian_vein_samples' },
    veins_mercury: { frame: 'grindless:item/hermean_vein_sample_frame', core: 'grindless:item/hermean_vein_sample_core', drill: 'drill_mercury', where: 'mercury', tag: 'grindless:hermean_vein_samples' },
    veins_leach: { frame: 'grindless:item/vein_sample_frame', core: 'grindless:item/vein_sample_core', drill: 'leach_field', where: 'end_leach', tag: null }
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      var spec = ITEMS[name]
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(spec.stack)
      for (var i = 0; i < spec.lines; i++) {
        var line = Text.translate('tooltip.grindless.' + name + '.' + i)
        item.tooltip(i === 0 ? Text.gray(line) : Text.darkGray(line))
      }
    })

    Object.keys(SAMPLE_STYLE).forEach(function (table) {
      var style = SAMPLE_STYLE[table]
      G.tables[table].veins.forEach(function (vein) {
        var sample = event.create('grindless:vein_sample_' + vein.id)
          .texture('layer0', style.frame)
          .texture('layer1', style.core)
          .color(1, vein.color)
          .maxStackSize(16)
          .tooltip(Text.gray(Text.translate('tooltip.grindless.vein_sample.' + style.drill)))
          .tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.contains',
            joined(vein.materials.map(function (m) { return materialKey(m.id) })))))
          .tooltip(Text.darkGray(Text.translate('tooltip.grindless.vein_sample.depth', String(vein.minY), String(vein.maxY))))
          .tooltip(Text.red(Text.translate('tooltip.grindless.vein_sample.' + style.where)))
        sample.tag('grindless:vein_samples')
        if (style.tag !== null) sample.tag(style.tag)
      })
    })
  })
})()
