// priority: -24424
// -----------------------------------------------------------------------------------------------
// Recipes of UHV's organoid array (docs/eras/uhv.md, machine 11 and line 12; package UHV-B6) and the organoid lab's UHV row
// (uhv.md, "Older machines": the LuV lab's medium). Machine and type: startup_scripts/grindless/uhv/wetware.js; the organoid
// processor, the chitosan scaffold, the SiC power module, ultrapure water and the sterilised growth medium: F1
// (startup_scripts/grindless/uhv/foundation.js); the optical assembly: A4 (startup_scripts/grindless/uhv/photonics.js).
// VA[LuV] = 30,720 EU/t, VA[UHV] = 1,966,080 EU/t.
//
//   Organoid array (type gtceu:organoid_computing; Earth only: .dimension('minecraft:overworld'); the circuit picks the step)
//     1 organoid    4 stem cells (UV's neural culture vat) + 1 chitosan scaffold (Proxima's chitin, line 28) + 1,000 mB ultrapure
//                   water + 1,000 mB sterilised growth medium -> 1 organoid processor + 250 mB bacterial sludge (the spent
//                   medium). Cortical organoids grown on a microelectrode array, perfused for weeks.   1,966,080 x 1,200 t (tune)
//     2 mainframe   4 organoid processors + 4 neuro processing units + 1 SiC power module + 1 optical assembly -> 4 wetware
//                   processor mainframes (GTM's UHV circuit, four at a time; GTM's assembly line recipe stays)
//                                                                                                       1,966,080 x 600 t (tune)
//   Organoid lab (LuV; type gtceu:organoid_assembly, circuit 3; orbit only like the lab's other rows: G.orbits.allow; cleanroom)
//     sterilised    1 xeno radioprotectant (Proxima b's xenobiochemistry, B4) + 1,000 mB sterilized growth medium (the biofoundry's)
//                   -> 1,000 mB sterilised growth medium. Written here, not in luv/orbital_biology.js: the LuV test pins that
//                   file's lab rows; the type's fluid output comes from this package's startup.            30,720 x 600 t (tune)
//   controller (crafting grid): UHV hull + 2 UV sensors + 2 UHV circuits (tune)
//
// Destinations (rule 3 of AGENTS.md):
//   bacterial sludge (organoid) -> LuV's biofoundry, step 6 (mutagen: GTM's enriched bacterial sludge and distillery), which makes
//                                  the next sterile growth medium *(kept: the array refuses to void fluids)*
//
// Lookup: each array recipe has its own circuit and the lab row takes circuit 3 (the lab's rows use 1 and 2), so no recipe's keys
// contain another's in its type (checked at load). Ids not registered skip their row with a console error. Published in
// global.grindless.wetware: .recipes [{ name, type, recipeId, circuit, site, itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration,
// cleanroom }], .crafting, .craftingParts, .skipped, .clashes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uhv] '
  var G = global.grindless || (global.grindless = {})
  var W = G.wetware || (G.wetware = {})
  var UHVF = G.uhvFoundation && G.uhvFoundation.ids ? G.uhvFoundation.ids : {}
  var PH = G.photonics && G.photonics.ids ? G.photonics.ids : {}

  var LUV = 30720
  var UHV = 1966080

  var STEM = 'gtceu:stem_cells'
  var SCAFFOLD = UHVF.chitosanScaffold || 'grindless:chitosan_scaffold'
  var ULTRAPURE = UHVF.ultrapureWater || 'gtceu:ultrapure_water'
  var STERILISED = UHVF.sterilisedGrowthMedium || 'gtceu:sterilised_growth_medium'
  var STERILIZED = 'gtceu:sterilized_growth_medium'
  var ORGANOID = UHVF.organoidProcessor || 'grindless:organoid_processor'
  var RADIOPROTECTANT = UHVF.xenoRadioprotectant || 'grindless:xeno_radioprotectant'
  var SIC = UHVF.sicPowerModule || 'grindless:sic_power_module'
  var OPTICAL = PH.opticalAssembly || 'gtnn:optical_assembly'
  var NPU = 'gtceu:neuro_processing_unit'
  var MAINFRAME = 'gtceu:wetware_processor_mainframe'
  var SPENT = 'gtceu:bacterial_sludge'

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }

  // type, circuit, site, contents; earth = minecraft:overworld, orbit = the station dimensions (G.orbits.allow)
  var TABLE = [
    { name: 'organoid', type: 'organoid_computing', circuit: 1, site: 'earth', cleanroom: false,
      itemsIn: [item(STEM, 4), item(SCAFFOLD, 1)], fluidsIn: [fluid(ULTRAPURE, 1000), fluid(STERILISED, 1000)],
      itemsOut: [item(ORGANOID, 1)], fluidsOut: [fluid(SPENT, 250)], eut: UHV, duration: 1200 },
    { name: 'mainframe', type: 'organoid_computing', circuit: 2, site: 'earth', cleanroom: false,
      itemsIn: [item(ORGANOID, 4), item(NPU, 4), item(SIC, 1), item(OPTICAL, 1)], fluidsIn: [],
      itemsOut: [item(MAINFRAME, 4)], fluidsOut: [], eut: UHV, duration: 600 },
    { name: 'uhv/sterilised_growth_medium', type: 'organoid_assembly', circuit: 3, site: 'orbit', cleanroom: true,
      itemsIn: [item(RADIOPROTECTANT, 1)], fluidsIn: [fluid(STERILIZED, 1000)],
      itemsOut: [], fluidsOut: [fluid(STERILISED, 1000)], eut: LUV, duration: 600 }
  ]

  W.recipes = TABLE.map(function (t) {
    return {
      name: t.name, type: t.type, recipeId: 'grindless:' + t.type + '/' + t.name, circuit: t.circuit, site: t.site,
      itemsIn: t.itemsIn, fluidsIn: t.fluidsIn, itemsOut: t.itemsOut, fluidsOut: t.fluidsOut, eut: t.eut, duration: t.duration,
      cleanroom: t.cleanroom
    }
  })
  W.skipped = []
  W.clashes = []
  W.crafting = { array: 'grindless:crafting/organoid_array' }
  W.craftingParts = ['gtceu:uhv_machine_hull', 'gtceu:uv_sensor']

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    r.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
    if (r.circuit !== null) keys['circuit:' + r.circuit] = true
    return keys
  }

  function subset(a, b) {
    return Object.keys(a).every(function (k) { return b[k] === true })
  }

  function clashesOf(list) {
    var out = []
    for (var i = 0; i < list.length; i++) {
      for (var j = i + 1; j < list.length; j++) {
        if (list[i].type !== list[j].type) continue
        var a = keysOf(list[i])
        var b = keysOf(list[j])
        if (subset(a, b) || subset(b, a)) out.push(list[i].name + ' / ' + list[j].name)
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    r.itemsIn.concat(r.itemsOut).forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addRecipe(event, CleanroomType, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      W.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'wetware recipe skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu[r.type]('grindless:' + r.name)
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    if (r.site === 'earth') recipe.dimension('minecraft:overworld')
    else if (r.site === 'orbit') G.orbits.allow(recipe)
    if (r.cleanroom) recipe.cleanroom(CleanroomType.CLEANROOM)
    recipe.EUt(r.eut).duration(r.duration)
  }

  function addRecipes(event) {
    var CleanroomType = Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType')
    W.clashes = clashesOf(W.recipes)
    if (W.clashes.length > 0) console.error(LOG + 'wetware recipes clash in the lookup: ' + W.clashes.join(', '))
    W.recipes.forEach(function (r) { addRecipe(event, CleanroomType, r) })
    console.info(LOG + 'wetware recipes added: ' + (W.recipes.length - W.skipped.length))
  }

  function addCrafting(event) {
    var missing = W.craftingParts.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'organoid array controller crafting skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.shaped('gtceu:organoid_array', ['C C', 'SHS'], {
      S: 'gtceu:uv_sensor', C: '#gtceu:circuits/uhv', H: 'gtceu:uhv_machine_hull'
    }).id(W.crafting.array)
  }

  ServerEvents.recipes(function (event) {
    try { addRecipes(event) } catch (e) { console.error(LOG + 'wetware recipes failed: ' + e) }
    try { addCrafting(event) } catch (e2) { console.error(LOG + 'wetware crafting failed: ' + e2) }
  })
})()
