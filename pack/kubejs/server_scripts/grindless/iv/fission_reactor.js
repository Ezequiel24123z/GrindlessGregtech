// -----------------------------------------------------------------------------------------------
// Recipes of IV's fission reactor (machine and recipe type: startup_scripts/grindless/iv/fission_reactor.js; docs/eras/iv.md,
// "Designed-core reactor"; package IV-A2):
//
//   gtceu:fission_core   one recipe per designed core of data/grindless/tables/fission_cores.json, id grindless:fission_core/<name>:
//                          the programmed circuit of the core (not consumed; it picks the core, and keeps GTM's recipe lookup from
//                          hiding the light-water core behind the heavy-water one, which has the same assembly and water plus heavy water)
//                          + the fuel assembly, a chanced input (wearChance of 10 000)
//                          + the cooling water (lost through the vents) and, with a moderator, the heavy water
//                          -> the spent assembly, a chanced output (spentChance of 10 000), and the activated moderator
//                          (tritiated heavy water, decision 3), at euPerChannel EU/t (.EUt(-x)) for cycleTicks.
//                        The figures are final (iv.md): this type is NOT in power/generators.js's list of doubled generator types, and
//                        that script only rebuilds datapack recipes (event.forEachRecipe never sees the ones scripts add), so nothing here
//                        is doubled. The smoke test checks the live duration.
//   crafting             the controller (GTM shaped recipe, iv.md "Built with"): IV hull + IV field generator + 2 IV electric pumps
//                        + 4 IV circuits, grindless:crafting/fission_reactor.
//
// Destinations of the byproducts: the spent LEU and MOX assemblies and the spent breeder assembly go to the hot cell (reprocessing, IV-A3);
// the tritiated heavy water to the tritium removal facility on the Moon (IV-B4), which returns the heavy water; the cooling water is gone
// (vented, inert). The assemblies, the spent assemblies and both heavy waters are IV-A1's shared registrations; a missing one skips its
// core with an error.
//
// Published for the smoke test: global.grindless.fissionReactor.recipes [{ id, core, circuit, fuel, spent, eut, duration, coolant,
// moderator }], .skipped [{ core, reason }], .craftingRecipe, .craftingParts.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var LOG = '[grindless/iv] '
  var G = global.grindless || (global.grindless = {})
  var FR = G.fissionReactor || (G.fissionReactor = {})

  var CONTROLLER = 'gtceu:fission_reactor'
  var CONTROLLER_PARTS = [CONTROLLER, 'gtceu:iv_machine_hull', 'gtceu:iv_field_generator', 'gtceu:iv_electric_pump']
  FR.craftingRecipe = 'grindless:crafting/fission_reactor'
  FR.craftingParts = CONTROLLER_PARTS

  function missingOf(core) {
    var missing = []
    if (!Item.exists(core.fuel)) missing.push(core.fuel)
    if (!Item.exists(core.spent)) missing.push(core.spent)
    if (core.moderator) {
      if (!Fluid.exists(core.moderator.fluid)) missing.push(core.moderator.fluid)
      if (!Fluid.exists(core.moderator.becomes)) missing.push(core.moderator.becomes)
    }
    return missing
  }

  function addCores(event) {
    var added = []
    var skipped = []
    if (!Fluid.exists(FR.coolant.fluid)) {
      console.error(LOG + 'fission reactor: unknown coolant ' + FR.coolant.fluid + ', no core recipe')
      return { added: added, skipped: [{ core: '*', reason: 'unknown coolant ' + FR.coolant.fluid }] }
    }
    FR.cores.forEach(function (core) {
      var missing = missingOf(core)
      if (missing.length > 0) {
        skipped.push({ core: core.name, reason: 'unknown ' + missing.join(', ') })
        return
      }
      var recipe = event.recipes.gtceu.fission_core('grindless:' + core.name)
        .circuit(core.circuit)
        .chancedInput('1x ' + core.fuel, FR.wearChance, 0)
        .inputFluids(Fluid.of(FR.coolant.fluid, FR.coolant.amount))
      if (core.moderator) recipe.inputFluids(Fluid.of(core.moderator.fluid, core.moderator.amount))
      recipe.chancedOutput('1x ' + core.spent, FR.spentChance, 0)
      if (core.moderator) recipe.outputFluids(Fluid.of(core.moderator.becomes, core.moderator.amount))
      recipe.addDataString(FR.coreKey, core.name)
        .EUt(-core.euPerChannel)
        .duration(FR.cycleTicks)
      added.push({
        id: core.recipe,
        core: core.name,
        circuit: core.circuit,
        fuel: core.fuel,
        spent: core.spent,
        eut: core.euPerChannel,
        duration: FR.cycleTicks,
        coolant: { fluid: FR.coolant.fluid, amount: FR.coolant.amount },
        moderator: core.moderator
      })
    })
    return { added: added, skipped: skipped }
  }

  function addController(event) {
    var missing = CONTROLLER_PARTS.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'fission reactor controller recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    // GTM shaped: lowercase letters are tool symbols, so ingredient keys are uppercase
    event.recipes.gtceu.shaped(CONTROLLER, ['CFC', 'PHP', 'C C'], {
      C: '#gtceu:circuits/iv',
      F: 'gtceu:iv_field_generator',
      P: 'gtceu:iv_electric_pump',
      H: 'gtceu:iv_machine_hull'
    }).id(FR.craftingRecipe)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    FR.recipes = []
    FR.skipped = []
    try {
      if (!FR.loaded) {
        console.error(LOG + 'fission reactor: no core table (startup_scripts/grindless/iv/fission_reactor.js did not load ' +
          (FR.table || 'fission_cores.json') + '): no core recipe')
      } else {
        var r = addCores(event)
        FR.recipes = r.added
        FR.skipped = r.skipped
        if (r.skipped.length > 0) {
          console.error(LOG + 'fission reactor cores skipped: ' + r.skipped.map(function (s) { return s.core + ' (' + s.reason + ')' }).join(', '))
        }
      }
    } catch (e) {
      console.error(LOG + 'fission_core recipes failed: ' + e)
    }
    try {
      addController(event)
    } catch (e2) {
      console.error(LOG + 'fission reactor controller recipe failed: ' + e2)
    }
    console.info(LOG + 'fission reactor: ' + FR.recipes.length + ' core recipes (' + FR.recipes.map(function (p) {
      return p.core + ' c' + p.circuit + ' ' + p.eut + ' EU/t'
    }).join(', ') + ') and the controller recipe')
  })
})()
