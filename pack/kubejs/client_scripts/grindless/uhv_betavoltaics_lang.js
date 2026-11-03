// priority: 4828
// Gregtech Grindless - names and tooltips of UHV's water and betavoltaics (startup_scripts/grindless/uhv/betavoltaics.js; package UHV-A3):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the fab's refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe of the two new machines
//   item.grindless.diamond_diode, tooltip.grindless.diamond_diode.N   the p-i-n diamond diode
//   material.gtceu.<n>                                            the new GT materials
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.ultrapure_water_plant', 'Ultrapure Water Plant'],
        ['gtceu.ultrapure_water', 'Ultrapure Water'],
        ['block.gtceu.betavoltaic_fab', 'Betavoltaic Fab'],
        ['gtceu.betavoltaic', 'Betavoltaic Fabrication'],

        ['grindless.machine.ultrapure_water_plant.tooltip.0',
            '§7Climbs purified water grades 1 to 5 and polishes them into ultrapure water for UHV processes.'],

        ['grindless.machine.betavoltaic_fab.tooltip.0',
            '§7Plates nickel-63 onto diamond diodes to make betavoltaic cells.'],
        ['grindless.machine.betavoltaic_fab.no_voiding',
            'Voiding is off: the nickel-63 baths are radioactive and must never be thrown away.'],

        ['gtceu.recipe.grindless_ultrapure_water.carbon_filtration',
            'Circuit 2: activated carbon filtration to purified water grade 1; the carbon bed wears slowly'],
        ['gtceu.recipe.grindless_ultrapure_water.reverse_osmosis',
            'Circuit 3: two-pass reverse osmosis to grade 2; the concentrate leaves as salt water'],
        ['gtceu.recipe.grindless_ultrapure_water.electrodeionisation',
            'Circuit 4: electrodeionisation to grade 3'],
        ['gtceu.recipe.grindless_ultrapure_water.uv_oxidation',
            'Circuit 5: 185 nm UV oxidation of organics to grade 4; a little carbon dioxide escapes'],
        ['gtceu.recipe.grindless_ultrapure_water.degassing',
            'Circuit 6: membrane degassing to grade 5'],
        ['gtceu.recipe.grindless_ultrapure_water.ultrapure_water',
            'Circuit 1: mixed-bed polishing of grade 5 to 18.2 MOhm.cm; the acid and caustic regenerate the beds, the brine leaves as salt water'],
        ['gtceu.recipe.grindless_betavoltaic.plating_liquor',
            'Circuit 1: nickel-63 targets dissolved into plating liquor'],
        ['gtceu.recipe.grindless_betavoltaic.betavoltaic_cell',
            'Circuit 2: nickel-63 plated onto eight diamond diodes'],
        ['gtceu.recipe.grindless_betavoltaic.strip_bath',
            'Circuit 3: the spent bath back to nitric acid; the nickel-62 left over goes to the hot cell'],

        ['item.grindless.diamond_diode', 'Diamond Diode'],
        ['tooltip.grindless.diamond_diode.0',
            'A p-i-n junction grown on CVD diamond: boron on one side, phosphorus on the other.'],
        ['tooltip.grindless.diamond_diode.1',
            'Diamond lattice fab, circuit 5. Takes nickel-63 in the betavoltaic fab.'],

        ['material.gtceu.carbon_12_monoxide', 'Carbon-12 Monoxide'],
        ['material.gtceu.carbon_12_methane', 'Carbon-12 Methane'],
        ['material.gtceu.nickel_63_plating_liquor', 'Nickel-63 Plating Liquor'],
        ['material.gtceu.depleted_nickel_plating_liquor', 'Depleted Nickel Plating Liquor']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
