// Gregtech Grindless - names of the UHV wireless tier (package UHV-A9; the UHV row of kubejs/data/grindless/tables/wireless_energy.json,
// registered by startup_scripts/grindless/lv/wireless_energy.js) and the EMI line of the naquadria magnet works' circuit 5:
//
//   gtceu:uhv_wireless_energy_hatch[_4a|_16a|_64a], gtceu:uhv_wireless_dynamo_hatch[...]   the hatches (GTM's namespace)
//   grindless:uhv_smes_cell                                                                  the UHV cell (a block, like every cell)
//   grindless:uhv_wireless_energy_cover / _wireless_dynamo_cover                             the covers
//   gtceu.recipe.grindless_naquadria_magnets.uhv_smes_cell                                   the EMI line of circuit 5
//
// Same format as uv_wireless_lang.js, coloured like GTM's UHV energy hatches (§4, dark red). Names go in en_us and es_es.
(function () {
  const SECTION = '\u00a7'
  const T = { id: 'uhv', name: 'UHV', colour: '4' }
  const AMPS = [2, 4, 16, 64]
  function suffix(a) { return a === 2 ? '' : '_' + a + 'a' }

  ClientEvents.lang('en_us', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    AMPS.forEach(function (a) {
      var amps = a === 2 ? '' : a + 'A '
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_energy_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Energy Hatch')
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Dynamo Hatch')
    })
    add('block.grindless.uhv_smes_cell', 'UHV SMES Cell')
    add('item.grindless.uhv_wireless_energy_cover', SECTION + T.colour + T.name + ' Wireless Energy Cover')
    add('item.grindless.uhv_wireless_dynamo_cover', SECTION + T.colour + T.name + ' Wireless Dynamo Cover')
    add('gtceu.recipe.grindless_naquadria_magnets.uhv_smes_cell', 'Circuit 5: the wireless network\'s UHV cell, four UV cells rewound with RTAN and cold-tested in the helium charge')
  })

  ClientEvents.lang('es_es', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    AMPS.forEach(function (a) {
      var amps = a === 2 ? '' : ' de ' + a + ' A'
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_energy_hatch' + suffix(a), SECTION + T.colour + 'Escotilla de energía inalámbrica ' + T.name + amps)
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + T.colour + 'Escotilla dinamo inalámbrica ' + T.name + amps)
    })
    add('block.grindless.uhv_smes_cell', 'Celda SMES UHV')
    add('item.grindless.uhv_wireless_energy_cover', SECTION + T.colour + 'Cubierta de energía inalámbrica ' + T.name)
    add('item.grindless.uhv_wireless_dynamo_cover', SECTION + T.colour + 'Cubierta dinamo inalámbrica ' + T.name)
    add('gtceu.recipe.grindless_naquadria_magnets.uhv_smes_cell', 'Circuito 5: la celda UHV de la red inalámbrica, cuatro celdas UV rebobinadas con RTAN y probadas en frío en la carga de helio')
  })
})()
