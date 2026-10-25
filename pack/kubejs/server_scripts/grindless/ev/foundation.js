// -----------------------------------------------------------------------------------------------
// Recipes of the EV foundation (the registrations are in startup_scripts/grindless/ev/foundation.js; docs/eras/ev.md):
//
//   lunar regolith dust   MACERATOR, anywhere: 1 lunar stone, cobbled lunar stone (the stone the Lunar Drill and the EV tripod bring
//                         up), lunar mare regolith or lunar sand -> 1 gtceu:lunar_regolith_dust, with GTM's numbers for stone (2 EU/t,
//                         98 ticks). GCYR's moon blocks had no maceration at all.
//   sintered regolith     ELECTRIC FURNACE, only on the Moon (.dimension: the Moon of data/grindless/tables/veins_moon.json, like every
//                         lunar recipe): 4 lunar regolith dust -> 1 grindless:sintered_regolith, 120 EU/t, 20 s. It is the slow first
//                         source; the regolith cell (another package) sinters faster under the same condition.
//   methalox              MIXER, EV: 1,000 mB methane + 2,000 mB oxygen -> 3,000 mB gtceu:methalox. CH4 + 2 O2 is the stoichiometric
//                         ratio (O/F 4.0 by mass; methalox rocket engines such as Raptor run a little fuel-rich, about 3.6). 1,920 EU/t
//                         for 1 s: 12.8 EU per mB, against the 224 EU of a mB of methane in a gas turbine (GTM's value, doubled by
//                         power/generators.js). No burning recipe here: the Mars package burns it.
//   molten salt charge    ASSEMBLER, EV: 16 calcium chloride dust (the electrolyte) + 4 titanium plates (the crucible) + 1 titanium frame
//                         (the cathode basket that holds the ilmenite) + 2 aluminium cables (the EV cable, the cathode lead) -> 1. No
//                         tungsten. It is never used up, so it is made once per cell.
//   ruthenium catalyst    MIXER: 3 sapphire dust (aluminium oxide: the alumina support of real Sabatier catalysts) + 1 ruthenium dust
//                         (the platinum plant's) -> 4, like the other catalysts of the pack (1 metal + 3 support -> 4).
//
// The final recipe ids (GTM's builder puts the type in front) are published in global.grindless.evFoundation.recipes for the test.
// The first ingredient of each GT recipe is one no other recipe of its type starts with (GTM's lookup prefix rule, lv/multis.js).
(function () {
  const G = global.grindless || (global.grindless = {})
  const EVF = G.evFoundation || (G.evFoundation = {})

  const MOON_BLOCKS = ['gcyr:moon_cobblestone', 'gcyr:moon_stone', 'gcyr:lunar_mare_regolith', 'gcyr:moon_sand']
  const CHARGE_PARTS = ['gtceu:calcium_chloride_dust', 'gtceu:titanium_plate', 'gtceu:titanium_frame', 'gtceu:aluminium_single_cable']
  const CATALYST_PARTS = ['gtceu:sapphire_dust', 'gtceu:ruthenium_dust']

  function pathOf(id) {
    return id.substring(id.indexOf(':') + 1)
  }

  EVF.recipes = {
    maceration: MOON_BLOCKS.map(function (id) { return 'grindless:macerator/lunar_regolith_from_' + pathOf(id) }),
    sintering: 'grindless:electric_furnace/sintered_regolith',
    methalox: 'grindless:mixer/methalox',
    moltenSaltCharge: 'grindless:assembler/molten_salt_charge',
    rutheniumCatalyst: 'grindless:mixer/ruthenium_catalyst'
  }

  function missingItems(ids) {
    return ids.filter(function (id) { return !Item.exists(id) })
  }

  function moonDimension() {
    var table = G.tables && G.tables.veins_moon
    return table && table.dimension ? table.dimension : 'gcyr:luna'
  }

  // one thrown error would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    try {
      addRecipes(event)
    } catch (e) {
      console.error('[grindless/ev] foundation recipes failed: ' + e)
    }
  })

  function addRecipes(event) {
    var ids = EVF.ids
    var added = []

    // ---- lunar regolith dust from the Moon's ground
    var missingDust = missingItems([ids.regolithDust])
    if (missingDust.length > 0) {
      console.error('[grindless/ev] lunar regolith recipes skipped, unknown item(s): ' + missingDust.join(', '))
    } else {
      MOON_BLOCKS.forEach(function (block) {
        if (!Item.exists(block)) {
          console.error('[grindless/ev] lunar regolith from ' + block + ' skipped: unknown item')
          return
        }
        event.recipes.gtceu.macerator('grindless:lunar_regolith_from_' + pathOf(block))
          .itemInputs(block)
          .itemOutputs(ids.regolithDust)
          .EUt(2).duration(98)
      })
      added.push('lunar regolith x' + MOON_BLOCKS.length)

      // ---- the sintered brick, only on the Moon
      if (!Item.exists(ids.sinteredRegolith)) {
        console.error('[grindless/ev] sintered regolith recipe skipped, unknown item ' + ids.sinteredRegolith)
      } else {
        event.recipes.gtceu.electric_furnace('grindless:sintered_regolith')
          .itemInputs('4x ' + ids.regolithDust)
          .itemOutputs(ids.sinteredRegolith)
          .dimension(moonDimension())
          .EUt(120).duration(400)
        added.push('sintered regolith (only in ' + moonDimension() + ')')
      }
    }

    // ---- methalox
    var gases = ['gtceu:methane', 'gtceu:oxygen', ids.methalox].filter(function (id) { return !Fluid.exists(id) })
    if (gases.length > 0) {
      console.error('[grindless/ev] methalox recipe skipped, unknown fluid(s): ' + gases.join(', '))
    } else {
      event.recipes.gtceu.mixer('grindless:methalox')
        .inputFluids(Fluid.of('gtceu:methane', 1000), Fluid.of('gtceu:oxygen', 2000))
        .outputFluids(Fluid.of(ids.methalox, 3000))
        .EUt(1920).duration(20)
      added.push('methalox')
    }

    // ---- the regolith cell's electrolyte charge
    var missingCharge = missingItems(CHARGE_PARTS.concat([ids.moltenSaltCharge]))
    if (missingCharge.length > 0) {
      console.error('[grindless/ev] molten salt charge recipe skipped, unknown item(s): ' + missingCharge.join(', '))
    } else {
      event.recipes.gtceu.assembler('grindless:molten_salt_charge')
        .itemInputs('16x gtceu:calcium_chloride_dust', '4x gtceu:titanium_plate', 'gtceu:titanium_frame', '2x gtceu:aluminium_single_cable')
        .itemOutputs(ids.moltenSaltCharge)
        .EUt(1920).duration(200)
      added.push('molten salt charge')
    }

    // ---- the atmosphere processor's catalyst
    var missingCatalyst = missingItems(CATALYST_PARTS.concat([ids.rutheniumCatalyst]))
    if (missingCatalyst.length > 0) {
      console.error('[grindless/ev] ruthenium catalyst recipe skipped, unknown item(s): ' + missingCatalyst.join(', '))
    } else {
      event.recipes.gtceu.mixer('grindless:ruthenium_catalyst')
        .itemInputs('3x gtceu:sapphire_dust', '1x gtceu:ruthenium_dust')
        .itemOutputs('4x ' + ids.rutheniumCatalyst)
        .EUt(480).duration(300)
      added.push('ruthenium catalyst')
    }

    console.info('[grindless/ev] foundation recipes: ' + added.join(', '))
  }
})()
