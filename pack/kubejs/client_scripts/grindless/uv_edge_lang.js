// Gregtech Grindless - names and tooltips of UV's edge (startup_scripts/grindless/uv/edge.js):
//
//   gtceu:precursor_probe_bay / event_horizon_interferometer   machine names + four tooltip lines each
//   gtceu:precursor_probe / event_horizon_imaging              recipe type names
//   grindless:precursor_probe                                  name + two tooltip lines
// The heliopause data and the Sgr A* image are F1's and named in uv_foundation_lang.js.
(function () {
    var TEXT = {
        en_us: {
            bay: 'Precursor Probe Bay', interferometer: 'Event Horizon Interferometer',
            bayType: 'Precursor Probe', interferometerType: 'Event Horizon Imaging',
            bayTips: [
                'The first probe to the heliopause, where the Sun\'s wind meets the interstellar medium. Circuit 1: 1 precursor probe + 4 ICAN pellets -> 1 heliopause data.',
                'An ICAN kick out of Pluto\'s orbit, then years on ion thrusters to 150 AU, as JHU/APL\'s Interstellar Probe study planned after Voyager 1 crossed in 2012. The probe is spent.',
                'Pluto orbit only, 2 A UV. The only maker of the heliopause data: the laser sail launcher needs it to aim the Starshot.',
                'Needs 7 x 7 x 11 station truss casing (16 or more among the parts), titanium frames (the launch rail), computer casing (the DSN relay), 1 or 2 energy hatches (UV), input buses and output buses.'
            ],
            interferometerTips: [
                'Observatory step 8: a baseline from Pluto\'s orbit to Earth resolves the shadow of Sgr A*, the black hole at the galaxy\'s heart.',
                'Circuit 1: the multimessenger catalogue (not consumed) + 1 HPGe crystal (the receiver\'s front end) + 4 data orbs -> 1 Sgr A* image.',
                'Pluto orbit only. The Event Horizon Telescope imaged Sgr A* in 2022 with an Earth-sized baseline; this one is a fictional stretch of space VLBI. The image is the UHV energy hatch\'s research.',
                'Needs 9 x 9 x 5 station truss casing (20 or more among the parts), a 7 x 7 dish of aluminium blocks, an advanced computer casing (the maser clock), 1 or 2 energy hatches (UV), input buses and output buses.'
            ],
            items: {
                precursor_probe: ['Precursor Probe', 'Two probe RTGs, a thruster pod, an HPGe spectrometer and a printed frame: built to outlive its makers on the way to 150 AU.', 'Assembler. Spent in the precursor probe bay.']
            }
        },
        es_es: {
            bay: 'Hangar de Sondas Precursoras', interferometer: 'Interferómetro del Horizonte de Sucesos',
            bayType: 'Sonda Precursora', interferometerType: 'Imagen del Horizonte de Sucesos',
            bayTips: [
                'La primera sonda hasta la heliopausa, donde el viento del Sol choca con el medio interestelar. Circuito 1: 1 sonda precursora + 4 pastillas ICAN -> 1 datos de la heliopausa.',
                'Un impulso ICAN desde la órbita de Plutón y después años de propulsores iónicos hasta 150 UA, como planeó el estudio Interstellar Probe de JHU/APL tras el cruce de la Voyager 1 en 2012. La sonda se gasta.',
                'Solo en la órbita de Plutón, 2 A UV. Es la única fuente de los datos de la heliopausa: el lanzador de velas láser los necesita para apuntar el Starshot.',
                'Necesita 7 x 7 x 11 de carcasa de celosía de estación (16 o más entre las piezas), bastidores de titanio (el raíl de lanzamiento), carcasa de ordenador (el relé DSN), 1 o 2 escotillas de energía (UV), buses de entrada y buses de salida.'
            ],
            interferometerTips: [
                'Paso 8 del observatorio: una línea de base de la órbita de Plutón a la Tierra resuelve la sombra de Sgr A*, el agujero negro del corazón de la galaxia.',
                'Circuito 1: el catálogo multimensajero (no se consume) + 1 cristal de HPGe (la etapa de entrada del receptor) + 4 orbes de datos -> 1 imagen de Sgr A*.',
                'Solo en la órbita de Plutón. El Event Horizon Telescope fotografió Sgr A* en 2022 con una línea de base del tamaño de la Tierra; esta es una extrapolación ficticia de la VLBI espacial. La imagen es la investigación de la escotilla de energía UHV.',
                'Necesita 9 x 9 x 5 de carcasa de celosía de estación (20 o más entre las piezas), una antena de 7 x 7 de bloques de aluminio, una carcasa de ordenador avanzada (el reloj máser), 1 o 2 escotillas de energía (UV), buses de entrada y buses de salida.'
            ],
            items: {
                precursor_probe: ['Sonda Precursora', 'Dos RTG de sonda, un módulo de propulsores, un espectrómetro de HPGe y un bastidor impreso: hecha para sobrevivir a sus constructores camino de 150 UA.', 'Ensambladora. Se gasta en el hangar de sondas precursoras.']
            }
        }
    }

    Object.keys(TEXT).forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            var t = TEXT[lang]
            var add = function (key, value) { event.add('grindless', key, value) }

            add('block.gtceu.precursor_probe_bay', t.bay)
            add('block.gtceu.event_horizon_interferometer', t.interferometer)
            add('gtceu.precursor_probe', t.bayType)
            add('gtceu.event_horizon_imaging', t.interferometerType)
            for (var i = 0; i < 4; i++) {
                add('grindless.machine.precursor_probe_bay.tooltip.' + i, t.bayTips[i])
                add('grindless.machine.event_horizon_interferometer.tooltip.' + i, t.interferometerTips[i])
            }
            Object.keys(t.items).forEach(function (name) {
                add('item.grindless.' + name, t.items[name][0])
                add('tooltip.grindless.' + name + '.0', t.items[name][1])
                add('tooltip.grindless.' + name + '.1', t.items[name][2])
            })
        })
    })
})()
