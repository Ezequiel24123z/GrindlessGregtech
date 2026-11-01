// priority: -5354
// TEST ONLY, XP-B1 (gtceu:nickel_56_burner and gate c16). Command: kubejs custom_command gg_test_maxplus_tarantula
// Band ONLY: X 46592-46655, Z 0-63, Y 98-125, in grindless:tarantula_orbit (the burner) and gcyr:black_hole_orbit (the gate); zones.json row maxplus_tarantula.
//   T1 (named uncertainties):
//     burner  forms at 30 Doradus on a MAX 16 A dynamo hatch (a generator: no energy input) and runs c1 (4,800 t) with a 2^34 EU/t output;
//             a co56 cask in the output bus; the dynamo is drained every tick, and the run skips to its end once output is seen
//     gate    c16 (hold_tarantula) runs at Sgr A* on one 1,024 A hatch at 2^37 EU/t for 1,200 t with the horizon lock kept; the probe is consumed;
//             the 30 Doradus platform appears (mark uxvPlatform_tarantula, warp gate controller at 64,100,64 of grindless:tarantula_orbit)
//     lookup  every recipe id of the package is in the recipe manager; static: nothing skipped
// The older rows change only their data on mechanisms proven by their own packages, so they are looked up, not run. The platform's chunks stay at
// 30 Doradus (the mark is removed at the end).
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var NAME = 'maxplus_tarantula'
  var X0 = 46592
  var X1 = 46655
  var Y0 = 98
  var Y1 = 125
  var CY = 104
  var CZ = 32
  var CIRCUIT = 'gtceu:programmed_circuit'
  var HATCH = 'gtceu:max_maxplus_energy_hatch_1024a'
  var DYNAMO = 'gtceu:max_energy_output_hatch_16a'
  var SGR = 'gcyr:black_hole_orbit'
  var LMC = 'grindless:tarantula_orbit'
  var GATE_ORIGIN = { x: 46624, y: 100, z: 44 }
  var BURNER_X = 46624
  var HOLD = 'grindless:warp_gate/hold_tarantula'
  var HOLD_EUT = 137438953472
  var HOLD_TICKS = 1200
  var MARK = 'uxvPlatform_tarantula'
  var PLATFORM = { x: 64, y: 100, z: 64 }
  var BURNER = 'gtceu:nickel_56_burner'

  var IDS = [
    'tarantula_stellar_lift/raw_vms_plasma', 'pair_instability_crucible/ni56_slug', 'nickel_56_burner/co56_cask', 'nickel_56_burner/spent_fe56_cask',
    'assembly_line/tarantula_stellar_lift', 'assembly_line/pair_instability_crucible', 'assembly_line/nickel_56_burner',
    'plasma_mass_filtering/vms_core_plasma', 'frc_forming/confined_vms_plasma', 'canner/canned_ni56', 'hot_cell/shielded_ni56_cask', 'hot_cell/spent_fe56_cask_iron',
    'solvent_extraction/ime_leach_fractions', 'electric_blast_furnace/recovered_silicon', 'zone_refining/electronic_grade_silicon',
    'single_crystal_casting/sx_turbine_blade', 'electron_beam_refining/tbc_coated_blade', 'spark_plasma_sintering/turbine_disc', 'hot_rolling/pche_recuperator_foil',
    'assembler/sco2_turbine_module', 'chemical_vapour_infiltration/sic_nozzle_former', 'coated_conductor/nozzle_tape', 'magnet_winding/nozzle_winding',
    'chemical_reactor/impregnated_nozzle', 'closed_loop_cooling/vms_lift_nozzle', 'chemical_vapour_infiltration/infiltrated_liner',
    'electron_beam_refining/sealed_liner', 'megabar_synthesis/densified_liner', 'lathe/crucible_liner', 'assembler/lift_nozzle_casing', 'assembler/crucible_liner_casing'
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
  function eutOf(rec) {
    try { var io = classes().RecipeHelper.getRealEUtWithIO(rec); return io.isEmpty() ? 0 : Number(io.getTotalEU()) } catch (e) { return NaN }
  }

  // the burner: the template walk; the 'X' oneOf cells take the parts, spread evenly over the sorted cells
  function placeBurner() {
    var desc = global.grindless.patterns.describe(BURNER)
    if (!desc) throw new Error('no structure description for ' + BURNER)
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
      c.x = BURNER_X - (c.ci - ctrl.ci)
      c.y = CY + (c.ri - ctrl.ri)
      c.z = CZ - (c.si - ctrl.si)
      if (c.sym.kind === 'oneOf') xs.push(c)
    })
    xs.sort(function (a, b) { return a.z - b.z || a.x - b.x })
    var parts = ['gtceu:max_input_bus', 'gtceu:max_output_bus', DYNAMO]
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
      put(LMC, c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(LMC, controller.x, controller.y, controller.z, BURNER + '[facing=north]')
    return { x: controller.x, y: controller.y, z: controller.z }
  }

  function plain(sym) {
    if (sym.kind === 'blocks') return String(sym.blocks[0])
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    for (var i = 0; i < (sym.options || []).length; i++) if (sym.options[i].kind === 'blocks') return String(sym.options[i].blocks[0])
    return null
  }
  function allows(sym, ability) {
    return sym.kind === 'oneOf' && sym.options.some(function (o) { return o.kind === 'part' && o.ability === ability })
  }
  // lib/patterns.js's description: slices back -> front, rows bottom -> top; the controller faces north; parts go on the front wall by ability
  function buildGate(origin, parts) {
    var desc = global.grindless.structures['gtceu:warp_gate']
    if (!desc) throw new Error('missing structures entry gtceu:warp_gate')
    var ctl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          if (sym && sym.kind === 'controller') ctl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    var plan = []
    var found = {}
    var next = 0
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          var p = { x: origin.x - (ci - ctl.ci), y: origin.y + ri - ctl.ri, z: origin.z - (si - ctl.si) }
          if (!sym || sym.kind === 'controller' || sym.kind === 'air' || sym.kind === 'any') continue
          var bid = null
          var facing = false
          if (si === ctl.si && next < parts.length && allows(sym, parts[next].ability)) {
            bid = parts[next].id
            found[parts[next].key] = p
            facing = true
            next++
          }
          var block = bid || plain(sym)
          if (block) plan.push({ p: p, id: block, facing: facing })
        }
      })
    })
    if (next < parts.length) throw new Error('front wall has no slot for ' + parts[next].ability)
    plan.forEach(function (c) { put(SGR, c.p.x, c.p.y, c.p.z, c.id + (c.facing ? '[facing=north]' : '')) })
    put(SGR, origin.x, origin.y, origin.z, 'gtceu:warp_gate[facing=north]')
    return found
  }

  function registrationChecks() {
    var rm = S.server.getRecipeManager()
    var missing = IDS.filter(function (i) { return !rm.byKey(new (classes().RL)('grindless:' + i)).isPresent() })
    check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    var MT = global.grindless.maxPlusTarantula
    check('static', !!MT && !!MT.skipped && MT.skipped.length === 0, 'rows ' + (MT ? MT.rows.length : null) + ', skipped ' + JSON.stringify(MT ? MT.skipped : null))
  }

  function tickBurner(u) {
    var waited = S.tick - u.started
    var m = machineAt(LMC, u.pos)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 700) { check('burner_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.dynamo = partsLike(m, /max_energy_output_hatch_16a/)
      u.bus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var ok = !!u.bus && !!u.outBus && u.dynamo.length === 1
      check('burner_formed', ok, 'class ' + m.getClass().getSimpleName() + ', dynamo hatches ' + u.dynamo.length + ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      setBus(u.bus, [[CIRCUIT, 1, '{Configuration:1}'], ['grindless:shielded_ni56_cask', 1]])
      u.last = m.getRecipeLogic().getLastRecipe()
      u.started = S.tick
      u.phase = 'run'
      return
    }
    var dyn = u.dynamo[0].energyContainer
    var stored = Number(dyn.getEnergyStored())
    if (u.peak === undefined || stored > u.peak) u.peak = stored
    dyn.setEnergyStored(0)
    var rlg = u.m.getRecipeLogic()
    if (u.phase === 'run') {
      var rec = rlg.getLastRecipe()
      if (rec !== null && rec !== undefined && rec !== u.last) {
        var eut = eutOf(rec)
        note('burner_measured', 'recipe ' + String(rec.id) + ', EU/t ' + eut + ', max voltage ' + u.m.getMaxVoltage())
        check('burner_eut', Math.abs(eut) >= Math.pow(2, 34), 'expected 2^34 EU/t out, got ' + eut + '; reasons ' + reasons(u.m))
        check('burner_generator', eut < 0, 'a generator row reads negative: ' + eut)
        u.phase = 'wait'
        u.started = S.tick
      } else if (waited > 300) {
        check('burner_eut', false, 'no recipe started in 300 ticks; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'wait') {
      // the 4,800 t run would outlast the bench's 180 s wait: once output is seen, skip to the end (the established setProgress pattern)
      if (!u.skipped && u.peak > 0 && rlg.isWorking() && rlg.getDuration() - rlg.getProgress() > 40) {
        rlg.setProgress(rlg.getDuration() - 20)
        u.skipped = true
      }
      var got = count(u.outBus, 'grindless:co56_cask')
      if (got >= 1) {
        check('burner_dynamo', u.peak > 0, 'the dynamo hatch held up to ' + u.peak + ' EU')
        check('burner_output', true, 'grindless:co56_cask x' + got)
        u.phase = 'done'
      } else if (waited > 1200) {
        check('burner_output', false, 'no co56 cask in 1200 ticks; skipped ' + !!u.skipped + '; reasons ' + reasons(u.m))
        u.phase = 'done'
      }
    }
  }

  function tickGate(u) {
    var waited = S.tick - u.started
    if (u.phase === 'forming') {
      var m = machineAt(SGR, GATE_ORIGIN)
      if (!m || !formCheck(m, waited)) {
        if (waited > 700) { check('gate_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = partsLike(m, /max_maxplus_energy_hatch_1024a/)
      u.bus = machineAt(SGR, u.pos.bus)
      u.outBus = machineAt(SGR, u.pos.out)
      var ok = !!u.bus && !!u.outBus && u.energy.length === 1
      check('gate_formed', ok, 'warp gate at Sgr A* with one 1,024 A hatch and MAX buses; hatches ' + u.energy.length)
      if (!ok) { u.phase = 'done'; return }
      topUp(u.energy)
      setBus(u.bus, [[CIRCUIT, 1, '{Configuration:16}'], ['grindless:launched_ig_probe', 1], ['grindless:horizon_lock', 1]])
      S.server.persistentData.remove(MARK)
      u.started = S.tick
      u.phase = 'run'
      return
    }
    topUp(u.energy)
    var logic = u.m.getRecipeLogic()
    if (u.phase === 'run') {
      var last = logic.getLastRecipe()
      if (String(logic.getStatus()) === 'WORKING' && last && String(last.id) === HOLD) {
        var eut = eutOf(last)
        check('hold_eut', eut === HOLD_EUT, 'recipe EU/t ' + eut + ' (row ' + HOLD_EUT + ')')
        check('hold_duration', Number(last.duration) === HOLD_TICKS, 'recipe duration ' + last.duration)
        u.runAt = S.tick
        u.phase = 'hold'
      } else if (waited > 1200) {
        check('hold_start', false, 'the hold did not start: status ' + logic.getStatus() + ', reasons ' + logic.getFailureReasons())
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'hold') {
      if (String(logic.getStatus()) !== 'WORKING' && S.tick - u.runAt < HOLD_TICKS) {
        check('hold_long', false, 'stopped ' + (S.tick - u.runAt) + ' ticks into ' + HOLD_TICKS + ': reasons ' + logic.getFailureReasons())
        u.phase = 'done'
      } else if (S.tick - u.runAt >= HOLD_TICKS + 40) {
        check('hold_long', true, 'WORKING through the whole run')
        check('lock_kept', count(u.bus, 'grindless:horizon_lock') + count(u.outBus, 'grindless:horizon_lock') >= 1, 'horizon lock in the buses')
        check('probe_consumed', count(u.bus, 'grindless:launched_ig_probe') === 0, 'the launched probe left the input bus')
        u.phase = 'platform'
        u.started = S.tick
      }
      return
    }
    if (u.phase === 'platform') {
      var marked = S.server.persistentData.contains(MARK)
      var ctrl = 'none'
      try { var pm = machineAt(LMC, PLATFORM); ctrl = pm ? String(pm.getDefinition().getId()) : 'none' } catch (e) { ctrl = 'none' }
      if (marked && ctrl === 'gtceu:warp_gate') {
        check('platform_placed', true, 'warp gate at ' + LMC + ' ' + PLATFORM.x + ',' + PLATFORM.y + ',' + PLATFORM.z + ', mark ' + MARK)
        u.phase = 'done'
      } else if (waited > 400) {
        check('platform_placed', false, 'mark ' + marked + ', controller ' + ctrl)
        u.phase = 'done'
      }
    }
  }

  function clear() {
    ;[SGR, LMC].forEach(function (dim) {
      for (var z = 0; z < 64; z += 8) cmd(dim, 'fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
    })
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { clear() } catch (e) { }
    ;[SGR, LMC].forEach(function (dim) { cmd(dim, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63') })
    try { S.server.persistentData.remove(MARK) } catch (e) { }
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, units: [] }
    ;[SGR, LMC].forEach(function (dim) {
      if (!server.getLevel(dim)) throw new Error('no level ' + dim)
      cmd(dim, 'forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    })
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    try {
      S.units.push({ id: 'burner', tick: tickBurner, pos: placeBurner(), phase: 'forming', started: S.tick })
    } catch (e) { check('burner_build_exception', false, errText(e)) }
    try {
      var pos = buildGate(GATE_ORIGIN, [
        { ability: 'input_bus', id: 'gtceu:max_input_bus', key: 'bus' },
        { ability: 'output_bus', id: 'gtceu:max_output_bus', key: 'out' },
        { ability: 'energy_input', id: HATCH, key: 'e0' }
      ])
      S.units.push({ id: 'gate', tick: tickGate, pos: pos, phase: 'forming', started: S.tick })
    } catch (e) { check('gate_build_exception', false, errText(e)) }
  }

  ServerEvents.customCommand('gg_test_maxplus_tarantula', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMaxplusTarantulaRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMaxplusTarantulaRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMaxplusTarantulaRequest = false
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
