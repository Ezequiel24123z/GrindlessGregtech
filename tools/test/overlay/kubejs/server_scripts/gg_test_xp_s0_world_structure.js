// priority: -10404
// TEST ONLY, XP-S0b spike S0-8 (docs/eras/maxplus.md S0 table). Command: kubejs custom_command gg_test_xp_s0_world_structure
// Band ONLY: X 44288-44351, Z 0-63, gg_test:s0_flat Y 0-48 (zones.json row xp_s0_world_structure). Never shipped.
//   Question: does a 45 x 45 x 9 multiblock with 64 substation hatches (gtceu:gg_s0_world_box, 18,225 pattern cells) form, and what does it cost the server?
//   Baseline: the real gtceu:mirror_shell 33-cube (the biggest shipped structure), built the same way in the same band right afterwards.
//   Per subject: build time, cold first pattern check, three warm re-checks, 200 formed idle ticks, then one hatch removed and put back (does it re-form on
//   its own, how fast, what do the tick gaps look like). Every measurement is a NOTE (the answer); PASS/FAIL only check the fixture itself.
(function () {
  var NAME = 'xp_s0_world_structure'
  var CMD = 'gg_test_xp_s0_world_structure'
  var DIM = 'gg_test:s0_flat'
  var QUEUE = 'ggXpS0Queue'
  var X0 = 44288
  var X1 = 44351
  var Y0 = 0
  var Y1 = 48
  var CX = 44320
  var CY = 20
  var CZ = 8
  var BOX = 'gtceu:gg_s0_world_box'
  var BOX_HATCH = 'gtceu:uxv_substation_input_hatch_64a'
  var SHELL = 'gtceu:mirror_shell'
  var SHELL_HATCH = 'gtceu:max_energy_input_hatch_16a'
  var DYNAMO = 'gtceu:max_energy_output_hatch_16a'
  var LOADED = Date.now()
  var S = null
  var C = null

  function classes() {
    if (C !== null) return C
    C = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
    }
    return C
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
  function cmd(text) { return S.server.runCommandSilent('execute in ' + DIM + ' run ' + text) }
  function ms() { return Date.now() }
  function r1(x) { return Math.round(x * 10) / 10 }
  function bp(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return cmd('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function machine(p) { return classes().Meta.getMachine(S.level, p) }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }
  function partsLike(m, re) {
    var n = 0
    array(m.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) n++ })
    return n
  }
  function serverMs() {
    try { return String(r1(Number(S.server.getAverageTickTime()))) } catch (e) { return 'n/a' }
  }

  function clearAll() {
    for (var z = CZ; z <= CZ + 44; z += 15) cmd('fill ' + (CX - 22) + ' ' + (CY - 16) + ' ' + z + ' ' + (CX + 22) + ' ' + (CY + 16) + ' ' + Math.min(z + 14, CZ + 44) + ' minecraft:air')
  }

  // 45 x 45 x 9 box: one hollow fill, then the 64 hatches on the floor row (8 x 8, spaced 5 apart) and the controller in the middle of the front face
  function buildBox() {
    cmd('fill ' + (CX - 22) + ' ' + (CY - 4) + ' ' + CZ + ' ' + (CX + 22) + ' ' + (CY + 4) + ' ' + (CZ + 44) + ' gtceu:solid_machine_casing hollow')
    var refused = 0
    var first = null
    for (var k = 0; k < 64; k++) {
      var x = CX - 20 + (k % 8) * 5
      var z = CZ + 5 + Math.floor(k / 8) * 5
      if (put(x, CY - 4, z, BOX_HATCH + '[facing=north]') < 1) refused++
      if (k === 0) first = { x: x, y: CY - 4, z: z }
    }
    if (put(CX, CY, CZ, BOX + '[facing=north]') < 1) refused++
    return { pos: bp(CX, CY, CZ), breakAt: first, breakBlock: BOX_HATCH + '[facing=north]', refused: refused }
  }

  // the template walk of gg_test_max_shell.js: the oneOf cells take the parts, spread evenly over the sorted cells
  function buildShell() {
    var parts = [SHELL_HATCH, SHELL_HATCH, DYNAMO, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus']
    var desc = global.grindless.patterns.describe(SHELL)
    if (!desc) throw new Error('no structure description for ' + SHELL)
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
    var controller = null
    var xs = []
    cells.forEach(function (c) {
      c.x = CX - (c.ci - ctrl.ci)
      c.y = CY + (c.ri - ctrl.ri)
      c.z = CZ - (c.si - ctrl.si)
      if (c.sym.kind === 'oneOf') xs.push(c)
    })
    xs.sort(function (a, b) { return a.y - b.y || a.x - b.x })
    var chosen = {}
    var n = xs.length
    parts.forEach(function (id, i) { chosen[Math.floor(i * (n - 1) / (parts.length - 1))] = id })
    var idx = {}
    xs.forEach(function (c, i) { idx[c.x + ',' + c.y + ',' + c.z] = i })
    var refused = 0
    var first = null
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
      if (put(c.x, c.y, c.z, block + (part ? '[facing=north]' : '')) < 1) refused++
      if (part && first === null && block === SHELL_HATCH) first = { x: c.x, y: c.y, z: c.z }
    })
    if (put(controller.x, controller.y, controller.z, SHELL + '[facing=north]') < 1) refused++
    return { pos: bp(controller.x, controller.y, controller.z), breakAt: first, breakBlock: SHELL_HATCH + '[facing=north]', refused: refused, cells: cells.length }
  }

  function gapNote(u) {
    var out = []
    Object.keys(S.gaps).forEach(function (label) {
      if (label.indexOf(u.name + '.') !== 0 && !(u.name === 'box' && label === 'baseline')) return
      var g = S.gaps[label]
      out.push(label + ' n=' + g.n + ' mean ' + r1(g.sum / g.n) + ' ms max ' + r1(g.max) + ' ms')
    })
    note(u.name + '.tick_gaps', out.join('; '))
  }

  function formNow(m) {
    var t0 = ms()
    var ok = m.checkPatternWithLock()
    var t1 = ms()
    if (ok) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    return { ok: ok, check: t1 - t0, total: ms() - t0 }
  }

  function step(u) {
    var waited = S.tick - u.started
    var m = null
    if (u.phase === 'build') {
      clearAll()
      var t0 = ms()
      var b = u.build()
      u.pos = b.pos
      u.breakAt = b.breakAt
      u.breakBlock = b.breakBlock
      note(u.name + '.build', 'placed in ' + r1(ms() - t0) + ' ms of main-thread commands; setblock calls refused ' + b.refused + (b.cells ? '; template cells ' + b.cells : ''))
      u.phase = 'settle'
      u.started = S.tick
      return
    }
    m = machine(u.pos)
    if (!m) {
      note(u.name + '.controller', 'inconclusive: no machine at the controller position')
      u.phase = 'done'
      return
    }
    if (u.phase === 'settle') {
      if (waited >= 20) { u.phase = 'cold'; u.started = S.tick; u.attempts = 0 }
      return
    }
    if (u.phase === 'cold') {
      if (waited < 0) return
      var f = formNow(m)
      u.attempts++
      note(u.name + '.cold_check', 'attempt ' + u.attempts + ': first checkPatternWithLock ' + r1(f.check) + ' ms (with onStructureFormed ' + r1(f.total) + ' ms), result ' + f.ok +
        ', formed ' + m.isFormed() + (m.isFormed() ? '' : ', error ' + why(m)))
      if (m.isFormed()) {
        note(u.name + '.formed', 'class ' + m.getClass().getSimpleName() + ', parts ' + array(m.getParts()).length + ', hatches of the family ' +
          partsLike(m, u.name === 'box' ? /substation_input_hatch_64a/ : /max_energy_input_hatch_16a/) + ', ability used ' + (global.ggXpS0BoxAbility || 'n/a'))
        u.phase = 'warm'
      } else if (u.attempts >= 4) {
        u.phase = 'done'
      } else u.started = S.tick + 20
      return
    }
    if (u.phase === 'warm') {
      var w = []
      for (var i = 0; i < 3; i++) { var t = ms(); m.checkPatternWithLock(); w.push(r1(ms() - t)) }
      note(u.name + '.warm_check', 'three repeated checkPatternWithLock calls on the formed controller: ' + w.join(', ') + ' ms; formed after ' + m.isFormed())
      u.phase = 'idle'
      u.started = S.tick
      return
    }
    if (u.phase === 'idle') {
      if (waited >= 200) {
        note(u.name + '.idle', '200 formed ticks; server average tick ' + serverMs() + ' ms; formed ' + m.isFormed())
        u.phase = 'break'
      }
      return
    }
    if (u.phase === 'break') {
      if (!u.breakAt) { note(u.name + '.break', 'inconclusive: no hatch cell recorded'); u.phase = 'done'; return }
      put(u.breakAt.x, u.breakAt.y, u.breakAt.z, 'minecraft:air')
      u.phase = 'broken'
      u.started = S.tick
      return
    }
    if (u.phase === 'broken') {
      if (waited >= 10) {
        note(u.name + '.break', 'one hatch removed; 10 ticks later formed ' + m.isFormed())
        put(u.breakAt.x, u.breakAt.y, u.breakAt.z, u.breakBlock)
        u.phase = 'refit'
        u.started = S.tick
        u.t0 = ms()
        u.manual = false
      }
      return
    }
    if (u.phase === 'refit') {
      if (m.isFormed()) {
        note(u.name + '.refit', 'formed again ' + waited + ' ticks (' + r1(ms() - u.t0) + ' ms wall) after the hatch was put back; manual re-check needed ' + u.manual)
        u.phase = 'done'
      } else if (waited >= 100 && waited % 50 === 0) {
        u.manual = true
        var g = formNow(m)
        note(u.name + '.refit_manual', 'manual checkPatternWithLock at tick ' + waited + ': ' + r1(g.check) + ' ms, result ' + g.ok)
      } else if (waited > 600) {
        note(u.name + '.refit', 'not formed 600 ticks after the hatch was put back; error ' + why(m))
        u.phase = 'done'
      }
    }
  }

  function finish() {
    if (S.finished) return
    S.finished = true
    try { clearAll() } catch (e) { }
    cmd('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    var q = global[QUEUE]
    if (q && q[0] === NAME) q.shift()
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, gaps: {}, last: 0, label: '', stage: 'wait', subjects: null, unit: null }
    S.level = server.getLevel(DIM)
    if (S.level === null || S.level === undefined) { check('dimension', false, DIM + ' is not loaded'); finish(); return }
    cmd('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
  }
  function ready() {
    for (var cx = X0 >> 4; cx <= X1 >> 4; cx++) for (var cz = 0; cz <= 3; cz++) if (!S.level.hasChunk(cx, cz)) return false
    return true
  }
  function gap() {
    var now = ms()
    if (S.last > 0 && S.label !== '') {
      var g = S.gaps[S.label] || (S.gaps[S.label] = { n: 0, sum: 0, max: 0 })
      var d = now - S.last
      g.n++
      g.sum += d
      if (d > g.max) g.max = d
    }
    S.last = now
  }

  ServerEvents.customCommand(CMD, function () {
    if (!global[QUEUE]) global[QUEUE] = []
    if (global[QUEUE].indexOf(NAME) >= 0) return 0
    global[QUEUE].push(NAME)
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      var q = global[QUEUE]
      if (S === null && q && q[0] === NAME && Date.now() - LOADED >= 10000) begin(event.server)
      if (S === null || S.finished) return
      S.tick++
      gap()
      if (S.stage === 'wait') {
        S.label = ''
        if (ready()) { S.stage = 'baseline'; S.started = S.tick }
        else if (S.tick > 600) { check('chunks', false, 'band chunks not loaded in 600 ticks'); finish() }
        return
      }
      if (S.stage === 'baseline') {
        S.label = 'baseline'
        if (S.tick - S.started >= 100) {
          note('baseline', 'empty band, 100 ticks; server average tick ' + serverMs() + ' ms')
          S.subjects = [
            { name: 'box', build: buildBox, phase: 'build', started: S.tick },
            { name: 'shell', build: buildShell, phase: 'build', started: S.tick }
          ]
          S.stage = 'run'
        }
        return
      }
      if (S.unit === null || S.unit.phase === 'done') {
        if (S.unit !== null) gapNote(S.unit)
        if (S.subjects.length === 0) { finish(); return }
        S.unit = S.subjects.shift()
        S.unit.started = S.tick
      }
      var u = S.unit
      S.label = u.name + '.' + u.phase
      try { step(u) } catch (e) { check('exception', false, u.name + ' phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
      if (S.tick > 5000) { check('deadline', false, '5000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
