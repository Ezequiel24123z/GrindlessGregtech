// Gregtech Grindless - names and tooltips of OpV's antimatter machines and the items of the antimatter lines
// (startup_scripts/grindless/opv/antimatter.js; package OpV-B3):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   item.grindless.<item>, tooltip.grindless.<item>.N  the items this package registers
//   grindless.machine.<machine>.tooltip.N              controller tooltips: one line of function, then one line per thing accepted
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.antihydrogen_foundry', 'Antihydrogen Foundry', 'Fundición de antihidrógeno'],
        ['block.gtceu.annihilation_engine', 'Annihilation Engine', 'Motor de aniquilación'],
        ['gtceu.antihydrogen_synthesis', 'Antihydrogen Synthesis', 'Síntesis de antihidrógeno'],
        ['gtceu.annihilation_power', 'Annihilation Power', 'Energía de aniquilación'],

        ['item.grindless.trapped_antihydrogen', 'Trapped Antihydrogen', 'Antihidrógeno atrapado'],
        ['tooltip.grindless.trapped_antihydrogen.0', 'Antihydrogen held in an octupole trap.', 'Antihidrógeno retenido en una trampa octupolar.'],
        ['tooltip.grindless.trapped_antihydrogen.1', 'Made in the antihydrogen foundry; laser cooling comes next.', 'Se hace en la fundición de antihidrógeno; el enfriado láser va después.'],
        ['item.grindless.cooled_antihydrogen', 'Cooled Antihydrogen', 'Antihidrógeno enfriado'],
        ['tooltip.grindless.cooled_antihydrogen.0', 'Antihydrogen cooled with Lyman-alpha light.', 'Antihidrógeno enfriado con luz Lyman-alfa.'],
        ['tooltip.grindless.cooled_antihydrogen.1', 'The foundry freezes it into ice in levitation cells.', 'La fundición lo congela en hielo dentro de celdas de levitación.'],
        ['item.grindless.activated_absorber_tile', 'Activated Absorber Tile', 'Baldosa absorbente activada'],
        ['tooltip.grindless.activated_absorber_tile.0', 'A gamma absorber tile that has taken neutrons.', 'Una baldosa absorbente de gammas que ha captado neutrones.'],
        ['tooltip.grindless.activated_absorber_tile.1', 'Goes to the hot cell to decay; its tungsten and helium are recovered.', 'Va a la celda caliente a decaer; se recuperan su wolframio y su helio.'],
        ['item.grindless.spent_acmf_hohlraum', 'Spent ACMF Hohlraum', 'Hohlraum de ACMF gastado'],
        ['tooltip.grindless.spent_acmf_hohlraum.0', 'The tungsten-rhenium case of a fired ACMF pellet.', 'La carcasa de wolframio y renio de un pellet ACMF disparado.'],
        ['tooltip.grindless.spent_acmf_hohlraum.1', 'The actinide partitioning plant takes the curium back out.', 'La planta de partición de actínidos recupera el curio.'],

        ['grindless.machine.antihydrogen_foundry.tooltip.0',
            '\u00a77Traps, cools and freezes antihydrogen.',
            '\u00a77Atrapa, enfría y congela antihidrógeno.'],
        ['grindless.machine.antihydrogen_foundry.tooltip.1',
            'About 5% of the antihydrogen annihilates in the trap.',
            'Cerca de un 5 % del antihidrógeno se aniquila en la trampa.'],
        ['grindless.machine.annihilation_engine.tooltip.0',
            '\u00a77Power from matter and antimatter annihilating.',
            '\u00a77Energía de la aniquilación de materia y antimateria.'],
        ['grindless.machine.annihilation_engine.tooltip.1',
            'Dynamo: 1 OpV 1 A hatch, or a 4 A one for the second recipe.',
            'Dinamo: 1 escotilla OpV de 1 A, o una de 4 A para la segunda receta.'],
        ['grindless.machine.annihilation_engine.tooltip.2',
            'The neutrinos leave and are lost.',
            'Los neutrinos se van y se pierden.'],

        ['emi.grindless.info.antihydrogen_foundry.0',
            'Antiprotons from Cygnus X-1 orbit and positrons from home meet in an octupole trap. The foundry traps the atoms, cools them with a Lyman-alpha laser and freezes them into ice in levitation trap cells. Every step wears its magnet or laser a little and returns the empty Penning traps.',
            'Los antiprotones de la órbita de Cygnus X-1 y los positrones de casa se encuentran en una trampa octupolar. La fundición atrapa los átomos, los enfría con un láser Lyman-alfa y los congela en hielo dentro de celdas de trampa de levitación. Cada paso desgasta un poco su imán o su láser y devuelve las trampas de Penning vacías.'],
        ['emi.grindless.info.antihydrogen_foundry.1',
            'About 5% of the antihydrogen annihilates in the trap each step; that is gamma heat in the shield casing walls, a stated loss with no item. The ice cell feeds the annihilation engine. The hatches sit on the back wall: 1-2 input buses, 1 output bus, 1-2 energy hatches.',
            'Cerca de un 5 % del antihidrógeno se aniquila en la trampa en cada paso; es calor de gammas en las paredes de carcasa blindada, una pérdida declarada sin objeto. La celda de hielo alimenta el motor de aniquilación. Las escotillas van en la pared trasera: 1-2 buses de entrada, 1 de salida, 1-2 escotillas de energía.'],
        ['emi.grindless.info.annihilation_engine.0',
            'Only the home engine burns antimatter: either an antihydrogen ice cell with hydrogen, or an ACMF pellet with a stack of antiprotons. The pion gammas wear a gamma absorber tile, 1/16 a run; the activated tile goes to the hot cell and the emptied levitation cell comes back.',
            'Solo el motor de casa quema antimateria: o una celda de hielo de antihidrógeno con hidrógeno, o un pellet ACMF con una pila de antiprotones. Los gammas de los piones desgastan una baldosa absorbente, 1/16 por ejecución; la baldosa activada va a la celda caliente y la celda de levitación vacía vuelve.'],
        ['emi.grindless.info.annihilation_engine.1',
            'Generous, never free: the ice cell chain costs about 3.9e11 EU a cell and one run returns 6.4e11 EU, about 1.7 times. Half of each annihilation leaves as neutrinos and is lost. It writes 2^29 EU/t (1 A OpV dynamo hatch) or 2^30 EU/t (4 A), one run at a time.',
            'Generosa, nunca gratis: la cadena de la celda de hielo cuesta unos 3,9e11 EU por celda y una ejecución devuelve 6,4e11 EU, unas 1,7 veces. La mitad de cada aniquilación se va en neutrinos y se pierde. Da 2^29 EU/t (escotilla de dinamo OpV de 1 A) o 2^30 EU/t (4 A), de una en una.'],

        ['gtceu.recipe.grindless_antihydrogen_synthesis.trap_antihydrogen',
            'Circuit 1: four cold antiproton cells and four dense positron cells make four trapped antihydrogen; the octupole magnet wears 1/64, 5% annihilates, 90% of the Penning traps return.',
            'Circuito 1: cuatro celdas de antiprotones fríos y cuatro de positrones densos dan cuatro antihidrógenos atrapados; el imán octupolar se desgasta 1/64, un 5 % se aniquila, vuelve el 90 % de las trampas de Penning.'],
        ['gtceu.recipe.grindless_antihydrogen_synthesis.laser_cool',
            'Circuit 2: Lyman-alpha light cools the trapped atoms; the laser wears 1/128, 5% annihilates.',
            'Circuito 2: la luz Lyman-alfa enfría los átomos atrapados; el láser se desgasta 1/128, un 5 % se aniquila.'],
        ['gtceu.recipe.grindless_antihydrogen_synthesis.freeze_ice',
            'Circuit 3: the cooled atoms freeze into ice in four levitation trap cells; 5% annihilates.',
            'Circuito 3: los átomos enfriados se congelan en hielo en cuatro celdas de trampa de levitación; un 5 % se aniquila.'],
        ['gtceu.recipe.grindless_annihilation_power.burn_ice',
            'Circuit 1: an ice cell and 1,000 mB of hydrogen annihilate: 2^29 EU/t for 1,200 t. The tile wears 1/16, 95% of the levitation cells return.',
            'Circuito 1: una celda de hielo y 1.000 mB de hidrógeno se aniquilan: 2^29 EU/t durante 1.200 t. La baldosa se desgasta 1/16, vuelve el 95 % de las celdas de levitación.'],
        ['gtceu.recipe.grindless_annihilation_power.burn_pellet',
            'Circuit 2: an ACMF pellet and a stack of antiprotons: 2^30 EU/t for 1,200 t. The tile wears 1/16; the spent hohlraum goes to the actinide plant.',
            'Circuito 2: un pellet ACMF y una pila de antiprotones: 2^30 EU/t durante 1.200 t. La baldosa se desgasta 1/16; el hohlraum gastado va a la planta de actínidos.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
