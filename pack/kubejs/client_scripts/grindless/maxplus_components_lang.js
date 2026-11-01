// priority: 6884
// Gregtech Grindless - the EMI lines of the MAX+ component steps that run on a custom machine
// (server_scripts/grindless/maxplus/components.js; package XP-A2). The other steps run on GTM machines and need no key.
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
//   gtceu.recipe.grindless_<recipe type>.<recipe name>
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_condensate_refinery.condensate_loaded_cavity', 'Circuit 7: a niobium-coated cavity is flooded with settled condensate until it holds a standing field (line C5).', 'Circuito 7: una cavidad recubierta de niobio se inunda de condensado asentado hasta que sostiene un campo estacionario (l\u00ednea C5).'],
        ['gtceu.recipe.grindless_magnet_winding.kerr_coil_winding', 'Circuit 22: stabilised Kerr wire wound on the CMC coil former and potted in epoxy (line C1).', 'Circuito 22: hilo Kerr estabilizado bobinado sobre el soporte CMC y encapsulado en ep\u00f3xido (l\u00ednea C1).'],
        ['gtceu.recipe.grindless_membrane_rolling.horizon_belt', 'Circuit 4: horizon membrane and strand wire rolled into the horizon belt (line C6).', 'Circuito 4: membrana de horizonte e hilo trenzado laminados en la correa de horizonte (l\u00ednea C6).'],
        ['gtceu.recipe.grindless_shequid_assembly.balanced_bound_billet', 'Circuit 10: a bound degenerate billet is balanced against the weak-link cell in superfluid helium (line C2).', 'Circuito 10: un lingote degenerado ligado se equilibra contra la celda de enlace d\u00e9bil en helio superfluido (l\u00ednea C2).'],
        ['gtceu.recipe.grindless_mtj_sputtering.wear_coated_rotor', 'Circuit 32: a bound rotor blank sputtered with a niobium wear coat (line C2).', 'Circuito 32: un n\u00facleo de rotor ligado recubierto por pulverizaci\u00f3n con una capa de niobio resistente al desgaste (l\u00ednea C2).'],
        ['gtceu.recipe.grindless_mtj_sputtering.nb_coated_cavity', 'Circuit 32: a confinement cavity sputtered with niobium (line C5).', 'Circuito 32: una cavidad de confinamiento recubierta de niobio por pulverizaci\u00f3n (l\u00ednea C5).'],
        ['gtceu.recipe.grindless_mtj_sputtering.electroded_pmn_stack', 'Circuit 32: PMN-PT plates sputtered with gold electrodes and stacked (line C7).', 'Circuito 32: placas de PMN-PT con electrodos de oro depositados por pulverizaci\u00f3n y apiladas (l\u00ednea C7).'],
        ['gtceu.recipe.grindless_ion_slicing.ln_on_diamond', 'Circuit 15: a lithium niobate wafer sliced onto the thick C-12 diamond plate (line C3).', 'Circuito 15: una oblea de niobato de litio cortada sobre la placa gruesa de diamante C-12 (l\u00ednea C3).'],
        ['gtceu.recipe.grindless_beuv_lithography.patterned_engine_wafer', 'Circuit 19: the photonic engine pattern printed with a fresh BEUV mirror (line C3).', 'Circuito 19: el patr\u00f3n del motor fot\u00f3nico impreso con un espejo BEUV nuevo (l\u00ednea C3).'],
        ['gtceu.recipe.grindless_beuv_lithography.readout_wafer', 'Circuit 20: the readout wafer printed with a fresh BEUV mirror (line C4).', 'Circuito 20: la oblea de lectura impresa con un espejo BEUV nuevo (l\u00ednea C4).'],
        ['gtceu.recipe.grindless_photonic_foundry.horizon_photonic_engine', 'Circuit 31: the patterned wafer bonded to a glass interposer in ultrapure water (line C3).', 'Circuito 31: la oblea con patr\u00f3n unida a un interpositor de vidrio en agua ultrapura (l\u00ednea C3).'],
        ['gtceu.recipe.grindless_photonic_foundry.horizon_phase_sensor_core', 'Circuit 32: the cold SNSPD module bonded to a readout die in ultrapure water (line C4).', 'Circuito 32: el m\u00f3dulo SNSPD fr\u00edo unido a una pastilla de lectura en agua ultrapura (l\u00ednea C4).'],
        ['gtceu.recipe.grindless_snspd_fabrication.snspd_array_die', 'Circuit 8: four SNSPDs and gold wired into an array die in superfluid helium (line C4).', 'Circuito 8: cuatro SNSPD y oro cableados en una pastilla matricial en helio superfluido (l\u00ednea C4).'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.cold_snspd_module', 'Circuit 16: the array die and a readout die cooled to millikelvin in the cryostat (line C4).', 'Circuito 16: la pastilla matricial y una pastilla de lectura enfriadas a milikelvin en el criostato (l\u00ednea C4).'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.condensate_field_cell', 'Circuit 17: the sealed field cavity cooled to millikelvin until the condensate locks (line C5).', 'Circuito 17: la cavidad de campo sellada enfriada a milikelvin hasta que el condensado se fija (l\u00ednea C5).'],
        ['gtceu.recipe.grindless_electron_beam.refractory_coated_web', 'Circuit 32: the primed Kerr web coated with tungsten under the beam (line C6).', 'Circuito 32: la malla Kerr imprimada recubierta de tungsteno bajo el haz (l\u00ednea C6).'],
        ['gtceu.recipe.grindless_crystal_growth.pmn_pt_boule', 'Circuit 32: PMN-PT precursor oxides grown into a boule in an iridium crucible (line C7).', 'Circuito 32: \u00f3xidos precursores de PMN-PT crecidos en un lingote dentro de un crisol de iridio (l\u00ednea C7).']
    ]
    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
