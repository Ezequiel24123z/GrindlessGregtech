// -----------------------------------------------------------------------------------------------
// Recipes of UV's edge (machines: startup_scripts/grindless/uv/edge.js; docs/eras/uv.md "Machines 30-31" and "Gate to UHV"; UV-B5).
// Every machine recipe carries .dimension('grindless:pluto_orbit') and its own programmed circuit (one recipe per lookup path).
// VA[UV] = 491,520 EU/t.
//
//   precursor_probe (precursor probe bay; the probe is spent)
//     circuit 1  1 precursor probe + 4 ICAN pellets (the kick out of Pluto's orbit) -> 1 heliopause data; 2 A UV x 6,000 t
//   event_horizon_imaging (event horizon interferometer, the observatory's step 8)
//     circuit 1  the multimessenger catalogue (the target and its timing, not consumed) + 1 HPGe crystal (the receiver's front end)
//                + 4 data orbs (the correlated recordings) -> 1 Sgr A* image; VA[UV] x 8,000 t
// Support (ASSEMBLER): the precursor probe (2 probe RTGs, a thruster pod, the HPGe spectrometer: 1 HPGe crystal + 1 UV sensor, a printed
// probe frame). Crafting: both controllers.
// GTM's UHV energy hatch: its assembly-line recipe is re-added under its own id with every input, its output, EU/t and duration read from
// this load's original; only the research changes: the station research of the Sgr A* image instead of the UV energy hatch's. GTM's old
// research recipe (gtceu:research_station/1x_gtceu_uv_energy_input_hatch) is removed when no other assembly-line recipe reads it.
// Destinations: the heliopause data -> the laser sail launcher (kept, server_scripts/grindless/uv/starshot.js); the Sgr A* image -> the
// research station (the UHV hatch's research). These rows are the only maker of both.
// Published: global.grindless.uvEdge.recipes, .support, .crafting, .hatch, .hatchError, .oldResearch, .skipped, .clashes.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/uv] '
  var G = global.grindless || (global.grindless = {})
  var E = G.uvEdge || (G.uvEdge = {})
  var UV = G.uvFoundation && G.uvFoundation.ids ? G.uvFoundation.ids : {}
  var PROP = G.propulsion && G.propulsion.ids ? G.propulsion.ids : {}
  var HEAT = G.heatSources && G.heatSources.ids ? G.heatSources.ids : {}
  var MAT = G.materials && G.materials.ids ? G.materials.ids : {}
  var ids = E.ids || {}

  var VA_UV = 491520
  var ORBIT = E.orbit || 'grindless:pluto_orbit'
  var PROBE = ids.probe || 'grindless:precursor_probe'
  var HELIOPAUSE = UV.heliopauseData || 'grindless:heliopause_data'
  var IMAGE = UV.sgrAStarImage || 'grindless:sgr_a_star_image'
  var HPGE = UV.hpgeCrystal || 'grindless:hpge_crystal'
  var POD = PROP.thrusterPod || 'grindless:thruster_pod'
  var RTG = HEAT.probeRtg || 'grindless:probe_rtg'
  var FRAME = MAT.printedProbeFrame || 'grindless:printed_probe_frame'
  var ICAN = 'grindless:ican_pellet'
  var CATALOGUE = 'grindless:multimessenger_catalogue'
  var ORB = 'gtceu:data_orb'

  function item(id, count) { return { id: id, count: count } }

  var TABLE = [
    { name: 'heliopause_data', type: 'precursor_probe', circuit: 1, itemsIn: [item(PROBE, 1), item(ICAN, 4)], notConsumed: [],
      itemsOut: [item(HELIOPAUSE, 1)], eut: VA_UV, amps: 2, duration: 6000 },
    { name: 'sgr_a_star_image', type: 'event_horizon_imaging', circuit: 1, itemsIn: [item(HPGE, 1), item(ORB, 4)],
      notConsumed: [CATALOGUE], itemsOut: [item(IMAGE, 1)], eut: VA_UV, amps: 1, duration: 8000 }
  ]

  var SUPPORT = [
    { name: 'precursor_probe', type: 'assembler', circuit: null,
      itemsIn: [item(RTG, 2), item(POD, 1), item(HPGE, 1), item('gtceu:uv_sensor', 1), item(FRAME, 1)],
      notConsumed: [], itemsOut: [item(PROBE, 1)], eut: VA_UV, amps: 1, duration: 600 }
  ]

  function publish(r) {
    return {
      name: r.name, type: r.type, recipeId: 'grindless:' + r.type + '/' + r.name, circuit: r.circuit, itemsIn: r.itemsIn,
      notConsumed: r.notConsumed, itemsOut: r.itemsOut, orbit: r.type !== 'assembler', eut: r.eut, amps: r.amps, duration: r.duration
    }
  }

  E.recipes = TABLE.map(publish)
  E.support = SUPPORT.map(publish)
  E.crafting = {
    bay: 'grindless:crafting/precursor_probe_bay',
    interferometer: 'grindless:crafting/event_horizon_interferometer'
  }
  E.craftingParts = ['gtceu:uv_machine_hull', 'gtceu:uv_robot_arm', 'gtceu:uv_sensor']
  E.skipped = []
  E.clashes = []
  E.hatch = null
  E.hatchError = null
  E.oldResearch = null

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
    return missing
  }

  function addRow(event, r) {
    var missing = missingIds(r)
    if (missing.length > 0) {
      E.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
      console.error(LOG + 'edge skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
      return
    }
    var recipe = event.recipes.gtceu[r.type]('grindless:' + r.name)
    r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
    r.notConsumed.forEach(function (id) { recipe.notConsumable(id) })
    if (r.circuit !== null) recipe.circuit(r.circuit)
    r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
    if (r.orbit) recipe.dimension(ORBIT)
    // GTM 7.5.3's EUt(voltage, amperage): the launch is a UV recipe drawing 2 A
    if (r.amps > 1) recipe.EUt(r.eut, r.amps)
    else recipe.EUt(r.eut)
    recipe.duration(r.duration)
  }

  function addMachineRecipes(event) {
    E.clashes = clashesOf(E.recipes)
    if (E.clashes.length > 0) console.error(LOG + 'edge recipes clash in the lookup: ' + E.clashes.join(', '))
    E.recipes.forEach(function (r) { addRow(event, r) })
    E.support.forEach(function (r) { addRow(event, r) })
    console.info(LOG + 'edge recipes added: ' + (E.recipes.length + E.support.length - E.skipped.length))
  }

  // CRAFTING TABLE: UV hull + the machine's own parts + 4 UV circuits
  function addCrafting(event) {
    var HULL = 'gtceu:uv_machine_hull'
    var list = [
      { id: 'gtceu:precursor_probe_bay', recipe: E.crafting.bay, pattern: ['CAC', ' H ', 'CAC'], extra: { A: 'gtceu:uv_robot_arm' } },
      { id: 'gtceu:event_horizon_interferometer', recipe: E.crafting.interferometer, pattern: ['CSC', ' H ', 'CSC'], extra: { S: 'gtceu:uv_sensor' } }
    ]
    list.forEach(function (m) {
      var keys = { C: '#gtceu:circuits/uv', H: HULL }
      Object.keys(m.extra).forEach(function (k) { keys[k] = m.extra[k] })
      var need = [m.id].concat(Object.keys(keys).map(function (k) { return keys[k] }).filter(function (v) { return v.charAt(0) !== '#' }))
      var missing = need.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        E.skipped.push({ name: m.recipe, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'edge crafting of ' + m.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(m.id, m.pattern, keys).id(m.recipe)
    })
  }

  // ---------------------------------------------------------------- the UHV energy hatch
  // GTM's own recipe (MetaTileEntityMachineRecipeLoader): researched at the station from the UV energy input hatch, 128 CWU/t, VA[UV].
  // The new research keeps those numbers; only the researched item becomes the Sgr A* image.
  var HATCH = { id: 'gtceu:assembly_line/energy_hatch_uhv', name: 'gtceu:energy_hatch_uhv' }
  var OLD_RESEARCH = 'gtceu:research_station/1x_gtceu_uv_energy_input_hatch'
  var CWUT = 128

  function researchIds(j) {
    var out = []
    ;(j.recipeConditions || []).forEach(function (c) {
      if (c.type === 'research' && c.research) c.research.forEach(function (r) { out.push(String(r.researchId)) })
    })
    return out
  }

  // same reading as ZPM's UV hatch (server_scripts/grindless/zpm/observatory.js): a string says why the recipe is left as it is
  function hatchArgs(j) {
    var research = researchIds(j)
    var bad = null
    ;(j.recipeConditions || []).forEach(function (c) { if (c.type !== 'research' || !c.research) bad = 'a condition other than research' })
    if (bad !== null) return bad
    if (research.length !== 1) return 'not one research entry'
    var eu = j.tickInputs && j.tickInputs.eu && j.tickInputs.eu[0] ? j.tickInputs.eu[0].content : null
    var eut = typeof eu === 'number' ? eu : (eu && eu.voltage !== undefined ? Number(eu.voltage) * Number(eu.amperage || 1) : null)
    if (!(eut > 0) || !(j.duration > 0)) return 'unreadable energy or duration'
    var items = []
    ;((j.inputs && j.inputs.item) || []).forEach(function (e) {
      var c = e.content
      var sized = c && c.type === 'gtceu:sized'
      var ing = sized ? c.ingredient : c
      var count = sized ? (c.count || 1) : 1
      if (!ing || (e.chance !== undefined && e.chance !== 10000)) { bad = 'item input ' + JSON.stringify(e); return }
      if (ing.item && !ing.nbt) items.push(count + 'x ' + ing.item)
      else if (ing.tag) items.push(count + 'x #' + ing.tag)
      else bad = 'item input ' + JSON.stringify(e)
    })
    var fluids = []
    ;((j.inputs && j.inputs.fluid) || []).forEach(function (e) {
      var c = e.content
      var v = c && c.value && c.value.length === 1 ? c.value[0] : null
      var id = v ? (v.fluid || (v.tag ? v.tag.replace(/^forge:/, 'gtceu:') : null)) : null
      if (id && c.amount > 0 && Fluid.exists(id)) fluids.push(id + ' ' + c.amount)
      else bad = 'fluid input ' + JSON.stringify(e)
    })
    var outs = []
    ;((j.outputs && j.outputs.item) || []).forEach(function (e) {
      var c = e.content
      var sized = c && c.type === 'gtceu:sized'
      var ing = sized ? c.ingredient : c
      if (ing && ing.item && !ing.nbt) outs.push((sized ? (c.count || 1) : 1) + 'x ' + ing.item)
      else bad = 'item output ' + JSON.stringify(e)
    })
    if (bad !== null) return bad
    if (outs.length !== 1 || (j.outputs && j.outputs.fluid && j.outputs.fluid.length > 0)) return 'not one item output'
    if (items.length === 0) return 'no item inputs'
    return { items: items, fluids: fluids, output: outs[0], eut: eut, duration: j.duration, research: research[0] }
  }

  function addHatch(event) {
    var found = null
    event.forEachRecipe({ id: HATCH.id }, function (r) {
      if (found === null && r.json !== null && r.json !== undefined) found = JSON.parse(String(r.json))
    })
    if (found === null) throw new Error('no original recipe ' + HATCH.id)
    var args = hatchArgs(found)
    if (typeof args === 'string') throw new Error(HATCH.id + ' left as it is: ' + args)
    if (!Item.exists(IMAGE)) throw new Error(IMAGE + ' does not exist')

    // does any other assembly-line recipe read the old research? (then GTM's research recipe stays)
    var sharedWith = []
    event.forEachRecipe({ type: 'gtceu:assembly_line' }, function (r) {
      var rid = String(r.getId())
      if (rid === HATCH.id || r.json === null || r.json === undefined) return
      var j = JSON.parse(String(r.json))
      if (researchIds(j).indexOf(args.research) >= 0) sharedWith.push(rid)
    })
    var oldFound = false
    event.forEachRecipe({ id: OLD_RESEARCH }, function () { oldFound = true })

    event.remove({ id: HATCH.id })
    var b = event.recipes.gtceu.assembly_line(HATCH.name)
    args.items.forEach(function (s) { b.itemInputs(s) })
    args.fluids.forEach(function (s) { b.inputFluids(s) })
    b.itemOutputs(args.output).EUt(args.eut).duration(args.duration)
    b.stationResearch(function (r) { return r.researchStack(Item.of(IMAGE)).CWUt(CWUT).EUt(VA_UV) })

    var removed = oldFound && sharedWith.length === 0
    if (removed) event.remove({ id: OLD_RESEARCH })
    E.oldResearch = { id: OLD_RESEARCH, research: args.research, found: oldFound, removed: removed, sharedWith: sharedWith }
    E.hatch = {
      id: HATCH.id, items: args.items, fluids: args.fluids, output: args.output, eut: args.eut, duration: args.duration,
      oldResearch: args.research, researchItem: IMAGE, cwut: CWUT, researchEUt: VA_UV
    }
    console.info(LOG + 'UHV energy hatch: ' + HATCH.id + ' re-added (' + args.eut + ' EU/t x ' + args.duration + ' t), research ' +
      args.research + ' -> the station research of ' + IMAGE + '; old research recipe ' + (removed ? 'removed' : 'kept (' +
      (oldFound ? 'read by ' + sharedWith.join(', ') : 'not found') + ')'))
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try { addMachineRecipes(event) } catch (e) { console.error(LOG + 'edge recipes failed: ' + e) }
    try { addCrafting(event) } catch (e2) { console.error(LOG + 'edge crafting failed: ' + e2) }
    try { addHatch(event) } catch (e3) { console.error(LOG + 'UHV energy hatch failed: ' + e3); E.hatchError = String(e3) }
  })
})()
