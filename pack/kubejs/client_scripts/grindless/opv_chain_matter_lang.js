// priority: 5822
// Gregtech Grindless - names and tooltips of the OpV chain matter (startup_scripts/grindless/opv/chain_matter.js, package OpV-A0):
//
//   grindless:<item>  item.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   recipe rows       gtceu.recipe.<dataKey>.<name> (the EMI line of each OpV-A0 row of tables/vela_pasta.json, run at SGR 1806-20)
//
// ni_chain_slab, chain_lamina_stack and the chain strand material are named by client_scripts/grindless/opv_foundation_lang.js. Kept out of
// pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // id, en name, es name, en tip 0, es tip 0, en tip 1, es tip 1
    var ITEMS = [
        ['chain_crust_slab', 'Chain Crust Slab', 'Losa de corteza en cadena', 'Fe-56 outer crust of SGR 1806-20, where the magnetar\'s field pulls the atoms into chains.', 'Corteza externa de Fe-56 de SGR 1806-20, donde el campo del magnetar estira los átomos en cadenas.', 'Caged in the phase sorter before the chains unwind.', 'Se enjaula en el clasificador de fases antes de que las cadenas se deshagan.'],
        ['caged_chain_phase', 'Caged Chain Phase', 'Fase en cadena enjaulada', 'The crust\'s iron chains held aligned in a neutronium cage part.', 'Las cadenas de hierro de la corteza, alineadas dentro de una pieza de jaula de neutronio.', 'Drawn into chain strand ingots; the cage is spent in the draw.', 'Se estira en lingotes de hebra de cadena; la jaula se gasta en el estirado.'],
        ['pbo_braided_chain_wire', 'PBO-Braided Chain Strand Wire', 'Alambre de hebra de cadena trenzado con PBO', 'Chain strand wire under a PBO braid that holds it against its own field.', 'Alambre de hebra de cadena bajo una trenza de PBO que lo sujeta contra su propio campo.', 'Insulated into chain strand cable in the assembler.', 'Se aísla en cable de hebra de cadena en el ensamblador.'],
        ['chain_lattice_slab', 'Chain Lattice Slab', 'Losa de red en cadena', 'The deeper outer crust, where the chains condense into a lattice.', 'La corteza externa más profunda, donde las cadenas se condensan en una red.', 'Caged in the phase sorter.', 'Se enjaula en el clasificador de fases.'],
        ['caged_chain_lattice', 'Caged Chain Lattice', 'Red en cadena enjaulada', 'A condensed chain lattice held in a neutronium cage part.', 'Una red de cadenas condensada dentro de una pieza de jaula de neutronio.', 'Pressed into chain laminae; the cage is spent in the press.', 'Se prensa en láminas de cadena; la jaula se gasta en la prensa.'],
        ['chain_lamina', 'Chain Lamina', 'Lámina de cadena', 'A sheet of aligned atomic chains, stiff along the field and soft across it.', 'Una lámina de cadenas atómicas alineadas, rígida a lo largo del campo y blanda a través de él.', 'Stacked on a lasagna plate into a chain lamina stack.', 'Se apila sobre una placa de lasaña en una pila de láminas de cadena.'],
        ['caged_ni_chain', 'Caged Nickel Chain', 'Níquel en cadena enjaulado', 'Nickel chains from the Ni-62/64 layer held in a neutronium cage part.', 'Cadenas de níquel de la capa de Ni-62/64 dentro de una pieza de jaula de neutronio.', 'Thawed for its nickel isotopes at the OpV stage.', 'Se descongela para obtener sus isótopos de níquel en la etapa OpV.'],
        ['chain_mesh_weave', 'Chain Mesh Weave', 'Tejido de malla de cadena', 'PBO fibre woven around chain strand wire.', 'Fibra de PBO tejida alrededor de alambre de hebra de cadena.', 'Welded into a mesh belt at the OpV stage.', 'Se suelda en una cinta de malla en la etapa OpV.']
    ]

    // the EMI line of each OpV-A0 row (key, en, es)
    var RECIPES = [
        ['gtceu.recipe.grindless_pasta_extraction.chain_crust', 'Circuit 3: at SGR 1806-20 the bulge chart (kept) finds the Fe-56 chain crust; one pellet in ten is spent as bait', 'Circuito 3: en SGR 1806-20 la carta del bulbo (no se gasta) encuentra la corteza de cadenas de Fe-56; uno de cada diez perdigones se gasta como cebo'],
        ['gtceu.recipe.grindless_pasta_extraction.ni_chain', 'Circuit 4: the Ni-62/64 chain layer, one slab per 1,200 ticks', 'Circuito 4: la capa de cadenas de Ni-62/64, una losa cada 1.200 ticks'],
        ['gtceu.recipe.grindless_pasta_extraction.chain_lattice', 'Circuit 5: the deeper crust, where the chains condense into a lattice', 'Circuito 5: la corteza más profunda, donde las cadenas se condensan en una red'],
        ['gtceu.recipe.grindless_pasta_sorting.chain_caging', 'Circuit 3: a crust slab closed in a cage part (consumed); the unchained iron falls out as dust', 'Circuito 3: una losa de corteza cerrada en una pieza de jaula (se gasta); el hierro sin encadenar cae como polvo'],
        ['gtceu.recipe.grindless_pasta_sorting.ni_chain_caging', 'Circuit 4: a nickel chain slab closed in a cage part (consumed)', 'Circuito 4: una losa de níquel en cadena cerrada en una pieza de jaula (se gasta)'],
        ['gtceu.recipe.grindless_pasta_sorting.lattice_caging', 'Circuit 5: a lattice slab closed in a cage part (consumed); the unchained iron falls out as dust', 'Circuito 5: una losa de red cerrada en una pieza de jaula (se gasta); el hierro sin encadenar cae como polvo'],
        ['gtceu.recipe.grindless_pasta_drawing.chain_strand_drawing', 'Circuit 3: the caged chain phase drawn into four chain strand ingots; the cage is spent', 'Circuito 3: la fase en cadena enjaulada estirada en cuatro lingotes de hebra de cadena; la jaula se gasta'],
        ['gtceu.recipe.grindless_pasta_drawing.chain_wire_drawing', 'Circuit 4: a chain strand ingot drawn into two wires', 'Circuito 4: un lingote de hebra de cadena estirado en dos alambres'],
        ['gtceu.recipe.grindless_pasta_lamination.chain_lamina', 'Circuit 3: the caged lattice pressed into four chain laminae; the cage is spent', 'Circuito 3: la red enjaulada prensada en cuatro láminas de cadena; la jaula se gasta'],
        ['gtceu.recipe.grindless_pasta_lamination.chain_lamina_stack', 'Circuit 4: two chain laminae stacked on a lasagna plate', 'Circuito 4: dos láminas de cadena apiladas sobre una placa de lasaña'],
        ['gtceu.recipe.grindless_pasta_lamination.chain_mesh_weave', 'Circuit 5: four PBO fibres woven around two chain strand wires', 'Circuito 5: cuatro fibras de PBO tejidas alrededor de dos alambres de hebra de cadena']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            var add = function (key, value) { event.add('grindless', key, value) }
            ITEMS.forEach(function (e) {
                add('item.grindless.' + e[0], e[1 + li])
                add('tooltip.grindless.' + e[0] + '.0', e[3 + li])
                add('tooltip.grindless.' + e[0] + '.1', e[5 + li])
            })
            RECIPES.forEach(function (e) { add(e[0], e[1 + li]) })
        })
    })
})()
