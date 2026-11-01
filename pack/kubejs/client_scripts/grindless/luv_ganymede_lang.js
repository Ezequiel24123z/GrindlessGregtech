// priority: 7700
// LuV B9 (Ganymede): controller names, recipe categories, tooltips and the no-voiding refusals.
ClientEvents.lang('en_us', function (event) {
  var entries = {
    'block.gtceu.gravitational_wave_detector': 'Gravitational-Wave Detector',
    'gtceu.gravitational_wave_astronomy': 'Gravitational-Wave Astronomy',
    'block.gtceu.coilgun_launcher': 'Coilgun Probe Launcher',
    'gtceu.probe_launch': 'Probe Launch',
    'grindless.machine.gravitational_wave_detector.tooltip.0': '§7Listens for gravitational waves from Ganymede.',
    'grindless.machine.gravitational_wave_detector.no_voiding': 'The detector keeps its catalogue. Disable item voiding.',
    'grindless.machine.coilgun_launcher.tooltip.0': '§7Launches space probes from Ganymede.',
    'grindless.machine.coilgun_launcher.no_voiding': 'The launcher keeps the probes\' data. Disable item voiding.'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})

