// -----------------------------------------------------------------------------------------------
// GT-- (gtnn 1.3.10), audited against docs/eras (ev.md, "Decisions taken": no addon may process cheaper than GT in its era or
// undercut the pack's own multiblocks; GCYM-style parallel machines wait for IV). Most of the addon adds work or comes late and
// stays: the ExxonMobil chemical plant (MV) and its chemistry, dehydrators, neutron activator (IV), rocket engines (EV) with
// GTNH-style rocket fuels (hydrazine, RP-1: several chemistry steps each), naquadah reactors (enriched naquadah), the circuit
// assembly line (LuV, research, same yields as GTM's circuit assembler) and the ender covers. The E85 fuel loop run in its
// chemical plant is GTCA's and goes in gtca.js.
//
// GT--'s harder platinum and naquadah lines (config/gtnn.json enableHarderPlatinumLine / enableHarderNaquadahLine, on by default)
// STAY: they empty GTM's own separation recipes (pgs_separation, the osmium / rhodium / inert metal / rarest metal steps, the four
// naquadah solution centrifuges) and put GTNH-style lines in their place, and the EV platinum plant composes its recipes from the
// live GT-- stage recipes (server_scripts/grindless/ev/platinum_plant.js); the IV naquadah plant will do the same. None of those stages is touched here.
//
// Removed:
//   pgs_from_<ore> and pgs_from_<ore>_p (chemical reactor and large chemical reactor, 6 ores each: bornite, chalcocite, chalcopyrite,
//                          cooperite, pentlandite, tetrahedrite; 24 recipes)  GT-- keeps GTM's ids but makes them 9 purified ores +
//                          9 000 mB of nitration mixture -> 9 000 mB of concentrated platinum at 30 EU/t: with the line's own loop
//                          that is 1 platinum per ore, against 0.67 per ore through the line's sludge (the sulfuric attack the
//                          plant uses, pentlandite and chalcopyrite only), and it turns three copper ores into platinum at HV. A tap
//                          outside the line, so it goes; the _p variants (the same with platinum metal dust) go with it. Only the
//                          GT-- version is removed (its output is concentrated platinum): with the harder line switched off GTM's own
//                          pgs_from recipes come back and stay.
//   the etched wetware mainframe chain (laser engraver etched_wetware_processor_mainframe, assembler ..._board, forming press
//                          ..._base; 3 recipes)  it eats GTM's UHV wetware mainframe for a base nothing reads: before UHV
//                          the only consumer of that circuit is the Fusion Mk3 (docs/eras/uv.md, Validator). The processor,
//                          assembly and computer etchings stay (none of them takes a UHV circuit).
// Re-gated:
//   Maceration Stack (gtnn:maceration_stack_controller)  a macerator multiblock whose parallels and speed grow with the voltage
//                          (GT++'s Industrial Maceration Stack): a GCYM-style machine, so IV like GTM's Large Maceration Tower.
//                          Same crafting shape with the parts one tier up: 4 IV macerators, 4 tungsten steel plates and an IV
//                          circuit (was EV macerators, titanium plates and an EV circuit).
// Not done here, config/gtnn.json (Server): makesEMIBetter should be false (EMI's cheat mode hands out a bucket of any fluid) and
// banCreateFanBlasting true once Create is in the pack (Create fans would smelt ores and dusts without a GT furnace).
// Uncraftable today and kept that way (the test guards it): Component Assembly Line, Homemade Bedrock Ore Machine (ores out of
// stone). The 14 '*_tf' veins use the Twilight Forest layer and never generate (data/grindless/tables/veins_excluded.json).
// Era: IV for the Maceration Stack; never for the pgs_from taps.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/gtnn] '
  var STACK = 'gtnn:maceration_stack_controller'
  var ORES = ['bornite', 'chalcocite', 'chalcopyrite', 'cooperite', 'pentlandite', 'tetrahedrite']

  // the pgs_from taps, in GT--'s version only (output: concentrated platinum)
  function removeTaps(event) {
    var ids = []
    event.forEachRecipe({ id: /^gtceu:(large_)?chemical_reactor\/pgs_from_[a-z]+(_p)?$/ }, function (r) {
      var id = String(r.getId())
      var ore = id.replace(/^.*\/pgs_from_/, '').replace(/_p$/, '')
      if (ORES.indexOf(ore) < 0) return
      if (String(r.json).indexOf('concentrated_platinum') < 0) return
      ids.push(id)
    })
    ids.forEach(function (id) { event.remove({ id: id }) })
    return ids
  }

  var MAINFRAME_ETCHING = [
    'gtceu:laser_engraver/item.gtnn.etched_wetware_processor_mainframe',
    'gtceu:assembler/item.gtnn.etched_wetware_processor_mainframe_board',
    'gtceu:forming_press/item.gtnn.etched_wetware_processor_mainframe_base'
  ]

  function regateStack(event) {
    if (!Item.exists(STACK) || !Item.exists('gtceu:iv_macerator')) {
      console.warn(LOG + STACK + ' or gtceu:iv_macerator does not exist; Maceration Stack not re-gated')
      return false
    }
    event.remove({ output: STACK })
    event.shaped(STACK, ['ABA', 'BCB', 'ABA'], {
      A: '#forge:plates/tungsten_steel',
      B: 'gtceu:iv_macerator',
      C: '#gtceu:circuits/iv'
    }).id('grindless:gtnn/maceration_stack_controller')
    return true
  }

  // an uncaught error here would stop the recipe handlers of every script that loads after this one
  ServerEvents.recipes(function (event) {
    try {
      var taps = removeTaps(event)
      var stack = regateStack(event)
      MAINFRAME_ETCHING.forEach(function (id) { event.remove({ id: id }) })
      console.info(LOG + 'pgs_from taps removed: ' + taps.length + '; Maceration Stack ' + (stack ? 're-gated to IV' : 'left as it is') +
        '; etched mainframe chain removed (' + MAINFRAME_ETCHING.length + ')')
    } catch (e) {
      console.error(LOG + 'recipe changes failed: ' + e)
    }
  })
})()
