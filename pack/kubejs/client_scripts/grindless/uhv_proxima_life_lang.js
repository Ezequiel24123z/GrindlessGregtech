// priority: 4000
// Gregtech Grindless - names and tooltips of UHV's Proxima life (startup_scripts/grindless/uhv/proxima_life.js; package UHV-B4):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0/.1                the new items
//   material.gtceu.<n>                                            the new GT materials
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.xenoflora_rover_bay', 'Xenoflora Rover Bay'],
        ['gtceu.xenoflora_rover', 'Xenoflora Survey'],
        ['block.gtceu.sample_receiving_facility', 'Sample Receiving Facility'],
        ['gtceu.sample_receiving', 'Sample Receiving'],
        ['block.gtceu.xenobotany_greenhouse', 'Xenobotany Greenhouse'],
        ['gtceu.xenobotany', 'Xenobotany'],
        ['block.gtceu.xenobiochem_plant', 'Xenobiochemistry Plant'],
        ['gtceu.xenobiochemistry', 'Xenobiochemistry'],
        ['block.gtceu.radiotrophic_vat', 'Radiotrophic Vat'],
        ['gtceu.radiotrophic', 'Radiotrophic Growth'],

        ['grindless.machine.xenoflora_rover_bay.tooltip.0',
            '§7Sends rovers out to bring back flora samples and a regolith survey.'],
        ['grindless.machine.xenoflora_rover_bay.tooltip.1', 'Works on Proxima b only.'],

        ['grindless.machine.sample_receiving_facility.tooltip.0',
            '§7A BSL-4 hall that opens, sterilises and reads alien samples.'],
        ['grindless.machine.sample_receiving_facility.tooltip.1', 'Works on Earth only.'],

        ['grindless.machine.xenobotany_greenhouse.tooltip.0',
            '§7A sealed greenhouse growing Proxima\'s red-dwarf life.'],
        ['grindless.machine.xenobotany_greenhouse.tooltip.1', 'Works on Proxima b only.'],

        ['grindless.machine.xenobiochem_plant.tooltip.0',
            '§7Makes radioprotectant, pigment and chitosan from Proxima\'s life.'],
        ['grindless.machine.xenobiochem_plant.tooltip.1', 'Works on Proxima b only.'],

        ['grindless.machine.radiotrophic_vat.tooltip.0',
            '§7Grows radiation-eating fungus into melanised biomass.'],
        ['grindless.machine.radiotrophic_vat.tooltip.1', 'Works on Proxima b only.'],

        ['gtceu.recipe.grindless_xenoflora_rover.survey', 'Survey run: flora samples and a regolith survey'],
        ['gtceu.recipe.grindless_sample_receiving.receive', 'Receive: sterilised extract and genome data'],
        ['gtceu.recipe.grindless_sample_receiving.isolate', 'Isolate: a characterised strain'],
        ['gtceu.recipe.grindless_sample_receiving.extremophile', 'Extremophiles: the organics of an ice core'],
        ['gtceu.recipe.grindless_xenobotany.biomass', 'Grow xeno biomass'],
        ['gtceu.recipe.grindless_xenobotany.mushrooms', 'Grow xeno mushrooms'],
        ['gtceu.recipe.grindless_xenobotany.pigment', 'Press far-red pigment'],
        ['gtceu.recipe.grindless_xenobiochemistry.radioprotectant', 'Radioprotectant'],
        ['gtceu.recipe.grindless_xenobiochemistry.infrared_pigment', 'Infrared pigment'],
        ['gtceu.recipe.grindless_xenobiochemistry.chitosan', 'Chitosan scaffold'],
        ['gtceu.recipe.grindless_xenobiochemistry.lysate', 'Clarified lysate'],
        ['gtceu.recipe.grindless_radiotrophic.melanised_biomass', 'Melanised biomass'],
        ['gtceu.recipe.grindless_biofoundry.far_red_gene_cassette', 'Far-red gene cassette'],
        ['gtceu.recipe.grindless_biofoundry.engineered_far_red_algae', 'Engineered far-red algae'],
        ['gtceu.recipe.grindless_biofoundry.cladosporium_culture', 'Cladosporium culture'],
        ['gtceu.recipe.grindless_biofoundry.chromobacterium_culture', 'Chromobacterium culture'],
        ['gtceu.recipe.grindless_biofoundry.sphingomonas_culture', 'Sphingomonas culture'],
        ['gtceu.recipe.grindless_biofoundry.sporosarcina_culture', 'Sporosarcina culture'],

        ['item.grindless.proxima_rover', 'Proxima Rover'],
        ['tooltip.grindless.proxima_rover.0', 'Americium heat, betavoltaic power and a germanium detector on six wheels.'],
        ['tooltip.grindless.proxima_rover.1', 'Driven from the Xenoflora Rover Bay on Proxima b.'],
        ['item.grindless.xeno_biomass', 'Xeno Biomass'],
        ['tooltip.grindless.xeno_biomass.0', 'Dark red, almost black: leaves that drink the far red.'],
        ['tooltip.grindless.xeno_biomass.1', 'Grown in the Xenobotany Greenhouse (circuit 1).'],
        ['item.grindless.xeno_mushroom', 'Xeno Mushroom'],
        ['tooltip.grindless.xeno_mushroom.0', 'Chitin walls thick enough to strip for chitosan.'],
        ['tooltip.grindless.xeno_mushroom.1', 'Grown in the Xenobotany Greenhouse (circuit 2).'],
        ['item.grindless.melanised_biomass', 'Melanised Biomass'],
        ['tooltip.grindless.melanised_biomass.0', 'A radiotrophic fungus, black with melanin.'],
        ['tooltip.grindless.melanised_biomass.1', 'Grown in the Radiotrophic Vat; extracted in a chemical reactor.'],
        ['item.grindless.sterilised_flora_extract', 'Sterilised Flora Extract'],
        ['tooltip.grindless.sterilised_flora_extract.0', 'What is left of a sample once it has been read: safe, and nothing more.'],
        ['tooltip.grindless.sterilised_flora_extract.1', 'Centrifuged into biomass and water.'],
        ['item.grindless.sterilised_ice_organics', 'Sterilised Ice Organics'],
        ['tooltip.grindless.sterilised_ice_organics.0', 'Tholins and extremophile remains from a Proxima ice core.'],
        ['tooltip.grindless.sterilised_ice_organics.1', 'Centrifuged into water and carbon dioxide, or hydrolysed into Titan nitriles by the tholin reformer in Saturn orbit.'],
        ['item.grindless.melanin_extract', 'Melanin Extract'],
        ['tooltip.grindless.melanin_extract.0', 'Fungal melanin, freed with caustic soda and acid.'],
        ['tooltip.grindless.melanin_extract.1', 'Bound to chitosan for the flare shield.'],
        ['item.grindless.melanin_chitosan_composite', 'Melanin-Chitosan Composite'],
        ['tooltip.grindless.melanin_chitosan_composite.0', 'A light radiation shield: melanin held in a chitosan film.'],
        ['tooltip.grindless.melanin_chitosan_composite.1', 'Pressed onto naquadah alloy as flare shield panels.'],
        ['item.grindless.flare_shield_panel', 'Flare Shield Panel'],
        ['tooltip.grindless.flare_shield_panel.0', 'What keeps a base on Proxima b alive through a superflare.'],
        ['tooltip.grindless.flare_shield_panel.1', 'Assembled from the composite and naquadah alloy plates.'],
        ['item.grindless.far_red_gene_cassette', 'Far-Red Gene Cassette'],
        ['tooltip.grindless.far_red_gene_cassette.0', 'The chlorophyll f synthase, read from the Proxima genome.'],
        ['tooltip.grindless.far_red_gene_cassette.1', 'Written in the Biofoundry (circuit 11).'],
        ['item.grindless.engineered_far_red_algae', 'Engineered Far-Red Algae'],
        ['tooltip.grindless.engineered_far_red_algae.0', 'Earth algae that photosynthesise under a red dwarf.'],
        ['tooltip.grindless.engineered_far_red_algae.1', 'Kept in the algae bioreactor on Proxima b (circuit 3).'],
        ['item.grindless.cladosporium_culture', 'Cladosporium Culture'],
        ['tooltip.grindless.cladosporium_culture.0', 'Cladosporium sphaerospermum: it grows towards radiation.'],
        ['tooltip.grindless.cladosporium_culture.1', 'Kept in the Radiotrophic Vat.'],
        ['item.grindless.chromobacterium_culture', 'Chromobacterium Culture'],
        ['tooltip.grindless.chromobacterium_culture.0', 'Chromobacterium violaceum: it dissolves gold with cyanide it makes itself.'],
        ['tooltip.grindless.chromobacterium_culture.1', 'Grown in the Biofoundry (circuit 14) for biomining.'],
        ['item.grindless.sphingomonas_culture', 'Sphingomonas Culture'],
        ['tooltip.grindless.sphingomonas_culture.0', 'Sphingomonas desiccabilis: it leached rare earths from basalt on the ISS.'],
        ['tooltip.grindless.sphingomonas_culture.1', 'Grown in the Biofoundry (circuit 15) for biomining.'],
        ['item.grindless.sporosarcina_culture', 'Sporosarcina Culture'],
        ['tooltip.grindless.sporosarcina_culture.0', 'Sporosarcina pasteurii: it turns urea and calcium into stone.'],
        ['tooltip.grindless.sporosarcina_culture.1', 'Grown in the Biofoundry (circuit 16) for biomining.'],

        ['material.gtceu.far_red_pigment', 'Far-Red Pigment'],
        ['material.gtceu.clarified_xeno_lysate', 'Clarified Xeno Lysate']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
