// priority: 899
// LuV surface dimension ids, in one table (tables/places.json) so the ids fixed by spike S0-1 are one edit. Orbits are in orbits.js.
(function () {
  var G = global.grindless
  var table = G.readJsonTable('kubejs/data/grindless/tables/places.json')
  if (!table || !table.surfaces || Object.keys(table.surfaces).length === 0) {
    throw new Error('[grindless/places] invalid places table')
  }
  var seen = {}
  Object.keys(table.surfaces).forEach(function (key) {
    var id = table.surfaces[key]
    if (!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(id) || seen[id]) {
      throw new Error('[grindless/places] invalid or duplicate dimension: ' + key + ' = ' + id)
    }
    seen[id] = true
  })
  function surface(key) {
    var id = table.surfaces[key]
    if (!id) throw new Error('[grindless/places] unknown surface: ' + key)
    return id
  }
  G.places = {
    surfaces: table.surfaces,
    surface: surface,
    allow: function (recipe, key) {
      recipe.dimension(surface(key))
      return recipe
    }
  }
})()