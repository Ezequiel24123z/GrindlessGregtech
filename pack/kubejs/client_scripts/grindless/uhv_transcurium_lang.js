// priority: 3800
// Gregtech Grindless - names and tooltips of UHV's transcurium line (startup_scripts/grindless/uhv/transcurium.js; package UHV-A1):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe (with the older rows of the package:
//                                                                 the pyroprocessing cell's HFIR drivers and the hot cell's mode 7)
//   material.gtceu.<n>                                            the new GT materials
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.high_flux_reactor', 'High Flux Reactor', 'Reactor de alto flujo'],
        ['gtceu.high_flux_irradiation', 'High Flux Irradiation', 'Irradiación de alto flujo'],
        ['block.gtceu.transuranium_facility', 'Transuranium Facility', 'Instalación de transuránidos'],
        ['gtceu.transuranium_processing', 'Transuranium Processing', 'Procesado de transuránidos'],

        ['grindless.machine.high_flux_reactor.tooltip.0',
            '§7Irradiates targets in a flux trap to breed berkelium and californium.',
            '§7Irradia blancos en una trampa de flujo para criar berkelio y californio.'],
        ['grindless.machine.high_flux_reactor.no_voiding',
            'Voiding is off: the spent drivers and the activated cladding must never be thrown away.',
            'El desecho está desactivado: los impulsores gastados y el revestimiento activado nunca deben tirarse.'],

        ['grindless.machine.transuranium_facility.tooltip.0',
            '§7A shielded cave that makes berkelium-249 and californium-252.',
            '§7Una cueva blindada que fabrica berkelio-249 y californio-252.'],
        ['grindless.machine.transuranium_facility.no_voiding',
            'Voiding is off: the actinides, the waste and the solvent must never be thrown away.',
            'El desecho está desactivado: los actínidos, el residuo y el disolvente nunca deben tirarse.'],

        ['gtceu.recipe.grindless_high_flux_irradiation.transcurium_target',
            'Circuit 1: a curium-americium target irradiated by 6 uranium-233 drivers; the pool water is never used up',
            'Circuito 1: un blanco de curio y americio irradiado por 6 impulsores de uranio-233; el agua de la piscina nunca se gasta'],
        ['gtceu.recipe.grindless_high_flux_irradiation.nickel_target',
            'Circuit 2: four nickel-62 targets to nickel-63 for betavoltaics',
            'Circuito 2: cuatro blancos de níquel-62 a níquel-63 para betavoltaicas'],
        ['gtceu.recipe.grindless_high_flux_irradiation.californium_source',
            'Circuit 3: californium-252 sealed as a neutron source',
            'Circuito 3: californio-252 sellado como fuente de neutrones'],
        ['gtceu.recipe.grindless_transuranium_processing.dissolve',
            'Circuit 1: the irradiated target dissolved in nitric acid; the fission products go apart',
            'Circuito 1: el blanco irradiado se disuelve en ácido nítrico; los productos de fisión se apartan'],
        ['gtceu.recipe.grindless_transuranium_processing.separate',
            'Circuit 2: HDEHP extraction and ion exchange to berkelium-249, californium-252 and curium; the solvent comes back less 1 %',
            'Circuito 2: extracción con HDEHP e intercambio iónico a berkelio-249, californio-252 y curio; el disolvente vuelve menos un 1 %'],
        ['gtceu.recipe.grindless_transuranium_processing.decay_store',
            'Circuit 3: thorium-229 milked from aged uranium-233, which comes back whole; never overclocked',
            'Circuito 3: torio-229 ordeñado del uranio-233 envejecido, que vuelve entero; nunca con overclock'],
        ['gtceu.recipe.grindless_transuranium_processing.target',
            'Circuit 4: the heavy curium back into a new target with americium',
            'Circuito 4: el curio pesado vuelve a un blanco nuevo con americio'],
        ['gtceu.recipe.grindless_transuranium_processing.evaporate',
            'Circuit 5: the fission product liquor evaporated to waste; the nitric acid comes back',
            'Circuito 5: el licor de productos de fisión se evapora a residuo; el ácido nítrico vuelve'],
        ['gtceu.recipe.grindless_transuranium_processing.incinerate',
            'Circuit 6: the spent HDEHP solvent burned to phosphoric acid',
            'Circuito 6: el disolvente de HDEHP gastado se quema a ácido fosfórico'],
        ['gtceu.recipe.grindless_pyroprocessing.hfir_driver',
            'Circuit 5: spent HFIR driver elements back to uranium-233; the lithium and the salt are never used up',
            'Circuito 5: los elementos impulsores gastados del HFIR vuelven a uranio-233; el litio y la sal nunca se gastan'],
        ['gtceu.recipe.grindless_hot_cell.nickel_62_enrichment',
            'Mode 7: nickel-62 by carbonyl (Mond) centrifuge; the carbon monoxide comes back whole',
            'Modo 7: níquel-62 por centrifugado de carbonilo (Mond); el monóxido de carbono vuelve entero'],

        ['material.gtceu.ethylhexenal', '2-Ethylhexenal', '2-Etilhexenal'],
        ['material.gtceu.ethylhexanol', '2-Ethylhexanol', '2-Etilhexanol'],
        ['material.gtceu.phosphoryl_chloride', 'Phosphoryl Chloride', 'Cloruro de fosforilo'],
        ['material.gtceu.hdehp_extractant', 'HDEHP', 'HDEHP'],
        ['material.gtceu.transcurium_liquor', 'Transcurium Liquor', 'Licor de transcurio'],
        ['material.gtceu.fission_product_liquor', 'Fission Product Liquor', 'Licor de productos de fisión'],
        ['material.gtceu.spent_hdehp_solvent', 'Spent HDEHP Solvent', 'Disolvente de HDEHP gastado']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
