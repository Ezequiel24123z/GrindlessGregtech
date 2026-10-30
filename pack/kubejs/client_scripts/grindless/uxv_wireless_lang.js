// priority: 1427
// Gregtech Grindless - names of the UXV wireless tier (package UXV-W; the UXV row of kubejs/data/grindless/tables/wireless_energy.json,
// registered by startup_scripts/grindless/lv/wireless_energy.js) and the EMI line of the nitride magnet works' circuit 7:
//
//   gtceu:uxv_wireless_energy_hatch[_4a|_16a|_64a], gtceu:uxv_wireless_dynamo_hatch[...]   the hatches (GTM's namespace)
//   grindless:uxv_smes_cell                                                                  the UXV cell (a block, like every cell)
//   grindless:uxv_wireless_energy_cover / _wireless_dynamo_cover                             the covers
//   gtceu.recipe.grindless_nitride_magnet_synthesis.uxv_smes_cell                            the EMI line of circuit 7
//
// Same format as uiv_wireless_lang.js, coloured like GTM's UXV energy hatches (yellow). Names go in en_us and es_es.
(function () {
  const SECTION = '\u00a7'
  const T = { id: 'uxv', name: 'UXV', colour: 'e' }
  const AMPS = [2, 4, 16, 64]
  function suffix(a) { return a === 2 ? '' : '_' + a + 'a' }

  ClientEvents.lang('en_us', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    AMPS.forEach(function (a) {
      var amps = a === 2 ? '' : a + 'A '
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_energy_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Energy Hatch')
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Dynamo Hatch')
    })
    add('block.grindless.uxv_smes_cell', 'UXV SMES Cell')
    add('item.grindless.uxv_wireless_energy_cover', SECTION + T.colour + T.name + ' Wireless Energy Cover')
    add('item.grindless.uxv_wireless_dynamo_cover', SECTION + T.colour + T.name + ' Wireless Dynamo Cover')
    add('gtceu.recipe.grindless_nitride_magnet_synthesis.uxv_smes_cell', 'Circuit 7: the wireless network\'s UXV cell, four UIV cells taped with pasta strand, cold-tested in the superfluid helium charge')
  })

  ClientEvents.lang('es_es', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    AMPS.forEach(function (a) {
      var amps = a === 2 ? '' : ' de ' + a + ' A'
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_energy_hatch' + suffix(a), SECTION + T.colour + 'Escotilla de energ\u00eda inal\u00e1mbrica ' + T.name + amps)
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + T.colour + 'Escotilla dinamo inal\u00e1mbrica ' + T.name + amps)
    })
    add('block.grindless.uxv_smes_cell', 'Celda SMES UXV')
    add('item.grindless.uxv_wireless_energy_cover', SECTION + T.colour + 'Cubierta de energ\u00eda inal\u00e1mbrica ' + T.name)
    add('item.grindless.uxv_wireless_dynamo_cover', SECTION + T.colour + 'Cubierta dinamo inal\u00e1mbrica ' + T.name)
    add('gtceu.recipe.grindless_nitride_magnet_synthesis.uxv_smes_cell', 'Circuito 7: la celda UXV de la red inal\u00e1mbrica, cuatro celdas UIV encintadas con hebra de pasta, probadas en fr\u00edo en la carga de helio superfluido')
  })
})()
