// -----------------------------------------------------------------------------------------------
// Sophisticated Storage's metal tiers, stronger than the mod's (table kubejs/data/grindless/tables/chest_furnace_tiers.json, section
// sophisticatedstorage: copper, iron and gold storages get twice the slots, diamond and netherite the engine's 180, every metal tier twice
// the upgrade slots, and limited barrels twice the per-slot multiplier). Wood stays as the mod has it.
//
// Why a startup script and not defaultconfigs: these values live in Sophisticated Storage's SERVER config, one file per world
// (<world>/serverconfig/sophisticatedstorage-server.toml). Forge only copies defaultconfigs into a world that has no such file yet
// (ConfigFileTypeHandler), so an existing world would never see them.
// When: Forge's ServerAboutToStartEvent. Forge has just loaded the world's server configs (ServerLifecycleHooks.handleServerAboutToStart)
// and no level, chunk or block entity is loaded yet, so every storage loads under the final values.
// What: a key still at the mod's stock value is raised to the pack value; a key already at the pack value is left alone; any other value
// was customized and is kept. Values are never lowered: a single chest that loads under a slot count lower than its own drops the
// overflow (ChestBlockEntity#load). Placed storages then grow on their own when they load (StorageWrapper#promoteSlotNumbersToDefaults
// adds empty slots at the end and saves); double chests keep their saved size until they are tier-upgraded or rebuilt.
// Writing safely: Forge's file config autosaves on every set, and its watcher reloads the file when it changes; a reload that reads a
// half-written file "corrects" it back to the defaults (ConfigFileTypeHandler.ConfigWatcher). The watcher skips while the spec is
// correcting, so the sets run inside the listener of ForgeConfigSpec#correct on a throwaway in-memory config: every write happens while
// isCorrecting() is true, and a later reload reads the finished file.
// Integers: Rhino turns a JS number passed as Object into a Double (NativeJavaObject.coerceTypeImpl), and an IntValue holding a Double
// throws ClassCastException in the mod. A constructed java.lang.Integer is a wrapped Java object and passes through as an Integer. A probe
// checks that before anything is written, and every value is checked again in Java afterwards (rolled back if one is not an Integer).
//
// Published for the bench test: global.grindless.storageTiers = { targets, last, apply(reason) }.
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var G = global.grindless || (global.grindless = {})
  var LOG = '[grindless/storage_tiers] '
  var TABLE = 'kubejs/data/grindless/tables/chest_furnace_tiers.json'
  var table = G.readJsonTable(TABLE).sophisticatedstorage

  function section(pattern, parts) {
    var s = pattern
    Object.keys(parts).forEach(function (k) { s = s.replace('{' + k + '}', parts[k]) })
    return s
  }

  function check(t) {
    var b = table.bounds[t.key]
    var ok = Math.floor(t.stock) === t.stock && Math.floor(t.pack) === t.pack && t.pack >= t.stock && t.pack >= b[0] && t.pack <= b[1]
    if (!ok) throw new Error(LOG + TABLE + ': bad pair for ' + t.path + ': [' + t.stock + ', ' + t.pack + '] (bounds ' + b[0] + '-' + b[1] + ')')
    return t
  }

  function expand() {
    var out = []
    var st = table.storages
    Object.keys(st.tiers).forEach(function (tier) {
      st.families.forEach(function (family) {
        var sec = section(st.section, { tier: tier, family: family })
        ;['inventorySlotCount', 'upgradeSlotCount'].forEach(function (key) {
          var pair = st.tiers[tier][key]
          out.push(check({ path: table.root + '.' + sec + '.' + key, key: key, stock: pair[0], pack: pair[1] }))
        })
      })
    })
    var lb = table.limitedBarrels
    Object.keys(lb.tiers).forEach(function (tier) {
      lb.sizes.forEach(function (size) {
        var sec = section(lb.section, { tier: tier, size: size })
        var m = lb.tiers[tier].baseSlotLimitMultiplier[size]
        var u = lb.tiers[tier].upgradeSlotCount
        out.push(check({ path: table.root + '.' + sec + '.baseSlotLimitMultiplier', key: 'baseSlotLimitMultiplier', stock: m[0], pack: m[1] }))
        out.push(check({ path: table.root + '.' + sec + '.upgradeSlotCount', key: 'upgradeSlotCount', stock: u[0], pack: u[1] }))
      })
    })
    return out
  }

  var TARGETS = expand()
  var S = (G.storageTiers = { targets: TARGETS, last: null, apply: null })

  var J = null
  function cls() {
    if (J !== null) return J
    J = {
      Config: Java.loadClass('net.p3pp3rf1y.sophisticatedstorage.Config'),
      CommentedConfig: Java.loadClass('com.electronwill.nightconfig.core.CommentedConfig'),
      Integer: Java.loadClass('java.lang.Integer'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      IntStream: Java.loadClass('java.util.stream.IntStream'),
      Stream: Java.loadClass('java.util.stream.Stream'),
      Collectors: Java.loadClass('java.util.stream.Collectors')
    }
    return J
  }

  // a List<Integer> made entirely in Java
  function javaInts(n) {
    return cls().IntStream.of(n).boxed().collect(cls().Collectors.toList())
  }

  // the boxing a set() relies on: a constructed Integer handed to an Object parameter stays an Integer
  function probe() {
    var list = new (cls().ArrayList)()
    list.add(new (cls().Integer)(7))
    return list.equals(javaInts(7))
  }

  // the value really held by the config value: read by Java (Stream.generate calls its get()) and compared in Java
  function holdsInteger(cv, n) {
    return cls().Stream.generate(cv).limit(1).collect(cls().Collectors.toList()).equals(javaInts(n))
  }

  // runs fn while the spec is correcting (see the header): Forge's file watcher skips its reloads meanwhile
  function guarded(spec, fn) {
    var ran = false
    var error = null
    spec.correct(cls().CommentedConfig.inMemory(), function (action, path, incorrect, corrected) {
      if (ran) return
      ran = true
      try {
        fn()
      } catch (e) {
        error = e
      }
    })
    if (!ran) throw new Error('the correction listener never ran')
    if (error !== null) throw error
  }

  function setAll(spec, list, field) {
    guarded(spec, function () {
      list.forEach(function (x) { x.cv.set(new (cls().Integer)(x.t[field])) })
      spec.save()
    })
  }

  S.apply = function (reason) {
    var report = { reason: String(reason), file: table.file, targets: TARGETS.length, raised: [], already: 0, kept: [], missing: [], ok: false, error: '' }
    S.last = report
    try {
      var spec = cls().Config.SERVER_SPEC
      if (!spec.isLoaded()) {
        report.error = 'Sophisticated Storage server config is not loaded'
      } else {
        var values = spec.getValues()
        var todo = []
        TARGETS.forEach(function (t) {
          // Rhino's concatenated paths otherwise match both NightConfig get(String) and get(List).
          var cv = values['get(java.lang.String)'](t.path)
          if (cv === null || cv === undefined) {
            report.missing.push(t.path)
            return
          }
          var cur = Number(cv.get())
          if (cur === t.pack) report.already++
          else if (cur === t.stock) todo.push({ t: t, cv: cv })
          else report.kept.push(t.path + '=' + cur)
        })
        if (todo.length > 0) {
          if (!probe()) {
            report.error = 'a constructed java.lang.Integer did not reach Java as an Integer: nothing written'
          } else {
            setAll(spec, todo, 'pack')
            var bad = todo.filter(function (x) { return !holdsInteger(x.cv, x.t.pack) })
            if (bad.length > 0) {
              setAll(spec, todo, 'stock')
              report.error = bad.length + ' value(s) did not hold an Integer after the write (' + bad[0].t.path + '...): rolled back to the stock values'
            } else {
              report.raised = todo.map(function (x) { return x.t.path + ' ' + x.t.stock + '->' + x.t.pack })
            }
          }
        }
      }
    } catch (e) {
      report.error = 'exception: ' + e
    }
    report.ok = report.error === ''
    var line = LOG + table.file + ' (' + report.reason + '): ' + report.raised.length + ' key(s) raised from stock to the pack value, ' + report.already +
      ' already at it, ' + report.kept.length + ' customized and kept' + (report.kept.length > 0 ? ' (' + report.kept.join(', ') + ')' : '') + ', ' +
      report.missing.length + ' missing from the mod' + (report.missing.length > 0 ? ' (' + report.missing.join(', ') + ')' : '')
    if (report.ok) console.info(line)
    else console.error(line + '; ERROR: ' + report.error)
    return report
  }

  ForgeEvents.onEvent('net.minecraftforge.event.server.ServerAboutToStartEvent', function (event) {
    S.apply('server about to start')
  })
  console.info(LOG + 'loaded ' + TARGETS.length + ' keys from ' + TABLE + '; applied when a server starts')
})()
