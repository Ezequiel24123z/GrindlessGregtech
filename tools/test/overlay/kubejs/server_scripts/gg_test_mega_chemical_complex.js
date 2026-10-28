// priority: -5661
// TEST ONLY, MEGA-6 (gtceu:mega_chemical_complex). Command: kubejs custom_command gg_test_mega_chemical_complex
// Band ONLY: X 34048-34111, Z 0-63, Overworld Y 98-115.
//   T1 of docs/eras/mega.md 6.4 (the named uncertainty: coil x parallel hatch together on one LCR-mode recipe):
//     registration  the machine is registered on gtceu:large_chemical_reactor (first, the default mode) and gtceu:mega_chemical_complex
//     lookup        the recipe manager holds recipes under both types; the controller recipe exists with its machines
//     composed_*    each composed recipe equals the sum of its LIVE stage recipes (read from the recipe manager, not from the table)
//     formed        two real complexes (15 x 15 x 15) form: HSS-G coils + one LuV parallel hatch + one LuV energy hatch, and Naquadah coils +
//                   one ZPM parallel hatch + one ZPM energy hatch
//     parallels     a probe LCR recipe (8 EU/t, one non-consumed poppy placed in the input bus and no output, so neither stock nor
//                   output space limits the copies: GTM refuses a recipe with no inputs and counts chanced outputs) goes through the
//                   machine's own modifiers: LuV 64 x 16 = 1,024 copies (energy cap 4,096 at 32,768 V), ZPM 256 x 64 = 16,384 copies
//                   (energy cap floor(131,072 / 8) = 16,384): the figures need ONE LuV energy hatch and ONE ZPM energy hatch respectively
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 34048
  var X1 = 34111
  var Y0 = 98
  var Y1 = 115
  var NAME = 'mega_chemical_complex'
  var ID = 'gtceu:mega_chemical_complex'
  var TYPES = 'gtceu:large_chemical_reactor,gtceu:mega_chemical_complex'
  var PROBE = 'gg_test_mega:cc_probe'
  var PROBE_EUT = 8
  var RED = 'minecraft:red_dye'
  var POPPY = 'minecraft:poppy'
  // unit: coil block, kelvin, coil parallel, hatch parallel, expected copies, hatches
  var UNITS = [
    { name: 'luv', coil: 'gtceu:hssg_coil_block', coilPar: 64, hatchPar: 16, par: 1024, x: 34080, z: 20,
      parts: { 2: 'gtceu:maintenance_hatch', 3: 'gtceu:luv_energy_input_hatch', 4: 'gtceu:hv_input_bus', 6: 'gtceu:hv_output_bus', 5: 'gtceu:luv_parallel_hatch', 8: 'gtceu:hv_input_hatch', 9: 'gtceu:hv_output_hatch' } },
    { name: 'zpm', coil: 'gtceu:naquadah_coil_block', coilPar: 256, hatchPar: 64, par: 16384, x: 34080, z: 49,
      parts: { 2: 'gtceu:maintenance_hatch', 3: 'gtceu:zpm_energy_input_hatch', 4: 'gtceu:hv_input_bus', 6: 'gtceu:hv_output_bus', 5: 'gtceu:zpm_parallel_hatch', 8: 'gtceu:hv_input_hatch', 9: 'gtceu:hv_output_hatch' } }
  ]
  // the stage recipes of each composed line and how many runs of each the table's batch makes (solved by hand from its given amounts)
  var LINES = [
    { name: 'ptfe', stages: [['gtceu:chemical_reactor/chloroform', 2], ['gtceu:chemical_reactor/hydrofluoric_acid_from_elements', 4],
      ['gtceu:chemical_reactor/tetrafluoroethylene_from_chloroform', 1], ['gtceu:chemical_reactor/ptfe_from_oxygen', 1000 / 144]] },
    { name: 'epoxy', stages: [['gtceu:chemical_reactor/phenol_from_cumene', 2], ['gtceu:chemical_reactor/bisphenol_a', 1], ['gtceu:chemical_reactor/allyl_chloride', 1],
      ['gtceu:chemical_reactor/hypochlorous_acid', 1], ['gtceu:chemical_reactor/epichlorohydrin_from_allyl_chloride', 1], ['gtceu:chemical_reactor/epoxy_from_bisphenol_a', 1]] },
    { name: 'para_aramid', stages: [['gcyr:chemical_reactor/nitroaniline', 2], ['gcyr:chemical_reactor/para_phenylenediamine', 2],
      ['gcyr:chemical_reactor/bis_trichloromethyl_benzene', 1], ['gcyr:chemical_reactor/therephthalic_acid', 1],
      ['gcyr:chemical_reactor/terephthaloyl_chloride', 1], ['gcyr:large_chemical_reactor/para_aramid', 2]] }
  ]

  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.large_chemical_reactor(PROBE).notConsumable('1x ' + POPPY).duration(200).EUt(PROBE_EUT)
    } catch (e) {
      console.error('[gg_test mega_chemical_complex] could not add the probe recipe: ' + String(e))
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

  // ---------------------------------------------------------------- contents of a live recipe

  // { 'i:<id>' | 'f:<id>': amount of one run } for one side (a chance of 0 is the mold or the circuit and is left out)
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
      var key = 'f:' + String(K.Registries.FLUIDS.getKey(fs.getFluid()))
      res[key] = (res[key] || 0) + Number(fi.getAmount()) * s
    })
    return res
  }
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
    var composed = rm.byKey(new (classes().RL)('grindless:mega_chemical_complex/' + line.name))
    if (!composed.isPresent()) { check('composed_' + line.name, false, 'recipe grindless:mega_chemical_complex/' + line.name + ' is not loaded'); return }
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
      if (Math.abs(e - g) >= 1) bad.push(k + ' stages ' + e + ' vs composed ' + g)
    })
    var eutOk = got.eut > 0 && got.eut <= 32768
    var energyOk = got.energy >= energy - 1e-6 && got.energy - energy < got.duration
    check('composed_' + line.name, bad.length === 0 && eutOk && energyOk,
      'contents ' + (bad.length === 0 ? 'equal the sum of ' + line.stages.length + ' live stages' : 'differ: ' + bad.join('; ')) +
      '; EU ' + got.energy + ' (' + got.eut + ' EU/t x ' + got.duration + ') vs stages ' + energy)
  }

  function registrationChecks() {
    var K = classes()
    var def = K.GTRegistries.MACHINES.get(new K.RL(ID))
    var types = []
    if (def) array(def.getRecipeTypes()).forEach(function (t) { types.push(String(t.registryName)) })
    check('registration', !!def && types.join(',') === TYPES, 'machine ' + ID + ' registered=' + !!def + ' types [' + types.join(',') + ']')
    var rm = S.server.getRecipeManager()
    var lcr = 0
    var own = []
    array(rm.getRecipes()).forEach(function (r) {
      var t = String(r.getType())
      if (t === 'gtceu:large_chemical_reactor') lcr++
      else if (t === 'gtceu:mega_chemical_complex') own.push(String(r.getId()))
    })
    var want = LINES.map(function (l) { return 'grindless:mega_chemical_complex/' + l.name })
    var missing = want.filter(function (id) { return own.indexOf(id) < 0 })
    var probe = rm.byKey(new K.RL('gg_test_mega:large_chemical_reactor/cc_probe')).isPresent()
    check('lookup', lcr > 0 && missing.length === 0 && probe,
      'large_chemical_reactor recipes ' + lcr + ' (probe ' + probe + '); mega_chemical_complex recipes ' + own.join(', ') + (missing.length ? '; missing ' + missing.join(', ') : ''))
    var made = []
    array(rm.getRecipes()).forEach(function (r) {
      var rid = String(r.getId())
      if (/[\/:]mega_chemical_complex$/.test(rid) && rid.indexOf('gg_test') < 0) made.push(r)
    })
    var mc = global.grindless.megaChemicalComplex
    var okCraft = made.length > 0
    var got = ''
    if (okCraft) {
      var ins = {}
      var o = side(made[0], false)
      got = JSON.stringify(o)
      ins = o
      if (ins['i:gtceu:coil_chemical_plant'] !== 4 || ins['i:gtceu:luv_chemical_reactor'] !== 16) okCraft = false
    }
    check('crafting', !!mc && okCraft, 'controller recipe ids: ' + made.map(function (r) { return String(r.getId()) }).join(', ') + '; inputs ' + got +
      '; skipped lines ' + JSON.stringify(mc ? mc.skipped : null))
    LINES.forEach(function (line) {
      try { composedCheck(line) } catch (e) { check('composed_' + line.name, false, 'exception: ' + errText(e)) }
    })
  }

  // ---------------------------------------------------------------- the machine

  // front slice (the last one), the controller's row, by column, as UNITS[].parts
  function placeMachine(u) {
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
    var controller = null
    var count = 0
    cells.forEach(function (c) {
      c.x = u.x - (c.ci - ctrl.ci)
      c.y = 100 + (c.ri - ctrl.ri)
      c.z = u.z - (c.si - ctrl.si)
    })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var isPart = false
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'blocks') block = c.ch === 'K' ? u.coil : sym.blocks[0]
      else if (sym.kind === 'oneOf') {
        if (c.si === last && c.ri === ctrl.ri && u.parts[c.ci]) { block = u.parts[c.ci]; isPart = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (isPart ? '[facing=north]' : ''))
      count++
    })
    put(controller.x, controller.y, controller.z, ID + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), blocks: count + 1 }
  }

  function build() {
    var out = []
    UNITS.forEach(function (un) {
      var u = { name: un.name, coil: un.coil, coilPar: un.coilPar, hatchPar: un.hatchPar, par: un.par, x: un.x, z: un.z, parts: un.parts }
      try {
        var placed = placeMachine(u)
        u.pos = placed.pos
        u.blocks = placed.blocks
        u.phase = 'forming'
        u.started = S.tick
        out.push(u)
      } catch (e) { check(un.name + '_place_exception', false, errText(e)) }
    })
    return out
  }

  function tick(u) {
    var m = machine(u.pos)
    var waited = S.tick - u.started
    if (!m || !formCheck(m, waited)) {
      if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
      return
    }
    var energy = partsLike(m, /energy_input_hatch/)
    var kelvin = global.grindless.coils.temperature(m)
    var ph = m.getParallelHatch()
    var hatch = ph.isPresent() ? ph.get() : null
    var maint = partsLike(m, /maintenance/).length
    var hatchPar = hatch ? Number(hatch.getCurrentParallel()) : 0
    var F = global.grindless.mega.formulas
    var coilCeil = F.coilCeiling(kelvin, null)
    check(u.name + '_formed', energy.length === 1 && maint === 1 && !!hatch && hatchPar === u.hatchPar && coilCeil === u.coilPar,
      'class ' + m.getClass().getSimpleName() + ', ' + u.blocks + ' blocks, type ' + m.getRecipeType().registryName + ', coil ' + kelvin + ' K (ceiling ' + coilCeil + ', expected ' + u.coilPar +
      '), parallel hatch ' + hatchPar + ' (expected ' + u.hatchPar + '), parts ' + partIds(m).join(' '))
    if (!energy.length || !hatch) { u.phase = 'done'; return }
    var rm = S.server.getRecipeManager()
    var probe = rm.byKey(new (classes().RL)('gg_test_mega:large_chemical_reactor/cc_probe'))
    if (!probe.isPresent()) { check(u.name + '_parallels', false, 'probe recipe is not loaded'); u.phase = 'done'; return }
    energy.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) })
    var inBus = partsLike(m, /input_bus/)
    if (!inBus.length) { check(u.name + '_parallels', false, 'no input bus for the probe poppy'); u.phase = 'done'; return }
    inBus[0].getInventory().storage.setStackInSlot(0, Item.of(POPPY, 1))
    var volt = Number(m.getMaxVoltage())
    var want = Math.min(coilCeil * hatchPar, Math.floor(volt / PROBE_EUT))
    var full = m.fullModifyRecipe(probe.get())
    var got = full === null || full === undefined ? 0 : field(full, 'parallels')
    note(u.name + '_measured', 'max voltage ' + volt + ', energy cap ' + Math.floor(volt / PROBE_EUT) + ', ceiling ' + coilCeil + ' x ' + hatchPar + ' = ' + (coilCeil * hatchPar) +
      ', modified recipe ' + (full ? 'parallels ' + got + ' duration ' + field(full, 'duration') : 'NULL'))
    check(u.name + '_parallels', got === u.par && want === u.par,
      'probe ' + PROBE_EUT + ' EU/t, coil ' + kelvin + ' K x hatch ' + hatchPar + ' at ' + volt + ' V: expected ' + u.par + ' copies, formula ' + want + ', machine ' + got)
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
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false }
    S.level = server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    try { S.units = build() } catch (e) { check('build_exception', false, errText(e)); S.units = [] }
  }
  ServerEvents.customCommand('gg_test_mega_chemical_complex', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestMegaChemicalComplexRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestMegaChemicalComplexRequest && Date.now() - LOADED >= 10000) {
        global.ggTestMegaChemicalComplexRequest = false
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
