// priority: -5540
// -----------------------------------------------------------------------------------------------
// MAX+ machine 17, the Hyperstargate (docs/eras/maxplus.md "The Hyperstargate", lines 414 to 472; package XP-G1). This file registers:
//
//   gtceu:hyperstargate        41 x 43 x 9: a vertical ring of 160 cells (151 grindless:hyperstargate_ring_block and the nine locked chevrons set
//                              into it) with a base row below it: four power units, the horizon iris, the base block, one 4,096 A wireless MAX+
//                              hatch (the dial's 2^43 EU/t) and the buses. The ring's interior is air, so the plane stays open
//   gtceu:hyperstargate_dial   its recipe type: c1, the dial, 2^43 EU/t for 1,200 t, no overclock and no parallels
//   grindless:spent_dial_charge  what a dial leaves; the condensate refinery recharges it (server_scripts/.../maxplus/hyperstargate.js)
//
// The run-start check (the recipe modifier): GTM does not check a formed structure again when a block is taken out of it, so the modifier checks
// the pattern itself, then the wireless network: the banks must hold one dial (1,200 x 2^43 EU, the table's dialMultiplier and dialExponent) and
// the store, with what the hatch already holds, must cover it. A refused start shows on the controller's lines.
//
// The open state, for XP-Z1b (which does the player check and the teleport): global.grindless.hyperstargate
//   isOpen(machine)            formed and running its dial
//   box(pos, facing)           the interior plane in world coordinates { minX, minY, minZ, maxX, maxY, maxZ } (inclusive block coordinates)
//   gates()                    [{ dimension, pos: { x, y, z }, facing, open, box }] of every formed gate that has been asked to start a dial
//   gateAt(dimension, x, y, z) one of those or null
//
// Rhino: var + function inside every callback that runs more than once; GTM and wireless things are looked up at run time.
(function () {
  var G = global.grindless || (global.grindless = {})
  var Pat = G.patterns
  var HS = G.hyperstargate || (G.hyperstargate = {})
  var LOG = '[grindless/hyperstargate] '

  var TYPE = 'hyperstargate_dial'
  var KEY = 'grindless_hyperstargate_dial'
  var MACHINE = 'gtceu:hyperstargate'
  var CASING = 'grindless:horizon_machine_casing'
  var RECHECK_TICKS = 20

  HS.machine = MACHINE
  HS.type = TYPE
  HS.dataKey = KEY
  HS.spent = 'grindless:spent_dial_charge'
  HS.maxIO = { itemsIn: 5, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }

  // x left to right, y bottom to top, z back (0) to front (8). Row 0 a floor of casing and atomic casing; row 1 the base row (the controller
  // at the middle of the front, eight part cells either side of it, four power units, the iris and the base block on the ring's plane, two
  // coils, a glass band at the back); rows 2 to 42 the ring on slice z = 4, its interior air.
  var W_ = 41
  var H_ = 43
  var D_ = 9
  var MID = 20
  var PLANE = 4
  var CHEVRONS = [[20, 42], [10, 42], [30, 42], [0, 34], [40, 34], [0, 22], [40, 22], [0, 10], [40, 10]]

  function isChevron(x, y) {
    for (var i = 0; i < CHEVRONS.length; i++) {
      if (CHEVRONS[i][0] === x && CHEVRONS[i][1] === y) return true
    }
    return false
  }

  function cell(x, y, z) {
    if (y === 0) return (x + z) % 2 === 0 ? 'F' : 'A'
    if (y === 1) {
      if (z === D_ - 1 && x >= MID - 4 && x <= MID + 4 && x !== MID) return 'X'
      if (z === PLANE) {
        if (x === 10 || x === 15 || x === 25 || x === 30) return 'W'
        if (x === MID) return 'I'
        if (x === 3 || x === 37) return 'C'
      }
      if (z === PLANE + 1 && x === MID) return 'G'
      if (z === 0 && x % 5 === 0 && x >= 5 && x <= 35) return 'L'
      return ' '
    }
    if (z === PLANE) {
      if (y === 2 || y === H_ - 1 || x === 0 || x === W_ - 1) return isChevron(x, y) ? 'K' : 'R'
      return '#'
    }
    return ' '
  }
  HS.cell = cell

  HS.size = { width: W_, height: H_, depth: D_ }
  HS.pal = {
    F: CASING, A: 'gtceu:atomic_casing', C: 'gtceu:superconducting_coil', L: 'gtceu:cleanroom_glass',
    R: 'grindless:hyperstargate_ring_block', K: 'grindless:hyperstargate_locked_chevron', W: 'grindless:hyperstargate_power_unit',
    I: 'grindless:horizon_iris', G: 'grindless:hyperstargate_base'
  }
  HS.parts = function () {
    return [
      Pat.part('input_bus', { min: 1, max: 2 }),
      Pat.part('output_bus', { min: 1, max: 1 }),
      Pat.part('energy_input', { min: 1, max: 1 })
    ]
  }

  // ---------------------------------------------------------------- the open plane

  // horizontal step of each facing (by name)
  var STEPS = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] }
  // the interior plane's two corners relative to the controller: up, back (away from the front face), side
  var CORNERS = [{ up: 2, back: D_ - 1 - PLANE, side: -(MID - 1) }, { up: H_ - 3, back: D_ - 1 - PLANE, side: MID - 1 }]

  function num(v) { return Number(v) }
  function coord(pos, k) {
    var f = pos['get' + k.toUpperCase()]
    return typeof f === 'function' ? num(f.call(pos)) : num(pos[k])
  }

  function box(pos, facing) {
    var step = STEPS[String(facing).toLowerCase()]
    if (!step) return null
    var px = coord(pos, 'x')
    var py = coord(pos, 'y')
    var pz = coord(pos, 'z')
    var fx = step[0]
    var fz = step[1]
    var xs = []
    var zs = []
    CORNERS.forEach(function (c) {
      xs.push(px - fx * c.back + fz * c.side)
      zs.push(pz - fz * c.back - fx * c.side)
    })
    return { minX: Math.min(xs[0], xs[1]), maxX: Math.max(xs[0], xs[1]), minY: py + CORNERS[0].up, maxY: py + CORNERS[1].up,
      minZ: Math.min(zs[0], zs[1]), maxZ: Math.max(zs[0], zs[1]) }
  }
  HS.box = box

  function dimensionOf(level) {
    var d = level.dimension
    return String(typeof d === 'function' ? level.dimension().location() : d)
  }

  function keyOf(level, machine) {
    var p = machine.getPos()
    return dimensionOf(level) + '|' + coord(p, 'x') + ',' + coord(p, 'y') + ',' + coord(p, 'z')
  }

  function isOpen(machine) {
    try {
      if (machine === null || machine === undefined || !machine.isFormed()) return false
      return machine.getRecipeLogic().isWorking() === true
    } catch (e) {
      return false
    }
  }
  HS.isOpen = isOpen

  var known = {}
  var refusals = {}

  function remember(machine, level) {
    var k = keyOf(level, machine)
    known[k] = { machine: machine, level: level, key: k }
    return k
  }

  function describe(entry) {
    var m = entry.machine
    var p = m.getPos()
    var facing = String(m.getFrontFacing()).toLowerCase()
    return { dimension: dimensionOf(entry.level), pos: { x: coord(p, 'x'), y: coord(p, 'y'), z: coord(p, 'z') }, facing: facing, open: isOpen(m), box: box(p, facing) }
  }

  HS.gates = function () {
    var out = []
    Object.keys(known).forEach(function (k) {
      var e = known[k]
      try {
        if (e.machine.isInValid() || !e.machine.isFormed()) {
          delete known[k]
          return
        }
        out.push(describe(e))
      } catch (err) {
        delete known[k]
      }
    })
    return out
  }

  HS.gateAt = function (dimension, x, y, z) {
    var e = known[String(dimension) + '|' + x + ',' + y + ',' + z]
    if (!e) return null
    try {
      return e.machine.isFormed() ? describe(e) : null
    } catch (err) {
      return null
    }
  }

  // ---------------------------------------------------------------- the dial's charge

  // what one dial draws from the network: the table's dialMultiplier x 2^dialExponent, exact (1,200 x 2^43 is above 2^53)
  function dialNeed(W) {
    var b = W.table.maxplusBank
    return W.big.toBig(String(b.dialMultiplier)).shiftLeft(Number(b.dialExponent))
  }
  HS.dialNeed = dialNeed

  // the EU the controller's energy hatches already hold: that much of the dial is not drawn from the network
  function heldByHatches(W, machine) {
    var total = 0
    var parts = machine.getParts()
    for (var i = 0; i < parts.size(); i++) {
      var c = parts.get(i).energyContainer
      if (c === null || c === undefined) continue
      total = W.big.add(total, Number(c.getEnergyStored()))
    }
    return total
  }

  // null when the dial may start, else { kind, args }: kind is one of structure, no_network, bank, charge
  function verdict(machine) {
    if (!machine.checkPatternWithLock()) return { kind: 'structure', args: [] }
    var level = machine.getLevel()
    var W = G.wireless
    if (!W || !W.big || typeof W.dialCharge !== 'function' || !W.table || !W.table.maxplusBank) return { kind: 'no_network', args: [] }
    var need = dialNeed(W)
    var dc = W.dialCharge(level.getServer())
    if (W.big.cmp(dc.bankCapacity, need) < 0) return { kind: 'bank', args: [W.fmt(dc.bankCapacity), W.fmt(need)] }
    var short = W.big.sub(need, heldByHatches(W, machine))
    if (W.big.cmp(dc.stored, short) < 0) return { kind: 'charge', args: [W.fmt(dc.stored), W.fmt(short)] }
    return null
  }

  var failed = false

  // the recipe modifier: a dial runs as the row says (2^43 EU/t, no overclock) when the structure holds and the network holds the charge
  function dialModifier(machine, recipe) {
    try {
      var level = machine.getLevel()
      if (level === null || level === undefined) return ModifierFunction.NULL
      var k = remember(machine, level)
      var now = Number(level.getServer().getTickCount())
      var last = refusals[k]
      if (last && now - last.tick < RECHECK_TICKS) return ModifierFunction.NULL
      var v = verdict(machine)
      if (v !== null) {
        refusals[k] = { tick: now, kind: v.kind, args: v.args }
        return ModifierFunction.NULL
      }
      delete refusals[k]
      return ModifierFunction.IDENTITY
    } catch (e) {
      if (!failed) {
        failed = true
        console.error(LOG + 'dial recipe modifier failed: ' + e)
      }
      return ModifierFunction.NULL
    }
  }
  HS.refusal = function (dimension, x, y, z) {
    var r = refusals[String(dimension) + '|' + x + ',' + y + ',' + z]
    return r ? { tick: r.tick, kind: r.kind, args: r.args } : null
  }

  var displayFailed = false

  // the controller's lines (server side only): open, why the last start was refused, and what the dial needs of the network
  function display(controller, list) {
    try {
      if (!controller.isFormed()) return
      var level = controller.getLevel()
      if (level === null || level === undefined || level.isClientSide()) return
      if (isOpen(controller)) list.add(Text.translate('grindless.machine.hyperstargate.open').green())
      var r = refusals[keyOf(level, controller)]
      if (r) list.add(Text.translate('grindless.machine.hyperstargate.refused.' + r.kind, r.args[0], r.args[1]).red())
      var W = G.wireless
      if (W && typeof W.dialCharge === 'function' && W.table && W.table.maxplusBank) {
        var dc = W.dialCharge(level.getServer())
        list.add(Text.translate('grindless.machine.hyperstargate.network', W.fmt(dialNeed(W)), W.fmt(dc.bankCapacity), W.fmt(dc.stored)))
      }
    } catch (e) {
      if (!displayFailed) {
        displayFailed = true
        console.error(LOG + 'controller display failed: ' + e)
      }
    }
  }

  function infoOf(dataKey) {
    return function (data) {
      try {
        var name = String(data.getString(dataKey))
        if (name === '') return ''
        return String(Text.translate('gtceu.recipe.' + dataKey + '.' + name).getString())
      } catch (e) {
        return ''
      }
    }
  }

  // ---------------------------------------------------------------- registry

  StartupEvents.registry('item', function (event) {
    event.create(HS.spent)
      .texture('grindless:item/spent_phase_lock')
      .maxStackSize(64)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.spent_dial_charge.0')))
      .tooltip(Text.darkGray(Text.translate('tooltip.grindless.spent_dial_charge.1')))
  })

  GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) {
    event.create(TYPE)
      .category('multiblock')
      .setEUIO('in')
      .setMaxIOSize(HS.maxIO.itemsIn, HS.maxIO.itemsOut, HS.maxIO.fluidsIn, HS.maxIO.fluidsOut)
      .setProgressBar(GuiTextures.PROGRESS_BAR_ARROW, FillDirection.LEFT_TO_RIGHT)
      .setSound(GTSoundEntries.ARC)
  })

  GTCEuStartupEvents.registry('gtceu:machine', function (event) {
    var type = GTRecipeTypes.get(TYPE)
    if (type == null) throw new Error(LOG + 'recipe type gtceu:' + TYPE + ' is not registered')
    type.addDataInfo(infoOf(KEY))
    HS.spec = G.uivShapes.spec(Pat, { w: W_, h: H_, d: D_, pal: HS.pal, parts: HS.parts(), fn: cell })
    Pat.register(MACHINE, HS.spec)
    var fresh = G.freshRun.afterWorking('hyperstargate')

    event.create('hyperstargate', 'multiblock')
      .langValue('Hyperstargate')
      .rotationState(RotationState.NON_Y_AXIS)
      .recipeType(TYPE)
      .recipeModifier(dialModifier, true)
      // a refused start is looked at again by a fresh search (lib/fresh_run.js)
      .afterWorking(function (machine) { fresh(machine) })
      .appearanceBlock(function () { return Block.getBlock(CASING) })
      .pattern(function (def) { return Pat.build(def, HS.spec) })
      .additionalDisplay(display)
      ['tooltips(net.minecraft.network.chat.Component[])']([
        Text.translate('grindless.machine.hyperstargate.tooltip.0'),
        Text.translate('grindless.machine.hyperstargate.tooltip.1'),
        Text.translate('gtceu.machine.available_recipe_map_1.tooltip', Text.translate('gtceu.' + TYPE))
      ])
      .workableCasingModel('grindless:block/maxplus/horizon_machine_casing', 'grindless:block/multiblock/hyperstargate')
  })
})()
