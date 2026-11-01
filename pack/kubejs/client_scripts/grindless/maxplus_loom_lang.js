// priority: 6846
// Gregtech Grindless - names and tooltips of MAX+'s meta-material loom (startup_scripts/grindless/maxplus/loom.js; package XP-H1):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each row of the package that has one (the loom's four rows, the press's
//                                                      c4 row and the T4 to T7 steps on older machines whose type carries a data key)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.meta_material_loom', 'Meta-Material Loom', 'Telar de metamateriales'],
        ['grindless.machine.meta_material_loom.tooltip.0', '\u00a77Weaves bound plates and Kerr strand into horizon meta-materials.', '\u00a77Teje placas ligadas y hebra de Kerr en metamateriales.'],
        ['gtceu.recipe.grindless_meta_material_loom.horizon_shielding', 'Circuit 1: graded laminate and horizon plates woven under Kerr condensate into horizon shielding; the boil-off goes to the refinery (line T4).', 'Circuito 1: laminado graduado y placas del horizonte tejidos bajo condensado de Kerr en blindaje del horizonte; la evaporaci\u00f3n va a la refiner\u00eda (l\u00ednea T4).'],
        ['gtceu.recipe.grindless_meta_material_loom.horizon_waveguide', 'Circuit 2: niobium-lined tubes, Kerr strand and Kerr strange plates woven under condensate into a horizon waveguide; the boil-off goes to the refinery (line T5).', 'Circuito 2: tubos revestidos de niobio, hebra de Kerr y placas extra\u00f1as de Kerr tejidos bajo condensado en una gu\u00eda de ondas del horizonte; la evaporaci\u00f3n va a la refiner\u00eda (l\u00ednea T5).'],
        ['gtceu.recipe.grindless_meta_material_loom.horizon_conduit', 'Circuit 3: cabled conductors, Kerr braid sleeves and horizon plates woven under condensate into a horizon conduit; the boil-off goes to the refinery (line T6).', 'Circuito 3: conductores cableados, mangas trenzadas de Kerr y placas del horizonte tejidos bajo condensado en un conducto del horizonte; la evaporaci\u00f3n va a la refiner\u00eda (l\u00ednea T6).'],
        ['gtceu.recipe.grindless_meta_material_loom.horizon_valve_body', 'Circuit 4: calibrated condensate leaks, Kerr strange plates and horizon plates woven under condensate into a horizon valve body; the boil-off goes to the refinery (line T7).', 'Circuito 4: fugas de condensado calibradas, placas extra\u00f1as de Kerr y placas del horizonte tejidas bajo condensado en un cuerpo de v\u00e1lvula del horizonte; la evaporaci\u00f3n va a la refiner\u00eda (l\u00ednea T7).'],
        ['gtceu.recipe.grindless_bound_matter_press.graded_horizon_laminate', 'Circuit 4: horizon plates and Gd-HfB2 cermet pressed into graded horizon laminate; the press flash is Kerr condensate for the refinery (line T4).', 'Circuito 4: placas del horizonte y cermet de Gd-HfB2 prensados en laminado graduado del horizonte; el destello de la prensa es condensado de Kerr para la refiner\u00eda (l\u00ednea T4).'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.sic_waveguide_tube', 'Circuit 20: SiC tow infiltrated from methyltrichlorosilane and hydrogen into a waveguide tube; the hydrochloric acid goes to its users (line T5).', 'Circuito 20: estopa de SiC infiltrada con metiltriclorosilano e hidr\u00f3geno en un tubo de gu\u00eda de ondas; el \u00e1cido clorh\u00eddrico va a quienes lo usan (l\u00ednea T5).'],
        ['gtceu.recipe.grindless_mtj_sputtering.nb_lined_tube', 'Circuit 32: the polished tube lined with niobium sputtered from a target; most of the argon is recovered (line T5).', 'Circuito 32: el tubo pulido revestido de niobio pulverizado desde un blanco; casi todo el arg\u00f3n se recupera (l\u00ednea T5).'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.cold_horizon_waveguide', 'Circuit 27: the horizon waveguide cooled to millikelvin on a superfluid helium charge that is not consumed (line T5).', 'Circuito 27: la gu\u00eda de ondas del horizonte enfriada a milikelvin con una carga de helio superfluido que no se consume (l\u00ednea T5).'],
        ['gtceu.recipe.grindless_coated_conductor.conduit_tape', 'Circuit 12: nickel-tungsten tape and Kerr strand wire coated into conduit tape (line T6).', 'Circuito 12: cinta de n\u00edquel-tungsteno y cable de hebra de Kerr recubiertos en cinta de conducto (l\u00ednea T6).'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.thick_conduit_tape', 'Circuit 9: gadolinium-doped layers laser-deposited on the conduit tape in oxygen; the laser is not consumed (line T6).', 'Circuito 9: capas dopadas con gadolinio depositadas por l\u00e1ser sobre la cinta de conducto en ox\u00edgeno; el l\u00e1ser no se consume (l\u00ednea T6).'],
        ['gtceu.recipe.grindless_magnet_winding.cabled_conductor', 'Circuit 19: thick conduit tape and Kerr strand wound into a cabled conductor on a liquid helium charge that is not consumed (line T6).', 'Circuito 19: cinta gruesa de conducto y hebra de Kerr bobinadas en un conductor cableado con una carga de helio l\u00edquido que no se consume (l\u00ednea T6).'],
        ['gtceu.recipe.grindless_closed_loop.cold_horizon_conduit', 'The woven horizon conduit run cold until it holds its critical current (line T6).', 'El conducto del horizonte tejido, enfriado hasta que sostiene su corriente cr\u00edtica (l\u00ednea T6).'],
        ['gtceu.recipe.grindless_shequid_assembly.horizon_valve', 'Circuit 10: the woven valve body fitted and sealed on liquid helium, with the rotation reference not consumed; the boil-off helium is kept (line T7).', 'Circuito 10: el cuerpo de v\u00e1lvula tejido ajustado y sellado en helio l\u00edquido, con la referencia de rotaci\u00f3n sin consumir; el helio evaporado se conserva (l\u00ednea T7).'],
        ['gtceu.recipe.grindless_shequid_assembly.calibrated_condensate_leak', 'Circuit 9: the condensate superleak plug calibrated against Josephson wafers and a rotation reference on liquid helium; the boil-off helium is kept (line T7).', 'Circuito 9: el tap\u00f3n de superfuga de condensado calibrado con obleas Josephson y una referencia de rotaci\u00f3n en helio l\u00edquido; el helio evaporado se conserva (l\u00ednea T7).']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
