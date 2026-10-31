// priority: 5984
(function () {
  var names = {
    jet_beam_line: ['Jet Beam Line', 'Linea del haz del jet'],
    spallation_target_station: ['Spallation Target Station', 'Estacion de blancos de espalacion'],
    antiproton_decelerator: ['Antiproton Decelerator', 'Desacelerador de antiprotones']
  }
  var types = {
    jet_beam_extraction: ['Jet Beam Extraction', 'Extraccion del haz del jet'],
    antiproton_production: ['Antiproton Production', 'Produccion de antiprotones'],
    beam_cooling: ['Beam Cooling', 'Enfriamiento del haz']
  }
  var fluids = {
    hot_antiproton_beam: ['Hot Antiproton Beam', 'Haz de antiprotones caliente'],
    stochastically_cooled_beam: ['Stochastically Cooled Beam', 'Haz enfriado estocasticamente']
  }
  var tips = {
    jet_beam_line: ['Extracts and bunches jet protons with SRF cavities.', 'Extrae y agrupa protones del jet con cavidades SRF.'],
    spallation_target_station: ['Produces antiprotons in a shielded iridium target.', 'Produce antiprotones en un blanco de iridio blindado.'],
    antiproton_decelerator: ['Cools antiprotons and fills Penning traps.', 'Enfria antiprotones y llena trampas de Penning.']
  }
  var pages = {
    jet_beam_line: [
      ['At Cygnus X-1 orbit, jet beam extraction bunches protons on an SRF cavity. A beam window wears about once per 32 runs. Flux-loaded plasma doubles the beam yield. The beam must be processed here.',
        'En la orbita de Cygnus X-1, agrupa protones con una cavidad SRF. La ventana del haz se desgasta aproximadamente cada 32 ciclos. El plasma cargado de flujo duplica el rendimiento. El haz debe procesarse aqui.'],
      ['Feeds the spallation target station and the antiproton line. Jet electrons are dumped back into the black hole; they are not a recoverable item.',
        'Alimenta la estacion de espalacion y la linea de antiprotones. Los electrones del jet regresan al agujero negro; no son un objeto recuperable.']
    ],
    spallation_target_station: [
      ['At Cygnus X-1 orbit, antiproton production consumes 4,000 mB of jet beam per 1,000 mB of hot beam. The iridium target wears at 1/16 and the Li-6 hydride shield at about 1/32 per run.',
        'En la orbita de Cygnus X-1, consume 4.000 mB de haz del jet por 1.000 mB de haz caliente. El blanco de iridio se desgasta a 1/16 y el blindaje de hidruro de Li-6 a aproximadamente 1/32 por ciclo.'],
      ['Spent iridium targets go through the IV hot cell to the EV platinum plant for 85% iridium recovery. D1 line 22 bakes spent Li-6 shields, then removes tritium in the IV tritium facility; He-3 feeds the superfluid line. Pions and neutrinos are lost in the dump. The hot beam stays here for cooling.',
        'Los blancos de iridio usados pasan por la celda caliente IV y la planta de platino EV, con recuperacion del 85%. La linea D1 22 hornea los blindajes de Li-6 usados y extrae tritio en la instalacion IV; el He-3 alimenta la linea superfluida. Piones y neutrinos se pierden en el absorbedor. El haz caliente se enfria aqui.']
    ],
    antiproton_decelerator: [
      ['At Cygnus X-1 orbit, beam cooling first uses a stochastic pickup, then an electron cooler. Both wear about once per 64 runs. NEG vacuum and an octupole magnet hold the cooled antiprotons in a Penning trap. Residual-gas annihilation losses (3%) become heat, not an item.',
        'En la orbita de Cygnus X-1, enfria el haz primero con un captador estocastico y luego con un enfriador de electrones. Ambos se desgastan aproximadamente cada 64 ciclos. El vacio NEG y un iman octupolar contienen los antiprotones en una trampa de Penning. Las perdidas por gas residual (3%) se convierten en calor.'],
      ['Eight cold cells are stacked by the UV antimatter trap at Cygnus X-1 orbit, circuit 6; 90% of the empty Penning traps return. The OpV stack supplies the antihydrogen foundry and annihilation engine. Antiprotons are sourced only here.',
        'La trampa de antimateria UV apila ocho celdas frias en la orbita de Cygnus X-1, circuito 6; devuelve el 90% de las trampas de Penning vacias. La pila OpV alimenta la fundicion de antihidrogeno y el motor de aniquilacion. Los antiprotones solo se obtienen aqui.']
    ]
  }
  ;['en_us', 'es_es'].forEach(function (lang, i) {
    ClientEvents.lang(lang, function (event) {
      Object.keys(names).forEach(function (name) {
        event.add('block.gtceu.' + name, names[name][i])
        event.add('grindless.machine.' + name + '.tooltip.0', '\u00a77' + tips[name][i])
        pages[name].forEach(function (p, n) { event.add('emi.grindless.info.' + name + '.' + n, p[i]) })
      })
      Object.keys(types).forEach(function (name) { event.add('gtceu.' + name, types[name][i]) })
      Object.keys(fluids).forEach(function (name) {
        event.add('material.grindless.' + name, fluids[name][i])
        event.add('fluid.grindless.' + name, fluids[name][i])
      })
      event.add('item.grindless.spent_li6_shield', i === 0 ? 'Spent Li-6 Hydride Shield' : 'Blindaje de hidruro de Li-6 usado')
      event.add('tooltip.grindless.spent_li6_shield.0', i === 0 ? 'D1 line 22: bake out, then recover tritium in the IV tritium removal facility.' : 'Linea D1 22: hornear y recuperar tritio en la instalacion de extraccion IV.')
      event.add('gtceu.recipe.grindless_antimatter_storage.antiproton_stack_opv', i === 0 ? 'Eight cold cells stacked; 90% empty Penning traps returned.' : 'Ocho celdas frias apiladas; devuelve el 90% de trampas de Penning vacias.')
    })
  })
})()
