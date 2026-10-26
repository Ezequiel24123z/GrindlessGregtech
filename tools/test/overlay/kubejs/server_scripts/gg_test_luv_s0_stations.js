// TEST ONLY. Opt-in S0-3 continuation; no event starts this driver.
// The consolidated flight owner calls begin(ctx) AFTER the S0-2 Earth return, then
// tick(ctx) only while its flight engine is idle. Do not release the client hold
// until tick returns {done:true}. A failed check is never an approval of S0-3.
//
// ctx: server, player, tick, sharedMap (the existing ConcurrentHashMap), rocket
// (the actual current landed rocket), program(planetId, stationBoolean),
// fly(planetId, dimensionId, actualControlStack, actualPackageOrEmpty),
// flightBusy(), lastFlight(). fly must finish its normal fuel/config NBT load
// FIRST, then call loadCargo(ctx, rocket, package). No cargo NBT key exists in
// GCYR 0.2.9: satelliteSlot is NOT serialized by RocketEntity.save/load.
// lastFlight() must change after each completed leg; {ok:false} aborts.
// Optional reopen(token): owner performs REAL Save/Quit + Select World in this
// JVM. Suppress auto-login when s0sReopenPending is nonempty. A worldless client
// tick must set s0sReopenClosed=token only after player/level/server are gone.
// Rebind the owner's server/player/flight state, preserve the SAME sharedMap,
// then call resume(newCtx, token). No old level/machine/server reference is kept
// in the JSON snapshot; it also survives server-script re-evaluation.
//
// Route: Earth -> Earth orbit -> S0 moon orbit (both retained real-menu
// new-station ID chips + actual packages) -> Earth (fresh real-menu surface chip).
// Actual packager keycards are retained/checked, not used for first deployment.
// Both packages are made on Earth BEFORE flying. No synthetic control NBT,
// direct dimension change, allocation/addStation, deployment, or wireless.
//
// Source: pinned GCYR 0.2.9 LGPL-3.0 contracts, not copied implementation.
// Important correction: allocateStation returns a candidate pair; the packager
// and menu do NOT register it. Rocket arrival conditionally calls addStation.
// Borders use the live SpaceStation.BLOCK_MULTIPLIER (default 512), NOT 31.
//
// Surface footprint: Overworld X13613..13619 Z3..12 Y99..105, within prepared S0-a.
// Orbital writes: only the two fresh allocator candidates, every position logged.
// Freshness scans cover the ENTIRE candidate plot using native chunk-section
// emptiness (incrementally); no foreign records/blocks may be overwritten.
// Owned fixtures/records are retained for inspection, not broadly cleared.
//
// The owner and opt-in startup lifecycle hook coordinate Save/Quit + same-save
// reopening in the same JVM. Without that handback persistence is UNPROVEN/FAIL;
// /reload and NBT codecs cannot substitute. No harness restart or automatic retry.
;(function () {
  var S = null
  var J = null
  var PREFIX = 'GGTEST|luv_s0_stations|'
  var EXPORT = 'kubejs/exported/gg_test_luv_s0_stations.json'
  var C = { x: 13616, y: 100, z: 4 }
  var STEAM = ['gtceu:steam_input_hatch', 'gtceu:steam_input_bus', 'gtceu:steam_output_bus']

  function java() {
    if (J !== null) return J
    J = {
      Holder: Java.loadClass('argent_matter.gcyr.api.space.station.StationWorldSavedData'),
      Station: Java.loadClass('argent_matter.gcyr.api.space.station.SpaceStation'),
      PlanetData: Java.loadClass('argent_matter.gcyr.data.loader.PlanetData'),
      Blocks: Java.loadClass('net.minecraftforge.registries.ForgeRegistries').BLOCKS,
      Package: Java.loadClass('argent_matter.gcyr.common.item.StationContainerBehaviour'),
      Keycard: Java.loadClass('argent_matter.gcyr.common.item.KeyCardBehaviour'),
      Chip: Java.loadClass('argent_matter.gcyr.common.item.PlanetIdChipBehaviour'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Mover: Java.loadClass('net.minecraft.world.entity.MoverType'),
      Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
      Hand: Java.loadClass('net.minecraft.world.InteractionHand'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      Hit: Java.loadClass('net.minecraft.world.phys.BlockHitResult'),
      Integer: Java.loadClass('java.lang.Integer'),
      LevelResource: Java.loadClass('net.minecraft.world.level.storage.LevelResource'),
      Tag: Java.loadClass('net.minecraft.nbt.CompoundTag')
    }
    return J
  }

  function pos(x, y, z) { return new BlockPos(x, y, z) }
  function xyz(p) { return { x: Number(p.getX()), y: Number(p.getY()), z: Number(p.getZ()) } }
  function key(d, p) { return d + ':' + p.x + ',' + p.y + ',' + p.z }
  function dim(level) {
    // Level.dimension() is remapped to getDimensionKey by KubeJS 2001.6.5.
    return String(level.getDimensionKey().location())
  }
  function bid(level, p) { return String(level.getBlock(p.x, p.y, p.z).getId()) }
  function array(coll) {
    var out = []
    var it = coll.iterator()
    while (it.hasNext()) out.push(it.next())
    return out
  }
  function emit(name, status, detail) {
    console.info(PREFIX + name + '|' + status + '|' +
      String(detail).replace(/[\r\n|]+/g, '/'))
  }
  function note(name, detail) { emit(name, 'NOTE', detail) }
  function check(name, ok, detail) {
    if (!ok) S.failures++
    emit(name, ok ? 'PASS' : 'FAIL', detail)
    S.report.checks.push({ name: name, ok: !!ok, detail: String(detail) })
    return !!ok
  }
  function need(ok, detail) { if (!ok) throw new Error(detail) }
  function save() {
    S.report.phase = S.phase
    S.report.failures = S.failures
    JsonIO.write(EXPORT, S.report)
  }
  function phase(ctx, name) {
    S.phase = name
    S.at = Number(ctx.tick)
    S.atMs = Date.now()
    save()
  }
  function value(ctx, k) {
    var v = ctx.sharedMap.get(k)
    return v === null || v === undefined ? '' : String(v)
  }
  function timedOut(ctx, ticks, ms) {
    return Number(ctx.tick) - S.at > ticks || Date.now() - S.atMs > ms
  }
  function saveRoot(ctx) {
    // Identity only: never emit the user's filesystem path into test logs.
    return String(ctx.server.getWorldPath(java().LevelResource.ROOT).toAbsolutePath().normalize())
  }
  function protection(ctx) {
    var abilities = ctx.player.getAbilities()
    if (S.originalInvulnerable === undefined) S.originalInvulnerable = !!abilities.invulnerable
    abilities.invulnerable = true
    need(abilities.invulnerable === true, 'test-only mechanical protection was not applied')
  }
  function levelFor(ctx, id) {
    var p = java().PlanetData.getPlanet(new ResourceLocation(id))
    need(p !== null && p !== undefined, 'missing planet ' + id)
    // KubeJS exposes both vanilla ResourceKey and kjs$ ResourceLocation overloads.
    // Use the proven string path, preserving the native orbit dimension ID.
    var l = ctx.server.getLevel(String(p.orbitWorld().location()))
    need(l !== null && l !== undefined, 'missing orbit for ' + id)
    return l
  }
  function holder(e) { return java().Holder.getOrCreate(e.level) }
  function stationCount(h) {
    // Pinned GCYR 0.2.9 getFreeStationId() returns stations.size(), without
    // allocation or mutation. Keep that native count on the holder: Rhino's
    // NativeJavaMap probes containsKey("size") before resolving map.size(),
    // which throws String-to-Integer on this fastutil Int2ObjectMap.
    return Number(h.getFreeStationId())
  }
  function machine(level, p) { return java().Meta.getMachine(level, pos(p.x, p.y, p.z)) }
  function inside(e, p) {
    return p.x >= e.bounds.minX && p.x + 1 <= e.bounds.maxX &&
      p.z >= e.bounds.minZ && p.z + 1 <= e.bounds.maxZ &&
      p.y >= e.level.getMinBuildHeight() && p.y < e.level.getMaxBuildHeight()
  }
  function allowed(level, p) {
    var d = dim(level)
    if (d === 'minecraft:overworld') return p.x >= 13568 && p.x <= 13631 &&
      p.z >= 0 && p.z <= 63 && p.y >= 98 && p.y <= 112
    for (var i = 0; i < S.entries.length; i++) {
      if (S.entries[i].dimension === d) return inside(S.entries[i], p)
    }
    return false
  }
  function put(level, p, id, props, source) {
    need(allowed(level, p), 'out-of-scope write ' + key(dim(level), p))
    var k = key(dim(level), p)
    var old = bid(level, p)
    need(old === 'minecraft:air' || (S.owned[k] && old === S.owned[k].block),
      'foreign block at ' + k + ': ' + old)
    level.getBlock(p.x, p.y, p.z).set(id, props || {})
    need(bid(level, p) === id, 'placement failed at ' + k)
    var row = { dimension: dim(level), x: p.x, y: p.y, z: p.z, block: id,
      state: String(level.getBlockState(pos(p.x, p.y, p.z))), source: source }
    S.owned[k] = row
    S.report.built.push(row)
    note('built', JSON.stringify(row))
  }
  function mapsExpected() {
    for (var i = 0; i < S.entries.length; i++) {
      var e = S.entries[i]
      // Arrival registers the record before the bridge hands control back.
      // Permit ONLY that one pending candidate during its actual flight phase.
      var pending = S.target === e && (S.phase === 'earth_flight' || S.phase === 'moon_flight')
      var count = stationCount(holder(e))
      need(count === (e.arrived ? 1 : 0) || (pending && count === 1),
        'existing/foreign station records in ' + e.dimension)
      if (e.arrived || (pending && count === 1)) {
        var station = holder(e).getStation(java().Integer['valueOf(int)'](e.id))
        need(station !== null && String(station.orbitPlanet().orbitWorld().location()) === e.dimension,
          'owned station missing or changed in ' + e.dimension)
        var origin = xyz(holder(e).getStationWorldPos(e.id))
        need(origin.x === e.origin.x && origin.y === 63 && origin.z === e.origin.z,
          'station plot changed in ' + e.dimension)
      }
    }
  }
  function candidate(ctx, planet, label) {
    var level = levelFor(ctx, planet)
    var h = java().Holder.getOrCreate(level)
    need(stationCount(h) === 0, 'abort: nonfresh station map ' + dim(level))
    var id = Number(h.getFreeStationId())
    var grid = h.getFreeStationPos(id)
    var mult = Number(java().Station.BLOCK_MULTIPLIER)
    need(id === 0 && mult >= 64 && mult <= 1024 && mult % 16 === 0,
      'unexpected fresh allocator/config: id=' + id + ' multiplier=' + mult)
    var x = Number(grid.x()) * mult
    var z = Number(grid.y()) * mult
    var e = { planet: planet, label: label, level: level, dimension: dim(level), id: id,
      origin: { x: x, y: 63, z: z }, arrived: false,
      bounds: { minX: x - mult / 2, maxX: x + mult / 2,
        minZ: z - mult / 2, maxZ: z + mult / 2 },
      packageStack: null, chip: null, keycard: null, cells: [], scan: 0 }
    // A prediction only. The actual native record/border is checked after arrival.
    e.chunkMinX = Math.floor(e.bounds.minX / 16)
    e.chunkMaxX = Math.floor((e.bounds.maxX - 1) / 16)
    e.chunkMinZ = Math.floor(e.bounds.minZ / 16)
    e.chunkMaxZ = Math.floor((e.bounds.maxZ - 1) / 16)
    e.chunkWidth = e.chunkMaxX - e.chunkMinX + 1
    e.chunkCount = e.chunkWidth * (e.chunkMaxZ - e.chunkMinZ + 1)
    S.report.plots.push({ planet: planet, dimension: e.dimension, candidateId: id,
      origin: e.origin, bounds: e.bounds, blockMultiplier: mult, allocatorGridWidth: 31 })
    note(label + '_candidate', JSON.stringify(S.report.plots[S.report.plots.length - 1]))
    check(label + '_orbit_cold_control', Number(java().PlanetData.getWorldTemperature(level)) === 3,
      'native orbit temperature=' + java().PlanetData.getWorldTemperature(level) +
      ' K; suit range 60..363 K; TEST-ONLY invulnerability masks damage for mechanics, NOT production survival support')
    return e
  }
  // Whole-plot, full build-height read-only scan. Native sections avoid millions
  // of individual block queries. Four chunks/tick bounds the work per tick.
  // No force-load ticket or block write is made by this scan.
  function scanPlot(e) {
    for (var n = 0; n < 4 && e.scan < e.chunkCount; n++, e.scan++) {
      var x = e.chunkMinX + e.scan % e.chunkWidth
      var z = e.chunkMinZ + Math.floor(e.scan / e.chunkWidth)
      var chunk = e.level.getChunk(x, z)
      var sections = chunk.getSections()
      for (var i = 0; i < sections.length; i++) {
        need(sections[i].hasOnlyAir(), 'abort: occupied plot ' + e.dimension +
          ' chunk=' + x + ',' + z + ' section=' + i)
      }
      need(chunk.getBlockEntitiesPos().isEmpty(), 'abort: block entities in fresh plot')
    }
    return e.scan === e.chunkCount
  }
  function surfaceFresh(ctx) {
    // Includes every possible scanned cell, pad, tower and the controller.
    var level = ctx.server.overworld()
    for (var x = 13613; x <= 13619; x++) {
      for (var z = 3; z <= 12; z++) {
        for (var y = 99; y <= 105; y++) {
          need(bid(level, { x: x, y: y, z: z }) === 'minecraft:air',
            'abort: foreign S0-a fixture at ' + x + ',' + y + ',' + z)
        }
      }
    }
    S.surface = level
  }
  function packagerStructure(ctx) {
    put(S.surface, { x: C.x, y: 99, z: 3 }, 'minecraft:iron_block', {}, 'packager_player_stand')
    ctx.player.stopRiding()
    ctx.player.teleportTo('minecraft:overworld', C.x + 0.5, 100, 3.5, 0, 0)
    for (var x = 13613; x <= 13619; x++) {
      for (var z = 5; z <= 11; z++) {
        put(S.surface, { x: x, y: 99, z: z }, 'gcyr:launch_pad', {}, 'packager')
      }
    }
    for (var y = 100; y <= 104; y++) {
      put(S.surface, { x: C.x, y: y, z: 12 }, 'gtceu:stainless_steel_frame', {}, 'packager')
    }
    if (!S.packager) {
      put(S.surface, C, 'gcyr:space_station_packager', { facing: 'north' }, 'packager')
      S.packager = machine(S.surface, C)
      need(S.packager !== null, 'no native station packager')
    }
    S.packager.updateStructureDimensions()
    S.packager.checkPatternWithLock()
  }
  function payload(e) {
    for (var x = 13613; x <= 13619; x++) {
      for (var z = 5; z <= 11; z++) {
        put(S.surface, { x: x, y: 100, z: z }, 'minecraft:iron_block', {}, e.label + '_payload')
      }
    }
    var chestPos = { x: 13614, y: 101, z: 6 }
    put(S.surface, chestPos, 'minecraft:chest', { facing: 'north' }, e.label + '_payload')
    var be = S.surface.getBlockEntity(pos(chestPos.x, chestPos.y, chestPos.z))
    be.setItem(0, Item.of('minecraft:diamond', 7))
    be.setChanged()
    e.chestBefore = String(be.saveWithoutMetadata())
    note(e.label + '_be_before', e.chestBefore)
    e.scanBefore = []
    for (var xx = 13613; xx <= 13619; xx++) {
      for (var zz = 5; zz <= 11; zz++) {
        for (var yy = 100; yy <= 105; yy++) {
          var p = { x: xx, y: yy, z: zz }
          var id = bid(S.surface, p)
          if (id !== 'minecraft:air') {
            need(S.owned[key(dim(S.surface), p)], 'foreign payload scan cell')
            e.scanBefore.push({ x: xx, y: yy, z: zz, block: id })
          }
        }
      }
    }
  }
  function openPackager(ctx) {
    var j = java()
    var hit = new j.Hit(new j.Vec3(C.x + 0.5, C.y + 0.5, C.z),
      j.Direction.NORTH, pos(C.x, C.y, C.z), false)
    ctx.player.gameMode.useItemOn(ctx.player, S.surface, ctx.player.getMainHandItem(), j.Hand.MAIN_HAND, hit)
    ctx.sharedMap.put('s0sPackMenu', String(ctx.player.containerMenu.containerId))
    ctx.sharedMap.put('s0sPackRequest', S.run + ':' + S.index)
  }
  function packageCells(e) {
    // Match buildSpaceStation's public PosWithState data and exact native
    // base-selection geometry, including its compareTo/min quirk. Never invoke
    // buildSpaceStation ourselves. Actual arrival placement is the authority.
    var blocks = array(java().Package.getStationBlocks(e.packageStack))
    need(blocks.length > 0, 'native output package has no blocks')
    var anchor = pos(e.origin.x, 64, e.origin.z)
    var base = anchor
    for (var i = 0; i < blocks.length; i++) {
      var p = blocks[i].pos()
      if (i === 0) base = anchor.offset(p)
      if (base.compareTo(p.offset(anchor)) > 0) {
        base = pos(Math.min(anchor.getX() - p.getX(), base.getX()),
          Math.min(anchor.getY() - p.getY(), base.getY()),
          Math.min(anchor.getZ() - p.getZ(), base.getZ()))
      }
    }
    var chest = null
    e.cells = blocks.map(function (b) {
      var p = xyz(base.offset(b.pos()))
      p.block = String(java().Blocks.getKey(b.state().getBlock()))
      p.state = String(b.state())
      need(inside(e, p), 'native package would exceed authorized plot')
      need(bid(e.level, p) === 'minecraft:air', 'obstructed package destination')
      if (p.block === 'minecraft:chest') {
        chest = b.entityTag()
        e.chest = p
      }
      return p
    })
    need(chest !== null && e.chest, 'native package lost the ordinary block entity')
    var items = chest.getList('Items', 10)
    need(items.size() === 1 && String(items.getCompound(0).getString('id')) === 'minecraft:diamond' &&
      Number(items.getCompound(0).getByte('Count')) === 7, 'packaged chest inventory NBT changed')
    check(e.label + '_packaged_be_nbt', true, String(chest))
    S.report.packages.push({ label: e.label, count: blocks.length, cells: e.cells,
      chestBefore: e.chestBefore, packagedChest: String(chest) })
  }
  function programmedChip(stack, surface, stationId) {
    if (stack.isEmpty() || String(stack.getId()) !== 'gcyr:id_chip') return false
    var nbt = stack.getNbt()
    return nbt !== null && String(nbt.getString('gcyr:current_planet')) === surface &&
      !nbt.contains('gcyr:current_position') &&
      (stationId === null ? !nbt.contains('gcyr:current_station') :
        nbt.contains('gcyr:current_station', 3) &&
        Number(java().Chip.getSpaceStationId(stack)) === stationId)
  }
  function collectPackage(ctx, e) {
    var out = S.packager.getOutputSlots()
    var pkg = out.getStackInSlot(0)
    var card = out.getStackInSlot(1)
    if (pkg.isEmpty() || card.isEmpty()) return false
    need(String(pkg.getId()) === 'gcyr:space_station_package' && String(card.getId()) === 'gcyr:keycard',
      'unexpected packager outputs')
    e.packageStack = pkg
    e.keycard = card
    out.setStackInSlot(0, Item.empty)
    out.setStackInSlot(1, Item.empty)
    var retained = S.packager.getKeycardSlot().getStackInSlot(0)
    need(check(e.label + '_chip_retained',
      programmedChip(retained, e.label === 'earth' ? 'minecraft:overworld' : 'grindless:s0_moon', e.id) &&
      String(retained.getNbt()) === e.chipNbt, 'packager input is a new-station ID chip, retained unchanged'),
    'packager did not retain the actual new-station ID chip')
    e.chip = retained
    S.packager.getKeycardSlot().setStackInSlot(0, Item.empty)
    check(e.label + '_package_consumed', S.packager.getPackageSlot().getStackInSlot(0).isEmpty(),
      'native Pack button consumed blank package')
    need(check(e.label + '_keycard', Number(java().Keycard.getSavedStation(card)) === e.id &&
      String(java().Keycard.getSavedPlanet(card).orbitWorld().location()) === e.dimension,
      'actual output=' + card.getNbt()), 'native packager keycard differs from candidate')
    var uncleared = e.scanBefore.filter(function (p) { return bid(S.surface, p) !== 'minecraft:air' })
    need(check(e.label + '_scan_cleared', uncleared.length === 0,
      'native scan cleared ' + e.scanBefore.length + ' captured cells; remaining=' + uncleared.length),
    'packager did not clear owned scan')
    packageCells(e)
    need(e.cells.length === e.scanBefore.length, 'package omitted/added scanned blocks')
    mapsExpected()
    note(e.label + '_candidate_not_registered', 'packager/menu return candidate id; arrival must register it')
    ctx.sharedMap.put('s0sPackRequest', '')
    ctx.player.closeMenu()
    return true
  }
  // Public native UI, not guessed NBT or forbidden reflection. Call AFTER any
  // RocketEntity.load(tag), since the bridge's config/fuel loader precedes this.
  function loadCargo(ctx, rocket, stack, control) {
    var empty = stack === undefined || stack.isEmpty()
    need(rocket !== null && !rocket.isRemoved(), 'cargo requires the live rocket')
    // GCYR's public HasCustomInventoryScreen entry point delegates to its
    // native EntityUIFactory. The inherited factory method is not exposed on
    // INSTANCE in pinned Rhino; do not guess a static variant or synthesize UI.
    var previousMenuId = String(ctx.player.containerMenu.containerId)
    rocket.openCustomInventoryScreen(ctx.player)
    var menu = ctx.player.containerMenu
    need(String(menu.containerId) !== previousMenuId, 'native rocket inventory UI did not open a new menu')
    // RocketEntity.createUI declares config(40,20), satellite(60,20), then
    // inventory, but LDLib 1.0.40.b adds native slots from a HashMap.keySet().
    // Menu index 1 is not guaranteed to be cargo. Find its unique native position.
    var slot = null
    var config = null
    for (var i = 0; i < menu.slots.size(); i++) {
      var candidateSlot = menu.slots.get(i)
      if (control !== undefined && Math.abs(Number(candidateSlot.x) - 40) <= 1 &&
          Math.abs(Number(candidateSlot.y) - 20) <= 1) {
        need(config === null, 'ambiguous native rocket config slot')
        config = candidateSlot
      }
      if (Math.abs(Number(candidateSlot.x) - 60) > 1 ||
          Math.abs(Number(candidateSlot.y) - 20) > 1) continue
      need(slot === null, 'ambiguous native rocket satellite slot')
      slot = candidateSlot
    }
    need(slot !== null, 'native rocket satellite slot not found at (60,20)')
    if (control !== undefined) {
      need(!control.isEmpty() && String(control.getId()) === 'gcyr:id_chip',
        'station route requires an actual programmed ID chip')
      need(config !== null, 'native rocket config slot not found at (40,20)')
      var loadedControl = config.getItem()
      need(!loadedControl.isEmpty() && String(loadedControl.getId()) === String(control.getId()) &&
        String(loadedControl.getNbt()) === String(control.getNbt()), 'native rocket control readback differs')
      note('control_loaded', 'actual native config slot ID chip=' + loadedControl.getNbt())
    }
    need(slot.getItem().isEmpty(), 'refusing to replace preexisting rocket cargo')
    slot.set(empty ? Item.empty : stack)
    var got = slot.getItem()
    need(empty ? got.isEmpty() : !got.isEmpty() &&
      String(got.getId()) === 'gcyr:space_station_package' &&
      String(got.getNbt()) === String(stack.getNbt()), 'native rocket cargo readback differs')
    menu.broadcastChanges()
    ctx.player.closeMenu()
    note('cargo_loaded', empty ? 'empty native satellite slot' : 'actual package in native satelliteSlot[0]')
    return true
  }
  function fly(ctx, e, control, cargo, next) {
    mapsExpected()
    need(!ctx.flightBusy(), 'cannot request overlapping flight')
    var surface = String(java().PlanetData.getPlanet(new ResourceLocation(e.planet)).level().location())
    var station = e.dimension !== surface
    need(programmedChip(control, surface, station ? e.id : null),
      'wrong station/surface ID chip for ' + e.dimension)
    if (station) {
      need(String(control.getNbt()) === e.chipNbt, 'deployment must use the retained packager ID chip')
      need(!cargo.isEmpty() && String(cargo.getId()) === 'gcyr:space_station_package',
        'first station deployment requires its actual package')
    }
    S.previousFlight = ctx.lastFlight()
    S.target = e
    ctx.fly(e.planet, e.dimension, control, cargo)
    phase(ctx, next)
  }
  function arrived(ctx, e) {
    if (ctx.flightBusy() || ctx.lastFlight() === S.previousFlight) return false
    var last = ctx.lastFlight()
    need(last !== null && last !== undefined && last.ok !== false, 'flight engine reported no successful leg')
    need(dim(ctx.player.getLevel()) === e.dimension, 'flight completed in wrong dimension')
    var r = ctx.rocket
    need(r !== null && !r.isRemoved() && dim(r.getLevel()) === e.dimension,
      'flight bridge did not retain the real arrival rocket')
    need(r.getY() >= 63 && r.getY() < 100, 'station flight is not yet landed near packaged platform')
    var h = holder(e)
    need(stationCount(h) === 1, 'unexpected/foreign arrival station map')
    var st = h.getStation(java().Integer['valueOf(int)'](e.id))
    need(st !== null, 'native arrival did not register candidate id')
    need(String(st.orbitPlanet().orbitWorld().location()) === e.dimension, 'native station has wrong planet')
    var o = xyz(h.getStationWorldPos(e.id))
    need(o.x === e.origin.x && o.y === 63 && o.z === e.origin.z, 'native allocator chose unexpected plot')
    var border = st.border()
    var bounds = { minX: Number(border.getMinX()), maxX: Number(border.getMaxX()),
      minZ: Number(border.getMinZ()), maxZ: Number(border.getMaxZ()) }
    need(JSON.stringify(bounds) === JSON.stringify(e.bounds), 'native border differs from candidate bounds')
    e.arrived = true
    mapsExpected()
    check(e.label + '_arrival', true, 'dimension=' + e.dimension + ' id=' + e.id +
      ' origin=' + JSON.stringify(o) + ' border=' + JSON.stringify(bounds) +
      ' rocket=' + r.getX() + ',' + r.getY() + ',' + r.getZ())
    var wrong = []
    e.cells.forEach(function (p) {
      var got = bid(e.level, p)
      if (got !== p.block || String(e.level.getBlockState(pos(p.x, p.y, p.z))) !== p.state) {
        wrong.push(p.x + ',' + p.y + ',' + p.z + ':' + got)
      }
      else {
        var row = { dimension: e.dimension, x: p.x, y: p.y, z: p.z,
          block: p.block, state: p.state, source: 'native_deploy' }
        S.owned[key(e.dimension, p)] = row
        S.report.built.push(row)
        note('built', JSON.stringify(row))
      }
    })
    need(check(e.label + '_native_deploy', wrong.length === 0, 'package cells=' + e.cells.length +
      ' wrong=' + wrong.join(';')), 'native deployment mismatch (obstruction/drop is NOT a pass)')
    var be = e.level.getBlockEntity(pos(e.chest.x, e.chest.y, e.chest.z))
    var item = be.getItem(0)
    check(e.label + '_be_survival', !item.isEmpty() && String(item.getId()) === 'minecraft:diamond' &&
      Number(item.getCount()) === 7, 'native restored chest=' + be.saveWithoutMetadata())
    ctx.player.stopRiding()
    var supports = e.cells.filter(function (p) {
      return p.block === 'minecraft:iron_block' &&
        bid(e.level, { x: p.x, y: p.y + 1, z: p.z }) === 'minecraft:air'
    })
    need(supports.length > 0, 'no free packaged floor for actual player placement')
    var support = supports[0]
    var placed = { x: support.x, y: support.y + 1, z: support.z }
    need(inside(e, placed), 'player placement would leave owned plot')
    ctx.player.teleportTo(e.dimension, support.x + 0.5, support.y + 2, support.z + 2.5, 180, 60)
    ctx.player.setMainHandItem(Item.of('minecraft:gold_block'))
    var hit = new (java().Hit)(new (java().Vec3)(support.x + 0.5, support.y + 1, support.z + 0.5),
      java().Direction.UP, pos(support.x, support.y, support.z), false)
    var result = ctx.player.gameMode.useItemOn(ctx.player, e.level, ctx.player.getMainHandItem(),
      java().Hand.MAIN_HAND, hit)
    need(check(e.label + '_player_places_block', bid(e.level, placed) === 'minecraft:gold_block',
      'real ServerPlayerGameMode.useItemOn on packaged floor: ' + result +
      '; position=' + JSON.stringify(placed)), 'native player placement failed inside station')
    ctx.player.setMainHandItem(Item.empty)
    e.playerPlaced = { dimension: e.dimension, x: placed.x, y: placed.y, z: placed.z,
      block: 'minecraft:gold_block', state: String(e.level.getBlockState(pos(placed.x, placed.y, placed.z))),
      source: 'actual_player_useItemOn' }
    S.owned[key(e.dimension, placed)] = e.playerPlaced
    S.report.built.push(e.playerPlaced)
    note('built', JSON.stringify(e.playerPlaced))
    ctx.player.teleportTo(e.dimension, e.origin.x + 0.5, 72, e.origin.z + 0.5, 0, 0)
    // This is fixture positioning WITHIN the arrived orbit, never interplanetary travel.
    // GCYR substitutes a station border in SERVER Entity collision and also
    // sends center/size packets. This probe proves server enforcement only;
    // the separate client readback proves received bounds, not client walking.
    ctx.player.teleportTo(e.dimension, bounds.maxX - 0.5, 72, e.origin.z + 0.5, 0, 0)
    var before = Number(ctx.player.getX())
    ctx.player.move(java().Mover.SELF, new (java().Vec3)(2, 0, 0))
    var after = Number(ctx.player.getX())
    check(e.label + '_server_border_collision', after > before && after <= bounds.maxX - 0.29,
      'server native Entity.move +2: ' + before + ' -> ' + after + ', maxX=' + bounds.maxX)
    ctx.player.teleportTo(e.dimension, e.origin.x + 0.5, 72, e.origin.z + 0.5, 0, 0)
    ctx.sharedMap.put('s0sBorderRequest', JSON.stringify({ token: S.run + ':' + e.label,
      dimension: e.dimension, bounds: bounds }))
    return true
  }
  function clientBorder(ctx, e) {
    var raw = value(ctx, 's0sBorderResult')
    if (!raw) return false
    var got = JSON.parse(raw)
    if (got.token !== S.run + ':' + e.label) return false
    check(e.label + '_client_border', got.dimension === e.dimension &&
      JSON.stringify(got.bounds) === JSON.stringify(e.bounds), 'received client packet bounds; not client walking: ' + JSON.stringify(got))
    ctx.sharedMap.put('s0sBorderRequest', '')
    return true
  }
  function steamPlan(e) {
    // Same recorded pattern placement/parts/steam mechanism as the proven
    // gg_test_steam_small_family.js; no new recipe executor or power system.
    var desc = global.grindless.patterns.describe('gtceu:steam_compressor')
    need(desc && desc.slices, 'missing proven compressor pattern description')
    var cells = []
    var controller = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          if (!sym || sym.kind === 'air' || sym.kind === 'any') continue
          var p = { si: si, ri: ri, ci: ci, symbol: sym }
          if (sym.kind === 'controller') controller = p
          cells.push(p)
        }
      })
    })
    need(controller !== null, 'missing compressor controller')
    var parts = []
    var casing = ''
    var exchanges = []
    cells.forEach(function (p) {
      if (p.symbol.kind !== 'oneOf') return
      exchanges.push(p)
      if (parts.length) return
      p.symbol.options.forEach(function (o) {
        if (o.kind === 'blocks') casing = o.blocks[0]
        if (o.kind === 'part') {
          var ids = { steam: STEAM[0], steam_input_bus: STEAM[1], steam_output_bus: STEAM[2] }
          need(ids[o.ability], 'unexpected compressor ability')
          var lim = o.limits || {}
          var count = lim.exact != null ? lim.exact : (lim.min || 0)
          for (var i = 0; i < count; i++) parts.push(ids[o.ability])
        }
      })
    })
    need(casing && parts.length === 3, 'proven steam pattern changed')
    exchanges.forEach(function (p) { p.block = casing })
    parts.forEach(function (id, i) {
      exchanges[Math.floor((i + 0.5) * exchanges.length / parts.length)].block = id
    })
    var at = { x: e.origin.x + 12, y: 67, z: e.origin.z + 12 }
    cells.forEach(function (p) {
      p.x = at.x - (p.ci - controller.ci)
      p.y = at.y + (p.ri - controller.ri)
      p.z = at.z - (p.si - controller.si)
      if (p === controller) p.block = 'gtceu:steam_compressor'
      need(p.block && inside(e, p) && bid(e.level, p) === 'minecraft:air', 'occupied steam fixture cell')
    })
    // Same outward-facing part placement as the existing small-family proof:
    // never point a steam bus/hatch into the hollow centre.
    var minX = Math.min.apply(null, cells.map(function (p) { return p.x }))
    var maxX = Math.max.apply(null, cells.map(function (p) { return p.x }))
    var minY = Math.min.apply(null, cells.map(function (p) { return p.y }))
    var maxY = Math.max.apply(null, cells.map(function (p) { return p.y }))
    var minZ = Math.min.apply(null, cells.map(function (p) { return p.z }))
    var maxZ = Math.max.apply(null, cells.map(function (p) { return p.z }))
    var sides = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0],
      ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]
    cells.forEach(function (p) {
      if (STEAM.indexOf(p.block) < 0) return
      for (var i = 0; i < sides.length; i++) {
        var side = sides[i]
        var x = p.x + side[1]
        var y = p.y + side[2]
        var z = p.z + side[3]
        if (x < minX || x > maxX || y < minY || y > maxY || z < minZ || z > maxZ) {
          p.facing = side[0]
          break
        }
      }
      need(p.facing, 'steam part has no outward face')
    })
    // Controller last, as in the existing proof.
    cells.filter(function (p) { return p !== controller }).concat([controller]).forEach(function (p) {
      put(e.level, p, p.block, p === controller ? { facing: 'north' } :
        (p.facing ? { facing: p.facing } : {}), 'steam_after_arrival')
    })
    S.steam = { level: e.level, at: at, filled: false }
  }
  function steamTick() {
    var m = S.steam
    var ctrl = machine(m.level, m.at)
    if (!ctrl.isFormed()) return false
    if (!m.filled) {
      ctrl.setWorkingEnabled(false)
      m.out = null
      m.input = null
      m.hatch = null
      array(ctrl.getParts()).forEach(function (p) {
        var id = String(p.getDefinition().getId())
        if (id === STEAM[0]) m.hatch = p
        if (id === STEAM[1]) m.input = p
        if (id === STEAM[2]) m.out = p
      })
      need(m.input && m.out && m.hatch, 'formed compressor missing native steam parts')
      var inv = m.input.getInventory()
      var out = m.out.getInventory()
      for (var i = 0; i < inv.getSlots(); i++) need(inv.getStackInSlot(i).isEmpty(), 'nonempty new input bus')
      for (var j = 0; j < out.getSlots(); j++) need(out.getStackInSlot(j).isEmpty(), 'nonempty new output bus')
      // One existing GTM compressor/sandstone recipe: 4 sand -> 1 sandstone,
      // 300 base ticks (450 with the native steam-multiblock x1.5 modifier).
      need(inv.insertItem(0, Item.of('minecraft:sand', 4), false).isEmpty(), 'sand input refused')
      m.hatch.tank.setFluidInTank(0, Fluid.of('gtceu:steam', 64000).getFluidStack())
      m.startSteam = Number(m.hatch.tank.getFluidInTank(0).getAmount())
      need(m.startSteam > 0, 'native hatch did not accept steam')
      check('earth_steam_formed', true, 'proven 3x3x3 compressor built AFTER arrival, no wireless')
      ctrl.setWorkingEnabled(true)
      m.filled = true
      return false
    }
    var count = 0
    var other = 0
    var bus = m.out.getInventory()
    for (var k = 0; k < bus.getSlots(); k++) {
      var item = bus.getStackInSlot(k)
      if (!item.isEmpty()) {
        if (String(item.getId()) === 'minecraft:sandstone') count += Number(item.getCount())
        else other += Number(item.getCount())
      }
    }
    if (count === 0) return false
    var left = 0
    var input = m.input.getInventory()
    for (var n = 0; n < input.getSlots(); n++) left += Number(input.getStackInSlot(n).getCount())
    check('earth_steam_process', count === 1 && other === 0 && left === 0 &&
      Number(m.hatch.tank.getFluidInTank(0).getAmount()) < m.startSteam,
    '4 sand -> ' + count + ' sandstone, other=' + other + ', inputLeft=' + left +
      ', steamUsed=' + (m.startSteam - Number(m.hatch.tank.getFluidInTank(0).getAmount())))
    ctrl.setWorkingEnabled(false)
    return true
  }
  function retained(e, suffix) {
    var station = holder(e).getStation(java().Integer['valueOf(int)'](e.id))
    need(station !== null, 'owned station disappeared in ' + e.dimension)
    var border = station.border()
    var bounds = { minX: Number(border.getMinX()), maxX: Number(border.getMaxX()),
      minZ: Number(border.getMinZ()), maxZ: Number(border.getMaxZ()) }
    check(e.label + '_border_' + suffix, JSON.stringify(bounds) === JSON.stringify(e.bounds), JSON.stringify(bounds))
    var wrong = e.cells.filter(function (p) {
      return bid(e.level, p) !== p.block || String(e.level.getBlockState(pos(p.x, p.y, p.z))) !== p.state
    })
    check(e.label + '_blocks_' + suffix, wrong.length === 0, 'deployed cells changed=' + wrong.length)
    check(e.label + '_player_block_' + suffix, e.playerPlaced &&
      bid(e.level, e.playerPlaced) === e.playerPlaced.block, 'actual placed gold block retained')
    var be = e.level.getBlockEntity(pos(e.chest.x, e.chest.y, e.chest.z))
    need(be !== null, 'packaged chest disappeared in ' + e.dimension)
    var item = be.getItem(0)
    check(e.label + '_be_' + suffix, !item.isEmpty() && String(item.getId()) === 'minecraft:diamond' &&
      Number(item.getCount()) === 7, String(be.saveWithoutMetadata()))
  }
  function prepareReopen(ctx) {
    S.reopenToken = S.run + ':reopen'
    S.serverIdentity = String(ctx.server.hashCode())
    S.saveRoot = saveRoot(ctx)
    S.steamAt = S.steam ? S.steam.at : null
    S.steamOutputAt = S.steam && S.steam.out ? xyz(S.steam.out.getPos()) : null
    S.steam = null
    S.packager = null
    S.surface = null
    S.previousFlight = null
    S.target = null
    S.homeChip = null
    S.entries.forEach(function (e) {
      e.level = null
      e.chip = null
      e.keycard = null
      e.packageStack = null
    })
    phase(ctx, 'await_reopen')
    ctx.sharedMap.put('s0sReopenClosed', '')
    ctx.sharedMap.put('s0sReopenPending', S.reopenToken)
    // Only plain data, not a Java world/server handle or synthetic saved data.
    ctx.sharedMap.put('s0sReopenSnapshot', JSON.stringify(S))
    note('reopen_requested', 'owner must suppress auto-login and resume with fresh context after real Save/Quit + same-save selection')
    ctx.reopen(S.reopenToken)
  }
  function resume(ctx, token) {
    var raw = value(ctx, 's0sReopenSnapshot')
    need(raw, 'no S0-3 reopen snapshot; do not restart S0-1')
    S = JSON.parse(raw)
    try {
      need(String(token) === S.reopenToken && value(ctx, 's0sReopenPending') === S.reopenToken,
        'stale/mismatched reopen token')
      need(value(ctx, 's0sReopenClosed') === S.reopenToken,
        'no worldless-client disconnect observation')
      need(Date.now() - S.atMs < 45000, 'same-save handback exceeded the original 45 s reopen deadline')
      need(String(ctx.server.hashCode()) !== S.serverIdentity, 'same integrated server is still running')
      need(saveRoot(ctx) === S.saveRoot, 'reopen selected a different save')
      need(dim(ctx.player.getLevel()) === 'minecraft:overworld', 'reopened player not on saved Earth return')
      S.entries.forEach(function (e) { e.level = levelFor(ctx, e.planet) })
      protection(ctx)
      mapsExpected()
      S.report.reopen = { differentServer: true, sameSavePath: true, worldlessClientObserved: true }
      phase(ctx, 'reopened')
      return { done: false, ok: false }
    } catch (err) {
      check('reopen_context', false, String(err))
      finish(ctx, true, String(err))
      return { done: true, ok: false, failures: S.failures }
    }
  }
  function finish(ctx, aborted, detail) {
    if (S.done) return
    if (ctx.sharedMap) {
      ctx.sharedMap.put('s0sPackRequest', '')
      ctx.sharedMap.put('s0sBorderRequest', '')
      ctx.sharedMap.put('s0sReopenPending', '')
    }
    if (!S.reopenChecked) check('same_save_reopen', false,
      'UNPROVEN: real same-client Save/Quit + Select World handback not completed; no /reload or codec substitute')
    if (S.originalInvulnerable !== undefined && ctx.player) {
      ctx.player.getAbilities().invulnerable = S.originalInvulnerable
      note('cold_protection_restored', 'test-only invulnerability restored to its original value')
    }
    S.done = true
    S.report.aborted = !!aborted
    S.report.detail = detail
    S.report.retained = 'Only owned fixtures/records retained for inspection; no cleanup of foreign work.'
    S.phase = aborted ? 'aborted' : 'done'
    save()
    note('DONE', 'failures=' + S.failures + '; ' + detail + '; manifest=' + EXPORT)
  }
  function abort(ctx, detail) {
    // The flight owner can fail outside tick(), including while loading cargo.
    // Reuse the same idempotent finalizer, manifest and protection restoration.
    if (S === null || S.done) return
    check(S.phase + '_owner_abort', false, String(detail))
    finish(ctx, true, String(detail))
  }
  function begin(ctx) {
    need(S === null, 'S0-3 driver cannot be started twice in one script lifetime')
    S = { run: String(Date.now()), phase: 'begin', at: Number(ctx.tick), atMs: Date.now(),
      startMs: Date.now(), entries: [], index: 0, owned: {}, failures: 0, done: false,
      report: { checks: [], plots: [], packages: [], built: [], sameSaveReopen: 'unproven' } }
    try {
      need(ctx.server && ctx.player && ctx.sharedMap && typeof ctx.fly === 'function' &&
        typeof ctx.program === 'function' && typeof ctx.flightBusy === 'function' &&
        typeof ctx.lastFlight === 'function', 'incomplete S0-3 flight bridge')
      need(!ctx.flightBusy() && dim(ctx.player.getLevel()) === 'minecraft:overworld',
        'begin only after actual S0-2 Earth return')
      java()
      protection(ctx)
      surfaceFresh(ctx)
      S.entries.push(candidate(ctx, 'gcyr:earth', 'earth'))
      S.entries.push(candidate(ctx, 'grindless:s0_moon', 'moon'))
      phase(ctx, 'fresh_plots')
      note('budget', 'no independent run/retry; caller retains the original consolidated 600-second deadline')
      return { done: false, ok: false }
    } catch (err) {
      check('begin', false, String(err))
      finish(ctx, true, String(err))
      return { done: true, ok: false }
    }
  }
  function tick(ctx) {
    need(S !== null, 'call begin(ctx) before tick(ctx)')
    if (S.done) return { done: true, ok: S.failures === 0, failures: S.failures }
    try {
      need(Date.now() - S.startMs < 240000, 'S0-3 local ceiling reached; no retry/new budget')
      if (ctx.flightBusy()) return { done: false, ok: false }
      if (S.phase === 'await_reopen') {
        need(!timedOut(ctx, 900, 45000), 'same-client reopen was not handed back within 45 seconds')
        return { done: false, ok: false }
      }
      var e = S.entries[S.index]
      var age = Number(ctx.tick) - S.at
      mapsExpected()
      if (S.phase === 'fresh_plots') {
        if (!scanPlot(e)) return { done: false }
        check(e.label + '_fresh_plot', true, 'empty map + entire full-height plot: ' + e.chunkCount + ' native chunks')
        S.index++
        if (S.index === 2) {
          S.index = 0
          packagerStructure(ctx)
          phase(ctx, 'program')
          ctx.program('gcyr:earth', true)
        }
      } else if (S.phase === 'program') {
        var chip = ctx.player.getMainHandItem()
        if (programmedChip(chip, S.index === 0 ? 'minecraft:overworld' : 'grindless:s0_moon', e.id)) {
          e.chipNbt = String(chip.getNbt())
          check(e.label + '_real_menu_chip', true, e.chipNbt)
          packagerStructure(ctx)
          payload(e)
          S.packager.getPackageSlot().setStackInSlot(0, Item.of('gcyr:space_station_package'))
          S.packager.getKeycardSlot().setStackInSlot(0, chip)
          ctx.player.setMainHandItem(Item.empty)
          phase(ctx, 'form_packager')
        } else need(!timedOut(ctx, 160, 10000), 'real planet/station menu did not program held chip')
      } else if (S.phase === 'form_packager') {
        if (age % 10 === 0) S.packager.checkPatternWithLock()
        if (S.packager.isFormed()) {
          check(e.label + '_packager_formed', true, 'native platform, no synthetic formed flag')
          openPackager(ctx)
          phase(ctx, 'pack')
        } else need(!timedOut(ctx, 100, 6000), 'native station packager failed to form')
      } else if (S.phase === 'pack') {
        var clientError = value(ctx, 's0sPackError')
        need(!clientError, 'client Pack button: ' + clientError)
        if (collectPackage(ctx, e)) {
          S.index++
          if (S.index === 1) {
            phase(ctx, 'program')
            ctx.program('grindless:s0_moon', true)
          } else {
            S.index = 0
            phase(ctx, 'home_program')
            ctx.program('gcyr:earth', false)
          }
        } else need(!timedOut(ctx, 120, 8000), 'real Pack button produced no outputs')
      } else if (S.phase === 'home_program') {
        var home = ctx.player.getMainHandItem()
        if (programmedChip(home, 'minecraft:overworld', null)) {
          S.homeChip = home
          check('earth_home_real_menu_chip', true, 'fresh ordinary ID chip, no station/position override: ' + home.getNbt())
          ctx.player.setMainHandItem(Item.empty)
          fly(ctx, S.entries[0], S.entries[0].chip, S.entries[0].packageStack, 'earth_flight')
        } else need(!timedOut(ctx, 160, 10000), 'real planet menu did not program fresh ordinary home chip')
      } else if (S.phase === 'earth_flight' || S.phase === 'moon_flight') {
        if (arrived(ctx, e)) phase(ctx, 'border')
        else need(!timedOut(ctx, 1000, 55000), 'station flight did not complete')
      } else if (S.phase === 'border') {
        var observed = clientBorder(ctx, e)
        if (observed || timedOut(ctx, 40, 3000)) {
          if (!observed) check(e.label + '_client_border', false,
            'client border observation timed out: ' + value(ctx, 's0sBorderResult'))
          if (S.index === 0) {
            steamPlan(e)
            phase(ctx, 'steam')
          } else {
            var earth = { planet: 'gcyr:earth', dimension: 'minecraft:overworld' }
            fly(ctx, earth, S.homeChip, Item.empty, 'earth_return')
          }
        }
      } else if (S.phase === 'steam') {
        if (steamTick() || timedOut(ctx, 540, 28000)) {
          if (!S.steam.filled || timedOut(ctx, 540, 28000)) check('earth_steam_process', false, 'formation/processing timeout')
          S.index = 1
          fly(ctx, S.entries[1], S.entries[1].chip, S.entries[1].packageStack, 'moon_flight')
        }
      } else if (S.phase === 'earth_return') {
        if (ctx.lastFlight() !== S.previousFlight) {
          var result = ctx.lastFlight()
          need(result !== null && result !== undefined && result.ok !== false, 'Earth return failed')
          need(dim(ctx.player.getLevel()) === 'minecraft:overworld', 'return did not reach Earth')
          check('earth_return', true, 'same player, native rocket leg, fresh ordinary real-menu Earth surface ID chip')
          S.report.earthReturn = { x: Number(ctx.player.getX()), y: Number(ctx.player.getY()), z: Number(ctx.player.getZ()),
            dimension: dim(ctx.player.getLevel()) }
          note('earth_return_position', JSON.stringify(S.report.earthReturn))
          mapsExpected()
          S.entries.forEach(function (entry) {
            retained(entry, 'warm_travel')
          })
          if (typeof ctx.reopen === 'function') prepareReopen(ctx)
          else finish(ctx, false, 'station/steam/return attempted; warm travel retention is NOT actual save reopening')
        } else need(!timedOut(ctx, 1000, 55000), 'Earth return did not complete')
      } else if (S.phase === 'reopened') {
        var earthEntry = S.entries[0]
        var ctrl = S.steamAt ? machine(earthEntry.level, S.steamAt) : null
        if (age < 10) return { done: false }
        var beforeFailures = S.failures
        mapsExpected()
        S.entries.forEach(function (entry) { retained(entry, 'real_reopen') })
        var output = 0
        var outputPart = S.steamOutputAt ? machine(earthEntry.level, S.steamOutputAt) : null
        if (outputPart !== null && String(outputPart.getDefinition().getId()) === STEAM[2]) {
          var inv = outputPart.getInventory()
          for (var i = 0; i < inv.getSlots(); i++) {
            var item = inv.getStackInSlot(i)
            if (!item.isEmpty() && String(item.getId()) === 'minecraft:sandstone') output += Number(item.getCount())
          }
        }
        check('earth_steam_real_reopen', ctrl !== null &&
          String(ctrl.getDefinition().getId()) === 'gtceu:steam_compressor' && output === 1,
          'controller and actual output-bus inventory read from reopened save; persisted sandstone=' + output +
          '; formation/processing already proven before disconnect, no unloaded-chunk ticking assumption')
        S.reopenChecked = true
        check('same_save_reopen', beforeFailures === S.failures,
          'worldless client observed; new integrated server, same save; both native records/plots/borders/BE inventories and compressor re-read')
        S.report.sameSaveReopen = beforeFailures === S.failures ? 'passed' : 'failed'
        finish(ctx, false, 'same-JVM actual save reopening handed back and checked; no /reload substitute')
      }
      return { done: S.done, ok: S.done && S.failures === 0, failures: S.failures }
    } catch (err) {
      check(S.phase + '_exception', false, String(err))
      finish(ctx, true, String(err))
      return { done: true, ok: false, failures: S.failures }
    }
  }
  global.ggLuvS0Stations = { begin: begin, tick: tick, loadCargo: loadCargo, resume: resume, abort: abort }
})()
