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
                'A cold classical Kuiper Belt object, untouched since the Solar System formed. Circuit 1: 1 Kuiper interceptor + the Pluto-Kuiper chart (not consumed) -> 1 planetesimal sample + 1 empty sample canister.',
                'The interceptor flies out on its ion and Hall thrusters, kept warm by its RTG, and brings the canister back to the station, as Hayabusa2 did from Ryugu.',
                'Pluto orbit only. The only maker of the planetesimal sample; the canister goes back into the next interceptor.',
                'Needs 7 x 7 x 9 station truss casing (12 or more among the parts), titanium frames (the launch rail), laminated glass (the sample airlock), 1 or 2 energy hatches (UV), input buses and output buses.'
            ],
            annealerTips: [
                'Amorphous ice that never warmed above 40 K holds argon, krypton and xenon; warmed through its crystallisation at about 140 K, it lets them go in one pulse.',
                'Circuit 1: 1 planetesimal sample -> 4,000 mB water + 1,000 mB carbon monoxide + 500 mB nitrogen + 250 mB Kuiper noble gas. The refractory dust (inert silicates and carbon) is voided.',
                'Pluto orbit only. The only maker of the Kuiper noble gas: the cryogenic plant splits it into argon, krypton and xenon for the thruster works. Carbon monoxide goes to the syngas plant.',
                'Needs 5 x 5 x 7 station truss casing (8 or more among the parts), cryostat casing (the warming stage), tungsten steel pipe casing (the gas manifold), 1 or 2 energy hatches (UV), input buses and 1 to 4 output hatches.'
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
                'Un objeto frío clásico del cinturón de Kuiper, intacto desde que se formó el sistema solar. Circuito 1: 1 interceptor de Kuiper + la carta Plutón-Kuiper (no se consume) -> 1 muestra de planetesimal + 1 cápsula de muestras vacía.',
                'El interceptor vuela con sus propulsores iónico y Hall, caldeado por su RTG, y trae la cápsula de vuelta a la estación, como hizo Hayabusa2 desde Ryugu.',
                'Solo en la órbita de Plutón. Es la única fuente de la muestra de planetesimal; la cápsula vuelve al siguiente interceptor.',
                'Necesita 7 x 7 x 9 de carcasa de celosía de estación (12 o más entre las piezas), bastidores de titanio (el raíl de lanzamiento), vidrio laminado (la esclusa de muestras), 1 o 2 escotillas de energía (UV), buses de entrada y buses de salida.'
            ],
            annealerTips: [
                'El hielo amorfo que nunca pasó de 40 K guarda argón, kriptón y xenón; al calentarse hasta cristalizar, a unos 140 K, los suelta de golpe.',
                'Circuito 1: 1 muestra de planetesimal -> 4.000 mB de agua + 1.000 mB de monóxido de carbono + 500 mB de nitrógeno + 250 mB de gas noble de Kuiper. El polvo refractario (silicatos y carbono inertes) se descarta.',
                'Solo en la órbita de Plutón. Es la única fuente del gas noble de Kuiper: la planta criogénica lo separa en argón, kriptón y xenón para el taller de propulsores. El monóxido de carbono va a la planta de gas de síntesis.',
                'Necesita 5 x 5 x 7 de carcasa de celosía de estación (8 o más entre las piezas), carcasa de criostato (la etapa de calentamiento), carcasa de tubería de acero de tungsteno (el colector de gases), 1 o 2 escotillas de energía (UV), buses de entrada y de 1 a 4 escotillas de salida.'
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
            for (var i = 0; i < 4; i++) {
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
