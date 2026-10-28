// Gregtech Grindless - names and tooltips of UEV's SNSPD foundry, van der Waals stacker and photonic integration hall (startup_scripts/grindless/uev/photonics.js; package UEV-A6):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.snspd_foundry', 'SNSPD Foundry', 'Fundición de SNSPD'],
        ['gtceu.snspd_fabrication', 'SNSPD Fabrication', 'Fabricación de SNSPD'],
        ['block.gtceu.vdw_stacker', 'Van der Waals Stacker', 'Apilador de van der Waals'],
        ['gtceu.vdw_assembly', 'Van der Waals Assembly', 'Ensamblaje de van der Waals'],
        ['block.gtceu.photonic_integration_hall', 'Photonic Integration Hall', 'Sala de integración fotónica'],
        ['gtceu.photonic_integration', 'Photonic Integration', 'Integración fotónica'],

        ['grindless.machine.snspd_foundry.tooltip.0',
            'A cryostat that patterns a tungsten silicide film into a nanowire and packages it: the only maker of SNSPDs.',
            'Un criostato que graba una película de siliciuro de wolframio en un nanohilo y la encapsula: el único fabricante de SNSPD.'],
        ['grindless.machine.snspd_foundry.tooltip.1',
            'Circuit 1 WSi film, 2 nanowire write, 3 waveguide mount, 4 cool and package. It needs the FZ wafer and a SiN waveguide chip.',
            'Circuito 1 película de WSi, 2 escritura del nanohilo, 3 montaje en la guía de ondas, 4 enfriado y encapsulado. Necesita la oblea FZ y un chip de guía de ondas de SiN.'],
        ['grindless.machine.snspd_foundry.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional input hatch. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, una escotilla de entrada opcional. Acepta una escotilla de paralelos.'],

        ['grindless.machine.vdw_stacker.tooltip.0',
            'Lays two-dimensional crystals on each other with a clean transfer arm: hBN chips, graphene modulators, hBN-encapsulated graphene.',
            'Apila cristales bidimensionales con un brazo de transferencia limpio: chips de hBN, moduladores de grafeno, grafeno encapsulado en hBN.'],
        ['grindless.machine.vdw_stacker.tooltip.1',
            'Circuit 1 hBN emitter chip, 2 graphene modulator, 3 hBN-encapsulated graphene. The films come from the CVD lines on copper foil.',
            'Circuito 1 chip emisor de hBN, 2 modulador de grafeno, 3 grafeno encapsulado en hBN. Las películas salen de las líneas CVD sobre lámina de cobre.'],
        ['grindless.machine.vdw_stacker.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional input hatch. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, una escotilla de entrada opcional. Acepta una escotilla de paralelos.'],

        ['grindless.machine.photonic_integration_hall.tooltip.0',
            'Bonds waveguides, quantum dot sources, detectors and modulators onto one chip: the only place an optical computer is made.',
            'Une guías de ondas, fuentes de puntos cuánticos, detectores y moduladores en un solo chip: el único lugar donde se fabrica un ordenador óptico.'],
        ['grindless.machine.photonic_integration_hall.tooltip.1',
            'Circuit 1 waveguide circuit, 2 quantum photonic chip, 3 optical computer (chip + optical assembly).',
            'Circuito 1 circuito de guía de ondas, 2 chip fotónico cuántico, 3 ordenador óptico (chip + ensamblaje óptico).'],
        ['grindless.machine.photonic_integration_hall.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional input hatch. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, una escotilla de entrada opcional. Acepta una escotilla de paralelos.'],

        ['gtceu.recipe.grindless_snspd_fabrication.wsi_film', 'Circuit 1: sputter a tungsten silicide film on an FZ wafer', 'Circuito 1: pulveriza una película de siliciuro de wolframio sobre una oblea FZ'],
        ['gtceu.recipe.grindless_snspd_fabrication.nanowire_write', 'Circuit 2: write the nanowire meander in resist', 'Circuito 2: escribe el meandro del nanohilo en la resina'],
        ['gtceu.recipe.grindless_snspd_fabrication.waveguide_mount', 'Circuit 3: etch the wires and mount them on a SiN waveguide chip', 'Circuito 3: graba los hilos y los monta en un chip de guía de ondas de SiN'],
        ['gtceu.recipe.grindless_snspd_fabrication.cool_and_package', 'Circuit 4: cool in superfluid helium, bond the contacts: an SNSPD', 'Circuito 4: enfría en helio superfluido y une los contactos: un SNSPD'],
        ['gtceu.recipe.grindless_vdw_assembly.hbn_emitter_chip', 'Circuit 1: two annealed hBN films and an electrode', 'Circuito 1: dos películas de hBN recocidas y un electrodo'],
        ['gtceu.recipe.grindless_vdw_assembly.graphene_modulator', 'Circuit 2: electrodes on hBN-encapsulated graphene', 'Circuito 2: electrodos sobre grafeno encapsulado en hBN'],
        ['gtceu.recipe.grindless_vdw_assembly.encapsulate_graphene', 'Circuit 3: graphene between two hBN films', 'Circuito 3: grafeno entre dos películas de hBN'],
        ['gtceu.recipe.grindless_photonic_integration.waveguide_circuit', 'Circuit 1: a SiN waveguide chip bonded to an LNOI wafer', 'Circuito 1: un chip de guía de SiN unido a una oblea LNOI'],
        ['gtceu.recipe.grindless_photonic_integration.quantum_photonic_chip', 'Circuit 2: source, detectors, modulator and emitter on the circuit', 'Circuito 2: fuente, detectores, modulador y emisor sobre el circuito'],
        ['gtceu.recipe.grindless_photonic_integration.optical_computer', 'Circuit 3: the optical computer, the only recipe for it', 'Circuito 3: el ordenador óptico, su única receta'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.inas_quantum_dots', 'Circuit 3: InAs quantum dots on GaAs; the arsine is used up, hydrogen is returned', 'Circuito 3: puntos cuánticos de InAs sobre GaAs; la arsina se consume entera y se devuelve hidrógeno'],
        ['gtceu.recipe.grindless_photonic_foundry.sin_waveguide_anneal', 'Circuit 7: anneal the etched SiN waveguides under argon', 'Circuito 7: recuece las guías de SiN grabadas bajo argón'],
        ['gtceu.recipe.grindless_synchrotron.sin_waveguide_lithography', 'Circuit 6: X-ray lithography of SiN waveguides through the mask', 'Circuito 6: litografía de rayos X de guías de SiN a través de la máscara']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['fz_silicon_boule', 'FZ Silicon Boule', 'Lingote de silicio FZ', 'Float-zone silicon: no crucible, so no oxygen.', 'Silicio de zona flotante: sin crisol, sin oxígeno.', 'Made in the zone refining tower (circuit 4).', 'Se fabrica en la torre de refinado por zonas (circuito 4).'],
        ['fz_silicon_wafer', 'FZ Silicon Wafer', 'Oblea de silicio FZ', 'A float-zone silicon wafer.', 'Una oblea de silicio de zona flotante.', 'Cut from a boule in a cutter; feeds the SNSPD, SiN and SDD lines.', 'Se corta de un lingote; alimenta las líneas de SNSPD, SiN y SDD.'],
        ['oxidised_wafer', 'Oxidised Wafer', 'Oblea oxidada', 'A wafer with a thermal oxide skin.', 'Una oblea con una película de óxido térmico.', 'Grown in a blast furnace under oxygen.', 'Se crece en un horno alto bajo oxígeno.'],
        ['sdd_implanted_wafer', 'Drift-Ring Wafer', 'Oblea de anillos de deriva', 'Boron drift rings implanted in the oxide.', 'Anillos de deriva de boro implantados en el óxido.', 'Made in the ion implanter (circuit 5); anneal it next.', 'Se fabrica en el implantador de iones (circuito 5); recuécela después.'],
        ['sdd_annealed_wafer', 'Annealed Drift Wafer', 'Oblea de deriva recocida', 'Implant damage healed.', 'El daño de la implantación, curado.', 'Next: contacts in an assembler.', 'Siguiente: contactos en un ensamblador.'],
        ['sin_coated_wafer', 'SiN-Coated Wafer', 'Oblea con SiN', 'A wafer under a low-stress silicon nitride film.', 'Una oblea bajo una película de nitruro de silicio de baja tensión.', 'LPCVD from silane and ammonia; the hydrogen is kept.', 'LPCVD con silano y amoníaco; el hidrógeno se conserva.'],
        ['sin_lithographed_wafer', 'Lithographed SiN Wafer', 'Oblea de SiN litografiada', 'Waveguides exposed in resist.', 'Guías de ondas expuestas en la resina.', 'Exposed in the synchrotron (circuit 6).', 'Se expone en el sincrotrón (circuito 6).'],
        ['sin_etched_wafer', 'Etched SiN Wafer', 'Oblea de SiN grabada', 'Waveguides etched in the nitride.', 'Guías de ondas grabadas en el nitruro.', 'Annealed in the photonic foundry (circuit 7).', 'Se recuece en la fundición fotónica (circuito 7).'],
        ['annealed_sin_chip', 'SiN Waveguide Chip', 'Chip de guía de SiN', 'Low-loss silicon nitride waveguides.', 'Guías de ondas de nitruro de silicio de bajas pérdidas.', 'Goes to the SNSPD foundry and the integration hall.', 'Va a la fundición de SNSPD y a la sala de integración.'],
        ['wsi_wafer', 'WSi Wafer', 'Oblea de WSi', 'A wafer under a thin tungsten silicide film.', 'Una oblea bajo una película fina de siliciuro de wolframio.', 'Made in the SNSPD foundry (circuit 1).', 'Se fabrica en la fundición de SNSPD (circuito 1).'],
        ['wsi_nanowire_wafer', 'Nanowire Wafer', 'Oblea de nanohilos', 'A nanowire meander written in resist.', 'Un meandro de nanohilo escrito en la resina.', 'Made in the SNSPD foundry (circuit 2).', 'Se fabrica en la fundición de SNSPD (circuito 2).'],
        ['snspd_die', 'SNSPD Die', 'Troquel de SNSPD', 'A nanowire on a waveguide, not yet cold.', 'Un nanohilo sobre una guía de ondas, todavía sin enfriar.', 'Packaged in the SNSPD foundry (circuit 4).', 'Se encapsula en la fundición de SNSPD (circuito 4).'],
        ['borazine_ampoule', 'Borazine Ampoule', 'Ampolla de borazina', 'A sealed ampoule of borazine, the inorganic benzene.', 'Una ampolla sellada de borazina, el benceno inorgánico.', 'From ammonia borane in a chemical reactor.', 'De amoníaco borano en un reactor químico.'],
        ['hbn_copper_foil', 'hBN on Copper Foil', 'hBN sobre lámina de cobre', 'A one-layer hBN film grown on copper.', 'Una película de hBN de una capa crecida sobre cobre.', 'The copper comes back after the transfer.', 'El cobre vuelve tras la transferencia.'],
        ['hbn_film', 'hBN Film', 'Película de hBN', 'A freestanding hBN film.', 'Una película de hBN autoportante.', 'Anneal it in a blast furnace next.', 'Recuézala después en un horno alto.'],
        ['annealed_hbn_film', 'Annealed hBN Film', 'Película de hBN recocida', 'A clean, flat hBN film.', 'Una película de hBN limpia y plana.', 'Used by the van der Waals stacker and the UEV pump.', 'La usan el apilador de van der Waals y la bomba UEV.'],
        ['hbn_emitter_chip', 'hBN Emitter Chip', 'Chip emisor de hBN', 'A single-photon emitter in hBN.', 'Un emisor de fotones individuales en hBN.', 'Made in the van der Waals stacker (circuit 1).', 'Se fabrica en el apilador de van der Waals (circuito 1).'],
        ['electropolished_copper_foil', 'Electropolished Copper Foil', 'Lámina de cobre electropulida', 'Smooth copper for large single-layer graphene.', 'Cobre liso para grafeno monocapa extenso.', 'The acid bath is not used up.', 'El baño de ácido no se gasta.'],
        ['graphene_copper_foil', 'Graphene on Copper Foil', 'Grafeno sobre lámina de cobre', 'CVD graphene from methane.', 'Grafeno CVD a partir de metano.', 'The hydrogen it gives off is kept.', 'El hidrógeno que desprende se conserva.'],
        ['pmma_graphene_foil', 'PMMA-Coated Graphene Foil', 'Lámina de grafeno con PMMA', 'A support layer of resist over the graphene.', 'Una capa de soporte de resina sobre el grafeno.', 'Next: the persulfate bath.', 'Siguiente: el baño de persulfato.'],
        ['pmma_graphene_film', 'PMMA-Graphene Film', 'Película de PMMA y grafeno', 'Graphene floating free on its support.', 'Grafeno liberado sobre su soporte.', 'Acetone strips the PMMA, which is recovered.', 'La acetona disuelve el PMMA, que se recupera.'],
        ['graphene_film', 'Graphene Film', 'Película de grafeno', 'A clean transferred graphene film.', 'Una película de grafeno transferida y limpia.', 'Used by the stacker, the UEV conveyor and piston.', 'La usan el apilador, el transportador y el pistón UEV.'],
        ['encapsulated_graphene', 'hBN-Encapsulated Graphene', 'Grafeno encapsulado en hBN', 'Graphene between two hBN films.', 'Grafeno entre dos películas de hBN.', 'Made in the van der Waals stacker (circuit 3).', 'Se fabrica en el apilador de van der Waals (circuito 3).'],
        ['graphene_modulator', 'Graphene Modulator', 'Modulador de grafeno', 'An electro-optic modulator on a waveguide.', 'Un modulador electroóptico sobre una guía de ondas.', 'Made in the van der Waals stacker (circuit 2).', 'Se fabrica en el apilador de van der Waals (circuito 2).'],
        ['seven_n_indium', '7N Indium', 'Indio 7N', 'Indium zone-refined to seven nines.', 'Indio refinado por zonas a siete nueves.', 'Made in the zone refining tower (circuit 5).', 'Se fabrica en la torre de refinado por zonas (circuito 5).'],
        ['inas_qd_wafer', 'InAs Quantum Dot Wafer', 'Oblea de puntos cuánticos de InAs', 'Self-assembled InAs dots on GaAs.', 'Puntos de InAs autoensamblados sobre GaAs.', 'Grown in the MBE reactor (circuit 3); it takes all the arsine.', 'Se crece en el reactor MBE (circuito 3); consume toda la arsina.'],
        ['micropillar_wafer', 'Micropillar Wafer', 'Oblea de micropilares', 'Dots inside etched micropillar cavities.', 'Puntos dentro de cavidades de micropilar grabadas.', 'Mounted into a QD source in an assembler.', 'Se monta en una fuente de QD en un ensamblador.'],
        ['waveguide_circuit', 'Waveguide Circuit', 'Circuito de guías de ondas', 'A SiN circuit bonded to lithium niobate.', 'Un circuito de SiN unido a niobato de litio.', 'Made in the photonic integration hall (circuit 1).', 'Se fabrica en la sala de integración fotónica (circuito 1).'],
        ['quantum_photonic_chip', 'Quantum Photonic Chip', 'Chip fotónico cuántico', 'Source, detectors, modulator and emitter on one circuit.', 'Fuente, detectores, modulador y emisor en un circuito.', 'Made in the photonic integration hall (circuit 2).', 'Se fabrica en la sala de integración fotónica (circuito 2).']
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
