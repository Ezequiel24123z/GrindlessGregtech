// Gregtech Grindless - names and tooltips of UIV's optical mainframe line (startup_scripts/grindless/uiv/mainframe.js; package UIV-A7):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each row the package appends to an older table
//   emi.grindless.info.uiv_mainframe.N                 the EMI info page of the mainframe, tensor core, repeater and sensor
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['emi.grindless.info.uiv_mainframe.0',
            'The optical mainframe comes only from the photonic integration hall (circuit 5): a GST crossbar bonded to a glass interposer, a six-hour memory, a P:Si processor and a photonic tensor core.',
            'El mainframe óptico sale solo del salón de integración fotónica (circuito 5): un crossbar de GST unido a un interposer de vidrio, una memoria de seis horas, un procesador P:Si y un núcleo tensorial fotónico.'],
        ['emi.grindless.info.uiv_mainframe.1',
            'The pulsar-timed repeater needs a clock core disciplined at the pulsar timing station; the UIV sensor needs the EO microcomb and a chip nuclear clock.',
            'El repetidor cronometrado por púlsares necesita un núcleo de reloj disciplinado en la estación de cronometraje de púlsares; el sensor UIV necesita el micropeine EO y un reloj nuclear en chip.'],

        ['gtceu.recipe.grindless_photonic_integration.photonic_tensor_core',
            'Circuit 4: the BEUV driver ASIC drives a photonic tensor core.',
            'Circuito 4: el ASIC controlador BEUV impulsa un núcleo tensorial fotónico.'],
        ['gtceu.recipe.grindless_photonic_integration.optical_mainframe',
            'Circuit 5: the optical mainframe, the only recipe for it.',
            'Circuito 5: el mainframe óptico, su única receta.'],
        ['gtceu.recipe.grindless_photonic_integration.pulsar_timed_repeater',
            'Circuit 6: the pulsar-timed repeater, the wireless link of UIV.',
            'Circuito 6: el repetidor cronometrado por púlsares, el enlace inalámbrico de UIV.'],
        ['gtceu.recipe.grindless_photonic_foundry.pcm_crossbar',
            'Circuit 13: a 64 x 64 GST crossbar patterned from PCM dies; the spent target goes back to the foundry.',
            'Circuito 13: un crossbar de GST de 64 x 64 formado a partir de dados PCM; el blanco gastado vuelve a la fundición.'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.thf4_film',
            'Circuit 7: a thorium fluoride film grown on a silicon wafer.',
            'Circuito 7: una película de fluoruro de torio crecida sobre una oblea de silicio.'],
        ['gtceu.recipe.grindless_nuclear_clock.chip_clock',
            'Circuit 3: the comb interrogates the capped film into a chip nuclear clock; the comb is not consumed.',
            'Circuito 3: el peine interroga la película sellada y forma un reloj nuclear en chip; el peine no se consume.'],
        ['gtceu.recipe.grindless_pulsar_timing.repeater_discipline',
            'Circuit 3: the pulsar chart locks a repeater clock core; the nuclear clock is not consumed.',
            'Circuito 3: la carta de púlsares fija un núcleo de reloj del repetidor; el reloj nuclear no se consume.'],
        ['gtceu.recipe.grindless_fluorspar_kiln.thf4_from_thorium_229',
            'Th-229 and hydrofluoric acid make thorium fluoride; the hydrogen is returned.',
            'El Th-229 y el ácido fluorhídrico forman fluoruro de torio; el hidrógeno se devuelve.']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['pcm_crossbar', 'PCM Crossbar', 'Crossbar PCM', 'A 64 x 64 crossbar of GST phase-change cells.', 'Un crossbar de 64 x 64 celdas de cambio de fase de GST.', 'Bonded to a glass interposer in the assembler.', 'Se une a un interposer de vidrio en el ensamblador.'],
        ['crossbar_on_interposer', 'Crossbar on Interposer', 'Crossbar sobre interposer', 'A PCM crossbar bonded to a glass interposer.', 'Un crossbar PCM unido a un interposer de vidrio.', 'The memory plane of the optical mainframe.', 'El plano de memoria del mainframe óptico.'],
        ['photonic_tensor_core', 'Photonic Tensor Core', 'Núcleo tensorial fotónico', 'Matrix products done in light, driven by a BEUV ASIC.', 'Productos de matrices hechos con luz, impulsados por un ASIC BEUV.', 'Goes into the optical mainframe (hall circuit 5).', 'Va al mainframe óptico (circuito 5 del salón).'],
        ['thf4', 'Thorium Fluoride', 'Fluoruro de torio', 'ThF4, fluorinated from thorium-229.', 'ThF4, fluorado a partir de torio-229.', 'Grown into a thin film in the MBE reactor (circuit 7).', 'Se cultiva en película fina en el reactor MBE (circuito 7).'],
        ['thf4_film', 'ThF4 Thin Film', 'Película fina de ThF4', 'A thorium fluoride film on a silicon wafer.', 'Una película de fluoruro de torio sobre una oblea de silicio.', 'Capped with glass in the assembler.', 'Se sella con vidrio en el ensamblador.'],
        ['capped_thf4_film', 'Capped ThF4 Film', 'Película de ThF4 sellada', 'A ThF4 film under a glass cap.', 'Una película de ThF4 bajo una tapa de vidrio.', 'Interrogated by the VUV comb in the nuclear clock lab (circuit 3).', 'La interroga el peine VUV en el laboratorio de reloj nuclear (circuito 3).'],
        ['chip_nuclear_clock', 'Chip Nuclear Clock', 'Reloj nuclear en chip', 'A solid-state thorium nuclear clock.', 'Un reloj nuclear de torio de estado sólido.', 'Part of the UIV sensor.', 'Parte del sensor UIV.'],
        ['disciplined_clock_core', 'Disciplined Clock Core', 'Núcleo de reloj disciplinado', 'A repeater clock locked to the pulsars.', 'Un reloj de repetidor fijado a los púlsares.', 'Made at the pulsar timing station; goes into the pulsar-timed repeater.', 'Se hace en la estación de cronometraje de púlsares; va al repetidor cronometrado por púlsares.']
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
