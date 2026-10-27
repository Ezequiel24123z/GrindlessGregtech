// priority: 3600
// Gregtech Grindless - names and tooltips of UHV's organoid array (startup_scripts/grindless/uhv/wetware.js; package UHV-B6):
//
//   block.gtceu.organoid_array, gtceu.organoid_computing          machine and recipe type names
//   grindless.machine.organoid_array.tooltip.N / .no_voiding     controller tooltips and the refusal to void
//
// No new items: the organoid processor and the sterilised growth medium are F1's (uhv_foundation_lang.js).
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.organoid_array', 'Organoid Array', 'Conjunto de organoides'],
        ['gtceu.organoid_computing', 'Organoid Computing', 'Computación con organoides'],

        ['grindless.machine.organoid_array.tooltip.0',
            'Cortical Labs\' CL1 and FinalSpark\'s Neuroplatform at scale: human cortical organoids grown on microelectrode arrays and wired into GregTech\'s wetware mainframe. Earth only.',
            'El CL1 de Cortical Labs y la Neuroplatform de FinalSpark a escala: organoides corticales humanos cultivados sobre matrices de microelectrodos y cableados en el mainframe de wetware de GregTech. Solo en la Tierra.'],
        ['grindless.machine.organoid_array.tooltip.1',
            'Circuit 1: 4 stem cells on a chitosan scaffold, with ultrapure water and sterilised growth medium, grow an organoid processor. 2: 4 organoid processors, 4 neuro processing units, a SiC power module and an optical assembly make 4 wetware mainframes.',
            'Circuito 1: 4 células madre sobre un andamio de quitosano, con agua ultrapura y medio de cultivo esterilizado, crecen un procesador de organoides. 2: 4 procesadores de organoides, 4 unidades de neuroprocesamiento, un módulo de potencia de SiC y un conjunto óptico hacen 4 mainframes de wetware.'],
        ['grindless.machine.organoid_array.tooltip.2',
            'The sterilised medium comes from the LuV organoid lab (circuit 3, a xeno radioprotectant; give the lab an output hatch). The spent medium leaves as bacterial sludge for the biofoundry\'s mutagen.',
            'El medio esterilizado viene del laboratorio de organoides de LuV (circuito 3, un radioprotector xeno; dale al laboratorio una escotilla de salida). El medio gastado sale como lodo bacteriano para el mutágeno de la biofundición.'],
        ['grindless.machine.organoid_array.tooltip.3',
            'A 7x5x7 plascrete clean room with perfusion racks and a sterilizing filter ceiling. Parts go in the floor: 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output buses, 1-2 output hatches.',
            'Una sala limpia de plascreto de 7x5x7 con bastidores de perfusión y un techo de filtros esterilizantes. Las piezas van en el suelo: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 escotillas de entrada, 1-2 buses de salida, 1-2 escotillas de salida.'],
        ['grindless.machine.organoid_array.no_voiding',
            'Voiding is off: the spent medium goes back to the biofoundry and must never be thrown away.',
            'El desecho está desactivado: el medio gastado vuelve a la biofundición y nunca debe tirarse.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
