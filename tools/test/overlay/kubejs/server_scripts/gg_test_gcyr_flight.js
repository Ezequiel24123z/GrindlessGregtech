// priority: -2124
// Gregtech Grindless - in-game test of the GCYR rocket flow (Gregicality Rocketry 0.2.9) and of GCYR issues #91 (the server
// freezes at the interplanetary teleport) and #122 (the Rocket Scanner does not capture the whole rocket).
// TEST-ONLY overlay: copied over the instance on the test PC, never shipped with the pack.
//
// HOW TO RUN
//   CLIENT suite = the full test: the real client, a real player, GCYR's own launch, teleport and landing.
//     The test sleeps unless the instance has kubejs/config/gg_test_gcyr_flight.json = {"enabled": true}. Run the harness with
//     an overlay folder that is a copy of tools\test\overlay plus that file:
//       powershell -File tools\test\Invoke-GGTest.ps1 -Suite client -OverlayDir <copy of tools\test\overlay + kubejs\config\gg_test_gcyr_flight.json>
//     It starts by itself when the player joins the world that mc-runtime-test creates. The client half
//     (client_scripts/gg_test_gcyr_flight.js) keeps mc-runtime-test in the world until GGTEST|gcyr_flight|DONE (it holds the
//     player's tick counter below the 100 ticks mc-runtime-test waits before quitting), clicks the planet on GCYR's planet
//     screen, holds Space to brake the landings like a player must, takes screenshots into kubejs/exported/ and reports an
//     integrated server that stops ticking.
//   SERVER suite = no player: registries, planets, fuel and the Rocket Scanner part (#122) only; the flight is skipped.
//       -Commands 'kubejs custom_command gg_test_gcyr_flight' -WaitForLog 'GGTEST\|gcyr_flight\|DONE@@600'
//
// MARKERS: GGTEST|gcyr_flight|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|gcyr_flight|DONE
//   mod, registry, planets, dimensions, fuel_recipes, config      what GCYR brings and how it is set up
//   scanner:<key>:formed / build_<n> / unbuild_<n>                 #122: the scanner forms and captures EVERY block of the rocket,
//       keys sym_* (3-wide pad, every facing, 3 build/unbuild cycles each), grow (formed with a 2-frame tower, then the tower and
//       the rocket grow: stale_build = GCYR as is (NOTE), fixed_build = after the right-click on the controller that a player always
//       does to press "Build", which the pack hooks), asym_* (pad 1 block on one side and 2 on the other, every facing: formed and
//       gcyr_build describe GCYR as is (NOTE), guard = the pack refuses the right-click), flight (the flight rocket)
//   flight_*                                                        #91: the flight with the real player, see FLIGHT below
//   DONE
//
// TEST AREA: this test builds, force-loads and clears ONLY its band of the overworld, X 2560-2623, Y 98-112, Z 0-15 (floor at
// Y 98, launch pads at Y 99, controllers at Y 100). The flight also clears the air column above its scanner (X 2599-2603,
// Z 8-14, Y 113-319) because the client world has a random seed, then flies to gcyr:luna and back.
//
// FLIGHT (client suite): the player gets the space suit (16 buckets of oxygen in the chestplate: GCYR 0.2.9 lets a suit without
// oxygen drown on the Moon) and an ID chip, right-clicks the flight scanner, the scanner builds
// the rocket (6 basic motors, 2 basic fuel tanks, 1 seat: thrust 24 - weight 19 = 5 blocks/tick), the chip is programmed on
// GCYR's planet screen (client click), the chip and 10 buckets of gtceu:rocket_fuel go into the rocket (rocket NBT, the same
// fields the rocket's own UI slot and tank write), the player right-clicks the rocket to sit, the test calls startRocket() (what
// the rocket UI's Launch button calls), GCYR counts down 200 ticks, climbs and at Y 600 moves rocket and player with its own
// code (PlatformUtils.changeDimension). The test checks the player is in gcyr:luna still riding one rocket, that the
// integrated server kept ticking, that the landing (Space held) does not crash, the suit on the Moon, then the trip home. It
// also reports when the player catches fire and every hit it takes (flight_fire, flight_damage_*), and checks that the rider
// never burns: GCYR's climbing rocket burns what is under it and can catch its own rider (flight_rider_fire_*; the pack's fix is
// server_scripts/grindless/space/rocket_riders.js).
//
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'gcyr_flight'
  var BAND = { x0: 2560, x1: 2623, y0: 98, y1: 112, z0: 0, z1: 15 }
  var FLOOR_Y = 98
  var PAD_Y = 99
  var CTRL_Y = 100
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestGcyrFlightRequest'
  var MARKER = 'kubejs/config/gg_test_gcyr_flight.json'
  var FORM_TIMEOUT = 400
  var TEST_TIMEOUT = 20 * 60 * 20
  var AGAIN = -1
  var STOP = -2

  var IDS = {
    pad: 'gcyr:launch_pad',
    frame: 'gtceu:stainless_steel_frame',
    scanner: 'gcyr:rocket_scanner',
    seat: 'gcyr:seat',
    tank: 'gcyr:basic_fuel_tank',
    motor: 'gcyr:basic_rocket_motor',
    chip: 'gcyr:id_chip',
    fuel: 'gtceu:rocket_fuel',
    rocket: 'gcyr:rocket',
    moonPlanet: 'gcyr:luna',
    earthPlanet: 'gcyr:earth',
    moonDim: 'gcyr:luna',
    earthDim: 'minecraft:overworld',
    suit: { HEAD: 'gcyr:space_helmet', CHEST: 'gcyr:space_chestplate', LEGS: 'gcyr:space_leggings', FEET: 'gcyr:space_boots' }
  }
  var FUEL_LOAD = 10000
  var SUIT_OXYGEN = 16000

  var S = null
  var FL = null
  var J = null
  var TICK = { last: 0, max: 0, gaps: [] }

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(check, status, detail) {
    var line = TAG + SCOPE + '|' + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  // ---------------------------------------------------------------- Java and shared state

  function lazy() {
    if (J !== null) return J
    J = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Forge: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
      Direction: Java.loadClass('net.minecraft.core.Direction'),
      AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
      Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
      BlockHitResult: Java.loadClass('net.minecraft.world.phys.BlockHitResult'),
      Hand: Java.loadClass('net.minecraft.world.InteractionHand'),
      Slot: Java.loadClass('net.minecraft.world.entity.EquipmentSlot'),
      ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
      CompoundTag: Java.loadClass('net.minecraft.nbt.CompoundTag'),
      ListTag: Java.loadClass('net.minecraft.nbt.ListTag'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      ForgeHooks: Java.loadClass('net.minecraftforge.common.ForgeHooks'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      ArchPlatform: Java.loadClass('dev.architectury.platform.Platform'),
      Rocket: Java.loadClass('argent_matter.gcyr.common.entity.RocketEntity'),
      PlanetData: Java.loadClass('argent_matter.gcyr.data.loader.PlanetData'),
      GCYRConfig: Java.loadClass('argent_matter.gcyr.config.GCYRConfig'),
      RecipeTypes: Java.loadClass('argent_matter.gcyr.common.data.GCYRRecipeTypes')
    }
    return J
  }

  // a Java map shared with client_scripts/gg_test_gcyr_flight.js (both halves run in the same JVM in the client suite);
  // ConcurrentHashMap because the integrated server thread writes while the render thread reads
  function shared() {
    if (!global.ggGcyrFlight) global.ggGcyrFlight = new (Java.loadClass('java.util.concurrent.ConcurrentHashMap'))()
    return global.ggGcyrFlight
  }

  function sval(key) {
    var v = shared().get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function asArray(coll) {
    var list = new (lazy().ArrayList)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new (lazy().RL)(id)
  }

  // KubeJS renames some vanilla members for scripts (@Shadow @RemapForJS in its mixins, merged into the vanilla classes):
  // Entity.getStringUUID -> getStringUuid, Entity.tickCount -> age, Player.closeContainer -> closeMenu, ItemStack.getTag -> getNbt,
  // Entity.getPassengers and Entity.level are hidden. The vanilla name of a renamed member does not exist in JS, so the tables
  // list the KubeJS name first, then the Mojang name, then the SRG name (Rhino's mm.jsmappings); uses on a player or an item
  // entity also keep a fallback (KubeJS's own wrappers, the entity id in toString(), the rocket's first passenger, a command).
  var V = {
    uuid: ['getStringUuid', 'getStringUUID', 'm_20149_'],
    vehicle: ['getVehicle', 'm_20202_'],
    firstPassenger: ['getFirstPassenger', 'm_146895_'],
    x: ['getX', 'm_20185_'],
    y: ['getY', 'm_20186_'],
    z: ['getZ', 'm_20189_'],
    discard: ['discard', 'm_146870_'],
    blockPosition: ['blockPosition', 'm_20183_'],
    startRiding: ['startRiding', 'm_20329_'],
    interactOn: ['interactOn', 'm_36157_'],
    interact: ['interact', 'm_6096_'],
    closeContainer: ['closeMenu', 'closeContainer', 'm_6915_'],
    gameMode: ['gameMode', 'f_8941_'],
    useItemOn: ['useItemOn', 'm_7179_'],
    useItem: ['useItem', 'm_6261_'],
    itemUse: ['use', 'm_7203_'],
    stateUse: ['use', 'm_60664_'],
    blockState: ['getBlockState', 'm_8055_'],
    stackItem: ['getItem', 'm_41720_'],
    gameModeForPlayer: ['getGameModeForPlayer', 'm_9290_'],
    count: ['getCount', 'm_41613_'],
    copy: ['copy', 'm_41777_'],
    save: ['save', 'm_41739_'],
    orCreateTag: ['getOrCreateTag', 'm_41784_'],
    tag: ['getNbt', 'getTag', 'm_41783_'],
    getString: ['getString', 'm_128461_'],
    getBoolean: ['getBoolean', 'm_128471_'],
    getList: ['getList', 'm_128437_'],
    putInt: ['putInt', 'm_128405_'],
    putString: ['putString', 'm_128359_'],
    put: ['put', 'm_128365_'],
    listSize: ['size'],
    listCompound: ['getCompound', 'm_128728_'],
    textString: ['getString', 'm_130668_']
  }

  function jcall(obj, names, args) {
    var a = args || []
    for (var i = 0; i < names.length; i++) {
      var n = names[i]
      if (typeof obj[n] !== 'function') continue
      switch (a.length) {
        case 0: return obj[n]()
        case 1: return obj[n](a[0])
        case 2: return obj[n](a[0], a[1])
        case 3: return obj[n](a[0], a[1], a[2])
        case 4: return obj[n](a[0], a[1], a[2], a[3])
        default: return obj[n](a[0], a[1], a[2], a[3], a[4])
      }
    }
    throw new Error('no method ' + names.join('/') + ' on ' + obj)
  }

  // a field that shares its JS name with a method comes back as one callable object (Rhino's FieldAndMethods); numbers are read
  // through Number()
  function jget(obj, names) {
    for (var i = 0; i < names.length; i++) {
      var v = obj[names[i]]
      if (v === undefined || v === null) continue
      if (typeof v !== 'function') return v
      var n = Number(v)
      if (!isNaN(n)) return n
    }
    throw new Error('no field ' + names.join('/') + ' on ' + obj)
  }

  // which members this Rhino shows on an object (once per label)
  var PROBED = {}
  function probe(label, obj) {
    if (PROBED[label]) return
    PROBED[label] = true
    var keys = []
    try {
      for (var k in obj) keys.push(String(k))
    } catch (e) {
      keys.push('(for-in failed: ' + e + ')')
    }
    var want = /uuid|vehicle|passenger|^getY$|^y$|gameMode|interactOn|startRiding|discard|closeContainer/i
    var types = ['getStringUuid', 'getStringUUID', 'getVehicle', 'getY', 'gameMode', 'interactOn', 'closeMenu', 'discard', 'getProfile', 'age'].map(function (n) {
      var t = ''
      try { t = typeof obj[n] } catch (e) { t = 'throws' }
      return n + ':' + t
    })
    note('probe_' + label, keys.length + ' members; ' + types.join(' ') + '; matching: ' + keys.filter(function (x) { return want.test(x) }).sort().join(' '))
  }

  // the entity id from Entity.toString(): "ItemEntity['Seat'/1234, l='ServerLevel[world]', x=.., y=.., z=..]"
  function entityId(e) {
    var m = /\/(-?\d+), l=/.exec(String(e))
    return m ? m[1] : String(e)
  }

  function uuidOf(e) {
    try {
      return String(jcall(e, V.uuid))
    } catch (err) {
      if (e.isPlayer()) return profileId(e)
      return 'entity#' + entityId(e)
    }
  }

  // KubeJS's EntityKJS.getBlock (the block the entity stands in) when Entity.getX/Y/Z do not resolve
  function coordOf(e, axis) {
    try {
      return Number(jcall(e, V[axis]))
    } catch (err) {
      return Number(e.getBlock()[axis]) + (axis === 'y' ? 0 : 0.5)
    }
  }

  function xOf(e) {
    return coordOf(e, 'x')
  }

  function yOf(e) {
    return coordOf(e, 'y')
  }

  function zOf(e) {
    return coordOf(e, 'z')
  }

  function killItems(x0, y0, z0, x1, y1, z1) {
    return S.server.runCommandSilent('kill @e[type=minecraft:item,x=' + x0 + ',y=' + y0 + ',z=' + z0 + ',dx=' + (x1 - x0) + ',dy=' + (y1 - y0) + ',dz=' + (z1 - z0) + ']')
  }

  function itemLabel(e) {
    try {
      var st = e.getItem()
      return String(st.getId()) + ' x' + jcall(st, V.count)
    } catch (err) {
      return String(e).substring(0, 40)
    }
  }

  // KubeJS adds getLevel(ResourceLocation) next to the vanilla getLevel(ResourceKey): a ResourceKey argument is ambiguous for
  // Rhino, a dimension id string is not
  function levelOf(id) {
    return S.server.getLevel(String(id))
  }

  // KubeJS's own wrappers (EntityKJS.getLevel, LevelKJS.getDimension)
  function dimOf(entity) {
    return String(entity.getLevel().getDimension())
  }

  function blockId(block) {
    return String(lazy().Forge.BLOCKS.getKey(block))
  }

  function setBlock(p, id) {
    S.level.getBlock(p.x, p.y, p.z).set(id)
  }

  function idAt(p) {
    return String(S.level.getBlock(p.x, p.y, p.z).getId())
  }

  function key(x, y, z) {
    return x + ',' + y + ',' + z
  }

  // the player is matched by its GameProfile (authlib, not obfuscated) through KubeJS's PlayerKJS.getProfile
  function profileId(p) {
    return String(p.getProfile().getId())
  }

  function testPlayer() {
    if (!S || S.playerUuid === null) return null
    var list = asArray(S.server.getPlayers())
    for (var i = 0; i < list.length; i++) {
      if (profileId(list[i]) === S.playerUuid) return list[i]
    }
    return null
  }

  function enabledByMarker() {
    try {
      var m = JsonIO.read(MARKER)
      return m !== null && m !== undefined && String(m.get('enabled')) === 'true'
    } catch (e) {
      return false
    }
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    var L = lazy()
    var version = 'unknown'
    try {
      version = String(L.ArchPlatform.getMod('gcyr').getVersion())
    } catch (e) {
      version = 'unreadable (' + e + ')'
    }
    check('mod', true, 'gcyr ' + version + ' loaded (pack pins 0.2.9)')

    var missing = []
    var blocks = [IDS.pad, IDS.seat, IDS.tank, IDS.motor, IDS.frame, IDS.scanner, 'gcyr:advanced_fuel_tank', 'gcyr:elite_fuel_tank',
      'gcyr:advanced_rocket_motor', 'gcyr:elite_rocket_motor']
    var items = [IDS.chip, 'gcyr:keycard', IDS.suit.HEAD, IDS.suit.CHEST, IDS.suit.LEGS, IDS.suit.FEET]
    blocks.forEach(function (id) { if (!L.Forge.BLOCKS.containsKey(rl(id))) missing.push('block ' + id) })
    items.forEach(function (id) { if (!L.Forge.ITEMS.containsKey(rl(id))) missing.push('item ' + id) })
    if (!L.Forge.ENTITY_TYPES.containsKey(rl(IDS.rocket))) missing.push('entity ' + IDS.rocket)
    if (!L.Forge.FLUIDS.containsKey(rl(IDS.fuel))) missing.push('fluid ' + IDS.fuel)
    var def = L.GTRegistries.MACHINES.get(rl(IDS.scanner))
    if (def === null || def === undefined) missing.push('machine ' + IDS.scanner)
    check('registry', missing.length === 0, missing.length > 0 ? 'missing: ' + missing.join(', ') :
      blocks.length + ' blocks, ' + items.length + ' items, entity ' + IDS.rocket + ', fluid ' + IDS.fuel + ' and machine ' + IDS.scanner + ' registered')

    var moon = L.PlanetData.getPlanet(rl(IDS.moonPlanet))
    var earth = L.PlanetData.getPlanet(rl(IDS.earthPlanet))
    var planets = asArray(L.PlanetData.planets().keySet()).map(function (k) { return String(k) }).sort()
    function describe(p) {
      if (p === null || p === undefined) return 'missing'
      return 'world=' + p.level().location() + ' orbit=' + p.orbitWorld().location() +
        ' parent=' + (p.parentWorld() === null || p.parentWorld() === undefined ? 'none' : p.parentWorld().location()) +
        ' rocket_tier=' + p.rocketTier() + ' gravity=' + p.gravity() + ' oxygen=' + p.hasOxygen() + ' temperature=' + p.temperature() + 'K'
    }
    check('planets', moon !== null && moon !== undefined && String(moon.level().location()) === IDS.moonDim && earth !== null && earth !== undefined,
      'moon (' + IDS.moonPlanet + '): ' + describe(moon) + '; earth (' + IDS.earthPlanet + '): ' + describe(earth) + '; planets: ' + planets.join(' '))

    var dims = [IDS.moonDim, 'gcyr:luna_orbit', 'gcyr:overworld_orbit', 'gcyr:mars', 'gcyr:black_hole_orbit']
    var dimState = dims.map(function (d) { return d + '=' + (levelOf(d) !== null && levelOf(d) !== undefined ? 'yes' : 'NO') })
    check('dimensions', levelOf(IDS.moonDim) !== null && levelOf(IDS.moonDim) !== undefined, dimState.join(' '))

    var fuels = []
    try {
      var recipes = asArray(S.server.getRecipeManager().getAllRecipesFor(L.RecipeTypes.ROCKET_FUEL_RECIPES))
      fuels = recipes.map(function (r) { return String(r.getId()) + '(duration ' + r.duration + ')' }).sort()
    } catch (e) {
      fuels = ['unreadable: ' + e]
    }
    check('fuel_recipes', fuels.some(function (f) { return f.indexOf('gcyr:rocket_fuel/rocket_fuel(') === 0 }),
      fuels.length + ' recipes of type gcyr:rocket_fuel: ' + fuels.join(' ') + ' (a fluid is a fuel if one of these takes it; the test flies on gtceu:rocket_fuel)')

    var cfg = L.GCYRConfig.INSTANCE
    note('config', 'enableOxygen=' + cfg.server.enableOxygen + ' moonFuelAmount=' + cfg.rocket.moonFuelAmount + ' solarSystemFuelAmount=' +
      cfg.rocket.solarSystemFuelAmount + ' doCrashLandingExplosion=' + cfg.rocket.doCrashLandingExplosion + ' (fuel amounts are what the tank must HOLD to launch)')
  }

  // ---------------------------------------------------------------- scanner geometry

  // rockets: lists of { b: row behind the controller (1..b), s: column (-l..r, + = controller's right), y: layer above the pad, id }
  function smallRocket(sp) {
    return [
      { b: 1, s: -sp.l, y: 0, id: IDS.motor },
      { b: sp.b, s: sp.r, y: 0, id: IDS.motor },
      { b: 2, s: 0, y: 0, id: IDS.motor },
      { b: 2, s: 0, y: 1, id: IDS.tank },
      { b: 2, s: 0, y: 2, id: IDS.seat }
    ]
  }

  // the grow scenario: one tank more and the seat one layer higher, so the seat stands on a block the stale scan takes
  function grownRocket(sp) {
    return [
      { b: 1, s: -sp.l, y: 0, id: IDS.motor },
      { b: sp.b, s: sp.r, y: 0, id: IDS.motor },
      { b: 2, s: 0, y: 0, id: IDS.motor },
      { b: 2, s: 0, y: 1, id: IDS.tank },
      { b: 2, s: 0, y: 2, id: IDS.tank },
      { b: 2, s: 0, y: 3, id: IDS.seat }
    ]
  }

  function flightRocket(sp) {
    var out = []
    for (var b = 1; b <= 2; b++) {
      for (var s = -1; s <= 1; s++) out.push({ b: b, s: s, y: 0, id: IDS.motor })
    }
    out.push({ b: 1, s: 0, y: 1, id: IDS.tank })
    out.push({ b: 2, s: 0, y: 1, id: IDS.tank })
    out.push({ b: 1, s: 0, y: 2, id: IDS.seat })
    return out
  }

  var SPECS = [
    { key: 'sym_north', facing: 'north', x: 2562, z: 1, l: 1, r: 1, b: 3, h: 2, rocket: smallRocket, cycles: 3 },
    { key: 'sym_south', facing: 'south', x: 2570, z: 1, l: 1, r: 1, b: 3, h: 2, rocket: smallRocket, cycles: 3 },
    { key: 'sym_east', facing: 'east', x: 2578, z: 1, l: 1, r: 1, b: 3, h: 2, rocket: smallRocket, cycles: 3 },
    { key: 'sym_west', facing: 'west', x: 2588, z: 1, l: 1, r: 1, b: 3, h: 2, rocket: smallRocket, cycles: 3 },
    { key: 'grow', facing: 'north', x: 2598, z: 1, l: 1, r: 1, b: 3, h: 2, rocket: smallRocket, grow: true },
    { key: 'asym_north', facing: 'north', x: 2562, z: 9, l: 1, r: 2, b: 3, h: 2, rocket: smallRocket },
    { key: 'asym_south', facing: 'south', x: 2570, z: 9, l: 1, r: 2, b: 3, h: 2, rocket: smallRocket },
    { key: 'asym_east', facing: 'east', x: 2578, z: 9, l: 1, r: 2, b: 3, h: 2, rocket: smallRocket },
    { key: 'asym_west', facing: 'west', x: 2588, z: 9, l: 1, r: 2, b: 3, h: 2, rocket: smallRocket },
    { key: 'flight', facing: 'north', x: 2600, z: 9, l: 1, r: 1, b: 3, h: 2, rocket: flightRocket, flight: true }
  ]

  // the controller faces F; launch pad rows go to the back (b = 1..sp.b, one block lower), columns run from sp.l blocks to the
  // controller's left (F counter-clockwise, as GCYR measures lDist) to sp.r blocks to its right, the stainless steel frame tower
  // stands behind the last row. sp.x / sp.z is the north-west corner of the footprint. The steps are plain JS: this KubeJS does not
  // find Direction.getStepX / getStepZ.
  var STEPS = { north: { x: 0, z: -1 }, south: { x: 0, z: 1 }, east: { x: 1, z: 0 }, west: { x: -1, z: 0 } }
  var OPPOSITE = { north: 'south', south: 'north', east: 'west', west: 'east' }
  var CLOCKWISE = { north: 'east', east: 'south', south: 'west', west: 'north' }

  function geometry(sp) {
    var L = lazy()
    var F = L.Direction.byName(sp.facing)
    var back = STEPS[OPPOSITE[sp.facing]]
    var right = STEPS[CLOCKWISE[sp.facing]]
    function cell(b, s) {
      return { x: back.x * b + right.x * s, z: back.z * b + right.z * s }
    }
    var minx = 1e9
    var minz = 1e9
    var maxx = -1e9
    var maxz = -1e9
    for (var b = 0; b <= sp.b + 1; b++) {
      for (var s = -sp.l; s <= sp.r; s++) {
        var c = cell(b, s)
        minx = Math.min(minx, c.x)
        minz = Math.min(minz, c.z)
        maxx = Math.max(maxx, c.x)
        maxz = Math.max(maxz, c.z)
      }
    }
    var C = { x: sp.x - minx, y: CTRL_Y, z: sp.z - minz }
    return {
      F: F,
      C: C,
      box: { x0: sp.x, z0: sp.z, x1: sp.x + (maxx - minx), z1: sp.z + (maxz - minz) },
      at: function (b, s, y) {
        var c = cell(b, s)
        return { x: C.x + c.x, y: C.y + y, z: C.z + c.z }
      }
    }
  }

  function machineAt(p) {
    return lazy().MetaMachine.getMachine(S.level, new BlockPos(p.x, p.y, p.z))
  }

  function areaBox(m, extraUp) {
    var b = m.g.box
    return new (lazy().AABB)(b.x0 - 1, PAD_Y, b.z0 - 1, b.x1 + 2, CTRL_Y + 8 + (extraUp || 0), b.z1 + 2)
  }

  function rocketsIn(level, aabb) {
    return asArray(level.getEntitiesOfClass(lazy().Rocket, aabb)).filter(function (e) { return !e.isRemoved() })
  }

  function itemsIn(m) {
    return asArray(S.level.getEntitiesOfClass(lazy().ItemEntity, areaBox(m, 4))).filter(function (e) { return !e.isRemoved() })
  }

  // world position -> block id of what the rocket entity carries
  function capturedMap(r) {
    var origin = jcall(r, V.blockPosition)
    var out = {}
    asArray(r.getBlocks()).forEach(function (pws) {
      var p = pws.pos()
      out[key(origin.getX() + p.getX(), origin.getY() + p.getY(), origin.getZ() + p.getZ())] = blockId(pws.state().getBlock())
    })
    return out
  }

  function expectedMap(m) {
    var out = {}
    m.rocketBlocks.forEach(function (bl) {
      var p = m.g.at(bl.b, bl.s, bl.y)
      out[key(p.x, p.y, p.z)] = bl.id
    })
    return out
  }

  function placeRocket(m) {
    m.rocketBlocks.forEach(function (bl) { setBlock(m.g.at(bl.b, bl.s, bl.y), bl.id) })
  }

  function placeStructure(m) {
    var sp = m.spec
    for (var b = 1; b <= sp.b; b++) {
      for (var s = -sp.l; s <= sp.r; s++) setBlock(m.g.at(b, s, -1), IDS.pad)
    }
    for (var k = 0; k < sp.h; k++) setBlock(m.g.at(sp.b + 1, 0, k), IDS.frame)
    placeRocket(m)
    // the controller last, so its first structure check already sees the whole structure
    S.level.getBlock(m.g.C.x, m.g.C.y, m.g.C.z).set(IDS.scanner, { facing: sp.facing })
    var mach = machineAt(m.g.C)
    if (mach !== null && mach !== undefined && String(mach.getFrontFacing()) !== sp.facing) mach.setFrontFacing(m.g.F)
  }

  // GCYR keeps the measured pad and tower in persisted machine fields (lDist, rDist, bDist, hDist); read them from the NBT
  function persistedDims(mach) {
    var found = {}
    function walk(tag, depth) {
      if (depth > 6 || tag === null || tag === undefined) return
      var keys = asArray(tag.getAllKeys())
      keys.forEach(function (k) {
        var name = String(k)
        if (name === 'lDist' || name === 'rDist' || name === 'bDist' || name === 'hDist') {
          found[name] = tag.getInt(name)
        } else if (tag.getTagType(name) === 10) {
          walk(tag.getCompound(name), depth + 1)
        }
      })
    }
    try {
      walk(mach.holder.self().saveWithoutMetadata(), 0)
    } catch (e) {
      return 'unreadable (' + e + ')'
    }
    var names = ['lDist', 'rDist', 'bDist', 'hDist']
    return names.map(function (n) { return n + '=' + (found[n] === undefined ? '?' : found[n]) }).join(' ')
  }

  function rocketSummary(r) {
    var tag = r.saveWithoutId(new (lazy().CompoundTag)())
    var fuel = tag.getCompound('fuel')
    var speed = Number(r.getRocketSpeed())
    return 'blocks=' + r.getBlocks().size() + ' seats=' + r.getSeatPositions().size() + ' thrusters=' + r.getThrusterCount() +
      ' weight=' + r.getWeight() + ' speed=' + speed.toFixed(2) + ' fuel=' + (fuel.getString('FluidName') || 'none') + ' ' +
      fuel.getInt('Amount') + '/' + r.getFuelCapacity() + ' mB'
  }

  // ---------------------------------------------------------------- scanner steps (#122)

  // the asymmetric pads: what GCYR does is described (NOTE), what decides PASS/FAIL is the pack's guard
  function stepWaitFormed(m) {
    var mach = machineAt(m.g.C)
    var asym = m.spec.l !== m.spec.r
    var name = 'scanner:' + m.key + ':formed'
    var shape = 'pad ' + m.spec.l + ' left + ' + m.spec.r + ' right x ' + m.spec.b + ' rows, ' + m.spec.h + ' frames'
    if (mach === null || mach === undefined) {
      check(name, false, 'no machine at the controller ' + key(m.g.C.x, m.g.C.y, m.g.C.z) + ' (block ' + idAt(m.g.C) + ')')
      return STOP
    }
    if (mach.isFormed()) {
      m.formed = true
      m.formedAfter = S.t - m.t0
      emit(name, asym ? 'NOTE' : 'PASS', 'facing ' + mach.getFrontFacing() + ' formed after ' + m.formedAfter + ' ticks; ' + shape + '; GCYR measured ' + persistedDims(mach))
      return 1
    }
    if (S.t - m.t0 >= FORM_TIMEOUT) {
      m.formed = false
      var detail = 'not formed after ' + (S.t - m.t0) + ' ticks facing ' + mach.getFrontFacing() + ' (' + shape + '); GCYR measured ' + persistedDims(mach)
      if (asym) {
        note(name, detail + ' - GCYR lays the pad out mirrored in its pattern, so an asymmetric pad never forms facing north/south')
        return 1
      }
      check(name, false, detail)
      return STOP
    }
    return AGAIN
  }

  // the pack refuses the right-click on a scanner whose pad is asymmetric (server_scripts/grindless/space/rocket_scanner.js)
  function stepGuard(m) {
    var name = 'scanner:' + m.key + ':guard'
    var p = testPlayer()
    try {
      if (p !== null) {
        var res = rightClickBlock(p, m.g.C, m.g.F)
        var menu = String(p.getOpenInventory())
        var refused = menu.indexOf('InventoryMenu') >= 0
        check(name, refused, (refused ? 'the right-click is refused (no scanner UI, so no "Build"), the player gets the message' :
          'the scanner UI opened: "Build" can be pressed on this asymmetric pad') + '; result ' + res + ', menu ' + menu.substring(0, 80))
        closeMenu(p)
      } else if (global.grindless && global.grindless.space && global.grindless.space.rocketScannerPadSides) {
        var sides = global.grindless.space.rocketScannerPadSides(S.level, m.g.C.x, m.g.C.y, m.g.C.z, m.spec.facing)
        var seen = sides !== null && sides.left !== sides.right
        check(name, seen, 'the pack sees ' + (sides === null ? 'no pad' : sides.left + ' left / ' + sides.right + ' right') + (seen ? ' and refuses the right-click' : ''))
      } else {
        check(name, false, 'no player and no global.grindless.space.rocketScannerPadSides: nothing stops "Build" on this pad')
      }
    } catch (e) {
      check(name, false, 'exception: ' + e)
    }
    return 2
  }

  function stepBuild(label) {
    return function (m) {
      if (m.formed === false) return 1
      m.itemsBefore = {}
      itemsIn(m).forEach(function (e) { m.itemsBefore[entityId(e)] = true })
      m.expected = expectedMap(m)
      // what the scanner UI's "Build" button runs on the server (RocketScannerMachine.handleDisplayClick -> setRocketBuilt(true))
      machineAt(m.g.C).setRocketBuilt(true)
      m.buildLabel = label
      return 5
    }
  }

  // compares the rocket entity with the blocks that were placed; mode 'check' = PASS/FAIL, 'stale' / 'mirror' = NOTE describing
  // GCYR as is
  function stepVerifyBuild(label, mode) {
    return function (m) {
      if (m.formed === false) return 1
      var name = 'scanner:' + m.key + ':' + label
      var rockets = rocketsIn(S.level, areaBox(m, 4))
      m.rocket = rockets.length > 0 ? rockets[0] : null
      var expected = m.expected
      var expN = Object.keys(expected).length
      var popped = itemsIn(m).filter(function (e) { return !m.itemsBefore[entityId(e)] }).map(itemLabel)
      var leftover = Object.keys(expected).filter(function (k) {
        var p = k.split(',')
        return String(S.level.getBlock(Number(p[0]), Number(p[1]), Number(p[2])).getId()) !== 'minecraft:air'
      })
      var captured = m.rocket !== null ? capturedMap(m.rocket) : {}
      var missing = Object.keys(expected).filter(function (k) { return captured[k] !== expected[k] })
      var extra = Object.keys(captured).filter(function (k) { return expected[k] === undefined })
      var ok = rockets.length === 1 && missing.length === 0 && extra.length === 0 && leftover.length === 0 && popped.length === 0
      var detail = 'rockets in the area=' + rockets.length + ', captured ' + (expN - missing.length) + '/' + expN + ' placed blocks' +
        (missing.length > 0 ? ', NOT captured: ' + missing.map(function (k) { return expected[k].replace('gcyr:', '') + '@' + k }).join(' ') : '') +
        (extra.length > 0 ? ', unexpected: ' + extra.map(function (k) { return captured[k] + '@' + k }).join(' ') : '') +
        (leftover.length > 0 ? ', left in the world: ' + leftover.join(' ') : '') +
        (popped.length > 0 ? ', dropped as items: ' + popped.join(' ') : '') +
        (m.rocket !== null ? ', rocket ' + rocketSummary(m.rocket) : '')
      if (mode === 'stale') {
        m.staleReproduced = !ok
        note(name, (ok ? 'GCYR captured the whole grown rocket without a refresh (#122 not reproduced): ' :
          '#122 REPRODUCED in GCYR as is: the structure formed with a ' + m.spec.h + '-frame tower and grew afterwards; GCYR kept the old scan height (' +
          persistedDims(machineAt(m.g.C)) + '): ') + detail)
      } else if (mode === 'mirror') {
        note(name, (ok ? 'GCYR as is captured the whole rocket on this asymmetric pad: ' :
          '#122 REPRODUCED in GCYR as is ("only works on one axis"): "Build" (called directly, past the pack guard) scans the mirrored area: ') + detail)
      } else {
        check(name, ok, detail)
      }
      return 2
    }
  }

  function stepUnbuild(label) {
    return function (m) {
      if (m.formed === false) return 1
      if (m.rocket !== null && !m.rocket.isRemoved()) m.rocket.unBuild()
      return 2
    }
  }

  // unBuild must put the same blocks back where they were; if not, the rocket is placed again so the next cycle starts clean
  function stepVerifyUnbuild(label) {
    return function (m) {
      if (m.formed === false) return 1
      var name = 'scanner:' + m.key + ':un' + label
      var rockets = rocketsIn(S.level, areaBox(m, 4))
      var expected = expectedMap(m)
      var wrong = Object.keys(expected).filter(function (k) {
        var p = k.split(',')
        return String(S.level.getBlock(Number(p[0]), Number(p[1]), Number(p[2])).getId()) !== expected[k]
      })
      var restored = rockets.length === 0 && wrong.length === 0
      emit(name, restored ? 'PASS' : (m.spec.l !== m.spec.r ? 'NOTE' : 'FAIL'), 'rockets left=' + rockets.length + ', blocks back in place ' +
        (Object.keys(expected).length - wrong.length) + '/' + Object.keys(expected).length + (wrong.length > 0 ? ' (wrong: ' + wrong.join(' ') + ')' : ''))
      if (!restored) {
        rockets.forEach(function (r) { jcall(r, V.discard) })
        placeRocket(m)
      }
      return 2
    }
  }

  function stepGrow(m) {
    // two more frames on the tower and a taller rocket: positions above the formed pattern, so GTM does not re-check the structure
    for (var k = m.spec.h; k < m.spec.h + 2; k++) setBlock(m.g.at(m.spec.b + 1, 0, k), IDS.frame)
    m.rocketBlocks = grownRocket(m.spec)
    placeRocket(m)
    note('scanner:' + m.key + ':grown', 'tower ' + m.spec.h + ' -> ' + (m.spec.h + 2) + ' frames, rocket 3 -> 4 layers (seat on top of a second tank); formed=' +
      machineAt(m.g.C).isFormed() + ', GCYR still has ' + persistedDims(machineAt(m.g.C)))
    return 2
  }

  // after the stale build: put everything back as a player would (the partial rocket is taken apart, the dropped seat goes back)
  function stepRegrow(m) {
    if (m.rocket !== null && !m.rocket.isRemoved()) m.rocket.unBuild()
    itemsIn(m).forEach(function (e) { jcall(e, V.discard) })
    rocketsIn(S.level, areaBox(m, 4)).forEach(function (r) { jcall(r, V.discard) })
    placeRocket(m)
    return 2
  }

  // a player's right-click on a block as the server handles it: ServerPlayerGameMode.useItemOn = Forge's RightClickBlock event
  // (KubeJS's BlockEvents.rightClicked listens to it; a canceled event stops there), then the block's use = the machine UI.
  // If gameMode.useItemOn cannot be called, the same two steps are taken one by one.
  function rightClickBlock(p, C, facing) {
    var L = lazy()
    var pos = new BlockPos(C.x, C.y, C.z)
    var hit = new L.BlockHitResult(new L.Vec3(C.x + 0.5, C.y + 0.5, C.z + 0.5), facing, pos, false)
    try {
      return 'ServerPlayerGameMode.useItemOn -> ' + jcall(jget(p, V.gameMode), V.useItemOn, [p, S.level, p.getMainHandItem(), L.Hand.MAIN_HAND, hit])
    } catch (e) {
      var ev = L.ForgeHooks.onRightClickBlock(p, L.Hand.MAIN_HAND, pos, hit)
      if (ev.isCanceled()) return 'RightClickBlock event canceled (ForgeHooks + block use, gameMode.useItemOn failed: ' + e + ')'
      return 'block use -> ' + jcall(jcall(S.level, V.blockState, [pos]), V.stateUse, [S.level, p, L.Hand.MAIN_HAND, hit]) +
        ' (ForgeHooks + block use, gameMode.useItemOn failed: ' + e + ')'
    }
  }

  // a player's right-click with the held item (ServerPlayerGameMode.useItem, else the item's own use)
  function useHeldItem(p) {
    var L = lazy()
    try {
      return 'ServerPlayerGameMode.useItem -> ' + jcall(jget(p, V.gameMode), V.useItem, [p, p.getLevel(), p.getMainHandItem(), L.Hand.MAIN_HAND])
    } catch (e) {
      return 'Item.use -> ' + jcall(jcall(p.getMainHandItem(), V.stackItem), V.itemUse, [p.getLevel(), p, L.Hand.MAIN_HAND]) + ' (gameMode.useItem failed: ' + e + ')'
    }
  }

  function closeMenu(p) {
    try {
      jcall(p, V.closeContainer)
    } catch (e) { /* no menu open */ }
  }

  // the player right-clicks the controller to open the scanner UI before pressing "Build"; the pack hooks that click
  // (server_scripts/grindless/space/rocket_scanner.js) to refresh the structure. Without a player (server suite) the same hook is
  // called through global.grindless.space.refreshRocketScanner.
  function stepRefresh(m) {
    var how = 'none'
    var p = testPlayer()
    try {
      if (p !== null) {
        how = 'player right-click on the controller (' + rightClickBlock(p, m.g.C, m.g.F) + ')'
        closeMenu(p)
      } else if (global.grindless && global.grindless.space && global.grindless.space.refreshRocketScanner) {
        var r = global.grindless.space.refreshRocketScanner(S.level, new BlockPos(m.g.C.x, m.g.C.y, m.g.C.z))
        how = 'global.grindless.space.refreshRocketScanner (no player in this suite) -> ' + r
      } else {
        how = 'nothing: no player and no global.grindless.space.refreshRocketScanner'
      }
    } catch (e) {
      how = 'exception: ' + e
    }
    note('scanner:' + m.key + ':refresh', how + '; GCYR now has ' + persistedDims(machineAt(m.g.C)))
    return 2
  }

  function stepFlightReady(m) {
    m.ready = true
    return STOP
  }

  function stepsFor(sp) {
    var steps = [stepWaitFormed]
    if (sp.flight) {
      steps.push(stepFlightReady)
      return steps
    }
    if (sp.grow) {
      steps.push(stepBuild('build_base'), stepVerifyBuild('build_base', 'check'), stepUnbuild('build_base'), stepVerifyUnbuild('build_base'))
      steps.push(stepGrow)
      steps.push(stepBuild('stale_build'), stepVerifyBuild('stale_build', 'stale'), stepRegrow)
      steps.push(stepRefresh)
      steps.push(stepBuild('fixed_build'), stepVerifyBuild('fixed_build', 'check'), stepUnbuild('fixed_build'), stepVerifyUnbuild('fixed_build'))
      return steps
    }
    if (sp.l !== sp.r) {
      steps.push(stepGuard)
      steps.push(stepBuild('gcyr_build'), stepVerifyBuild('gcyr_build', 'mirror'), stepUnbuild('gcyr_build'), stepVerifyUnbuild('gcyr_build'))
      return steps
    }
    for (var k = 1; k <= sp.cycles; k++) {
      steps.push(stepBuild('build_' + k), stepVerifyBuild('build_' + k, 'check'), stepUnbuild('build_' + k), stepVerifyUnbuild('build_' + k))
    }
    return steps
  }

  function advance(m) {
    if (m.phase === 'done' || S.t < m.wakeAt) return
    var fn = m.steps[m.si]
    if (!fn) {
      m.phase = 'done'
      return
    }
    var r = 1
    try {
      r = fn(m)
    } catch (e) {
      check('scanner:' + m.key + ':step_' + m.si, false, 'exception: ' + e)
      m.phase = 'done'
      return
    }
    if (r === STOP) {
      m.phase = 'done'
      return
    }
    if (r === AGAIN) {
      m.wakeAt = S.t + 5
      return
    }
    m.si++
    m.wakeAt = S.t + (r > 0 ? r : 1)
  }

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + (FLOOR_Y + 1) + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + FLOOR_Y + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + FLOOR_Y + ' ' + BAND.z1 + ' minecraft:smooth_stone')
    asArray(S.level.getEntitiesOfClass(lazy().ItemEntity, new (lazy().AABB)(BAND.x0, BAND.y0, BAND.z0, BAND.x1 + 1, BAND.y1 + 1, BAND.z1 + 1)))
      .forEach(function (e) { jcall(e, V.discard) })
    note('area', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 +
      ' generated and force-loaded, cleared (' + cleared + ' blocks changed), smooth stone floor at Y ' + FLOOR_Y)
  }

  function startScanners() {
    SPECS.forEach(function (sp) {
      var m = { key: sp.key, spec: sp, phase: 'running', si: 0, wakeAt: S.t + 2, t0: S.t, rocket: null, expected: null, itemsBefore: {} }
      try {
        m.g = geometry(sp)
        m.rocketBlocks = sp.rocket(sp)
        m.steps = stepsFor(sp)
        placeStructure(m)
        m.t0 = S.t
      } catch (e) {
        check('scanner:' + sp.key + ':placed', false, 'exception while building: ' + e)
        m.phase = 'done'
      }
      S.scanners.push(m)
    })
  }

  function scannersDone() {
    for (var i = 0; i < S.scanners.length; i++) {
      if (S.scanners[i].phase !== 'done') return false
    }
    return true
  }

  function scannerByKey(k) {
    for (var i = 0; i < S.scanners.length; i++) {
      if (S.scanners[i].key === k) return S.scanners[i]
    }
    return null
  }

  // ---------------------------------------------------------------- flight (#91)

  function go(next) {
    FL.phase = next
    FL.since = S.t
    FL.sub = 0
    shared().put('phase', next)
  }

  // longest server tick since a test tick (TICK.gaps holds server tick counts)
  function gapSince(t) {
    var max = 0
    TICK.gaps.forEach(function (g) { if (g.t >= t + S.tick0 && g.ms > max) max = g.ms })
    return max
  }

  function chipPlanet(stack) {
    if (stack === null || stack === undefined || jcall(stack, ['isEmpty', 'm_41619_'])) return ''
    var tag = jcall(stack, V.tag)
    return tag === null || tag === undefined ? '' : String(jcall(tag, V.getString, ['gcyr:current_planet']))
  }

  function setChipPlanet(stack, dim) {
    jcall(jcall(stack, V.orCreateTag), V.putString, ['gcyr:current_planet', dim])
  }

  function started(r) {
    return readRocket(r).started
  }

  // the rocket's config slot and fuel tank are private; their NBT is what the rocket's own UI writes into, so the test sets
  // them through the entity's NBT (Entity.load -> RocketEntity.readAdditionalSaveData)
  function loadRocket(r, chip, fuelAmount) {
    var L = lazy()
    var tag = r.saveWithoutId(new L.CompoundTag())
    if (chip !== null) {
      var it = jcall(chip, V.save, [new L.CompoundTag()])
      jcall(it, V.putInt, ['Slot', 0])
      var items = new L.ListTag()
      items.add(it)
      var cfg = new L.CompoundTag()
      jcall(cfg, V.putInt, ['Size', 1])
      jcall(cfg, V.put, ['Items', items])
      jcall(tag, V.put, ['config', cfg])
    }
    if (fuelAmount !== null) {
      var fuel = new L.CompoundTag()
      jcall(fuel, V.putString, ['FluidName', IDS.fuel])
      jcall(fuel, V.putInt, ['Amount', fuelAmount])
      jcall(tag, V.put, ['fuel', fuel])
    }
    jcall(r, ['load', 'm_20258_'], [tag])
    return readRocket(r)
  }

  function readRocket(r) {
    var back = r.saveWithoutId(new (lazy().CompoundTag)())
    var items = jcall(back.getCompound('config'), V.getList, ['Items', 10])
    var planet = items.size() > 0 ? String(jcall(jcall(items, V.listCompound, [0]).getCompound('tag'), V.getString, ['gcyr:current_planet'])) : ''
    var fuel = back.getCompound('fuel')
    return { planet: planet, fuel: fuel.getInt('Amount'), fluid: String(jcall(fuel, V.getString, ['FluidName'])),
      started: String(jcall(back, V.getBoolean, ['isStarted'])) === 'true', timer: back.getInt('startTimer') }
  }

  // the rocket the player rides; if Entity.getVehicle cannot be called on the player, the rocket near it whose first passenger
  // is the test player
  function vehicleOf(p) {
    try {
      var v = jcall(p, V.vehicle)
      if (v === null || v === undefined) return null
      return v instanceof lazy().Rocket ? v : null
    } catch (e) {
      var list = rocketsAround(p.getLevel(), xOf(p), zOf(p))
      for (var i = 0; i < list.length; i++) {
        var rider = null
        try { rider = jcall(list[i], V.firstPassenger) } catch (e2) { rider = null }
        if (rider !== null && rider !== undefined && isTestPlayer(rider)) return list[i]
      }
      return null
    }
  }

  function describeVehicle(p) {
    var v = null
    try {
      v = jcall(p, V.vehicle)
    } catch (e) {
      v = vehicleOf(p)
    }
    if (v === null || v === undefined) return 'none'
    return String(v).substring(0, 60) + ' ' + uuidOf(v)
  }

  function rocketsAround(level, x, z) {
    return rocketsIn(level, new (lazy().AABB)(x - 24, -128, z - 24, x + 24, 1024, z + 24))
  }

  function abortFlight(reason) {
    note('flight_aborted', reason)
    shared().put('brake', false)
    shared().put('watch', false)
    go('done')
  }

  function flightBegin() {
    var m = scannerByKey('flight')
    if (m === null || !m.ready) {
      check('flight_setup', false, 'the flight scanner did not form, no flight')
      return false
    }
    FL = { phase: 'setup', since: S.t, sub: 0, m: m, rocket: null, rocketUuid: '', legs: {}, hurts: {}, hits: [], died: false, landStable: 0, maxY: 0, crossT: 0,
      launchT: 0 }
    shared().put('phase', 'setup')
    return true
  }

  function hurtSummary(since) {
    var parts = []
    Object.keys(FL.hurts).forEach(function (k) {
      var n = FL.hurts[k].filter(function (t) { return t >= since }).length
      if (n > 0) parts.push(k + ' x' + n)
    })
    return parts.length > 0 ? parts.join(', ') : 'none'
  }

  // first and last hit of each damage type since a tick: phase, ticks after the launch, dimension and height of the player
  function hurtTimeline(since) {
    var byType = {}
    FL.hits.forEach(function (h) {
      if (h.t < since) return
      if (!byType[h.id]) byType[h.id] = []
      byType[h.id].push(h)
    })
    var parts = Object.keys(byType).map(function (id) {
      var l = byType[id]
      function at(h) { return h.phase + ' launch+' + (h.t - FL.launchT) + ' ' + h.dim + ' y' + h.y + (h.vehicle ? ' riding' : '') }
      return id + ' x' + l.length + ' (first ' + at(l[0]) + (l.length > 1 ? ', last ' + at(l[l.length - 1]) : '') + ')'
    })
    return parts.length > 0 ? parts.join('; ') : 'none'
  }

  // the suit a player wears to the Moon: the four pieces, the chestplate filled with oxygen (GCYR 0.2.9: FluidHandlerItemStack
  // "Fluid" tag, 16 buckets, fluids in forge:oxygen; 1 mB every 3 ticks). Without oxygen a full suit does not protect: the
  // gcyr:is_spacesuit tag GCYR checks for that is empty in 0.2.9.
  function suitUp(p, helmet) {
    if (helmet) p.setHeadArmorItem(Item.of(IDS.suit.HEAD))
    p.setChestArmorItem(Item.of(IDS.suit.CHEST, '{Fluid:{FluidName:"gtceu:oxygen",Amount:' + SUIT_OXYGEN + '}}'))
    p.setLegsArmorItem(Item.of(IDS.suit.LEGS))
    p.setFeetArmorItem(Item.of(IDS.suit.FEET))
  }

  // the ItemStack overloads: KubeJS converts almost anything to an ItemStack, so oxygenAmount(player) is ambiguous for Rhino
  function suitState(p) {
    try {
      var Suit = Java.loadClass('argent_matter.gcyr.common.item.armor.SpaceSuitArmorItem')
      var chest = p.getChestArmorItem()
      return 'full set ' + Suit.hasFullSet(p) + ', oxygen ' + Suit.oxygenAmount(chest) + '/' + Suit.oxygenMax(chest) + ' mB'
    } catch (e) {
      return 'unreadable (' + e + ')'
    }
  }

  // fire hits on the player since a tick (the pack's space/rocket_riders.js gives riders fire resistance)
  function fireHits(since) {
    return FL.hits.filter(function (h) { return h.t >= since && (h.id === 'onFire' || h.id === 'inFire') }).length
  }

  function hasFireResistance(p) {
    try {
      return p.getPotionEffects().isActive(Java.loadClass('net.minecraft.world.effect.MobEffects').FIRE_RESISTANCE) === true
    } catch (e) {
      return 'unreadable (' + e + ')'
    }
  }

  function flightTick() {
    var L = lazy()
    var p = testPlayer()
    if (FL.phase === 'done') return
    if (p === null) {
      abortFlight('the test player is gone')
      return
    }
    if (FL.died) {
      check('flight_player_alive', false, 'the player died during ' + FL.phase + ' (damage: ' + hurtTimeline(0) + ')')
      abortFlight('player died')
      return
    }
    var age = S.t - FL.since
    var m = FL.m
    var g = m.g

    // when and where the player catches fire (GCYR sets 300 fire ticks under a launching rocket, 200 on a planet that is too hot)
    if (!FL.fireSeen) {
      var fire = 0
      try { fire = Number(jcall(p, ['getRemainingFireTicks', 'm_20094_'])) } catch (e) { fire = 0 }
      if (fire > 0) {
        FL.fireSeen = true
        var rr = FL.rocket
        note('flight_fire', 'the player caught fire during ' + FL.phase + ' (launch+' + (S.t - FL.launchT) + ' ticks, ' + fire + ' fire ticks left) in ' + dimOf(p) +
          ' at y ' + yOf(p).toFixed(1) + (rr !== null && !rr.isRemoved() ? ', rocket y ' + yOf(rr).toFixed(1) + ' start timer ' + rr.getStartTimer() : '') +
          ', riding ' + (vehicleOf(p) !== null))
      }
    }
    if (FL.phase === 'setup') {
      // the client world has a random seed: clear the air column the rocket climbs through, above the band
      S.server.runCommandSilent('fill ' + (g.box.x0 - 1) + ' ' + (BAND.y1 + 1) + ' ' + (g.box.z0 - 1) + ' ' + (g.box.x1 + 1) + ' 319 ' + (g.box.z1 + 1) + ' air')
      var stand = g.at(-2, 0, -1)
      p.teleportTo(IDS.earthDim, stand.x + 0.5, stand.y, stand.z + 0.5, 0, 10)
      // KubeJS's LivingEntityKJS setters
      suitUp(p, true)
      p.setMainHandItem(Item.of('minecraft:air'))
      var mode = 'unknown'
      try { mode = String(jcall(jget(p, V.gameMode), V.gameModeForPlayer)) } catch (e) { mode = 'unreadable (' + e + ')' }
      note('flight_setup', 'player ' + p.getProfile().getName() + ' at ' + key(stand.x, stand.y, stand.z) + ' in front of the flight scanner, space suit on (' +
        suitState(p) + '), game mode ' + mode)
      probe('player', p)
      go('open_scanner')
      return
    }

    if (FL.phase === 'open_scanner') {
      if (age < 40) return
      var C = g.C
      var how = ''
      try {
        how = 'right-click on the Rocket Scanner controller: ' + rightClickBlock(p, C, g.F)
      } catch (e) {
        how = 'the simulated right-click failed (' + e + '); the scanner is refreshed directly'
        if (global.grindless && global.grindless.space && global.grindless.space.refreshRocketScanner) {
          global.grindless.space.refreshRocketScanner(S.level, new BlockPos(C.x, C.y, C.z))
        }
      }
      var menu = 'unknown'
      try { menu = String(p.getOpenInventory()).substring(0, 80) } catch (e2) { menu = 'unreadable' }
      note('flight_scanner_ui', how + ', open menu ' + menu)
      go('build')
      return
    }

    if (FL.phase === 'build') {
      if (age < 10) return
      // what the UI's "Build" button runs on the server
      machineAt(g.C).setRocketBuilt(true)
      closeMenu(p)
      var rockets = rocketsIn(S.level, areaBox(m, 4))
      FL.rocket = rockets.length === 1 ? rockets[0] : null
      var expN = m.rocketBlocks.length
      var ok = FL.rocket !== null && FL.rocket.getBlocks().size() === expN
      check('flight_scanner_build', ok, 'rockets=' + rockets.length + (FL.rocket !== null ? ' ' + rocketSummary(FL.rocket) : '') + ' (expected ' + expN + ' blocks, speed 5)')
      if (!ok) {
        abortFlight('no rocket')
        return
      }
      FL.rocketUuid = uuidOf(FL.rocket)
      probe('rocket', FL.rocket)
      shared().put('rocketUuid', FL.rocketUuid)
      p.setMainHandItem(Item.of(IDS.chip))
      go('program_chip')
      FL.target = IDS.moonPlanet
      FL.targetDim = IDS.moonDim
      FL.leg = 'moon'
      return
    }

    if (FL.phase === 'program_chip') {
      if (FL.sub === 0) {
        if (age < 10) return
        shared().put('selected', '')
        shared().put('select', FL.target)
        var used = ''
        FL.subT = S.t
        try {
          used = 'right-click with the ID chip: ' + useHeldItem(p) + ' (GCYR opens its planet screen on the client)'
        } catch (e) {
          used = 'the simulated right-click with the chip failed: ' + e
          FL.subT = S.t - 301
        }
        note('flight_chip_used_' + FL.leg, used)
        FL.sub = 1
        return
      }
      var planet = chipPlanet(p.getMainHandItem())
      if (planet === FL.targetDim) {
        check('flight_planet_screen_' + FL.leg, true, 'the client clicked ' + FL.target + ' on GCYR\'s planet screen; the server wrote gcyr:current_planet=' + planet +
          ' into the chip (' + (S.t - FL.subT) + ' ticks)')
        go('load')
        return
      }
      if (S.t - FL.subT > 300) {
        check('flight_planet_screen_' + FL.leg, false, 'the chip says "' + planet + '" 15 s after the right-click (client screen: ' + sval('clientScreen') + ', client clicked: ' +
          sval('selected') + '); the test writes the chip itself and goes on')
        closeMenu(p)
        setChipPlanet(p.getMainHandItem(), FL.targetDim)
        go('load')
      }
      return
    }

    if (FL.phase === 'load') {
      var chip = jcall(p.getMainHandItem(), V.copy)
      var loaded = loadRocket(FL.rocket, chip, FUEL_LOAD)
      p.setMainHandItem(Item.of('minecraft:air'))
      check('flight_load_' + FL.leg, loaded.planet === FL.targetDim && loaded.fuel === FUEL_LOAD && loaded.fluid === IDS.fuel,
        'rocket config slot chip -> ' + loaded.planet + ', tank ' + loaded.fluid + ' ' + loaded.fuel + ' mB of ' + FL.rocket.getFuelCapacity())
      go(FL.leg === 'moon' ? 'board' : 'launch')
      return
    }

    if (FL.phase === 'board') {
      if (FL.sub === 0) {
        var res2 = ''
        try {
          res2 = 'right-click on the rocket (Player.interactOn): ' + jcall(p, V.interactOn, [FL.rocket, L.Hand.MAIN_HAND])
        } catch (e) {
          try {
            res2 = 'RocketEntity.interact (what interactOn runs; Player.interactOn failed: ' + e + '): ' + jcall(FL.rocket, V.interact, [p, L.Hand.MAIN_HAND])
          } catch (e2) {
            res2 = '/ride (interactOn and interact failed: ' + e2 + '): ' + S.server.runCommandSilent('ride ' + p.getProfile().getName() + ' mount ' + FL.rocketUuid)
          }
        }
        var v = vehicleOf(p)
        var ok2 = v !== null && uuidOf(v) === FL.rocketUuid
        check('flight_board', ok2, res2 + ', vehicle ' + describeVehicle(p))
        if (!ok2) {
          abortFlight('the player could not sit in the rocket')
          return
        }
        FL.sub = 1
        return
      }
      if (age < 40) return
      note('flight_client_board', 'client sees: dimension ' + sval('clientDim') + ', vehicle ' + sval('clientVehicle') + ', rockets ' + sval('clientRockets'))
      go('launch')
      return
    }

    if (FL.phase === 'launch') {
      var r = FL.rocket
      var dest = L.PlanetData.getPlanet(rl(FL.target))
      var need = r.computeRequiredFuelAmountForDestination(dest)
      var before = rocketSummary(r)
      // what the Launch button of the rocket UI runs
      r.startRocket()
      var ok3 = started(r)
      check('flight_launch_' + FL.leg, ok3, (ok3 ? 'ROCKET_STARTED, countdown 200 ticks' : 'startRocket() refused') + '; ' + before + ', fuel needed to launch ' +
        need + ' mB, destination ' + (r.getDestination() === null ? 'none' : String(r.getDestination().level())) + ', rider ' + describeVehicle(p))
      if (!ok3) {
        abortFlight('the rocket did not start')
        return
      }
      FL.launchT = S.t
      if (FL.firstLaunchT === undefined) FL.firstLaunchT = S.t
      FL.crossT = 0
      FL.maxY = 0
      FL.fuelAtLaunch = readRocket(r).fuel
      shared().put('shot', 'launch_' + FL.leg)
      // the client half reports a server that stops ticking as the #91 freeze only from here to the landing
      shared().put('watch', true)
      go('ascent')
      return
    }

    if (FL.phase === 'ascent') {
      var r2 = FL.rocket
      if (dimOf(p) === FL.targetDim) {
        go('arrived')
      } else {
        if (!r2.isRemoved()) {
          FL.maxY = Math.max(FL.maxY, yOf(r2))
          if (FL.crossT === 0 && yOf(r2) >= 600) FL.crossT = S.t
          if (age === 260) shared().put('shot', 'climb_' + FL.leg)
          if (age === 330) shared().put('shot', 'high_' + FL.leg)
          if (age === 240) FL.fireResAtClimb = hasFireResistance(p)
        }
        if (age > 2400) {
          check('flight_teleport_' + FL.leg, false, 'still in ' + dimOf(p) + ' ' + age + ' ticks after launch: rocket ' + (r2.isRemoved() ? 'removed' : 'y=' + yOf(r2).toFixed(1) +
            ' started=' + started(r2) + ' timer=' + r2.getStartTimer()) + ', max y ' + FL.maxY.toFixed(1) + ', vehicle ' + describeVehicle(p))
          abortFlight('no teleport')
        }
        return
      }
    }

    if (FL.phase === 'arrived') {
      var dest2 = levelOf(FL.targetDim)
      var gap = gapSince(FL.crossT > 0 ? FL.crossT - 40 : FL.launchT)
      check('flight_teleport_' + FL.leg, true, 'player in ' + FL.targetDim + ' ' + (S.t - FL.launchT) + ' ticks after the launch (countdown 200 + climb); the rocket passed y 600 ' +
        (FL.crossT > 0 ? (S.t - FL.crossT) + ' ticks before' : '(not seen: teleported in the same tick)') + ', max y seen ' + FL.maxY.toFixed(1))
      check('flight_server_ticking_' + FL.leg, gap < 5000, 'longest server tick around the teleport ' + gap + ' ms (a #91 freeze stops the ticks for good; the client half reports that)')
      var v2 = vehicleOf(p)
      check('flight_riding_' + FL.leg, v2 !== null && String(dimOf(v2)) === FL.targetDim, 'player vehicle after the teleport: ' + describeVehicle(p))
      // the entity sections of the arrival chunk are not loaded yet in this tick: the rockets are counted 40 ticks later
      var around = rocketsAround(dest2, xOf(p), zOf(p))
      var newRocket = v2 !== null ? v2 : (around.length > 0 ? around[0] : null)
      check('flight_rocket_' + FL.leg, newRocket !== null && newRocket.getBlocks().size() === m.rocketBlocks.length && !started(newRocket),
        (newRocket !== null ? rocketSummary(newRocket) + ', started=' + started(newRocket) + ', y=' + yOf(newRocket).toFixed(1) : 'no rocket') + ' (expected ' +
        m.rocketBlocks.length + ' blocks, not started: GCYR clears the launch on arrival)')
      note('flight_damage_' + FL.leg, 'damage from the launch to the arrival: ' + hurtTimeline(FL.launchT) + '; suit ' + suitState(p))
      // the departure chunk is still loaded in this tick: nothing may be left there
      var fromLevel = levelOf(FL.leg === 'moon' ? IDS.earthDim : IDS.moonDim)
      var leftBehind = rocketsAround(fromLevel, xOf(p), zOf(p)).length
      check('flight_no_copy_' + FL.leg, leftBehind === 0, 'rockets left in the departure dimension at this x/z: ' + leftBehind +
        ' (GCYR moves the rocket, then moves the riders a second time)')
      if (newRocket === null) {
        abortFlight('no rocket at the destination')
        return
      }
      FL.rocket = newRocket
      FL.rocketUuid = uuidOf(newRocket)
      FL.arriveT = S.t
      FL.landStable = 0
      FL.lastY = undefined
      FL.minY = yOf(newRocket)
      FL.arrY = yOf(newRocket)
      shared().put('rocketUuid', FL.rocketUuid)
      shared().put('brake', true)
      shared().put('shot', 'arrival_' + FL.leg)
      go('descent')
      return
    }

    if (FL.phase === 'descent') {
      var r3 = FL.rocket
      if (r3.isRemoved()) {
        var vv = vehicleOf(p)
        if (vv !== null && !vv.isRemoved() && dimOf(vv) === FL.targetDim) {
          FL.rocket = vv
          return
        }
        check('flight_landing_' + FL.leg, false, 'the rocket entity is gone ' + age + ' ticks after arrival (crash landing = unBuild + explosion when fallDistance > 48); ' +
          'player at y ' + yOf(p).toFixed(1) + ', client held Space for ' + sval('clientBrakeTicks') + ' ticks')
        shared().put('brake', false)
        abortFlight('crash')
        return
      }
      FL.minY = Math.min(FL.minY, yOf(r3))
      // landed = the rocket fell and then did not move for 10 ticks (plain positions: no Entity.onGround / Vec3.y name lookups); a
      // rocket that has not fallen yet may only be waiting for its chunk to load
      var y3 = yOf(r3)
      if (FL.lastY !== undefined && Math.abs(y3 - FL.lastY) < 0.001 && FL.minY < FL.arrY - 10) FL.landStable++
      else FL.landStable = 0
      FL.lastY = y3
      if (age === 40) note('flight_client_descent_' + FL.leg, 'client sees: dimension ' + sval('clientDim') + ', vehicle ' + sval('clientVehicle') + ', Space held ' + sval('clientBrakeTicks') + ' ticks')
      if (FL.landStable >= 10) {
        var info = readRocket(r3)
        check('flight_landing_' + FL.leg, true, 'landed in ' + dimOf(r3) + ' at ' + key(Math.floor(jcall(r3, V.x)), Math.floor(y3), Math.floor(jcall(r3, V.z))) + ' ' + (S.t - FL.arriveT) +
          ' ticks after arrival, no crash; fuel ' + info.fuel + ' mB left (' + (FL.fuelAtLaunch - info.fuel) + ' mB burnt this leg), client held Space ' + sval('clientBrakeTicks') + ' ticks')
        FL.legs[FL.leg] = { launchToArrive: FL.arriveT - FL.launchT, arriveToLand: S.t - FL.arriveT, burnt: FL.fuelAtLaunch - info.fuel }
        FL.landT = S.t
        // the landed rocket's chunk is loaded: exactly one rocket where the player is
        var here = rocketsAround(levelOf(FL.targetDim), xOf(p), zOf(p)).length
        check('flight_one_rocket_' + FL.leg, here === 1, 'rockets near the player in ' + FL.targetDim + ' after the landing: ' + here)
        var burns = fireHits(FL.launchT)
        check('flight_rider_fire_' + FL.leg, burns === 0, 'fire hits on the rider from the launch to the landing: ' + burns + '; fire resistance during the climb: ' +
          FL.fireResAtClimb + ' (GCYR burns everything under a climbing rocket; the pack keeps riders fire resistant)')
        shared().put('brake', false)
        shared().put('watch', false)
        shared().put('shot', 'landed_' + FL.leg)
        go(FL.leg === 'moon' ? 'moon_stay' : 'done')
        if (FL.leg !== 'moon') flightSummary()
        return
      }
      if (age > 2400) {
        check('flight_landing_' + FL.leg, false, 'not on the ground ' + age + ' ticks after arrival: y=' + y3.toFixed(1) + ' min y ' + FL.minY.toFixed(1) +
          ', started=' + started(r3) + ', client held Space ' + sval('clientBrakeTicks') + ' ticks')
        abortFlight('no landing')
      }
      return
    }

    if (FL.phase === 'moon_stay') {
      if (FL.sub === 0) {
        FL.stayT = S.t
        FL.sub = 1
        return
      }
      if (FL.sub === 1 && S.t - FL.stayT >= 60) {
        var suitHurts = hurtSummary(FL.landT)
        check('flight_moon_suit', suitHurts === 'none', 'damage on the Moon in the space suit from the landing on: ' + hurtTimeline(FL.landT) + '; suit ' + suitState(p) +
          ' (the suit keeps 60-363 K, the Moon is 113 K; GCYR burns 1 mB of oxygen every 3 ticks)')
        FL.helmetOff = S.t
        p.setHeadArmorItem(Item.of('minecraft:air'))
        FL.sub = 2
        return
      }
      if (FL.sub === 2 && S.t - FL.helmetOff >= 20) {
        p.setHeadArmorItem(Item.of(IDS.suit.HEAD))
        note('flight_moon_oxygen', 'helmet off for 20 ticks: damage ' + hurtSummary(FL.helmetOff) + ' (drown = no oxygen, freeze = 113 K without a full suit) - the oxygen and temperature systems are live')
        try { jcall(p, ['setHealth', 'm_21153_'], [20]) } catch (e) { /* the return trip works with any health */ }
        p.setMainHandItem(Item.of(IDS.chip))
        FL.leg = 'home'
        FL.target = IDS.earthPlanet
        FL.targetDim = IDS.earthDim
        go('program_chip')
      }
      return
    }
  }

  function flightSummary() {
    var parts = []
    Object.keys(FL.legs).forEach(function (k) {
      var l = FL.legs[k]
      parts.push(k + ': launch->arrival ' + l.launchToArrive + ' ticks, arrival->landing ' + l.arriveToLand + ' ticks, ' + l.burnt + ' mB burnt')
    })
    note('flight_summary', parts.join('; ') + '; longest server tick from the first launch on ' + gapSince(FL.firstLaunchT) + ' ms (the test\'s own area setup before it: ' +
      TICK.max + ' ms); damage over the whole flight: ' + hurtTimeline(0))
  }

  // ---------------------------------------------------------------- driver

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    shared().put('brake', false)
    shared().put('watch', false)
    shared().put('hold', false)
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick(server) {
    var now = Date.now()
    if (TICK.last > 0) {
      var gap = now - TICK.last
      if (gap > TICK.max) TICK.max = gap
      if (gap > 150) {
        TICK.gaps.push({ t: server.getTickCount(), ms: gap })
        if (TICK.gaps.length > 5000) TICK.gaps.shift()
      }
    }
    TICK.last = now
    if (global[REQUEST] || (S !== null && !S.finished)) shared().put('serverTickMs', now)
    if (S === null || S.finished) return
    S.t = server.getTickCount() - S.tick0
    if (S.t > TEST_TIMEOUT) {
      check('timeout', false, 'the test ran ' + S.t + ' ticks; phase ' + (FL !== null ? FL.phase : 'scanners'))
      finish()
      return
    }
    try {
      if (S.stage === 'scanners') {
        S.scanners.forEach(function (m) { advance(m) })
        if (scannersDone()) {
          var p = testPlayer()
          if (p === null) {
            note('flight', 'skipped: no player in this suite (run the client suite with the gg_test_gcyr_flight.json marker for the flight)')
            finish()
          } else if (flightBegin()) {
            S.stage = 'flight'
          } else {
            finish()
          }
        }
        return
      }
      if (S.stage === 'flight') {
        flightTick()
        if (FL.phase === 'done') finish()
      }
    } catch (e) {
      check('step', false, 'exception in ' + S.stage + (FL !== null ? '/' + FL.phase : '') + ': ' + e)
      finish()
    }
  }

  function run(server) {
    S = { server: server, level: server.overworld(), t: 0, tick0: server.getTickCount(), stage: 'scanners', scanners: [], finished: false,
      playerUuid: global[REQUEST + 'Player'] ? String(global[REQUEST + 'Player']) : null }
    FL = null
    try {
      staticChecks()
    } catch (e) {
      check('static', false, 'exception (is GCYR loaded?): ' + e)
    }
    try {
      prepareWorld()
      var p = testPlayer()
      if (p !== null) p.teleportTo(IDS.earthDim, 2594.5, PAD_Y, 7.5, 0, 20)
      startScanners()
    } catch (e) {
      check('area', false, 'exception: ' + e)
      finish()
    }
  }

  function startIfRequested(server) {
    if (!global[REQUEST] || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    if (global[REQUEST + 'At'] && Date.now() < Number(global[REQUEST + 'At'])) return
    global[REQUEST] = false
    try {
      run(server)
    } catch (e) {
      check('run', false, 'exception: ' + e)
      finish()
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_gcyr_flight', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_gcyr_flight run is still in progress')
      return 0
    }
    global[REQUEST + 'Player'] = ''
    global[REQUEST] = true
    return 1
  })

  // client suite: armed when the player joins, if the instance carries the marker file. The hold is set first, so that a later
  // problem in this handler cannot let mc-runtime-test quit before the test reports it.
  PlayerEvents.loggedIn(function (event) {
    if (!enabledByMarker() || (S !== null && !S.finished)) return
    shared().put('hold', true)
    shared().put('brake', false)
    shared().put('watch', false)
    shared().put('select', '')
    shared().put('shot', '')
    shared().put('serverTickMs', Date.now())
    try {
      global[REQUEST + 'Player'] = profileId(event.player)
      global[REQUEST + 'At'] = Date.now() + 5000
      global[REQUEST] = true
      note('armed', 'player ' + event.player.getProfile().getName() + ' joined and ' + MARKER + ' is present: the flight test starts in a few seconds')
    } catch (e) {
      check('armed', false, 'could not arm the test: ' + e)
      shared().put('hold', false)
    }
  })

  function isTestPlayer(entity) {
    return S !== null && entity.isPlayer() && profileId(entity) === S.playerUuid
  }

  // DamageSource.toString() is "DamageSource (<msgId>)"
  EntityEvents.hurt(function (event) {
    if (FL === null || S === null || S.finished) return
    try {
      if (!isTestPlayer(event.entity)) return
      var text = String(event.source)
      var m = /\(([^)]*)\)/.exec(text)
      var id = m ? m[1] : text
      if (!FL.hurts[id]) FL.hurts[id] = []
      FL.hurts[id].push(S.t)
      var p = event.entity
      var riding = false
      try { riding = vehicleOf(p) !== null } catch (e1) { riding = false }
      FL.hits.push({ id: id, t: S.t, phase: FL.phase, dim: dimOf(p).replace('minecraft:', '').replace('gcyr:', ''), y: Math.round(yOf(p)), vehicle: riding })
      if (FL.hits.length > 600) FL.hits.shift()
    } catch (e) { /* bookkeeping only */ }
  })

  EntityEvents.death(function (event) {
    if (FL === null || S === null || S.finished) return
    try {
      if (isTestPlayer(event.entity)) FL.died = true
    } catch (e) { /* bookkeeping only */ }
  })
})()
