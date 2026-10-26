(function () {
  var G = global.grindless
  ServerEvents.recipes(function (event) {
    var A = G.orbitalSolar
    var factor = G.sunlight.factor(G.orbits.earth)
    if (!(factor > 0)) throw new Error('[grindless/orbital_solar] Earth orbit sunlight missing')
    var eut = Math.round(A.baseEuPerPanel * factor * A.junctionMultiplier)
    event.recipes.gtceu.orbital_solar('grindless:earth')
      .circuit(1).dimension(G.orbits.earth).EUt(-eut).duration(A.duration)
    event.recipes.gtceu.assembler('grindless:luv/orbital_solar_panel')
      .itemInputs('gcyr:photovoltaic_cell', 'gtceu:titanium_frame', '2x gtceu:aluminium_foil')
      .itemOutputs('grindless:orbital_solar_panel').EUt(7680).duration(200)
    event.recipes.gtceu.assembler('grindless:luv/orbital_solar_panel_triple_junction')
      .circuit(2)
      .itemInputs('4x grindless:triple_junction_cell', '#gtceu:circuits/luv',
        'gtceu:tempered_glass', '4x gtceu:gold_fine_wire', 'gtceu:titanium_frame')
      .itemOutputs('2x grindless:orbital_solar_panel').EUt(7680).duration(200)
    event.recipes.gtceu.assembler('grindless:luv/orbital_solar_station')
      .itemInputs('gtceu:luv_machine_hull', '4x gcyr:photovoltaic_cell', '2x gtceu:luv_sensor',
        '2x #gtceu:circuits/luv')
      .itemOutputs(A.machine).EUt(30720).duration(200)
  })
})()
