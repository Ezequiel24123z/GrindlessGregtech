// priority: -22724
// -----------------------------------------------------------------------------------------------
// Steam era: recipes of the Horizon Collector (machine, recipe type and shard: startup_scripts/grindless/steam/horizon_collector.js;
// docs/eras/steam.md, "The Horizon Collector (the start)"; package STEAM-X1). Generated at every server load from
// data/grindless/tables/horizon_collector.json: one recipe per row.
//
//   gtceu:horizon_collection   grindless:horizon_shard (NOT consumed) + programmed circuit (= the row)  ->  count x output
//                              16 EU/t, 160 ticks (8 s), the count split into stacks of 64 (max 4 outputs); id grindless:horizon_collection/<name> (GTM's builder puts the type in front).
//   No recipe makes the machine or the shard: the Welcome quest "The Horizon Collector" gives them once per player.
//
// Published for tests: global.grindless.horizonCollector = { recipes: [{ id, circuit, output, count }], skipped: [string] }.
(function () {
  var LOG = '[grindless/horizon] '
  var G = global.grindless || (global.grindless = {})
  var TABLE = 'kubejs/data/grindless/tables/horizon_collector.json'
  var OUT_SLOTS = 4 // setMaxIOSize in startup_scripts/grindless/steam/horizon_collector.js
  var NEVER_OUTPUT = ['gtceu:lv_horizon_collector', 'grindless:horizon_shard']

  ServerEvents.recipes(function (event) {
    var t = G.readJsonTable(TABLE)
    var HC = G.horizonCollector = { recipes: [], skipped: [] }
    var seen = {}
    var rows = Array.isArray(t.rows) ? t.rows : []
    rows.forEach(function (r) {
      var name = String(r.name || '')
      var circuit = Number(r.circuit)
      var count = Number(r.count)
      var output = String(r.output || '')
      var bad = []
      if (!/^[a-z0-9_]+$/.test(name) || seen['n' + name]) bad.push('name')
      if (!(circuit >= 1 && circuit <= 32) || seen['c' + circuit]) bad.push('circuit ' + r.circuit)
      if (!(count >= 1 && count <= 64 * OUT_SLOTS && count % 1 === 0)) bad.push('count ' + r.count)
      if (!Item.exists(output) || NEVER_OUTPUT.indexOf(output) >= 0) bad.push('output ' + output)
      if (bad.length > 0) {
        HC.skipped.push(name + ': ' + bad.join(', '))
        return
      }
      seen['n' + name] = true
      seen['c' + circuit] = true
      var b = event.recipes.gtceu.horizon_collection('grindless:' + name)
        .notConsumable(t.catalyst)
        .circuit(circuit)
      for (var left = count; left > 0; left -= 64) b.itemOutputs(Math.min(left, 64) + 'x ' + output)
      b.EUt(t.eut).duration(t.duration)
      HC.recipes.push({ id: 'grindless:horizon_collection/' + name, circuit: circuit, output: output, count: count })
    })
    HC.skipped.forEach(function (s) { console.error(LOG + 'row skipped: ' + s) })
    console.info(LOG + 'recipes: horizon_collection=' + HC.recipes.length)
  })
})()
