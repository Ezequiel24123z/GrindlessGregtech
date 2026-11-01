// priority: 10600
// Gregtech Grindless - names and tooltips of the EV foundation (startup_scripts/grindless/ev/foundation.js):
//
//   grindless:sintered_regolith, molten_salt_charge, ruthenium_catalyst, mars_chart     (block and items)
//   material.gtceu.lunar_regolith / merrillite / methalox                              (the GT materials: GTM names their forms from these)
//   grindless.fluid.liquid_nitrogen                                                    (the name of gtceu:liquid_nitrogen, in both languages)
//
// GTM names the forms of these materials from its own English patterns ("%s Dust", "Crushed %s Ore"...), so no per-form key is needed.
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Quests are English only; names go in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.grindless.sintered_regolith', 'Sintered Regolith Bricks')
    add('tooltip.grindless.sintered_regolith.0', 'Lunar regolith fused into hard, glassy bricks. Every structure of the Moon base stands on them.')
    add('tooltip.grindless.sintered_regolith.1', 'Made only on the Moon: an electric furnace bakes 4 lunar regolith dust into one block.')

    add('item.grindless.molten_salt_charge', 'Molten Salt Charge')
    add('tooltip.grindless.molten_salt_charge.0', 'A titanium crucible of calcium chloride with a titanium cathode basket. In the Regolith Cell the salt melts, and the ilmenite in the basket gives up its oxygen and leaves titanium: no chlorine, no magnesium.')
    add('tooltip.grindless.molten_salt_charge.1', 'It sits in the cell\'s input bus and is never used up.')

    add('item.grindless.ruthenium_catalyst', 'Ruthenium Catalyst')
    add('tooltip.grindless.ruthenium_catalyst.0', 'Ruthenium on alumina pellets, the Sabatier catalyst: carbon dioxide and hydrogen become methane and water.')
    add('tooltip.grindless.ruthenium_catalyst.1', 'It goes in the input bus of the Atmosphere Processor and is used up by chance.')

    add('item.grindless.mars_chart', 'Mars Transfer Chart')
    add('tooltip.grindless.mars_chart.0', 'A data stick with the radio fixes of Mars: its orbit, the next transfer window and a landing ellipse on the northern plains.')
    add('tooltip.grindless.mars_chart.1', 'Written by the Deep Space Antenna on the far side of the Moon. The tier 2 rocket parts are assembled with it, and it is never used up.')

    add('material.gtceu.lunar_regolith', 'Lunar Regolith')
    add('material.gtceu.merrillite', 'Merrillite')
    add('material.gtceu.methalox', 'Methalox')
    add('grindless.fluid.liquid_nitrogen', 'Liquid Nitrogen')

    add('tooltip.grindless.lunar_regolith_dust', 'Ground lunar soil: basalt, glass beads and a little solar-wind gas. On the Moon it sinters into bricks.')
    add('tooltip.grindless.merrillite', 'The phosphate that carries the rare earths of Mars. Only the extraction cascade splits it into samarium, neodymium and the rest.')
})

// what the new GT forms are for (GTM already shows the chemical formula)
ItemEvents.tooltip(event => {
    event.add('gtceu:lunar_regolith_dust', Text.translate('tooltip.grindless.lunar_regolith_dust').gray())
    event.add(['gtceu:mars_merrillite_ore', 'gtceu:raw_merrillite', 'gtceu:merrillite_dust'], Text.translate('tooltip.grindless.merrillite').gray())
})
