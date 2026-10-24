// -----------------------------------------------------------------------------------------------
// GTM Extended Features (extendedfeatures): its Industrial Greenhouse and Advanced Conservatory (recipe types
// extendedfeatures:greenhouse_crop_recipes / greenhouse_wood_recipes) grow 32 crops or 64-128 logs per run from 120 EU/t, which
// is exactly the job of the pack's own greenhouse family (Steam Greenhouse, LV Greenhouse, MV Greenhouse: recipe type
// gtceu:greenhouse). Two competing greenhouses would make one of them pointless, so the addon's recipes and the two controllers'
// crafting recipes are removed.
// Everything else of the addon stays: Large Gas Collector, Rock Processing Plant (EV), Synthesis Vessel (chemical skips), Large
// Cracking Machine, Large Pyrolysis Oven, Expanded Assembly Line, Robust Alloy Materializer, disassembly machine, hatches and
// the universal circuits (1 circuit of the tier -> 1 universal circuit of the same tier, not a shortcut).
// Era: never for the two greenhouses.
//
// Rhino: var + function inside every callback that runs more than once (this Rhino throws "redeclaration of var").
(function () {
  ServerEvents.recipes(function (event) {
    event.remove({ type: 'extendedfeatures:greenhouse_crop_recipes' })
    event.remove({ type: 'extendedfeatures:greenhouse_wood_recipes' })
    event.remove({ output: 'extendedfeatures:industrial_greenhouse' })
    event.remove({ output: 'extendedfeatures:advanced_conservatory' })
  })
})()
