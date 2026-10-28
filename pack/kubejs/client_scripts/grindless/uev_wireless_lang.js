// priority: 4950
// Gregtech Grindless - names of the UEV wireless tier (package UEV-W; the UEV row of kubejs/data/grindless/tables/wireless_energy.json,
// registered by startup_scripts/grindless/lv/wireless_energy.js) and the EMI line of the naquadria magnet works' circuit 6:
//
//   gtceu:uev_wireless_energy_hatch[_4a|_16a|_64a], gtceu:uev_wireless_dynamo_hatch[...]   the hatches (GTM's namespace)
//   grindless:uev_smes_cell                                                                  the UEV cell (a block, like every cell)
//   grindless:uev_wireless_energy_cover / _wireless_dynamo_cover                             the covers
//   gtceu.recipe.grindless_naquadria_magnets.uev_smes_cell                                   the EMI line of circuit 6
//
// Same format as uhv_wireless_lang.js, coloured like GTM's UEV energy hatches (green). Names go in en_us and es_es.
(function () {
  const SECTION = '\u00a7'
  const T = { id: 'uev', name: 'UEV', colour: 'a' }
  const AMPS = [2, 4, 16, 64]
  function suffix(a) { return a === 2 ? '' : '_' + a + 'a' }

  ClientEvents.lang('en_us', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    AMPS.forEach(function (a) {
      var amps = a === 2 ? '' : a + 'A '
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_energy_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Energy Hatch')
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Dynamo Hatch')
    })
    add('block.grindless.uev_smes_cell', 'UEV SMES Cell')
    add('item.grindless.uev_wireless_energy_cover', SECTION + T.colour + T.name + ' Wireless Energy Cover')
    add('item.grindless.uev_wireless_dynamo_cover', SECTION + T.colour + T.name + ' Wireless Dynamo Cover')
    add('gtceu.recipe.grindless_naquadria_magnets.uev_smes_cell', 'Circuit 6: the wireless network\'s UEV cell, four UHV cells rewound with lay superhydride and cold-tested in the helium charge')
  })

  ClientEvents.lang('es_es', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    AMPS.forEach(function (a) {
      var amps = a === 2 ? '' : ' de ' + a + ' A'
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_energy_hatch' + suffix(a), SECTION + T.colour + 'Escotilla de energ\u00eda inal\u00e1mbrica ' + T.name + amps)
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + T.colour + 'Escotilla dinamo inal\u00e1mbrica ' + T.name + amps)
    })
    add('block.grindless.uev_smes_cell', 'Celda SMES UEV')
    add('item.grindless.uev_wireless_energy_cover', SECTION + T.colour + 'Cubierta de energ\u00eda inal\u00e1mbrica ' + T.name)
    add('item.grindless.uev_wireless_dynamo_cover', SECTION + T.colour + 'Cubierta dinamo inal\u00e1mbrica ' + T.name)
    add('gtceu.recipe.grindless_naquadria_magnets.uev_smes_cell', 'Circuito 6: la celda UEV de la red inal\u00e1mbrica, cuatro celdas UHV rebobinadas con superhidruro de lantano e itrio y probadas en fr\u00edo en la carga de helio')
  })
})()
