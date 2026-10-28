// priority: 3325
// Gregtech Grindless - names and tooltips of UIV's TFLN fab and femtosecond writer (startup_scripts/grindless/uiv/tfln_femtosecond.js; package UIV-A4):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each fab and writer recipe
//   material.gtceu.<fluid>                             spent KOH etchant, photoresin and uncured photoresin
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.tfln_fab', 'TFLN Fab', 'Fábrica de TFLN'],
        ['block.gtceu.femtosecond_writer', 'Femtosecond Writer', 'Escritor de femtosegundos'],
        ['gtceu.ion_slicing', 'Ion Slicing', 'Corte iónico'],
        ['gtceu.femtosecond_writing', 'Femtosecond Writing', 'Escritura de femtosegundos'],

        ['material.gtceu.spent_koh_etchant', 'Spent KOH Etchant', 'Grabador de KOH agotado'],
        ['material.gtceu.photoresin', 'Photoresin', 'Fotorresina'],
        ['material.gtceu.uncured_photoresin', 'Uncured Photoresin', 'Fotorresina sin curar'],

        ['grindless.machine.tfln_fab.tooltip.0',
            'A cleanroom that bonds, slices and poles thin-film lithium niobate: the only maker of LN-on-Si3N4 and Si-28 SOI wafers, poled LNOI and the EO microcomb.',
            'Una sala limpia que une, corta y polariza niobato de litio de película delgada: la única que fabrica obleas LN sobre Si3N4 y SOI de Si-28, LNOI polarizado y el micropeine EO.'],
        ['grindless.machine.tfln_fab.tooltip.1',
            'Circuit 1 LN-on-Si3N4, 2 Si-28 SOI wafer and donor, 3 poled LNOI, 4 EO microcomb.',
            'Circuito 1 LN sobre Si3N4, 2 oblea SOI de Si-28 y donante, 3 LNOI polarizado, 4 micropeine EO.'],
        ['grindless.machine.tfln_fab.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, optional fluid hatches. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, escotillas de fluidos opcionales. Acepta una escotilla de paralelos.'],
        ['grindless.machine.femtosecond_writer.tooltip.0',
            'A femtosecond laser on an air-bearing stage that writes structures inside glass and metal: interposers, 2PP lattices, orifice plates and 5D-crystal blanks.',
            'Un láser de femtosegundos sobre una platina de cojinete de aire que escribe estructuras dentro de vidrio y metal: interpositores, retículas 2PP, placas de orificios y blancos de cristal 5D.'],
        ['grindless.machine.femtosecond_writer.tooltip.1',
            'Circuit 1 interposer blank, 2 2PP lattice, 3 orifice plate, 4 5D-crystal blank.',
            'Circuito 1 blanco de interpositor, 2 retícula 2PP, 3 placa de orificios, 4 blanco de cristal 5D.'],
        ['grindless.machine.femtosecond_writer.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, optional fluid hatches. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, escotillas de fluidos opcionales. Acepta una escotilla de paralelos.'],

        ['gtceu.recipe.grindless_ion_slicing.ln_on_sin',
            'Circuit 1: an LNOI film bonded onto a Si3N4-coated wafer.',
            'Circuito 1: una película LNOI unida a una oblea recubierta de Si3N4.'],
        ['gtceu.recipe.grindless_ion_slicing.si28_soi',
            'Circuit 2: hydrogen-implanted Si-28 cleaves off a thin layer onto an oxidised wafer; the donor wafer is reused and the hydrogen is released.',
            'Circuito 2: el Si-28 implantado con hidrógeno libera una capa fina sobre una oblea oxidada; la oblea donante se reutiliza y el hidrógeno se libera.'],
        ['gtceu.recipe.grindless_ion_slicing.poled_lnoi',
            'Circuit 3: periodic electric-field poling of an LNOI wafer.',
            'Circuito 3: polarización periódica con campo eléctrico de una oblea LNOI.'],
        ['gtceu.recipe.grindless_ion_slicing.eo_microcomb',
            'Circuit 4: an annealed damascene Si3N4 ring bonded to LNOI makes the electro-optic microcomb.',
            'Circuito 4: un anillo damasceno de Si3N4 recocido unido a LNOI forma el micropeine electroóptico.'],
        ['gtceu.recipe.grindless_femtosecond_writing.interposer_blank',
            'Circuit 1: a ULE boule is written with the interposer lines; the ablated glass dust goes back to stock.',
            'Circuito 1: se escribe un lingote ULE con las líneas del interpositor; el polvo de vidrio ablacionado vuelve al almacén.'],
        ['gtceu.recipe.grindless_femtosecond_writing.lattice_2pp',
            'Circuit 2: two-photon polymerisation of photoresin in a glass plate; the uncured resin is recovered.',
            'Circuito 2: polimerización de dos fotones de fotorresina en una placa de vidrio; la resina sin curar se recupera.'],
        ['gtceu.recipe.grindless_femtosecond_writing.orifice_plate',
            'Circuit 3: a rhenium-alloy plate drilled with micro-orifices; the ablated dust goes back to stock.',
            'Circuito 3: una placa de aleación de renio perforada con microorificios; el polvo ablacionado vuelve al almacén.'],
        ['gtceu.recipe.grindless_femtosecond_writing.crystal_blank',
            'Circuit 4: voxels written inside a silica storage preform (5D optical storage); the ablated dust goes back to stock.',
            'Circuito 4: vóxeles escritos dentro de una preforma de sílice de almacenamiento (almacenamiento óptico 5D); el polvo ablacionado vuelve al almacén.'],
        ['gtceu.recipe.grindless_photonic_foundry.eo_transceiver',
            'Circuit 8: platinum electrodes on a thinned LN-on-Si3N4 wafer make the electro-optic transceiver.',
            'Circuito 8: electrodos de platino sobre una oblea LN sobre Si3N4 adelgazada forman el transceptor electroóptico.'],
        ['gtceu.recipe.grindless_photonic_foundry.glass_interposer',
            'Circuit 9: the written interposer blank is etched and filled with copper vias.',
            'Circuito 9: el bloque de interpositor escrito se graba y se rellena con vías de cobre.'],
        ['gtceu.recipe.grindless_photonic_foundry.damascene_ring',
            'Circuit 10: the damascene Si3N4 wafer is polished and annealed into rings; the polishing silica goes back as quartz sand.',
            'Circuito 10: la oblea damascena de Si3N4 se pule y se recuece en anillos; la sílice del pulido vuelve como arena de cuarzo.'],
        ['gtceu.recipe.grindless_photonic_foundry.ppln_waveguide',
            'Circuit 11: a poled LNOI wafer is etched into periodically poled waveguides.',
            'Circuito 11: una oblea LNOI polarizada se graba en guías de onda de polarización periódica.'],
        ['gtceu.recipe.grindless_synchrotron.damascene_trench',
            'Circuit 7: X-ray lithography cuts deep trenches into an oxidised wafer for damascene Si3N4.',
            'Circuito 7: la litografía de rayos X abre trincheras profundas en una oblea oxidada para el Si3N4 damasceno.']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['ln_on_sin_wafer', 'LN-on-Si3N4 Wafer', 'Oblea LN sobre Si3N4', 'Thin-film lithium niobate on a silicon nitride wafer.', 'Niobato de litio de película delgada sobre una oblea de nitruro de silicio.', 'Thinned in the cutter before it becomes a transceiver.', 'Se adelgaza en la cortadora antes de ser un transceptor.'],
        ['ln_on_sin_thinned', 'Thinned LN-on-Si3N4 Wafer', 'Oblea LN sobre Si3N4 adelgazada', 'Ground to the final film thickness.', 'Pulida hasta el grosor final de la película.', 'Takes platinum electrodes to make an EO transceiver.', 'Recibe electrodos de platino para formar un transceptor EO.'],
        ['eo_transceiver', 'EO Transceiver', 'Transceptor EO', 'An electro-optic modulator on thin-film lithium niobate.', 'Un modulador electroóptico sobre niobato de litio de película delgada.', 'Made from a thinned wafer and platinum electrodes.', 'Se hace con una oblea adelgazada y electrodos de platino.'],
        ['si28_soi_wafer', 'Si-28 SOI Wafer', 'Oblea SOI de Si-28', 'Isotopically pure silicon on insulator.', 'Silicio isotópicamente puro sobre aislante.', 'Only the TFLN fab makes it (circuit 2).', 'Solo la fábrica de TFLN lo fabrica (circuito 2).'],
        ['si28_donor_wafer', 'Si-28 Donor Wafer', 'Oblea donante de Si-28', 'The wafer left after the thin layer is cleaved off.', 'La oblea que queda tras desprender la capa fina.', 'It can be reimplanted and reused.', 'Se puede reimplantar y reutilizar.'],
        ['poled_lnoi_wafer', 'Poled LNOI Wafer', 'Oblea LNOI polarizada', 'A lithium niobate wafer with periodic domain inversion.', 'Una oblea de niobato de litio con inversión periódica de dominios.', 'Cut into PPLN waveguides in the photonic foundry.', 'Se corta en guías de onda PPLN en la fundición fotónica.'],
        ['written_interposer_blank', 'Written Interposer Blank', 'Blanco de interpositor escrito', 'A ULE glass boule with laser-written channels.', 'Un lingote de vidrio ULE con canales escritos con láser.', 'Etched in KOH to open the channels.', 'Se graba en KOH para abrir los canales.'],
        ['etched_interposer_blank', 'Etched Interposer Blank', 'Blanco de interpositor grabado', 'The written channels opened by KOH.', 'Los canales escritos abiertos con KOH.', 'Filled with copper in the photonic foundry.', 'Se rellena de cobre en la fundición fotónica.'],
        ['glass_interposer', 'Glass Interposer', 'Interpositor de vidrio', 'A glass substrate with copper through-glass vias.', 'Un sustrato de vidrio con vías de cobre a través del vidrio.', 'Carries the chiplets of the later circuits.', 'Soporta los chiplets de los circuitos posteriores.'],
        ['trenched_oxide_wafer', 'Trenched Oxide Wafer', 'Oblea de óxido con zanjas', 'An oxidised wafer with ring trenches exposed by X-ray lithography.', 'Una oblea oxidada con zanjas anulares expuestas por litografía de rayos X.', 'Filled with Si3N4 in the chemical reactor.', 'Se rellena de Si3N4 en el reactor químico.'],
        ['damascene_sin_wafer', 'Damascene Si3N4 Wafer', 'Oblea damascena de Si3N4', 'Trenches filled with silicon nitride.', 'Zanjas rellenas de nitruro de silicio.', 'Polished and annealed into a ring.', 'Se pule y recuece hasta obtener un anillo.'],
        ['annealed_damascene_ring', 'Annealed Damascene Ring', 'Anillo damasceno recocido', 'A low-loss Si3N4 microring.', 'Un microanillo de Si3N4 de bajas pérdidas.', 'Bonded to LNOI it makes the EO microcomb.', 'Unido a LNOI forma el micropeine EO.'],
        ['ppln_waveguide', 'PPLN Waveguide', 'Guía de onda PPLN', 'Periodically poled lithium niobate for frequency doubling.', 'Niobato de litio polarizado periódicamente para duplicar frecuencia.', 'Two stages make the positronium cooling laser.', 'Dos etapas forman el láser de enfriamiento de positronio.'],
        ['shg_486_stage', '486 nm SHG Stage', 'Etapa SHG de 486 nm', 'A frequency-doubling stage fed by a UEV emitter.', 'Una etapa de duplicación de frecuencia alimentada por un emisor UEV.', 'The first half of the positronium cooling laser.', 'La primera mitad del láser de enfriamiento de positronio.'],
        ['lattice_2pp', '2PP Lattice', 'Retícula 2PP', 'A glass plate with a two-photon-polymerised lattice.', 'Una placa de vidrio con una retícula polimerizada por dos fotones.', 'A micro-structured part for later machines.', 'Una pieza microestructurada para máquinas posteriores.'],
        ['orifice_plate', 'Orifice Plate', 'Placa de orificios', 'A rhenium-alloy plate with laser-drilled micro-orifices.', 'Una placa de aleación de renio con microorificios perforados con láser.', 'Written in the femtosecond writer (circuit 3).', 'Se escribe en el escritor de femtosegundos (circuito 3).'],
        ['silica_storage_preform', 'Silica Storage Preform', 'Preforma de sílice de almacenamiento', 'High-purity silica drawn for optical storage.', 'Sílice de alta pureza estirada para almacenamiento óptico.', 'Written with voxels in the femtosecond writer.', 'Se escribe con vóxeles en el escritor de femtosegundos.'],
        ['written_crystal_blank', 'Written Crystal Blank', 'Blanco de cristal escrito', 'A silica crystal with written voxels.', 'Un cristal de sílice con vóxeles escritos.', 'Read back and verified before annealing.', 'Se lee y verifica antes de recocerlo.'],
        ['verified_crystal', 'Verified Crystal', 'Cristal verificado', 'A written crystal that passed its read-back.', 'Un cristal escrito que superó la lectura de comprobación.', 'Annealed into a 5D data crystal.', 'Se recuece hasta formar un cristal de datos 5D.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1], i[2]])
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
