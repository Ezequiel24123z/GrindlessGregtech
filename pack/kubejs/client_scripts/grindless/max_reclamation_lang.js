// priority: 6649
// Gregtech Grindless - names and tooltips of MAX's segment reclamation works (startup_scripts/grindless/max/reclamation.js; package MX-S4):
//
//   gtceu.<type>                                       recipe type name (the controller's block name is F1's, max_foundation_lang.js)
//   grindless.machine.<machine>.tooltip.N              controller tooltip
//   emi.grindless.info.<machine>.N                     the EMI info page of the controller
//   emi.grindless.info.<casing>.0                      the EMI info page of the machine's own casing
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe of the package's type and of its older rows
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.segment_reclamation', 'Segment Reclamation', 'Reciclaje de segmentos'],

        ['grindless.machine.segment_reclamation_works.tooltip.0',
            '\u00a77Opens a worn mirror-shell segment into seven part streams.',
            '\u00a77Abre un segmento desgastado de la envoltura en siete flujos de piezas.'],

        ['emi.grindless.info.segment_reclamation_works.0',
            'A segment ablated by the vent of the mirror shell is docked in a cold bay and stripped down to its parts: truss (to the cluster-light furnace), membrane scrap (line L52), cryocooler scrap (line L53), coupler scrap, Sn-Li dross, electronics scrap and a fatigued VO2 sheet. It runs at Sgr A* orbit only: the segment cannot be carried out of the shell\'s light.',
            'Un segmento ablacionado por la ventilaci\u00f3n de la envoltura de espejos se acopla en una bah\u00eda fr\u00eda y se desmonta en sus piezas: cercha (al horno de luz de c\u00famulo), chatarra de membrana (l\u00ednea L52), chatarra de criorrefrigerador (l\u00ednea L53), chatarra de acoplador, escoria de Sn-Li, chatarra de electr\u00f3nica y una l\u00e1mina de VO2 fatigada. Solo funciona en la \u00f3rbita de Sgr A*: el segmento no puede sacarse de la luz de la envoltura.'],
        ['emi.grindless.info.segment_reclamation_works.1',
            'Every stream has a home. Coupler scrap goes to an electromagnetic separator (tetrataenite concentrate), Sn-Li dross to the extraction cascade (Sn-Li eutectic), electronics scrap to an arc furnace (silicon and carbon). Membrane scrap is bioleached, solvent-extracted, precipitated as oxalates and calcined back to the YBCO precursor; cryocooler scrap is ground, separated and extracted into holmium and erbium oxide.',
            'Cada flujo tiene destino. La chatarra de acoplador va a un separador electromagn\u00e9tico (concentrado de tetrataenita), la escoria de Sn-Li a la cascada de extracci\u00f3n (eut\u00e9ctico Sn-Li), la chatarra de electr\u00f3nica a un horno de arco (silicio y carbono). La de membrana se biolixivia, se extrae con disolvente, se precipita como oxalatos y se calcina hasta el precursor de YBCO; la del criorrefrigerador se muele, se separa y se extrae en \u00f3xido de holmio y erbio.'],

        ['emi.grindless.info.reclamation_bay_casing.0',
            'A structure block: the cold walls of the Segment Reclamation Works. Made in the assembler.',
            'Un bloque de estructura: las paredes fr\u00edas del Taller de reciclaje de segmentos. Se hace en el ensamblador.'],

        ['gtceu.recipe.grindless_segment_reclamation.segment_streams', 'Circuit 1: one ablated shell segment is opened into truss, membrane, cryocooler, coupler, Sn-Li, electronics and VO2 streams.',
            'Circuito 1: un segmento ablacionado se abre en flujos de cercha, membrana, criorrefrigerador, acoplador, Sn-Li, electr\u00f3nica y VO2.'],
        ['gtceu.recipe.grindless_biofoundry.bioleached_re_liquor', 'Bioleached rare-earth liquor',
            'Licor de tierras raras biolixiviado']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
