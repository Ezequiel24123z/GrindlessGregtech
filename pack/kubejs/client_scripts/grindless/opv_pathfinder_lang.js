// Gregtech Grindless - names and tooltips of the OpV-R1 intermediates (startup_scripts/grindless/opv/pathfinder.js). en_us and es_es.
(function () {
  var NAMES = {
    polycapillary_optic: ['Polycapillary Optic', '\u00d3ptica policapilar', 'Bundled hollow capillaries that focus soft X-rays onto a detector.', 'Drawn in the fibre draw tower; goes into a timing head.', 'Capilares huecos agrupados que enfocan rayos X blandos sobre un detector.', 'Se estira en la torre de fibra; va a un cabezal de cronometraje.'],
    xray_timing_head: ['X-ray Timing Head', 'Cabezal de cronometraje de rayos X', 'A drift-detector die behind a polycapillary optic.', 'Next: lock it to a nuclear clock.', 'Un dado detector de deriva tras una \u00f3ptica policapilar.', 'Siguiente: engancharlo a un reloj nuclear.'],
    rejected_timing_head: ['Rejected Timing Head', 'Cabezal de cronometraje rechazado', 'Failed burn-in: too noisy to time a pulsar.', 'Goes to the extraction cascade for its silicon and copper.', 'Fall\u00f3 el rodaje: demasiado ruidoso para cronometrar un p\u00falsar.', 'Va a la cascada de extracci\u00f3n por su silicio y cobre.'],
    clock_locked_head: ['Clock-locked Timing Head', 'Cabezal de cronometraje sincronizado', 'A timing head locked to a thorium-229 nuclear clock.', 'Only the X-ray pulse profiler turns it into an XNAV unit.', 'Un cabezal de cronometraje sincronizado con un reloj nuclear de torio-229.', 'Solo el perfilador de pulsos de rayos X lo convierte en unidad XNAV.'],
    gan_mmic_tile: ['GaN MMIC Tile', 'Baldosa MMIC de GaN', 'GaN amplifier dies mounted on a silicon carbide wafer.', 'Next: the hot cell tests it for radiation hardness.', 'Dados amplificadores de GaN montados en una oblea de carburo de silicio.', 'Siguiente: la celda caliente prueba su resistencia a la radiaci\u00f3n.'],
    tested_mmic_tile: ['Rad-hard Tested MMIC Tile', 'Baldosa MMIC probada contra radiaci\u00f3n', 'Survived a neutron source in the hot cell.', 'Next: seal it under the electron beam.', 'Sobrevivi\u00f3 a una fuente de neutrones en la celda caliente.', 'Siguiente: sellarla bajo el haz de electrones.'],
    rejected_mmic_tile: ['Rejected MMIC Tile', 'Baldosa MMIC rechazada', 'Failed the radiation test.', 'Goes to the extraction cascade for its gallium.', 'Fall\u00f3 la prueba de radiaci\u00f3n.', 'Va a la cascada de extracci\u00f3n por su galio.'],
    sealed_mmic_tile: ['Sealed MMIC Tile', 'Baldosa MMIC sellada', 'A tested tile hermetically sealed in titanium.', 'Four of them power a node power transmitter.', 'Una baldosa probada sellada herm\u00e9ticamente en titanio.', 'Cuatro alimentan un transmisor de energ\u00eda de nodo.']
  }

  ClientEvents.lang('en_us', function (event) {
    Object.keys(NAMES).forEach(function (n) {
      event.add('grindless', 'item.grindless.' + n, NAMES[n][0])
      event.add('grindless', 'tooltip.grindless.' + n + '.0', NAMES[n][2])
      event.add('grindless', 'tooltip.grindless.' + n + '.1', NAMES[n][3])
    })
  })

  ClientEvents.lang('es_es', function (event) {
    Object.keys(NAMES).forEach(function (n) {
      event.add('grindless', 'item.grindless.' + n, NAMES[n][1])
      event.add('grindless', 'tooltip.grindless.' + n + '.0', NAMES[n][4])
      event.add('grindless', 'tooltip.grindless.' + n + '.1', NAMES[n][5])
    })
  })
})()
