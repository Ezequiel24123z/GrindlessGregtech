// priority: 6864
// Gregtech Grindless - names of the MAX+ wireless energy hatches (package XP-W2; registered by startup_scripts/grindless/lv/wireless_energy.js
// from the table's maxplusHatchAmps): gtceu:max_wireless_energy_hatch_1024a and _4096a. Coloured like the MAX hatches (bold red).
(function () {
  const SECTION = '\u00a7'
  const COLOUR = 'c' + SECTION + 'l'
  const AMPS = [1024, 4096]

  ClientEvents.lang('en_us', function (event) {
    AMPS.forEach(function (a) {
      event.add('gtceu', 'block.gtceu.max_wireless_energy_hatch_' + a + 'a', SECTION + COLOUR + 'MAX ' + a + 'A Wireless Energy Hatch')
    })
  })
})()
