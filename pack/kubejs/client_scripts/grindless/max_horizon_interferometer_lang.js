// Gregtech Grindless - names and tooltips of MAX's horizon interferometer (startup_scripts/grindless/max/horizon_interferometer.js; package MX-S1):
//
//   gtceu.<type>                                       the recipe type name (the machine's own name is F1's, max_foundation_lang.js)
//   grindless.machine.<machine>.tooltip.N              controller tooltip
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe of the package's type and of its older rows
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.horizon_interferometry', 'Horizon Interferometry', 'Interferometría de horizonte'],

        ['grindless.machine.horizon_interferometer.tooltip.0',
            '\u00a77Three test masses in free fall around Sgr A*: the cloud phase map and the calibrated oscillators.',
            '\u00a77Tres masas de prueba en caída libre alrededor de Sgr A*: el mapa de fase de la nube y los osciladores calibrados.'],

        ['gtceu.recipe.grindless_horizon_interferometry.cloud_phase_map', 'Circuit 1: three reference sensors, three bonded optical benches, three stabilised lasers, twelve FEEP thrusters and two phasemeter boards fly the triangle; the final spin map is kept. The thrusters come back as spent crowns, and most of the used sensors and benches come back too.',
            'Circuito 1: tres sensores de referencia, tres bancos ópticos unidos, tres láseres estabilizados, doce propulsores FEEP y dos placas de fasímetro vuelan el triángulo; el mapa de espín final se conserva. Los propulsores vuelven como coronas gastadas, y la mayoría de los sensores y bancos usados también vuelven.'],
        ['gtceu.recipe.grindless_horizon_interferometry.calibrated_oscillator_bank', 'Circuit 2: four phase-lock oscillator banks are calibrated against the cloud phase map (kept).',
            'Circuito 2: cuatro bancos de osciladores de enganche de fase se calibran con el mapa de fase de la nube (se conserva).'],
        ['gtceu.recipe.grindless_horizon_interferometry.cloud_phase_map_reuse', 'Circuit 3: the used sensors and optical benches are flown again with one fresh sensor; the final spin map is kept. Nothing is returned.',
            'Circuito 3: los sensores y bancos ópticos usados vuelan de nuevo con un sensor nuevo; el mapa de espín final se conserva. No se devuelve nada.'],

        ['gtceu.recipe.grindless_zone_refining.six_n_indium', 'Circuit 15: indium sulfate is reduced in hydrogen and zone-refined to 6N indium; the sulfuric acid comes back.',
            'Circuito 15: el sulfato de indio se reduce en hidrógeno y se refina por zonas a indio 6N; el ácido sulfúrico vuelve.'],
        ['gtceu.recipe.grindless_zone_refining.fz_silicon_rod', 'Circuit 16: silicon dust is float-zoned under argon into a rod.',
            'Circuito 16: el polvo de silicio se funde por zona flotante bajo argón en una varilla.'],
        ['gtceu.recipe.grindless_crystal_growth.nd_yag_boule', 'Circuit 32: Nd:YAG is pulled from yttrium, aluminium and neodymium in an iridium crucible (31 % wear).',
            'Circuito 32: el Nd:YAG se crece con itrio, aluminio y neodimio en un crisol de iridio (31 % de desgaste).'],
        ['gtceu.recipe.grindless_electron_beam_refining.spent_feep_crown_resinter', 'Circuit 32: four spent FEEP crowns are re-sintered into three porous crowns.',
            'Circuito 32: cuatro coronas FEEP gastadas se vuelven a sinterizar en tres coronas porosas.'],

        ['emi.grindless.info.test_mass_enclosure_casing.0', 'A structure block: a test mass station of the Horizon Interferometer. Made in the assembler.',
            'Un bloque de estructura: una estación de masa de prueba del interferómetro de horizonte. Se fabrica en el ensamblador.'],
        ['emi.grindless.info.laser_link_casing.0', 'A structure block: a laser link arm of the Horizon Interferometer. Made in the assembler.',
            'Un bloque de estructura: un brazo de enlace láser del interferómetro de horizonte. Se fabrica en el ensamblador.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
