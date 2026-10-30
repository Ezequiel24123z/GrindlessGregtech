// priority: 700
// Gregtech Grindless - names and tooltips of ZPM's outer chemistry (startup_scripts/grindless/zpm/outer_chemistry.js):
//   block.gtceu.<methane_pyrolyser / vent_bioreactor / aerogel_works>, gtceu.<methane_pyrolysis / chemosynthesis / supercritical_drying>,
//   grindless.machine.<machine>.tooltip.0-2. The items are ZPM-F1's (zpm_foundation_lang.js).
(function () {
    // [machine, recipe type, name, recipe type name, tooltips]
    var EN_MACHINES = [
        ['methane_pyrolyser', 'methane_pyrolysis', 'Methane Pyrolyser', 'Methane Pyrolysis', [
            '§7Cracks methane in molten tin-nickel into hydrogen and carbon.'
            ]],
        ['vent_bioreactor', 'chemosynthesis', 'Vent Bioreactor', 'Chemosynthesis', [
            '§7Feeds Europa\'s bacteria a hydrothermal vent chemistry.'
            ]],
        ['aerogel_works', 'supercritical_drying', 'Aerogel Works', 'Supercritical Drying', [
            '§7Dries silica gel with supercritical CO2 into aerogel.'
            ]]
    ]
    var ES_MACHINES = [
        ['methane_pyrolyser', 'methane_pyrolysis', 'Pirolizador de metano', 'Pir\u00F3lisis de metano', [
            '§7Craquea metano en estaño-níquel fundido: hidrógeno y carbono.'
            ]],
        ['vent_bioreactor', 'chemosynthesis', 'Biorreactor de fuentes', 'Quimios\u00EDntesis', [
            '§7Alimenta bacterias de Europa con química de fuentes hidrotermales.'
            ]],
        ['aerogel_works', 'supercritical_drying', 'Planta de aerogel', 'Secado supercr\u00EDtico', [
            '§7Seca gel de sílice con CO2 supercrítico para obtener aerogel.'
            ]]
    ]

    function addAll(event, machines) {
        var add = function (key, value) { event.add('grindless', key, value) }
        machines.forEach(function (m) {
            add('block.gtceu.' + m[0], m[2])
            add('gtceu.' + m[1], m[3])
            for (var i = 0; i < 1; i++) add('grindless.machine.' + m[0] + '.tooltip.' + i, m[4][i])
        })
    }

    ClientEvents.lang('en_us', function (event) { addAll(event, EN_MACHINES) })
    ClientEvents.lang('es_es', function (event) { addAll(event, ES_MACHINES) })
})()
