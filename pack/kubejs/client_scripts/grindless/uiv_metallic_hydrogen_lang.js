// priority: 3016
// Gregtech Grindless - names and tooltips of UIV's ramp-compression pulser (startup_scripts/grindless/uiv/metallic_hydrogen.js; package UIV-A2):
//
//   block.gtceu.ramp_compression_pulser, gtceu.ramp_compression   machine and recipe type names
//   grindless.machine.ramp_compression_pulser.tooltip.N           controller tooltips
//   gtceu.recipe.grindless_ramp_compression.<recipe>              the EMI line of each pulser recipe (the quench is named fiction)
//   material.gtceu.<fluid>                                        protium, para-hydrogen and liquid para-hydrogen
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.ramp_compression_pulser', 'Ramp-Compression Pulser', 'Pulsador de compresión en rampa'],
        ['gtceu.ramp_compression', 'Ramp Compression', 'Compresión en rampa'],

        ['material.gtceu.protium', 'Protium', 'Protio'],
        ['material.gtceu.para_hydrogen', 'Para-Hydrogen', 'Parahidrógeno'],
        ['material.gtceu.liquid_para_hydrogen', 'Liquid Para-Hydrogen', 'Parahidrógeno líquido'],

        ['grindless.machine.ramp_compression_pulser.tooltip.0',
            'A ring of pulsed-power coils that drives a shock ramp through a target: it makes metallic hydrogen, lonsdaleite and cubic gauche nitrogen.',
            'Un anillo de bobinas de potencia pulsada que lanza una rampa de choque por un blanco: fabrica hidrógeno metálico, lonsdaleíta y nitrógeno cúbico gauche.'],
        ['grindless.machine.ramp_compression_pulser.tooltip.1',
            'Circuit 1 metallic hydrogen from a solid para-H2 target, 2 lonsdaleite from pyrolytic graphite, 3 cubic gauche nitrogen from a laser-heated N2 charge.',
            'Circuito 1 hidrógeno metálico a partir de un blanco sólido de para-H2, 2 lonsdaleíta a partir de grafito pirolítico, 3 nitrógeno cúbico gauche a partir de una carga de N2 calentada con láser.'],
        ['grindless.machine.ramp_compression_pulser.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, optional fluid hatches. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, escotillas de fluidos opcionales. Acepta una escotilla de paralelos.'],

        ['gtceu.recipe.grindless_naquadria_magnets.mh_winding',
            'Circuit 7: a metallic hydrogen winding, 16 wires round tungsten plates (UIV-A2).',
            'Circuito 7: un bobinado de hidrógeno metálico, 16 hilos sobre placas de wolframio (UIV-A2).'],

        ['gtceu.recipe.grindless_ramp_compression.mh_quench',
            'Fiction: real metallic hydrogen needs about 400 GPa and reverts on release; here the pulser quenches it so the rod survives at one atmosphere. The hydrogen shards go back to the cryogenic plant.',
            'Ficción: el hidrógeno metálico real necesita unos 400 GPa y revierte al liberar la presión; aquí el pulsador lo templa y la barra sobrevive a una atmósfera. Los restos de hidrógeno vuelven a la planta criogénica.'],
        ['gtceu.recipe.grindless_ramp_compression.lonsdaleite_shock',
            'Shock-compressed pyrolytic graphite turns into hexagonal diamond; the unconverted graphite goes back to stock.',
            'El grafito pirolítico comprimido por choque se convierte en diamante hexagonal; el grafito sin convertir vuelve al almacén.'],
        ['gtceu.recipe.grindless_ramp_compression.cg_nitrogen_shock',
            'Fiction: real cubic gauche nitrogen needs about 110 GPa and decomposes on release; here the pulser quenches it. The spare N2 goes back to the cryogenic plant.',
            'Ficción: el nitrógeno cúbico gauche real necesita unos 110 GPa y se descompone al liberar la presión; aquí el pulsador lo templa. El N2 sobrante vuelve a la planta criogénica.']
    ]

    // [name, en, es, tooltip 0 en, tooltip 0 es, tooltip 1 en, tooltip 1 es]
    var ITEMS = [
        ['solid_para_h2_target', 'Solid Para-H2 Target', 'Blanco sólido de para-H2', 'Liquid para-hydrogen frozen in a superfluid helium bath.', 'Parahidrógeno líquido congelado en un baño de helio superfluido.', 'Compressed to metallic hydrogen in the pulser (circuit 1).', 'Se comprime a hidrógeno metálico en el pulsador (circuito 1).'],
        ['pyrolytic_graphite', 'Pyrolytic Graphite', 'Grafito pirolítico', 'Graphite laid down layer by layer from hot methane.', 'Grafito depositado capa a capa a partir de metano caliente.', 'Shocked into lonsdaleite in the pulser (circuit 2).', 'Se convierte en lonsdaleíta por choque en el pulsador (circuito 2).'],
        ['leached_lonsdaleite', 'Leached Lonsdaleite', 'Lonsdaleíta lixiviada', 'Shocked lonsdaleite with its graphite skin etched off.', 'Lonsdaleíta de choque con la piel de grafito disuelta.', 'Cut into a race in a laser engraver.', 'Se corta en una pista en un grabador láser.'],
        ['lonsdaleite_race', 'Lonsdaleite Race', 'Pista de lonsdaleíta', 'A bearing race cut from hexagonal diamond.', 'Una pista de rodamiento tallada en diamante hexagonal.', 'Two races and a tungsten plate make a bearing.', 'Dos pistas y una placa de wolframio forman un rodamiento.'],
        ['lonsdaleite_bearing', 'Lonsdaleite Bearing', 'Rodamiento de lonsdaleíta', 'Harder than diamond, and it runs in lubricant.', 'Más duro que el diamante, y trabaja en lubricante.', 'Goes into the UIV electric piston.', 'Va en el pistón eléctrico UIV.'],
        ['dac_charge', 'DAC Charge', 'Carga de DAC', 'Nitrogen sealed in a diamond anvil cell.', 'Nitrógeno sellado en una celda de yunque de diamante.', 'Heated with a laser before the pulser.', 'Se calienta con un láser antes del pulsador.'],
        ['laser_heated_n2_charge', 'Laser-Heated N2 Charge', 'Carga de N2 calentada con láser', 'Nitrogen heated past 2000 K inside its cell.', 'Nitrógeno calentado por encima de 2000 K dentro de su celda.', 'Shocked into cubic gauche nitrogen in the pulser (circuit 3).', 'Se convierte en nitrógeno cúbico gauche por choque en el pulsador (circuito 3).'],
        ['quenched_cg_nitrogen', 'Quenched cg-N', 'cg-N templado', 'Cubic gauche nitrogen that survives at one atmosphere (fiction).', 'Nitrógeno cúbico gauche que sobrevive a una atmósfera (ficción).', 'The polymeric nitrogen the fuel lines will use.', 'El nitrógeno polimérico que usarán las líneas de combustible.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1], i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[3], i[4]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[5], i[6]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
