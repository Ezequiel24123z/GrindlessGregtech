// Gregtech Grindless - names and tooltips of IV's Heavy-Water Plant (startup_scripts/grindless/iv/heavy_water_plant.js), its recipe type,
// the EMI line of each of its recipes, the controller's H2S charge line and the concentrate bucket's tooltip.
//
//   gtceu:heavy_water_plant / gtceu.isotope_exchange          (machine name + tooltips, recipe type name)
//   gtceu.recipe.grindless_isotope_exchange.<recipe name>     (EMI line of each recipe: what the mode does)
//   grindless.machine.heavy_water_plant.charge.ok|low         (controller line: the H2S in the input hatches; %s held, %s needed)
//   tooltip.grindless.heavy_water_concentrate                 (gtceu:heavy_water_concentrate_bucket; IV-A1 names the material)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.heavy_water_plant', 'Heavy-Water Plant')
    add('gtceu.isotope_exchange', 'Isotope Exchange')

    add('grindless.machine.heavy_water_plant.tooltip.0', 'A Girdler sulfide plant: a cold tower and a taller hot tower joined by a heat-exchanger bridge, and a vacuum column. Martian deuterium-rich ice goes in as dust and is melted inside. The programmed circuit picks the mode: 1 exchange, 2 finishing, 3 exchange of Proxima b\'s deuterium-enriched water (UHV).')
    add('grindless.machine.heavy_water_plant.tooltip.1', 'Exchange: 16 ice and 25,600 mB of steam give 3,200 mB of heavy-water concentrate, 12,800 mB of depleted water and 160 mB of distilled water. It needs a 1,000 mB hydrogen sulfide charge in an input hatch of its own: the charge circulates between the towers and is never used up.')
    add('grindless.machine.heavy_water_plant.tooltip.2', 'Finishing: 1,000 mB of concentrate gives 200 mB of heavy water and 800 mB of distilled water. One ice makes 40 mB of heavy water: the fission reactor\'s moderator, and 80 mB of deuterium in the electrolyzer.')
    add('grindless.machine.heavy_water_plant.tooltip.3', 'The towers\' feet take 1-2 energy hatches, 1-2 input buses, 1-4 input hatches and 1-4 output hatches; ME parts fit. The steam comes from plants that never void theirs: the combined-cycle plant and the hot strip mill. The depleted water is plain water.')

    add('gtceu.recipe.grindless_isotope_exchange.martian_ice_exchange', 'Mode 1: Girdler sulfide exchange. The H2S charge stays in its hatch')
    add('gtceu.recipe.grindless_isotope_exchange.concentrate_finishing', 'Mode 2: the vacuum column turns the concentrate into heavy water')
    add('gtceu.recipe.grindless_isotope_exchange.proxima_water_exchange', 'Mode 3: Proxima b\'s water, already melted, four times the deuterium of Martian ice')

    add('grindless.machine.heavy_water_plant.charge.ok', 'H2S charge: %s mB (needs %s mB, never used up)')
    add('grindless.machine.heavy_water_plant.charge.low', 'H2S charge: %s of %s mB. The exchange (circuit 1) does not start without the full charge in an input hatch')

    add('tooltip.grindless.heavy_water_concentrate', 'The Girdler sulfide exchange\'s product, about 20% heavy water. The heavy-water plant\'s vacuum column (circuit 2) finishes it into heavy water.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.heavy_water_plant', 'Planta de agua pesada')
    add('gtceu.isotope_exchange', 'Intercambio isotópico')

    add('grindless.machine.heavy_water_plant.tooltip.0', 'Una planta de sulfuro de Girdler: una torre fría y una torre caliente más alta unidas por un puente intercambiador de calor, y una columna de vacío. El hielo marciano rico en deuterio entra en polvo y se funde dentro. El circuito programado elige el modo: 1 intercambio, 2 acabado, 3 intercambio del agua enriquecida en deuterio de Próxima b (UHV).')
    add('grindless.machine.heavy_water_plant.tooltip.1', 'Intercambio: 16 de hielo y 25 600 mB de vapor dan 3200 mB de concentrado de agua pesada, 12 800 mB de agua empobrecida y 160 mB de agua destilada. Necesita una carga de 1000 mB de sulfuro de hidrógeno en una escotilla de entrada propia: la carga circula entre las torres y nunca se gasta.')
    add('grindless.machine.heavy_water_plant.tooltip.2', 'Acabado: 1000 mB de concentrado dan 200 mB de agua pesada y 800 mB de agua destilada. Un hielo da 40 mB de agua pesada: el moderador del reactor de fisión, y 80 mB de deuterio en el electrolizador.')
    add('grindless.machine.heavy_water_plant.tooltip.3', 'Los pies de las torres admiten 1-2 escotillas de energía, 1-2 buses de entrada, 1-4 escotillas de entrada y 1-4 escotillas de salida; valen las piezas ME. El vapor viene de plantas que nunca tiran el suyo: la planta de ciclo combinado y el tren de laminación en caliente. El agua empobrecida es agua normal.')

    add('gtceu.recipe.grindless_isotope_exchange.martian_ice_exchange', 'Modo 1: intercambio de sulfuro de Girdler. La carga de H2S se queda en su escotilla')
    add('gtceu.recipe.grindless_isotope_exchange.concentrate_finishing', 'Modo 2: la columna de vacío convierte el concentrado en agua pesada')
    add('gtceu.recipe.grindless_isotope_exchange.proxima_water_exchange', 'Modo 3: el agua de Próxima b, ya fundida, con cuatro veces el deuterio del hielo marciano')

    add('grindless.machine.heavy_water_plant.charge.ok', 'Carga de H2S: %s mB (necesita %s mB, nunca se gasta)')
    add('grindless.machine.heavy_water_plant.charge.low', 'Carga de H2S: %s de %s mB. El intercambio (circuito 1) no arranca sin la carga completa en una escotilla de entrada')

    add('tooltip.grindless.heavy_water_concentrate', 'El producto del intercambio de sulfuro de Girdler, con un 20 % de agua pesada. La columna de vacío de la planta de agua pesada (circuito 2) lo convierte en agua pesada.')
})

// what the concentrate is for (GTM already shows the formula; IV-A1's lang names the material)
ItemEvents.tooltip(event => {
    event.add('gtceu:heavy_water_concentrate_bucket', Text.translate('tooltip.grindless.heavy_water_concentrate').gray())
})
