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
            '\u00a77Fija una envoltura al giro de Sgr A*: bloqueos de fase. Solo funciona en su órbita.'],

        ['emi.grindless.info.ergoregion_synchroniser.0',
            'Two SRF driver modules, a pair of calibrated oscillator banks and four tunable impedance sheets are tuned against a quantum memory node in a superfluid He-3 bath until the whole assembly follows the frame dragging of the black hole: a horizon phase lock. Every shell of the mirror swarm needs one. A fatigued VO2 sheet comes out one time in eight; the extraction cascade (circuit 32) turns it back into vanadium pentoxide and sapphire dust.',
            'Dos módulos impulsores SRF, un par de bancos de osciladores calibrados y cuatro láminas de impedancia sintonizable se afinan contra un nodo de memoria cuántica en un baño de He-3 superfluido hasta que el conjunto sigue el arrastre de marco del agujero negro: un bloqueo de fase del horizonte. Cada envoltura del enjambre de espejos necesita uno. Una vez de cada ocho sale una lámina de VO2 fatigada; la cascada de extracción (circuito 32) la devuelve a pentóxido de vanadio y polvo de zafiro.'],
        ['emi.grindless.info.ergoregion_synchroniser.1',
            'Circuit 2 relocks a spent phase lock with one fresh oscillator bank. The sheets are lines L50 (VO2 on sapphire, patterned and metallised), the driver modules are L51 (niobium cavities, Nb3Sn layer, conduction cooling) and the oscillator banks are L55 (sapphire resonators, nuclear clock, photonic foundry).',
            'El circuito 2 reajusta un bloqueo de fase gastado con un banco de osciladores nuevo. Las láminas son la línea L50 (VO2 sobre zafiro, modelado y metalizado), los módulos impulsores la L51 (cavidades de niobio, capa de Nb3Sn, refrigeración por conducción) y los bancos de osciladores la L55 (resonadores de zafiro, reloj nuclear, fundición fotónica).'],

        ['gtceu.recipe.grindless_ergoregion_synchronisation.horizon_phase_lock',
            'Circuit 1: two driver modules, two oscillator banks, four impedance sheets and a memory node in superfluid He-3; one time in eight a fatigued VO2 sheet comes back.',
            'Circuito 1: dos módulos impulsores, dos bancos de osciladores, cuatro láminas de impedancia y un nodo de memoria en He-3 superfluido; una vez de cada ocho vuelve una lámina de VO2 fatigada.'],
        ['gtceu.recipe.grindless_ergoregion_synchronisation.relock_phase_lock',
            'Circuit 2: a spent phase lock is retuned with one new oscillator bank.',
            'Circuito 2: un bloqueo de fase gastado se reajusta con un banco de osciladores nuevo.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
