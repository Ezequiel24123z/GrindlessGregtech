// priority: 1300
// Gregtech Grindless - names and tooltips of ZPM's Europium Reductor and the GT materials of its line
// (startup_scripts/grindless/zpm/europium.js):
//
//   gtceu:europium_reductor                        (machine name + tooltips)
//   gtceu:valence_reduction                        (recipe type name)
//   material.gtceu.<europium_chloride_solution / europium_sulfate / europium_oxide / zinc_sulfate / lanthanum_oxide>
//   item.gtceu.<form>                              (es_es only: the Spanish names of the dust forms, as in ev_extraction_cascade_lang.js)
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.europium_reductor', 'Europium Reductor')
    add('gtceu.valence_reduction', 'Valence Reduction')

    add('grindless.machine.europium_reductor.tooltip.0', '§7Reduces europium to its divalent form.')

    add('material.gtceu.europium_chloride_solution', 'Europium Chloride Solution')
    add('material.gtceu.europium_sulfate', 'Europium Sulfate')
    add('material.gtceu.europium_oxide', 'Europium Oxide')
    add('material.gtceu.zinc_sulfate', 'Zinc Sulfate')
    add('material.gtceu.lanthanum_oxide', 'Lanthanum Oxide')

    add('tooltip.grindless.europium_chloride_solution', 'Made by the extraction cascade\'s ZPM mode (circuit 5) from GTCA\'s monazite froth. Only the Europium Reductor takes it.')
    add('tooltip.grindless.europium_sulfate', 'Divalent europium, the step between the solution and the oxide. Fire it in the Europium Reductor (circuit 2).')
    add('tooltip.grindless.europium_oxide', 'Reduce it with lanthanum in the Europium Reductor (circuit 3) to get europium dust.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.europium_reductor', 'Reductor de europio')
    add('gtceu.valence_reduction', 'Reducción de valencia')

    add('grindless.machine.europium_reductor.tooltip.0', '§7Reduce el europio a su forma divalente.')

    add('material.gtceu.europium_chloride_solution', 'Solución de cloruro de europio')
    add('material.gtceu.europium_sulfate', 'Sulfato de europio')
    add('material.gtceu.europium_oxide', 'Óxido de europio')
    add('material.gtceu.zinc_sulfate', 'Sulfato de zinc')
    add('material.gtceu.lanthanum_oxide', 'Óxido de lantano')

    add('tooltip.grindless.europium_chloride_solution', 'La hace el modo ZPM de la cascada de extracción (circuito 5) con la espuma de monacita de GTCA. Solo el Reductor de europio la usa.')
    add('tooltip.grindless.europium_sulfate', 'Europio divalente, el paso entre la solución y el óxido. Calcínalo en el Reductor de europio (circuito 2).')
    add('tooltip.grindless.europium_oxide', 'Redúcelo con lantano en el Reductor de europio (circuito 3) para obtener polvo de europio.')

    var dusts = function (material, name) {
        add('item.gtceu.' + material + '_dust', 'Polvo de ' + name)
        add('item.gtceu.small_' + material + '_dust', 'Montón pequeño de polvo de ' + name)
        add('item.gtceu.tiny_' + material + '_dust', 'Montón diminuto de polvo de ' + name)
    }
    dusts('europium_sulfate', 'sulfato de europio')
    dusts('europium_oxide', 'óxido de europio')
    dusts('zinc_sulfate', 'sulfato de zinc')
    dusts('lanthanum_oxide', 'óxido de lantano')
})

ItemEvents.tooltip(event => {
    event.add('gtceu:europium_chloride_solution_bucket', Text.translate('tooltip.grindless.europium_chloride_solution').gray())
    event.add(['gtceu:europium_sulfate_dust', 'gtceu:small_europium_sulfate_dust', 'gtceu:tiny_europium_sulfate_dust'],
        Text.translate('tooltip.grindless.europium_sulfate').gray())
    event.add(['gtceu:europium_oxide_dust', 'gtceu:small_europium_oxide_dust', 'gtceu:tiny_europium_oxide_dust'],
        Text.translate('tooltip.grindless.europium_oxide').gray())
})
