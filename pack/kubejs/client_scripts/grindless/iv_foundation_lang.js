// priority: 9300
// Gregtech Grindless - names and tooltips of the IV foundation (startup_scripts/grindless/iv/foundation.js):
//
//   grindless:<item> and grindless:<block>                     the shared IV items and the two Mercury blocks, with two tooltip lines each
//   grindless:vein_sample_<vein>                               naquadah_venus, iridosmine_mercury, pitchblende_end (iv/foundation.js) and
//                                                              fluorite (lv/multis_items.js, from veins_overworld_extra.json)
//   tooltip.grindless.vein_sample.<line>                       the machine and where lines of the new samples
//   planet.grindless.venus / mercury                           the planet names of moon/quantum_bridge.js's messages (planets.json)
//   material.gtceu.<material>                                  the six GT materials (GTM names their forms and fluids from these)
//
// GTM names the forms, indicators and buckets of these materials from its own English patterns, so no per-form key is needed.
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Quests are English only; names go in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('item.grindless.leu_pellet', 'LEU Pellet')
    add('tooltip.grindless.leu_pellet.0', 'A sintered pellet of low-enriched uranium dioxide.')
    add('tooltip.grindless.leu_pellet.1', 'The fuel fabrication plant stacks the pellets into Zircaloy tubes to make the LEU fuel assembly.')

    add('item.grindless.zircaloy_cladding_tube', 'Zircaloy Cladding Tube')
    add('tooltip.grindless.zircaloy_cladding_tube.0', 'A thin pilgered tube of Zircaloy: zirconium hardly absorbs neutrons, so they reach the moderator instead of the cladding.')
    add('tooltip.grindless.zircaloy_cladding_tube.1', 'The fuel fabrication plant fills it with LEU pellets and helium.')

    add('item.grindless.leu_fuel_assembly', 'LEU Fuel Assembly')
    add('tooltip.grindless.leu_fuel_assembly.0', 'A bundle of Zircaloy rods full of low-enriched uranium pellets, backfilled with helium.')
    add('tooltip.grindless.leu_fuel_assembly.1', 'Fission reactor fuel, with light or heavy water. It burns down into a spent fuel assembly.')

    add('item.grindless.mox_fuel_assembly', 'MOX Fuel Assembly')
    add('tooltip.grindless.mox_fuel_assembly.0', 'Mixed oxide fuel: plutonium and uranium-238 in Zircaloy rods. It burns the plutonium the reactor bred.')
    add('tooltip.grindless.mox_fuel_assembly.1', 'A heavy-water core of the fission reactor, made in the hot cell. It burns down into a spent fuel assembly.')

    add('item.grindless.breeder_fuel_assembly', 'Breeder Fuel Assembly')
    add('tooltip.grindless.breeder_fuel_assembly.0', 'A plutonium core in a blanket of uranium-238, which the core\'s neutrons turn into more plutonium.')
    add('tooltip.grindless.breeder_fuel_assembly.1', 'The fission reactor\'s breeder core, made in the hot cell.')

    add('item.grindless.spent_fuel_assembly', 'Spent Fuel Assembly')
    add('tooltip.grindless.spent_fuel_assembly.0', 'What an LEU or MOX core leaves: uranium, plutonium and fission products, hot and highly radioactive.')
    add('tooltip.grindless.spent_fuel_assembly.1', 'It never passes through hands: the hot cell reprocesses it and gives the uranium and plutonium back.')

    add('item.grindless.spent_breeder_assembly', 'Spent Breeder Assembly')
    add('tooltip.grindless.spent_breeder_assembly.0', 'A breeder core after its run: its blanket now holds more plutonium than the core started with.')
    add('tooltip.grindless.spent_breeder_assembly.1', 'The hot cell reprocesses it.')

    add('item.grindless.pube_neutron_source', 'Pu-Be Neutron Source')
    add('tooltip.grindless.pube_neutron_source.0', 'Plutonium and beryllium sealed in one capsule: the plutonium\'s alpha particles knock neutrons out of the beryllium.')
    add('tooltip.grindless.pube_neutron_source.1', 'Made in the hot cell. It keeps a steady neutron flux where a process needs one, and wears out slowly.')

    add('item.grindless.rtg_pellet', 'RTG Pellet')
    add('tooltip.grindless.rtg_pellet.0', 'Plutonium oxide that keeps itself hot by its own decay, for years.')
    add('tooltip.grindless.rtg_pellet.1', 'Made in the hot cell. It fuels the RTG cell, which powers a base where nothing burns, day and night.')

    add('item.grindless.ion_exchange_resin', 'Ion-Exchange Resin')
    add('tooltip.grindless.ion_exchange_resin.0', 'Sulfonated polystyrene beads: they catch the dissolved uranium out of the leach solution.')
    add('tooltip.grindless.ion_exchange_resin.1', 'It goes in the in-situ leach field and wears out slowly.')

    add('item.grindless.platinum_gauze', 'Platinum Gauze')
    add('tooltip.grindless.platinum_gauze.0', 'Woven platinum-rhodium wire, the catalyst that splits sulfuric acid into water, oxygen and sulfur dioxide.')
    add('tooltip.grindless.platinum_gauze.1', 'It sits in the Venus acid works and wears out very slowly.')

    add('item.grindless.inner_planets_chart', 'Inner Planets Chart')
    add('tooltip.grindless.inner_planets_chart.0', 'A data stick with the radio fixes of Venus and Mercury: their orbits, the transfer windows and two landing sites.')
    add('tooltip.grindless.inner_planets_chart.1', 'Written by the Deep Space Antenna. The tier 3 rocket parts are assembled with it, and it is never used up.')

    add('block.grindless.hermean_heat_shield_brick', 'Hermean Heat-Shield Bricks')
    add('tooltip.grindless.hermean_heat_shield_brick.0', 'Mercury\'s regolith, sintered under concentrated sunlight into pale, heat-proof bricks.')
    add('tooltip.grindless.hermean_heat_shield_brick.1', 'Made only on Mercury, in the solar works. The Mercury vein drill, the solar field and the interferometer stand on them.')

    add('block.grindless.hermean_thin_film_panel', 'Hermean Thin-Film Panel')
    add('tooltip.grindless.hermean_thin_film_panel.0', 'Gallium arsenide evaporated onto a silicon wafer in Mercury\'s free vacuum, under tempered glass on a tungsten steel frame.')
    add('tooltip.grindless.hermean_thin_film_panel.1', 'The panel of the Mercury solar field. Made only on Mercury, in the solar works.')

    add('item.grindless.vein_sample_naquadah_venus', 'Venusian Naquadah Vein Sample')
    add('item.grindless.vein_sample_iridosmine_mercury', 'Hermean Iridosmine Vein Sample')
    add('item.grindless.vein_sample_pitchblende_end', 'End Pitchblende Vein Sample')
    add('item.grindless.vein_sample_fluorite', 'Fluorite Vein Sample')
    add('tooltip.grindless.vein_sample.drill_venus', 'Put it in the input bus of the pressurized vein drill, on Venus. It is never used up.')
    add('tooltip.grindless.vein_sample.venus', 'Venus: craft it with an empty vein probe and two raw ores of the vein, brought back by hand on the first visit.')
    add('tooltip.grindless.vein_sample.drill_mercury', 'Put it in the input bus of the Mercury vein drill. It is never used up.')
    add('tooltip.grindless.vein_sample.mercury', 'Mercury: craft it with an empty vein probe and two raw ores of the vein, brought back by hand on the first visit.')
    add('tooltip.grindless.vein_sample.leach_field', 'Put it in the input bus of the in-situ leach field, in the End: the field dissolves the uranium in place, with no drill bit. It is never used up.')
    add('tooltip.grindless.vein_sample.end_leach', 'End vein: craft it with an empty vein probe, raw pitchblende and raw uraninite. No drill takes it.')

    add('planet.grindless.venus', 'Venus')
    add('planet.grindless.mercury', 'Mercury')
    add('dimension.grindless.mercury_orbit', 'Mercury Orbit')

    add('material.gtceu.heavy_water', 'Heavy Water')
    add('material.gtceu.heavy_water_concentrate', 'Heavy Water Concentrate')
    add('material.gtceu.tritiated_heavy_water', 'Tritiated Heavy Water')
    add('material.gtceu.zircaloy', 'Zircaloy')
    add('material.gtceu.hermean_regolith', 'Hermean Regolith')
    add('material.gtceu.iridosmine', 'Iridosmine')

    add('tooltip.grindless.heavy_water', 'The fission reactor\'s moderator. An electrolyzer splits it into deuterium and oxygen.')
    add('tooltip.grindless.tritiated_heavy_water', 'The reactor\'s used moderator, carrying tritium. Only the tritium removal facility on the Moon takes the tritium out.')
    add('tooltip.grindless.zircaloy', 'Zirconium with a little tin: it hardly absorbs neutrons. The fuel fabrication plant draws it into cladding tubes.')
    add('tooltip.grindless.hermean_regolith_dust', 'Ground Mercury rock. On Mercury, the solar works sinters it into heat-shield bricks.')
    add('tooltip.grindless.iridosmine', 'Native iridium-osmium alloy from Mercury\'s crust. Only the platinum plant splits it into iridium and osmium.')
    add('tooltip.grindless.fluorite', 'Fluorspar, calcium fluoride. The fluorspar kiln digests it in sulfuric acid into hydrogen fluoride.')
})

// what the new GT forms are for (GTM already shows the chemical formula)
ItemEvents.tooltip(event => {
    event.add('gtceu:heavy_water_bucket', Text.translate('tooltip.grindless.heavy_water').gray())
    event.add('gtceu:tritiated_heavy_water_bucket', Text.translate('tooltip.grindless.tritiated_heavy_water').gray())
    event.add(['gtceu:zircaloy_ingot', 'gtceu:zircaloy_dust'], Text.translate('tooltip.grindless.zircaloy').gray())
    event.add('gtceu:hermean_regolith_dust', Text.translate('tooltip.grindless.hermean_regolith_dust').gray())
    event.add(['gtceu:mercury_iridosmine_ore', 'gtceu:proxima_centauri_b_iridosmine_ore', 'gtceu:raw_iridosmine', 'gtceu:iridosmine_dust'],
        Text.translate('tooltip.grindless.iridosmine').gray())
    event.add(['gcyr:raw_fluorite', 'gcyr:fluorite_dust'], Text.translate('tooltip.grindless.fluorite').gray())
})
