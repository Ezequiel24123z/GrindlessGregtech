// priority: 6900
// Gregtech Grindless - names, tooltips and EMI lines of MAX+'s two Magellanic Stream machines (startup_scripts/grindless/maxplus/stream.js; package XP-B2):
//
//   gtceu.<type>, block.gtceu.<machine>, grindless.machine.<machine>.tooltip.0   the recipe types and the controllers
//   gtceu.recipe.<data key>.<recipe>                                             the EMI line of each keyed row (the machines' own rows and the
//                                                                                older P9, P10, P11, P22 and P23 steps on machines whose type has a key)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.pristine_gas_works', 'Pristine Gas Works'],
        ['block.gtceu.pristine_gas_works', 'Pristine Gas Works'],
        ['grindless.machine.pristine_gas_works.tooltip.0', '\u00a77Scoops pristine gas out of the Magellanic Stream.'],
        ['grindless.machine.pristine_gas_works.tooltip.1', 'Runs up to 64 recipes at once, each at full cost.'],
        ['gtceu.primordial_fusion_torus', 'Primordial Fusion Torus'],
        ['block.gtceu.primordial_fusion_torus', 'Primordial Fusion Torus'],
        ['grindless.machine.primordial_fusion_torus.tooltip.0', '\u00a77A generator: deuterium and helium-3 fuse into a MAX 16 A dynamo hatch.'],

        ['gtceu.recipe.grindless_pristine_gas_works.pristine_gas', 'Circuit 1: 64,000 mB of pristine gas scooped per run at 2^33 EU/t, up to 64 runs at once (2^39 EU/t); wears a magnetic scoop module 1 in 64 per run (lines P9 and P10).'],
        ['gtceu.recipe.grindless_primordial_fusion_torus.helium_4_ash', 'Circuit 1: 1,000 mB each of deuterium and helium-3 fuse into helium-4 ash and hydrogen and make 2^34 EU/t; wears a neutral beam injector 1 in 64 and a direct converter stack 1 in 128.'],

        ['gtceu.recipe.grindless_calutron_separation.primordial_deuterium', 'Circuit 20: heavy-hydrogen fraction separated into primordial deuterium (line P9).'],
        ['gtceu.recipe.grindless_calutron_separation.pristine_helium_3', 'Circuit 21: crude helium-3 separated into pristine helium-3 (line P10).'],
        ['gtceu.recipe.grindless_electron_beam.refined_mo_grid', 'A molybdenum grid billet refined under argon (line P11).'],
        ['gtceu.recipe.grindless_field_freezing.field_frozen_hoop', 'Circuit 4: a scoop web frozen into a field-frozen hoop at SGR 1806-20 (line P23).'],
        ['gtceu.recipe.grindless_mtj_sputtering.insulated_hoop', 'Circuit 29: a field-frozen hoop sputtered with a molybdenum insulating layer (line P23).'],
        ['gtceu.recipe.grindless_magnet_winding.scoop_coil', 'Circuit 18: an insulated hoop wound with superconducting coils into a scoop coil (line P23).']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
