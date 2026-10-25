// Gregtech Grindless - smoke test of package B4, lunar power and antenna (TEST-ONLY overlay: copied over the instance on the test PC,
// never shipped): the Lunar Solar Array (gtceu:lunar_solar_array, the first generator multiblock of the pack with a recipe type of
// its own, gtceu:lunar_solar) and the Deep Space Antenna (gtceu:deep_space_antenna, gtceu:deep_space_tracking), both in
// startup_scripts/grindless/ev/lunar_power_and_antenna.js.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_lunar_power;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|lunar_power\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// It sets the time of day (GCYR's Moon follows the Overworld's clock) and clears the weather: run it in a server of its own, not
// together with tests that need a time of day (the observatories, gg_test_moon's regolith scenario, the cryogenic plant's night).
//
// Markers: GGTEST|lunar_power|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|lunar_power|DONE.
//   static (no world)
//     registry          both machines and the panel block registered; the array is a generator that does not regress while waiting,
//                       runs gtceu:lunar_solar; the antenna runs gtceu:deep_space_tracking; both structures described, 36 panels
//     solar_recipes     moon: circuit 1, gcyr:luna, day, 420 EU/t out per run, nothing else; mars: circuit 2, gcyr:mars, day, 129
//     chart_recipe      the landing-site chart (not consumed) + a data stick -> the Mars chart, gcyr:luna, night, 1 920 EU/t, 600 t
//     crafting          the chart copy and the two controllers exist and make what they say; the array's controller takes the
//                       EV Tripod Drill's Solar Wing Panel, the block of the field
//   in the world: the Moon (gcyr:luna) band X 7680..7743, Y 198..214, Z 0..15 (the structures stand on Y 200, controllers at Y 201)
//     <copy> PLACED / FORMED / PARTS      buffer (array, controller x 7688), field (array, x 7704), antenna (x 7724); all face north
//     eu_to_buffer      DAY, copy buffer: one EV dynamo hatch (2 A, 4 096 EU/t) in front of a real EV battery buffer: 9 panels run
//                       (9 x 420 = 3 780 EU/t, the dynamo limit), and battery + hatch = exactly 3 780 EU per working tick
//     field_day         DAY, copy field: two EV 4 A dynamo hatches (16 384 EU/t, drained by the test every tick): all 36 panels run,
//                       15 120 EU/t
//     field_covered     a block over one panel: from the next run on, 35 panels (14 700 EU/t)
//     display           the field's controller lines: the dynamo capacity, the output and the lit panels
//     antenna_day       DAY: the antenna does not observe (night only) and uses nothing
//     arrays_night      NIGHT: neither array makes EU once the sun is down; they wait or idle
//     antenna_night     NIGHT: the antenna writes 1 Mars chart, the landing-site chart stays, the data stick is used
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'lunar_power'
  var FORM_TIMEOUT = 600
  var TEST_TIMEOUT = 5000
  var DAY_TICKS = 200
  var COVER_TICKS = 120
  var COVER_WINDOW = 50
  var NIGHT_TICKS = 760
  var NIGHT_GRACE = 25
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestLunarPowerRequest'

  var LUNA = 'gcyr:luna'
  var BAND = { x0: 7680, x1: 7743, y0: 198, y1: 214, z0: 0, z1: 15 }
  var Y0 = 200
  var ARRAY = 'gtceu:lunar_solar_array'
  var ANTENNA = 'gtceu:deep_space_antenna'
  var SOLAR_TYPE = 'gtceu:lunar_solar'
  var ANTENNA_TYPE = 'gtceu:deep_space_tracking'
  var PANEL = 'grindless:solar_wing_panel'
  var SINTERED = 'grindless:sintered_regolith'
  var CHART = 'grindless:mars_chart'
  var LANDING = 'grindless:lunar_landing_chart'
  var STICK = 'gtceu:data_stick'
  var BUFFER = 'gtceu:ev_battery_buffer_4x'
  var BATTERY = 'gtceu:ev_vanadium_battery'
  var COVER = 'minecraft:stone'

  // the copies: parts by pattern cell (slice, row, column of the description), all facing north (out of the front wall)
  var COPIES = [
    { key: 'buffer', machine: ARRAY, x: 7688, z: 2,
      parts: [{ si: 6, ri: 0, ci: 3, id: 'gtceu:ev_energy_output_hatch', role: 'dynamo' }, { si: 6, ri: 1, ci: 2, id: 'gtceu:ev_input_bus', role: 'in' }] },
    { key: 'field', machine: ARRAY, x: 7704, z: 2,
      parts: [{ si: 6, ri: 0, ci: 2, id: 'gtceu:ev_energy_output_hatch_4a', role: 'dynamo' },
        { si: 6, ri: 0, ci: 6, id: 'gtceu:ev_energy_output_hatch_4a', role: 'dynamo' }, { si: 6, ri: 1, ci: 2, id: 'gtceu:ev_input_bus', role: 'in' }] },
    { key: 'antenna', machine: ANTENNA, x: 7724, z: 2,
      parts: [{ si: 8, ri: 0, ci: 3, id: 'gtceu:ev_energy_input_hatch', role: 'energy' }, { si: 8, ri: 1, ci: 1, id: 'gtceu:ev_input_bus', role: 'in' },
        { si: 8, ri: 1, ci: 5, id: 'gtceu:ev_output_bus', role: 'out' }] }
  ]

  var S = null
  var J = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  function safely(name, fn) {
    try {
      fn()
    } catch (e) {
      check(name, false, 'exception: ' + e)
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
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
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

  function cmd(text) {
    return S.server.runCommandSilent('execute in ' + LUNA + ' run ' + text)
  }

  function blockIdAt(x, y, z) {
    return String(S.moon.getBlock(x, y, z).getId())
  }

  function machineAt(p) {
    return lazy().MetaMachine.getMachine(S.moon, bp(p.x, p.y, p.z))
  }

  function itemIdOf(stack) {
    return String(lazy().BI.ITEM.getKey(stack.getItem()))
  }

  function byId(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  // ---------------------------------------------------------------- recipe reading

  // GT recipe content -> JSON text through GTM's own serializer
  function contentTexts(r, cap, output) {
    var list = output ? asArray(r.getOutputContents(cap)) : asArray(r.getInputContents(cap))
    return list.map(function (c) {
      var t = String(cap.serializer.toJson(cap.of(c.content)))
      return { text: t, chance: Number(c.chance) }
    })
  }

  // signed EU/t: > 0 made, < 0 used
  function signedEUt(r) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(r)
    if (io.isEmpty()) return 0
    return io.isInput() ? -Number(io.getTotalEU()) : Number(io.getTotalEU())
  }

  function conditionsOf(r) {
    return asArray(r.conditions).map(function (c) {
      var t = { kind: String(c.getClass().getSimpleName()), reverse: c.isReverse() === true, dim: null }
      try { t.dim = String(c.getDimension().location()) } catch (e) { /* not a dimension condition */ }
      return t
    })
  }

  function conditionsText(conds) {
    return conds.map(function (c) { return c.kind + (c.reverse ? '(reversed)' : '') + (c.dim ? ':' + c.dim : '') }).join(',')
  }

  function typeIds(def) {
    var out = []
    var arr = def.getRecipeTypes()
    for (var i = 0; i < arr.length; i++) out.push(String(arr[i].registryName))
    return out
  }

  // what a recipe makes: a GT recipe's first item output (JSON text), or a crafting recipe's result id
  function madeBy(r) {
    if (typeof r.getOutputContents === 'function') {
      var texts = contentTexts(r, lazy().ItemCap, true)
      if (texts.length > 0) return texts[0].text
    }
    return itemIdOf(r.getResultItem(S.server.registryAccess()))
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var LP = global.grindless.lunarPower

    safely('registry', function () {
      var problems = []
      var arr = lazy().GTRegistries.MACHINES.get(rl(ARRAY))
      var ant = lazy().GTRegistries.MACHINES.get(rl(ANTENNA))
      if (!arr) problems.push(ARRAY + ' not registered')
      if (!ant) problems.push(ANTENNA + ' not registered')
      if (!Item.exists(PANEL)) problems.push(PANEL + ' missing')
      var detail = []
      if (arr) {
        var types = typeIds(arr)
        if (arr.isGenerator() !== true) problems.push('array generator=' + arr.isGenerator())
        if (arr.isRegressWhenWaiting() !== false) problems.push('array regressWhenWaiting=' + arr.isRegressWhenWaiting())
        if (types.join(',') !== SOLAR_TYPE) problems.push('array types=' + types.join(','))
        detail.push('array generator=' + arr.isGenerator() + ' regress=' + arr.isRegressWhenWaiting() + ' types=' + types.join(','))
      }
      if (ant) {
        var atypes = typeIds(ant)
        if (atypes.join(',') !== ANTENNA_TYPE) problems.push('antenna types=' + atypes.join(','))
        if (ant.isRegressWhenWaiting() !== false) problems.push('antenna regressWhenWaiting=' + ant.isRegressWhenWaiting())
        detail.push('antenna types=' + atypes.join(','))
      }
      ;[ARRAY, ANTENNA].forEach(function (id) {
        if (!global.grindless.patterns.describe(id)) problems.push('no structure description for ' + id)
      })
      if (!LP || !LP.array || LP.array.panels !== 36) problems.push('panels=' + (LP && LP.array ? LP.array.panels : '?'))
      check('registry', problems.length === 0, detail.join('; ') + ' panels=' + (LP && LP.array ? LP.array.panels : '?') +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('solar_recipes', function () {
      var A = LP.array
      var problems = []
      var info = []
      ;['moon', 'mars'].forEach(function (key) {
        var site = A.sites[key]
        var r = byId(site.recipe)
        if (r === null) {
          problems.push(site.recipe + ' missing')
          return
        }
        var ins = contentTexts(r, lazy().ItemCap, false)
        var fin = contentTexts(r, lazy().FluidCap, false)
        var outs = contentTexts(r, lazy().ItemCap, true).concat(contentTexts(r, lazy().FluidCap, true))
        var conds = conditionsOf(r)
        var eut = signedEUt(r)
        var circuitOk = ins.length === 1 && ins[0].chance === 0 && ins[0].text.indexOf('"configuration":' + site.circuit) >= 0
        var dimOk = conds.some(function (c) { return c.kind === 'DimensionCondition' && !c.reverse && c.dim === site.dimension })
        var dayOk = conds.some(function (c) { return c.kind === 'DaytimeCondition' && !c.reverse })
        if (!circuitOk) problems.push(key + ' inputs ' + ins.map(function (i) { return i.text + '@' + i.chance }).join(' '))
        if (fin.length > 0 || outs.length > 0) problems.push(key + ' has fluid inputs or outputs')
        if (!dimOk || !dayOk || conds.length !== 2) problems.push(key + ' conditions ' + conditionsText(conds))
        if (eut !== site.euPerPanel) problems.push(key + ' EU/t ' + eut)
        if (Number(r.duration) !== A.duration) problems.push(key + ' duration ' + r.duration)
        info.push(key + ': circuit ' + site.circuit + ' ' + conditionsText(conds) + ' ' + eut + ' EU/t x ' + r.duration + ' t')
      })
      check('solar_recipes', problems.length === 0, info.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('chart_recipe', function () {
      var N = LP.antenna
      var r = byId(N.recipe)
      if (r === null) throw new Error(N.recipe + ' missing')
      var ins = contentTexts(r, lazy().ItemCap, false)
      var outs = contentTexts(r, lazy().ItemCap, true)
      var conds = conditionsOf(r)
      var eut = signedEUt(r)
      var problems = []
      var landing = ins.filter(function (i) { return i.text.indexOf(LANDING) >= 0 })
      var stick = ins.filter(function (i) { return i.text.indexOf(STICK) >= 0 })
      if (ins.length !== 2 || landing.length !== 1 || landing[0].chance !== 0) problems.push('landing chart not a non-consumed input')
      if (stick.length !== 1 || stick[0].chance === 0) problems.push('data stick not a consumed input')
      if (outs.length !== 1 || outs[0].text.indexOf(CHART) < 0) problems.push('outputs ' + outs.map(function (o) { return o.text }).join(' '))
      if (!conds.some(function (c) { return c.kind === 'DimensionCondition' && !c.reverse && c.dim === LUNA })) problems.push('no ' + LUNA + ' condition')
      if (!conds.some(function (c) { return c.kind === 'DaytimeCondition' && c.reverse })) problems.push('no night condition')
      if (eut !== -N.eut || Number(r.duration) !== N.duration) problems.push('energy ' + eut + ' EU/t x ' + r.duration)
      check('chart_recipe', problems.length === 0, ins.map(function (i) { return i.text + '@' + i.chance }).join(' ') + ' -> ' +
        outs.map(function (o) { return o.text }).join(' ') + ' ' + conditionsText(conds) + ' ' + (-eut) + ' EU/t x ' + r.duration + ' t' +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('crafting', function () {
      var R = LP.recipes
      var want = {}
      want[R.copy] = CHART
      want[R.controllers[0]] = ARRAY
      want[R.controllers[1]] = ANTENNA
      var problems = []
      var seen = []
      Object.keys(want).forEach(function (id) {
        var r = byId(id)
        if (r === null) {
          problems.push(id + ' missing')
          return
        }
        var out = madeBy(r)
        if (String(out).indexOf(want[id]) < 0) problems.push(id + ' makes ' + out)
        seen.push(id.replace('grindless:', '') + '->' + String(out).replace(/^[a-z_]+:/, ''))
      })
      var arrayRecipe = byId(R.controllers[0])
      var holdsPanel = false
      if (arrayRecipe !== null) {
        asArray(arrayRecipe.getIngredients()).forEach(function (ing) {
          asArray(ing.getItemIds()).forEach(function (iid) { if (String(iid) === PANEL) holdsPanel = true })
        })
      }
      if (!holdsPanel) problems.push(R.controllers[0] + ' does not take ' + PANEL)
      check('crafting', problems.length === 0, seen.join(', ') + '; the array controller takes ' + PANEL + '=' + holdsPanel +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })
  }

  // ---------------------------------------------------------------- structures

  function plainBlock(sym) {
    if (sym.kind === 'blocks') return sym.blocks[0]
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    if (sym.kind === 'oneOf') {
      for (var i = 0; i < sym.options.length; i++) {
        if (sym.options[i].kind === 'blocks') return sym.options[i].blocks[0]
      }
    }
    throw new Error('no plain block for symbol kind ' + sym.kind)
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(copy) {
    var desc = global.grindless.patterns.describe(copy.machine)
    if (!desc) throw new Error('no structure description recorded for ' + copy.machine)
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (ctrl === null) throw new Error('the description has no controller cell')
    var cy = Y0 + ctrl.ri
    var cells = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'air' || sym.kind === 'any') continue
          var c = { si: si, ri: ri, ci: ci, ch: ch, x: copy.x - (ci - ctrl.ci), y: cy + (ri - ctrl.ri), z: copy.z - (si - ctrl.si), id: null,
            props: '', role: null }
          if (sym.kind === 'controller') {
            c.id = copy.machine
            c.props = '[facing=north]'
            c.role = 'controller'
          } else {
            var part = copy.parts.filter(function (p) { return p.si === si && p.ri === ri && p.ci === ci })[0]
            if (part) {
              if (sym.kind !== 'oneOf') throw new Error('part cell ' + si + ',' + ri + ',' + ci + ' is not a hut cell')
              c.id = part.id
              c.props = '[facing=north]'
              c.role = part.role
            } else {
              c.id = plainBlock(sym)
            }
          }
          cells.push(c)
        }
      })
    })
    return { cells: cells, ctrl: { x: copy.x, y: cy, z: copy.z }, size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length }
  }

  function setBlock(x, y, z, id, props) {
    return cmd('setblock ' + x + ' ' + y + ' ' + z + ' ' + id + (props || '') + ' replace')
  }

  function place(m) {
    var plan = planOf(m.copy)
    m.plan = plan
    var failed = []
    var tally = {}
    var ctrlCell = null
    plan.cells.forEach(function (c) {
      tally[c.id] = (tally[c.id] || 0) + 1
      if (c.role === 'controller') {
        ctrlCell = c
        return
      }
      if (setBlock(c.x, c.y, c.z, c.id, c.props) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.id)
    })
    if (setBlock(ctrlCell.x, ctrlCell.y, ctrlCell.z, ctrlCell.id, ctrlCell.props) < 1) failed.push('controller')
    m.ctrlPos = plan.ctrl
    // the battery buffer in front of the dynamo hatch of the buffer copy (it faces north too: its back takes the hatch's output)
    if (m.copy.key === 'buffer') {
      var dyn = plan.cells.filter(function (c) { return c.role === 'dynamo' })[0]
      m.bufferPos = { x: dyn.x, y: dyn.y, z: dyn.z - 1 }
      if (setBlock(m.bufferPos.x, m.bufferPos.y, m.bufferPos.z, BUFFER, '[facing=north]') < 1) failed.push('battery buffer')
    }
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.id + ' got ' + got)
    })
    var bill = Object.keys(tally).sort().map(function (id) { return id.replace(/^[a-z]+:/, '') + ' x' + tally[id] }).join(', ')
    check(m.copy.key + '_PLACED', failed.length === 0 && wrong.length === 0, plan.cells.length + ' blocks, ' + plan.size + ' (w x h x d), controller ' +
      m.ctrlPos.x + ',' + m.ctrlPos.y + ',' + m.ctrlPos.z + ' bill=[' + bill + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
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
        text += ' at ' + p.getX() + ',' + p.getY() + ',' + p.getZ() + ' found ' + blockIdAt(p.getX(), p.getY(), p.getZ())
      } catch (e1) { /* no position */ }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  function findParts(ctrl) {
    var P = { dynamos: [], energy: [], inBus: null, outBus: null, ids: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      P.ids.push(pid.replace('gtceu:', ''))
      if (/_energy_output_hatch/.test(pid)) P.dynamos.push(p)
      else if (/_energy_input_hatch/.test(pid)) P.energy.push(p)
      else if (/_input_bus$/.test(pid)) P.inBus = p
      else if (/_output_bus$/.test(pid)) P.outBus = p
    })
    return P
  }

  function readInv(inv) {
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemIdOf(st)
      counts[id] = (counts[id] || 0) + Number(st.getCount())
    }
    return counts
  }

  function summary(counts) {
    var keys = Object.keys(counts)
    return keys.length === 0 ? 'nothing' : keys.map(function (k) { return k.replace(/^[a-z_]+:/, '') + ' x' + counts[k] }).join(', ')
  }

  function dynamoStored(m) {
    var total = 0
    m.parts.dynamos.forEach(function (d) { total += Number(d.energyContainer.getEnergyStored()) })
    return total
  }

  function batteryCharge(m) {
    var bb = machineAt(m.bufferPos)
    return bb ? Number(bb.energyContainer.getEnergyStored()) : -1
  }

  function recipeState(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      var fails = asArray(rlg.getFailureReasons()).map(function (c) { return String(c.getString()) })
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() +
        ' lastRecipe=' + (last ? last.id + ' parallels=' + last.parallels : 'none') + (fails.length > 0 ? ' failureReasons=[' + fails.join(' ; ') + ']' : '')
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

  // ---------------------------------------------------------------- world

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.moon.getChunk(cx, cz)
    }
    cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = cmd('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    note('AREA', LUNA + ' band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 +
      ' generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function setClock(time, why) {
    S.server.runCommandSilent('time set ' + time)
    note('CLOCK', 'time set ' + time + ' (' + why + '): Moon day time ' + (Number(S.moon.getDayTime()) % 24000) + ' night=' + S.moon.isNight())
  }

  // ---------------------------------------------------------------- phases

  function startCopies() {
    S.copies = []
    COPIES.forEach(function (copy) {
      var m = { copy: copy, phase: 'forming', parts: null, ctrlPos: null, bufferPos: null, eu: 0, euTicks: {}, workTicks: 0, maxPar: 0,
        pars: {}, statuses: {}, nightEu: 0 }
      S.copies.push(m)
      try {
        if (!place(m)) m.phase = 'broken'
      } catch (e) {
        check(copy.key + '_PLACED', false, 'exception: ' + e)
        m.phase = 'broken'
      }
    })
  }

  function copyOf(key) {
    return S.copies.filter(function (m) { return m.copy.key === key })[0]
  }

  function allFormed() {
    var ok = true
    S.copies.forEach(function (m) {
      if (m.phase !== 'forming') return
      var ctrl = machineAt(m.ctrlPos)
      if (ctrl && ctrl.isFormed()) {
        m.phase = 'formed'
        check(m.copy.key + '_FORMED', true, 'formed after ' + (S.t - S.t0) + ' ticks')
      } else {
        ok = false
      }
    })
    return ok
  }

  function formTimeout() {
    S.copies.forEach(function (m) {
      if (m.phase !== 'forming') return
      var ctrl = machineAt(m.ctrlPos)
      check(m.copy.key + '_FORMED', false, 'not formed after ' + FORM_TIMEOUT + ' ticks: ' + (ctrl ? describeError(ctrl) : 'no controller'))
      m.phase = 'broken'
    })
  }

  // parts, circuits, batteries and the antenna's inputs; the clock to midmorning, clear weather
  function setup() {
    S.server.runCommandSilent('weather clear 12000')
    setClock(1000, 'the array works by day')
    S.copies.forEach(function (m) {
      if (m.phase !== 'formed') return
      safely(m.copy.key + '_PARTS', function () {
        var ctrl = machineAt(m.ctrlPos)
        var P = findParts(ctrl)
        m.parts = P
        var problems = []
        var want = m.copy.parts
        var wantDyn = want.filter(function (p) { return p.role === 'dynamo' }).length
        var wantEnergy = want.filter(function (p) { return p.role === 'energy' }).length
        if (P.dynamos.length !== wantDyn) problems.push('dynamo hatches ' + P.dynamos.length + ' (wanted ' + wantDyn + ')')
        if (P.energy.length !== wantEnergy) problems.push('energy hatches ' + P.energy.length + ' (wanted ' + wantEnergy + ')')
        if (P.inBus === null) problems.push('no input bus')
        if (m.copy.machine === ANTENNA && P.outBus === null) problems.push('no output bus')
        if (problems.length === 0) {
          if (m.copy.machine === ARRAY) {
            var cinv = P.inBus.getCircuitInventory()
            cinv.setStackInSlot(0, lazy().Circuit.stack(1))
            if (cinv.getStackInSlot(0).isEmpty()) problems.push('the circuit slot did not take programmed circuit 1')
            if (m.copy.key === 'buffer') {
              var bb = machineAt(m.bufferPos)
              var inv = bb.getBatteryInventory()
              for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.of(BATTERY))
              m.batteryStart = batteryCharge(m)
            }
          } else {
            var bin = P.inBus.getInventory()
            var l1 = bin.insertItem(0, Item.of(LANDING, 1), false)
            var l2 = bin.insertItem(1, Item.of(STICK, 1), false)
            if (!l1.isEmpty() || !l2.isEmpty()) problems.push('could not fill the input bus')
          }
          ctrl.getRecipeLogic().updateTickSubscription()
          m.phase = 'running'
        } else {
          m.phase = 'broken'
        }
        check(m.copy.key + '_PARTS', problems.length === 0, '[' + P.ids.join(' ') + ']' + (m.copy.machine === ARRAY ? ' dynamo capacity=' +
          global.grindless.generators.dynamoCapacity(ctrl) + ' EU/t lit panels=' + global.grindless.lunarPower.array.litPanels(ctrl) : '') +
          (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      })
    })
  }

  // every tick while the test runs: the arrays' EU (drained from the field's hatches, battery + hatch for the buffer copy), status,
  // parallels; the antenna's energy hatch kept full
  function measure(m) {
    var ctrl = machineAt(m.ctrlPos)
    if (!ctrl) return
    var rlg = ctrl.getRecipeLogic()
    var status = String(rlg.getStatus())
    m.statuses[status] = (m.statuses[status] || 0) + 1
    if (m.copy.machine === ANTENNA) {
      m.parts.energy.forEach(function (p) {
        var c = p.energyContainer
        c.setEnergyStored(c.getEnergyCapacity())
      })
      return
    }
    var last = rlg.getLastRecipe()
    var par = 0
    if (status === 'WORKING' && last !== null && last !== undefined) {
      par = Number(last.parallels)
      m.workTicks++
      if (par > m.maxPar) m.maxPar = par
    }
    var made = 0
    if (m.copy.key === 'field') {
      m.parts.dynamos.forEach(function (d) {
        var c = d.energyContainer
        var e = Number(c.getEnergyStored())
        if (e > 0) {
          made += e
          c.setEnergyStored(0)
        }
      })
    }
    m.eu += made
    m.lastTick = { status: status, par: par, made: made }
    if (S.phase === 'day' || S.phase === 'cover') {
      var key = par + '@' + made
      m.euTicks[key] = (m.euTicks[key] || 0) + 1
    }
    if (S.phase === 'cover' && S.t - S.phaseStart >= COVER_TICKS - COVER_WINDOW) {
      m.coverWindow = m.coverWindow || {}
      var k2 = par + '@' + made
      m.coverWindow[k2] = (m.coverWindow[k2] || 0) + 1
    }
    if (S.phase === 'night' && S.t - S.phaseStart >= NIGHT_GRACE) {
      if (m.copy.key === 'field') m.nightEu += made
      if (m.copy.key === 'buffer' && m.nightStartTotal === undefined) m.nightStartTotal = batteryCharge(m) - m.batteryStart + dynamoStored(m)
      m.nightStatuses = m.nightStatuses || {}
      m.nightStatuses[status] = (m.nightStatuses[status] || 0) + 1
    }
  }

  function histogram(h) {
    return Object.keys(h || {}).sort().map(function (k) { return k + ' x' + h[k] }).join(', ')
  }

  // ---- day: the buffer copy proves EU into a real battery buffer; the field copy runs all 36 panels
  function dayChecks() {
    var buf = copyOf('buffer')
    if (buf && buf.phase === 'running') {
      safely('eu_to_buffer', function () {
        var charge = batteryCharge(buf) - buf.batteryStart
        var inHatch = dynamoStored(buf)
        var total = charge + inHatch
        var want = 9 * 420
        var expected = want * buf.workTicks
        var ok = charge > 0 && buf.maxPar === 9 && buf.workTicks > 0 && Math.abs(total - expected) <= want
        buf.dayTotal = total
        check('eu_to_buffer', ok, 'batteries charged by ' + charge + ' EU, ' + inHatch + ' EU still in the hatch = ' + total + ' EU over ' + buf.workTicks +
          ' working ticks (expected ' + want + ' EU/t x ' + buf.workTicks + ' = ' + expected + '); parallels seen up to ' + buf.maxPar +
          ' (dynamo limit 4096 / 420 = 9); statuses ' + histogram(buf.statuses) + '; ' + recipeState(machineAt(buf.ctrlPos)))
        S.bufferAnswer = ok ? 'PASS' : 'FAIL'
      })
    }
    var field = copyOf('field')
    if (field && field.phase === 'running') {
      safely('field_day', function () {
        var full = field.euTicks['36@15120'] || 0
        var ok = field.maxPar === 36 && full >= Math.floor(DAY_TICKS / 2)
        check('field_day', ok, 'ticks by parallels@EU: ' + histogram(field.euTicks) + '; up to ' + field.maxPar + ' runs; ' + field.eu + ' EU made; ' +
          recipeState(machineAt(field.ctrlPos)))
      })
      safely('display', function () {
        var ctrl = machineAt(field.ctrlPos)
        var list = new (lazy().ArrayList)()
        ctrl.addDisplayText(list)
        var lines = asArray(list).map(function (c) { return String(c.getString()) })
        var capacity = lines.some(function (l) { return /grindless\.generators\.capacity|Dynamo hatches carry/.test(l) })
        var output = lines.some(function (l) { return /grindless\.generators\.output|Producing/.test(l) })
        var panels = lines.some(function (l) { return /lunar_solar_array\.panels|Panels under open sky/.test(l) })
        check('display', capacity && output && panels, 'capacity=' + capacity + ' output=' + output + ' panels=' + panels + ' (' + lines.length + ' lines)')
      })
    }
    var ant = copyOf('antenna')
    if (ant && ant.phase === 'running') {
      safely('antenna_day', function () {
        var inBus = readInv(ant.parts.inBus.getInventory())
        var outBus = readInv(ant.parts.outBus.getInventory())
        var ok = !outBus[CHART] && inBus[LANDING] === 1 && inBus[STICK] === 1 && !(ant.statuses.WORKING > 0)
        check('antenna_day', ok, 'by day: statuses ' + histogram(ant.statuses) + ' input bus [' + summary(inBus) + '] output bus [' + summary(outBus) + ']; ' +
          recipeState(machineAt(ant.ctrlPos)))
        ant.statuses = {}
      })
    }
  }

  // a stone block over one panel of the field (the first panel cell of the description: back row, one end)
  function coverOnePanel() {
    var field = copyOf('field')
    if (!field || field.phase !== 'running') return
    var cell = field.plan.cells.filter(function (c) { return c.ch === 'P' })[0]
    field.cover = { x: cell.x, y: cell.y + 1, z: cell.z }
    var ok = setBlock(field.cover.x, field.cover.y, field.cover.z, COVER, '') > 0
    note('COVER', 'placed ' + COVER + ' at ' + field.cover.x + ',' + field.cover.y + ',' + field.cover.z + ' over the panel at ' + cell.x + ',' + cell.y + ',' + cell.z +
      ' (' + ok + ')')
  }

  function coverChecks() {
    var field = copyOf('field')
    if (!field || field.phase !== 'running') return
    safely('field_covered', function () {
      var ctrl = machineAt(field.ctrlPos)
      var lit = global.grindless.lunarPower.array.litPanels(ctrl)
      var w = field.coverWindow || {}
      var good = w['35@14700'] || 0
      var bad = Object.keys(w).filter(function (k) { return k !== '35@14700' && k !== '0@0' })
      var ok = lit === 35 && good >= Math.floor(COVER_WINDOW * 0.8) && bad.length === 0
      check('field_covered', ok, 'lit panels now ' + lit + '; last ' + COVER_WINDOW + ' ticks by parallels@EU: ' + histogram(w) + '; ' + recipeState(ctrl))
    })
  }

  function nightChecks() {
    var buf = copyOf('buffer')
    var field = copyOf('field')
    if (buf && field && buf.phase === 'running' && field.phase === 'running') {
      safely('arrays_night', function () {
        var bufTotal = batteryCharge(buf) - buf.batteryStart + dynamoStored(buf)
        var bufNight = bufTotal - buf.nightStartTotal
        var working = (field.nightStatuses && field.nightStatuses.WORKING ? field.nightStatuses.WORKING : 0) +
          (buf.nightStatuses && buf.nightStatuses.WORKING ? buf.nightStatuses.WORKING : 0)
        var ok = field.nightEu === 0 && bufNight === 0 && working === 0
        check('arrays_night', ok, 'after the first ' + NIGHT_GRACE + ' ticks of night: field made ' + field.nightEu + ' EU (statuses ' + histogram(field.nightStatuses) +
          '), buffer copy ' + bufNight + ' EU (statuses ' + histogram(buf.nightStatuses) + '); ' + recipeState(machineAt(field.ctrlPos)))
      })
    }
    var ant = copyOf('antenna')
    if (ant && ant.phase === 'running') {
      safely('antenna_night', function () {
        var inBus = readInv(ant.parts.inBus.getInventory())
        var outBus = readInv(ant.parts.outBus.getInventory())
        var ok = outBus[CHART] === 1 && inBus[LANDING] === 1 && !inBus[STICK]
        check('antenna_night', ok, 'at night: statuses ' + histogram(ant.statuses) + ' input bus [' + summary(inBus) + '] output bus [' + summary(outBus) + ']; ' +
          recipeState(machineAt(ant.ctrlPos)))
      })
    }
  }

  // ---------------------------------------------------------------- driver

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      setClock(1000, 'the test is over: back to day')
      cmd('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    } catch (e) { /* best effort */ }
    if (S.bufferAnswer) note('ANSWER', 'custom generator recipe type (gtceu:lunar_solar): EU into a real battery buffer ' + S.bufferAnswer)
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick() {
    if (S === null || S.finished) return
    S.t = S.server.getTickCount() - S.tick0
    try {
      if (S.phase !== 'forming' && S.phase !== 'done') {
        S.copies.forEach(function (m) {
          if (m.phase === 'running') {
            try { measure(m) } catch (e) { check(m.copy.key + '_MEASURE', false, 'exception: ' + e); m.phase = 'broken' }
          }
        })
      }
      var since = S.t - S.phaseStart
      if (S.phase === 'forming') {
        if (S.t % 10 !== 0) return
        if (allFormed()) {
          setup()
          S.phase = 'day'
          S.phaseStart = S.t
        } else if (S.t - S.t0 > FORM_TIMEOUT) {
          formTimeout()
          S.phase = 'done'
        }
      } else if (S.phase === 'day' && since >= DAY_TICKS) {
        dayChecks()
        coverOnePanel()
        S.phase = 'cover'
        S.phaseStart = S.t
      } else if (S.phase === 'cover' && since >= COVER_TICKS) {
        coverChecks()
        var ant = copyOf('antenna')
        if (ant) ant.statuses = {}
        setClock(14000, 'the antenna observes at night; the arrays must stop')
        S.phase = 'night'
        S.phaseStart = S.t
      } else if (S.phase === 'night' && since >= NIGHT_TICKS) {
        nightChecks()
        S.phase = 'done'
      }
      if (S.phase === 'done') finish()
      else if (S.t > TEST_TIMEOUT) {
        check('timeout', false, 'still running after ' + S.t + ' ticks in phase ' + S.phase)
        finish()
      }
    } catch (e) {
      check('STEP', false, 'exception in ' + S.phase + ': ' + e)
      finish()
    }
  }

  function run(server) {
    S = { server: server, moon: server.getLevel(LUNA), t: 0, tick0: server.getTickCount(), t0: 0, phase: 'forming', phaseStart: 0, copies: [],
      finished: false, bufferAnswer: null }
    staticChecks()
    if (S.moon === null || S.moon === undefined) {
      check('moon_level', false, LUNA + ' is not loaded')
      S.phase = 'done'
      finish()
      return
    }
    safely('AREA', prepareWorld)
    startCopies()
    S.t0 = 0
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
      check('run', false, 'exception: ' + e)
      finish()
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_lunar_power', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_lunar_power run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
