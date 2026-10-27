// Gregtech Grindless - names and tooltips of UHV's Proxima life (startup_scripts/grindless/uhv/proxima_life.js; package UHV-B4):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0/.1                the new items
//   material.gtceu.<n>                                            the new GT materials
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.xenoflora_rover_bay', 'Xenoflora Rover Bay', 'Hangar de rovers de xenoflora'],
        ['gtceu.xenoflora_rover', 'Xenoflora Survey', 'Prospección de xenoflora'],
        ['block.gtceu.sample_receiving_facility', 'Sample Receiving Facility', 'Instalación de recepción de muestras'],
        ['gtceu.sample_receiving', 'Sample Receiving', 'Recepción de muestras'],
        ['block.gtceu.xenobotany_greenhouse', 'Xenobotany Greenhouse', 'Invernadero de xenobotánica'],
        ['gtceu.xenobotany', 'Xenobotany', 'Xenobotánica'],
        ['block.gtceu.xenobiochem_plant', 'Xenobiochemistry Plant', 'Planta de xenobioquímica'],
        ['gtceu.xenobiochemistry', 'Xenobiochemistry', 'Xenobioquímica'],
        ['block.gtceu.radiotrophic_vat', 'Radiotrophic Vat', 'Cuba radiotrófica'],
        ['gtceu.radiotrophic', 'Radiotrophic Growth', 'Crecimiento radiotrófico'],

        ['grindless.machine.xenoflora_rover_bay.tooltip.0',
            'A hangar on Proxima b: rovers on an americium heat source and betavoltaic cells (the night side has no sun) drive out to the terminator and bring back flora samples and a regolith survey.',
            'Un hangar en Próxima b: rovers con una fuente de calor de americio y celdas betavoltaicas (la cara nocturna no tiene sol) salen al terminador y traen muestras de flora y una prospección del regolito.'],
        ['grindless.machine.xenoflora_rover_bay.tooltip.1',
            'Proxima b only. The approach data is kept; a rover wears out one run in eight and its americium source comes back as often. The only source of flora samples.',
            'Solo en Próxima b. Los datos de aproximación se conservan; un rover se desgasta una salida de cada ocho y su fuente de americio vuelve con la misma frecuencia. La única fuente de muestras de flora.'],
        ['grindless.machine.xenoflora_rover_bay.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses. The console is computer casing.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida. La consola es carcasa de ordenador.'],

        ['grindless.machine.sample_receiving_facility.tooltip.0',
            'The Mars Sample Return receiving facility, built for Proxima: a BSL-4 hall behind two airlocks, where an alien sample is opened, sterilised and read before anything leaves.',
            'La instalación de recepción del retorno de muestras de Marte, construida para Próxima: una sala BSL-4 tras dos esclusas, donde una muestra alienígena se abre, se esteriliza y se lee antes de que nada salga.'],
        ['grindless.machine.sample_receiving_facility.tooltip.1',
            'Earth only, and the only machine that takes the samples. Circuit 1: sterilised extract and genome data. 2: a characterised strain. 3: the organics of a Proxima ice core.',
            'Solo en la Tierra, y la única máquina que acepta las muestras. Circuito 1: extracto esterilizado y datos genómicos. 2: una cepa caracterizada. 3: los orgánicos de un testigo de hielo de Próxima.'],
        ['grindless.machine.sample_receiving_facility.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, an input hatch (hydrogen peroxide vapour), 1-2 output buses. The incinerator is heatproof casing.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, una escotilla de entrada (vapor de peróxido de hidrógeno), 1-2 buses de salida. El incinerador es carcasa termorresistente.'],

        ['grindless.machine.xenobotany_greenhouse.tooltip.0',
            'Sealed glass at the terminator: Proxima\'s life grows under a red dwarf, its pigments reaching into the far red. There is no air to breathe outside.',
            'Cristal sellado en el terminador: la vida de Próxima crece bajo una enana roja, con pigmentos que llegan al rojo lejano. Fuera no hay aire que respirar.'],
        ['grindless.machine.xenobotany_greenhouse.tooltip.1',
            'Proxima b only. Circuit 1: xeno biomass and oxygen. 2: xeno mushrooms. 3: far-red pigment pressed from the biomass. The strain is kept.',
            'Solo en Próxima b. Circuito 1: biomasa xeno y oxígeno. 2: setas xeno. 3: pigmento de rojo lejano prensado de la biomasa. La cepa se conserva.'],
        ['grindless.machine.xenobotany_greenhouse.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, an output bus, 1-2 output hatches. A soil bed and GT lamps inside.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 escotillas de entrada, un bus de salida, 1-2 escotillas de salida. Dentro, un lecho de tierra y lámparas de GT.'],

        ['grindless.machine.xenobiochem_plant.tooltip.0',
            'Where the life grows, its chemistry is done: a lysate clarified in ultrapure water, a Dsup-like radioprotectant, an infrared pigment and chitosan from the mushrooms.',
            'Donde crece la vida se hace su química: un lisado clarificado en agua ultrapura, un radioprotector tipo Dsup, un pigmento infrarrojo y quitosano de las setas.'],
        ['grindless.machine.xenobiochem_plant.tooltip.1',
            'Proxima b only. Circuit 1: radioprotectant. 2: infrared pigment. 3: chitosan scaffold (the salt water goes to the electrolyser). 4: clarified lysate.',
            'Solo en Próxima b. Circuito 1: radioprotector. 2: pigmento infrarrojo. 3: andamio de quitosano (el agua salada va al electrolizador). 4: lisado clarificado.'],
        ['grindless.machine.xenobiochem_plant.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output buses, 1-2 output hatches. Four PTFE columns round a clean reactor.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 escotillas de entrada, 1-2 buses de salida, 1-2 escotillas de salida. Cuatro columnas de PTFE alrededor de un reactor limpio.'],

        ['grindless.machine.radiotrophic_vat.tooltip.0',
            'Cladosporium sphaerospermum, the fungus that grew towards Chernobyl\'s reactor and shielded a sensor on the ISS, fed by the flares through a glass window.',
            'Cladosporium sphaerospermum, el hongo que creció hacia el reactor de Chernóbil y blindó un sensor en la ISS, alimentado por las fulguraciones a través de una ventana de cristal.'],
        ['grindless.machine.radiotrophic_vat.tooltip.1',
            'Proxima b only. The culture is kept; xeno biomass and water become melanised biomass, the shielding of line 15. The spent medium is biomass for the biorefinery.',
            'Solo en Próxima b. El cultivo se conserva; la biomasa xeno y el agua se vuelven biomasa melanizada, el blindaje de la línea 15. El medio gastado es biomasa para la biorrefinería.'],
        ['grindless.machine.radiotrophic_vat.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, an input bus, an input hatch, an output bus, an output hatch. A tungstensteel core.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, un bus de entrada, una escotilla de entrada, un bus de salida, una escotilla de salida. Un núcleo de acero de tungsteno.'],

        ['gtceu.recipe.grindless_xenoflora_rover.survey', 'Survey run: flora samples and a regolith survey', 'Salida de prospección: muestras de flora y prospección del regolito'],
        ['gtceu.recipe.grindless_sample_receiving.receive', 'Receive: sterilised extract and genome data', 'Recepción: extracto esterilizado y datos genómicos'],
        ['gtceu.recipe.grindless_sample_receiving.isolate', 'Isolate: a characterised strain', 'Aislamiento: una cepa caracterizada'],
        ['gtceu.recipe.grindless_sample_receiving.extremophile', 'Extremophiles: the organics of an ice core', 'Extremófilos: los orgánicos de un testigo de hielo'],
        ['gtceu.recipe.grindless_xenobotany.biomass', 'Grow xeno biomass', 'Cultivo de biomasa xeno'],
        ['gtceu.recipe.grindless_xenobotany.mushrooms', 'Grow xeno mushrooms', 'Cultivo de setas xeno'],
        ['gtceu.recipe.grindless_xenobotany.pigment', 'Press far-red pigment', 'Prensado de pigmento de rojo lejano'],
        ['gtceu.recipe.grindless_xenobiochemistry.radioprotectant', 'Radioprotectant', 'Radioprotector'],
        ['gtceu.recipe.grindless_xenobiochemistry.infrared_pigment', 'Infrared pigment', 'Pigmento infrarrojo'],
        ['gtceu.recipe.grindless_xenobiochemistry.chitosan', 'Chitosan scaffold', 'Andamio de quitosano'],
        ['gtceu.recipe.grindless_xenobiochemistry.lysate', 'Clarified lysate', 'Lisado clarificado'],
        ['gtceu.recipe.grindless_radiotrophic.melanised_biomass', 'Melanised biomass', 'Biomasa melanizada'],
        ['gtceu.recipe.grindless_biofoundry.far_red_gene_cassette', 'Far-red gene cassette', 'Casete génico de rojo lejano'],
        ['gtceu.recipe.grindless_biofoundry.engineered_far_red_algae', 'Engineered far-red algae', 'Algas de rojo lejano modificadas'],
        ['gtceu.recipe.grindless_biofoundry.cladosporium_culture', 'Cladosporium culture', 'Cultivo de Cladosporium'],
        ['gtceu.recipe.grindless_biofoundry.chromobacterium_culture', 'Chromobacterium culture', 'Cultivo de Chromobacterium'],
        ['gtceu.recipe.grindless_biofoundry.sphingomonas_culture', 'Sphingomonas culture', 'Cultivo de Sphingomonas'],
        ['gtceu.recipe.grindless_biofoundry.sporosarcina_culture', 'Sporosarcina culture', 'Cultivo de Sporosarcina'],

        ['item.grindless.proxima_rover', 'Proxima Rover', 'Rover de Próxima'],
        ['tooltip.grindless.proxima_rover.0', 'Americium heat, betavoltaic power and a germanium detector on six wheels.', 'Calor de americio, energía betavoltaica y un detector de germanio sobre seis ruedas.'],
        ['tooltip.grindless.proxima_rover.1', 'Driven from the Xenoflora Rover Bay on Proxima b.', 'Se conduce desde el hangar de rovers de xenoflora en Próxima b.'],
        ['item.grindless.xeno_biomass', 'Xeno Biomass', 'Biomasa xeno'],
        ['tooltip.grindless.xeno_biomass.0', 'Dark red, almost black: leaves that drink the far red.', 'Rojo oscuro, casi negro: hojas que beben el rojo lejano.'],
        ['tooltip.grindless.xeno_biomass.1', 'Grown in the Xenobotany Greenhouse (circuit 1).', 'Se cultiva en el invernadero de xenobotánica (circuito 1).'],
        ['item.grindless.xeno_mushroom', 'Xeno Mushroom', 'Seta xeno'],
        ['tooltip.grindless.xeno_mushroom.0', 'Chitin walls thick enough to strip for chitosan.', 'Paredes de quitina lo bastante gruesas para extraer quitosano.'],
        ['tooltip.grindless.xeno_mushroom.1', 'Grown in the Xenobotany Greenhouse (circuit 2).', 'Se cultiva en el invernadero de xenobotánica (circuito 2).'],
        ['item.grindless.melanised_biomass', 'Melanised Biomass', 'Biomasa melanizada'],
        ['tooltip.grindless.melanised_biomass.0', 'A radiotrophic fungus, black with melanin.', 'Un hongo radiotrófico, negro de melanina.'],
        ['tooltip.grindless.melanised_biomass.1', 'Grown in the Radiotrophic Vat; extracted in a chemical reactor.', 'Se cultiva en la cuba radiotrófica; se extrae en un reactor químico.'],
        ['item.grindless.sterilised_flora_extract', 'Sterilised Flora Extract', 'Extracto de flora esterilizado'],
        ['tooltip.grindless.sterilised_flora_extract.0', 'What is left of a sample once it has been read: safe, and nothing more.', 'Lo que queda de una muestra una vez leída: seguro, y nada más.'],
        ['tooltip.grindless.sterilised_flora_extract.1', 'Centrifuged into biomass and water.', 'Se centrifuga en biomasa y agua.'],
        ['item.grindless.sterilised_ice_organics', 'Sterilised Ice Organics', 'Orgánicos de hielo esterilizados'],
        ['tooltip.grindless.sterilised_ice_organics.0', 'Tholins and extremophile remains from a Proxima ice core.', 'Tolinas y restos de extremófilos de un testigo de hielo de Próxima.'],
        ['tooltip.grindless.sterilised_ice_organics.1', 'Centrifuged into water and carbon dioxide, or hydrolysed into Titan nitriles by the tholin reformer in Saturn orbit.', 'Se centrifugan en agua y dióxido de carbono, o el reformador de tolinas los hidroliza en nitrilos de Titán en órbita de Saturno.'],
        ['item.grindless.melanin_extract', 'Melanin Extract', 'Extracto de melanina'],
        ['tooltip.grindless.melanin_extract.0', 'Fungal melanin, freed with caustic soda and acid.', 'Melanina fúngica, liberada con sosa cáustica y ácido.'],
        ['tooltip.grindless.melanin_extract.1', 'Bound to chitosan for the flare shield.', 'Se une al quitosano para el escudo contra fulguraciones.'],
        ['item.grindless.melanin_chitosan_composite', 'Melanin-Chitosan Composite', 'Compuesto de melanina y quitosano'],
        ['tooltip.grindless.melanin_chitosan_composite.0', 'A light radiation shield: melanin held in a chitosan film.', 'Un blindaje ligero contra la radiación: melanina retenida en una película de quitosano.'],
        ['tooltip.grindless.melanin_chitosan_composite.1', 'Pressed onto naquadah alloy as flare shield panels.', 'Se prensa sobre aleación de naquadah en paneles contra fulguraciones.'],
        ['item.grindless.flare_shield_panel', 'Flare Shield Panel', 'Panel contra fulguraciones'],
        ['tooltip.grindless.flare_shield_panel.0', 'What keeps a base on Proxima b alive through a superflare.', 'Lo que mantiene viva una base en Próxima b durante una superfulguración.'],
        ['tooltip.grindless.flare_shield_panel.1', 'Assembled from the composite and naquadah alloy plates.', 'Se ensambla con el compuesto y placas de aleación de naquadah.'],
        ['item.grindless.far_red_gene_cassette', 'Far-Red Gene Cassette', 'Casete genético de rojo lejano'],
        ['tooltip.grindless.far_red_gene_cassette.0', 'The chlorophyll f synthase, read from the Proxima genome.', 'La sintasa de clorofila f, leída del genoma de Próxima.'],
        ['tooltip.grindless.far_red_gene_cassette.1', 'Written in the Biofoundry (circuit 11).', 'Se escribe en la biofundición (circuito 11).'],
        ['item.grindless.engineered_far_red_algae', 'Engineered Far-Red Algae', 'Algas de rojo lejano modificadas'],
        ['tooltip.grindless.engineered_far_red_algae.0', 'Earth algae that photosynthesise under a red dwarf.', 'Algas terrestres que hacen la fotosíntesis bajo una enana roja.'],
        ['tooltip.grindless.engineered_far_red_algae.1', 'Kept in the algae bioreactor on Proxima b (circuit 3).', 'Se conservan en el biorreactor de algas en Próxima b (circuito 3).'],
        ['item.grindless.cladosporium_culture', 'Cladosporium Culture', 'Cultivo de Cladosporium'],
        ['tooltip.grindless.cladosporium_culture.0', 'Cladosporium sphaerospermum: it grows towards radiation.', 'Cladosporium sphaerospermum: crece hacia la radiación.'],
        ['tooltip.grindless.cladosporium_culture.1', 'Kept in the Radiotrophic Vat.', 'Se conserva en la cuba radiotrófica.'],
        ['item.grindless.chromobacterium_culture', 'Chromobacterium Culture', 'Cultivo de Chromobacterium'],
        ['tooltip.grindless.chromobacterium_culture.0', 'Chromobacterium violaceum: it dissolves gold with cyanide it makes itself.', 'Chromobacterium violaceum: disuelve oro con el cianuro que fabrica.'],
        ['tooltip.grindless.chromobacterium_culture.1', 'Grown in the Biofoundry (circuit 14) for biomining.', 'Se cultiva en la biofundición (circuito 14) para la biominería.'],
        ['item.grindless.sphingomonas_culture', 'Sphingomonas Culture', 'Cultivo de Sphingomonas'],
        ['tooltip.grindless.sphingomonas_culture.0', 'Sphingomonas desiccabilis: it leached rare earths from basalt on the ISS.', 'Sphingomonas desiccabilis: lixivió tierras raras del basalto en la ISS.'],
        ['tooltip.grindless.sphingomonas_culture.1', 'Grown in the Biofoundry (circuit 15) for biomining.', 'Se cultiva en la biofundición (circuito 15) para la biominería.'],
        ['item.grindless.sporosarcina_culture', 'Sporosarcina Culture', 'Cultivo de Sporosarcina'],
        ['tooltip.grindless.sporosarcina_culture.0', 'Sporosarcina pasteurii: it turns urea and calcium into stone.', 'Sporosarcina pasteurii: convierte la urea y el calcio en piedra.'],
        ['tooltip.grindless.sporosarcina_culture.1', 'Grown in the Biofoundry (circuit 16) for biomining.', 'Se cultiva en la biofundición (circuito 16) para la biominería.'],

        ['material.gtceu.far_red_pigment', 'Far-Red Pigment', 'Pigmento de rojo lejano'],
        ['material.gtceu.clarified_xeno_lysate', 'Clarified Xeno Lysate', 'Lisado xeno clarificado']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
