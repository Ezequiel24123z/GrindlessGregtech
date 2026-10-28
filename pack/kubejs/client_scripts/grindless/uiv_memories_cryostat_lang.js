// priority: 3320
// Gregtech Grindless - names and tooltips of UIV's spectral hole burner (startup_scripts/grindless/uiv/memories_cryostat.js; package UIV-A6):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each burner recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.spectral_hole_burner', 'Spectral Hole Burner', 'Quemador de huecos espectrales'],
        ['gtceu.spectral_hole_burning', 'Spectral Hole Burning', 'Quemado de huecos espectrales'],

        ['grindless.machine.spectral_hole_burner.tooltip.0',
            'A cryostat that burns an atomic frequency comb into a rare-earth YSO slab held in superfluid helium: the only maker of the six-hour and telecom memory slabs.',
            'Un criostato que graba un peine de frecuencias atómicas en una losa de YSO de tierras raras sumergida en helio superfluido: el único que fabrica las losas de memoria de seis horas y telecom.'],
        ['grindless.machine.spectral_hole_burner.tooltip.1',
            'Circuit 1 Eu-151:YSO slab to six-hour memory slab, 2 Er:YSO slab to telecom memory slab. The superfluid helium is not consumed.',
            'Circuito 1 losa de Eu-151:YSO a losa de memoria de seis horas, 2 losa de Er:YSO a losa de memoria telecom. El helio superfluido no se consume.'],
        ['grindless.machine.spectral_hole_burner.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, optional fluid hatches. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, escotillas de fluidos opcionales. Acepta una escotilla de paralelos.'],

        ['gtceu.recipe.grindless_spectral_hole_burning.six_hour_slab',
            'Circuit 1: a comb burned into Eu-151:YSO keeps the state for six hours.',
            'Circuito 1: un peine grabado en Eu-151:YSO conserva el estado durante seis horas.'],
        ['gtceu.recipe.grindless_spectral_hole_burning.telecom_slab',
            'Circuit 2: a comb burned into Er:YSO stores light at telecom wavelength.',
            'Circuito 2: un peine grabado en Er:YSO almacena luz en longitud de onda telecom.'],
        // the crystal furnace rows UIV-A6 appends to tables/crystals.json
        ['gtceu.recipe.grindless_crystal_growth.eu151_yso',
            'Circuit 8: yttrium orthosilicate grown with europium-151 for the six-hour memory.',
            'Circuito 8: ortosilicato de itrio crecido con europio-151 para la memoria de seis horas.'],
        ['gtceu.recipe.grindless_crystal_growth.er_yso',
            'Circuit 9: yttrium orthosilicate grown with erbium for the telecom memory.',
            'Circuito 9: ortosilicato de itrio crecido con erbio para la memoria telecom.']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['eu151_yso_boule', 'Eu-151:YSO Boule', 'Lingote de Eu-151:YSO', 'Yttrium orthosilicate doped with europium-151.', 'Ortosilicato de itrio dopado con europio-151.', 'Grown in the crystal furnace (circuit 8) and cut into slabs.', 'Se crece en el horno de cristales (circuito 8) y se corta en losas.'],
        ['er_yso_boule', 'Er:YSO Boule', 'Lingote de Er:YSO', 'Yttrium orthosilicate doped with erbium.', 'Ortosilicato de itrio dopado con erbio.', 'Grown in the crystal furnace (circuit 9) and cut into slabs.', 'Se crece en el horno de cristales (circuito 9) y se corta en losas.'],
        ['eu151_yso_slab', 'Eu-151:YSO Slab', 'Losa de Eu-151:YSO', 'A polished slab cut from the boule.', 'Una losa pulida cortada del lingote.', 'Goes into the spectral hole burner (circuit 1).', 'Va al quemador de huecos espectrales (circuito 1).'],
        ['er_yso_slab', 'Er:YSO Slab', 'Losa de Er:YSO', 'A polished slab cut from the boule.', 'Una losa pulida cortada del lingote.', 'Goes into the spectral hole burner (circuit 2).', 'Va al quemador de huecos espectrales (circuito 2).'],
        ['six_hour_memory_slab', 'Six-Hour Memory Slab', 'Losa de memoria de seis horas', 'A slab with an atomic frequency comb that holds a state for hours.', 'Una losa con un peine de frecuencias atómicas que conserva un estado durante horas.', 'Mounted with a cryostat module into a six-hour memory.', 'Se monta con un módulo criostato en una memoria de seis horas.'],
        ['telecom_memory_slab', 'Telecom Memory Slab', 'Losa de memoria telecom', 'A slab that stores light at telecom wavelength.', 'Una losa que almacena luz en longitud de onda telecom.', 'Spliced to ytterbium fibre in the fibre drawer.', 'Se empalma a fibra de iterbio en la estiradora de fibra.'],
        ['six_hour_memory', 'Six-Hour Quantum Memory', 'Memoria cuántica de seis horas', 'A cooled Eu-151:YSO memory with its sensor.', 'Una memoria de Eu-151:YSO enfriada con su sensor.', 'Consumes one millikelvin cryostat module.', 'Consume un módulo criostato de milikelvin.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1], i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[3], i[4]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[5], i[6]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
