// Gregtech Grindless - client half of the gallery test (TEST-ONLY overlay, never shipped). Partner of
// server_scripts/gg_test_gallery.js; asleep unless that test sets 'hold' in the map both halves share (global.ggGallery: in the
// client suite both run in the same JVM).
//
// While the test runs it:
//   - keeps mc-runtime-test in the world (it quits once the player's tickCount reaches 100 with no screen open; KubeJS calls
//     the field `age`, so the counter is wound back 80 -> 20, as in gg_test_quest_book.js);
//   - on 'checkToken': checks, with the client's own resources, every grindless: item, every machine of the server half's list
//     (GTM's KubeJS builder registry) and every GT material our scripts register (GTRegistryInfo.MATERIAL). One FAIL line per
//     item with a problem, then one summary line per check:
//       names     the item's description id (the material's name key) is in en_us: ClientLanguage.loadFrom with en_us alone,
//                 whatever language the client uses;
//       models    the baked item model (ItemRenderer#getModel, what the inventory draws) is not ModelManager's missing model,
//                 and none of its quads (every face) nor its particle uses the missing texture (minecraft:missingno);
//       overlays  a controller's item model (GTM draws it facing north) has an overlay_front texture on its north face; a
//                 single-block machine has an overlay texture of ours on some face. A machine model without readable quads is
//                 noted, not failed: the gallery shows it;
//     and writes kubejs/exported/gg_gallery_report.json (per item: en_us name, model class, the sprites of each face; the panels);
//   - on 'shotToken': hides the HUD (options.hideGui) and fixes the view (FOV 70, no FOV effects: a spectator flies, which
//     widens it), waits until the player stands at the panel's camera, the panel's first machine is in the client's world and
//     its section is drawn, and grabs the screenshot into kubejs/exported/ (Screenshot.grab, as the quest book test). The view
//     settings come back when the test lets the client go; nothing is logged after the server half's DONE.
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggGallery) global.ggGallery = new CHM()
  var S = global.ggGallery
  var TAG = 'GGTEST|gallery|'
  var HOLD_MAX_MS = 15 * 60 * 1000
  var MISSING = 'minecraft:missingno'
  var REPORT = 'kubejs/exported/gg_gallery_report.json'
  var SHOT_MAX_TICKS = 400
  var SETTLE_TICKS = 20
  var RENDER_WAIT_TICKS = 160
  var FOV = 70
  var c = { holding: false, since: 0, errors: 0, ageField: null, gaveUp: false, checkDone: '', shotDone: '', shot: null, view: null, drawnUseless: false }
  var K = null

  function val(key) {
    var v = S.get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function log(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
    console.info(line)
  }

  function short(id) {
    return String(id).replace(/^gtceu:/, '')
  }

  function list(a, max) {
    return a.length <= max ? a.join(', ') : a.slice(0, max).join(', ') + ' and ' + (a.length - max) + ' more'
  }

  function windBack(p) {
    if (c.ageField === null) {
      var names = ['age', 'tickCount', 'f_19797_']
      for (var i = 0; i < names.length; i++) {
        var v = p[names[i]]
        if (v !== undefined && v !== null && typeof v !== 'function') {
          c.ageField = names[i]
          break
        }
      }
      if (c.ageField === null) c.ageField = ''
    }
    if (c.ageField === '') return
    if (Number(p[c.ageField]) >= 80) p[c.ageField] = 20
  }

  function field(obj, names) {
    for (var i = 0; i < names.length; i++) {
      var v = obj[names[i]]
      if (v !== undefined && v !== null) return v
    }
    return null
  }

  function method(obj, names) {
    for (var i = 0; i < names.length; i++) if (typeof obj[names[i]] === 'function') return obj[names[i]]()
    return null
  }

  // ---------------------------------------------------------------- names

  // en_us alone, from every resource pack the client has (mods, KubeJS's generated lang): the same files the game reads
  function english(mc) {
    var I18n = Java.loadClass('net.minecraft.client.resources.language.I18n')
    var selected = '?'
    try { selected = String(mc.getLanguageManager().getSelected()) } catch (e) { selected = '?' }
    try {
      var CL = Java.loadClass('net.minecraft.client.resources.language.ClientLanguage')
      var files = new (Java.loadClass('java.util.ArrayList'))()
      files.add('en_us')
      var lang = CL.loadFrom(mc.getResourceManager(), files, false)
      return {
        how: 'en_us lang files (client language ' + selected + ')',
        has: function (key) { return lang.has(key) === true },
        get: function (key) { return String(lang.getOrDefault(key)) },
        game: function (key) { return I18n.exists(key) === true }
      }
    } catch (e) {
      return {
        how: 'I18n.exists in the client language ' + selected + ' (ClientLanguage.loadFrom failed: ' + e + ')',
        has: function (key) { return I18n.exists(key) === true },
        get: function (key) { return String(I18n.get(key)) },
        game: function (key) { return I18n.exists(key) === true }
      }
    }
  }

  // ---------------------------------------------------------------- models

  function kit(mc) {
    if (K !== null) return K
    var all = Java.loadClass('net.minecraft.core.Direction').values()
    var dirs = [null]
    for (var i = 0; i < all.length; i++) dirs.push(all[i])
    K = {
      ir: method(mc, ['getItemRenderer', 'm_91291_']),
      rand: new (Java.loadClass('net.minecraft.world.level.levelgen.LegacyRandomSource'))(42),
      data: Java.loadClass('net.minecraftforge.client.model.data.ModelData').EMPTY,
      dirs: dirs
    }
    K.missing = method(mc, ['getModelManager', 'm_91304_']).getMissingModel()
    return K
  }

  function spriteName(sprite) {
    if (sprite === null || sprite === undefined) return '(none)'
    try {
      return String(sprite.contents().name())
    } catch (e) {
      var m = /name=([a-z0-9_.\-]+:[a-z0-9_.\-\/]+)/.exec(String(sprite))
      return m ? m[1] : String(sprite)
    }
  }

  // the sprites of every quad of the item model, by the face they look at (null side included: unculled quads). Vanilla models hand
  // out JDK immutable lists, whose methods Rhino cannot call (module access): they are copied first
  function modelInfo(stack) {
    var ArrayList = Java.loadClass('java.util.ArrayList')
    var model = K.ir.getModel(stack, null, null, 0)
    var info = { model: String(model.getClass().getName()), missingModel: false, custom: false, quads: 0, faces: {}, missingFaces: [], particle: '', errors: [] }
    try { info.missingModel = model === K.missing || model.equals(K.missing) === true } catch (e) { info.errors.push('equals: ' + e) }
    try { info.custom = model.isCustomRenderer() === true } catch (e) { info.errors.push('isCustomRenderer: ' + e) }
    for (var i = 0; i < K.dirs.length; i++) {
      var quads = null
      try {
        quads = new ArrayList(model.getQuads(null, K.dirs[i], K.rand, K.data, null))
      } catch (e) {
        info.errors.push('quads ' + K.dirs[i] + ': ' + e)
        continue
      }
      for (var j = 0; j < quads.size(); j++) {
        var q = quads.get(j)
        var face = String(q.getDirection())
        var name = spriteName(q.getSprite())
        info.quads++
        if (!info.faces[face]) info.faces[face] = []
        if (info.faces[face].indexOf(name) < 0) info.faces[face].push(name)
        if (name === MISSING && info.missingFaces.indexOf(face) < 0) info.missingFaces.push(face)
      }
    }
    try { info.particle = spriteName(model.getParticleIcon()) } catch (e) { info.errors.push('particle: ' + e) }
    return info
  }

  function overlaysOf(info) {
    var out = {}
    Object.keys(info.faces).forEach(function (f) {
      var ov = info.faces[f].filter(function (n) { return /\/overlay_/.test(n) })
      if (ov.length > 0) out[f] = ov
    })
    return out
  }

  // ---------------------------------------------------------------- the checks

  function materials(lang, fails) {
    var out = []
    try {
      var GRI = Java.loadClass('com.gregtechceu.gtceu.integration.kjs.GTRegistryInfo')
      var it = GRI.MATERIAL.objects.values().iterator()
      while (it.hasNext()) {
        var mat = null
        try { mat = it.next().get() } catch (e) { mat = null }
        if (mat === null || mat === undefined) continue
        var m = { id: String(mat.getResourceLocation()), key: String(mat.getUnlocalizedName()), en_us: null }
        if (lang.has(m.key)) m.en_us = lang.get(m.key)
        else {
          fails.names.push('material ' + m.id)
          log('name', 'FAIL', 'material ' + m.id + ': no en_us entry for ' + m.key + ' (its items show "' + m.key + '" in their names)')
        }
        out.push(m)
      }
    } catch (e) {
      log('materials', 'NOTE', 'could not read the materials of our scripts (GTRegistryInfo.MATERIAL): ' + e)
    }
    return out
  }

  function checkOne(s, lang, fails, tally) {
    var stack = Item.of(s.id)
    if (stack.isEmpty()) {
      fails.names.push(s.id)
      fails.models.push(s.id)
      log('name', 'FAIL', s.id + ': not a registered item')
      return
    }
    s.key = String(stack.getDescriptionId())
    s.shows = String(stack.getHoverName().getString())
    s.en_us = lang.has(s.key) ? lang.get(s.key) : null
    if (s.en_us === null) {
      fails.names.push(s.id)
      log('name', 'FAIL', s.id + ': no en_us entry for ' + s.key + (s.shows === s.key ? ' (the game shows the raw key)' : ' (the game shows "' + s.shows + '")'))
    }
    if (lang.game(s.key) !== lang.has(s.key)) tally.langDiff.push(s.key)

    var info = null
    try {
      info = modelInfo(stack)
    } catch (e) {
      fails.models.push(s.id)
      log('model', 'FAIL', s.id + ': the model could not be read: ' + e)
      return
    }
    s.model = info.model
    s.missingModel = info.missingModel
    s.quads = info.quads
    s.faces = info.faces
    s.particle = info.particle
    if (info.errors.length > 0) s.errors = info.errors
    var problems = []
    if (info.missingModel) problems.push('it is the missing model (the purple and black cube): no item model')
    else if (info.missingFaces.length > 0) problems.push('missing texture on its ' + info.missingFaces.join(', ') + ' faces')
    if (info.particle === MISSING && !info.missingModel) problems.push('missing particle texture')
    if (info.quads === 0 && !info.custom && !info.missingModel) problems.push('an empty model (no quads)')
    if (problems.length > 0) {
      fails.models.push(s.id)
      log('model', 'FAIL', s.id + ': ' + problems.join('; ') + ' (' + info.model + ')')
    }
    if (s.group === 'item' || info.missingModel) return

    if (info.quads === 0) {
      tally.unreadable.push(s.id)
      log('overlay', 'NOTE', s.id + ': no quads readable from ' + info.model + (info.errors.length > 0 ? ' (' + info.errors[0] + ')' : '') + ': see the gallery')
      return
    }
    var ov = overlaysOf(info)
    s.overlays = ov
    if (s.group === 'multiblock') {
      var front = (info.faces.north || []).filter(function (n) { return /\/overlay_front/.test(n) })
      var others = Object.keys(ov).filter(function (f) { return f !== 'north' })
      s.front = front
      if (front.length === 0) {
        fails.overlays.push(s.id)
        log('overlay', 'FAIL', s.id + ': no overlay_front texture on its front face, which shows only ' + (info.faces.north || ['nothing']).join(' + ') +
          (others.length > 0 ? '; overlays on ' + others.map(function (f) { return f + ' (' + ov[f].join(' + ') + ')' }).join(', ') : ''))
      } else if (others.length > 0) {
        tally.otherFaces.push(short(s.id) + ': ' + others.map(function (f) { return f + ' ' + ov[f].join(' + ') }).join(', '))
      }
    } else {
      var ours = Object.keys(ov).filter(function (f) { return ov[f].some(function (n) { return n.indexOf('grindless:') === 0 }) })
      s.ours = ours
      if (ours.length === 0) {
        fails.overlays.push(s.id)
        log('overlay', 'FAIL', s.id + ': no overlay texture of ours on any face (faces: ' + Object.keys(info.faces).map(function (f) { return f + ' ' + info.faces[f].join(' + ') }).join('; ') + ')')
      }
    }
  }

  function runChecks(mc) {
    var machines = JSON.parse(val('machines') || '[]')
    var panels = JSON.parse(val('panels') || '[]')
    kit(mc)
    var lang = english(mc)
    var BI = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    var ids = []
    var it = BI.ITEM.keySet().iterator()
    while (it.hasNext()) {
      var id = String(it.next())
      if (id.indexOf('grindless:') === 0) ids.push(id)
    }
    ids.sort()
    var subjects = ids.map(function (id) { return { id: id, group: 'item' } })
    machines.forEach(function (m) { subjects.push({ id: m.id, group: m.kind, panel: m.panel, row: m.row, col: m.col }) })

    var fails = { names: [], models: [], overlays: [] }
    var tally = { langDiff: [], unreadable: [], otherFaces: [] }
    subjects.forEach(function (s) {
      try {
        checkOne(s, lang, fails, tally)
      } catch (e) {
        fails.models.push(s.id)
        log('model', 'FAIL', s.id + ': exception while checking it: ' + e)
      }
    })
    var mats = materials(lang, fails)

    var multis = machines.filter(function (m) { return m.kind === 'multiblock' }).length
    var singles = machines.length - multis
    var named = ids.length + machines.length + mats.length
    log('names', fails.names.length === 0 ? 'PASS' : 'FAIL', fails.names.length === 0
      ? named + ' en_us names: ' + ids.length + ' grindless items, ' + machines.length + ' machines (' + multis + ' controllers, ' + singles +
        ' single blocks), ' + mats.length + ' materials of ours; read from ' + lang.how
      : fails.names.length + ' of ' + named + ' without an en_us name (' + lang.how + '): ' + list(fails.names, 40))
    if (tally.langDiff.length > 0) log('names_game', 'NOTE', 'the client language disagrees with en_us on ' + tally.langDiff.length + ' keys: ' + list(tally.langDiff, 20))
    log('models', fails.models.length === 0 ? 'PASS' : 'FAIL', fails.models.length === 0
      ? (ids.length + machines.length) + ' item models (' + ids.length + ' grindless items, ' + machines.length + ' machines): none is the missing model or uses the missing texture'
      : fails.models.length + ' of ' + (ids.length + machines.length) + ' item models are wrong: ' + list(fails.models, 40))
    log('overlays', fails.overlays.length === 0 ? 'PASS' : 'FAIL', (fails.overlays.length === 0
      ? (multis - tally.unreadable.length) + ' controllers show overlay_front on the front face, ' + singles + ' single-block machines an overlay of ours'
      : fails.overlays.length + ' of ' + machines.length + ' machines without their overlay: ' + list(fails.overlays.map(short), 40)) +
      (tally.unreadable.length > 0 ? '; not readable (see the gallery): ' + list(tally.unreadable.map(short), 20) : ''))
    if (tally.otherFaces.length > 0) log('overlay_faces', 'NOTE', 'controllers with overlays on other faces too: ' + list(tally.otherFaces, 20))

    writeReport({ format: 'gg-gallery-report-1', time: new Date().toISOString(), language: lang.how, panels: panels,
      failed: fails, subjects: subjects, materials: mats })
    var bad = fails.names.length + fails.models.length + fails.overlays.length
    return (bad === 0 ? 'PASS ' : 'FAIL ') + 'names ' + fails.names.length + ' bad of ' + named + ', models ' + fails.models.length + ' bad of ' +
      (ids.length + machines.length) + ', overlays ' + fails.overlays.length + ' bad of ' + machines.length
  }

  // JsonIO.write takes a Gson object: the JS document goes through Gson's parser (as gg_test_recipe_lookup.js does)
  function writeReport(doc) {
    try {
      try { Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths').dir('kubejs/exported') } catch (e0) { }
      JsonIO.write(REPORT, Java.loadClass('com.google.gson.JsonParser').parseString(JSON.stringify(doc)))
      log('report', 'NOTE', REPORT + ': ' + doc.subjects.length + ' items and machines, ' + doc.materials.length + ' materials, ' + doc.panels.length + ' panels')
    } catch (e) {
      log('report', 'NOTE', 'could not write ' + REPORT + ': ' + e)
    }
  }

  // ---------------------------------------------------------------- the screenshots

  function options(mc) {
    return field(mc, ['options', 'f_91066_'])
  }

  function hideGui(o, v) {
    var name = o.hideGui !== undefined ? 'hideGui' : 'f_92062_'
    if (v !== undefined) o[name] = v
    return o[name] === true
  }

  function viewText(mc) {
    var o = options(mc)
    var parts = []
    try { parts.push('HUD ' + (hideGui(o) ? 'hidden' : 'shown')) } catch (e) { parts.push('HUD ?') }
    try { parts.push('FOV ' + o.fov().get()) } catch (e) { parts.push('FOV ?') }
    try { parts.push('FOV effects ' + o.fovEffectScale().get()) } catch (e) { parts.push('FOV effects ?') }
    return parts.join(', ')
  }

  function applyView(mc) {
    var o = options(mc)
    if (c.view === null) {
      c.view = { hideGui: null, fov: null, fx: null }
      try { c.view.hideGui = hideGui(o) } catch (e) { c.view.hideGui = null }
      try { c.view.fov = Number(o.fov().get()) } catch (e) { c.view.fov = null }
      try { c.view.fx = Number(o.fovEffectScale().get()) } catch (e) { c.view.fx = null }
    }
    try { hideGui(o, true) } catch (e) { }
    try { o.fovEffectScale().set(0.0) } catch (e) { }
    try { if (Number(o.fov().get()) !== FOV) o.fov().set(Java.loadClass('java.lang.Integer').valueOf(FOV)) } catch (e) { }
  }

  function restoreView(mc) {
    if (c.view === null) return
    var o = options(mc)
    try { if (c.view.hideGui !== null) hideGui(o, c.view.hideGui) } catch (e) { }
    try { if (c.view.fx !== null) o.fovEffectScale().set(c.view.fx) } catch (e) { }
    try { if (c.view.fov !== null && Number(o.fov().get()) !== c.view.fov) o.fov().set(Java.loadClass('java.lang.Integer').valueOf(c.view.fov)) } catch (e) { }
    c.view = null
  }

  function near(p, cam) {
    return Math.abs(Number(p.getX()) - cam.x) < 0.75 && Math.abs(Number(p.getY()) - cam.y) < 0.75 && Math.abs(Number(p.getZ()) - cam.z) < 0.75
  }

  function blockAt(mc, pr) {
    var level = field(mc, ['level', 'f_91073_'])
    if (level === null) return 'no level'
    try {
      return String(level.getBlock(pr.x, pr.y, pr.z).getId())
    } catch (e) {
      try {
        var state = level.getBlockState(new (Java.loadClass('net.minecraft.core.BlockPos'))(pr.x, pr.y, pr.z))
        return String(Java.loadClass('net.minecraft.core.registries.BuiltInRegistries').BLOCK.getKey(state.getBlock()))
      } catch (e2) {
        return 'unreadable (' + e2 + ')'
      }
    }
  }

  // true/false: the probe's render section is built (Embeddium answers LevelRenderer#isChunkCompiled from its own sections);
  // null: unknown
  function sectionDrawn(mc, pr) {
    try {
      var lr = field(mc, ['levelRenderer', 'f_91060_'])
      if (lr === null || typeof lr.isChunkCompiled !== 'function') return null
      return lr.isChunkCompiled(new (Java.loadClass('net.minecraft.core.BlockPos'))(pr.x, pr.y, pr.z)) === true
    } catch (e) {
      return null
    }
  }

  // Screenshot.grab(gameDir, name, ...) writes <gameDir>/screenshots/<name>, so the name climbs into kubejs/exported
  function grab(mc, name) {
    try { Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths').dir('kubejs/exported') } catch (e) { }
    Java.loadClass('net.minecraft.client.Screenshot').grab(field(mc, ['gameDirectory', 'f_91069_']), '../kubejs/exported/' + name + '.png',
      method(mc, ['getMainRenderTarget', 'm_91385_']), function (msg) { })
  }

  function shotStep(mc, p) {
    var tok = val('shotToken')
    if (tok === '' || tok === c.shotDone || val('shotResult') !== '') return
    if (c.shot === null || c.shot.tok !== tok) {
      c.shot = { tok: tok, req: JSON.parse(val('shotRequest')), t: 0, readyAt: -1 }
      applyView(mc)
    }
    var s = c.shot
    s.t++
    try { mc.getToasts().clear() } catch (e) { }
    var pr = s.req.probe
    var posOk = near(p, s.req.cam)
    var block = pr === null ? '' : blockAt(mc, pr)
    var blockOk = pr === null || block === pr.id
    // a signal that never turned true on an earlier panel is not waited for again
    var drawn = pr === null || c.drawnUseless ? null : sectionDrawn(mc, pr)
    if (s.readyAt < 0 && posOk && blockOk) s.readyAt = s.t
    var waited = s.readyAt < 0 ? 0 : s.t - s.readyAt
    var ready = s.readyAt >= 0 && waited >= SETTLE_TICKS && (drawn !== false || waited >= RENDER_WAIT_TICKS)
    if (!ready && s.t < SHOT_MAX_TICKS) return
    if (drawn === false) c.drawnUseless = true

    var state = 'after ' + s.t + ' ticks: camera ' + (posOk ? 'in place' : 'not in place (player at ' + Math.round(Number(p.getX()) * 10) / 10 + ' ' +
      Math.round(Number(p.getY()) * 10) / 10 + ' ' + Math.round(Number(p.getZ()) * 10) / 10 + ')') + ', ' +
      (blockOk ? 'panel in the client world' : 'the client has ' + block + ' where ' + pr.id + ' stands') + ', section ' +
      (drawn === null ? 'state unknown' : drawn ? 'drawn' : 'not drawn yet') + '; ' + viewText(mc)
    var ok = posOk && blockOk
    try {
      grab(mc, s.req.name)
    } catch (e) {
      ok = false
      state += '; grab failed: ' + e
    }
    log('shot', 'NOTE', 'kubejs/exported/' + s.req.name + '.png ' + state)
    S.put('shotResult', (ok ? 'PASS ' : 'FAIL ') + s.req.name + '.png ' + state)
    c.shotDone = tok
    c.shot = null
  }

  // ---------------------------------------------------------------- the tick

  function tick() {
    var mc = Client
    var p = mc.player
    if (p === null || p === undefined) return
    if (val('hold') !== 'true' || c.gaveUp) {
      if (c.holding) {
        c.holding = false
        restoreView(mc)
      }
      return
    }
    if (!c.holding) {
      c.holding = true
      c.since = Date.now()
      log('client_hold', 'NOTE', 'keeping mc-runtime-test in the world until the server half is done')
    }
    if (Date.now() - c.since > HOLD_MAX_MS) {
      c.gaveUp = true
      restoreView(mc)
      log('client_hold', 'NOTE', 'gave up holding after ' + (HOLD_MAX_MS / 60000) + ' min')
      return
    }
    windBack(p)
    var ct = val('checkToken')
    if (ct !== '' && ct !== c.checkDone && val('checkResult') === '') {
      c.checkDone = ct
      var r = ''
      try {
        r = runChecks(mc)
      } catch (e) {
        r = 'FAIL exception in the checks: ' + e
        log('checks', 'FAIL', 'exception in the checks: ' + e)
      }
      S.put('checkResult', r)
    }
    shotStep(mc, p)
  }

  ClientEvents.tick(function (event) {
    try {
      tick()
    } catch (e) {
      if (c.errors++ < 5) log('client_script', 'NOTE', 'exception: ' + e)
    }
  })
})()
