// priority: 3100
// Gregtech Grindless - names and tooltips of UIV's isotopes and element 120 (startup_scripts/grindless/uiv/isotopes.js; package UIV-A1):
//   item.grindless.<n>, tooltip.grindless.<n>.0/.1               the four items
//   material.gtceu.<n>                                           the new GT materials
//   gtceu.recipe.grindless_<type>.<recipe>                       the EMI line of each older row the package adds
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    var ITEMS = [
        ['item', 'cf249_target_wheel',
            ['Californium-249 Target Wheel', 'A target wheel loaded with californium-249 from the berkelium store.', 'Bombarded with titanium-50 it gives element 120.']],
        ['item', 'ni58_ti_multilayer',
            ['Nickel-58/Titanium Multilayer', 'A glass chip with alternating nickel-58 and titanium layers, a few nanometres each.', 'Grown by molecular beam epitaxy.']],
        ['item', 'neutron_supermirror',
            ['Neutron Supermirror', 'Reflects neutrons at wide angles; the nickel-58 layers make the mirror.', 'Four of them line a neutron guide.']],
        ['item', 'neutron_guide',
            ['Neutron Guide', 'A tube lined with supermirrors that carries a neutron beam without losing it.', 'Two make a cage part.']]
    ]

    var MATERIALS = [
        ['titanium_tetrachloride_ice', 'Titanium Tetrachloride Ice'],
        ['titanium_50_chloride', 'Titanium-50 Tetrachloride'],
        ['titanium_50_sponge', 'Titanium-50 Sponge'],
        ['nickel_chloride', 'Nickel Chloride'],
        ['nickel_58_chloride', 'Nickel-58 Chloride'],
        ['lithium_6_metal', 'Lithium-6 Metal'],
        ['element_120_recoil_gas', 'Element 120 Recoil Gas']
    ]

    var ENTRIES = [
        ['gtceu.recipe.grindless_calutron_separation.titanium_50',
            'Circuit 7: titanium tetrachloride ice split by mass; the depleted rest goes back to stock'],
        ['gtceu.recipe.grindless_calutron_separation.europium_151',
            'Circuit 8: europium oxide split by mass; the depleted rest goes back to stock'],
        ['gtceu.recipe.grindless_calutron_separation.nickel_58',
            'Circuit 9: nickel chloride split by mass; the depleted rest goes back to stock'],
        ['gtceu.recipe.grindless_pyroprocessing.titanium_50_sponge',
            'Circuit 6: titanium-50 chloride reduced with magnesium (the Kroll route)'],
        ['gtceu.recipe.grindless_pyroprocessing.nickel_58_metal',
            'Circuit 7: nickel-58 chloride reduced with hydrogen; the acid is kept'],
        ['gtceu.recipe.grindless_pyroprocessing.lithium_6_metal',
            'Circuit 8: lithium-6 reduced to metal in the LiCl melt; the lithium and the salt are never used up'],
        ['gtceu.recipe.grindless_hot_cell.cf249_target_wheel',
            'Mode 12: californium-249 pressed on a blank target wheel'],
        ['gtceu.recipe.grindless_heavy_ion_irradiation.element_120',
            'Circuit 7: a titanium-50 beam on the californium-249 wheel; the wheel comes back activated'],
        ['gtceu.recipe.grindless_recoil_separation.element_120',
            'Circuit 6: element 120 caught from its recoil gas on the membrane'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.ni58_ti_multilayer',
            'Circuit 4: alternating nickel-58 and titanium layers grown on glass']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[1], i[2][0]])
        ENTRIES.push(['tooltip.grindless.' + i[1] + '.0', i[2][1]])
        ENTRIES.push(['tooltip.grindless.' + i[1] + '.1', i[2][2]])
    })
    MATERIALS.forEach(function (m) {
        ENTRIES.push(['material.gtceu.' + m[0], m[1]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
