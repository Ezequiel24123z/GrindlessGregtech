// priority: -25224
// -----------------------------------------------------------------------------------------------
// Recipes of UV's Kuiper belt (machines: startup_scripts/grindless/uv/kuiper.js; docs/eras/uv.md "Machines 28-29", line 17; UV-B4).
// Every machine recipe carries .dimension('grindless:pluto_orbit') and its own programmed circuit (one recipe per lookup path).
// VA[ZPM] = 122,880 EU/t, VA[UV] = 491,520.
//
//   kuiper_intercept (Kuiper interceptor bay; the interceptor is spent, its canister comes back)
//     circuit 1  1 Kuiper interceptor + the Pluto-Kuiper chart (the target list, not consumed) -> 1 planetesimal sample
//                + 1 empty sample canister; VA[UV] x 4,000 t
//   ice_annealing (amorphous ice annealer)
//     circuit 1  1 planetesimal sample -> 4,000 mB water + 1,000 mB carbon monoxide + 500 mB nitrogen + 250 mB Kuiper noble gas;
//                VA[ZPM] x 800 t. The refractory dust (inert silicates and carbon) is voided inside the machine.
// Support (ASSEMBLER): the sample canister (titanium shell, PTFE seals, a ZPM sensor that logs the cold chain) and the interceptor
// (a thruster pod, a probe RTG and a canister: the consumer of A11's pod and A2's RTG). Crafting: both controllers.
// Destinations: the noble gas -> EV's cryogenic plant (server_scripts/grindless/ev/cryogenic_plant.js, the Kuiper row) -> argon (the
// printer), krypton (the thruster works' Hall thruster), xenon (its ion thruster); carbon monoxide -> the syngas plant; water and
// nitrogen -> the existing chemistry. These rows are the only maker of the planetesimal sample and of the Kuiper noble gas.
// Published: global.grindless.uvKuiper.recipes [{ name, type, recipeId, circuit, ... }], .support, .crafting, .skipped, .clashes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var K = G.uvKuiper || (G.uvKuiper = {})
  var UV = G.uvFoundation && G.uvFoundation.ids ? G.uvFoundation.ids : {}
  var PROP = G.propulsion && G.propulsion.ids ? G.propulsion.ids : {}
  var HEAT = G.heatSources && G.heatSources.ids ? G.heatSources.ids : {}
  var ids = K.ids || {}

  var VA_ZPM = 122880
  var VA_UV = 491520
  var ORBIT = K.orbit || 'grindless:pluto_orbit'
  var CHART = 'grindless:pluto_kuiper_chart'
  var INTERCEPTOR = ids.interceptor || 'grindless:kuiper_interceptor'
  var CANISTER = ids.canister || 'grindless:sample_canister'
  var SAMPLE = UV.planetesimalSample || 'grindless:planetesimal_sample'
  var NOBLE = UV.kuiperNobleGas || 'gtceu:kuiper_noble_gas'
  var POD = PROP.thrusterPod || 'grindless:thruster_pod'
  var RTG = HEAT.probeRtg || 'grindless:probe_rtg'

  function item(id, count) { return { id: id, count: count } }
  function fluid(id, amount) { return { id: id, amount: amount } }

  var TABLE = [
    { name: 'planetesimal_intercept', type: 'kuiper_intercept', circuit: 1, itemsIn: [item(INTERCEPTOR, 1)], notConsumed: [CHART],
      fluidsIn: [], itemsOut: [item(SAMPLE, 1), item(CANISTER, 1)], fluidsOut: [], eut: VA_UV, duration: 4000 },
    { name: 'planetesimal_annealing', type: 'ice_annealing', circuit: 1, itemsIn: [item(SAMPLE, 1)], notConsumed: [],
      fluidsIn: [], itemsOut: [], fluidsOut: [fluid('minecraft:water', 4000), fluid('gtceu:carbon_monoxide', 1000),
        fluid('gtceu:nitrogen', 500), fluid(NOBLE, 250)], eut: VA_ZPM, duration: 800 }
  ]

  var SUPPORT = [
    { name: 'sample_canister', type: 'assembler', circuit: 9,
      itemsIn: [item('gtceu:titanium_plate', 4), item('gtceu:polytetrafluoroethylene_plate', 2), item('gtceu:zpm_sensor', 1),
        item('grindless:silicon_nitride_film', 1), item('gtceu:tritanium_plate', 1)],
      notConsumed: [], fluidsIn: [fluid('gtceu:soldering_alloy', 144), fluid('gtceu:liquid_helium', 500)], itemsOut: [item(CANISTER, 1)], fluidsOut: [], eut: VA_ZPM, duration: 400 },
    { name: 'kuiper_interceptor', type: 'assembler', circuit: null,
      itemsIn: [item(POD, 1), item(RTG, 1), item(CANISTER, 1)],
      notConsumed: [], fluidsIn: [], itemsOut: [item(INTERCEPTOR, 1)], fluidsOut: [], eut: VA_UV, duration: 600 }
  ]

  function publish(r) {
    return {
      name: r.name, type: r.type, recipeId: 'grindless:' + r.type + '/' + r.name, circuit: r.circuit, itemsIn: r.itemsIn,
      notConsumed: r.notConsumed, fluidsIn: r.fluidsIn, itemsOut: r.itemsOut, fluidsOut: r.fluidsOut, orbit: r.type !== 'assembler',
      eut: r.eut, duration: r.duration
    }
  }

  K.recipes = TABLE.map(publish)
  K.support = SUPPORT.map(publish)
  K.crafting = {
    bay: 'grindless:assembly_line/kuiper_interceptor_bay',
    annealer: 'grindless:assembly_line/amorphous_ice_annealer'
  }
  K.craftingParts = ['gtceu:uv_machine_hull', 'gtceu:uv_robot_arm', 'gtceu:uv_electric_pump']
  K.skipped = []
  K.clashes = []

  function clashesOf(list) {
    var out = []
    for (var i = 0; i < list.length; i++) {
      for (var j = i + 1; j < list.length; j++) {
        if (list[i].type === list[j].type && list[i].circuit === list[j].circuit) out.push(list[i].name + ' / ' + list[j].name)
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    var items = r.itemsIn.map(function (x) { return x.id }).concat(r.itemsOut.map(function (x) { return x.id }), r.notConsumed)
    items.forEach(function (id) { if (id.charAt(0) !== '#' && !Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsIn.concat(r.fluidsOut).forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addRow(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      K.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'kuiper skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu[r.type]('grindless:' + r.name)
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    r.notConsumed.forEach(function (id) { recipe.notConsumable(id) })
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    r.fluidsOut.forEach(function (f) { recipe.outputFluids(Fluid.of(f.id, f.amount)) })
    if (r.orbit) recipe.dimension(ORBIT)
    recipe.EUt(r.eut).duration(r.duration)
  }

  function addMachineRecipes(event) {
    K.clashes = clashesOf(K.recipes)
    if (K.clashes.length > 0) console.error(LOG + 'kuiper recipes clash in the lookup: ' + K.clashes.join(', '))
    K.recipes.forEach(function (r) { addRow(event, r) })
    K.support.forEach(function (r) { addRow(event, r) })
    console.info(LOG + 'kuiper recipes added: ' + (K.recipes.length + K.support.length - K.skipped.length))
  }

  // ASSEMBLY LINE: UV hull + the machine's own parts + 4 UV circuits + 3 line items, researched at the station from a line component
  function addCrafting(event) {
    var HULL = 'gtceu:uv_machine_hull'
    var list = [
      { id: 'gtceu:kuiper_interceptor_bay', recipe: 'kuiper_interceptor_bay', research: POD,
        parts: [HULL, '4x gtceu:uv_robot_arm'], domain: ['4x ' + POD, '2x ' + RTG, '4x ' + CANISTER] },
      { id: 'gtceu:amorphous_ice_annealer', recipe: 'amorphous_ice_annealer', research: RTG,
        parts: [HULL, '4x gtceu:uv_electric_pump'], domain: ['4x ' + RTG, '2x ' + POD, '4x ' + CANISTER] }
    ]
    list.forEach(function (m) {
      var ids = [m.id, m.research].concat(m.parts, m.domain).map(function (s) { return s.replace(/^\d+x /, '') })
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        K.skipped.push({ name: m.recipe, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'kuiper controller recipe of ' + m.id + ' skipped, unknown item(s): ' + missing.join(', '))
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
    try { addMachineRecipes(event) } catch (e) { console.error(LOG + 'kuiper recipes failed: ' + e) }
    try { addCrafting(event) } catch (e2) { console.error(LOG + 'kuiper crafting failed: ' + e2) }
  })
})()
