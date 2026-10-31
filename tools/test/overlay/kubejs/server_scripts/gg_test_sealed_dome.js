// priority: -7011
// Gregtech Grindless - smoke test of the Sealed Dome and the wither rows (package B8, EV). TEST-ONLY overlay: copied over the
// instance on the test PC, never shipped.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_sealed_dome;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|sealed_dome\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|<scope>|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|sealed_dome|DONE. Scopes: sealed_dome,
// sealed_dome@moon, hv_greenhouse@moon.
//   static (no world)
//     registry    the machine (recipe type gtceu:greenhouse), its structure description and the ids published by the scripts
//     recipes     every plant of the family has its two sealed recipes: circuit 5 (Moon) or 6 (Mars), the plant not consumed, CO2 + water on the Moon and
//                 water on Mars, x3 the base outputs, 100 mB of oxygen, 8 EU/t, 200 ticks, gcyr:luna / gcyr:mars
//     lookup      GTM's recipe DB of gtceu:greenhouse finds EVERY recipe of the type from its own inputs: the sealed ones are there and
//                 none of the old ones was pushed out by the prefix rule
//     crafting    the controller's crafting recipe
//     creatures   the wither skeleton (HV) and the wither (EV) rows of mobs.json: the table check, the models and their tag, the
//                 prints and simulation recipes (amounts, EU/t, time) and their lookup
//   in the world: on the Moon (gcyr:luna), band X 8960..9023, Z 0..15, Y 198..214
//     sealed_dome@moon     DESCRIPTION, PLACED, FORMED, PATTERN, PREVIEW, then
//                            PROCESS_sealed    circuit 5 + carrot + CO2 + water: 64 runs at once, x3 carrots and 100 mB of oxygen each
//                            PROCESS_no_co2    circuit 6 + carrot + water only: nothing runs (the Mars recipe does not run on the Moon,
//                                              and the circuit keeps the plain carrot recipe out)
//                            PROCESS_family    no circuit, carrot only: the steam recipe runs (the dome is the family's step)
//     hv_greenhouse@moon   the HV greenhouse beside it: PROCESS_sealed_refused (circuit 5 + carrot + CO2 + water: nothing), then
//                          PROCESS_control (no circuit: the steam recipe runs, so the refusal comes from the veto, not a dead machine)
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'sealed_dome'
  var STEP = 10
  var FORM_TIMEOUT = 300
  var TEST_TIMEOUT = 4000
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestSealedDomeRequest'

  var LUNA = 'gcyr:luna'
  var MARS = 'gcyr:mars'
  var BAND = { x0: 8960, x1: 9023, z0: 0, z1: 15, y0: 198, y1: 214 }

  var DOME = 'gtceu:sealed_dome'
  var HVG = 'gtceu:hv_greenhouse'
  var TYPE = 'gtceu:greenhouse'
  var CARROT = 'minecraft:carrot'
  var CO2 = 'gtceu:carbon_dioxide'
  var WATER = 'minecraft:water'
  var O2 = 'gtceu:oxygen'
  var DOOR = 'minecraft:iron_door'
  var MOON_CIRCUIT = 5
  var MARS_CIRCUIT = 6
  var STEAM_CARROT = 'grindless:greenhouse/carrot'
  var SEALED_CARROT_MOON = 'grindless:greenhouse/ev/carrot_sealed_moon'

  var EV_PARTS = { energy_input: 'gtceu:ev_energy_input_hatch', input_bus: 'gtceu:ev_input_bus', output_bus: 'gtceu:ev_output_bus',
    input_hatch: 'gtceu:ev_input_hatch', output_hatch: 'gtceu:ev_output_hatch' }
  var HV_PARTS = { energy_input: 'gtceu:hv_energy_input_hatch', input_bus: 'gtceu:hv_input_bus', output_bus: 'gtceu:hv_output_bus',
    input_hatch: 'gtceu:hv_input_hatch', output_hatch: 'gtceu:hv_output_hatch' }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var S = null
  var J = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(scope, name, status, detail) {
    var line = TAG + scope + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(scope, name, ok, detail) {
    emit(scope, name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(scope, name, detail) {
    emit(scope, name, 'NOTE', detail)
  }

  function guarded(name, fn) {
    try {
      fn()
    } catch (e) {
      check(SCOPE, name, false, 'exception: ' + e)
    }
  }

  // ---------------------------------------------------------------- Java

  function lazy() {
    if (J !== null) return J
    J = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      HashMap: Java.loadClass('java.util.HashMap'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      GTRecipe: Java.loadClass('com.gregtechceu.gtceu.api.recipe.GTRecipe'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
      FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour')
    }
    return J
  }

  function asArray(coll) {
    if (coll === null || coll === undefined) return []
    var list = new (lazy().ArrayList)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new (lazy().RL)(id)
  }

  function bp(x, y, z) {
    return new (lazy().BlockPos)(x, y, z)
  }

  function cmd(dim, text) {
    return S.server.runCommandSilent('execute in ' + dim + ' run ' + text)
  }

  function blockIdAt(level, x, y, z) {
    return String(level.getBlock(x, y, z).getId())
  }

  function machineAt(level, p) {
    return lazy().MetaMachine.getMachine(level, bp(p.x, p.y, p.z))
  }

  function itemIdOf(stack) {
    return String(lazy().BI.ITEM.getKey(stack.getItem()))
  }

  function fluidIdOf(stack) {
    return String(lazy().BI.FLUID.getKey(stack.getFluid()))
  }

  function itemSummary(counts) {
    var keys = Object.keys(counts)
    if (keys.length === 0) return 'none'
    return keys.map(function (k) { return k.replace(/^[a-z_]+:/, '') + 'x' + counts[k] }).join(' ')
  }

  // ---------------------------------------------------------------- recipes

  function byId(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  function isGT(r) {
    return r instanceof lazy().GTRecipe
  }

  // GT recipe content -> JSON text through GTM's own serializer (scripts cannot see the overrides of SizedIngredient)
  function contentJson(cap, content) {
    return String(cap.serializer.toJson(cap.of(content)))
  }

  function conditionsText(r) {
    var out = []
    asArray(r.conditions).forEach(function (c) {
      try {
        out.push(String(c.serialize()))
      } catch (e) {
        var t = String(c.getClass().getSimpleName())
        try {
          t += ':"' + c.getDimension().location() + '"'
        } catch (e2) { /* not a dimension condition */ }
        out.push(t)
      }
    })
    return out.join(',')
  }

  function eutOf(r) {
    var eu = lazy().RecipeHelper.getRealEUt(r)
    try {
      return Number(eu.getTotalEU())
    } catch (e) {
      return Number(eu.voltage()) * Number(eu.amperage())
    }
  }

  function recipesOfType(typeId) {
    var type = lazy().GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? asArray(S.server.getRecipeManager().getAllRecipesFor(type)) : []
  }

  // "id x count" of the item contents of a recipe side, chance in 1/10000 when it is not 100 %: ['minecraft:carrot x18', ...]
  function itemContents(r, output) {
    var L = lazy()
    var list = output ? asArray(r.getOutputContents(L.ItemCap)) : asArray(r.getInputContents(L.ItemCap))
    return list.map(function (c) {
      var j = JSON.parse(contentJson(L.ItemCap, c.content))
      var inner = j.ingredient || j
      var text
      if (j.type === 'gtceu:circuit' || inner.type === 'gtceu:circuit') {
        text = 'circuit ' + (j.configuration !== undefined ? j.configuration : inner.configuration)
      } else {
        text = (inner.item || ('#' + inner.tag)) + ' x' + (j.count || 1)
      }
      var chance = Number(c.chance)
      if (chance === 0) text += ' (not consumed)'
      else if (chance < 10000) text += ' @' + chance
      return text
    }).sort()
  }

  function fluidStacks(list) {
    return asArray(list).map(function (st) { return fluidIdOf(st) + ' ' + Number(st.getAmount()) }).sort()
  }

  // finds a recipe in GTM's lookup DB of its type from its own inputs (the circuit included): proves it survived the prefix rule
  function lookupFinds(typeId, r) {
    var L = lazy()
    var type = L.GTRegistries.RECIPE_TYPES.get(rl(typeId))
    var map = new L.HashMap()
    var items = new L.ArrayList()
    asArray(L.RecipeHelper.getInputItems(r)).forEach(function (st) { items.add(st) })
    var fluids = new L.ArrayList()
    asArray(L.RecipeHelper.getInputFluids(r)).forEach(function (st) { fluids.add(st) })
    if (items.size() > 0) map.put(L.ItemCap, items)
    if (fluids.size() > 0) map.put(L.FluidCap, fluids)
    var want = String(r.id)
    var found = type.db()['find(java.util.Map,java.util.function.Predicate)'](map, function (x) { return String(x.id) === want })
    return found !== null && found !== undefined
  }

  // ---------------------------------------------------------------- static checks

  function dome() {
    return global.grindless.sealedDome || {}
  }

  function plants() {
    var G = global.grindless
    return G.greenhouse.entries.concat(G.lv.greenhouseExtras)
  }

  function checkRegistry() {
    var L = lazy()
    var problems = []
    var def = L.GTRegistries.MACHINES.get(rl(DOME))
    var types = []
    if (!def) {
      problems.push('machine ' + DOME + ' is not registered')
    } else {
      try {
        var arr = def.getRecipeTypes()
        for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
      } catch (e) {
        problems.push('recipe types unreadable: ' + e)
      }
      if (types.indexOf(TYPE) < 0) problems.push('recipe types ' + types.join(',') + ' do not include ' + TYPE)
    }
    var desc = global.grindless.patterns.describe(DOME)
    if (!desc) problems.push('no structure description')
    var SD = dome()
    var circuits = SD.circuits || {}
    if (SD.machine !== DOME || circuits.moon !== MOON_CIRCUIT || circuits.mars !== MARS_CIRCUIT || SD.cap !== 64) problems.push('global.grindless.sealedDome: machine=' + SD.machine +
      ' circuits=' + circuits.moon + '/' + circuits.mars + ' cap=' + SD.cap)
    if (typeof SD.recipeId !== 'function') problems.push('global.grindless.sealedDome.recipeId is missing (server script not loaded?)')
    check(SCOPE, 'registry', problems.length === 0, problems.length > 0 ? problems.join('; ') :
      DOME + ' runs ' + types.join(',') + ', structure ' + desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length +
      ', circuits ' + circuits.moon + '/' + circuits.mars + ', cap ' + SD.cap)
  }

  function checkRecipes() {
    var SD = dome()
    var bad = []
    var ok = 0
    var sample = ''
    plants().forEach(function (entry) {
      SD.sites.forEach(function (site) {
        var id = SD.recipeId(entry.id, site.name)
        var r = byId(id)
        if (r === null || !isGT(r)) {
          bad.push('missing ' + id)
          return
        }
        var problems = []
        var conds = conditionsText(r)
        if (conds.indexOf('"' + site.dimension + '"') < 0) problems.push('no ' + site.dimension + ' condition (' + conds + ')')
        if (/"reverse":true/.test(conds)) problems.push('a reversed condition: ' + conds)
        var ins = itemContents(r, false)
        var wantIns = ['circuit ' + site.circuit + ' (not consumed)', entry.catalyst + ' x1 (not consumed)'].sort()
        if (site.circuit !== (site.name === 'moon' ? MOON_CIRCUIT : MARS_CIRCUIT)) problems.push('site circuit ' + site.circuit)
        if (ins.join(' | ') !== wantIns.join(' | ')) problems.push('items in [' + ins.join(', ') + '] want [' + wantIns.join(', ') + ']')
        var fins = fluidStacks(lazy().RecipeHelper.getInputFluids(r))
        var wantFins = (site.co2 ? [CO2 + ' 200', WATER + ' 100'] : [WATER + ' 100']).sort()
        if (fins.join(' | ') !== wantFins.join(' | ')) problems.push('fluids in [' + fins.join(', ') + '] want [' + wantFins.join(', ') + ']')
        var outs = itemContents(r, true)
        var wantOuts = entry.outputs.map(function (o) {
          var t = o.item + ' x' + (o.n * 3)
          if (o.chance !== undefined) t += ' @' + Math.max(1, Math.min(9999, Math.round(o.chance * 10000)))
          return t
        }).sort()
        if (outs.join(' | ') !== wantOuts.join(' | ')) problems.push('items out [' + outs.join(', ') + '] want [' + wantOuts.join(', ') + ']')
        var fouts = fluidStacks(lazy().RecipeHelper.getOutputFluids(r))
        if (fouts.join(' | ') !== O2 + ' 100') problems.push('fluids out [' + fouts.join(', ') + ']')
        var eut = eutOf(r)
        if (eut !== 8 || Number(r.duration) !== 200) problems.push(eut + ' EU/t ' + r.duration + ' ticks')
        if (problems.length > 0) {
          bad.push(id + ': ' + problems.join('; '))
        } else {
          ok++
          if (id === SEALED_CARROT_MOON) sample = id + ' in [' + ins.join(', ') + ' + ' + fins.join(' + ') + '] out [' + outs.join(', ') + ' + ' +
            fouts.join(' + ') + '] ' + eut + ' EU/t ' + r.duration + ' t ' + conds
        }
      })
    })
    var want = plants().length * 2
    var published = SD.recipes ? SD.recipes.moon + '+' + SD.recipes.mars : 'none'
    check(SCOPE, 'recipes', bad.length === 0 && ok === want, ok + '/' + want + ' sealed recipes right (published ' + published + '); ' + sample +
      (bad.length > 0 ? ' | problems (' + bad.length + '): ' + bad.slice(0, 6).join(' ; ') : ''))
  }

  function checkLookup() {
    var all = recipesOfType(TYPE)
    var missing = []
    var sealed = 0
    all.forEach(function (r) {
      var id = String(r.id)
      if (/\/ev\/.+_sealed_(moon|mars)$/.test(id)) sealed++
      try {
        if (!lookupFinds(TYPE, r)) missing.push(id)
      } catch (e) {
        missing.push(id + ' (' + e + ')')
      }
    })
    check(SCOPE, 'lookup', all.length > 0 && missing.length === 0 && sealed === plants().length * 2,
      'GTM lookup finds ' + (all.length - missing.length) + '/' + all.length + ' recipes of ' + TYPE + ' from their own inputs (' + sealed +
      ' sealed)' + (missing.length > 0 ? ' | not found: ' + missing.slice(0, 10).join(', ') : ''))
  }

  function checkCrafting() {
    // The controller's recipe may move between recipe types and ids as the quality reviews rework it: find it by what it makes
    // (any type, GT or vanilla) and check that it exists and needs nothing from after the EV era of the dome. Its published id
    // is only the first guess.
    var guess = dome().craftingId
    var found = []
    asArray(S.server.getRecipeManager().getRecipes()).forEach(function (r) {
      try {
        var out
        if (isGT(r)) out = itemContents(r, true).map(function (t) { return t.replace(/ x\d+.*$/, '') })
        else out = [itemIdOf(r.getResultItem(S.server.registryAccess()))]
        if (out.indexOf(DOME) >= 0) found.push(r)
      } catch (e) { /* not an item recipe */ }
    })
    var r = found.length > 0 ? found[0] : null
    var id = r === null ? String(guess) : String(r.getId())
    var inputs = []
    if (r !== null) {
      if (isGT(r)) {
        inputs = itemContents(r, false).map(function (t) { return t.replace(/ x\d+.*$/, '') })
      } else {
        asArray(r.getIngredients()).forEach(function (ing) {
          try {
            var ids = asArray(ing.getItemIds()).map(String)
            if (ids.length > 0) inputs.push(ids[0])
          } catch (e) { /* tool or empty slot */ }
        })
      }
    }
    var later = /(^|[:_/])(iv|luv|zpm|uv|uhv|uev|uiv|uxv|opv|max)(_|$)/
    var tooLate = inputs.filter(function (n) { return later.test(n.replace(/^#/, '')) })
    check(SCOPE, 'crafting', r !== null && inputs.length > 0 && tooLate.length === 0, id + (r === null ? ' missing: no recipe makes ' + DOME : ' -> ' + DOME +
      ' (' + found.length + ' recipe(s)) from [' + inputs.join(', ') + ']' + (tooLate.length > 0 ? ' needs later-era input ' + tooLate.join(',') : '')))
  }

  function checkCreatures() {
    var G = global.grindless
    var problems = G.checkCreatureTable()
    var table = G.creatureTable()
    var byMob = {}
    table.mobs.forEach(function (m) { byMob[m.id] = m })
    var bad = []
    var details = []
    var ws = byMob.wither_skeleton
    var w = byMob.wither
    if (!ws || ws.tier !== 3) bad.push('wither_skeleton row missing or not tier 3')
    if (!w || w.tier !== 4 || w.eut !== 1920 || w.duration !== 600 || w.biomassMb !== 400) bad.push('wither row missing or not tier 4 / 1920 EU/t / 600 t / 400 mB')
    var tagged = asArray(Ingredient.of('#grindless:creature_models').getItemIds()).map(String)
    ;[ws, w].forEach(function (mob) {
      if (!mob) return
      if (!Item.exists(mob.model)) bad.push(mob.model + ' not registered')
      if (tagged.indexOf(mob.model) < 0) bad.push(mob.model + ' not in #grindless:creature_models')
      var printId = G.creaturePrintId(mob)
      var p = byId(printId)
      if (p === null) {
        bad.push('missing ' + printId)
      } else {
        var pin = itemContents(p, false)
        details.push(printId + ' [' + pin.join(', ') + ']')
        if (!lookupFinds('gtceu:assembler', p)) bad.push(printId + ' not found by the assembler lookup')
      }
      mob.rolls.forEach(function (roll) {
        var sid = G.creatureRecipeId(mob, roll)
        var s = byId(sid)
        if (s === null) {
          bad.push('missing ' + sid)
          return
        }
        var fins = fluidStacks(lazy().RecipeHelper.getInputFluids(s))
        var outs = itemContents(s, true)
        var eut = eutOf(s)
        details.push(sid + ' ' + eut + ' EU/t ' + s.duration + ' t in [' + itemContents(s, false).join(', ') + ' + ' + fins.join(' + ') +
          '] out [' + outs.join(', ') + ']')
        if (eut !== mob.eut || Number(s.duration) !== mob.duration) bad.push(sid + ': ' + eut + ' EU/t ' + s.duration + ' t')
        if (fins.join('') !== 'gtceu:biomass ' + mob.biomassMb) bad.push(sid + ': biomass ' + fins.join(','))
        if (!lookupFinds('gtceu:creature_simulation', s)) bad.push(sid + ' not found by the creature_simulation lookup')
      })
    })
    if (w) {
      var star = byId(G.creatureRecipeId(w, w.rolls[0]))
      if (star !== null && itemContents(star, true).join('') !== 'minecraft:nether_star x1') bad.push('the wither does not give exactly 1 Nether Star')
    }
    check(SCOPE, 'creatures', problems.length === 0 && bad.length === 0, table.mobs.length + ' creatures; ' + details.join(' ; ') +
      (problems.length > 0 ? ' | table problems: ' + problems.join('; ') : '') + (bad.length > 0 ? ' | problems: ' + bad.join('; ') : ''))
  }

  function staticChecks() {
    guarded('registry', checkRegistry)
    guarded('recipes', checkRecipes)
    guarded('lookup', checkLookup)
    guarded('crafting', checkCrafting)
    guarded('creatures', checkCreatures)
  }

  // ---------------------------------------------------------------- structures (same technique as gg_test_moon.js)

  function simpleBlock(sym, m) {
    switch (sym.kind) {
      case 'blocks':
        return { id: sym.blocks[0] }
      case 'frames':
        return { id: 'gtceu:' + sym.materials[0] + '_frame' }
      case 'part':
        if (!m.partBlocks[sym.ability]) throw new Error('the test does not know the part ability ' + sym.ability)
        return { id: m.partBlocks[sym.ability], ability: sym.ability }
      case 'controller':
        return { id: m.id, controller: true }
      case 'air':
      case 'any':
        return null
      default:
        throw new Error('unsupported symbol kind ' + sym.kind)
    }
  }

  function assignOneOf(sym, list, m, counts) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var need = lim.exact != null ? lim.exact : (lim.min != null ? lim.min : 0)
        if (counts && counts[o.ability] != null) need = counts[o.ability]
        for (var k = 0; k < need; k++) parts.push(simpleBlock(o, m))
      } else if (filler === null) {
        filler = simpleBlock(o, m)
      }
    })
    if (filler === null) throw new Error('a oneOf symbol has no plain block option')
    if (parts.length > list.length) throw new Error('more required parts (' + parts.length + ') than cells (' + list.length + ')')
    list.forEach(function (c) { c.block = filler })
    parts.forEach(function (p, i) {
      list[Math.floor((i + 0.5) * list.length / parts.length)].block = p
    })
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(m, cx, cy, cz, counts) {
    var desc = global.grindless.patterns.describe(m.id)
    if (!desc) throw new Error('no structure description recorded for ' + m.id)
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
        assignOneOf(sym, list, m, counts)
      } else {
        var b = simpleBlock(sym, m)
        list.forEach(function (c) { c.block = b })
      }
    })
    var occupied = {}
    cells.forEach(function (c) {
      if (c.block) occupied[c.x + ',' + c.y + ',' + c.z] = c
    })
    cells.forEach(function (c) {
      if (!c.block) return
      if (c.block.controller) {
        c.props = '[facing=north]'
      } else if (c.block.id === DOOR) {
        // the airlock: the lower half is placed first (rows go bottom -> top), then the upper half on it
        var below = occupied[c.x + ',' + (c.y - 1) + ',' + c.z]
        var upper = below && below.block && below.block.id === DOOR
        c.props = '[facing=north,half=' + (upper ? 'upper' : 'lower') + ',hinge=left,open=false]'
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
    return {
      cells: placed,
      desc: desc,
      size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)',
      blocks: placed.length
    }
  }

  function place(m) {
    var plan = m.plan
    var failed = []
    var ctrlCell = null
    function put(c) {
      return cmd(LUNA, 'setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
    }
    plan.cells.forEach(function (c) {
      if (c.block.controller) {
        ctrlCell = c
        return
      }
      if (put(c) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.block.id + c.props)
    })
    if (put(ctrlCell) < 1) failed.push('controller ' + ctrlCell.block.id)
    plan.ctrl = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(S.moon, c.x, c.y, c.z)
      if (got !== c.block.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.block.id + ' got ' + got)
    })
    var parts = plan.cells.filter(function (c) { return c.block.ability }).map(function (c) {
      return c.block.ability + '@' + c.x + ',' + c.y + ',' + c.z + c.props
    })
    check(m.scope, 'PLACED', failed.length === 0 && wrong.length === 0,
      'in ' + LUNA + ' blocks=' + plan.blocks + ' size=' + plan.size + ' controller=' + plan.ctrl.x + ',' + plan.ctrl.y + ',' + plan.ctrl.z +
      ' parts=[' + parts.join(' ') + ']' + (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function describeError(ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = 'pattern error ' + String(err)
      try {
        var p = err.getPos()
        text += ' at ' + p.getX() + ',' + p.getY() + ',' + p.getZ() + ' found ' + blockIdAt(S.moon, p.getX(), p.getY(), p.getZ())
      } catch (e1) { /* no position */ }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  function partIds(ctrl) {
    return asArray(ctrl.getParts()).map(function (p) { return String(p.getDefinition().getId()).replace('gtceu:', '') })
  }

  // GTM's multiblock preview (recipe viewer) of the dome: one shape with the brick, glass, LED panels, soil and the airlock
  function previewCheck(m) {
    var shapes = asArray(m.def.getMatchingShapes())
    var blocks = shapes[0].getBlocks()
    var counts = {}
    var total = 0
    for (var x = 0; x < blocks.length; x++) {
      for (var y = 0; y < blocks[x].length; y++) {
        for (var z = 0; z < blocks[x][y].length; z++) {
          var info = blocks[x][y][z]
          if (info === null || info === undefined) continue
          var bid = String(Block.getId(info.getBlockState().getBlock()))
          if (bid === 'minecraft:air') continue
          counts[bid] = (counts[bid] || 0) + 1
          total++
        }
      }
    }
    var want = ['grindless:sintered_regolith', 'gtceu:tempered_glass', 'gtceu:white_lamp', 'minecraft:dirt', DOOR, DOME]
    var missing = want.filter(function (id) { return !counts[id] })
    check(m.scope, 'PREVIEW', shapes.length >= 1 && missing.length === 0, 'shapes=' + shapes.length + ' blocks=' + total +
      ' (placed: ' + m.plan.blocks + ')' + (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
  }

  // ---------------------------------------------------------------- machines: inputs, outputs, scenarios

  function readBus(bus) {
    var inv = bus.getInventory()
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemIdOf(st)
      counts[id] = (counts[id] || 0) + st.getCount()
    }
    return counts
  }

  function clearInventory(inv) {
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
  }

  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    if (st.isEmpty()) return { id: 'none', amount: 0 }
    return { id: fluidIdOf(st), amount: Number(st.getAmount()) }
  }

  function findParts(m, ctrl) {
    var P = { energy: [], inBus: null, outBuses: [], inHatches: [], outHatch: null }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === m.partBlocks.energy_input) P.energy.push(p)
      else if (pid === m.partBlocks.input_bus) P.inBus = p
      else if (pid === m.partBlocks.output_bus) P.outBuses.push(p)
      else if (pid === m.partBlocks.input_hatch) P.inHatches.push(p)
      else if (pid === m.partBlocks.output_hatch) P.outHatch = p
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

  function resetMachine(m, ctrl) {
    var P = m.parts
    clearInventory(P.inBus.getInventory())
    clearInventory(P.inBus.getCircuitInventory())
    P.outBuses.forEach(function (b) { clearInventory(b.getInventory()) })
    P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    if (P.outHatch !== null) P.outHatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  function fillScenario(m, ctrl, sc) {
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
    if (sc.fluids.length > P.inHatches.length) throw new Error('the scenario needs ' + sc.fluids.length + ' input hatches')
    sc.fluids.forEach(function (f, i) {
      P.inHatches[i].tank.setFluidInTank(0, Fluid.of(f.id, f.mb).getFluidStack())
    })
    // a formed multiblock that sat idle stops ticking: wake it up
    try {
      ctrl.getRecipeLogic().updateTickSubscription()
    } catch (e) { /* older GTM: it ticks anyway */ }
    note(m.scope, 'INPUT_' + sc.name, 'bus=[' + itemSummary(readBus(P.inBus)) + '] circuit=' + (sc.circuit ? sc.circuit : 'none') +
      ' fluids=' + (sc.fluids.length === 0 ? 'none' : sc.fluids.map(function (f) { return f.id + ' ' + f.mb + ' mB' }).join(' + ')) +
      ' energy hatches=' + P.energy.length + ' output buses=' + P.outBuses.length + ' input hatches=' + P.inHatches.length)
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

  // what GTM's own lookup and matching say (used when a machine stays idle)
  function diagnose(ctrl) {
    var out = []
    try {
      var match = ctrl.getRecipeType().db().find(ctrl)
      if (!match) {
        out.push('lookup=none')
      } else {
        out.push('lookup=' + match.id)
        try { out.push('matchRecipe=' + lazy().RecipeHelper.matchRecipe(ctrl, match).isSuccess()) } catch (e1) { out.push('matchRecipe threw ' + e1) }
      }
      var fails = asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
      if (fails.length > 0) out.push('failureReasons=[' + fails.join(' ; ') + ']')
    } catch (e) {
      out.push('diagnose threw ' + e)
    }
    return out.join(' ')
  }

  function collect(m) {
    var P = m.parts
    var counts = {}
    P.outBuses.forEach(function (b) {
      var c = readBus(b)
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    var fluidsIn = {}
    P.inHatches.forEach(function (h) {
      var t = tankInfo(h)
      if (t.id !== 'none') fluidsIn[t.id] = (fluidsIn[t.id] || 0) + t.amount
    })
    return { items: counts, fluidOut: P.outHatch !== null ? tankInfo(P.outHatch) : { id: 'none', amount: 0 }, fluidsIn: fluidsIn,
      seen: m.seen, maxPar: m.maxPar }
  }

  function seenText(r) {
    var keys = Object.keys(r.seen)
    return keys.length > 0 ? keys.join(',') : 'none'
  }

  function sealedVerify(r) {
    var runs = r.maxPar
    var carrots = r.items[CARROT] || 0
    var others = Object.keys(r.items).filter(function (id) { return id !== CARROT })
    var o2 = r.fluidOut.id === O2 ? r.fluidOut.amount : 0
    var ok = runs === 64 && r.seen[SEALED_CARROT_MOON] === true && Object.keys(r.seen).length === 1 && carrots === 18 * runs &&
      o2 === 100 * runs && others.length === 0 && !r.fluidsIn[CO2] && !r.fluidsIn[WATER]
    return { ok: ok, detail: 'runs at once=' + runs + '/64 carrots=' + carrots + ' (18 per run) oxygen=' + o2 + ' mB (100 per run) left in hatches=' +
      JSON.stringify(r.fluidsIn) + ' recipes seen=[' + seenText(r) + ']' + (others.length > 0 ? ' unexpected=' + others.join(',') : '') }
  }

  function nothingVerify(fluidsLeft) {
    return function (r) {
      var n = Object.keys(r.items).length
      var leftOk = Object.keys(fluidsLeft).every(function (id) { return (r.fluidsIn[id] || 0) === fluidsLeft[id] })
      return { ok: n === 0 && r.fluidOut.amount === 0 && Object.keys(r.seen).length === 0 && leftOk,
        detail: 'nothing expected: items=[' + itemSummary(r.items) + '] fluid out=' + r.fluidOut.id + ' ' + r.fluidOut.amount + ' mB left in hatches=' +
          JSON.stringify(r.fluidsIn) + ' recipes seen=[' + seenText(r) + ']' }
    }
  }

  function familyVerify(runsWanted) {
    return function (r) {
      var carrots = r.items[CARROT] || 0
      var per = 6 * r.maxPar
      var ok = r.seen[STEAM_CARROT] === true && Object.keys(r.seen).length === 1 && r.maxPar === runsWanted && carrots >= per && per > 0 &&
        carrots % per === 0
      return { ok: ok, detail: 'steam recipe: runs at once=' + r.maxPar + '/' + runsWanted + ' carrots=' + carrots + ' (6 per run) recipes seen=[' +
        seenText(r) + ']' }
    }
  }

  var CO2_64 = 64 * 200
  var WATER_64 = 64 * 100

  function domeScenarios() {
    return [
      { name: 'sealed', ticks: 240, items: [{ id: CARROT, n: 1 }], circuit: MOON_CIRCUIT,
        fluids: [{ id: CO2, mb: CO2_64 }, { id: WATER, mb: WATER_64 }], verify: sealedVerify },
      { name: 'no_co2', ticks: 120, items: [{ id: CARROT, n: 1 }], circuit: MARS_CIRCUIT,
        fluids: [{ id: WATER, mb: WATER_64 }], verify: nothingVerify({ 'minecraft:water': WATER_64 }) },
      { name: 'family', ticks: 260, items: [{ id: CARROT, n: 1 }], circuit: 0, fluids: [], verify: familyVerify(64) }
    ]
  }

  function hvScenarios() {
    return [
      { name: 'sealed_refused', ticks: 120, items: [{ id: CARROT, n: 1 }], circuit: MOON_CIRCUIT,
        fluids: [{ id: CO2, mb: 32 * 200 }, { id: WATER, mb: 32 * 100 }],
        verify: nothingVerify({ 'gtceu:carbon_dioxide': 32 * 200, 'minecraft:water': 32 * 100 }) },
      { name: 'control', ticks: 260, items: [{ id: CARROT, n: 1 }], circuit: 0, fluids: [], verify: familyVerify(32) }
    ]
  }

  // ---------------------------------------------------------------- machines: state machine

  var MACHINES = [
    { key: 'dome', id: DOME, scope: 'sealed_dome@moon', x: 8966, y: 200, z: 2, partBlocks: EV_PARTS, preview: true, scenarios: domeScenarios,
      counts: { energy_input: 1, input_bus: 1, output_bus: 2, input_hatch: 2, output_hatch: 1 } },
    { key: 'hv', id: HVG, scope: 'hv_greenhouse@moon', x: 8990, y: 200, z: 2, partBlocks: HV_PARTS, preview: false, scenarios: hvScenarios,
      counts: { energy_input: 1, input_bus: 1, output_bus: 1, input_hatch: 2, output_hatch: 1 } }
  ]

  function startMachine(spec) {
    var m = { key: spec.key, id: spec.id, scope: spec.scope, spec: spec, partBlocks: spec.partBlocks, phase: 'forming', t0: S.t, plan: null,
      ctrl: null, forced: false, parts: null, scenarios: null, sc: -1, scStart: 0, seen: {}, maxPar: 0, stateNoted: false }
    S.machines.push(m)
    try {
      m.def = lazy().GTRegistries.MACHINES.get(rl(spec.id))
      if (m.def === null || m.def === undefined) {
        check(m.scope, 'PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return m
      }
      m.plan = planOf(m, spec.x, spec.y, spec.z, spec.counts)
      check(m.scope, 'DESCRIPTION', true, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size)
      if (!place(m)) {
        m.phase = 'done'
        return m
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check(m.scope, 'DESCRIPTION', false, 'exception while describing/placing: ' + e)
      m.phase = 'done'
    }
    return m
  }

  function observe(m, ctrl) {
    try {
      var last = ctrl.getRecipeLogic().getLastRecipe()
      if (last) {
        m.seen[String(last.id)] = true
        var par = Number(last.parallels)
        if (par > m.maxPar) m.maxPar = par
      }
    } catch (e) { /* optional */ }
  }

  function beginScenario(m, ctrl, sc) {
    resetMachine(m, ctrl)
    m.seen = {}
    m.maxPar = 0
    m.stateNoted = false
    fillScenario(m, ctrl, sc)
    m.scStart = S.t
    m.phase = 'running'
  }

  function nextScenario(m, ctrl) {
    m.sc++
    if (m.sc >= m.scenarios.length) {
      resetMachine(m, ctrl)
      m.phase = 'done'
      return
    }
    beginScenario(m, ctrl, m.scenarios[m.sc])
  }

  function advance(m) {
    var ctrl = machineAt(S.moon, m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(m.scope, 'FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }

    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check(m.scope, 'FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') + 'in ' + LUNA +
          ' parts=[' + partIds(ctrl).join(' ') + ']')
        check(m.scope, 'PATTERN', global.grindless.patterns.describe(m.id).built, 'built by GTM on the first structure check')
        if (m.spec.preview) {
          try {
            previewCheck(m)
          } catch (e3) {
            check(m.scope, 'PREVIEW', false, 'exception: ' + e3)
          }
        }
        m.parts = findParts(m, ctrl)
        if (m.parts.inBus === null || m.parts.outBuses.length === 0 || m.parts.energy.length === 0 || m.parts.inHatches.length < 2 ||
          m.parts.outHatch === null) {
          check(m.scope, 'PARTS', false, 'missing parts: input bus=' + (m.parts.inBus !== null) + ' output buses=' + m.parts.outBuses.length +
            ' energy hatches=' + m.parts.energy.length + ' input hatches=' + m.parts.inHatches.length + ' output hatch=' + (m.parts.outHatch !== null))
          m.phase = 'done'
          return
        }
        m.scenarios = m.spec.scenarios()
        m.sc = -1
        topUpEnergy(m)
        nextScenario(m, ctrl)
        return
      }
      if (waited >= FORM_TIMEOUT) {
        var syncOk = false
        try {
          syncOk = ctrl.checkPatternWithLock()
        } catch (e) { /* reported below */ }
        if (!syncOk) {
          check(m.scope, 'FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
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
          verdict = sc.verify(collect(m))
        } catch (e) {
          verdict = { ok: false, detail: 'exception while checking: ' + e }
        }
        check(m.scope, 'PROCESS_' + sc.name, verdict.ok, verdict.detail + ' | ' + recipeState(ctrl))
        nextScenario(m, ctrl)
      }
    }
  }

  // ---------------------------------------------------------------- the world

  function prepareWorld() {
    for (var cx = Math.floor(BAND.x0 / 16); cx <= Math.floor(BAND.x1 / 16); cx++) S.moon.getChunk(cx, 0)
    cmd(LUNA, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = cmd(LUNA, 'fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    note(SCOPE, 'AREA', 'chunks ' + Math.floor(BAND.x0 / 16) + '..' + Math.floor(BAND.x1 / 16) + ',0 of ' + LUNA +
      ' generated and force-loaded; cleared ' + cleared + ' blocks (X ' + BAND.x0 + '..' + BAND.x1 + ', Y ' + BAND.y0 + '..' + BAND.y1 + ', Z ' +
      BAND.z0 + '..' + BAND.z1 + ')')
  }

  // ---------------------------------------------------------------- driver

  function allDone() {
    for (var i = 0; i < S.machines.length; i++) {
      if (S.machines[i].phase !== 'done') return false
    }
    return true
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      cmd(LUNA, 'fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
      cmd(LUNA, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    } catch (e) { /* best effort */ }
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
      if (S.t > TEST_TIMEOUT) {
        check(SCOPE, 'timeout', false, 'still running after ' + S.t + ' ticks: ' +
          S.machines.map(function (m) { return m.key + ':' + m.phase }).join(','))
        finish()
        return
      }
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
        try {
          topUpEnergy(m)
        } catch (e) { /* the next step reports problems */ }
      }
    })
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    step(now - S.tick0)
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, moon: null, t: 0, tick0: now, nextAt: now + STEP, machines: [], finished: false }
    staticChecks()
    S.moon = server.getLevel(LUNA)
    if (S.moon === null || S.moon === undefined) {
      check(SCOPE, 'moon_level', false, LUNA + ' is not loaded')
      finish()
      return
    }
    guarded('AREA', prepareWorld)
    MACHINES.forEach(startMachine)
    if (allDone()) finish()
  }

  // The pack's Additional Placements mod reloads the datapacks (and these scripts) a couple of seconds after the server is up: the
  // command only leaves a request in `global` and the tick handler starts the test once these scripts have been loaded for QUIET_MS.
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

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_sealed_dome', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_sealed_dome run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
