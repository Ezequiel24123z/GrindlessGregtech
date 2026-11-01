// priority: 2932
// Gregtech Grindless - names of the UIV wireless tier (package UIV-W; the UIV row of kubejs/data/grindless/tables/wireless_energy.json,
// registered by startup_scripts/grindless/lv/wireless_energy.js) and the EMI line of the nitride magnet works' circuit 4:
//
//   gtceu:uiv_wireless_energy_hatch[_4a|_16a|_64a], gtceu:uiv_wireless_dynamo_hatch[...]   the hatches (GTM's namespace)
//   grindless:uiv_smes_cell                                                                  the UIV cell (a block, like every cell)
//   grindless:uiv_wireless_energy_cover / _wireless_dynamo_cover                             the covers
//   gtceu.recipe.grindless_nitride_magnet_synthesis.uiv_smes_cell                            the EMI line of circuit 4
//
// Same format as uev_wireless_lang.js, coloured like GTM's UIV energy hatches (dark green). Names go in en_us.
(function () {
  const SECTION = '\u00a7'
  const T = { id: 'uiv', name: 'UIV', colour: '2' }
  const AMPS = [2, 4, 16, 64]
  function suffix(a) { return a === 2 ? '' : '_' + a + 'a' }

  ClientEvents.lang('en_us', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    AMPS.forEach(function (a) {
      var amps = a === 2 ? '' : a + 'A '
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_energy_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Energy Hatch')
      event.add('gtceu', 'block.gtceu.' + T.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + T.colour + T.name + ' ' + amps + 'Wireless Dynamo Hatch')
    })
    add('block.grindless.uiv_smes_cell', 'UIV SMES Cell')
    add('item.grindless.uiv_wireless_energy_cover', SECTION + T.colour + T.name + ' Wireless Energy Cover')
    add('item.grindless.uiv_wireless_dynamo_cover', SECTION + T.colour + T.name + ' Wireless Dynamo Cover')
    add('gtceu.recipe.grindless_nitride_magnet_synthesis.uiv_smes_cell', 'Circuit 4: the wireless network\'s UIV cell, four UEV cells rewound with metallic hydrogen and cold-tested in the helium charge')
  })

})()
