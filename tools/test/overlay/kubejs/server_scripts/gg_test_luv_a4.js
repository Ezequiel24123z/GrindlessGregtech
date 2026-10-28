// priority: -3624
// Gregtech Grindless - native fixture of package LuV-A4 (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with
// the pack): the HTS magnet works (startup_scripts/grindless/luv/hts_magnet_works.js, server_scripts/grindless/luv/hts_magnet_works.js,
// kubejs/data/grindless/tables/hts_magnet_works.json) and the wireless network's LuV tier (lv/wireless_energy.js, the LuV row of
// tables/wireless_energy.json), with spike S0-10's two questions (docs/eras/luv.md, "Build order").
//
//   In LuV's single integrated run (tools/test/README.md, "LuV-A4"), beside the lookup test:
//   powershell -NoProfile -ExecutionPolicy Bypass -File tools\test\Invoke-GGTest.ps1 -Suite server -Slots 1 `
//     -Commands 'kubejs custom_command gg_test_luv_a4;;kubejs custom_command gg_test_recipe_lookup' `
//     -WaitForLog 'GGTEST\|luv_a4\|DONE@@180;;GGTEST\|lookup\|DONE@@180'
// It takes its turn on the shared wireless band with the wireless fixtures (the queue `ggTestWirelessQueue` in `global`): the network is
// one per server. A request that has no turn within 120 s fails (TURN) and still ends with DONE. Its plan (every block it places, fills
// and force-loads) is published as global.ggTestLuvA4Plan for tools/analysis/test/luv_a4_fixture.test.mjs, which also runs the whole
// fixture in a simulated server.
//
// Markers: GGTEST|luv_a4|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|luv_a4|DONE.
//   static (no world)
//     registry      the LuV wireless hatches (W.hatchId(kind, 6, amps): gtceu:luv_wireless_energy_hatch / _dynamo_hatch, 2/4/16/64 A) are
//                   GTM machines of tier 6 in INPUT_ENERGY / OUTPUT_ENERGY; grindless:luv_smes_cell is a block and W.cells' tier-6 cell
//                   (W.tierRow[6].cellMadeBy and W.cells[cell].madeBy gtceu:hts_magnet_works, no assembler recipe in W.recipes); the LuV
//                   cover items and their definitions in GTM's cover registry; gtceu:hts_magnet_works runs gtceu:magnet_winding
//     mw_recipes    the four magnet-winding recipes (grindless:magnet_winding/hts_coil c1, luv_smes_cell c2, coilgun_coil_casing c3,
//                   magnetic_bearing c4) in the recipe manager as published: items, the circuit (chance 0), consumed fluids, the
//                   1,000 mB gtceu:liquid_helium charge at chance 0, outputs, EU/t, duration, data key; none skipped; no clash; as many
//                   live recipes of the type as the table publishes (later eras add rows); the controller's grindless:crafting/hts_magnet_works
//   in the world: the Overworld X 15360-15423, Z 0-63, Y 98-112 (roof at Y 112; the magnet works at X 15370-15380, the towers and the
//   LuV machines at X 15396-15412) and Earth orbit (gcyr:overworld_orbit) X 15392-15423, Z 0-63, Y 98-112 (the generator array at
//   X 15396-15404, roof at Y 112), both force-loaded while it runs
//     MW_FORMED     the magnet works from global.grindless.structures, two IV wireless energy hatches, an HV input bus, three HV input
//                   hatches (trinium, epoxy, the helium charge in the cryostat's wall) and an HV output bus in part cells: it forms
//     TWO_HATCH     S0-10 Q1. Tower A (4 IV capacitor cells: the network is IV), the store set to 600,000,000 EU. One IV wireless
//                   hatch (the other cell casing): getMaxVoltage 8,192 and c1 (30,720 EU/t) does not start in 60 ticks, inputs untouched,
//                   the hatch full. Two: getMaxVoltage 32,768 and c1 runs on what the settlement puts in the hatches: one
//                   gtceu:superconducting_coil, 144 mB trinium and 144 mB epoxy consumed exactly, the 1,000 mB of helium still there, and
//                   the EU the hatches gave = the run's EU/t x its ticks
//     ORBIT         S0-10 Q2. In Earth orbit the generator array (steam) with GTM's lv_wireless_dynamo_hatch_64a: it makes EU (exactly
//                   what its steam pays) and the settlement moves 19/20 of it into the network (measured while c1 runs)
//     MULTI_AMP     read-only: two IV 64 A wireless energy hatches: getMaxVoltage 32,768 (the tier gate: two at the highest voltage),
//                   getEnergyContainer().getNumHighestInputContainers() 2, getOverclockVoltage() 524,288 (1,048,576 EU/t folded to 2 A)
//     SMES          c2 runs once on those hatches and makes one grindless:luv_smes_cell, its inputs consumed, the charge kept (GTM's
//                   overclock reads getOverclockVoltage: the run is expected at 150 t x 491,520 EU/t, two non-perfect overclocks; a NOTE
//                   compares, the PASS does not depend on it)
//     JUMP          tower B (2 LuV SMES cells) beside tower A: the network is IV, a LuV wireless energy hatch gets nothing and its readout
//                   is message.grindless.wireless.above_tier [LuV, IV] (GTM's tier names, W.tierLabels); tower A's cells broken: the
//                   network is LuV, its capacity tower
//                   B's cells (W.cells), the LuV hatch is filled; two LuV wireless hatches on the magnet works: getMaxVoltage 131,072
//     LUV_COVERS    after the jump: a LuV energy cover runs a LuV macerator from the network; a LuV dynamo cover drains a charged LuV
//                   battery buffer into the network at 19/20, at most 2 A of LuV per settlement tick
//     cleanup       (NOTE lines; FAIL only on an exception) both bands cleared, item entities removed, force-loads released, the network's
//                   persistent-data keys put back as they were before the test, the queue left
// TEST AREA: this test force-loads, clears and builds ONLY its band in each dimension (AGENTS.md, "HTS magnet works and LuV wireless
// (LuV-A4)"); every write goes through put / fillBox / forceload, which refuse a position outside it.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once); numbers in
// `global` are avoided (KubeJS's global is a Java HashMap: booleans and strings only).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'luv_a4'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestLuvA4Request'
  // the wireless tests share the network: they take turns in the order they were asked for (gg_test_wireless_*.js)
  var QUEUE = 'ggTestWirelessQueue'
  var TURN_WAIT_MS = 120000
  var TEST_TIMEOUT = 3000

  var EARTH = 'minecraft:overworld'
  var ORBIT = 'gcyr:overworld_orbit'
  var BANDS = {}
  BANDS[EARTH] = { x0: 15360, x1: 15423, z0: 0, z1: 63, y0: 98, y1: 112 }
  BANDS[ORBIT] = { x0: 15392, x1: 15423, z0: 0, z1: 63, y0: 98, y1: 112 }
  var ROOF_Y = 112
  var EY = 100
  var OY = 100

  // the Overworld: the magnet works (X 15370-15380, Z 4-8, Y 100-104), the towers (X 15396-15398 and 15404-15406, Z 20-22, Y 100-107),
  // the LuV hatch, macerator and battery buffer (Z 4); Earth orbit: the generator array (X 15396-15404, Z 4-6, Y 99-102)
  var MW_AT = { x: 15375, y: EY, z: 4 }
  var TOWER_A = { x: 15397, y: EY, z: 20 }
  var TOWER_B = { x: 15405, y: EY, z: 20 }
  var LUV_HATCH = { x: 15400, y: EY, z: 4 }
  var LUV_MAC = { x: 15406, y: EY, z: 4 }
  var LUV_BUF = { x: 15412, y: EY, z: 4 }
  var ARRAY_AT = { x: 15400, y: OY, z: 4 }

  var IV = 5
  var LUV = 6
  var TOWER_A_CELLS = 4
  var TOWER_B_CELLS = 2
  var STORE0 = 600000000
  var ONE_HOLD = 60
  var MIN_ORBIT_WINDOW = 200
  var COVER_WINDOW = 100

  var MW_ID = 'gtceu:hts_magnet_works'
  var TYPE = 'gtceu:magnet_winding'
  var BUS_IN = 'gtceu:hv_input_bus'
  var BUS_OUT = 'gtceu:hv_output_bus'
  var FLUID_IN = 'gtceu:hv_input_hatch'
  var COIL = 'gtceu:superconducting_coil'
  var ARRAY_ID = 'gtceu:generator_array'
  var ARRAY_IN = 'gtceu:hv_input_hatch'
  var ARRAY_OUT = 'gtceu:lv_output_hatch'
  var STEAM = 'gtceu:steam'
  var MACERATOR = 'gtceu:luv_macerator'
  var BUFFER = 'gtceu:luv_battery_buffer_4x'
  var BATTERY = 'gtceu:luv_vanadium_battery'
  var MAC_INPUT = 'minecraft:iron_ingot'
  // the four recipes of the design and their circuits (docs/eras/luv.md, "3. HTS magnet works")
  var WANT_RECIPES = { hts_coil: 1, luv_smes_cell: 2, coilgun_coil_casing: 3, magnetic_bearing: 4 }
  // the magnet works' part cells this test uses: [slice (negative: from the front), row, column] of lib/patterns.js's description
  var MW_CELLS = {
    hatchA: [-1, 0, 0], hatchB: [-1, 0, 1], bus: [-1, 0, 2], fluid1: [-1, 0, 3], fluid2: [-1, 0, 4], out: [-1, 0, 6], helium: [-2, 1, 1]
  }

  var S = null
  var J = null
  // the plan's recorder: while it is a list, put / fillBox / forceload record instead of acting
  var SINK = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    if (S !== null && S.reported) S.reported[name] = true
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  function guarded(name, fn) {
    try {
      fn()
    } catch (e) {
      check(name, false, 'exception: ' + e)
    }
  }

  // the turn queue: test names joined by commas in `global` (a plain string survives the scripts' reloads)
  function queueList() {
    var s = global[QUEUE]
    s = s === undefined || s === null ? '' : String(s)
    return s === '' ? [] : s.split(',')
  }
  function joinQueue(name) {
    var q = queueList()
    if (q.indexOf(name) < 0) q.push(name)
    global[QUEUE] = q.join(',')
  }
  function leaveQueue(name) {
    global[QUEUE] = queueList().filter(function (n) { return n !== name }).join(',')
  }
  function myTurn(name) {
    return queueList()[0] === name
  }

  // ---------------------------------------------------------------- Java and the pack's objects

  function lazy() {
    if (J !== null) return J
    J = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
      Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
      BHR: Java.loadClass('net.minecraft.world.phys.BlockHitResult'),
      Hand: Java.loadClass('net.minecraft.world.InteractionHand'),
      ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
      ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      FPF: Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory'),
      FH: Java.loadClass('net.minecraftforge.common.ForgeHooks'),
      Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
      AL: Java.loadClass('java.util.ArrayList'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      PartAbility: Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.PartAbility'),
      GTCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.GTCapabilityHelper'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
      Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour')
    }
    return J
  }

  // the network's startup object (ids, table): enough for the layout
  function wireless() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.hatchId !== 'function') throw new Error('global.grindless.wireless is missing (startup_scripts/grindless/lv/wireless_energy.js)')
    return w
  }

  // the network with its server side (store, settlement, readout)
  function W() {
    var w = wireless()
    if (typeof w.settle !== 'function' || typeof w.setStored !== 'function') throw new Error('global.grindless.wireless is incomplete (the server script did not load)')
    return w
  }

  function MWD() {
    return (global.grindless && global.grindless.htsMagnetWorks) || {}
  }

  function published(name) {
    var list = MWD().recipes || []
    for (var i = 0; i < list.length; i++) if (list[i].name === name) return list[i]
    return null
  }

  function skippedReason(name) {
    var list = MWD().skipped || []
    for (var i = 0; i < list.length; i++) if (list[i].name === name) return String(list[i].reason)
    return 'not in the table'
  }

  function V(tier) {
    return Number(GTValues.V[tier])
  }

  // a tier as the network's readout names it: GTM's name (W.tierLabels: 'LuV'), else the row's name in capitals (lv/wireless_energy.js)
  function tierLabel(tier) {
    var w = wireless()
    return String((w.tierLabels && w.tierLabels[tier]) || String(w.tierNames[tier] || '?').toUpperCase())
  }

  // what a LuV hatch's readout says while the network is IV
  function aboveTierReadout() {
    return 'message.grindless.wireless.above_tier [' + tierLabel(LUV) + ', ' + tierLabel(IV) + ']'
  }

  function rl(id) { return new (lazy().RL)(id) }
  function bp(x, y, z) { return new (lazy().BlockPos)(x, y, z) }
  function levelOf(dim) { return dim === ORBIT ? S.orbit : S.earth }
  function cmd(dim, text) { return S.server.runCommandSilent('execute in ' + dim + ' run ' + text) }
  function short(id) { return String(id).replace(/^(gtceu|grindless|minecraft):/, '') }
  function fmt(n) { return String(Math.round(n)) }

  function asArray(coll) {
    var list = new (lazy().AL)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function machineAt(dim, p) {
    var m = lazy().MetaMachine.getMachine(levelOf(dim), bp(p.x, p.y, p.z))
    return m === null || m === undefined ? null : m
  }

  function storedIn(m) {
    return m === null ? -1 : Number(m.energyContainer.getEnergyStored())
  }

  function textOf(c) {
    if (c === null || c === undefined) return ''
    return typeof c === 'string' ? c : (c.getString ? String(c.getString()) : String(c))
  }

  // ---------------------------------------------------------------- the layout (the run and the published plan both read it)

  function structure(id) {
    var s = global.grindless && global.grindless.structures && global.grindless.structures[id]
    if (!s) throw new Error('no plain-data structure for ' + id + ' in global.grindless.structures')
    return s
  }

  // every cell of a registered structure whose controller stands at p facing north (the structure behind it, to the south)
  function cellsOf(id, p) {
    var desc = structure(id)
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var s = desc.symbols[row.charAt(ci)]
          if (s && s.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (ctrl === null) throw new Error(id + ' has no controller cell')
    var out = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          out.push({ x: p.x - (ci - ctrl.ci), y: p.y + (ri - ctrl.ri), z: p.z - (si - ctrl.si), si: si, ri: ri, ci: ci, sym: desc.symbols[ch] })
        }
      })
    })
    return out
  }

  // the description's own block for a cell: a frame's first material, a block list's first block, a oneOf's first plain block
  function defaultBlock(sym) {
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    if (sym.kind === 'blocks') return sym.blocks[0]
    if (sym.kind === 'oneOf') {
      for (var k = 0; k < sym.options.length; k++) if (sym.options[k].kind === 'blocks') return sym.options[k].blocks[0]
    }
    return null
  }

  function takesEnergyPart(sym) {
    return !!sym && sym.kind === 'oneOf' && sym.options.some(function (o) { return o.kind === 'part' && o.ability === 'energy_input' })
  }

  function north(id) {
    return id + '[facing=north]'
  }

  function layout() {
    var w = wireless()
    var L = {}
    L.ivHatch = w.hatchId('hatch', IV, 2)
    L.ivHatch64 = w.hatchId('hatch', IV, 64)
    L.luvHatch = w.hatchId('hatch', LUV, 2)
    L.arrayDynamo = w.hatchId('dynamo', 1, 64)
    L.ivCell = (w.tierRow[IV] || {}).cell
    L.luvCell = (w.tierRow[LUV] || {}).cell || null
    var MW = MWD()
    L.casing = (MW.blocks && MW.blocks.casing) || 'gtceu:frostproof_machine_casing'

    var desc = structure(MW_ID)
    var cells = cellsOf(MW_ID, MW_AT)
    var at = {}
    Object.keys(MW_CELLS).forEach(function (k) {
      var c = MW_CELLS[k]
      var si = c[0] < 0 ? desc.slices.length + c[0] : c[0]
      var hit = cells.filter(function (m) { return m.si === si && m.ri === c[1] && m.ci === c[2] })[0]
      if (!hit || !takesEnergyPart(hit.sym)) throw new Error('the magnet works\' cell ' + k + ' (slice ' + si + ', row ' + c[1] + ', column ' + c[2] + ') is not a part cell')
      at[k] = { x: hit.x, y: hit.y, z: hit.z }
    })
    L.mw = { ctrl: MW_AT, cells: cells, at: at }
    // what each part cell holds when the magnet works is built
    L.mwParts = { hatchA: L.ivHatch, hatchB: L.ivHatch, bus: BUS_IN, fluid1: FLUID_IN, fluid2: FLUID_IN, out: BUS_OUT, helium: FLUID_IN }

    function swap(clear, place, expect) {
      return {
        clear: clear.map(function (k) { return at[k] }),
        place: place.map(function (q) { return { p: at[q[0]], id: q[1], block: q[1] === L.casing ? q[1] : north(q[1]) } }),
        expect: expect
      }
    }
    L.swaps = {
      // one IV hatch: the second cell back to casing
      one: swap(['hatchB'], [['hatchB', L.casing]], [L.ivHatch]),
      two: swap(['hatchB'], [['hatchB', L.ivHatch]], [L.ivHatch, L.ivHatch]),
      multi: swap(['hatchA', 'hatchB'], [['hatchA', L.ivHatch64], ['hatchB', L.ivHatch64]], [L.ivHatch64, L.ivHatch64]),
      luv: swap(['hatchA', 'hatchB'], [['hatchA', L.luvHatch], ['hatchB', L.luvHatch]], [L.luvHatch, L.luvHatch])
    }
    L.swapOrder = ['one', 'two', 'multi', 'luv']

    L.towerA = { ctrl: TOWER_A, cells: cellsOf(w.towerId, TOWER_A) }
    L.towerB = { ctrl: TOWER_B, cells: cellsOf(w.towerId, TOWER_B) }
    L.towerASlots = L.towerA.cells.filter(function (c) { return c.sym.kind === 'oneOf' }).slice(0, TOWER_A_CELLS)

    var arrayCells = cellsOf(ARRAY_ID, ARRAY_AT)
    var arrayDesc = structure(ARRAY_ID)
    var arrayFront = arrayDesc.slices.length - 1
    function floor(ci) {
      var hit = arrayCells.filter(function (c) { return c.si === arrayFront && c.ri === 0 && c.ci === ci })[0]
      if (!hit) throw new Error('the generator array has no front floor cell ' + ci)
      return { x: hit.x, y: hit.y, z: hit.z }
    }
    // its front floor row: the steam input hatch (column 0), the dynamo hatch under the controller (4), the water output hatch (8)
    L.array = { ctrl: ARRAY_AT, cells: arrayCells, input: floor(0), dynamo: floor(4), output: floor(8) }
    return L
  }

  // ---------------------------------------------------------------- every world write of this test (refused outside the band)

  function inBand(dim, x, y, z) {
    var b = BANDS[dim]
    return !!b && x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1 && y >= b.y0 && y <= b.y1
  }

  function put(dim, x, y, z, block, failed) {
    if (!inBand(dim, x, y, z)) throw new Error('refused: ' + dim + ' ' + x + ',' + y + ',' + z + ' is outside this test\'s band')
    if (SINK !== null) {
      SINK.push({ op: 'set', dim: dim, x: x, y: y, z: z, block: String(block) })
      return
    }
    if (Number(cmd(dim, 'setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')) >= 1) return
    // setblock changes nothing (and returns 0) when that block is already there
    var want = String(block).split('[')[0]
    if (want.indexOf(':') < 0) want = 'minecraft:' + want
    var have = String(levelOf(dim).getBlock(x, y, z).id)
    if (have !== want) failed.push(dim + ' ' + x + ',' + y + ',' + z + ' ' + block + ' (is ' + have + ')')
  }

  function fillBox(dim, b, block) {
    if (!inBand(dim, b.x0, b.y0, b.z0) || !inBand(dim, b.x1, b.y1, b.z1)) throw new Error('refused: fill ' + dim + ' ' + JSON.stringify(b) + ' leaves this test\'s band')
    if (SINK !== null) {
      SINK.push({ op: 'fill', dim: dim, x0: b.x0, y0: b.y0, z0: b.z0, x1: b.x1, y1: b.y1, z1: b.z1, block: String(block) })
      return 0
    }
    return Number(cmd(dim, 'fill ' + b.x0 + ' ' + b.y0 + ' ' + b.z0 + ' ' + b.x1 + ' ' + b.y1 + ' ' + b.z1 + ' ' + block))
  }

  // the whole band of a dimension, force-loaded (add) or released
  function forceload(dim, add) {
    var b = BANDS[dim]
    if (SINK !== null) {
      SINK.push({ op: 'forceload', dim: dim, add: add, x0: b.x0, z0: b.z0, x1: b.x1, z1: b.z1 })
      return 0
    }
    return cmd(dim, 'forceload ' + (add ? 'add ' : 'remove ') + b.x0 + ' ' + b.z0 + ' ' + b.x1 + ' ' + b.z1)
  }

  // vanilla's fill takes at most 32,768 blocks: the band (up to 64 x 64 x 15) goes in strips of 16 along Z
  function fillBand(dim, y0, y1, block) {
    var b = BANDS[dim]
    var n = 0
    for (var z = b.z0; z <= b.z1; z += 16) n += fillBox(dim, { x0: b.x0, y0: y0, z0: z, x1: b.x1, y1: y1, z1: Math.min(z + 15, b.z1) }, block)
    return n
  }

  function dropItems(dim) {
    var b = BANDS[dim]
    var list = levelOf(dim).getEntitiesOfClass(lazy().ItemEntity, new (lazy().AABB)(b.x0, b.y0, b.z0, b.x1 + 1, b.y1 + 1, b.z1 + 1))
    for (var i = 0; i < list.size(); i++) list.get(i).discard()
    return Number(list.size())
  }

  // generated, force-loaded, cleared, a roof against the shared rain (GTM's machines check it)
  function prepareArea(dim) {
    var b = BANDS[dim]
    if (SINK === null) {
      var level = levelOf(dim)
      for (var cx = b.x0 >> 4; cx <= b.x1 >> 4; cx++) {
        for (var cz = b.z0 >> 4; cz <= b.z1 >> 4; cz++) level.getChunk(cx, cz)
      }
    }
    var loaded = forceload(dim, true)
    var cleared = fillBand(dim, b.y0, b.y1, 'minecraft:air')
    fillBand(dim, ROOF_Y, ROOF_Y, 'minecraft:smooth_stone')
    return dim + ' X ' + b.x0 + '-' + b.x1 + ' Y ' + b.y0 + '-' + b.y1 + ' Z ' + b.z0 + '-' + b.z1 + ': generated, forceload add ' + loaded + ', cleared ' + cleared +
      ', roof at Y ' + ROOF_Y
  }

  function clearArea(dim) {
    forceload(dim, true)
    // the machines drop their contents (batteries, covers, outputs) when they go: removed before and after the fill
    var items = SINK === null ? dropItems(dim) : 0
    var cleared = fillBand(dim, BANDS[dim].y0, BANDS[dim].y1, 'minecraft:air')
    if (SINK === null) items += dropItems(dim)
    var released = forceload(dim, false)
    return dim + ': cleared ' + cleared + ' blocks, ' + items + ' item entities removed, forceload remove ' + released
  }

  // ---------------------------------------------------------------- building

  function buildMagnetWorks(L, failed) {
    var parts = {}
    Object.keys(L.mw.at).forEach(function (k) {
      var p = L.mw.at[k]
      parts[p.x + ',' + p.y + ',' + p.z] = L.mwParts[k]
    })
    L.mw.cells.forEach(function (c) {
      var kind = c.sym.kind
      if (kind === 'controller' || kind === 'air' || kind === 'any') return
      var id = parts[c.x + ',' + c.y + ',' + c.z]
      put(EARTH, c.x, c.y, c.z, id ? north(id) : defaultBlock(c.sym), failed)
    })
    put(EARTH, MW_AT.x, MW_AT.y, MW_AT.z, north(MW_ID), failed)
  }

  // a tower: its first `n` cell slots take `cellId`, the rest the tower's casing (an empty slot)
  function buildTower(t, cellId, n, failed) {
    var w = wireless()
    var used = 0
    t.cells.forEach(function (c) {
      var kind = c.sym.kind
      if (kind === 'controller' || kind === 'air' || kind === 'any') return
      var id = defaultBlock(c.sym)
      if (kind === 'oneOf') {
        id = used < n ? cellId : w.casing
        used++
      }
      put(EARTH, c.x, c.y, c.z, id, failed)
    })
    put(EARTH, t.ctrl.x, t.ctrl.y, t.ctrl.z, north(w.towerId), failed)
  }

  function buildArray(L, failed) {
    var A = L.array
    var special = {}
    special[A.input.x + ',' + A.input.y + ',' + A.input.z] = north(ARRAY_IN)
    special[A.dynamo.x + ',' + A.dynamo.y + ',' + A.dynamo.z] = north(L.arrayDynamo)
    special[A.output.x + ',' + A.output.y + ',' + A.output.z] = north(ARRAY_OUT)
    A.cells.forEach(function (c) {
      var kind = c.sym.kind
      if (kind === 'controller' || kind === 'air' || kind === 'any') return
      put(ORBIT, c.x, c.y, c.z, special[c.x + ',' + c.y + ',' + c.z] || defaultBlock(c.sym), failed)
    })
    put(ORBIT, A.ctrl.x, A.ctrl.y, A.ctrl.z, north(ARRAY_ID), failed)
  }

  function buildAll(L, opts, failed) {
    buildMagnetWorks(L, failed)
    buildTower(L.towerA, L.ivCell, TOWER_A_CELLS, failed)
    if (opts.luv) {
      buildTower(L.towerB, L.luvCell, TOWER_B_CELLS, failed)
      put(EARTH, LUV_HATCH.x, LUV_HATCH.y, LUV_HATCH.z, north(L.luvHatch), failed)
      put(EARTH, LUV_MAC.x, LUV_MAC.y, LUV_MAC.z, north(MACERATOR), failed)
      put(EARTH, LUV_BUF.x, LUV_BUF.y, LUV_BUF.z, north(BUFFER), failed)
    }
    if (opts.orbit) buildArray(L, failed)
  }

  function applyClear(sw, failed) {
    sw.clear.forEach(function (p) { put(EARTH, p.x, p.y, p.z, 'minecraft:air', failed) })
  }

  function applyPlace(sw, failed) {
    sw.place.forEach(function (q) { put(EARTH, q.p.x, q.p.y, q.p.z, q.block, failed) })
  }

  // tower A's cells broken, as a player would: the hole unforms it
  function breakTowerA(L, failed) {
    L.towerASlots.forEach(function (c) { put(EARTH, c.x, c.y, c.z, 'minecraft:air', failed) })
  }

  // every world write the run can make, in its order, recorded instead of done: { op: 'set' | 'fill' | 'forceload', dim, ... }, with
  // { op: 'mark', name } where a structure is complete (tools/analysis/test/luv_a4_fixture.test.mjs checks them against the band and
  // the patterns)
  function plan() {
    var L = layout()
    var ops = []
    var none = []
    SINK = ops
    try {
      prepareArea(EARTH)
      prepareArea(ORBIT)
      buildAll(L, { luv: true, orbit: true }, none)
      ops.push({ op: 'mark', name: 'built' })
      L.swapOrder.forEach(function (name) {
        applyClear(L.swaps[name], none)
        applyPlace(L.swaps[name], none)
        ops.push({ op: 'mark', name: 'swap:' + name })
      })
      breakTowerA(L, none)
      ops.push({ op: 'mark', name: 'tower_a_broken' })
      clearArea(ORBIT)
      clearArea(EARTH)
      ops.push({ op: 'mark', name: 'cleared' })
    } finally {
      SINK = null
    }
    return ops
  }
  global.ggTestLuvA4Plan = plan

  // ---------------------------------------------------------------- recipes (read the way gg_test_heavy_water_plant.js does)

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  function itemName(stack) {
    try {
      return String(lazy().Registries.ITEMS.getKey(stack.getItem()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  function fluidName(stack) {
    try {
      return String(lazy().Registries.FLUIDS.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  // one side's items with their chance: [{ id, count, chance, maxChance, circuit }]
  function itemContents(recipe, input) {
    var c = lazy()
    var contents = asArray(input ? recipe.getInputContents(c.ItemCap) : recipe.getOutputContents(c.ItemCap))
    var stacks = asArray(input ? c.RecipeHelper.getInputItems(recipe) : c.RecipeHelper.getOutputItems(recipe))
    return stacks.map(function (st, i) {
      var circuit = c.Circuit.isIntegratedCircuit(st) ? Number(c.Circuit.getCircuitConfiguration(st)) : 0
      return { id: itemName(st), count: Number(st.getCount()), chance: Number(contents[i].chance), maxChance: Number(contents[i].maxChance), circuit: circuit }
    })
  }

  // one side's fluids with their chance (RecipeHelper keeps the order of the contents): [{ id, amount, chance, maxChance }]
  function fluidContents(recipe, input) {
    var c = lazy()
    var contents = asArray(input ? recipe.getInputContents(c.FluidCap) : recipe.getOutputContents(c.FluidCap))
    var stacks = asArray(input ? c.RecipeHelper.getInputFluids(recipe) : c.RecipeHelper.getOutputFluids(recipe))
    return stacks.map(function (st, i) {
      return { id: fluidName(st), amount: Number(st.getAmount()), chance: Number(contents[i].chance), maxChance: Number(contents[i].maxChance) }
    })
  }

  // EU/t a recipe takes (negative when it makes EU)
  function inputEUt(recipe) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(recipe)
    if (io.isEmpty()) return 0
    return io.isInput() ? Number(io.getTotalEU()) : -Number(io.getTotalEU())
  }

  // ---------------------------------------------------------------- static checks

  function abilityBlocks(ability) {
    var out = {}
    var L = lazy()
    asArray(ability.getAllBlocks()).forEach(function (b) { out[String(L.BI.BLOCK.getKey(b))] = true })
    return out
  }

  function checkRegistry() {
    var w = W()
    var L = lazy()
    var bad = []
    var row = w.tierRow[LUV]
    if (!row) bad.push('no tier-' + LUV + ' row in global.grindless.wireless (tables/wireless_energy.json)')
    if (String(w.tierNames[LUV]) !== 'luv') bad.push('tierNames[' + LUV + '] is ' + w.tierNames[LUV])
    var ins = abilityBlocks(L.PartAbility.INPUT_ENERGY)
    var outs = abilityBlocks(L.PartAbility.OUTPUT_ENERGY)
    var hatches = []
    w.hatchKindList.forEach(function (kind) {
      w.hatchAmps.forEach(function (amps) {
        var id = w.hatchId(kind, LUV, amps)
        var want = 'gtceu:luv_wireless_' + (kind === 'hatch' ? 'energy' : 'dynamo') + '_hatch' + (amps === 2 ? '' : '_' + amps + 'a')
        if (id !== want) bad.push('hatchId(' + kind + ', 6, ' + amps + ') is ' + id + ', not ' + want)
        hatches.push(short(id))
        var h = w.hatches[id]
        if (!h || h.tier !== LUV || h.amps !== amps || h.kind !== kind) bad.push(id + ' is not a tier-6 ' + kind + ' of ' + amps + ' A in W.hatches')
        var def = L.GTRegistries.MACHINES.get(rl(id))
        if (def === null || def === undefined) {
          bad.push('no machine ' + id)
          return
        }
        if (Number(def.getTier()) !== LUV) bad.push(id + ' tier ' + def.getTier())
        if (kind === 'hatch' && !ins[id]) bad.push(id + ' lacks INPUT_ENERGY')
        if (kind === 'dynamo' && !outs[id]) bad.push(id + ' lacks OUTPUT_ENERGY')
      })
    })
    var cellId = row ? String(row.cell) : 'none'
    var cell = w.cells[cellId]
    if (cellId !== 'grindless:luv_smes_cell') bad.push('the tier-6 cell is ' + cellId + ', not grindless:luv_smes_cell')
    if (!L.BI.BLOCK.containsKey(rl('grindless:luv_smes_cell'))) bad.push('no block grindless:luv_smes_cell')
    if (!cell || cell.tier !== LUV || !(cell.capacity > 0) || (row && cell.capacity !== row.capacity)) bad.push('W.cells[' + cellId + '] is ' + JSON.stringify(cell || null))
    if (w.cellIds.indexOf(cellId) < 0) bad.push(cellId + ' is not in W.cellIds (the tower would not take it)')
    if (!row || row.cellMadeBy !== MW_ID) bad.push('cellMadeBy is ' + (row ? row.cellMadeBy : 'missing') + ', not ' + MW_ID)
    if (!cell || cell.madeBy !== MW_ID) bad.push('W.cells[' + cellId + '].madeBy is ' + (cell ? cell.madeBy : 'missing') + ', not ' + MW_ID)
    var assembled = (w.recipes || []).filter(function (r) { return r.output === cellId }).map(function (r) { return r.id })
    if (assembled.length > 0) bad.push('the LuV cell has an assembler recipe: ' + assembled.join(', '))
    var covers = []
    w.coverKindList.forEach(function (kind) {
      var item = w.coverItemId(kind, LUV)
      var want = 'grindless:luv_wireless_' + kind + '_cover'
      if (item !== want) bad.push('coverItemId(' + kind + ', 6) is ' + item + ', not ' + want)
      if (!Item.exists(item)) bad.push('no item ' + item)
      var c = w.coverItems[item]
      if (!c || c.tier !== LUV || c.kind !== kind) bad.push(item + ' is not a tier-6 ' + kind + ' cover in W.coverItems')
      var defId = w.coverDefId(kind, LUV)
      var def = L.GTRegistries.COVERS.get(rl(defId))
      if (def === null || def === undefined) bad.push('no cover definition ' + defId + ' in GTM\'s cover registry')
      covers.push(short(item) + ' (' + defId + ')')
    })
    var mdef = L.GTRegistries.MACHINES.get(rl(MW_ID))
    var types = []
    if (mdef === null || mdef === undefined) bad.push('no machine ' + MW_ID)
    else {
      var arr = mdef.getRecipeTypes()
      for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
      if (types.indexOf(TYPE) < 0) bad.push(MW_ID + ' runs ' + types.join(','))
    }
    var type = L.GTRegistries.RECIPE_TYPES.get(rl(TYPE))
    if (type === null || type === undefined) bad.push('no recipe type ' + TYPE)
    if (MWD().machine !== MW_ID || MWD().recipeType !== TYPE) bad.push('global.grindless.htsMagnetWorks publishes ' + MWD().machine + ' / ' + MWD().recipeType)
    check('registry', bad.length === 0, hatches.length + ' LuV wireless hatches [' + hatches.join(', ') + '] in GTM\'s ability lists; ' + cellId + ' (' +
      (cell ? cell.capacity + ' EU, tier ' + cell.tier : 'no cell') + ', made by ' + (row ? row.cellMadeBy : '?') + '); covers ' + covers.join(', ') + '; ' + MW_ID +
      ' runs ' + types.join(',') + (bad.length ? ' BAD ' + bad.join('; ') : ''))
  }

  function checkMwRecipes() {
    var MW = MWD()
    var problems = []
    var lines = []
    var charge = MW.charge || {}
    if (charge.id !== 'gtceu:liquid_helium' || charge.amount !== 1000) problems.push('the charge is ' + JSON.stringify(charge))
    if ((MW.clashes || []).length > 0) problems.push('clashes: ' + MW.clashes.join('; '))
    Object.keys(WANT_RECIPES).forEach(function (name) {
      var rec = published(name)
      if (rec === null) {
        problems.push(name + ' not published (' + skippedReason(name) + ')')
        return
      }
      var wantId = 'grindless:magnet_winding/' + name
      if (rec.recipeId !== wantId || rec.circuit !== WANT_RECIPES[name] || rec.charge !== true) {
        problems.push(name + ' published as ' + rec.recipeId + ', circuit ' + rec.circuit + ', charge ' + rec.charge)
      }
      var r = liveRecipe(wantId)
      if (r === null) {
        problems.push(wantId + ' not in the recipe manager')
        return
      }
      var items = itemContents(r, true)
      var circuit = items.filter(function (x) { return x.circuit > 0 })
      var ins = items.filter(function (x) { return x.circuit === 0 })
      if (circuit.length !== 1 || circuit[0].circuit !== WANT_RECIPES[name] || circuit[0].chance !== 0) problems.push(name + ' circuit ' + JSON.stringify(circuit))
      var wantIn = rec.itemsIn.map(function (x) { return x.id + ' x' + x.count }).sort().join(',')
      var gotIn = ins.map(function (x) { return x.id + ' x' + x.count + (x.chance >= x.maxChance ? '' : ' @' + x.chance) }).sort().join(',')
      if (wantIn !== gotIn) problems.push(name + ' items in ' + gotIn + ' (want ' + wantIn + ')')
      var fin = fluidContents(r, true)
      var consumed = fin.filter(function (f) { return f.chance >= f.maxChance })
      var kept = fin.filter(function (f) { return f.chance === 0 })
      var wantConsumed = rec.fluidsIn.map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')
      if (consumed.map(function (f) { return f.id + ' ' + f.amount }).sort().join(',') !== wantConsumed || consumed.length + kept.length !== fin.length) {
        problems.push(name + ' fluids in ' + JSON.stringify(fin))
      }
      if (kept.map(function (f) { return f.id + ' ' + f.amount }).join(',') !== charge.id + ' ' + charge.amount) problems.push(name + ' not consumed: ' + JSON.stringify(kept))
      var wantOut = rec.itemsOut.map(function (x) { return x.id + ' x' + x.count }).sort().join(',')
      var gotOut = itemContents(r, false).map(function (x) { return x.id + ' x' + x.count + (x.chance >= x.maxChance ? '' : ' @' + x.chance) }).sort().join(',')
      if (wantOut !== gotOut) problems.push(name + ' items out ' + gotOut + ' (want ' + wantOut + ')')
      if (fluidContents(r, false).length !== 0) problems.push(name + ' has fluid outputs')
      var eut = inputEUt(r)
      if (eut !== rec.eut || Number(r.duration) !== rec.duration) problems.push(name + ' ' + eut + ' EU/t x ' + r.duration + ' t (published ' + rec.eut + ' x ' + rec.duration + ')')
      var key = String(r.data.getString(MW.dataKey))
      if (key !== name) problems.push(name + ' data ' + MW.dataKey + '=' + key)
      lines.push(name + ' c' + rec.circuit + ': ' + gotIn + ' + ' + wantConsumed + ' -> ' + gotOut + ', ' + eut + ' EU/t x ' + r.duration + ' t')
    })
    var L = lazy()
    var type = L.GTRegistries.RECIPE_TYPES.get(rl(TYPE))
    var live = type === null || type === undefined ? -1 : asArray(S.server.getRecipeManager().getAllRecipesFor(type)).length
    // later eras add rows to the table (UIV-A8: seeded_gdbco_growth c5): every published recipe is live, and nothing else
    var publishedCount = (MW.recipes || []).length
    if (live !== publishedCount) problems.push(live + ' live ' + TYPE + ' recipes (want ' + publishedCount + ', the published table)')
    var crafting = MW.craftingRecipe || 'grindless:crafting/hts_magnet_works'
    if (crafting !== 'grindless:crafting/hts_magnet_works' || liveRecipe(crafting) === null) problems.push('the controller recipe ' + crafting + ' is missing')
    check('mw_recipes', problems.length === 0, lines.join(' ; ') + '; every one keeps ' + charge.amount + ' mB ' + short(charge.id) + ' at chance 0; ' + live +
      ' live recipes of ' + TYPE + '; ' + crafting + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  // ---------------------------------------------------------------- machines

  function mwCtrl() { return machineAt(EARTH, MW_AT) }
  function part(name) { return machineAt(EARTH, S.L.mw.at[name]) }

  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return { id: st.isEmpty() ? 'none' : fluidName(st), amount: st.isEmpty() ? 0 : Number(st.getAmount()) }
  }

  function setTank(hatch, id, amount) {
    // a FluidStack built by KubeJS: setFluidInTank ignores one built outside it
    if (amount <= 0) hatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    else hatch.tank.setFluidInTank(0, Fluid.of(id, amount).getFluidStack())
  }

  function readInv(inv) {
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemName(st)
      counts[id] = (counts[id] || 0) + Number(st.getCount())
    }
    return counts
  }

  function emptyInv(inv) {
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, lazy().ItemStack.EMPTY)
  }

  function insert(inv, id, n) {
    var left = n
    for (var s = 0; s < inv.getSlots() && left > 0; s++) {
      var rest = inv.insertItem(s, Item.of(id, left), false)
      left = rest.isEmpty() ? 0 : Number(rest.getCount())
    }
    if (left > 0) throw new Error('could only insert ' + (n - left) + ' of ' + n + ' ' + id)
  }

  function countIn(inv, id) {
    return readInv(inv)[id] || 0
  }

  function totalIn(inv) {
    var c = readInv(inv)
    return Object.keys(c).reduce(function (a, k) { return a + c[k] }, 0)
  }

  function summary(counts) {
    var keys = Object.keys(counts)
    return keys.length === 0 ? 'empty' : keys.map(function (k) { return short(k) + ' x' + counts[k] }).join(', ')
  }

  function wake(m) {
    try {
      m.getRecipeLogic().updateTickSubscription()
    } catch (e) { /* the check reports what did not run */ }
  }

  function statusOf(m) {
    return String(m.getRecipeLogic().getStatus())
  }

  function state(m) {
    try {
      var rlg = m.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() + ' last=' + (last ? last.id : 'none')
    } catch (e) {
      return 'state unreadable: ' + e
    }
  }

  function failureReasons(m) {
    try {
      return asArray(m.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
    } catch (e) {
      return ['unreadable: ' + e]
    }
  }

  function partIds(ctrl) {
    return asArray(ctrl.getParts()).map(function (p) { return String(p.getDefinition().getId()) })
  }

  // the wireless hatches among a controller's parts
  function energyPartIds(ctrl) {
    var w = wireless()
    return partIds(ctrl).filter(function (id) { return !!w.hatches[id] })
  }

  function sameIds(a, b) {
    return a.slice().sort().join(',') === b.slice().sort().join(',')
  }

  function formedOrForce(name, m, waited, after) {
    if (m === null) return 'missing'
    if (m.isFormed()) return 'formed'
    if (waited < after) return 'waiting'
    if (m.checkPatternWithLock()) {
      m.setFlipped(m.getMultiblockState().isNeededFlip())
      m.onStructureFormed()
      note(name + '_forced', 'not formed by itself after ' + waited + ' ticks; a synchronous check passes (forming it)')
      return 'formed'
    }
    return waited > after + 200 ? 'failed: ' + m.getMultiblockState().error : 'waiting'
  }

  // formed, and GTM has checked its structure since (its structure cache is there)
  function checked(m) {
    if (m === null || !m.isFormed()) return false
    var ms = m.getMultiblockState()
    return ms.cache !== null && ms.cache !== undefined
  }

  function flowAt(dim, p, side) {
    var f = W().flows[dim + '|' + p.x + '|' + p.y + '|' + p.z + '|' + (side || '')]
    return f || { drained: 0, in: 0, filled: 0 }
  }

  function copyFlow(f) {
    return { drained: f.drained, in: f.in, filled: f.filled }
  }

  function fakePlayer(dim) {
    if (!S.fake) S.fake = {}
    if (!S.fake[dim]) S.fake[dim] = lazy().FPF.getMinecraft(levelOf(dim))
    return S.fake[dim]
  }

  // a fake player's shift-click with an empty hand on the block's top (the network's readout)
  function shiftClick(dim, p) {
    var L = lazy()
    var fp = fakePlayer(dim)
    fp.setItemInHand(L.Hand.MAIN_HAND, Item.empty)
    fp.setShiftKeyDown(true)
    fp.setPositionAndRotation(p.x + 0.5, p.y + 2.2, p.z + 0.5, 0, 90)
    W().lastReadout = null
    var pos = bp(p.x, p.y, p.z)
    L.FH.onRightClickBlock(fp, L.Hand.MAIN_HAND, pos, new L.BHR(new L.Vec3(p.x + 0.5, p.y + 1.0, p.z + 0.5), L.Direction.UP, pos, false))
    fp.setShiftKeyDown(false)
    var r = W().lastReadout
    return r ? r.key + ' [' + r.args.join(', ') + ']' : '(no readout)'
  }

  function electric(stack) {
    var e = stack.isEmpty() ? null : lazy().GTCap.getElectricItem(stack)
    return e === undefined ? null : e
  }

  function charged(id) {
    var stack = Item.of(id)
    var e = electric(stack)
    if (e === null) throw new Error(id + ' has no GTM electric item')
    e.charge(Number(e.getMaxCharge()), Number(e.getTier()), true, false)
    return stack
  }

  function batteryCharge(m) {
    if (m === null) return -1
    var inv = m.getBatteryInventory()
    var n = 0
    for (var i = 0; i < inv.getSlots(); i++) {
      var e = electric(inv.getStackInSlot(i))
      if (e !== null) n += Number(e.getCharge())
    }
    return n
  }

  // ---------------------------------------------------------------- the magnet works' inputs

  // the two consumed-fluid hatches: a fluid takes the first free one and keeps it
  function roleOf(fluidId) {
    if (S.fluidRoles[fluidId]) return S.fluidRoles[fluidId]
    var used = Object.keys(S.fluidRoles).map(function (k) { return S.fluidRoles[k] })
    var free = ['fluid1', 'fluid2'].filter(function (r) { return used.indexOf(r) < 0 })[0]
    if (!free) throw new Error('no free input hatch for ' + fluidId)
    S.fluidRoles[fluidId] = free
    return free
  }

  // one run of a published recipe into the bus and the hatches, with its circuit: '' or why it could not
  function stock(rec) {
    var missing = []
    rec.itemsIn.forEach(function (x) { if (!Item.exists(x.id)) missing.push(x.id) })
    rec.fluidsIn.forEach(function (f) { if (!Fluid.exists(f.id)) missing.push(f.id) })
    if (missing.length > 0) return 'not registered: ' + missing.join(', ')
    var bus = part('bus')
    bus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(rec.circuit))
    rec.itemsIn.forEach(function (x) { insert(bus.getInventory(), x.id, x.count) })
    rec.fluidsIn.forEach(function (f) { setTank(part(roleOf(f.id)), f.id, f.amount) })
    return ''
  }

  function emptyInputs() {
    var bus = part('bus')
    emptyInv(bus.getInventory())
    bus.getCircuitInventory().setStackInSlot(0, lazy().ItemStack.EMPTY)
    setTank(part('fluid1'), null, 0)
    setTank(part('fluid2'), null, 0)
  }

  function inputs() {
    return { bus: readInv(part('bus').getInventory()), fluid1: tankInfo(part('fluid1')), fluid2: tankInfo(part('fluid2')), helium: tankInfo(part('helium')),
      out: readInv(part('out').getInventory()) }
  }

  function inputText(x) {
    return 'bus ' + summary(x.bus) + '; hatches ' + x.fluid1.amount + ' mB ' + short(x.fluid1.id) + ', ' + x.fluid2.amount + ' mB ' + short(x.fluid2.id) + ', charge ' +
      x.helium.amount + ' mB ' + short(x.helium.id) + '; out ' + summary(x.out)
  }

  // what the magnet works' wireless hatches hold and were given, from now on
  function hatchWindow() {
    return ['hatchA', 'hatchB'].map(function (n) {
      var p = S.L.mw.at[n]
      return { n: n, p: p, filled: flowAt(EARTH, p).filled, held: storedIn(part(n)) }
    })
  }

  // EU the hatches gave the machine since the window began: what the network put in, less what they hold more
  function hatchUsed(win) {
    var filled = 0
    var held = 0
    win.forEach(function (h) {
      filled += flowAt(EARTH, h.p).filled - h.filled
      held += storedIn(part(h.n)) - h.held
    })
    return { filled: filled, held: held, used: filled - held }
  }

  // GTM's non-perfect overclock (OverclockingLogic#getModifier, NON_PERFECT_OVERCLOCK) of a recipe at a given overclock voltage
  function tierAtLeast(v) {
    var t = 0
    while (t < 14 && V(t) < v) t++
    return t
  }
  function tierAtMost(v) {
    var t = 0
    while (t < 14 && V(t + 1) <= v) t++
    return t
  }
  function expectedOc(eut, duration, ocVoltage) {
    var ocs = tierAtMost(ocVoltage) - tierAtLeast(eut)
    if (tierAtLeast(eut) === 0) ocs--
    var e = eut
    var d = duration
    while (ocs > 0 && e * 4 <= ocVoltage && d > 1) {
      e *= 4
      d = Math.max(1, Math.floor(d / 2))
      ocs--
    }
    return { eut: e, duration: d }
  }

  // ---------------------------------------------------------------- the generator array in orbit

  function arrayParts() {
    var A = S.L.array
    return { ctrl: machineAt(ORBIT, A.ctrl), input: machineAt(ORBIT, A.input), output: machineAt(ORBIT, A.output), dynamo: machineAt(ORBIT, A.dynamo) }
  }

  function steamIn(P) {
    var st = P.input.tank.getFluidInTank(0)
    return st.isEmpty() ? 0 : Number(st.getAmount())
  }

  // tops the steam up to 60,000 mB and counts what the test added
  function feedSteam() {
    var P = S.arrayP
    var now = steamIn(P)
    if (now >= 30000) return
    P.input.tank.setFluidInTank(0, Fluid.of(STEAM, 60000).getFluidStack())
    S.steamAdded += 60000 - now
  }

  // the EU a run in progress still owes (a generator): its EU/t x the ticks it has left; 0 when no run is on
  function owed(m) {
    var logic = m.getRecipeLogic()
    var last = logic.getLastRecipe()
    if (!logic.isActive() || last === null || last === undefined) return 0
    var io = lazy().RecipeHelper.getRealEUtWithIO(last)
    return Number(io.getTotalEU()) * (Number(logic.getMaxProgress()) - Number(logic.getProgress()))
  }

  // ---------------------------------------------------------------- the network's persistent data (put back as it was at the end)

  function saveNetwork() {
    var w = W()
    var pd = S.server.persistentData
    S.savedKeys = {}
    ;[w.blocksKey, w.storeKey, w.legacyKey].forEach(function (k) {
      var t = pd.get(k)
      S.savedKeys[k] = t === null || t === undefined ? null : t.copy()
      pd.remove(k)
    })
    w.dropCache()
    // whatever set this band's blocks aside in an earlier run is forgiven, as a placing player's BlockEvents.placed does
    Object.keys(w.faults).forEach(function (k) {
      var f = k.split('|')
      if (inBand(f[0], Number(f[1]), Number(f[2]), Number(f[3]))) delete w.faults[k]
    })
  }

  function restoreNetwork() {
    var w = W()
    var pd = S.server.persistentData
    var back = []
    Object.keys(S.savedKeys || {}).forEach(function (k) {
      pd.remove(k)
      var t = S.savedKeys[k]
      if (t !== null) {
        pd.put(k, t)
        back.push(k)
      }
    })
    w.dropCache()
    return 'the network\'s keys put back as they were before the test: ' + (back.length > 0 ? back.join(', ') : 'none existed, all removed')
  }

  // ---------------------------------------------------------------- setup

  // '' when the wireless LuV tier is registered, else what is missing
  function luvMissing() {
    var w = wireless()
    var row = w.tierRow[LUV]
    if (!row) return 'no tier-6 row in global.grindless.wireless'
    var L = lazy()
    var missing = []
    ;[w.hatchId('hatch', LUV, 2)].forEach(function (id) {
      var def = L.GTRegistries.MACHINES.get(rl(id))
      if (def === null || def === undefined) missing.push(id)
    })
    if (!L.BI.BLOCK.containsKey(rl(row.cell))) missing.push(row.cell)
    ;[w.coverItemId('energy', LUV), w.coverItemId('dynamo', LUV)].forEach(function (id) { if (!Item.exists(id)) missing.push(id) })
    return missing.length > 0 ? 'not registered: ' + missing.join(', ') : ''
  }

  // a wireless block joins the network as a placing player's BlockEvents.placed does it (/setblock fires no event)
  function trackAt(dim, p) {
    var w = W()
    var e = w.track(levelOf(dim), bp(p.x, p.y, p.z))
    if (e) delete w.faults[w.flowKey(e)]
    return e
  }

  function setupMachines() {
    var w = W()
    var L = S.L
    var bad = []
    var tracked = []
    var covers = []
    var charge = MWD().charge || { id: 'gtceu:liquid_helium', amount: 1000 }
    // the cold-test charge, once: the test never refills it
    setTank(part('helium'), charge.id, charge.amount)
    function track(dim, p, what) {
      var e = trackAt(dim, p)
      if (!e) bad.push(what + ' not tracked')
      tracked.push(what + (e ? ' ' + e.k + ' t' + e.t + (e.a ? ' ' + e.a + 'A' : '') : ' NOT TRACKED'))
    }
    track(EARTH, L.mw.at.hatchA, 'magnet works hatch A')
    track(EARTH, L.mw.at.hatchB, 'magnet works hatch B')
    track(EARTH, TOWER_A, 'tower A')
    if (S.luv) {
      track(EARTH, TOWER_B, 'tower B')
      track(EARTH, LUV_HATCH, 'LuV hatch')
      var mac = machineAt(EARTH, LUV_MAC)
      var buf = machineAt(EARTH, LUV_BUF)
      if (mac === null || buf === null) bad.push('LuV macerator ' + (mac !== null) + ', LuV battery buffer ' + (buf !== null))
      else {
        mac.importItems.setStackInSlot(0, Item.of(MAC_INPUT, 64))
        var inv = buf.getBatteryInventory()
        for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, charged(BATTERY))
        var up = lazy().Direction.UP
        var ce = w.placeCover(S.earth, bp(LUV_MAC.x, LUV_MAC.y, LUV_MAC.z), up, Item.of(w.coverItemId('energy', LUV)), fakePlayer(EARTH))
        var cd = w.placeCover(S.earth, bp(LUV_BUF.x, LUV_BUF.y, LUV_BUF.z), up, Item.of(w.coverItemId('dynamo', LUV)), fakePlayer(EARTH))
        covers.push('LuV energy cover on the LuV macerator ' + ce.ok + ' (' + textOf(ce.message) + ')')
        covers.push('LuV dynamo cover on the LuV battery buffer (' + batteryCharge(buf) + ' EU in its batteries) ' + cd.ok + ' (' + textOf(cd.message) + ')')
        if (!ce.ok || !cd.ok) bad.push('a LuV cover did not go on')
      }
    }
    if (S.orbit) {
      S.arrayP = arrayParts()
      var P = S.arrayP
      if (P.ctrl === null || P.input === null || P.dynamo === null) {
        bad.push('the orbit array: controller ' + (P.ctrl !== null) + ', input ' + (P.input !== null) + ', dynamo ' + (P.dynamo !== null))
        S.arrayP = null
      } else {
        feedSteam()
        track(ORBIT, L.array.dynamo, 'orbit dynamo hatch')
      }
    }
    return { bad: bad, tracked: tracked, covers: covers }
  }

  // ---------------------------------------------------------------- the magnet works' part swaps (cleared: it unforms; placed: it forms)

  function beginSwap(name) {
    var sw = S.L.swaps[name]
    S.swap = { name: name, sw: sw, stage: 'clearing', at: S.t, result: '' }
    var failed = []
    applyClear(sw, failed)
    if (failed.length > 0) S.swap.result = 'failed: ' + failed.join('; ')
  }

  // 'busy', 'formed' or 'failed: ...'
  function stepSwap() {
    var Sw = S.swap
    if (Sw.result !== '') return Sw.result
    var ctrl = mwCtrl()
    if (Sw.stage === 'clearing') {
      if (ctrl !== null && ctrl.isFormed()) {
        if (S.t - Sw.at > 100) Sw.result = 'failed: still formed ' + (S.t - Sw.at) + ' ticks after its part cells were cleared'
        return Sw.result || 'busy'
      }
      var failed = []
      applyPlace(Sw.sw, failed)
      if (failed.length > 0) {
        Sw.result = 'failed: ' + failed.join('; ')
        return Sw.result
      }
      Sw.unformedIn = S.t - Sw.at
      Sw.stage = 'placed'
      Sw.placedAt = S.t
      return 'busy'
    }
    var r = formedOrForce('MW_' + Sw.name, ctrl, S.t - Sw.placedAt, 40)
    if (r.indexOf('failed') === 0 || r === 'missing') {
      Sw.result = 'failed: ' + r
      return Sw.result
    }
    if (r !== 'formed' || !checked(ctrl)) return 'busy'
    var ids = energyPartIds(ctrl)
    if (!sameIds(ids, Sw.sw.expect)) {
      if (S.t - Sw.placedAt > 200) Sw.result = 'failed: energy parts [' + ids.join(', ') + '], want [' + Sw.sw.expect.join(', ') + ']'
      return Sw.result || 'busy'
    }
    Sw.formedIn = S.t - Sw.placedAt
    var joined = false
    Sw.sw.place.forEach(function (q) {
      if (!wireless().hatches[q.id]) return
      trackAt(EARTH, q.p)
      joined = true
    })
    // the new hatches filled now, before any input goes in: a run that starts on one empty hatch could wait for EU, and GTM suspends a
    // multiblock after five waits (RecipeLogic#handleRecipeWorking)
    if (joined) W().settle(S.server)
    Sw.result = 'formed'
    return 'formed'
  }

  // ---------------------------------------------------------------- MW_FORMED and the network

  function reportFormed() {
    var r = S.formed
    var ctrl = mwCtrl()
    var ok = r.mw === 'formed' && ctrl !== null
    var ids = ok ? partIds(ctrl) : []
    var want = [S.L.ivHatch, S.L.ivHatch, BUS_IN, FLUID_IN, FLUID_IN, FLUID_IN, BUS_OUT]
    var desc = structure(MW_ID)
    check('MW_FORMED', ok && sameIds(ids, want), 'the magnet works (' + desc.slices.length + ' slices x ' + desc.slices[0].length + ' rows x ' + desc.slices[0][0].length +
      ' columns, ' + S.L.mw.cells.length + ' cells) ' + r.mw + ' after ' + S.formedAt + ' ticks with parts [' + ids.map(short).join(', ') + '] (want [' +
      want.map(short).join(', ') + ']); getMaxVoltage with two IV wireless hatches ' + (ok ? Number(ctrl.getMaxVoltage()) : -1) + '; the charge ' +
      (ok ? MWD().chargeIn(ctrl) : -1) + ' mB; tower A ' + r.towerA + ', tower B ' + r.towerB + ', the orbit array ' + r.orbit)
  }

  function startNetwork() {
    var w = W()
    // the settlements were paused while the towers formed: tower B alone would have made the network LuV for a moment
    w.paused = false
    w.setStored(S.server, STORE0)
    var st = w.settle(S.server)
    if (S.luv) S.luvFlow0 = flowAt(EARTH, LUV_HATCH).filled
    if (S.arrayP !== null && S.arrayP !== undefined) {
      S.arrayP = arrayParts()
      // machine mode 0: GTM's steam turbine recipes
      S.arrayP.ctrl.setActiveRecipeType(0)
      wake(S.arrayP.ctrl)
    }
    note('network', 'the store set to ' + STORE0 + ' EU; the network: up ' + st.up + ', ' + st.towers + ' towers, ' + st.capacity + ' EU, tier ' + st.tier +
      ' (tower A: ' + TOWER_A_CELLS + ' x ' + short(S.L.ivCell) + (S.luv ? ', tower B: ' + TOWER_B_CELLS + ' x ' + short(S.L.luvCell) : ', no tower B: ' + S.luvMissingWhy) + ')')
  }

  // ---------------------------------------------------------------- TWO_HATCH: one IV hatch, then two

  function startOne() {
    var ctrl = mwCtrl()
    var c1 = published('hts_coil')
    S.one = { at: S.t, maxV: Number(ctrl.getMaxVoltage()), parts: energyPartIds(ctrl), working: 0, progress: 0, formedIn: S.swap.formedIn, missing: '' }
    S.one.missing = c1 === null ? 'hts_coil is not published (' + skippedReason('hts_coil') + ')' : stock(c1)
    S.one.before = JSON.stringify(inputs())
    wake(ctrl)
  }

  function finishOne() {
    var O = S.one
    var ctrl = mwCtrl()
    var x = inputs()
    O.after = JSON.stringify(x)
    O.hatchA = storedIn(part('hatchA'))
    O.hatchCap = Number(part('hatchA').energyContainer.getEnergyCapacity())
    O.state = state(ctrl)
    O.reasons = failureReasons(ctrl)
    O.blocked = O.missing === '' && O.working === 0 && O.progress === 0 && O.after === O.before
    note('TWO_HATCH_one', 'one IV wireless hatch (the other cell casing, formed again in ' + O.formedIn + ' ticks): getMaxVoltage ' + O.maxV + ', energy parts [' +
      O.parts.map(short).join(', ') + ']; c1 stocked' + (O.missing ? ' NOT: ' + O.missing : '') + '; over ' + (S.t - O.at) + ' ticks it worked ' + O.working +
      ' ticks (progress at most ' + O.progress + '), its hatch holds ' + O.hatchA + ' of ' + O.hatchCap + ' EU; ' + inputText(x) + '; untouched ' + (O.after === O.before) +
      '; ' + O.state + ' reasons [' + O.reasons.join(' ; ') + ']')
  }

  function startTwo() {
    var ctrl = mwCtrl()
    var c1 = published('hts_coil')
    S.two = { at: S.t, rec: c1, maxV: Number(ctrl.getMaxVoltage()), parts: energyPartIds(ctrl), formedIn: S.swap.formedIn, working: 0, seen: {}, eut: 0, duration: 0,
      win: hatchWindow(), totals: JSON.parse(JSON.stringify(W().totals)), progress0: Number(ctrl.getRecipeLogic().getProgress()),
      out0: countIn(part('out').getInventory(), COIL), missing: '' }
    S.two.missing = c1 === null ? 'hts_coil is not published (' + skippedReason('hts_coil') + ')' : stock(c1)
    wake(ctrl)
    startOrbitWindow()
  }

  // a run of the magnet works, every tick: its working ticks and what GTM runs (the modified recipe: overclocked EU/t and ticks)
  function measureRun(R) {
    var ctrl = mwCtrl()
    if (ctrl === null || statusOf(ctrl) !== 'WORKING') return
    R.working++
    var last = ctrl.getRecipeLogic().getLastRecipe()
    if (last === null || last === undefined) return
    R.seen[String(last.id)] = true
    R.eut = inputEUt(last)
    R.duration = Number(last.duration)
  }

  function runOver(R, product) {
    if (R.missing !== '') return true
    var made = countIn(part('out').getInventory(), product) - R.out0
    return made >= 1 && statusOf(mwCtrl()) !== 'WORKING'
  }

  function reportTwo() {
    var O = S.one
    var T = S.two
    var rec = T.rec
    var charge = MWD().charge || {}
    var x = inputs()
    var u = hatchUsed(T.win)
    var made = countIn(part('out').getInventory(), COIL) - T.out0
    var gave = W().totals.out - T.totals.out
    var wantEu = rec ? rec.eut * rec.duration : -1
    var oneOk = O.maxV === V(IV) && sameIds(O.parts, [S.L.ivHatch]) && O.blocked && O.hatchA > 0
    var twoOk = T.maxV === V(LUV) && sameIds(T.parts, [S.L.ivHatch, S.L.ivHatch])
    var ran = rec !== null && T.missing === '' && made === 1 && T.seen[rec.recipeId] === true && Object.keys(x.bus).length === 0 && x.fluid1.amount === 0 &&
      x.fluid2.amount === 0 && x.helium.id === charge.id && x.helium.amount === charge.amount && T.eut === rec.eut && T.duration === rec.duration && T.working > 0 &&
      T.progress0 === 0 && u.used === wantEu
    check('TWO_HATCH', oneOk && twoOk && ran,
      'S0-10 Q1, wireless hatches count for GTM\'s two-hatch rule. One IV hatch: getMaxVoltage ' + O.maxV + ' (want ' + V(IV) + '), c1 ' + (O.blocked ? 'did not start' : 'NOT BLOCKED') +
      ' in ' + ONE_HOLD + ' ticks with its hatch at ' + O.hatchA + ' EU' + (O.missing ? ' (not stocked: ' + O.missing + ')' : '') + '. Two (formed again in ' + T.formedIn +
      ' ticks): getMaxVoltage ' + T.maxV + ' (want ' + V(LUV) + '), energy parts [' + T.parts.map(short).join(', ') + ']; ' +
      (T.missing ? 'c1 not stocked: ' + T.missing : 'c1 (' + (rec ? rec.recipeId : '?') + ') ran ' + T.working + ' ticks at ' + T.eut + ' EU/t x ' + T.duration + ' t (published ' +
      rec.eut + ' x ' + rec.duration + ') = ' + (T.eut * T.duration) + ' EU; it made ' + made + ' ' + short(COIL) + '; left ' + inputText(x)) + '. The network filled the two hatches with ' +
      u.filled + ' EU (they hold ' + u.held + ' more than at the start: ' + u.used + ' EU given to the machine, want ' + wantEu + '); the network\'s out ' + gave + ' EU, the store ' +
      W().stored(S.server))
  }

  // ---------------------------------------------------------------- ORBIT: S0-10 Q2

  function startOrbitWindow() {
    if (S.arrayP === null || S.arrayP === undefined) return
    var P = S.arrayP
    S.ow = { start: S.t, dyn: storedIn(P.dynamo), flow: copyFlow(flowAt(ORBIT, S.L.array.dynamo)), steamAdded: S.steamAdded, steamNow: steamIn(P), owed: owed(P.ctrl),
      progress: Number(P.ctrl.getRecipeLogic().getProgress()), work: 0, done: false }
  }

  function reportOrbit() {
    var tail = ' In play the station\'s chunks must stay loaded (FTB Chunks force-loading) for it to keep producing unattended: an unloaded orbit makes nothing, ' +
      'and the network keeps what it already got.'
    if (!S.orbit) {
      check('ORBIT', false, ORBIT + ' is not loaded on this server.' + tail)
      return
    }
    if (!S.ow) {
      check('ORBIT', false, 'the generator array in orbit did not form or has no parts: ' + S.formed.orbit + '.' + tail)
      return
    }
    var O = S.ow
    O.done = true
    var P = S.arrayP
    var f = flowAt(ORBIT, S.L.array.dynamo)
    var drained = f.drained - O.flow.drained
    var into = f.in - O.flow.in
    var dyn = storedIn(P.dynamo)
    var made = dyn - O.dyn + drained
    var steamUsed = (S.steamAdded - O.steamAdded) - (steamIn(P) - O.steamNow)
    // steam is taken when a run starts and pays 1 EU per mB over the run: what the array made = the steam its runs took + what the run on at
    // the start still owed - what the run on at the end still owes (gg_test_wireless_energy.js, RUN_DYNAMO_HATCH)
    var owedEnd = owed(P.ctrl)
    var bySteam = steamUsed + O.owed - owedEnd
    check('ORBIT', O.work > 0 && made > 0 && drained > 0 && into * 20 === drained * 19 && made === bySteam,
      'in ' + ORBIT + ' (force-loaded X ' + BANDS[ORBIT].x0 + '-' + BANDS[ORBIT].x1 + ') the generator array worked ' + O.work + ' of ' + (S.t - O.start) + ' ticks and made ' + made +
      ' EU into its ' + short(S.L.arrayDynamo) + ' (held ' + O.dyn + ' -> ' + dyn + '); its steam: ' + steamUsed + ' mB taken + ' + O.owed + ' owed at the start - ' + owedEnd +
      ' owed at the end = ' + bySteam + ' EU; the settlement drained ' + drained + ' EU from the hatch and put ' + into + ' in the network (19/20: ' + (into * 20) + ' = ' +
      (drained * 19) + ').' + tail)
  }

  // ---------------------------------------------------------------- MULTI_AMP and SMES

  function reportMultiAmp() {
    var ctrl = mwCtrl()
    var list = ctrl.getEnergyContainer()
    var maxV = Number(ctrl.getMaxVoltage())
    var num = Number(list.getNumHighestInputContainers())
    var highest = Number(list.getHighestInputVoltage())
    var inV = Number(list.getInputVoltage())
    var inA = Number(list.getInputAmperage())
    var ocV = Number(ctrl.getOverclockVoltage())
    var parts = energyPartIds(ctrl)
    var total = V(IV) * 64 * 2
    var wantOc = V(IV) * 64
    check('MULTI_AMP', maxV === V(LUV) && num === 2 && ocV === wantOc && sameIds(parts, [S.L.ivHatch64, S.L.ivHatch64]),
      'two ' + short(S.L.ivHatch64) + ' (formed again in ' + S.swap.formedIn + ' ticks): getMaxVoltage ' + maxV + ' (want ' + V(LUV) + ': the recipe tier gate, the highest input ' +
      highest + ' V +1 tier for ' + num + ' hatches at it), getNumHighestInputContainers ' + num + ' (want 2), getOverclockVoltage ' + ocV + ' (want ' + wantOc + ': ' + total +
      ' EU/t of V x A folded by EnergyContainerList.calculateVoltageAmperage to ' + inV + ' V x ' + inA + ' A); energy parts [' + parts.map(short).join(', ') + ']')
  }

  function startC2() {
    var ctrl = mwCtrl()
    var c2 = published('luv_smes_cell')
    emptyInputs()
    S.c2 = { at: S.t, rec: c2, ocV: Number(ctrl.getOverclockVoltage()), working: 0, seen: {}, eut: 0, duration: 0, win: hatchWindow(), missing: '' }
    S.c2.product = c2 !== null && c2.itemsOut.length > 0 ? c2.itemsOut[0].id : 'grindless:luv_smes_cell'
    S.c2.out0 = countIn(part('out').getInventory(), S.c2.product)
    S.c2.missing = c2 === null ? 'luv_smes_cell is not published (' + skippedReason('luv_smes_cell') + ')' : stock(c2)
    wake(ctrl)
  }

  function reportSmes() {
    var C = S.c2
    var rec = C.rec
    var charge = MWD().charge || {}
    var x = inputs()
    var made = countIn(part('out').getInventory(), C.product) - C.out0
    var u = hatchUsed(C.win)
    var ok = rec !== null && C.missing === '' && C.product === 'grindless:luv_smes_cell' && made === 1 && C.seen[rec.recipeId] === true && Object.keys(x.bus).length === 0 &&
      x.fluid1.amount === 0 && x.fluid2.amount === 0 && x.helium.id === charge.id && x.helium.amount === charge.amount && C.working > 0
    check('SMES', ok, C.missing ? 'c2 not stocked: ' + C.missing : 'c2 (' + rec.recipeId + ') on the two IV 64 A hatches ran ' + C.working + ' ticks and made ' + made + ' ' +
      short(C.product) + '; left ' + inputText(x) + '; the hatches gave ' + u.used + ' EU (filled ' + u.filled + ')')
    if (rec !== null && C.missing === '') {
      var oc = expectedOc(rec.eut, rec.duration, C.ocV)
      note('SMES_overclock', 'GTM ran c2 at ' + C.eut + ' EU/t x ' + C.duration + ' t (published ' + rec.eut + ' x ' + rec.duration + '); getOverclockVoltage ' + C.ocV +
        ' predicts ' + oc.eut + ' x ' + oc.duration + ' (GTM\'s non-perfect overclock): as predicted ' + (C.eut === oc.eut && C.duration === oc.duration) + '; EU given ' + u.used +
        ', by the run ' + (C.eut * C.duration))
    }
  }

  // ---------------------------------------------------------------- JUMP and LUV_COVERS

  function startJump() {
    if (!S.luv) {
      S.jump = { skipped: S.luvMissingWhy }
      return
    }
    var st = W().settle(S.server)
    S.jump = { at: S.t, stage: 'breaking', before: { up: st.up, tier: st.tier, towers: st.towers, capacity: st.capacity, skippedAbove: st.skippedAbove },
      luvMax: S.luvMax, luvFilled0: flowAt(EARTH, LUV_HATCH).filled, readout: shiftClick(EARTH, LUV_HATCH), breakFailed: '' }
    var failed = []
    breakTowerA(S.L, failed)
    if (failed.length > 0) S.jump.breakFailed = failed.join('; ')
  }

  // true when the jump is over
  function stepJump() {
    var Jm = S.jump
    if (Jm.skipped !== undefined) return true
    if (Jm.stage === 'breaking') {
      var a = machineAt(EARTH, TOWER_A)
      if (a !== null && a.isFormed() && S.t - Jm.at <= 100) return false
      if (a !== null && a.isFormed()) Jm.stuck = 'tower A still formed ' + (S.t - Jm.at) + ' ticks after its cells were broken'
      var st = W().settle(S.server)
      Jm.after = { up: st.up, tier: st.tier, towers: st.towers, capacity: st.capacity }
      Jm.turnedAt = S.t
      startCovers()
      beginSwap('luv')
      Jm.stage = 'luv'
      return false
    }
    if (Jm.stage === 'luv') {
      var r = stepSwap()
      if (r === 'busy') return false
      Jm.swap = r
      if (r === 'formed') {
        var ctrl = mwCtrl()
        Jm.mwMaxV = Number(ctrl.getMaxVoltage())
        Jm.mwParts = energyPartIds(ctrl)
        Jm.formedIn = S.swap.formedIn
      }
      Jm.stage = 'wait'
      return false
    }
    return S.t - Jm.turnedAt >= COVER_WINDOW
  }

  function reportJump() {
    var Jm = S.jump
    if (Jm.skipped !== undefined) {
      check('JUMP', false, 'the wireless LuV tier is not there: ' + Jm.skipped)
      return
    }
    var cell = W().cells[S.L.luvCell]
    var wantCap = TOWER_B_CELLS * (cell ? cell.capacity : 0)
    var f = flowAt(EARTH, LUV_HATCH)
    var held = storedIn(machineAt(EARTH, LUV_HATCH))
    var b = Jm.before
    var a = Jm.after || {}
    var before = b.up && b.tier === IV && b.towers === 2 && Jm.luvMax === 0 && Jm.luvFilled0 === S.luvFlow0 && Jm.readout === aboveTierReadout()
    var after = !Jm.stuck && Jm.breakFailed === '' && a.up === true && a.tier === LUV && a.towers === 1 && a.capacity === wantCap && f.filled > Jm.luvFilled0 && held > 0
    var mw = Jm.swap === 'formed' && Jm.mwMaxV === V(LUV + 1) && sameIds(Jm.mwParts || [], [S.L.luvHatch, S.L.luvHatch])
    check('JUMP', before && after && mw,
      'before: the network up ' + b.up + ', ' + b.towers + ' towers, ' + b.capacity + ' EU, tier ' + b.tier + ' (want ' + IV + '; ' + b.skippedAbove + ' blocks above it skipped); the ' +
      short(S.L.luvHatch) + ' held at most ' + Jm.luvMax + ' EU and was filled ' + (Jm.luvFilled0 - S.luvFlow0) + ' EU since the network started; its readout ' +
      Jm.readout + '. Tower A\'s ' + TOWER_A_CELLS + ' cells broken' +
      (Jm.breakFailed ? ' (FAILED ' + Jm.breakFailed + ')' : '') + (Jm.stuck ? ' but ' + Jm.stuck : '') + ': the network up ' + a.up + ', ' + a.towers + ' tower, ' + a.capacity +
      ' EU (want ' + TOWER_B_CELLS + ' x ' + (cell ? cell.capacity : '?') + ' = ' + wantCap + '), tier ' + a.tier + ' (want ' + LUV + '); in ' + (S.t - Jm.turnedAt) +
      ' ticks the LuV hatch was filled ' + (f.filled - Jm.luvFilled0) + ' EU and holds ' + held + '. Two LuV wireless hatches on the magnet works (' + Jm.swap +
      (Jm.formedIn !== undefined ? ' in ' + Jm.formedIn + ' ticks' : '') + '): getMaxVoltage ' + Jm.mwMaxV + ' (want ' + V(LUV + 1) + ', what the gate\'s 100,000-122,880 EU/t ' +
      'assembly-line recipes need), energy parts [' + (Jm.mwParts || []).map(short).join(', ') + ']')
  }

  function startCovers() {
    var mac = machineAt(EARTH, LUV_MAC)
    var buf = machineAt(EARTH, LUV_BUF)
    if (mac === null || buf === null) return
    S.cw = { start: S.t, mac: storedIn(mac), macFlow: copyFlow(flowAt(EARTH, LUV_MAC, 'up')), macOut: totalIn(mac.exportItems), macWork: 0,
      buf: batteryCharge(buf), bufFlow: copyFlow(flowAt(EARTH, LUV_BUF, 'up')), settlements: W().totals.settlements }
  }

  function reportCovers() {
    if (!S.luv) {
      check('LUV_COVERS', false, 'the wireless LuV tier is not there: ' + S.luvMissingWhy)
      return
    }
    if (!S.cw) {
      check('LUV_COVERS', false, 'the LuV macerator or battery buffer is missing')
      return
    }
    var w = W()
    var C = S.cw
    var mac = machineAt(EARTH, LUV_MAC)
    var buf = machineAt(EARTH, LUV_BUF)
    var mf = flowAt(EARTH, LUV_MAC, 'up')
    var filled = mf.filled - C.macFlow.filled
    var macNow = storedIn(mac)
    var used = filled - (macNow - C.mac)
    var outNow = totalIn(mac.exportItems)
    var bf = flowAt(EARTH, LUV_BUF, 'up')
    var drained = bf.drained - C.bufFlow.drained
    var into = bf.in - C.bufFlow.in
    var charge = batteryCharge(buf)
    var fell = C.buf - charge
    var settlements = w.totals.settlements - C.settlements
    var limit = w.rate(LUV, w.coverAmps) * w.settleTicks
    check('LUV_COVERS', C.macWork > 0 && outNow > C.macOut && filled > 0 && used > 0 && drained > 0 && fell === drained && into * 20 === drained * 19 && drained <= limit * settlements,
      'over ' + (S.t - C.start) + ' ticks of the LuV network: the ' + short(MACERATOR) + ' worked ' + C.macWork + ' ticks on its LuV energy cover and made ' + (outNow - C.macOut) +
      ' items (' + summary(readInv(mac.exportItems)) + '); the cover put ' + filled + ' EU in, its buffer went ' + C.mac + ' -> ' + macNow + ': ' + used + ' EU used. The LuV dynamo ' +
      'cover took ' + drained + ' EU out of the ' + short(BUFFER) + '\'s batteries (their charge fell ' + fell + '), ' + into + ' reached the network (19/20); at most ' + limit +
      ' EU per settlement (2 A x ' + V(LUV) + ' V x ' + w.settleTicks + ' ticks), ' + settlements + ' settlements')
  }

  // ---------------------------------------------------------------- driver

  var MAIN_CHECKS = ['registry', 'mw_recipes', 'PLACED', 'MW_FORMED', 'TWO_HATCH', 'ORBIT', 'MULTI_AMP', 'SMES', 'JUMP', 'LUV_COVERS']

  function cleanup() {
    var lines = []
    if (S.areaTouched) {
      if (S.orbit) lines.push(clearArea(ORBIT))
      lines.push(clearArea(EARTH))
    }
    if (S.savedKeys) lines.push(restoreNetwork())
    note('cleanup', lines.join('; '))
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    // every check of this run gets its line, also when the run stopped before it
    MAIN_CHECKS.forEach(function (n) { if (!S.reported[n]) check(n, false, 'not reached: ' + (S.stopReason || 'the run ended early')) })
    try {
      // only a run that paused the network un-pauses it (another wireless test may hold it paused while this one waits for its turn)
      if (S.pausedByUs) W().paused = false
    } catch (e0) { /* nothing */ }
    try {
      cleanup()
    } catch (e) {
      check('cleanup', false, 'exception: ' + e)
    }
    leaveQueue(SCOPE)
    console.info(TAG + SCOPE + '|DONE')
  }

  function phase(next) {
    S.phase = next
    S.phaseAt = S.t
  }

  function stop(reason) {
    S.stopReason = reason
    phase('end')
  }

  function step() {
    var since = S.t - S.phaseAt
    if (S.phase === 'forming') {
      var r = {
        mw: formedOrForce('MW', mwCtrl(), since, 100),
        towerA: formedOrForce('TOWER_A', machineAt(EARTH, TOWER_A), since, 100),
        towerB: S.luv ? formedOrForce('TOWER_B', machineAt(EARTH, TOWER_B), since, 100) : 'skipped',
        orbit: S.arrayP ? formedOrForce('ORBIT_ARRAY', machineAt(ORBIT, ARRAY_AT), since, 100) : (S.orbit ? 'missing' : 'no level')
      }
      var settled = function (x) { return x !== 'waiting' }
      var ready = settled(r.mw) && settled(r.towerA) && settled(r.towerB) && settled(r.orbit) && checked(mwCtrl()) &&
        checked(machineAt(EARTH, TOWER_A)) && (r.towerB !== 'formed' || checked(machineAt(EARTH, TOWER_B)))
      if (!ready && since <= 400) return
      S.formed = r
      S.formedAt = since
      guarded('MW_FORMED', reportFormed)
      if (r.mw !== 'formed' || r.towerA !== 'formed') {
        stop('the magnet works ' + r.mw + ', tower A ' + r.towerA + ' after ' + since + ' ticks')
        return
      }
      if (r.orbit !== 'formed') S.arrayP = null
      startNetwork()
      beginSwap('one')
      phase('one_swap')
      return
    }
    if (S.phase === 'one_swap' || S.phase === 'two_swap' || S.phase === 'multi_swap') {
      var sw = stepSwap()
      if (sw === 'busy') return
      if (sw !== 'formed') {
        if (S.phase === 'multi_swap') {
          check('MULTI_AMP', false, 'the two 64 A hatches: ' + sw)
          startJump()
          phase('jump')
          return
        }
        stop('the ' + S.swap.name + '-hatch swap ' + sw)
        return
      }
      if (S.phase === 'one_swap') {
        startOne()
        phase('one')
      } else if (S.phase === 'two_swap') {
        startTwo()
        phase('c1')
      } else {
        guarded('MULTI_AMP', reportMultiAmp)
        startC2()
        phase('c2')
      }
      return
    }
    if (S.phase === 'one') {
      if (since < ONE_HOLD) return
      finishOne()
      emptyInputs()
      beginSwap('two')
      phase('two_swap')
      return
    }
    if (S.phase === 'c1') {
      var c1 = S.two.rec
      if (!(runOver(S.two, COIL) || since > (c1 ? c1.duration : 0) + 300) || since < MIN_ORBIT_WINDOW) return
      guarded('TWO_HATCH', reportTwo)
      guarded('ORBIT', reportOrbit)
      if (S.ow) S.ow.done = true
      emptyInputs()
      beginSwap('multi')
      phase('multi_swap')
      return
    }
    if (S.phase === 'c2') {
      var c2 = S.c2.rec
      if (!(runOver(S.c2, S.c2.product) || since > (c2 ? c2.duration : 0) + 300)) return
      guarded('SMES', reportSmes)
      startJump()
      phase('jump')
      return
    }
    if (S.phase === 'jump') {
      if (!stepJump()) return
      guarded('JUMP', reportJump)
      guarded('LUV_COVERS', reportCovers)
      stop('')
    }
  }

  // every tick: what a window counts
  function measure() {
    var ctrl = null
    if (S.phase === 'one') {
      ctrl = mwCtrl()
      if (ctrl !== null) {
        if (statusOf(ctrl) === 'WORKING') S.one.working++
        var p = Number(ctrl.getRecipeLogic().getProgress())
        if (p > S.one.progress) S.one.progress = p
      }
    }
    if (S.phase === 'c1') measureRun(S.two)
    if (S.phase === 'c2') measureRun(S.c2)
    if (S.ow && !S.ow.done && statusOf(S.arrayP.ctrl) === 'WORKING') S.ow.work++
    if (S.luv && !S.jump && S.phase !== 'forming') {
      var held = storedIn(machineAt(EARTH, LUV_HATCH))
      if (held > S.luvMax) S.luvMax = held
    }
    if (S.cw) {
      var mac = machineAt(EARTH, LUV_MAC)
      if (mac !== null && statusOf(mac) === 'WORKING') S.cw.macWork++
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    S.t = S.server.getTickCount() - S.tick0
    try {
      if (S.arrayP && S.orbit.isLoaded(bp(ARRAY_AT.x, ARRAY_AT.y, ARRAY_AT.z))) feedSteam()
      if (S.phase !== 'end') measure()
      if (S.t % 5 === 0 && S.phase !== 'end') step()
    } catch (e) {
      check('step', false, 'exception in ' + S.phase + ': ' + e)
      stop('an exception in ' + S.phase)
    }
    if (S.phase === 'end') {
      finish()
      return
    }
    if (S.t > TEST_TIMEOUT) {
      check('timeout', false, 'still in ' + S.phase + ' after ' + S.t + ' ticks')
      S.stopReason = 'the timeout in ' + S.phase
      finish()
    }
  }

  function newState(server) {
    var orbit = server.getLevel(ORBIT)
    return { server: server, earth: server.overworld(), orbit: orbit === undefined ? null : orbit, tick0: server.getTickCount(), t: 0, phase: 'start', phaseAt: 0,
      finished: false, areaTouched: false, reported: {}, fluidRoles: {}, luvMax: 0, steamAdded: 0, arrayP: null, stopReason: '' }
  }

  function run(server) {
    S = newState(server)
    guarded('registry', checkRegistry)
    guarded('mw_recipes', checkMwRecipes)
    S.luvMissingWhy = luvMissing()
    S.luv = S.luvMissingWhy === ''
    if (!S.luv) note('luv_tier', 'the wireless LuV tier is not there (' + S.luvMissingWhy + '): no tower B, LuV hatch or covers; JUMP and LUV_COVERS fail')
    S.L = layout()
    // no settlement until both towers have formed (startNetwork)
    W().paused = true
    S.pausedByUs = true
    saveNetwork()
    S.areaTouched = true
    note('AREA_earth', prepareArea(EARTH))
    if (S.orbit) note('AREA_orbit', prepareArea(ORBIT))
    else note('AREA_orbit', ORBIT + ' is not loaded: no orbit array, ORBIT fails')
    var failed = []
    buildAll(S.L, { luv: S.luv, orbit: !!S.orbit }, failed)
    var setup = setupMachines()
    check('PLACED', failed.length === 0 && setup.bad.length === 0, 'the magnet works, tower A (' + TOWER_A_CELLS + ' x ' + short(S.L.ivCell) + ')' +
      (S.luv ? ', tower B (' + TOWER_B_CELLS + ' x ' + short(S.L.luvCell) + '), the LuV hatch, macerator and battery buffer' : '') + (S.orbit ? ', the orbit generator array' : '') +
      '; tracked [' + setup.tracked.join('; ') + ']; ' + setup.covers.join('; ') + (failed.length ? ' FAILED ' + failed.slice(0, 8).join('; ') : '') +
      (setup.bad.length ? ' BAD ' + setup.bad.join('; ') : ''))
    if (failed.length > 0) stop('placing failed')
    else phase('forming')
  }

  // The pack's Additional Placements mod reloads the datapacks (and these scripts) a couple of seconds after the server is up: the
  // command only leaves a request in `global` (a boolean: numbers come back wrapped) and the tick handler starts the test once these
  // scripts have been loaded for QUIET_MS and it is this test's turn on the wireless network.
  var waitingSince = 0

  function gaveUp(server) {
    var why = 'asked for and had no turn on the wireless network in ' + (TURN_WAIT_MS / 1000) + ' s: the queue is [' + queueList().join(', ') + ']'
    global[REQUEST] = false
    waitingSince = 0
    S = newState(server)
    S.stopReason = 'no turn'
    check('TURN', false, why)
    finish()
  }

  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) {
      if (global[REQUEST] !== true) waitingSince = 0
      return
    }
    if (waitingSince === 0) waitingSince = Date.now()
    if (Date.now() - LOADED_AT < QUIET_MS || !myTurn(SCOPE)) {
      if (Date.now() - waitingSince > TURN_WAIT_MS) gaveUp(server)
      return
    }
    global[REQUEST] = false
    waitingSince = 0
    try {
      run(server)
    } catch (e) {
      check('run', false, 'exception: ' + e)
      if (S !== null) {
        S.stopReason = 'an exception at the start'
        finish()
      }
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_luv_a4', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous run is still in progress')
      return 0
    }
    global[REQUEST] = true
    waitingSince = Date.now()
    joinQueue(SCOPE)
    note('requested', 'the test starts once these scripts have been loaded for ' + (QUIET_MS / 1000) + ' s and the wireless tests asked for before it are done (' +
      queueList().join(', ') + '); it fails after ' + (TURN_WAIT_MS / 1000) + ' s without its turn')
    return 1
  })
})()
