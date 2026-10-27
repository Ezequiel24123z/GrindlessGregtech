// priority: -6224
// Gregtech Grindless - smoke test of the observatory family, Steam to MV. TEST-ONLY overlay: copied over the instance on the test PC,
// never shipped.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_observatory' -WaitForLog 'GGTEST\|observatory\|DONE@@900'
//
// Markers: GGTEST|<scope>|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|observatory|DONE. Scopes: observatory and one per
// machine (steam_observatory@high, steam_observatory@low, optical_observatory, radio_telescope).
//
// It sets the time of day and the weather of the Overworld (doWeatherCycle off while it runs, restored at the end): run it in a server
// of its own, not together with tests that need daylight (gg_test_moon's regolith scenario).
//
//   static (no world)
//     registry       5 items (4 in #grindless:lunar_charts), 3 machines, 3 recipe types, the structure descriptions
//     recipes        the three observations: inputs, outputs, the non-consumed charts, EU/t, duration and the sky conditions
//                    (night = daytime reversed, rain / thunder reversed under 0.2, pos_y 100..319 on the Clockwork Observatory only)
//     single_source  no loaded recipe makes a chart but its observatory and its own copy recipe (which takes the chart)
//     crafting       photographic plate (LV assembler), 4 copies, 3 controllers; the Steam controller only takes Steam-era items
//     sky_info       each type has its EMI sky line and it reads the recipe's grindless_sky key
//   in the world: the Overworld band X 3584..3647, Y 98..112, Z 0..15
//     <machine> DESCRIPTION / PLACED / FORMED / PATTERN / PREVIEW for the four structures (the Clockwork Observatory twice: on high
//     ground, controller at Y 101, and low, controller at Y 98)
//     phase A clear night   high steam -> draft; low steam refused (pos_y); optical -> map + ephemeris, the draft stays; radio ->
//                           landing chart, map and ephemeris stay
//     phase B day           all refused (night), nothing consumed
//     phase C rainy night   steam and optical refused (rain); the radio telescope works in the rain
//     phase D thunderstorm  the radio telescope waits and keeps its progress (regressWhenWaiting false)
//     phase E clear night   the radio telescope finishes from where it stopped; steam and optical finish the inputs left from B
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'observatory'
  var STEP = 5
  var FORM_TIMEOUT = 300
  var TEST_TIMEOUT = 4000
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestObservatoryRequest'

  var BAND = { x0: 3584, x1: 3647, y0: 98, y1: 112, z0: 0, z1: 15 }
  var NIGHT = 18000
  var DAY = 6000
  var STEAM_MB = 64000

  var STEAM = 'gtceu:steam_observatory'
  var OPTICAL = 'gtceu:optical_observatory'
  var RADIO = 'gtceu:radio_telescope'
  var DRAFT = 'grindless:lunar_chart_draft'
  var PLATE = 'grindless:photographic_plate'
  var MAP = 'grindless:lunar_map'
  var EPHEMERIS = 'grindless:lunar_ephemeris'
  var LANDING = 'grindless:lunar_landing_chart'
  var PAPER = 'minecraft:paper'
  var COAL = 'gtceu:coal_dust'
  var CHARTS = [DRAFT, MAP, EPHEMERIS, LANDING]

  var STEAM_PARTS = { steam: 'gtceu:steam_input_hatch', steam_input_bus: 'gtceu:steam_input_bus', steam_output_bus: 'gtceu:steam_output_bus' }
  var LV_PARTS = { energy_input: 'gtceu:lv_energy_input_hatch', input_bus: 'gtceu:lv_input_bus', output_bus: 'gtceu:lv_output_bus' }
  var MV_PARTS = { energy_input: 'gtceu:mv_energy_input_hatch', input_bus: 'gtceu:mv_input_bus', output_bus: 'gtceu:mv_output_bus' }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  // controllers face north, the structure lies behind them (+z)
  var MACHINES = [
    { key: 'high', id: STEAM, scope: 'steam_observatory@high', x: 3590, y: 101, z: 1, parts: STEAM_PARTS, kind: 'steam', preview: true },
    { key: 'low', id: STEAM, scope: 'steam_observatory@low', x: 3600, y: 98, z: 1, parts: STEAM_PARTS, kind: 'steam', preview: false },
    { key: 'optical', id: OPTICAL, scope: 'optical_observatory', x: 3614, y: 100, z: 1, parts: LV_PARTS, kind: 'electric', preview: true },
    { key: 'radio', id: RADIO, scope: 'radio_telescope', x: 3632, y: 100, z: 1, parts: MV_PARTS, kind: 'electric', preview: true }
  ]

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
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      GTRecipe: Java.loadClass('com.gregtechceu.gtceu.api.recipe.GTRecipe'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
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

  function cmd(text) {
    return S.server.runCommandSilent('execute in minecraft:overworld run ' + text)
  }

  function blockIdAt(x, y, z) {
    return String(S.level.getBlock(x, y, z).getId())
  }

  function machineAt(p) {
    return lazy().MetaMachine.getMachine(S.level, bp(p.x, p.y, p.z))
  }

  function itemIdOf(stack) {
    return String(lazy().BI.ITEM.getKey(stack.getItem()))
  }

  function itemSummary(counts) {
    var keys = Object.keys(counts)
    if (keys.length === 0) return 'nothing'
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

  // GT recipe content -> JSON text through GTM's own serializer
  function contentText(cap, content) {
    return String(cap.serializer.toJson(cap.of(content)))
  }

  function gtContents(r, cap, output) {
    var list = output ? asArray(r.getOutputContents(cap)) : asArray(r.getInputContents(cap))
    return list.map(function (c) { return { text: contentText(cap, c.content), chance: Number(c.chance) } })
  }

  function conditionsOf(r) {
    return asArray(r.conditions).map(function (c) {
      try {
        return JSON.parse(String(c.serialize()))
      } catch (e) {
        return { type: String(c.getClass().getSimpleName()), unreadable: true }
      }
    })
  }

  function eutOf(r) {
    var eu = r.getInputEUt()
    return Number(eu.voltage()) * Number(eu.amperage())
  }

  // ---------------------------------------------------------------- static checks

  function checkRegistry() {
    var L = lazy()
    var missing = []
    CHARTS.concat([PLATE]).forEach(function (id) {
      if (!Item.exists(id)) missing.push('item ' + id)
    })
    ;[STEAM, OPTICAL, RADIO].forEach(function (id) {
      if (!L.GTRegistries.MACHINES.get(rl(id))) missing.push('machine ' + id)
      if (!global.grindless.patterns.describe(id)) missing.push('structure description ' + id)
    })
    ;['gtceu:stargazing', 'gtceu:astrophotography', 'gtceu:radio_astronomy'].forEach(function (id) {
      if (!L.GTRegistries.RECIPE_TYPES.get(rl(id))) missing.push('recipe type ' + id)
    })
    var tagged = asArray(Ingredient.of('#grindless:lunar_charts').getItemIds()).map(String)
    CHARTS.forEach(function (id) {
      if (tagged.indexOf(id) < 0) missing.push(id + ' not in #grindless:lunar_charts')
    })
    if (tagged.indexOf(PLATE) >= 0) missing.push(PLATE + ' should not be a chart')
    var sizes = [STEAM, OPTICAL, RADIO].map(function (id) {
      var d = global.grindless.patterns.describe(id)
      return d ? id.replace('gtceu:', '') + ' ' + d.slices[0][0].length + 'x' + d.slices[0].length + 'x' + d.slices.length : id + ' ?'
    })
    check(SCOPE, 'registry', missing.length === 0, missing.length > 0 ? 'missing: ' + missing.join(', ') :
      '5 items (4 charts tagged), 3 machines, 3 recipe types; structures (w x h x d): ' + sizes.join(', '))
  }

  // what a recipe looks like: { items in [{text, chance}], items out, EU/t, duration, conditions }
  function describeRecipe(r) {
    var L = lazy()
    return {
      ins: gtContents(r, L.ItemCap, false),
      outs: gtContents(r, L.ItemCap, true),
      eut: eutOf(r),
      duration: Number(r.duration),
      conds: conditionsOf(r)
    }
  }

  function hasItem(list, id, wantChance) {
    return list.some(function (c) {
      return c.text.indexOf('"' + id + '"') >= 0 && (wantChance === undefined || c.chance === wantChance)
    })
  }

  function condOf(d, type) {
    var list = d.conds.filter(function (c) { return c.type === type })
    return list.length > 0 ? list[0] : null
  }

  // night = daytime reversed; rain / thunder reversed below the level; pos_y with its range (or none)
  function skyProblems(d, want) {
    var bad = []
    var day = condOf(d, 'daytime')
    if (want.night && !(day && day.reverse === true)) bad.push('no night condition (daytime reversed)')
    ;['rain', 'thunder'].forEach(function (t) {
      var c = condOf(d, t)
      if (want[t] !== undefined) {
        if (!c || c.reverse !== true || Math.abs(Number(c.level) - want[t]) > 1e-6) bad.push('no ' + t + ' < ' + want[t] + ' condition')
      } else if (c) {
        bad.push('unexpected ' + t + ' condition')
      }
    })
    var y = condOf(d, 'pos_y')
    if (want.posY) {
      if (!y || Number(y.min) !== want.posY[0] || Number(y.max) !== want.posY[1] || y.reverse === true) bad.push('no pos_y ' + want.posY.join('..') + ' condition')
    } else if (y) {
      bad.push('unexpected pos_y condition')
    }
    return bad
  }

  function checkRecipes() {
    var R = (global.grindless.observatory || {}).recipes || {}
    var sky = R.sky || {}
    var specs = [
      { key: 'draft', type: 'gtceu:stargazing', ins: [[PAPER, 10000], ['forge:dusts/coal', 10000]], keep: [], outs: [DRAFT], eut: 8, duration: 400 },
      { key: 'map', type: 'gtceu:astrophotography', ins: [[PLATE, 10000], [PAPER, 10000]], keep: [DRAFT], outs: [MAP, EPHEMERIS], eut: 30, duration: 600 },
      { key: 'landing', type: 'gtceu:radio_astronomy', ins: [[PAPER, 10000]], keep: [MAP, EPHEMERIS], outs: [LANDING], eut: 120, duration: 600 }
    ]
    var bad = []
    var details = []
    specs.forEach(function (sp) {
      var id = R[sp.key]
      var r = id ? byId(id) : null
      if (r === null || !isGT(r)) {
        bad.push('missing ' + (id || sp.key))
        return
      }
      if (String(r.recipeType.registryName) !== sp.type) bad.push(id + ' is a ' + r.recipeType.registryName + ' recipe')
      var d = describeRecipe(r)
      sp.ins.forEach(function (p) { if (!hasItem(d.ins, p[0], p[1])) bad.push(id + ' does not consume ' + p[0]) })
      sp.keep.forEach(function (k) { if (!hasItem(d.ins, k, 0)) bad.push(id + ' does not take ' + k + ' as a non-consumed input') })
      sp.outs.forEach(function (o) { if (!hasItem(d.outs, o)) bad.push(id + ' does not give ' + o) })
      if (d.eut !== sp.eut || d.duration !== sp.duration) bad.push(id + ' runs at ' + d.eut + ' EU/t for ' + d.duration + ' t')
      skyProblems(d, sky[sp.key] || {}).forEach(function (p) { bad.push(id + ': ' + p) })
      var all = asArray(S.server.getRecipeManager().getAllRecipesFor(lazy().GTRegistries.RECIPE_TYPES.get(rl(sp.type))))
      if (all.length !== 1) bad.push(sp.type + ' has ' + all.length + ' recipes (expected 1)')
      details.push(id + ' ' + d.eut + ' EU/t ' + d.duration + ' t conditions=' + JSON.stringify(d.conds))
    })
    check(SCOPE, 'recipes', bad.length === 0, details.join(' ; ') + (bad.length > 0 ? ' problems=' + bad.join(' | ') : ''))
  }

  // the result item of a non-GT recipe (null when it has none or cannot be read)
  function resultIdOf(r) {
    try {
      var st = r.getResultItem(S.server.registryAccess())
      return st && !st.isEmpty() ? itemIdOf(st) : null
    } catch (e) {
      return null
    }
  }

  function checkSingleSource() {
    var R = (global.grindless.observatory || {}).recipes || {}
    var allowed = {}
    allowed[DRAFT] = [R.draft, 'grindless:crafting/lunar_chart_draft_copy']
    allowed[MAP] = [R.map, 'grindless:crafting/lunar_map_copy']
    allowed[EPHEMERIS] = [R.map, 'grindless:crafting/lunar_ephemeris_copy']
    allowed[LANDING] = [R.landing, 'grindless:crafting/lunar_landing_chart_copy']
    var found = {}
    CHARTS.forEach(function (id) { found[id] = [] })
    var n = 0
    var unreadable = 0
    asArray(S.server.getRecipeManager().getRecipes()).forEach(function (r) {
      n++
      var id = String(r.getId())
      if (isGT(r)) {
        var outs = ''
        try {
          outs = gtContents(r, lazy().ItemCap, true).map(function (c) { return c.text }).join(' ')
        } catch (e) {
          unreadable++
          return
        }
        if (outs.indexOf('"grindless:lunar_') < 0) return
        CHARTS.forEach(function (c) { if (outs.indexOf('"' + c + '"') >= 0) found[c].push(id) })
      } else {
        var res = resultIdOf(r)
        if (res !== null && found[res]) found[res].push(id)
      }
    })
    var bad = []
    CHARTS.forEach(function (c) {
      var extra = found[c].filter(function (id) { return allowed[c].indexOf(id) < 0 })
      var missing = allowed[c].filter(function (id) { return found[c].indexOf(id) < 0 })
      if (extra.length > 0) bad.push(c + ' also made by ' + extra.join(','))
      if (missing.length > 0) bad.push(c + ' not made by ' + missing.join(','))
    })
    check(SCOPE, 'single_source', bad.length === 0, n + ' recipes scanned (' + unreadable + ' GT unreadable): ' + CHARTS.map(function (c) {
      return c.replace('grindless:', '') + ' <- ' + found[c].join(',')
    }).join(' ; ') + (bad.length > 0 ? ' problems=' + bad.join(' | ') : ''))
  }

  // the ingredients of a crafting recipe as JSON text (item ids and tags)
  function ingredientsText(r) {
    var out = []
    asArray(r.getIngredients()).forEach(function (ing) {
      try {
        out.push(String(ing.toJson()))
      } catch (e) {
        out.push('?')
      }
    })
    return out.join(' ')
  }

  function checkCrafting() {
    var R = (global.grindless.observatory || {}).recipes || {}
    var ctrls = (global.grindless.observatory || {}).controllerRecipes || []
    var bad = []
    var plate = R.plate ? byId(R.plate) : null
    if (plate === null) {
      bad.push('missing ' + R.plate)
    } else {
      var d = describeRecipe(plate)
      if (String(plate.recipeType.registryName) !== 'gtceu:assembler' || d.eut > 32 || !hasItem(d.outs, PLATE) ||
        !(hasItem(d.ins, 'gtceu:glass_plate') || hasItem(d.ins, 'forge:plates/glass')) ||
        !(hasItem(d.ins, 'gtceu:small_silver_dust') || hasItem(d.ins, 'forge:small_dusts/silver'))) {
        bad.push(R.plate + ' is not glass plates + small silver dust -> plates in an LV assembler')
      }
    }
    var pairs = [[DRAFT, R.copies && R.copies[0]], [MAP, R.copies && R.copies[1]], [EPHEMERIS, R.copies && R.copies[2]],
      [LANDING, R.copies && R.copies[3]]]
    pairs.forEach(function (p) {
      var r = p[1] ? byId(p[1]) : null
      if (r === null) {
        bad.push('missing copy recipe of ' + p[0])
        return
      }
      var res = r.getResultItem(S.server.registryAccess())
      if (itemIdOf(res) !== p[0] || res.getCount() !== 2 || ingredientsText(r).indexOf('"' + p[0] + '"') < 0) bad.push(p[1] + ' is not ' + p[0] + ' + blank -> 2')
    })
    ctrls.forEach(function (id) {
      if (byId(id) === null) bad.push('missing ' + id)
    })
    // the Steam controller must stay craftable from Steam-era things (no circuit, no electric part)
    var steamCtrl = ctrls.length > 0 ? byId(ctrls[0]) : null
    var steamIns = steamCtrl !== null ? ingredientsText(steamCtrl) : ''
    if (steamCtrl !== null && (steamIns === '' || /circuit|"gtceu:(lv|mv|hv)_|electric/.test(steamIns))) bad.push('the Steam controller takes ' + steamIns)
    check(SCOPE, 'crafting', bad.length === 0, 'plate=' + (plate ? R.plate : 'none') + ' copies=' + (R.copies || []).length +
      ' controllers=' + ctrls.length + ' steam controller ingredients=' + steamIns +
      (bad.length > 0 ? ' problems=' + bad.join(' | ') : ''))
  }

  function checkSkyInfo() {
    var L = lazy()
    var R = (global.grindless.observatory || {}).recipes || {}
    var bad = []
    var texts = []
    ;[['gtceu:stargazing', R.draft], ['gtceu:astrophotography', R.map], ['gtceu:radio_astronomy', R.landing]].forEach(function (p) {
      var type = L.GTRegistries.RECIPE_TYPES.get(rl(p[0]))
      var r = p[1] ? byId(p[1]) : null
      if (!type || r === null) {
        bad.push('missing ' + p[0])
        return
      }
      var infos = asArray(type.getDataInfos())
      if (infos.length !== 1) bad.push(p[0] + ' has ' + infos.length + ' data info lines')
      var text = infos.length > 0 ? String(infos[0].apply(r.data)) : ''
      if (text === '') bad.push(p[0] + ' sky line is empty for ' + p[1])
      texts.push(p[0].replace('gtceu:', '') + '="' + text + '" (data ' + r.data + ')')
    })
    check(SCOPE, 'sky_info', bad.length === 0, texts.join(' ; ') + (bad.length > 0 ? ' problems=' + bad.join(' | ') : ''))
    // what GTM's own condition labels give on this server (they are written with %d; observatory_lang.js rewrites them on the client)
    try {
      note(SCOPE, 'gtm_condition_labels', 'pos_y="' + Text.translate('recipe.condition.pos_y.tooltip', 100, 319).getString() + '" rain="' +
        Text.translate('recipe.condition.rain.tooltip', 0.2).getString() + '" night="' + Text.translate('recipe.condition.daytime.night.tooltip').getString() + '"')
    } catch (e) {
      note(SCOPE, 'gtm_condition_labels', 'unreadable: ' + e)
    }
  }

  function staticChecks() {
    guarded('registry', checkRegistry)
    guarded('recipes', checkRecipes)
    guarded('single_source', checkSingleSource)
    guarded('crafting', checkCrafting)
    guarded('sky_info', checkSkyInfo)
  }

  // ---------------------------------------------------------------- structures (same technique as gg_test_moon.js)

  function simpleBlock(sym, spec) {
    switch (sym.kind) {
      case 'blocks':
        return { id: sym.blocks[0] }
      case 'frames':
        return { id: 'gtceu:' + sym.materials[0] + '_frame' }
      case 'part':
        if (!spec.parts[sym.ability]) throw new Error('the test does not know the part ability ' + sym.ability)
        return { id: spec.parts[sym.ability], ability: sym.ability }
      case 'controller':
        return { id: spec.id, controller: true }
      case 'air':
      case 'any':
        return null
      default:
        throw new Error('unsupported symbol kind ' + sym.kind)
    }
  }

  function assignOneOf(sym, list, spec) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var need = lim.exact != null ? lim.exact : (lim.min != null ? lim.min : 0)
        for (var k = 0; k < need; k++) parts.push(simpleBlock(o, spec))
      } else if (filler === null) {
        filler = simpleBlock(o, spec)
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
  function planOf(spec) {
    var desc = global.grindless.patterns.describe(spec.id)
    if (!desc) throw new Error('no structure description recorded for ' + spec.id)
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
      c.x = spec.x - (c.ci - ctrl.ci)
      c.y = spec.y + (c.ri - ctrl.ri)
      c.z = spec.z - (c.si - ctrl.si)
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
        assignOneOf(sym, list, spec)
      } else {
        var b = simpleBlock(sym, spec)
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
    var ys = placed.map(function (c) { return c.y })
    var xs = placed.map(function (c) { return c.x })
    return {
      cells: placed,
      airCells: cells.filter(function (c) { return c.block === null && c.sym.kind === 'air' }),
      size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)',
      blocks: placed.length,
      box: 'x ' + Math.min.apply(null, xs) + '..' + Math.max.apply(null, xs) + ' y ' + Math.min.apply(null, ys) + '..' + Math.max.apply(null, ys)
    }
  }

  function place(m) {
    var plan = m.plan
    var failed = []
    var ctrlCell = null
    function put(c) {
      return cmd('setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
    }
    plan.cells.forEach(function (c) {
      if (c.block.controller) {
        ctrlCell = c
        return
      }
      if (put(c) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.block.id + c.props)
    })
    if (put(ctrlCell) < 1) failed.push('controller ' + ctrlCell.block.id)
    m.ctrl = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.block.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.block.id + ' got ' + got)
    })
    plan.airCells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== 'minecraft:air') wrong.push(c.x + ',' + c.y + ',' + c.z + ' must be air, got ' + got)
    })
    var outside = plan.cells.filter(function (c) {
      return c.x < BAND.x0 || c.x > BAND.x1 || c.y < BAND.y0 || c.y > BAND.y1 || c.z < BAND.z0 || c.z > BAND.z1
    })
    if (outside.length > 0) wrong.push(outside.length + ' block(s) outside the band')
    var parts = plan.cells.filter(function (c) { return c.block.ability }).map(function (c) { return c.block.ability + c.props })
    check(m.scope, 'PLACED', failed.length === 0 && wrong.length === 0, 'blocks=' + plan.blocks + ' size=' + plan.size + ' ' + plan.box +
      ' controller=' + m.ctrl.x + ',' + m.ctrl.y + ',' + m.ctrl.z + ' parts=[' + parts.join(' ') + '] slit/air cells=' + plan.airCells.length +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') + (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function describeError(ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = 'pattern error ' + String(err)
      try {
        var p = err.getPos()
        text += ' at ' + p.getX() + ',' + p.getY() + ',' + p.getZ() + ' found ' + blockIdAt(p.getX(), p.getY(), p.getZ())
      } catch (e1) { /* no position */ }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  function partIds(ctrl) {
    return asArray(ctrl.getParts()).map(function (p) { return String(p.getDefinition().getId()).replace('gtceu:', '') })
  }

  function previewCheck(m) {
    var shapes = asArray(m.def.getMatchingShapes())
    var counts = {}
    var total = 0
    if (shapes.length > 0) {
      var blocks = shapes[0].getBlocks()
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
    }
    var missing = m.want.filter(function (id) { return !counts[id] })
    check(m.scope, 'PREVIEW', shapes.length >= 1 && missing.length === 0, 'shapes=' + shapes.length + ' blocks=' + total + ' (placed: ' +
      m.plan.blocks + ')' + (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
  }

  // ---------------------------------------------------------------- machine state, inputs, outputs

  function findParts(ctrl) {
    var P = { energy: [], steam: null, inBus: null, outBus: null }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (/energy_input_hatch$/.test(pid)) P.energy.push(p)
      else if (pid === 'gtceu:steam_input_hatch') P.steam = p
      else if (/input_bus$/.test(pid)) P.inBus = p
      else if (/output_bus$/.test(pid)) P.outBus = p
    })
    return P
  }

  function readInv(part) {
    var inv = part.getInventory()
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemIdOf(st)
      counts[id] = (counts[id] || 0) + st.getCount()
    }
    return counts
  }

  function clearInv(part) {
    var inv = part.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
  }

  // each stack goes into the first slot that takes all of it (the non-consumed charts already sit in the bus)
  function fillInputs(m, items) {
    var inv = m.parts.inBus.getInventory()
    items.forEach(function (input) {
      var left = Item.of(input[0], input[1])
      for (var slot = 0; slot < inv.getSlots() && !left.isEmpty(); slot++) left = inv.insertItem(slot, left, false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input[0] + ' x' + input[1] + ' (' + left.getCount() + ' left)')
    })
  }

  // GTM's own steam stack first (a Forge FluidStack), KubeJS' as the fallback (same order as gg_test_steam.js)
  function fillSteam(m) {
    var tank = m.parts.steam.tank
    var makers = [
      function () { return GTMaterials.Steam.getFluid(STEAM_MB) },
      function () { return Fluid.of('gtceu:steam', STEAM_MB).getFluidStack() }
    ]
    for (var i = 0; i < makers.length; i++) {
      try {
        tank.setFluidInTank(0, makers[i]())
        if (Number(tank.getFluidInTank(0).getAmount()) > 0) break
      } catch (e) { /* try the next one */ }
    }
    return Number(tank.getFluidInTank(0).getAmount())
  }

  function topUp(m) {
    if (m.parts === null) return
    m.parts.energy.forEach(function (p) {
      var c = p.energyContainer
      c.setEnergyStored(c.getEnergyCapacity())
    })
  }

  function logicOf(m) {
    var ctrl = machineAt(m.ctrl)
    return ctrl ? ctrl.getRecipeLogic() : null
  }

  function stateOf(m) {
    var rlg = logicOf(m)
    if (rlg === null) return { status: 'none', progress: 0, duration: 0, reasons: [] }
    var reasons = []
    try {
      reasons = asArray(rlg.getFailureReasons()).map(function (c) { return String(c.getString()) })
    } catch (e) { /* optional */ }
    try {
      var waiting = rlg.getWaitingReason()
      if (rlg.isWaiting() && waiting) reasons.push(String(waiting.getString()))
    } catch (e2) { /* optional */ }
    return { status: String(rlg.getStatus()).toUpperCase(), progress: Number(rlg.getProgress()), duration: Number(rlg.getDuration()), reasons: reasons }
  }

  function stateText(st) {
    return 'status=' + st.status + ' progress=' + st.progress + '/' + st.duration + (st.reasons.length > 0 ? ' reasons=[' + st.reasons.join(' ; ') + ']' : '')
  }

  // ---------------------------------------------------------------- world: sky and band

  function setSky(time, weather) {
    S.server.runCommandSilent('time set ' + time)
    var rain = weather === 'clear' ? 0 : 1
    var thunder = weather === 'thunder' ? 1 : 0
    S.server.runCommandSilent('weather ' + weather + ' 100000')
    try {
      S.level.setRainLevel(rain)
      S.level.setThunderLevel(thunder)
    } catch (e) {
      note(SCOPE, 'sky', 'could not set the rain/thunder level directly (' + e + '): waiting for the weather to ramp')
    }
    S.sky = { time: time, weather: weather }
  }

  function skyText() {
    var l = S.level
    try {
      return 'time=' + (Number(l.getDayTime()) % 24000) + ' night=' + l.isNight() + ' rain=' + Number(l.getRainLevel(1)).toFixed(2) +
        ' thunder=' + Number(l.getThunderLevel(1)).toFixed(2)
    } catch (e) {
      return 'sky unreadable (' + e + '), set to ' + JSON.stringify(S.sky)
    }
  }

  function prepareWorld() {
    for (var cx = 224; cx < 228; cx++) S.level.getChunk(cx, 0)
    cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = cmd('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    S.weatherCycle = String(S.level.getGameRules().getRule(Java.loadClass('net.minecraft.world.level.GameRules').RULE_WEATHER_CYCLE))
    S.server.runCommandSilent('gamerule doWeatherCycle false')
    note(SCOPE, 'AREA', 'chunks 224..227,0 force-loaded; cleared ' + cleared + ' blocks (X ' + BAND.x0 + '..' + BAND.x1 + ', Y ' + BAND.y0 + '..' +
      BAND.y1 + ', Z ' + BAND.z0 + '..' + BAND.z1 + '); doWeatherCycle was ' + S.weatherCycle + ', now false')
  }

  // ---------------------------------------------------------------- phases

  function inputsOf(m) {
    if (m.key === 'high' || m.key === 'low') return [[PAPER, 4], [COAL, 1]]
    if (m.key === 'optical') return [[DRAFT, 1], [PLATE, 4], [PAPER, 2]]
    return [[MAP, 1], [EPHEMERIS, 1], [PAPER, 2]]
  }

  function machine(key) {
    for (var i = 0; i < S.machines.length; i++) if (S.machines[i].key === key) return S.machines[i]
    return null
  }

  function ready(m) {
    return m.phase === 'ready'
  }

  // resets every formed machine: empty buses, fresh inputs, full steam, no recipe in progress
  function loadAll(fresh) {
    S.machines.forEach(function (m) {
      if (!ready(m)) return
      var ctrl = machineAt(m.ctrl)
      clearInv(m.parts.outBus)
      if (fresh) {
        clearInv(m.parts.inBus)
        ctrl.getRecipeLogic().resetRecipeLogic()
        fillInputs(m, inputsOf(m))
      }
      if (m.parts.steam !== null) fillSteam(m)
      topUp(m)
    })
  }

  // inputs for the second round: only what each recipe consumes (the non-consumed charts are still in the bus)
  function refill(m) {
    if (m.key === 'high' || m.key === 'low') fillInputs(m, [[PAPER, 4], [COAL, 1]])
    else if (m.key === 'optical') fillInputs(m, [[PLATE, 4], [PAPER, 2]])
    else fillInputs(m, [[PAPER, 2]])
  }

  function outCount(m, id) {
    return readInv(m.parts.outBus)[id] || 0
  }

  function inCount(m, id) {
    return readInv(m.parts.inBus)[id] || 0
  }

  function busText(m) {
    var steam = ''
    if (m.parts.steam !== null) {
      try {
        steam = ' steam=' + Number(m.parts.steam.tank.getFluidInTank(0).getAmount()) + ' mB'
      } catch (e) { /* optional */ }
    }
    return 'in=[' + itemSummary(readInv(m.parts.inBus)) + '] out=[' + itemSummary(readInv(m.parts.outBus)) + ']' + steam
  }

  function refused(m, reasonRe, label) {
    var st = stateOf(m)
    var outs = Object.keys(readInv(m.parts.outBus)).length
    var working = st.status === 'WORKING'
    var hasReason = st.reasons.some(function (r) { return reasonRe.test(r) })
    check(m.scope, label, !working && outs === 0 && hasReason, stateText(st) + ' ' + busText(m) + ' | ' + skyText())
  }

  var Y_REASON = /pos_y|Y [Ll]evel|Altura Y/

  var PHASES = [
    {
      name: 'A_clear_night', sky: [NIGHT, 'clear'], min: 20, max: 760,
      start: function () { loadAll(true) },
      done: function () {
        return ['high', 'optical', 'radio'].every(function (k) { var m = machine(k); return !ready(m) || Object.keys(readInv(m.parts.outBus)).length > 0 })
      },
      finish: function () {
        var high = machine('high')
        if (ready(high)) {
          check(high.scope, 'A_draft', outCount(high, DRAFT) === 1 && inCount(high, PAPER) === 0 && inCount(high, COAL) === 0,
            'clear night at Y ' + high.ctrl.y + ': ' + busText(high) + ' ' + stateText(stateOf(high)) + ' | ' + skyText())
        }
        var low = machine('low')
        if (ready(low)) refused(low, Y_REASON, 'A_low_refused')
        var opt = machine('optical')
        if (ready(opt)) {
          check(opt.scope, 'A_map', outCount(opt, MAP) === 1 && outCount(opt, EPHEMERIS) === 1 && inCount(opt, DRAFT) === 1 &&
            inCount(opt, PLATE) === 0 && inCount(opt, PAPER) === 0, 'clear night: ' + busText(opt) + ' (the draft must stay) ' +
            stateText(stateOf(opt)) + ' | ' + skyText())
        }
        var radio = machine('radio')
        if (ready(radio)) {
          check(radio.scope, 'A_landing', outCount(radio, LANDING) === 1 && inCount(radio, MAP) === 1 && inCount(radio, EPHEMERIS) === 1 &&
            inCount(radio, PAPER) === 0, 'clear night: ' + busText(radio) + ' (map and ephemeris must stay) ' + stateText(stateOf(radio)) +
            ' | ' + skyText())
        }
      }
    },
    {
      name: 'B_day', sky: [DAY, 'clear'], min: 100, max: 100,
      start: function () {
        S.machines.forEach(function (m) {
          if (!ready(m)) return
          clearInv(m.parts.outBus)
          refill(m)
          if (m.parts.steam !== null) fillSteam(m)
        })
      },
      finish: function () {
        ;['high', 'optical', 'radio'].forEach(function (k) {
          var m = machine(k)
          if (ready(m)) refused(m, /night/i, 'B_day_refused')
        })
      }
    },
    {
      name: 'C_rainy_night', sky: [NIGHT, 'rain'], min: 100, max: 100,
      start: function () { },
      finish: function () {
        ;['high', 'optical'].forEach(function (k) {
          var m = machine(k)
          if (ready(m)) refused(m, /rain/i, 'C_rain_refused')
        })
        var radio = machine('radio')
        if (ready(radio)) {
          var st = stateOf(radio)
          radio.progressC = st.progress
          check(radio.scope, 'C_rain_works', st.status === 'WORKING' && st.progress > 0 && inCount(radio, PAPER) === 0,
            'radio goes through the rain: ' + stateText(st) + ' ' + busText(radio) + ' | ' + skyText())
        }
      }
    },
    {
      name: 'D_thunderstorm', sky: [NIGHT, 'thunder'], min: 80, max: 80,
      start: function () {
        var radio = machine('radio')
        if (ready(radio)) radio.progressD0 = stateOf(radio).progress
      },
      finish: function () {
        var radio = machine('radio')
        if (!ready(radio)) return
        var st = stateOf(radio)
        radio.progressD = st.progress
        var paused = st.status === 'WAITING' && st.progress > 1 && Math.abs(st.progress - radio.progressD0) <= 2
        var because = st.reasons.some(function (r) { return /thunder/i.test(r) })
        check(radio.scope, 'D_storm_waits', paused && because && Object.keys(readInv(radio.parts.outBus)).length === 0,
          'progress at the first thunder=' + radio.progressD0 + ', 80 ticks later ' + stateText(st) + ' (it must wait, not reset) | ' + skyText())
      }
    },
    {
      name: 'E_clear_again', sky: [NIGHT, 'clear'], min: 20, max: 700,
      start: function () {
        S.machines.forEach(function (m) {
          if (ready(m) && m.parts.steam !== null) fillSteam(m)
        })
      },
      // when the radio telescope's chart comes out (the others take a whole run longer)
      watch: function (elapsed) {
        var radio = machine('radio')
        if (ready(radio) && radio.doneAt === undefined && outCount(radio, LANDING) > 0) radio.doneAt = elapsed
      },
      done: function () {
        return ['high', 'optical', 'radio'].every(function (k) { var m = machine(k); return !ready(m) || Object.keys(readInv(m.parts.outBus)).length > 0 })
      },
      finish: function () {
        var radio = machine('radio')
        if (ready(radio)) {
          var took = radio.doneAt === undefined ? -1 : radio.doneAt
          var left = 600 - (radio.progressD || 0)
          check(radio.scope, 'E_resumes', outCount(radio, LANDING) === 1 && took >= 0 && took <= left + 2 * STEP + 5,
            'after the storm: ' + busText(radio) + ' out after ' + took + ' ticks (it had ' + left + ' left: a reset would need 600) ' +
            stateText(stateOf(radio)) + ' | ' + skyText())
        }
        var high = machine('high')
        if (ready(high)) {
          check(high.scope, 'E_draft_after_rain', outCount(high, DRAFT) === 1, 'the inputs left since the day phase: ' + busText(high) + ' ' +
            stateText(stateOf(high)))
        }
        var opt = machine('optical')
        if (ready(opt)) {
          check(opt.scope, 'E_map_after_rain', outCount(opt, MAP) === 1 && outCount(opt, EPHEMERIS) === 1 && inCount(opt, DRAFT) === 1,
            busText(opt) + ' ' + stateText(stateOf(opt)))
        }
        var low = machine('low')
        if (ready(low)) refused(low, Y_REASON, 'E_low_still_refused')
      }
    }
  ]

  // ---------------------------------------------------------------- machines: build and form

  function startMachine(spec) {
    var m = { key: spec.key, id: spec.id, scope: spec.scope, spec: spec, phase: 'forming', t0: S.t, plan: null, ctrl: null, parts: null,
      forced: false, want: [] }
    S.machines.push(m)
    try {
      m.def = lazy().GTRegistries.MACHINES.get(rl(spec.id))
      if (m.def === null || m.def === undefined) {
        check(m.scope, 'PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      m.plan = planOf(spec)
      check(m.scope, 'DESCRIPTION', true, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size)
      var ids = {}
      m.plan.cells.forEach(function (c) { if (!c.block.ability) ids[c.block.id] = true })
      m.want = Object.keys(ids)
      if (!place(m)) m.phase = 'done'
    } catch (e) {
      check(m.scope, 'DESCRIPTION', false, 'exception while describing/placing: ' + e)
      m.phase = 'done'
    }
  }

  function advanceForming(m) {
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(m.scope, 'FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }
    var waited = S.t - m.t0
    if (ctrl.isFormed()) {
      check(m.scope, 'FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') + 'parts=[' + partIds(ctrl).join(' ') + ']')
      check(m.scope, 'PATTERN', global.grindless.patterns.describe(m.id).built, 'built by GTM on the first structure check')
      if (m.spec.preview) {
        try {
          previewCheck(m)
        } catch (e) {
          check(m.scope, 'PREVIEW', false, 'exception: ' + e)
        }
      }
      m.parts = findParts(ctrl)
      var steamOk = m.spec.kind !== 'steam' || m.parts.steam !== null
      var energyOk = m.spec.kind !== 'electric' || m.parts.energy.length > 0
      if (m.parts.inBus === null || m.parts.outBus === null || !steamOk || !energyOk) {
        check(m.scope, 'PARTS', false, 'input bus=' + (m.parts.inBus !== null) + ' output bus=' + (m.parts.outBus !== null) + ' steam hatch=' +
          (m.parts.steam !== null) + ' energy hatches=' + m.parts.energy.length)
        m.phase = 'done'
        return
      }
      m.phase = 'ready'
      return
    }
    if (waited >= FORM_TIMEOUT) {
      var syncOk = false
      try {
        syncOk = ctrl.checkPatternWithLock()
      } catch (e2) { /* reported below */ }
      if (!syncOk || m.forced) {
        check(m.scope, 'FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
        m.phase = 'done'
        return
      }
      check(m.scope, 'FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
      ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
      ctrl.onStructureFormed()
      m.forced = true
    }
  }

  // ---------------------------------------------------------------- driver

  function beginPhase(i) {
    S.phase = i
    S.phaseStart = S.t
    var p = PHASES[i]
    setSky(p.sky[0], p.sky[1])
    p.start()
    note(SCOPE, 'PHASE_' + p.name, 'started at t=' + S.t + ': ' + skyText() + ' | ' + S.machines.filter(ready).map(function (m) {
      return m.key + ' ' + busText(m)
    }).join(' ; '))
  }

  function step() {
    var forming = S.machines.filter(function (m) { return m.phase === 'forming' })
    if (forming.length > 0) {
      forming.forEach(function (m) {
        try {
          advanceForming(m)
        } catch (e) {
          check(m.scope, 'FORMED', false, 'exception: ' + e)
          m.phase = 'done'
        }
      })
      return
    }
    if (S.phase < 0) {
      if (S.machines.filter(ready).length === 0) {
        check(SCOPE, 'machines', false, 'no observatory formed: nothing to run')
        finish()
        return
      }
      beginPhase(0)
      return
    }
    var p = PHASES[S.phase]
    var elapsed = S.t - S.phaseStart
    if (p.watch) p.watch(elapsed)
    if (elapsed >= 60 && !S.noted[p.name]) {
      S.noted[p.name] = true
      note(SCOPE, 'STATE_' + p.name, S.machines.filter(ready).map(function (m) { return m.key + ' ' + stateText(stateOf(m)) }).join(' ; ') + ' | ' + skyText())
    }
    if (elapsed >= p.max || (elapsed >= p.min && p.done && p.done())) {
      try {
        p.finish()
      } catch (e) {
        check(SCOPE, 'phase_' + p.name, false, 'exception while checking: ' + e)
      }
      if (S.phase + 1 >= PHASES.length) {
        finish()
        return
      }
      beginPhase(S.phase + 1)
    }
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      S.server.runCommandSilent('weather clear')
      if (S.weatherCycle) S.server.runCommandSilent('gamerule doWeatherCycle ' + S.weatherCycle)
      cmd('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    } catch (e) { /* best effort */ }
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick() {
    if (S === null || S.finished) return
    S.machines.forEach(function (m) {
      if (ready(m)) {
        try {
          topUp(m)
        } catch (e) { /* the next step reports problems */ }
      }
    })
    var now = S.server.getTickCount()
    S.t = now - S.tick0
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    try {
      if (S.t > TEST_TIMEOUT) {
        check(SCOPE, 'timeout', false, 'still running after ' + S.t + ' ticks, phase ' + S.phase + ': ' + S.machines.map(function (m) { return m.key + ':' + m.phase }).join(','))
        finish()
        return
      }
      step()
    } catch (e) {
      check(SCOPE, 'STEP', false, 'exception: ' + e)
      finish()
    }
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.overworld(), t: 0, tick0: now, nextAt: now + STEP, machines: [], phase: -1, phaseStart: 0, noted: {},
      finished: false, sky: null, weatherCycle: null }
    staticChecks()
    guarded('AREA', prepareWorld)
    MACHINES.forEach(function (spec) {
      try {
        startMachine(spec)
      } catch (e) {
        check(spec.scope, 'DESCRIPTION', false, 'exception: ' + e)
      }
    })
  }

  // The pack's scripts may be reloaded a couple of seconds after the server is up: the command only leaves a request in `global`
  // and the tick handler starts the test once these scripts have been loaded for QUIET_MS.
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

  ServerEvents.customCommand('gg_test_observatory', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_observatory run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
