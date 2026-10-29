// priority: -20624
// -----------------------------------------------------------------------------------------------
// Crafting-table recipes of the MV Vein Drill family (made by hand from MV parts; nothing here needs a machine):
//
//   MV Vein Drill              aluminium plates, MV motors and pump, MV hull, MV circuits and a steel drill bit
//   MV Greenhouse              glass, a sapling, MV motors and pump, MV hull, MV circuits and aluminium frames
//   vanadium steel drill bit   2 per craft like the steel bit, a file sharpens them; vanadium steel plates and rods (vanadium +
//                              chromium + 7 steel from the ore plant and the EBF)
//
// event.recipes.gtceu.shaped: GTM's shaped recipe; lowercase letters are GT tool symbols (w = wrench, f = file) and the tool is
// damaged, not consumed. Keys of ingredients are uppercase on purpose.
(function () {
  const G = global.grindless
  const MV = G.mv || (G.mv = {})

  const PARTS = ['gtceu:mv_machine_hull', 'gtceu:mv_electric_motor', 'gtceu:mv_electric_pump', 'gtceu:aluminium_frame',
    'gtceu:frostproof_machine_casing', 'grindless:steel_drill_bit', 'grindless:vanadium_steel_drill_bit']
  MV.craftingParts = PARTS

  ServerEvents.recipes(function (event) {
    var missing = PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error('[grindless/mv] MV controller recipes skipped, unknown item(s): ' + missing.join(', '))
      return
    }

    event.recipes.gtceu.shaped('gtceu:mv_vein_drill', ['AwA', 'MHP', 'CDC'], {
      A: '#forge:plates/aluminium',
      M: 'gtceu:mv_electric_motor',
      H: 'gtceu:mv_machine_hull',
      P: 'gtceu:mv_electric_pump',
      C: '#gtceu:circuits/mv',
      D: 'grindless:steel_drill_bit'
    }).id('grindless:crafting/mv_vein_drill')

    event.recipes.gtceu.shaped('gtceu:mv_greenhouse', ['DSG', 'MHP', 'CFC'], {
      D: 'grindless:vanadium_steel_drill_bit',
      G: '#forge:glass',
      S: '#minecraft:saplings',
      M: 'gtceu:mv_electric_motor',
      H: 'gtceu:mv_machine_hull',
      P: 'gtceu:mv_electric_pump',
      C: '#gtceu:circuits/mv',
      F: 'gtceu:aluminium_frame'
    }).id('grindless:crafting/mv_greenhouse')

    event.recipes.gtceu.shaped('2x grindless:vanadium_steel_drill_bit', ['PfP', 'PRP', ' R '], {
      P: '#forge:plates/vanadium_steel',
      R: '#forge:rods/vanadium_steel'
    }).id('grindless:crafting/vanadium_steel_drill_bit')
  })
})()
