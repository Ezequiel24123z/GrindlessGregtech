// priority: 7056
// Gregtech Grindless - names and lines of the horizon capacitor bank and its cell (startup_scripts/grindless/maxplus/capacitor_bank.js).
ClientEvents.lang('en_us', function (event) {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.grindless.horizon_capacitor', 'Horizon Capacitor')
    add('tooltip.grindless.horizon_capacitor.0', 'Stores %s EU in a horizon capacitor bank')
    add('tooltip.grindless.horizon_capacitor.1', 'Fits no wireless energy tower; only the bank takes it')
    add('gtceu.horizon_capacitor_bank', 'Horizon Capacitor Bank')
    add('block.gtceu.horizon_capacitor_bank', 'Horizon Capacitor Bank')
    add('grindless.machine.horizon_capacitor_bank.tooltip.0', '\u00a77A network store for the Hyperstargate\'s dial charge.')
    add('grindless.machine.horizon_capacitor_bank.tooltip.1', 'Counts only in Sgr A* orbit. Stores, makes no energy.')
    add('grindless.machine.horizon_capacitor_bank.wrong_site', 'Not counted here: a bank adds capacity only in Sgr A* orbit')
    add('grindless.machine.horizon_capacitor_bank.no_capacitors', 'No horizon capacitors in the ring')
    add('grindless.machine.horizon_capacitor_bank.capacitors', 'Capacitors: %s (%s EU)')
    add('grindless.machine.horizon_capacitor_bank.network', 'Network: %s bank(s), %s EU of capacity, %s EU stored')
    add('emi.grindless.info.horizon_capacitor.0', 'A structure block: the cell of the Horizon Capacitor Bank. Each holds 2^48 EU (281,474,976,710,656), and a bank formed in Sgr A* orbit adds the capacity of its 40 slots to the wireless energy network at tier 14: one Hyperstargate dial and 80 ticks to spare.')
    add('emi.grindless.info.horizon_capacitor.1', 'It fits no Wireless Energy Tower, and a bank counts nowhere but Sgr A* orbit, the Hyperstargate\'s site. Made in the hyper assembly array.')
})
