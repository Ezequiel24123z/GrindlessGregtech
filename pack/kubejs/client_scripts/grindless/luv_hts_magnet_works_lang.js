// priority: 7600
// Gregtech Grindless - names and tooltips of LuV's HTS Magnet Works (startup_scripts/grindless/luv/hts_magnet_works.js), its recipe type,
// the EMI line of each of its recipes and the controller's cold-test charge line.
//
//   gtceu:hts_magnet_works / gtceu.magnet_winding              (machine name + tooltips, recipe type name)
//   gtceu.recipe.grindless_magnet_winding.<recipe name>        (EMI line of each recipe: what the circuit makes)
//   grindless.machine.hts_magnet_works.charge.ok|low           (controller line: the liquid helium in the input hatches; %s held, %s needed)
//
// Same approach as iv_heavy_water_plant_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.hts_magnet_works', 'HTS Magnet Works')
    add('gtceu.magnet_winding', 'Magnet Winding')

    add('grindless.machine.hts_magnet_works.tooltip.0', '§7Winds superconducting tape into high-temperature magnets.')

    add('gtceu.recipe.grindless_magnet_winding.hts_coil', 'Circuit 1: a wound HTS coil, cold-tested in the helium charge')
    add('gtceu.recipe.grindless_magnet_winding.luv_smes_cell', 'Circuit 2: the wireless network\'s LuV cell, an SMES coil')
    add('gtceu.recipe.grindless_magnet_winding.coilgun_coil_casing', 'Circuit 3: Hg-1223 coilgun coils, wound and potted')
    add('gtceu.recipe.grindless_magnet_winding.magnetic_bearing', 'Circuit 4: a tetrataenite magnetic bearing')

    add('grindless.machine.hts_magnet_works.charge.ok', 'Liquid helium charge: %s mB (needs %s mB, never used up)')
    add('grindless.machine.hts_magnet_works.charge.low', 'Liquid helium charge: %s of %s mB. No winding starts without the full charge in an input hatch')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.hts_magnet_works', 'Fábrica de imanes HTS')
    add('gtceu.magnet_winding', 'Bobinado de imanes')

    add('grindless.machine.hts_magnet_works.tooltip.0', '§7Bobina cinta superconductora en imanes de alta temperatura.')

    add('gtceu.recipe.grindless_magnet_winding.hts_coil', 'Circuito 1: una bobina HTS bobinada, probada en frío en la carga de helio')
    add('gtceu.recipe.grindless_magnet_winding.luv_smes_cell', 'Circuito 2: la celda LuV de la red inalámbrica, una bobina SMES')
    add('gtceu.recipe.grindless_magnet_winding.coilgun_coil_casing', 'Circuito 3: bobinas de Hg-1223 para el cañón de bobinas, bobinadas y encapsuladas')
    add('gtceu.recipe.grindless_magnet_winding.magnetic_bearing', 'Circuito 4: un cojinete magnético de tetrataenita')

    add('grindless.machine.hts_magnet_works.charge.ok', 'Carga de helio líquido: %s mB (necesita %s mB, nunca se gasta)')
    add('grindless.machine.hts_magnet_works.charge.low', 'Carga de helio líquido: %s de %s mB. Ningún bobinado arranca sin la carga completa en una escotilla de entrada')
})
