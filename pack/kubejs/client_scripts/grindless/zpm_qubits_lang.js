// priority: 600
// Gregtech Grindless - names and tooltips of ZPM's solid-state qubit chain (startup_scripts/grindless/zpm/qubits.js):
//   block.gtceu.<diamond_lattice_fab / ion_implanter / qubit_fab>, gtceu.<diamond_cvd / ion_implantation / qubit_fabrication>,
//   grindless.machine.<machine>.tooltip.0-2, item.grindless.<item> and tooltip.grindless.<item>.0-1 for the five new items.
(function () {
    // [machine, recipe type, name, tooltips]
    var EN_MACHINES = [
        ['diamond_lattice_fab', 'diamond_cvd', 'Diamond Lattice Fab', 'Diamond Deposition', [
            'Microwave plasma CVD on a diamond seed (not consumed). Programmed circuit 1: 1,000 mB methane + 10,000 mB hydrogen -> 1 CVD diamond plate + 9,500 mB hydrogen. Circuit 2: the same with 10 mB nitrogen -> a nitrogen-doped plate.',
            'The hydrogen loops back into the next run; the 5 % lost is the make-up. 30,720 EU/t for 60 s. The plates feed the ion implanter and the qubit fab.',
            'Needs, in the floor: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 output buses, 1 to 3 input hatches, 1 or 2 output hatches, and 12 or more cleanroom casings among them.']],
        ['ion_implanter', 'ion_implantation', 'Ion Implanter', 'Ion Implantation', [
            'A 5 x 5 x 15 beamline hall: ion source, analysing magnet, target chamber. Circuit 1: 1 nitrogen-doped plate + 1 mB nitrogen -> 4 NV diamond chips.',
            'Circuit 2: 1 silicon-28 wafer + 1 phosphorus dust -> 1 donor qubit wafer. Silicon-28 is spin-free: the hot cell\'s circuit 5 mode makes the dust. 30,720 EU/t. No byproducts.',
            'Needs, in the floor: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 output buses, 1 to 3 input hatches, 1 or 2 output hatches, and 15 or more cleanroom casings among them.']],
        ['qubit_fab', 'qubit_fabrication', 'Qubit Fab', 'Qubit Fabrication', [
            'A millikelvin cryostat: mixing chamber, still and 1 K pot. Circuit 1: 4 donor qubit wafers -> 1 qubit array. Circuit 2: 16 NV diamond chips -> 1 qubit array, slower.',
            'The 4,000 mB helium charge is never used up; only 10 mB of Saturn\'s helium per run is. 122,880 EU/t. The arrays replace circuits in the HPCA components\' alternative recipes.',
            'Needs, in the floor: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 output buses, 1 to 3 input hatches, 1 or 2 output hatches, and 20 or more cryostat casings among them.']]
    ]
    var ES_MACHINES = [
        ['diamond_lattice_fab', 'diamond_cvd', 'Fábrica de redes de diamante', 'Deposición de diamante', [
            'CVD por plasma de microondas sobre una semilla de diamante (no se gasta). Circuito programado 1: 1 000 mB de metano + 10 000 mB de hidrógeno -> 1 placa de diamante CVD + 9 500 mB de hidrógeno. Circuito 2: igual con 10 mB de nitrógeno -> una placa dopada con nitrógeno.',
            'El hidrógeno vuelve a la siguiente tanda; el 5 % perdido es la reposición. 30 720 EU/t durante 60 s. Las placas alimentan el implantador de iones y la fábrica de qubits.',
            'Necesita, en el suelo: 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, 1 o 2 buses de salida, de 1 a 3 escotillas de entrada, 1 o 2 de salida, y 12 o más carcasas de sala blanca entre ellos.']],
        ['ion_implanter', 'ion_implantation', 'Implantador de iones', 'Implantación de iones', [
            'Una sala de línea de haz de 5 x 5 x 15: fuente de iones, imán analizador, cámara del blanco. Circuito 1: 1 placa dopada con nitrógeno + 1 mB de nitrógeno -> 4 chips de diamante NV.',
            'Circuito 2: 1 oblea de silicio-28 + 1 de polvo de fósforo -> 1 oblea de qubits donantes. El silicio-28 no tiene espín: el modo de circuito 5 de la celda caliente hace el polvo. 30 720 EU/t. Sin subproductos.',
            'Necesita, en el suelo: 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, 1 o 2 buses de salida, de 1 a 3 escotillas de entrada, 1 o 2 de salida, y 15 o más carcasas de sala blanca entre ellos.']],
        ['qubit_fab', 'qubit_fabrication', 'Fábrica de qubits', 'Fabricación de qubits', [
            'Un criostato de milikelvin: cámara de mezcla, destilador y pote de 1 K. Circuito 1: 4 obleas de qubits donantes -> 1 matriz de qubits. Circuito 2: 16 chips de diamante NV -> 1 matriz de qubits, más lento.',
            'La carga de 4 000 mB de helio nunca se gasta; solo 10 mB del helio de Saturno por tanda. 122 880 EU/t. Las matrices sustituyen a los circuitos en las recetas alternativas de los componentes del HPCA.',
            'Necesita, en el suelo: 1 o 2 escotillas de energía (ZPM), 1 o 2 buses de entrada, 1 o 2 buses de salida, de 1 a 3 escotillas de entrada, 1 o 2 de salida, y 20 o más carcasas de criostato entre ellos.']]
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
            for (var i = 0; i < 3; i++) add('grindless.machine.' + m[0] + '.tooltip.' + i, m[4][i])
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
