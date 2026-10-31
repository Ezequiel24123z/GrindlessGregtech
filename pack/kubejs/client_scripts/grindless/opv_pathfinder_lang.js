// priority: 5706
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

  var KEYS = [
    ['gtceu.recipe.grindless_nuclear_clock.lock_timing_head', 'Lock the timing head', 'Sincronizar el cabezal de cronometraje'],
    ['gtceu.recipe.grindless_silicon_carbide.gan_mmic_tile', 'Mount GaN MMICs on SiC', 'Montar MMIC de GaN en SiC'],
    ['gtceu.recipe.grindless_electron_beam.seal_node_tile', 'Seal the tested MMIC tile', 'Sellar la baldosa MMIC probada'],
    ['gtceu.recipe.grindless_xray_pulse_profiling.xnav_unit', 'Calibrate XNAV at J0437', 'Calibrar XNAV en J0437'],
    ['emi.grindless.info.opv_pathfinder_arrival.0', 'Launch a Pathfinder Probe from Cygnus X-1 with gate circuit 12: two UXV 16 A hatches supply 1,073,741,824 EU/t for 2,400 ticks. The hold places the Terzan 5 arrival platform.', 'Lanza una sonda Pathfinder desde Cygnus X-1 con el circuito 12 del portal: dos entradas UXV de 16 A suministran 1.073.741.824 EU/t durante 2.400 ticks. El mantenimiento coloca la plataforma de llegada a Terzan 5.'],
    ['emi.grindless.info.opv_pathfinder_arrival.1', 'Carry the launched probe to Terzan 5 and unpack it in a crafting grid. Its core starts R2 replication; home-made Vitamin Kits supply the electronics and robot arms that debris cannot make.', 'Lleva la sonda lanzada a Terzan 5 y desembalala en una mesa de trabajo. Su nucleo inicia la replicacion de R2; los kits hechos en casa aportan la electronica y los brazos roboticos que los escombros no pueden fabricar.'],
    ['emi.grindless.info.opv_pathfinder_transmitter.0', 'Four sealed, radiation-tested GaN tiles form a Node Power Transmitter. R3 uses it to power collector nodes at Terzan 5. Failed timing heads return silicon and copper; failed MMIC tiles return gallium through the extraction cascade.', 'Cuatro baldosas de GaN selladas y probadas contra radiacion forman un transmisor de energia de nodo. R3 lo usa en los nodos colectores de Terzan 5. La cascada de extraccion recupera silicio y cobre de los cabezales fallidos y galio de las baldosas MMIC rechazadas.']
  ]

  ClientEvents.lang('en_us', function (event) {
    KEYS.forEach(function (r) { event.add('grindless', r[0], r[1]) })
    Object.keys(NAMES).forEach(function (n) {
      event.add('grindless', 'item.grindless.' + n, NAMES[n][0])
      event.add('grindless', 'tooltip.grindless.' + n + '.0', NAMES[n][2])
      event.add('grindless', 'tooltip.grindless.' + n + '.1', NAMES[n][3])
    })
  })

  ClientEvents.lang('es_es', function (event) {
    KEYS.forEach(function (r) { event.add('grindless', r[0], r[2]) })
    Object.keys(NAMES).forEach(function (n) {
      event.add('grindless', 'item.grindless.' + n, NAMES[n][1])
      event.add('grindless', 'tooltip.grindless.' + n + '.0', NAMES[n][4])
      event.add('grindless', 'tooltip.grindless.' + n + '.1', NAMES[n][5])
    })
  })
})()
