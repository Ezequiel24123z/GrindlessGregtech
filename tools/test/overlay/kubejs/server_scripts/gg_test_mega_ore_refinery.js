// priority: -5736
// TEST ONLY, MEGA-4 (gtceu:ore_refinery). Command: kubejs custom_command gg_test_mega_ore_refinery
// Band ONLY: X 33024-33087, Z 0-63, Overworld Y 98-115.
//   Checks (T1 of docs/eras/mega.md 6.4):
//     registration  the machine is registered on the recipe type gtceu:ore_refinery
//     lookup        a composed ore recipe (tin) and a probe recipe are found by the recipe manager under that type; the controller recipe exists
//     composed_tin  the composed recipe equals the sum of its four LIVE stage recipes (read from the recipe manager, not from the table): the
//                   contents of every item and fluid and the total EU (rule 7: never cheaper, by less than one tick of power)
//     formed        one real Ore Refinery (one EV energy hatch, input and output bus, input hatch, muffler on the roof) forms
//     parallels     one EV hatch (2048 V): a probe recipe at 128 EU/t, 200 ticks, batch off: ceiling 64, energy cap floor(2048/128) = 16
//                   -> 16 copies, 2048 EU/t, 200 ticks
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 33024
  var X1 = 33087
  var Y0 = 98
  var Y1 = 115
  var NAME = 'mega_ore_refinery'
  var ID = 'gtceu:ore_refinery'
  var TYPE = 'gtceu:ore_refinery'
  var POPPY = 'minecraft:poppy'
  var RED = 'minecraft:red_dye'
  var PROBE = 'gg_test_mega:or_probe'
  var PROBE_EUT = 128
  var HATCH_VOLTAGE = 2048
  var CEILING = 64
  // runs of every stage for one composed recipe: 1 raw ore -> 2 crushed -> 2 washes -> 2 refined -> 2 macerations
  var LINES = [
    { name: 'tin', stages: [
      ['gtceu:macerator/macerate_raw_tin_ore_to_crushed_ore', 1],
      ['gtceu:ore_washer/wash_tin_crushed_ore_to_purified_ore', 2],
      ['gtceu:thermal_centrifuge/centrifuge_tin_purified_ore_to_refined_ore', 2],
      ['gtceu:macerator/macerate_tin_refined_ore_to_dust', 2]
    ] }
  ]

  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.ore_refinery(PROBE).itemInputs('1x ' + POPPY).itemOutputs('1x ' + RED).duration(200).EUt(PROBE_EUT)
    } catch (e) {
      console.error('[gg_test mega_ore_refinery] could not add the probe recipe: ' + errText(e))
    }
  })

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
    }
    return C
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function errText(e) {
    var s = ''
    try { s = String(e.message || '') } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 4).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
  function command(text) { return S.server.runCommandSilent('execute in minecraft:overworld run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function machine(p) { return classes().Meta.getMachine(S.level, p) }
  function partsLike(ctrl, re) {
    var out = []
    array(ctrl.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) out.push(p) })
    return out
  }
  function partIds(ctrl) {
    var out = {}
    array(ctrl.getParts()).forEach(function (p) { out[String(p.getDefinition().getId())] = true })
    return Object.keys(out)
  }
  function items(p) {
    var st = p.getInventory().storage
    var t = {}
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (s.isEmpty()) continue
      var id = String(classes().Registries.ITEMS.getKey(s.getItem()))
      t[id] = (t[id] || 0) + Number(s.getCount())
    }
    return t
  }
  function fill(p, id, total) {
    var st = p.getInventory().storage
    var left = total
    for (var i = 0; i < st.getSlots(); i++) {
      var n = Math.min(64, left)
      st.setStackInSlot(i, n > 0 ? Item.of(id, n) : Item.of('minecraft:air'))
      left -= n
    }
    return left
  }
  function empty(p) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
  }
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }
  function field(o, name) {
    try {
      var v = o[name]
      if (v !== undefined && v !== null && typeof v !== 'function') return Number(v)
      var g = o['get' + name.charAt(0).toUpperCase() + name.substring(1)]
      if (typeof g === 'function') return Number(g.call(o))
    } catch (e) { }
    return NaN
  }
  function snapshot(m) {
    var rec = m.getRecipeLogic().getLastRecipe()
    if (rec === null || rec === undefined) return null
    var eut = NaN
    try { var es = classes().RecipeHelper.getRealEUt(rec); eut = Number(es.getTotalEU()) } catch (e) { }
    return { parallels: field(rec, 'parallels'), oc: field(rec, 'ocLevel'), duration: Number(rec.duration), eut: eut, id: String(rec.id) }
  }
  function fmt(s) {
    return s === null ? 'no recipe' : 'recipe ' + s.id + ' parallels ' + s.parallels + ' ocLevel ' + s.oc + ' duration ' + s.duration + ' EU/t ' + s.eut
  }

  // ---------------------------------------------------------------- contents of a live recipe

  // { 'i:<id>' | 'f:<id>': amount of one run (chance / maxChance of the content; a chance of 0 is the mold or the circuit and is left out) } for one side
  function side(rec, out) {
    var K = classes()
    var res = {}
    function entries(cap) {
      var map = out ? rec.outputs : rec.inputs
      var l = map.get(cap)
      return l === null || l === undefined ? [] : array(l)
    }
    function share(c) {
      var max = Number(c.maxChance)
      return max > 0 ? Number(c.chance) / max : 1
    }
    entries(K.ItemCap).forEach(function (c) {
      var s = share(c)
      if (s <= 0) return
      var ing = K.ItemCap.of(c.content)
      var amount = ing.getAmount !== undefined ? Number(ing.getAmount()) : 1
      var key = 'i:' + String(ing.getItemIds()[0])
      res[key] = (res[key] || 0) + amount * s
    })
    entries(K.FluidCap).forEach(function (c) {
      var s = share(c)
      if (s <= 0) return
      var fi = K.FluidCap.of(c.content)
      var fs = fi.getStacks()[0]
      var fid = String(K.Registries.FLUIDS.getKey(fs.getFluid()))
      var key = 'f:' + (fid === 'gtceu:water' ? 'minecraft:water' : fid)
      res[key] = (res[key] || 0) + Number(fi.getAmount()) * s
    })
    return res
  }
  // one run's net contents (outputs positive, inputs negative) and its total EU (EU/t x duration)
  function netOf(rec) {
    var net = {}
    var ins = side(rec, false)
    var outs = side(rec, true)
    Object.keys(ins).forEach(function (k) { net[k] = (net[k] || 0) - ins[k] })
    Object.keys(outs).forEach(function (k) { net[k] = (net[k] || 0) + outs[k] })
    var eu = rec.getInputEUt()
    var eut = Number(eu.voltage()) * Number(eu.amperage())
    return { net: net, eut: eut, duration: Number(rec.duration), energy: eut * Number(rec.duration) }
  }

  function composedCheck(line) {
    var rm = S.server.getRecipeManager()
    var composed = rm.byKey(new (classes().RL)('grindless:ore_refinery/' + line.name))
    if (!composed.isPresent()) { check('composed_' + line.name, false, 'recipe grindless:ore_refinery/' + line.name + ' is not loaded'); return }
    var expected = {}
    var energy = 0
    for (var i = 0; i < line.stages.length; i++) {
      var st = rm.byKey(new (classes().RL)(line.stages[i][0]))
      if (!st.isPresent()) { check('composed_' + line.name, false, 'live stage ' + line.stages[i][0] + ' is not loaded'); return }
      var n = netOf(st.get())
      Object.keys(n.net).forEach(function (k) { expected[k] = (expected[k] || 0) + n.net[k] * line.stages[i][1] })
      energy += n.energy * line.stages[i][1]
    }
    var got = netOf(composed.get())
    var bad = []
    var keys = {}
    Object.keys(expected).forEach(function (k) { keys[k] = true })
    Object.keys(got.net).forEach(function (k) { keys[k] = true })
    Object.keys(keys).forEach(function (k) {
      var e = expected[k] || 0
      var g = got.net[k] || 0
      // the intermediates cancel to 0 inside; whole items, fluids rounded to the millibucket
      if (Math.abs(e - g) > 0.5) bad.push(k + ' stages ' + e + ' vs composed ' + g)
    })
    var tick = got.duration
    var eutOk = got.eut > 0 && got.eut <= 512
    var energyOk = got.energy >= energy - 1e-6 && got.energy - energy < tick
    check('composed_' + line.name, bad.length === 0 && eutOk && energyOk,
      'contents ' + (bad.length === 0 ? 'equal the sum of ' + line.stages.length + ' live stages' : 'differ: ' + bad.join('; ')) +
      '; EU ' + got.energy + ' (' + got.eut + ' EU/t x ' + got.duration + ') vs stages ' + energy)
  }

  function registrationChecks() {
    var K = classes()
    var def = K.GTRegistries.MACHINES.get(new K.RL(ID))
    var types = []
    if (def) array(def.getRecipeTypes()).forEach(function (t) { types.push(String(t.registryName)) })
    check('registration', !!def && types.join(',') === TYPE, 'machine ' + ID + ' registered=' + !!def + ' types [' + types.join(',') + ']')
    var rm = S.server.getRecipeManager()
    var found = []
    var wrong = []
    var all = LINES.map(function (l) { return 'grindless:ore_refinery/' + l.name }).concat(['gg_test_mega:ore_refinery/or_probe'])
    all.forEach(function (id) {
      var r = rm.byKey(new K.RL(id))
      if (r.isPresent() && String(r.get().getType()).indexOf('ore_refinery') >= 0) found.push(id)
      else wrong.push(id + (r.isPresent() ? ' (' + r.get().getType() + ')' : ' (missing)'))
    })
    check('lookup', wrong.length === 0, 'found under ' + TYPE + ': ' + found.join(', ') + (wrong.length ? '; wrong: ' + wrong.join(', ') : ''))
    var made = []
    var composedCount = 0
    array(rm.getRecipes()).forEach(function (r) {
      var rid = String(r.getId())
      if (/\/ore_refinery$/.test(rid) && rid.indexOf('gg_test') < 0) made.push(rid)
      if (rid.indexOf('grindless:ore_refinery/') === 0) composedCount++
    })
    var pw = global.grindless.megaOreRefinery
    check('crafting', !!pw && made.length > 0, 'controller recipe ids: ' + made.join(', ') + '; published ' + (pw ? pw.crafting : 'nothing'))
    check('composed_count', !!pw && composedCount > 0 && composedCount === pw.recipes.length,
      composedCount + ' composed ore recipes loaded, ' + (pw ? pw.recipes.length : 'no') + ' published; skipped ' + JSON.stringify(pw ? pw.skipped.map(function (s) { return s.name }) : null))
    LINES.forEach(function (line) {
      try { composedCheck(line) } catch (e) { check('composed_' + line.name, false, 'exception: ' + errText(e)) }
    })
  }

  // ---------------------------------------------------------------- the machine

  // front slice floor row: energy hatch, input bus, output bus, input hatch; the muffler on the roof, facing up
  function placeMachine(id, cx, cy, cz, hatch) {
    var desc = global.grindless.patterns.describe(id)
    if (!desc) throw new Error('no structure description for ' + id)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, ch: ch, sym: sym })
        }
      })
    })
    var last = desc.slices.length - 1
    var front = [hatch, 'gtceu:ev_input_bus', 'gtceu:ev_output_bus', 'gtceu:ev_input_hatch']
    var MUFFLER = 'gtceu:ev_muffler_hatch'
    var controller = null
    var count = 0
    cells.forEach(function (c) {
      c.x = cx - (c.ci - ctrl.ci)
      c.y = cy + (c.ri - ctrl.ri)
      c.z = cz - (c.si - ctrl.si)
    })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var isPart = false
      if (sym.kind === 'controller') block = id
      else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'oneOf') {
        var wanted = null
        var facing = 'north'
        if (c.ri === 0 && c.si === last) wanted = front[c.ci]
        else if (c.ri === 6 && c.si === 4 && c.ci === 3) { wanted = MUFFLER; facing = 'up' }
        if (wanted) { block = wanted; isPart = true; c.facing = facing }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      put(c.x, c.y, c.z, block + (isPart ? '[facing=' + c.facing + ']' : ''))
      count++
    })
    put(controller.x, controller.y, controller.z, id + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), blocks: count + 1 }
  }

  function build() {
    var u = { name: 'ev', par: Math.min(CEILING, Math.floor(HATCH_VOLTAGE / PROBE_EUT)), eut: HATCH_VOLTAGE, dur: 200 }
    try {
      var placed = placeMachine(ID, 33056, 101, 20, 'gtceu:ev_energy_input_hatch')
      u.pos = placed.pos
      u.phase = 'forming'
      u.started = S.tick
      return [u]
    } catch (e) { check('place_exception', false, errText(e)) }
    return []
  }

  function startRun(u, m) {
    m.setBatchEnabled(false)
    empty(u.outBus)
    empty(u.inBus)
    fill(u.inBus, POPPY, 64)
    u.initial = items(u.inBus)[POPPY] || 0
    topUp(u.energy)
    m.getRecipeLogic().updateTickSubscription()
    u.phase = 'run'
    u.started = S.tick
    u.snap = null
  }

  function tick(u) {
    var m = machine(u.pos)
    var waited = S.tick - u.started
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check('formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.energy = partsLike(m, /energy_input_hatch/)
      u.inBus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var hatches = partsLike(m, /input_hatch/).filter(function (p) { return !/energy/.test(String(p.getDefinition().getId())) }).length
      var muffler = partsLike(m, /muffler/).length
      check('formed', !!u.inBus && !!u.outBus && u.energy.length === 1 && muffler === 1 && hatches === 1,
        'class ' + m.getClass().getSimpleName() + ', type ' + m.getRecipeType().registryName + ', parts ' + partIds(m).join(' '))
      if (!u.inBus || !u.outBus || u.energy.length !== 1) { u.phase = 'done'; return }
      startRun(u, m)
      return
    }
    topUp(u.energy)
    if (u.phase === 'run') {
      var rlg = m.getRecipeLogic()
      if (u.snap === null && rlg.isWorking()) {
        var sn = snapshot(m)
        if (sn !== null && sn.id.indexOf('or_probe') >= 0) {
          u.snap = sn
          u.consumed = u.initial - (items(u.inBus)[POPPY] || 0)
        }
      }
      var got = items(u.outBus)[RED] || 0
      if (got > 0 || S.tick - u.started > 600) {
        var s = u.snap
        note('measured', fmt(s) + '; consumed ' + u.consumed + ', out ' + got + '; max voltage ' + m.getMaxVoltage() + '; reasons ' + String(rlg.getFailureReasons()))
        var ok = s !== null && s.parallels === u.par && got === u.par && u.consumed === u.par && s.duration === u.dur && Math.abs(s.eut - u.eut) <= 1
        check('parallels', ok, 'one EV hatch (' + HATCH_VOLTAGE + ' V), probe ' + PROBE_EUT + ' EU/t: expected ' + u.par + ' copies at ' + u.eut + ' EU/t, ' +
          u.dur + ' ticks; got ' + fmt(s) + ', out ' + got + ', consumed ' + u.consumed)
        u.phase = 'done'
      }
    }
  }

  function clear() {
    for (var z = 0; z < 64; z += 8) command('fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { clear() } catch (e) { }
    command('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false }
    S.level = server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    try { S.units = build() } catch (e) { check('build_exception', false, errText(e)); S.units = [] }
  }
  ServerEvents.customCommand('gg_test_mega_ore_refinery', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMegaOreRefineryRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMegaOreRefineryRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMegaOreRefineryRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var pending = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try { tick(u) } catch (e) { check(u.name + '_exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
        if (u.phase !== 'done') pending++
      })
      if (pending === 0) finish()
      else if (S.tick > 2600) { check('deadline', false, '2600-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
