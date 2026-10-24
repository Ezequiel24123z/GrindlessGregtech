// -----------------------------------------------------------------------------------------------
// Crafting-table recipes of the LV multiblocks (made by hand from LV parts; nothing here needs a machine):
//
//   LV Vein Drill            steel plates, LV motors and pump, LV hull, LV circuits and a steel drill bit
//   LV Greenhouse            glass, a sapling, LV motors and pump, LV hull, LV circuits and steel frames
//   Submerged Arc Furnace    two graphite electrodes, steel plates, LV circuits, LV hull and three heat-proof casings
//   Nether vein samples      empty vein probe + the two raw ores of the vein (shapeless, one recipe per Nether vein). The
//                            pair is unique among ALL veins (global.grindless.lv.checkTables() checks it).
//
// event.recipes.gtceu.shaped: GTM's shaped recipe; lowercase letters are GT tool symbols (w = wrench) and the tool is
// damaged, not consumed. Keys of ingredients are uppercase on purpose.
(function () {
  const G = global.grindless
  const LV = G.lv || (G.lv = {})

  const PARTS = ['gtceu:lv_machine_hull', 'gtceu:lv_electric_motor', 'gtceu:lv_electric_pump', 'gtceu:steel_frame',
    'gtceu:heatproof_machine_casing', 'grindless:steel_drill_bit', 'grindless:graphite_electrode',
    'grindless:empty_vein_probe']
  LV.craftingParts = PARTS

  ServerEvents.recipes(function (event) {
    var missing = PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error('[grindless/lv] LV controller recipes skipped, unknown item(s): ' + missing.join(', '))
    } else {
      event.recipes.gtceu.shaped('gtceu:lv_vein_drill', ['SwS', 'MHP', 'CDC'], {
        S: '#forge:plates/steel',
        M: 'gtceu:lv_electric_motor',
        H: 'gtceu:lv_machine_hull',
        P: 'gtceu:lv_electric_pump',
        C: '#gtceu:circuits/lv',
        D: 'grindless:steel_drill_bit'
      }).id('grindless:crafting/lv_vein_drill')

      event.recipes.gtceu.shaped('gtceu:lv_greenhouse', ['GSG', 'MHP', 'CFC'], {
        G: '#forge:glass',
        S: '#minecraft:saplings',
        M: 'gtceu:lv_electric_motor',
        H: 'gtceu:lv_machine_hull',
        P: 'gtceu:lv_electric_pump',
        C: '#gtceu:circuits/lv',
        F: 'gtceu:steel_frame'
      }).id('grindless:crafting/lv_greenhouse')

      event.recipes.gtceu.shaped('gtceu:submerged_arc_furnace', ['ESE', 'CHC', 'BBB'], {
        E: 'grindless:graphite_electrode',
        S: '#forge:plates/steel',
        C: '#gtceu:circuits/lv',
        H: 'gtceu:lv_machine_hull',
        B: 'gtceu:heatproof_machine_casing'
      }).id('grindless:crafting/submerged_arc_furnace')
    }

    // ---- Nether vein samples
    var count = 0
    LV.netherVeins().forEach(function (vein) {
      event.shapeless(vein.sample, ['grindless:empty_vein_probe', vein.samplePair[0], vein.samplePair[1]])
        .id('grindless:crafting/vein_sample/' + vein.id)
      count++
    })
    console.info('[grindless/lv] Nether vein sample recipes: ' + count)
  })
})()
