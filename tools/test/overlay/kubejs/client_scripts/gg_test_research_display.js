// priority: 11950
// AUD-1: lists every recipe EMI shows (id, category, inputs, outputs) to kubejs/exported/gg_emi_recipes.json, with the tooltip
// of every output for the scanner and research station pages, so the pack's recipes can be compared with the server dump.
// Read-only. Armed by kubejs/config/gg_test_research_display.json = {"enabled": true} (the committed marker is false); it runs once,
// in the tick after EMI has loaded, while the EMI coverage fixture still holds the client in the world.
;(function () {
  var MARKER = 'kubejs/config/gg_test_research_display.json'
  var OUT = 'kubejs/exported/gg_emi_recipes.json'
  var T = 'GGTEST|research_display|'
  var TOOLTIP_CATEGORIES = ['gtceu:scanner', 'gtceu:research_station']
  var state = { armed: null, done: false }

  function log(check, status, detail) {
    var line = T + check + '|' + status
    if (detail !== undefined && detail !== null) line += '|' + String(detail).replace(/[\r\n]+/g, ' ')
    console.info(line)
  }

  function armed() {
    if (state.armed === null) {
      var m = null
      try {
        var j = JsonIO.readJson(MARKER)
        m = j === null || j === undefined ? null : JSON.parse(String(JsonIO.toPrettyString(j)))
      } catch (e) {
        m = null
      }
      state.armed = m !== null && String(m.enabled) === 'true'
    }
    return state.armed
  }

  function describe(stack, withTooltip) {
    var s = { id: String(stack.getId()), n: Number(stack.getAmount()) }
    var nbt = stack.getNbt()
    if (nbt !== null && nbt !== undefined) s.nbt = String(nbt)
    if (withTooltip) {
      try {
        var lines = stack.getTooltipText()
        var out = []
        for (var i = 0; i < lines.size(); i++) out.push(String(lines.get(i).getString()))
        s.tip = out
      } catch (e) {
        s.tip = ['<tooltip error: ' + e + '>']
      }
    }
    return s
  }

  function ingredient(ing, withTooltip) {
    var list = new (Java.loadClass('java.util.ArrayList'))(ing.getEmiStacks())
    if (list.size() === 0) return { id: '<empty>', n: 0 }
    var s = describe(list.get(0), withTooltip)
    if (list.size() > 1) s.alt = list.size()
    return s
  }

  function dump() {
    var EmiApi = Java.loadClass('dev.emi.emi.api.EmiApi')
    var ArrayList = Java.loadClass('java.util.ArrayList')
    var JsonParser = Java.loadClass('com.google.gson.JsonParser')
    var rm = EmiApi.getRecipeManager()
    var all = []
    var cats = new ArrayList(rm.getCategories())
    var total = 0
    for (var ci = 0; ci < cats.size(); ci++) {
        var cat = cats.get(ci)
        var cid = String(cat.getId())
        var tip = TOOLTIP_CATEGORIES.indexOf(cid) >= 0
        var recipes = new ArrayList(rm['getRecipes(dev.emi.emi.api.recipe.EmiRecipeCategory)'](cat))
        console.info(T + 'category|' + cid + '|' + recipes.size())
        for (var ri = 0; ri < recipes.size(); ri++) {
          var r = recipes.get(ri)
          var rec = { id: String(r.getId()), cat: cid, in: [], out: [] }
          try {
            var ins = new ArrayList(r.getInputs())
            for (var ii = 0; ii < ins.size() && ii < 12; ii++) rec.in.push(ingredient(ins.get(ii), tip))
            var outs = new ArrayList(r.getOutputs())
            for (var oi = 0; oi < outs.size() && oi < 12; oi++) rec.out.push(describe(outs.get(oi), tip))
          } catch (e) {
            rec.error = String(e)
          }
          all.push(rec)
          if (tip) console.info(T + 'recipe|' + JSON.stringify(rec))
          total++
        }
      }
    Java.loadClass('net.minecraft.FileUtil').createDirectoriesSafe('kubejs/exported')
    JsonIO.write(OUT, JsonParser.parseString(JSON.stringify({ recipes: all })))
    log('dump', 'PASS', total + ' recipes in ' + cats.size() + ' categories -> ' + OUT)
  }

  ClientEvents.tick(function (event) {
    if (state.done || !armed()) return
    if (Client.player === null || Client.player === undefined) return
    if (!Java.loadClass('dev.emi.emi.runtime.EmiReloadManager').isLoaded()) return
    state.done = true
    try {
      dump()
    } catch (e) {
      log('dump', 'FAIL', 'exception: ' + e)
    }
    console.info(T + 'DONE')
  })
})()
