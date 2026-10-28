// priority: 3037
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
        ['block.gtceu.millikelvin_cryostat_works', 'Millikelvin Cryostat Works', 'Taller de criostatos de milikelvin'],
        ['gtceu.spectral_hole_burning', 'Spectral Hole Burning', 'Quemado de huecos espectrales'],
        ['gtceu.nuclear_demagnetisation', 'Nuclear Demagnetisation', 'Desmagnetización nuclear'],
        ['material.gtceu.he3_he4_mixture', 'He-3/He-4 Mixture', 'Mezcla He-3/He-4'],
        ['material.gtceu.erbium_chloride_solution', 'Erbium Chloride Solution', 'Solución de cloruro de erbio'],

        ['grindless.machine.millikelvin_cryostat_works.tooltip.0',
            'A magnet-ringed cryostat that cools copper nuclei to millikelvin by adiabatic demagnetisation: the only maker of the mK cryostat module and the characterised P:Si processor.',
            'Un criostato rodeado de imanes que enfría núcleos de cobre hasta milikelvin por desmagnetización adiabática: el único que fabrica el módulo criostato de mK y el procesador P:Si caracterizado.'],
        ['grindless.machine.millikelvin_cryostat_works.tooltip.1',
            'Circuit 1 nuclear stage, 2 mK cryostat module (the He-3/He-4 mixture comes back out), 3 characterised P:Si processor (the module is kept, not consumed).',
            'Circuito 1 etapa nuclear, 2 módulo criostato de mK (la mezcla He-3/He-4 vuelve a salir), 3 procesador P:Si caracterizado (el módulo se conserva, no se consume).'],
        ['grindless.machine.millikelvin_cryostat_works.tooltip.2',
            'Needs a belt of metallic hydrogen coil blocks. Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, optional fluid hatches. Accepts a parallel hatch.',
            'Necesita un cinturón de bloques de bobina de hidrógeno metálico. Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida, escotillas de fluidos opcionales. Acepta una escotilla de paralelos.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.nuclear_stage',
            'Circuit 1: PrNi5 and copper plates make the nuclear demagnetisation stage.',
            'Circuito 1: PrNi5 y placas de cobre forman la etapa de desmagnetización nuclear.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.mk_module',
            'Circuit 2: the nuclear stage, a cold plate and the dilution mixture make a mK cryostat module; the mixture is returned.',
            'Circuito 2: la etapa nuclear, una placa fría y la mezcla de dilución forman un módulo criostato de mK; la mezcla se devuelve.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.p_si_processor',
            'Circuit 3: the overgrown P:Si die is characterised at millikelvin; the module is a catalyst.',
            'Circuito 3: el dado de P:Si sobrecrecido se caracteriza a milikelvin; el módulo es un catalizador.'],

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
        ['six_hour_memory', 'Six-Hour Quantum Memory', 'Memoria cuántica de seis horas', 'A cooled Eu-151:YSO memory with its sensor.', 'Una memoria de Eu-151:YSO enfriada con su sensor.', 'Consumes one millikelvin cryostat module.', 'Consume un módulo criostato de milikelvin.'],
        ['nuclear_stage', 'Nuclear Demagnetisation Stage', 'Etapa de desmagnetización nuclear', 'A PrNi5 and copper stage that cools nuclei by demagnetisation.', 'Una etapa de PrNi5 y cobre que enfría núcleos por desmagnetización.', 'Goes into the mK cryostat module.', 'Va al módulo criostato de mK.'],
        ['cold_plate', 'Cold Plate', 'Placa fría', 'A copper plate soaked in superfluid helium.', 'Una placa de cobre empapada en helio superfluido.', 'Carries the heat from the nuclear stage.', 'Lleva el calor de la etapa nuclear.'],
        ['p_si_processor', 'Characterised P:Si Processor', 'Procesador P:Si caracterizado', 'An overgrown phosphorus-in-silicon die, mapped at millikelvin.', 'Un dado de fósforo en silicio sobrecrecido, mapeado a milikelvin.', 'Made only in the millikelvin cryostat works (circuit 3).', 'Solo se fabrica en el taller de criostatos de milikelvin (circuito 3).'],
        ['er_preform', 'Er-Doped Preform', 'Preforma dopada con Er', 'A silica preform doped with erbium and aluminium.', 'Una preforma de sílice dopada con erbio y aluminio.', 'Drawn into erbium fibre.', 'Se estira en fibra de erbio.'],
        ['er_fibre', 'Erbium Fibre', 'Fibra de erbio', 'Gain fibre for telecom amplifiers.', 'Fibra de ganancia para amplificadores telecom.', 'Coiled with a ytterbium fibre lead.', 'Se enrolla con un cable de fibra de iterbio.'],
        ['er_fibre_coil', 'Erbium Fibre Coil', 'Bobina de fibra de erbio', 'A coil of gain fibre with its lead spliced on.', 'Una bobina de fibra de ganancia con su cable empalmado.', 'Pumped by two InGaAs pump modules.', 'Se bombea con dos módulos de bombeo de InGaAs.'],
        ['pumped_edfa', 'Pumped EDFA', 'EDFA bombeado', 'An erbium-doped fibre amplifier for telecom light.', 'Un amplificador de fibra dopada con erbio para luz telecom.', 'Keeps the telecom memory network alive.', 'Mantiene viva la red de memorias telecom.']
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
