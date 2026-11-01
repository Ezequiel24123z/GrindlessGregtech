// priority: 7001
// Gregtech Grindless - names and tooltips of MAX+'s condensate assembler (startup_scripts/grindless/maxplus/assembler.js; package XP-H3):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each row of the package that has one (the assembler's rows, the press's
//                                                      c3 row and the T1 to T3, T14 to T16 and P25 steps on older machines whose type carries a data key)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.condensate_assembler', 'Condensate Assembler', 'Ensambladora de condensado'],
        ['block.gtceu.condensate_assembler', 'Condensate Assembler', 'Ensambladora de condensado'],
        ['grindless.machine.condensate_assembler.tooltip.0', '\u00a77Assembles plates and mesh under a Kerr condensate bath.', '\u00a77Ensambla placas y malla bajo un ba\u00f1o de condensado de Kerr.'],
        ['gtceu.recipe.grindless_condensate_assembler.horizon_containment_plate', 'Circuit 1: laminated containment cores, horizon plates and Kerr strange plates assembled under a condensate bath into a horizon containment plate; the boil-off goes to the refinery (line T1).', 'Circuito 1: n\u00facleos de contenci\u00f3n laminados, placas del horizonte y placas extra\u00f1as de Kerr ensamblados bajo un ba\u00f1o de condensado en una placa de contenci\u00f3n del horizonte; la evaporaci\u00f3n va a la refiner\u00eda (l\u00ednea T1).'],
        ['gtceu.recipe.grindless_condensate_assembler.chevron_core', 'Circuit 2: zone-plate wafers, X-ray mirrors, gamma focusing elements and horizon plates assembled under a condensate bath into a chevron core; the boil-off goes to the refinery (line T2).', 'Circuito 2: obleas de placa zonal, espejos de rayos X, elementos de enfoque gamma y placas del horizonte ensamblados bajo un ba\u00f1o de condensado en un n\u00facleo de chevr\u00f3n; la evaporaci\u00f3n va a la refiner\u00eda (l\u00ednea T2).'],
        ['gtceu.recipe.grindless_condensate_assembler.horizon_mesh', 'Circuit 3: coated meshes, Kerr strange plates and clad strand assembled under a condensate bath into a horizon mesh; the boil-off goes to the refinery (line T3).', 'Circuito 3: mallas recubiertas, placas extra\u00f1as de Kerr y hebra revestida ensambladas bajo un ba\u00f1o de condensado en una malla del horizonte; la evaporaci\u00f3n va a la refiner\u00eda (l\u00ednea T3).'],
        ['gtceu.recipe.grindless_condensate_assembler.horizon_frame_part', 'Circuit 4: the four woven meta-materials, horizon mesh and containment plates assembled under a condensate bath into a horizon frame part; the boil-off goes to the refinery (lines T4 to T7, T1, T3).', 'Circuito 4: los cuatro metamateriales tejidos, la malla del horizonte y las placas de contenci\u00f3n ensamblados bajo un ba\u00f1o de condensado en una pieza de armaz\u00f3n del horizonte; la evaporaci\u00f3n va a la refiner\u00eda (l\u00edneas T4 a T7, T1, T3).'],
        ['gtceu.recipe.grindless_bound_matter_press.laminated_containment_core', 'Circuit 3: horizon plates, Gd absorber tiles and graded Z billets pressed into laminated containment cores; the press flash is Kerr condensate for the refinery (line T1).', 'Circuito 3: placas del horizonte, losetas absorbentes de Gd y tochos de Z graduado prensados en n\u00facleos de contenci\u00f3n laminados; el destello de la prensa es condensado de Kerr para la refiner\u00eda (l\u00ednea T1).'],
        ['gtceu.recipe.grindless_beuv_lithography.zone_plate_wafer', 'Circuit 17: absorber tiles and gold patterned into a zone-plate wafer under argon (line T2).', 'Circuito 17: losetas absorbentes y oro grabados en una oblea de placa zonal bajo arg\u00f3n (l\u00ednea T2).'],
        ['gtceu.recipe.grindless_mtj_sputtering.multilayer_xray_mirror', 'Zone-plate wafer and molybdenum sputtered with niobium into a multilayer X-ray mirror; most of the argon is recovered (line T2).', 'Oblea de placa zonal y molibdeno pulverizados con niobio en un espejo de rayos X multicapa; casi todo el arg\u00f3n se recupera (l\u00ednea T2).'],
        ['gtceu.recipe.grindless_gamma_optics.gamma_focus_element', 'Circuit 3: zone-plate wafers and iridium ground into a gamma focusing element (line T2).', 'Circuito 3: obleas de placa zonal e iridio pulidas en un elemento de enfoque gamma (l\u00ednea T2).'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.infiltrated_mesh', 'Circuit 19: the Kerr mesh preform infiltrated from methyltrichlorosilane and hydrogen; the hydrochloric acid goes to its users (line T3).', 'Circuito 19: la preforma de malla de Kerr infiltrada con metiltriclorosilano e hidr\u00f3geno; el \u00e1cido clorh\u00eddrico va a quienes lo usan (l\u00ednea T3).'],
        ['gtceu.recipe.grindless_electron_beam.coated_mesh', 'The infiltrated mesh coated with Gd-HfB2 cermet in the electron-beam furnace (line T3).', 'La malla infiltrada recubierta de cermet de Gd-HfB2 en el horno de haz de electrones (l\u00ednea T3).'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.kerr_coated_tape', 'Circuit 10: Kerr strand wire coated with a gadolinium superconducting layer in oxygen; the laser is not consumed (line T14).', 'Circuito 10: cable de hebra de Kerr recubierto con una capa superconductora de gadolinio en ox\u00edgeno; el l\u00e1ser no se consume (l\u00ednea T14).'],
        ['gtceu.recipe.grindless_magnet_winding.kerr_smes_winding', 'Circuit 20: Kerr coated tape wound into an SMES winding on a liquid helium charge that is not consumed (line T14).', 'Circuito 20: cinta recubierta de Kerr bobinada en un devanado SMES con una carga de helio l\u00edquido que no se consume (l\u00ednea T14).'],
        ['gtceu.recipe.grindless_magnet_winding.shielded_absorber', 'Circuit 21: coated absorber sheets and Kerr coated tape wound into a shielded absorber on a liquid helium charge that is not consumed (line T15).', 'Circuito 21: l\u00e1minas absorbentes recubiertas y cinta recubierta de Kerr bobinadas en un absorbente blindado con una carga de helio l\u00edquido que no se consume (l\u00ednea T15).'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.fe16n2_absorber_ring', 'Circuit 22: iron nitrided under nitrogen into an Fe16N2 absorber ring (line T15).', 'Circuito 22: hierro nitrurado bajo nitr\u00f3geno en un anillo absorbente de Fe16N2 (l\u00ednea T15).'],
        ['gtceu.recipe.grindless_megabar.densified_truss_billet', 'Circuit 17: a segment truss billet and a graded Z billet pressed to megabar density (line T16).', 'Circuito 17: un tocho de cercha de segmento y un tocho de Z graduado prensados a densidad de megabar (l\u00ednea T16).'],
        ['gtceu.recipe.grindless_electron_beam.coated_truss_billet', 'The densified truss billet coated with Gd-HfB2 cermet in the electron-beam furnace (line T16).', 'El tocho de cercha densificado recubierto de cermet de Gd-HfB2 en el horno de haz de electrones (l\u00ednea T16).'],
        ['gtceu.recipe.grindless_plasma_mass_filtering.he_rich_fraction', 'Circuit 7: raw VMS plasma filtered at 30 Doradus into a helium-rich fraction and a heavy stellar cut (line P25).', 'Circuito 7: plasma VMS en bruto filtrado en 30 Doradus en una fracci\u00f3n rica en helio y un corte estelar pesado (l\u00ednea P25).'],
        ['gtceu.recipe.grindless_closed_loop.cold_kerr_toroid', 'The braced Kerr toroid run cold until it holds its critical current (line T14).', 'El toroide de Kerr reforzado, enfriado hasta que sostiene su corriente cr\u00edtica (l\u00ednea T14).'],
        ['gtceu.recipe.grindless_closed_loop.flux_absorber_casing', 'The shielded absorber run cold into a flux absorber casing (line T15).', 'El absorbente blindado enfriado hasta formar una carcasa absorbente de flujo (l\u00ednea T15).']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
