// -----------------------------------------------------------------------------------------------
// The nine intermediates of UEV's monolithic photonic wafer flow (docs/eras/lines-uev-uxv.md, E1 steps 15-24; package D4-UEV-PHOTON): the
// detectors, the graphene modulators and the quantum-dot sources are built on the waveguide circuit itself, then the wafer is diced, pigtailed and
// cryopackaged into the quantum photonic chip. The recipes are rows of data/grindless/tables/photonics_uev.json
// (server_scripts/grindless/uev/photonics.js); the machines and the older items are registered in uev/photonics.js.
//
//   15 wsi_waveguide_wafer        SNSPD foundry c10      16 detector_waveguide_wafer   SNSPD foundry c11
//   17 graphene_ring_wafer        vdW stacker c4         18 encapsulated_ring_wafer    vdW stacker c5
//   19 electroded_photonic_wafer  photonic foundry c29   20 hybrid_quantum_wafer       vdW stacker c6
//   21 clad_quantum_wafer         MOCVD c9               22 quantum_photonic_die       cutter (4 dies)
//   23 pigtailed_quantum_die      integration hall c11   24 quantum_photonic_chip      integration hall c2 (registered in uev/photonics.js)
//
// Textures: tools/assets/Build-UEVPhotonicWaferTextures.ps1. Names and tooltips: client_scripts/grindless/uev_photonic_wafer_lang.js.
(function () {
  var NAMES = [
    'wsi_waveguide_wafer', 'detector_waveguide_wafer', 'graphene_ring_wafer', 'encapsulated_ring_wafer', 'electroded_photonic_wafer',
    'hybrid_quantum_wafer', 'clad_quantum_wafer', 'quantum_photonic_die', 'pigtailed_quantum_die'
  ]

  StartupEvents.registry('item', function (event) {
    NAMES.forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(64)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })
})()
