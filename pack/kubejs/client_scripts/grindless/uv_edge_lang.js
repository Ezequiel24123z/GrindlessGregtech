// priority: 2848
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
                '§7Sends a probe to the heliopause for heliopause data.'
            ],
            interferometerTips: [
                '§7Images the shadow of Sgr A* with an Earth-Pluto baseline.'
            ],
            items: {
                precursor_probe: ['Precursor Probe', 'Two probe RTGs, a thruster pod, an HPGe spectrometer and a printed frame: built to outlive its makers on the way to 150 AU.', 'Assembler. Spent in the precursor probe bay.']
            }
        },
        es_es: {
            bay: 'Hangar de Sondas Precursoras', interferometer: 'Interferómetro del Horizonte de Sucesos',
            bayType: 'Sonda Precursora', interferometerType: 'Imagen del Horizonte de Sucesos',
            bayTips: [
                '§7Envía una sonda a la heliopausa para obtener sus datos.'
            ],
            interferometerTips: [
                '§7Obtiene la sombra de Sgr A* con una línea base Tierra-Plutón.'
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
            for (var i = 0; i < 1; i++) {
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
