// -----------------------------------------------------------------------------------------------
// OpV chain matter (package OpV-A0, docs/eras/opv.md "A0. Bulge relay, chain matter and the hull", process lines 1 and 2): the intermediates
// mined from SGR 1806-20's outer crust and caged. No machine of our own and no recipe type: every step runs on UXV's four pasta machines at
// grindless:sgr1806_orbit (rows marked OpV-A0 in tables/vela_pasta.json), the UHV PBO plant (c8, server_scripts/grindless/uhv/elevator.js)
// or GTM's assembler (server_scripts/grindless/opv/bulge_relay.js). The ids are published in global.grindless.opvChainMatter.
//
//   line 1  chain_crust_slab -> caged_chain_phase -> gtceu:chain_strand_ingot -> wire -> pbo_braided_chain_wire -> gtceu:chain_strand_single_cable
//   line 2  chain_lattice_slab -> caged_chain_lattice -> chain_lamina -> grindless:chain_lamina_stack (+ lasagna_plate)
//   others  ni_chain_slab -> caged_ni_chain (thawed by OpV-B2); PBO fibre + chain wire -> chain_mesh_weave (welded by OpV-A1)
//
//   ni_chain_slab, chain_lamina_stack and the chain strand material (ingot, wire, cable) are F1's (startup_scripts/grindless/opv/foundation.js):
//     read, never created here.
//
// Textures: tools/assets/Build-OpVChainMatterTextures.ps1. Names: client_scripts/grindless/opv_chain_matter_lang.js.
(function () {
  const G = global.grindless || (global.grindless = {})
  const OPVCM = G.opvChainMatter || (G.opvChainMatter = {})

  // item name -> stack size; every item carries two tooltip lines (tooltip.grindless.<name>.0 and .1)
  const ITEMS = {
    // line 1: the Fe-56 chain crust
    chain_crust_slab: { stack: 16 },
    caged_chain_phase: { stack: 16 },
    pbo_braided_chain_wire: { stack: 64 },
    // line 2: the condensed chain lattice
    chain_lattice_slab: { stack: 16 },
    caged_chain_lattice: { stack: 16 },
    chain_lamina: { stack: 64 },
    // the Ni chain layer (OpV-B2) and the mesh weave (OpV-A1)
    caged_ni_chain: { stack: 16 },
    chain_mesh_weave: { stack: 64 }
  }

  OPVCM.items = Object.keys(ITEMS).map(function (name) { return 'grindless:' + name })
  // F1's ids these lines read or finish: never created here
  OPVCM.existing = ['grindless:ni_chain_slab', 'grindless:chain_lamina_stack', 'gtceu:chain_strand_ingot', 'gtceu:chain_strand_single_wire',
    'gtceu:chain_strand_single_cable', 'grindless:cage_part', 'grindless:lasagna_plate']
  OPVCM.site = 'grindless:sgr1806_orbit'
  OPVCM.ids = {}
  function camel(name) { return name.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase() }) }
  Object.keys(ITEMS).forEach(function (name) { OPVCM.ids[camel(name)] = 'grindless:' + name })

  StartupEvents.registry('item', function (event) {
    Object.keys(ITEMS).forEach(function (name) {
      var item = event.create('grindless:' + name)
        .texture('grindless:item/' + name)
        .maxStackSize(ITEMS[name].stack)
      item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
      item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
    })
  })
})()
