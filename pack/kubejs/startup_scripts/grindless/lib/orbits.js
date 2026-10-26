// priority: 899
(function () {
  var G = global.grindless
  var table = G.readJsonTable('kubejs/data/grindless/tables/orbits.json')
  if (!table || !Array.isArray(table.dimensions) || table.dimensions.length === 0 ||
      table.dimensions.indexOf(table.earth) < 0) {
    throw new Error('[grindless/orbits] invalid orbit dimension table')
  }
  var seen = {}
  table.dimensions.forEach(function (id) {
    if (!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(id) || seen[id]) {
      throw new Error('[grindless/orbits] invalid or duplicate dimension: ' + id)
    }
    seen[id] = true
  })
  G.orbits = {
    earth: table.earth,
    dimensions: table.dimensions,
    allow: function (recipe) {
      table.dimensions.forEach(function (id) { recipe.dimension(id) })
      return recipe
    }
  }
})()
