// priority: 6649
// Gregtech Grindless - names and tooltips of MAX's segment reclamation works (startup_scripts/grindless/max/reclamation.js; package MX-S4):
//
//   gtceu.<type>                                       recipe type name (the controller's block name is F1's, max_foundation_lang.js)
//   grindless.machine.<machine>.tooltip.N              controller tooltip
//   emi.grindless.info.<machine>.N                     the EMI info page of the controller
//   emi.grindless.info.<casing>.0                      the EMI info page of the machine's own casing
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe of the package's type and of its older rows
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.segment_reclamation', 'Segment Reclamation'],

        ['grindless.machine.segment_reclamation_works.tooltip.0',
            '\u00a77Opens a worn mirror-shell segment into seven part streams.'],

        ['emi.grindless.info.segment_reclamation_works.0',
            'A segment ablated by the vent of the mirror shell is docked in a cold bay and stripped down to its parts: truss (to the cluster-light furnace), membrane scrap (line L52), cryocooler scrap (line L53), coupler scrap, Sn-Li dross, electronics scrap and a fatigued VO2 sheet. It runs at Sgr A* orbit only: the segment cannot be carried out of the shell\'s light.'],
        ['emi.grindless.info.segment_reclamation_works.1',
            'Every stream has a home. Coupler scrap goes to an electromagnetic separator (tetrataenite concentrate), Sn-Li dross to the extraction cascade (Sn-Li eutectic), electronics scrap to an arc furnace (silicon and carbon). Membrane scrap is bioleached, solvent-extracted, precipitated as oxalates and calcined back to the YBCO precursor; cryocooler scrap is ground, separated and extracted into holmium and erbium oxide.'],

        ['emi.grindless.info.reclamation_bay_casing.0',
            'A structure block: the cold walls of the Segment Reclamation Works. Made in the assembler.'],

        ['gtceu.recipe.grindless_segment_reclamation.segment_streams', 'Circuit 1: one ablated shell segment is opened into truss, membrane, cryocooler, coupler, Sn-Li, electronics and VO2 streams.'],
        ['gtceu.recipe.grindless_biofoundry.bioleached_re_liquor', 'Bioleached rare-earth liquor']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
