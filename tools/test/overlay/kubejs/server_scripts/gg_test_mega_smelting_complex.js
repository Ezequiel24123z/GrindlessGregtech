// TEST ONLY, MEGA-5 (gtceu:smelting_complex). Command: kubejs custom_command gg_test_mega_smelting_complex
// Band ONLY: X 33792-33855, Z 0-63, Overworld Y 98-115.
//   T1 of docs/eras/mega.md 6.4, on one real plant with Cupronickel coils (1800 K, parallel ceiling 4) and a LuV energy hatch:
//     registration  the machine is registered on gtceu:smelting_complex only
//     lookup        the recipe manager holds recipes under that type; the controller recipe takes 4 electric blast furnaces and 4 vacuum freezers
//     sum           the composed europium + helium line equals its two live stages (blast_europium_gas, cool_hot_europium_ingot): energy, net
//                   items, net fluids (the coolant in, the return gas out), ebf_temp, the circuit
//     formed        the plant forms; coil temperature read
//     rule_run      a composed recipe whose ebf_temp is at or below the coil's (plus 100 K per voltage tier above MV) runs, with the parallels
//                   the design promises: min(coil ceiling 4, floor(hatch voltage / recipe EU/t), inputs)
//     rule_refuse   a composed recipe whose ebf_temp is above the coil's does not run (GTM's EBF rule, inside the composed recipe)
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 33792
  var X1 = 33855
  var Y0 = 98
  var Y1 = 115
  var NAME = 'mega_smelting_complex'
  var ID = 'gtceu:smelting_complex'
  var TYPE = 'gtceu:smelting_complex'
  var CAP = 64
  var HATCH_VOLTAGE = 32768
  var COIL = 'gtceu:cupronickel_coil_block'
  var KELVIN = 1800
  var CENTER_X = 33820

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
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
  // one item type per slot, in order; a circuit as the last slot
  function stock(p, list, circuit) {
    empty(p)
    var st = p.getInventory().storage
    list.forEach(function (e, i) { st.setStackInSlot(i, Item.of(e.id, e.count)) })
    if (circuit > 0) st.setStackInSlot(list.length, Item.of('gtceu:programmed_circuit', '{Configuration:' + circuit + '}'))
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
    return { parallels: field(rec, 'parallels'), duration: Number(rec.duration), id: String(rec.id) }
  }

  // ---------------------------------------------------------------- contents of a live recipe

  function entries(rec, cap, out) {
    var map = out ? rec.outputs : rec.inputs
    var l = map.get(cap)
    return l === null || l === undefined ? [] : array(l)
  }
  // net items (output minus input, chance-0 entries and chanced outputs left out) and net fluids by id, plus how many chance-0 item inputs
  function netOf(rec) {
    var K = classes()
    var res = { items: {}, fluids: {}, zero: 0 }
    ;[false, true].forEach(function (out) {
      var sign = out ? 1 : -1
      entries(rec, K.ItemCap, out).forEach(function (c) {
        var chance = Number(c.chance)
        if (chance <= 0) { if (!out) res.zero++; return }
        if (out && Number(c.maxChance) > 0 && chance < Number(c.maxChance)) return
        var ing = K.ItemCap.of(c.content)
        var id = String(ing.getItemIds()[0])
        res.items[id] = (res.items[id] || 0) + sign * Number(ing.getAmount())
      })
      entries(rec, K.FluidCap, out).forEach(function (c) {
        var ing = K.FluidCap.of(c.content)
        var id = String(K.Registries.FLUIDS.getKey(array(ing.getStacks())[0].getFluid()))
        res.fluids[id] = (res.fluids[id] || 0) + sign * Number(ing.getAmount())
      })
    })
    return res
  }
  function eutOf(rec) {
    var eu = rec.getInputEUt()
    return Number(eu.voltage()) * Number(eu.amperage())
  }
  function temperatureOf(rec) {
    try { return Number(rec.data.getInt('ebf_temp')) } catch (e) { return NaN }
  }
  function sum(a, b) {
    var out = {}
    ;[a, b].forEach(function (m) { Object.keys(m).forEach(function (k) { out[k] = (out[k] || 0) + m[k] }) })
    Object.keys(out).forEach(function (k) { if (out[k] === 0) delete out[k] })
    return out
  }
  function same(a, b) { return JSON.stringify(Object.keys(a).sort().map(function (k) { return [k, a[k]] })) === JSON.stringify(Object.keys(b).sort().map(function (k) { return [k, b[k]] })) }
  function liveRecipes() {
    var all = []
    array(S.server.getRecipeManager().getRecipes()).forEach(function (r) { all.push(r) })
    return all
  }
  function byId(all, id) {
    for (var i = 0; i < all.length; i++) if (String(all[i].getId()) === id) return all[i]
    return null
  }

  function registrationChecks() {
    var K = classes()
    var def = K.GTRegistries.MACHINES.get(new K.RL(ID))
    var types = []
    if (def) array(def.getRecipeTypes()).forEach(function (t) { types.push(String(t.registryName)) })
    check('registration', !!def && types.join(',') === TYPE, 'machine ' + ID + ' registered=' + !!def + ' types [' + types.join(',') + ']')
    var all = liveRecipes()
    var mine = all.filter(function (r) { return String(r.getType()).indexOf('smelting_complex') >= 0 })
    var sc = global.grindless.megaSmeltingComplex
    check('lookup', mine.length > 0 && !!sc && sc.recipes.length === mine.length,
      'recipes under ' + TYPE + ': ' + mine.length + ' (composed at load: ' + (sc ? sc.recipes.length : 'n/a') + ', skipped ' + (sc ? sc.skipped.length : 'n/a') + ', clashes ' + (sc ? sc.clashes.length : 'n/a') + ')')
    var made = all.filter(function (r) { var rid = String(r.getId()); return /[\/:]smelting_complex$/.test(rid) && rid.indexOf('gg_test') < 0 })
    var okCraft = made.length > 0
    var got = ''
    if (okCraft) {
      var ins = []
      entries(made[0], K.ItemCap, false).forEach(function (c) {
        var ing = K.ItemCap.of(c.content)
        ins.push({ id: String(ing.getItemIds()[0]), count: Number(ing.getAmount()) })
      })
      got = JSON.stringify(ins)
      var want = { 'gtceu:electric_blast_furnace': 4, 'gtceu:vacuum_freezer': 4 }
      Object.keys(want).forEach(function (id) {
        var hit = ins.filter(function (e) { return e.id === id })
        if (hit.length !== 1 || hit[0].count !== want[id]) okCraft = false
      })
      if (ins.length !== 3) okCraft = false
    }
    check('crafting', okCraft, 'controller recipe ids: ' + made.map(function (r) { return String(r.getId()) }).join(', ') + '; inputs ' + got)

    // the composed europium + helium line against its two live stages
    var E = null
    var scr = sc ? sc.recipes : []
    for (var i = 0; i < scr.length; i++) if (scr[i].name === 'blast_europium_gas') E = scr[i]
    var composed = null
    mine.forEach(function (r) { if (/\/blast_europium_gas$/.test(String(r.getId()))) composed = r })
    var s1 = byId(all, 'gtceu:electric_blast_furnace/blast_europium_gas')
    var s2 = byId(all, 'gtceu:vacuum_freezer/cool_hot_europium_ingot')
    if (!composed || !s1 || !s2) {
      check('sum', false, 'missing recipe: composed ' + !!composed + ', stage 1 ' + !!s1 + ', stage 2 ' + !!s2)
      return
    }
    var n1 = netOf(s1)
    var n2 = netOf(s2)
    var nc = netOf(composed)
    var energy = eutOf(s1) * Number(s1.duration) + eutOf(s2) * Number(s2.duration)
    var cEnergy = eutOf(composed) * Number(composed.duration)
    var itemsOk = same(nc.items, sum(n1.items, n2.items))
    var fluidsOk = same(nc.fluids, sum(n1.fluids, n2.fluids))
    var energyOk = cEnergy >= energy - 1e-6 && cEnergy - energy < Number(composed.duration)
    var tempOk = temperatureOf(composed) === temperatureOf(s1) && temperatureOf(s1) > 0
    var circuitOk = nc.zero === n1.zero && n1.zero >= 1
    check('sum', itemsOk && fluidsOk && energyOk && tempOk && circuitOk,
      composed.getId() + ' = ' + s1.getId() + ' + ' + s2.getId() + ': energy ' + cEnergy + ' vs ' + energy + ' (' + energyOk + '), items ' + JSON.stringify(nc.items) + ' vs ' + JSON.stringify(sum(n1.items, n2.items)) +
      ' (' + itemsOk + '), fluids ' + JSON.stringify(nc.fluids) + ' vs ' + JSON.stringify(sum(n1.fluids, n2.fluids)) + ' (' + fluidsOk + '), ebf_temp ' + temperatureOf(composed) + '/' + temperatureOf(s1) +
      ', circuit entries ' + nc.zero + '/' + n1.zero + (E ? '; published ' + E.itemsOut.length + ' outputs' : ''))

    // the two recipes of the coil rule: one with a temperature the coil covers (1800 K + 400 K of a LuV hatch), one far above, both without fluids or a mold
    var plain = scr.filter(function (r) {
      return r.fluidsIn.length === 0 && r.fluidsOut.length === 0 && r.kept.length === 0 && r.itemsIn.length === 1 && r.itemsIn[0].count <= 4 &&
        r.itemsOut.filter(function (o) { return o.whole > 0 }).length === 1 && r.circuit > 0
    }).sort(function (a, b) { return a.name < b.name ? -1 : 1 })
    S.runRec = null
    S.refuseRec = null
    plain.forEach(function (r) {
      if (S.runRec === null && r.temp > 0 && r.temp <= 1900) S.runRec = r
      if (S.refuseRec === null && r.temp >= 3000) S.refuseRec = r
    })
    note('rule_picks', 'run ' + (S.runRec ? S.runRec.name + ' (' + S.runRec.temp + ' K, ' + S.runRec.eut + ' EU/t, ' + S.runRec.duration + ' ticks)' : 'none') +
      ', refuse ' + (S.refuseRec ? S.refuseRec.name + ' (' + S.refuseRec.temp + ' K)' : 'none') + ' of ' + plain.length + ' simple lines')
    check('rule_picks_found', S.runRec !== null && S.refuseRec !== null, 'a simple line at or below the coil and one above it')
  }

  // ---------------------------------------------------------------- the machine

  // front slice floor row: maintenance, muffler, energy hatch, input bus, output bus; every other cell its first plain block
  function placeMachine(x0) {
    var desc = global.grindless.patterns.describe(ID)
    if (!desc) throw new Error('no structure description for ' + ID)
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
    var front = ['gtceu:maintenance_hatch', 'gtceu:lv_muffler_hatch', 'gtceu:luv_energy_input_hatch', 'gtceu:hv_input_bus', 'gtceu:hv_output_bus']
    var controller = null
    var count = 0
    cells.forEach(function (c) {
      c.x = x0 - (c.ci - ctrl.ci)
      c.y = 98 + c.ri
      c.z = 12 - (c.si - ctrl.si)
    })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var isPart = false
      if (sym.kind === 'controller') block = ID
      else if (sym.kind === 'blocks') block = c.ch === 'K' ? COIL : sym.blocks[0]
      else if (sym.kind === 'oneOf') {
        var wanted = c.ri === 0 && c.si === last ? front[c.ci] : null
        if (wanted) { block = wanted; isPart = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      put(c.x, c.y, c.z, block + (isPart ? '[facing=north]' : ''))
      count++
    })
    put(controller.x, controller.y, controller.z, ID + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), blocks: count + 1 }
  }

  function startRun(u, m, rec) {
    m.setBatchEnabled(false)
    empty(u.outBus)
    stock(u.inBus, [{ id: rec.itemsIn[0].id, count: 64 }], rec.circuit)
    u.initial = items(u.inBus)
    topUp(u.energy)
    m.getRecipeLogic().updateTickSubscription()
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
      var kelvin = global.grindless.coils.temperature(m)
      check('formed', !!u.inBus && !!u.outBus && u.energy.length === 1 && kelvin === KELVIN && String(m.getRecipeType().registryName) === TYPE,
        'class ' + m.getClass().getSimpleName() + ', type ' + m.getRecipeType().registryName + ', coil ' + kelvin + ' K (expected ' + KELVIN + '), max voltage ' + m.getMaxVoltage() + ', parts ' + partIds(m).join(' '))
      if (!u.inBus || !u.outBus || u.energy.length !== 1 || S.runRec === null || S.refuseRec === null) { u.phase = 'done'; return }
      startRun(u, m, S.runRec)
      u.phase = 'run'
      return
    }
    topUp(u.energy)
    var rlg = m.getRecipeLogic()
    if (u.phase === 'run') {
      var r = S.runRec
      if (u.snap === null && rlg.isWorking()) {
        var sn = snapshot(m)
        if (sn !== null) {
          u.snap = sn
          var now = items(u.inBus)
          u.consumed = (u.initial[r.itemsIn[0].id] || 0) - (now[r.itemsIn[0].id] || 0)
        }
      }
      var o = items(u.outBus)
      var main = r.itemsOut.filter(function (x) { return x.whole > 0 })[0]
      var got = o[main.id] || 0
      if (got > 0 || waited > 900) {
        var s = u.snap
        var energy = Math.floor(HATCH_VOLTAGE / r.eut)
        var par = Math.min(Math.min(Math.pow(2, Math.floor(KELVIN / 900)), CAP), energy, Math.floor(64 / r.itemsIn[0].count))
        note('rule_run_measured', (s === null ? 'no recipe' : 'recipe ' + s.id + ' parallels ' + s.parallels + ' duration ' + s.duration) + '; consumed ' + u.consumed + ', out ' + JSON.stringify(o) +
          '; max voltage ' + m.getMaxVoltage() + '; reasons ' + String(rlg.getFailureReasons()))
        var ok = s !== null && s.parallels === par && got === main.whole * par && u.consumed === r.itemsIn[0].count * par
        check('rule_run', ok, r.name + ' (ebf_temp ' + r.temp + ' K <= ' + KELVIN + ' K + 400 K): expected ' + par + ' copies (coil ceiling 4, energy ' + energy + '), out ' + main.whole * par +
          ' ' + main.id + '; got ' + (s === null ? 'no recipe' : s.parallels + ' copies') + ', out ' + got)
        u.phase = 'between'
        u.started = S.tick
      }
      return
    }
    if (u.phase === 'between') {
      if (rlg.isWorking() && waited < 400) return
      startRun(u, m, S.refuseRec)
      u.phase = 'refuse'
      return
    }
    if (u.phase === 'refuse') {
      var r2 = S.refuseRec
      var main2 = r2.itemsOut.filter(function (x) { return x.whole > 0 })[0]
      var out2 = items(u.outBus)
      var ran = rlg.isWorking() || (out2[main2.id] || 0) > 0
      if (ran || waited > 300) {
        check('rule_refuse', !ran, r2.name + ' (ebf_temp ' + r2.temp + ' K > ' + KELVIN + ' K + 400 K) stocked for ' + waited + ' ticks: working=' + rlg.isWorking() + ', out ' + JSON.stringify(out2) + ', reasons ' + String(rlg.getFailureReasons()))
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
    S = { server: server, tick: 0, failed: 0, finished: false, units: [] }
    S.level = server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    try {
      var u = { phase: 'forming', started: 0 }
      u.pos = placeMachine(CENTER_X).pos
      S.units.push(u)
    } catch (e2) { check('build_exception', false, errText(e2)) }
  }
  ServerEvents.customCommand('gg_test_mega_smelting_complex', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMegaSmeltingComplexRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMegaSmeltingComplexRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMegaSmeltingComplexRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var pending = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try { tick(u) } catch (e) { check('exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
        if (u.phase !== 'done') pending++
      })
      if (pending === 0) finish()
      else if (S.tick > 3000) { check('deadline', false, '3000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
