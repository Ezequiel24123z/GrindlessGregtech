// priority: 3349
// Gregtech Grindless - names and tooltips of UIV's levitation melter (startup_scripts/grindless/uiv/levitation_melter.js; package UIV-A3):
//
//   block.gtceu.levitation_melter, gtceu.levitation_melting   machine and recipe type names
//   grindless.machine.levitation_melter.tooltip.N             controller tooltips
//   gtceu.recipe.grindless_levitation_melting.<recipe>        the EMI line of each melt
//   gtceu.recipe.grindless_electron_beam.nb_ta_button, ...nitride_magnet_synthesis.halbach_array, ...chemical_vapour_infiltration.w_preform_densify
//                                                             the EMI lines of the older rows this package appends
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1          the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.levitation_melter', 'Levitation Melter', 'Fundidor de levitación'],
        ['gtceu.levitation_melting', 'Levitation Melting', 'Fusión por levitación'],

        ['grindless.machine.levitation_melter.tooltip.0',
            'A cold-crucible coil holds the melt in mid-air under helium, so no wall can foul it: it makes RHEA, Wf/RHEA, Ti-50, bulk metallic glass and PrNi5.',
            'Una bobina de crisol frío sostiene la masa fundida en el aire bajo helio, así que ninguna pared la ensucia: fabrica RHEA, Wf/RHEA, Ti-50, vidrio metálico masivo y PrNi5.'],
        ['grindless.machine.levitation_melter.tooltip.1',
            'Circuit 1 RHEA, 2 Wf/RHEA, 3 Ti-50, 4 bulk metallic glass, 5 PrNi5. The oxide dross goes to the extraction cascade; the beryllium fume is captured as BeO.',
            'Circuito 1 RHEA, 2 Wf/RHEA, 3 Ti-50, 4 vidrio metálico masivo, 5 PrNi5. La escoria de óxidos va a la cascada de extracción; el humo de berilio se captura como BeO.'],
        ['grindless.machine.levitation_melter.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, a helium hatch. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, una escotilla de helio. Acepta una escotilla de paralelos.'],

        ['gtceu.recipe.grindless_levitation_melting.rhea_melt', 'Melts W, Mo, Nb-Ta buttons and Hf into the RHEA ingot.', 'Funde W, Mo, botones de Nb-Ta y Hf en el lingote RHEA.'],
        ['gtceu.recipe.grindless_levitation_melting.wf_rhea_melt', 'Melts a densified tungsten preform into RHEA: the Wf/RHEA billet.', 'Funde una preforma de wolframio densificada en RHEA: la palanquilla Wf/RHEA.'],
        ['gtceu.recipe.grindless_levitation_melting.ti50_melt', 'Melts Ti-50 sponge into Ti-50 metal.', 'Funde la esponja de Ti-50 en metal de Ti-50.'],
        ['gtceu.recipe.grindless_levitation_melting.bmg_melt', 'Melts the Zr master alloy into bulk metallic glass; the beryllium fume is captured as BeO.', 'Funde la aleación madre de Zr en vidrio metálico masivo; el humo de berilio se captura como BeO.'],
        ['gtceu.recipe.grindless_levitation_melting.prni5_melt', 'Melts praseodymium and nickel into PrNi5.', 'Funde praseodimio y níquel en PrNi5.'],

        ['gtceu.recipe.grindless_electron_beam.nb_ta_button', 'Electron-beam melts Nb and Ta powder into a button; the skull goes back to stock.', 'Funde con haz de electrones polvo de Nb y Ta en un botón; el casquete vuelve al almacén.'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.halbach_array', 'Bonds Fe16N2 magnets into a Halbach array.', 'Une imanes de Fe16N2 en una matriz de Halbach.'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.w_preform_densify', 'Densifies a tungsten fibre preform with WF6 and hydrogen; the HF goes to the kiln.', 'Densifica una preforma de fibra de wolframio con WF6 e hidrógeno; el HF va al horno.']
    ]

    // [name, en, es, tip0 en, tip0 es, tip1 en, tip1 es]
    var ITEMS = [
        ['melter_dross', 'Melter Dross', 'Escoria de fundidor', 'Oxide skin skimmed off a levitated melt.', 'Piel de óxido retirada de una fusión levitada.', 'Digest it in the extraction cascade.', 'Digiérela en la cascada de extracción.'],
        ['nb_ta_button', 'Nb-Ta Button', 'Botón de Nb-Ta', 'An electron-beam melted button of niobium and tantalum.', 'Un botón de niobio y tantalio fundido con haz de electrones.', 'Feeds the RHEA melt.', 'Alimenta la fusión RHEA.'],
        ['densified_w_preform', 'Densified Tungsten Preform', 'Preforma de wolframio densificada', 'A tungsten fibre preform filled by vapour infiltration.', 'Una preforma de fibra de wolframio rellenada por infiltración de vapor.', 'Melted with RHEA into the Wf/RHEA billet.', 'Se funde con RHEA en la palanquilla Wf/RHEA.'],
        ['zr_master_alloy', 'Zr Master Alloy', 'Aleación madre de Zr', 'Zirconium, titanium, copper, nickel and beryllium, mixed.', 'Circonio, titanio, cobre, níquel y berilio, mezclados.', 'Melts into bulk metallic glass.', 'Se funde en vidrio metálico masivo.'],
        ['beryllium_oxide_dust', 'Beryllium Oxide Dust', 'Polvo de óxido de berilio', 'Beryllium fume captured from the glass melt.', 'Humo de berilio capturado de la fusión del vidrio.', 'Contained; electrolyse it back to metal.', 'Contenido; electrolízalo de vuelta a metal.'],
        ['rhea_slab', 'Homogenised RHEA Slab', 'Plancha RHEA homogeneizada', 'An RHEA ingot held in a hot furnace until it is uniform.', 'Un lingote RHEA mantenido en un horno caliente hasta ser uniforme.', 'Goes to the hot strip mill.', 'Va al tren de laminación en caliente.'],
        ['rhea_former', 'RHEA Former', 'Molde RHEA', 'A plate-and-ingot frame for a winding.', 'Un armazón de placa y lingote para un bobinado.', 'Line 2.', 'Línea 2.'],
        ['wound_rhea_former', 'Wound RHEA Former', 'Molde RHEA bobinado', 'A RHEA former wound with metallic hydrogen.', 'Un molde RHEA bobinado con hidrógeno metálico.', 'Impregnate it with epoxy.', 'Impregnalo con epoxi.'],
        ['impregnated_mh_coil', 'Impregnated MH Coil', 'Bobina MH impregnada', 'A metallic hydrogen winding set in epoxy.', 'Un bobinado de hidrógeno metálico fijado en epoxi.', 'Four make a coil block.', 'Cuatro forman un bloque de bobina.'],
        ['rhea_cased_charge', 'RHEA-Cased Charge', 'Carga con camisa RHEA', 'Cubic gauche nitrogen in a RHEA case.', 'Nitrógeno cúbico gauche en una camisa RHEA.', 'Ends up on the sled.', 'Acaba en el trineo.'],
        ['halbach_array', 'Halbach Array', 'Matriz de Halbach', 'Fe16N2 magnets bonded into a one-sided flux array.', 'Imanes de Fe16N2 unidos en una matriz de flujo unilateral.', 'Goes into a maglev stator.', 'Va a un estátor maglev.'],
        ['rhea_cased_halbach', 'RHEA-Cased Halbach Array', 'Matriz de Halbach con camisa RHEA', 'A Halbach array in a RHEA case.', 'Una matriz de Halbach en una camisa RHEA.', 'Wind and pot it.', 'Bóbinala y encápsulala.'],
        ['potted_mh_stator', 'Potted MH Stator', 'Estátor MH encapsulado', 'A cased Halbach array with a metallic hydrogen winding, potted.', 'Una matriz de Halbach con camisa y bobinado de hidrógeno metálico, encapsulada.', 'Add the cable.', 'Añade el cable.'],
        ['maglev_stator', 'Maglev Stator', 'Estátor maglev', 'A finished magnetic-levitation stator.', 'Un estátor de levitación magnética terminado.', 'Builds the UIV conveyor module.', 'Construye el módulo transportador UIV.']
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
