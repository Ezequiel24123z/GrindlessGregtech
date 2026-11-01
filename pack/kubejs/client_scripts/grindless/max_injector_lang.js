// priority: 6656
// Gregtech Grindless - names and tooltips of MAX's mass stream injector (startup_scripts/grindless/max/injector.js; package MAX-D4):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each row of the package that has one
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.mass_stream_injector', 'Mass Stream Injector'],
        ['gtceu.mass_stream_injection', 'Mass Stream Injection'],
        ['grindless.machine.mass_stream_injector.tooltip.0', '\u00a77Packs stream pellets into stream bundles and re-casts the spent ones.'],
        ['emi.grindless.info.mass_stream_injector.0', 'Sixty-four stream pellets, four max field coils and flux-loaded FRC are packed into one stream bundle at Sgr A*. The spent pellets come out and the cooled exhaust goes to the mass filter. The recipes run only at Sgr A* (gcyr:black_hole_orbit).'],
        ['emi.grindless.info.mass_stream_injector.1', 'Seven in eight spent pellets are re-cast into stream pellets. Pellets are made from furnace blanks (megabar press, lathe, SRF works, canner).'],
        ['emi.grindless.info.stream_turn_casing.0', 'A structure block: a magnet turn of the Mass Stream Injector ring. Made in the assembler.'],
        ['gtceu.recipe.grindless_mass_stream_injection.stream_bundle', 'Circuit 1: 64 stream pellets and four field coils are packed into a stream bundle; the spent pellets and the cooled exhaust come out.'],
        ['gtceu.recipe.grindless_mass_stream_injection.pellet_recast', 'Circuit 2: a spent pellet is re-cast; seven in eight come back.'],
        ['gtceu.recipe.grindless_megabar.pellet_press', 'Circuit 10: pellet blanks are pressed under the anvil into dense pellets.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
