// Gregtech Grindless - names and tooltips of RX J1856.5-3754's crust lift, neutron drip separator, neutronium cage, r-process decompressor and
// decay heat vault (startup_scripts/grindless/uiv/rx_j1856.js; package UIV-B2):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe, and of each row the package appends to an older table
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//   material.gtceu.<n>                                 the package's own fluids
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.crust_lift', 'Crust Lift', 'Elevador de corteza'],
        ['block.gtceu.neutron_drip_separator', 'Neutron Drip Separator', 'Separador de goteo de neutrones'],
        ['block.gtceu.neutronium_cage', 'Neutronium Cage', 'Jaula de neutronio'],
        ['block.gtceu.r_process_decompressor', 'R-Process Decompressor', 'Descompresor del proceso r'],
        ['block.gtceu.decay_heat_vault', 'Decay Heat Vault', 'Cámara de calor de desintegración'],
        ['gtceu.crust_lifting', 'Crust Lifting', 'Elevación de corteza'],
        ['gtceu.neutron_drip_separation', 'Neutron Drip Separation', 'Separación de goteo de neutrones'],
        ['gtceu.neutronium_caging', 'Neutronium Caging', 'Enjaulado de neutronio'],
        ['gtceu.r_process_decompression', 'R-Process Decompression', 'Descompresión del proceso r'],
        ['gtceu.decay_heat', 'Decay Heat', 'Calor de desintegración'],

        ['grindless.machine.crust_lift.tooltip.0', 'Lifts neutron-star crust up a tether and a polar-cap electrode.', 'Eleva la corteza de la estrella de neutrones por un cable y un electrodo polar.'],
        ['grindless.machine.crust_lift.tooltip.1', 'The electrode stays; one tether in ten wears out.', 'El electrodo se queda; uno de cada diez cables se desgasta.'],
        ['grindless.machine.crust_lift.tooltip.2', 'Works only at RX J1856.5-3754.', 'Solo funciona en RX J1856.5-3754.'],
        ['grindless.machine.neutron_drip_separator.tooltip.0', 'Splits the crust at the neutron drip line behind a nickel-58 supermirror guide.', 'Divide la corteza en la línea de goteo de neutrones tras una guía de supervespejos de níquel-58.'],
        ['grindless.machine.neutron_drip_separator.tooltip.1', 'The drip neutrons stay a fluid; the outer-crust ions go to the decay heat vault.', 'Los neutrones de goteo siguen siendo un fluido; los iones de la corteza externa van a la cámara de calor.'],
        ['grindless.machine.neutron_drip_separator.tooltip.2', 'Works only at RX J1856.5-3754.', 'Solo funciona en RX J1856.5-3754.'],
        ['grindless.machine.neutronium_cage.tooltip.0', 'Cools drip neutrons in superfluid helium and cages them in a nickel-58 cage part.', 'Enfría neutrones de goteo en helio superfluido y los enjaula en una pieza de jaula de níquel-58.'],
        ['grindless.machine.neutronium_cage.tooltip.1', 'Neutrons that leak out decay to protium. Needs metallic-hydrogen coils.', 'Los neutrones que escapan decaen a protio. Necesita bobinas de hidrógeno metálico.'],
        ['grindless.machine.neutronium_cage.tooltip.2', 'Works only at RX J1856.5-3754.', 'Solo funciona en RX J1856.5-3754.'],
        ['grindless.machine.r_process_decompressor.tooltip.0', 'Lets crust nuclei swell in a flood of neutrons: the r-process.', 'Deja que los núcleos de la corteza se hinchen en un diluvio de neutrones: el proceso r.'],
        ['grindless.machine.r_process_decompressor.tooltip.1', 'Also flashes a uranium-238 target into einsteinium and fermium debris.', 'También fulmina un blanco de uranio-238 y lo convierte en restos de einstenio y fermio.'],
        ['grindless.machine.r_process_decompressor.tooltip.2', 'Works only at RX J1856.5-3754.', 'Solo funciona en RX J1856.5-3754.'],
        ['grindless.machine.decay_heat_vault.tooltip.0', 'Holds a sealed kilonova capsule while its heat decays into electricity.', 'Guarda una cápsula de kilonova sellada mientras su calor se desintegra en electricidad.'],
        ['grindless.machine.decay_heat_vault.tooltip.1', 'One run at a time, sent out through its own UIV dynamo hatch only.', 'Una sola ejecución a la vez, enviada solo por su propia cámara de dinamo UIV.'],
        ['grindless.machine.decay_heat_vault.tooltip.2', 'Works only at RX J1856.5-3754.', 'Solo funciona en RX J1856.5-3754.'],

        ['emi.grindless.info.uiv_rx_j1856_crust.0',
            'The crust lift pulls neutron-star crust up a tether. The polar-cap electrode stays in the machine; one tether in ten wears out and goes back to the elevator as scrap.',
            'El elevador de corteza sube corteza de la estrella de neutrones por un cable. El electrodo polar se queda en la máquina; uno de cada diez cables se desgasta y vuelve al elevador como chatarra.'],
        ['emi.grindless.info.uiv_rx_j1856_pellet.0',
            'A neutronium pellet is neutron superfluid caged in a nickel-58 cage part. It is not GregTech\'s neutronium.',
            'Un gránulo de neutronio es superfluido de neutrones enjaulado en una pieza de jaula de níquel-58. No es el neutronio de GregTech.'],
        ['emi.grindless.info.uiv_rx_j1856_capsule.0',
            'The kilonova capsule burns in the decay heat vault for 12,000 ticks; the aged capsule is opened for its ash.',
            'La cápsula de kilonova arde en la cámara de calor durante 12 000 ticks; la cápsula envejecida se abre para sacar sus cenizas.'],
        ['emi.grindless.info.uiv_rx_j1856_target.0',
            'A uranium-238 target flashed with neutrons gives einsteinium and fermium debris. Einsteinium-254 makes the element 119 target.',
            'Un blanco de uranio-238 fulminado con neutrones deja restos de einstenio y fermio. El einstenio-254 forma el blanco del elemento 119.'],

        ['gtceu.recipe.grindless_crust_lifting.crust_lift', 'Circuit 1: crust lifted up the tether; the tether wears, the electrode is kept', 'Circuito 1: corteza elevada por el cable; el cable se desgasta, el electrodo se conserva'],
        ['gtceu.recipe.grindless_neutron_drip_separation.inner_crust', 'Circuit 1: crust split into inner-crust matter and outer-crust ions', 'Circuito 1: corteza dividida en materia de corteza interna e iones de corteza externa'],
        ['gtceu.recipe.grindless_neutron_drip_separation.drip_neutrons', 'Circuit 2: inner-crust matter boiled into drip neutrons and crust nuclei', 'Circuito 2: materia de corteza interna hervida en neutrones de goteo y núcleos de corteza'],
        ['gtceu.recipe.grindless_neutronium_caging.neutron_superfluid', 'Circuit 1: drip neutrons cooled into a neutron superfluid; the leak decays to protium', 'Circuito 1: neutrones de goteo enfriados en un superfluido de neutrones; la fuga decae a protio'],
        ['gtceu.recipe.grindless_neutronium_caging.neutronium_pellet', 'Circuit 2: neutron superfluid caged in a cage part as a neutronium pellet', 'Circuito 2: superfluido de neutrones enjaulado en una pieza de jaula como gránulo de neutronio'],
        ['gtceu.recipe.grindless_r_process_decompression.hot_r_process_mix', 'Circuit 1: crust nuclei swollen by drip neutrons into a hot r-process mix', 'Circuito 1: núcleos de corteza hinchados por neutrones de goteo en una mezcla caliente del proceso r'],
        ['gtceu.recipe.grindless_r_process_decompression.flash_target', 'Circuit 2: a uranium-238 target flashed with drip neutrons', 'Circuito 2: un blanco de uranio-238 fulminado con neutrones de goteo'],
        ['gtceu.recipe.grindless_decay_heat.kilonova_decay', 'Circuit 1: a sealed kilonova capsule ages for 12,000 ticks and gives 33,554,432 EU/t', 'Circuito 1: una cápsula de kilonova sellada envejece 12 000 ticks y da 33 554 432 EU/t'],
        ['gtceu.recipe.grindless_decay_heat.capsule_opening', 'Circuit 2: the aged capsule opened into r-process ash and helium-4', 'Circuito 2: la cápsula envejecida abierta en cenizas del proceso r y helio-4'],
        ['gtceu.recipe.grindless_decay_heat.fragment_burn', 'Circuit 3: fission fragments burn down to iron and helium-4', 'Circuito 3: los fragmentos de fisión se consumen hasta hierro y helio-4'],
        ['gtceu.recipe.grindless_decay_heat.ion_burn', 'Circuit 4: outer-crust ions burn down to iron and helium-4', 'Circuito 4: los iones de corteza externa se consumen hasta hierro y helio-4'],

        ['gtceu.recipe.grindless_hot_cell.es_fm_debris', 'Mode 13: the flashed target dissolved in nitric acid into an einsteinium and fermium liquor', 'Modo 13: el blanco fulminado disuelto en ácido nítrico en un licor de einstenio y fermio'],
        ['gtceu.recipe.grindless_hot_cell.ash_actinide_cut', 'Mode 14: the actinide cut of the r-process ash', 'Modo 14: el corte de actínidos de las cenizas del proceso r'],
        ['gtceu.recipe.grindless_transuranium_processing.es254_extraction', 'Circuit 9: einsteinium-254 pulled out of the actinide liquor with HDEHP; the solvent is kept', 'Circuito 9: einstenio-254 extraído del licor de actínidos con HDEHP; el disolvente se conserva'],
        ['gtceu.recipe.grindless_heavy_ion_irradiation.es254_bombard', 'Circuit 8: a calcium-48 beam on the einsteinium-254 target; the wheel comes back activated', 'Circuito 8: un haz de calcio-48 sobre el blanco de einstenio-254; la rueda vuelve activada'],
        ['gtceu.recipe.grindless_recoil_separation.element_119_recoil', 'Circuit 7: element 119 caught from its recoil gas on the membrane', 'Circuito 7: el elemento 119 recogido de su gas de retroceso en la membrana'],
        ['gtceu.recipe.grindless_superheavy_chemistry.census_ii', 'Circuit 3: elements 119 and 120 counted in a sealed capsule', 'Circuito 3: los elementos 119 y 120 contados en una cápsula sellada']
    ]

    // [name, en, es, tooltip 0 en, tooltip 0 es, tooltip 1 en, tooltip 1 es]
    var ITEMS = [
        ['neutron_star_crust', 'Neutron-Star Crust', 'Corteza de estrella de neutrones', 'Lifted from RX J1856.5-3754.', 'Elevada desde RX J1856.5-3754.', 'Split at the neutron drip line.', 'Se divide en la línea de goteo de neutrones.'],
        ['inner_crust_matter', 'Inner-Crust Matter', 'Materia de corteza interna', 'Nuclei swimming in free neutrons.', 'Núcleos nadando en neutrones libres.', 'Boils its neutrons off.', 'Se le hierven los neutrones.'],
        ['crust_nuclei', 'Crust Nuclei', 'Núcleos de corteza', 'Neutron-rich nuclei left when the drip neutrons are gone.', 'Núcleos ricos en neutrones que quedan sin los neutrones de goteo.', 'Swell in the r-process decompressor.', 'Se hinchan en el descompresor del proceso r.'],
        ['outer_crust_ions', 'Outer-Crust Ions', 'Iones de corteza externa', 'A lattice of iron-group ions.', 'Una red de iones del grupo del hierro.', 'Burned in the decay heat vault.', 'Se consumen en la cámara de calor de desintegración.'],
        ['fission_fragments', 'Fission Fragments', 'Fragmentos de fisión', 'Medium-mass nuclei, still hot.', 'Núcleos de masa media, aún calientes.', 'Burned in the decay heat vault.', 'Se consumen en la cámara de calor de desintegración.'],
        ['bn_coated_cnt_yarn', 'BN-Coated Nanotube Yarn', 'Hilo de nanotubos con BN', 'Carbon nanotube yarn under a boron nitride coat.', 'Hilo de nanotubos de carbono bajo una capa de nitruro de boro.', 'Laminated with metallic hydrogen.', 'Se lamina con hidrógeno metálico.'],
        ['mh_laminated_yarn', 'Metallic-Hydrogen Laminated Yarn', 'Hilo laminado de hidrógeno metálico', 'Coated yarn wrapped in metallic-hydrogen foil.', 'Hilo recubierto envuelto en lámina de hidrógeno metálico.', 'Four braid into a tether strand.', 'Cuatro se trenzan en una hebra de cable.'],
        ['braided_mh_tether', 'Braided Metallic-Hydrogen Strand', 'Hebra trenzada de hidrógeno metálico', 'Four laminated yarns braided together.', 'Cuatro hilos laminados trenzados.', 'Made into a tether at the elevator works.', 'Se convierte en cable en el taller del ascensor.'],
        ['mh_tether', 'Metallic-Hydrogen Tether', 'Cable de hidrógeno metálico', 'Light, strong and cold enough to hang from a star.', 'Ligero, fuerte y lo bastante frío para colgar de una estrella.', 'Makes the polar-cap electrode and the crust lift tether.', 'Forma el electrodo polar y el cable del elevador de corteza.'],
        ['polar_cap_electrode', 'Polar-Cap Electrode', 'Electrodo polar', 'Grounds the tether in the neutron star\'s magnetic pole.', 'Conecta a tierra el cable en el polo magnético de la estrella de neutrones.', 'Never used up by the crust lift.', 'El elevador de corteza nunca lo gasta.'],
        ['crust_lift_tether', 'Crust Lift Tether', 'Cable del elevador de corteza', 'The cable the crust is lifted on.', 'El cable por el que sube la corteza.', 'Wears out slowly.', 'Se desgasta despacio.'],
        ['worn_crust_lift_tether', 'Worn Crust Lift Tether', 'Cable desgastado del elevador de corteza', 'A tether worn thin by the lift.', 'Un cable desgastado por el elevador.', 'Goes back to the elevator works as scrap.', 'Vuelve al taller del ascensor como chatarra.'],
        ['kilonova_capsule', 'Kilonova Capsule', 'Cápsula de kilonova', 'A sealed capsule of hot r-process matter.', 'Una cápsula sellada de materia caliente del proceso r.', 'Ages in the decay heat vault.', 'Envejece en la cámara de calor de desintegración.'],
        ['aged_kilonova_capsule', 'Aged Kilonova Capsule', 'Cápsula de kilonova envejecida', 'A capsule whose heat has gone to the grid.', 'Una cápsula cuyo calor ya fue a la red.', 'Opened for its ash.', 'Se abre para sacar las cenizas.'],
        ['r_process_ash', 'R-Process Ash', 'Cenizas del proceso r', 'Platinum metals, lanthanides and actinides in one dust.', 'Metales del platino, lantánidos y actínidos en un solo polvo.', 'Cut in the platinum plant, the europium reductor and the hot cell.', 'Se corta en la planta de platino, el reductor de europio y la celda caliente.'],
        ['flashed_target', 'Flashed Uranium Target', 'Blanco de uranio fulminado', 'A uranium-238 target hit by a neutron flood.', 'Un blanco de uranio-238 golpeado por un diluvio de neutrones.', 'Dissolved in the hot cell.', 'Se disuelve en la celda caliente.'],
        ['es254_target', 'Einsteinium-254 Target Wheel', 'Rueda blanco de einstenio-254', 'A target wheel loaded with einsteinium-254.', 'Una rueda blanco cargada con einstenio-254.', 'Bombarded with calcium-48 it gives element 119.', 'Bombardeada con calcio-48 da el elemento 119.']
    ]

    var MATERIALS = [
        ['drip_neutrons', 'Drip Neutrons', 'Neutrones de goteo'],
        ['neutron_superfluid', 'Neutron Superfluid', 'Superfluido de neutrones'],
        ['hot_r_process_mix', 'Hot R-Process Mix', 'Mezcla caliente del proceso r'],
        ['element_119_recoil_gas', 'Element 119 Recoil Gas', 'Gas de retroceso del elemento 119'],
        ['es_fm_liquor', 'Einsteinium-Fermium Liquor', 'Licor de einstenio y fermio'],
        ['es_254_solution', 'Einsteinium-254 Solution', 'Solución de einstenio-254']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1], i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[3], i[4]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[5], i[6]])
    })
    MATERIALS.forEach(function (m) {
        ENTRIES.push(['material.gtceu.' + m[0], m[1], m[2]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
