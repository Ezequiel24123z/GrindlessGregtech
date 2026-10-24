// priority: 900
// -----------------------------------------------------------------------------------------------
// Grindless data tables for startup scripts.
//
// KubeJS startup and server scripts live in different scopes, but they run in the same JVM, so they
// can share data through the `global` map. The canonical tables are JSON files under
// kubejs/data/grindless/tables/ (plain data: easy to review, diff and read from other tools);
// this file loads them once and publishes them as global.grindless.tables.<name>.
//
//   global.grindless.tables.veins   vein table extracted from GTM 7.5.3 (see the file for its format).
//                                   Startup uses it for the vein sample items; server_scripts/grindless/
//                                   data/veins.js derives the drilling recipe data from the same object.
(function () {
  const G = global.grindless || (global.grindless = {})
  G.tables = G.tables || {}

  // path is relative to the game directory (the folder that contains kubejs/)
  G.readJsonTable = function (path) {
    var json = JsonIO.readJson(path)
    if (json == null) {
      throw new Error('[grindless/tables] cannot read ' + path)
    }
    return JSON.parse(JsonIO.toPrettyString(json))
  }

  G.tables.veins = G.readJsonTable('kubejs/data/grindless/tables/veins.json')

  if (!G.tables.veins || !G.tables.veins.veins || G.tables.veins.veins.length === 0) {
    throw new Error('[grindless/tables] veins.json has no veins')
  }
  console.info('[grindless/tables] loaded ' + G.tables.veins.veins.length + ' veins')
})()
