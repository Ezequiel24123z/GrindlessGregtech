// Gregtech Grindless - TEST ONLY overlay (never shipped with the pack), package LuV-B8, Europa: the cryobot (gtceu:cryobot, type
// gtceu:vein_drilling) and the algae bioreactor (gtceu:algae_bioreactor, type gtceu:bioreactor): startup_scripts/grindless/luv/europa.js
// (global.grindless.europa) and server_scripts/grindless/luv/europa.js (its recipes and the bacteria cut), lib/places.js, lib/no_voiding.js.
//
// Prepared for LuV's single integrated bench run; it is not meant to get a run of its own. On its own it would be:
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_luv_europa;;kubejs custom_command gg_test_recipe_lookup' `
//     -WaitForLog 'GGTEST\|luv_europa\|DONE@@180;;GGTEST\|lookup\|DONE@@180'
// In the integrated candidate: add 'kubejs custom_command gg_test_luv_europa' to -Commands and 'GGTEST\|luv_europa\|DONE@@180' to
// -WaitForLog (before any @restart). gg_test_recipe_lookup covers the lookup paths of gtceu:bioreactor and the widened vein_drilling.
//
// Markers: GGTEST|luv_europa|<check>|PASS|FAIL|NOTE|SKIP|<detail>
//   registration          both machines registered on their types (gtceu:vein_drilling, gtceu:bioreactor) with a structure description;
//                         gtceu:bioreactor at least 3/0/3/2 (items in/out, fluids in/out); gtceu:magnesium_sulfate_dust exists;
//                         vein_drilling widened to >= 3 item inputs, >= 10 item outputs, >= 1 fluid input and >= 2 fluid outputs
//   recipes               every id of global.grindless.europa.recipes is live with its type (GT ones) or makes its controller (crafting);
//                         the two cryobot recipes and the culture carry a dimension condition naming places.surface('europa') (not
//                         reversed); the algae recipe carries no condition
//   cut                   every id of global.grindless.europa.cut (GTM's gtceu:brewery/bacteria) is gone
//   bacteria_source       of every live GT recipe, the ones that output gtceu:bacteria are exactly the Europan culture
//   bacteria_consumers    GTM's gtceu:chemical_reactor/bacterial_sludge, large_chemical_reactor/bacterial_sludge and
//                         large_chemical_reactor/stem_cells and every biofoundry (gtceu:sterile_culture) recipe that lists bacteria are
//                         live and take gtceu:bacteria (by id or the forge:bacteria tag); NOTE lists every consumer found
//   electrolysis          GTM's generated gtceu:electrolyzer/decomposition_electrolyzing_magnesium_sulfate: 6 dust -> 1 Mg + 1 S dust
//                         + 4,000 mB oxygen
//   drill_family          of every vein_drilling recipe the cryobot's rules take exactly its two (prefix + LuV tier folder) and every
//                         lower drill tier (lv..iv) skips them; NOTE names the lower drill recipe injected below
//   <copy>_formed         cryo_packed (packed-ice shaft), cryo_blue (blue-ice shaft) and bio form on Earth (spike S0-7 on Earth)
//   cryo_stone_not_formed / cryo_stone_reformed / cryo_stone_broken   one stone in the middle of the shaft: no forming while the
//                         ice copies do; the stone swapped for packed ice: it forms; the stone put back: it unforms
//   cryobot_voiding_contract / bioreactor_voiding_contract   the controller's own recipe modifier: its own recipe refused while voiding
//                         items or fluids, accepted with voiding off; its beforeWorking refuses a run while voiding (lib/no_voiding.js,
//                         both places); the cryobot's modifier refuses a lower drill recipe (NOTE if beforeWorking is unreadable)
//   cryobot_sample_earth_refused / cryobot_brine_earth_refused / bio_culture_earth_refused   the Europa-only recipes do not start on
//                         Earth with full inputs and energy (dimension condition): no progress, nothing used, nothing made
//   cryobot_lower_drill_refused   a lower drill recipe's inputs (no dimension condition or the Overworld's) never start in the cryobot
//   bio_void_items_refused / bio_void_fluids_refused / bio_algae_run / bio_cached_void_refused / bio_algae_resumed   the algae recipe
//                         (circuit 1) refused while voiding items, then fluids; with voiding off it runs: 250 mB biomass + 400 mB
//                         oxygen, water and CO2 used up; refilled while voiding fluids (GTM's cached last recipe path) it does not start;
//                         voiding off again: a second run, 500 + 800 in all
//   europa                SKIP when places.surface('europa') has no level (package B1 registers it); then every europa_* check is SKIP
//   europa_site           NOTE: where the copies stand on Europa and whether the cryobot's shaft is the world's own ice
//   cryo_europa_formed / bio_europa_formed, cryo_europa_void_items_refused / cryo_europa_void_fluids_refused (the real refusal with the
//                         conditions met), cryo_europa_sample (probe used, 1 ocean sample + 1,000 mB brine), cryo_europa_brine (+8,000 mB
//                         brine and 2,000 mB water; melt head and RTG pellet chanced), bio_europa_culture (1,000 mB bacteria + 100 mB
//                         biomass, the extract and the fluids used, the ocean sample kept). Long runs are fast-forwarded with
//                         RecipeLogic#setProgress (GTM still finishes them: outputs and chance rolls stay GTM's)
//   cleanup               NOTE: what was restored; luv_europa|DONE is the last line
//
// TEST AREA: band X 17408-17471, Z 0-63; it only uses Z 0-15. The Overworld at Y 98-113 (the cryobot is 16 blocks high: its 5-block ice
// shaft, base and derrick do not fit in 98-112, like the HV refinery's 98-113). On Europa (if it exists) the same X and Z, from the
// ground's top up: the cryobot's base sits on the ice when the ground column under its shaft is 5 blocks of packed or blue ice (the world's
// ice: S0-7 proper), otherwise on its own placed shaft. Every cell the test sets is recorded with its previous state and put back at the
// end (machines emptied first, then dropped item entities in the copies' boxes discarded); only the chunks it force-loaded are released.
// The cryobot's hatches sit under a smooth-stone ring in the pattern's free cells right above the base (a hatch that is rained on may
// explode); the bioreactor's own vault roof covers its hatches.
// Ceiling: 150 s from the command and 2,900 ticks; about 30 s in game.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'luv_europa'
  var REQUEST = 'ggTestLuvEuropaRequest'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var DEADLINE_MS = 150000
  var DEADLINE_TICKS = 2900
  var BAND = { x0: 17408, x1: 17471, z0: 0, z1: 15 }
  var EARTH = 'minecraft:overworld'
  var EARTH_Y = { low: 98, high: 113 }
  var Z = 2
  var FORM_TICKS = 300
  var HOLD = 60
  var VOID_HOLD = 40
  var RUN_TICKS = 600
  var STONE_HOLD = 120
  var BREAK_TICKS = 100

  var CRYOBOT = 'gtceu:cryobot'
  var BIOREACTOR = 'gtceu:algae_bioreactor'
  var DRILL_TYPE = 'gtceu:vein_drilling'
  var BIO_TYPE = 'gtceu:bioreactor'
  var BRINE = 'gtceu:europan_brine'
  var PROBE = 'grindless:cryobot_probe'
  var SAMPLE = 'grindless:europan_ocean_sample'
  var MELT_HEAD = 'grindless:melt_head'
  var RTG = 'grindless:rtg_pellet'
  var EXTRACT = 'grindless:chondritic_extract'
  var ID = {
    sample: 'grindless:vein_drilling/luv/cryobot_ocean_sample',
    brine: 'grindless:vein_drilling/luv/cryobot_brine',
    algae: 'grindless:bioreactor/luv/algae',
    culture: 'grindless:bioreactor/luv/europan_culture',
    electrolysis: 'gtceu:electrolyzer/decomposition_electrolyzing_magnesium_sulfate'
  }
  var GTM_BACTERIA_TAKERS = ['gtceu:chemical_reactor/bacterial_sludge', 'gtceu:large_chemical_reactor/bacterial_sludge',
    'gtceu:large_chemical_reactor/stem_cells']
  var HATCH = {
    energy: 'gtceu:luv_energy_input_hatch', inBus: 'gtceu:luv_input_bus', outBus: 'gtceu:luv_output_bus',
    inHatch: 'gtceu:luv_input_hatch', outHatch: 'gtceu:luv_output_hatch'
  }
  var ROLES = {
    cryobot: [['energy', HATCH.energy], ['inBus', HATCH.inBus], ['outBus', HATCH.outBus], ['out1', HATCH.outHatch], ['out2', HATCH.outHatch]],
    bioreactor: [['energy', HATCH.energy], ['inBus', HATCH.inBus], ['in1', HATCH.inHatch], ['in2', HATCH.inHatch], ['in3', HATCH.inHatch],
      ['out1', HATCH.outHatch], ['out2', HATCH.outHatch]]
  }
  var IN_HATCHES = ['in1', 'in2', 'in3']
  var OUT_HATCHES = ['out1', 'out2']
  var COPIES = [
    { key: 'cryo_packed', kind: 'cryobot', world: 'earth', x: 17412, shaft: 'minecraft:packed_ice', after: 'contract' },
    { key: 'cryo_blue', kind: 'cryobot', world: 'earth', x: 17420, shaft: 'minecraft:blue_ice', after: 'done' },
    { key: 'cryo_stone', kind: 'cryobot', world: 'earth', x: 17428, shaft: 'minecraft:packed_ice', stoneRow: 2, after: 'done' },
    { key: 'bio', kind: 'bioreactor', world: 'earth', x: 17436, after: 'contract' },
    { key: 'cryo_europa', kind: 'cryobot', world: 'europa', x: 17452, shaft: 'minecraft:packed_ice', after: 'e_void_items' },
    { key: 'bio_europa', kind: 'bioreactor', world: 'europa', x: 17460, after: 'e_culture' }
  ]

  var S = null
  var J = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 2400)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    emit(name, ok ? 'PASS' : 'FAIL', detail)
    return ok
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  function safely(name, fn) {
    try {
      fn()
    } catch (e) {
      check(name, false, 'exception: ' + e)
    }
  }

  function problemsText(problems) {
    return problems.length > 0 ? ' / problems: ' + problems.slice(0, 12).join('; ') + (problems.length > 12 ? ' and ' + (problems.length - 12) + ' more' : '') : ''
  }

  // ---------------------------------------------------------------- Java helpers

  function lazy() {
    if (J === null) {
      J = {
        Pos: Java.loadClass('net.minecraft.core.BlockPos'),
        RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
        AL: Java.loadClass('java.util.ArrayList'),
        AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
        ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
        ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        Heightmap: Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types'),
        Forge: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        Registry: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
        Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Voiding: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode')
      }
    }
    return J
  }

  function asArray(coll) {
    var list = new (lazy().AL)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new (lazy().RL)(id)
  }

  function short(id) {
    return String(id).replace(/^(gtceu|grindless|minecraft):/, '')
  }

  function EU() {
    return global.grindless.europa || {}
  }

  function itemName(stack) {
    return String(lazy().Forge.ITEMS.getKey(stack.getItem()))
  }

  function fluidName(stack) {
    return String(lazy().Forge.FLUIDS.getKey(stack.getFluid()))
  }

  function byId(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  function recipeType(id) {
    var t = lazy().Registry.RECIPE_TYPES.get(rl(id))
    return t === undefined ? null : t
  }

  function ofType(id) {
    var t = recipeType(id)
    return t === null ? [] : asArray(S.server.getRecipeManager().getAllRecipesFor(t))
  }

  function typeOf(r) {
    try {
      return String(r.getType().registryName)
    } catch (e) {
      return 'unknown'
    }
  }

  function conditionTexts(r) {
    try {
      return asArray(r.conditions).map(function (c) { return String(c.serialize()) })
    } catch (e) {
      return ['unreadable: ' + e]
    }
  }

  function stacksText(list, fluid) {
    return list.map(function (st) { return (fluid ? Number(st.getAmount()) + ' mB ' + short(fluidName(st)) : Number(st.getCount()) + 'x ' + short(itemName(st))) }).join(' + ')
  }

  function countsOf(list, fluid) {
    var out = {}
    list.forEach(function (st) {
      if (st.isEmpty()) return
      var id = fluid ? fluidName(st) : itemName(st)
      out[id] = (out[id] || 0) + Number(fluid ? st.getAmount() : st.getCount())
    })
    return out
  }

  function sameCounts(got, want) {
    var keys = Object.keys(got).concat(Object.keys(want))
    return keys.every(function (k) { return (got[k] || 0) === (want[k] || 0) })
  }

  function countsText(c) {
    var keys = Object.keys(c).sort()
    return keys.length === 0 ? 'nothing' : keys.map(function (k) { return short(k) + ' ' + c[k] }).join(', ')
  }

  // ---------------------------------------------------------------- world helpers

  function cmd(m, text) {
    return Number(S.server.runCommandSilent('execute in ' + m.dim + ' run ' + text))
  }

  function pos(p) {
    return new (lazy().Pos)(p.x, p.y, p.z)
  }

  function key(p) {
    return p.x + ',' + p.y + ',' + p.z
  }

  function blockAt(m, p) {
    return String(m.level.getBlock(p.x, p.y, p.z).id)
  }

  function machineAt(m, p) {
    return lazy().Meta.getMachine(m.level, pos(p))
  }

  function inside(m, p) {
    if (p.x < BAND.x0 || p.x > BAND.x1 || p.z < BAND.z0 || p.z > BAND.z1 || p.y < m.low || p.y > m.high) {
      throw new Error('out of the reserved band: ' + m.dim + ' ' + key(p))
    }
  }

  // generates and force-loads the chunk (only a ticket this test added is released at the end)
  function ensureChunk(m, x, z) {
    var ticket = m.dim + ':' + (x >> 4) + ',' + (z >> 4)
    if (S.chunks[ticket]) return
    S.chunks[ticket] = true
    m.level.getChunk(x >> 4, z >> 4)
    if (cmd(m, 'forceload query ' + x + ' ' + z) < 1) {
      cmd(m, 'forceload add ' + x + ' ' + z)
      S.tickets.push({ m: m, x: x, z: z })
    }
  }

  // sets a block, remembering what was there the first time the cell is touched (put back at the end)
  function put(m, p, id) {
    inside(m, p)
    ensureChunk(m, p.x, p.z)
    var k = m.dim + ':' + key(p)
    if (!S.owned[k]) {
      var old = m.level.getBlockState(pos(p))
      S.owned[k] = true
      S.cells.push({ m: m, p: p, old: old, air: old.isAir() === true })
    }
    cmd(m, 'setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + id + ' replace')
    var want = id.split('[')[0]
    if (blockAt(m, p) !== want) throw new Error('placement failed: ' + id + ' at ' + key(p) + ' (found ' + blockAt(m, p) + ')')
  }

  function plain(sym) {
    if (sym.kind === 'oneOf') return plain(sym.options[0])
    if (sym.kind === 'blocks') return String(sym.blocks[0])
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    throw new Error('unsupported structure symbol ' + sym.kind)
  }

  function anchorOf(d) {
    var anchor = null
    d.slices.forEach(function (rows, z) {
      rows.forEach(function (row, y) {
        var x = row.indexOf('S')
        if (x >= 0) anchor = { x: x, y: y, z: z }
      })
    })
    if (anchor === null) throw new Error('no controller cell in ' + d.id)
    return anchor
  }

  // world position of a pattern cell, the controller at m.p facing north (the structure behind it, towards +Z)
  function cellPos(m, anchor, x, y, z) {
    return { x: m.p.x - x + anchor.x, y: m.p.y + y - anchor.y, z: m.p.z - z + anchor.z }
  }

  function isIce(id) {
    return EU().ice ? EU().ice.indexOf(id) >= 0 : (id === 'minecraft:packed_ice' || id === 'minecraft:blue_ice')
  }

  function topY(m, x, z) {
    return Number(m.level.getHeight(lazy().Heightmap.MOTION_BLOCKING_NO_LEAVES, x, z)) - 1
  }

  // Europa: where the copy stands. The cryobot's base goes right above the ground column under its shaft; that column is used as the shaft
  // when its top 5 blocks are ice (the world's ice), otherwise the base goes 6 above it, on a shaft of our own.
  function siteOnEuropa(m, d) {
    var anchor = anchorOf(d)
    var width = d.slices[0][0].length
    var depth = d.slices.length
    var height = d.slices[0].length
    var top = -100000
    for (var dx = 0; dx < width; dx++) {
      for (var dz = 0; dz < depth; dz++) {
        var cx = m.x - dx + anchor.x
        var cz = Z - dz + anchor.z
        ensureChunk(m, cx, cz)
        top = Math.max(top, topY(m, cx, cz))
      }
    }
    if (m.kind === 'cryobot') {
      var sx = m.x
      var sz = Z + anchor.z - 2
      var centre = topY(m, sx, sz)
      var column = []
      for (var y = centre - 4; y <= centre; y++) column.push(String(m.level.getBlock(sx, y, sz).id))
      m.natural = column.every(isIce)
      m.column = column
      m.p = { x: m.x, y: m.natural ? centre + 1 : centre + 6, z: Z }
      m.groundTop = centre
    } else {
      m.p = { x: m.x, y: top + 1 + anchor.y, z: Z }
      m.groundTop = top
    }
    m.low = m.p.y - anchor.y
    m.high = m.low + height - 1
    var minY = -64
    var maxY = 320
    try {
      minY = Number(m.level.getMinBuildHeight())
      maxY = Number(m.level.getMaxBuildHeight()) - 1
    } catch (e) { /* vanilla defaults */ }
    if (m.low < minY || m.high > maxY) throw new Error('Europa\'s ground at ' + m.groundTop + ' leaves no room for ' + height + ' rows (build height ' + minY + '..' + maxY + ')')
  }

  function place(m) {
    var d = global.grindless.structures[m.id]
    if (!d) throw new Error('no structure description for ' + m.id)
    var anchor = anchorOf(d)
    if (m.world === 'earth') {
      m.p = { x: m.x, y: EARTH_Y.low + anchor.y, z: Z }
      m.low = EARTH_Y.low
      m.high = EARTH_Y.high
    } else {
      siteOnEuropa(m, d)
    }
    var roles = ROLES[m.kind].slice()
    var next = 0
    m.positions = {}
    m.shaftCells = {}
    d.slices.forEach(function (rows, z) {
      rows.forEach(function (row, y) {
        for (var x = 0; x < row.length; x++) {
          var ch = row.charAt(x)
          var sym = d.symbols[ch]
          var p = cellPos(m, anchor, x, y, z)
          if (!sym) {
            // the cryobot's free cells right above the base: a ring that keeps the rain off its hatches
            if (m.kind === 'cryobot' && y === anchor.y + 1) put(m, p, 'minecraft:smooth_stone')
            continue
          }
          if (sym.kind === 'controller' || sym.kind === 'any') continue
          if (sym.kind === 'air') {
            if (blockAt(m, p) !== 'minecraft:air') put(m, p, 'minecraft:air')
            continue
          }
          if (ch === 'I') {
            m.shaftCells[y] = p
            if (m.natural) {
              if (!isIce(blockAt(m, p))) throw new Error('the natural shaft cell ' + key(p) + ' is ' + blockAt(m, p))
              continue
            }
            put(m, p, m.stoneRow === y ? 'minecraft:stone' : m.shaft)
            continue
          }
          if (ch === 'X' && next < roles.length) {
            m.positions[roles[next][0]] = p
            put(m, p, roles[next][1] + '[facing=north]')
            next++
            continue
          }
          put(m, p, plain(sym))
        }
      })
    })
    if (next !== roles.length) throw new Error('not enough part cells for ' + m.id)
    put(m, m.p, m.id + '[facing=north]')
    m.anchor = anchor
  }

  // ---------------------------------------------------------------- machine helpers

  function readParts(m) {
    m.parts = {}
    Object.keys(m.positions).forEach(function (role) {
      var part = machineAt(m, m.positions[role])
      if (part === null || part === undefined) throw new Error('no part machine for ' + role + ' at ' + key(m.positions[role]))
      m.parts[role] = part
    })
  }

  function topUp(m) {
    var c = m.parts.energy.energyContainer
    c.setEnergyStored(c.getEnergyCapacity())
  }

  function wake(m) {
    try {
      m.ctrl.getRecipeLogic().updateTickSubscription()
    } catch (e) { /* the scenario reports what did not run */ }
  }

  function setVoiding(m, mode) {
    m.ctrl.setVoidingMode(lazy().Voiding[mode])
    wake(m)
  }

  function busCounts(bus) {
    var inv = bus.getInventory()
    var out = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemName(st)
      out[id] = (out[id] || 0) + Number(st.getCount())
    }
    return out
  }

  function clearBus(bus) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, lazy().ItemStack.EMPTY)
  }

  function insert(bus, stack) {
    var inv = bus.getInventory()
    var rest = stack
    for (var s = 0; s < inv.getSlots() && !rest.isEmpty(); s++) rest = inv.insertItem(s, rest, false)
    if (!rest.isEmpty()) throw new Error('the bus is full: ' + Number(rest.getCount()) + 'x ' + itemName(rest) + ' left')
  }

  function setTank(hatch, id, amount) {
    // a FluidStack built by KubeJS: setFluidInTank ignores one built outside it
    if (amount <= 0) hatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    else hatch.tank.setFluidInTank(0, Fluid.of(id, amount).getFluidStack())
  }

  function hatchFluids(m, roles) {
    var out = {}
    roles.forEach(function (role) {
      var h = m.parts[role]
      if (!h) return
      var st = h.tank.getFluidInTank(0)
      if (st.isEmpty()) return
      var id = fluidName(st)
      out[id] = (out[id] || 0) + Number(st.getAmount())
    })
    return out
  }

  function outItems(m) {
    return m.parts.outBus ? busCounts(m.parts.outBus) : {}
  }

  function circuitOf(m) {
    var st = m.parts.inBus.getCircuitInventory().getStackInSlot(0)
    return st.isEmpty() ? 0 : Number(lazy().Circuit.getCircuitConfiguration(st))
  }

  function snapshot(m) {
    return JSON.stringify({ c: circuitOf(m), i: busCounts(m.parts.inBus), fi: hatchFluids(m, IN_HATCHES), o: outItems(m), fo: hatchFluids(m, OUT_HATCHES) })
  }

  function state(m) {
    try {
      var rlg = m.ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      var reasons = []
      try {
        reasons = asArray(rlg.getFailureReasons()).map(function (c) { return String(c.getString()) })
      } catch (e) { /* not in this GTM */ }
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() + ' last=' + (last ? last.id : 'none') +
        ' voiding=' + m.ctrl.getVoidingMode() + (reasons.length > 0 ? ' reasons=[' + reasons.join('; ') + ']' : '')
    } catch (e2) {
      return 'state unreadable: ' + e2
    }
  }

  function contentsText(m) {
    return 'circuit ' + circuitOf(m) + '; in: ' + countsText(busCounts(m.parts.inBus)) + ' / ' + countsText(hatchFluids(m, IN_HATCHES)) +
      '; out: ' + countsText(outItems(m)) + ' / ' + countsText(hatchFluids(m, OUT_HATCHES))
  }

  // sc: { circuit, items: [stack | [id, count]], fluids: [[role, id, amount]] }; outputs are left as they are
  function feed(m, sc, reset) {
    clearBus(m.parts.inBus)
    m.parts.inBus.getCircuitInventory().setStackInSlot(0, sc.circuit > 0 ? lazy().Circuit.stack(sc.circuit) : lazy().ItemStack.EMPTY)
    IN_HATCHES.forEach(function (role) { if (m.parts[role]) setTank(m.parts[role], null, 0) })
    ;(sc.items || []).forEach(function (it) {
      insert(m.parts.inBus, Array.isArray(it) ? Item.of(it[0], it[1]) : it.copy())
    })
    ;(sc.fluids || []).forEach(function (f) { setTank(m.parts[f[0]], f[1], f[2]) })
    if (reset) m.ctrl.getRecipeLogic().resetRecipeLogic()
    wake(m)
  }

  function go(m, phase) {
    m.phase = phase
    m.at = S.tick
    m.seen = false
    if (m.ctrl && m.parts) m.snap = snapshot(m)
  }

  function blocked(m) {
    var rlg = m.ctrl.getRecipeLogic()
    return Number(rlg.getProgress()) === 0 && String(rlg.getStatus()) !== 'WORKING' && snapshot(m) === m.snap
  }

  // a run in progress: seen, and fast-forwarded to its last tick (GTM still finishes it and rolls its chances)
  function watchRun(m) {
    var rlg = m.ctrl.getRecipeLogic()
    var progress = Number(rlg.getProgress())
    var duration = Number(rlg.getDuration())
    if (String(rlg.getStatus()) === 'WORKING' || progress > 0) {
      m.seen = true
      if (progress >= 1 && duration - progress > 2) rlg.setProgress(duration - 1)
    }
  }

  // the controller's own recipe modifier (null = refused); GTM's steam test form, then IRecipeLogicMachine#fullModifyRecipe
  function modify(m, recipe) {
    var out = null
    try {
      out = m.ctrl.getDefinition().getRecipeModifier().getModifier(m.ctrl, recipe).apply(recipe.copy())
    } catch (e) {
      out = m.ctrl.fullModifyRecipe(recipe.copy())
    }
    return out === undefined ? null : out
  }

  function beforeWorking(m, recipe) {
    return m.ctrl.getDefinition().getBeforeWorking().test(m.ctrl, recipe) === true
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var E = EU()

    safely('registration', function () {
      var problems = []
      var lines = []
      ;[[CRYOBOT, DRILL_TYPE], [BIOREACTOR, BIO_TYPE]].forEach(function (w) {
        var def = lazy().Registry.MACHINES.get(rl(w[0]))
        if (def === null || def === undefined) {
          problems.push(w[0] + ' is not registered')
          return
        }
        var types = []
        var arr = def.getRecipeTypes()
        for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
        if (types.join(',') !== w[1]) problems.push(w[0] + ' types ' + types.join(','))
        if (!global.grindless.structures[w[0]]) problems.push(w[0] + ' has no structure description')
        lines.push(short(w[0]) + ' on ' + types.join(','))
      })
      var c = lazy()
      function sizes(id) {
        var t = recipeType(id)
        if (t === null) return null
        return [t.getMaxInputs(c.ItemCap), t.getMaxOutputs(c.ItemCap), t.getMaxInputs(c.FluidCap), t.getMaxOutputs(c.FluidCap)].map(Number)
      }
      var bio = sizes(BIO_TYPE)
      var drill = sizes(DRILL_TYPE)
      var bioWant = E.bioreactorIO ? [E.bioreactorIO.itemsIn, E.bioreactorIO.itemsOut, E.bioreactorIO.fluidsIn, E.bioreactorIO.fluidsOut].map(Number) : [3, 0, 3, 2]
      if (bio === null) problems.push(BIO_TYPE + ' is not registered')
      else if (bio[0] < bioWant[0] || bio[2] < bioWant[2] || bio[3] < bioWant[3]) problems.push(BIO_TYPE + ' sizes ' + bio.join('/') + ' < ' + bioWant.join('/'))
      if (drill === null) problems.push(DRILL_TYPE + ' is not registered')
      else if (drill[0] < 3 || drill[1] < 10 || drill[2] < 1 || drill[3] < 2) problems.push(DRILL_TYPE + ' sizes ' + drill.join('/') + ' (want >= 3/10/1/2)')
      var dust = 'gtceu:magnesium_sulfate_dust'
      if (!Item.exists(dust)) problems.push(dust + ' does not exist')
      check('registration', problems.length === 0, lines.join(', ') + '; ' + BIO_TYPE + ' items/fluids in/out ' + (bio ? bio.join('/') : 'none') +
        '; ' + DRILL_TYPE + ' ' + (drill ? drill.join('/') : 'none') + '; ' + short(dust) + (Item.exists(dust) ? ' exists' : ' missing') + problemsText(problems))
    })

    safely('recipes', function () {
      var surface = global.grindless.places.surface('europa')
      var problems = []
      var ids = E.recipes || []
      if (ids.length === 0) problems.push('global.grindless.europa.recipes is empty')
      ids.forEach(function (id) {
        var r = byId(id)
        if (r === null) {
          problems.push(id + ' missing')
          return
        }
        var folder = String(id).split(':')[1].split('/')[0]
        if (folder === 'crafting') {
          var out = String(r.getResultItem(S.server.registryAccess()).getId())
          if (out !== 'gtceu:' + String(id).split('/')[1]) problems.push(id + ' makes ' + out)
          return
        }
        if (typeOf(r) !== 'gtceu:' + folder) problems.push(id + ' is ' + typeOf(r))
      })
      ;[ID.sample, ID.brine, ID.culture].forEach(function (id) {
        var r = byId(id)
        if (r === null) return
        var texts = conditionTexts(r)
        var named = texts.filter(function (t) { return t.indexOf(surface) >= 0 })
        if (named.length !== 1 || /"reverse":\s*true/.test(named[0])) problems.push(id + ' conditions [' + texts.join(', ') + ']')
      })
      var algae = byId(ID.algae)
      if (algae !== null && conditionTexts(algae).length !== 0) problems.push(ID.algae + ' conditions [' + conditionTexts(algae).join(', ') + ']')
      check('recipes', problems.length === 0, ids.length + ' ids live with their types; sample, brine and culture only on ' + surface +
        ', algae anywhere' + problemsText(problems))
    })

    safely('cut', function () {
      var cut = E.cut || []
      var live = cut.filter(function (id) { return byId(id) !== null })
      check('cut', cut.length > 0 && live.length === 0, 'cut: ' + cut.join(', ') + (live.length > 0 ? '; still live: ' + live.join(', ') : '; none live'))
    })

    safely('bacteria', function () {
      var c = lazy()
      var makers = []
      var takers = {}
      var unreadable = 0
      asArray(c.Registry.RECIPE_TYPES.values()).forEach(function (t) {
        if (Number(t.getMaxOutputs(c.FluidCap)) === 0 && Number(t.getMaxInputs(c.FluidCap)) === 0) return
        asArray(S.server.getRecipeManager().getAllRecipesFor(t)).forEach(function (r) {
          try {
            if (countsOf(asArray(c.Helper.getOutputFluids(r)), true)['gtceu:bacteria']) makers.push(String(r.getId()))
            if (countsOf(asArray(c.Helper.getInputFluids(r)), true)['gtceu:bacteria']) takers[String(r.getId())] = true
          } catch (e) {
            unreadable++
          }
        })
      })
      check('bacteria_source', makers.length === 1 && makers[0] === ID.culture, 'gtceu:bacteria made by [' + makers.join(', ') + ']' +
        (unreadable > 0 ? ' (' + unreadable + ' recipes unreadable)' : ''))
      var bf = (global.grindless.biofoundry && global.grindless.biofoundry.recipes) || []
      var bfIds = bf.filter(function (rec) {
        return (rec.fluidsIn || []).some(function (f) { return f.id === 'gtceu:bacteria' })
      }).map(function (rec) { return rec.recipeId })
      var want = GTM_BACTERIA_TAKERS.concat(bfIds)
      var missing = want.filter(function (id) { return !takers[id] })
      check('bacteria_consumers', bfIds.length > 0 && missing.length === 0, want.length + ' required consumers live and take bacteria (' +
        bfIds.length + ' of the biofoundry)' + (missing.length > 0 ? '; missing or not taking bacteria: ' + missing.join(', ') : ''))
      note('bacteria_consumers', Object.keys(takers).sort().join(', '))
    })

    safely('electrolysis', function () {
      var r = byId(ID.electrolysis)
      if (r === null) {
        check('electrolysis', false, ID.electrolysis + ' missing')
        return
      }
      var c = lazy()
      var ins = countsOf(asArray(c.Helper.getInputItems(r)), false)
      var outs = countsOf(asArray(c.Helper.getOutputItems(r)), false)
      var fouts = countsOf(asArray(c.Helper.getOutputFluids(r)), true)
      var fins = countsOf(asArray(c.Helper.getInputFluids(r)), true)
      var ok = sameCounts(ins, { 'gtceu:magnesium_sulfate_dust': 6 }) && sameCounts(outs, { 'gtceu:magnesium_dust': 1, 'gtceu:sulfur_dust': 1 }) &&
        sameCounts(fouts, { 'gtceu:oxygen': 4000 }) && Object.keys(fins).length === 0
      check('electrolysis', ok, short(ID.electrolysis) + ': ' + countsText(ins) + ' / ' + countsText(fins) + ' -> ' + countsText(outs) + ' / ' + countsText(fouts))
    })

    safely('drill_family', function () {
      var rules = global.grindless.lv.rules
      var all = ofType(DRILL_TYPE)
      var problems = []
      var taken = all.filter(function (r) { return E.isCryobotRecipe(r) && rules.recipeTier(r) === 'luv' }).map(function (r) { return String(r.getId()) }).sort()
      var want = [ID.brine, ID.sample].sort()
      if (taken.join(',') !== want.join(',')) problems.push('takes [' + taken.join(',') + ']')
      want.forEach(function (id) {
        var r = byId(id)
        if (r === null) return
        ;['lv', 'mv', 'hv', 'ev', 'iv'].forEach(function (tier) {
          if (!rules.isAboveTier(r, tier)) problems.push(tier + ' drills could take ' + short(id))
        })
      })
      var surface = global.grindless.places.surface('europa')
      // a lower drill recipe whose inputs can be loaded into the cryobot on Earth: items only, no condition but the Overworld's dimension
      var others = all.filter(function (r) { return !E.isCryobotRecipe(r) })
      var injectable = others.filter(function (r) {
        try {
          if (asArray(lazy().Helper.getInputFluids(r)).length > 0) return false
          var items = asArray(lazy().Helper.getInputItems(r))
          if (items.length === 0 || items.length > 16) return false
          return conditionTexts(r).every(function (t) {
            return t.indexOf('dimension') >= 0 && t.indexOf(EARTH) >= 0 && !/"reverse":\s*true/.test(t) && t.indexOf(surface) < 0
          })
        } catch (e) {
          return false
        }
      })
      S.other = injectable.length > 0 ? injectable[0] : (others.length > 0 ? others[0] : null)
      S.otherInjectable = injectable.length > 0
      if (S.other === null) problems.push('no other vein_drilling recipe to refuse')
      check('drill_family', problems.length === 0, 'of ' + all.length + ' vein_drilling recipes the cryobot\'s rules take exactly [' + taken.map(short).join(', ') +
        '], above every lower drill tier' + problemsText(problems))
      if (S.other !== null) {
        note('drill_family', 'lower drill recipe for the refusals: ' + S.other.getId() + ' (' + (S.otherInjectable ? 'injected on Earth' : 'modifier only: none loadable on Earth') +
          '; ' + stacksText(asArray(lazy().Helper.getInputItems(S.other)), false) + ')')
      }
    })
  }

  // ---------------------------------------------------------------- the voiding contract (modifier and beforeWorking)

  function contract(m, own, name) {
    var problems = []
    var lines = []
    ;['VOID_ITEMS', 'VOID_FLUIDS', 'VOID_NONE'].forEach(function (mode) {
      m.ctrl.setVoidingMode(lazy().Voiding[mode])
      var modified = modify(m, own)
      var refuse = mode !== 'VOID_NONE'
      if ((modified === null) !== refuse) problems.push('modifier with ' + mode + ' ' + (modified === null ? 'refused' : 'accepted'))
      lines.push(mode + ': modifier ' + (modified === null ? 'refused' : 'accepted'))
      try {
        var ok = beforeWorking(m, own)
        if (ok === refuse) problems.push('beforeWorking with ' + mode + ' ' + (ok ? 'allowed' : 'refused'))
        lines.push('beforeWorking ' + (ok ? 'allowed' : 'refused'))
      } catch (e) {
        if (!S.beforeNoted) note('before_working', 'unreadable (' + e + '); the process checks cover it')
        S.beforeNoted = true
      }
    })
    m.ctrl.setVoidingMode(lazy().Voiding.VOID_NONE)
    if (m.kind === 'cryobot' && S.other !== null) {
      var other = modify(m, S.other)
      if (other !== null) problems.push('the modifier accepts ' + S.other.getId())
      lines.push(short(String(S.other.getId())) + ': ' + (other === null ? 'refused' : 'accepted'))
    }
    m.ctrl.getRecipeLogic().resetRecipeLogic()
    check(name, problems.length === 0, short(String(own.getId())) + ' - ' + lines.join(', ') + problemsText(problems))
  }

  // ---------------------------------------------------------------- scenarios

  function sampleInputs() {
    return { circuit: 1, items: [[PROBE, 1]] }
  }

  function brineInputs() {
    return { circuit: 2, items: [[MELT_HEAD, 1], [RTG, 1]] }
  }

  function cultureInputs() {
    return { circuit: 2, items: [[EXTRACT, 1], [SAMPLE, 1]], fluids: [['in1', BRINE, 1000], ['in2', 'gtceu:hydrogen_peroxide', 250], ['in3', 'gtceu:hydrogen', 500]] }
  }

  function algaeInputs() {
    return { circuit: 1, fluids: [['in1', 'minecraft:water', 1000], ['in2', 'gtceu:carbon_dioxide', 500]] }
  }

  function otherInputs() {
    var items = []
    var circuit = 0
    asArray(lazy().Helper.getInputItems(S.other)).forEach(function (st) {
      if (lazy().Circuit.isIntegratedCircuit(st)) circuit = Number(lazy().Circuit.getCircuitConfiguration(st))
      else items.push(st)
    })
    return { circuit: circuit, items: items }
  }

  function hold(m, name, ticks, next) {
    if (S.tick - m.at < ticks) return false
    check(name, blocked(m), 'full inputs and energy, ' + (S.tick - m.at) + ' ticks: no progress, nothing used or made. ' + state(m) + '; ' + contentsText(m))
    next()
    return true
  }

  function verifyRun(m, name, ok, extra) {
    check(name, m.seen && ok, (m.seen ? 'ran' : 'never seen running') + '; ' + contentsText(m) + (extra ? '; ' + extra : '') + '. ' + state(m))
  }

  function formed(m) {
    m.ctrl = machineAt(m, m.p)
    return !!m.ctrl && m.ctrl.isFormed() === true
  }

  function patternError(m) {
    try {
      var err = m.ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = String(err)
      try {
        var p = err.getPos()
        text += ' at ' + p.getX() + ',' + p.getY() + ',' + p.getZ() + ' (' + String(m.level.getBlock(p.getX(), p.getY(), p.getZ()).id) + ')'
      } catch (e1) { /* no position */ }
      return text
    } catch (e) {
      return 'pattern error unreadable: ' + e
    }
  }

  function shaftText(m) {
    var rows = Object.keys(m.shaftCells).sort()
    return rows.map(function (r) { return short(blockAt(m, m.shaftCells[r])) }).join(',')
  }

  function advance(m) {
    if (m.phase === 'done') return
    if (m.parts) topUp(m)
    var age = S.tick - m.at
    var fl = null
    switch (m.phase) {
      case 'forming':
        if (!formed(m)) {
          if (age > FORM_TICKS) {
            check(m.key + '_formed', false, 'not formed after ' + age + ' ticks: ' + (m.ctrl ? patternError(m) : 'no controller') + '; shaft ' + shaftText(m))
            m.phase = 'done'
          }
          return
        }
        readParts(m)
        check(m.key + '_formed', true, m.id + ' at ' + key(m.p) + ' in ' + m.dim + ' after ' + age + ' ticks' +
          (m.kind === 'cryobot' ? '; shaft (bottom up) ' + shaftText(m) + (m.natural ? ', the world\'s own ice' : '') : ''))
        go(m, m.after)
        if (m.phase === 'e_void_items') {
          setVoiding(m, 'VOID_ITEMS')
          feed(m, sampleInputs(), true)
          go(m, 'e_void_items')
        } else if (m.phase === 'e_culture') {
          feed(m, cultureInputs(), true)
          go(m, 'e_culture')
        }
        return
      case 'stone_hold':
        if (age < STONE_HOLD) return
        var stoneFormed = formed(m)
        var iceFormed = S.machines.filter(function (o) { return o.world === 'earth' && o.kind === 'cryobot' && o !== m && o.parts }).map(function (o) { return o.key })
        check('cryo_stone_not_formed', !stoneFormed && iceFormed.length > 0, 'shaft (bottom up) ' + shaftText(m) + ': ' + (stoneFormed ? 'FORMED' : 'not formed') +
          ' after ' + age + ' ticks while ' + (iceFormed.length > 0 ? iceFormed.join(' and ') + ' formed' : 'no ice copy formed (proves nothing)') + '; ' +
          (m.ctrl ? patternError(m) : 'no controller'))
        put(m, m.shaftCells[m.stoneRow], 'minecraft:packed_ice')
        go(m, 'stone_fix')
        return
      case 'stone_fix':
        if (formed(m)) {
          check('cryo_stone_reformed', true, 'the stone swapped for packed ice: formed after ' + age + ' ticks')
          put(m, m.shaftCells[m.stoneRow], 'minecraft:stone')
          go(m, 'stone_break')
        } else if (age > FORM_TICKS) {
          check('cryo_stone_reformed', false, 'the stone swapped for packed ice, not formed after ' + age + ' ticks: ' + (m.ctrl ? patternError(m) : 'no controller'))
          m.phase = 'done'
        }
        return
      case 'stone_break':
        if (!formed(m)) {
          check('cryo_stone_broken', true, 'one shaft block back to stone: unformed after ' + age + ' ticks (the world\'s block is watched)')
          m.phase = 'done'
        } else if (age > BREAK_TICKS) {
          check('cryo_stone_broken', false, 'one shaft block back to stone, still formed after ' + age + ' ticks')
          m.phase = 'done'
        }
        return

      // ---------------- the cryobot on Earth
      case 'contract':
        if (m.kind === 'cryobot') {
          var own = byId(ID.sample)
          if (own === null) throw new Error(ID.sample + ' missing')
          contract(m, own, 'cryobot_voiding_contract')
          feed(m, sampleInputs(), true)
          go(m, 'earth_sample')
        } else {
          var algae = byId(ID.algae)
          if (algae === null) throw new Error(ID.algae + ' missing')
          contract(m, algae, 'bioreactor_voiding_contract')
          feed(m, cultureInputs(), true)
          go(m, 'earth_culture')
        }
        return
      case 'earth_sample':
        hold(m, 'cryobot_sample_earth_refused', HOLD, function () {
          feed(m, brineInputs(), true)
          go(m, 'earth_brine')
        })
        return
      case 'earth_brine':
        hold(m, 'cryobot_brine_earth_refused', HOLD, function () {
          if (S.other !== null && S.otherInjectable) {
            feed(m, otherInputs(), true)
            go(m, 'earth_other')
          } else {
            note('cryobot_lower_drill_refused', 'no lower drill recipe loadable on Earth; the modifier refusal in cryobot_voiding_contract covers it')
            m.phase = 'done'
          }
        })
        return
      case 'earth_other':
        hold(m, 'cryobot_lower_drill_refused', HOLD, function () { m.phase = 'done' })
        return

      // ---------------- the bioreactor on Earth
      case 'earth_culture':
        hold(m, 'bio_culture_earth_refused', HOLD, function () {
          setVoiding(m, 'VOID_ITEMS')
          feed(m, algaeInputs(), true)
          go(m, 'void_items')
        })
        return
      case 'void_items':
        hold(m, 'bio_void_items_refused', VOID_HOLD, function () {
          setVoiding(m, 'VOID_FLUIDS')
          go(m, 'void_fluids')
        })
        return
      case 'void_fluids':
        hold(m, 'bio_void_fluids_refused', VOID_HOLD, function () {
          setVoiding(m, 'VOID_NONE')
          go(m, 'algae_run1')
        })
        return
      case 'algae_run1':
      case 'algae_run2':
        watchRun(m)
        var n = m.phase === 'algae_run1' ? 1 : 2
        var fo = hatchFluids(m, OUT_HATCHES)
        if ((fo['gtceu:biomass'] || 0) < 250 * n || (fo['gtceu:oxygen'] || 0) < 400 * n) {
          if (age > RUN_TICKS) {
            verifyRun(m, n === 1 ? 'bio_algae_run' : 'bio_algae_resumed', false, 'no output after ' + age + ' ticks')
            m.phase = 'done'
          }
          return
        }
        var wantOut = { 'gtceu:biomass': 250 * n, 'gtceu:oxygen': 400 * n }
        verifyRun(m, n === 1 ? 'bio_algae_run' : 'bio_algae_resumed', sameCounts(fo, wantOut) && sameCounts(hatchFluids(m, IN_HATCHES), {}),
          'want ' + countsText(wantOut) + ' out, water and CO2 used up')
        if (n === 2) {
          m.phase = 'done'
          return
        }
        // the same recipe again while voiding fluids: GTM restarts its cached last recipe without the modifier (no reset here)
        setVoiding(m, 'VOID_FLUIDS')
        feed(m, algaeInputs(), false)
        go(m, 'cached_void')
        return
      case 'cached_void':
        hold(m, 'bio_cached_void_refused', VOID_HOLD, function () {
          setVoiding(m, 'VOID_NONE')
          go(m, 'algae_run2')
        })
        return

      // ---------------- Europa
      case 'e_void_items':
        hold(m, 'cryo_europa_void_items_refused', VOID_HOLD, function () {
          setVoiding(m, 'VOID_FLUIDS')
          go(m, 'e_void_fluids')
        })
        return
      case 'e_void_fluids':
        hold(m, 'cryo_europa_void_fluids_refused', VOID_HOLD, function () {
          setVoiding(m, 'VOID_NONE')
          go(m, 'e_sample')
        })
        return
      case 'e_sample':
        watchRun(m)
        if ((outItems(m)[SAMPLE] || 0) < 1) {
          if (age > RUN_TICKS) {
            verifyRun(m, 'cryo_europa_sample', false, 'no ocean sample after ' + age + ' ticks')
            m.phase = 'done'
          }
          return
        }
        verifyRun(m, 'cryo_europa_sample', sameCounts(outItems(m), { 'grindless:europan_ocean_sample': 1 }) &&
          sameCounts(hatchFluids(m, OUT_HATCHES), { 'gtceu:europan_brine': 1000 }) && !busCounts(m.parts.inBus)[PROBE], 'want the probe used, 1 sample and 1000 mB brine')
        feed(m, brineInputs(), true)
        go(m, 'e_brine')
        return
      case 'e_brine':
        watchRun(m)
        fl = hatchFluids(m, OUT_HATCHES)
        if ((fl['minecraft:water'] || 0) < 2000) {
          if (age > RUN_TICKS) {
            verifyRun(m, 'cryo_europa_brine', false, 'no meltwater after ' + age + ' ticks')
            m.phase = 'done'
          }
          return
        }
        var left = busCounts(m.parts.inBus)
        verifyRun(m, 'cryo_europa_brine', sameCounts(fl, { 'gtceu:europan_brine': 9000, 'minecraft:water': 2000 }) &&
          (left[MELT_HEAD] || 0) <= 1 && (left[RTG] || 0) <= 1, 'want +8000 mB brine (9000 in all) and 2000 mB water; melt head and RTG pellet ' +
          'kept unless their chance (25 and 56 of 10000) rolled')
        m.phase = 'done'
        return
      case 'e_culture':
        watchRun(m)
        fl = hatchFluids(m, OUT_HATCHES)
        if ((fl['gtceu:bacteria'] || 0) < 1000) {
          if (age > RUN_TICKS) {
            verifyRun(m, 'bio_europa_culture', false, 'no bacteria after ' + age + ' ticks')
            m.phase = 'done'
          }
          return
        }
        verifyRun(m, 'bio_europa_culture', sameCounts(fl, { 'gtceu:bacteria': 1000, 'gtceu:biomass': 100 }) &&
          sameCounts(busCounts(m.parts.inBus), { 'grindless:europan_ocean_sample': 1 }) && sameCounts(hatchFluids(m, IN_HATCHES), {}),
        'want 1000 mB bacteria + 100 mB biomass, the extract and the fluids used, the sample kept')
        m.phase = 'done'
        return
      default:
        throw new Error('unknown phase ' + m.phase)
    }
  }

  // ---------------------------------------------------------------- run

  function startCopies(server) {
    var surface = global.grindless.places.surface('europa')
    var europa = null
    try {
      europa = server.getLevel(surface)
    } catch (e) {
      europa = null
    }
    if (europa === null || europa === undefined) {
      emit('europa', 'SKIP', surface + ' has no level in this server (package B1 registers it): the cryobot\'s Europa runs, the culture and S0-7 on ' +
        'Europa\'s own ice are not covered')
      europa = null
    } else {
      note('europa', surface + ' exists: S0-7 and the Europa runs there')
    }
    var ready = !!global.grindless.structures[CRYOBOT] && !!global.grindless.structures[BIOREACTOR]
    COPIES.forEach(function (copy) {
      var m = {
        key: copy.key, kind: copy.kind, world: copy.world, x: copy.x, shaft: copy.shaft, stoneRow: copy.stoneRow, after: copy.after,
        id: copy.kind === 'cryobot' ? CRYOBOT : BIOREACTOR, dim: copy.world === 'earth' ? EARTH : surface,
        level: copy.world === 'earth' ? server.overworld() : europa, phase: 'done', at: 0, ctrl: null, parts: null, natural: false
      }
      S.machines.push(m)
      if (m.world === 'europa' && europa === null) {
        emit(m.key + '_formed', 'SKIP', 'no Europa level')
        return
      }
      if (!ready) {
        check(m.key + '_placed', false, 'no structure description for the cryobot or the bioreactor (see registration)')
        return
      }
      try {
        place(m)
        m.phase = m.stoneRow !== undefined ? 'stone_hold' : 'forming'
        m.at = S.tick
        if (m.world === 'europa') {
          note(m.key + '_site', 'controller ' + key(m.p) + ', rows Y ' + m.low + '-' + m.high + ', ground top ' + m.groundTop +
            (m.kind === 'cryobot' ? (m.natural ? '; the shaft is Europa\'s own ice: ' : '; no ice column under the shaft, own shaft placed (S0-7 on the world\'s ice not ' +
              'covered); the column was: ') + m.column.map(short).join(',') : ''))
        }
      } catch (e) {
        check(m.key + '_placed', false, 'exception: ' + e)
        m.phase = 'done'
      }
    })
  }

  function cleanup() {
    var errors = []
    var items = 0
    S.machines.forEach(function (m) {
      if (!m.parts) return
      try {
        clearBus(m.parts.inBus)
        if (m.parts.outBus) clearBus(m.parts.outBus)
        IN_HATCHES.concat(OUT_HATCHES).forEach(function (role) { if (m.parts[role]) setTank(m.parts[role], null, 0) })
      } catch (e) { /* the blocks go anyway */ }
    })
    S.cells.slice().reverse().forEach(function (c) {
      try {
        if (c.air) cmd(c.m, 'setblock ' + c.p.x + ' ' + c.p.y + ' ' + c.p.z + ' air replace')
        else c.m.level.setBlock(pos(c.p), c.old, 3)
      } catch (e) {
        errors.push(c.m.dim + ' ' + key(c.p) + ': ' + e)
      }
    })
    S.machines.forEach(function (m) {
      if (!m.p || !m.level) return
      try {
        var list = m.level.getEntitiesOfClass(lazy().ItemEntity, new (lazy().AABB)(m.p.x - 3, m.low - 1, m.p.z - 1, m.p.x + 4, m.high + 2, m.p.z + 6))
        for (var i = 0; i < list.size(); i++) {
          list.get(i).discard()
          items++
        }
      } catch (e) {
        errors.push('items near ' + m.key + ': ' + e)
      }
    })
    S.tickets.forEach(function (t) {
      try {
        cmd(t.m, 'forceload remove ' + t.x + ' ' + t.z)
      } catch (e) {
        errors.push('forceload ' + t.m.dim + ' ' + t.x + ',' + t.z + ': ' + e)
      }
    })
    if (errors.length > 0) check('cleanup', false, errors.slice(0, 8).join('; '))
    else note('cleanup', S.cells.length + ' cells put back, ' + items + ' item entities removed, ' + S.tickets.length + ' force-load tickets released')
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      cleanup()
    } catch (e) {
      check('cleanup', false, 'exception: ' + e)
    }
    console.info(TAG + SCOPE + '|DONE')
  }

  function run(server) {
    S = {
      server: server, started: Date.now(), tick0: Number(server.getTickCount()), tick: 0, machines: [], cells: [], owned: {}, chunks: {},
      tickets: [], finished: false, other: null, otherInjectable: false, beforeNoted: false
    }
    if (!global.grindless || !global.grindless.europa) {
      check('registration', false, 'global.grindless.europa is missing (startup_scripts/grindless/luv/europa.js did not load)')
      finish()
      return
    }
    staticChecks()
    startCopies(server)
    if (S.machines.every(function (m) { return m.phase === 'done' })) finish()
  }

  function onTick(server) {
    if (S === null || S.finished) return
    S.tick = Number(server.getTickCount()) - S.tick0
    if (S.tick > DEADLINE_TICKS || Date.now() - S.started > DEADLINE_MS) {
      S.machines.forEach(function (m) {
        if (m.phase !== 'done') check(m.key + '_deadline', false, 'still in ' + m.phase + ' at tick ' + S.tick + (m.ctrl ? ': ' + state(m) : ''))
        m.phase = 'done'
      })
    }
    S.machines.forEach(function (m) {
      if (m.phase === 'done') return
      try {
        advance(m)
      } catch (e) {
        check(m.key + '_step', false, 'exception in ' + m.phase + ': ' + e)
        m.phase = 'done'
      }
    })
    if (S.machines.every(function (m) { return m.phase === 'done' })) finish()
  }

  ServerEvents.tick(function (event) {
    if (global[REQUEST] === true && (S === null || S.finished) && Date.now() - LOADED_AT >= QUIET_MS) {
      global[REQUEST] = false
      try {
        run(event.server)
      } catch (e) {
        check('setup', false, 'exception: ' + e)
        finish()
      }
    }
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_luv_europa', function () {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_luv_europa run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
