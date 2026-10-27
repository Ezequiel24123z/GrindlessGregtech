// priority: -124
// -----------------------------------------------------------------------------------------------
// Planets: which dimension belongs to which planet (data/grindless/tables/planets.json). The Overworld, the Nether, the End and the
// pack's own dimensions are Earth; GCYR's Moon and its orbit are the Moon.
// Published as global.grindless.planets for moon/quantum_bridge.js (the Earth-Moon quantum pairs) and the smoke test:
//   planetOf(dimensionId) -> planet key ('earth', 'moon', ...; an unknown dimension is its own planet: its id)
//   isEarth(dimensionId), dimensionOf(level), table
// Nothing else changes between planets: ender chests, tanks, bags and covers, Modular Routers and Waystones work on every planet as
// their mods ship them (DECISIONS.md: they are quality of life).
(function () {
  const G = global.grindless
  const TABLE = 'kubejs/data/grindless/tables/planets.json'

  var table = G.readJsonTable(TABLE)
  var byDimension = {}
  Object.keys(table.planets).forEach(function (key) {
    table.planets[key].dimensions.forEach(function (d) { byDimension[d] = key })
  })

  // the id of a level's dimension: KubeJS shows getDimension() (a ResourceLocation) as the property level.dimension; if a level ever
  // shows vanilla's dimension() instead, its key's location is the same id
  function dimensionOf(level) {
    var d = level.dimension
    return String(typeof d === 'function' ? level.dimension().location() : d)
  }

  var P = {
    table: table,
    planetOf: function (dimension) {
      var d = String(dimension)
      return byDimension.hasOwnProperty(d) ? byDimension[d] : d
    },
    isEarth: function (dimension) { return P.planetOf(dimension) === 'earth' },
    dimensionOf: dimensionOf
  }
  G.planets = P
})()
