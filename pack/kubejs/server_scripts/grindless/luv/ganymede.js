// priority: -18124
// -----------------------------------------------------------------------------------------------
// LuV B9, Ganymede (docs/eras/luv.md, machines 19 and 20; machines and types: startup_scripts/grindless/luv/ganymede.js).
// Every run is on Ganymede only (G.places, 'ganymede') and keeps its output (no voiding).
//
//   gtceu:gravitational_wave_astronomy (Gravitational-Wave Detector, observatory step 6)
//     gravitational_wave_catalogue  circuit 1 + 1 data orb + the Sagittarius A* Signal (NOT consumed: IV's interferometer gave it
//                                   the source's address, and the detector times its runs on it) + 100 mB Liquid Helium (the
//                                   sapphire mirrors' cryostats) -> 1 Gravitational-Wave Catalogue, 30,720 EU/t x 12,000 t
//   gtceu:probe_launch (Coilgun Probe Launcher)
//     jovian_atmosphere_survey      circuit 1 + 1 Jupiter entry probe -> 1 Jovian Atmosphere Survey, 30,720 EU/t x 400 t
//     saturn_transfer_chart         circuit 2 + 1 Saturn flyby probe -> 1 Saturn Transfer Chart, 30,720 EU/t x 12,000 t
//   gtceu:assembler (LuV), the probes:
//     jupiter_entry_probe           4 heat-shielding fabric + LuV sensor (mass spectrometer) + HV lithium battery (Galileo's probe
//                                   ran on lithium-sulfur dioxide cells) + 4 titanium plates, 30,720 EU/t x 200 t
//     saturn_flyby_probe            2 RTG pellets + LuV sensor + LuV emitter (the radio) + 4 titanium plates, 30,720 EU/t x 200 t
//   crafting: the catalogue's and the chart's copies (one + data orb -> 2, the observatory family's rule) and the two controllers.
(function () {
  var G = global.grindless
  var GY = G.ganymede || (G.ganymede = {})
  GY.items = {
    catalogue: 'grindless:gravitational_wave_catalogue',
    jupiterProbe: 'grindless:jupiter_entry_probe',
    saturnProbe: 'grindless:saturn_flyby_probe',
    survey: 'grindless:jovian_atmosphere_survey',
    chart: 'grindless:saturn_transfer_chart',
    signal: 'grindless:sagittarius_a_star_signal',
    dataOrb: 'gtceu:data_orb',
    helium: 'gtceu:liquid_helium'
  }
  GY.recipes = {
    catalogue: 'grindless:gravitational_wave_astronomy/luv/gravitational_wave_catalogue',
    survey: 'grindless:probe_launch/luv/jovian_atmosphere_survey',
    chart: 'grindless:probe_launch/luv/saturn_transfer_chart',
    jupiterProbe: 'grindless:assembly_line/luv/jupiter_entry_probe',
    saturnProbe: 'grindless:assembly_line/luv/saturn_flyby_probe',
    copy: 'grindless:crafting/gravitational_wave_catalogue_copy',
    chartCopy: 'grindless:crafting/saturn_transfer_chart_copy',
    controllers: ['grindless:assembly_line/gravitational_wave_detector', 'grindless:assembly_line/coilgun_launcher']
  }
  var I = GY.items

  ServerEvents.recipes(function (event) {
    function onGanymede(type, id) {
      return G.places.allow(event.recipes.gtceu[type]('grindless:luv/' + id), 'ganymede')
    }

    onGanymede('gravitational_wave_astronomy', 'gravitational_wave_catalogue').circuit(1)
      .itemInputs(I.dataOrb)
      .notConsumable(I.signal)
      .inputFluids(Fluid.of(I.helium, 100))
      .itemOutputs(I.catalogue)
      .EUt(30720).duration(12000)
    event.shapeless('2x ' + I.catalogue, [I.catalogue, I.dataOrb]).id(GY.recipes.copy)

    onGanymede('probe_launch', 'jovian_atmosphere_survey').circuit(1)
      .itemInputs(I.jupiterProbe)
      .itemOutputs(I.survey)
      .EUt(30720).duration(400)
    onGanymede('probe_launch', 'saturn_transfer_chart').circuit(2)
      .itemInputs(I.saturnProbe)
      .itemOutputs(I.chart)
      .EUt(30720).duration(12000)
    event.shapeless('2x ' + I.chart, [I.chart, I.dataOrb]).id(GY.recipes.chartCopy)

    event.recipes.gtceu.assembly_line('grindless:luv/jupiter_entry_probe')
      .itemInputs('4x gcyr:heat_shielding_fabric', 'gtceu:luv_sensor', 'gtceu:hv_lithium_battery', '4x gtceu:titanium_plate',
        '2x grindless:hermean_heat_shield_brick', '2x grindless:platinum_gauze')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 144), Fluid.of('gtceu:lubricant', 250))
      .itemOutputs(I.jupiterProbe)
      .EUt(30720).duration(200)
    event.recipes.gtceu.assembly_line('grindless:luv/saturn_flyby_probe')
      .itemInputs('2x grindless:rtg_pellet', 'gtceu:luv_sensor', 'gtceu:luv_emitter', '4x gtceu:titanium_plate')
      .inputFluids(Fluid.of('gtceu:soldering_alloy', 144), Fluid.of('gtceu:lubricant', 250))
      .itemOutputs(I.saturnProbe)
      .EUt(30720).duration(200)

    var LINE = [Fluid.of('gtceu:soldering_alloy', 576), Fluid.of('gtceu:lubricant', 500)]
    function line(name, machine, items) {
      var b = event.recipes.gtceu.assembly_line('grindless:' + name)
      items.forEach(function (s) { b.itemInputs(s) })
      LINE.forEach(function (f) { b.inputFluids(f) })
      b.itemOutputs(machine).EUt(30720).duration(600)
    }
    line('gravitational_wave_detector', 'gtceu:gravitational_wave_detector', ['gtceu:luv_machine_hull', '2x gtceu:luv_emitter',
      '2x gtceu:luv_sensor', '4x #gtceu:circuits/luv', '2x ' + I.jupiterProbe, '2x grindless:hermean_thin_film_panel'])
    line('coilgun_launcher', 'gtceu:coilgun_launcher', ['gtceu:luv_machine_hull', 'gtceu:luv_field_generator', '2x gtceu:luv_emitter',
      '4x #gtceu:circuits/luv', '2x ' + I.saturnProbe, '2x grindless:tungsten_steel_drill_bit'])
  })
})()
