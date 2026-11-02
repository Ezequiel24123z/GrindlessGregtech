// priority: 5736
// Gregtech Grindless - names and tooltips of OpV's Kugelblitz forge and Hawking collector, their three items and the EMI pages
// (startup_scripts/grindless/opv/kugelblitz.js; package OpV-D3):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips (short: what it does, then what it accepts)
//   item.grindless.<id>, tooltip.grindless.<id>.N      the package's three items
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers; emi.grindless.info.hawking_drive.N the drive's
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.kugelblitz_forge', 'Kugelblitz Forge'],
        ['block.gtceu.hawking_collector', 'Hawking Collector'],
        ['gtceu.kugelblitz_forming', 'Kugelblitz Forming'],
        ['gtceu.hawking_power', 'Hawking Power'],

        ['grindless.machine.kugelblitz_forge.tooltip.0',
            '\u00a77Focuses gamma pulses into a Kugelblitz. The hole does not spin.'],
        ['grindless.machine.kugelblitz_forge.tooltip.1',
            '\u00a77A failed seed (5%) is lost.'],
        ['grindless.machine.hawking_collector.tooltip.0',
            '\u00a77Feeds a Kugelblitz core, collects its Hawking radiation. It does not spin.'],
        ['grindless.machine.hawking_collector.tooltip.1',
            '\u00a77Burns exotic matter or stellar plasma; the core wears.'],

        ['item.grindless.gamma_pump_charge', 'Gamma Pump Charge'],
        ['tooltip.grindless.gamma_pump_charge.0', 'Positron annihilation stored in a gamma laser module as pump energy.'],
        ['tooltip.grindless.gamma_pump_charge.1', 'Four of them focus a Kugelblitz seed in the forge.'],
        ['item.grindless.kugelblitz_seed', 'Kugelblitz Seed'],
        ['tooltip.grindless.kugelblitz_seed.0', 'Gamma light focused inside a Schwarzschild radius, not yet held.'],
        ['tooltip.grindless.kugelblitz_seed.1', 'Charged with positrons and absorber tiles it becomes a core.'],
        ['item.grindless.evaporated_core_shell', 'Evaporated Core Shell'],
        ['tooltip.grindless.evaporated_core_shell.0', 'The absorber shell a Kugelblitz core leaves when it has evaporated.'],
        ['tooltip.grindless.evaporated_core_shell.1', 'Feeds the forge again; half of the absorber tiles come back.'],

        ['emi.grindless.info.kugelblitz_forge.0',
            'Gamma pulses pumped by positron annihilation are focused by Laue lenses and multilayer mirrors inside an FRC cartridge until their energy sits within a Schwarzschild radius (Crane & Westmoreland 2009 propose this; the forming is named fiction). It runs at Cygnus X-1 orbit and nowhere else, on up to two OpV energy hatches, and takes a parallel hatch. Circuits: 1 gamma pump charge, 2 seed, 3 core, 4 Hawking drive, 5 core from a spent shell.'],
        ['emi.grindless.info.kugelblitz_forge.1',
            'The hole never rotates, so there is no superradiance: it is a Schwarzschild hole, charged with positrons and held electrostatically in the absorber shell. A 10^9 kg hole has a lifetime of about 2,700 years (Hawking 1974; Page 1976). The lens and mirror wear 1/64 per seed; a failed seed (5%) is thrown into Cygnus X-1. The core feeds the Hawking collector and, with a mirror and a field-frozen plate, becomes a Hawking drive for the pathfinder. The spent shell of the collector feeds circuit 5.'],
        ['emi.grindless.info.hawking_collector.0',
            'A non-spinning Kugelblitz core of about 10^-18 m swallows ordinary matter very slowly: feeding it stable exotic matter at nuclear density is the rate the machine is built for, and stellar plasma feeds at half power (the feed rate is named fiction). The core keeps its mass and the feed is the fuel, so no energy comes from nothing. It runs at Cygnus X-1 orbit and nowhere else.'],
        ['emi.grindless.info.hawking_collector.1',
            'Circuit 1 burns 1 stable exotic matter for 2^30 EU/t during 14,800 ticks and wears the core 1/64; circuit 2 burns 4,000 mB stellar plasma for 2^29 EU/t during 4,600 ticks and wears it 1/32. Each run wears 1/8 of a gamma absorber tile, returning an activated tile at the same chance for IV hot cell circuit 22. Power leaves through two OpV 1 A dynamo hatches or one 4 A. The spent core comes back as an evaporated core shell, which feeds the Kugelblitz forge (circuit 5).'],
        ['emi.grindless.info.hawking_drive.0',
            'A Kugelblitz core, a gamma mirror and a field-frozen plate, forged anywhere: a drive that pushes on the light of an evaporating black hole. Stock for the pathfinder probe (R1).'],
        ['emi.grindless.info.hawking_drive.1',
            'Made only by the Kugelblitz forge (circuit 4). It brakes the pathfinder at Terzan 5.'],

        ['gtceu.recipe.grindless_kugelblitz_forming.charge_gamma_pump',
            'Circuit 1: two dense positron cells charge a gamma laser module (1/8 worn) with annihilation pump energy.'],
        ['gtceu.recipe.grindless_kugelblitz_forming.focus_kugelblitz_seed',
            'Circuit 2: four pump charges focused through a Laue lens and a mirror (each worn 1/64) into an FRC cartridge; 5% of the seeds fail and are lost.'],
        ['gtceu.recipe.grindless_kugelblitz_forming.condense_kugelblitz_core',
            'Circuit 3: the seed charged with positron cartridges and held in an absorber shell: a Kugelblitz core.'],
        ['gtceu.recipe.grindless_kugelblitz_forming.forge_hawking_drive',
            'Circuit 4: a core, a multilayer mirror and a field-frozen plate make a Hawking drive.'],
        ['gtceu.recipe.grindless_kugelblitz_forming.recondense_core_from_shell',
            'Circuit 5: a spent core shell stands in for half of the absorber tiles.'],
        ['gtceu.recipe.grindless_hawking_power.feed_exotic_matter',
            'Circuit 1: one stable exotic matter feeds the core, which wears 1/64 (an absorber tile 1/8); the spent core returns as a shell.'],
        ['gtceu.recipe.grindless_hawking_power.feed_stellar_plasma',
            'Circuit 2: stellar plasma feeds the core at half power, which wears 1/32 (an absorber tile 1/8); the spent core returns as a shell.']
    ]

    ENTRIES.push(['gtceu.recipe.grindless_kugelblitz_forming.caged_kugelblitz',
        'Circuit 7, Cygnus X-1: 16 Kugelblitz seeds and 8 cores, 32 caged nickel chains, 64 horizon tethers and 16 fed strangelets make 1 caged Kugelblitz'])

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
