// Gregtech Grindless - names and lines of the horizon capacitor bank and its cell (startup_scripts/grindless/maxplus/capacitor_bank.js).
ClientEvents.lang('en_us', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.grindless.horizon_capacitor', 'Horizon Capacitor')
    add('tooltip.grindless.horizon_capacitor.0', 'Stores %s EU in a horizon capacitor bank')
    add('tooltip.grindless.horizon_capacitor.1', 'Fits no wireless energy tower; only the bank takes it')
    add('grindless.machine.horizon_capacitor_bank.tooltip.0', 'A network store: its horizon capacitors add their capacity to the wireless network at MAX voltage')
    add('grindless.machine.horizon_capacitor_bank.tooltip.1', 'Counts only when formed in Sgr A* orbit; holds the Hyperstargate\'s dial charge. Storage only: it makes no energy')
    add('grindless.machine.horizon_capacitor_bank.wrong_site', 'Not counted here: a bank adds capacity only in Sgr A* orbit')
    add('grindless.machine.horizon_capacitor_bank.no_capacitors', 'No horizon capacitors in the ring')
    add('grindless.machine.horizon_capacitor_bank.capacitors', 'Capacitors: %s (%s EU)')
    add('grindless.machine.horizon_capacitor_bank.network', 'Network: %s bank(s), %s EU of capacity, %s EU stored')
})

ClientEvents.lang('es_es', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.grindless.horizon_capacitor', 'Horizon Capacitor')
    add('tooltip.grindless.horizon_capacitor.0', 'Stores %s EU in a horizon capacitor bank')
    add('tooltip.grindless.horizon_capacitor.1', 'Fits no wireless energy tower; only the bank takes it')
    add('grindless.machine.horizon_capacitor_bank.tooltip.0', 'A network store: its horizon capacitors add their capacity to the wireless network at MAX voltage')
    add('grindless.machine.horizon_capacitor_bank.tooltip.1', 'Counts only when formed in Sgr A* orbit; holds the Hyperstargate\'s dial charge. Storage only: it makes no energy')
    add('grindless.machine.horizon_capacitor_bank.wrong_site', 'Not counted here: a bank adds capacity only in Sgr A* orbit')
    add('grindless.machine.horizon_capacitor_bank.no_capacitors', 'No horizon capacitors in the ring')
    add('grindless.machine.horizon_capacitor_bank.capacitors', 'Capacitors: %s (%s EU)')
    add('grindless.machine.horizon_capacitor_bank.network', 'Network: %s bank(s), %s EU of capacity, %s EU stored')
})
