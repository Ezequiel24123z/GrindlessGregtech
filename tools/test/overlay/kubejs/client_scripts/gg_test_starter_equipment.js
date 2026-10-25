// TEST-ONLY: paired real-client proof, asleep unless the marker-enabled server holds it.
// No packet injection, production helper call, fake GUI, cache-wide clear or terrain construction.
;(function () {
  var TAG = 'GGTEST|starter_equipment|'
  var c = { since: 0, ticks: 0, token: '', releaseNext: false, plan: null, renderer: null,
    layer: '', mapAt: 0, mapPhase: 'wait', mapDeadline: 0, quietAt: 0,
    mapBinding: null, mapOldKey: null, onboardingDismissed: false, screenshot: false, stopped: false }

  function val(key) {
    var value = global.ggStarterEquipment.get(key)
    return value === null || value === undefined ? '' : String(value)
  }

  function check(name, ok, detail) {
    if (!ok) throw new Error(name + ': ' + detail)
    console.info(TAG + name + '|PASS|' + detail)
  }

  function release(mc) {
    var pressed = c.releaseNext
    c.releaseNext = false
    if (pressed) mc.options.keyUse.setDown(false)
  }

  function restoreMapBinding() {
    if (c.mapOldKey === null) return
    c.mapBinding.setDown(false)
    c.mapBinding.setKey(c.mapOldKey)
    Java.loadClass('net.minecraft.client.KeyMapping').resetMapping()
    c.mapOldKey = null
  }

  function abort(mc, error) {
    if (c.stopped) return
    // Latch failure BEFORE touching Minecraft: cleanup itself must never escape and
    // retrigger the tick handler (the failed run repeatedly threw from setScreen).
    c.stopped = true
    global.ggStarterEquipment.put('failed', true)
    global.ggStarterEquipment.put('clientAborted', String(error))
    global.ggStarterEquipment.put('hold', false)
    var detail = String(error)
    cleanup(mc)
    console.info(TAG + 'client_exception|FAIL|' + detail)
    if (global.ggStarterEquipment.putIfAbsent('doneLogged', true) === null) console.info(TAG + 'DONE')
  }

  function cleanup(mc) {
    c.stopped = true
    var errors = []
    try { release(mc) } catch (e) { errors.push('use key: ' + e) }
    try { restoreMapBinding() } catch (e) { errors.push('map binding: ' + e) }
    try { mc.setScreen(null) } catch (e) { errors.push('screen: ' + e) }
    if (errors.length) global.ggStarterEquipment.put('failed', true)
    console.info(TAG + 'client_cleanup|' + (errors.length ? 'FAIL|' + errors.join('; ') : 'PASS|use key, original map binding and screen released'))
    global.ggStarterEquipment.put('clientDone', true)
  }

  function markerId(entry) {
    return 'ore_veins@[' + entry.x + ',' + entry.y + ',' + entry.z + ']'
  }

  function row(mc) {
    return Java.loadClass('com.gregtechceu.gtceu.integration.map.xaeros.XaerosRenderer')
      .oreElements.row(mc.player.getLevel().getDimensionKey())
  }

  function foreignRow() {
    var key = Java.loadClass('net.minecraft.resources.ResourceKey').create(
      Java.loadClass('net.minecraft.core.registries.Registries').DIMENSION,
      new (Java.loadClass('net.minecraft.resources.ResourceLocation'))(c.plan.foreignDimension))
    return Java.loadClass('com.gregtechceu.gtceu.integration.map.xaeros.XaerosRenderer').oreElements.row(key)
  }

  function setup(mc) {
    c.plan = JSON.parse(val('plan'))
    check('client_dimension', String(mc.player.getLevel().getDimensionKey().location()) === c.plan.dimension,
      'real client is in planned spawn dimension ' + c.plan.dimension)
    var renderers = Java.loadClass('com.gregtechceu.gtceu.integration.map.GroupingMapRenderer')
      .getInstance().getRenderers().values().iterator()
    while (renderers.hasNext()) {
      var renderer = renderers.next()
      if (String(renderer.getClass().getName()).indexOf('XaerosRenderer') >= 0) c.renderer = renderer
    }
    check('xaero_renderer', c.renderer !== null, 'installed native GroupingMapRenderer contains Xaero')
    var keys = Java.loadClass('com.gregtechceu.gtceu.integration.map.layer.Layers').allKeys().iterator()
    var names = []
    while (keys.hasNext()) {
      var key = String(keys.next())
      names.push(key)
      if (key === 'ore_veins') c.layer = key
    }
    check('ore_layer_registered', c.layer !== '', 'native registered layers=' + names.join(','))
    c.renderer.setLayerActive(c.layer, true)
    check('ore_layer_visible', c.renderer.doShowLayer(c.layer), 'native Xaero Ore Veins layer enabled')
    // Only the chosen natural marker may be preknown. Fixtures must be genuinely new.
    var markers = row(mc)
    for (var i = 1; i < c.plan.entries.length; i++) {
      check('fixture_absent_' + i, !markers.containsKey(markerId(c.plan.entries[i])),
        c.plan.entries[i].name + ' absent before any gift click')
    }
    check('foreign_absent_initial', !markers.containsKey(markerId(c.plan.foreign)) &&
      !foreignRow().containsKey(markerId(c.plan.foreign)),
      'foreign-only metadata absent from both dimensions before any click')
  }

  function visible(mc) {
    var markers = row(mc)
    var OreLayer = Java.loadClass('com.gregtechceu.gtceu.integration.map.layer.builtin.OreRenderLayer')
    var ArrayList = Java.loadClass('java.util.ArrayList')
    var missing = []
    var labels = []
    for (var i = 0; i < c.plan.entries.length; i++) {
      var entry = c.plan.entries[i]
      var marker = markers.get(markerId(entry))
      if (!entry.included) {
        if (marker !== null) throw new Error('257-exclusive metadata leaked: ' + entry.name)
        continue
      }
      if (marker === null) {
        missing.push(entry.name)
        continue
      }
      var vein = marker.getVein()
      var pos = vein.center()
      var label = String(marker.getName())
      // GTM 7.5.3 VeinGenerator#getAllMaterials uses Stream.toList(): its non-public
      // ImmutableCollections$ListN cannot be invoked by Rhino. Copy via the public
      // Collection constructor BEFORE calling isEmpty/get; no reflection or bypass.
      var materials = new ArrayList(vein.definition().veinGenerator().getAllMaterials())
      var definition = Java.loadClass('com.gregtechceu.gtceu.client.ClientProxy').CLIENT_ORE_VEINS.get(
        new (Java.loadClass('net.minecraft.resources.ResourceLocation'))(entry.id))
      if (String(OreLayer.getId(vein)) !== markerId(entry) || String(vein.id()) !== entry.id ||
          pos.getX() !== entry.x || pos.getY() !== entry.y || pos.getZ() !== entry.z ||
          vein.depleted() !== entry.depleted || label.trim() === '' ||
          label.indexOf('gtceu.') >= 0 || label.indexOf('grindless.') >= 0 ||
          label !== String(OreLayer.getName(vein).getString()) || materials.isEmpty() ||
          definition === null || !vein.definition().equals(definition) ||
          !marker.getFirstMaterial().equals(materials.get(0))) {
        throw new Error('unusable label/material/metadata for ' + entry.name + ': ' + label)
      }
      labels.push(entry.name + '=' + label + '/' + marker.getFirstMaterial())
    }
    // A packet for the active dimension must neither leak foreign metadata into that row
    // nor reveal anything in the foreign row. Compare the whole foreign row to its pre-click snapshot.
    if (markers.containsKey(markerId(c.plan.foreign))) throw new Error('foreign-dimension marker leaked into current map')
    if (!foreignRow().equals(c.foreignBefore)) throw new Error('scan revealed or changed foreign-dimension markers')
    if (!c.renderer.doShowLayer(c.layer)) throw new Error('Xaero ore layer no longer visible')
    return { ok: missing.length === 0, detail: missing.length ? 'waiting for ' + missing.join(',') : labels.join('; ') }
  }

  function click(mc, token) {
    var player = mc.player
    player.getInventory().selected = 0 // Match the server-equipped hotbar slot; native use synchronizes selection.
    var stack = player.getMainHandItem()
    if (mc.screen !== null || mc.getOverlay() !== null || stack.isEmpty() ||
        String(stack.getId()) !== 'gtceu:prospector.hv' ||
        stack.getNbt() === null || !stack.getNbt().getBoolean('grindless_starter_prospector')) return
    var cap = Java.loadClass('com.gregtechceu.gtceu.api.capability.GTCapabilityHelper').getElectricItem(stack)
    if (cap === null || Number(cap.getCharge()) !== 0) throw new Error('client must hold the actual empty gift before click')
    var origin = player.blockPosition()
    check('click_origin_' + token, origin.getX() === c.plan.center.x &&
      origin.getY() === c.plan.center.y && origin.getZ() === c.plan.center.z,
      'actual keyUse origin matches the cached spawn boundary fixtures')
    var natural = c.plan.entries[0]
    // Meaningful reveal even if the natural vein was already known on arrival or from a prior scan.
    var removed = row(mc).remove(markerId(natural))
    check('natural_hidden_' + token, !row(mc).containsKey(markerId(natural)),
      'removed only selected natural Xaero record; wasKnown=' + (removed !== null))
    c.foreignBefore = new (Java.loadClass('java.util.HashMap'))(foreignRow())
    player.setPitch(-90) // Aim into air; no block interaction, construction or direct useItem call.
    c.token = token
    c.clickMs = Date.now()
    c.clickTick = c.ticks
    c.pending = true
    mc.options.keyUse.setDown(true) // Minecraft generates the real use-item packet on its next tick.
    c.releaseNext = true
    global.ggStarterEquipment.put('clicked', token)
  }

  function inspect(mc) {
    if (!c.pending) return
    if (mc.screen !== null) throw new Error('gift click opened a GUI instead of only revealing map markers')
    var result = visible(mc)
    var ms = Date.now() - c.clickMs
    var ticks = c.ticks - c.clickTick
    if (!result.ok && ms <= 2000 && ticks <= 10) return
    result.ms = ms
    result.ticks = ticks
    result.ok = result.ok && ms <= 2000 && ticks <= 10
    console.info(TAG + 'client_click_' + c.token + '|' + (result.ok ? 'PASS' : 'FAIL') +
      '|keyUse -> visible markers wall_ms=' + ms + ', client_ticks=' + ticks + '; ' + result.detail)
    global.ggStarterEquipment.put('scanResult', JSON.stringify(result))
    global.ggStarterEquipment.put('scanResultToken', c.token)
    c.pending = false
  }

  function field(obj, names) {
    for (var i = 0; i < names.length; i++) {
      if (obj[names[i]] !== undefined && obj[names[i]] !== null) return obj[names[i]]
    }
    throw new Error('missing field ' + names.join('/'))
  }

  function renderTarget(mc) {
    if (typeof mc.getMainRenderTarget === 'function') return mc.getMainRenderTarget()
    return mc.m_91385_()
  }

  function method(obj, names) {
    // Mod overrides can retain SRG names even when inherited Minecraft methods are mapped.
    // These are public API aliases, as in the established Screenshot render-target fallback.
    for (var i = 0; i < names.length; i++) {
      if (typeof obj[names[i]] === 'function') return names[i]
    }
    throw new Error('missing public method ' + names.join('/'))
  }

  function openMapKey(mc) {
    var mappings = mc.options.keyMappings // Vanilla KeyMapping[], not a Java immutable List.
    var mapping = null
    for (var i = 0; i < mappings.length; i++) {
      if (String(mappings[i].getName()) === 'gui.xaero_open_map') mapping = mappings[i]
    }
    check('worldmap_key', mapping !== null, 'installed fullscreen binding must be gui.xaero_open_map')
    // Both Xaero's fullscreen map and Voice Chat's mute binding default to M. Voice Chat
    // consumes ANY of its bindings to start onboarding. Use an otherwise-unused key for
    // THIS registered map binding only, then restore it without saving options.
    var InputConstants = Java.loadClass('com.mojang.blaze3d.platform.InputConstants')
    var isolated = null
    for (var f = 16; f <= 24 && isolated === null; f++) {
      var candidate = InputConstants.getKey('key.keyboard.f' + f)
      var used = false
      for (var k = 0; k < mappings.length; k++) {
        if (mappings[k].getKey().equals(candidate)) used = true
      }
      if (!used) isolated = candidate
    }
    check('worldmap_isolated_key', isolated !== null, 'unused F16-F24 input required to avoid Voice Chat M conflict')
    c.mapBinding = mapping
    c.mapOldKey = mapping.getKey()
    mapping.setKey(isolated)
    var KeyMapping = Java.loadClass('net.minecraft.client.KeyMapping')
    KeyMapping.resetMapping()
    KeyMapping.click(mapping.getKey()) // Real registered binding -> native consumeClick -> GuiMap.
    console.info(TAG + 'worldmap_key_isolated|NOTE|' + mapping.getName() + ' temporarily uses ' + isolated.getName())
  }

  function nativeWidget(screen, translationKey) {
    var expected = String(Text.translate(translationKey).getString())
    // Screen children may be returned through a non-public collection implementation.
    var widgets = new (Java.loadClass('java.util.ArrayList'))(screen[method(screen, ['children', 'm_6702_'])]())
    for (var i = 0; i < widgets.size(); i++) {
      var widget = widgets.get(i)
      // GuiTexturedButton#getMessage exposes its native tooltip's plain text.
      if (typeof widget.getMessage !== 'function' && typeof widget.m_6035_ !== 'function') continue
      var message = widget[method(widget, ['getMessage', 'm_6035_'])]()
      if (String(message.getString()) === expected) return widget
    }
    throw new Error('native Xaero widget missing: ' + translationKey)
  }

  function hopField(screen) {
    // Pinned 1.47.0 native UI: Hop button -> EditBox -> space-separated X Z -> ENTER.
    // This changes only the map camera, not the player or world. No private camera access.
    var button = nativeWidget(screen, 'gui.xaero_hop_button')
    button[method(button, ['onPress', 'm_5691_'])]()
    var input = nativeWidget(screen, 'gui.xaero_hop_field')
    input[method(input, ['setValue', 'm_94144_'])](c.plan.entries[0].x + ' ' + c.plan.entries[0].z)
    return input
  }

  function hoverMapCenter(mc) {
    var window = mc[method(mc, ['getWindow', 'm_91268_'])]()
    var width = Number(window[method(window, ['getScreenWidth', 'm_85443_'])]())
    var height = Number(window[method(window, ['getScreenHeight', 'm_85444_'])]())
    var scale = height / Number(window[method(window, ['getGuiScaledHeight', 'm_85446_'])]())
    // Move the REAL GUI cursor over the ore icon, slightly above its center (the native
    // waypoint-background hitbox ends at y=0). Xaero renders its own ore tooltip/label.
    Java.loadClass('org.lwjgl.glfw.GLFW').glfwSetCursorPos(window[method(window, ['getWindow', 'm_85439_'])](),
      width / 2, height / 2 - 4 * scale)
  }

  function rehydrateNaturalMarker(mc) {
    // Native in-memory codec/marker rehydration only: NOT disk persistence,
    // reconnect, or a clean-cache roundtrip. Never clear/reset a cache or renderer.
    var dim = mc.player.getLevel().getDimensionKey()
    check('native_cache_codec_dimension', String(dim.location()) === c.plan.dimension,
      'save and both reads use the same actual client ResourceKey')
    var cache = Java.loadClass('com.gregtechceu.gtceu.integration.map.cache.client.GTClientCache').instance
    c.cacheNbt = cache.saveDimFile('', dim) // Retain NBT client-locally, never in the shared cross-thread map.
    check('native_cache_codec', c.cacheNbt !== null, "saveDimFile('', actualDim) returned native CompoundTag")
    var markers = row(mc)
    var HashMap = Java.loadClass('java.util.HashMap')
    var countBefore = new HashMap(markers).size()
    var natural = c.plan.entries[0]
    var id = markerId(natural)
    var original = markers.get(id)
    check('marker_rehydration_baseline', original !== null, 'selected natural marker exists before removal')
    var name = String(original.getName())
    markers.remove(id) // ONLY the selected natural Xaero record; native cache metadata stays intact.
    check('marker_rehydration_hidden', !markers.containsKey(id) &&
      new HashMap(markers).size() === countBefore - 1, 'exactly one selected natural marker removed')
    for (var r = 1; r <= 2; r++) {
      cache.readDimFile('', dim, c.cacheNbt)
      var restored = markers.get(id)
      var pos = restored === null ? null : restored.getVein().center()
      check(r === 1 ? 'marker_rehydration' : 'marker_rehydration_repeat',
        restored !== null && String(restored.getName()) === name &&
        pos.getX() === natural.x && pos.getY() === natural.y && pos.getZ() === natural.z,
        'read=' + r + '; same natural name=' + name + ' at [' + natural.x + ',' + natural.y + ',' + natural.z + ']')
      check('native_cache_codec_no_duplication_' + r, new HashMap(markers).size() === countBefore,
        'read=' + r + '; same dimension marker count=' + countBefore)
      check('native_cache_codec_dimension_isolation_' + r,
        dim.equals(mc.player.getLevel().getDimensionKey()) &&
        !markers.containsKey(markerId(c.plan.foreign)) && foreignRow().equals(c.foreignBefore),
        'foreign fixture still absent; foreign marker row unchanged; no dimension travel')
    }
    global.ggStarterEquipment.put('codecDone', true)
  }

  function map(mc) {
    if (c.screenshot) {
      if (val('mapCaptured') === 'true' && val('mapDone') !== 'true') {
        if (val('mapResult') === 'PASS') rehydrateNaturalMarker(mc)
        global.ggStarterEquipment.put('mapDone', true) // Publish completion only AFTER successful codec assertions.
      }
      // A map can pause the integrated server: close on the CLIENT thread after its PNG callback,
      // letting the server consume mapDone and release hold rather than deadlocking behind the GUI.
      if (val('mapDone') === 'true') mc.setScreen(null)
      return
    }
    if (!c.mapDeadline) c.mapDeadline = Date.now() + 20000
    var screen = mc.screen
    var name = screen === null ? '' : String(screen.getClass().getName())
    if (Date.now() > c.mapDeadline) throw new Error('20s native map visual-proof timeout: phase=' + c.mapPhase + ', screen=' + name)
    if (name.indexOf('de.maxhenkel.voicechat.gui.onboarding.') === 0) {
      if (c.onboardingDismissed) throw new Error('Voice Chat onboarding obstructed the map a second time')
      c.onboardingDismissed = true
      restoreMapBinding()
      mc.setScreen(null) // Test-only dismissal; do not finish onboarding or enable/save voice settings.
      c.mapPhase = 'wait'
      c.quietAt = 0
      console.info(TAG + 'voicechat_onboarding|NOTE|closed once; defer map binding until client is unobstructed')
      return
    }
    if (c.mapPhase === 'wait') {
      if (screen !== null || mc.getOverlay() !== null) {
        c.quietAt = 0
        return
      }
      if (!c.quietAt) c.quietAt = c.ticks
      if (c.ticks - c.quietAt < 8) return
      openMapKey(mc)
      c.mapPhase = 'opening'
      c.mapAt = c.ticks
      return
    }
    if (name !== 'xaero.map.gui.GuiMap') {
      if (c.mapPhase !== 'opening' || c.ticks - c.mapAt > 60) {
        throw new Error('expected actual native Xaero GuiMap before visual proof: ' + name)
      }
      return
    }
    if (mc.getOverlay() !== null) return
    if (c.mapPhase === 'opening') {
      restoreMapBinding()
      check('fullscreen_map_open', true, 'actual installed screen=' + name + '; original binding restored')
      c.mapPhase = 'warmup'
      c.mapAt = c.ticks
      return
    }
    if (c.mapPhase === 'warmup') {
      if (c.ticks - c.mapAt < 10) return
      var input = hopField(screen)
      screen[method(screen, ['setFocused', 'm_7522_'])](input)
      screen[method(screen, ['keyPressed', 'm_7933_'])](257, 0, 0) // ENTER activates native Hop destination.
      c.mapPhase = 'centering'
      c.mapAt = c.ticks
      return
    }
    if (c.mapPhase === 'centering') {
      if (c.ticks - c.mapAt < 60) return // Allow Xaero's camera destination animation to settle.
      // Leave the native X/Z input visible as readable location evidence, not an invented caption.
      hopField(screen)
      screen[method(screen, ['setFocused', 'm_7522_'])](null)
      c.mapPhase = 'hovering'
      c.mapAt = c.ticks
      return
    }
    hoverMapCenter(mc)
    if (c.ticks - c.mapAt < 20) return // Render native hovered ore label/material tooltip before grab.
    var natural = c.plan.entries[0]
    var naturalMarker = row(mc).get(markerId(natural))
    var coordinates = natural.x + ' ' + natural.z
    var coordinateInput = nativeWidget(screen, 'gui.xaero_hop_field') // Must still be in the live, visible widget list.
    check('native_map_location', String(coordinateInput[method(coordinateInput, ['getValue', 'm_94155_'])]()) === coordinates,
      'native Hop field shows ' + coordinates + '; camera centered on natural marker at [' +
      natural.x + ',' + natural.y + ',' + natural.z + ']')
    check('real_map_records', visible(mc).ok, 'all inclusive records, localized labels/materials and dimension isolation on ' + name)
    var visualTarget = String(naturalMarker.getName()) + ' at [' + natural.x + ',' + natural.y + ',' + natural.z + ']'
    console.info(TAG + 'map_visual_target|NOTE|' + visualTarget +
      '; real native map centered and cursor hovering ore; inspect PNG label and native coordinate field')
    Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths').dir('kubejs/exported')
    c.screenshot = true
    Java.loadClass('net.minecraft.client.Screenshot').grab(field(mc, ['gameDirectory', 'f_91069_']),
      '../kubejs/exported/gg_starter_map.png', renderTarget(mc), function (msg) {
        // Screenshot.grab can report a write error via its callback without throwing.
        try {
          // Vanilla emits screenshot.success only AFTER NativeImage.writeToFile succeeds.
          // Use that real completion signal, not "grab returned", a stale file, or java.io access.
          var ok = String(msg.getContents().getKey()) === 'screenshot.success'
          global.ggStarterEquipment.put('mapResult', ok ? 'PASS' : 'FAIL')
          global.ggStarterEquipment.put('mapDetail', name + '; ' + visualTarget +
            '; native coordinate field=' + coordinates + '; kubejs/exported/gg_starter_map.png; ' + msg)
        } catch (e) {
          global.ggStarterEquipment.put('mapResult', 'FAIL')
          global.ggStarterEquipment.put('mapDetail', 'screenshot callback: ' + e)
        }
        global.ggStarterEquipment.put('mapCaptured', true)
      })
  }

  ClientEvents.tick(function () {
    if (!global.ggStarterEquipment || c.stopped) return
    var mc = null
    try {
      // ClientEvents.tick has no client/minecraft property; use the established
      // Client singleton, as gg_test_dimension_keys and gg_test_quest_book do.
      mc = Client
      release(mc)
      if (val('hold') !== 'true') {
        if (c.since || val('serverDone') === 'true') cleanup(mc)
        return
      }
      if (!c.since) c.since = Date.now()
      if (Date.now() - c.since > 120000) throw new Error('120s client proof timeout')
      c.ticks++
      if (mc.player && mc.player.age >= 80) mc.player.age = 20
      if (!mc.player || val('plan') === '') return
      if (c.plan === null) setup(mc)
      inspect(mc) // Observe real table on every tick, not a synthetic client cache radius query.
      var token = val('scanToken')
      if (token !== '' && token !== c.token) click(mc, token)
      if (val('mapRequested') === 'true') map(mc)
    } catch (e) {
      abort(mc, e)
    }
  })
})()
