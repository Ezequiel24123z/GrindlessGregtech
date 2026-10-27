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

    add('grindless.machine.hts_magnet_works.tooltip.0', 'A magnet factory: superconducting tape is wound on a turning mandrel, impregnated with epoxy in a vacuum tank and cold-tested in a liquid-helium cryostat. The programmed circuit picks the product: 1 HTS coil, 2 LuV SMES cell, 3 coilgun coil casings, 4 magnetic bearing.')
    add('grindless.machine.hts_magnet_works.tooltip.1', 'HTS coil: 16 ITBTC coated conductor, 16 niobium-titanium foils, 144 mB of trinium and 144 mB of epoxy make GTM\'s superconducting coil block with a twenty-fourth of the trinium its LuV recipe takes. SMES cell: the wireless network\'s LuV cell, 983,040,000 EU in a coil\'s field.')
    add('grindless.machine.hts_magnet_works.tooltip.2', 'Every winding needs a 1,000 mB liquid helium charge in an input hatch for its cold test: it is never used up. Nothing is left over.')
    add('grindless.machine.hts_magnet_works.tooltip.3', 'The base\'s front and back rows and the cryostat\'s front wall take 1-2 energy hatches, 1-3 input buses, 1-3 input hatches and 1-2 output buses; ME parts fit. Two energy hatches of one tier lift the voltage one tier, wireless ones included.')

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

    add('grindless.machine.hts_magnet_works.tooltip.0', 'Una fábrica de imanes: la cinta superconductora se bobina en un mandril giratorio, se impregna de epoxi en un tanque de vacío y se prueba en frío en un criostato de helio líquido. El circuito programado elige el producto: 1 bobina HTS, 2 celda SMES LuV, 3 carcasas de bobina de cañón de bobinas, 4 cojinete magnético.')
    add('grindless.machine.hts_magnet_works.tooltip.1', 'Bobina HTS: 16 de conductor recubierto de ITBTC, 16 láminas de niobio-titanio, 144 mB de trinio y 144 mB de epoxi dan el bloque de bobina superconductora de GTM con una vigésima cuarta parte del trinio que pide su receta LuV. Celda SMES: la celda LuV de la red inalámbrica, 983 040 000 EU en el campo de una bobina.')
    add('grindless.machine.hts_magnet_works.tooltip.2', 'Cada bobinado necesita una carga de 1000 mB de helio líquido en una escotilla de entrada para su prueba en frío: nunca se gasta. No sobra nada.')
    add('grindless.machine.hts_magnet_works.tooltip.3', 'Las filas delantera y trasera de la base y la pared delantera del criostato admiten 1-2 escotillas de energía, 1-3 buses de entrada, 1-3 escotillas de entrada y 1-2 buses de salida; valen las piezas ME. Dos escotillas de energía del mismo nivel suben el voltaje un nivel, también las inalámbricas.')

    add('gtceu.recipe.grindless_magnet_winding.hts_coil', 'Circuito 1: una bobina HTS bobinada, probada en frío en la carga de helio')
    add('gtceu.recipe.grindless_magnet_winding.luv_smes_cell', 'Circuito 2: la celda LuV de la red inalámbrica, una bobina SMES')
    add('gtceu.recipe.grindless_magnet_winding.coilgun_coil_casing', 'Circuito 3: bobinas de Hg-1223 para el cañón de bobinas, bobinadas y encapsuladas')
    add('gtceu.recipe.grindless_magnet_winding.magnetic_bearing', 'Circuito 4: un cojinete magnético de tetrataenita')

    add('grindless.machine.hts_magnet_works.charge.ok', 'Carga de helio líquido: %s mB (necesita %s mB, nunca se gasta)')
    add('grindless.machine.hts_magnet_works.charge.low', 'Carga de helio líquido: %s de %s mB. Ningún bobinado arranca sin la carga completa en una escotilla de entrada')
})
