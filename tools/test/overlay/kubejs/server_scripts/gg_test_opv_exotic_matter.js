// TEST ONLY: OpV-D2, X 38272-38335, Z 0-63, Y 98-115, Cygnus X-1 orbit.
// Doubt: the distiller forms here, c2 refuses voiding, and exact c3 alone consumes negative residue without outputs.
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var NAME = 'opv_exotic_matter'
  var DIM = 'grindless:cygnus_x1_orbit'
  var X0 = 38272
  var X1 = 38335
  function lazy() {
    if (C === null) C = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      List: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Void: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode')
    }
    return C
  }
  function array(xs) {
    var a = new (lazy().List)(xs)
    var out = []
    for (var i = 0; i < a.size(); i++) out.push(a.get(i))
    return out
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' +
      String(detail).replace(/[\r\n|]+/g, ' ').substring(0, 1400))
  }
  function command(text) { return S.server.runCommandSilent('execute in ' + DIM + ' run ' + text) }
  function put(x, y, z, block) {
    if (x < X0 || x > X1 || y < 98 || y > 115 || z < 0 || z > 63) throw new Error('outside D2 band')
    command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function clear() {
    for (var z = 0; z < 64; z += 8) command('fill ' + X0 + ' 98 ' + z + ' ' + X1 + ' 115 ' + (z + 7) + ' minecraft:air')
  }
  function finish() {
    if (S.done) return
    S.done = true
    clear()
    command('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function parts(ctrl, re) {
    return array(ctrl.getParts()).filter(function (p) { return re.test(String(p.getDefinition().getId())) })
  }
  function bus(list) {
    var inv = S.input.getInventory().storage
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.of('minecraft:air'))
    list.forEach(function (s, i) { inv.setStackInSlot(i, s) })
  }
  function count(part, id) {
    var inv = part.getInventory().storage
    var n = 0
    for (var i = 0; i < inv.getSlots(); i++) {
      var s = inv.getStackInSlot(i)
      if (!s.isEmpty() && String(s.id) === id) n += Number(s.count)
    }
    return n
  }
  function build() {
    var d = global.grindless.patterns.describe('gtceu:strangelet_distiller')
    if (!d) throw new Error('no distiller pattern')
    var ctrl = null
    var cells = []
    d.slices.forEach(function (rows, z) {
      rows.forEach(function (row, y) {
        for (var x = 0; x < row.length; x++) {
          var ch = row.charAt(x)
          if (ch === ' ') continue
          var sym = d.symbols[ch]
          if (sym.kind === 'controller') ctrl = { x: x, y: y, z: z }
          cells.push({ x: x, y: y, z: z, sym: sym })
        }
      })
    })
    var ports = cells.filter(function (c) { return c.sym.kind === 'oneOf' })
    var ids = ['gtceu:uxv_energy_input_hatch', 'gtceu:uxv_energy_input_hatch',
      'gtceu:hv_input_bus', 'gtceu:hv_output_bus', 'gtceu:hv_input_hatch']
    var chosen = {}
    ids.forEach(function (id, i) {
      var p = ports[Math.floor(i * (ports.length - 1) / (ids.length - 1))]
      chosen[p.x + ',' + p.y + ',' + p.z] = id
    })
    cells.forEach(function (c) {
      var x = 38288 - (c.x - ctrl.x)
      var y = 106 + c.y - ctrl.y
      var z = 2 - (c.z - ctrl.z)
      var sym = c.sym
      var block = null
      var part = chosen[c.x + ',' + c.y + ',' + c.z]
      if (sym.kind === 'controller') { S.pos = new (lazy().Pos)(x, y, z); return }
      if (sym.kind === 'blocks') block = sym.blocks[0]
      if (sym.kind === 'oneOf') {
        if (part) block = part + '[facing=north]'
        else sym.options.forEach(function (o) { if (block === null && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (block !== null) put(x, y, z, block)
    })
    put(S.pos.getX(), S.pos.getY(), S.pos.getZ(), 'gtceu:strangelet_distiller[facing=north]')
  }
  function begin(server) {
    S = { server: server, tick: 0, phase: 'forming', failed: 0, done: false }
    S.level = server.getLevel(DIM)
    if (S.level === null) throw new Error('Cygnus orbit missing')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    var ids = ['calutron_separation/lead_208', 'chemical_reactor/pb208_ion_source', 'heavy_ion_irradiation/pb208_beam_cell',
      'synchrotron/fireball_distillate', 'strangelet_distillation/strangelet_seed',
      'strangelet_distillation/dispose_negative_strangelets', 'strangelet_growth/fed_strangelet',
      'strangelet_growth/grown_strangelet', 'strangelet_growth/stable_exotic_matter',
      'hot_cell/strangelet_tailings_decay', 'assembly_line/strangelet_vault', 'assembly_line/strangelet_distiller']
    var missing = ids.filter(function (id) { return !server.getRecipeManager().byKey(new (lazy().RL)('grindless:' + id)).isPresent() })
    check('lookup', missing.length === 0, 'missing: ' + missing.join(', '))
    var r = server.getRecipeManager().byKey(new (lazy().RL)('grindless:strangelet_distillation/strangelet_seed')).get()
    check('seed_has_outputs', !r.outputs.isEmpty(), 'c2 has contained seed and residue outputs')
    var disposal = server.getRecipeManager().byKey(new (lazy().RL)(global.grindless.exoticMatter.disposalId)).get()
    check('sole_disposal', disposal.outputs.isEmpty(), 'exact c3 has no outputs; static D2 contract checks every other row')
    build()
  }
  function tick() {
    S.tick++
    var m = lazy().Meta.getMachine(S.level, S.pos)
    if (S.phase === 'forming') {
      if (m && !m.isFormed() && S.tick % 50 === 0 && m.checkPatternWithLock()) {
        m.setFlipped(m.getMultiblockState().isNeededFlip())
        m.onStructureFormed()
      }
      if (!m || !m.isFormed()) {
        if (S.tick > 600) { check('formed', false, m ? String(m.getMultiblockState().error) : 'no controller'); finish() }
        return
      }
      S.machine = m
      S.energy = parts(m, /uxv_energy_input_hatch/)
      S.input = parts(m, /input_bus/)[0]
      S.output = parts(m, /output_bus/)[0]
      S.fluid = parts(m, /^gtceu:hv_input_hatch$/)[0]
      check('formed', S.energy.length === 2 && !!S.input && !!S.output && !!S.fluid, 'Cygnus distiller, parts ' + array(m.getParts()).length)
      m.setVoidingMode(lazy().Void.VOID_ITEMS)
      bus([Item.of('gtceu:programmed_circuit', 1, '{Configuration:2}'), Item.of('grindless:pasta_core_sample', 1)])
      S.fluid.tank.setFluidInTank(0, Fluid.of('gtceu:fireball_distillate', 1000).getFluidStack())
      S.start = S.tick
      S.phase = 'refusal'
    }
    S.energy.forEach(function (p) { p.energyContainer.setEnergyStored(p.energyContainer.getEnergyCapacity()) })
    if (S.phase === 'refusal' && S.tick - S.start >= 100) {
      check('seed_refuses_voiding', !m.getRecipeLogic().isWorking() && count(S.input, 'grindless:pasta_core_sample') === 1 &&
        Number(S.fluid.tank.getFluidInTank(0).getAmount()) === 1000, 'c2 preserves catalyst and fireball while item voiding is enabled')
      S.fluid.tank.setFluidInTank(0, Fluid.of('minecraft:water', 0).getFluidStack())
      bus([Item.of('gtceu:programmed_circuit', 1, '{Configuration:3}'), Item.of('grindless:negative_strangelet_residue', 1)])
      S.start = S.tick
      S.phase = 'disposal'
    }
    if (S.phase === 'disposal' && S.tick - S.start >= 500) {
      var last = m.getRecipeLogic().getLastRecipe()
      check('negative_residue_disposed', last !== null && String(last.id) === global.grindless.exoticMatter.disposalId &&
        count(S.input, 'grindless:negative_strangelet_residue') === 0,
        'c3 consumes negative residue with voiding enabled; last ' + (last === null ? 'none' : String(last.id)))
      check('no_material_output', count(S.output, 'grindless:strangelet_seed') === 0 &&
        count(S.output, 'grindless:negative_strangelet_residue') === 0, 'no seeds or residue discarded by other rows')
      finish()
    }
  }
  ServerEvents.customCommand('gg_test_opv_exotic_matter', function () {
    if (S !== null && !S.done) return 0
    global.ggTestOpvExoticMatterRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvExoticMatterRequest && Date.now() - LOADED >= 10000) {
        global.ggTestOpvExoticMatterRequest = false
        begin(event.server)
      }
      if (S !== null && !S.done) tick()
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, done: false }
      check('exception', false, e)
      finish()
    }
  })
})()
