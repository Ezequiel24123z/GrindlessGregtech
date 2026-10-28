// priority: 3358
// Gregtech Grindless - names and tooltips of UIV's isotopes and element 120 (startup_scripts/grindless/uiv/isotopes.js; package UIV-A1):
//   item.grindless.<n>, tooltip.grindless.<n>.0/.1               the four items
//   material.gtceu.<n>                                           the new GT materials
//   gtceu.recipe.grindless_<type>.<recipe>                       the EMI line of each older row the package adds
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    var ITEMS = [
        ['item', 'cf249_target_wheel',
            ['Californium-249 Target Wheel', 'A target wheel loaded with californium-249 from the berkelium store.', 'Bombarded with titanium-50 it gives element 120.'],
            ['Rueda blanco de californio-249', 'Una rueda blanco cargada con californio-249 del almacén de berkelio.', 'Bombardeada con titanio-50 da el elemento 120.']],
        ['item', 'ni58_ti_multilayer',
            ['Nickel-58/Titanium Multilayer', 'A glass chip with alternating nickel-58 and titanium layers, a few nanometres each.', 'Grown by molecular beam epitaxy.'],
            ['Multicapa de níquel-58 y titanio', 'Un chip de vidrio con capas alternas de níquel-58 y titanio, de pocos nanómetros cada una.', 'Crecida por epitaxia de haces moleculares.']],
        ['item', 'neutron_supermirror',
            ['Neutron Supermirror', 'Reflects neutrons at wide angles; the nickel-58 layers make the mirror.', 'Four of them line a neutron guide.'],
            ['Supervespejo de neutrones', 'Refleja neutrones en ángulos amplios; las capas de níquel-58 forman el espejo.', 'Cuatro revisten una guía de neutrones.']],
        ['item', 'neutron_guide',
            ['Neutron Guide', 'A tube lined with supermirrors that carries a neutron beam without losing it.', 'Two make a cage part.'],
            ['Guía de neutrones', 'Un tubo revestido de supervespejos que lleva un haz de neutrones sin perderlo.', 'Dos forman una pieza de jaula.']]
    ]

    var MATERIALS = [
        ['titanium_tetrachloride_ice', 'Titanium Tetrachloride Ice', 'Hielo de tetracloruro de titanio'],
        ['titanium_50_chloride', 'Titanium-50 Tetrachloride', 'Tetracloruro de titanio-50'],
        ['titanium_50_sponge', 'Titanium-50 Sponge', 'Esponja de titanio-50'],
        ['nickel_chloride', 'Nickel Chloride', 'Cloruro de níquel'],
        ['nickel_58_chloride', 'Nickel-58 Chloride', 'Cloruro de níquel-58'],
        ['lithium_6_metal', 'Lithium-6 Metal', 'Litio-6 metálico'],
        ['element_120_recoil_gas', 'Element 120 Recoil Gas', 'Gas de retroceso del elemento 120']
    ]

    var ENTRIES = [
        ['gtceu.recipe.grindless_calutron_separation.titanium_50',
            'Circuit 7: titanium tetrachloride ice split by mass; the depleted rest goes back to stock',
            'Circuito 7: hielo de tetracloruro de titanio separado por masa; el resto empobrecido vuelve al almacén'],
        ['gtceu.recipe.grindless_calutron_separation.europium_151',
            'Circuit 8: europium oxide split by mass; the depleted rest goes back to stock',
            'Circuito 8: óxido de europio separado por masa; el resto empobrecido vuelve al almacén'],
        ['gtceu.recipe.grindless_calutron_separation.nickel_58',
            'Circuit 9: nickel chloride split by mass; the depleted rest goes back to stock',
            'Circuito 9: cloruro de níquel separado por masa; el resto empobrecido vuelve al almacén'],
        ['gtceu.recipe.grindless_pyroprocessing.titanium_50_sponge',
            'Circuit 6: titanium-50 chloride reduced with magnesium (the Kroll route)',
            'Circuito 6: cloruro de titanio-50 reducido con magnesio (la vía Kroll)'],
        ['gtceu.recipe.grindless_pyroprocessing.nickel_58_metal',
            'Circuit 7: nickel-58 chloride reduced with hydrogen; the acid is kept',
            'Circuito 7: cloruro de níquel-58 reducido con hidrógeno; el ácido se conserva'],
        ['gtceu.recipe.grindless_pyroprocessing.lithium_6_metal',
            'Circuit 8: lithium-6 reduced to metal in the LiCl melt; the lithium and the salt are never used up',
            'Circuito 8: litio-6 reducido a metal en el baño de LiCl; el litio y la sal nunca se gastan'],
        ['gtceu.recipe.grindless_hot_cell.cf249_target_wheel',
            'Mode 12: californium-249 pressed on a blank target wheel',
            'Modo 12: californio-249 prensado sobre una rueda blanco vacía'],
        ['gtceu.recipe.grindless_heavy_ion_irradiation.element_120',
            'Circuit 7: a titanium-50 beam on the californium-249 wheel; the wheel comes back activated',
            'Circuito 7: un haz de titanio-50 sobre la rueda de californio-249; la rueda vuelve activada'],
        ['gtceu.recipe.grindless_recoil_separation.element_120',
            'Circuit 6: element 120 caught from its recoil gas on the membrane',
            'Circuito 6: el elemento 120 recogido de su gas de retroceso en la membrana'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.ni58_ti_multilayer',
            'Circuit 4: alternating nickel-58 and titanium layers grown on glass',
            'Circuito 4: capas alternas de níquel-58 y titanio crecidas sobre vidrio']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[1], i[2][0], i[3][0]])
        ENTRIES.push(['tooltip.grindless.' + i[1] + '.0', i[2][1], i[3][1]])
        ENTRIES.push(['tooltip.grindless.' + i[1] + '.1', i[2][2], i[3][2]])
    })
    MATERIALS.forEach(function (m) {
        ENTRIES.push(['material.gtceu.' + m[0], m[1], m[2]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
