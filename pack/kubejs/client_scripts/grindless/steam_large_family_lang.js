// priority: 5400
// -----------------------------------------------------------------------------------------------
// Names and tooltips of the Large Steam family (startup_scripts/grindless/steam/large_family.js, GTL's "Large
// Steam X" idea reimplemented with our own code/art - docs/research/leisure.md SS4.2): gtceu:large_steam_
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

    add('grindless.machine.large_steam_macerator.tooltip.0', '§7Runs macerator recipes on steam, up to 64 in parallel.')

    add('grindless.machine.large_steam_centrifuge.tooltip.0', '§7Runs centrifuge recipes on steam, up to 64 in parallel.')

    add('grindless.machine.large_steam_thermal_centrifuge.tooltip.0', '§7Runs thermal centrifuge recipes on steam, up to 64 in parallel.')

    add('grindless.machine.large_steam_chemical_bath.tooltip.0', '§7Runs chemical bath recipes on steam, up to 64 in parallel.')

    add('grindless.machine.large_steam_ore_washer.tooltip.0', '§7Runs ore washer recipes on steam, up to 64 in parallel.')
})

ClientEvents.lang('es_es', event => {
    var add = (key, value) => event.add('grindless', key, value)

    add('block.gtceu.large_steam_macerator', 'Macerador de vapor grande')
    add('block.gtceu.large_steam_centrifuge', 'Centrífuga de vapor grande')
    add('block.gtceu.large_steam_thermal_centrifuge', 'Centrífuga térmica de vapor grande')
    add('block.gtceu.large_steam_chemical_bath', 'Baño químico de vapor grande')
    add('block.gtceu.large_steam_ore_washer', 'Lavadora de mena de vapor grande')

    add('grindless.machine.large_steam_macerator.tooltip.0', '§7Corre recetas de macerador con vapor, hasta 64 a la vez.')

    add('grindless.machine.large_steam_centrifuge.tooltip.0', '§7Corre recetas de centrífuga con vapor, hasta 64 a la vez.')

    add('grindless.machine.large_steam_thermal_centrifuge.tooltip.0', '§7Corre recetas de centrífuga térmica con vapor, hasta 64 a la vez.')

    add('grindless.machine.large_steam_chemical_bath.tooltip.0', '§7Corre recetas de baño químico con vapor, hasta 64 a la vez.')

    add('grindless.machine.large_steam_ore_washer.tooltip.0', '§7Corre recetas de lavadora de mena con vapor, hasta 64 a la vez.')
})
