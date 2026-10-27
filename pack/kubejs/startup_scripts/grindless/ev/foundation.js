// priority: -1000
// -----------------------------------------------------------------------------------------------
// EV foundation: the shared registrations that the EV packages build on (docs/eras/ev.md). No machines and no recipe types here.
//
//   grindless:sintered_regolith   BLOCK. Lunar regolith fused in a furnace: the brick of every lunar structure (the regolith cell's hall,
//                                 the cryogenic plant's base, the tripod's footings, the solar array, the sealed dome). Only made on the
//                                 Moon (server_scripts/grindless/ev/foundation.js). Its texture, block/sintered_regolith, also works as
//                                 the casing texture of the lunar multiblocks.
//   grindless:molten_salt_charge  the CaCl2 electrolyte of the regolith cell: a titanium crucible of calcium chloride. In the molten salt,
//                                 ilmenite gives up its oxygen and titanium stays behind (Cambridge FFC process). It sits in the cell's input
//                                 bus and is never used up.
//   grindless:ruthenium_catalyst  ruthenium on alumina, the Sabatier catalyst (CO2 + 4 H2 -> CH4 + 2 H2O) of the atmosphere processor on
//                                 Mars; used up by chance.
//   grindless:mars_chart          the route to Mars that the deep space antenna writes onto a data stick; the tier 2 rocket parts are made
//                                 with it and it is never used up. Item only: the antenna owns its recipe.
//
//   GT materials registered here (so their items and fluids are gtceu:, like every GTM material):
//     lunar_regolith   dust only (gtceu:lunar_regolith_dust): ground lunar soil, from the Moon's stone and regolith in a macerator.
//                      DISABLE_DECOMPOSITION: only the regolith cell splits it (volatiles, oxygen, metals).
//     merrillite       the rare-earth carrier of Mars. In Martian meteorites (shergottites) the rare earths sit mostly in merrillite, a
//                      calcium phosphate; REE-merrillite is Ca16(Mg,Fe)2REE2(PO4)14, written here per half cell. Ore (GTM gives it an
//                      ore block in every stone type, gtceu:mars_merrillite_ore among them; the Mars vein table places it), raw,
//                      crushed, purified, refined and dust forms. DISABLE_DECOMPOSITION: only the rare-earth extraction cascade
//                      splits it into samarium, neodymium and the rest. Ore byproducts: apatite and tricalcium phosphate, the
//                      phosphates it grows with (both have a GT line already).
//     methalox         gas fuel (gtceu:methalox): methane and oxygen premixed in the stoichiometric ratio, CH4 + 2 O2. It burns on
//                      Mars, where the air has no oxygen; its burning recipe belongs to the Mars package.
//   gtceu:liquid_nitrogen          GTM 7.5.3's nitrogen is only a gas (ElementMaterials: .gas().plasma()). This gives the GTM material a
//                                 LIQUID fluid at 77 K, the way GTM gives oxygen (85 K) and helium (4 K) theirs, so it is a real GT
//                                 cryogenic fluid (cryo-proof pipes and tanks). Nothing makes it here: only the cryogenic plant will.
//
// The ids are published in global.grindless.evFoundation for the server script and the test.
// Names: client_scripts/grindless/ev_foundation_lang.js. Textures: tools/assets/Build-EVFoundationTextures.ps1.
(function () {
  const G = global.grindless || (global.grindless = {})
  const EVF = G.evFoundation || (G.evFoundation = {})

  EVF.ids = {
    sinteredRegolith: 'grindless:sintered_regolith',
    moltenSaltCharge: 'grindless:molten_salt_charge',
    rutheniumCatalyst: 'grindless:ruthenium_catalyst',
    marsChart: 'grindless:mars_chart',
    regolithDust: 'gtceu:lunar_regolith_dust',
    merrilliteDust: 'gtceu:merrillite_dust',
    merrilliteRaw: 'gtceu:raw_merrillite',
    merrilliteMarsOre: 'gtceu:mars_merrillite_ore',
    liquidNitrogen: 'gtceu:liquid_nitrogen',
    methalox: 'gtceu:methalox'
  }
  EVF.materials = { regolith: 'lunar_regolith', merrillite: 'merrillite', methalox: 'methalox' }
  EVF.liquidNitrogen = { temperature: 77, translation: 'grindless.fluid.liquid_nitrogen' }

  // item name -> description lines (tooltip.grindless.<name>.<n>) and stack size
  const ITEMS = {
    molten_salt_charge: { lines: 2, stack: 16 },
    ruthenium_catalyst: { lines: 2, stack: 16 },
    mars_chart: { lines: 2, stack: 16 }
  }

  // ---------------------------------------------------------------- GT materials

  GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create(EVF.materials.regolith)
      .dust()
      .color(0x8E8B82).secondaryColor(0x4E4B45)
      .iconSet(GTMaterialIconSet.ROUGH)
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(EVF.materials.merrillite)
      .dust()
      .ore()
      .addOreByproducts(GTMaterials.Apatite, GTMaterials.TricalciumPhosphate)
      .color(0xE6CDB4).secondaryColor(0x8E4B2E)
      .iconSet(GTMaterialIconSet.ROUGH)
      .formula('Ca8(Mg,Fe)(REE)(PO4)7')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create(EVF.materials.methalox)
      .gas()
      .color(0xB36BD6)
      .formula('(CH4)(O2)2')
  })

  // ---------------------------------------------------------------- liquid nitrogen on GTM's nitrogen

  // materialModification runs after every material is registered and before GTM registers the fluids (CommonProxy.initMaterials, then
  // GTFluids.init), so a queued LIQUID key becomes gtceu:liquid_nitrogen next to the gas gtceu:nitrogen (its primary key stays GAS)
  GTCEuStartupEvents.materialModification(function (event) {
    try {
      var fluids = GTMaterials.Nitrogen.getProperty(PropertyKey.FLUID)
      if (fluids == null) {
        console.error('[grindless/ev] liquid nitrogen not added: GTM nitrogen has no fluid property')
        return
      }
      if (fluids.getQueuedBuilder(GTFluidStorageKeys.LIQUID) != null || fluids.get(GTFluidStorageKeys.LIQUID) != null) {
        console.info('[grindless/ev] nitrogen already has a liquid: left as it is')
        return
      }
      fluids.enqueueRegistration(GTFluidStorageKeys.LIQUID, new GTFluidBuilder()
        .temperature(EVF.liquidNitrogen.temperature)
        .color(0xBDEFF5)
        .name('liquid_nitrogen')
        .translation(EVF.liquidNitrogen.translation))
      console.info('[grindless/ev] gtceu:liquid_nitrogen queued (' + EVF.liquidNitrogen.temperature + ' K)')
    } catch (e) {
      console.error('[grindless/ev] liquid nitrogen not added: ' + e)
    }
  })

  // ---------------------------------------------------------------- the sintered brick

  StartupEvents.registry('block', function (event) {
    event.create(EVF.ids.sinteredRegolith)
      .stoneSoundType()
      .hardness(3)
      .resistance(6)
      .requiresTool(true)
      .tagBlock('minecraft:mineable/pickaxe')
      .textureAll('grindless:block/sintered_regolith')
      .item(function (item) {
        item.tooltip(Text.gray(Text.translate('tooltip.grindless.sintered_regolith.0')))
        item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.sintered_regolith.1')))
      })
  })

  // ---------------------------------------------------------------- items

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
  })
})()
