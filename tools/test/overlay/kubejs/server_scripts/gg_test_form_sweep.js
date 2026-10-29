// priority: -1974
// TEST ONLY, QR-B1: the forming sweep. Proves every multiblock our startup scripts register forms from its own EMI preview.
// Commands: kubejs custom_command gg_test_form_sweep            what kubejs/config/gg_test_form_sweep.json selects (default: every id)
//           kubejs custom_command gg_test_form_sweep_all        every id
//           kubejs custom_command gg_test_form_sweep_<era>      one script folder: steam lv mv hv ev iv luv zpm uv uhv uev uiv launch_road moon observatory power
// Selection file (all keys optional): {"eras": ["uv", "uhv"], "ids": ["gtceu:refinery"], "from": 0, "limit": 40, "budgetTicks": 3200}
//   the ids come from kubejs/config/gg_test_form_sweep_ids.json (tools/analysis/form-sweep-ids.mjs --write); "ids" in the selection file wins over "eras".
//   "where" in the ids file maps an id that only forms elsewhere to {"dimension", "reason"}; the sweep then builds it there and prints a NOTE.
// Band ONLY: X 36064-36127, Z 0-127, Overworld Y 100-163 (zones.json "form_sweep"). One cell, one id at a time: the preview's first shape is
//   placed from the band's corner with the controller facing the shape gives it, GTM's pattern check runs, then the cell is cleared.
// Markers: GGTEST|form_sweep|<id>|PASS|<W x H x D>, <n> ticks[, forced]   (forced: the pattern needed our explicit check, it did not form by itself)
//          GGTEST|form_sweep|<id>|FAIL|<GTM's error> at <x,y,z> (dx,dy,dz from the controller) found <block> ...
//          GGTEST|form_sweep|<id>|NOTE|<why it is built elsewhere>
//          GGTEST|form_sweep|DONE|failures=<n> ids=<n> next=<cursor or none>   (next: pass it as "from" to resume after the tick budget)
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var NAME = 'form_sweep'
  var X0 = 36064
  var X1 = 36127
  var Z0 = 0
  var Z1 = 127
  var Y0 = 100
  var Y1 = 163
  var ORIGIN = { x: X0 + 2, y: Y0 + 1, z: Z0 + 2 }
  var CONFIG = 'kubejs/config/gg_test_form_sweep.json'
  var IDS = 'kubejs/config/gg_test_form_sweep_ids.json'
  var REQUEST = 'ggTestFormSweepRequest'
  var WARMUP = 40
  var DEFAULT_BUDGET = 3200
  var ERAS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'launch_road', 'moon', 'observatory', 'power']

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
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
  function command(dim, text) { return S.server.runCommandSilent('execute in ' + dim + ' run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= Z0 && z <= Z1 && y >= Y0 && y <= Y1 }
  function machineAt(level, p) { return classes().Meta.getMachine(level, p) }

  function why(m, level, ctrlPos) {
    try {
      var err = m.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var raw = String(err.getErrorInfo().getString())
      var names = []
      var re = /key='block\.([a-z0-9_]+)\.([a-z0-9_.]+)'/g
      var hit
      while ((hit = re.exec(raw)) !== null) { if (names.length < 8) names.push(hit[1] + ':' + hit[2]) }
      var text = ''
      try {
        var p = err.getPos()
        if (p) {
          var found = String(Block.getId(level.getBlockState(p).getBlock()))
          text += 'refused cell ' + (p.getX() - ctrlPos.getX()) + ',' + (p.getY() - ctrlPos.getY()) + ',' + (p.getZ() - ctrlPos.getZ()) +
            ' from the controller, holds ' + found + '; '
        }
      } catch (e1) {
        text += '(no position: ' + e1 + ') '
      }
      return text + 'GTM expected one of ' + (names.length ? names.join(' ') : raw.substring(0, 200))
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  // the first preview shape as cells: {x, y, z, state, id}, its W x H x D and the controller cell
  function readShape(id) {
    var def = classes().Registries.MACHINES.get(new (classes().RL)(id))
    if (def === null || def === undefined) return { error: 'no machine definition' }
    var shapes = array(def.getMatchingShapes())
    if (shapes.length === 0) return { error: 'no preview shape (getMatchingShapes is empty)' }
    var blocks = shapes[0].getBlocks()
    var cells = []
    var ctrl = null
    var w = blocks.length
    var h = 0
    var d = 0
    for (var x = 0; x < blocks.length; x++) {
      h = Math.max(h, blocks[x].length)
      for (var y = 0; y < blocks[x].length; y++) {
        d = Math.max(d, blocks[x][y].length)
        for (var z = 0; z < blocks[x][y].length; z++) {
          var info = blocks[x][y][z]
          if (info === null || info === undefined) continue
          var state = info.getBlockState()
          var bid = String(Block.getId(state.getBlock()))
          if (bid === 'minecraft:air') continue
          var cell = { x: x, y: y, z: z, state: state, id: bid }
          if (bid === id) ctrl = cell
          cells.push(cell)
        }
      }
    }
    if (ctrl === null) return { error: 'the preview has no controller block' }
    return { cells: cells, ctrl: ctrl, w: w, h: h, d: d, shapes: shapes.length }
  }

  function clearCell(level, dim) {
    var x1 = Math.min(X1, ORIGIN.x + S.maxW + 1)
    var z1 = Math.min(Z1, ORIGIN.z + S.maxD + 1)
    var y1 = Math.min(Y1, ORIGIN.y + S.maxH + 1)
    for (var y = Y0; y <= y1; y++) command(dim, 'fill ' + X0 + ' ' + y + ' ' + Z0 + ' ' + x1 + ' ' + y + ' ' + z1 + ' minecraft:air')
    S.maxW = 0
    S.maxH = 0
    S.maxD = 0
  }

  // places the shape; returns the controller position or null (a FAIL was printed)
  function place(u, shape) {
    var fits = ORIGIN.x + shape.w - 1 <= X1 && ORIGIN.z + shape.d - 1 <= Z1 && ORIGIN.y + shape.h - 1 <= Y1
    if (!fits) {
      check(u.id, false, 'the preview ' + shape.w + ' x ' + shape.h + ' x ' + shape.d + ' does not fit the cell (' + (X1 - ORIGIN.x + 1) + ' x ' + (Y1 - ORIGIN.y + 1) + ' x ' + (Z1 - ORIGIN.z + 1) + ')')
      return null
    }
    S.maxW = Math.max(S.maxW, shape.w)
    S.maxH = Math.max(S.maxH, shape.h)
    S.maxD = Math.max(S.maxD, shape.d)
    var ctrlPos = null
    shape.cells.forEach(function (c) {
      var p = pos(ORIGIN.x + c.x, ORIGIN.y + c.y, ORIGIN.z + c.z)
      if (c === shape.ctrl) { ctrlPos = p; return }
      u.level.setBlock(p, c.state, 18)
    })
    u.level.setBlock(ctrlPos, shape.ctrl.state, 3)
    return ctrlPos
  }

  function plain(v) {
    if (v === null || v === undefined) return null
    var t = typeof v
    if (t === 'string' || t === 'number' || t === 'boolean') return v
    if (typeof v.entrySet === 'function') {
      var o = {}
      var it = v.entrySet().iterator()
      while (it.hasNext()) { var en = it.next(); o[String(en.getKey())] = plain(en.getValue()) }
      return o
    }
    if (typeof v.iterator === 'function') {
      var a = []
      var li = v.iterator()
      while (li.hasNext()) a.push(plain(li.next()))
      return a
    }
    return String(v)
  }
  function readJson(path) {
    return plain(JsonIO.read(path))
  }
  function strings(list) {
    var out = []
    if (list === null || list === undefined) return out
    for (var i = 0; i < list.length; i++) out.push(String(list[i]))
    return out
  }
  function number(v, fallback) {
    var n = Number(v)
    return isNaN(n) ? fallback : n
  }

  // the selected ids, in the ids file's order: {ids: [...], error: text or null, budget, from}
  function select(request) {
    var table = readJson(IDS)
    if (table === null || !table.eras) return { ids: [], error: 'cannot read ' + IDS }
    var cfg = readJson(CONFIG) || {}
    var eras = request.eras !== null ? request.eras : strings(cfg.eras)
    var wanted = request.eras !== null ? [] : strings(cfg.ids)
    var ids = []
    Object.keys(table.eras).forEach(function (era) {
      if (wanted.length === 0 && eras.length > 0 && eras.indexOf(era) < 0) return
      strings(table.eras[era]).forEach(function (id) {
        if (wanted.length === 0 || wanted.indexOf(id) >= 0) ids.push({ id: id, era: era })
      })
    })
    var missing = wanted.filter(function (id) { return !ids.some(function (u) { return u.id === id }) })
    var from = request.eras !== null ? 0 : number(cfg.from, 0)
    var limit = request.eras !== null ? ids.length : number(cfg.limit, ids.length)
    return {
      ids: ids.slice(from, from + limit), total: ids.length, from: from, end: Math.min(ids.length, from + limit),
      where: table.where || {}, missing: missing, budget: number(cfg.budgetTicks, DEFAULT_BUDGET), error: null
    }
  }

  function levelOf(dim) { return S.server.getLevel(dim) }

  function begin(server, request) {
    S = { server: server, tick: 0, failed: 0, done: 0, finished: false, queue: [], cur: null, phase: 'warmup', dims: ['minecraft:overworld'], maxW: 200, maxH: 200, maxD: 200 }
    var sel = select(request)
    if (sel.error !== null) {
      check('selection', false, sel.error)
      S.finished = true
      console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed + ' ids=0 next=none')
      return
    }
    S.sel = sel
    S.queue = sel.ids.slice()
    sel.missing.forEach(function (id) { check(id, false, 'not in ' + IDS + ' (not one of our registered multiblocks)') })
    note('selection', sel.ids.length + ' ids (' + sel.from + '..' + sel.end + ' of ' + sel.total + '), budget ' + sel.budget + ' ticks')
    var dims = { 'minecraft:overworld': true }
    sel.ids.forEach(function (u) { if (sel.where[u.id] && sel.where[u.id].dimension) dims[String(sel.where[u.id].dimension)] = true })
    S.dims = Object.keys(dims)
    S.dims.forEach(function (dim) { command(dim, 'forceload add ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1) })
  }

  function finish(next) {
    if (S.finished) return
    S.finished = true
    S.dims.forEach(function (dim) {
      try { clearCell(levelOf(dim), dim) } catch (e) { }
      command(dim, 'forceload remove ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1)
    })
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed + ' ids=' + S.done + ' next=' + (next === null ? 'none' : next))
  }

  function step() {
    S.tick++
    if (S.phase === 'warmup') {
      if (S.tick >= WARMUP) S.phase = 'next'
      return
    }
    if (S.phase === 'next') {
      if (S.queue.length === 0) { finish(null); return }
      if (S.tick > S.sel.budget) { finish(S.sel.end - S.queue.length); return }
      var u = S.queue.shift()
      var spec = S.sel.where[u.id]
      var dim = spec && spec.dimension ? String(spec.dimension) : 'minecraft:overworld'
      if (spec) note(u.id, 'built in ' + dim + ': ' + (spec.reason || 'forms only there'))
      var cur = { id: u.id, era: u.era, dim: dim, level: levelOf(dim), at: S.tick }
      S.done++
      S.cur = cur
      try {
        clearCell(cur.level, dim)
        var shape = readShape(u.id)
        if (shape.error) { check(u.id, false, shape.error); S.cur = null; return }
        cur.shape = shape
        cur.ctrl = place(cur, shape)
        if (cur.ctrl === null) { S.cur = null; return }
        S.phase = 'check'
        S.tick--
        step()
      } catch (e) {
        check(u.id, false, 'exception while placing: ' + errText(e))
        S.cur = null
      }
      return
    }
    // checked in the placing tick, before falling blocks (regolith, sand) settle or doors pop: formed by itself, or by our explicit check
    var c = S.cur
    var waited = S.tick - c.at
    var m = machineAt(c.level, c.ctrl)
    var size = c.shape.w + 'x' + c.shape.h + 'x' + c.shape.d
    if (!m) {
      check(c.id, false, 'no machine at the controller block ' + c.ctrl.getX() + ',' + c.ctrl.getY() + ',' + c.ctrl.getZ() + ' (' + size + ')')
    } else if (m.isFormed()) {
      check(c.id, true, size + ', ' + waited + ' ticks')
    } else {
      var forced = false
      try {
        if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed(); forced = m.isFormed() }
      } catch (e) {
        check(c.id, false, size + ', explicit check threw: ' + errText(e))
        S.cur = null
        S.phase = 'next'
        return
      }
      if (forced) check(c.id, true, size + ', ' + waited + ' ticks, forced')
      else check(c.id, false, size + ', ' + why(m, c.level, c.ctrl))
    }
    S.cur = null
    S.phase = 'next'
  }

  function request(eras) {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = { eras: eras }
    return 1
  }
  ServerEvents.customCommand('gg_test_form_sweep', function () { return request(null) })
  ServerEvents.customCommand('gg_test_form_sweep_all', function () { return request([]) })
  ERAS.forEach(function (era) {
    ServerEvents.customCommand('gg_test_form_sweep_' + era, function () { return request([era]) })
  })
  ServerEvents.tick(function (event) {
    try {
      var req = global[REQUEST]
      if (req && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        begin(event.server, req)
      }
      if (S === null || S.finished) return
      step()
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, done: 0, finished: false, dims: ['minecraft:overworld'], maxW: 0, maxH: 0, maxD: 0 }
      check('exception', false, errText(e))
      finish(null)
    }
  })
})()
