// priority: 3250
// Gregtech Grindless - names and tooltips of Cygnus X-1's ergosphere probe bay and Penrose engine (startup_scripts/grindless/uiv/cygnus.js; package UIV-B4):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe, and of each row the package appends to an older EMI table
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//   emi.grindless.info.*                               the info pages
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.ergosphere_probe_bay', 'Ergosphere Probe Bay'],
        ['block.gtceu.penrose_engine', 'Penrose Engine'],
        ['gtceu.ergosphere_probing', 'Ergosphere Probing'],
        ['gtceu.penrose_extraction', 'Penrose Extraction'],

        ['grindless.machine.ergosphere_probe_bay.tooltip.0', '\u00a77Drops probes through the ergosphere and loads the Penrose sleds.'],
        ['grindless.machine.penrose_engine.tooltip.0', '\u00a77Drops a split-charge sled into the ergosphere to harvest energy.'],
        ['grindless.machine.penrose_engine.tooltip.1', 'Needs 2 UIV 4A or 1 UIV 16A wireless dynamo hatch.'],

        ['emi.grindless.info.ergosphere_probe_bay.0',
            'The probe bay drops ergosphere probes through the spacetime of Cygnus X-1 (spin above 0.9985, 21.2 solar masses) and writes the Kerr metric on a 5D data crystal, which is kept.'],
        ['emi.grindless.info.ergosphere_probe_bay.1',
            'It also loads the sleds. A new sled takes a hull, a charge and a compacted waste canister; the half-sled the engine recovers is refitted with a fresh canister and charge.'],
        ['emi.grindless.info.ergosphere_probe_bay.2',
            'Circuit 1: probe. Circuit 2: new sled. Circuit 3: refit of a half-sled. Circuit 4: sled hull.'],
        ['emi.grindless.info.penrose_engine.0',
            'The Penrose engine drops a split-charge sled into the ergosphere. One half falls into the hole; the other comes back with more energy than it left with (Penrose, 1969; at best about 20.7 %).'],
        ['emi.grindless.info.penrose_engine.1',
            'A run gives 268,435,456 EU/t (8 A at UIV) for 2,400 ticks through wireless dynamo hatches: two UIV 4A or one UIV 16A. The Kerr chart is kept; the recovered half-sled is refitted in the probe bay.'],
        ['emi.grindless.info.uiv_cygnus_sled.0',
            'Waste goes in a synroc liner, then a megabar press compacts the filled canister. The canister is the sled\'s ballast; the sled hull is plated; the ringdown record is probe data read as gravitational waves on Ganymede.'],

        ['gtceu.recipe.grindless_ergosphere_probing.kerr_probe', 'Circuit 1: a probe dropped through the ergosphere writes the Kerr metric on the data crystal (kept)'],
        ['gtceu.recipe.grindless_ergosphere_probing.split_sled', 'Circuit 2: a hull, a charge and a compacted waste canister loaded into a split-charge sled'],
        ['gtceu.recipe.grindless_ergosphere_probing.refit_sled', 'Circuit 3: the recovered half-sled refitted with a fresh canister and charge'],
        ['gtceu.recipe.grindless_ergosphere_probing.sled_hull', 'Circuit 4: a sled hull plated from RHEA and tungsten-steel plates'],
        ['gtceu.recipe.grindless_penrose_extraction.penrose_drop', 'Circuit 1: the sled dropped into the ergosphere gives 268,435,456 EU/t for 2,400 ticks; the Kerr chart is kept'],

        ['gtceu.recipe.grindless_hot_cell.waste_canister_fill', 'Mode 15: radioactive waste sealed into a synroc liner'],
        ['gtceu.recipe.grindless_megabar.canister_compaction', 'Circuit 5: a filled waste canister compacted under the anvil into the sled\'s ballast']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['kerr_ringdown_record', 'Kerr Ringdown Record', 'Kerr probe data read as gravitational waves.', 'Correlated at the event horizon.'],
        ['synroc_liner', 'Synroc Liner', 'A cast synroc shell for waste.', 'Filled in the hot cell.'],
        ['filled_waste_canister', 'Filled Waste Canister', 'Radioactive waste sealed in synroc.', 'Compacted in the megabar press.'],
        ['compacted_waste_canister', 'Compacted Waste Canister', 'Waste squeezed dense enough to ride a sled.', 'Ballast of a split-charge sled.'],
        ['sled_hull', 'Sled Hull', 'A plated shell for the ergosphere drop.', 'Loaded in the ergosphere probe bay.'],
        ['split_charge_sled', 'Split-Charge Sled', 'Splits its charge in flight.', 'Dropped in the Penrose engine.']
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
