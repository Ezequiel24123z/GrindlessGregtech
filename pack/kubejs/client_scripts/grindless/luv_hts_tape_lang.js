// priority: 7650
// Gregtech Grindless - names and tooltips of LuV's HTS tape line (startup_scripts/grindless/luv/hts_tape.js; package D2-TAPE).
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['material.gtceu.crude_metal_carbonyl', 'Crude Metal Carbonyl'],
        ['material.gtceu.nickel_tetracarbonyl', 'Nickel Tetracarbonyl'],
        ['material.gtceu.nickel_tungsten', 'Nickel-Tungsten Alloy'],
        ['gtceu.recipe.grindless_coated_conductor.textured_tape', 'Anneal the tapes in hydrogen and argon until the grains line up (cube texture).'],
        ['gtceu.recipe.grindless_coated_conductor.buffered_tape', 'Grow the yttria, YSZ and ceria buffer stack on the textured tapes.'],
        ['gtceu.recipe.grindless_coated_conductor.coated_tape', 'Deposit the ITBTC film on the buffer and anneal it in oxygen.'],
        ['gtceu.recipe.grindless_coated_conductor.capped_tape', 'Sputter a silver cap over the film and re-oxygenate it.'],
    ]

    // [name, en, tooltip 0]
    var ITEMS = [
        ['textured_nickel_tungsten_tape', 'Textured Nickel-Tungsten Tape', 'Rolled tape with its grains aligned. Next: the buffer layers.'],
        ['buffered_tape', 'Buffered Tape', 'Ceramic buffer stack on the tape. Next: the superconducting film.'],
        ['coated_tape', 'Coated Tape', 'The ITBTC film on its buffer. Next: the silver cap.'],
        ['capped_tape', 'Capped Tape', 'Film under a silver cap. Next: the copper laminate.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
