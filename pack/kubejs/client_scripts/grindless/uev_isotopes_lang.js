// priority: 5002
// Gregtech Grindless - names and tooltips of UEV's isotope separation (startup_scripts/grindless/uev/isotopes.js; package UEV-A1):
//
//   block.gtceu.calutron, gtceu.calutron_separation               machine and recipe type names
//   grindless.machine.calutron.tooltip.N / .no_voiding            controller tooltips and the refusal to void
//   item.grindless.<n>, tooltip.grindless.<n>.0/.1                the four items
//   material.gtceu.<n>                                            the new GT materials
//   gtceu.recipe.grindless_calutron_separation.<recipe>           the EMI line of each calutron recipe (and of the older HFIR and
//                                                                 facility rows the package adds)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [kind, id, [name, tip 0, tip 1]] for items; [id, name] for materials
    var ITEMS = [
        ['item', 'ca48_oven_charge',
            ['Calcium-48 Oven Charge', 'Calcium-48 metal pressed on platinum foil, for the ion source of a heavy-ion accelerator.', 'Made from the calutron\'s calcium-48.']],
        ['item', 'plutonium_oxide_target',
            ['Plutonium-242 Oxide Target', 'Plutonium-242 oxide in a zircaloy tube; it breeds plutonium-244 in the high flux reactor.', 'The plutonium-242 comes from the calutron.']],
        ['item', 'irradiated_plutonium_target',
            ['Irradiated Plutonium Target', 'A plutonium target out of the high flux reactor, hot and rich in plutonium-244.', 'Dissolve it in the transuranium facility.']],
        ['item', 'ca48_crucible_load',
            ['Calcium-48 Crucible Load', 'Calcium-48 metal packed in a tantalum-foil liner, so the hot calcium never touches the oven wall.', 'Pressed on platinum foil into an oven charge.']],
        ['item', 'pu244_plating_ampoule',
            ['Plutonium-244 Plating Ampoule', 'Plutonium-244 oxide dissolved in nitric acid inside a sealed glass tube, ready for electrodeposition.', 'Plated onto aluminium foil as a target.']],
        ['item', 'plutonium_244_target',
            ['Plutonium-244 Target', 'Plutonium-244 oxide electrodeposited on aluminium foil.', 'Feeds the superheavy facility.']]
    ]

    var MATERIALS = [
        ['calcium_48_enriched', 'Enriched Calcium (40% Ca-48)'],
        ['calcium_48_enriched_chloride', 'Enriched Calcium Chloride'],
        ['plutonium_oxide_feed', 'Plutonium Oxide Feed'],
        ['plutonium_242_oxide', 'Plutonium-242 Oxide'],
        ['plutonium_244_rich_oxide', 'Plutonium-244-Rich Oxide'],
        ['plutonium_244_rich_chloride', 'Plutonium-244-Rich Chloride'],
        ['plutonium_244_oxide', 'Plutonium-244 Oxide'],
        ['depleted_plutonium_oxide', 'Depleted Plutonium Oxide'],
        ['mox_blend_powder', 'MOX Blend Powder'],
        ['plutonium_nitrate', 'Plutonium Nitrate'],
        ['curium_californium_nitrate', 'Curium-Californium Nitrate'],
        ['berkelium_californium_nitrate', 'Berkelium-Californium Nitrate'],
        ['curium_nitrate', 'Curium Nitrate'],
        ['californium_nitrate', 'Californium Nitrate'],
        ['berkelium_nitrate', 'Berkelium Nitrate']
    ]

    // [key, en]
    var ENTRIES = [
        ['block.gtceu.calutron', 'Calutron'],
        ['gtceu.calutron_separation', 'Calutron Separation'],

        ['grindless.machine.calutron.tooltip.0',
            '§7Separates isotopes by mass in an electromagnetic racetrack.'],
        ['grindless.machine.calutron.no_voiding',
            'Voiding is off: the depleted streams and the actinides must never be thrown away.'],

        ['gtceu.recipe.grindless_calutron_separation.calcium_pass_1',
            'Circuit 1: calcium chloride to 40 % calcium-48; the depleted calcium chloride comes back as stock'],
        ['gtceu.recipe.grindless_calutron_separation.calcium_pass_2',
            'Circuit 2: second pass to 97 % calcium-48; the tail comes back as stock'],
        ['gtceu.recipe.grindless_calutron_separation.potassium_40',
            'Circuit 3: potassium-40 from potassium chloride; potassium-39 comes back as stock'],
        ['gtceu.recipe.grindless_calutron_separation.lithium_6',
            'Circuit 4: lithium-6 from lithium chloride; lithium-7 comes back as stock'],
        ['gtceu.recipe.grindless_calutron_separation.plutonium_244',
            'Circuit 5: plutonium-244 from the 244-rich chloride; the depleted plutonium goes to the MOX blend'],
        ['gtceu.recipe.grindless_calutron_separation.plutonium_242',
            'Circuit 6: plutonium-242 from plutonium oxide for the high flux reactor targets; the depleted plutonium goes to the MOX blend'],

        ['gtceu.recipe.grindless_high_flux_irradiation.plutonium_target',
            'Circuit 4: a plutonium-242 oxide target irradiated by 6 uranium-233 drivers; the pool water is never used up'],
        ['gtceu.recipe.grindless_transuranium_processing.plutonium_dissolve',
            'Circuit 7: the irradiated plutonium target dissolved in nitric acid; the fission products go apart'],
        ['gtceu.recipe.grindless_transuranium_processing.curium_californium_cut',
            'Circuit 8: the transcurium liquor cut by HDEHP into curium-californium and berkelium-californium nitrate; the solvent is never used up']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[1], i[2][0]])
        ENTRIES.push(['tooltip.grindless.' + i[1] + '.0', i[2][1]])
        ENTRIES.push(['tooltip.grindless.' + i[1] + '.1', i[2][2]])
    })
    MATERIALS.forEach(function (m) {
        ENTRIES.push(['material.gtceu.' + m[0], m[1], m[2]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
