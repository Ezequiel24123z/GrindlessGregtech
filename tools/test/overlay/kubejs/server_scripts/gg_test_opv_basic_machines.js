// TEST ONLY, OpV-A4 (basic machines). Command: kubejs custom_command gg_test_opv_basic_machines
// Band ONLY: X 38080-38143, Z 0-63, Overworld Y 98-115. Everything placed is cleared before DONE.
//   T1 (named uncertainty: gtceu:opv_assembler, placed with /setblock and fed through a chain strand cable connected with setConnection,
//   runs a 2^28 component row; A1's component rows are not in this base, so a throwaway assembler row of this script stands in):
//     loader    global.grindless.opvBasicMachines built every table row, skipped none, found no clash
//     lookup    every grindless:assembler/opv_<machine> row and the probe row are in the recipe manager
//     machines  the OpV 16 A dynamo hatch and the OpV assembler are machines; the dynamo puts out V[OpV]
//     probe     echo shard + disc fragment + circuit 31 at 268,435,456 EU/t (2^28) runs in the OpV assembler on power that came over the
//               cable (the assembler is never topped up by the script; only the dynamo is)
//     wiremill  the shipped row: OpV hull + 4 OpV motors + 2 OpV circuits + 2 chain strand cables + 1 chain lamina stack + 1152 mB soldering
//               alloy + circuit 6 -> gtceu:opv_wiremill at VA[OpV]
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 38080
  var X1 = 38143
  var Z0 = 0
  var Z1 = 63
  var Y0 = 98
  var Y1 = 115
  var NAME = 'opv_basic_machines'
  var OPV = 13
  var DYNAMO16 = 'gtceu:opv_energy_output_hatch_16a'
  var ASSEMBLER = 'gtceu:opv_assembler'
  var CABLE = 'gtceu:chain_strand_single_cable'
  var CIRCUIT = 'gtceu:programmed_circuit'
  var LAMINA = 'grindless:chain_lamina_stack'
  var SOLDER = 'gtceu:soldering_alloy'
  var SOLDER_MB = 1152
  var PROBE_ID = 'gg_test_opv_basic_machines:assembler/probe_2_28'
  var PROBE_EUT = 268435456
  var PROBE_IN = ['minecraft:echo_shard', 'minecraft:disc_fragment_5']
  var PROBE_OUT = 'minecraft:sniffer_egg'
  var PROBE_CIRCUIT = 31
  var BX = 38112
  var BY = 100
  var BZ = 20

  ServerEvents.recipes(function (event) {
    try {
      var b = event.recipes.gtceu.assembler('gg_test_opv_basic_machines:probe_2_28')
      PROBE_IN.forEach(function (id) { b.itemInputs('1x ' + id) })
      b.circuit(PROBE_CIRCUIT)
      b.itemOutputs('1x ' + PROBE_OUT)
      b.EUt(PROBE_EUT).duration(40)
    } catch (e) {
      console.error('[gg_test opv_basic_machines] could not add the probe recipe: ' + errText(e))
    }
  })

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
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
  function command(text) { return S.server.runCommandSilent('execute in minecraft:overworld run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= Z0 && z <= Z1 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function machine(p) { return classes().Meta.getMachine(S.level, p) }
  function itemId(s) { return String(classes().Registries.ITEMS.getKey(s.getItem())) }
  function handler(h) { return h.storage ? h.storage : h }
  function count(h, id) {
    var st = handler(h)
    var n = 0
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (!s.isEmpty() && itemId(s) === id) n += Number(s.getCount())
    }
    return n
  }
  function slots(h) {
    var st = handler(h)
    var out = []
    for (var i = 0; i < st.getSlots(); i++) {
      var s = st.getStackInSlot(i)
      if (!s.isEmpty()) out.push(itemId(s) + 'x' + s.getCount())
    }
    return out.join(' ') || 'empty'
  }
  function fill(h, list) {
    var st = handler(h)
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    var slot = 0
    list.forEach(function (e) { st.setStackInSlot(slot++, e.length > 2 ? Item.of(e[0], e[1], e[2]) : Item.of(e[0], e[1])) })
  }
  function reasons(m) { try { return String(m.getRecipeLogic().getFailureReasons()) } catch (e) { return 'unreadable' } }
  function lastId(m) {
    var r = m.getRecipeLogic().getLastRecipe()
    return r === null || r === undefined ? 'none' : String(r.id)
  }
  // the first item of #gtceu:circuits/opv in this game (the tag the rows take); this KubeJS hides Ingredient.getItems(), so read
  // its own getItemIds() through an ArrayList, as gg_test_addon_gates_ef.js does
  function opvCircuit() {
    var list = new (Java.loadClass('java.util.ArrayList'))(Ingredient.of('#gtceu:circuits/opv').getItemIds())
    for (var i = 0; i < list.size(); i++) {
      var id = String(list.get(i))
      if (id !== 'minecraft:air') return id
    }
    return null
  }

  function registrationChecks() {
    var OB = (global.grindless || {}).opvBasicMachines
    var built = OB && OB.recipes ? Number(OB.recipes.length) : 0
    var skipped = OB && OB.skipped ? Number(OB.skipped.length) : -1
    var clashes = OB && OB.clashes ? Number(OB.clashes.length) : -1
    check('loader', built === 37 && skipped === 0 && clashes === 0, 'rows ' + built + ' (expected 37), skipped ' + skipped +
      (skipped > 0 ? ': ' + OB.skipped.map(function (s) { return s.name + ' ' + s.reason }).join('; ') : '') + ', clashes ' + clashes)
    var rm = S.server.getRecipeManager()
    var ids = OB && OB.recipes ? OB.recipes.map(function (r) { return String(r.recipeId) }) : []
    var missing = ids.concat([PROBE_ID]).filter(function (id) { return !rm.byKey(new (classes().RL)(id)).isPresent() })
    check('lookup', ids.length === 37 && missing.length === 0, ids.length + ' rows; missing from the recipe manager: ' + (missing.length ? missing.join(', ') : 'none'))
  }

  function build(u) {
    put(BX, BY, BZ, DYNAMO16 + '[facing=north]')
    for (var i = 1; i <= 3; i++) put(BX, BY, BZ - i, CABLE)
    put(BX, BY, BZ - 4, ASSEMBLER + '[facing=north]')
    u.src = pos(BX, BY, BZ)
    u.wire = [pos(BX, BY, BZ - 1), pos(BX, BY, BZ - 2), pos(BX, BY, BZ - 3)]
    u.at = pos(BX, BY, BZ - 4)
    // a setblock pipe has no connections: link each cable to its neighbours the way PipeBlockItem.placeBlock does (S0-7)
    var north = Direction.NORTH
    var south = Direction.SOUTH
    u.wire.forEach(function (p) {
      var be = S.level.getBlockEntity(p)
      be.setConnection(north, true, false)
      be.setConnection(south, true, false)
    })
    u.phase = 'warm'
    u.started = S.tick
  }

  function start(u, name, inputs, circuit, fluid) {
    var m = u.m
    fill(m.exportItems, [])
    fill(m.importItems, inputs)
    var empty = Java.loadClass('net.minecraftforge.fluids.FluidStack').EMPTY
    for (var t = 0; t < m.importFluids.getTanks(); t++) m.importFluids.setFluidInTank(t, empty)
    if (fluid) m.importFluids.setFluidInTank(0, Fluid.of(fluid[0], fluid[1]).getFluidStack())
    var circ = Item.of(CIRCUIT, 1, '{Configuration:' + circuit + '}')
    var where = 'circuit slot'
    try { fill(m.circuitInventory, [[CIRCUIT, 1, '{Configuration:' + circuit + '}']]) } catch (e) {
      where = 'import slot ' + inputs.length
      handler(m.importItems).setStackInSlot(inputs.length, circ)
    }
    try { m.getRecipeLogic().updateTickSubscription() } catch (e) { }
    u.step = name
    u.started = S.tick
    note(name + '_start', 'inputs ' + slots(m.importItems) + ', fluid ' + (fluid ? fluid[0] + ' ' + m.importFluids.getFluidInTank(0).getAmount() + ' mB' : 'none') +
      ', circuit ' + circuit + ' in the ' + where)
  }

  function tick(u) {
    var src = machine(u.src)
    var m = machine(u.at)
    if (!src || !m) { check('machines', false, 'dynamo ' + !!src + ', assembler ' + !!m); u.phase = 'done'; return }
    var sc = src.energyContainer
    sc.setEnergyStored(sc.getEnergyCapacity())
    var waited = S.tick - u.started
    if (u.phase === 'warm') {
      if (waited < 20) return
      u.m = m
      var V = Number(GTValues.V[OPV])
      var alive = u.wire.every(function (p) { return String(S.level.getBlock(p.getX(), p.getY(), p.getZ()).getId()) === CABLE })
      var stored = Number(m.energyContainer.getEnergyStored())
      check('machines', String(m.getDefinition().getId()) === ASSEMBLER && Number(sc.getOutputVoltage()) === V && alive && stored > 0,
        'assembler ' + m.getDefinition().getId() + ' (tier ' + m.getTier() + '), dynamo ' + sc.getOutputVoltage() + ' V x ' + sc.getOutputAmperage() +
        ' A (V[13] ' + V + '), cable intact ' + alive + ', assembler energy after 20 ticks over the cable ' + stored + ' of ' + m.energyContainer.getEnergyCapacity())
      start(u, 'probe', PROBE_IN.map(function (id) { return [id, 1] }), PROBE_CIRCUIT)
      u.phase = 'probe'
      return
    }
    if (u.phase === 'probe') {
      var got = count(m.exportItems, PROBE_OUT)
      if (got >= 1) {
        var id = lastId(m)
        var used = PROBE_IN.filter(function (i) { return count(m.importItems, i) !== 0 })
        check('probe', id === PROBE_ID && used.length === 0, 'recipe ' + id + ' (' + PROBE_EUT + ' EU/t = 2^28) in ' + waited + ' ticks, output ' + slots(m.exportItems) +
          ', inputs left ' + slots(m.importItems) + ', assembler energy ' + m.energyContainer.getEnergyStored())
        var circuitItem = null
        try { circuitItem = opvCircuit() } catch (e) { note('opv_circuit', 'unreadable: ' + errText(e)) }
        if (circuitItem === null) { check('wiremill', false, '#gtceu:circuits/opv is empty in this game'); u.phase = 'done'; return }
        start(u, 'wiremill', [['gtceu:opv_machine_hull', 1], ['gtceu:opv_electric_motor', 4], [circuitItem, 2], [CABLE, 2], [LAMINA, 1]], 6, [SOLDER, SOLDER_MB])
        u.phase = 'wiremill'
      } else if (waited > 300) {
        check('probe', false, 'no output in 300 ticks; last recipe ' + lastId(m) + '; reasons ' + reasons(m) + '; inputs ' + slots(m.importItems) +
          '; assembler energy ' + m.energyContainer.getEnergyStored())
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'wiremill') {
      var made = count(m.exportItems, 'gtceu:opv_wiremill')
      if (made >= 1) {
        var wid = lastId(m)
        check('wiremill', wid === 'grindless:assembler/opv_wiremill' && slots(m.importItems) === 'empty',
          'recipe ' + wid + ' in ' + waited + ' ticks, output ' + slots(m.exportItems) + ', inputs left ' + slots(m.importItems))
        u.phase = 'done'
      } else if (waited > 900) {
        check('wiremill', false, 'no output in 900 ticks; last recipe ' + lastId(m) + '; working ' + m.getRecipeLogic().isWorking() + '; reasons ' + reasons(m) +
          '; inputs ' + slots(m.importItems) + '; assembler energy ' + m.energyContainer.getEnergyStored())
        u.phase = 'done'
      }
    }
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
    var u = { phase: 'build', started: S.tick }
    try {
      build(u)
      S.units.push(u)
    } catch (e) { check('build_exception', false, errText(e)) }
  }
  ServerEvents.customCommand('gg_test_opv_basic_machines', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestOpvBasicMachinesRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvBasicMachinesRequest && Date.now() - LOADED >= 10000) {
        global.ggTestOpvBasicMachinesRequest = false
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
