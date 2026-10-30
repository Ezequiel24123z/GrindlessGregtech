// priority: 3048
// Gregtech Grindless - names and tooltips of UIV's Matrioshka computer and droplet radiator works (startup_scripts/grindless/uiv/matrioshka.js; package UIV-A10):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe, and of each row the package appends to an older table
//   item.grindless.<n>, block.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items and blocks
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['emi.grindless.info.uiv_matrioshka.0',
            'The Matrioshka computer is built from five blocks: the nodes, the logic tiles, the TPV shell and the emitter shell around the core. The droplet radiator module is the radiator works\' block. All five are made on the assembly line (the module only in Mercury orbit) and placed in the structure.',
            'La computadora matrioska se construye con anillos de cinco bloques: losas lógicas, nodos, la cubierta emisora, la cubierta TPV y el módulo del radiador de gotas. Los cinco se fabrican en la línea de ensamblaje (el módulo solo en la órbita de Mercurio).'],
        ['emi.grindless.info.uiv_matrioshka.1',
            'The radiation-hardened controller is made on the assembly line and is read by the machines built from it. The InGaAsSb epi wafer comes from the MOCVD reactor, which EMI does not show.',
            'El controlador endurecido contra la radiación se fabrica en la línea de ensamblaje y lo leen las máquinas construidas con él. La oblea epitaxial de InGaAsSb sale del reactor MOCVD, que EMI no muestra.'],
        ['block.gtceu.matrioshka_computer', 'Matrioshka Computer', 'Computadora matrioska'],
        ['block.gtceu.droplet_radiator_works', 'Droplet Radiator Works', 'Taller de radiadores de gotas'],
        ['gtceu.matrioshka_computing', 'Matrioshka Computing', 'Computación matrioska'],
        ['gtceu.droplet_radiator_assembly', 'Droplet Radiator Assembly', 'Montaje de radiadores de gotas'],
        ['material.gtceu.stibine', 'Stibine', 'Estibina'],

        ['grindless.machine.matrioshka_computer.tooltip.0',
            '\u00a77Writes UIV research and makes the neutron-star and Kerr charts.',
            '\u00a77Escribe investigación UIV y fabrica las cartas de neutrones y de Kerr.'],
        ['grindless.machine.droplet_radiator_works.tooltip.0',
            '\u00a77Makes TPV tiles in open vacuum.',
            '\u00a77Fabrica losetas TPV en vacío abierto.'],

        ['gtceu.recipe.grindless_matrioshka_computing.research_write',
            'Circuit 1: the 5D data crystal burns the radiation-hardened controller research into a blank data module.',
            'Circuito 1: el cristal de datos 5D graba la investigación del controlador resistente a radiación en un módulo de datos en blanco.'],
        ['gtceu.recipe.grindless_matrioshka_computing.ns_eos_chart',
            'Circuit 2: a timed X-ray pulse and a degenerate pellet give the neutron-star equation-of-state chart.',
            'Circuito 2: un pulso de rayos X cronometrado y un gránulo degenerado dan la carta de la ecuación de estado de la estrella de neutrones.'],
        ['gtceu.recipe.grindless_matrioshka_computing.kerr_chart',
            'Circuit 3: correlated Kerr data resolves into the Kerr chart.',
            'Circuito 3: los datos de Kerr correlacionados se resuelven en la carta de Kerr.'],
        ['gtceu.recipe.grindless_droplet_radiator_assembly.tpv_tile',
            'Circuit 2: four TPV cells and a selective emitter make a TPV tile.',
            'Circuito 2: cuatro celdas TPV y un emisor selectivo forman una loseta TPV.'],

        ['gtceu.recipe.grindless_electron_beam.tin_distill',
            'Circuit 8: the electron beam distils tin; the skull is left behind.',
            'Circuito 8: el haz de electrones destila estaño; queda el cráneo.'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.glassy_carbon_lattice',
            'Circuit 4: methane pyrolyses onto the 2PP lattice into glassy carbon; the hydrogen is returned.',
            'Circuito 4: el metano se piroliza sobre la red 2PP hasta carbono vítreo; el hidrógeno se devuelve.'],
        ['gtceu.recipe.grindless_snspd_fabrication.nb_jj_wafer',
            'Circuit 5: the niobium trilayer is patterned into Josephson junctions.',
            'Circuito 5: la tricapa de niobio se modela en uniones Josephson.'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.nb_trilayer',
            'Circuit 8: a niobium target grows the Nb/AlOx/Nb trilayer on silicon.',
            'Circuito 8: un blanco de niobio crece la tricapa Nb/AlOx/Nb sobre silicio.'],
        ['gtceu.recipe.grindless_photonic_foundry.air_bridge',
            'Circuit 14: gold air bridges are plated on the InGaAsSb epi wafer.',
            'Circuito 14: se depositan puentes de aire de oro sobre la oblea epi de InGaAsSb.'],
        ['gtceu.recipe.grindless_photonic_foundry.diamond_contacts',
            'Circuit 15: Ti/Pt/Au contacts are deposited on the boron-doped C-12 diamond.',
            'Circuito 15: se depositan contactos Ti/Pt/Au sobre el diamante C-12 dopado con boro.'],
        ['gtceu.recipe.grindless_photonic_foundry.w_photonic_crystal',
            'Circuit 16: the sputtered tungsten wafer is etched into a photonic crystal.',
            'Circuito 16: la oblea de wolframio pulverizada se graba en un cristal fotónico.']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]; blocks are listed in BLOCKS
    var ITEMS = [
        ['eb_distilled_tin', 'Distilled Tin', 'Estaño destilado', 'Tin distilled in the electron beam furnace.', 'Estaño destilado en el horno de haz de electrones.', 'Sprayed into droplets in the droplet radiator works.', 'Se rocía en gotas en el taller de radiadores de gotas.'],
        ['glassy_carbon_lattice', 'Glassy Carbon Lattice', 'Red de carbono vítreo', 'A 2PP lattice pyrolysed into glassy carbon.', 'Una red 2PP pirolizada hasta carbono vítreo.', 'Coated with SiC for the droplet wick.', 'Se recubre con SiC para la mecha de gotas.'],
        ['sic_coated_lattice', 'SiC-Coated Lattice', 'Red recubierta de SiC', 'Glassy carbon wrapped in silicon carbide.', 'Carbono vítreo envuelto en carburo de silicio.', 'Becomes a droplet wick.', 'Se convierte en una mecha de gotas.'],
        ['droplet_wick', 'Droplet Wick', 'Mecha de gotas', 'A porous wick that feeds liquid tin.', 'Una mecha porosa que alimenta estaño líquido.', 'Two make a droplet collector.', 'Dos forman un colector de gotas.'],
        ['droplet_collector', 'Droplet Collector', 'Colector de gotas', 'Catches the tin droplets for reuse.', 'Recoge las gotas de estaño para reutilizarlas.', 'Goes into the droplet radiator works (circuit 1).', 'Va al taller de radiadores de gotas (circuito 1).'],
        ['ingaasb_epi_wafer', 'InGaAsSb Epi Wafer', 'Oblea epi de InGaAsSb', 'A GaAs wafer grown with an InGaAsSb absorber.', 'Una oblea de GaAs crecida con un absorbente de InGaAsSb.', 'Gets gold air bridges in the photonic foundry.', 'Recibe puentes de aire de oro en la fundición fotónica.'],
        ['air_bridge_wafer', 'Air-Bridge Wafer', 'Oblea de puentes de aire', 'A TPV wafer with gold air bridges.', 'Una oblea TPV con puentes de aire de oro.', 'Diced into TPV cells.', 'Se corta en celdas TPV.'],
        ['ingaasb_tpv_cell', 'InGaAsSb TPV Cell', 'Celda TPV de InGaAsSb', 'Turns thermal radiation back into electricity.', 'Convierte la radiación térmica de nuevo en electricidad.', 'Four go into a TPV tile.', 'Cuatro forman una loseta TPV.'],
        ['tpv_tile', 'TPV Tile', 'Loseta TPV', 'Four TPV cells under a selective emitter.', 'Cuatro celdas TPV bajo un emisor selectivo.', 'Made in the droplet radiator works (circuit 2).', 'Se fabrica en el taller de radiadores de gotas (circuito 2).'],
        ['tpv_segment', 'TPV Segment', 'Segmento TPV', 'Four tiles joined with gold.', 'Cuatro losetas unidas con oro.', 'Four make a TPV shell.', 'Cuatro forman una cáscara TPV.'],
        ['tipt_au_stack', 'Ti/Pt/Au Contact Stack', 'Pila de contactos Ti/Pt/Au', 'A titanium, platinum and gold metal stack.', 'Una pila metálica de titanio, platino y oro.', 'Deposited as diamond contacts; the gold is recycled.', 'Se deposita como contactos de diamante; el oro se recicla.'],
        ['nb_target', 'Niobium Target', 'Blanco de niobio', 'Sintered niobium for epitaxy.', 'Niobio sinterizado para epitaxia.', 'Grows the Josephson trilayer.', 'Crece la tricapa Josephson.'],
        ['w_target', 'Tungsten Target', 'Blanco de wolframio', 'Sintered tungsten for sputtering.', 'Wolframio sinterizado para pulverización.', 'Sputtered onto silicon.', 'Se pulveriza sobre silicio.'],
        ['nb_trilayer', 'Nb Trilayer Wafer', 'Oblea de tricapa de Nb', 'A Nb/AlOx/Nb trilayer on silicon.', 'Una tricapa Nb/AlOx/Nb sobre silicio.', 'Patterned into Josephson junctions.', 'Se modela en uniones Josephson.'],
        ['nb_jj_wafer', 'Josephson Junction Wafer', 'Oblea de uniones Josephson', 'A wafer of niobium Josephson junctions.', 'Una oblea de uniones Josephson de niobio.', 'Engraved into AQFP dies.', 'Se graba en dados AQFP.'],
        ['aqfp_die', 'AQFP Die', 'Dado AQFP', 'An adiabatic quantum-flux-parametron logic die.', 'Un dado lógico de parametrón de flujo cuántico adiabático.', 'Bonded to a glass interposer.', 'Se une a un interpositor de vidrio.'],
        ['aqfp_module', 'AQFP Module', 'Módulo AQFP', 'An AQFP die on its interposer.', 'Un dado AQFP sobre su interpositor.', 'Four make a logic tile.', 'Cuatro forman una loseta lógica.'],
        ['c12_cvd_plate', 'C-12 CVD Plate', 'Placa CVD de C-12', 'Isotopically pure diamond grown from the fusion ash.', 'Diamante isotópicamente puro crecido de la ceniza de fusión.', 'Polished, doped or metallised.', 'Se pule, se dopa o se metaliza.'],
        ['c12_polished_plate', 'Polished C-12 Plate', 'Placa de C-12 pulida', 'A mirror-flat C-12 diamond plate.', 'Una placa de diamante C-12 plana como un espejo.', 'Metallised for a computing node.', 'Se metaliza para un nodo de cómputo.'],
        ['c12_metallised_plate', 'Metallised C-12 Plate', 'Placa de C-12 metalizada', 'A C-12 plate with titanium traces.', 'Una placa de C-12 con pistas de titanio.', 'Two make a computing node.', 'Dos forman un nodo de cómputo.'],
        ['c12_boron_diamond', 'Boron-Doped C-12 Diamond', 'Diamante C-12 dopado con boro', 'A p-type C-12 diamond plate.', 'Una placa de diamante C-12 de tipo p.', 'Receives Ti/Pt/Au contacts.', 'Recibe contactos Ti/Pt/Au.'],
        ['diamond_contact_wafer', 'Diamond Contact Wafer', 'Oblea de contactos de diamante', 'Doped diamond with its metal contacts.', 'Diamante dopado con sus contactos metálicos.', 'Makes a Schottky die.', 'Forma un dado Schottky.'],
        ['diamond_schottky_die', 'Diamond Schottky Die', 'Dado Schottky de diamante', 'A radiation-hard diamond diode.', 'Un diodo de diamante resistente a la radiación.', 'Four go into the radiation-hardened controller.', 'Cuatro van al controlador resistente a radiación.'],
        ['sputtered_w_wafer', 'Sputtered Tungsten Wafer', 'Oblea de wolframio pulverizado', 'A silicon wafer with a tungsten film.', 'Una oblea de silicio con una película de wolframio.', 'Etched into a photonic crystal.', 'Se graba en un cristal fotónico.'],
        ['w_photonic_crystal', 'Tungsten Photonic Crystal', 'Cristal fotónico de wolframio', 'A crystal that radiates only in a narrow band.', 'Un cristal que irradia solo en una banda estrecha.', 'Passivated with hafnia.', 'Se pasiva con hafnia.'],
        ['hfo2_passivated_crystal', 'Passivated Photonic Crystal', 'Cristal fotónico pasivado', 'A tungsten crystal sealed with hafnia.', 'Un cristal de wolframio sellado con hafnia.', 'Becomes a selective emitter.', 'Se convierte en un emisor selectivo.'],
        ['selective_emitter', 'Selective Emitter', 'Emisor selectivo', 'Emits heat only where the TPV cell can use it.', 'Emite calor solo donde la celda TPV puede usarlo.', 'Goes into TPV tiles and emitter shells.', 'Va a losetas TPV y cáscaras de emisores.'],
        ['rad_hard_controller', 'Radiation-Hardened Controller', 'Controlador resistente a radiación', 'A controller built to run beside a star.', 'Un controlador construido para funcionar junto a una estrella.', 'Made on the assembly line; the research is written by the Matrioshka computer.', 'Se fabrica en la línea de ensamblaje; la investigación la escribe la computadora matrioska.'],
        ['matrioshka_logic_tile', 'Matrioshka Logic Tile', 'Loseta lógica matrioska', 'Four AQFP modules in a niobium frame.', 'Cuatro módulos AQFP en un marco de niobio.', 'Ring block of the Matrioshka computer.', 'Bloque de anillo de la computadora matrioska.'],
        ['matrioshka_node', 'Matrioshka Node', 'Nodo matrioska', 'Two metallised C-12 plates.', 'Dos placas de C-12 metalizadas.', 'Ring block of the Matrioshka computer.', 'Bloque de anillo de la computadora matrioska.'],
        ['matrioshka_emitter_shell', 'Matrioshka Emitter Shell', 'Cáscara de emisores matrioska', 'Four selective emitters on titanium.', 'Cuatro emisores selectivos sobre titanio.', 'Ring block of the Matrioshka computer.', 'Bloque de anillo de la computadora matrioska.'],
        ['matrioshka_tpv_shell', 'Matrioshka TPV Shell', 'Cáscara TPV matrioska', 'Four TPV segments on tungsten.', 'Cuatro segmentos TPV sobre wolframio.', 'Ring block of the Matrioshka computer.', 'Bloque de anillo de la computadora matrioska.'],
        ['droplet_radiator_module', 'Droplet Radiator Module', 'Módulo de radiador de gotas', 'A sheet of liquid-tin droplets in a frame.', 'Una lámina de gotas de estaño líquido en un marco.', 'Ring block of the Matrioshka computer.', 'Bloque de anillo de la computadora matrioska.']
    ]
    var BLOCKS = {
        matrioshka_logic_tile: true, matrioshka_node: true, matrioshka_emitter_shell: true, matrioshka_tpv_shell: true, droplet_radiator_module: true
    }

    ITEMS.forEach(function (i) {
        ENTRIES.push([(BLOCKS[i[0]] ? 'block.grindless.' : 'item.grindless.') + i[0], i[1], i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[3], i[4]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[5], i[6]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
