// priority: 7030
// Gregtech Grindless - names and tooltips of Mars (end of EV, startup_scripts/grindless/mars/travel.js):
//
//   grindless:vein_sample_<Mars vein>     (scheelite_mars, merrillite_mars, ice_mars: data/grindless/tables/veins_mars.json)
//   material.gtceu.deuterium_rich_ice     (the GT material: GTM names its forms from this key)
//
// GTM names the forms, indicator and buckets of the ice from its own English patterns, so no per-form key is needed.
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Quests are English only; names go in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('item.grindless.vein_sample_scheelite_mars', 'Martian Scheelite Vein Sample')
    add('item.grindless.vein_sample_merrillite_mars', 'Martian Merrillite Vein Sample')
    add('item.grindless.vein_sample_ice_mars', 'Martian Ice Vein Sample')
    add('tooltip.grindless.vein_sample.drill_martian', 'Put it in the input bus of the EV vein drill (the tripod), on Mars, with a titanium drill bit. It is never used up.')
    add('tooltip.grindless.vein_sample.mars', 'Mars: craft it with an empty vein probe and two raw ores of the vein brought back by hand on the first visit.')

    add('material.gtceu.deuterium_rich_ice', 'Deuterium-Rich Ice')
    add('tooltip.grindless.deuterium_rich_ice', 'Martian ground ice with about five times the deuterium of Earth\'s water. Keep it for IV: melted and enriched, it becomes heavy water.')
})

// what the ice is for (GTM already shows the chemical formula)
ItemEvents.tooltip(event => {
    event.add(['gtceu:mars_deuterium_rich_ice_ore', 'gtceu:raw_deuterium_rich_ice', 'gtceu:deuterium_rich_ice_dust'],
        Text.translate('tooltip.grindless.deuterium_rich_ice').gray())
})
