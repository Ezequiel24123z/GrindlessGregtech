// priority: -5609
// -----------------------------------------------------------------------------------------------
// MAX+ machine 17, the Hyperstargate (docs/eras/maxplus.md "The Hyperstargate", lines 414 to 472; package XP-G1). This file registers:
//
//   gtceu:hyperstargate        59 x 60 x 23, about 9,000 cells, the largest structure in the pack (docs/eras/lines-opv-maxplus.md 6.4, Decision H-1):
//                              a circle of 160 ring cells (151 grindless:hyperstargate_ring_block and the nine locked chevrons, 40 degrees apart)
//                              in the plane z = 11, held in a jacket of horizon gate casing (z 5 to 17) with a primordial cryostat cold channel
//                              round the ring and void diamond windows every 30 degrees, on a stepped pedestal of Fe-56 shield casing with two
//                              cradle buttresses. On the pedestal's front: the controller and the hatches (one 4,096 A wireless MAX+ hatch, the
//                              dial's 2^43 EU/t, and the buses) on the first ledge, the four power units, the horizon iris and the base block
//                              on the risers above it. The disc inside the ring is air, so the plane stays open
//   gtceu:hyperstargate_dial   its recipe type: c1, the dial, 2^43 EU/t for 1,200 t, no overclock and no parallels
//   grindless:spent_dial_charge  what a dial leaves; the condensate refinery recharges it (server_scripts/.../maxplus/hyperstargate.js)
//
// The run-start check (the recipe modifier): GTM does not check a formed structure again when a block is taken out of it, so the modifier checks
// the pattern itself, then the wireless network: the banks must hold one dial (1,200 x 2^43 EU, the table's dialMultiplier and dialExponent) and
// the store, with what the hatch already holds, must cover it. A refused start shows on the controller's lines.
//
// The open state, for XP-Z1b (which does the player check and the teleport): global.grindless.hyperstargate
//   isOpen(machine)            formed and running its dial
//   box(pos, facing)           the interior disc's bounding box in world coordinates { minX, minY, minZ, maxX, maxY, maxZ } (inclusive block
//                              coordinates), plus its centre { x, y, z } (block centres) and radius: the plane is the disc, so the crossing tests
//                              the distance from the centre (maxplus/ending.js)
//   gates()                    [{ dimension, pos: { x, y, z }, facing, open, run, team, box }] of every formed gate that has been asked to start a dial;
//                              team is the controller owner's team id ('server' when it has none): the dial draws on that team's wireless store
//                              and the crossing admits that team (B13-DIAL, #238)
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
  var CASING = 'grindless:fe56_shield_casing'
  var RECHECK_TICKS = 20

  HS.machine = MACHINE
  HS.type = TYPE
  HS.dataKey = KEY
  HS.spent = 'grindless:spent_dial_charge'
  HS.maxIO = { itemsIn: 5, itemsOut: 1, fluidsIn: 0, fluidsOut: 0 }

  // x left to right, y bottom to top, z back (0) to front (22). The gate is a circle of radius 27 round the cell (29, 30) in the plane z = 11
  // (the ring: 26.5 <= d <= 27.5, 160 cells), its disc d < 26.5 open. Round it a jacket of horizon gate casing (H) for z 5 to 17, 27.5 < d <= 29.5,
  // its inner half a primordial cryostat cold channel (C) for z 9 to 13 and void diamond windows (L) every 30 degrees on its outer face and on its
  // front and back faces. Below, a stepped pedestal of Fe-56 shield casing (F), 35 x 23 at the floor to 27 x 15 at the top step, with two cradle
  // buttresses climbing the jacket's lower arc. The controller and the part cells (X) are on the first ledge at the front, the four power units
  // (W), the iris (I) and the base block (G) on the risers above it.
  var W_ = 59
  var H_ = 60
  var D_ = 23
  var MID = 29
  var CY = 30
  var PLANE = 11
  var R_RING = 27
  var R_OPEN = 26.5
  var R_JACKET = 29.5
  var R_CHANNEL = 28.5
  var PEDESTAL_ROWS = 5
  var STEP_X0 = 12
  var STEP_X1 = 46
  var BUTTRESS_SLOPE = 0.342
  var POWER_X = [19, 24, 34, 39]

  function rad(x, y) {
    var dx = x - MID
    var dy = y - CY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // the ring cell nearest to each chevron's position on the circle, every 40 degrees from the top (angles 0, 40, ... 320), fixed: x, y pairs
  var CHEVRONS = [[29, 57], [46, 51], [56, 35], [52, 16], [38, 5], [20, 5], [6, 16], [2, 35], [12, 51]]
  function isChevron(x, y) {
    for (var i = 0; i < CHEVRONS.length; i++) if (CHEVRONS[i][0] == x && CHEVRONS[i][1] == y) return true
    return false
  }
  // a window every 30 degrees, three cells wide, on the outer face (z 8 to 14) and on the front and back faces (z 5 and 17)
  function windowAt(x, y, z, d) {
    var deg = (Math.atan2(x - MID, y - CY) * 180) / Math.PI
    var phase = ((((deg + 15) % 30) + 30) % 30) - 15
    if (Math.abs(phase) > 3) return false
    if (z === 5 || z === 17) return true
    return d > R_CHANNEL && z >= 8 && z <= 14
  }

  // the pedestal: row y spans x 8 + y to 50 - y, z from y (back) to 22 (the ledge rows 0 and 1) or 22 - y (the steps above)
  function onPedestal(x, y, z) {
    if (y >= PEDESTAL_ROWS) return false
    if (x < STEP_X0 + y || x > STEP_X1 - y || z < y) return false
    return z <= (y < 2 ? D_ - 1 : D_ - 1 - y)
  }

  function onButtress(x, y, z, d) {
    if (d <= R_OPEN || d > R_JACKET || y - CY > -BUTTRESS_SLOPE * d) return false
    return (z >= 3 && z <= 4) || (z >= 18 && z <= 20)
  }

  function cell(x, y, z) {
    if (y === 1 && z === D_ - 1 && x >= MID - 4 && x <= MID + 4 && x !== MID) return 'X'
    if (y === 2 && z === D_ - 3) {
      if (x === MID) return 'I'
      if (POWER_X.indexOf(x) >= 0) return 'W'
    }
    if (y === 3 && z === D_ - 4 && x === MID) return 'G'
    var d = rad(x, y)
    if (z === PLANE && Math.abs(d - R_RING) <= 0.5) return isChevron(x, y) ? 'K' : 'R'
    if (d < R_OPEN) return z === PLANE ? '#' : ' '
    if (z >= 5 && z <= 17 && d <= R_JACKET) {
      if (windowAt(x, y, z, d)) return 'L'
      return d <= R_CHANNEL && z >= 9 && z <= 13 ? 'C' : 'H'
    }
    if (onPedestal(x, y, z) || onButtress(x, y, z, d)) return 'F'
    return ' '
  }
  HS.cell = cell

  HS.size = { width: W_, height: H_, depth: D_ }
  HS.pal = {
    F: CASING, H: 'grindless:horizon_gate_casing', C: 'grindless:primordial_cryostat_casing', L: 'grindless:void_diamond_window',
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
  // the open disc's bounding square relative to the controller: up, back (away from the front face), side. The disc is d < 26.5 round (29, 30) in
  // the plane z = 11: 53 x 53 cells in the square.
  var REACH = Math.floor(R_OPEN)
  var CORNERS = [{ up: CY - REACH - 1, back: D_ - 1 - PLANE, side: -REACH }, { up: CY + REACH - 1, back: D_ - 1 - PLANE, side: REACH }]
  var CENTER_UP = CY - 1

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
    var back = D_ - 1 - PLANE
    return { minX: Math.min(xs[0], xs[1]), maxX: Math.max(xs[0], xs[1]), minY: py + CORNERS[0].up, maxY: py + CORNERS[1].up,
      minZ: Math.min(zs[0], zs[1]), maxZ: Math.max(zs[0], zs[1]),
      center: { x: px - fx * back + 0.5, y: py + CENTER_UP + 0.5, z: pz - fz * back + 0.5 }, radius: R_OPEN }
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
  var K_RUNS = 'grindless_hyperstargate_runs'

  function remember(machine, level) {
    var k = keyOf(level, machine)
    known[k] = { machine: machine, level: level, key: k }
    return k
  }

  // the run counter of a gate lives in the world's persistent data (one int per gate key), so a dial that was running at a save is still
  // the same run after the reload, and a pause and resume (SUSPEND) is not a new one: only a recipe start adds one
  function runOf(level, key) {
    try {
      return Number(level.getServer().persistentData.getCompound(K_RUNS).getInt(key))
    } catch (e) {
      return 0
    }
  }

  var hookFailed = false

  // beforeWorking: a dial starts (never on a resume); onWorking: every tick of a running dial, which after a reload puts the gate back in `known`
  function startRun(machine) {
    try {
      var level = machine.getLevel()
      if (level !== null && level !== undefined && !level.isClientSide()) {
        var k = remember(machine, level)
        var pd = level.getServer().persistentData
        var t = pd.getCompound(K_RUNS)
        t.putInt(k, t.getInt(k) + 1)
        pd.put(K_RUNS, t)
      }
    } catch (e) {
      if (!hookFailed) {
        hookFailed = true
        console.error(LOG + 'run counter failed: ' + e)
      }
    }
    return true
  }

  function watch(machine) {
    try {
      var level = machine.getLevel()
      if (level !== null && level !== undefined && !level.isClientSide() && known[keyOf(level, machine)] === undefined) remember(machine, level)
    } catch (e) {
      if (!hookFailed) {
        hookFailed = true
        console.error(LOG + 'gate registration failed: ' + e)
      }
    }
    return true
  }
  HS.forget = function () { known = {} }

  // the team of the controller's owner (lib/teams.js, GTM's machine owner), 'server' when it has none or the team lib is not loaded. The dial's
  // charge and the crossing both go by it (B13-DIAL, #238).
  function teamOf(machine) {
    try {
      var T = G.teams
      return T && typeof T.ofMachine === 'function' ? String(T.ofMachine(machine)) : 'server'
    } catch (e) {
      return 'server'
    }
  }
  HS.teamOf = teamOf

  function describe(entry) {
    var m = entry.machine
    var p = m.getPos()
    var facing = String(m.getFrontFacing()).toLowerCase()
    return { dimension: dimensionOf(entry.level), pos: { x: coord(p, 'x'), y: coord(p, 'y'), z: coord(p, 'z') }, facing: facing, open: isOpen(m), run: runOf(entry.level, entry.key), team: teamOf(m), box: box(p, facing) }
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
    var dc = W.dialCharge(level.getServer(), teamOf(machine))
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
        var dc = W.dialCharge(level.getServer(), teamOf(controller))
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
      .beforeWorking(function (machine, recipe) { return startRun(machine) })
      .onWorking(function (machine) { return watch(machine) })
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
      .workableCasingModel('grindless:block/maxplus/fe56_shield_casing', 'grindless:block/multiblock/hyperstargate')
  })
})()
