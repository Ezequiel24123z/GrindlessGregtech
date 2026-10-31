// priority: -5564
// TEST ONLY, MAX-A4 MAX parts (docs/eras/max.md, A4). Command: kubejs custom_command gg_test_max_parts
// Markers: GGTEST|max_parts|<check>|PASS/FAIL|..., then GGTEST|max_parts|DONE|failures=N.
// Band ONLY: X 39832-39895, Z 0-63, Overworld Y 98-115 (zones.json row max_parts).
// Doubt (max.md A4): a pair of gtceu:max_energy_input_hatch_16a forms on a shell-less test multiblock (gtceu:assembly_hall, from its own
//   preview shape) and the machine reads the MAX voltage from them.
//   lookup      the 27 part recipes (grindless:assembly_line/max_*), the bender and the four L39 rows on older machines are in the recipe manager
//   eut         every part recipe asks 2013265920 EU/t (VA[MAX]); the bender is below it
//   result      each part recipe's output is its gtceu:max_* machine (read from the recipe)
//   gcym_formed assembly_hall with two gtceu:max_energy_input_hatch_16a forms
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 39832
  var X1 = 39895
  var Y0 = 98
  var Y1 = 115
  var NAME = 'max_parts'
  var VA_MAX = 2013265920
  var GCYM = 'gtceu:assembly_hall'
  var HATCH = 'gtceu:max_energy_input_hatch_16a'
  var OLDER = ['fcl_tape', 'thick_film_fcl_tape', 'fcl_coil', 'cold_fcl_module', 'fcl_substrate_strip']

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Regs: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      EUCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.EURecipeCapability').CAP
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
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) {
    try {
      var er = m.getMultiblockState().error
      var info = ''
      try { info = ' | ' + String(er.getErrorInfo().getString()) + ' @ ' + String(er.getPos()) } catch (x) { }
      return String(er) + info
    } catch (e) { return 'unknown' }
  }
  function eutOf(r) {
    var raw = String(r.tickInputs.get(classes().EUCap).get(0).content)
    var vm = /voltage=(\d+), amperage=(\d+)/.exec(raw)
    return vm ? Number(vm[1]) * Number(vm[2]) : Number(raw)
  }

  function checkRecipes(server) {
    var rm = server.getRecipeManager()
    var RL = classes().RL
    var MP = global.grindless.maxParts
    check('static', !!MP && MP.skipped.length === 0 && MP.clashes.length === 0 && MP.recipes.length === 28,
      'recipes ' + (MP ? MP.recipes.length : null) + ', skipped ' + JSON.stringify(MP ? MP.skipped : null) + ', clashes ' + JSON.stringify(MP ? MP.clashes : null))
    var rows = MP ? MP.recipes.filter(function (r) { return !!r.machine }) : []
    var missing = []
    var bad = []
    var wrong = []
    rows.forEach(function (row) {
      var r = rm.byKey(new RL(row.recipeId))
      if (!r.isPresent()) { missing.push(row.recipeId); return }
      var eut = eutOf(r.get())
      if (eut !== VA_MAX) bad.push(row.name + ' ' + eut)
      var out = String(r.get().getResultItem(null).getItem())
      var made = String(r.get().outputs)
      if (out !== row.machine && made.indexOf(row.machine) < 0) wrong.push(row.name + ' -> ' + (out === 'minecraft:air' ? made.substring(0, 120) : out))
    })
    check('lookup', rows.length === 27 && missing.length === 0, rows.length + ' part ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    check('eut', bad.length === 0, 'parts off VA[MAX]: ' + (bad.length ? bad.join(', ') : 'none'))
    check('result', wrong.length === 0, 'parts whose output is not their machine: ' + (wrong.length ? wrong.join(', ') : 'none'))
    var bender = rm.byKey(new RL('grindless:bender/fcl_substrate_strip'))
    check('bender', bender.isPresent() && eutOf(bender.get()) < VA_MAX, 'bender row present ' + bender.isPresent())
    // the L39 rows on older machines: matched by the tail of the recipe id (any machine type prefix)
    var seen = {}
    array(rm.getRecipes()).forEach(function (r) {
      var id = String(r.id)
      OLDER.forEach(function (n) { if (id === 'grindless:' + n || id.indexOf('/' + n) === id.length - n.length - 1) seen[n] = id })
    })
    var gone = OLDER.filter(function (n) { return !seen[n] })
    check('lookup_older', gone.length === 0, 'L39 older rows found: ' + JSON.stringify(seen) + '; missing: ' + (gone.length ? gone.join(', ') : 'none'))
  }

  // GTM's own preview shape of the GCyM machine, placed block by block: two energy hatch cells become max 16 A hatches (the others go
  // back to casing; the parallel hatch cell takes a second one if needed), buses become HV ones
  function placeGcym(ox, oy, oz, want) {
    var def = classes().Regs.MACHINES.get(new (classes().RL)(GCYM))
    if (!def) throw new Error(GCYM + ' is not registered')
    var shapes = array(def.getMatchingShapes())
    if (shapes.length === 0) throw new Error('no preview shape for ' + GCYM)
    var grid = shapes[0].getBlocks()
    var cells = []
    var ctl = null
    var i, j, k
    for (i = 0; i < grid.length; i++) {
      for (j = 0; j < grid[i].length; j++) {
        for (k = 0; k < grid[i][j].length; k++) {
          if (grid[i][j][k]) cells.push({ x: i, y: j, z: k, state: grid[i][j][k].getBlockState() })
        }
      }
    }
    cells.forEach(function (c) { if (c.state.getBlock() === def.getBlock()) ctl = c })
    if (ctl === null) throw new Error('no controller in the preview shape')
    var parsed = []
    var census = {}
    cells.forEach(function (c) {
      var s = String(c.state)
      if (/Block\{minecraft:air\}/.test(s)) return
      var m = /Block\{([^}]+)\}(\[.*\])?/.exec(s)
      if (!m) return
      parsed.push({ x: c.x, y: c.y, z: c.z, id: m[1], props: m[2] || '' })
      census[m[1]] = (census[m[1]] || 0) + 1
    })
    var byCount = Object.keys(census).sort(function (a, b) { return census[b] - census[a] })
    var casing = byCount.filter(function (id) { return /casing/.test(id) })[0] || byCount[0]
    var energy = 0
    parsed.forEach(function (c) {
      if (!/energy_input_hatch/.test(c.id)) return
      if (energy < want) { c.id = HATCH; energy++ } else { c.id = casing; c.props = '' }
    })
    parsed.forEach(function (c) { if (energy < want && /parallel_hatch/.test(c.id)) { c.id = HATCH; energy++ } })
    if (energy < want) {
      var minX = Math.min.apply(null, parsed.map(function (c) { return c.x }))
      var side = parsed.filter(function (c) { return c.id === casing && c.x === minX && c.y === ctl.y })
      if (side.length > 0) { side[0].id = HATCH; side[0].props = ''; energy++ }
    }
    parsed.forEach(function (c) {
      if (/input_bus/.test(c.id)) c.id = 'gtceu:hv_input_bus'
      else if (/output_bus/.test(c.id)) c.id = 'gtceu:hv_output_bus'
    })
    var placed = 0
    var refused = []
    parsed.forEach(function (c) {
      var x = ox + c.x - ctl.x
      var y = oy + c.y - ctl.y
      var z = oz + c.z - ctl.z
      var ok = put(x, y, z, c.id + c.props)
      if (!ok && c.props !== '') ok = put(x, y, z, c.id)
      if (ok) placed++
      else refused.push(c.id + '@' + x + ',' + y + ',' + z)
    })
    return { pos: pos(ox, oy, oz), placed: placed, energy: energy, refused: refused }
  }

  function begin() {
    S.level = S.server.getLevel('minecraft:overworld')
    try { checkRecipes(S.server) } catch (e) { check('recipes_exception', false, errText(e)) }
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    command('fill ' + X0 + ' ' + Y0 + ' 0 ' + X1 + ' ' + Y1 + ' 63 minecraft:air')
    try {
      var g = placeGcym(39864, 100, 32, 2)
      note('gcym_placed', g.placed + ' blocks, ' + g.energy + ' max 16 A hatch cell(s); refused: ' + (g.refused.join(', ') || 'none'))
      S.main = { phase: 'forming', pos: g.pos }
    } catch (e) { check('gcym_build', false, errText(e)); S.main = null }
  }

  function tickMain(u) {
    var m = machine(u.pos)
    if (!m || !formCheck(m, S.tick)) {
      if (S.tick > 700) { check('gcym_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
      return
    }
    var energy = partsLike(m, /energy_input_hatch/)
    var ids = energy.map(function (p) { return String(p.getDefinition().getId()) })
    check('gcym_formed', energy.length === 2 && ids.every(function (h) { return h === HATCH }),
      GCYM + ' formed; energy hatches [' + ids.join(', ') + ']; max voltage ' + Number(m.getMaxVoltage()))
    u.phase = 'done'
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
  ServerEvents.customCommand('gg_test_max_parts', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMaxPartsRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMaxPartsRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMaxPartsRequest = false
        S = { server: event.server, tick: 0, failed: 0, finished: false, main: null }
        try { begin() } catch (e) { check('setup_exception', false, errText(e)); finish() }
        return
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.main && S.main.phase !== 'done') {
        try { tickMain(S.main) } catch (e) { check('main_exception', false, errText(e)); S.main.phase = 'done' }
      }
      if (!S.main || S.main.phase === 'done') finish()
      else if (S.tick > 3000) { check('deadline', false, '3000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
