// priority: 5925
(function () {
  var names = {
    jet_beam_line: 'Jet Beam Line',
    spallation_target_station: 'Spallation Target Station',
    antiproton_decelerator: 'Antiproton Decelerator'
  }
  var types = {
    jet_beam_extraction: 'Jet Beam Extraction',
    antiproton_production: 'Antiproton Production',
    beam_cooling: 'Beam Cooling'
  }
  var fluids = {
    hot_antiproton_beam: 'Hot Antiproton Beam',
    stochastically_cooled_beam: 'Stochastically Cooled Beam'
  }
  var tips = {
    jet_beam_line: 'Extracts and bunches jet protons with SRF cavities.',
    spallation_target_station: 'Produces antiprotons in a shielded iridium target.',
    antiproton_decelerator: 'Cools antiprotons and fills Penning traps.'
  }
  var pages = {
    jet_beam_line: [
      'At Cygnus X-1 orbit, jet beam extraction bunches protons on an SRF cavity. A beam window wears about once per 32 runs. Flux-loaded plasma doubles the beam yield. Carry the beam to the later machines anywhere.',
      'Feeds the spallation target station and the antiproton line. Jet electrons are dumped back into the black hole; they are not a recoverable item.'
    ],
    spallation_target_station: [
      'Antiproton production consumes 4,000 mB of jet beam per 1,000 mB of hot beam. The iridium target wears at 1/16 and the Li-6 hydride shield at about 1/32 per run.',
      'Spent iridium targets go through the IV hot cell to the EV platinum plant for 85% iridium recovery. D1 line 22 bakes spent Li-6 shields, then removes tritium in the IV tritium facility; He-3 feeds the superfluid line. Pions and neutrinos are lost in the dump. The hot beam stays here for cooling.'
    ],
    antiproton_decelerator: [
      'Beam cooling first uses a stochastic pickup, then an electron cooler. Both wear about once per 64 runs. NEG vacuum and an octupole magnet hold the cooled antiprotons in a Penning trap. Residual-gas annihilation losses (3%) become heat, not an item.',
      'Eight cold cells are stacked by the UV antimatter trap, circuit 6; 90% of the empty Penning traps return. The OpV stack supplies the antihydrogen foundry and annihilation engine. Antiprotons are sourced only here.'
    ]
  }
  ClientEvents.lang('en_us', function (event) {
    Object.keys(names).forEach(function (name) {
      event.add('block.gtceu.' + name, names[name])
      event.add('grindless.machine.' + name + '.tooltip.0', '\u00a77' + tips[name])
      pages[name].forEach(function (p, n) { event.add('emi.grindless.info.' + name + '.' + n, p) })
    })
    Object.keys(types).forEach(function (name) { event.add('gtceu.' + name, types[name]) })
    Object.keys(fluids).forEach(function (name) {
      event.add('material.grindless.' + name, fluids[name])
      event.add('fluid.grindless.' + name, fluids[name])
    })
    event.add('item.grindless.spent_li6_shield', 'Spent Li-6 Hydride Shield')
    event.add('tooltip.grindless.spent_li6_shield.0', 'D1 line 22: bake out, then recover tritium in the IV tritium removal facility.')
    event.add('gtceu.recipe.grindless_antimatter_storage.antiproton_stack_opv', 'Eight cold cells stacked; 90% empty Penning traps returned.')
  })
})()
