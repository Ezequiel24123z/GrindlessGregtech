// priority: -18724
(function () {
  var G = global.grindless
  ServerEvents.recipes(function (event) {
    var A = G.orbitalSolar
    var factor = G.sunlight.factor(G.orbits.earth)
    if (!(factor > 0)) throw new Error('[grindless/orbital_solar] Earth orbit sunlight missing')
    var eut = Math.round(A.baseEuPerPanel * factor * A.junctionMultiplier)
    event.recipes.gtceu.orbital_solar('grindless:earth')
      .circuit(1).dimension(G.orbits.earth).EUt(-eut).duration(A.duration)
    event.recipes.gtceu.assembly_line('grindless:luv/orbital_solar_panel')
      .itemInputs('gcyr:photovoltaic_cell', 'gtceu:titanium_frame', '2x gtceu:aluminium_foil', '2x grindless:hermean_thin_film_panel',
        '2x grindless:heliostat_mirror')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 144), Fluid.of('gtceu:lubricant', 250))
      .itemOutputs('grindless:orbital_solar_panel').EUt(7680).duration(200)
    event.recipes.gtceu.assembly_line('grindless:luv/orbital_solar_panel_triple_junction')
      .itemInputs('4x grindless:triple_junction_cell', '#gtceu:circuits/luv',
        'gtceu:tempered_glass', '4x gtceu:fine_gold_wire', 'gtceu:titanium_frame')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 144), Fluid.of('gtceu:lubricant', 250))
      .itemOutputs('2x grindless:orbital_solar_panel').EUt(7680).duration(200)
    event.recipes.gtceu.assembly_line('grindless:luv/orbital_solar_station')
      .itemInputs('gtceu:luv_machine_hull', '4x gcyr:photovoltaic_cell', '2x gtceu:luv_sensor',
        '4x #gtceu:circuits/luv', '2x grindless:orbital_solar_panel', '2x grindless:triple_junction_cell')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 576), Fluid.of('gtceu:lubricant', 500))
      .itemOutputs(A.machine).EUt(30720).duration(600)  })
})()
