// OpV-A0, the bulge relay (docs/eras/opv.md "A0. Bulge relay, chain matter and the hull"). Three parts:
//
//   1. grindless:bulge_relay_seed: an assembly line row at VA[UXV] of UXV parts only (a 32-strand pasta magsail, lasagna plates, a SHeQUID gyro,
//      two UXV sensors and an FRC cartridge). It is a travel item made before any OpV part exists, the one OpV-stage recipe outside the component
//      rule (opv.md "Bootstrap check"); like UXV-B1's Whipple shield it is a part, so it needs no research.
//   2. The hold: gate c11 (tables/gate.json, hold_sgr1806) throws the seed from Cygnus X-1's orbit at 16 A x V[UXV] = 2^31 EU/t, the bulge chart
//      kept in the bus. UXV-B1's poller (uxv/kerr_sling.js) places every relay_platforms.json row with a source, so it places F1's SGR 1806-20
//      platform when the run has lasted its time. The gate keeps its runs only in memory (startup uhv/gate.js recordRun), so a restart during the
//      2,400 ticks would lose the throw: this script keeps the c11 run in the world's persistent data (opvBulgeHold) and, on the first boot that has
//      not seen it, gives it back to the gate's run list once, so the poller still places the platform. Nothing is placed here.
//      The substage opv-sgr is the tier model's grant of that arrival (tools/analysis/tiers), not a script.
//   3. gtceu:opv_machine_hull (opv.md "Voltages and controllers"): an assembly line row of the OpV casing, 2 chain strand cables, 2 chain lamina
//      stacks and 500 mB superfluid He-3 at V[OpV]/2 = 2^28 EU/t. No OpV machine exists yet, so it runs on GTM's assembly line with UXV 4 A hatches
//      (4 x V[UXV] = V[OpV], opv.md "Bridges and first arrivals"). GTM's own hull recipe is removed by opv/cuts.js (OpV-F2), which spares mod
//      grindless, so this is the only way. No research: like the seed it is a part.
// Published in global.grindless.opvBulgeRelay: .recipes (the ids made), .skipped, .hold (the kept c11 run, or null), .restored (the run given back
// this boot, or null), .jump, .place, .source.
// Rhino: var + function inside every callback that runs more than once.
(function () {
  var LOG = '[grindless/opv] '
  var G = global.grindless || (global.grindless = {})
  var B = G.opvBulgeRelay || (G.opvBulgeRelay = {})
  var SOURCE = 'grindless:cygnus_x1_orbit'
  var JUMP = 'hold_sgr1806'
  var PLACE = 'sgr1806'
  var HOLD_KEY = 'opvBulgeHold'
  var PLATFORM_KEY = 'uxvPlatform_' + PLACE
  var PERIOD = 10
  var VA_UXV = 125829120
  var V_OPV = 536870912
  B.jump = JUMP
  B.place = PLACE
  B.source = SOURCE
  B.recipes = B.recipes || []
  B.skipped = B.skipped || []
  B.hold = B.hold || null
  B.restored = B.restored || null
  // in memory only: the c11 runs this boot has seen (gate key -> until); a restart empties it, a /reload does not
  B.seen = B.seen || {}
  var C = null

  // ------------------------------------------------------------ the seed

  var SEED_PARTS = ['gtceu:pasta_strand_single_wire', 'grindless:lasagna_plate', 'grindless:shequid_gyro', 'gtceu:uxv_sensor', 'grindless:frc_cartridge',
    'grindless:bulge_relay_seed']
  // the hull: F1's strand cable and superfluid He-3 are GT material forms (gtceu: ids, tables/opv_ids.json); the grindless: spelling is a fallback
  var HULL_PARTS = ['gtceu:opv_machine_casing', 'grindless:chain_lamina_stack', 'gtceu:opv_machine_hull']
  var CABLES = ['gtceu:chain_strand_single_cable', 'grindless:chain_strand_single_cable']
  var HELIUM_3 = ['gtceu:superfluid_helium_3', 'grindless:superfluid_helium_3']

  function firstExisting(ids, exists) {
    for (var i = 0; i < ids.length; i++) if (exists(ids[i])) return ids[i]
    return null
  }

  function skip(name, missing) {
    B.skipped.push({ name: name, reason: 'unknown id(s) ' + missing.join(', ') })
    console.error(LOG + name + ' skipped, unknown id(s): ' + missing.join(', '))
  }

  ServerEvents.recipes(function (event) {
    B.recipes = []
    B.skipped = []
    try {
      var missing = SEED_PARTS.filter(function (id) { return !Item.exists(id) })
      if (!Fluid.exists('gtceu:soldering_alloy')) missing.push('gtceu:soldering_alloy')
      if (missing.length > 0) {
        skip('bulge_relay_seed', missing)
      } else {
        var b = event.recipes.gtceu.assembly_line('grindless:bulge_relay_seed')
        b.itemInputs('32x gtceu:pasta_strand_single_wire')
        b.itemInputs('4x grindless:lasagna_plate')
        b.itemInputs('grindless:shequid_gyro')
        b.itemInputs('2x gtceu:uxv_sensor')
        b.itemInputs('grindless:frc_cartridge')
        b.inputFluids(Fluid.of('gtceu:soldering_alloy', 576))
        b.itemOutputs('grindless:bulge_relay_seed')
        b.EUt(VA_UXV).duration(1200)
        B.recipes.push('grindless:assembly_line/bulge_relay_seed')
      }
    } catch (e) {
      B.skipped.push({ name: 'bulge_relay_seed', reason: String(e) })
      console.error(LOG + 'bulge relay seed recipe failed: ' + e)
    }
    try {
      var cable = firstExisting(CABLES, function (id) { return Item.exists(id) })
      var helium = firstExisting(HELIUM_3, function (id) { return Fluid.exists(id) })
      var lost = HULL_PARTS.filter(function (id) { return !Item.exists(id) })
      if (!cable) lost.push(CABLES.join(' or '))
      if (!helium) lost.push(HELIUM_3.join(' or '))
      if (lost.length > 0) {
        skip('opv_machine_hull', lost)
      } else {
        var h = event.recipes.gtceu.assembly_line('grindless:opv_machine_hull')
        h.itemInputs('gtceu:opv_machine_casing')
        h.itemInputs('2x ' + cable)
        h.itemInputs('2x grindless:chain_lamina_stack')
        h.inputFluids(Fluid.of(helium, 500))
        h.itemOutputs('gtceu:opv_machine_hull')
        h.EUt(V_OPV / 2).duration(200)
        B.recipes.push('grindless:assembly_line/opv_machine_hull')
        B.hull = { cable: cable, helium: helium }
      }
    } catch (e) {
      B.skipped.push({ name: 'opv_machine_hull', reason: String(e) })
      console.error(LOG + 'OpV machine hull recipe failed: ' + e)
    }
  })

  // ------------------------------------------------------------ the hold

  function classes() {
    if (C !== null) return C
    C = { Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'), Pos: Java.loadClass('net.minecraft.core.BlockPos') }
    return C
  }

  function machineAt(level, rec) {
    return classes().Meta.getMachine(level, new (classes().Pos)(rec.x, rec.y, rec.z))
  }

  // the gate's last recipe by its name (grindless:warp_gate/<name>), or null
  function nameOf(m) {
    if (!m) return null
    var r = m.getRecipeLogic().getLastRecipe()
    if (!r) return null
    var id = String(r.id)
    return id.substring(id.lastIndexOf('/') + 1)
  }

  // the kept run: "<dim>|<x>|<y>|<z>|<until>|<fx>|<fz>"; its first four fields are the gate's key in G.warpGate.gates
  function save(data, k, rec) {
    var v = k + '|' + Number(rec.until) + '|' + Number(rec.fx) + '|' + Number(rec.fz)
    if (data.contains(HOLD_KEY) && String(data.getString(HOLD_KEY)) === v) return
    data.putString(HOLD_KEY, v)
    console.info(LOG + 'bulge relay: c11 run kept for a restart (' + v + ')')
  }

  function kept(data) {
    if (!data.contains(HOLD_KEY)) return null
    var p = String(data.getString(HOLD_KEY)).split('|')
    if (p.length !== 7) return null
    return { key: p.slice(0, 4).join('|'), dim: p[0], x: Number(p[1]), y: Number(p[2]), z: Number(p[3]), until: Number(p[4]), fx: Number(p[5]), fz: Number(p[6]) }
  }

  function drop(data, why) {
    if (data.contains(HOLD_KEY)) data.remove(HOLD_KEY)
    B.hold = null
    console.info(LOG + 'bulge relay: c11 run released, ' + why)
  }

  function poll(server) {
    var WG = G.warpGate
    if (!WG || !WG.gates) return
    var data = server.persistentData
    if (data.contains(PLATFORM_KEY)) {
      if (data.contains(HOLD_KEY)) drop(data, 'the SGR 1806-20 platform is placed')
      return
    }
    var level = server.getLevel(SOURCE)
    if (!level) return
    var now = Number(level.getTime())
    // the c11 runs this boot recorded (or was given back)
    Object.keys(WG.gates).forEach(function (k) {
      var rec = WG.gates[k]
      if (rec.dim !== SOURCE || rec.sustain) return
      if (B.seen[k] !== undefined && Number(B.seen[k]) === Number(rec.until)) return
      if (nameOf(machineAt(level, rec)) !== JUMP) return
      B.seen[k] = Number(rec.until)
      save(data, k, rec)
    })
    var h = kept(data)
    B.hold = h
    if (!h) return
    if (B.seen[h.key] !== undefined) {
      // this boot saw the run: once it has ended and the poller had its turn without a platform (the ring unformed), the row is spent
      if (!WG.gates[h.key] && now >= Number(B.seen[h.key]) + 4 * PERIOD) drop(data, 'the run ended without a platform')
      return
    }
    // a run this boot has not seen: the server restarted during the throw. Give it back once, if the gate still holds the c11 recipe; a run that is
    // already over gets a short margin so the poller sees it before the gate's transit tick drops expired runs
    var m = machineAt(level, h)
    if (!m) return // the gate's chunk is not loaded yet
    B.seen[h.key] = h.until
    if (nameOf(m) !== JUMP) {
      drop(data, 'the gate at ' + h.key + ' no longer holds ' + JUMP)
      return
    }
    var until = Math.max(h.until, now + 2 * PERIOD)
    WG.gates[h.key] = { dim: h.dim, x: h.x, y: h.y, z: h.z, fx: h.fx, fz: h.fz, sustain: false, until: until }
    B.restored = h.key + '|' + until
    console.info(LOG + 'bulge relay: c11 run given back after a restart, gate ' + h.key + ' until ' + until + ' (now ' + now + ')')
  }

  ServerEvents.tick(function (event) {
    if (Number(event.server.getTickCount()) % PERIOD !== 0) return
    try { poll(event.server) } catch (e) { console.error(LOG + 'bulge relay poll: ' + e) }
  })
})()
