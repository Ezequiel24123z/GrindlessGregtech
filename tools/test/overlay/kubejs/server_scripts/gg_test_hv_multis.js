// priority: -2624
// Gregtech Grindless - smoke test of the HV Vein Drill / Greenhouse (TEST-ONLY overlay: copied over the instance on the test PC,
// never shipped with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_hv_multis' -WaitForLog 'GGTEST\|hv_multis\|DONE@@600'
//
// Markers: GGTEST|<scope>|<check>|PASS|FAIL|NOTE|<detail>   (scope = hv_multis or a machine id, '#2h' = the two-hatch drill)
//   hv_multis|items, gt_items, fluids, tags, recipe_types, recipes, end_table, bit_wear, crafting, shared   registration and data
//   vein_coverage|selftest, registry, vein_<id>   GTM's live ore-vein registry against the drill tables (see below)
//   <machine>|DESCRIPTION / PLACED / FORMED / PATTERN / PREVIEW   the registered description is placed block by block, forms,
//                                                                 GTM builds the pattern and previews it
//   <machine>|PROCESS_<scenario>   one run of the machine: inputs in -> the expected items / fluids out, and how many runs at once
//   <machine>|LOOKUP               GTM's recipe lookup still reaches every recipe (steam, LV, MV and HV) the machine can run
//   hv_multis|DONE                 last line
//
// Vein coverage (also on its own: -Commands 'kubejs custom_command gg_test_vein_coverage' -WaitForLog 'GGTEST\|vein_coverage\|DONE@@300'):
// the test reads GTRegistries.ORE_VEINS (GTM's veins and the ones of every addon mod) and FAILs for every vein that can generate on
// the server and lacks its sample item (grindless:vein_sample_<id without namespace and _vein>) or a gtceu:vein_drilling recipe that
// takes it. Exempt: the veins of data/grindless/tables/veins_excluded.json (radioactive until IV, space dimensions) and the ones that
// GTM can never generate here (no loaded dimension of their filter takes their layer: the GT-- *_tf veins need Twilight Forest).
//
// Machines (all facing north in the overworld; the test only uses its own band, X 1024..1087, Y 98..112, Z 0..15, which is
// generated, force-loaded and cleared first - other tests use other bands of the same server):
//   HV drill, one HV energy hatch     around (1032, 101, 2)  32 runs at once (cap 32, 512 V / 8 EU/t), same speed
//   HV drill, two HV energy hatches   around (1064, 101, 2)  32 runs at once and GTM's overclock: half the time
//   HV greenhouse, two input hatches  around (1048, 102, 2)  water in one, CO2 in the other, plus an output hatch for the O2
// Every machine runs its scenarios one after the other (buses, hatches and the recipe logic are reset between them), is checked
// every STEP ticks and the energy hatches are refilled every tick. var + function everywhere (this Rhino throws "redeclaration
// of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'hv_multis'
  var STEP = 10
  var FORM_TIMEOUT = 300

  // The pack's Additional Placements mod rebuilds its block tags and reloads the datapacks (so these scripts too) a couple of
  // seconds after the server is up; a test that is running then is lost and its static checks can see empty tags. The command
  // therefore only leaves a request in `global` (it survives script reloads) and the tick handler starts the test once these scripts
  // have been loaded for QUIET_MS.
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestHvMultisRequest'

  var PART_BLOCKS = {
    energy_input: 'gtceu:hv_energy_input_hatch',
    input_bus: 'gtceu:hv_input_bus',
    output_bus: 'gtceu:hv_output_bus',
    input_hatch: 'gtceu:hv_input_hatch',
    output_hatch: 'gtceu:hv_output_hatch'
  }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var CO2 = 'gtceu:carbon_dioxide'
  var O2 = 'gtceu:oxygen'
  var WATER = 'minecraft:water'
  var DRILLING_FLUID = 'gtceu:drilling_fluid'

  var S = null
  var metaMachineClass = null
  var classes = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 700)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(scope, check, status, detail) {
    var line = TAG + scope + '|' + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(scope, name, ok, detail) {
    emit(scope, name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(scope, name, detail) {
    emit(scope, name, 'NOTE', detail)
  }

  function asArray(coll) {
    var AL = Java.loadClass('java.util.ArrayList')
    var list = new AL(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new ResourceLocation(id)
  }

  function lazy() {
    if (classes === null) {
      classes = {
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      }
    }
    return classes
  }

  function machineAt(p) {
    if (metaMachineClass === null) metaMachineClass = Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
    return metaMachineClass.getMachine(S.level, new BlockPos(p.x, p.y, p.z))
  }

  function blockIdAt(x, y, z) {
    return String(S.level.getBlock(x, y, z).getId())
  }

  function tagSize(tag) {
    return asArray(Ingredient.of('#' + tag).getItemIds()).length
  }

  function itemSummary(counts) {
    return Object.keys(counts).sort().map(function (id) { return id + ' x' + counts[id] }).join(', ')
  }

  function fluidName(stack) {
    try {
      return String(lazy().Registries.FLUIDS.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  function recipesOf(type) {
    return asArray(S.server.getRecipeManager().getAllRecipesFor(type))
  }

  function countWithPath(recipes, part) {
    var n = 0
    recipes.forEach(function (r) {
      if (String(r.id).indexOf(part) >= 0) n++
    })
    return n
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var G = global.grindless
    var LV = G.lv
    var HV = G.hv
    var rm = S.server.getRecipeManager()

    check(SCOPE, 'shared', !!LV && typeof LV.bores === 'function' && !!LV.rules && typeof LV.rules.isHvRecipe === 'function' &&
      !!HV && !!HV.drilling && typeof HV.endVeins === 'function' && !!LV.drilling && !!LV.drilling.bits.stainless_steel && !!LV.veinTools,
      'bores shared=' + (!!LV && typeof LV.bores) + ' rules=' + (!!LV && !!LV.rules) + ' hv drilling=' + (!!HV && !!HV.drilling) +
      ' end veins=' + (!!HV && typeof HV.endVeins))

    var endVeins = HV.endVeins()
    var items = ['grindless:stainless_steel_drill_bit', LEGACY_BIT].concat(endVeins.map(function (v) { return v.sample }))
    var missingItems = items.filter(function (id) { return !Item.exists(id) })
    var bitTag = tagSize('grindless:drill_bits')
    var sampleTag = tagSize('grindless:vein_samples')
    var wantSamples = LV.overworldVeins().length + LV.netherVeins().length + endVeins.length
    check(SCOPE, 'items', missingItems.length === 0 && bitTag >= 4 && sampleTag >= wantSamples,
      'count=' + items.length + ' drill bits in grindless:drill_bits=' + bitTag + ' vein samples in grindless:vein_samples=' + sampleTag + '/' + wantSamples +
      (missingItems.length > 0 ? ' missing=' + missingItems.join(',') : ''))

    var gtItems = HV.craftingParts.concat(['gtceu:hv_vein_drill', 'gtceu:hv_greenhouse', 'gtceu:hv_energy_input_hatch',
      'gtceu:hv_input_bus', 'gtceu:hv_output_bus', 'gtceu:hv_input_hatch', 'gtceu:hv_output_hatch', 'gtceu:programmed_circuit',
      'gtceu:fertilizer'])
    var seenIds = {}
    var uniqueGt = gtItems.filter(function (id) {
      if (seenIds[id]) return false
      seenIds[id] = true
      return true
    })
    var missingGt = uniqueGt.filter(function (id) { return !Item.exists(id) })
    check(SCOPE, 'gt_items', missingGt.length === 0,
      'count=' + uniqueGt.length + (missingGt.length > 0 ? ' missing=' + missingGt.join(',') : ''))

    var fluids = [DRILLING_FLUID, WATER, CO2, O2]
    var missingFluids = fluids.filter(function (id) { return !Fluid.exists(id) })
    check(SCOPE, 'fluids', missingFluids.length === 0,
      'count=' + fluids.length + (missingFluids.length > 0 ? ' missing=' + missingFluids.join(',') : ''))

    var tags = ['forge:plates/stainless_steel', 'forge:rods/stainless_steel', 'forge:glass',
      'minecraft:saplings', 'gtceu:circuits/hv']
    var emptyTags = tags.filter(function (t) { return tagSize(t) === 0 })
    check(SCOPE, 'tags', emptyTags.length === 0,
      'count=' + tags.length + (emptyTags.length > 0 ? ' empty=' + emptyTags.join(',') : ''))

    var fc = lazy().FluidCap
    var ic = lazy().ItemCap
    var drilling = GTRegistries.RECIPE_TYPES.get(rl('gtceu:vein_drilling'))
    var greenhouse = GTRegistries.RECIPE_TYPES.get(rl('gtceu:greenhouse'))
    var machines = ['gtceu:hv_vein_drill', 'gtceu:hv_greenhouse']
    var missingMachines = machines.filter(function (id) { return !GTRegistries.MACHINES.get(rl(id)) })
    var widened = !!drilling && !!greenhouse && drilling.getMaxInputs(fc) === 1 && greenhouse.getMaxInputs(ic) === 3 &&
      greenhouse.getMaxInputs(fc) === 2 && greenhouse.getMaxOutputs(fc) === 1
    check(SCOPE, 'recipe_types', widened && missingMachines.length === 0,
      'machines=' + (missingMachines.length === 0 ? 'registered' : 'missing ' + missingMachines.join(',')) +
      ' vein_drilling fluid in=' + (drilling ? drilling.getMaxInputs(fc) : '?') + ' greenhouse items in=' + (greenhouse ? greenhouse.getMaxInputs(ic) : '?') +
      ' fluid in=' + (greenhouse ? greenhouse.getMaxInputs(fc) : '?') + ' fluid out=' + (greenhouse ? greenhouse.getMaxOutputs(fc) : '?'))

    var drillRecipes = drilling ? recipesOf(drilling) : []
    var greenRecipes = greenhouse ? recipesOf(greenhouse) : []
    var overworld = LV.overworldVeins().length
    var nether = LV.netherVeins().length
    // stainless steel bit: base on the Overworld veins + fluid on the Overworld and Nether ones + fluid on the End ones (the End is MV
    // since v0.5.0: its vanadium steel bit recipes live under mv/, HV.drilling.endMv)
    var wantDrilling = overworld + (overworld + nether) + endVeins.length
    var haveDrilling = countWithPath(drillRecipes, 'vein_drilling/hv/')
    var haveGreenhouse = countWithPath(greenRecipes, 'greenhouse/hv/')
    check(SCOPE, 'recipes', haveDrilling === wantDrilling && haveGreenhouse === 0 && HV.drilling.count === wantDrilling,
      'hv vein_drilling=' + haveDrilling + '/' + wantDrilling + ' hv greenhouse=' + haveGreenhouse + '/0 (the HV greenhouse has no recipes of its own)' +
      ' (all of the type: vein_drilling=' + drillRecipes.length + ' greenhouse=' + greenRecipes.length + ')')

    var tableProblems = HV.checkTables()
    var endIds = endVeins.map(function (v) { return v.id })
    // v0.4.1: four End veins (the scheelite one waits for Mars), and the bauxite sample is made without its ilmenite; v0.5.0: no End
    // vein has ilmenite at all (titanium only comes from the Moon)
    var bauxite = endVeins.filter(function (v) { return v.id === 'bauxite_end' })[0]
    var bauxitePair = bauxite ? bauxite.samplePair.join('+') : ''
    var endTitanium = endVeins.filter(function (v) {
      return v.ores.some(function (o) { return /ilmenite|rutile|titanium/.test(String(o.item)) })
    }).map(function (v) { return v.id })
    check(SCOPE, 'end_table', tableProblems.length === 0 && endVeins.length >= 4 && endIds.indexOf('zirconium') >= 0 &&
      endIds.indexOf('scheelite') < 0 && !!bauxite && bauxitePair.indexOf('ilmenite') < 0 && endTitanium.length === 0,
      endVeins.map(function (v) { return v.id + ' y' + v.minY + '..' + v.maxY + ' ' + v.samplePair.join('+').replace(/#forge:raw_materials\//g, '') }).join('; ') +
      (endTitanium.length > 0 ? ' titanium ores in ' + endTitanium.join(',') : '') +
      (tableProblems.length > 0 ? ' problems=' + tableProblems.join(' | ') : ''))

    var ids = ['grindless:crafting/hv_vein_drill', 'grindless:crafting/hv_greenhouse', 'grindless:crafting/stainless_steel_drill_bit'].concat(
      endVeins.map(function (v) { return 'grindless:crafting/vein_sample/' + v.id }))
    var missingRecipes = ids.filter(function (id) { return !rm.byKey(rl(id)).isPresent() })
    check(SCOPE, 'crafting', missingRecipes.length === 0,
      'count=' + ids.length + (missingRecipes.length > 0 ? ' missing=' + missingRecipes.join(',') : ''))

    // the titanium bit (the old HV one, kept for old worlds) is the EV Tripod Drill's bit again (server_scripts/grindless/ev/tripod.js):
    // registered, a drill bit, every drilling recipe that takes it lives under vein_drilling/ev/ (the HV drill skips that folder) and
    // its HV-era conversion into the stainless steel bit is gone. Whether EMI shows it is the hiding table's business.
    var bits = asArray(Ingredient.of('#grindless:drill_bits').getItemIds()).map(String)
    var hidden = asArray(Ingredient.of('#c:hidden_from_recipe_viewers').getItemIds()).map(String)
    var titaniumDrilling = drillRecipes.filter(function (r) { return String(r.id).indexOf('_titanium') >= 0 }).map(function (r) { return String(r.id) })
    var outsideEv = titaniumDrilling.filter(function (id) { return id.indexOf('grindless:vein_drilling/ev/') !== 0 })
    var conversion = rm.byKey(rl('grindless:crafting/stainless_steel_drill_bit_from_titanium')).isPresent()
    check(SCOPE, 'legacy_bit', Item.exists(LEGACY_BIT) && bits.indexOf(LEGACY_BIT) >= 0 && outsideEv.length === 0 && !conversion,
      'registered=' + Item.exists(LEGACY_BIT) + ' in grindless:drill_bits=' + (bits.indexOf(LEGACY_BIT) >= 0) + ' drilling recipes with a titanium bit=' +
      titaniumDrilling.length + ' (outside vein_drilling/ev/: ' + (outsideEv.length > 0 ? outsideEv.join(',') : 'none') + ') old conversion=' + conversion +
      ' hidden in EMI=' + (hidden.indexOf(LEGACY_BIT) >= 0))

    // the old scheelite sample (the vein left the End table in v0.4.1, saves keep their items): registered, hidden, not a vein sample,
    // no drilling recipe takes it and it crafts back into an empty vein probe
    var samples = asArray(Ingredient.of('#grindless:vein_samples').getItemIds()).map(String)
    var legacySamples = (HV.legacySamples || []).slice()
    var badSamples = legacySamples.filter(function (id) {
      var path = id.substring(id.indexOf(':') + 1)
      // a drilling recipe of this vein is <...>/<vein>_<bit>...; the Mars scheelite vein (scheelite_mars_<bit>) is another sample's
      var ofVein = new RegExp('/' + path.replace('vein_sample_', '') + '_(bronze|steel|vanadium_steel|stainless_steel|titanium)(_|$)')
      var drills = drillRecipes.filter(function (r) { return ofVein.test(String(r.id)) }).length
      return !Item.exists(id) || hidden.indexOf(id) < 0 || samples.indexOf(id) >= 0 || drills > 0 ||
        !rm.byKey(rl('grindless:crafting/empty_vein_probe_from_' + path)).isPresent()
    })
    check(SCOPE, 'legacy_samples', legacySamples.indexOf('grindless:vein_sample_scheelite') >= 0 && badSamples.length === 0,
      'legacy=' + legacySamples.join(',') + (badSamples.length > 0 ? ' not registered / not hidden / still a sample / still drilled / no conversion: ' + badSamples.join(',') : ''))

    // the wear of the bits as GTM sees it: chance of being consumed out of 10000
    try {
      var read = function (id) {
        var r = rm.byKey(rl(id)).get()
        var chances = asArray(r.getInputContents(ic)).map(function (c) { return Number(c.chance) })
        var fluidMb = asArray(r.getInputContents(fc)).map(function (c) { return Number(c.content.getStacks()[0].getAmount()) })
        return { chances: chances, fluid: fluidMb, duration: Number(r.duration) }
      }
      var base = read('grindless:vein_drilling/hv/iron_stainless_steel')
      var wet = read('grindless:vein_drilling/hv/iron_stainless_steel_fluid')
      var endVanadium = read('grindless:vein_drilling/mv/bauxite_end_vanadium_steel_fluid')
      var endWet = read('grindless:vein_drilling/hv/sheldonite_stainless_steel_fluid')
      var vanadium = read('grindless:vein_drilling/mv/iron_vanadium_steel')
      // bit first in the fluid recipes, sample first in the base ones (see the lookup note of family_vein_drilling.js)
      var okWear = base.chances.join(',') === '0,50' && wet.chances.join(',') === '25,0' && wet.fluid.join(',') === '50' &&
        endVanadium.chances.join(',') === '50,0' && endVanadium.fluid.join(',') === '50' && endWet.chances.join(',') === '25,0' &&
        vanadium.chances.join(',') === '0,100'
      check(SCOPE, 'bit_wear', okWear, 'stainless steel base inputs (chance)=' + base.chances.join(',') + ' stainless steel fluid recipe=' + wet.chances.join(',') +
        ' fluid mB=' + wet.fluid.join(',') + ' End vanadium fluid recipe=' + endVanadium.chances.join(',') + ' End stainless steel fluid recipe=' + endWet.chances.join(',') +
        ' MV vanadium base=' + vanadium.chances.join(',') + ' durations=' + base.duration + '/' + wet.duration)
    } catch (e) {
      check(SCOPE, 'bit_wear', false, 'exception: ' + e)
    }
  }

  // ---------------------------------------------------------------- the live vein registry against the drill tables

  var COVERAGE = 'vein_coverage'
  var COVERAGE_REQUEST = 'ggTestVeinCoverageRequest'
  var EXCLUDED_TABLE = 'kubejs/data/grindless/tables/veins_excluded.json'

  // any Java Iterable (Set, List, registry key set) -> JS array
  function listOf(iterable) {
    var out = []
    var it = iterable.iterator()
    while (it.hasNext()) out.push(it.next())
    return out
  }

  // registry id -> the name of its sample item, the way the pack validator (tools/analysis) derives it:
  // gtnn:kaolinite_vein -> grindless:vein_sample_kaolinite, gtceu:magnetite_vein_ow -> grindless:vein_sample_magnetite_ow
  function sampleOf(veinId) {
    var path = veinId.indexOf(':') >= 0 ? veinId.split(':')[1] : veinId
    return 'grindless:vein_sample_' + path.replace(/_vein(?=_|$)/, '')
  }

  // What the pack owes one vein of the registry. vein = { id, dims: [dimension ids of its filter], generatesIn: [the loaded ones
  // among them whose layer applies there], sample }; ctx = { itemExists, recipesOf: {sample: recipes that take it}, excludedIds, excludedDims }
  //   covered               its sample item exists and at least one vein_drilling recipe takes it
  //   excluded              listed in veins_excluded.json (by id, or every dimension of its filter is listed)
  //   unreachable           no loaded dimension of its filter takes its layer: GTM never generates it on this server
  //   uncovered             it can generate here and the sample or the recipes are missing                  -> FAIL
  //   excluded_but_covered  an entry of the exclusion list that is not true any more                        -> FAIL
  function classifyVein(vein, ctx) {
    var covered = ctx.itemExists(vein.sample) && (ctx.recipesOf[vein.sample] || 0) > 0
    var excluded = ctx.excludedIds[vein.id] === true ||
      (vein.dims.length > 0 && vein.dims.every(function (d) { return ctx.excludedDims[d] === true }))
    if (excluded) return covered ? 'excluded_but_covered' : 'excluded'
    if (vein.generatesIn.length === 0) return 'unreachable'
    return covered ? 'covered' : 'uncovered'
  }

  // the veins of GTM's registry (GTM's own, GT--, GTCA, Gregicality Rocketry, whatever a later mod adds) as the classifier needs them
  function liveVeins(server) {
    var loaded = {}
    listOf(server.levelKeys()).forEach(function (k) { loaded[String(k.location())] = true })
    var out = []
    listOf(GTRegistries.ORE_VEINS.keys()).forEach(function (key) {
      var id = String(key)
      var def = GTRegistries.ORE_VEINS.get(key)
      var layer = def.layer()
      var dims = listOf(def.dimensionFilter()).map(function (d) { return String(d.location()) })
      var mats = []
      var radioactive = []
      try {
        listOf(def.veinGenerator().getAllMaterials()).forEach(function (m) {
          mats.push(String(m.getResourceLocation()))
          try {
            if (m.isRadioactive()) radioactive.push(String(m.getResourceLocation()))
          } catch (e1) { /* optional */ }
        })
      } catch (e0) { /* optional */ }
      out.push({
        id: id,
        dims: dims,
        layer: String(layer.getSerializedName()),
        layerLevels: listOf(layer.getLevels()).map(String),
        mats: mats,
        radioactive: radioactive,
        generatesIn: dims.filter(function (d) { return loaded[d] === true && layer.isApplicableForLevel(rl(d)) }),
        sample: sampleOf(id)
      })
    })
    out.sort(function (a, b) { return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0) })
    return out
  }

  function coverageContext(server) {
    var table = global.grindless.readJsonTable(EXCLUDED_TABLE)
    var excludedIds = {}
    var excludedDims = {}
    var until = {}
    ;(table.veins || []).forEach(function (e) {
      excludedIds[e.id] = true
      until[e.id] = e.until
    })
    ;(table.dimensions || []).forEach(function (e) {
      e.ids.forEach(function (d) {
        excludedDims[d] = true
        until[d] = e.until
      })
    })
    // how many vein_drilling recipes take each sample item (the sample is a non-consumed input of every one of them)
    var recipesOf = {}
    var drilling = GTRegistries.RECIPE_TYPES.get(rl('gtceu:vein_drilling'))
    asArray(server.getRecipeManager().getAllRecipesFor(drilling)).forEach(function (r) {
      var taken = {}
      asArray(r.getInputContents(lazy().ItemCap)).forEach(function (c) {
        var found = String(c.content.toJson()).match(/grindless:vein_sample_[a-z0-9_]+/g)
        ;(found || []).forEach(function (id) { taken[id] = true })
      })
      Object.keys(taken).forEach(function (id) { recipesOf[id] = (recipesOf[id] || 0) + 1 })
    })
    return {
      itemExists: function (id) { return Item.exists(id) },
      recipesOf: recipesOf,
      excludedIds: excludedIds,
      excludedDims: excludedDims,
      until: until,
      excludedTable: table
    }
  }

  // FAILs for every vein of the live registry that can generate on this server and has no sample item or no vein_drilling recipe
  // for it, unless data/grindless/tables/veins_excluded.json lists it. A mod that adds veins is caught the day it is added.
  function veinCoverage(server) {
    var ctx = coverageContext(server)
    var veins = liveVeins(server)
    var strip = function (id) { return id.replace(/^gtceu:/, '') }

    // the classifier first, on made-up veins: a check that could not fail would prove nothing
    var OW = 'minecraft:overworld'
    var synthetic = {
      itemExists: function (id) { return id === 'grindless:vein_sample_have' || id === 'grindless:vein_sample_norecipe' },
      recipesOf: { 'grindless:vein_sample_have': 2 },
      excludedIds: { 'mod:waits_vein': true },
      excludedDims: { 'mod:space': true }
    }
    var cases = [
      ['covered', { id: 'mod:have_vein', dims: [OW], generatesIn: [OW], sample: 'grindless:vein_sample_have' }],
      ['uncovered', { id: 'mod:new_vein', dims: [OW], generatesIn: [OW], sample: 'grindless:vein_sample_new' }],
      ['uncovered', { id: 'mod:norecipe_vein', dims: [OW], generatesIn: [OW], sample: 'grindless:vein_sample_norecipe' }],
      ['unreachable', { id: 'mod:dead_vein', dims: [OW], generatesIn: [], sample: 'grindless:vein_sample_dead' }],
      ['excluded', { id: 'mod:waits_vein', dims: [OW], generatesIn: [OW], sample: 'grindless:vein_sample_waits' }],
      ['excluded', { id: 'mod:moon_vein', dims: ['mod:space'], generatesIn: ['mod:space'], sample: 'grindless:vein_sample_moon' }],
      ['uncovered', { id: 'mod:both_vein', dims: ['mod:space', OW], generatesIn: ['mod:space', OW], sample: 'grindless:vein_sample_both' }],
      ['excluded_but_covered', { id: 'mod:waits_vein', dims: [OW], generatesIn: [OW], sample: 'grindless:vein_sample_have' }]
    ]
    var wrong = cases.filter(function (c) { return classifyVein(c[1], synthetic) !== c[0] })
      .map(function (c) { return c[1].id + ' wanted ' + c[0] + ' got ' + classifyVein(c[1], synthetic) })
    check(COVERAGE, 'selftest', wrong.length === 0,
      cases.length + ' made-up veins (covered, no sample, sample without recipes, unreachable, excluded by id and by dimension, ' +
      'a space exclusion hiding an Overworld vein, a stale exclusion)' + (wrong.length > 0 ? ' wrong=' + wrong.join('; ') : ''))

    var by = { covered: [], excluded: [], unreachable: [], uncovered: [], excluded_but_covered: [] }
    veins.forEach(function (v) {
      var status = classifyVein(v, ctx)
      by[status].push(v)
      if (status === 'uncovered') {
        check(COVERAGE, 'vein_' + v.id, false, v.id + ' (layer ' + v.layer + ', ' + v.dims.join('/') + '; ores ' + v.mats.map(strip).join(',') + ') generates in ' +
          v.generatesIn.join('/') + ' but ' + (ctx.itemExists(v.sample) ? 'no vein_drilling recipe takes ' + v.sample : 'there is no sample item ' + v.sample) +
          ': add it to veins_overworld_extra.json / veins_nether.json / veins_end.json, or to veins_excluded.json if it has to wait' +
          (v.radioactive.length > 0 ? ' (radioactive: ' + v.radioactive.map(strip).join(',') + ')' : ''))
      } else if (status === 'excluded_but_covered') {
        check(COVERAGE, 'vein_' + v.id, false, v.id + ' is listed in veins_excluded.json (until ' + ctx.until[v.id] + ') but it has its sample and its recipes: delete the entry')
      }
    })

    var byMod = {}
    by.covered.forEach(function (v) {
      var ns = v.id.split(':')[0]
      byMod[ns] = (byMod[ns] || 0) + 1
    })
    var modSummary = Object.keys(byMod).sort().map(function (ns) { return ns + '=' + byMod[ns] }).join(' ')
    check(COVERAGE, 'registry', by.uncovered.length === 0 && by.excluded_but_covered.length === 0 && by.covered.length > 0,
      veins.length + ' veins in GTRegistries.ORE_VEINS: covered=' + by.covered.length + ' (' + modSummary + ') excluded=' + by.excluded.length +
      ' unreachable=' + by.unreachable.length + ' uncovered=' + by.uncovered.length + ' stale exclusions=' + by.excluded_but_covered.length)

    note(COVERAGE, 'excluded', by.excluded.map(function (v) {
      return v.id + ' (until ' + (ctx.until[v.id] || ctx.until[v.dims[0]]) + ')'
    }).join(', '))
    note(COVERAGE, 'unreachable', by.unreachable.map(function (v) {
      return strip(v.id) + ' [' + v.layer + ' layer: ' + v.layerLevels.join('/') + ']'
    }).join(', ') + ' - their layer applies in none of the loaded dimensions of their filter, so GTM never generates them here')

    // an exclusion whose vein is gone from the registry is only worth a note (the mod was removed)
    var known = {}
    veins.forEach(function (v) { known[v.id] = true })
    var gone = Object.keys(ctx.excludedIds).filter(function (id) { return known[id] !== true })
    if (gone.length > 0) note(COVERAGE, 'stale_exclusions', 'not in the registry any more: ' + gone.join(', '))
  }

  // ---------------------------------------------------------------- structures (same technique as gg_test_lv_multis.js)

  function simpleBlock(sym, machineId) {
    switch (sym.kind) {
      case 'blocks':
        return { id: sym.blocks[0] }
      case 'frames':
        return { id: 'gtceu:' + sym.materials[0] + '_frame' }
      case 'part':
        if (!PART_BLOCKS[sym.ability]) throw new Error('the test does not know the part ability ' + sym.ability)
        return { id: PART_BLOCKS[sym.ability], ability: sym.ability }
      case 'controller':
        return { id: machineId, controller: true }
      case 'air':
      case 'any':
        return null
      default:
        throw new Error('unsupported symbol kind ' + sym.kind)
    }
  }

  // a "casing OR parts" cell: the parts the limits ask for (or the amount the spec says) are spread evenly over the cells, the
  // rest is the plain block
  function assignOneOf(sym, list, machineId, counts) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var need = lim.exact != null ? lim.exact : (lim.min != null ? lim.min : 0)
        if (counts && counts[o.ability] != null) need = counts[o.ability]
        for (var k = 0; k < need; k++) parts.push(simpleBlock(o, machineId))
      } else if (filler === null) {
        filler = simpleBlock(o, machineId)
      }
    })
    if (filler === null) throw new Error('a oneOf symbol has no plain block option')
    if (parts.length > list.length) throw new Error('more required parts (' + parts.length + ') than cells (' + list.length + ')')
    list.forEach(function (c) { c.block = filler })
    parts.forEach(function (p, i) {
      list[Math.floor((i + 0.5) * list.length / parts.length)].block = p
    })
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing
  // north: x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(machineId, cx, cy, cz, counts) {
    var desc = global.grindless.patterns.describe(machineId)
    if (!desc) throw new Error('no structure description recorded for ' + machineId)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, ch: ch, sym: sym, block: null, props: '' })
        }
      })
    })
    if (ctrl === null) throw new Error('the description has no controller cell')
    cells.forEach(function (c) {
      c.x = cx - (c.ci - ctrl.ci)
      c.y = cy + (c.ri - ctrl.ri)
      c.z = cz - (c.si - ctrl.si)
    })

    var byChar = {}
    cells.forEach(function (c) {
      if (!byChar[c.ch]) byChar[c.ch] = []
      byChar[c.ch].push(c)
    })
    Object.keys(byChar).forEach(function (ch) {
      var sym = desc.symbols[ch]
      var list = byChar[ch]
      if (sym.kind === 'oneOf') {
        assignOneOf(sym, list, machineId, counts)
      } else {
        var b = simpleBlock(sym, machineId)
        list.forEach(function (c) { c.block = b })
      }
    })

    var occupied = {}
    cells.forEach(function (c) {
      if (c.block) occupied[c.x + ',' + c.y + ',' + c.z] = true
    })
    cells.forEach(function (c) {
      if (!c.block) return
      if (c.block.controller) {
        c.props = '[facing=north]'
      } else if (c.block.ability) {
        for (var i = 0; i < SIDES.length; i++) {
          var s = SIDES[i]
          if (!occupied[(c.x + s[1]) + ',' + (c.y + s[2]) + ',' + (c.z + s[3])]) {
            c.props = '[facing=' + s[0] + ']'
            break
          }
        }
      }
    })

    var placed = cells.filter(function (c) { return c.block !== null })
    var width = desc.slices[0][0].length
    return {
      id: machineId,
      cx: cx, cy: cy, cz: cz,
      cells: placed,
      desc: desc,
      size: width + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)',
      blocks: placed.length
    }
  }

  function setBlock(c) {
    return S.server.runCommandSilent('setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
  }

  // everything but the controller first, the controller last
  function place(plan, scope) {
    var failed = []
    var ctrlCell = null
    plan.cells.forEach(function (c) {
      if (c.block.controller) {
        ctrlCell = c
        return
      }
      if (setBlock(c) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.block.id + c.props)
    })
    if (setBlock(ctrlCell) < 1) failed.push('controller ' + ctrlCell.block.id)
    plan.ctrl = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }

    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.block.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.block.id + ' got ' + got)
    })
    var parts = plan.cells.filter(function (c) { return c.block.ability }).map(function (c) {
      return c.block.ability + '@' + c.x + ',' + c.y + ',' + c.z + c.props
    })
    check(scope, 'PLACED', failed.length === 0 && wrong.length === 0,
      'blocks=' + plan.blocks + ' size=' + plan.size + ' controller=' + plan.ctrl.x + ',' + plan.ctrl.y + ',' + plan.ctrl.z +
      ' parts=[' + parts.join(' ') + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function describeSymbol(sym) {
    if (sym.kind === 'oneOf') return 'oneOf(' + sym.options.map(describeSymbol).join(' | ') + ')'
    if (sym.kind === 'blocks') return sym.blocks.join('/')
    if (sym.kind === 'frames') return 'frame ' + sym.materials.join('/')
    if (sym.kind === 'part') return 'part ' + sym.ability
    return sym.kind
  }

  function describeError(m, ctrl) {
    try {
      var st = ctrl.getMultiblockState()
      var err = st.error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = 'pattern error ' + String(err)
      try {
        var pos = err.getPos()
        var px = pos.getX()
        var py = pos.getY()
        var pz = pos.getZ()
        text += ' at ' + px + ',' + py + ',' + pz + ' found ' + blockIdAt(px, py, pz)
        for (var i = 0; i < m.plan.cells.length; i++) {
          var c = m.plan.cells[i]
          if (c.x === px && c.y === py && c.z === pz) {
            text += ' expected symbol ' + c.ch + ' = ' + describeSymbol(c.sym) + ' (placed ' + c.block.id + c.props + ')'
            break
          }
        }
      } catch (e1) {
        text += ' (no position: ' + e1 + ')'
      }
      try {
        text += ' info=' + err.getErrorInfo().getString()
      } catch (e2) { /* optional */ }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  function partIds(ctrl) {
    return asArray(ctrl.getParts()).map(function (p) { return String(p.getDefinition().getId()).replace('gtceu:', '') })
  }

  // the structure preview EMI / JEI draw: size and the parts it contains
  function previewCheck(scope, id, def, plan, wantParts) {
    var shapes = asArray(def.getMatchingShapes())
    var blocks = shapes[0].getBlocks()
    var counts = {}
    var total = 0
    for (var x = 0; x < blocks.length; x++) {
      for (var y = 0; y < blocks[x].length; y++) {
        for (var z = 0; z < blocks[x][y].length; z++) {
          var info = blocks[x][y][z]
          if (info === null || info === undefined) continue
          var block = info.getBlockState().getBlock()
          var bid = String(Block.getId(block))
          if (bid === 'minecraft:air') continue
          counts[bid] = (counts[bid] || 0) + 1
          total++
        }
      }
    }
    var missing = []
    wantParts.forEach(function (ability) {
      var found = false
      Object.keys(counts).forEach(function (bid) {
        if (bid.indexOf('_' + PART_BLOCKS[ability].replace(/^gtceu:[a-z]+_/, '')) > 0 || bid === PART_BLOCKS[ability]) found = true
      })
      if (!found) missing.push(ability)
    })
    if (!counts[id]) missing.push('controller')
    check(scope, 'PREVIEW', shapes.length >= 1 && missing.length === 0,
      'shapes=' + shapes.length + ' blocks=' + total + ' (placed structure: ' + plan.blocks + ')' +
      (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
  }

  // ---------------------------------------------------------------- inputs and outputs

  function readBus(bus) {
    var inv = bus.getInventory()
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = String(st.getId())
      counts[id] = (counts[id] || 0) + st.getCount()
    }
    return counts
  }

  function clearInventory(inv) {
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
  }

  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return { id: st.isEmpty() ? 'none' : fluidName(st), amount: st.isEmpty() ? 0 : st.getAmount() }
  }

  function findParts(ctrl) {
    var P = { energy: [], inBus: null, outBuses: [], inHatches: [], outHatch: null }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.energy_input) P.energy.push(p)
      else if (pid === PART_BLOCKS.input_bus) P.inBus = p
      else if (pid === PART_BLOCKS.output_bus) P.outBuses.push(p)
      else if (pid === PART_BLOCKS.input_hatch) P.inHatches.push(p)
      else if (pid === PART_BLOCKS.output_hatch) P.outHatch = p
    })
    return P
  }

  function topUpEnergy(m) {
    if (m.parts === null) return
    m.parts.energy.forEach(function (p) {
      var c = p.energyContainer
      c.setEnergyStored(c.getEnergyCapacity())
    })
  }

  function emptyHatches(P) {
    P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    if (P.outHatch !== null) P.outHatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
  }

  function resetMachine(m, ctrl) {
    var P = m.parts
    clearInventory(P.inBus.getInventory())
    clearInventory(P.inBus.getCircuitInventory())
    P.outBuses.forEach(function (b) { clearInventory(b.getInventory()) })
    emptyHatches(P)
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  // fluids go into the input hatches in order: the first fluid of a scenario in the first hatch, and so on
  function putFluids(P, fluids) {
    if (fluids.length > P.inHatches.length) {
      throw new Error('the scenario needs ' + fluids.length + ' fluids but the machine has ' + P.inHatches.length + ' input hatch(es)')
    }
    fluids.forEach(function (f, i) {
      P.inHatches[i].tank.setFluidInTank(0, Fluid.of(f.id, f.mb).getFluidStack())
    })
  }

  function fluidText(fluids) {
    return fluids.length === 0 ? 'none' : fluids.map(function (f) { return f.id + ' ' + f.mb + ' mB' }).join(' + ')
  }

  function fillScenario(m, sc) {
    var P = m.parts
    var inv = P.inBus.getInventory()
    sc.items.forEach(function (input, slot) {
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
    if (sc.circuit) {
      // the bus circuit slot refuses insertItem (its capability IO is NONE); players set it through the GUI
      P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
    }
    putFluids(P, sc.fluids)
    note(m.scope, 'INPUT_' + sc.name, 'bus=[' + itemSummary(readBus(P.inBus)) + '] circuit=' + (sc.circuit ? sc.circuit : 'none') +
      ' fluids=' + fluidText(sc.fluids) + ' output buses=' + P.outBuses.length + ' energy hatches=' + P.energy.length +
      ' input hatches=' + P.inHatches.length)
  }

  function recipeState(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() +
        ' lastRecipe=' + (last ? last.id + ' parallels=' + last.parallels : 'none')
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

  // what GTM's own recipe lookup and matching say about the machine right now (used when a machine stays idle)
  function diagnose(ctrl) {
    var out = []
    try {
      var match = ctrl.getRecipeType().db().find(ctrl)
      if (!match) {
        out.push('lookup=none')
      } else {
        var helper = Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
        out.push('lookup=' + match.id)
        try { out.push('matchRecipe=' + helper.matchRecipe(ctrl, match).isSuccess()) } catch (e1) { out.push('matchRecipe threw ' + e1) }
        try { out.push('matchTickRecipe=' + helper.matchTickRecipe(ctrl, match).isSuccess()) } catch (e2) { out.push('matchTickRecipe threw ' + e2) }
      }
      out.push('workingEnabled=' + ctrl.isWorkingEnabled())
      var fails = asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
      if (fails.length > 0) out.push('failureReasons=[' + fails.join(' ; ') + ']')
    } catch (e) {
      out.push('diagnose threw ' + e)
    }
    return out.join(' ')
  }

  // everything the scenario checks look at: the output buses, the fluids left in every input hatch, the O2 hatch, what is left
  // in the input bus, the recipes seen and the most runs at once / the shortest cycle observed
  function collect(m, ctrl, sc) {
    var P = m.parts
    var counts = {}
    P.outBuses.forEach(function (b) {
      var c = readBus(b)
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    var fluidOut = P.outHatch !== null ? tankInfo(P.outHatch) : { id: 'none', amount: 0 }
    var fluidsIn = {}
    P.inHatches.forEach(function (h) {
      var t = tankInfo(h)
      if (t.id !== 'none') fluidsIn[t.id] = (fluidsIn[t.id] || 0) + t.amount
    })
    return { items: counts, fluidOut: fluidOut, fluidsIn: fluidsIn, leftover: readBus(P.inBus), seen: m.seen, sc: sc,
      maxPar: m.maxPar, minDur: m.minDur }
  }

  // how much of a scenario fluid has been used
  function used(r, fluidId) {
    var start = 0
    r.sc.fluids.forEach(function (f) { if (f.id === fluidId) start += f.mb })
    return start - (r.fluidsIn[fluidId] || 0)
  }

  // sums the output counts of the given item ids
  function total(counts, ids) {
    var n = 0
    ids.forEach(function (id) { n += counts[id] || 0 })
    return n
  }

  function unexpectedItems(counts, allowed) {
    return Object.keys(counts).filter(function (id) { return allowed.indexOf(id) < 0 })
  }

  function seenAny(r, id) {
    return r.seen[id] === true
  }

  function seenIds(r) {
    return Object.keys(r.seen).join(',')
  }

  // ---------------------------------------------------------------- scenarios

  function findVein(id) {
    var veins = global.grindless.hv.allVeins()
    for (var i = 0; i < veins.length; i++) {
      if (veins[i].id === id) return veins[i]
    }
    throw new Error('no vein ' + id + ' in the vein tables')
  }

  // runs = how many runs the machine does at once (the stone byproduct counts them: one per run)
  function veinVerify(veinId, recipeId, minOresPerRun, fluidPerRun, runs) {
    return function (r) {
      var vein = findVein(veinId)
      var ores = vein.ores.map(function (o) { return o.item })
      var oreTotal = total(r.items, ores)
      var stone = r.items[vein.stone] || 0
      var unexpected = unexpectedItems(r.items, ores.concat([vein.stone]))
      var mb = used(r, DRILLING_FLUID)
      var ok = stone >= runs && stone % runs === 0 && oreTotal >= stone * minOresPerRun && unexpected.length === 0 &&
        seenAny(r, recipeId) && r.maxPar === runs
      if (fluidPerRun > 0) ok = ok && mb >= stone * fluidPerRun && mb % fluidPerRun === 0
      return {
        ok: ok,
        detail: veinId + ': runs(stone)=' + stone + ' at once=' + r.maxPar + '/' + runs + ' ores=' + oreTotal + ' fluidUsed=' + mb + ' mB, recipes seen=[' +
          seenIds(r) + '] / items=[' + itemSummary(r.items) + ']' + (unexpected.length > 0 ? ' unexpected=' + unexpected.join(',') : '')
      }
    }
  }

  var BIT_BRONZE = 'grindless:bronze_drill_bit'
  var BIT_STEEL = 'grindless:steel_drill_bit'
  var BIT_VANADIUM = 'grindless:vanadium_steel_drill_bit'
  var BIT_STAINLESS = 'grindless:stainless_steel_drill_bit'
  // the old HV bit: HV has no titanium (DECISIONS.md, 2026-10-24); registered for old worlds, hidden, no recipe takes it
  var LEGACY_BIT = 'grindless:titanium_drill_bit'

  // a bit stack is 16: the 32 bits of 32 runs at once are two stacks in two slots of the bus
  function bitStacks(id, total) {
    var list = []
    for (var left = total; left > 0; left -= 16) list.push({ id: id, n: Math.min(16, left) })
    return list
  }

  function drillItems(sample, bit) {
    return [{ id: sample, n: 1 }].concat(bitStacks(bit, 32))
  }

  function noRecipe(r) {
    var n = Object.keys(r.items).length
    return { ok: n === 0, detail: 'no recipe expected: output items=[' + itemSummary(r.items) + '] recipes seen=[' + seenIds(r) + ']' }
  }

  function drillScenarios() {
    var G = global.grindless
    var deep = G.veinTable().filter(function (v) { return v.steelOnly })[0] || null
    var fluid = [{ id: DRILLING_FLUID, mb: 8000 }]
    var list = [
      {
        // a steam recipe: 32 runs at once from one HV hatch (512 V / 8 EU/t = 64, capped at 32), the MV drill does 16
        name: 'base', ticks: 260,
        items: drillItems('grindless:vein_sample_iron', BIT_BRONZE), circuit: 0, fluids: [],
        verify: veinVerify('iron', 'grindless:vein_drilling/iron_bronze', 1, 0, 32)
      },
      {
        // an LV drilling-fluid recipe: the base one waits, 32 runs at once
        name: 'fluid', ticks: 260,
        items: drillItems('grindless:vein_sample_iron', BIT_STEEL), circuit: 0, fluids: fluid,
        verify: veinVerify('iron', 'grindless:vein_drilling/lv/iron_steel_fluid', 3, 50, 32)
      },
      {
        // the MV vanadium steel bit still works here
        name: 'vanadium', ticks: 260,
        items: drillItems('grindless:vein_sample_iron', BIT_VANADIUM), circuit: 0, fluids: [],
        verify: veinVerify('iron', 'grindless:vein_drilling/mv/iron_vanadium_steel', 2, 0, 32)
      },
      {
        // the stainless steel bit without fluid: 3.75 ores per run
        name: 'stainless', ticks: 260,
        items: drillItems('grindless:vein_sample_iron', BIT_STAINLESS), circuit: 0, fluids: [],
        verify: veinVerify('iron', 'grindless:vein_drilling/hv/iron_stainless_steel', 3, 0, 32)
      },
      {
        // the stainless steel bit with drilling fluid: +50 % ore, half the wear; the base recipe waits
        name: 'stainless_fluid', ticks: 260,
        items: drillItems('grindless:vein_sample_iron', BIT_STAINLESS), circuit: 0, fluids: fluid,
        verify: veinVerify('iron', 'grindless:vein_drilling/hv/iron_stainless_steel_fluid', 5, 50, 32)
      },
      {
        // a Nether vein with the stainless steel bit: only possible with drilling fluid
        name: 'stainless_nether', ticks: 260,
        items: drillItems('grindless:vein_sample_sulfur', BIT_STAINLESS), circuit: 0, fluids: fluid,
        verify: veinVerify('sulfur', 'grindless:vein_drilling/hv/sulfur_stainless_steel_fluid', 5, 50, 32)
      },
      {
        // End veins: always with drilling fluid, with the stainless steel bit or the vanadium steel one
        name: 'end_bauxite_stainless', ticks: 260,
        items: drillItems('grindless:vein_sample_bauxite_end', BIT_STAINLESS), circuit: 0, fluids: fluid,
        verify: veinVerify('bauxite_end', 'grindless:vein_drilling/hv/bauxite_end_stainless_steel_fluid', 5, 50, 32)
      },
      {
        name: 'end_magnetite_vanadium', ticks: 260,
        items: drillItems('grindless:vein_sample_magnetite_end', BIT_VANADIUM), circuit: 0, fluids: fluid,
        verify: veinVerify('magnetite_end', 'grindless:vein_drilling/mv/magnetite_end_vanadium_steel_fluid', 5, 50, 32)
      },
      {
        name: 'end_sheldonite_stainless', ticks: 260,
        items: drillItems('grindless:vein_sample_sheldonite', BIT_STAINLESS), circuit: 0, fluids: fluid,
        verify: veinVerify('sheldonite', 'grindless:vein_drilling/hv/sheldonite_stainless_steel_fluid', 5, 50, 32)
      },
      {
        // the veins other mods add: GT--'s kaolinite is an Overworld vein veins.json does not list: steam numbers, steam recipe id
        name: 'extra_kaolinite', ticks: 260,
        items: drillItems('grindless:vein_sample_kaolinite', BIT_BRONZE), circuit: 0, fluids: [],
        verify: veinVerify('kaolinite', 'grindless:vein_drilling/kaolinite_bronze', 1, 0, 32)
      },
      {
        // GTCA's germanite (Nether) and zirconium (End): their main ores are gtca:raw_* items, not gtceu: ones
        name: 'nether_germanite_stainless', ticks: 260,
        items: drillItems('grindless:vein_sample_germanite', BIT_STAINLESS), circuit: 0, fluids: fluid,
        verify: veinVerify('germanite', 'grindless:vein_drilling/hv/germanite_stainless_steel_fluid', 5, 50, 32)
      },
      {
        name: 'end_zirconium_stainless', ticks: 260,
        items: drillItems('grindless:vein_sample_zirconium', BIT_STAINLESS), circuit: 0, fluids: fluid,
        verify: veinVerify('zirconium', 'grindless:vein_drilling/hv/zirconium_stainless_steel_fluid', 4, 50, 32)
      },
      {
        // the same Nether sample without fluid must not run
        name: 'nether_no_fluid', ticks: 60,
        items: drillItems('grindless:vein_sample_sulfur', BIT_STAINLESS), circuit: 0, fluids: [],
        verify: noRecipe
      },
      {
        // End veins need drilling fluid too: this is what keeps the steam drill (no fluid hatch) out of them
        name: 'end_no_fluid', ticks: 60,
        items: drillItems('grindless:vein_sample_bauxite_end', BIT_STAINLESS), circuit: 0, fluids: [],
        verify: noRecipe
      },
      {
        // no End recipe exists for the bronze and steel bits
        name: 'end_steel_none', ticks: 60,
        items: drillItems('grindless:vein_sample_bauxite_end', BIT_STEEL), circuit: 0, fluids: fluid,
        verify: noRecipe
      }
    ]
    if (deep !== null) {
      list.splice(6, 0, {
        // a deep vein (steel bit or better) with the stainless steel bit
        name: 'stainless_deep', ticks: 260,
        items: drillItems(deep.sample, BIT_STAINLESS), circuit: 0, fluids: [],
        verify: veinVerify(deep.id, 'grindless:vein_drilling/hv/' + deep.id + '_stainless_steel', 3, 0, 32)
      })
    }
    return list
  }

  // two HV hatches: still 32 runs at once (the cap) but one voltage tier up, so GTM's overclock halves the 200 ticks. The bits wear
  // out one by one (a few of the 32 per cycle), so the bus holds 64: the second cycle runs at full parallels too.
  function twoHatchScenarios() {
    return [
      {
        name: 'overclock', ticks: 260,
        items: [{ id: 'grindless:vein_sample_iron', n: 1 }].concat(bitStacks(BIT_BRONZE, 64)), circuit: 0, fluids: [],
        verify: function (r) {
          var vein = findVein('iron')
          var stone = r.items[vein.stone] || 0
          return {
            ok: stone >= 56 && r.maxPar === 32 && r.minDur > 0 && r.minDur <= 100 && seenAny(r, 'grindless:vein_drilling/iron_bronze'),
            detail: 'iron: runs(stone)=' + stone + ' (two cycles of up to 32) at once=' + r.maxPar + ' shortest cycle=' + r.minDur +
              ' ticks (200 without overclock) recipes seen=[' + seenIds(r) + ']'
          }
        }
      }
    ]
  }

  var ALLOWED_TREE = ['minecraft:oak_log', 'minecraft:oak_sapling', 'minecraft:stick', 'minecraft:apple']

  function greenhouseScenarios() {
    return [
      {
        // circuit 1 = base: the steam recipe, 32 runs at once from one HV hatch (4 EU/t each)
        name: 'base', ticks: 430,
        items: [{ id: 'minecraft:oak_sapling', n: 1 }], circuit: 1, fluids: [],
        verify: function (r) {
          var logs = r.items['minecraft:oak_log'] || 0
          var unexpected = unexpectedItems(r.items, ALLOWED_TREE)
          return {
            ok: logs >= 192 && logs % 6 === 0 && unexpected.length === 0 && seenAny(r, 'grindless:greenhouse/oak') && r.maxPar === 32,
            detail: 'oak: logs=' + logs + ' (runs=' + (logs / 6) + ') at once=' + r.maxPar + ' recipes seen=[' + seenIds(r) + '] / items=[' + itemSummary(r.items) + ']'
          }
        }
      },
      {
        // circuit 2 + fertilizer + water, no CO2: the LV fertilizer variant, 32 runs at once
        name: 'fertilizer', ticks: 260,
        items: [{ id: 'minecraft:oak_sapling', n: 1 }, { id: 'gtceu:fertilizer', n: 64 }], circuit: 2,
        fluids: [{ id: WATER, mb: 8000 }],
        verify: function (r) {
          var logs = r.items['minecraft:oak_log'] || 0
          var runs = logs / 12
          var fertUsed = 64 - (r.leftover['gtceu:fertilizer'] || 0)
          var unexpected = unexpectedItems(r.items, ALLOWED_TREE)
          return {
            ok: logs >= 384 && logs % 12 === 0 && fertUsed >= runs && used(r, WATER) >= runs * 100 && unexpected.length === 0 &&
              seenAny(r, 'grindless:greenhouse/lv/oak_fertilizer') && r.maxPar === 32 && r.fluidOut.amount === 0,
            detail: 'oak fertilizer: logs=' + logs + ' (runs=' + runs + ') at once=' + r.maxPar + ' fertilizerUsed=' + fertUsed + ' waterUsed=' + used(r, WATER) +
              ' mB O2 out=' + r.fluidOut.amount + ' recipes seen=[' + seenIds(r) + '] / items=[' + itemSummary(r.items) + ']'
          }
        }
      },
      {
        // circuit 2 + fertilizer + water + CO2: the fertilizer + CO2 variant (x3), 100 mB of O2 back per run; the LV variant waits
        name: 'co2', ticks: 260,
        items: [{ id: 'minecraft:oak_sapling', n: 1 }, { id: 'gtceu:fertilizer', n: 64 }], circuit: 2,
        fluids: [{ id: WATER, mb: 8000 }, { id: CO2, mb: 8000 }],
        verify: function (r) {
          var logs = r.items['minecraft:oak_log'] || 0
          var runs = logs / 18
          var unexpected = unexpectedItems(r.items, ALLOWED_TREE)
          return {
            ok: logs >= 576 && logs % 18 === 0 && used(r, CO2) >= runs * 200 && used(r, CO2) % 200 === 0 && used(r, WATER) >= runs * 100 &&
              r.fluidOut.id === O2 && r.fluidOut.amount >= runs * 100 && r.fluidOut.amount % 100 === 0 && unexpected.length === 0 &&
              seenAny(r, 'grindless:greenhouse/mv/oak_fertilizer_co2') && !seenAny(r, 'grindless:greenhouse/lv/oak_fertilizer') && r.maxPar === 32,
            detail: 'oak fertilizer + CO2: logs=' + logs + ' (runs=' + runs + ') at once=' + r.maxPar + ' CO2 used=' + used(r, CO2) + ' mB water used=' + used(r, WATER) +
              ' mB O2 out=' + r.fluidOut.id + ' ' + r.fluidOut.amount + ' mB recipes seen=[' + seenIds(r) + '] / items=[' + itemSummary(r.items) + ']'
          }
        }
      },
      {
        // CO2 in a hatch with circuit 1: ignored, the base recipe runs and the CO2 stays where it is
        name: 'co2_ignored', ticks: 430,
        items: [{ id: 'minecraft:oak_sapling', n: 1 }], circuit: 1,
        fluids: [{ id: CO2, mb: 8000 }],
        verify: function (r) {
          var logs = r.items['minecraft:oak_log'] || 0
          return {
            ok: logs >= 192 && logs % 6 === 0 && used(r, CO2) === 0 && r.fluidOut.amount === 0 && seenAny(r, 'grindless:greenhouse/oak') && r.maxPar === 32,
            detail: 'oak with CO2 around: logs=' + logs + ' at once=' + r.maxPar + ' CO2 used=' + used(r, CO2) + ' mB O2 out=' + r.fluidOut.amount +
              ' recipes seen=[' + seenIds(r) + ']'
          }
        }
      },
      {
        // an extra crop that needs water (no circuit): the LV recipe, 32 runs at once
        name: 'extra', ticks: 430,
        items: [{ id: 'minecraft:red_mushroom', n: 1 }], circuit: 0, fluids: [{ id: WATER, mb: 8000 }],
        verify: function (r) {
          var n = r.items['minecraft:red_mushroom'] || 0
          return {
            ok: n >= 192 && n % 6 === 0 && used(r, WATER) >= (n / 6) * 100 && seenAny(r, 'grindless:greenhouse/lv/extra_red_mushroom') && r.maxPar === 32,
            detail: 'red mushrooms=' + n + ' (runs=' + (n / 6) + ') at once=' + r.maxPar + ' waterUsed=' + used(r, WATER) + ' mB recipes seen=[' + seenIds(r) + ']'
          }
        }
      },
      {
        // the same crop with fertilizer and CO2
        name: 'extra_co2', ticks: 260,
        items: [{ id: 'minecraft:red_mushroom', n: 1 }, { id: 'gtceu:fertilizer', n: 64 }], circuit: 2,
        fluids: [{ id: WATER, mb: 8000 }, { id: CO2, mb: 8000 }],
        verify: function (r) {
          var n = r.items['minecraft:red_mushroom'] || 0
          var runs = n / 18
          return {
            ok: n >= 576 && n % 18 === 0 && used(r, CO2) >= runs * 200 && r.fluidOut.id === O2 && r.fluidOut.amount >= runs * 100 &&
              seenAny(r, 'grindless:greenhouse/mv/extra_red_mushroom_fertilizer_co2') && r.maxPar === 32,
            detail: 'red mushrooms fertilizer + CO2=' + n + ' (runs=' + runs + ') at once=' + r.maxPar + ' CO2 used=' + used(r, CO2) + ' mB O2 out=' +
              r.fluidOut.id + ' ' + r.fluidOut.amount + ' mB recipes seen=[' + seenIds(r) + ']'
          }
        }
      }
    ]
  }

  // ---------------------------------------------------------------- lookup checks

  // every recipe GTM's lookup can reach with the inputs now in the machine (the predicate accepts everything)
  function candidateIds(ctrl) {
    var ids = []
    var it = ctrl.getRecipeType().db().iterator(ctrl, function (r) { return true })
    if (it === null || it === undefined) return ids
    var guard = 0
    while (it.hasNext() && guard < 600) {
      ids.push(String(it.next().id))
      guard++
    }
    return ids
  }

  function setLookupInputs(m, c) {
    var P = m.parts
    clearInventory(P.inBus.getInventory())
    clearInventory(P.inBus.getCircuitInventory())
    P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    var inv = P.inBus.getInventory()
    c.items.forEach(function (input, slot) { inv.insertItem(slot, Item.of(input.id, input.n), false) })
    if (c.circuit) P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(c.circuit))
    putFluids(P, c.fluids)
  }

  function runLookup(m, ctrl, cases) {
    var bad = []
    cases.forEach(function (c) {
      setLookupInputs(m, c)
      var ids = candidateIds(ctrl)
      if (ids.indexOf(c.want) < 0) bad.push(c.label + ' wanted ' + c.want + ' got [' + ids.slice(0, 6).join(',') + ']')
    })
    check(m.scope, 'LOOKUP', bad.length === 0,
      'cases=' + cases.length + (bad.length > 0 ? ' unreachable=' + bad.slice(0, 8).join('; ') : ''))
  }

  // every steam, LV, MV and HV drilling recipe is still reachable from the bit + sample (+ fluid) it asks for
  function drillLookupCases() {
    var cases = []
    var fluid = [{ id: DRILLING_FLUID, mb: 1000 }]
    global.grindless.hv.allVeins().forEach(function (v) {
      ;['bronze', 'steel', 'vanadium_steel', 'stainless_steel'].forEach(function (kind) {
        // End veins: only the vanadium steel and the stainless steel bit have recipes
        if (v.end && (kind === 'bronze' || kind === 'steel')) return
        if (kind === 'bronze' && v.steelOnly) return
        var bit = kind === 'bronze' ? BIT_BRONZE : (kind === 'steel' ? BIT_STEEL : (kind === 'vanadium_steel' ? BIT_VANADIUM : BIT_STAINLESS))
        var items = [{ id: v.sample, n: 1 }, { id: bit, n: 4 }]
        // recipe folder: steam recipes have none (base) or lv/ (fluid), the vanadium steel bit's mv/ (End veins too: the End is MV),
        // the stainless steel bit's hv/
        var tier = kind === 'stainless_steel' ? 'hv' : (kind === 'vanadium_steel' ? 'mv' : 'lv')
        // Nether and End veins have no base recipe: they always need drilling fluid
        if (!v.nether && !v.end) {
          cases.push({ label: v.id + '+' + kind, items: items, circuit: 0, fluids: [],
            want: tier === 'lv' ? 'grindless:vein_drilling/' + v.id + '_' + kind : 'grindless:vein_drilling/' + tier + '/' + v.id + '_' + kind })
        }
        cases.push({ label: v.id + '+' + kind + ' (fluid)', items: items, circuit: 0, fluids: fluid,
          want: 'grindless:vein_drilling/' + tier + '/' + v.id + '_' + kind + '_fluid' })
      })
    })
    return cases
  }

  // every steam, LV and MV greenhouse recipe is still reachable (the HV greenhouse has none of its own)
  function greenhouseLookupCases() {
    var cases = []
    var G = global.grindless
    var water = { id: WATER, mb: 1000 }
    var co2 = { id: CO2, mb: 1000 }
    function fertilizerItems(e) { return [{ id: e.catalyst, n: 1 }, { id: 'gtceu:fertilizer', n: 4 }] }
    G.greenhouse.entries.forEach(function (e) {
      cases.push({ label: e.id + ' (steam)', items: [{ id: e.catalyst, n: 1 }], circuit: 0, fluids: [], want: 'grindless:greenhouse/' + e.id })
      cases.push({ label: e.id + ' (fertilizer)', items: fertilizerItems(e), circuit: 2, fluids: [water], want: 'grindless:greenhouse/lv/' + e.id + '_fertilizer' })
      cases.push({ label: e.id + ' (fertilizer + CO2)', items: fertilizerItems(e), circuit: 2, fluids: [water, co2],
        want: 'grindless:greenhouse/mv/' + e.id + '_fertilizer_co2' })
    })
    G.lv.greenhouseExtras.forEach(function (e) {
      cases.push({ label: e.id, items: [{ id: e.catalyst, n: 1 }], circuit: 0, fluids: [water], want: 'grindless:greenhouse/lv/' + e.id })
      cases.push({ label: e.id + ' (fertilizer)', items: fertilizerItems(e), circuit: 2, fluids: [water], want: 'grindless:greenhouse/lv/' + e.id + '_fertilizer' })
      cases.push({ label: e.id + ' (fertilizer + CO2)', items: fertilizerItems(e), circuit: 2, fluids: [water, co2],
        want: 'grindless:greenhouse/mv/' + e.id + '_fertilizer_co2' })
    })
    return cases
  }

  // ---------------------------------------------------------------- machines

  var SPECS = [
    { id: 'gtceu:hv_vein_drill', x: 1032, y: 101, z: 2, scenarios: drillScenarios, lookup: drillLookupCases,
      previewParts: ['energy_input', 'input_bus', 'output_bus', 'input_hatch'] },
    { id: 'gtceu:hv_vein_drill', tag: '2h', x: 1064, y: 101, z: 2, counts: { energy_input: 2 }, scenarios: twoHatchScenarios, lookup: null,
      previewParts: ['energy_input', 'input_bus', 'output_bus', 'input_hatch'] },
    { id: 'gtceu:hv_greenhouse', x: 1048, y: 102, z: 2, counts: { input_hatch: 2 }, scenarios: greenhouseScenarios, lookup: greenhouseLookupCases,
      previewParts: ['energy_input', 'input_bus', 'output_bus', 'input_hatch', 'output_hatch'] }
  ]

  // this test's own band of the overworld: X 1024..1087, Y 98..112, Z 0..15 (chunks 64..67,0)
  function prepareWorld() {
    for (var cx = 64; cx < 68; cx++) S.level.getChunk(cx, 0)
    S.server.runCommandSilent('forceload add 1024 0 1087 15')
    var cleared = S.server.runCommandSilent('fill 1024 98 0 1087 112 15 air')
    note(SCOPE, 'AREA', 'chunks 64..67,0 (X 1024..1087) generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function startMachine(spec) {
    var scope = spec.id + (spec.tag ? '#' + spec.tag : '')
    var m = { id: spec.id, scope: scope, spec: spec, phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false,
      parts: null, scenarios: null, sc: -1, scStart: 0, seen: {}, stateNoted: false, maxPar: 0, minDur: 0 }
    S.machines.push(m)
    try {
      var def = GTRegistries.MACHINES.get(rl(spec.id))
      if (def === null || def === undefined) {
        check(scope, 'PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      // the pattern is NOT built here: the structure is placed from the registered description and GTM builds the
      // pattern itself, lazily, when the controller first checks its structure (what happens in a real world)
      var desc = global.grindless.patterns.describe(spec.id)
      m.builtBefore = !!(desc && desc.built)
      m.def = def
      m.plan = planOf(spec.id, spec.x, spec.y, spec.z, spec.counts)
      check(scope, 'DESCRIPTION', true, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size +
        ', pattern already built before placing: ' + m.builtBefore)
      if (!place(m.plan, scope)) {
        m.phase = 'done'
        return
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check(scope, 'DESCRIPTION', false, 'exception while describing/placing: ' + e)
      m.phase = 'done'
    }
  }

  // the most runs at once and the shortest cycle seen in this scenario
  function observe(m, ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      if (last) {
        m.seen[String(last.id)] = true
        var par = Number(last.parallels)
        if (par > m.maxPar) m.maxPar = par
      }
      var dur = Number(rlg.getDuration())
      if (dur > 0 && (m.minDur === 0 || dur < m.minDur)) m.minDur = dur
    } catch (e) { /* optional */ }
  }

  function nextScenario(m, ctrl) {
    m.sc++
    if (m.sc >= m.scenarios.length) {
      if (m.spec.lookup !== null) {
        try {
          runLookup(m, ctrl, m.spec.lookup())
        } catch (e) {
          check(m.scope, 'LOOKUP', false, 'exception: ' + e)
        }
      }
      m.phase = 'done'
      return
    }
    var sc = m.scenarios[m.sc]
    resetMachine(m, ctrl)
    m.seen = {}
    m.maxPar = 0
    m.minDur = 0
    m.stateNoted = false
    fillScenario(m, sc)
    m.scStart = S.t
  }

  function advance(m) {
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(m.scope, 'FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }

    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check(m.scope, 'FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') +
          'parts=[' + partIds(ctrl).join(' ') + '] flipped=' + ctrl.isFlipped() + ' tier=' + (ctrl.getTier ? ctrl.getTier() : '?'))
        check(m.scope, 'PATTERN', global.grindless.patterns.describe(m.id).built,
          'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        try {
          previewCheck(m.scope, m.id, m.def, m.plan, m.spec.previewParts)
        } catch (e3) {
          check(m.scope, 'PREVIEW', false, 'exception: ' + e3)
        }
        m.parts = findParts(ctrl)
        if (m.parts.inBus === null || m.parts.outBuses.length === 0 || m.parts.energy.length === 0) {
          check(m.scope, 'PARTS', false, 'missing parts: input bus=' + (m.parts.inBus !== null) + ' output buses=' + m.parts.outBuses.length +
            ' energy hatches=' + m.parts.energy.length)
          m.phase = 'done'
          return
        }
        m.scenarios = m.spec.scenarios()
        m.sc = -1
        m.phase = 'running'
        topUpEnergy(m)
        nextScenario(m, ctrl)
        return
      }
      if (waited >= FORM_TIMEOUT) {
        if (!global.grindless.patterns.describe(m.id).built) {
          check(m.scope, 'FORMED', false, 'not formed after ' + waited + ' ticks and GTM never built the pattern')
          m.phase = 'done'
          return
        }
        var syncOk = ctrl.checkPatternWithLock()
        if (!syncOk) {
          check(m.scope, 'FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(m, ctrl))
          m.phase = 'done'
          return
        }
        check(m.scope, 'FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
        ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
        ctrl.onStructureFormed()
        m.forced = true
      }
      return
    }

    if (m.phase === 'running') {
      var sc = m.scenarios[m.sc]
      var running = S.t - m.scStart
      observe(m, ctrl)
      if (!m.stateNoted && running >= 60) {
        m.stateNoted = true
        note(m.scope, 'STATE_' + sc.name, 'after ' + running + ' ticks: ' + recipeState(ctrl) + ' ' + diagnose(ctrl))
      }
      if (running >= sc.ticks) {
        var verdict = null
        try {
          var result = collect(m, ctrl, sc)
          verdict = sc.verify(result)
        } catch (e) {
          verdict = { ok: false, detail: 'exception while checking: ' + e }
        }
        check(m.scope, 'PROCESS_' + sc.name, verdict.ok, verdict.detail + ' | ' + recipeState(ctrl))
        nextScenario(m, ctrl)
      }
    }
  }

  function allDone() {
    for (var i = 0; i < S.machines.length; i++) {
      if (S.machines[i].phase !== 'done') return false
    }
    return true
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    console.info(TAG + SCOPE + '|DONE')
  }

  // setTimeout is not bound in the scripts of this server, so a server-tick handler drives the steps
  function step(elapsed) {
    try {
      S.t = elapsed
      S.machines.forEach(function (m) {
        if (m.phase === 'done') return
        try {
          advance(m)
        } catch (e) {
          check(m.scope, 'STEP', false, 'exception in ' + m.phase + ': ' + e)
          m.phase = 'done'
        }
      })
      if (allDone()) finish()
    } catch (e) {
      check(SCOPE, 'STEP', false, 'exception: ' + e)
      finish()
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    S.machines.forEach(function (m) {
      if (m.phase === 'running') {
        try { topUpEnergy(m) } catch (e) { /* the next step reports problems */ }
      }
    })
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    step(now - S.tick0)
  }

  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[REQUEST] = false
    try {
      run(server)
    } catch (e) {
      check(SCOPE, 'run', false, 'exception: ' + e)
      finish()
    }
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.overworld(), t: 0, tick0: now, nextAt: now + STEP, machines: [], finished: false }
    try {
      staticChecks()
    } catch (e) {
      check(SCOPE, 'static', false, 'exception: ' + e)
    }
    try {
      veinCoverage(server)
    } catch (e) {
      check(COVERAGE, 'run', false, 'exception: ' + e)
    }
    try {
      prepareWorld()
    } catch (e) {
      check(SCOPE, 'AREA', false, 'exception: ' + e)
    }
    SPECS.forEach(startMachine)
    if (allDone()) finish()
  }

  // gg_test_vein_coverage runs only the vein registry check (no world, no machines: about a minute with the server start)
  function startCoverageIfRequested(server) {
    if (global[COVERAGE_REQUEST] !== true) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[COVERAGE_REQUEST] = false
    try {
      veinCoverage(server)
    } catch (e) {
      check(COVERAGE, 'run', false, 'exception: ' + e)
    }
    console.info(TAG + COVERAGE + '|DONE')
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    startCoverageIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_vein_coverage', function (event) {
    global[COVERAGE_REQUEST] = true
    return 1
  })

  ServerEvents.customCommand('gg_test_hv_multis', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_hv_multis run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
