// TEST ONLY, UV-A5 (the synchrotron, the muon fusion cell, the antimatter trap and their chains).
// Command: kubejs custom_command gg_test_uv_accelerators   Reserved band: X 24320-24383, Z 0-63: Overworld Y 98-112 and
// gcyr:overworld_orbit Y 198-214 at the same X/Z (one trap controller in each, removed at the end).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server -PackDir <copy of pack> `
//     -Commands 'kubejs custom_command gg_test_uv_accelerators' -WaitForLog 'GGTEST\|uv_accelerators\|DONE'
//
// Markers: GGTEST|uv_accelerators|<check>|PASS|FAIL|NOTE|<detail>
(function () {
  var NAME = 'uv_accelerators'
  var REQUEST = 'ggTestUvAcceleratorsRequest'
  var ORBIT = 'gcyr:overworld_orbit'
  var TRAP = 'gtceu:antimatter_trap'
  var X = 24330
  var Z = 10
  var LOADED = Date.now()
  var DONE = false
  var failed = 0

  function check(name, ok, detail) {
    if (!ok) failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + detail)
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + detail) }
  function rl(id) { return new (Java.loadClass('net.minecraft.resources.ResourceLocation'))(id) }
  function byId(server, id) {
    var found = server.getRecipeManager().byKey(rl(id))
    if (!found.isPresent()) {
      // the recipe builder may prefix the recipe type: grindless:<type>/<type>/<name>
      var m = /^grindless:([a-z_]+)\/(.+)$/.exec(id)
      if (m) found = server.getRecipeManager().byKey(rl('grindless:' + m[1] + '/' + m[1] + '/' + m[2]))
    }
    return found.isPresent() ? found.get() : null
  }
  function asArray(coll) {
    if (coll === null || coll === undefined) return []
    var list = new (Java.loadClass('java.util.ArrayList'))(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function eutOf(r) {
    try {
      var cap = Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.EURecipeCapability').CAP
      var list = r.tickOutputs.get(cap)
      var sign = 1
      if (list === null || list === undefined || list.size() === 0) { list = r.tickInputs.get(cap); sign = -1 }
      if (list === null || list === undefined || list.size() === 0) return 0
      var content = String(list.get(0).content)
      note('eut_raw', content)
      var m = /voltage=(\d+), amperage=(\d+)/.exec(content)
      return sign * (m ? Number(m[1]) * Number(m[2]) : Number(content))
    } catch (e) { return NaN }
  }
  function dimsOf(r) {
    var dims = []
    asArray(r.conditions).forEach(function (c) {
      try {
        if (c.getDimension) dims.push(String(c.getDimension().location()) + (c.isReverse() ? ' (reverse)' : ''))
      } catch (e) { /* not a dimension condition */ }
    })
    return dims
  }

  // a trap controller placed in one level, asked whether a trap recipe's conditions hold there
  function conditionsAt(server, levelId, y, recipe) {
    var level = server.getLevel(levelId)
    if (level === null || level === undefined) return { ok: null, detail: levelId + ' is not loaded' }
    var run = function (text) { return server.runCommandSilent('execute in ' + levelId + ' run ' + text) }
    level.getChunk(X >> 4, Z >> 4)
    run('forceload add ' + X + ' ' + Z)
    var placed = run('setblock ' + X + ' ' + y + ' ' + Z + ' ' + TRAP)
    var out = { ok: null, detail: '' }
    try {
      var BlockPos = Java.loadClass('net.minecraft.core.BlockPos')
      var MetaMachine = Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
      var Helper = Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
      var ctrl = MetaMachine.getMachine(level, new BlockPos(X, y, Z))
      if (ctrl === null) {
        out.detail = 'no machine at ' + X + ',' + y + ',' + Z + ' (setblock result ' + placed + ')'
      } else {
        out.ok = Helper.checkConditions(recipe, ctrl.getRecipeLogic()).isSuccess() === true
        out.detail = levelId + ' conditions ' + out.ok
      }
    } catch (e) {
      out.detail = 'threw ' + e
    }
    run('setblock ' + X + ' ' + y + ' ' + Z + ' air')
    run('forceload remove ' + X + ' ' + Z)
    return out
  }

  function run(server) {
    var AC = global.grindless && global.grindless.accelerators
    check('published', AC !== undefined && AC !== null && AC.recipes !== undefined, AC ? 'yes' : 'no')
    if (!AC || !AC.recipes) return
    var skipped = AC.skipped || []
    check('skipped', skipped.length === 0, skipped.length === 0 ? 'none' : JSON.stringify(skipped))
    check('clashes', (AC.clashes || []).length === 0, JSON.stringify(AC.clashes || []))
    AC.recipes.forEach(function (rec) {
      var live = byId(server, rec.recipeId)
      check('recipe_' + rec.type + '_' + rec.name, live !== null, rec.recipeId + (live === null ? ' is not loaded' : ''))
    })
    ;(AC.controllerRecipes || []).forEach(function (id) { check('controller_' + id, byId(server, id) !== null, id) })

    AC.recipes.filter(function (r) { return r.type === 'muon_catalysed_fusion' }).forEach(function (rec) {
      var live = byId(server, rec.recipeId)
      if (live === null) return
      var eut = eutOf(live)
      check('cell_not_doubled', Math.abs(eut) === 786432 && Number(live.duration) === 1200,
        'EU/t ' + eut + ', duration ' + live.duration + ' (expected 786432 x 1200, written final)')
    })

    var traps = AC.recipes.filter(function (r) { return r.type === 'antimatter_storage' })
    check('trap_rows', traps.length > 0, traps.length + ' rows')
    var first = null
    traps.forEach(function (rec) {
      var live = byId(server, rec.recipeId)
      if (live === null) return
      if (first === null) first = live
      var dims = dimsOf(live)
      check('trap_dimension_' + rec.name, dims.length === 1 && dims[0] === ORBIT, dims.length === 0 ? 'no dimension condition' : dims.join(', '))
    })
    if (first === null) return
    var earth = conditionsAt(server, 'minecraft:overworld', 100, first)
    check('trap_veto_overworld', earth.ok === false, earth.detail)
    var orbit = conditionsAt(server, ORBIT, 200, first)
    check('trap_runs_in_orbit', orbit.ok === true, orbit.detail)
  }

  ServerEvents.customCommand('gg_test_uv_accelerators', function () {
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && !DONE && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        DONE = true
        run(event.server)
        console.info('GGTEST|' + NAME + '|DONE|' + (failed === 0 ? 'PASS' : 'FAIL') + '|' + failed + ' failed')
      }
    } catch (e) {
      check('exception', false, String(e))
      console.info('GGTEST|' + NAME + '|DONE|FAIL|' + failed + ' failed')
    }
  })
})()
