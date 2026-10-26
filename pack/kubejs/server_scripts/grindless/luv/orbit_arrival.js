// GCYR 0.2.9: recover one stalled, occupied arrival, only in G.orbits dimensions.
// Authorization is the rocket's retained control + its selected native station record + deployed
// physical column, NOT ownership, a default/nearest station, a new platform or thermal immunity.
// Native pairing restores the existing root's spawn/block/seat data; no second ticking tracker.
// SUCCESS means verified server correction/sync dispatch, NOT proof of later native landing or
// client mount recovery. Those require subsequent real collision and client readback.
// Rhino: var inside repeated callbacks; audited overloads; no reflection or catch-and-retry moves.
(function () {
  var G = global.grindless
  var A = G.orbitArrival = {}
  A.dimensions = G.orbits.dimensions.slice()
  A.minimumY = 550
  A.stallTicks = 40
  var LAUNCH_SAMPLE_TICKS = 10
  // Minecraft 1.20.1 DimensionType's legal Y range bounds every single-column scan.
  var MIN_SCAN_Y = -2032
  var MAX_SCAN_Y_EXCLUSIVE = 2032
  A.states = {}
  var LOG = '[grindless/orbit-arrival] '
  var Rocket = Java.loadClass('argent_matter.gcyr.common.entity.RocketEntity')
  var J
  var discoveryError = false

  function finite(value) {
    return typeof value === 'number' && isFinite(value)
  }

  function need(ok, message) {
    if (!ok) throw new Error(message)
  }

  // Resolve first, invoke once. A runtime exception may follow a partial mutation: NEVER try
  // any other alias after that exception. Only an absent method permits the next name.
  // R10: qualified Minecraft selectors can be absent even when ordinary members are present.
  // Each simple fallback below is unambiguous by arity and/or its native reference argument:
  // Vec3 motion, NBT/tag/stack helpers, physical queries and packet/sync
  // methods. Integer.valueOf(int) stays explicitly pinned: JS-number/String boxing IS ambiguous.
  // Rhino 2001.2.3-build.10: ScriptRuntime.in uses hasObjectElem/hasProperty, then the
  // NativeJavaClass/NativeJavaObject.has -> JavaMembers.has existence path. An absent class
  // member's get() instead throws reportMemberNotFound. Probe before get; catch neither
  // presence/lookup failures nor invocation failures, even if their messages look alike.
  function invoke(object, names, args) {
    for (var i = 0; i < names.length; i++) {
      var name = names[i]
      if (!(name in object)) continue
      var method = object[name]
      if (typeof method === 'function') return method.apply(object, args || [])
    }
    throw new Error('missing public method: ' + names.join(' / '))
  }

  function java() {
    if (J) return J
    J = {
      Tag: Java.loadClass('net.minecraft.nbt.CompoundTag'),
      Stack: Java.loadClass('net.minecraft.world.item.ItemStack'),
      Integer: Java.loadClass('java.lang.Integer'),
      Chip: Java.loadClass('argent_matter.gcyr.common.item.PlanetIdChipBehaviour'),
      Card: Java.loadClass('argent_matter.gcyr.common.item.KeyCardBehaviour'),
      Items: Java.loadClass('argent_matter.gcyr.common.data.GCYRItems'),
      Planets: Java.loadClass('argent_matter.gcyr.data.loader.PlanetData'),
      Capability: Java.loadClass('argent_matter.gcyr.api.capability.GCYRCapabilityHelper'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      Context: Java.loadClass('net.minecraft.world.phys.shapes.CollisionContext'),
      Axis: Java.loadClass('net.minecraft.core.Direction$Axis'),
      Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
      Pairing: Java.loadClass('net.minecraft.server.level.ServerEntity'),
      VehiclePacket: Java.loadClass('net.minecraft.network.protocol.game.ClientboundMoveVehiclePacket'),
      TeleportPacket: Java.loadClass('net.minecraft.network.protocol.game.ClientboundTeleportEntityPacket')
    }
    return J
  }

  function uuid(entity) { return String(invoke(entity, ['getStringUuid', 'm_20149_'])) }
  function vehicle(player) { return invoke(player, ['getVehicle', 'm_20202_']) }
  function snapshot(rocket) {
    var j = java()
    return invoke(rocket, ['saveWithoutId(net.minecraft.nbt.CompoundTag)', 'm_20240_(net.minecraft.nbt.CompoundTag)',
      'saveWithoutId', 'm_20240_'], [new j.Tag()])
  }
  function launching(saved) {
    // This exact saved flag was repeatedly observed natively; no entity-data wrapper bridge.
    need(has(saved, 'isStarted', 1), 'missing/unreadable typed native isStarted flag')
    var started = invoke(saved, ['getBoolean(java.lang.String)', 'm_128471_(java.lang.String)',
      'getBoolean', 'm_128471_'], ['isStarted'])
    need(started !== null && started !== undefined &&
      (String(started) === 'true' || String(started) === 'false'), 'unreadable native launch state')
    return String(started) === 'true'
  }
  function coord(entity, axis) {
    var names = axis === 'x' ? ['getX', 'm_20185_'] :
      axis === 'y' ? ['getY', 'm_20186_'] : ['getZ', 'm_20189_']
    return Number(invoke(entity, names))
  }
  function point(entity) { return [coord(entity, 'x'), coord(entity, 'y'), coord(entity, 'z')] }
  function box(entity) { return invoke(entity, ['getBoundingBox', 'm_20191_']) }
  function movedBox(bounds, dy) {
    return invoke(bounds, ['move(double,double,double)', 'm_82386_(double,double,double)', 'move', 'm_82386_'], [0, dy, 0])
  }
  function dimension(level) { return String(level.getDimensionKey().location()) }
  function has(tag, key, type) {
    return invoke(tag, ['contains(java.lang.String,int)', 'm_128425_(java.lang.String,int)', 'contains', 'm_128425_'], [key, type])
  }
  function compound(tag, key) {
    return invoke(tag, ['getCompound(java.lang.String)', 'm_128469_(java.lang.String)', 'getCompound', 'm_128469_'], [key])
  }
  function intTag(tag, key) {
    return Number(invoke(tag, ['getInt(java.lang.String)', 'm_128451_(java.lang.String)', 'getInt', 'm_128451_'], [key]))
  }
  function noCollision(level, entity, bounds) {
    return invoke(level, [
      'noCollision(net.minecraft.world.entity.Entity,net.minecraft.world.phys.AABB)',
      'm_45756_(net.minecraft.world.entity.Entity,net.minecraft.world.phys.AABB)', 'noCollision', 'm_45756_'
    ], [entity, bounds])
  }
  function resetFall(entity) { invoke(entity, ['resetFallDistance', 'm_183634_']) }
  function zeroMotion(entity) {
    invoke(entity, ['setDeltaMovement(net.minecraft.world.phys.Vec3)', 'm_20256_(net.minecraft.world.phys.Vec3)',
      'setDeltaMovement', 'm_20256_'],
      [java().Vec3.ZERO])
  }
  function positionRider(rocket, player) {
    invoke(rocket, ['positionRider(net.minecraft.world.entity.Entity)', 'm_7332_(net.minecraft.world.entity.Entity)',
      'positionRider', 'm_7332_'], [player])
  }
  function send(player, packet) {
    invoke(player.connection, ['send(net.minecraft.network.protocol.Packet)', 'm_9829_(net.minecraft.network.protocol.Packet)',
      'send', 'm_9829_'], [packet])
  }
  function association(riders, id) {
    var count = 0
    for (var i = 0; i < riders.length; i++) {
      var parent = vehicle(riders[i])
      if (parent !== null && parent !== undefined && uuid(parent) === id) count++
    }
    return count + '/' + riders.length + '->' + id
  }

  function fresh(dimension) {
    return { dimension: dimension, tick: null, y: null, since: null, handled: false,
      launchTick: null, launchStarted: null }
  }

  function resetWindow(state) {
    state.tick = null
    state.y = null
    state.since = null
  }

  function readTarget(saved, level, dim) {
    var j = java()
    need(has(saved, 'config', 10), 'missing typed config inventory')
    var config = compound(saved, 'config')
    need(has(config, 'Size', 3) && intTag(config, 'Size') === 1, 'malformed config inventory size')
    need(has(config, 'Items', 9), 'missing typed config.Items list')
    var items = invoke(config, ['getList(java.lang.String,int)', 'm_128437_(java.lang.String,int)',
      'getList', 'm_128437_'], ['Items', 10])
    var entry = null
    for (var i = 0; i < items.size(); i++) {
      var candidate = invoke(items, ['getCompound(int)', 'm_128728_(int)', 'getCompound', 'm_128728_'], [i])
      need(has(candidate, 'Slot', 3), 'missing/malformed config slot index')
      if (intTag(candidate, 'Slot') === 0) {
        need(entry === null, 'ambiguous config slot 0')
        entry = candidate
      }
    }
    need(entry !== null, 'missing actual config slot 0')
    need(has(entry, 'id', 8) && has(entry, 'Count', 1) && has(entry, 'tag', 10), 'malformed control stack entry')
    var stack = invoke(j.Stack, ['of(net.minecraft.nbt.CompoundTag)', 'm_41712_(net.minecraft.nbt.CompoundTag)',
      'of', 'm_41712_'], [entry])
    need(!stack.isEmpty(), 'empty config control')
    var controlId = String(stack.getId())
    need(controlId === 'gcyr:id_chip' || controlId === 'gcyr:keycard', 'not a station control')
    var chip = controlId === 'gcyr:id_chip'
    need(invoke(chip ? j.Items.ID_CHIP : j.Items.KEYCARD, ['isIn(net.minecraft.world.item.ItemStack)', 'isIn'], [stack]),
      'native control item mismatch')
    var tag = stack.getNbt()
    need(tag !== null && tag !== undefined && has(tag, 'gcyr:current_station', 3) &&
      has(tag, 'gcyr:current_planet', 8), 'missing typed selected station/planet')
    var id = intTag(tag, 'gcyr:current_station')
    need(finite(id) && id >= 0 && Math.floor(id) === id, 'invalid selected station id')
    var selected = chip ? invoke(j.Chip, ['getSpaceStationId(net.minecraft.world.item.ItemStack)', 'getSpaceStationId'], [stack]) :
      invoke(j.Card, ['getSavedStation(net.minecraft.world.item.ItemStack)', 'getSavedStation'], [stack])
    need(selected !== null && selected !== undefined && Number(selected) === id, 'control station helper mismatch')
    // Chip uses WORLD id; keycard uses PLANET REGISTRY id. Their native helpers resolve these.
    var planet = chip ? invoke(j.Chip, ['getPlanetFromStack(net.minecraft.world.item.ItemStack)', 'getPlanetFromStack'], [stack]) :
      invoke(j.Card, ['getSavedPlanet(net.minecraft.world.item.ItemStack)', 'getSavedPlanet'], [stack])
    need(planet !== null && planet !== undefined && String(planet.orbitWorld().location()) === dim,
      'selected planet does not resolve to current orbit')
    var holder = invoke(j.Capability, ['getSpaceStations(net.minecraft.server.level.ServerLevel)', 'getSpaceStations'], [level])
    need(holder !== null && holder !== undefined, 'missing native station holder')
    var station = invoke(holder, ['getStation(java.lang.Integer)', 'getStation'], [j.Integer['valueOf(int)'](id)])
    need(station !== null && station !== undefined, 'selected station record does not exist')
    var recordPlanet = station.orbitPlanet()
    var planetId = invoke(j.Planets, ['getPlanetId(argent_matter.gcyr.api.space.planet.Planet)', 'getPlanetId'], [planet])
    var recordId = recordPlanet === null || recordPlanet === undefined ? null :
      invoke(j.Planets, ['getPlanetId(argent_matter.gcyr.api.space.planet.Planet)', 'getPlanetId'], [recordPlanet])
    need(recordPlanet !== null && recordPlanet !== undefined &&
      String(recordPlanet.orbitWorld().location()) === dim &&
      planetId !== null && planetId !== undefined && recordId !== null && recordId !== undefined &&
      String(recordId) === String(planetId),
    'selected station record planet mismatch')
    var origin = invoke(holder, ['getStationWorldPos(int)', 'getStationWorldPos'], [id])
    need(origin !== null && origin !== undefined, 'missing native station world position')
    // Native chip position navigation overrides the station destination. Permit it ONLY when
    // the actual helper's orbit and column agree; saved Y is not the station's support height.
    if (chip && invoke(tag, ['contains(java.lang.String)', 'm_128441_(java.lang.String)', 'contains', 'm_128441_'],
      ['gcyr:current_position'])) {
      need(has(tag, 'gcyr:current_position', 10), 'malformed saved position')
      var raw = compound(tag, 'gcyr:current_position')
      need(has(raw, 'X', 3) && has(raw, 'Y', 3) && has(raw, 'Z', 3), 'malformed saved position coordinates')
      var override = invoke(j.Chip, ['getSavedPosition(net.minecraft.world.item.ItemStack)', 'getSavedPosition'], [stack])
      need(override !== null && override !== undefined &&
        String(override.dimension().location()) === dim &&
        Number(override.pos().getX()) === Number(origin.getX()) &&
        Number(override.pos().getZ()) === Number(origin.getZ()), 'saved position conflicts with selected station column')
    }
    return { id: id, station: station, origin: origin }
  }

  function within(bounds, border) {
    return finite(Number(bounds.minX)) && finite(Number(bounds.maxX)) &&
      finite(Number(bounds.minY)) && finite(Number(bounds.maxY)) &&
      finite(Number(bounds.minZ)) && finite(Number(bounds.maxZ)) &&
      Number(bounds.minX) >= Number(border.getMinX()) && Number(bounds.maxX) <= Number(border.getMaxX()) &&
      Number(bounds.minZ) >= Number(border.getMinZ()) && Number(bounds.maxZ) <= Number(border.getMaxZ())
  }

  function clearBox(level, entity, bounds, stationBorder) {
    need(within(bounds, stationBorder) && within(bounds, level.getWorldBorder()), 'box outside station/world border')
    need(Number(bounds.minY) >= Number(level.getMinBuildHeight()) &&
      Number(bounds.maxY) <= Number(level.getMaxBuildHeight()), 'box outside build height')
    need(noCollision(level, entity, bounds) === true, 'blocked whole-box clearance')
  }

  function stationColumn(level, origin, x, z) {
    var j = java()
    var originText = '[' + x + ',' + Number(origin.getY()) + ',' + z + ']'
    var min = 'unread'
    var max = 'unread'
    var inspected = 0
    var queryY = 'none'
    var outcome = 'build-bounds-query-failed'
    function detail() {
      return 'columnOrigin=' + originText + ' minBuildHeight=' + min + ' maxBuildHeight=' + max +
        ' blocksInspected=' + inspected + ' queryY=' + queryY + ' queryOutcome=' + outcome
    }
    function numericInput(value) {
      var type = typeof value
      if (value === null || (type !== 'number' && type !== 'object')) return false
      var tag = Object.prototype.toString.call(value)
      return tag !== '[object String]' && tag !== '[object Boolean]'
    }
    try {
      min = level.getMinBuildHeight()
      max = level.getMaxBuildHeight()
      outcome = 'invalid-build-bounds'
      // Keep the established native Number normalization, including wrapped Java Number
      // returns. Reject null/undefined and string/boolean coercion defaults before converting.
      need(numericInput(min) && numericInput(max), 'invalid column build bounds')
      min = Number(min)
      max = Number(max)
      need(finite(min) && finite(max) && Math.floor(min) === min && Math.floor(max) === max &&
        min >= MIN_SCAN_Y && max <= MAX_SCAN_Y_EXCLUSIVE && min < max,
      'invalid column build bounds')
      // Query ONLY the selected native X/Z, highest first. Neither a heightmap nor a lower
      // colliding block may stand in for the actual highest non-air block.
      // Deliberate: getBlockState may load this ONE selected-origin chunk. Do not use an
      // unloaded-chunk/height query as proof of absence; failed queries are not all-air results.
      for (var y = max - 1; y >= min; y--) {
        queryY = y
        outcome = 'block-query-failed'
        var pos = new j.Pos(x, y, z)
        var block = level.getBlockState(pos)
        outcome = 'unreadable-block-state'
        need(block !== null && block !== undefined, 'unreadable column block state')
        outcome = 'air-query-failed'
        var air = String(block.isAir())
        outcome = 'unreadable-air-result'
        need(air === 'true' || air === 'false', 'unreadable column air result')
        inspected++
        if (air === 'false') {
          outcome = 'highest-non-air'
          return { pos: pos, block: block, y: y, detail: detail() }
        }
      }
      outcome = 'all-air'
      throw new Error('no physical station column')
    } catch (e) {
      // Add query evidence, not a fallback/retry. "Inspected" counts successfully read air/non-air results.
      throw new Error('station column scan failed ' + detail() + ' cause=' + e)
    }
  }

  function landing(rocket, level, target) {
    var j = java()
    var old = point(rocket)
    need(old.every(finite), 'invalid root position')
    var x = Number(target.origin.getX())
    var z = Number(target.origin.getZ())
    // Native station arrivals use this column. Never move horizontally to rescue a stray rocket.
    need(Math.floor(old[0]) === x && Math.floor(old[2]) === z, 'rocket is not over its selected station column')
    var column = stationColumn(level, target.origin, x, z)
    var shape = invoke(column.block, [
      'getCollisionShape(net.minecraft.world.level.BlockGetter,net.minecraft.core.BlockPos,net.minecraft.world.phys.shapes.CollisionContext)',
      'm_60742_(net.minecraft.world.level.BlockGetter,net.minecraft.core.BlockPos,net.minecraft.world.phys.shapes.CollisionContext)',
      'getCollisionShape', 'm_60742_'
    ], [level, column.pos, invoke(j.Context, ['of(net.minecraft.world.entity.Entity)', 'm_82750_(net.minecraft.world.entity.Entity)',
      'of', 'm_82750_'], [rocket])])
    need(!shape.isEmpty(), 'highest column block has no collision support ' + column.detail)
    var top = Number(invoke(shape, ['max(net.minecraft.core.Direction$Axis)', 'm_83297_(net.minecraft.core.Direction$Axis)',
      'max', 'm_83297_'], [j.Axis.Y]))
    need(finite(top) && top > 0 && top <= 1, 'unsuitable column collision top ' + column.detail)
    var oldBox = box(rocket)
    var floor = column.y + top
    var y = floor + old[1] - Number(oldBox.minY)
    need(finite(y) && y < old[1], 'correction is not straight down')
    var dy = y - old[1]
    var destinationBox = movedBox(oldBox, dy)
    clearBox(level, rocket, destinationBox, target.station.border())
    need(noCollision(level, rocket, movedBox(destinationBox, -0.0001)) === false, 'no actual collision support under root')
    return { old: old, oldFloor: Number(oldBox.minY), y: y, dy: dy, floor: floor, column: column.detail }
  }

  function correct(rocket, riders, level, state, id, stalled, saved) {
    var j = java()
    var target = readTarget(saved, level, state.dimension)
    state.station = String(target.id)
    var plan = landing(rocket, level, target)
    // KubeJS getType() is an ID string; getEntityType() exposes the native tracking metadata.
    // Resolve it before any relocation, so a binding failure cannot leave a partial correction.
    var type = invoke(rocket, ['getEntityType', 'm_6095_'])
    var interval = Number(invoke(type, ['updateInterval', 'm_20682_']))
    var tracking = String(invoke(type, ['trackDeltas', 'm_20683_']))
    need(finite(interval) && Math.floor(interval) === interval && interval > 0, 'invalid native tracking interval')
    need(tracking === 'true' || tracking === 'false', 'invalid native delta tracking flag')
    var original = association(riders, id)
    need(original === riders.length + '/' + riders.length + '->' + id, 'original rider association changed')
    // Establish each real native seat at the SOURCE, without unride/remount or hand-written seat
    // offsets, so stale passenger coordinates cannot make the preflight clearance optimistic.
    for (var i = 0; i < riders.length; i++) {
      resetFall(riders[i])
      positionRider(rocket, riders[i])
      clearBox(level, riders[i], movedBox(box(riders[i]), plan.dy), target.station.border())
    }
    resetFall(rocket)
    zeroMotion(rocket)
    invoke(rocket, ['teleportToWithTicket(double,double,double)', 'm_20324_(double,double,double)',
      'teleportToWithTicket', 'm_20324_'],
      [plan.old[0], plan.y, plan.old[2]])
    var actual = point(rocket)
    need(actual.every(finite) && Math.abs(actual[0] - plan.old[0]) < 0.000001 &&
      Math.abs(actual[1] - plan.y) < 0.000001 && Math.abs(actual[2] - plan.old[2]) < 0.000001 &&
      Math.abs(Number(box(rocket).minY) - plan.floor) < 0.000001, 'root transport readback mismatch')
    clearBox(level, rocket, box(rocket), target.station.border())
    var broadcast = function (packet) {
      for (var r = 0; r < riders.length; r++) send(riders[r], packet)
    }
    var pairing = new j.Pairing(level, rocket, interval, tracking === 'true', broadcast)
    var chunks = level.getChunkSource()
    for (var k = 0; k < riders.length; k++) {
      var rider = riders[k]
      positionRider(rocket, rider)
      clearBox(level, rider, box(rider), target.station.border())
      need(vehicle(rider) !== null && uuid(vehicle(rider)) === id, 'native transport lost rider')
      resetFall(rider)
      zeroMotion(rider)
      var deliver = function (packet) { send(rider, packet) }
      invoke(pairing, [
        'sendPairingData(net.minecraft.server.level.ServerPlayer,java.util.function.Consumer)',
        'm_289200_(net.minecraft.server.level.ServerPlayer,java.util.function.Consumer)', 'sendPairingData', 'm_289200_'
      ], [rider, deliver])
      var seat = point(rider)
      need(seat.every(finite), 'invalid native seat position')
      invoke(rider.connection, [
        'teleport(double,double,double,float,float)', 'm_9774_(double,double,double,float,float)', 'teleport', 'm_9774_'
      ], [seat[0], seat[1], seat[2], Number(rider.getYaw()), Number(rider.getPitch())])
      var restoredSeat = point(rider)
      need(restoredSeat.every(finite) && Math.abs(restoredSeat[0] - seat[0]) < 0.000001 &&
        Math.abs(restoredSeat[1] - seat[1]) < 0.000001 && Math.abs(restoredSeat[2] - seat[2]) < 0.000001,
      'rider connection seat readback mismatch')
      invoke(chunks, ['move(net.minecraft.server.level.ServerPlayer)', 'm_8385_(net.minecraft.server.level.ServerPlayer)',
        'move', 'm_8385_'], [rider])
      invoke(rider.connection, ['resetPosition', 'm_9953_'])
      // Every direct player rider receives the native root packet; vanilla applies it only to
      // its locally controlled root. Pairing/passengers must arrive before this correction.
      send(rider, new j.VehiclePacket(rocket))
    }
    resetFall(rocket)
    zeroMotion(rocket)
    invoke(chunks, [
      'broadcastAndSend(net.minecraft.world.entity.Entity,net.minecraft.network.protocol.Packet)',
      'm_8394_(net.minecraft.world.entity.Entity,net.minecraft.network.protocol.Packet)', 'broadcastAndSend', 'm_8394_'
    ], [rocket, new j.TeleportPacket(rocket)])
    var restored = association(riders, id)
    need(restored === original, 'restored rider association mismatch')
    state.outcome = 'corrected'
    console.info(LOG + 'SUCCESS dimension=' + state.dimension + ' station=' + target.id +
      ' rocket=' + id + ' stalledServerTicks=' + stalled + ' oldRoot=[' + plan.old.join(',') +
      '] newRoot=[' + actual.join(',') + '] oldBBoxFloor=' + plan.oldFloor +
      ' newBBoxFloor=' + Number(box(rocket).minY) + ' originalAssociation=' + original +
      ' restoredAssociation=' + restored + ' ' + plan.column + ' nativeLanding=unverified clientMount=unverified')
  }

  function inspect(group, tick) {
    var rocket = group.rocket
    var id = group.id
    var level = rocket.getLevel()
    var dim = dimension(level)
    var state = A.states[id]
    if (!state || state.dimension !== dim) state = A.states[id] = fresh(dim)
    if (A.dimensions.indexOf(dim) < 0) {
      state.handled = false
      resetWindow(state)
      return
    }
    var y = coord(rocket, 'y')
    if (!finite(tick) || !finite(y)) {
      resetWindow(state)
      return
    }
    // Serialize only occupied, observed orbit roots, not every entity or every server tick.
    // Cache ONLY the launch bit/time, not a stale destination or the large saved rocket tree.
    var saved = null
    if (state.launchTick === null || tick < state.launchTick || tick - state.launchTick >= LAUNCH_SAMPLE_TICKS) {
      state.launchTick = tick
      state.launchStarted = null
      saved = snapshot(rocket)
      state.launchStarted = launching(saved)
    }
    if (state.launchStarted === true) {
      state.handled = false
      delete state.station
      delete state.outcome
      resetWindow(state)
      return
    }
    if (state.handled || state.launchStarted !== false) return
    if (y < A.minimumY) {
      resetWindow(state)
      return
    }
    // Server position, NOT Motion.y or client age, detects real descent. Gaps are not proof
    // of a continuous stall (the rider may have dismounted or changed dimensions unseen).
    if (state.tick === null || tick < state.tick || tick > state.tick + 1 || y < state.y) state.since = tick
    if (state.tick === tick) return
    state.tick = tick
    state.y = y
    if (tick - state.since <= A.stallTicks) return
    state.handled = true
    try {
      // A cached false flag NEVER authorizes a correction. Reuse only a snapshot taken in THIS
      // server tick; otherwise obtain a fresh one and check its typed launch flag before moving.
      if (saved === null) {
        state.launchTick = tick
        state.launchStarted = null
        saved = snapshot(rocket)
        state.launchStarted = launching(saved)
      }
      if (state.launchStarted === true) {
        state.handled = false
        delete state.station
        delete state.outcome
        resetWindow(state)
        return
      }
      correct(rocket, group.riders, level, state, id, tick - state.since, saved)
    } catch (e) {
      state.outcome = 'error'
      console.error(LOG + 'ERROR dimension=' + dim + ' station=' +
        (state.station === undefined ? 'unresolved' : state.station) + ' rocket=' + id +
        ' stalledServerTicks=' + (tick - state.since) + ' reason=' + e)
    }
  }

  ServerEvents.tick(function (event) {
    var tick = Number(event.server.getTickCount())
    var groups = {}
    var players = event.server.getPlayers()
    for (var i = 0; i < players.size(); i++) {
      try {
        var player = players.get(i)
        var root = vehicle(player)
        if (root === null || root === undefined || !(root instanceof Rocket)) continue
        var id = uuid(root)
        if (!groups[id]) groups[id] = { id: id, rocket: root, riders: [] }
        groups[id].riders.push(player)
      } catch (e) {
        if (!discoveryError) {
          discoveryError = true
          console.error(LOG + 'ERROR rider discovery: ' + e)
        }
      }
    }
    Object.keys(A.states).forEach(function (id) {
      if (!groups[id]) {
        resetWindow(A.states[id])
        A.states[id].launchTick = null
        A.states[id].launchStarted = null
      }
    })
    Object.keys(groups).forEach(function (id) {
      try {
        inspect(groups[id], tick)
      } catch (e) {
        var state = A.states[id] || (A.states[id] = fresh('unresolved'))
        if (!state.handled) {
          state.handled = true
          state.outcome = 'error'
          console.error(LOG + 'ERROR rocket=' + id + ' reason=' + e)
        }
      }
    })
  })
})()
