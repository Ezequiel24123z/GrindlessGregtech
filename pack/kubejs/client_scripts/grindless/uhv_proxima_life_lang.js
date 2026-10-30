// priority: 4000
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
            '§7Sends rovers out to bring back flora samples and a regolith survey.',
            '§7Envía rovers a traer muestras de flora y un estudio del regolito.'],
        ['grindless.machine.xenoflora_rover_bay.tooltip.1', 'Works on Proxima b only.', 'Solo funciona en Próxima b.'],

        ['grindless.machine.sample_receiving_facility.tooltip.0',
            '§7A BSL-4 hall that opens, sterilises and reads alien samples.',
            '§7Una sala BSL-4 que abre, esteriliza y analiza muestras alienígenas.'],
        ['grindless.machine.sample_receiving_facility.tooltip.1', 'Works on Earth only.', 'Solo funciona en la Tierra.'],

        ['grindless.machine.xenobotany_greenhouse.tooltip.0',
            '§7A sealed greenhouse growing Proxima\'s red-dwarf life.',
            '§7Un invernadero sellado que cultiva la vida de Próxima bajo una enana roja.'],
        ['grindless.machine.xenobotany_greenhouse.tooltip.1', 'Works on Proxima b only.', 'Solo funciona en Próxima b.'],

        ['grindless.machine.xenobiochem_plant.tooltip.0',
            '§7Makes radioprotectant, pigment and chitosan from Proxima\'s life.',
            '§7Fabrica radioprotector, pigmento y quitosano de la vida de Próxima.'],
        ['grindless.machine.xenobiochem_plant.tooltip.1', 'Works on Proxima b only.', 'Solo funciona en Próxima b.'],

        ['grindless.machine.radiotrophic_vat.tooltip.0',
            '§7Grows radiation-eating fungus into melanised biomass.',
            '§7Cultiva hongos que se alimentan de radiación para obtener biomasa melanizada.'],
        ['grindless.machine.radiotrophic_vat.tooltip.1', 'Works on Proxima b only.', 'Solo funciona en Próxima b.'],

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
