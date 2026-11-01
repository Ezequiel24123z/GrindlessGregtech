// priority: 4800
// Gregtech Grindless - names and tooltips of UHV's clock and crystals (startup_scripts/grindless/uhv/crystals.js; package UHV-A2):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items (the F1 items are in uhv_foundation_lang.js)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.nuclear_clock_lab', 'Nuclear Clock Lab'],
        ['gtceu.nuclear_clock', 'Nuclear Clock'],
        ['block.gtceu.crystal_growth_furnace', 'Crystal Growth Furnace'],
        ['gtceu.crystal_growth', 'Crystal Growth'],

        ['grindless.machine.nuclear_clock_lab.tooltip.0',
            '§7Locks a VUV comb to thorium-229 to build a nuclear clock.'],

        ['grindless.machine.crystal_growth_furnace.tooltip.0',
            '§7Grows oxide, fluoride and III-V single crystals under argon.'],
        ['grindless.machine.crystal_growth_furnace.no_voiding',
            'Voiding is off: a worn iridium crucible must never be thrown away.'],

        ['gtceu.recipe.grindless_nuclear_clock.comb',
            'Circuit 1: a VUV frequency comb by high harmonics in xenon; the xenon is never used up'],
        ['gtceu.recipe.grindless_nuclear_clock.clock',
            'Circuit 2: the comb locked to the thorium-229 isomer: a nuclear clock'],
        ['gtceu.recipe.grindless_crystal_growth.lithium_niobate',
            'Circuit 1: lithium niobate by Czochralski from an iridium crucible'],
        ['gtceu.recipe.grindless_crystal_growth.vuv_caf2',
            'Circuit 2: VUV calcium fluoride by vertical gradient freeze; the lead fluoride scavenger is never used up'],
        ['gtceu.recipe.grindless_crystal_growth.thorium_caf2',
            'Circuit 3: calcium fluoride doped with thorium-229; the lead fluoride scavenger is never used up'],
        ['gtceu.recipe.grindless_crystal_growth.eu_yso',
            'Circuit 4: europium-doped yttrium orthosilicate by Czochralski from an iridium crucible'],
        ['gtceu.recipe.grindless_crystal_growth.inp',
            'Circuit 5: indium phosphide by liquid-encapsulated Czochralski; the boron oxide cap is never used up'],

        ['item.grindless.vuv_frequency_comb', 'VUV Frequency Comb'],
        ['tooltip.grindless.vuv_frequency_comb.0',
            'A fibre laser\'s comb pushed to the vacuum ultraviolet by high harmonics in xenon.'],
        ['tooltip.grindless.vuv_frequency_comb.1',
            'Made by the nuclear clock lab (circuit 1). Locked to thorium-229, it becomes a nuclear clock.'],
        ['item.grindless.vuv_caf2_optic', 'VUV CaF2 Optic'],
        ['tooltip.grindless.vuv_caf2_optic.0',
            'A polished calcium fluoride window, clear down to the vacuum ultraviolet.'],
        ['tooltip.grindless.vuv_caf2_optic.1',
            'Cut from a VUV CaF2 boule in a cutter. Two go into each VUV frequency comb.'],
        ['item.grindless.iridium_crucible', 'Iridium Crucible'],
        ['tooltip.grindless.iridium_crucible.0',
            'Eight ingots of iridium, the only metal that holds an oxide melt at 2,000 °C.'],
        ['tooltip.grindless.iridium_crucible.1',
            'Made in an assembler (circuit 24). The crystal growth furnace wears one out in 1 run in 32.'],
        ['item.grindless.worn_iridium_crucible', 'Worn Iridium Crucible'],
        ['tooltip.grindless.worn_iridium_crucible.0',
            'Thinned, pitted and crusted with oxide melt.'],
        ['tooltip.grindless.worn_iridium_crucible.1',
            'Goes back to iridium in the platinum plant (circuit 5): 7 of its 8 ingots come back.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
