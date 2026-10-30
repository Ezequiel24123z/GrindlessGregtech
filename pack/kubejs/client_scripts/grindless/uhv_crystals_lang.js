// priority: 4800
// Gregtech Grindless - names and tooltips of UHV's clock and crystals (startup_scripts/grindless/uhv/crystals.js; package UHV-A2):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items (the F1 items are in uhv_foundation_lang.js)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.nuclear_clock_lab', 'Nuclear Clock Lab', 'Laboratorio del reloj nuclear'],
        ['gtceu.nuclear_clock', 'Nuclear Clock', 'Reloj nuclear'],
        ['block.gtceu.crystal_growth_furnace', 'Crystal Growth Furnace', 'Horno de crecimiento de cristales'],
        ['gtceu.crystal_growth', 'Crystal Growth', 'Crecimiento de cristales'],

        ['grindless.machine.nuclear_clock_lab.tooltip.0',
            '§7Locks a VUV comb to thorium-229 to build a nuclear clock.',
            '§7Fija un peine VUV al torio-229 para construir un reloj nuclear.'],

        ['grindless.machine.crystal_growth_furnace.tooltip.0',
            '§7Grows oxide, fluoride and III-V single crystals under argon.',
            '§7Hace crecer monocristales de óxidos, fluoruros y III-V bajo argón.'],
        ['grindless.machine.crystal_growth_furnace.no_voiding',
            'Voiding is off: a worn iridium crucible must never be thrown away.',
            'El desecho está desactivado: un crisol de iridio gastado nunca debe tirarse.'],

        ['gtceu.recipe.grindless_nuclear_clock.comb',
            'Circuit 1: a VUV frequency comb by high harmonics in xenon; the xenon is never used up',
            'Circuito 1: un peine de frecuencias VUV por armónicos altos en xenón; el xenón nunca se gasta'],
        ['gtceu.recipe.grindless_nuclear_clock.clock',
            'Circuit 2: the comb locked to the thorium-229 isomer: a nuclear clock',
            'Circuito 2: el peine enganchado al isómero del torio-229: un reloj nuclear'],
        ['gtceu.recipe.grindless_crystal_growth.lithium_niobate',
            'Circuit 1: lithium niobate by Czochralski from an iridium crucible',
            'Circuito 1: niobato de litio por Czochralski desde un crisol de iridio'],
        ['gtceu.recipe.grindless_crystal_growth.vuv_caf2',
            'Circuit 2: VUV calcium fluoride by vertical gradient freeze; the lead fluoride scavenger is never used up',
            'Circuito 2: fluoruro de calcio VUV por congelación por gradiente vertical; el captador de fluoruro de plomo nunca se gasta'],
        ['gtceu.recipe.grindless_crystal_growth.thorium_caf2',
            'Circuit 3: calcium fluoride doped with thorium-229; the lead fluoride scavenger is never used up',
            'Circuito 3: fluoruro de calcio dopado con torio-229; el captador de fluoruro de plomo nunca se gasta'],
        ['gtceu.recipe.grindless_crystal_growth.eu_yso',
            'Circuit 4: europium-doped yttrium orthosilicate by Czochralski from an iridium crucible',
            'Circuito 4: ortosilicato de itrio dopado con europio por Czochralski desde un crisol de iridio'],
        ['gtceu.recipe.grindless_crystal_growth.inp',
            'Circuit 5: indium phosphide by liquid-encapsulated Czochralski; the boron oxide cap is never used up',
            'Circuito 5: fosfuro de indio por Czochralski encapsulado en líquido; la capa de óxido de boro nunca se gasta'],

        ['item.grindless.vuv_frequency_comb', 'VUV Frequency Comb', 'Peine de frecuencias VUV'],
        ['tooltip.grindless.vuv_frequency_comb.0',
            'A fibre laser\'s comb pushed to the vacuum ultraviolet by high harmonics in xenon.',
            'El peine de un láser de fibra llevado al ultravioleta de vacío por armónicos altos en xenón.'],
        ['tooltip.grindless.vuv_frequency_comb.1',
            'Made by the nuclear clock lab (circuit 1). Locked to thorium-229, it becomes a nuclear clock.',
            'Lo fabrica el laboratorio del reloj nuclear (circuito 1). Enganchado al torio-229, se convierte en un reloj nuclear.'],
        ['item.grindless.vuv_caf2_optic', 'VUV CaF2 Optic', 'Óptica de CaF2 VUV'],
        ['tooltip.grindless.vuv_caf2_optic.0',
            'A polished calcium fluoride window, clear down to the vacuum ultraviolet.',
            'Una ventana pulida de fluoruro de calcio, transparente hasta el ultravioleta de vacío.'],
        ['tooltip.grindless.vuv_caf2_optic.1',
            'Cut from a VUV CaF2 boule in a cutter. Two go into each VUV frequency comb.',
            'Se corta de un lingote de CaF2 VUV en una cortadora. Dos van en cada peine de frecuencias VUV.'],
        ['item.grindless.iridium_crucible', 'Iridium Crucible', 'Crisol de iridio'],
        ['tooltip.grindless.iridium_crucible.0',
            'Eight ingots of iridium, the only metal that holds an oxide melt at 2,000 °C.',
            'Ocho lingotes de iridio, el único metal que aguanta un fundido de óxidos a 2.000 °C.'],
        ['tooltip.grindless.iridium_crucible.1',
            'Made in an assembler (circuit 24). The crystal growth furnace wears one out in 1 run in 32.',
            'Se fabrica en un ensamblador (circuito 24). El horno de crecimiento de cristales gasta uno en 1 de cada 32 ciclos.'],
        ['item.grindless.worn_iridium_crucible', 'Worn Iridium Crucible', 'Crisol de iridio gastado'],
        ['tooltip.grindless.worn_iridium_crucible.0',
            'Thinned, pitted and crusted with oxide melt.',
            'Adelgazado, picado y cubierto de fundido de óxidos.'],
        ['tooltip.grindless.worn_iridium_crucible.1',
            'Goes back to iridium in the platinum plant (circuit 5): 7 of its 8 ingots come back.',
            'Vuelve a iridio en la planta de platino (circuito 5): vuelven 7 de sus 8 lingotes.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
