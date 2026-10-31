// priority: -5697
﻿// TEST ONLY, MEGA-3 (gtceu:coil_chemical_plant). Command: kubejs custom_command gg_test_mega_coil_chemical_plant
// Band ONLY: X 31232-31295, Z 0-63, Overworld Y 98-115.
//   T1 of docs/eras/mega.md 6.4: on ONE real gtceu:large_chemical_reactor recipe (chosen from the live recipe manager: items only, no
//   circuit, no chance, 16-64 EU/t, 100-800 ticks), perfect overclock + coil discount + parallels together, batch off for an exact figure
//   (batch is the 4th modifier, proven by S-M1 and MEGA-0; the node test asserts it follows the overclock).
//     registration  the machine is registered on gtceu:large_chemical_reactor only
//     lookup        the recipe manager holds recipes under that type; the controller recipe exists with its machines
//     formed        two real plants (Cupronickel and Kanthal coil rings, one EV hatch, HV buses and hatches) form; coil temperature read
//     parallels     per plant, expected = coil ceiling (2^floor(K/900), cap 64), cut by floor(V/EUt) and the inputs; EU/t = recipe EU/t x
//                   parallels x 0.95^steps, then perfect overclocks on the voltage left (x4 EU/t, / 4 duration): copies, EU/t, duration
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 31232
  var X1 = 31295
  var Y0 = 98
  var Y1 = 115
  var NAME = 'mega_coil_chemical_plant'
  var ID = 'gtceu:coil_chemical_plant'
  var TYPE = 'gtceu:large_chemical_reactor'
  var CAP = 64
  var HATCH_VOLTAGE = 2048
  var VA = [8, 32, 128, 512, 2048, 8192, 32768, 131072, 524288]
  // unit: coil block, kelvin, discount multiplier, where it stands
  var PLANTS = [
    { name: 'cupro', coil: 'gtceu:cupronickel_coil_block', kelvin: 1800, mult: 1, x: 31250 },
    { name: 'kanthal', coil: 'gtceu:kanthal_coil_block', kelvin: 2700, mult: 0.95, x: 31272 }
  ]

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
  function empty(p) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
  }
  // one item type per slot, in order
  function stock(p, list) {
    empty(p)
    var st = p.getInventory().storage
    list.forEach(function (e, i) { st.setStackInSlot(i, Item.of(e.id, e.count)) })
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

  // entries of one side: { items: [{id, count, chance}], fluids: [...], chanceless: how many have a chance of 0 (a circuit or a mold) }
  function side(rec, out) {
    var K = classes()
    var res = { items: [], fluids: 0, zero: 0, partial: 0 }
    function entries(cap) {
      var map = out ? rec.outputs : rec.inputs
      var l = map.get(cap)
      return l === null || l === undefined ? [] : array(l)
    }
    entries(K.ItemCap).forEach(function (c) {
      var max = Number(c.maxChance)
      var chance = Number(c.chance)
      if (chance <= 0) { res.zero++; return }
      if (max > 0 && chance < max) res.partial++
      var ing = K.ItemCap.of(c.content)
      var amount = ing.getAmount !== undefined ? Number(ing.getAmount()) : 1
      res.items.push({ id: String(ing.getItemIds()[0]), count: amount })
    })
    res.fluids = entries(K.FluidCap).length
    return res
  }
  function eutOf(rec) {
    var eu = rec.getInputEUt()
    return Number(eu.voltage()) * Number(eu.amperage())
  }

  // the first live large chemical reactor recipe that is simple enough to stock by hand, in id order
  function pickRecipe() {
    var rm = S.server.getRecipeManager()
    var all = []
    var total = 0
    array(rm.getRecipes()).forEach(function (r) {
      if (String(r.getType()).indexOf('large_chemical_reactor') < 0) return
      total++
      all.push(r)
    })
    all.sort(function (a, b) { return String(a.getId()) < String(b.getId()) ? -1 : 1 })
    for (var i = 0; i < all.length; i++) {
      var r = all[i]
      try {
        var eut = eutOf(r)
        var dur = Number(r.duration)
        if (eut < 16 || eut > 64 || dur < 100 || dur > 800) continue
        var ins = side(r, false)
        var outs = side(r, true)
        if (ins.fluids > 0 || outs.fluids > 0 || ins.zero > 0 || outs.zero > 0 || outs.partial > 0 || ins.partial > 0) continue
        if (ins.items.length < 1 || ins.items.length > 2 || outs.items.length < 1 || outs.items.length > 2) continue
        var big = false
        ins.items.concat(outs.items).forEach(function (e) { if (e.count > 6) big = true })
        if (big) continue
        return { rec: r, id: String(r.getId()), eut: eut, dur: dur, ins: ins.items, outs: outs.items, total: total }
      } catch (e) { }
    }
    return { rec: null, total: total }
  }

  function registrationChecks() {
    var K = classes()
    var def = K.GTRegistries.MACHINES.get(new K.RL(ID))
    var types = []
    if (def) array(def.getRecipeTypes()).forEach(function (t) { types.push(String(t.registryName)) })
    check('registration', !!def && types.join(',') === TYPE, 'machine ' + ID + ' registered=' + !!def + ' types [' + types.join(',') + ']')
    S.pick = pickRecipe()
    check('lookup', S.pick.total > 0 && S.pick.rec !== null,
      'recipes under ' + TYPE + ': ' + S.pick.total + '; chosen real recipe ' + (S.pick.rec ? S.pick.id + ' (' + S.pick.eut + ' EU/t, ' + S.pick.dur + ' ticks, in ' +
        JSON.stringify(S.pick.ins) + ', out ' + JSON.stringify(S.pick.outs) + ')' : 'none found'))
    var rm = S.server.getRecipeManager()
    var made = []
    array(rm.getRecipes()).forEach(function (r) {
      var rid = String(r.getId())
      if (/[\/:]coil_chemical_plant$/.test(rid) && rid.indexOf('gg_test') < 0) made.push(r)
    })
    var cp = global.grindless.megaCoilChemicalPlant
    var okCraft = made.length > 0
    var got = ''
    if (okCraft) {
      var ins = side(made[0], false).items
      got = JSON.stringify(ins)
      var want = { 'gtceu:large_chemical_reactor': 2, 'gtceu:hv_chemical_reactor': 4, 'gtceu:kanthal_coil_block': 4 }
      Object.keys(want).forEach(function (id) {
        var hit = ins.filter(function (e) { return e.id === id })
        if (hit.length !== 1 || hit[0].count !== want[id]) okCraft = false
      })
    }
    check('crafting', !!cp && okCraft, 'controller recipe ids: ' + made.map(function (r) { return String(r.getId()) }).join(', ') + '; inputs ' + got)
  }

  // ---------------------------------------------------------------- the machine

  // front slice floor row: maintenance, energy hatch, input bus, output bus; the slice before it: input hatch, output hatch
  function placeMachine(u) {
    var id = ID
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
    var front = ['gtceu:maintenance_hatch', 'gtceu:ev_energy_input_hatch', 'gtceu:hv_input_bus', 'gtceu:hv_output_bus']
    var behind = ['gtceu:hv_input_hatch', 'gtceu:hv_output_hatch']
    var controller = null
    var count = 0
    cells.forEach(function (c) {
      c.x = u.x - (c.ci - ctrl.ci)
      c.y = 101 + (c.ri - ctrl.ri)
      c.z = 12 - (c.si - ctrl.si)
    })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var isPart = false
      if (sym.kind === 'controller') block = id
      else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'blocks') block = c.ch === 'K' ? u.coil : sym.blocks[0]
      else if (sym.kind === 'oneOf') {
        var wanted = null
        if (c.ri === 0 && c.si === last) wanted = front[c.ci]
        else if (c.ri === 0 && c.si === last - 1) wanted = behind[c.ci]
        if (wanted) { block = wanted; isPart = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      put(c.x, c.y, c.z, block + (isPart ? '[facing=north]' : ''))
      count++
    })
    put(controller.x, controller.y, controller.z, id + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), blocks: count + 1 }
  }

  // the figure the design promises for this coil, hatch and recipe (mirrors global.grindless.mega.formulas by hand)
  function expected(u) {
    var p = S.pick
    var ceiling = Math.min(Math.pow(2, Math.floor(u.kelvin / 900)), CAP)
    var energy = Math.floor(HATCH_VOLTAGE / p.eut)
    var inputs = Math.floor(Math.min.apply(null, p.ins.map(function (e) { return Math.min(64, e.count * 10) / e.count })))
    var par = Math.min(ceiling, energy, inputs)
    var total = p.eut * par * u.mult
    var tierOf = function (e) { for (var i = 0; i < VA.length; i++) if (VA[i] >= e) return i; return VA.length }
    var oc = Math.max(0, tierOf(HATCH_VOLTAGE) - tierOf(total))
    return { par: par, eut: total * Math.pow(4, oc), dur: Math.max(1, Math.floor(p.dur / Math.pow(4, oc))), oc: oc, ceiling: ceiling }
  }

  function build() {
    var out = []
    if (S.pick.rec === null) return out
    PLANTS.forEach(function (pl) {
      var u = { name: pl.name, coil: pl.coil, kelvin: pl.kelvin, mult: pl.mult, x: pl.x }
      try {
        u.want = expected(u)
        u.pos = placeMachine(u).pos
        u.phase = 'forming'
        u.started = S.tick
        out.push(u)
      } catch (e) { check(pl.name + '_place_exception', false, errText(e)) }
    })
    return out
  }

  function startRun(u, m) {
    m.setBatchEnabled(false)
    empty(u.outBus)
    stock(u.inBus, S.pick.ins.map(function (e) { return { id: e.id, count: Math.min(64, e.count * 10) } }))
    u.initial = items(u.inBus)
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
        if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.energy = partsLike(m, /energy_input_hatch/)
      u.inBus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var kelvin = global.grindless.coils.temperature(m)
      var maint = partsLike(m, /maintenance/).length
      check(u.name + '_formed', !!u.inBus && !!u.outBus && u.energy.length === 1 && maint === 1 && kelvin === u.kelvin,
        'class ' + m.getClass().getSimpleName() + ', type ' + m.getRecipeType().registryName + ', coil ' + kelvin + ' K (expected ' + u.kelvin + '), parts ' + partIds(m).join(' '))
      if (!u.inBus || !u.outBus || u.energy.length !== 1) { u.phase = 'done'; return }
      startRun(u, m)
      return
    }
    topUp(u.energy)
    if (u.phase === 'run') {
      var rlg = m.getRecipeLogic()
      var p = S.pick
      if (u.snap === null && rlg.isWorking()) {
        var sn = snapshot(m)
        if (sn !== null && sn.id === p.id) {
          u.snap = sn
          var now = items(u.inBus)
          u.consumed = {}
          p.ins.forEach(function (e) { u.consumed[e.id] = (u.initial[e.id] || 0) - (now[e.id] || 0) })
        }
      }
      var o = items(u.outBus)
      var got = o[p.outs[0].id] || 0
      if (got > 0 || S.tick - u.started > 900) {
        var s = u.snap
        var w = u.want
        note(u.name + '_measured', fmt(s) + '; consumed ' + JSON.stringify(u.consumed) + ', out ' + JSON.stringify(o) + '; max voltage ' + m.getMaxVoltage() + '; reasons ' + String(rlg.getFailureReasons()))
        var ok = s !== null && s.parallels === w.par && Math.abs(s.eut - w.eut) <= 6 && s.duration === w.dur && got === p.outs[0].count * w.par
        if (ok) p.ins.forEach(function (e) { if (u.consumed[e.id] !== e.count * w.par) ok = false })
        check(u.name + '_parallels', ok, p.id + ' at ' + u.kelvin + ' K (ceiling ' + w.ceiling + ', discount x' + u.mult + ', ' + w.oc + ' perfect overclocks), EV hatch: expected ' + w.par +
          ' copies, ' + w.eut + ' EU/t, ' + w.dur + ' ticks, out ' + p.outs[0].count * w.par + '; got ' + fmt(s) + ', out ' + got)
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
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)); S.pick = { rec: null } }
    try { S.units = build() } catch (e) { check('build_exception', false, errText(e)); S.units = [] }
  }
  ServerEvents.customCommand('gg_test_mega_coil_chemical_plant', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMegaCoilChemicalPlantRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMegaCoilChemicalPlantRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMegaCoilChemicalPlantRequest = false
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
