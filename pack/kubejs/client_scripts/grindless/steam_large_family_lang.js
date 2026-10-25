// -----------------------------------------------------------------------------------------------
// Names and tooltips of the Large Steam family (startup_scripts/grindless/steam/large_family.js, GTL's "Large
// Steam X" idea reimplemented with our own code/art - docs/investigacion/leisure.md SS4.2): gtceu:large_steam_
// macerator / _centrifuge / _thermal_centrifuge / _chemical_bath / _ore_washer. The five recipe type names
// (gtceu.macerator, gtceu.centrifuge, gtceu.thermal_centrifuge, gtceu.chemical_bath, gtceu.ore_washer) are GTM's
// own and are not touched here.
//
// Kept out of pack/kubejs/assets/grindless/lang/* (owned by other agents): Minecraft merges lang entries from
// every script, so ClientEvents.lang works wherever it is declared (same approach as steam_content_lang.js /
// lv_multis_lang.js).
ClientEvents.lang('en_us', event => {
    var add = (key, value) => event.add('grindless', key, value)

    add('block.gtceu.large_steam_macerator', 'Large Steam Macerator')
    add('block.gtceu.large_steam_centrifuge', 'Large Steam Centrifuge')
    add('block.gtceu.large_steam_thermal_centrifuge', 'Large Steam Thermal Centrifuge')
    add('block.gtceu.large_steam_chemical_bath', 'Large Steam Chemical Bath')
    add('block.gtceu.large_steam_ore_washer', 'Large Steam Ore Washer')

    add('grindless.machine.large_steam_macerator.tooltip.0', "Runs GTM's own macerator recipes on steam, up to 64 in parallel: ore to crushed ore, crushed ore to dust, every chance byproduct included.")
    add('grindless.machine.large_steam_macerator.tooltip.1', 'Steam rule: only recipes at LV voltage (32 EU/t) or below run. Anything higher is rejected outright, same as every steam multiblock.')
    add('grindless.machine.large_steam_macerator.tooltip.2', "The reward for finishing Steam: one block crushes as much ore as dozens of macerators, no electricity needed.")
    add('grindless.machine.large_steam_macerator.tooltip.3', 'Needs 1 steam input hatch, 1 steam input bus and 2 steam output buses somewhere in the shell.')

    add('grindless.machine.large_steam_centrifuge.tooltip.0', "Runs GTM's own centrifuge recipes on steam, up to 64 in parallel: dust separations and ore byproducts, anything at LV voltage or below.")
    add('grindless.machine.large_steam_centrifuge.tooltip.1', 'Steam rule: only recipes at LV voltage (32 EU/t) or below run. Anything higher is rejected outright, same as every steam multiblock.')
    add('grindless.machine.large_steam_centrifuge.tooltip.2', 'GTM never blocks the type outright: most dust separations already sit at or under 32 EU/t. Only the hotter ones (uranium, glowstone...) stay out of reach.')
    add('grindless.machine.large_steam_centrifuge.tooltip.3', 'Needs 1 steam input hatch, 1 steam input bus, 2 steam output buses, 1 fluid input hatch and 1 or 2 fluid output hatches (any tier) in the shell.')

    add('grindless.machine.large_steam_thermal_centrifuge.tooltip.0', "Runs GTM's own thermal centrifuge recipes on steam, up to 64 in parallel: purified or crushed ore straight to its centrifuged form, with the stone and the byproduct dust.")
    add('grindless.machine.large_steam_thermal_centrifuge.tooltip.1', 'Steam rule: only recipes at LV voltage (32 EU/t) or below run. Anything higher is rejected outright, same as every steam multiblock.')
    add('grindless.machine.large_steam_thermal_centrifuge.tooltip.2', 'Pairs with the ore washer below it: wash first, then centrifuge what is left for every last byproduct.')
    add('grindless.machine.large_steam_thermal_centrifuge.tooltip.3', 'Needs 1 steam input hatch, 1 steam input bus and 2 steam output buses somewhere in the shell.')

    add('grindless.machine.large_steam_chemical_bath.tooltip.0', "Runs GTM's own chemical bath recipes on steam, up to 64 in parallel: paper from wood dust, treated planks, and ore bathed in whatever fluid the vein needs.")
    add('grindless.machine.large_steam_chemical_bath.tooltip.1', 'Steam rule: only recipes at LV voltage (32 EU/t) or below run. Anything higher is rejected outright, same as every steam multiblock.')
    add('grindless.machine.large_steam_chemical_bath.tooltip.2', 'Most of its hot-ingot baths run too far above LV for steam: this reaches only what the steam cap allows.')
    add('grindless.machine.large_steam_chemical_bath.tooltip.3', 'Needs 1 steam input hatch, 1 steam input bus, 2 steam output buses, 1 fluid input hatch and 1 fluid output hatch (any tier) in the shell.')

    add('grindless.machine.large_steam_ore_washer.tooltip.0', "Runs GTM's own ore washer recipes on steam, up to 64 in parallel: crushed ore and water in, purified ore and stone dust out, with a chance byproduct.")
    add('grindless.machine.large_steam_ore_washer.tooltip.1', 'Steam rule: only recipes at LV voltage (32 EU/t) or below run. Anything higher is rejected outright, same as every steam multiblock.')
    add('grindless.machine.large_steam_ore_washer.tooltip.2', "Takes any fluid input hatch, water included: the distilled water recipes need no integrated circuit at all.")
    add('grindless.machine.large_steam_ore_washer.tooltip.3', 'Needs 1 steam input hatch, 1 steam input bus, 2 steam output buses and 1 fluid input hatch (any tier) in the shell.')
})

