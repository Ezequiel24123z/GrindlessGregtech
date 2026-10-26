// -----------------------------------------------------------------------------------------------
// Recipes of ZPM's survey network (machines: startup_scripts/grindless/zpm/observatory.js; docs/eras/zpm.md "Machines 15-17"; ZPM-A9).
// One recipe per programmed circuit within a type (one lookup path each); every run uses one data orb as the medium.
//
//   neutrino_detection (Earth, ZPM VA)
//     circuit 1  data orb + 1,000 mB heavy water -> Solar-Core Survey
//     circuit 2  data orb + 1,000 mB heavy water + the GW catalogue (NOT consumed) -> Multi-Messenger Catalogue
//   telemetry_decoding (Earth, ZPM VA; 1,000 mB liquid helium cools the cabin)
//     circuit 1  Neptune probe recording + data orb -> Neptune flyby data
//     circuit 2  Triton probe recording + data orb -> Triton flyby data
//     circuit 3  both flyby datasets + the Kuiper target list + data orb -> Pluto-Kuiper chart
//   kuiper_survey (Earth orbit only, ZPM VA)
//     circuit 1  data orb + CVD diamond plate (the mirror coating) -> Kuiper target list
// Support: the photomultiplier casing's assembler recipe, the three controllers' crafting recipes, and GTM's UV energy hatch assembly-line
// recipe re-added under its own id with the Solar-Core Survey as a kept input (it is read from this load's original recipe).
// Published: global.grindless.observatory.recipes, .skipped, .clashes, .hatch, .decodes (the recording-decoding recipe ids).
(function () {
  var LOG = '[grindless/zpm] '
  var G = global.grindless || (global.grindless = {})
  var OB = G.observatory || (G.observatory = {})

  var ZPM_VA = 122880
  var ORBIT = G.orbits ? G.orbits.earth : 'gcyr:overworld_orbit'
  var ORB = 'gtceu:data_orb'
  var SURVEY = 'grindless:solar_core_survey'
  var HEAVY = 'gtceu:heavy_water'
  var HELIUM = 'gtceu:liquid_helium'

  var TABLE = [
    { name: 'solar_core_survey', type: 'neutrino_detection', circuit: 1, itemsIn: [{ id: ORB, count: 1 }], notConsumed: [],
      fluidsIn: [{ id: HEAVY, amount: 1000 }], itemsOut: [{ id: SURVEY, count: 1 }], eut: ZPM_VA, duration: 1200 },
    { name: 'multimessenger_catalogue', type: 'neutrino_detection', circuit: 2, itemsIn: [{ id: ORB, count: 1 }],
      notConsumed: ['grindless:gravitational_wave_catalogue'],
      fluidsIn: [{ id: HEAVY, amount: 1000 }], itemsOut: [{ id: 'grindless:multimessenger_catalogue', count: 1 }], eut: ZPM_VA, duration: 1200 },
    { name: 'neptune_flyby_data', type: 'telemetry_decoding', circuit: 1,
      itemsIn: [{ id: 'grindless:neptune_probe_recording', count: 1 }, { id: ORB, count: 1 }], notConsumed: [],
      fluidsIn: [{ id: HELIUM, amount: 1000 }], itemsOut: [{ id: 'grindless:neptune_flyby_data', count: 1 }], eut: ZPM_VA, duration: 600 },
    { name: 'triton_flyby_data', type: 'telemetry_decoding', circuit: 2,
      itemsIn: [{ id: 'grindless:triton_probe_recording', count: 1 }, { id: ORB, count: 1 }], notConsumed: [],
      fluidsIn: [{ id: HELIUM, amount: 1000 }], itemsOut: [{ id: 'grindless:triton_flyby_data', count: 1 }], eut: ZPM_VA, duration: 600 },
    { name: 'pluto_kuiper_chart', type: 'telemetry_decoding', circuit: 3,
      itemsIn: [{ id: 'grindless:neptune_flyby_data', count: 1 }, { id: 'grindless:triton_flyby_data', count: 1 },
        { id: 'grindless:kuiper_target_list', count: 1 }, { id: ORB, count: 1 }], notConsumed: [],
      fluidsIn: [{ id: HELIUM, amount: 1000 }], itemsOut: [{ id: 'grindless:pluto_kuiper_chart', count: 1 }], eut: ZPM_VA, duration: 1200 },
    { name: 'kuiper_target_list', type: 'kuiper_survey', circuit: 1, orbit: true,
      itemsIn: [{ id: ORB, count: 1 }, { id: 'grindless:cvd_diamond_plate', count: 1 }], notConsumed: [],
      fluidsIn: [], itemsOut: [{ id: 'grindless:kuiper_target_list', count: 1 }], eut: ZPM_VA, duration: 1200 }
  ]

  OB.recipes = TABLE.map(function (t) {
    t.recipeId = 'grindless:' + t.type + '/' + t.name
    t.id = 'grindless:' + t.name
    return t
  })
  OB.decodes = ['grindless:telemetry_decoding/neptune_flyby_data', 'grindless:telemetry_decoding/triton_flyby_data']
  OB.skipped = []
  OB.clashes = []
  OB.hatch = null

  function clashes() {
    var out = []
    for (var i = 0; i < OB.recipes.length; i++) {
      for (var j = i + 1; j < OB.recipes.length; j++) {
        if (OB.recipes[i].type === OB.recipes[j].type && OB.recipes[i].circuit === OB.recipes[j].circuit) out.push(OB.recipes[i].name + ' / ' + OB.recipes[j].name)
      }
    }
    return out
  }

  function missingIds(r) {
    var missing = []
    var items = r.itemsIn.map(function (x) { return x.id }).concat(r.itemsOut.map(function (x) { return x.id }), r.notConsumed)
    items.forEach(function (id) { if (!Item.exists(id) && missing.indexOf(id) < 0) missing.push(id) })
    r.fluidsIn.forEach(function (x) { if (!Fluid.exists(x.id) && missing.indexOf(x.id) < 0) missing.push(x.id) })
    return missing
  }

  function addMachineRecipes(event) {
    OB.clashes = clashes()
    if (OB.clashes.length > 0) console.error(LOG + 'survey network recipes clash in the lookup: ' + OB.clashes.join(', '))
    OB.recipes.forEach(function (r) {
      var missing = missingIds(r)
      if (missing.length > 0) {
        OB.skipped.push({ name: r.name, reason: 'unknown id(s) ' + missing.join(', ') })
        console.error(LOG + 'survey network skipped ' + r.name + ': unknown id(s) ' + missing.join(', '))
        return
      }
      var recipe = event.recipes.gtceu[r.type](r.id)
      r.itemsIn.forEach(function (x) { recipe.itemInputs(x.count + 'x ' + x.id) })
      r.notConsumed.forEach(function (id) { recipe.notConsumable(id) })
      recipe.circuit(r.circuit)
      r.fluidsIn.forEach(function (f) { recipe.inputFluids(Fluid.of(f.id, f.amount)) })
      r.itemsOut.forEach(function (x) { recipe.itemOutputs(x.count + 'x ' + x.id) })
      if (r.orbit) recipe.dimension(ORBIT)
      recipe.EUt(r.eut).duration(r.duration)
    })
    console.info(LOG + 'survey network recipes added: ' + (OB.recipes.length - OB.skipped.length))
  }

  // ASSEMBLER: the observatory shell's casing (a multi-output recipe: the shell is about 1,100 blocks)
  function addCasing(event) {
    var need = ['gtceu:laminated_glass', 'gtceu:zpm_sensor', 'gtceu:aluminium_plate', 'gtceu:sapphire_lens', 'grindless:photomultiplier_casing']
    var missing = need.filter(function (id) { return !Item.exists(id) })
    if (missing.length > 0) {
      console.error(LOG + 'photomultiplier casing recipe skipped, unknown item(s): ' + missing.join(', '))
      return
    }
    event.recipes.gtceu.assembler('grindless:photomultiplier_casing')
      .itemInputs('4x gtceu:laminated_glass', '1x gtceu:zpm_sensor', '4x gtceu:aluminium_plate', '2x gtceu:sapphire_lens')
      .circuit(1).itemOutputs('16x grindless:photomultiplier_casing').EUt(ZPM_VA).duration(200)
  }

  // CRAFTING TABLE: hull + the machine's own parts + ZPM circuits
  function addCrafting(event) {
    var HULL = 'gtceu:zpm_machine_hull'
    var list = [
      { id: 'gtceu:neutrino_observatory', pattern: ['CSC', 'SHS', 'CSC'], extra: { S: 'gtceu:zpm_sensor' } },
      { id: 'gtceu:deep_space_network', pattern: ['CSC', 'EHS', 'CWC'],
        extra: { S: 'gtceu:zpm_sensor', E: 'gtceu:zpm_emitter', W: 'gtceu:mercury_barium_calcium_cuprate_double_wire' } },
      { id: 'gtceu:kuiper_survey_telescope', pattern: ['CSC', ' H ', 'CSC'], extra: { S: 'gtceu:zpm_sensor' } }
    ]
    list.forEach(function (m) {
      var keys = { C: '#gtceu:circuits/zpm', H: HULL }
      Object.keys(m.extra).forEach(function (k) { keys[k] = m.extra[k] })
      var parts = Object.keys(keys).map(function (k) { return keys[k] }).filter(function (v) { return v.charAt(0) !== '#' })
      var missing = parts.filter(function (id) { return !Item.exists(id) })
      if (missing.length > 0) {
        console.error(LOG + 'survey network crafting of ' + m.id + ' skipped, unknown item(s): ' + missing.join(', '))
        return
      }
      event.recipes.gtceu.shaped(m.id, m.pattern, keys).id('grindless:crafting/' + m.id.split(':')[1])
    })
  }

  // the UV energy hatch's assembly-line recipe: GTM's own, re-added under the same id with the survey as a kept input
  var HATCH = { id: 'gtceu:assembly_line/energy_hatch_uv', name: 'gtceu:energy_hatch_uv' }

  function hatchArgs(j) {
    var research = []
    var bad = null
    ;(j.recipeConditions || []).forEach(function (c) {
      if (c.type !== 'research' || !c.research) bad = 'a condition other than research'
      else c.research.forEach(function (r) { research.push(String(r.researchId)) })
    })
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
    if (!Item.exists(SURVEY)) throw new Error(SURVEY + ' does not exist')
    event.remove({ id: HATCH.id })
    var b = event.recipes.gtceu.assembly_line(HATCH.name)
    args.items.forEach(function (s) { b.itemInputs(s) })
    b.notConsumable(SURVEY)
    args.fluids.forEach(function (s) { b.inputFluids(s) })
    b.itemOutputs(args.output).EUt(args.eut).duration(args.duration).researchWithoutRecipe(args.research)
    OB.hatch = { id: HATCH.id, items: args.items, fluids: args.fluids, output: args.output, eut: args.eut, duration: args.duration, research: args.research }
    console.info(LOG + 'UV energy hatch: ' + HATCH.id + ' re-added with the solar-core survey kept (' + args.eut + ' EU/t x ' + args.duration + ' t), research ' + args.research)
  }

  // an uncaught error here would stop KubeJS from running the recipe handlers of the scripts that load after this one
  ServerEvents.recipes(function (event) {
    try { addMachineRecipes(event) } catch (e) { console.error(LOG + 'survey network recipes failed: ' + e) }
    try { addCasing(event) } catch (e2) { console.error(LOG + 'photomultiplier casing failed: ' + e2) }
    try { addCrafting(event) } catch (e3) { console.error(LOG + 'survey network crafting failed: ' + e3) }
    try { addHatch(event) } catch (e4) { console.error(LOG + 'UV energy hatch failed: ' + e4); OB.hatchError = String(e4) }
  })
})()
