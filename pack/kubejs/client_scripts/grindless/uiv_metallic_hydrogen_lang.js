// priority: 3016
// Gregtech Grindless - names and tooltips of UIV's ramp-compression pulser (startup_scripts/grindless/uiv/metallic_hydrogen.js; package UIV-A2):
//
//   block.gtceu.ramp_compression_pulser, gtceu.ramp_compression   machine and recipe type names
//   grindless.machine.ramp_compression_pulser.tooltip.N           controller tooltips
//   gtceu.recipe.grindless_ramp_compression.<recipe>              the EMI line of each pulser recipe (the quench is named fiction)
//   material.gtceu.<fluid>                                        protium, para-hydrogen and liquid para-hydrogen
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.ramp_compression_pulser', 'Ramp-Compression Pulser'],
        ['gtceu.ramp_compression', 'Ramp Compression'],

        ['material.gtceu.protium', 'Protium'],
        ['material.gtceu.para_hydrogen', 'Para-Hydrogen'],
        ['material.gtceu.liquid_para_hydrogen', 'Liquid Para-Hydrogen'],

        ['grindless.machine.ramp_compression_pulser.tooltip.0',
            '\u00a77A pulsed-power ring that makes metallic hydrogen and lonsdaleite.'],

        ['gtceu.recipe.grindless_naquadria_magnets.mh_winding',
            'Circuit 7: a metallic hydrogen winding, 16 wires round tungsten plates (UIV-A2).'],

        ['gtceu.recipe.grindless_ramp_compression.mh_quench',
            'Fiction: real metallic hydrogen needs about 400 GPa and reverts on release; here the pulser quenches it so the rod survives. The hydrogen shards go back to the cryogenic plant.'],
        ['gtceu.recipe.grindless_ramp_compression.lonsdaleite_shock',
            'Shock-compressed pyrolytic graphite turns into hexagonal diamond; the unconverted graphite goes back to stock.'],
        ['gtceu.recipe.grindless_ramp_compression.cg_nitrogen_shock',
            'Fiction: real cubic gauche nitrogen needs about 110 GPa and decomposes on release; here the pulser quenches it. The spare N2 goes back to the cryogenic plant.']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['solid_para_h2_target', 'Solid Para-H2 Target', 'Liquid para-hydrogen frozen in a superfluid helium bath.', 'Compressed to metallic hydrogen in the pulser (circuit 1).'],
        ['pyrolytic_graphite', 'Pyrolytic Graphite', 'Graphite laid down layer by layer from hot methane.', 'Shocked into lonsdaleite in the pulser (circuit 2).'],
        ['leached_lonsdaleite', 'Leached Lonsdaleite', 'Shocked lonsdaleite with its graphite skin etched off.', 'Cut into a race in a laser engraver.'],
        ['lonsdaleite_race', 'Lonsdaleite Race', 'A bearing race cut from hexagonal diamond.', 'Two races and a tungsten plate make a bearing.'],
        ['lonsdaleite_bearing', 'Lonsdaleite Bearing', 'Harder than diamond, and it runs in lubricant.', 'Goes into the UIV electric piston.'],
        ['dac_charge', 'DAC Charge', 'Nitrogen sealed in a diamond anvil cell.', 'Heated with a laser before the pulser.'],
        ['laser_heated_n2_charge', 'Laser-Heated N2 Charge', 'Nitrogen heated past 2000 K inside its cell.', 'Shocked into cubic gauche nitrogen in the pulser (circuit 3).'],
        ['quenched_cg_nitrogen', 'Quenched cg-N', 'Cubic gauche nitrogen that survives at one atmosphere (fiction).', 'The polymeric nitrogen the fuel lines will use.']
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
