// priority: 1664
// Gregtech Grindless - names and tooltips of UXV's ejecta knot sweeper and annihilation laser works, their items and the package's older rows
// (startup_scripts/grindless/uxv/cas_a.js; package UXV-B5):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   item.grindless.<id>, tooltip.grindless.<id>.N      the package's three items
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.ejecta_knot_sweeper', 'Ejecta Knot Sweeper'],
        ['block.gtceu.annihilation_laser_works', 'Annihilation Laser Works'],
        ['gtceu.ejecta_sweeping', 'Ejecta Sweeping'],
        ['gtceu.annihilation_lasing', 'Annihilation Lasing'],

        ['grindless.machine.ejecta_knot_sweeper.tooltip.0',
            '\u00a77Sweeps the titanium-rich knots of Cassiopeia A into dust.'],
        ['grindless.machine.annihilation_laser_works.tooltip.0',
            '\u00a77Binds positrons into positronium and fires a 511 keV gamma pulse.'],

        ['item.grindless.moderated_ps_cell', 'Moderated Ps Cell'],
        ['tooltip.grindless.moderated_ps_cell.0', 'Positrons slowed in solid neon until they bind as positronium.'],
        ['tooltip.grindless.moderated_ps_cell.1', 'Stimulated into a gamma laser module by the annihilation laser works.'],
        ['item.grindless.spent_ti44_core', 'Spent Ti-44 Core'],
        ['tooltip.grindless.spent_ti44_core.0', 'A Ti-44 core that has decayed to calcium-44 in its tungsten shell.'],
        ['tooltip.grindless.spent_ti44_core.1', 'Reclaimed in the hot cell as calcium dust and tungsten.'],
        ['item.grindless.ejecta_ti_fraction_dust', 'Ejecta Titanium Fraction'],
        ['tooltip.grindless.ejecta_ti_fraction_dust.0', 'The titanium that leaching leaves from Cassiopeia A\'s ejecta dust.'],
        ['tooltip.grindless.ejecta_ti_fraction_dust.1', 'Four go into the calutron for one titanium-44.'],

        ['emi.grindless.info.ejecta_knot_sweeper.0',
            'The titanium-44 knots are Cassiopeia A\'s: the sweeper runs at the remnant and nowhere else, and it needs 2 A of UIV, the most a UIV energy hatch pair carries.'],
        ['emi.grindless.info.ejecta_knot_sweeper.1',
            'The dust is inert apart from its titanium: the extraction cascade (circuit 22) takes the titanium fraction, the calutron (circuit 14) makes titanium-44, and the calcium-silicon and iron-sulphur residues are wollastonite and pyrite dust. The X-ray profiler can also map it.'],
        ['emi.grindless.info.annihilation_laser_works.0',
            'Titanium-44 is capsuled in tungsten in the hot cell (mode 16). Its decay gives positrons for the moderator; the spent core returns as calcium-44, which is stock calcium dust here, and tungsten (mode 17).'],
        ['emi.grindless.info.annihilation_laser_works.1',
            'The annihilation heat leaves in liquid helium, which comes out as helium for the cooling loop of the He-3 polariser. The gamma laser module is the emitter\'s source: with lasagna plates it makes the UXV emitter. UV\'s antimatter trap (circuit 5) packs positron cartridges into a positron stack.'],

        ['gtceu.recipe.grindless_ejecta_sweeping.sweep_ejecta_knots',
            'Circuit 1: the magnetic mouth sweeps four ejecta knot dusts; an MH winding is kept and one run in fifty wears it out.'],
        ['gtceu.recipe.grindless_annihilation_lasing.moderate_positronium',
            'Circuit 1: positrons from a Ti-44 core are slowed in a neon cartridge; the heat leaves in liquid helium. The core wears out one run in fifty.'],
        ['gtceu.recipe.grindless_annihilation_lasing.stimulate_gamma_emission',
            'Circuit 2: a positron stack loads the moderated Ps cell, which condenses in the gamma laser cavity; the MTJ die times the 511 keV pulse.'],
        ['gtceu.recipe.grindless_antimatter_storage.positron_stack',
            'Circuit 5: four positron cartridges are held in a nitrogen buffer gas as one positron stack; the gas is only a medium.'],
        ['gtceu.recipe.grindless_calutron_separation.titanium_44',
            'Circuit 14: the ejecta titanium fraction split by mass; the other titanium goes back to stock as titanium dust'],
        ['gtceu.recipe.grindless_hot_cell.ti44_core_capsule',
            'Mode 16: titanium-44 sealed in a tungsten capsule'],
        ['gtceu.recipe.grindless_hot_cell.ti44_core_decay',
            'Mode 17: a spent Ti-44 core reclaimed as calcium dust and tungsten'],
        ['gtceu.recipe.grindless_xray_pulse_profiling.ti44_map',
            'Circuit 3: four ejecta knot dusts profiled onto a data orb as the Ti-44 map of the remnant']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
