// LuV B9 (Ganymede): controller names, recipe categories, tooltips and the no-voiding refusals.
ClientEvents.lang('en_us', function (event) {
  var entries = {
    'block.gtceu.gravitational_wave_detector': 'Gravitational-Wave Detector',
    'gtceu.gravitational_wave_astronomy': 'Gravitational-Wave Astronomy',
    'block.gtceu.coilgun_launcher': 'Coilgun Probe Launcher',
    'gtceu.probe_launch': 'Probe Launch',
    'grindless.machine.gravitational_wave_detector.tooltip.0': 'Ganymede only: quiet ice, 110 K and its own magnetosphere. Circuit 1: a data orb, 100 mB Liquid Helium and the Sagittarius A* Signal (kept) give a Gravitational-Wave Catalogue after a 12,000-tick observing run. Keep the whole L loaded while it listens.',
    'grindless.machine.gravitational_wave_detector.tooltip.1': 'A buried L, 33x5x33: a 5x5x5 frostproof vertex (controller, hatches, maintenance), two hollow 3x3 clean stainless steel tubes 25 long, a 3x3x3 frostproof end station on each arm, four sapphire test masses (two in the vertex walls, one facing the vertex at each end) and packed or blue ice over every tube and end station. Keeps its catalogues: no voiding.',
    'grindless.machine.gravitational_wave_detector.no_voiding': 'The detector keeps its catalogue. Disable item voiding.',
    'grindless.machine.coilgun_launcher.tooltip.0': 'Ganymede only: no air, and at 110 K the Hg-1223 coils superconduct with no cryostat. Circuit 1 fires a Jupiter entry probe for the Jovian Atmosphere Survey; circuit 2 sends a Saturn flyby probe on a Jupiter slingshot for the Saturn Transfer Chart.',
    'grindless.machine.coilgun_launcher.tooltip.1': '37x5x8: a barrel of 33 rings of eight coilgun coil casings around an open bore, a 5x5x4 robust tungstensteel breech (controller on the rear face, loading bus, hatches, maintenance) and a 3x3x3 tungstensteel pulse bank beside it. Keeps its data: no voiding.',
    'grindless.machine.coilgun_launcher.no_voiding': 'The launcher keeps the probes\' data. Disable item voiding.'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})

ClientEvents.lang('es_es', function (event) {
  var entries = {
    'block.gtceu.gravitational_wave_detector': 'Detector de ondas gravitacionales',
    'gtceu.gravitational_wave_astronomy': 'Astronomía de ondas gravitacionales',
    'block.gtceu.coilgun_launcher': 'Lanzador de sondas por bobinas',
    'gtceu.probe_launch': 'Lanzamiento de sondas',
    'grindless.machine.gravitational_wave_detector.tooltip.0': 'Solo en Ganímedes: hielo tranquilo, 110 K y su propia magnetosfera. Circuito 1: un orbe de datos, 100 mB de helio líquido y la señal de Sagitario A* (se conserva) dan un catálogo de ondas gravitacionales tras una campaña de 12 000 ticks. Mantén toda la L cargada mientras escucha.',
    'grindless.machine.gravitational_wave_detector.tooltip.1': 'Una L enterrada de 33x5x33: un vértice de 5x5x5 a prueba de escarcha (controlador, escotillas, mantenimiento), dos tubos huecos de 3x3 de acero inoxidable limpio de 25 de largo, una estación final de 3x3x3 a prueba de escarcha en cada brazo, cuatro masas de prueba de zafiro (dos en las paredes del vértice y una mirando al vértice en cada extremo) y hielo compacto o azul sobre cada tubo y estación final. Conserva sus catálogos: sin descarte.',
    'grindless.machine.gravitational_wave_detector.no_voiding': 'El detector conserva su catálogo. Desactiva el descarte de objetos.',
    'grindless.machine.coilgun_launcher.tooltip.0': 'Solo en Ganímedes: sin aire, y a 110 K las bobinas de Hg-1223 superconducen sin criostato. El circuito 1 dispara una sonda de entrada en Júpiter para el estudio atmosférico joviano; el circuito 2 envía una sonda de sobrevuelo de Saturno con asistencia gravitatoria de Júpiter para la carta de transferencia a Saturno.',
    'grindless.machine.coilgun_launcher.tooltip.1': '37x5x8: un cañón de 33 anillos de ocho carcasas de bobina alrededor de un ánima abierta, una recámara de 5x5x4 de acero de tungsteno robusto (controlador en la cara trasera, bus de carga, escotillas, mantenimiento) y un banco de pulsos de 3x3x3 de acero de tungsteno al lado. Conserva sus datos: sin descarte.',
    'grindless.machine.coilgun_launcher.no_voiding': 'El lanzador conserva los datos de las sondas. Desactiva el descarte de objetos.'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})
