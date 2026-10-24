// -----------------------------------------------------------------------------------------------
// Crafting-table recipes of the HV step of the Vein Drill family (made by hand from HV parts; nothing here needs a machine):
//
//   HV Vein Drill              stainless steel plates, HV motors and pump, HV hull, HV circuits and a vanadium steel drill bit
//   HV Greenhouse              glass, a sapling, HV motors and pump, HV hull, HV circuits and stainless steel frames
//   titanium drill bit         2 per craft like the other bits, a file sharpens them; titanium plates and rods (the Kroll line)
//   End vein samples           empty vein probe + the two raw ores of the vein (shapeless, one recipe per End vein). The pair is
//                              unique among ALL veins (global.grindless.hv.checkTables() checks it).
//
// event.recipes.gtceu.shaped: GTM's shaped recipe; lowercase letters are GT tool symbols (w = wrench, f = file) and the tool is
// damaged, not consumed. Keys of ingredients are uppercase on purpose.
(function () {
  const G = global.grindless
  const HV = G.hv || (G.hv = {})

  const PARTS = ['gtceu:hv_machine_hull', 'gtceu:hv_electric_motor', 'gtceu:hv_electric_pump', 'gtceu:stainless_steel_frame',
    'gtceu:clean_machine_casing', 'grindless:vanadium_steel_drill_bit', 'grindless:titanium_drill_bit', 'grindless:empty_vein_probe']
  HV.craftingParts = PARTS

  ServerEvents.recipes(function (event) {
    var missing = PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error('[grindless/hv] HV controller recipes skipped, unknown item(s): ' + missing.join(', '))
    } else {
      event.recipes.gtceu.shaped('gtceu:hv_vein_drill', ['AwA', 'MHP', 'CDC'], {
        A: '#forge:plates/stainless_steel',
        M: 'gtceu:hv_electric_motor',
        H: 'gtceu:hv_machine_hull',
        P: 'gtceu:hv_electric_pump',
        C: '#gtceu:circuits/hv',
        D: 'grindless:vanadium_steel_drill_bit'
      }).id('grindless:crafting/hv_vein_drill')

      event.recipes.gtceu.shaped('gtceu:hv_greenhouse', ['GSG', 'MHP', 'CFC'], {
        G: '#forge:glass',
        S: '#minecraft:saplings',
        M: 'gtceu:hv_electric_motor',
        H: 'gtceu:hv_machine_hull',
        P: 'gtceu:hv_electric_pump',
        C: '#gtceu:circuits/hv',
        F: 'gtceu:stainless_steel_frame'
      }).id('grindless:crafting/hv_greenhouse')

      event.recipes.gtceu.shaped('2x grindless:titanium_drill_bit', ['PfP', 'PRP', ' R '], {
        P: '#forge:plates/titanium',
        R: '#forge:rods/titanium'
      }).id('grindless:crafting/titanium_drill_bit')
    }

    // ---- End vein samples
    var count = 0
    HV.endVeins().forEach(function (vein) {
      event.shapeless(vein.sample, ['grindless:empty_vein_probe', vein.samplePair[0], vein.samplePair[1]])
        .id('grindless:crafting/vein_sample/' + vein.id)
      count++
    })
    console.info('[grindless/hv] End vein sample recipes: ' + count)
  })
})()
