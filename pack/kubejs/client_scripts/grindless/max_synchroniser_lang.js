// priority: 6636
// Gregtech Grindless - names and tooltips of MAX's ergoregion synchroniser (startup_scripts/grindless/max/synchroniser.js; package MX-S2):
//
//   gtceu.<type>                                       recipe type name (the controller's block name is in max_foundation_lang.js)
//   grindless.machine.<machine>.tooltip.N              controller tooltip
//   emi.grindless.info.<machine>.N                     the EMI info page of the controller
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe of the package's type
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.ergoregion_synchronisation', 'Ergoregion Synchronisation', 'Sincronización de ergorregión'],

        ['grindless.machine.ergoregion_synchroniser.tooltip.0',
            '\u00a77Locks a shell to the spin of Sgr A*: phase locks. Runs only in its orbit.',
            '\u00a77Fija una envoltura al giro de Sgr A*: bloqueos de fase. Solo en su órbita.'],

        ['emi.grindless.info.ergoregion_synchroniser.0',
            'Two SRF driver modules, a pair of calibrated oscillator banks and four tunable impedance sheets are tuned against a quantum memory node in a superfluid He-3 bath until the whole assembly follows the frame dragging of the black hole: a horizon phase lock. Every shell of the mirror swarm needs one. A fatigued VO2 sheet comes out one time in eight; the extraction cascade (circuit 32) turns it back into vanadium pentoxide and sapphire dust.',
            'Dos módulos impulsores SRF, un par de bancos de osciladores calibrados y cuatro láminas de impedancia sintonizable se afinan contra un nodo de memoria cuántica en un baño de He-3 superfluido hasta que el conjunto sigue el arrastre de marco del agujero negro: un bloqueo de fase del horizonte. Cada envoltura del enjambre de espejos necesita uno. Una vez de cada ocho sale una lámina de VO2 fatigada; la cascada de extracción (circuito 32) la devuelve a pentóxido de vanadio y polvo de zafiro.'],
        ['emi.grindless.info.ergoregion_synchroniser.1',
            'Circuit 2 relocks a spent phase lock with one fresh oscillator bank. The sheets are lines L50 (VO2 on sapphire, patterned and metallised), the driver modules are L51 (niobium cavities, Nb3Sn layer, conduction cooling) and the oscillator banks are L55 (sapphire resonators, nuclear clock, photonic foundry).',
            'El circuito 2 reajusta un bloqueo de fase gastado con un banco de osciladores nuevo. Las láminas son la línea L50 (VO2 sobre zafiro, modelado y metalizado), los módulos impulsores la L51 (cavidades de niobio, capa de Nb3Sn, refrigeración por conducción) y los bancos de osciladores la L55 (resonadores de zafiro, reloj nuclear, fundición fotónica).'],

        ['emi.grindless.info.driver_ring_casing.0',
            'A structure block: a ring segment of the Ergoregion Synchroniser. Made in the assembler.',
            'Un bloque de estructura: un segmento de anillo del sincronizador de ergorregión. Se fabrica en el ensamblador.'],

        ['gtceu.recipe.grindless_ergoregion_synchronisation.horizon_phase_lock',
            'Circuit 1: two driver modules, two oscillator banks, four impedance sheets and a memory node in superfluid He-3; one time in eight a fatigued VO2 sheet comes back.',
            'Circuito 1: dos módulos impulsores, dos bancos de osciladores, cuatro láminas de impedancia y un nodo de memoria en He-3 superfluido; una vez de cada ocho vuelve una lámina de VO2 fatigada.'],
        ['gtceu.recipe.grindless_ergoregion_synchronisation.relock_phase_lock',
            'Circuit 2: a spent phase lock is retuned with one new oscillator bank.',
            'Circuito 2: un bloqueo de fase gastado se reajusta con un banco de osciladores nuevo.']
    ]

    // [key, en, es] of the line recipes
    ;[
        ['gtceu.recipe.grindless_nuclear_clock.clock_steer_oscillator', 'Circuit 8: a clock-steering oscillator', 'Circuito 8: un oscilador de gu\u00eda de reloj'],
        ['gtceu.recipe.grindless_crystal_growth.sapphire_web_wafer', 'Circuit 30: a c-plane sapphire web wafer pulled from the alumina melt', 'Circuito 30: una oblea de zafiro en plano c extra\u00edda del fundido de alúmina'],
        ['gtceu.recipe.grindless_crystal_growth.sapphire_resonator_disc', 'Circuit 31: a sapphire boule for the whispering-gallery resonator disc', 'Circuito 31: un lingote de zafiro para el disco resonador de galer\u00eda susurrante'],
        ['gtceu.recipe.grindless_beuv_lithography.patterned_vo2_metasurface', 'Circuit 16: the VO2 film exposed with the metasurface pattern', 'Circuito 16: la pel\u00edcula de VO2 expuesta con el patr\u00f3n de la metasuperficie'],
        ['gtceu.recipe.grindless_mtj_sputtering.metallised_metasurface', 'Circuit 26: titanium and gold sputtered over the patterned VO2 film', 'Circuito 26: titanio y oro pulverizados sobre la pel\u00edcula de VO2 modelada'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.vo2_on_sapphire', 'Circuit 6: VO2 grown on the sapphire web wafer by pulsed laser deposition', 'Circuito 6: VO2 crecido sobre la oblea de zafiro por deposici\u00f3n l\u00e1ser pulsada'],
        ['gtceu.recipe.grindless_photonic_foundry.optical_phase_lock_unit', 'Circuit 27: an optical phase-lock unit', 'Circuito 27: una unidad de bloqueo de fase \u00f3ptico'],
        ['gtceu.recipe.grindless_single_crystal_casting.large_grain_nb_disc', 'Circuit 28: four niobium ingots drawn into one large-grain disc', 'Circuito 28: cuatro lingotes de niobio estirados en un disco de grano grande']
    ].forEach(function (e) { ENTRIES.push(e) })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
