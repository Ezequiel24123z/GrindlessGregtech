// priority: -16724
// -----------------------------------------------------------------------------------------------
// IV's mass-production kit (docs/eras/iv.md, "Nothing one at a time"; package IV-B6): GTM's own machines for making things in quantity,
// put at IV. The user's words: "If the player keeps crafting one at a time, the pack is wrong". Recipes only, over GTM's and the
// addons' machines; the parallel hatch in our plants is startup_scripts/grindless/lib/parallel_hatch.js.
//
// Changed here (GTM's recipe removed, ours in its place, by output so no other copy is left):
//   IV parallel hatch      gtceu:iv_parallel_hatch (Elite Parallel Control Hatch, up to 4 copies of a recipe). GTM's recipe
//                          (gtceu:shaped/parallel_hatch_mk1) asks for 4 LuV circuits; iv.md decided IV ones: the IV sensor and emitter
//                          (Mercury's iridium and a Quantum Star), 4 IV circuits, an IV hull and 2 double platinum cables, in GTM's
//                          shape -> grindless:assembler/iv_parallel_hatch. GCYM's machines, GTCA's megas, GT--'s Maceration Stack and our
//                          hot cell, fuel fabrication plant and heavy-water plant take it.
//   GCYM at IV             every GCYM controller takes IV circuits and the IV machine it enlarges (GTM's GCYMRecipes) except two, which
//                          move up (iv.md): the Large Packaging Machine (EV circuits, HV packer, arms and conveyors) and the Alloy Blast
//                          Smelter (EV circuits, EV alloy smelter, aluminium cables). Same shapes and the plates GTM chose (HSLA steel,
//                          tantalum carbide), with IV circuits, the IV machine and IV parts: grindless:assembler/large_packer and
//                          grindless:assembler/alloy_blast_smelter. A machine built before keeps working; only new ones cost IV parts.
//                          The Large Mixer keeps its osmiridium rotor (LuV), and the mega blast furnace and vacuum freezer their ZPM parts.
// Already at IV, checked by the smoke test (gg_test_mass_production), not changed:
//   GTCA's mega chemical reactor and mega oil cracking unit (an IV assembler, integration/gtca.js) and GT--'s Maceration Stack (4 IV
//   macerators, integration/gtnn.js).
//   Quantum Chest V and Quantum Tank V (gtceu:iv_quantum_chest, gtceu:iv_quantum_tank): GTM's IV recipes, with an HV field generator,
//   whose quantum eye waits for IV's radon. The lines' stock off the network.
//   The assembly line: its control casings take the IV sensor and emitter and its line casings a ruridit gear (Mercury's), its research
//   runs in the EV scanner (1,920 EU/t, IV here through the quantum eye) and its data access hatch is EV. Its input buses are ULV, one
//   slot each and read in order, so AE2 feeds it with one export bus per bus (each set to its ingredient), fluids through 1x hatches
//   (in order too) and the product leaves through GTM's ME output bus.
//
// Published for the smoke test: global.grindless.massProduction.recipes [{ id, output, replaces, items, fluids }], .removed { <output>:
// number of recipes removed }, .missing (ingredients that did not exist), .done.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/iv] '
  var G = global.grindless || (global.grindless = {})
  var MP = G.massProduction || (G.massProduction = {})

  var IV_CIRCUIT = '#gtceu:circuits/iv'

  var RECIPES = [
    {
      id: 'grindless:assembler/iv_parallel_hatch',
      output: 'gtceu:iv_parallel_hatch',
      replaces: 'gtceu:shaped/parallel_hatch_mk1',
      items: ['gtceu:iv_sensor', 'gtceu:iv_emitter', '4x ' + IV_CIRCUIT, 'gtceu:iv_machine_hull', '2x gtceu:platinum_double_cable',
        '2x grindless:platinum_electrode', '2x grindless:night_sky_radiator'],
      fluids: [['gtceu:soldering_alloy', 288], ['gtceu:lubricant', 500]]
    },
    {
      id: 'grindless:assembler/large_packer',
      output: 'gtceu:large_packer',
      replaces: 'gtceu:shaped/large_packer',
      items: ['4x ' + IV_CIRCUIT, '4x #forge:plates/hsla_steel', '2x gtceu:iv_robot_arm', '2x gtceu:iv_conveyor_module', 'gtceu:iv_packer',
        '2x grindless:sintered_regolith', '2x grindless:platinum_electrode'],
      fluids: [['gtceu:soldering_alloy', 288], ['gtceu:lubricant', 500]]
    },
    {
      id: 'grindless:assembler/alloy_blast_smelter',
      output: 'gtceu:alloy_blast_smelter',
      replaces: 'gtceu:shaped/blast_alloy_smelter',
      items: ['4x ' + IV_CIRCUIT, '4x #forge:plates/tantalum_carbide', '2x gtceu:platinum_single_cable', 'gtceu:iv_alloy_smelter',
        '2x grindless:sintered_regolith', '2x grindless:zircaloy_cladding_tube'],
      fluids: [['gtceu:soldering_alloy', 288], ['gtceu:lubricant', 500]]
    }
  ]
  MP.recipes = RECIPES
  MP.removed = {}
  MP.missing = []
  MP.done = false

  // the plain items of a recipe (tags are checked by the smoke test against the live recipe)
  function missingItems(r) {
    var ids = [r.output]
    r.items.forEach(function (v) {
      v = v.replace(/^\d+x /, '')
      if (v.charAt(0) !== '#') ids.push(v)
    })
    return ids.filter(function (id) { return !Item.exists(id) })
  }

  function replace(event, r) {
    var missing = missingItems(r)
    if (missing.length > 0) {
      MP.missing = MP.missing.concat(missing)
      console.error(LOG + r.id + ' skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    var n = 0
    event.forEachRecipe({ output: r.output }, function () { n++ })
    event.remove({ output: r.output })
    MP.removed[r.output] = n
    var rc = event.recipes.gtceu.assembler(r.id.replace('assembler/', ''))
    r.items.forEach(function (x) { rc.itemInputs(x) })
    r.fluids.forEach(function (f) { rc.inputFluids(Fluid.of(f[0], f[1])) })
    rc.itemOutputs(r.output)
      .EUt(1920).duration(600)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    RECIPES.forEach(function (r) {
      try {
        replace(event, r)
      } catch (e) {
        console.error(LOG + r.id + ' failed: ' + e)
      }
    })
    MP.done = true
    console.info(LOG + 'mass production: ' + RECIPES.map(function (r) {
      return r.output + ' (' + (MP.removed[r.output] || 0) + ' removed)'
    }).join(', ') + ' at IV')
  })
})()
