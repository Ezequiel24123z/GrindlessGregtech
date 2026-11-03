// priority: 6616
// Gregtech Grindless - names and tooltips of MAX's mirror shell (startup_scripts/grindless/max/shell.js; package MAX-G1):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.mirror_shell', 'Mirror Shell'],
        ['gtceu.black_hole_bomb', 'Black Hole Bomb'],
        ['grindless.machine.mirror_shell.tooltip.0', '\u00a77A mirror shell round Sgr A*: its last recipe stabilises the horizon.'],
        ['emi.grindless.info.epilogue.0', 'The epilogue book. It is given at the arrival at the end of MAX+; it is not crafted.'],
        ['emi.grindless.info.mirror_shell_segment.0', 'A structure block: one segment of the mirror shell. Made in the swarm segment foundry; it takes no circuit.'],
        ['emi.grindless.info.stream_bundle_block.0', 'A structure block: the two belts of the mirror shell, at 30 degrees north and south on its outer layer. Made in the assembler.'],
        ['emi.grindless.info.mirror_shell.0', 'A two-layer sphere 35 blocks across, built at Sgr A* (black hole orbit): mirror shell segments inside, a tensegrity truss outside with two stream bundle block belts, and 26 cleanroom glass ports each ringed by shell window coil casings (about 7,060 blocks; the Terminal needs 4 passes). The controller sits in the middle of the front port; the hatches are in the two rows beside it: two MAX energy input hatches (16 A), one or two dynamo hatches and the item buses.'],
        ['emi.grindless.info.mirror_shell.1', 'Circuit 1 vents a seed wave packet into 2^30 EU/t for 4,800 ticks; the spent packet is inert (the wave leaves as light). Circuit 2 charts the final spin map. The segments are made on the swarm segment foundry; the shell takes none of its own products.'],
        ['emi.grindless.info.mirror_shell.2', 'Circuit 3 is the last recipe of MAX, the horizon stabilisation: 2^35 EU/t for 1,200 ticks on two MAX 16 A hatches turns 4 seed wave packets, 64 stream bundles, the final spin map, the cloud phase map, 16 horizon phase locks, 8 horizon flux clamps and a Rydberg logic array into the horizon lock, the spent array and 16 spent phase locks. Its first output opens MAX+ (the maxplus stage). The shell stays and the recipe can be repeated: MAX+ consumes more locks.'],
        ['gtceu.recipe.grindless_black_hole_bomb.vent_wave_packet', 'Circuit 1: a seed wave packet grows between the mirrors and is vented as 2^30 EU/t; the spent packet is inert.'],
        ['gtceu.recipe.grindless_black_hole_bomb.final_spin_map', 'Circuit 2: the Sgr A* spin map and the shell gradient map are joined into the final spin map.'],
        ['gtceu.recipe.grindless_black_hole_bomb.horizon_lock', 'Circuit 3: the last recipe of MAX. 2^35 EU/t on two MAX 16 A hatches; the structure stays and the first lock opens MAX+.'],
        ['gtceu.recipe.grindless_black_hole_bomb.horizon_shard', 'Circuit 5: two seed wave packets, the final spin map and four horizon phase locks fold one Horizon Shard out of the horizon at MAX power.'],
        ['gtceu.recipe.grindless_nuclear_clock.thorium_clock_reference', 'Circuit 6: a thorium-229 sample and a VUV optic are read against the nuclear clock (kept) into a frequency reference.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.cooled_cavity_mode', 'Circuit 10: a polished SRF cavity is cooled in the mK module and its mode characterised (the module and He-3/He-4 mixture are kept).'],
        ['gtceu.recipe.grindless_kugelblitz_forming.write_seed_wave_packet', 'Circuit 6: at Cygnus X-1 a Kugelblitz seed pumps a cooled cavity mode into a seed wave packet.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
