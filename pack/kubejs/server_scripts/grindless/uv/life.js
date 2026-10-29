// priority: -25324
// -----------------------------------------------------------------------------------------------
// Recipes of UV's life (docs/eras/uv.md, machines 19 and 20, line 19; package UV-A10): the ark biosphere and the neural culture vat
// (machines: startup_scripts/grindless/uv/life.js). VA[ZPM] = 122,880 EU/t, VA[UV] = 491,520 EU/t. One "biomass" of the design is
// 250 mB of GTM's biomass fluid.
//
//   ark biosphere (type gtceu:closed_ecosystem; the programmed circuit picks the step)
//     1 cycle       1,000 mB carbon dioxide + 250 mB ammonia + 1,000 mB water, with an algae culture and an archaeal culture in the bus
//                   (not consumed) -> 500 mB oxygen + 500 mB raw growth medium + 250 mB biomass. The algae fix the CO2 and give the
//                   O2 back, the archaea in the anaerobic core turn the dead cells and the ammonia into the medium. 122,880 x 1,200 t
//     2 seed        1 algae culture + 1 archaeal culture + 1,000 mB biomass -> 2 algae cultures + 2 archaeal cultures (the bank's
//                   copy)                                                                                          122,880 x 600 t
//     3 inoculate   1 agar dust (LuV's biofoundry) + 1,000 mB biomass (LuV's algae bioreactor or this ark) + 1,000 mB water -> 1 algae
//                   culture: the first strain, isolated on an agar plate                                           122,880 x 600 t
//   neural culture vat (type gtceu:neural_culture)
//     1 stem cells  1,000 mB raw growth medium (the ark's) + 4 gelatin dust (LuV's biofoundry: the coating the cells grow on), with a
//                   neural organoid in the bus (LuV's organoid lab, not consumed) -> 64 stem cells + 250 mB biomass (the spent
//                   medium)                                                                                         491,520 x 1,200 t
//     2 neuro       8 stem cells + 1 wetware printed circuit board + 1,000 mB sterilised growth medium (GTM's fluid heater or LuV's
//                   biofoundry circuit 7) -> 4 neuro processing units + 250 mB biomass (the spent medium)         491,520 x 1,200 t
//   controllers (assembly line, station research, UV hull + pumps/sensors + 4 UV circuits + 3 culture items + soldering alloy, lubricant, tritanium)
//
// The vat is a batch route only: GTM's stem cell (chemical reactor) and NPU (circuit assembler) recipes stay, and so does the rest of
// the wetware chain to the UHV wetware mainframe. The CO2 is GTM's carbon dioxide from its existing routes until UV-B3's Pluto shift;
// the ammonia is GTM's until Charon's.
//
// Destinations (rule 3 of AGENTS.md):
//   oxygen (cycle)            -> the network: GTM's chemistry, LuV's habitat lines, back into anything that burns or breathes
//   raw growth medium (cycle) -> vat circuit 1, or GTM's fluid heater (sterilised growth medium) for vat circuit 2
//   biomass (cycle, vat)      -> MV's biorefinery, or ark circuits 2 and 3
//   failed cultures           -> autoclaved inside the vat: no output (inert once sterile, voidable)
//
// Lookup: every recipe of a type has its own circuit (checked at load); both types are ours, so no GTM row shares them. Ids not
// registered skip their row with a console error. Published in global.grindless.life: .recipes [{ name, type, recipeId, circuit,
// itemsIn, fluidsIn, itemsOut, fluidsOut, eut, duration, notConsumable }], .crafting, .skipped, .clashes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var L = G.life || (G.life = {})

  var ZPM = 122880
  var UVA = 491520

  var ALGAE = L.algaeCulture || 'grindless:algae_culture'
  var ARCHAEA = 'grindless:archaeal_culture'
  var ORGANOID = 'grindless:neural_organoid'
  var RAW_MEDIUM = 'gtceu:raw_growth_medium'
  var STERILE_MEDIUM = 'gtceu:sterilized_growth_medium'
  var BIOMASS = 'gtceu:biomass'
  var STEM = 'gtceu:stem_cells'

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }

  var TABLE = [
    { name: 'closed_cycle', type: 'closed_ecosystem', circuit: 1, notConsumable: [ALGAE, ARCHAEA], itemsIn: [],
      fluidsIn: [fluid('gtceu:carbon_dioxide', 1000), fluid('gtceu:ammonia', 250), fluid('minecraft:water', 1000)],
      itemsOut: [], fluidsOut: [fluid('gtceu:oxygen', 500), fluid(RAW_MEDIUM, 500), fluid(BIOMASS, 250)], eut: ZPM, duration: 1200 },
    // replication paid for by the nutrients it consumes: 1,000 mB biomass + 2 agar dust (the plate the new colonies grow on)
    { name: 'culture_seed', type: 'closed_ecosystem', circuit: 2, itemsIn: [item(ALGAE, 1), item(ARCHAEA, 1), item('gtceu:agar_dust', 2)],
      fluidsIn: [fluid(BIOMASS, 1000)], itemsOut: [item(ALGAE, 2), item(ARCHAEA, 2)], fluidsOut: [], eut: ZPM, duration: 600 },
    { name: 'algae_inoculation', type: 'closed_ecosystem', circuit: 3, itemsIn: [item('gtceu:agar_dust', 1)],
      fluidsIn: [fluid(BIOMASS, 1000), fluid('minecraft:water', 1000)], itemsOut: [item(ALGAE, 1)], fluidsOut: [], eut: ZPM, duration: 600 },
    { name: 'stem_cell_batch', type: 'neural_culture', circuit: 1, notConsumable: [ORGANOID], itemsIn: [item('gtceu:gelatin_dust', 4)],
      fluidsIn: [fluid(RAW_MEDIUM, 1000)], itemsOut: [item(STEM, 64)], fluidsOut: [fluid(BIOMASS, 250)], eut: UVA, duration: 1200 },
    { name: 'neuro_processor_batch', type: 'neural_culture', circuit: 2,
      itemsIn: [item(STEM, 8), item('gtceu:wetware_printed_circuit_board', 1)], fluidsIn: [fluid(STERILE_MEDIUM, 1000)],
      itemsOut: [item('gtceu:neuro_processing_unit', 4)], fluidsOut: [fluid(BIOMASS, 250)], eut: UVA, duration: 1200 }
  ]

  L.recipes = TABLE.map(function (t) {
    return {
      name: t.name, type: t.type, recipeId: 'grindless:' + t.type + '/' + t.name, circuit: t.circuit, itemsIn: t.itemsIn,
      fluidsIn: t.fluidsIn, itemsOut: t.itemsOut, fluidsOut: t.fluidsOut, eut: t.eut, duration: t.duration,
      notConsumable: t.notConsumable || []
    }
  })
  L.skipped = []
  L.clashes = []
  L.crafting = { ark: 'grindless:assembly_line/ark_biosphere', vat: 'grindless:assembly_line/neural_culture_vat' }
  L.craftingParts = ['gtceu:uv_machine_hull', 'gtceu:uv_electric_pump', 'gtceu:uv_sensor']

  function keysOf(r) {
    var keys = {}
    r.itemsIn.forEach(function (x) { keys['i:' + x.id] = true })
    r.fluidsIn.forEach(function (x) { keys['f:' + x.id] = true })
    r.notConsumable.forEach(function (id) { keys['i:' + id] = true })
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
    var items = r.itemsIn.concat(r.itemsOut).concat(r.notConsumable.map(function (id) { return item(id, 0) }))
    items.forEach(function (x) { if (!Item.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addRecipe(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      L.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'life recipe skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu[r.type]('grindless:' + r.name)
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    r.notConsumable.forEach(function (id) { recipe.notConsumable(id) })
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (x) { recipe.inputFluids(Fluid.of(x.id, x.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (x) { recipe.outputFluids(Fluid.of(x.id, x.amount)) })
    recipe.EUt(r.eut).duration(r.duration)
  }

  function addMachines(event) {
    L.clashes = clashesOf(L.recipes)
    if (L.clashes.length > 0) console.error(LOG + 'life recipes clash in the lookup: ' + L.clashes.join(', '))
    L.recipes.forEach(function (r) { addRecipe(event, r) })
    console.info(LOG + 'life recipes added: ' + (L.recipes.length - L.skipped.length))
  }

  function addCrafting(event) {
    var list = [
      { id: 'gtceu:ark_biosphere', recipe: 'ark_biosphere', research: ARCHAEA,
        parts: ['gtceu:uv_machine_hull', '4x gtceu:uv_electric_pump'],
        domain: ['8x grindless:sporosarcina_culture', '8x ' + ARCHAEA, '2x ' + ORGANOID] },
      { id: 'gtceu:neural_culture_vat', recipe: 'neural_culture_vat', research: ORGANOID,
        parts: ['gtceu:uv_machine_hull', '2x gtceu:uv_electric_pump', '2x gtceu:uv_sensor'],
        domain: ['4x ' + ORGANOID, '4x ' + ALGAE, '4x ' + ARCHAEA] }
    ]
    list.forEach(function (m) {
      var ids = [m.id, m.research].concat(m.parts, m.domain).map(function (s) { return s.replace(/^\d+x /, '') })
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'life controller recipe of ' + m.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      var b = event.recipes.gtceu.assembly_line('grindless:' + m.recipe)
      m.parts.forEach(function (s) { b.itemInputs(s) })
      b.itemInputs('4x #gtceu:circuits/uv')
      m.domain.forEach(function (s) { b.itemInputs(s) })
      b.inputFluids(Fluid.of('gtceu:soldering_alloy', 1152), Fluid.of('gtceu:lubricant', 1000), Fluid.of('gtceu:tritanium', 576))
      b.itemOutputs(m.id)
      b.stationResearch(function (r) { return r.researchStack(Item.of(m.research)).CWUt(64).EUt(491520) })
      b.EUt(491520).duration(1200)
    })
  }

  ServerEvents.recipes(function (event) {
    try { addMachines(event) } catch (e) { console.error(LOG + 'life recipes failed: ' + e) }
    try { addCrafting(event) } catch (e2) { console.error(LOG + 'life crafting failed: ' + e2) }
  })
})()
