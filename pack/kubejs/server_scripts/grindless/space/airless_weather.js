// priority: -21909
// -----------------------------------------------------------------------------------------------
// Earth's weather stays on Earth (DECISIONS.md 2026-10-25).
// In vanilla 1.20.1 every dimension but the Overworld reads the Overworld's rain and thunder flags (DerivedLevelData), and a dimension
// with sky light raises its own rain and thunder levels with them. GCYR's planets and orbits all have sky light, and its mixins only
// touch the clock (the Dyson sphere). Rain alone darkens the sky enough for Level#isNight() at noon, and GTM's daytime condition is
// !level.isNight(), so rain on Earth used to stop the lunar solar array, the Lunar Drill's helium-3 and the tripod's solar wings, and
// let the antenna's night recipe run by day.
// At the end of every server tick this sets the rain and thunder levels of every dimension of the other planets
// (data/grindless/tables/planets.json: every planet but earth) back to 0. The next weather cycle raises them to 0.01 at most before
// the sky is computed, so the sky, Level#isNight() and every condition that reads them follow the clock alone. Earth's dimensions,
// and the weather controller, are left alone, except planets.json's dryOnEarth: Earth orbit belongs to Earth (its AE2 pairs and its air
// table) but is above the weather (docs/eras/luv.md, "Weather and time").
// Published as global.grindless.airlessWeather for the test: { dimensions }.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  var G = global.grindless
  var table = G.readJsonTable('kubejs/data/grindless/tables/planets.json')
  var planets = table.planets
  var DIMENSIONS = []
  Object.keys(planets).forEach(function (k) {
    if (k !== 'earth') planets[k].dimensions.forEach(function (d) { DIMENSIONS.push(String(d)) })
  })
  ;(table.dryOnEarth || []).forEach(function (d) {
    if (DIMENSIONS.indexOf(String(d)) < 0) DIMENSIONS.push(String(d))
  })
  G.airlessWeather = { dimensions: DIMENSIONS }

  ServerEvents.tick(function (event) {
    var server = event.server
    for (var i = 0; i < DIMENSIONS.length; i++) {
      var level = server.getLevel(DIMENSIONS[i])
      if (level === null) continue
      if (level.getRainLevel(1) > 0 || level.getThunderLevel(1) > 0) {
        level.setRainLevel(0)
        level.setThunderLevel(0)
      }
    }
  })
})()
