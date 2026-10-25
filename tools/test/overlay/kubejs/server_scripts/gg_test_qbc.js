// Gregtech Grindless - test overlay (not shipped with the pack)
//
// REAL-PLAYER test of AE2WTLib's Quantum Bridge Card in this pack (client suite only): does a wireless terminal reach the home AE2
// network from far away on Earth, from the Moon and from Mars, with an ordinary Earth pair of entangled singularities?
//   AE2WTLib 15.3.3 (MIT): a terminal with the card and one entangled singularity in its singularity slot looks the singularity's
//     frequency up in AE2's Locatables.quantumNetworkBridges() (one map for the whole server, every dimension) when no access point
//     serves it (ItemWT.getLinkedGrid, WTMenuHost.isQuantumLinked / rangeCheck). The card goes into AE2's Wireless Crafting Terminal
//     (AE2WTLib's mixin gives it AE2WTLib's menu) and into AE2WTLib's pattern encoding, pattern access and universal terminals.
//   AE2 15.4.11 (LGPL-3.0): a formed quantum bridge registers itself under +-frequency of the singularity in its link chamber
//     (QuantumCluster.updateStatus) and unregisters when its chunk unloads (QuantumBridgeBlockEntity.onChunkUnloaded).
//
// STATIC (server): the card's recipe (2 fluix pearls + a wireless receiver) and the recipes that make each part, nothing of it hidden
// (c:hidden_from_recipe_viewers, grindless:hidden_with_recipes, global.grindless.hidden), which terminals take the card (AE2's
// Upgrades registry), AE2's two Earth-pair ritual recipes, the access point's range. The client half checks EMI's index and recipes.
// WORLD (Earth): a minimal ad-hoc ME network: a 3x3 quantum bridge, a creative energy cell, an ME drive with a 1k cell holding 1,024
// diamonds and a wireless access point (no boosters: range 16). AE2's explosion ritual (an AE2 singularity + an ender pearl, TNT inside
// an obsidian box) makes an ordinary Earth pair: one half goes into the home link chamber, the other into the terminal.
// THE PLAYER (survival, space suit, resistance) holds AE2's Wireless Crafting Terminal, linked at the access point with AE2's own
// linkable handler (what the access point's linking slot runs). Each case is a real right-click: the client half holds the use key
// for one tick. In the cases that must open, the server keeps the terminal's menu open (WCTMenu), its host is quantum linked to the
// home grid, the client screen shows the diamonds, and a shift-click on them in the terminal (the client's MEInteractionPacket) moves
// one stack into the player's inventory out of the home drive.
//   near                 Earth, 7 blocks from the access point, no card yet: opens through the access point (the baseline). The card
//                        and the singularity half then go into the open terminal's own slots (upgrade slot, singularity slot).
//   earth_51_blocks      Earth, 53 blocks from the access point (range 16), on the band's floor
//   earth_far            Earth, 1,000+ blocks away (Z 1104+), on natural ground (no block placed outside the band)
//   moon                 gcyr:luna. Then 5 s on the Moon: the terminal keeps its singularity while our ejection rule
//                        (moon/quantum_bridge.js) is live: a lone link chamber next to the player with an Earth singularity is emptied.
//   moon_unlinked        NOTE: the same terminal with its access point link removed (is the link needed at all?)
//   moon_no_card         control: the card taken out, the link back: the terminal must not stay open
//   mars                 gcyr:mars
//   mars_home_unloaded   the band's force-load removed until the home bridge's chunk unloads: must not open; what the player sees
//   mars_home_reloaded   force-loaded again: opens again
//
// HOW TO RUN (client suite only; -Commands and -WaitForLog do not apply to it). Copy tools\test\overlay to a scratch folder, add
// kubejs\config\gg_test_qbc.json = {"enabled": true} to it, then
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite client -OverlayDir <that folder>
// One marker per run: the tests drive the same player.
//
// MARKERS: GGTEST|qbc|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|qbc|DONE.
// TEST AREA: Overworld band X 13056-13119, Z 0-63, Y 98-112 (force-loaded and cleared, smooth stone floor at Y 98); on the Moon and on
// Mars X 13084-13092, Z 28-36, Y 198-214 (cleared, a 7x7 floor at Y 198). Everything is cleared again at the end, the player goes back
// where it was, in its game mode. The 1,000+ block trip only stands the player on the ground there.
// Partners: client_scripts/gg_test_qbc.js (clicks, what the client shows, EMI) and startup_scripts/gg_test_qbc.js (action bar and
// chat messages the client gets; menus the server opens and closes).
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var TAG = 'GGTEST|qbc|'
  var MARKER = 'kubejs/config/gg_test_qbc.json'
  var REQ = 'ggTestQbcRequest'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()

  var EARTH = 'minecraft:overworld'
  var LUNA = 'gcyr:luna'
  var MARS = 'gcyr:mars'
  var BAND = { x0: 13056, x1: 13119, y0: 98, y1: 112, z0: 0, z1: 63 }
  var FLOOR_Y = 98
  // the home network, all in chunk 816,1 (X 13056-13071, Z 16-31)
  var QNB0 = { x: 13060, y: 99, z: 20 }
  var LINK = { x: 13061, y: 99, z: 21 }
  var CELL = { x: 13059, y: 99, z: 21 }
  var DRIVE = { x: 13063, y: 99, z: 21 }
  var WAP = { x: 13063, y: 100, z: 21 }
  // AE2's explosion ritual the way gg_test_moon.js does it (proven there): the inputs on an obsidian block, a 1-tick TNT on them. In the
  // band's cleared cavity: the floor is 6 blocks under the blast (shielded by the obsidian), the band's top 8 above: nothing outside the
  // band is in reach
  var RITUAL = { x: 13100, y: 105, z: 48 }
  var OFF_FLOOR = { x0: 13085, x1: 13091, y: 198, z0: 29, z1: 35 }
  var OFF_CLEAR = { x0: 13084, x1: 13092, y0: 198, y1: 214, z0: 28, z1: 36 }
  var CONTROL = { x: 13090, y: 199, z: 34 }   // one block in from the floor's corner: what it pops lands on the floor
  var FAR_X = 13088
  var FAR_Z = [1104, 1136, 1168, 1200, 1232, 1264, 1296, 1328]
  var SPOTS = {
    near: { name: 'near', dim: EARTH, x: 13063.5, y: 99, z: 28.5, yaw: 0, pitch: -20 },
    band: { name: 'band', dim: EARTH, x: 13115.5, y: 99, z: 28.5, yaw: 0, pitch: -20 },
    moon: { name: 'moon', dim: LUNA, x: 13088.5, y: 199, z: 32.5, yaw: 180, pitch: -20 },
    mars: { name: 'mars', dim: MARS, x: 13088.5, y: 199, z: 32.5, yaw: 180, pitch: -20 }
  }

  var TERMINAL = 'ae2:wireless_crafting_terminal'
  var CARD = 'ae2wtlib:quantum_bridge_card'
  var ENTANGLED = 'ae2:quantum_entangled_singularity'
  var SINGULARITY = 'ae2:singularity'
  var KNOWN = 'minecraft:diamond'
  var KNOWN_COUNT = 1024
  var PAIR_KEY = 'grindless_planet'
  var SUIT = { HEAD: 'gcyr:space_helmet', CHEST: 'gcyr:space_chestplate', LEGS: 'gcyr:space_leggings', FEET: 'gcyr:space_boots' }
  var SUIT_OXYGEN = 16000

  var START_TICKS = 60
  var OBSERVE = 40          // ticks after the client reports the click before the menu is judged
  var CLICK_TIMEOUT = 400
  var REPO_TIMEOUT = 120
  var EXTRACT_TIMEOUT = 120
  var CLOSE_TIMEOUT = 100
  var SETTLE_MIN = 60
  var SETTLE_MAX = 900
  var WATCH_TICKS = 100     // ticks on the Moon with the singularity in the terminal (our rule checks every 20)
  var STEP_TIMEOUT = 2400
  var TEST_TIMEOUT = 30000

  var T = null
  var J = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    if (!ok) T.failed.push(name)
    T.table.push({ name: name, status: ok ? 'PASS' : 'FAIL' })
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  function f1(n) {
    return (Math.round(Number(n) * 10) / 10).toString()
  }

  // ---------------------------------------------------------------- Java

  function cls() {
    if (J !== null) return J
    J = {
      ArrayList: Java.loadClass('java.util.ArrayList'),
      CHM: Java.loadClass('java.util.concurrent.ConcurrentHashMap'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      GlobalPos: Java.loadClass('net.minecraft.core.GlobalPos'),
      AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
      Vec3: Java.loadClass('net.minecraft.world.phys.Vec3'),
      ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
      BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Heightmap: Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types'),
      GTRecipe: Java.loadClass('com.gregtechceu.gtceu.api.recipe.GTRecipe'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      QBE: Java.loadClass('appeng.blockentity.qnb.QuantumBridgeBlockEntity'),
      AEItemKey: Java.loadClass('appeng.api.stacks.AEItemKey'),
      Actionable: Java.loadClass('appeng.api.config.Actionable'),
      ActionSource: Java.loadClass('appeng.api.networking.security.IActionSource'),
      TransformLogic: Java.loadClass('appeng.recipes.transform.TransformLogic'),
      Locatables: Java.loadClass('appeng.api.features.Locatables'),
      GridLinkables: Java.loadClass('appeng.api.features.GridLinkables'),
      Upgrades: Java.loadClass('appeng.api.upgrades.Upgrades'),
      UpgradeInventories: Java.loadClass('appeng.api.upgrades.UpgradeInventories'),
      SlotSemantics: Java.loadClass('appeng.menu.SlotSemantics'),
      AEConfig: Java.loadClass('appeng.core.AEConfig'),
      WTSlots: Java.loadClass('de.mari_023.ae2wtlib.AE2wtlibSlotSemantics'),
      ItemWT: Java.loadClass('de.mari_023.ae2wtlib.terminal.ItemWT'),
      WUTHandler: Java.loadClass('de.mari_023.ae2wtlib.wut.WUTHandler'),
      AE2wtlib: Java.loadClass('de.mari_023.ae2wtlib.AE2wtlib')
    }
    return J
  }

  function asArray(coll) {
    if (coll === null || coll === undefined) return []
    var list = new (cls().ArrayList)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function bp(p) {
    return new (cls().BlockPos)(p.x, p.y, p.z)
  }

  function at(p) {
    return p.x + ' ' + p.y + ' ' + p.z
  }

  function cmd(dim, text) {
    return Number(T.server.runCommandSilent('execute in ' + dim + ' run ' + text))
  }

  function itemId(stack) {
    return String(cls().BI.ITEM.getKey(stack.getItem()))
  }

  function aeKey(id) {
    return cls().AEItemKey['of(net.minecraft.world.level.ItemLike)'](Item.of(id).getItem())
  }

  function byId(id) {
    var opt = T.server.getRecipeManager().byKey(new (cls().RL)(id))
    return opt.isPresent() ? opt.get() : null
  }

  function ingText(ing) {
    try {
      return String(ing.toJson())
    } catch (e) {
      return '?'
    }
  }

  // a field Rhino may only know by its SRG name
  function jget(obj, names) {
    for (var i = 0; i < names.length; i++) {
      try {
        var v = obj[names[i]]
        if (v !== undefined && v !== null && typeof v !== 'function') return v
      } catch (e) { /* next name */ }
    }
    return null
  }

  // ---------------------------------------------------------------- shared state with the client half and the startup script

  // ConcurrentHashMap: the integrated server thread writes while the render thread reads (same JVM in the client suite)
  function shared() {
    if (!global.ggQbc) global.ggQbc = new (Java.loadClass('java.util.concurrent.ConcurrentHashMap'))()
    return global.ggQbc
  }

  function sval(key) {
    var v = shared().get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function seqOf(kind) {
    var v = Number(sval(kind + 'Seq'))
    return isNaN(v) ? 0 : v
  }

  // entries the startup script recorded after a sequence number: 'msg' (client messages) or 'menu' (server menus)
  function since(kind, seq0) {
    var out = []
    var last = seqOf(kind)
    for (var i = seq0 + 1; i <= last; i++) out.push(sval(kind + '_' + i))
    return out
  }

  // identical messages in a row as one entry with a count: the action bar repeats some every tick
  function summarize(list) {
    var out = []
    var prev = null
    var n = 0
    list.forEach(function (m) {
      if (m === prev) {
        n++
        return
      }
      if (prev !== null) out.push(prev + (n > 1 ? ' x' + n : ''))
      prev = m
      n = 1
    })
    if (prev !== null) out.push(prev + (n > 1 ? ' x' + n : ''))
    return out.length > 0 ? out.join(' / ') : 'none'
  }

  function enabledByMarker() {
    try {
      var m = JsonIO.read(MARKER)
      return m !== null && m !== undefined && String(m.get('enabled')) === 'true'
    } catch (e) {
      return false
    }
  }

  // ---------------------------------------------------------------- the player

  function testPlayer(server) {
    var list = new (Java.loadClass('java.util.ArrayList'))(server.getPlayerList().getPlayers())
    for (var i = 0; i < list.size(); i++) {
      var p = list.get(i)
      if (T.playerName === '' || String(p.getName().getString()) === T.playerName) return p
    }
    return null
  }

  function dimOf(p) {
    return String(p.getLevel().getDimension())
  }

  function posText(p) {
    return f1(p.getX()) + ' ' + f1(p.getY()) + ' ' + f1(p.getZ())
  }

  function menuOf(p) {
    return jget(p, ['containerMenu', 'f_36096_'])
  }

  function isWct(menu) {
    return menu !== null && menu !== undefined && String(menu.getClass().getName()).indexOf('WCTMenu') >= 0
  }

  function heldTerm(p) {
    var s = p.getMainHandItem()
    return String(s.getId()) === TERMINAL ? s : null
  }

  function countInv(p, id) {
    var inv = p.getInventory()
    var n = 0
    for (var i = 0; i < inv.getContainerSize(); i++) {
      var s = inv.getItem(i)
      if (!s.isEmpty() && String(s.getId()) === id) n += s.getCount()
    }
    return n
  }

  function qeFreq(stack) {
    return stack === null ? 0 : Number(cls().ItemWT.getQEFrequency(stack, null))
  }

  function cardIn(stack) {
    var L = cls()
    return stack !== null && !!L.UpgradeInventories.forItem(stack, L.WUTHandler.getUpgradeCardCount()).isInstalled(L.AE2wtlib.QUANTUM_BRIDGE_CARD)
  }

  function termState(p) {
    var s = heldTerm(p)
    if (s === null) return { ok: false, card: false, freq: 0, linked: false, power: 0, text: 'the player does not hold ' + TERMINAL + ' (holds ' + p.getMainHandItem().getId() + ')' }
    var o = { ok: true, card: cardIn(s), freq: qeFreq(s), linked: s.getItem().getLinkedPosition(s) !== null, power: Number(s.getItem().getAECurrentPower(s)) }
    o.text = 'card ' + (o.card ? 'in' : 'out') + ', singularity ' + (o.freq !== 0 ? 'freq ' + o.freq : 'none') + ', access point link ' + (o.linked ? 'yes' : 'no') +
      ', battery ' + Math.round(o.power) + ' AE'
    return o
  }

  function gameModeOf(p) {
    try {
      var gm = jget(p, ['gameMode', 'f_8941_'])
      return String(gm.getGameModeForPlayer().getName())
    } catch (e) {
      try { return p.isCreative() ? 'creative' : 'survival' } catch (e2) { return 'survival' }
    }
  }

  function remember(p) {
    return { x: Number(p.getX()), y: Number(p.getY()), z: Number(p.getZ()), yaw: Number(p.getYaw()), pitch: Number(p.getPitch()), mode: gameModeOf(p),
      dim: dimOf(p) }
  }

  function teleport(p, s) {
    try {
      p.teleportTo(s.dim, s.x, s.y, s.z, s.yaw, s.pitch)
    } catch (e) {
      T.server.runCommandSilent('execute in ' + s.dim + ' run tp ' + T.playerName + ' ' + s.x + ' ' + s.y + ' ' + s.z + ' ' + s.yaw + ' ' + s.pitch)
    }
  }

  function wapDistance(p) {
    if (dimOf(p) !== EARTH) return -1
    var dx = WAP.x - Number(p.getX())
    var dy = WAP.y - Number(p.getY())
    var dz = WAP.z - Number(p.getZ())
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  function whereText(p) {
    var d = wapDistance(p)
    return dimOf(p) + ' at ' + posText(p) + (d >= 0 ? ', ' + f1(d) + ' blocks from the access point (range ' + f1(T.range) + ')' : ', another dimension than the access point')
  }

  // ---------------------------------------------------------------- the network

  function gridOf(be) {
    if (be === null || be === undefined) return null
    var node = be.getMainNode()
    return node === null || node === undefined ? null : node.getGrid()
  }

  function storedIn(grid, id) {
    if (grid === null || grid === undefined) return -1
    return Number(grid.getStorageService().getInventory().getAvailableStacks().get(aeKey(id)))
  }

  // the home bridge in AE2's registry, without touching the home chunk: '+', '-' or ''
  function registered() {
    var R = cls().Locatables.quantumNetworkBridges()
    var plus = R.get(T.earth, T.freq)
    var minus = R.get(T.earth, -T.freq)
    if (plus !== null && minus !== null) return '+/-'
    return plus !== null ? '+' : minus !== null ? '-' : ''
  }

  function killStrays(dim, box) {
    return cmd(dim, 'kill @e[type=!minecraft:player,x=' + box.x0 + ',y=' + box.y0 + ',z=' + box.z0 + ',dx=' + (box.x1 - box.x0) + ',dy=' +
      (box.y1 - box.y0) + ',dz=' + (box.z1 - box.z0) + ']')
  }

  function itemsNear(level, p, r, id) {
    var L = cls()
    var box = new L.AABB(p.x - r, p.y - r, p.z - r, p.x + r + 1, p.y + r + 1, p.z + r + 1)
    return asArray(level.getEntitiesOfClass(L.ItemEntity, box)).filter(function (e) { return !e.isRemoved() && itemId(e.getItem()) === id })
  }

  // ---------------------------------------------------------------- static checks

  // the recipes (any type) that make each id: GT recipes by their output items, the rest by their result
  function producers(ids) {
    var L = cls()
    var want = {}
    ids.forEach(function (id) { want[id] = [] })
    var ra = T.server.registryAccess()
    var all = new L.ArrayList(T.server.getRecipeManager().getRecipes())
    for (var i = 0; i < all.size(); i++) {
      var r = all.get(i)
      var outs = []
      try {
        if (r instanceof L.GTRecipe) {
          var l = L.RecipeHelper.getOutputItems(r)
          for (var k = 0; k < l.size(); k++) outs.push(itemId(l.get(k)))
        } else {
          var res = r.getResultItem(ra)
          if (res !== null && !res.isEmpty()) outs.push(itemId(res))
        }
      } catch (e) { /* a recipe type without a plain result */ }
      for (var o = 0; o < outs.length; o++) {
        if (want[outs[o]] && want[outs[o]].length < 6) want[outs[o]].push(String(r.getId()) + ' [' + String(r.getType()) + ']')
      }
    }
    return want
  }

  function staticChecks() {
    var L = cls()
    var ra = T.server.registryAccess()

    var r = byId(CARD)
    if (r === null) {
      check('card_recipe', false, 'no recipe ' + CARD + ' on the server')
    } else {
      var res = r.getResultItem(ra)
      var ings = asArray(r.getIngredients()).map(ingText).filter(function (t) { return t !== '' && t !== '[]' })
      var pearls = ings.filter(function (t) { return t.indexOf('ae2:fluix_pearl') >= 0 }).length
      var receivers = ings.filter(function (t) { return t.indexOf('ae2:wireless_receiver') >= 0 }).length
      check('card_recipe', itemId(res) === CARD && pearls === 2 && receivers === 1 && ings.length === 3, String(r.getId()) + ' (' + String(r.getType()) +
        ', shaped "a a" / " b "): ' + ings.join(' + ') + ' -> ' + res.getCount() + 'x ' + itemId(res) + ' (fluix pearls ' + pearls + ', wireless receivers ' + receivers + ')')
    }

    var H = global.grindless && global.grindless.hidden
    var shown = [CARD, 'ae2:fluix_pearl', 'ae2:wireless_receiver', 'ae2:quartz_fiber', TERMINAL, 'ae2:wireless_access_point', 'ae2:quantum_ring', 'ae2:quantum_link',
      SINGULARITY, ENTANGLED, 'ae2:condenser', 'ae2:ender_dust']
    var hidden = shown.filter(function (id) {
      var s = Item.of(id)
      return s.hasTag('c:hidden_from_recipe_viewers') || s.hasTag('grindless:hidden_with_recipes') || (H && typeof H.isHidden === 'function' && H.isHidden(id))
    })
    var missing = shown.filter(function (id) { return !Item.exists(id) })
    check('card_not_hidden', hidden.length === 0 && missing.length === 0, 'not in #c:hidden_from_recipe_viewers, #grindless:hidden_with_recipes or ' +
      'global.grindless.hidden (implemented era ' + (H ? H.implementedEra : '?') + '): ' + shown.join(', ') +
      (hidden.length > 0 ? '; HIDDEN: ' + hidden.join(', ') : '') + (missing.length > 0 ? '; not registered: ' + missing.join(', ') : ''))

    var needed = [CARD, 'ae2:fluix_pearl', 'ae2:wireless_receiver', 'ae2:quartz_fiber', 'ae2:fluix_dust', ENTANGLED, 'ae2:ender_dust', 'ae2:condenser',
      'ae2:quantum_ring', 'ae2:quantum_link', TERMINAL, 'ae2:wireless_access_point']
    var prod = producers(needed.concat([SINGULARITY]))
    needed.concat([SINGULARITY]).forEach(function (id) {
      note('made_by', id + ' <- ' + (prod[id].length > 0 ? prod[id].join(', ') : 'no recipe' + (id === SINGULARITY ? ' (AE2\'s matter condenser makes it)' : '')))
    })
    var none = needed.filter(function (id) { return prod[id].length === 0 })
    check('ingredients', none.length === 0, none.length === 0 ? 'every part of the card, the pair, the bridge and the terminal has a recipe on the server ' +
      '(made_by NOTE lines); the AE2 singularity comes from the matter condenser' : 'no recipe makes: ' + none.join(', '))

    var card = Item.of(CARD).getItem()
    var terms = ['ae2:wireless_terminal', TERMINAL, 'ae2wtlib:wireless_pattern_encoding_terminal', 'ae2wtlib:wireless_pattern_access_terminal',
      'ae2wtlib:wireless_universal_terminal', 'wcwt:wireless_comprehensive_work_terminal']
    var max = {}
    terms.forEach(function (t) { max[t] = Item.exists(t) ? Number(L.Upgrades.getMaxInstallable(card, Item.of(t).getItem())) : -1 })
    check('terminals', max[TERMINAL] >= 1 && max['ae2wtlib:wireless_universal_terminal'] >= 1, 'quantum bridge cards each terminal takes (AE2 Upgrades ' +
      'registry; -1 = not in the pack): ' + terms.map(function (t) { return t + '=' + max[t] }).join(', ') + '; AE2WTLib upgrade slots on its terminals: ' +
      L.WUTHandler.getUpgradeCardCount())

    var rituals = ['ae2:transform/entangled_singularity', 'ae2:transform/entangled_singularity_from_pearl'].map(function (id) {
      var rr = byId(id)
      return { id: id, ok: rr !== null, text: rr === null ? id + ' MISSING' : id + ': ' + asArray(rr.getIngredients()).map(ingText).join(' + ') + ' -> ' +
        rr.getResultItem(ra).getCount() + 'x ' + itemId(rr.getResultItem(ra)) }
    })
    check('earth_pair_ritual', rituals.every(function (x) { return x.ok }), 'AE2\'s explosion ritual for an ordinary Earth pair: ' +
      rituals.map(function (x) { return x.text }).join('; '))

    var cfg = L.AEConfig.instance()
    T.range = Number(cfg.wireless_getMaxRange(0))
    note('wireless_range', 'access point range: ' + f1(T.range) + ' blocks with no booster, ' + f1(cfg.wireless_getMaxRange(64)) + ' with 64 boosters ' +
      '(AE2 wirelessBaseRange + boosters^wirelessBoosterExp)')
  }

  // ---------------------------------------------------------------- the world

  function prepareEarth() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) T.earth.getChunk(cx, cz)
    }
    T.earthTouched = true
    var fl = cmd(EARTH, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var a = cmd(EARTH, 'fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' 31 minecraft:air')
    var b = cmd(EARTH, 'fill ' + BAND.x0 + ' ' + BAND.y0 + ' 32 ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' minecraft:air')
    var f = cmd(EARTH, 'fill ' + BAND.x0 + ' ' + FLOOR_Y + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + FLOOR_Y + ' ' + BAND.z1 + ' minecraft:smooth_stone')
    var k = killStrays(EARTH, BAND)
    note('area', 'Earth band X ' + BAND.x0 + '-' + BAND.x1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ': generated, forceload ' + fl +
      ', cleared ' + (a + b) + ' blocks, floor ' + f + ', stray entities ' + k)
  }

  function buildHome() {
    var failed = []
    function put(p, block) {
      if (cmd(EARTH, 'setblock ' + at(p) + ' ' + block + ' replace') < 1) failed.push(block + ' at ' + at(p))
    }
    for (var dx = 0; dx < 3; dx++) {
      for (var dz = 0; dz < 3; dz++) put({ x: QNB0.x + dx, y: QNB0.y, z: QNB0.z + dz }, dx === 1 && dz === 1 ? 'ae2:quantum_link' : 'ae2:quantum_ring')
    }
    put(CELL, 'ae2:creative_energy_cell')
    put(DRIVE, 'ae2:drive[facing=east,spin=0]')
    put(WAP, 'ae2:wireless_access_point[facing=up]')
    var drive = T.earth.getBlockEntity(bp(DRIVE))
    if (drive === null) failed.push('no drive block entity')
    else drive.getInternalInventory().setItemDirect(0, Item.of('ae2:item_storage_cell_1k'))
    check('build', failed.length === 0, 'Earth: 3x3 quantum bridge X ' + QNB0.x + '-' + (QNB0.x + 2) + ' Z ' + QNB0.z + '-' + (QNB0.z + 2) + ' (link chamber ' +
      at(LINK) + '), creative energy cell ' + at(CELL) + ', ME drive ' + at(DRIVE) + ' (front east, 1k item cell), wireless access point ' + at(WAP) +
      ' (antenna up, no booster); no controller (ad-hoc network)' + (failed.length > 0 ? '; FAILED: ' + failed.join(', ') : ''))
    return failed.length === 0
  }

  // the Moon or Mars spot: cleared, with a 7x7 floor; its chunks generated first
  function prepareOffWorld(dim) {
    var level = T.server.getLevel(dim)
    for (var cx = OFF_CLEAR.x0 >> 4; cx <= OFF_CLEAR.x1 >> 4; cx++) {
      for (var cz = OFF_CLEAR.z0 >> 4; cz <= OFF_CLEAR.z1 >> 4; cz++) level.getChunk(cx, cz)
    }
    T.offTouched[dim] = true
    var a = cmd(dim, 'fill ' + OFF_CLEAR.x0 + ' ' + OFF_CLEAR.y0 + ' ' + OFF_CLEAR.z0 + ' ' + OFF_CLEAR.x1 + ' ' + OFF_CLEAR.y1 + ' ' + OFF_CLEAR.z1 + ' minecraft:air')
    var f = cmd(dim, 'fill ' + OFF_FLOOR.x0 + ' ' + OFF_FLOOR.y + ' ' + OFF_FLOOR.z0 + ' ' + OFF_FLOOR.x1 + ' ' + OFF_FLOOR.y + ' ' + OFF_FLOOR.z1 + ' minecraft:smooth_stone')
    note('area_' + dim.replace(':', '_'), dim + ' X ' + OFF_CLEAR.x0 + '-' + OFF_CLEAR.x1 + ' Z ' + OFF_CLEAR.z0 + '-' + OFF_CLEAR.z1 + ' Y ' + OFF_CLEAR.y0 + '-' +
      OFF_CLEAR.y1 + ': cleared ' + a + ' blocks, floor ' + f + ' at Y ' + OFF_FLOOR.y)
  }

  function clearOffWorld(dim) {
    if (!T.offTouched[dim]) return
    var level = T.server.getLevel(dim)
    for (var cx = OFF_CLEAR.x0 >> 4; cx <= OFF_CLEAR.x1 >> 4; cx++) {
      for (var cz = OFF_CLEAR.z0 >> 4; cz <= OFF_CLEAR.z1 >> 4; cz++) level.getChunk(cx, cz)
    }
    T.offTouched[dim] = false
    var a = cmd(dim, 'fill ' + OFF_CLEAR.x0 + ' ' + OFF_CLEAR.y0 + ' ' + OFF_CLEAR.z0 + ' ' + OFF_CLEAR.x1 + ' ' + OFF_CLEAR.y1 + ' ' + OFF_CLEAR.z1 + ' minecraft:air')
    var k = killStrays(dim, { x0: OFF_CLEAR.x0, y0: OFF_CLEAR.y0, z0: OFF_CLEAR.z0, x1: OFF_CLEAR.x1, y1: OFF_CLEAR.y1, z1: OFF_CLEAR.z1 })
    note('cleanup_' + dim.replace(':', '_'), 'cleared ' + a + ' blocks, ' + k + ' stray entities removed')
  }

  function clearEarth() {
    if (!T.earthTouched) return
    T.earthTouched = false
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) T.earth.getChunk(cx, cz)
    }
    var a = cmd(EARTH, 'fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' 31 minecraft:air')
    var b = cmd(EARTH, 'fill ' + BAND.x0 + ' ' + BAND.y0 + ' 32 ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' minecraft:air')
    var k = killStrays(EARTH, BAND)
    var r = cmd(EARTH, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    note('cleanup_earth', 'cleared ' + (a + b) + ' blocks of the band, ' + k + ' stray entities removed, forceload remove ' + r)
  }

  // 1,000+ blocks south of the access point, on the ground the world made there (nothing is placed): the first column whose top block
  // is solid and dry
  function pickFarSpot() {
    var L = cls()
    var first = null
    for (var i = 0; i < FAR_Z.length; i++) {
      var z = FAR_Z[i]
      T.earth.getChunk(FAR_X >> 4, z >> 4)
      var h = Number(T.earth.getHeight(L.Heightmap.MOTION_BLOCKING_NO_LEAVES, FAR_X, z))
      var below = T.earth.getBlockState(new L.BlockPos(FAR_X, h - 1, z))
      var ground = String(L.BI.BLOCK.getKey(below.getBlock()))
      var spot = { name: 'far', dim: EARTH, x: FAR_X + 0.5, y: h, z: z + 0.5, yaw: 0, pitch: -20, ground: ground }
      if (first === null) first = spot
      if (below.getFluidState().isEmpty() && below.blocksMotion()) return spot
    }
    return first
  }

  // ---------------------------------------------------------------- the player's kit

  function preparePlayer(p) {
    var n = T.playerName
    T.origin = remember(p)
    cmd(EARTH, 'gamemode survival ' + n)
    ;['minecraft:resistance 3600 255', 'minecraft:fire_resistance 3600 0', 'minecraft:water_breathing 3600 0', 'minecraft:saturation 3600 0',
      'minecraft:night_vision 3600 0'].forEach(function (e) { cmd(EARTH, 'effect give ' + n + ' ' + e + ' true') })
    p.setHeadArmorItem(Item.of(SUIT.HEAD))
    p.setChestArmorItem(Item.of(SUIT.CHEST, '{Fluid:{FluidName:"gtceu:oxygen",Amount:' + SUIT_OXYGEN + '}}'))
    p.setLegsArmorItem(Item.of(SUIT.LEGS))
    p.setFeetArmorItem(Item.of(SUIT.FEET))
    var term = Item.of(TERMINAL)
    term.getItem().injectAEPower(term, term.getItem().getAEMaxPower(term), cls().Actionable.MODULATE)
    p.setMainHandItem(term)
    cmd(EARTH, 'time set 6000')
    cmd(EARTH, 'weather clear')
    T.cycle = cmd(EARTH, 'gamerule doDaylightCycle false')
    T.mobs = cmd(EARTH, 'gamerule doMobSpawning false')
    teleport(p, SPOTS.near)
    var ts = termState(p)
    note('player', 'player ' + n + ' (was ' + T.origin.mode + ' in ' + T.origin.dim + ' at ' + Math.round(T.origin.x) + ' ' + Math.round(T.origin.y) + ' ' +
      Math.round(T.origin.z) + ') in survival, GCYR space suit with oxygen, resistance; holds ' + TERMINAL + ' (' + ts.text + '); at ' + posText(p) + ' in ' + dimOf(p) +
      '; noon, clear weather, daylight cycle and mob spawning off')
  }

  function restorePlayer(server) {
    if (T.origin === null) return
    var p = testPlayer(server)
    if (p === null) return
    var o = T.origin
    T.origin = null
    try { p.closeMenu() } catch (e) { /* no menu */ }
    try {
      p.setHeadArmorItem(Item.empty)
      p.setChestArmorItem(Item.empty)
      p.setLegsArmorItem(Item.empty)
      p.setFeetArmorItem(Item.empty)
    } catch (e) {
      note('restore', 'armor not removed: ' + e)
    }
    var c1 = cmd(EARTH, 'clear ' + T.playerName + ' ' + TERMINAL)
    var c2 = cmd(EARTH, 'clear ' + T.playerName + ' ' + KNOWN)
    cmd(EARTH, 'effect clear ' + T.playerName)
    try {
      p.teleportTo(o.dim, o.x, o.y, o.z, o.yaw, o.pitch)
    } catch (e) {
      note('restore', 'teleport back failed: ' + e)
    }
    var r = cmd(EARTH, 'gamemode ' + o.mode + ' ' + T.playerName)
    note('restore', 'player back in ' + o.dim + ' at ' + Math.round(o.x) + ' ' + Math.round(o.y) + ' ' + Math.round(o.z) + ' in ' + o.mode + ' (gamemode result ' + r +
      '); removed the terminal (' + c1 + '), ' + c2 + ' diamonds, the suit and the effects')
  }

  // ---------------------------------------------------------------- the step engine

  function go(i) {
    T.step = i
    T.since = T.t
    T.st = {}
  }

  function indexOf(name) {
    for (var i = 0; i < STEPS.length; i++) if (STEPS[i][0] === name) return i
    return STEPS.length - 1
  }

  // a step that cannot go on: the cases are skipped, the player goes home and the area is cleaned
  function abort(reason) {
    if (T.aborted) return
    T.aborted = reason
    note('abort', reason)
  }

  // ---------------------------------------------------------------- steps: setup, ritual, boot

  function stepSetup(p, age, st) {
    if (age < START_TICKS) return false
    T.playerName = String(p.getName().getString())
    T.earth = T.server.getLevel(EARTH)
    T.moon = T.server.getLevel(LUNA)
    T.mars = T.server.getLevel(MARS)
    if (T.moon === null || T.mars === null || T.moon === undefined || T.mars === undefined) {
      check('levels', false, LUNA + ' or ' + MARS + ' is not loaded')
      abort('no GCYR levels')
      return true
    }
    try {
      staticChecks()
    } catch (e) {
      check('static', false, 'exception: ' + e)
    }
    prepareEarth()
    var built = false
    try {
      built = buildHome()
    } catch (e) {
      check('build', false, 'exception: ' + e)
    }
    preparePlayer(p)
    if (!built) abort('the home network was not built')
    return true
  }

  // AE2's explosion ritual: an AE2 singularity and an ender pearl on an obsidian block, a TNT with a 1-tick fuse on them
  function stepRitual(p, age, st) {
    var L = cls()
    var box = { x0: RITUAL.x - 7, y0: BAND.y0, z0: RITUAL.z - 7, x1: RITUAL.x + 7, y1: BAND.y1, z1: RITUAL.z + 7 }
    function where(e) {
      return e.isRemoved() ? 'removed' : f1(e.getX()) + ' ' + f1(e.getY()) + ' ' + f1(e.getZ())
    }
    if (!st.started) {
      // the inputs only tick (and only get hit) once the force-loaded chunk's entities tick
      var ticking = true
      try { ticking = !!T.earth.isPositionEntityTicking(bp(RITUAL)) } catch (e) { ticking = true }
      if ((!ticking || age < 40) && age < 400) return false
      st.started = true
      st.at = age
      st.ticking = ticking
      st.base = cmd(EARTH, 'setblock ' + RITUAL.x + ' ' + (RITUAL.y - 1) + ' ' + RITUAL.z + ' minecraft:obsidian replace')
      var a = new L.ItemEntity(T.earth, RITUAL.x + 0.5, RITUAL.y + 0.05, RITUAL.z + 0.5, Item.of(SINGULARITY))
      var b = new L.ItemEntity(T.earth, RITUAL.x + 0.5, RITUAL.y + 0.05, RITUAL.z + 0.5, Item.of('minecraft:ender_pearl'))
      a.setDeltaMovement(L.Vec3.ZERO)
      b.setDeltaMovement(L.Vec3.ZERO)
      T.earth.addFreshEntity(a)
      T.earth.addFreshEntity(b)
      st.items = [a, b]
      st.pre = 'AE2 TransformLogic.canTransformInExplosion: singularity ' + L.TransformLogic.canTransformInExplosion(a) + ', pearl ' +
        L.TransformLogic.canTransformInExplosion(b)
      st.tnt = cmd(EARTH, 'summon minecraft:tnt ' + (RITUAL.x + 0.5) + ' ' + RITUAL.y + ' ' + (RITUAL.z + 0.5) + ' {Fuse:1s}')
      return false
    }
    if (age - st.at < 30) return false
    var how = 'the explosion (AE2 transform)'
    var tntLeft = cmd(EARTH, 'execute if entity @e[type=minecraft:tnt,x=' + (RITUAL.x - 8) + ',y=' + BAND.y0 + ',z=' + (RITUAL.z - 8) + ',dx=16,dy=14,dz=16]')
    var diag = st.pre + '; entity ticking at the spot ' + st.ticking + ' (waited ' + st.at + ' ticks); obsidian ' + st.base + ', TNT summoned ' + st.tnt +
      ', TNT still there 30 ticks later: ' + (tntLeft > 0 ? 'yes' : 'no')
    var found = itemsNear(T.earth, RITUAL, 6, ENTANGLED)
    if (found.length === 0) {
      var alive = st.items.filter(function (e) { return !e.isRemoved() })
      diag += '; after the blast: singularity ' + where(st.items[0]) + ', pearl ' + where(st.items[1])
      if (alive.length === 2) {
        var done = L.TransformLogic.tryTransform(alive[0], function (c) { return c.isExplosion() })
        found = itemsNear(T.earth, RITUAL, 6, ENTANGLED)
        how = 'AE2 TransformLogic.tryTransform called directly (returned ' + done + '; the explosion did not transform)'
      } else {
        how = 'the explosion destroyed ' + (2 - alive.length) + ' input(s)'
      }
    }
    var stack = null
    var count = 0
    found.forEach(function (e) {
      count += e.getItem().getCount()
      if (stack === null) stack = e.getItem().copy()
    })
    var tag = stack === null ? null : stack.getNbt()
    var freq = tag !== null && tag.contains('freq') ? Number(tag.getLong('freq')) : 0
    var mark = tag !== null && tag.contains(PAIR_KEY) ? String(tag.getString(PAIR_KEY)) : ''
    var ok = count === 2 && freq !== 0 && mark === ''
    check('ritual', ok, 'an AE2 singularity + an ender pearl in a TNT explosion on Earth (on obsidian at ' + at(RITUAL) + '), by ' + how + ': ' +
      (stack === null ? 'no entangled singularity' : count + 'x ' + itemId(stack) + ', freq ' + freq + ', ' + PAIR_KEY + '=' + (mark === '' ? '(none: an ordinary Earth pair)' : mark)) +
      ' [' + diag + ']')
    if (!ok) {
      // keep going with a pair made the way the ritual makes it (AE2's assignFrequency), so the terminal itself is still tested
      stack = Item.of(ENTANGLED, 2)
      L.QBE.assignFrequency(stack)
      freq = Number(stack.getNbt().getLong('freq'))
      note('ritual_fallback', 'pair made by QuantumBridgeBlockEntity.assignFrequency instead: freq ' + freq)
    }
    found.forEach(function (e) { e.discard() })
    T.freq = freq
    T.halfA = stack.copy()
    T.halfA.setCount(1)
    T.halfB = stack.copy()
    T.halfB.setCount(1)
    cmd(EARTH, 'setblock ' + RITUAL.x + ' ' + (RITUAL.y - 1) + ' ' + RITUAL.z + ' minecraft:air')
    killStrays(EARTH, box)
    return true
  }

  // the network boots, the drive gets its diamonds, one half goes into the home link chamber, the terminal is linked at the access point
  function stepBoot(p, age, st) {
    var L = cls()
    if (age < 40) return false
    var be = T.earth.getBlockEntity(bp(LINK))
    var formed = be !== null && be.isFormed()
    var grid = gridOf(be)
    var powered = grid !== null && grid.getEnergyService().isNetworkPowered()
    if (!st.stocked) {
      if (!formed || !powered) {
        if (age < 400) return false
        check('home_bridge', false, 'after ' + age + ' ticks: bridge formed=' + formed + ', network powered=' + powered)
        abort('the home network did not come up')
        return true
      }
      var inv = grid.getStorageService().getInventory()
      st.inserted = (st.inserted || 0) + Number(inv.insert(aeKey(KNOWN), KNOWN_COUNT - (st.inserted || 0), L.Actionable.MODULATE, L.ActionSource.empty()))
      if (st.inserted < KNOWN_COUNT && age < 400) return false
      be.getInternalInventory().setItemDirect(0, T.halfA.copy())
      st.stocked = true
      st.at = age
      return false
    }
    if (age - st.at < 20) return false
    var reg = registered()
    var amount = storedIn(grid, KNOWN)
    var kept = be.getInternalInventory().getStackInSlot(0)
    var keptFreq = kept.isEmpty() || kept.getNbt() === null ? 0 : Number(kept.getNbt().getLong('freq'))
    T.grid = grid
    var ok = formed && powered && reg !== '' && amount === KNOWN_COUNT && keptFreq === T.freq
    check('home_bridge', ok, 'bridge formed=' + formed + ', network powered=' + powered + ' (creative energy cell), ' + amount + ' ' + KNOWN + ' in the drive, the link chamber ' +
      'holds one half (freq ' + keptFreq + '), AE2 Locatables has the home bridge under ' + (reg === '' ? 'NEITHER sign' : reg + 'freq') + ' (its other half is nowhere: ' +
      'the bridge links to no other bridge)')
    if (!ok && reg === '') {
      abort('the home bridge is not registered')
      return true
    }
    // AE2's linkable handler: what the access point's linking slot does with a terminal put into it
    var term = heldTerm(p)
    var wapBe = T.earth.getBlockEntity(bp(WAP))
    var handler = term === null ? null : L.GridLinkables.get(term.getItem())
    var gpos = null
    try {
      gpos = wapBe.getGlobalPos()
    } catch (e) {
      gpos = L.GlobalPos.of(T.earth.getDimensionKey(), bp(WAP))
    }
    if (handler !== null) handler.link(term, gpos)
    T.wapPos = gpos
    var linked = term !== null && term.getItem().getLinkedPosition(term) !== null
    var wapGrid = gridOf(wapBe)
    check('link', linked && wapGrid !== null && wapGrid.equals(grid) && !!wapBe.isActive(), 'terminal linked at the access point ' + at(WAP) + ' by AE2\'s ' +
      'IGridLinkableHandler (' + (handler === null ? 'none registered' : String(handler.getClass().getName())) + '): linked=' + linked + ', access point online=' +
      wapBe.isActive() + ', same network=' + (wapGrid !== null && wapGrid.equals(grid)) + '; ' + termState(p).text)
    return true
  }

  // ---------------------------------------------------------------- travel

  function settled(p, dim, age) {
    if (age < SETTLE_MIN) return false
    if (age >= SETTLE_MAX) return true
    return dimOf(p) === dim && sval('clientDim') === dim && sval('clientScreen') === ''
  }

  function goTo(name, before) {
    return function (p, age, st) {
      var s = SPOTS[name]
      if (T.origin === null) return true
      if (!st.started) {
        st.started = true
        if (before) before(p)
        if (s.dim !== EARTH && !T.offTouched[s.dim]) prepareOffWorld(s.dim)
        teleport(p, s)
        return false
      }
      if (!settled(p, s.dim, age)) return false
      note('travel_' + name, 'player in ' + whereText(p) + ' (server); the client shows ' + (sval('clientDim') || '?') + ', screen ' + (sval('clientScreen') || 'none') +
        ', holding ' + (sval('clientItem') || '?') + ' (' + age + ' ticks)')
      return true
    }
  }

  function goFar(p, age, st) {
    if (!st.started) {
      st.started = true
      st.spot = pickFarSpot()
      T.far = st.spot
      teleport(p, st.spot)
      return false
    }
    if (!settled(p, EARTH, age)) return false
    note('travel_far', 'player in ' + whereText(p) + ', standing on ' + st.spot.ground + ' (natural ground, nothing placed); client ' + (sval('clientDim') || '?') +
      ', screen ' + (sval('clientScreen') || 'none'))
    return true
  }

  // ---------------------------------------------------------------- a right-click case

  function requestClick(st, mode) {
    st.attempt++
    st.token = 'q' + T.t + '_' + st.attempt
    st.msg0 = seqOf('msg')
    st.menu0 = seqOf('menu')
    st.clickTick = -1
    st.srvTicks = 0
    var S = shared()
    S.put('clicked', '')
    S.put('clickedHow', '')
    S.put('clickItem', TERMINAL)
    S.put('clickDim', st.dim)
    S.put('clickMode', mode)
    S.put('clickToken', st.token)
  }

  // what the client saw since the click: 'token|ticks with the terminal screen|ticks|terminal screen now'
  function clientObs(st) {
    var parts = sval('obs').split('|')
    if (parts[0] !== st.token) return { wct: 0, ticks: 0, now: false }
    return { wct: Number(parts[1]), ticks: Number(parts[2]), now: parts[3] === '1' }
  }

  // the server's view of an open terminal menu
  function hostView(p) {
    var m = menuOf(p)
    var v = { open: false, valid: false, linked: false, home: false, amount: -1, menu: m === null ? 'none' : String(m.getClass().getSimpleName()), error: '' }
    if (!isWct(m)) return v
    v.open = true
    try {
      v.valid = !!m.isValidMenu()
      var host = m.getHost()
      v.linked = !!host.isQuantumLinked()
      var node = host.getActionableNode()
      var g = node === null ? null : node.getGrid()
      v.home = g !== null && T.grid !== null && g.equals(T.grid)
      var inv = host.getInventory()
      v.amount = inv === null ? -1 : Number(inv.getAvailableStacks().get(aeKey(KNOWN)))
    } catch (e) {
      v.error = String(e)
    }
    return v
  }

  // the card and the singularity half go into the open terminal's own slots, the way a player drops them in
  function installViaMenu(p) {
    var L = cls()
    var m = menuOf(p)
    var out = []
    if (!isWct(m)) return 'no terminal menu open'
    var card = Item.of(CARD)
    var ups = asArray(m.getSlots(L.SlotSemantics.UPGRADE))
    var cardSlot = null
    ups.forEach(function (s) { if (cardSlot === null && !s.hasItem() && s.mayPlace(card)) cardSlot = s })
    if (cardSlot === null) out.push('no upgrade slot of the ' + ups.length + ' takes the card')
    else {
      cardSlot.set(card)
      out.push('card into an upgrade slot (' + ups.length + ' upgrade slots)')
    }
    var sing = asArray(m.getSlots(L.WTSlots.SINGULARITY))
    if (sing.length === 0) out.push('no singularity slot in the menu')
    else if (!sing[0].mayPlace(T.halfB)) out.push('the singularity slot refuses the half')
    else {
      sing[0].set(T.halfB.copy())
      out.push('singularity half into AE2WTLib\'s singularity slot')
    }
    return out.join('; ')
  }

  function caseStep(spec) {
    return function (p, age, st) {
      if (!st.phase) {
        st.attempt = 0
        st.dim = dimOf(p)
        st.where = whereText(p)
        st.term0 = termState(p)
        st.inv0 = countInv(p, KNOWN)
        requestClick(st, 'key')
        st.phase = 'await_click'
        st.at = age
        return false
      }
      var view = null
      if (isWct(menuOf(p))) st.srvTicks++

      if (st.phase === 'await_click') {
        if (sval('clicked') === st.token) {
          st.how = sval('clickedHow')
          st.phase = 'observe'
          st.at = age
          return false
        }
        if (age - st.at < CLICK_TIMEOUT) return false
        st.noClick = 'the client never performed the click (client: ' + (sval('clientDim') || '?') + ', screen ' + (sval('clientScreen') || 'none') +
          ', holding ' + (sval('clientItem') || '?') + ')'
        st.view = hostView(p)
        st.obs = clientObs(st)
        st.msgs = since('msg', st.msg0)
        st.menus = since('menu', st.menu0)
        st.phase = 'judge'
        return false
      }

      if (st.phase === 'observe') {
        if (age - st.at < OBSERVE) return false
        view = hostView(p)
        st.view = view
        st.obs = clientObs(st)
        st.msgs = since('msg', st.msg0)
        st.menus = since('menu', st.menu0)
        // nothing at all on either side: the click may not have reached the server; the last attempt calls useItem directly
        if (!view.open && st.menus.length === 0 && st.msgs.length === 0 && st.attempt < 2) {
          note('case_' + spec.name + '_retry', 'attempt ' + st.attempt + ' (' + st.how + '): no menu and no message ' + OBSERVE + ' ticks later; clicking again')
          requestClick(st, 'direct')
          st.phase = 'await_click'
          st.at = age
          return false
        }
        if (view.open && spec.works !== false) {
          st.phase = 'repo'
          st.at = age
          return false
        }
        st.phase = 'judge'
        return false
      }

      if (st.phase === 'repo') {
        var known = Number(sval('clientKnown'))
        if (!(known > 0) && age - st.at < REPO_TIMEOUT) return false
        st.view = hostView(p)
        st.clientKnown = known
        st.clientScreen = sval('clientScreen')
        st.clientScreenClass = sval('clientScreenClass')
        st.clientRepo = sval('clientRepo')
        st.clientPower = sval('clientHasPower')
        st.net0 = storedIn(T.grid, KNOWN)
        st.inv1 = countInv(p, KNOWN)
        st.extractToken = 'x' + T.t
        shared().put('extracted', '')
        shared().put('extractItem', KNOWN)
        shared().put('extractToken', st.extractToken)
        st.phase = 'extract'
        st.at = age
        return false
      }

      if (st.phase === 'extract') {
        var got = countInv(p, KNOWN) - st.inv1
        if (!(sval('extracted') === st.extractToken && got > 0) && age - st.at < EXTRACT_TIMEOUT) return false
        st.gained = got
        st.loss = st.net0 - storedIn(T.grid, KNOWN)
        st.extractedHow = sval('extracted') === st.extractToken ? sval('extractedHow') : 'the client did not click the item'
        shared().put('extractToken', '')
        if (spec.install) st.installed = installViaMenu(p)
        st.viewEnd = hostView(p)
        st.msgs = since('msg', st.msg0)
        st.menus = since('menu', st.menu0)
        st.phase = 'judge'
        return false
      }

      if (st.phase === 'judge') {
        judge(p, spec, st)
        st.phase = 'close'
        st.at = age
        return false
      }

      if (st.phase === 'close') {
        if (!st.closed) {
          st.closed = true
          if (isWct(menuOf(p))) {
            try { p.closeMenu() } catch (e) { note('close', 'closeMenu failed: ' + e) }
          }
          return false
        }
        if (sval('clientScreen') !== '' && age - st.at < CLOSE_TIMEOUT) return false
        if (spec.after) spec.after(p, st)
        return true
      }
      return false
    }
  }

  function judge(p, spec, st) {
    var v = st.view
    var obs = st.obs
    var common = 'right-click ' + (st.how || '?') + ' in ' + st.where + '; terminal before: ' + st.term0.text + '; server menus since the click: ' +
      (st.menus.length > 0 ? st.menus.join(', ') : 'none') + '; ' + OBSERVE + ' ticks later the server menu is ' + v.menu + (v.open ? ' (valid ' + v.valid + ')' : '') +
      ', open on the server for ' + st.srvTicks + ' ticks; the client showed the terminal screen for ' + obs.wct + ' of ' + obs.ticks + ' ticks (now ' + obs.now + ')' +
      '; messages to the player: ' + summarize(st.msgs)
    var r = { name: spec.name }
    if (st.noClick) {
      r.ok = false
      r.works = false
      r.detail = 'inconclusive: ' + st.noClick + '; ' + common
    } else if (spec.works === false) {
      r.ok = !v.open && st.srvTicks < 10 && !obs.now
      r.detail = (r.ok ? 'no connection, as expected: ' : 'it reached the network: ') + common
    } else if (!v.open) {
      r.ok = false
      r.works = false
      r.detail = 'the terminal did not stay open: ' + common
    } else {
      var e = st.viewEnd || v
      var linkOk = spec.expectLinked ? v.linked : true
      r.works = v.open && v.valid && v.home && linkOk && st.gained > 0 && st.gained === st.loss
      r.ok = r.works && st.clientKnown === st.net0 && String(st.clientScreenClass).indexOf('WCTScreen') >= 0
      r.detail = (r.ok ? 'reached the home network: ' : 'problem: ') + common + '; host: quantum linked=' + v.linked + (spec.expectLinked ? '' : ' (not needed here)') +
        ', its grid is the home network=' + v.home + ', network diamonds ' + v.amount + (v.error ? ', error ' + v.error : '') + '; the client screen ' + st.clientScreen +
        ' (' + st.clientScreenClass + ') lists ' + st.clientRepo + ' entries, diamond x' + st.clientKnown + ' (network ' + st.net0 + '), hasPower ' + st.clientPower +
        '; ' + st.extractedHow + ': the player got ' + st.gained + ' diamonds, the home drive lost ' + st.loss + '; after: menu open=' + e.open + ', terminal ' +
        termState(p).text + (st.installed ? '; install: ' + st.installed : '')
    }
    T.results[spec.name] = r
    if (spec.works === null) note('case_' + spec.name, (r.works ? 'WORKS without the access point link: ' : 'does NOT work without the access point link: ') + r.detail)
    else check('case_' + spec.name, r.ok, r.detail)
  }

  // ---------------------------------------------------------------- steps between cases

  function afterInstall(p, st) {
    var s = heldTerm(p)
    var ok = s !== null && cardIn(s) && qeFreq(s) === T.freq
    check('install', ok, 'after the near case: ' + (st.installed || 'nothing installed') + '; the terminal NBT now says: ' + termState(p).text + ' (the pair\'s freq ' +
      T.freq + '; AE2WTLib reads "upgrades" and "singularity" from the item)')
  }

  // 5 s on the Moon: the terminal keeps its singularity; our rule (moon/quantum_bridge.js) is live: it empties a lone link chamber behind
  // the player that holds an Earth singularity. The chamber sits in a 3x3x3 glass box with one air cell over it, so what the rule pops
  // stays there (the Moon's low gravity carries a popped item off the floor otherwise)
  function stepWatch(p, age, st) {
    var L = cls()
    var G = global.grindless
    var cube = (CONTROL.x - 1) + ' ' + CONTROL.y + ' ' + (CONTROL.z - 1) + ' ' + (CONTROL.x + 1) + ' ' + (CONTROL.y + 2) + ' ' + (CONTROL.z + 1)
    var above = { x: CONTROL.x, y: CONTROL.y + 1, z: CONTROL.z }
    function blockAt() {
      return String(T.moon.getBlock(CONTROL.x, CONTROL.y, CONTROL.z).getId())
    }
    // the block, and the chunk's own block entity map at that spot (read without creating one): same object as the one filled, removed?
    function beState(s) {
      var raw = null
      try { raw = T.moon.getChunkAt(bp(CONTROL)).getBlockEntities().get(bp(CONTROL)) } catch (e) { raw = null }
      var txt = blockAt().replace(/^ae2:/, '')
      if (raw === null || raw === undefined) return txt + '/no-BE'
      return txt + '/' + (s.be !== null && raw.equals(s.be) ? 'same' : 'other') + (raw.isRemoved() ? '-removed' : '') +
        (s.be !== null && s.be.isRemoved() ? '/filled-removed' : '')
    }
    if (!st.started) {
      st.started = true
      st.freq0 = qeFreq(heldTerm(p))
      st.tick0 = T.server.getTickCount()
      st.glass = cmd(LUNA, 'fill ' + cube + ' minecraft:glass')
      st.placed = cmd(LUNA, 'setblock ' + at(CONTROL) + ' ae2:quantum_link replace')
      cmd(LUNA, 'setblock ' + at(above) + ' minecraft:air')
      var be = T.moon.getBlockEntity(bp(CONTROL))
      var s = Item.of(ENTANGLED, 1)
      L.QBE.assignFrequency(s)
      st.controlFreq = Number(s.getNbt().getLong('freq'))
      st.inserted = 'no block entity'
      st.be = be
      if (be !== null) {
        be.getInternalInventory().setItemDirect(0, s)
        st.inserted = String(be.getClass().getSimpleName()) + ' holds ' + itemId(be.getInternalInventory().getStackInSlot(0))
      }
      st.tracked = G && G.moon && G.moon.quantum ? G.moon.quantum.track(T.moon, bp(CONTROL)) : 'no global.grindless.moon.quantum'
      st.msg0 = seqOf('msg')
      st.blocks = [beState(st) + '@0']
      return false
    }
    var f = qeFreq(heldTerm(p))
    if (f !== T.freq) st.lost = st.lost || ('at tick +' + age + ': freq ' + f)
    if (age % 20 === 0) st.blocks.push(beState(st) + '@' + age)
    if (age < WATCH_TICKS) return false
    // the block entity the singularity went into (a later lookup may hand a fresh one). In this KubeJS an empty ItemStack is === null
    // (ItemStackKJS special equality): only isEmpty() tells
    var hasBe = st.be !== null
    var emptied = hasBe && st.be.getInternalInventory().getStackInSlot(0).isEmpty()
    var popped = itemsNear(T.moon, CONTROL, 2, ENTANGLED).filter(function (e) {
      var t = e.getItem().getNbt()
      return t !== null && Number(t.getLong('freq')) === st.controlFreq
    })
    var loose = itemsNear(T.moon, { x: Math.floor(p.getX()), y: Math.floor(p.getY()), z: Math.floor(p.getZ()) }, 3, ENTANGLED).filter(function (e) {
      var t = e.getItem().getNbt()
      return t !== null && Number(t.getLong('freq')) === T.freq
    })
    var msgs = since('msg', st.msg0)
    var told = msgs.some(function (m) { return m.indexOf('entangled on Earth') >= 0 })
    var fresh = T.moon.getBlockEntity(bp(CONTROL))
    check('ejection_rule_live', emptied && popped.length > 0 && told, 'control: a lone ae2:quantum_link at ' + at(CONTROL) + ' on the Moon ' +
      '(glass box ' + st.glass + ', chamber placed ' + st.placed + ', ' + st.inserted + ') with an Earth singularity (freq ' + st.controlFreq + ', tracked: ' + st.tracked +
      '): after ' + age + ' ticks the chamber is ' + (!hasBe ? 'GONE' : emptied ? 'empty' : 'STILL FULL') + ', the singularity popped over it: ' + popped.length +
      ', block / block entity there over time: ' + st.blocks.join(' ') + ', a getBlockEntity lookup now gives ' + (fresh === null ? 'null' : st.be !== null &&
      fresh.equals(st.be) ? 'the filled one' : 'a new one') + '; messages: ' + summarize(msgs))
    check('singularity_kept_moon', !st.lost && f === T.freq && loose.length === 0, 'the terminal\'s singularity on the Moon for ' + age + ' ticks (' +
      Math.floor(age / 20) + ' of our rule\'s 1 s checks, which emptied the control chamber meanwhile): freq ' + st.freq0 + ' -> ' + f +
      (st.lost ? ', LOST ' + st.lost : ', never changed') + '; loose halves of the pair near the player: ' + loose.length + '; ' + termState(p).text)
    popped.forEach(function (e) { e.discard() })
    cmd(LUNA, 'fill ' + cube + ' minecraft:air')
    return true
  }

  function stepUnlink(p, age, st) {
    var s = heldTerm(p)
    var h = s === null ? null : cls().GridLinkables.get(s.getItem())
    if (h !== null) h.unlink(s)
    note('unlink', 'access point link removed by AE2\'s linkable handler: ' + termState(p).text)
    return true
  }

  function stepRelinkNoCard(p, age, st) {
    var L = cls()
    var s = heldTerm(p)
    if (s === null) {
      check('remove_card', false, termState(p).text)
      return true
    }
    L.GridLinkables.get(s.getItem()).link(s, T.wapPos)
    var inv = L.UpgradeInventories.forItem(s, L.WUTHandler.getUpgradeCardCount())
    var took = 0
    for (var i = 0; i < inv.size(); i++) {
      var it = inv.getStackInSlot(i)
      if (!it.isEmpty() && itemId(it) === CARD) took += inv.extractItem(i, 1, false).getCount()
    }
    var ts = termState(p)
    check('remove_card', took === 1 && !ts.card && ts.linked && ts.freq === T.freq, 'control setup: link back, card taken out of the upgrade slots (' + took + '): ' + ts.text)
    return true
  }

  function stepRestoreCard(p, age, st) {
    var L = cls()
    var s = heldTerm(p)
    // addItems hands back the remainder; empty is === null in this KubeJS, so isEmpty() decides
    var rest = s === null ? null : L.UpgradeInventories.forItem(s, L.WUTHandler.getUpgradeCardCount()).addItems(Item.of(CARD))
    var ts = termState(p)
    check('restore_card', s !== null && rest.isEmpty() && ts.card, 'card back into the terminal (addItems left ' + (s === null ? '- (no terminal)' : rest.isEmpty() ?
      'nothing' : rest.getCount() + 'x ' + rest.getId()) + '): ' + ts.text)
    return true
  }

  // the band's force-load removed: the home chunk unloads with nobody on Earth near it, and AE2 drops the bridge from its registry.
  // Nothing here reads a block of the home chunk while it is meant to stay unloaded (that would load it again).
  function stepUnloadHome(p, age, st) {
    if (!st.started) {
      st.started = true
      st.result = cmd(EARTH, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      T.grid = null
      return false
    }
    var loaded = !!T.earth.isLoaded(bp(LINK))
    var reg = registered()
    if ((loaded || reg !== '') && age < 1200) return false
    T.unloaded = !loaded && reg === ''
    check('home_unloaded', T.unloaded, 'forceload remove (result ' + st.result + ') with the player on Mars: after ' + age + ' ticks the home chunk 816,1 is ' +
      (loaded ? 'STILL LOADED' : 'unloaded') + ', AE2 Locatables has the home bridge under ' + (reg === '' ? 'no frequency (unregistered)' : reg + 'freq'))
    return true
  }

  function stepReloadHome(p, age, st) {
    if (!st.started) {
      st.started = true
      st.result = cmd(EARTH, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      return false
    }
    if (age < 40) return false
    var loaded = !!T.earth.isLoaded(bp(LINK))
    if (!loaded && age < 600) return false
    var be = loaded ? T.earth.getBlockEntity(bp(LINK)) : null
    var grid = gridOf(be)
    var powered = grid !== null && grid.getEnergyService().isNetworkPowered()
    var reg = registered()
    var amount = storedIn(grid, KNOWN)
    var ok = loaded && be !== null && be.isFormed() && powered && reg !== '' && amount > 0
    if (!ok && age < 600) return false
    T.grid = grid
    check('home_reloaded', ok, 'forceload add (result ' + st.result + '): after ' + age + ' ticks the home chunk is ' + (loaded ? 'loaded' : 'NOT loaded') + ', bridge formed=' +
      (be !== null && be.isFormed()) + ', network powered=' + powered + ', AE2 Locatables has it under ' + (reg === '' ? 'NO frequency' : reg + 'freq') + ', ' + amount +
      ' diamonds in the drive')
    return true
  }

  function stepFinalSingularity(p, age, st) {
    var ts = termState(p)
    check('singularity_kept_end', ts.ok && ts.freq === T.freq && ts.card, 'after the Moon and Mars: ' + ts.text + ' (the pair\'s freq ' + T.freq + ')')
    return true
  }

  function stepEmi(p, age, st) {
    var r = sval('emi')
    if (r === '' && age < 1200) return false
    check('client_emi', r.indexOf('PASS') === 0, r === '' ? 'the client never reported EMI (not loaded?)' : r.replace(/^(PASS|FAIL) /, ''))
    return true
  }

  function leaveMoon(p) {
    clearOffWorld(LUNA)
  }

  function leaveMars(p) {
    clearOffWorld(MARS)
  }

  // ---------------------------------------------------------------- the plan

  var STEPS = [
    ['setup', stepSetup],
    ['ritual', stepRitual],
    ['boot', stepBoot],
    ['case_near', caseStep({ name: 'near', works: true, expectLinked: false, install: true, after: afterInstall })],
    ['to_band', goTo('band')],
    ['case_earth_51', caseStep({ name: 'earth_51_blocks', works: true, expectLinked: true })],
    ['to_far', goFar],
    ['case_earth_far', caseStep({ name: 'earth_far', works: true, expectLinked: true })],
    ['to_moon', goTo('moon')],
    ['case_moon', caseStep({ name: 'moon', works: true, expectLinked: true })],
    ['watch', stepWatch],
    ['unlink', stepUnlink],
    ['case_moon_unlinked', caseStep({ name: 'moon_unlinked', works: null, expectLinked: true })],
    ['remove_card', stepRelinkNoCard],
    ['case_moon_no_card', caseStep({ name: 'moon_no_card', works: false })],
    ['restore_card', stepRestoreCard],
    ['to_mars', goTo('mars', leaveMoon)],
    ['case_mars', caseStep({ name: 'mars', works: true, expectLinked: true })],
    ['unload_home', stepUnloadHome],
    ['case_mars_unloaded', caseStep({ name: 'mars_home_unloaded', works: false })],
    ['reload_home', stepReloadHome],
    ['case_mars_reloaded', caseStep({ name: 'mars_home_reloaded', works: true, expectLinked: true })],
    ['final_singularity', stepFinalSingularity],
    ['home', goTo('near', leaveMars)],
    ['emi', stepEmi],
    ['finish', function (p, age, st) { finish(T.server); return true }]
  ]

  // ---------------------------------------------------------------- driver

  function finish(server) {
    if (T === null || T.finished) return
    T.finished = true
    shared().put('clickToken', '')
    shared().put('extractToken', '')
    try { restorePlayer(server) } catch (e) { note('restore', 'failed: ' + e) }
    try { clearOffWorld(LUNA) } catch (e) { note('cleanup', 'Moon: ' + e) }
    try { clearOffWorld(MARS) } catch (e) { note('cleanup', 'Mars: ' + e) }
    try { clearEarth() } catch (e) { note('cleanup', 'Earth: ' + e) }
    if (T.cycle !== null) cmd(EARTH, 'gamerule doDaylightCycle true')
    if (T.mobs !== null) cmd(EARTH, 'gamerule doMobSpawning true')
    var failed = T.failed.filter(function (f, i) { return T.failed.indexOf(f) === i })
    check('all', failed.length === 0 && !T.aborted, (T.aborted ? 'aborted: ' + T.aborted + '; ' : '') + (failed.length === 0 ? 'every check passed: ' +
      T.table.map(function (x) { return x.name }).join(', ') : 'failed: ' + failed.join(', ')))
    shared().put('hold', false)
    global[REQ + 'Done'] = true
    console.info(TAG + 'DONE')
  }

  function onTick(server) {
    if (global[REQ] && T === null && Date.now() - LOADED_AT >= QUIET_MS && Date.now() >= Number(global[REQ + 'At'] || 0)) {
      global[REQ] = false
      T = { t: 0, tick0: server.getTickCount(), step: 0, since: 0, st: {}, failed: [], table: [], results: {}, finished: false, aborted: '', playerName: '',
        server: server, earth: null, moon: null, mars: null, origin: null, earthTouched: false, offTouched: {}, cycle: null, mobs: null, grid: null, freq: 0,
        halfA: null, halfB: null, range: 16, wapPos: null, far: null, unloaded: false }
    }
    if (T === null || T.finished) return
    T.server = server
    T.t = server.getTickCount() - T.tick0
    if (T.t > TEST_TIMEOUT) {
      check('timeout', false, 'the test ran ' + T.t + ' ticks; step ' + STEPS[T.step][0])
      finish(server)
      return
    }
    var p = testPlayer(server)
    if (p === null) {
      check('player_present', false, 'the test player left during ' + STEPS[T.step][0])
      finish(server)
      return
    }
    var step = STEPS[T.step]
    var age = T.t - T.since
    var done = false
    try {
      done = step[1](p, age, T.st)
    } catch (e) {
      check('step_' + step[0], false, 'exception: ' + e + (T.st && T.st.phase ? ' (phase ' + T.st.phase + ')' : ''))
      done = true
      if (T.step <= indexOf('boot')) abort('exception in ' + step[0])
    }
    if (!done && age > STEP_TIMEOUT) {
      check('step_' + step[0], false, 'timed out after ' + age + ' ticks' + (T.st && T.st.phase ? ' in phase ' + T.st.phase : ''))
      done = true
      if (T.step <= indexOf('boot')) abort('timeout in ' + step[0])
    }
    if (T.finished) return
    if (done) {
      var next = T.step + 1
      if (T.aborted && next < indexOf('home')) next = indexOf('home')
      go(next)
    }
  }

  ServerEvents.tick(function (event) {
    onTick(event.server)
  })

  // client suite: armed when the player joins, if the instance carries the marker file
  PlayerEvents.loggedIn(function (event) {
    if (global[REQ + 'Done'] || T !== null || !enabledByMarker()) return
    global[REQ + 'At'] = Date.now() + 5000
    global[REQ] = true
    var S = shared()
    S.put('hold', true)
    S.put('clickToken', '')
    S.put('extractToken', '')
    S.put('emi', '')
    note('armed', 'player ' + event.player.getName().getString() + ' joined and ' + MARKER + ' is present: the quantum bridge card test starts in a few seconds')
  })
})()
