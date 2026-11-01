// priority: 6847
// Gregtech Grindless - names of the MAX+ wireless energy hatches (package XP-W2; registered by startup_scripts/grindless/lv/wireless_energy.js
// from the table's maxplusHatchAmps): gtceu:max_wireless_energy_hatch_1024a and _4096a. Coloured like the MAX hatches (bold red).
// Names go in en_us and es_es (the es_es copy is the English text until the EN-1 cleanup).
(function () {
  const SECTION = '\u00a7'
  const COLOUR = 'c' + SECTION + 'l'
  const AMPS = [1024, 4096]

  ;['en_us', 'es_es'].forEach(function (lang) {
    ClientEvents.lang(lang, function (event) {
      AMPS.forEach(function (a) {
        event.add('gtceu', 'block.gtceu.max_wireless_energy_hatch_' + a + 'a', SECTION + COLOUR + 'MAX ' + a + 'A Wireless Energy Hatch')
      })
    })
  })
})()
