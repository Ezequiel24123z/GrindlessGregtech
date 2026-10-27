// priority: 1000
// Gregtech Grindless - names and tooltips of ZPM's Naquadria Magnet Works (startup_scripts/grindless/zpm/magnet_works.js), its recipe type,
// the EMI line of each of its recipes, the controller's cold-test charge line, the HTS insert and the EMI info page text of the insert.
//
//   gtceu:naquadria_magnet_works / gtceu.naquadria_magnets          (machine name + tooltips, recipe type name)
//   gtceu.recipe.grindless_naquadria_magnets.<recipe name>          (EMI line of each recipe: what the circuit makes)
//   grindless.machine.naquadria_magnet_works.charge.ok|low          (controller line: the liquid helium in the input hatches)
//   item.grindless.hts_insert, tooltip.grindless.hts_insert.*       (the hybrid HTS insert)
//   emi.grindless.info.hts_insert.0                                 (its EMI info page)
// The ZPM SMES cell's and the ZPM wireless tier's names are in wireless_energy_lang.js (the table's rows).
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.naquadria_magnet_works', 'Naquadria Magnet Works')
    add('gtceu.naquadria_magnets', 'Naquadria Magnets')

    add('grindless.machine.naquadria_magnet_works.tooltip.0', 'The magnet factory one tier up: wire and cells are made in a mK shield with a winding lathe around a test bore. The programmed circuit picks the product: 1 ZPM SMES cell, 2 URhNq2 single wires, 3 HTS insert, 4 UV SMES cell.')
    add('grindless.machine.naquadria_magnet_works.tooltip.1', 'The wire is powder in the tube: uranium, rhodium, naquadah and a silver foil make 2 single wires without the 9,000 K blast, for more energy per wire than GTM\'s own route. The cells are the wireless network\'s ZPM cell, 3,932,160,000 EU, and its UV cell, 15,728,640,000 EU, wound from EnTED wire.')
    add('grindless.machine.naquadria_magnet_works.tooltip.2', 'The cell\'s winding needs a 1,000 mB liquid helium charge in an input hatch for its cold test: it is never used up. Nothing is left over. The base\'s front and back rows take 1-2 energy hatches, 1-3 input buses, 1-3 input hatches and 1-2 output buses; ME parts fit.')

    add('gtceu.recipe.grindless_naquadria_magnets.zpm_smes_cell', 'Circuit 1: the wireless network\'s ZPM cell, an SMES coil cold-tested in the helium charge')
    add('gtceu.recipe.grindless_naquadria_magnets.urhnq2_wire', 'Circuit 2: URhNq2 single wires, powder in the tube')
    add('gtceu.recipe.grindless_naquadria_magnets.hts_insert', 'Circuit 3: an HTS insert, a LuV HTS coil nested in URhNq2 winding')

    add('grindless.machine.naquadria_magnet_works.charge.ok', 'Liquid helium charge: %s mB (needs %s mB, never used up)')
    add('grindless.machine.naquadria_magnet_works.charge.low', 'Liquid helium charge: %s of %s mB. No cell starts without the full charge in an input hatch')

    add('item.grindless.hts_insert', 'HTS Insert')
    add('tooltip.grindless.hts_insert.0', 'A LuV HTS coil nested in URhNq2 winding.')
    add('tooltip.grindless.hts_insert.1', 'The field source of the ion implanter\'s magnet and the qubit fab.')
    add('emi.grindless.info.hts_insert.0', 'Wound in the Naquadria Magnet Works (circuit 3) from a LuV HTS coil and URhNq2 single wires. The ZPM machines that need a strong, steady field take it as their magnet.')
    add('emi.grindless.info.cryostat_casing.0', 'The Naquadria Magnet Works\' shell: a frostproof casing lined with gold and annealed copper plate, made in the assembler. It is the whole casing of that multiblock.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.naquadria_magnet_works', 'Fábrica de imanes de naquadria')
    add('gtceu.naquadria_magnets', 'Imanes de naquadria')

    add('grindless.machine.naquadria_magnet_works.tooltip.0', 'La fábrica de imanes un nivel más arriba: el cable y las celdas se hacen en un escudo de mK con un torno de bobinado alrededor de un hueco de pruebas. El circuito programado elige el producto: 1 celda SMES ZPM, 2 cables simples de URhNq2, 3 inserto HTS, 4 celda SMES UV.')
    add('grindless.machine.naquadria_magnet_works.tooltip.1', 'El cable es polvo en tubo: uranio, rodio, naquadah y una lámina de plata dan 2 cables simples sin el horno a 9000 K, con más energía por cable que la ruta de GTM. Las celdas son la celda ZPM de la red inalámbrica, 3 932 160 000 EU, y su celda UV, 15 728 640 000 EU, bobinada con cable de EnTED.')
    add('grindless.machine.naquadria_magnet_works.tooltip.2', 'El bobinado de la celda necesita una carga de 1000 mB de helio líquido en una escotilla de entrada para su prueba en frío: nunca se gasta. No sobra nada. Las filas delantera y trasera de la base admiten 1-2 escotillas de energía, 1-3 buses de entrada, 1-3 escotillas de entrada y 1-2 buses de salida; valen las piezas ME.')

    add('gtceu.recipe.grindless_naquadria_magnets.zpm_smes_cell', 'Circuito 1: la celda ZPM de la red inalámbrica, una bobina SMES probada en frío en la carga de helio')
    add('gtceu.recipe.grindless_naquadria_magnets.urhnq2_wire', 'Circuito 2: cables simples de URhNq2, polvo en tubo')
    add('gtceu.recipe.grindless_naquadria_magnets.hts_insert', 'Circuito 3: un inserto HTS, una bobina HTS LuV anidada en bobinado de URhNq2')

    add('grindless.machine.naquadria_magnet_works.charge.ok', 'Carga de helio líquido: %s mB (necesita %s mB, nunca se gasta)')
    add('grindless.machine.naquadria_magnet_works.charge.low', 'Carga de helio líquido: %s de %s mB. Ninguna celda arranca sin la carga completa en una escotilla de entrada')

    add('item.grindless.hts_insert', 'Inserto HTS')
    add('tooltip.grindless.hts_insert.0', 'Una bobina HTS LuV anidada en bobinado de URhNq2.')
    add('tooltip.grindless.hts_insert.1', 'La fuente de campo del imán del implantador de iones y de la fábrica de cúbits.')
    add('emi.grindless.info.hts_insert.0', 'Se bobina en la fábrica de imanes de naquadria (circuito 3) con una bobina HTS LuV y cables simples de URhNq2. Las máquinas ZPM que necesitan un campo fuerte y estable la toman como imán.')
    add('emi.grindless.info.cryostat_casing.0', 'La carcasa de la fábrica de imanes de naquadria: una carcasa a prueba de escarcha forrada de placas de oro y de cobre recocido, hecha en el ensamblador. Es toda la carcasa de esa multibloque.')
})
