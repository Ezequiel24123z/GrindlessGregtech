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
    var ES_MACHINES = [
        ['diamond_lattice_fab', 'diamond_cvd', 'Fábrica de redes de diamante', 'Deposición de diamante', [
            '§7Hace crecer placas de diamante CVD con plasma de microondas.'
            ]],
        ['ion_implanter', 'ion_implantation', 'Implantador de iones', 'Implantación de iones', [
            '§7Implanta nitrógeno en diamante para chips NV.'
            ]],
        ['qubit_fab', 'qubit_fabrication', 'Fábrica de qubits', 'Fabricación de qubits', [
            '§7Un criostato de milikelvin que fabrica matrices de cúbits.'
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
    var ES_ITEMS = [
        ['nitrogen_doped_cvd_plate', 'Placa CVD dopada con nitrógeno', 'Una placa de diamante CVD crecida con una traza de nitrógeno.', 'La hace la fábrica de redes de diamante (circuito 2). El implantador de iones la convierte en chips NV.'],
        ['nv_diamond_chip', 'Chip de diamante NV', 'Un chip de diamante con centros nitrógeno-vacante, cada uno un qubit.', 'Lo hace el implantador de iones (circuito 1). 16 forman una matriz de qubits.'],
        ['silicon_28_boule', 'Lingote de silicio-28', 'Un monocristal de silicio-28, sin espín.', 'Se funde con polvo de silicio-28 en el alto horno. Córtalo en obleas.'],
        ['silicon_28_wafer', 'Oblea de silicio-28', 'Una oblea de silicio-28, sin espín.', 'Se corta de un lingote. El implantador de iones la dopa con fósforo.'],
        ['donor_qubit_wafer', 'Oblea de qubits donantes', 'Silicio-28 con donantes de fósforo implantados, cada uno un qubit.', 'La hace el implantador de iones (circuito 2). 4 forman una matriz de qubits.']
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
    ClientEvents.lang('es_es', function (event) { addAll(event, ES_MACHINES, ES_ITEMS) })
})()
