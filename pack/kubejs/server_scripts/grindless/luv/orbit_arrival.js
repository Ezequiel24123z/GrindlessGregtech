// GCYR 0.2.9: recover one stalled, occupied arrival, only in G.orbits dimensions.
// Authorization is the rocket's retained control + its selected native station record + deployed
// physical column, NOT ownership, a default/nearest station, a new platform or thermal immunity.
// Native pairing restores the existing root's spawn/block/seat data; no second ticking tracker.
// SUCCESS means verified server correction/sync dispatch, NOT proof of later native landing or
// client mount recovery. Those require subsequent real collision and client readback.
// Rhino: var inside repeated callbacks; pinned overloads; no reflection or catch-and-retry moves.
(function () {
  var G = global.grindless
  var A = G.orbitArrival = {}
  A.dimensions = G.orbits.dimensions.slice()
  A.minimumY = 550
  A.stallTicks = 40
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
  // the SRG alias after that exception. Only an absent method permits the next name.
  function invoke(object, names, args) {
    for (var i = 0; i < names.length; i++) {
      var method = object[names[i]]
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
      Height: Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types'),
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
  function launching(rocket) {
    var data = invoke(rocket, ['getEntityData', 'm_20088_'])
    var started = invoke(data, [
      'get(net.minecraft.network.syncher.EntityDataAccessor)',
      'm_135370_(net.minecraft.network.syncher.EntityDataAccessor)'
    ], [Rocket.ROCKET_STARTED])
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
    return invoke(bounds, ['move(double,double,double)', 'm_82386_(double,double,double)'], [0, dy, 0])
  }
  function dimension(level) { return String(level.getDimensionKey().location()) }
  function has(tag, key, type) {
    return invoke(tag, ['contains(java.lang.String,int)', 'm_128425_(java.lang.String,int)'], [key, type])
  }
  function compound(tag, key) {
    return invoke(tag, ['getCompound(java.lang.String)', 'm_128469_(java.lang.String)'], [key])
  }
  function intTag(tag, key) {
    return Number(invoke(tag, ['getInt(java.lang.String)', 'm_128451_(java.lang.String)'], [key]))
  }
  function noCollision(level, entity, bounds) {
    return invoke(level, [
      'noCollision(net.minecraft.world.entity.Entity,net.minecraft.world.phys.AABB)',
      'm_45756_(net.minecraft.world.entity.Entity,net.minecraft.world.phys.AABB)'
    ], [entity, bounds])
  }
  function resetFall(entity) { invoke(entity, ['resetFallDistance', 'm_183634_']) }
  function zeroMotion(entity) {
    invoke(entity, ['setDeltaMovement(net.minecraft.world.phys.Vec3)', 'm_20256_(net.minecraft.world.phys.Vec3)'],
      [java().Vec3.ZERO])
  }
  function positionRider(rocket, player) {
    invoke(rocket, ['positionRider(net.minecraft.world.entity.Entity)', 'm_7332_(net.minecraft.world.entity.Entity)'], [player])
  }
  function send(player, packet) {
    invoke(player.connection, ['send(net.minecraft.network.protocol.Packet)', 'm_9829_(net.minecraft.network.protocol.Packet)'], [packet])
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
    return { dimension: dimension, tick: null, y: null, since: null, handled: false }
  }

  function resetWindow(state) {
    state.tick = null
    state.y = null
    state.since = null
  }

  function readTarget(rocket, level, dim) {
    var j = java()
    var saved = invoke(rocket, ['saveWithoutId(net.minecraft.nbt.CompoundTag)', 'm_20240_(net.minecraft.nbt.CompoundTag)'], [new j.Tag()])
    need(has(saved, 'config', 10), 'missing typed config inventory')
    var config = compound(saved, 'config')
    need(has(config, 'Size', 3) && intTag(config, 'Size') === 1, 'malformed config inventory size')
    need(has(config, 'Items', 9), 'missing typed config.Items list')
    var items = invoke(config, ['getList(java.lang.String,int)', 'm_128437_(java.lang.String,int)'], ['Items', 10])
    var entry = null
    for (var i = 0; i < items.size(); i++) {
      var candidate = invoke(items, ['getCompound(int)', 'm_128728_(int)'], [i])
      need(has(candidate, 'Slot', 3), 'missing/malformed config slot index')
      if (intTag(candidate, 'Slot') === 0) {
        need(entry === null, 'ambiguous config slot 0')
        entry = candidate
      }
    }
    need(entry !== null, 'missing actual config slot 0')
    need(has(entry, 'id', 8) && has(entry, 'Count', 1) && has(entry, 'tag', 10), 'malformed control stack entry')
    var stack = invoke(j.Stack, ['of(net.minecraft.nbt.CompoundTag)', 'm_41712_(net.minecraft.nbt.CompoundTag)'], [entry])
    need(!stack.isEmpty(), 'empty config control')
    var controlId = String(stack.getId())
    need(controlId === 'gcyr:id_chip' || controlId === 'gcyr:keycard', 'not a station control')
    var chip = controlId === 'gcyr:id_chip'
    need((chip ? j.Items.ID_CHIP : j.Items.KEYCARD)['isIn(net.minecraft.world.item.ItemStack)'](stack),
      'native control item mismatch')
    var tag = stack.getNbt()
    need(tag !== null && tag !== undefined && has(tag, 'gcyr:current_station', 3) &&
      has(tag, 'gcyr:current_planet', 8), 'missing typed selected station/planet')
    var id = intTag(tag, 'gcyr:current_station')
    need(finite(id) && id >= 0 && Math.floor(id) === id, 'invalid selected station id')
    var selected = chip ? j.Chip['getSpaceStationId(net.minecraft.world.item.ItemStack)'](stack) :
      j.Card['getSavedStation(net.minecraft.world.item.ItemStack)'](stack)
    need(selected !== null && selected !== undefined && Number(selected) === id, 'control station helper mismatch')
    // Chip uses WORLD id; keycard uses PLANET REGISTRY id. Their native helpers resolve these.
    var planet = chip ? j.Chip['getPlanetFromStack(net.minecraft.world.item.ItemStack)'](stack) :
      j.Card['getSavedPlanet(net.minecraft.world.item.ItemStack)'](stack)
    need(planet !== null && planet !== undefined && String(planet.orbitWorld().location()) === dim,
      'selected planet does not resolve to current orbit')
    var holder = j.Capability['getSpaceStations(net.minecraft.server.level.ServerLevel)'](level)
    need(holder !== null && holder !== undefined, 'missing native station holder')
    var station = holder['getStation(java.lang.Integer)'](j.Integer['valueOf(int)'](id))
    need(station !== null && station !== undefined, 'selected station record does not exist')
    var recordPlanet = station.orbitPlanet()
    var planetId = j.Planets['getPlanetId(argent_matter.gcyr.api.space.planet.Planet)'](planet)
    var recordId = recordPlanet === null || recordPlanet === undefined ? null :
      j.Planets['getPlanetId(argent_matter.gcyr.api.space.planet.Planet)'](recordPlanet)
    need(recordPlanet !== null && recordPlanet !== undefined &&
      String(recordPlanet.orbitWorld().location()) === dim &&
      planetId !== null && planetId !== undefined && recordId !== null && recordId !== undefined &&
      String(recordId) === String(planetId),
    'selected station record planet mismatch')
    var origin = holder['getStationWorldPos(int)'](id)
    need(origin !== null && origin !== undefined, 'missing native station world position')
    // Native chip position navigation overrides the station destination. Permit it ONLY when
    // the actual helper's orbit and column agree; saved Y is not the station's support height.
    if (chip && invoke(tag, ['contains(java.lang.String)', 'm_128441_(java.lang.String)'], ['gcyr:current_position'])) {
      need(has(tag, 'gcyr:current_position', 10), 'malformed saved position')
      var raw = compound(tag, 'gcyr:current_position')
      need(has(raw, 'X', 3) && has(raw, 'Y', 3) && has(raw, 'Z', 3), 'malformed saved position coordinates')
      var override = j.Chip['getSavedPosition(net.minecraft.world.item.ItemStack)'](stack)
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

  function landing(rocket, level, target) {
    var j = java()
    var old = point(rocket)
    need(old.every(finite), 'invalid root position')
    var x = Number(target.origin.getX())
    var z = Number(target.origin.getZ())
    // Native station arrivals use this column. Never move horizontally to rescue a stray rocket.
    need(Math.floor(old[0]) === x && Math.floor(old[2]) === z, 'rocket is not over its selected station column')
    var height = Number(invoke(level, [
      'getHeight(net.minecraft.world.level.levelgen.Heightmap$Types,int,int)',
      'm_6924_(net.minecraft.world.level.levelgen.Heightmap$Types,int,int)'
    ], [j.Height.WORLD_SURFACE, x, z]))
    need(finite(height) && height > Number(level.getMinBuildHeight()) &&
      height <= Number(level.getMaxBuildHeight()), 'no physical station column')
    var pos = new j.Pos(x, height - 1, z)
    var block = level.getBlockState(pos)
    need(!block.isAir(), 'no physical station column')
    var shape = invoke(block, [
      'getCollisionShape(net.minecraft.world.level.BlockGetter,net.minecraft.core.BlockPos,net.minecraft.world.phys.shapes.CollisionContext)',
      'm_60742_(net.minecraft.world.level.BlockGetter,net.minecraft.core.BlockPos,net.minecraft.world.phys.shapes.CollisionContext)'
    ], [level, pos, invoke(j.Context, ['of(net.minecraft.world.entity.Entity)', 'm_82750_(net.minecraft.world.entity.Entity)'], [rocket])])
    need(!shape.isEmpty(), 'highest column block has no collision support')
    var top = Number(invoke(shape, ['max(net.minecraft.core.Direction$Axis)', 'm_83297_(net.minecraft.core.Direction$Axis)'], [j.Axis.Y]))
    need(finite(top) && top > 0 && top <= 1, 'unsuitable column collision top')
    var oldBox = box(rocket)
    var floor = height - 1 + top
    var y = floor + old[1] - Number(oldBox.minY)
    need(finite(y) && y < old[1], 'correction is not straight down')
    var dy = y - old[1]
    var destinationBox = movedBox(oldBox, dy)
    clearBox(level, rocket, destinationBox, target.station.border())
    need(noCollision(level, rocket, movedBox(destinationBox, -0.0001)) === false, 'no actual collision support under root')
    return { old: old, oldFloor: Number(oldBox.minY), y: y, dy: dy, floor: floor }
  }

  function correct(rocket, riders, level, state, id, stalled) {
    var j = java()
    var target = readTarget(rocket, level, state.dimension)
    state.station = String(target.id)
    var plan = landing(rocket, level, target)
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
    invoke(rocket, ['teleportToWithTicket(double,double,double)', 'm_20324_(double,double,double)'],
      [plan.old[0], plan.y, plan.old[2]])
    var actual = point(rocket)
    need(actual.every(finite) && Math.abs(actual[0] - plan.old[0]) < 0.000001 &&
      Math.abs(actual[1] - plan.y) < 0.000001 && Math.abs(actual[2] - plan.old[2]) < 0.000001 &&
      Math.abs(Number(box(rocket).minY) - plan.floor) < 0.000001, 'root transport readback mismatch')
    clearBox(level, rocket, box(rocket), target.station.border())
    var type = invoke(rocket, ['getType', 'm_6095_'])
    var broadcast = function (packet) {
      for (var r = 0; r < riders.length; r++) send(riders[r], packet)
    }
    var pairing = new j.Pairing(level, rocket, Number(invoke(type, ['updateInterval', 'm_20682_'])),
      String(invoke(type, ['trackDeltas', 'm_20683_'])) === 'true', broadcast)
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
        'm_289200_(net.minecraft.server.level.ServerPlayer,java.util.function.Consumer)'
      ], [rider, deliver])
      var seat = point(rider)
      need(seat.every(finite), 'invalid native seat position')
      invoke(rider.connection, [
        'teleport(double,double,double,float,float)', 'm_9774_(double,double,double,float,float)'
      ], [seat[0], seat[1], seat[2], Number(rider.getYaw()), Number(rider.getPitch())])
      var restoredSeat = point(rider)
      need(restoredSeat.every(finite) && Math.abs(restoredSeat[0] - seat[0]) < 0.000001 &&
        Math.abs(restoredSeat[1] - seat[1]) < 0.000001 && Math.abs(restoredSeat[2] - seat[2]) < 0.000001,
      'rider connection seat readback mismatch')
      invoke(chunks, ['move(net.minecraft.server.level.ServerPlayer)', 'm_8385_(net.minecraft.server.level.ServerPlayer)'], [rider])
      invoke(rider.connection, ['resetPosition', 'm_9953_'])
      // Every direct player rider receives the native root packet; vanilla applies it only to
      // its locally controlled root. Pairing/passengers must arrive before this correction.
      send(rider, new j.VehiclePacket(rocket))
    }
    resetFall(rocket)
    zeroMotion(rocket)
    invoke(chunks, [
      'broadcastAndSend(net.minecraft.world.entity.Entity,net.minecraft.network.protocol.Packet)',
      'm_8394_(net.minecraft.world.entity.Entity,net.minecraft.network.protocol.Packet)'
    ], [rocket, new j.TeleportPacket(rocket)])
    var restored = association(riders, id)
    need(restored === original, 'restored rider association mismatch')
    state.outcome = 'corrected'
    console.info(LOG + 'SUCCESS dimension=' + state.dimension + ' station=' + target.id +
      ' rocket=' + id + ' stalledServerTicks=' + stalled + ' oldRoot=[' + plan.old.join(',') +
      '] newRoot=[' + actual.join(',') + '] oldBBoxFloor=' + plan.oldFloor +
      ' newBBoxFloor=' + Number(box(rocket).minY) + ' originalAssociation=' + original +
      ' restoredAssociation=' + restored + ' nativeLanding=unverified clientMount=unverified')
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
    var started = launching(rocket)
    if (started) {
      state.handled = false
      delete state.station
      delete state.outcome
      resetWindow(state)
      return
    }
    if (state.handled) return
    var y = coord(rocket, 'y')
    if (!finite(tick) || !finite(y) || y < A.minimumY) {
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
      correct(rocket, group.riders, level, state, id, tick - state.since)
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
      if (!groups[id]) resetWindow(A.states[id])
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
