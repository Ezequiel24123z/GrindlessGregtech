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

    add('grindless.machine.europium_reductor.tooltip.0', 'Europium goes divalent: a Jones column reduces Eu3+ to Eu2+ over zinc under a mercury bath, and the sulfate is fired and reduced with lanthanum. Programmed circuit 1: 2,000 mB europium chloride solution + 1 zinc dust + 3,000 mB sulfuric acid (+ 144 mB mercury, never used up) -> 2 europium sulfate + 1 zinc sulfate + 6,000 mB hydrochloric acid + 2,000 mB rare earth chloride solution.')
    add('grindless.machine.europium_reductor.tooltip.1', 'Circuit 2: 4 europium sulfate + 1,000 mB oxygen -> 2 europium oxide + 4,000 mB sulfur trioxide. Circuit 3: 1 europium oxide + 2 lanthanum dust -> 2 europium dust + 1 lanthanum oxide.')
    add('grindless.machine.europium_reductor.tooltip.2', 'The only way to europium dust: the froth line of GTCA stops at the chlorides. 122,880 EU/t (ZPM): 4.9 + 1.2 + 2.5 million EU for two europium. The acid comes back to the cascade\'s leach, the depleted solution into its circuit 2, sulfur trioxide and water make sulfuric acid, and an electrolyzer splits the zinc sulfate and the lanthanum oxide.')
    add('grindless.machine.europium_reductor.tooltip.3', 'Needs, in the floor: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 output buses, 1 to 3 input hatches and 1 to 3 output hatches, and 5 or more inert casings among them. ME parts fit.')

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

    add('grindless.machine.europium_reductor.tooltip.0', 'El europio se vuelve divalente: una columna de Jones reduce el Eu3+ a Eu2+ sobre zinc bajo un baño de mercurio, y el sulfato se calcina y se reduce con lantano. Circuito programado 1: 2 000 mB de solución de cloruro de europio + 1 de polvo de zinc + 3 000 mB de ácido sulfúrico (+ 144 mB de mercurio, que no se gasta) -> 2 de sulfato de europio + 1 de sulfato de zinc + 6 000 mB de ácido clorhídrico + 2 000 mB de solución de cloruros de tierras raras.')
    add('grindless.machine.europium_reductor.tooltip.1', 'Circuito 2: 4 de sulfato de europio + 1 000 mB de oxígeno -> 2 de óxido de europio + 4 000 mB de trióxido de azufre. Circuito 3: 1 de óxido de europio + 2 de polvo de lantano -> 2 de polvo de europio + 1 de óxido de lantano.')
    add('grindless.machine.europium_reductor.tooltip.2', 'La única vía al polvo de europio: la línea de espuma de GTCA termina en los cloruros. 122 880 EU/t (ZPM): 4,9 + 1,2 + 2,5 millones de EU por dos de europio. El ácido vuelve a la lixiviación de la cascada, la solución agotada a su circuito 2, el trióxido de azufre con agua da ácido sulfúrico y un electrolizador separa el sulfato de zinc y el óxido de lantano.')
    add('grindless.machine.europium_reductor.tooltip.3', 'Necesita, en el suelo: 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, 1 o 2 buses de salida, de 1 a 3 escotillas de entrada y de 1 a 3 de salida, y 5 o más carcasas inertes entre ellos. Valen piezas ME.')

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
