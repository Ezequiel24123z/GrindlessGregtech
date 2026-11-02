// priority: -374
// TEST ONLY, AF-M. Command: kubejs custom_command gg_test_af_m
// Reserved band ONLY: X48384-48447, Z0-63; Overworld Y98-112.
// Doubt: the plasma quench caster took no input bus and the megabar press no input hatch, though plasma_sprayed_tile needs a billet and
// hbn_crystal needs nitrogen. Builds each machine with ordinary hatches only (no parallel hatch) and runs the row once.
// No manual recipe execution, no changed clock.
(function () {
  var S = null
  var C = null
  var REQUEST = 'ggTestAfMRequest'
  var LOADED = Date.now()
  var X0 = 48384
  var DIM = 'minecraft:overworld'
  function classes() {
    if (C !== null) return C
    C = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
      Items: Java.loadClass('net.minecraft.world.item.ItemStack'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
    }
    return C
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|af_m|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
  }
  function command(text) { return S.server.runCommandSilent('execute in ' + DIM + ' run ' + text) }
  function machine(m, p) { return classes().Meta.getMachine(m.level, new (classes().Pos)(p.x, p.y, p.z)) }
  function setBlock(p, id) { command('setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + ' replace') }
  function itemId(stack) { return String(classes().Registries.ITEMS.getKey(stack.getItem())) }
  function inventory(bus) {
    var inv = bus.getInventory()
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var stack = inv.getStackInSlot(i)
      if (!stack.isEmpty()) counts[itemId(stack)] = (counts[itemId(stack)] || 0) + Number(stack.getCount())
    }
    return counts
  }
  function empty(bus) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, classes().Items.EMPTY)
  }
  function fluidOf(hatch) {
    var fs = hatch.tank.getFluidInTank(0)
    if (fs.isEmpty()) return null
    return [String(classes().Registries.FLUIDS.getKey(fs.getFluid())), Number(fs.getAmount())]
  }
  function plain(symbol) {
    if (symbol.kind === 'oneOf') return plain(symbol.options[0])
    if (symbol.kind === 'blocks') return symbol.blocks[0]
    if (symbol.kind === 'frames') return 'gtceu:' + symbol.materials[0] + '_frame'
    if (symbol.kind === 'air') return 'minecraft:air'
    throw new Error('unhandled structure symbol ' + symbol.kind)
  }
  var ENERGY = 'gtceu:uev_energy_input_hatch'
  var BUS_IN = 'gtceu:zpm_input_bus'
  var BUS_OUT = 'gtceu:zpm_output_bus'
  var HATCH_IN = 'gtceu:zpm_input_hatch'
  var HATCH_OUT = 'gtceu:zpm_output_hatch'
  var CASES = [
    { name: 'plasma_quench_caster', x: X0 + 10, circuit: 0, duration: 20,
      roles: [['energy', ENERGY], ['input', BUS_IN], ['fluid', HATCH_IN], ['output', BUS_OUT], ['out1', HATCH_OUT], ['out2', HATCH_OUT]],
      items: [['grindless:wf_rhea_billet', 1]], fluidIn: ['gtceu:argon', 1000],
      outItems: { 'grindless:plasma_sprayed_tile': 1 }, outFluids: { 'gtceu:argon': 950, 'gtceu:steam': 2000 } },
    { name: 'megabar_press', x: X0 + 30, circuit: 6, duration: 1600,
      roles: [['energy', ENERGY], ['input', BUS_IN], ['output', BUS_OUT], ['fluid', HATCH_IN], ['out1', HATCH_OUT]],
      items: [['grindless:hbn_dust', 4], ['gtceu:barium_dust', 1], ['grindless:nanotwinned_diamond_anvil', 1]], fluidIn: ['gtceu:nitrogen', 500],
      outItems: { 'grindless:raw_hbn_crystal': 1 }, outFluids: { 'gtceu:nitrogen': 400 } }
  ]
  function place(m) {
    var desc = global.grindless.patterns.describe(m.id)
    var origin = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        var ci = row.indexOf('S')
        if (ci >= 0) origin = { si: si, ri: ri, ci: ci }
      })
    })
    if (origin === null) throw new Error('no controller: ' + m.id)
    var next = 0
    var roles = m.def.roles
    m.positions = {}
    var controller = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var p = { x: m.x - (ci - origin.ci), y: m.y + ri - origin.ri, z: 2 + origin.si - si }
          var id
          if (ch === 'S') { controller = p; continue }
          if (ch === 'X' && next < roles.length) {
            m.positions[roles[next][0]] = p
            id = roles[next++][1]
          } else id = plain(desc.symbols[ch])
          setBlock(p, id + (id.indexOf('_hatch') >= 0 || id.indexOf('_bus') >= 0 ? '[facing=north]' : ''))
        }
      })
    })
    m.positions.controller = controller
    setBlock(controller, m.id + '[facing=north]')
    m.phase = 'forming'
    m.started = S.tick
  }
  function parts(m) {
    m.ctrl = machine(m, m.positions.controller)
    m.parts = {}
    m.def.roles.forEach(function (role) {
      m.parts[role[0]] = machine(m, m.positions[role[0]])
      if (m.parts[role[0]] === null) throw new Error('missing part ' + role[0])
    })
    m.outHatches = ['out1', 'out2'].filter(function (k) { return m.parts[k] }).map(function (k) { return m.parts[k] })
  }
  function feed(m) {
    var def = m.def
    empty(m.parts.input)
    empty(m.parts.output)
    if (def.circuit > 0) m.parts.input.getCircuitInventory().setStackInSlot(0, classes().Circuit.stack(def.circuit))
    def.items.forEach(function (it, slot) { m.parts.input.getInventory().setStackInSlot(slot, Item.of(it[0], it[1])) })
    m.parts.fluid.tank.setFluidInTank(0, Fluid.of(def.fluidIn[0], def.fluidIn[1]).getFluidStack())
    m.started = S.tick
    m.ctrl.getRecipeLogic().updateTickSubscription()
  }
  function complete(m) {
    var items = inventory(m.parts.output)
    var fluids = {}
    m.outHatches.forEach(function (h) { var f = fluidOf(h); if (f !== null) fluids[f[0]] = (fluids[f[0]] || 0) + f[1] })
    var ok = true
    Object.keys(m.def.outItems).forEach(function (id) { if ((items[id] || 0) < m.def.outItems[id]) ok = false })
    Object.keys(m.def.outFluids).forEach(function (id) { if ((fluids[id] || 0) < m.def.outFluids[id]) ok = false })
    return { ok: ok, text: JSON.stringify({ items: items, fluids: fluids }) }
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    command('fill ' + X0 + ' 98 0 ' + (X0 + 63) + ' 112 15 minecraft:air')
    command('forceload remove ' + X0 + ' 0 ' + (X0 + 63) + ' 15')
    console.info('GGTEST|af_m|DONE|failures=' + S.failed)
  }
  function start(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, copies: [] }
    var level = server.getLevel(DIM)
    command('forceload add ' + X0 + ' 0 ' + (X0 + 63) + ' 15')
    command('fill ' + X0 + ' 98 0 ' + (X0 + 63) + ' 112 15 minecraft:air')
    CASES.forEach(function (def) {
      var m = { id: 'gtceu:' + def.name, def: def, level: level, x: def.x, y: 99 }
      S.copies.push(m)
      place(m)
    })
  }
  function tickCopy(m) {
    if (m.phase === 'done') return
    if (m.phase === 'forming') {
      var ctrl = machine(m, m.positions.controller)
      if (!ctrl || !ctrl.isFormed()) {
        if (S.tick - m.started > 600) { check('formed_' + m.def.name, false, 'formation timeout'); m.phase = 'done' }
        return
      }
      parts(m)
      check('formed_' + m.def.name, true, 'ordinary hatches, no parallel hatch')
      m.phase = 'ready'
    }
    var energy = m.parts.energy.energyContainer
    energy.setEnergyStored(energy.getEnergyCapacity())
    if (m.phase === 'ready') {
      feed(m)
      m.phase = 'running'
      return
    }
    if (m.phase === 'running') {
      var r = complete(m)
      if (r.ok) {
        check('process_' + m.def.name, true, r.text)
        m.phase = 'done'
      } else if (S.tick - m.started > m.def.duration + 600) {
        check('process_' + m.def.name, false, 'timeout; got ' + r.text + '; failures=' + String(m.ctrl.getRecipeLogic().getFailureReasons()))
        m.phase = 'done'
      }
    }
  }
  ServerEvents.customCommand('gg_test_af_m', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        start(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      S.copies.forEach(tickCopy)
      if (S.copies.every(function (m) { return m.phase === 'done' })) finish()
      else if (S.tick > 3400) { check('deadline', false, '3400-tick fixture ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, String(e))
      finish()
    }
  })
})()
