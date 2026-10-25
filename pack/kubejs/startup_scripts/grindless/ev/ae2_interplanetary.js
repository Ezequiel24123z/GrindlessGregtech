// -----------------------------------------------------------------------------------------------
// The AE2 network between planets, EV step (docs/eras/ev.md, "The AE2 network: EV step"; DECISIONS.md 2026-10-24: AE2 is the
// backbone between planets, and each quantum bridge has one half built at each end).
//
//   grindless:martian_quantum_seed   the Martian half of an Earth-Mars quantum pair, the way the Lunar Quantum Seed is the Moon's half
//                                    of an Earth-Moon one (startup_scripts/grindless/moon/items.js). Made only on Mars: chemical
//                                    reactor with .dimension('gcyr:mars'), merrillite dust (the rare-earth phosphate only Mars has) +
//                                    ender pearl + helium-3. Blown up with an AE2 singularity it makes two entangled singularities marked
//                                    grindless_planet: "mars" (server_scripts/grindless/ev/ae2_interplanetary.js), which a quantum link
//                                    chamber on Mars keeps (server_scripts/grindless/moon/quantum_bridge.js, data/grindless/tables/
//                                    planets.json).
//
// Nothing else is registered: the rest of the EV step is stock AE2 and GTM (FE and ME P2P tunnels over the bridge, GTM's energy
// converters), see the server script. The ids are published in global.grindless.ae2Interplanetary for the server script and the test.
// Names: client_scripts/grindless/ev_ae2_interplanetary_lang.js. Texture: tools/assets/Build-AE2InterplanetaryTextures.ps1.
(function () {
  const G = global.grindless || (global.grindless = {})
  const AI = G.ae2Interplanetary || (G.ae2Interplanetary = {})

  AI.ids = {
    marsSeed: 'grindless:martian_quantum_seed',
    lunarSeed: 'grindless:lunar_quantum_seed',
    singularity: 'ae2:singularity',
    entangled: 'ae2:quantum_entangled_singularity',
    merrilliteDust: 'gtceu:merrillite_dust',
    helium3: 'gtceu:helium_3',
    converter: 'gtceu:ev_16a_energy_converter',
    feP2P: 'ae2:fe_p2p_tunnel',
    euP2P: 'eup2p:eu_p2p_tunnel',
    meP2P: 'ae2:me_p2p_tunnel'
  }

  StartupEvents.registry('item', function (event) {
    event.create(AI.ids.marsSeed)
      .texture('grindless:item/martian_quantum_seed')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.martian_quantum_seed.0')))
      .tooltip(Text.darkGray(Text.translate('tooltip.grindless.martian_quantum_seed.1')))
  })
})()
