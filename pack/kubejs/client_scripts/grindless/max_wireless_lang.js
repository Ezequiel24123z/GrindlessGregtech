// priority: 6550
// Gregtech Grindless - names of the MAX wireless tier (package MAX-W; the MAX row of kubejs/data/grindless/tables/wireless_energy.json,
// registered by startup_scripts/grindless/lv/wireless_energy.js):
//
//   gtceu:max_wireless_energy_hatch[_4a|_16a|_64a], gtceu:max_wireless_dynamo_hatch[...]   the hatches (GTM's namespace)
//   grindless:max_wireless_energy_cover / _wireless_dynamo_cover                           the covers
//
// The cell's name (grindless:max_smes_cell) is in max_foundation_lang.js. Same format as opv_wireless_lang.js, coloured like GTM's MAX
// energy hatches (GTValues.VNF: bold red). Names go in en_us and es_es.
(function () {
  const SECTION = '\u00a7'
  const T = { id: 'max', name: 'MAX', colour: 'c' + SECTION + 'l' }
  const AMPS = [2, 4, 16, 64]
  function suffix(a) { return a === 2 ? '' : '_' + a + 'a' }

  ClientEvents.lang('en_us', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    AMPS.forEach(function (a) {
      var amps = a === 2 ? '' : a + 'A '
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_energy_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Energy Hatch')
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Dynamo Hatch')
    })
    add('block.grindless.max_smes_cell', T.name + ' SMES Cell')
    add('item.grindless.max_wireless_energy_cover', SECTION + T.colour + T.name + ' Wireless Energy Cover')
    add('item.grindless.max_wireless_dynamo_cover', SECTION + T.colour + T.name + ' Wireless Dynamo Cover')
    add('gtceu.recipe.grindless_coated_conductor.smes_buffered_tape', 'Step 1: ITBTC conductor and strand tape bonded in epoxy into a buffered tape; circuit 7.')
    add('gtceu.recipe.grindless_pulsed_laser_deposition.thick_rebco_tape', 'Circuit 4: a thick GdBCO layer laser-deposited on the buffered tape in oxygen.')
    add('gtceu.recipe.grindless_magnet_winding.smes_toroid_winding', 'Circuit 13: thick REBCO tape wound into a toroid winding, cold-tested in the helium charge.')
    add('gtceu.recipe.grindless_naquadria_magnets.braced_smes_toroid', 'Circuit 11: the winding braced with strand tape and tungsten steel rods.')
  })

  ClientEvents.lang('es_es', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    AMPS.forEach(function (a) {
      var amps = a === 2 ? '' : ' de ' + a + ' A'
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_energy_hatch' + suffix(a), SECTION + T.colour + 'Escotilla de energ\u00eda inal\u00e1mbrica ' + T.name + amps)
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + T.colour + 'Escotilla dinamo inal\u00e1mbrica ' + T.name + amps)
    })
    add('block.grindless.max_smes_cell', 'Celda SMES ' + T.name)
    add('item.grindless.max_wireless_energy_cover', SECTION + T.colour + 'Cubierta de energ\u00eda inal\u00e1mbrica ' + T.name)
    add('item.grindless.max_wireless_dynamo_cover', SECTION + T.colour + 'Cubierta dinamo inal\u00e1mbrica ' + T.name)
    add('gtceu.recipe.grindless_coated_conductor.smes_buffered_tape', 'Paso 1: conductor ITBTC y cinta de hebra unidos con epoxi en una cinta con b\u00fafer; circuito 7.')
    add('gtceu.recipe.grindless_pulsed_laser_deposition.thick_rebco_tape', 'Circuito 4: una capa gruesa de GdBCO depositada por l\u00e1ser sobre la cinta con b\u00fafer, en ox\u00edgeno.')
    add('gtceu.recipe.grindless_magnet_winding.smes_toroid_winding', 'Circuito 13: cinta de REBCO gruesa bobinada en un devanado toroidal, probada en fr\u00edo con la carga de helio.')
    add('gtceu.recipe.grindless_naquadria_magnets.braced_smes_toroid', 'Circuito 11: el devanado reforzado con cinta de hebra y varillas de acero de wolframio.')
  })
})()
