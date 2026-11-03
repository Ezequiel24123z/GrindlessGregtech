// priority: -8090
// -----------------------------------------------------------------------------------------------
// UHV W11, the gate ring's MgB2 coils (package D3-GATERING, docs/eras/lines-uv-uhv.md "W11"): the five items of the warp gate casing's
// superconducting-coil chain. Recipes: server_scripts/grindless/uhv/gate_ring.js. Names: client_scripts/grindless/uhv_gate_ring_lang.js.
// Textures: tools/assets/Build-UHVGateTextures.ps1.
//
//   mgb2_cable             8 MgB2 single wires round 2 copper foils (magnet works, circuit 13)
//   gate_coil_winding      4 cables + 4 Kapton K foils, wound (magnet works, circuit 14)
//   reacted_gate_coil      the winding heat-treated in argon at 973 K (blast furnace)
//   impregnated_gate_coil  the reacted coil vacuum-impregnated with epoxy (composite autoclave)
//   qualified_gate_coil    the impregnated coil cold-tested in the helium charge (magnet works, circuit 15)
// Plain items, not GT materials: each has exactly one maker and one user. Published: global.grindless.gateRing.
(function () {
  const G = global.grindless || (global.grindless = {})
  const GR = G.gateRing || (G.gateRing = {})

  const ITEMS = ['mgb2_cable', 'gate_coil_winding', 'reacted_gate_coil', 'impregnated_gate_coil', 'qualified_gate_coil']
  GR.items = ITEMS.map(function (name) { return 'grindless:' + name })

  StartupEvents.registry('item', function (event) {
    ITEMS.forEach(function (name) {
      event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
        .tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })
})()
