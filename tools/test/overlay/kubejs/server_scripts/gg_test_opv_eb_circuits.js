// priority: -6188
// TEST ONLY, OpV-F3 (electron beam circuit space). Command: kubejs custom_command gg_test_opv_eb_circuits
// Band ONLY: X 37632-37695, Z 0-15, Overworld Y 98-112.
//   T1 (named uncertainty: GTM's lookup picks the right row when two electron beam recipes share a circuit and differ in one item;
//   the loader's subset-clash list stays empty for the shipped rows). The two probe rows are throwaway rows of this script only:
//     probe_a  clay ball + flint, circuit 31 -> poppy        probe_b  clay ball + snowball, circuit 31 -> allium
//     clashes  global.grindless.electronBeam.clashes is empty and the loader built its rows
//     lookup   both probe rows are in the recipe manager
//     formed   the electron beam furnace forms with an HV energy hatch, an input bus and an output bus
//     run_a    clay + flint + circuit 31 runs probe_a (poppy, no allium)
//     run_b    clay + snowball + circuit 31 runs probe_b (allium, no poppy)
//     shared   clay + circuit 31 alone runs nothing (neither row is a subset of the other)
//     wrong    clay + flint + circuit 30 runs nothing (the circuit is part of both rows)
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 37632
  var X1 = 37695
  var Z0 = 0
  var Z1 = 15
  var Y0 = 98
  var Y1 = 112
  var NAME = 'opv_eb_circuits'
  var ID = 'gtceu:electron_beam_furnace'
  var CX = 37664
  var CZ = 1
  var ENERGY = 'gtceu:hv_energy_input_hatch'
  var PARTS = [ENERGY, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus']
  var CIRCUIT = 'gtceu:programmed_circuit'
  var CIRCUIT_NO = 31
  var CLAY = 'minecraft:clay_ball'
  var PROBES = [
    { name: 'probe_a', items: [CLAY, 'minecraft:flint'], out: 'minecraft:poppy' },
    { name: 'probe_b', items: [CLAY, 'minecraft:snowball'], out: 'minecraft:allium' }
  ]
  var STEPS = [
    { name: 'run_a', inputs: [CLAY, 'minecraft:flint'], circuit: CIRCUIT_NO, want: 'minecraft:poppy', other: 'minecraft:allium', recipe: 'probe_a' },
    { name: 'run_b', inputs: [CLAY, 'minecraft:snowball'], circuit: CIRCUIT_NO, want: 'minecraft:allium', other: 'minecraft:poppy', recipe: 'probe_b' },
    { name: 'shared', inputs: [CLAY], circuit: CIRCUIT_NO, want: null },
    { name: 'wrong', inputs: [CLAY, 'minecraft:flint'], circuit: CIRCUIT_NO - 1, want: null }
  ]

  ServerEvents.recipes(function (event) {
    try {
      PROBES.forEach(function (p) {
        var b = event.recipes.gtceu.electron_beam_refining('gg_test_opv_eb_circuits:' + p.name)
        p.items.forEach(function (id) { b.itemInputs('1x ' + id) })
        b.circuit(CIRCUIT_NO)
        b.itemOutputs('1x ' + p.out)
        b.EUt(30).duration(40)
      })
    } catch (e) {
      console.error('[gg_test opv_eb_circuits] could not add the probe recipes: ' + errText(e))
    }
  })

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
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
  function command(text) { return S.server.runCommandSilent('execute in minecraft:overworld run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= Z0 && z <= Z1 && y >= Y0 && y <= Y1 }
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
  function itemId(s) { return String(classes().Registries.ITEMS.getKey(s.getItem())) }
  function count(p, id) {
    var st = p.getInventory().storage
    var n = 0
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (!s.isEmpty() && itemId(s) === id) n += Number(s.getCount())
    }
    return n
  }
  function slots(p) {
    var st = p.getInventory().storage
    var out = []
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (!s.isEmpty()) out.push(itemId(s) + 'x' + s.getCount())
    }
    return out.join(' ') || 'empty'
  }
  function setBus(p, list) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    var slot = 0
    list.forEach(function (e) { st.setStackInSlot(slot++, e.length > 2 ? Item.of(e[0], e[1], e[2]) : Item.of(e[0], e[1])) })
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
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }
  function lastId(m) {
    var r = m.getRecipeLogic().getLastRecipe()
    return r === null || r === undefined ? 'none' : String(r.id)
  }

  // the structure: the template walk; the oneOf floor cells take the parts, spread evenly over the sorted cells
  function place() {
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
    // the bottom row at Y0 + 2
    var cy = Y0 + 2 + ctrl.ri
    var controller = null
    var xs = []
    cells.forEach(function (c) {
      c.x = CX - (c.ci - ctrl.ci)
      c.y = cy + (c.ri - ctrl.ri)
      c.z = CZ - (c.si - ctrl.si)
      if (c.sym.kind === 'oneOf') xs.push(c)
    })
    xs.sort(function (a, b) { return a.z - b.z || a.x - b.x })
    var chosen = {}
    var n = xs.length
    PARTS.forEach(function (id, i) { chosen[Math.floor(i * (n - 1) / (PARTS.length - 1))] = id })
    var idx = {}
    xs.forEach(function (c, i) { idx[c.x + ',' + c.y + ',' + c.z] = i })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var part = false
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'oneOf') {
        var pid = chosen[idx[c.x + ',' + c.y + ',' + c.z]]
        if (pid) { block = pid; part = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, ID + '[facing=north]')
    return pos(controller.x, controller.y, controller.z)
  }

  function registrationChecks() {
    var EB = (global.grindless || {}).electronBeam
    var clashes = EB ? EB.clashes : null
    var built = EB && EB.recipes ? Number(EB.recipes.length) : 0
    var skipped = EB && EB.skipped ? Number(EB.skipped.length) : -1
    var none = clashes !== null && clashes !== undefined && Number(clashes.length) === 0
    check('clashes', none && built > 0, 'loader rows ' + built + ', skipped ' + skipped + ', clashes ' +
      (clashes === null || clashes === undefined ? 'unpublished' : Number(clashes.length) + (Number(clashes.length) > 0 ? ': ' + clashes.join('; ') : '')))
    var rm = S.server.getRecipeManager()
    var missing = PROBES.filter(function (p) {
      return !rm.byKey(new (classes().RL)('gg_test_opv_eb_circuits:electron_beam_refining/' + p.name)).isPresent()
    }).map(function (p) { return p.name })
    check('lookup', missing.length === 0, 'probe rows missing: ' + (missing.length ? missing.join(', ') : 'none'))
  }

  function startStep(u) {
    var step = STEPS[u.step]
    var list = step.inputs.map(function (id) { return [id, 1] })
    list.push([CIRCUIT, 1, '{Configuration:' + step.circuit + '}'])
    setBus(u.out, [])
    setBus(u.bus, list)
    try { u.m.getRecipeLogic().updateTickSubscription() } catch (e) { }
    u.started = S.tick
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check('formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = partsLike(m, /energy_input/)
      u.bus = partsLike(m, /input_bus/)[0]
      u.out = partsLike(m, /output_bus/)[0]
      var ok = !!u.bus && !!u.out && u.energy.length === 1
      check('formed', ok, 'class ' + m.getClass().getSimpleName() + ', energy hatches ' + u.energy.length + ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      topUp(u.energy)
      u.phase = 'steps'
      u.step = 0
      startStep(u)
      return
    }
    topUp(u.energy)
    var step = STEPS[u.step]
    var done = false
    if (step.want !== null) {
      var got = count(u.out, step.want)
      var wrong = count(u.out, step.other)
      if (got >= 1 || wrong >= 1) {
        var id = lastId(m)
        var used = step.inputs.filter(function (i) { return count(u.bus, i) !== 0 })
        check(step.name, got >= 1 && wrong === 0 && id === 'gg_test_opv_eb_circuits:electron_beam_refining/' + step.recipe && used.length === 0,
          'recipe ' + id + ', output ' + slots(u.out) + ', input bus ' + slots(u.bus))
        done = true
      } else if (waited > 300) {
        check(step.name, false, 'no output in 300 ticks; last recipe ' + lastId(m) + '; reasons ' + reasons(m) + '; input bus ' + slots(u.bus))
        done = true
      }
    } else if (waited >= 100) {
      var kept = step.inputs.every(function (i) { return count(u.bus, i) === 1 })
      check(step.name, slots(u.out) === 'empty' && kept && !m.getRecipeLogic().isWorking(),
        'after 100 ticks: output ' + slots(u.out) + ', input bus ' + slots(u.bus) + ', working ' + m.getRecipeLogic().isWorking())
      done = true
    }
    if (!done) return
    u.step++
    if (u.step >= STEPS.length) { u.phase = 'done'; return }
    startStep(u)
  }

  function clear() {
    for (var z = Z0; z <= Z1; z += 8) command('fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + Math.min(z + 7, Z1) + ' minecraft:air')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { clear() } catch (e) { }
    command('forceload remove ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1)
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false }
    S.level = server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1)
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    S.units = []
    var u = { phase: 'forming', started: S.tick }
    try {
      u.pos = place()
      S.units.push(u)
    } catch (e) { check('build_exception', false, errText(e)) }
  }
  ServerEvents.customCommand('gg_test_opv_eb_circuits', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestOpvEbCircuitsRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvEbCircuitsRequest && Date.now() - LOADED >= 10000) {
        global.ggTestOpvEbCircuitsRequest = false
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
