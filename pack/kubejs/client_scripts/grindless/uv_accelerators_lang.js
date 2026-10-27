// priority: 3300
// Gregtech Grindless - names and tooltips of UV's accelerators (startup_scripts/grindless/uv/accelerators.js; package UV-A5):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<item>, tooltip.grindless.<item>.0/.1          the new items
//   material.gtceu.<n>                                            the new GT materials
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.synchrotron', 'Synchrotron', 'Sincrotrón'],
        ['gtceu.synchrotron', 'Synchrotron', 'Sincrotrón'],
        ['block.gtceu.muon_fusion_cell', 'Muon Fusion Cell', 'Celda de fusión muónica'],
        ['gtceu.muon_catalysed_fusion', 'Muon-Catalysed Fusion', 'Fusión catalizada por muones'],
        ['block.gtceu.antimatter_trap', 'Antimatter Trap', 'Trampa de antimateria'],
        ['gtceu.antimatter_storage', 'Antimatter Storage', 'Almacén de antimateria'],

        ['grindless.machine.synchrotron.tooltip.0',
            'A 23 x 23 ring: 16 superconducting dipoles bend the beam, two SRF cryomodules give it energy, two beamlines take it out. Its X-rays run KIT\'s LIGA process; its protons on a tungsten target make the only antiprotons in the pack.',
            'Un anillo de 23 x 23: 16 dipolos superconductores curvan el haz, dos criomódulos SRF le dan energía y dos líneas de haz lo sacan. Sus rayos X hacen el proceso LIGA del KIT; sus protones sobre un blanco de wolframio dan los únicos antiprotones del pack.'],
        ['grindless.machine.synchrotron.tooltip.1',
            'Circuit 1: a PMMA-coated wafer exposed under a gold X-ray mask (kept). 2: developed in the LIGA developer (never drained). 3: with a silicon nitride film, 4 photonic chips. 4: 16 protons into one antiproton cartridge; the tungsten target wears 2 % a run and comes out activated.',
            'Circuito 1: una oblea con PMMA expuesta bajo una máscara de rayos X de oro (se conserva). 2: revelada en el revelador LIGA (nunca se gasta). 3: con una película de nitruro de silicio, 4 chips fotónicos. 4: 16 protones a un cartucho de antiprotones; el blanco de wolframio se gasta un 2 % por ciclo y sale activado.'],
        ['grindless.machine.synchrotron.tooltip.2',
            'The activated target cools in a chemical bath back to tungsten and copper dust; most of the beam recombines to hydrogen. Parts go in the bottom layer: 1-4 energy hatches, 1-2 input buses, an input hatch, 1-2 output buses, an output hatch.',
            'El blanco activado se enfría en un baño químico y vuelve a polvo de wolframio y cobre; casi todo el haz se recombina en hidrógeno. Las piezas van en la capa inferior: 1-4 escotillas de energía, 1-2 buses de entrada, una escotilla de entrada, 1-2 buses de salida, una escotilla de salida.'],
        ['grindless.machine.synchrotron.no_voiding',
            'Voiding is off: the activated target must never be thrown away.',
            'El desecho está desactivado: el blanco activado nunca debe tirarse.'],

        ['grindless.machine.muon_fusion_cell.tooltip.0',
            'Muons from a pion target drop into liquid deuterium-tritium and catalyse fusion at 20 K (Alvarez 1956, LAMPF, J-PARC). It gives 786,432 EU/t. An extrapolation: real muon-catalysed fusion has never reached break-even; this cell assumes a far lower sticking fraction.',
            'Los muones de un blanco de piones caen en deuterio-tritio líquido y catalizan la fusión a 20 K (Alvarez 1956, LAMPF, J-PARC). Da 786 432 EU/t. Una extrapolación: la fusión catalizada por muones real nunca ha llegado al equilibrio; esta celda supone una fracción de adherencia mucho menor.'],
        ['grindless.machine.muon_fusion_cell.tooltip.1',
            '500 mB of liquid D-T burn in 1,200 ticks to helium. The lithium blanket (never used up) breeds back 60 % of the tritium; the other 40 % is make-up from the tritium removal facility. Helium goes to the superfluid helium plant.',
            '500 mB de D-T líquido arden en 1200 ticks a helio. La manta de litio (nunca se gasta) regenera el 60 % del tritio; el otro 40 % es reemplazo de la instalación de retirada de tritio. El helio va a la planta de helio superfluido.'],
        ['grindless.machine.muon_fusion_cell.tooltip.2',
            'Two SRF cryomodules in the back wall drive the pion beam. Parts go in the bottom layer: 1-2 energy output hatches, an input bus, an input hatch, 1-2 output hatches.',
            'Dos criomódulos SRF en la pared trasera impulsan el haz de piones. Las piezas van en la capa inferior: 1-2 escotillas de salida de energía, un bus de entrada, una escotilla de entrada, 1-2 escotillas de salida.'],
        ['grindless.machine.muon_fusion_cell.no_voiding',
            'Voiding is off: the bred tritium must never be thrown away.',
            'El desecho está desactivado: el tritio regenerado nunca debe tirarse.'],

        ['grindless.machine.antimatter_trap.tooltip.0',
            'A Penning trap like CERN\'s BASE: a superconducting solenoid and an electron cooler hold antiprotons in a vacuum no ground site can match. It works only in Earth orbit.',
            'Una trampa de Penning como BASE del CERN: un solenoide superconductor y un enfriador de electrones retienen antiprotones en un vacío que ningún sitio en tierra iguala. Solo funciona en órbita terrestre.'],
        ['grindless.machine.antimatter_trap.tooltip.1',
            'Circuit 1: four antiproton cartridges stacked into one charged trap (superfluid helium in, helium out; the cartridges come back empty). 2: the trap fires antiprotons into uranium and D-T to make 4 ICAN pellets, and comes back empty.',
            'Circuito 1: cuatro cartuchos de antiprotones se apilan en una trampa cargada (entra helio superfluido, sale helio; los cartuchos vuelven vacíos). 2: la trampa dispara antiprotones sobre uranio y D-T para hacer 4 pastillas ICAN, y vuelve vacía.'],
        ['grindless.machine.antimatter_trap.tooltip.2',
            'Antiprotons that touch matter annihilate to pions and gamma rays: nothing is left to store. Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, an input hatch, 1-2 output buses, an output hatch.',
            'Los antiprotones que tocan materia se aniquilan en piones y rayos gamma: no queda nada que guardar. Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, una escotilla de entrada, 1-2 buses de salida, una escotilla de salida.'],

        ['gtceu.recipe.grindless_synchrotron.expose',
            'Circuit 1: X-ray exposure through the gold mask; the mask is kept',
            'Circuito 1: exposición a rayos X a través de la máscara de oro; la máscara se conserva'],
        ['gtceu.recipe.grindless_synchrotron.develop',
            'Circuit 2: LIGA development; the developer is never drained',
            'Circuito 2: revelado LIGA; el revelador nunca se gasta'],
        ['gtceu.recipe.grindless_synchrotron.photonic',
            'Circuit 3: a patterned wafer and a silicon nitride film to 4 photonic chips',
            'Circuito 3: una oblea con patrón y una película de nitruro de silicio a 4 chips fotónicos'],
        ['gtceu.recipe.grindless_synchrotron.antiprotons',
            'Circuit 4: protons on the tungsten target; the activated target goes to the chemical bath, the beam\'s hydrogen to any hydrogen use',
            'Circuito 4: protones sobre el blanco de wolframio; el blanco activado va al baño químico, el hidrógeno del haz a cualquier uso del hidrógeno'],
        ['gtceu.recipe.grindless_muon_catalysed_fusion.deuterium_tritium',
            'Liquid D-T: 786,432 EU/t; 60 % of the tritium bred back, 40 % make-up (extrapolation)',
            'D-T líquido: 786 432 EU/t; el 60 % del tritio se regenera, el 40 % es reemplazo (extrapolación)'],
        ['gtceu.recipe.grindless_antimatter_storage.stack',
            'Circuit 1: four cartridges stacked into a charged trap; Earth orbit only',
            'Circuito 1: cuatro cartuchos apilados en una trampa cargada; solo en órbita terrestre'],
        ['gtceu.recipe.grindless_antimatter_storage.ican',
            'Circuit 2: antiproton-catalysed microfission pellets; the trap comes back empty; Earth orbit only',
            'Circuito 2: pastillas de microfisión catalizada por antiprotones; la trampa vuelve vacía; solo en órbita terrestre'],

        ['item.grindless.pmma_coated_wafer', 'PMMA-Coated Wafer', 'Oblea recubierta de PMMA'],
        ['tooltip.grindless.pmma_coated_wafer.0', 'A high-power wafer under a thick PMMA resist.', 'Una oblea de alta potencia bajo una resina de PMMA gruesa.'],
        ['tooltip.grindless.pmma_coated_wafer.1', 'Exposed by the synchrotron (circuit 1).', 'La expone el sincrotrón (circuito 1).'],
        ['item.grindless.x_ray_mask', 'X-Ray Mask', 'Máscara de rayos X'],
        ['tooltip.grindless.x_ray_mask.0', 'Gold absorbers on a silicon nitride membrane.', 'Absorbentes de oro sobre una membrana de nitruro de silicio.'],
        ['tooltip.grindless.x_ray_mask.1', 'Kept by every exposure in the synchrotron.', 'Se conserva en cada exposición del sincrotrón.'],
        ['item.grindless.exposed_wafer', 'Exposed Wafer', 'Oblea expuesta'],
        ['tooltip.grindless.exposed_wafer.0', 'The X-rays have cut the pattern deep into the PMMA.', 'Los rayos X han grabado el patrón hondo en el PMMA.'],
        ['tooltip.grindless.exposed_wafer.1', 'Developed by the synchrotron (circuit 2).', 'Lo revela el sincrotrón (circuito 2).'],
        ['item.grindless.patterned_wafer', 'LIGA-Patterned Wafer', 'Oblea con patrón LIGA'],
        ['tooltip.grindless.patterned_wafer.0', 'High-aspect-ratio structures no optical stepper can draw.', 'Estructuras de gran relación de aspecto que ningún paso óptico puede dibujar.'],
        ['tooltip.grindless.patterned_wafer.1', 'Cut into 4 UHPIC chips, or made into photonic chips.', 'Se corta en 4 chips UHPIC o se convierte en chips fotónicos.'],
        ['item.grindless.photonic_chip', 'Photonic Chip', 'Chip fotónico'],
        ['tooltip.grindless.photonic_chip.0', 'Silicon nitride waveguides on a LIGA-patterned die.', 'Guías de onda de nitruro de silicio sobre un dado con patrón LIGA.'],
        ['tooltip.grindless.photonic_chip.1', 'For the optical circuits of the eras ahead.', 'Para los circuitos ópticos de las eras siguientes.'],
        ['item.grindless.silicon_nitride_film', 'Silicon Nitride Film', 'Película de nitruro de silicio'],
        ['tooltip.grindless.silicon_nitride_film.0', 'A thin, stiff membrane grown from silicon and ammonia.', 'Una membrana fina y rígida crecida a partir de silicio y amoníaco.'],
        ['tooltip.grindless.silicon_nitride_film.1', 'The mask\'s membrane and the photonic chip\'s waveguides.', 'La membrana de la máscara y las guías de onda del chip fotónico.'],
        ['item.grindless.tungsten_target', 'Tungsten Target', 'Blanco de wolframio'],
        ['tooltip.grindless.tungsten_target.0', 'A water-cooled tungsten block brazed to copper.', 'Un bloque de wolframio refrigerado por agua soldado a cobre.'],
        ['tooltip.grindless.tungsten_target.1', 'Wears 2 % a run in the synchrotron (circuit 4).', 'Se gasta un 2 % por ciclo en el sincrotrón (circuito 4).'],
        ['item.grindless.activated_tungsten_target', 'Activated Tungsten Target', 'Blanco de wolframio activado'],
        ['tooltip.grindless.activated_tungsten_target.0', 'Made radioactive by the proton beam.', 'El haz de protones lo ha vuelto radiactivo.'],
        ['tooltip.grindless.activated_tungsten_target.1', 'Cools in a chemical bath back to tungsten and copper dust.', 'Se enfría en un baño químico y vuelve a polvo de wolframio y cobre.'],
        ['item.grindless.empty_antiproton_cartridge', 'Empty Antiproton Cartridge', 'Cartucho de antiprotones vacío'],
        ['tooltip.grindless.empty_antiproton_cartridge.0', 'A small field-held vacuum bottle.', 'Una botella de vacío pequeña sostenida por un campo.'],
        ['tooltip.grindless.empty_antiproton_cartridge.1', 'Filled by the synchrotron (circuit 4); comes back from the antimatter trap.', 'La llena el sincrotrón (circuito 4); vuelve de la trampa de antimateria.'],
        ['item.grindless.empty_antiproton_trap', 'Empty Antiproton Trap', 'Trampa de antiprotones vacía'],
        ['tooltip.grindless.empty_antiproton_trap.0', 'A portable Penning trap, cold and evacuated.', 'Una trampa de Penning portátil, fría y en vacío.'],
        ['tooltip.grindless.empty_antiproton_trap.1', 'Charged by the antimatter trap in Earth orbit.', 'La carga la trampa de antimateria en órbita terrestre.'],
        ['item.grindless.antiproton_trap', 'Charged Antiproton Trap', 'Trampa de antiprotones cargada'],
        ['tooltip.grindless.antiproton_trap.0', 'Four cartridges of antiprotons held in one trap.', 'Cuatro cartuchos de antiprotones retenidos en una trampa.'],
        ['tooltip.grindless.antiproton_trap.1', 'Spent on ICAN pellets; comes back empty.', 'Se gasta en pastillas ICAN; vuelve vacía.'],
        ['item.grindless.ican_pellet', 'ICAN Pellet', 'Pastilla ICAN'],
        ['tooltip.grindless.ican_pellet.0', 'Uranium and D-T sparked by antiprotons: Penn State\'s ICAN-II microfission.', 'Uranio y D-T encendidos por antiprotones: la microfisión ICAN-II de Penn State.'],
        ['tooltip.grindless.ican_pellet.1', 'For the propulsion and power of the eras ahead.', 'Para la propulsión y la energía de las eras siguientes.'],
        ['item.grindless.lithium_breeder_blanket', 'Lithium Breeder Blanket', 'Manta regeneradora de litio'],
        ['tooltip.grindless.lithium_breeder_blanket.0', 'Lithium and a beryllium multiplier in a tungstensteel frame.', 'Litio y un multiplicador de berilio en un marco de acero de wolframio.'],
        ['tooltip.grindless.lithium_breeder_blanket.1', 'Kept by the muon fusion cell: breeds back 60 % of its tritium.', 'Se conserva en la celda de fusión muónica: regenera el 60 % de su tritio.'],

        ['material.gtceu.pmma_resist', 'PMMA Resist', 'Resina de PMMA'],
        ['material.gtceu.liga_developer', 'LIGA Developer', 'Revelador LIGA']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
