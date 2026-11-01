// priority: 3800
// Gregtech Grindless - names and tooltips of UHV's transcurium line (startup_scripts/grindless/uhv/transcurium.js; package UHV-A1):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe (with the older rows of the package:
//                                                                 the pyroprocessing cell's HFIR drivers and the hot cell's mode 7)
//   material.gtceu.<n>                                            the new GT materials
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.high_flux_reactor', 'High Flux Reactor'],
        ['gtceu.high_flux_irradiation', 'High Flux Irradiation'],
        ['block.gtceu.transuranium_facility', 'Transuranium Facility'],
        ['gtceu.transuranium_processing', 'Transuranium Processing'],

        ['grindless.machine.high_flux_reactor.tooltip.0',
            '§7Irradiates targets in a flux trap to breed berkelium and californium.'],
        ['grindless.machine.high_flux_reactor.no_voiding',
            'Voiding is off: the spent drivers and the activated cladding must never be thrown away.'],

        ['grindless.machine.transuranium_facility.tooltip.0',
            '§7A shielded cave that makes berkelium-249 and californium-252.'],
        ['grindless.machine.transuranium_facility.no_voiding',
            'Voiding is off: the actinides, the waste and the solvent must never be thrown away.'],

        ['gtceu.recipe.grindless_high_flux_irradiation.transcurium_target',
            'Circuit 1: a curium-americium target irradiated by 6 uranium-233 drivers; the pool water is never used up'],
        ['gtceu.recipe.grindless_high_flux_irradiation.nickel_target',
            'Circuit 2: four nickel-62 targets to nickel-63 for betavoltaics'],
        ['gtceu.recipe.grindless_high_flux_irradiation.californium_source',
            'Circuit 3: californium-252 sealed as a neutron source'],
        ['gtceu.recipe.grindless_transuranium_processing.dissolve',
            'Circuit 1: the irradiated target dissolved in nitric acid; the fission products go apart'],
        ['gtceu.recipe.grindless_transuranium_processing.separate',
            'Circuit 2: HDEHP extraction and ion exchange to berkelium-249, californium-252 and curium; the solvent comes back less 1 %'],
        ['gtceu.recipe.grindless_transuranium_processing.decay_store',
            'Circuit 3: thorium-229 milked from aged uranium-233, which comes back whole; never overclocked'],
        ['gtceu.recipe.grindless_transuranium_processing.target',
            'Circuit 4: the heavy curium back into a new target with americium'],
        ['gtceu.recipe.grindless_transuranium_processing.evaporate',
            'Circuit 5: the fission product liquor evaporated to waste; the nitric acid comes back'],
        ['gtceu.recipe.grindless_transuranium_processing.incinerate',
            'Circuit 6: the spent HDEHP solvent burned to phosphoric acid'],
        ['gtceu.recipe.grindless_pyroprocessing.hfir_driver',
            'Circuit 5: spent HFIR driver elements back to uranium-233; the lithium and the salt are never used up'],
        ['gtceu.recipe.grindless_hot_cell.nickel_62_enrichment',
            'Mode 7: nickel-62 by carbonyl (Mond) centrifuge; the carbon monoxide comes back whole'],

        ['material.gtceu.ethylhexenal', '2-Ethylhexenal'],
        ['material.gtceu.ethylhexanol', '2-Ethylhexanol'],
        ['material.gtceu.phosphoryl_chloride', 'Phosphoryl Chloride'],
        ['material.gtceu.hdehp_extractant', 'HDEHP'],
        ['material.gtceu.transcurium_liquor', 'Transcurium Liquor'],
        ['material.gtceu.fission_product_liquor', 'Fission Product Liquor'],
        ['material.gtceu.spent_hdehp_solvent', 'Spent HDEHP Solvent']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
