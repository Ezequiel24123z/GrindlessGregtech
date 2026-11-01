// priority: 1634
// Gregtech Grindless - names and tooltips of UXV's stellar elevator, plasma mass filter and stellar condensation tower
// (startup_scripts/grindless/uxv/cygnus_lift.js; package UXV-B2):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   emi.grindless.info.uxv_cygnus_lift_stock.0         the info page of the three solid condensates (stock for OpV)
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.stellar_elevator', 'Stellar Elevator'],
        ['block.gtceu.plasma_mass_filter', 'Plasma Mass Filter'],
        ['block.gtceu.stellar_condensation_tower', 'Stellar Condensation Tower'],
        ['gtceu.star_lifting', 'Star Lifting'],
        ['gtceu.plasma_mass_filtering', 'Plasma Mass Filtering'],
        ['gtceu.stellar_condensation', 'Stellar Condensation'],

        ['grindless.machine.stellar_elevator.tooltip.0',
            '\u00a77A magnetic funnel that lifts plasma out of the Cygnus X-1 donor star.'],
        ['grindless.machine.plasma_mass_filter.tooltip.0',
            '\u00a77A solenoid that sorts stellar and disk plasma by mass.'],
        ['grindless.machine.stellar_condensation_tower.tooltip.0',
            '\u00a77Condenses the heavy plasma cut stage by stage in a seven-stage column.'],

        ['emi.grindless.info.stellar_elevator.0',
            'All of its matter comes from the Cygnus X-1 donor star, lifted in Cygnus X-1 orbit through two UIV energy hatches. It needs a 6N helium-cooled controller. It lies on its side: orbit has no up.'],
        ['emi.grindless.info.stellar_elevator.1',
            'The helium is not lost: 900 mB leave warm, the LuV refrigerator recondenses them and they return to the UV cold works. The elevator log is the record of a lift, kept for the pack\'s data work.'],
        ['emi.grindless.info.plasma_mass_filter.0',
            'Stellar plasma from the Cygnus X-1 donor star is lifted by the stellar elevator and sorted here, in Cygnus X-1 orbit: hydrogen, helium, CNO and heavy cuts. The disk row also sorts accretion-disk plasma.'],
        ['emi.grindless.info.plasma_mass_filter.1',
            'Every cut has a use: the helium cut becomes triple-alpha fuel for the Mk6 fusion ring, the hydrogen and CNO cuts feed the ring directly, the hydrogen cut also carries the volatiles in the condensation tower, and the heavy cut is condensed there.'],
        ['emi.grindless.info.stellar_condensation_tower.0',
            'The heavy cut and the hydrogen cut come from Cygnus X-1 orbit, so the tower runs there. Seven stages condense the heavy cut in order: the refractory condensate at the hot base, the metal and then the silicate condensate up the column.'],
        ['emi.grindless.info.stellar_condensation_tower.1',
            'Nothing is vented: the volatile condensate (methane, ammonia and water) goes to the syngas plant, which reforms it into hydrogen, carbon dioxide and nitrogen. The three condensates are stock for the next era\'s refining, kept in AE2 storage.'],
        ['emi.grindless.info.uxv_cygnus_lift_stock.0',
            'Stock for OpV: the refractory, metal and silicate condensates of Cygnus X-1 have no use in UXV; the next era refines them. They are inert, so AE2 storage holds them safely.'],

        ['gtceu.recipe.grindless_star_lifting.stellar_lift',
            'Circuit 1: liquid helium cools the lift tube while the magnetic funnel draws plasma off the Cygnus X-1 donor; 900 mB of warm helium comes back.'],
        ['gtceu.recipe.grindless_star_lifting.elevator_log',
            'Circuit 2: a data module records the flow of the plasma column and uses up 100 mB of the plasma it samples.'],
        ['gtceu.recipe.grindless_plasma_mass_filtering.stellar_cuts',
            'Circuit 1: the solenoid sorts stellar plasma by mass into the hydrogen, helium, CNO and heavy cuts.'],
        ['gtceu.recipe.grindless_plasma_mass_filtering.disk_filter',
            'Circuit 2: accretion-disk plasma is filtered; its heavy tenth leaves as the heavy cut.'],
        ['gtceu.recipe.grindless_stellar_condensation.condense',
            'Circuit 1: the heavy cut condenses in sequence into the refractory, metal and silicate condensates; the hydrogen cut carries the volatiles off the top.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
