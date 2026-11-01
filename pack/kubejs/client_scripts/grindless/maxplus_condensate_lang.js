// priority: 6962
// Gregtech Grindless - names and tooltips of MAX+'s condensate machines (startup_scripts/grindless/maxplus/condensate.js; package XP-A1):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each row of the package that has one (the two machines' own rows and the
//                                                      P1 to P5 steps on older machines)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var MACHINES = [
        ['block.gtceu.condensate_refinery', 'Condensate Refinery', 'Refiner\u00eda de condensado'],
        ['block.gtceu.bound_matter_press', 'Bound-Matter Press', 'Prensa de materia ligada']
    ]
    var ENTRIES = [
        ['gtceu.condensate_refinery', 'Condensate Refinery', 'Refiner\u00eda de condensado'],
        ['gtceu.bound_matter_press', 'Bound-Matter Press', 'Prensa de materia ligada'],
        ['grindless.machine.condensate_refinery.tooltip.0', '\u00a77Settles Kerr condensate and binds exotic matter into it.', '\u00a77Asienta condensado de Kerr y le liga materia ex\u00f3tica.'],
        ['grindless.machine.bound_matter_press.tooltip.0', '\u00a77Presses condensate-bound ingots into plates.', '\u00a77Prensa lingotes ligados por condensado en placas.'],
        ['gtceu.recipe.grindless_condensate_refinery.settle', 'Circuit 1: the tapped Kerr condensate settles into a stable liquid; the boil-off it sheds is kept (line P1).', 'Circuito 1: el condensado de Kerr extra\u00eddo se asienta en un l\u00edquido estable; la evaporaci\u00f3n que desprende se conserva (l\u00ednea P1).'],
        ['gtceu.recipe.grindless_condensate_refinery.recompress_boil_off', 'Circuit 10: the boil-off of the other rows is recompressed into Kerr condensate and goes back to circuit 1; nothing is vented.', 'Circuito 10: la evaporaci\u00f3n de las dem\u00e1s filas se recomprime en condensado de Kerr y vuelve al circuito 1; nada se ventila.'],
        ['gtceu.recipe.grindless_condensate_refinery.neutronium_bind', 'Circuit 2: compressed neutronium cores are bound into the settled condensate as bound neutronium ingots (line P2).', 'Circuito 2: los n\u00facleos de neutronio comprimido se ligan al condensado asentado como lingotes de neutronio ligado (l\u00ednea P2).'],
        ['gtceu.recipe.grindless_condensate_refinery.strange_bind', 'Circuit 3: strange alloy charges are bound into the settled condensate as Kerr strange ingots (line P3).', 'Circuito 3: las cargas de aleaci\u00f3n extra\u00f1a se ligan al condensado asentado como lingotes extra\u00f1os de Kerr (l\u00ednea P3).'],
        ['gtceu.recipe.grindless_condensate_refinery.strand_cladding', 'Circuit 4: MAX horizon strand wire is clad in settled condensate into Kerr clad strand (line P4).', 'Circuito 4: el cable de hebra del horizonte MAX se reviste de condensado asentado en hebra revestida de Kerr (l\u00ednea P4).'],
        ['gtceu.recipe.grindless_condensate_refinery.degenerate_bind', 'Circuit 5: degenerate compacts are bound into the settled condensate as bound degenerate powder (line P5).', 'Circuito 5: los compactos degenerados se ligan al condensado asentado como polvo degenerado ligado (l\u00ednea P5).'],
        ['gtceu.recipe.grindless_bound_matter_press.bound_neutronium_plate', 'Circuit 1: bound neutronium ingots are pressed into horizon compressed plates; the press flash is Kerr condensate for the refinery (line P2).', 'Circuito 1: los lingotes de neutronio ligado se prensan en placas comprimidas del horizonte; el destello de la prensa es condensado de Kerr para la refiner\u00eda (l\u00ednea P2).'],
        ['gtceu.recipe.grindless_bound_matter_press.strange_plate', 'Circuit 2: Kerr strange ingots are pressed into Kerr strange plates; the press flash is Kerr condensate for the refinery (line P3).', 'Circuito 2: los lingotes extra\u00f1os de Kerr se prensan en placas extra\u00f1as de Kerr; el destello de la prensa es condensado de Kerr para la refiner\u00eda (l\u00ednea P3).'],
        ['gtceu.recipe.grindless_megabar.neutronium_core_press', 'Circuit 12: neutronium pellets pressed under the anvil into compressed neutronium cores (line P2).', 'Circuito 12: pellets de neutronio prensados bajo el yunque en n\u00facleos de neutronio comprimido (l\u00ednea P2).'],
        ['gtceu.recipe.grindless_megabar.degenerate_compact_press', 'Circuit 13: degenerate matter slugs pressed under the anvil into degenerate compacts (line P5).', 'Circuito 13: lingotes de materia degenerada prensados bajo el yunque en compactos degenerados (l\u00ednea P5).'],
        ['gtceu.recipe.grindless_levitation_melting.strange_alloy_charge', 'Circuit 23: fed strangelets melted with tungsten under helium into strange alloy charges; the oxide skin leaves as dross (line P3).', 'Circuito 23: strangelets alimentados fundidos con tungsteno bajo helio en cargas de aleaci\u00f3n extra\u00f1a; la capa de \u00f3xido sale como escoria (l\u00ednea P3).'],
        ['gtceu.recipe.grindless_pasta_drawing.kerr_strand_drawing', 'Circuit 8: Kerr clad strand drawn into Kerr strand wire (line P4).', 'Circuito 8: hebra revestida de Kerr estirada en cable de hebra de Kerr (l\u00ednea P4).'],
        ['gtceu.recipe.grindless_mtj_sputtering.insulated_kerr_wire', 'Circuit 27: an oxide interlayer sputtered over the Kerr strand wire as its insulation; most of the argon is recovered (line P4).', 'Circuito 27: una capa intermedia de \u00f3xido pulverizada sobre el cable de hebra de Kerr como aislante; casi todo el arg\u00f3n se recupera (l\u00ednea P4).'],
        ['gtceu.recipe.grindless_black_hole_bomb.condensate_tap', 'Circuit 4: a seed wave packet taps the stationary cloud while the horizon lock is held (never consumed); a horizon phase lock wears 1 time in 32. Gives 16,000 mB of Kerr condensate (line P1).', 'Circuito 4: un paquete de ondas semilla extrae la nube estacionaria mientras se sostiene el cierre del horizonte (nunca se consume); un cierre de fase del horizonte se desgasta 1 vez de cada 32. Da 16.000 mB de condensado de Kerr (l\u00ednea P1).']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
            // the controllers' block names (GTM reads block.gtceu.<id>)
            MACHINES.forEach(function (e) {
                event.add('gtceu', e[0], e[1 + li])
            })
        })
    })
})()
