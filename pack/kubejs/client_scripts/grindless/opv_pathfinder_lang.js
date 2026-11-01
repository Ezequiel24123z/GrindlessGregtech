// priority: 5706
// Gregtech Grindless - names and tooltips of the OpV-R1 intermediates (startup_scripts/grindless/opv/pathfinder.js). en_us.
(function () {
  var NAMES = {
    polycapillary_optic: ['Polycapillary Optic', 'Bundled hollow capillaries that focus soft X-rays onto a detector.', 'Drawn in the fibre draw tower; goes into a timing head.'],
    xray_timing_head: ['X-ray Timing Head', 'A drift-detector die behind a polycapillary optic.', 'Next: lock it to a nuclear clock.'],
    clock_locked_head: ['Clock-locked Timing Head', 'A timing head locked to a thorium-229 nuclear clock.', 'Only the X-ray pulse profiler turns it into an XNAV unit.'],
    gan_mmic_tile: ['GaN MMIC Tile', 'GaN amplifier dies mounted on a silicon carbide wafer.', 'Next: the hot cell tests it for radiation hardness.'],
    tested_mmic_tile: ['Rad-hard Tested MMIC Tile', 'Survived a neutron source in the hot cell.', 'Next: seal it under the electron beam.'],
    rejected_mmic_tile: ['Rejected MMIC Tile', 'Failed the radiation test.', 'Goes to the extraction cascade for its gallium.'],
    sealed_mmic_tile: ['Sealed MMIC Tile', 'A tested tile hermetically sealed in titanium.', 'Four of them power a node power transmitter.']
  }

  var KEYS = [
    ['gtceu.recipe.grindless_nuclear_clock.lock_timing_head', 'Lock the timing head'],
    ['gtceu.recipe.grindless_silicon_carbide.gan_mmic_tile', 'Mount GaN MMICs on SiC'],
    ['gtceu.recipe.grindless_electron_beam.seal_node_tile', 'Seal the tested MMIC tile'],
    ['gtceu.recipe.grindless_xray_pulse_profiling.xnav_unit', 'Calibrate XNAV at J0437'],
    ['emi.grindless.info.opv_pathfinder_arrival.0', 'Launch a Pathfinder Probe from Cygnus X-1 with gate circuit 12: two UXV 16 A hatches supply 1,073,741,824 EU/t for 2,400 ticks. The hold places the Terzan 5 arrival platform.'],
    ['emi.grindless.info.opv_pathfinder_arrival.1', 'Carry the launched probe to Terzan 5 and unpack it in a crafting grid. Its core starts R2 replication; home-made Vitamin Kits supply the electronics and robot arms that debris cannot make.'],
    ['emi.grindless.info.opv_pathfinder_transmitter.0', 'Four sealed, radiation-tested GaN tiles form a Node Power Transmitter. R3 uses it to power collector nodes at Terzan 5. Failed MMIC tiles return their gallium through the extraction cascade.']
  ]

  ClientEvents.lang('en_us', function (event) {
    KEYS.forEach(function (r) { event.add('grindless', r[0], r[1]) })
    Object.keys(NAMES).forEach(function (n) {
      event.add('grindless', 'item.grindless.' + n, NAMES[n][0])
      event.add('grindless', 'tooltip.grindless.' + n + '.0', NAMES[n][1])
      event.add('grindless', 'tooltip.grindless.' + n + '.1', NAMES[n][2])
    })
  })

})()
