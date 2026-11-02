// priority: 5154
// Gregtech Grindless - names and tooltips of UEV's nebula collector, interstellar dust lab and pulsar timing station (startup_scripts/grindless/uev/alpha_centauri.js; package UEV-B2):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   emi.grindless.info.<machine>.0                                the EMI info page of each controller
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.nebula_collector', 'Nebula Collector'],
        ['gtceu.nebula_collection', 'Nebula Collection'],
        ['block.gtceu.interstellar_dust_lab', 'Interstellar Dust Lab'],
        ['gtceu.interstellar_dust_analysis', 'Interstellar Dust Analysis'],
        ['block.gtceu.pulsar_timing_station', 'Pulsar Timing Station'],
        ['gtceu.pulsar_timing', 'Pulsar Timing'],

        ['grindless.machine.nebula_collector.tooltip.0',
            '§7Sweeps the interstellar medium with a magnetic scoop (fiction).'],
        ['grindless.machine.nebula_collector.tooltip.1', 'Works in Alpha Centauri orbit only.'],
        ['emi.grindless.info.nebula_collector.1',
            'A magnetic scoop sweeps the interstellar medium. The yield is named fiction: a real scoop would gather a few atoms per cubic centimetre. Alpha Centauri orbit only.'],
        ['emi.grindless.info.nebula_collector.2',
            'Circuit 1 interstellar gas (the superhydride scoop coil is never consumed; a little liquid helium cools it), 2 dust-laden aerogel.'],
        ['emi.grindless.info.nebula_collector.3',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional input hatch, an optional output hatch. Accepts a parallel hatch.'],

        ['grindless.machine.interstellar_dust_lab.tooltip.0',
            '§7Analyses captured dust grains for iron-60 and silicate residue.'],
        ['grindless.machine.interstellar_dust_lab.tooltip.1', 'Washes captured grains out of aerogel.'],
        ['emi.grindless.info.interstellar_dust_lab.1',
            'Washes captured grains out of the aerogel, strips their silicate shell and reads the iron-60 record of a nearby supernova.'],
        ['emi.grindless.info.interstellar_dust_lab.2',
            'Circuit 1 extract grains, 2 demineralise, 3 Fe-60 record (the sensor is not consumed), 4 silicate residue.'],
        ['emi.grindless.info.interstellar_dust_lab.3',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, 1-2 input hatches, an optional output hatch. Accepts a parallel hatch.'],

        ['grindless.machine.pulsar_timing_station.tooltip.0',
            '§7Times pulsars with an X-ray telescope to fix a navigation chart.'],
        ['grindless.machine.pulsar_timing_station.tooltip.1', 'Works in Alpha Centauri orbit only.'],
        ['emi.grindless.info.pulsar_timing_station.1',
            'Times pulsars with a lobster-eye X-ray telescope and a nuclear clock, then fixes a navigation chart with the Fe-60 record. Alpha Centauri orbit only.'],
        ['emi.grindless.info.pulsar_timing_station.2',
            'Circuit 1 timing survey (the clock is not consumed), 2 pulsar navigation chart.'],
        ['emi.grindless.info.pulsar_timing_station.3',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses. Accepts a parallel hatch.'],

        ['emi.grindless.info.nebula_collector.0',
            'Works only in the Alpha Centauri orbit. Interstellar gas then goes to a chemical reactor (compression), the cryogenic plant (hydrogen-deuterium fraction, helium fraction, neon) and two distillation towers (deuterium, helium-3). The scoop yield is named fiction.'],
        ['emi.grindless.info.interstellar_dust_lab.0',
            'Spent hydrofluoric acid leaves as silicon tetrafluoride and is neutralised with calcium hydroxide into fluorite; silicate residue is electrolysed into silicon, iron and magnesium.'],
        ['emi.grindless.info.pulsar_timing_station.0',
            'Works only in the Alpha Centauri orbit. Makes the pulsar navigation chart, needed later for UIV casing research.'],

        ['gtceu.recipe.grindless_nebula_collection.interstellar_gas', 'Circuit 1: the scoop coil sweeps interstellar gas; the coil is not consumed'],
        ['gtceu.recipe.grindless_nebula_collection.dust_laden_aerogel', 'Circuit 2: an aerogel tile is exposed to the stream and traps grains'],
        ['gtceu.recipe.grindless_interstellar_dust_analysis.extract_grains', 'Circuit 1: water washes the grains out of the aerogel; the silica goes to the silicon lines'],
        ['gtceu.recipe.grindless_interstellar_dust_analysis.demineralise_grains', 'Circuit 2: hydrofluoric acid strips the silicate shell; silicon tetrafluoride is neutralised elsewhere'],
        ['gtceu.recipe.grindless_interstellar_dust_analysis.fe60_record', 'Circuit 3: the sensor reads the iron-60 record and is not consumed'],
        ['gtceu.recipe.grindless_interstellar_dust_analysis.silicate_residue', 'Circuit 4: grains are washed down to a silicate residue for the electrolyzer'],
        ['gtceu.recipe.grindless_pulsar_timing.timing_survey', 'Circuit 1: the MCP telescope and the nuclear clock time the pulsars; the clock is not consumed'],
        ['gtceu.recipe.grindless_pulsar_timing.pulsar_navigation_chart', 'Circuit 2: timing data and the Fe-60 record fix a navigation chart']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['scoop_winding', 'Scoop Winding', 'Superhydride wire wound on a plate former.', 'Impregnated with epoxy in a chemical reactor.'],
        ['impregnated_scoop_winding', 'Impregnated Scoop Winding', 'A winding set solid in epoxy so it survives the field.', 'Fitted with a UV field generator in the assembler (circuit 2).'],
        ['superhydride_scoop_coil', 'Superhydride Scoop Coil', 'A superconducting loop that funnels the interstellar medium.', 'Never used up in the nebula collector. The yield is named fiction.'],
        ['dust_laden_aerogel', 'Dust-laden Aerogel', 'An aerogel tile that caught interstellar grains.', 'Washed in the interstellar dust lab.'],
        ['extracted_grains', 'Extracted Grains', 'Grains washed out of the aerogel.', 'Demineralised or reduced to residue.'],
        ['demineralised_grains', 'Demineralised Grains', 'Grains with the silicate shell stripped off.', 'Their iron-60 is read by a sensor.'],
        ['fe60_record', 'Fe-60 Record', 'A trace of a supernova that exploded nearby.', 'Fixes the pulsar navigation chart.'],
        ['silicate_residue', 'Silicate Residue', 'What is left of the grain shells.', 'Electrolysed into silicon, iron and magnesium.'],
        ['pulsar_timing_data', 'Pulsar Timing Data', 'Arrival times of pulsar pulses.', 'Combined with the Fe-60 record into a chart.'],
        ['alpha_coronal_field_map', 'Alpha Centauri Coronal Field Map', 'Mapped by a probe skimming Alpha Centauri A.', 'Kept by the Alpha Centauri swarm station.'],
        ['teos_flask', 'TEOS Flask', 'Tetraethyl orthosilicate, made from silicon tetrachloride and ethanol.', 'The hydrochloric acid goes to its users.'],
        ['silica_sol', 'Silica Sol', 'TEOS hydrolysed in water.', 'Gels with ammonia.'],
        ['silica_wet_gel', 'Silica Wet Gel', 'A gel soaked in ethanol.', 'The ethanol is recycled.'],
        ['silica_aged_gel', 'Silica Aged Gel', 'A stronger gel network.', 'Dried with supercritical carbon dioxide.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[3]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
