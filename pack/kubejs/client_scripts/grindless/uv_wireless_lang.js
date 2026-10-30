// priority: 1667
// Gregtech Grindless - names of the UV wireless tier (package UV-A9; the UV row of kubejs/data/grindless/tables/wireless_energy.json,
// registered by startup_scripts/grindless/lv/wireless_energy.js) and the EMI line of the naquadria magnet works' circuit 4:
//
//   gtceu:uv_wireless_energy_hatch[_4a|_16a|_64a], gtceu:uv_wireless_dynamo_hatch[...]   the hatches (GTM's namespace)
//   grindless:uv_smes_cell                                                                the UV cell (a block, like every cell)
//   grindless:uv_wireless_energy_cover / _wireless_dynamo_cover                           the covers
//   gtceu.recipe.grindless_naquadria_magnets.uv_smes_cell                                 the EMI line of circuit 4
//
// Same format as wireless_energy_lang.js (whose tooltips and messages are shared by every tier), coloured like GTM's UV energy hatches
// (§3, dark aqua). Names go in en_us and es_es.
(function () {
  const SECTION = '\u00a7'
  const T = { id: 'uv', name: 'UV', colour: '3' }
  const AMPS = [2, 4, 16, 64]
  function suffix(a) { return a === 2 ? '' : '_' + a + 'a' }

  ClientEvents.lang('en_us', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    AMPS.forEach(function (a) {
      var amps = a === 2 ? '' : a + 'A '
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_energy_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Energy Hatch')
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Dynamo Hatch')
    })
    add('block.grindless.uv_smes_cell', 'UV SMES Cell')
    add('item.grindless.uv_wireless_energy_cover', SECTION + T.colour + T.name + ' Wireless Energy Cover')
    add('item.grindless.uv_wireless_dynamo_cover', SECTION + T.colour + T.name + ' Wireless Dynamo Cover')
    add('gtceu.recipe.grindless_naquadria_magnets.uv_smes_cell', 'Circuit 4: the wireless network\'s UV cell, EnTED windings cold-tested in the helium charge')
  })

  ClientEvents.lang('es_es', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    AMPS.forEach(function (a) {
      var amps = a === 2 ? '' : ' de ' + a + ' A'
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_energy_hatch' + suffix(a), SECTION + T.colour + 'Escotilla de energía inalámbrica ' + T.name + amps)
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + T.colour + 'Escotilla dinamo inalámbrica ' + T.name + amps)
    })
    add('block.grindless.uv_smes_cell', 'Celda SMES UV')
    add('item.grindless.uv_wireless_energy_cover', SECTION + T.colour + 'Cubierta de energía inalámbrica ' + T.name)
    add('item.grindless.uv_wireless_dynamo_cover', SECTION + T.colour + 'Cubierta dinamo inalámbrica ' + T.name)
    add('gtceu.recipe.grindless_naquadria_magnets.uv_smes_cell', 'Circuito 4: la celda UV de la red inalámbrica, bobinados de EnTED probados en frío en la carga de helio')
  })
})()
