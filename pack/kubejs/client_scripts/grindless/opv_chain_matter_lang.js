// priority: 5822
// Gregtech Grindless - names and tooltips of the OpV chain matter (startup_scripts/grindless/opv/chain_matter.js, package OpV-A0):
//
//   grindless:<item>  item.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   recipe rows       gtceu.recipe.<dataKey>.<name> (the EMI line of each OpV-A0 row of tables/vela_pasta.json, run at SGR 1806-20)
//
// ni_chain_slab, chain_lamina_stack and the chain strand material are named by client_scripts/grindless/opv_foundation_lang.js. Kept out of
// pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // id, name, tip 0, tip 1
    var ITEMS = [
        ['chain_crust_slab', 'Chain Crust Slab', 'Fe-56 outer crust of SGR 1806-20, where the magnetar\'s field pulls the atoms into chains.', 'Caged in the phase sorter before the chains unwind.'],
        ['caged_chain_phase', 'Caged Chain Phase', 'The crust\'s iron chains held aligned in a neutronium cage part.', 'Drawn into chain strand ingots; the cage is spent in the draw.'],
        ['pbo_braided_chain_wire', 'PBO-Braided Chain Strand Wire', 'Chain strand wire under a PBO braid that holds it against its own field.', 'Insulated into chain strand cable in the assembler.'],
        ['chain_lattice_slab', 'Chain Lattice Slab', 'The deeper outer crust, where the chains condense into a lattice.', 'Caged in the phase sorter.'],
        ['caged_chain_lattice', 'Caged Chain Lattice', 'A condensed chain lattice held in a neutronium cage part.', 'Pressed into chain laminae; the cage is spent in the press.'],
        ['chain_lamina', 'Chain Lamina', 'A sheet of aligned atomic chains, stiff along the field and soft across it.', 'Stacked on a lasagna plate into a chain lamina stack.'],
        ['caged_ni_chain', 'Caged Nickel Chain', 'Nickel chains from the Ni-62/64 layer held in a neutronium cage part.', 'Thawed for its nickel isotopes at the OpV stage.'],
        ['chain_mesh_weave', 'Chain Mesh Weave', 'PBO fibre woven around chain strand wire.', 'Welded into a mesh belt at the OpV stage.']
    ]

    // the EMI line of each OpV-A0 row (key, text)
    var RECIPES = [
        ['gtceu.recipe.grindless_pasta_extraction.chain_crust', 'Circuit 3: at SGR 1806-20 the bulge chart (kept) finds the Fe-56 chain crust; one pellet in ten is spent as bait'],
        ['gtceu.recipe.grindless_pasta_extraction.ni_chain', 'Circuit 4: the Ni-62/64 chain layer, one slab per 1,200 ticks'],
        ['gtceu.recipe.grindless_pasta_extraction.chain_lattice', 'Circuit 5: the deeper crust, where the chains condense into a lattice'],
        ['gtceu.recipe.grindless_pasta_sorting.chain_caging', 'Circuit 3: a crust slab closed in a cage part (consumed); the unchained iron falls out as dust'],
        ['gtceu.recipe.grindless_pasta_sorting.ni_chain_caging', 'Circuit 4: a nickel chain slab closed in a cage part (consumed)'],
        ['gtceu.recipe.grindless_pasta_sorting.lattice_caging', 'Circuit 5: a lattice slab closed in a cage part (consumed); the unchained iron falls out as dust'],
        ['gtceu.recipe.grindless_pasta_drawing.chain_strand_drawing', 'Circuit 3: the caged chain phase drawn into four chain strand ingots; the cage is spent'],
        ['gtceu.recipe.grindless_pasta_drawing.chain_wire_drawing', 'Circuit 4: a chain strand ingot drawn into two wires'],
        ['gtceu.recipe.grindless_pasta_lamination.chain_lamina', 'Circuit 3: the caged lattice pressed into four chain laminae; the cage is spent'],
        ['gtceu.recipe.grindless_pasta_lamination.chain_lamina_stack', 'Circuit 4: two chain laminae stacked on a lasagna plate'],
        ['gtceu.recipe.grindless_pasta_lamination.chain_mesh_weave', 'Circuit 5: four PBO fibres woven around two chain strand wires']
    ]

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        ITEMS.forEach(function (e) {
            add('item.grindless.' + e[0], e[1])
            add('tooltip.grindless.' + e[0] + '.0', e[2])
            add('tooltip.grindless.' + e[0] + '.1', e[3])
        })
        RECIPES.forEach(function (e) { add(e[0], e[1]) })
    })
})()
