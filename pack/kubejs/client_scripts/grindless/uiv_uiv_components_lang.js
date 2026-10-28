// priority: 3321
// Gregtech Grindless - names and tooltips of the items of UIV's pump, robot arm and motor lines (startup_scripts/grindless/uiv/uiv_components.js;
// package UIV-A8):
//
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [name, en, es, tooltip 0 en, tooltip 0 es, tooltip 1 en, tooltip 1 es]
    var ITEMS = [
        ['rhea_am_powder', 'RHEA Powder', 'Polvo de RHEA', 'Gas-atomised refractory high-entropy alloy powder.', 'Polvo de aleación refractaria de alta entropía atomizado con gas.', 'Printed into the pump impeller; the spent bed goes back to the levitation melter.', 'Se imprime en el impulsor de la bomba; el lecho gastado vuelve al fundidor de levitación.'],
        ['near_net_rhea_impeller', 'Near-Net RHEA Impeller', 'Impulsor de RHEA casi final', 'A printed impeller with its blades, still porous.', 'Un impulsor impreso con sus álabes, aún poroso.', 'The powder bed printer\'s press closes its pores.', 'La prensa de la impresora de lecho de polvo cierra sus poros.'],
        ['printed_rhea_impeller', 'Printed RHEA Impeller', 'Impulsor de RHEA impreso', 'A pressed impeller, near its final density.', 'Un impulsor prensado, casi a su densidad final.', 'Goes to the megabar press for its last densification.', 'Va a la prensa de megabar para su densificación final.'],
        ['dense_rhea_impeller', 'Dense RHEA Impeller', 'Impulsor de RHEA denso', 'A fully dense impeller with a fine grain.', 'Un impulsor totalmente denso de grano fino.', 'Machined to size on a lathe.', 'Se mecaniza a medida en un torno.'],
        ['machined_rhea_impeller', 'Machined RHEA Impeller', 'Impulsor de RHEA mecanizado', 'An impeller cut to its final blade profile.', 'Un impulsor cortado a su perfil final de álabes.', 'Needs balancing before it spins.', 'Necesita equilibrado antes de girar.'],
        ['balanced_rhea_impeller', 'Balanced RHEA Impeller', 'Impulsor de RHEA equilibrado', 'An impeller trimmed with tungsten weights.', 'Un impulsor ajustado con pesos de wolframio.', 'The heart of the UIV electric pump.', 'El corazón de la bomba eléctrica UIV.'],
        ['rhea_swarf', 'RHEA Swarf', 'Virutas de RHEA', 'Chips from machining the impeller.', 'Virutas del mecanizado del impulsor.', 'Back to the levitation melter.', 'Vuelven al fundidor de levitación.'],
        ['zirconium_sponge', 'Zirconium Sponge', 'Esponja de circonio', 'The Kroll cake: zirconium sponge with its magnesium chloride.', 'La torta de Kroll: esponja de circonio con su cloruro de magnesio.', 'Vacuum distillation frees the metal.', 'La destilación al vacío libera el metal.'],
        ['bmg_blank', 'BMG Blank', 'Pieza bruta de vidrio metálico', 'A suction-cast cup of bulk metallic glass.', 'Una copa de vidrio metálico masivo colada por succión.', 'Machined into a flexspline.', 'Se mecaniza hasta un flexspline.'],
        ['bmg_gate', 'BMG Gate', 'Bebedero de vidrio metálico', 'The casting gate left on the blank.', 'El bebedero que queda en la pieza.', 'Back to the levitation melter.', 'Vuelve al fundidor de levitación.'],
        ['bmg_flexspline', 'BMG Flexspline', 'Flexspline de vidrio metálico', 'A thin glassy cup that flexes without wear.', 'Una copa fina y vítrea que flexiona sin desgaste.', 'The heart of the strain-wave gear.', 'El corazón del engranaje armónico.'],
        ['strain_wave_gear', 'Strain-Wave Gear', 'Engranaje armónico', 'A zero-backlash harmonic drive.', 'Un reductor armónico sin holgura.', 'Three go into a UIV robot arm.', 'Tres van en un brazo robótico UIV.'],
        ['ba_cu_blend', 'Barium-Copper Blend', 'Mezcla de bario y cobre', 'Barium and copper mixed in the Gd-123 ratio.', 'Bario y cobre mezclados en la proporción del Gd-123.', 'Fired with gadolinium oxide in oxygen.', 'Se cuece con óxido de gadolinio en oxígeno.'],
        ['bulk_gdbco', 'Bulk GdBCO', 'GdBCO masivo', 'A single-domain superconducting block grown from a seed.', 'Un bloque superconductor monodominio crecido desde una semilla.', 'Oxygenate it before use.', 'Oxigénalo antes de usarlo.'],
        ['oxygenated_gdbco', 'Oxygenated GdBCO', 'GdBCO oxigenado', 'A block annealed in oxygen so it superconducts.', 'Un bloque recocido en oxígeno para que superconduzca.', 'Impregnate it against cracking.', 'Impregnalo contra las grietas.'],
        ['impregnated_gdbco', 'Impregnated GdBCO', 'GdBCO impregnado', 'A block filled with epoxy against cracking.', 'Un bloque relleno de epoxi contra las grietas.', 'Field-cooled to trap its field.', 'Se enfría en campo para atrapar su campo.'],
        ['field_cooled_gdbco', 'Field-Cooled GdBCO', 'GdBCO enfriado en campo', 'A superconducting block that traps a strong field.', 'Un bloque superconductor que atrapa un campo intenso.', 'The rotor magnet of the UIV electric motor.', 'El imán de rotor del motor eléctrico UIV.']
    ]

    var ENTRIES = []
    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1], i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[3], i[4]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[5], i[6]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
