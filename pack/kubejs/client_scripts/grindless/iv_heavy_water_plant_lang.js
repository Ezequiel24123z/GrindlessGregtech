// priority: 9200
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

    add('grindless.machine.heavy_water_plant.tooltip.0', '§7A Girdler sulfide plant that enriches heavy water.')

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

    add('grindless.machine.heavy_water_plant.tooltip.0', '§7Planta de sulfuro Girdler que enriquece agua pesada.')

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
