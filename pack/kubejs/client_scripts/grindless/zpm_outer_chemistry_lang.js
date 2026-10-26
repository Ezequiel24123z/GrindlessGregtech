// Gregtech Grindless - names and tooltips of ZPM's outer chemistry (startup_scripts/grindless/zpm/outer_chemistry.js):
//   block.gtceu.<methane_pyrolyser / vent_bioreactor / aerogel_works>, gtceu.<methane_pyrolysis / chemosynthesis / supercritical_drying>,
//   grindless.machine.<machine>.tooltip.0-2. The items are ZPM-F1's (zpm_foundation_lang.js).
(function () {
    // [machine, recipe type, name, recipe type name, tooltips]
    var EN_MACHINES = [
        ['methane_pyrolyser', 'methane_pyrolysis', 'Methane Pyrolyser', 'Methane Pyrolysis', [
            'A bubble column of molten tin and nickel (not consumed). Programmed circuit 1: 1,000 mB methane -> 2,000 mB hydrogen + 2 graphene dust. Circuit 2: the same -> 1 carbon nanotube yarn, slower.',
            'No CO2: the carbon comes out solid. The hydrogen goes back to the network. 122,880 EU/t. The nanotube yarn wraps the aerogel works\' tanks.',
            'Needs, in the floor: 1 or 2 energy hatches (ZPM), 1 or 2 input buses, 1 or 2 output buses, 1 to 3 input hatches, 1 or 2 output hatches, and 4 or more heat-proof casings among them.']],
        ['vent_bioreactor', 'chemosynthesis', 'Vent Bioreactor', 'Chemosynthesis', [
            'A 90 \u00B0C vessel that feeds Europa\'s bacteria a vent chemistry. Circuit 1: 250 mB bacteria + 1,000 mB Enceladus brine + 500 mB hydrogen + 250 mB CO2 -> 4 archaeal cultures + 250 mB methane.',
            'Circuit 2: 1 tholin + 1,000 mB brine + 1,000 mB mutagen, with a culture that is not consumed -> 4,000 mB raw growth medium + 500 mB salt water. No meat, no sugar, no sterile cleanroom.',
            'Needs, in the floor: 1 or 2 energy hatches (LuV or better), 1 or 2 input buses, 1 or 2 output buses, 1 to 3 input hatches, 1 or 2 output hatches, and 16 or more plascrete among them.']],
        ['aerogel_works', 'supercritical_drying', 'Aerogel Works', 'Supercritical Drying', [
            '4 silica nanograins + 1,000 mB ethanol, gelled and dried under supercritical CO2 (a 1,000 mB charge, not consumed) -> 4 silica aerogel + the ethanol back.',
            'The ethanol and the CO2 loop: nothing is lost but the grains. Aerogel is the best insulator: the level 6 fuel tank\'s lining. 30,720 EU/t.',
            'Needs, in the floor: 1 or 2 energy hatches (LuV or better), 1 or 2 input buses, 1 or 2 output buses, 1 to 3 input hatches, 1 or 2 output hatches, and 12 or more stable casings among them.']]
    ]
    var ES_MACHINES = [
        ['methane_pyrolyser', 'methane_pyrolysis', 'Pirolizador de metano', 'Pir\u00F3lisis de metano', [
            'Una columna de burbujas de esta\u00F1o y n\u00EDquel fundidos (no se gastan). Circuito programado 1: 1 000 mB de metano -> 2 000 mB de hidr\u00F3geno + 2 de polvo de grafeno. Circuito 2: igual -> 1 hilo de nanotubos de carbono, m\u00E1s lento.',
            'Sin CO2: el carbono sale s\u00F3lido. El hidr\u00F3geno vuelve a la red. 122 880 EU/t. El hilo de nanotubos envuelve los tanques de la planta de aerogel.',
            'Necesita, en el suelo: 1 o 2 escotillas de energ\u00EDa (ZPM), 1 o 2 buses de entrada, 1 o 2 buses de salida, de 1 a 3 escotillas de entrada, 1 o 2 de salida, y 4 o m\u00E1s carcasas termorresistentes entre ellos.']],
        ['vent_bioreactor', 'chemosynthesis', 'Biorreactor de fuentes', 'Quimios\u00EDntesis', [
            'Una vasija a 90 \u00B0C que da a las bacterias de Europa una qu\u00EDmica de fuente hidrotermal. Circuito 1: 250 mB de bacterias + 1 000 mB de salmuera de Enc\u00E9lado + 500 mB de hidr\u00F3geno + 250 mB de CO2 -> 4 cultivos de arqueas + 250 mB de metano.',
            'Circuito 2: 1 tolina + 1 000 mB de salmuera + 1 000 mB de mut\u00E1geno, con un cultivo que no se gasta -> 4 000 mB de medio de crecimiento crudo + 500 mB de agua salada. Sin carne, sin az\u00FAcar, sin sala blanca est\u00E9ril.',
            'Necesita, en el suelo: 1 o 2 escotillas de energ\u00EDa (LuV o mejor), 1 o 2 buses de entrada, 1 o 2 buses de salida, de 1 a 3 escotillas de entrada, 1 o 2 de salida, y 16 o m\u00E1s de plascreto entre ellos.']],
        ['aerogel_works', 'supercritical_drying', 'Planta de aerogel', 'Secado supercr\u00EDtico', [
            '4 nanogranos de s\u00EDlice + 1 000 mB de etanol, gelificados y secados con CO2 supercr\u00EDtico (una carga de 1 000 mB que no se gasta) -> 4 de aerogel de s\u00EDlice + el etanol de vuelta.',
            'El etanol y el CO2 circulan: solo se pierden los granos. El aerogel es el mejor aislante: el revestimiento del tanque de combustible de nivel 6. 30 720 EU/t.',
            'Necesita, en el suelo: 1 o 2 escotillas de energ\u00EDa (LuV o mejor), 1 o 2 buses de entrada, 1 o 2 buses de salida, de 1 a 3 escotillas de entrada, 1 o 2 de salida, y 12 o m\u00E1s carcasas estables entre ellos.']]
    ]

    function addAll(event, machines) {
        var add = function (key, value) { event.add('grindless', key, value) }
        machines.forEach(function (m) {
            add('block.gtceu.' + m[0], m[2])
            add('gtceu.' + m[1], m[3])
            for (var i = 0; i < 3; i++) add('grindless.machine.' + m[0] + '.tooltip.' + i, m[4][i])
        })
    }

    ClientEvents.lang('en_us', function (event) { addAll(event, EN_MACHINES) })
    ClientEvents.lang('es_es', function (event) { addAll(event, ES_MACHINES) })
})()
