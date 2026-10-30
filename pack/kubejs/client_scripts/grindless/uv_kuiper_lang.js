// priority: 2600
// Gregtech Grindless - names and tooltips of UV's Kuiper belt (startup_scripts/grindless/uv/kuiper.js):
//
//   gtceu:kuiper_interceptor_bay / amorphous_ice_annealer   machine names + four tooltip lines each
//   gtceu:kuiper_intercept / ice_annealing                  recipe type names
//   grindless:kuiper_interceptor / sample_canister          names + two tooltip lines each
// The planetesimal sample and the Kuiper noble gas are F1's and named in uv_foundation_lang.js.
(function () {
    var TEXT = {
        en_us: {
            bay: 'Kuiper Interceptor Bay', annealer: 'Amorphous Ice Annealer',
            bayType: 'Kuiper Intercept', annealerType: 'Ice Annealing',
            bayTips: [
                '§7Intercepts a Kuiper Belt object for a planetesimal sample.'
            ],
            annealerTips: [
                '§7Anneals amorphous ice to release trapped noble gases.'
            ],
            items: {
                kuiper_interceptor: ['Kuiper Interceptor', 'A thruster pod, a probe RTG and a sample canister: the delta-v and the power to reach a Kuiper Belt object and return.', 'Assembler. Spent in the Kuiper interceptor bay; the canister comes back.'],
                sample_canister: ['Sample Canister', 'A titanium return capsule with PTFE seals and a sensor that logs the cold chain all the way home.', 'Assembler (circuit 9). The Kuiper interceptor bay gives it back empty.']
            }
        },
        es_es: {
            bay: 'Hangar de Interceptores de Kuiper', annealer: 'Recocedor de Hielo Amorfo',
            bayType: 'Intercepción de Kuiper', annealerType: 'Recocido de Hielo',
            bayTips: [
                '§7Intercepta un objeto del cinturón de Kuiper para una muestra planetesimal.'
            ],
            annealerTips: [
                '§7Recuece hielo amorfo para liberar gases nobles atrapados.'
            ],
            items: {
                kuiper_interceptor: ['Interceptor de Kuiper', 'Un módulo de propulsores, un RTG de sonda y una cápsula de muestras: el delta-v y la energía para llegar a un objeto del cinturón de Kuiper y volver.', 'Ensambladora. Se gasta en el hangar de interceptores de Kuiper; la cápsula vuelve.'],
                sample_canister: ['Cápsula de Muestras', 'Una cápsula de retorno de titanio con juntas de PTFE y un sensor que registra la cadena de frío hasta casa.', 'Ensambladora (circuito 9). El hangar de interceptores de Kuiper la devuelve vacía.']
            }
        }
    }

    Object.keys(TEXT).forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            var t = TEXT[lang]
            var add = function (key, value) { event.add('grindless', key, value) }

            add('block.gtceu.kuiper_interceptor_bay', t.bay)
            add('block.gtceu.amorphous_ice_annealer', t.annealer)
            add('gtceu.kuiper_intercept', t.bayType)
            add('gtceu.ice_annealing', t.annealerType)
            for (var i = 0; i < 1; i++) {
                add('grindless.machine.kuiper_interceptor_bay.tooltip.' + i, t.bayTips[i])
                add('grindless.machine.amorphous_ice_annealer.tooltip.' + i, t.annealerTips[i])
            }
            Object.keys(t.items).forEach(function (name) {
                add('item.grindless.' + name, t.items[name][0])
                add('tooltip.grindless.' + name + '.0', t.items[name][1])
                add('tooltip.grindless.' + name + '.1', t.items[name][2])
            })
        })
    })
})()
