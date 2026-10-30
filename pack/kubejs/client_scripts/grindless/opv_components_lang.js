// Gregtech Grindless - names and tooltips of the OpV components' intermediates (startup_scripts/grindless/opv/components.js) and the EMI
// lines of the rows OpV-A1 adds to older machines:
//
//   grindless:<item>                    item.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   grindless:<material> (GT material)  material.grindless.<n>
//   gtceu.recipe.<dataKey>.<row>        the EMI line of each new row of a custom machine
//
// The gtceu:opv_* component names are GTM's own. Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts.
// Names go in en_us and es_es.
(function () {
    // id, en name, es name, en tip 0, es tip 0, en tip 1, es tip 1
    var ITEMS = [
        ['chain_sic_preform', 'Chain SiC Preform', 'Preforma de SiC y cadena', 'SiC fibre wound around chain strand wire, not yet densified.', 'Fibra de SiC devanada sobre alambre de hebra de cadena, a\u00fan sin densificar.', 'Densified in the CVI furnace.', 'Se densifica en el horno CVI.'],
        ['densified_chain_preform', 'Densified Chain Preform', 'Preforma de cadena densificada', 'The chain preform with its pores filled with SiC from methyltrichlorosilane.', 'La preforma de cadena con los poros llenos de SiC del metiltriclorosilano.', 'Sintered into chain composite rods and rotors.', 'Se sinteriza en varillas y rotores de compuesto de cadena.'],
        ['superleak_plug', 'Superleak Plug', 'Tap\u00f3n superfuga', 'Silica aerogel that lets only the superfluid through.', 'Aerogel de s\u00edlice que solo deja pasar el superfluido.', 'The heart of the superfluid He-3 seal.', 'El coraz\u00f3n del sello de He-3 superfluido.'],
        ['welded_mesh_belt', 'Welded Mesh Belt', 'Cinta de malla soldada', 'The chain mesh weave with its edges welded by electron beam.', 'El tejido de malla de cadena con los bordes soldados por haz de electrones.', 'Accepted at 4 K in the helium refrigerator.', 'Se acepta a 4 K en el refrigerador de helio.'],
        ['pbo_belt_trim', 'PBO Belt Trim', 'Recorte de cinta de PBO', 'The PBO selvedge cut off the welded belt.', 'El orillo de PBO cortado de la cinta soldada.', 'Dissolved back into PBO dope in the PBO plant.', 'Se disuelve de nuevo en pasta de PBO en la planta de PBO.']
    ]

    // kind, id, en, es
    var NAMES = [
        ['gmaterial', 'liquid_helium_3', 'Liquid Helium-3', 'Helio 3 l\u00edquido']
    ]

    var PREFIX = { material: 'material.gtceu.', gmaterial: 'material.grindless.' }

    // key, en, es
    var RECIPES = [
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.chain_preform_densify', 'Circuit 6: the chain SiC preform densified from methyltrichlorosilane; the HCl goes back to stock', 'Circuito 6: la preforma de SiC y cadena densificada con metiltriclorosilano; el HCl vuelve al stock'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.superfluid_he3', 'Circuit 4: liquid helium-3 cooled below 1 mK into the superfluid', 'Circuito 4: helio 3 l\u00edquido enfriado por debajo de 1 mK hasta el superfluido'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.superleak_plug', 'Circuit 5: an aerogel plug qualified on the He-3/He-4 mixture; the helium-4 superflows through and goes to the helium refrigerator', 'Circuito 5: un tap\u00f3n de aerogel calificado con la mezcla de He-3/He-4; el helio 4 pasa como superfluido y va al refrigerador de helio'],
        ['gtceu.recipe.grindless_electron_beam.mesh_belt_weld', 'Circuit 21: the chain mesh weave edge-welded under argon; the PBO trim goes back to the PBO plant', 'Circuito 21: el tejido de malla de cadena soldado por los bordes bajo arg\u00f3n; el recorte de PBO vuelve a la planta de PBO']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            var add = function (key, value) { event.add('grindless', key, value) }
            ITEMS.forEach(function (e) {
                add('item.grindless.' + e[0], e[1 + li])
                add('tooltip.grindless.' + e[0] + '.0', e[3 + li])
                add('tooltip.grindless.' + e[0] + '.1', e[5 + li])
            })
            NAMES.forEach(function (e) { add(PREFIX[e[0]] + e[1], e[2 + li]) })
            RECIPES.forEach(function (e) { add(e[0], e[1 + li]) })
        })
    })
})()
