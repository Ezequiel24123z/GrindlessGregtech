// priority: 600
// Gregtech Grindless - names and tooltips of ZPM's solid-state qubit chain (startup_scripts/grindless/zpm/qubits.js):
//   block.gtceu.<diamond_lattice_fab / ion_implanter / qubit_fab>, gtceu.<diamond_cvd / ion_implantation / qubit_fabrication>,
//   grindless.machine.<machine>.tooltip.0-2, item.grindless.<item> and tooltip.grindless.<item>.0-1 for the five new items.
(function () {
    // [machine, recipe type, name, tooltips]
    var EN_MACHINES = [
        ['diamond_lattice_fab', 'diamond_cvd', 'Diamond Lattice Fab', 'Diamond Deposition', [
            '§7Grows CVD diamond plates by microwave plasma.'
            ]],
        ['ion_implanter', 'ion_implantation', 'Ion Implanter', 'Ion Implantation', [
            '§7Implants nitrogen into diamond for NV chips.'
            ]],
        ['qubit_fab', 'qubit_fabrication', 'Qubit Fab', 'Qubit Fabrication', [
            '§7A millikelvin cryostat that builds qubit arrays.'
            ]]
    ]
    // [item, name, tooltip 0, tooltip 1]
    var EN_ITEMS = [
        ['nitrogen_doped_cvd_plate', 'Nitrogen-Doped CVD Plate', 'A CVD diamond plate grown with a trace of nitrogen.', 'Made by the diamond lattice fab (circuit 2). The ion implanter turns it into NV chips.'],
        ['nv_diamond_chip', 'NV Diamond Chip', 'A diamond chip with nitrogen-vacancy centres, each one a qubit.', 'Made by the ion implanter (circuit 1). 16 of them make a qubit array.'],
        ['silicon_28_boule', 'Silicon-28 Boule', 'A single crystal of spin-free silicon-28.', 'Fired from silicon-28 dust in the blast furnace. Cut it into wafers.'],
        ['silicon_28_wafer', 'Silicon-28 Wafer', 'A wafer of spin-free silicon-28.', 'Cut from a boule. The ion implanter dopes it with phosphorus.'],
        ['donor_qubit_wafer', 'Donor Qubit Wafer', 'Silicon-28 with implanted phosphorus donors, each one a qubit.', 'Made by the ion implanter (circuit 2). 4 of them make a qubit array.']
    ]

    function addAll(event, machines, items) {
        var add = function (key, value) { event.add('grindless', key, value) }
        machines.forEach(function (m) {
            add('block.gtceu.' + m[0], m[2])
            add('gtceu.' + m[1], m[3])
            for (var i = 0; i < 1; i++) add('grindless.machine.' + m[0] + '.tooltip.' + i, m[4][i])
        })
        items.forEach(function (it) {
            add('item.grindless.' + it[0], it[1])
            add('tooltip.grindless.' + it[0] + '.0', it[2])
            add('tooltip.grindless.' + it[0] + '.1', it[3])
        })
    }

    ClientEvents.lang('en_us', function (event) { addAll(event, EN_MACHINES, EN_ITEMS) })
})()
