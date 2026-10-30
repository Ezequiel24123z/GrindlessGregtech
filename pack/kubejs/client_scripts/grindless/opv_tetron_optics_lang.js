// Gregtech Grindless - names and tooltips of OpV's tetron fab and gamma optics works (startup_scripts/grindless/opv/tetron_optics.js;
// package OpV-B1):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe of the package's types and of its older rows
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.tetron_fab', 'Tetron Fab', 'Fábrica de tetrones'],
        ['gtceu.tetron_assembly', 'Tetron Assembly', 'Ensamblaje de tetrones'],

        ['grindless.machine.tetron_fab.tooltip.0',
            '\u00a77Makes tetron dies and ties tested tetrons into a qubit array.',
            '\u00a77Fabrica troqueles de tetrón y une tetrones probados en una matriz de cúbits.'],

        ['emi.grindless.info.tetron_fab.0',
            'A tetron is two InAs-Al nanowires joined by a superconducting backbone; its qubit is read by interferometric parity measurement. Between the fab\'s two steps each die is In-bumped (UXV MTJ sputter cluster), flip-chip bonded (UIV TFLN fab) and parity-tested (UIV millikelvin works). It needs two UXV energy hatches.',
            'Un tetrón son dos nanohilos de InAs-Al unidos por una columna superconductora; su cúbit se lee por medida interferométrica de paridad. Entre los dos pasos de la fábrica cada troquel recibe protuberancias de In (clúster de pulverización MTJ UXV), se une en flip-chip (fábrica TFLN UIV) y se prueba su paridad (taller de milikelvin UIV). Necesita dos escotillas de energía UXV.'],
        ['emi.grindless.info.tetron_fab.1',
            'The superfluid He-3 bath is not consumed. A die that fails the array\'s calibration goes to the EV extraction cascade (circuit 25), which recovers its indium, aluminium and gold.',
            'El baño de He-3 superfluido no se consume. Un troquel que falla la calibración de la matriz va a la cascada de extracción EV (circuito 25), que recupera su indio, aluminio y oro.'],

        ['gtceu.recipe.grindless_tetron_assembly.tetron_die',
            'Circuit 1: a gated 2DEG wafer and a cryo-CMOS die are diced into four tetron dies.',
            'Circuito 1: una oblea 2DEG con puertas y un troquel cryo-CMOS se cortan en cuatro troqueles de tetrón.'],
        ['gtceu.recipe.grindless_tetron_assembly.tetron_array',
            'Circuit 2: four tested tetrons and a HEMT amplifier in a superfluid He-3 bath (kept); 10 % of runs reject a failed die.',
            'Circuito 2: cuatro tetrones probados y un amplificador HEMT en un baño de He-3 superfluido (se conserva); el 10 % de las tandas rechaza un troquel fallido.'],

        ['gtceu.recipe.grindless_mtj_sputtering.tetron_bumps',
            'Circuit 9: indium bumps are sputtered onto four tetron dies in argon; most of the argon is recovered.',
            'Circuito 9: se depositan protuberancias de indio sobre cuatro troqueles de tetrón en argón; se recupera casi todo el argón.'],
        ['gtceu.recipe.grindless_ion_slicing.bonded_tetron_die',
            'Circuit 8: a bumped tetron die is flip-chip bonded to a niobium TSV interposer.',
            'Circuito 8: un troquel de tetrón con protuberancias se une en flip-chip a un intercalador TSV de niobio.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.tested_tetron_die',
            'Circuit 6: a bonded tetron die is parity-tested at millikelvin on the cryostat module (kept).',
            'Circuito 6: se prueba la paridad de un troquel de tetrón unido a milikelvin sobre el módulo criostato (se conserva).']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['bumped_tetron_die', 'Bumped Tetron Die', 'Troquel de tetrón con protuberancias', 'A tetron die with sputtered indium bumps.', 'Un troquel de tetrón con protuberancias de indio pulverizado.', 'Flip-chip bonded in the TFLN fab (ion slicing, circuit 8).', 'Se une en flip-chip en la fábrica TFLN (corte iónico, circuito 8).'],
        ['bonded_tetron_die', 'Bonded Tetron Die', 'Troquel de tetrón unido', 'A tetron die flip-chip bonded to a niobium TSV interposer.', 'Un troquel de tetrón unido en flip-chip a un intercalador TSV de niobio.', 'Parity-tested in the millikelvin works (circuit 6).', 'Se prueba su paridad en el taller de milikelvin (circuito 6).'],
        ['tested_tetron_die', 'Tested Tetron Die', 'Troquel de tetrón probado', 'A tetron that passed the interferometric parity test.', 'Un tetrón que superó la prueba interferométrica de paridad.', 'Four make a tetron array in the tetron fab (circuit 2).', 'Cuatro forman una matriz de tetrones en la fábrica de tetrones (circuito 2).'],
        ['failed_tetron_die', 'Failed Tetron Die', 'Troquel de tetrón fallido', 'A tetron that failed the array\'s parity calibration.', 'Un tetrón que falló la calibración de paridad de la matriz.', 'The EV extraction cascade recovers its In, Al and Au (circuit 25).', 'La cascada de extracción EV recupera su In, Al y Au (circuito 25).']
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
