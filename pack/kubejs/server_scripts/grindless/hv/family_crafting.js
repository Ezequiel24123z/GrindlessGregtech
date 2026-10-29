// priority: -13324
// -----------------------------------------------------------------------------------------------
// Crafting-table recipes of the HV step of the Vein Drill family (made by hand from HV parts; nothing here needs a machine):
//
//   HV Vein Drill              stainless steel plates, HV motors and pump, HV hull, HV circuits and a vanadium steel drill bit
//   HV Greenhouse              glass, a sapling, HV motors and pump, HV hull, HV circuits and stainless steel frames
//   stainless steel drill bit  2 per craft like the other bits, a file sharpens them; stainless steel plates and rods (HV has no
//                              titanium, DECISIONS.md 2026-10-24: every HV part is stainless steel)
//   titanium drill bit         not here: it was the HV bit before that decision and is the EV Tripod Drill's bit again
//                              (server_scripts/grindless/ev/tripod.js makes it on the EV lathe), so its HV-era 1:1 conversion into
//                              the stainless steel bit is gone and old bits drill again
//   old End vein samples       the scheelite one (its vein left the End table in v0.4.1): one crafts back into an empty vein probe,
//                              hidden from EMI (item tag c:hidden_from_recipe_viewers, like the removed addon machines). Saves keep
//                              every id they had (AGENTS.md, "Playable channel")
//   End vein samples           empty vein probe + the two raw ores of the vein (shapeless, one recipe per End vein). The pair is
//                              unique among ALL veins (global.grindless.hv.checkTables() checks it).
//
// event.recipes.gtceu.shaped: GTM's shaped recipe; lowercase letters are GT tool symbols (w = wrench, f = file) and the tool is
// damaged, not consumed. Keys of ingredients are uppercase on purpose.
(function () {
  const G = global.grindless
  const HV = G.hv || (G.hv = {})

  // the legacy ids come from startup_scripts/grindless/hv/family_items.js (global.grindless.legacy.hv)
  const LEGACY = (G.legacy && G.legacy.hv) || { bit: 'grindless:titanium_drill_bit', samples: [] }
  const LEGACY_BIT = LEGACY.bit
  const LEGACY_SAMPLES = LEGACY.samples
  const PARTS = ['gtceu:hv_machine_hull', 'gtceu:hv_electric_motor', 'gtceu:hv_electric_pump', 'gtceu:stainless_steel_frame',
    'gtceu:clean_machine_casing', 'grindless:vanadium_steel_drill_bit', 'grindless:stainless_steel_drill_bit', 'grindless:empty_vein_probe']
  HV.craftingParts = PARTS
  HV.legacyBit = LEGACY_BIT
  HV.legacySamples = LEGACY_SAMPLES

  ServerEvents.tags('item', function (event) {
    LEGACY_SAMPLES.forEach(function (id) {
      if (Item.exists(id)) event.add('c:hidden_from_recipe_viewers', id)
    })
  })

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

      event.recipes.gtceu.shaped('gtceu:hv_greenhouse', ['DSG', 'MHP', 'CFC'], {
        D: 'grindless:stainless_steel_drill_bit',
        G: '#forge:glass',
        S: '#minecraft:saplings',
        M: 'gtceu:hv_electric_motor',
        H: 'gtceu:hv_machine_hull',
        P: 'gtceu:hv_electric_pump',
        C: '#gtceu:circuits/hv',
        F: 'gtceu:stainless_steel_frame'
      }).id('grindless:crafting/hv_greenhouse')

      event.recipes.gtceu.shaped('2x grindless:stainless_steel_drill_bit', ['PfP', 'PRP', ' R '], {
        P: '#forge:plates/stainless_steel',
        R: '#forge:rods/stainless_steel'
      }).id('grindless:crafting/stainless_steel_drill_bit')
    }

    LEGACY_SAMPLES.forEach(function (id) {
      if (!Item.exists(id) || !Item.exists('grindless:empty_vein_probe')) return
      event.shapeless('grindless:empty_vein_probe', [id])
        .id('grindless:crafting/empty_vein_probe_from_' + id.substring(id.indexOf(':') + 1))
    })

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
