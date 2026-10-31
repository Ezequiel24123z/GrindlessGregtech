// priority: 5682
// Gregtech Grindless - names of the OpV wireless tier (package OpV-W; the OpV row of kubejs/data/grindless/tables/wireless_energy.json,
// registered by startup_scripts/grindless/lv/wireless_energy.js):
//
//   gtceu:opv_wireless_energy_hatch[_4a|_16a|_64a], gtceu:opv_wireless_dynamo_hatch[...]   the hatches (GTM's namespace)
//   grindless:opv_smes_cell                                                                  the OpV cell (a block, like every cell)
//   grindless:opv_wireless_energy_cover / _wireless_dynamo_cover                             the covers
//
// Same format as uxv_wireless_lang.js, coloured like GTM's OpV energy hatches (GTValues.VNF: bold blue). Names go in en_us and es_es.
// The cell's assembler recipe (server_scripts/grindless/opv/wireless.js) needs no EMI line.
(function () {
  const SECTION = '\u00a7'
  const T = { id: 'opv', name: 'OpV', colour: '9' + SECTION + 'l' }
  const AMPS = [2, 4, 16, 64]
  function suffix(a) { return a === 2 ? '' : '_' + a + 'a' }

  ClientEvents.lang('en_us', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    AMPS.forEach(function (a) {
      var amps = a === 2 ? '' : a + 'A '
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_energy_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Energy Hatch')
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Dynamo Hatch')
    })
    add('block.grindless.opv_smes_cell', 'OpV SMES Cell')
    add('item.grindless.opv_wireless_energy_cover', SECTION + T.colour + T.name + ' Wireless Energy Cover')
    add('item.grindless.opv_wireless_dynamo_cover', SECTION + T.colour + T.name + ' Wireless Dynamo Cover')
  })

  ClientEvents.lang('es_es', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    AMPS.forEach(function (a) {
      var amps = a === 2 ? '' : ' de ' + a + ' A'
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_energy_hatch' + suffix(a), SECTION + T.colour + 'Escotilla de energ\u00eda inal\u00e1mbrica ' + T.name + amps)
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + T.colour + 'Escotilla dinamo inal\u00e1mbrica ' + T.name + amps)
    })
    add('block.grindless.opv_smes_cell', 'Celda SMES OpV')
    add('item.grindless.opv_wireless_energy_cover', SECTION + T.colour + 'Cubierta de energ\u00eda inal\u00e1mbrica ' + T.name)
    add('item.grindless.opv_wireless_dynamo_cover', SECTION + T.colour + 'Cubierta dinamo inal\u00e1mbrica ' + T.name)
  })
})()
