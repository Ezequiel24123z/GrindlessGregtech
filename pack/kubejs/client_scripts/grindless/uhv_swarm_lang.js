// priority: 3900
// Gregtech Grindless - names and tooltips of UHV's Dyson swarm (startup_scripts/grindless/uhv/swarm.js):
//
//   gtceu:swarm_segment_foundry, gtceu:swarm_control_station, gtceu:solar_probe_bay   machine names + four tooltip lines each
//   gtceu:swarm_segment, gtceu:dyson_swarm, gtceu:solar_probe                         recipe type names
//   grindless:<item>                                                                   name + two tooltip lines
// F1's items (swarm segment, worn swarm segment, coronal field map, aluminium reflector film) are named in uhv_foundation_lang.js.
(function () {
    var TYPES = { swarm_segment_foundry: 'swarm_segment', swarm_control_station: 'dyson_swarm', solar_probe_bay: 'solar_probe' }
    var TEXT = {
        en_us: {
            machines: {
                swarm_segment_foundry: {
                    name: 'Swarm Segment Foundry',
                    type: 'Swarm Segment Assembly',
                    tips: [
                        'An assembly gantry over a station truss deck that builds the Dyson swarm\'s solar collectors. Mercury\'s orbit only.',
                        'Circuit 1: 4 aluminium reflector film + 2 IMM solar arrays + a fibre laser module + a C-12 diamond spreader + a SiC power module + 2 betavoltaic cells + a sodium-potassium heat pipe -> 1 swarm segment.',
                        'Circuit 2: a worn swarm segment + 1 reflector film + 1 IMM solar array -> 1 swarm segment + small aluminium dust (the stripped film).',
                        'Needs a 9 x 7 x 9 station truss deck under tungsten steel frame posts, an assembly line grating bridge and an assembly line unit head, 1 or 2 energy hatches, input buses and output buses.'
                    ]
                },
                swarm_control_station: {
                    name: 'Swarm Control Station',
                    type: 'Dyson Swarm',
                    tips: [
                        'Steers swarm segments round the Sun and takes their power by laser: a generator. Mercury\'s orbit only. One run at a time; parallel hatches do nothing.',
                        'Circuit 1: 16 swarm segments + 1 oganesson propellant pod (or 1,000 mB krypton, half the run) -> 2,097,152 EU/t; 1 segment wears out and the empty tank returns.',
                        'Circuit 2: 64 swarm segments + a coronal field map (never used up) + 4 pods -> 8,388,608 EU/t; 4 segments wear out. Worn segments go back to the Swarm Segment Foundry.',
                        'Needs an 11 x 5 x 11 station truss deck with tungsten steel frame posts, a computer casing column and a sapphire laser receiver array on top, 1 to 4 dynamo hatches (a 4 A UHV dynamo carries circuit 2), input buses, an input hatch and output buses.'
                    ]
                },
                solar_probe_bay: {
                    name: 'Solar Probe Bay',
                    type: 'Solar Probe',
                    tips: [
                        'Builds heat-shielded probes and launches them into the Sun\'s corona. Mercury\'s orbit only.',
                        'Circuit 2: a carbon-carbon aeroshell + 4 UHTC tiles + a SiC power module + 2 betavoltaic cells + an HPGe crystal + a UV sensor -> 1 solar probe.',
                        'Circuit 1: 1 solar probe + the heliopause data (never used up) -> 1 coronal field map. The probe burns up: nothing returns.',
                        'Needs a 7 x 5 x 7 station truss deck with tungsten steel frame posts, a tungsten steel pipe casing launch rail, a truss top ring, 1 or 2 energy hatches, input buses and an output bus.'
                    ]
                }
            },
            items: {
                sodium_potassium_heat_pipe: ['Sodium-Potassium Heat Pipe', 'A tungsten steel pipe with a molybdenum wick and NaK inside: it carries a segment\'s waste heat to its radiators.', 'Made in the assembler; used by the Swarm Segment Foundry.'],
                solar_probe: ['Solar Probe', 'A heat-shielded magnetometer probe that dives through the Sun\'s corona.', 'Made in the Solar Probe Bay (circuit 2); flown by it (circuit 1).']
            }
        },
        es_es: {
            machines: {
                swarm_segment_foundry: {
                    name: 'Fundición de Segmentos de Enjambre',
                    type: 'Ensamblaje de Segmentos de Enjambre',
                    tips: [
                        'Un pórtico de ensamblaje sobre una cubierta de celosía de estación que construye los colectores solares del enjambre de Dyson. Solo en la órbita de Mercurio.',
                        'Circuito 1: 4 película reflectora de aluminio + 2 paneles solares IMM + un módulo de láser de fibra + un difusor de diamante C-12 + un módulo de potencia de SiC + 2 células betavoltaicas + un tubo de calor de sodio-potasio -> 1 segmento de enjambre.',
                        'Circuito 2: un segmento de enjambre desgastado + 1 película reflectora + 1 panel solar IMM -> 1 segmento de enjambre + polvo pequeño de aluminio (la película retirada).',
                        'Necesita una cubierta de celosía de estación de 9 x 7 x 9 bajo postes de marco de acero de tungsteno, un puente de rejilla de cadena de montaje y un cabezal de unidad de cadena de montaje, 1 o 2 escotillas de energía, buses de entrada y buses de salida.'
                    ]
                },
                swarm_control_station: {
                    name: 'Estación de Control del Enjambre',
                    type: 'Enjambre de Dyson',
                    tips: [
                        'Guía los segmentos del enjambre alrededor del Sol y recoge su energía por láser: un generador. Solo en la órbita de Mercurio. Una ejecución a la vez; las escotillas paralelas no hacen nada.',
                        'Circuito 1: 16 segmentos de enjambre + 1 cápsula de propelente de oganesón (o 1.000 mB de kriptón, media ejecución) -> 2.097.152 EU/t; 1 segmento se desgasta y el tanque vacío vuelve.',
                        'Circuito 2: 64 segmentos de enjambre + un mapa del campo coronal (no se gasta) + 4 cápsulas -> 8.388.608 EU/t; 4 segmentos se desgastan. Los desgastados vuelven a la Fundición de Segmentos de Enjambre.',
                        'Necesita una cubierta de celosía de estación de 11 x 5 x 11 con postes de marco de acero de tungsteno, una columna de carcasa de ordenador y una matriz de receptores láser de zafiro encima, de 1 a 4 escotillas dinamo (una dinamo UHV de 4 A sostiene el circuito 2), buses de entrada, una escotilla de entrada y buses de salida.'
                    ]
                },
                solar_probe_bay: {
                    name: 'Hangar de Sondas Solares',
                    type: 'Sonda Solar',
                    tips: [
                        'Construye sondas con escudo térmico y las lanza a la corona del Sol. Solo en la órbita de Mercurio.',
                        'Circuito 2: un aerocasco de carbono-carbono + 4 losetas UHTC + un módulo de potencia de SiC + 2 células betavoltaicas + un cristal de HPGe + un sensor UV -> 1 sonda solar.',
                        'Circuito 1: 1 sonda solar + los datos de la heliopausa (no se gastan) -> 1 mapa del campo coronal. La sonda se quema: no vuelve nada.',
                        'Necesita una cubierta de celosía de estación de 7 x 5 x 7 con postes de marco de acero de tungsteno, un raíl de lanzamiento de carcasas de tubería de acero de tungsteno, un anillo superior de celosía, 1 o 2 escotillas de energía, buses de entrada y un bus de salida.'
                    ]
                }
            },
            items: {
                sodium_potassium_heat_pipe: ['Tubo de Calor de Sodio-Potasio', 'Un tubo de acero de tungsteno con una mecha de molibdeno y NaK dentro: lleva el calor sobrante de un segmento a sus radiadores.', 'Se fabrica en el ensamblador; lo usa la Fundición de Segmentos de Enjambre.'],
                solar_probe: ['Sonda Solar', 'Una sonda magnetométrica con escudo térmico que atraviesa la corona del Sol.', 'Se fabrica en el Hangar de Sondas Solares (circuito 2); la lanza el mismo hangar (circuito 1).']
            }
        }
    }

    Object.keys(TEXT).forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            var t = TEXT[lang]
            var add = function (key, value) { event.add('grindless', key, value) }

            Object.keys(t.machines).forEach(function (name) {
                var m = t.machines[name]
                add('block.gtceu.' + name, m.name)
                for (var i = 0; i < 4; i++) add('grindless.machine.' + name + '.tooltip.' + i, m.tips[i])
                add('gtceu.' + TYPES[name], m.type)
            })
            Object.keys(t.items).forEach(function (name) {
                add('item.grindless.' + name, t.items[name][0])
                add('tooltip.grindless.' + name + '.0', t.items[name][1])
                add('tooltip.grindless.' + name + '.1', t.items[name][2])
            })
        })
    })
})()