ClientEvents.lang('es_es', event => {
    var add = (key, value) => event.add('grindless', key, value)

    add('block.gtceu.large_steam_macerator', 'Macerador de vapor grande')
    add('block.gtceu.large_steam_centrifuge', 'Centrífuga de vapor grande')
    add('block.gtceu.large_steam_thermal_centrifuge', 'Centrífuga térmica de vapor grande')
    add('block.gtceu.large_steam_chemical_bath', 'Baño químico de vapor grande')
    add('block.gtceu.large_steam_ore_washer', 'Lavadora de mena de vapor grande')

    add('grindless.machine.large_steam_macerator.tooltip.0', 'Corre las recetas de macerador de GTM con vapor, hasta 64 a la vez: mena a mena triturada, triturada a polvo, con todo subproducto por probabilidad incluido.')
    add('grindless.machine.large_steam_macerator.tooltip.1', 'Regla del vapor: solo corren las recetas de voltaje LV (32 EU/t) o menos. Lo que pida más se rechaza sin más, como en todo multibloque de vapor.')
    add('grindless.machine.large_steam_macerator.tooltip.2', 'La recompensa por terminar vapor: un solo bloque tritura tanta mena como decenas de maceradores, sin electricidad.')
    add('grindless.machine.large_steam_macerator.tooltip.3', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 2 buses de salida de vapor en algún punto de la carcasa.')

    add('grindless.machine.large_steam_centrifuge.tooltip.0', 'Corre las recetas de centrífuga de GTM con vapor, hasta 64 a la vez: separaciones de polvo y subproductos de mena, lo que esté a voltaje LV o menos.')
    add('grindless.machine.large_steam_centrifuge.tooltip.1', 'Regla del vapor: solo corren las recetas de voltaje LV (32 EU/t) o menos. Lo que pida más se rechaza sin más, como en todo multibloque de vapor.')
    add('grindless.machine.large_steam_centrifuge.tooltip.2', 'GTM no bloquea el tipo entero: casi todas las separaciones de polvo ya están en 32 EU/t o menos. Solo las más calientes (uranio, piedra luminosa...) quedan fuera de alcance.')
    add('grindless.machine.large_steam_centrifuge.tooltip.3', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor, 2 buses de salida de vapor, 1 escotilla de entrada de fluido y 1 o 2 escotillas de salida de fluido (de cualquier escalón) en la carcasa.')

    add('grindless.machine.large_steam_thermal_centrifuge.tooltip.0', 'Corre las recetas de centrífuga térmica de GTM con vapor, hasta 64 a la vez: mena purificada o triturada directa a su forma centrifugada, con la piedra y el polvo subproducto.')
    add('grindless.machine.large_steam_thermal_centrifuge.tooltip.1', 'Regla del vapor: solo corren las recetas de voltaje LV (32 EU/t) o menos. Lo que pida más se rechaza sin más, como en todo multibloque de vapor.')
    add('grindless.machine.large_steam_thermal_centrifuge.tooltip.2', 'Hace pareja con la lavadora de mena de al lado: primero se lava, luego se centrifuga lo que queda para no perder ningún subproducto.')
    add('grindless.machine.large_steam_thermal_centrifuge.tooltip.3', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 2 buses de salida de vapor en algún punto de la carcasa.')

    add('grindless.machine.large_steam_chemical_bath.tooltip.0', 'Corre las recetas de baño químico de GTM con vapor, hasta 64 a la vez: papel desde polvo de madera, madera tratada y mena bañada en el fluido que pida la veta.')
    add('grindless.machine.large_steam_chemical_bath.tooltip.1', 'Regla del vapor: solo corren las recetas de voltaje LV (32 EU/t) o menos. Lo que pida más se rechaza sin más, como en todo multibloque de vapor.')
    add('grindless.machine.large_steam_chemical_bath.tooltip.2', 'Casi todos sus baños de lingote caliente piden mucho más que LV: aquí solo llegan los que el tope de vapor deja pasar.')
    add('grindless.machine.large_steam_chemical_bath.tooltip.3', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor, 2 buses de salida de vapor, 1 escotilla de entrada de fluido y 1 escotilla de salida de fluido (de cualquier escalón) en la carcasa.')

    add('grindless.machine.large_steam_ore_washer.tooltip.0', 'Corre las recetas de lavadora de mena de GTM con vapor, hasta 64 a la vez: mena triturada y agua entran, mena purificada y polvo de piedra salen, con un subproducto por probabilidad.')
    add('grindless.machine.large_steam_ore_washer.tooltip.1', 'Regla del vapor: solo corren las recetas de voltaje LV (32 EU/t) o menos. Lo que pida más se rechaza sin más, como en todo multibloque de vapor.')
    add('grindless.machine.large_steam_ore_washer.tooltip.2', 'Admite cualquier escotilla de entrada de fluido, agua incluida: las recetas con agua destilada no piden ni un circuito.')
    add('grindless.machine.large_steam_ore_washer.tooltip.3', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor, 2 buses de salida de vapor y 1 escotilla de entrada de fluido (de cualquier escalón) en la carcasa.')
})
