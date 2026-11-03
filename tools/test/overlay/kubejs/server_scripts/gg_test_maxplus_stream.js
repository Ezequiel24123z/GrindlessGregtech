// priority: -5290
// TEST ONLY, XP-B2 (gtceu:primordial_fusion_torus). Command: kubejs custom_command gg_test_maxplus_stream
// Band ONLY: X 48128-48191, Z 0-63, Y 98-125, in grindless:magellanic_stream; zones.json row maxplus_stream.
//   T1 (named uncertainties):
//     torus   forms at the Stream on a bus, two input hatches, two output hatches and one MAX 16 A dynamo hatch and runs c1 with a 2^34 EU/t output
//     lookup  every recipe id of the package is in the recipe manager; static: nothing skipped
// The gas works and the older rows change only their data on mechanisms proven by their own packages, so they are looked up, not run.
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var NAME = 'maxplus_stream'
  var X0 = 48128
  var X1 = 48191
  var Y0 = 98
  var Y1 = 125
  var CY = 104
  var CZ = 10
  var CIRCUIT = 'gtceu:programmed_circuit'
  var DYNAMO = 'gtceu:max_energy_output_hatch_16a'
  var STREAM = 'grindless:magellanic_stream'
  var TORUS_X = 48160
  var TORUS = 'gtceu:primordial_fusion_torus'

  var IDS = [
    'pristine_gas_works/pristine_gas', 'primordial_fusion_torus/helium_4_ash',
    'assembly_line/pristine_gas_works', 'assembly_line/primordial_fusion_torus',
    'cryogenic_processing/liquid_pristine_hydrogen', 'distillation_tower/hd_fraction', 'calutron_separation/primordial_deuterium',
    'superfluid_helium/he3_enriched_helium', 'distillation_tower/crude_helium_3', 'calutron_separation/pristine_helium_3',
    'solvent_extraction/molybdenum_oxide', 'electric_blast_furnace/mo_powder', 'spark_plasma_sintering/mo_grid_billet', 'electron_beam_refining/refined_mo_grid',
    'assembler/direct_converter_stack', 'solvent_extraction/caesium_chloride', 'zone_refining/six_n_caesium', 'srf_cavity/rfq_cavity',
    'jet_beam_extraction/beam_neutraliser', 'assembler/neutral_beam_injector', 'pbo_synthesis/scoop_web', 'field_freezing/field_frozen_hoop',
    'mtj_sputtering/insulated_hoop', 'magnet_winding/scoop_coil', 'closed_loop_cooling/cold_scoop_coil', 'assembler/magnetic_scoop_module'
  ]

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
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
  function cmd(dim, text) { return S.server.runCommandSilent('execute in ' + dim + ' run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(dim, x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return cmd(dim, 'setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function machineAt(dim, p) { return classes().Meta.getMachine(S.server.getLevel(dim), pos(p.x, p.y, p.z)) }
  function partsLike(ctrl, re) {
    var out = []
    array(ctrl.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) out.push(p) })
    return out
  }
  function setBus(p, list) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    var slot = 0
    list.forEach(function (e) { st.setStackInSlot(slot++, e.length > 2 ? Item.of(e[0], e[1], e[2]) : Item.of(e[0], e[1])) })
  }
  function fill(hatch, id, mb) { hatch.tank.setFluidInTank(0, Fluid.of(id, mb).getFluidStack()) }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }
  function eutOf(rec) {
    try { var io = classes().RecipeHelper.getRealEUtWithIO(rec); return io.isEmpty() ? 0 : Number(io.getTotalEU()) } catch (e) { return NaN }
  }

  // the torus: the template walk; the 'X' oneOf cells take the parts, spread evenly over the sorted cells
  function placeTorus() {
    var desc = global.grindless.patterns.describe(TORUS)
    if (!desc) throw new Error('no structure description for ' + TORUS)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, sym: sym })
        }
      })
    })
    var controller = null
    var xs = []
    cells.forEach(function (c) {
      c.x = TORUS_X - (c.ci - ctrl.ci)
      c.y = CY + (c.ri - ctrl.ri)
      c.z = CZ - (c.si - ctrl.si)
      if (c.sym.kind === 'oneOf') xs.push(c)
    })
    xs.sort(function (a, b) { return a.z - b.z || a.x - b.x })
    var parts = ['gtceu:max_input_bus', 'gtceu:max_input_hatch', 'gtceu:max_input_hatch', 'gtceu:max_output_hatch', 'gtceu:max_output_hatch', DYNAMO]
    var chosen = {}
    var n = xs.length
    parts.forEach(function (id, i) { chosen[Math.floor(i * (n - 1) / (parts.length - 1))] = id })
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
      put(STREAM, c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(STREAM, controller.x, controller.y, controller.z, TORUS + '[facing=north]')
    return { x: controller.x, y: controller.y, z: controller.z }
  }

  function registrationChecks() {
    var rm = S.server.getRecipeManager()
    var missing = IDS.filter(function (i) { return !rm.byKey(new (classes().RL)('grindless:' + i)).isPresent() })
    check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    var MS = global.grindless.maxPlusStream
    check('static', !!MS && !!MS.skipped && MS.skipped.length === 0, 'rows ' + (MS ? MS.rows.length : null) + ', skipped ' + JSON.stringify(MS ? MS.skipped : null))
  }

  function tickTorus(u) {
    var waited = S.tick - u.started
    var m = machineAt(STREAM, u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 700) { check('torus_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.dynamo = partsLike(m, /max_energy_output_hatch_16a/)
      u.bus = partsLike(m, /:max_input_bus$/)[0]
      u.fin = partsLike(m, /:max_input_hatch$/)
      // anchored: a bare /output_hatch/ also matches the dynamo (max_energy_output_hatch_16a)
      var ok = !!u.bus && u.fin.length === 2 && partsLike(m, /:max_output_hatch$/).length === 2 && u.dynamo.length === 1
      check('torus_formed', ok, 'class ' + m.getClass().getSimpleName() + ', input hatches ' + u.fin.length + ', dynamo hatches ' + u.dynamo.length + ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      fill(u.fin[0], 'gtceu:primordial_deuterium', 4000)
      fill(u.fin[1], 'gtceu:pristine_helium_3', 4000)
      setBus(u.bus, [[CIRCUIT, 1, '{Configuration:1}'], ['grindless:neutral_beam_injector', 4], ['grindless:direct_converter_stack', 4]])
      u.last = m.getRecipeLogic().getLastRecipe()
      u.started = S.tick
      u.phase = 'run'
      return
    }
    var rlg = u.m.getRecipeLogic()
    if (u.phase === 'run') {
      var rec = rlg.getLastRecipe()
      if (rec !== null && rec !== undefined && rec !== u.last) {
        var eut = eutOf(rec)
        note('torus_measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut + ', max voltage ' + u.m.getMaxVoltage())
        check('torus_eut', Math.abs(eut) >= Math.pow(2, 34), 'expected 2^34 EU/t out, got ' + eut + '; reasons ' + reasons(u.m))
        u.phase = 'wait'
        u.started = S.tick
      } else if (waited > 300) {
        check('torus_eut', false, 'no recipe started in 300 ticks; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'wait') {
      var stored = Number(u.dynamo[0].energyContainer.getEnergyStored())
      if (u.peak === undefined || stored > u.peak) u.peak = stored
      if (u.peak > 0) {
        // GTM 7.5.3 reports a generator's EU/t as a positive amount with IO OUT, so the direction is read from the dynamo
        check('torus_generator', true, 'EU flowed out into the dynamo hatch: ' + u.peak + ' EU')
        u.phase = 'done'
      } else if (waited > 600) {
        check('torus_generator', false, 'the dynamo hatch stayed empty for 600 ticks; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
    }
  }

  function clear() {
    for (var z = 0; z < 64; z += 8) cmd(STREAM, 'fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { clear() } catch (e) { }
    cmd(STREAM, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, units: [] }
    if (!server.getLevel(STREAM)) throw new Error('no level ' + STREAM)
    cmd(STREAM, 'forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    try {
      S.units.push({ id: 'torus', tick: tickTorus, pos: placeTorus(), phase: 'forming', started: S.tick })
    } catch (e) { check('torus_build_exception', false, errText(e)) }
  }

  ServerEvents.customCommand('gg_test_maxplus_stream', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMaxplusStreamRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMaxplusStreamRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMaxplusStreamRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var open = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try { u.tick(u) } catch (e) { check(u.id + '_exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
        if (u.phase !== 'done') open++
      })
      if (open === 0) finish()
      else if (S.tick > 9000) { check('deadline', false, '9000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
