// Gregtech Grindless - names, tooltips and messages of the wireless energy network (startup_scripts/grindless/lv/wireless_energy.js and
// server_scripts/grindless/lv/wireless_energy.js):
//
//   gtceu:wireless_energy_tower, grindless.machine.wireless_energy_tower.*      the tower: name, tooltips, controller lines
//   grindless:<tier>_capacitor_cell, tooltip.grindless.capacitor_cell.*         the cells
//   gtceu:<tier>_wireless_energy_hatch[_4a|_16a|_64a], gtceu:<tier>_wireless_dynamo_hatch[...], grindless.machine.wireless*.tooltip.*
//   grindless:<tier>_wireless_energy_cover / _wireless_dynamo_cover, tooltip.grindless.wireless_*cover*   the covers
//   message.grindless.wireless.*                                                the readout and the covers' placing (action bar)
//
// The hatches' names are GTM's (namespace gtceu), the whole name coloured like GTM's energy hatches (§7 LV, §b MV, §6 HV, §5 EV, §9 IV).
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
  const SECTION = '\u00a7'
  const TIERS = [
    { id: 'lv', name: 'LV', colour: '7' },
    { id: 'mv', name: 'MV', colour: 'b' },
    { id: 'hv', name: 'HV', colour: '6' },
    { id: 'ev', name: 'EV', colour: '5' },
    { id: 'iv', name: 'IV', colour: '9' }
  ]
  const AMPS = [2, 4, 16, 64]
  function suffix(a) { return a === 2 ? '' : '_' + a + 'a' }

  ClientEvents.lang('en_us', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    TIERS.forEach(function (t) {
      AMPS.forEach(function (a) {
        var amps = a === 2 ? '' : a + 'A '
        event.add('gtceu', 'block.gtceu.' + t.id + '_wireless_energy_hatch' + suffix(a), SECTION + t.colour + t.name + ' ' + amps + 'Wireless Energy Hatch')
        event.add('gtceu', 'block.gtceu.' + t.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + t.colour + t.name + ' ' + amps + 'Wireless Dynamo Hatch')
      })
      add('block.grindless.' + t.id + '_capacitor_cell', t.name + ' Capacitor Cell')
      add('item.grindless.' + t.id + '_wireless_energy_cover', SECTION + t.colour + t.name + ' Wireless Energy Cover')
      add('item.grindless.' + t.id + '_wireless_dynamo_cover', SECTION + t.colour + t.name + ' Wireless Dynamo Cover')
    })
    event.add('gtceu', 'block.gtceu.wireless_energy_tower', 'Wireless Energy Tower')
    add('grindless.machine.wireless_energy_tower.tooltip.0', 'The store of the wireless network: one network for every world. Each formed tower adds what its capacitor cells hold, and towers add up.')
    add('grindless.machine.wireless_energy_tower.tooltip.1', 'Its 32 cell slots take capacitor cells of any tier, or its steel casing for an empty slot. The network sends EU out at the tier of the weakest cell of every formed tower: replace them all to raise it.')
    add('grindless.machine.wireless_energy_tower.tooltip.2', 'Wireless dynamo hatches and covers put EU in (5% is lost on the way in); wireless energy hatches and covers at or below the network\'s tier take it out. With no tower formed, nothing moves.')
    add('grindless.machine.wireless_energy_tower.tooltip.3', 'Swapping a cell unforms the tower; the stored EU stays in the network. No hatches: everything comes and goes wirelessly.')
    add('grindless.machine.wireless_energy_tower.cells', 'Capacitor cells: %s, the weakest %s: %s EU in this tower')
    add('grindless.machine.wireless_energy_tower.no_cells', 'No capacitor cells: this tower stores nothing')
    add('grindless.machine.wireless_energy_tower.network', 'Network: %s / %s EU, sends at %s (%s towers)')
    add('grindless.machine.wireless_energy_tower.flow', 'Last second: in %s EU/t, out %s EU/t')
    add('tooltip.grindless.capacitor_cell.0', 'Holds %s EU in a Wireless Energy Tower')
    add('tooltip.grindless.capacitor_cell.1', 'A tower sends EU out at the tier of its weakest cell')
    add('grindless.machine.wireless_energy_hatch.tooltip.0', 'Energy input for multiblocks, filled from the wireless network when the network\'s tier is at least the hatch\'s.')
    add('grindless.machine.wireless_dynamo_hatch.tooltip.0', 'Energy output for generator multiblocks: everything it gets goes into the wireless network (5% loss).')
    add('grindless.machine.wireless.tooltip.network', 'One network for every world, stored in Wireless Energy Towers. Its chunk must be loaded.')
    add('grindless.machine.wireless.tooltip.readout', 'Shift + right-click with an empty hand: the network\'s EU and flow')
    add('tooltip.grindless.wireless_energy_cover.0', 'Feeds the single-block machine it is on from the wireless network, at or below the network\'s tier.')
    add('tooltip.grindless.wireless_dynamo_cover.0', 'Sends a generator\'s or battery buffer\'s stored EU into the wireless network (5% loss).')
    add('tooltip.grindless.wireless_cover.rate', '%s: up to %s EU/t (%s A)')
    add('tooltip.grindless.wireless_cover.place', 'Right-click a machine\'s side to put it on; a crowbar takes it off.')
    add('message.grindless.wireless.readout', 'Wireless network (%s): %s / %s EU, in %s EU/t, out %s EU/t')
    add('message.grindless.wireless.no_tower', 'Wireless network: no Wireless Energy Tower is formed, nothing moves')
    add('message.grindless.wireless.above_tier', 'This %s block gets nothing: the network is %s (its weakest capacitor cell)')
    add('message.grindless.wireless.cover_no_machine', 'Wireless covers go on GregTech machines')
    add('message.grindless.wireless.cover_no_energy', 'This machine has no energy buffer: use a wireless hatch on a multiblock')
    add('message.grindless.wireless.cover_no_input', 'This machine takes no EU')
    add('message.grindless.wireless.cover_no_output', 'This machine puts out no EU')
    add('message.grindless.wireless.cover_too_strong', 'A %s cover is too strong for a %s machine')
    add('message.grindless.wireless.cover_too_weak', 'A %s cover is too weak for a %s machine')
    add('message.grindless.wireless.cover_side_taken', 'That side already has a cover')
    add('message.grindless.wireless.cover_cannot', 'The cover does not fit on that side')
    add('message.grindless.wireless.cover_placed', '%s wireless cover on')
  })

  ClientEvents.lang('es_es', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }
    TIERS.forEach(function (t) {
      AMPS.forEach(function (a) {
        var amps = a === 2 ? '' : ' de ' + a + ' A'
        event.add('gtceu', 'block.gtceu.' + t.id + '_wireless_energy_hatch' + suffix(a), SECTION + t.colour + 'Escotilla de energía inalámbrica ' + t.name + amps)
        event.add('gtceu', 'block.gtceu.' + t.id + '_wireless_dynamo_hatch' + suffix(a), SECTION + t.colour + 'Escotilla dinamo inalámbrica ' + t.name + amps)
      })
      add('block.grindless.' + t.id + '_capacitor_cell', 'Celda de condensadores ' + t.name)
      add('item.grindless.' + t.id + '_wireless_energy_cover', SECTION + t.colour + 'Cubierta de energía inalámbrica ' + t.name)
      add('item.grindless.' + t.id + '_wireless_dynamo_cover', SECTION + t.colour + 'Cubierta dinamo inalámbrica ' + t.name)
    })
    event.add('gtceu', 'block.gtceu.wireless_energy_tower', 'Torre de energía inalámbrica')
    add('grindless.machine.wireless_energy_tower.tooltip.0', 'El almacén de la red inalámbrica: una sola red para todos los mundos. Cada torre formada suma lo que guardan sus celdas de condensadores, y las torres se suman.')
    add('grindless.machine.wireless_energy_tower.tooltip.1', 'Sus 32 huecos de celda aceptan celdas de condensadores de cualquier nivel, o su carcasa de acero para un hueco vacío. La red envía EU al nivel de la celda más débil de todas las torres formadas: cámbialas todas para subirlo.')
    add('grindless.machine.wireless_energy_tower.tooltip.2', 'Las escotillas y cubiertas dinamo inalámbricas meten EU (se pierde un 5 % al entrar); las escotillas y cubiertas de energía inalámbricas de su nivel o menos la sacan. Sin ninguna torre formada no se mueve nada.')
    add('grindless.machine.wireless_energy_tower.tooltip.3', 'Cambiar una celda deshace la torre; la EU guardada sigue en la red. Sin escotillas: todo entra y sale sin cables.')
    add('grindless.machine.wireless_energy_tower.cells', 'Celdas de condensadores: %s, la más débil %s: %s EU en esta torre')
    add('grindless.machine.wireless_energy_tower.no_cells', 'Sin celdas de condensadores: esta torre no guarda nada')
    add('grindless.machine.wireless_energy_tower.network', 'Red: %s / %s EU, envía a %s (%s torres)')
    add('grindless.machine.wireless_energy_tower.flow', 'Último segundo: entran %s EU/t, salen %s EU/t')
    add('tooltip.grindless.capacitor_cell.0', 'Guarda %s EU en una torre de energía inalámbrica')
    add('tooltip.grindless.capacitor_cell.1', 'Una torre envía EU al nivel de su celda más débil')
    add('grindless.machine.wireless_energy_hatch.tooltip.0', 'Entrada de energía para multibloques, que se llena desde la red inalámbrica cuando el nivel de la red es al menos el de la escotilla.')
    add('grindless.machine.wireless_dynamo_hatch.tooltip.0', 'Salida de energía para multibloques generadores: todo lo que recibe va a la red inalámbrica (se pierde un 5 %).')
    add('grindless.machine.wireless.tooltip.network', 'Una sola red para todos los mundos, guardada en torres de energía inalámbrica. Su chunk tiene que estar cargado.')
    add('grindless.machine.wireless.tooltip.readout', 'Mayús + clic derecho con la mano vacía: la EU y el flujo de la red')
    add('tooltip.grindless.wireless_energy_cover.0', 'Alimenta desde la red inalámbrica la máquina de un bloque en la que está, si el nivel de la red llega al suyo.')
    add('tooltip.grindless.wireless_dynamo_cover.0', 'Envía a la red inalámbrica la EU guardada de un generador o de un búfer de baterías (se pierde un 5 %).')
    add('tooltip.grindless.wireless_cover.rate', '%s: hasta %s EU/t (%s A)')
    add('tooltip.grindless.wireless_cover.place', 'Clic derecho en un lado de una máquina para ponerla; una palanca la quita.')
    add('message.grindless.wireless.readout', 'Red inalámbrica (%s): %s / %s EU, entran %s EU/t, salen %s EU/t')
    add('message.grindless.wireless.no_tower', 'Red inalámbrica: no hay ninguna torre de energía inalámbrica formada, no se mueve nada')
    add('message.grindless.wireless.above_tier', 'Este bloque %s no recibe nada: la red es %s (su celda de condensadores más débil)')
    add('message.grindless.wireless.cover_no_machine', 'Las cubiertas inalámbricas van en máquinas de GregTech')
    add('message.grindless.wireless.cover_no_energy', 'Esta máquina no guarda energía: usa una escotilla inalámbrica en un multibloque')
    add('message.grindless.wireless.cover_no_input', 'Esta máquina no toma EU')
    add('message.grindless.wireless.cover_no_output', 'Esta máquina no da EU')
    add('message.grindless.wireless.cover_too_strong', 'Una cubierta %s es demasiado fuerte para una máquina %s')
    add('message.grindless.wireless.cover_too_weak', 'Una cubierta %s es demasiado débil para una máquina %s')
    add('message.grindless.wireless.cover_side_taken', 'Ese lado ya tiene una cubierta')
    add('message.grindless.wireless.cover_cannot', 'La cubierta no cabe en ese lado')
    add('message.grindless.wireless.cover_placed', 'Cubierta inalámbrica %s puesta')
  })
})()
