// priority: 3037
// Gregtech Grindless - names and tooltips of UIV's spectral hole burner (startup_scripts/grindless/uiv/memories_cryostat.js; package UIV-A6):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each burner recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.spectral_hole_burner', 'Spectral Hole Burner'],
        ['block.gtceu.millikelvin_cryostat_works', 'Millikelvin Cryostat Works'],
        ['gtceu.spectral_hole_burning', 'Spectral Hole Burning'],
        ['gtceu.nuclear_demagnetisation', 'Nuclear Demagnetisation'],
        ['material.gtceu.he3_he4_mixture', 'He-3/He-4 Mixture'],
        ['material.gtceu.erbium_chloride_solution', 'Erbium Chloride Solution'],

        ['grindless.machine.millikelvin_cryostat_works.tooltip.0',
            '\u00a77Cools nuclei to millikelvin: mK cryostat modules and P:Si processors.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.nuclear_stage',
            'Circuit 1: PrNi5 and copper plates make the nuclear demagnetisation stage.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.mk_module',
            'Circuit 2: the nuclear stage, a cold plate and the dilution mixture make a mK cryostat module; the mixture is returned.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.p_si_processor',
            'Circuit 3: the overgrown P:Si die is characterised at millikelvin in 500 mB liquid helium; the module is a catalyst.'],

        ['grindless.machine.spectral_hole_burner.tooltip.0',
            '\u00a77Burns frequency combs into YSO slabs: six-hour and telecom memory.'],

        ['gtceu.recipe.grindless_spectral_hole_burning.six_hour_slab',
            'Circuit 1: a comb burned into Eu-151:YSO keeps the state for six hours; 500 mB superfluid helium is consumed.'],
        ['gtceu.recipe.grindless_spectral_hole_burning.telecom_slab',
            'Circuit 2: a comb burned into Er:YSO stores light at telecom wavelength; 500 mB superfluid helium is consumed.'],
        // the crystal furnace rows UIV-A6 appends to tables/crystals.json
        ['gtceu.recipe.grindless_crystal_growth.eu151_yso',
            'Circuit 8: yttrium orthosilicate grown with europium-151 for the six-hour memory.'],
        ['gtceu.recipe.grindless_crystal_growth.er_yso',
            'Circuit 9: yttrium orthosilicate grown with erbium for the telecom memory.']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['eu151_yso_boule', 'Eu-151:YSO Boule', 'Yttrium orthosilicate doped with europium-151.', 'Grown in the crystal furnace (circuit 8) and cut into slabs.'],
        ['er_yso_boule', 'Er:YSO Boule', 'Yttrium orthosilicate doped with erbium.', 'Grown in the crystal furnace (circuit 9) and cut into slabs.'],
        ['eu151_yso_slab', 'Eu-151:YSO Slab', 'A polished slab cut from the boule.', 'Goes into the spectral hole burner (circuit 1).'],
        ['er_yso_slab', 'Er:YSO Slab', 'A polished slab cut from the boule.', 'Goes into the spectral hole burner (circuit 2).'],
        ['six_hour_memory_slab', 'Six-Hour Memory Slab', 'A slab with an atomic frequency comb that holds a state for hours.', 'Mounted with a cryostat module into a six-hour memory.'],
        ['telecom_memory_slab', 'Telecom Memory Slab', 'A slab that stores light at telecom wavelength.', 'Spliced to ytterbium fibre in the fibre drawer.'],
        ['six_hour_memory', 'Six-Hour Quantum Memory', 'A cooled Eu-151:YSO memory with its sensor.', 'Consumes one millikelvin cryostat module.'],
        ['nuclear_stage', 'Nuclear Demagnetisation Stage', 'A PrNi5 and copper stage that cools nuclei by demagnetisation.', 'Goes into the mK cryostat module.'],
        ['cold_plate', 'Cold Plate', 'A copper plate soaked in superfluid helium.', 'Carries the heat from the nuclear stage.'],
        ['p_si_processor', 'Characterised P:Si Processor', 'An overgrown phosphorus-in-silicon die, mapped at millikelvin.', 'Made only in the millikelvin cryostat works (circuit 3).'],
        ['er_preform', 'Er-Doped Preform', 'A silica preform doped with erbium and aluminium.', 'Drawn into erbium fibre.'],
        ['er_fibre', 'Erbium Fibre', 'Gain fibre for telecom amplifiers.', 'Coiled with a ytterbium fibre lead.'],
        ['er_fibre_coil', 'Erbium Fibre Coil', 'A coil of gain fibre with its lead spliced on.', 'Pumped by two InGaAs pump modules.'],
        ['pumped_edfa', 'Pumped EDFA', 'An erbium-doped fibre amplifier for telecom light.', 'Keeps the telecom memory network alive.']
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
