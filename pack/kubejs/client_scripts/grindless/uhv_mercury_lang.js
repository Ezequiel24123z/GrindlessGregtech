// Gregtech Grindless - names and tooltips of UHV on Mercury's ground (startup_scripts/grindless/uhv/mercury.js):
//
//   gtceu:regolith_excavator, gtceu:solar_vapour_furnace   machine names + four tooltip lines each
//   gtceu:regolith_excavation, gtceu:solar_vaporisation    recipe type names
//   grindless:<item>                                        name + two tooltip lines
(function () {
    var TEXT = {
        en_us: {
            machines: {
                regolith_excavator: {
                    name: 'Regolith Excavator',
                    type: 'Regolith Excavation',
                    tips: [
                        'Two counter-rotating bucket drums dig with no net reaction force, so Mercury\'s low gravity cannot lift the machine. Mercury only.',
                        '1 excavator bucket drum (worn about 1 run in 32) + an iridosmine vein sample from Mercury (never used up) -> 64 Mercury regolith.',
                        'The only source of Mercury regolith, for the Solar Vapour Furnace.',
                        'Needs a 9 x 5 x 3 Hermean heat-shield brick chassis with bucket drums (tungsten steel gearboxes) on tungsten steel frame arms either side, 1 or 2 energy hatches, an input bus and an output bus.'
                    ]
                },
                solar_vapour_furnace: {
                    name: 'Solar Vapour Furnace',
                    type: 'Solar Vaporisation',
                    tips: [
                        'Heliostats focus Mercury\'s sunlight on a vacuum chamber and boil the regolith\'s oxides off in order. Mercury\'s day side only: the recipes wait for daylight.',
                        'Circuit 1 (1,400 K): 16 Mercury regolith -> sodium-potassium + sulfur + 12 stripped regolith. Circuit 2 (2,300 K): 12 stripped regolith -> magnesium + silicon monoxide + iron + 4 alumina-calcia residue + graphite.',
                        'Both wear the regolith crucible lining (about 1 run in 16). Circuit 3: 4 alumina-calcia residue -> 1 lining. The first lining comes from the blast furnace (sapphire + quicklime).',
                        'Needs 10 heliostat mirrors on tungsten steel frames, a 5 x 5 x 5 Hermean heat-shield brick chamber under a tungsten steel firebox receiver with a heatproof crucible inside, night-sky radiator condenser plates on its flanks, 1 or 2 energy hatches, input and output buses and 1 output hatch.'
                    ]
                }
            },
            items: {
                mercury_regolith: ['Mercury Regolith', 'Loose rock from Mercury\'s surface: oxides of silicon, magnesium, aluminium, calcium and iron, with sulfur and graphite.', 'Dug by the Regolith Excavator on Mercury.'],
                stripped_mercury_regolith: ['Stripped Mercury Regolith', 'Regolith with its sodium, potassium and sulfur boiled off.', 'Made in the Solar Vapour Furnace (circuit 1); goes back in for circuit 2.'],
                excavator_bucket_drum: ['Excavator Bucket Drum', 'A tungsten steel drum ringed with scoops; it wears as it digs.', 'Made in the assembler; used by the Regolith Excavator.'],
                regolith_crucible_lining: ['Regolith Crucible Lining', 'A calcium aluminate ceramic that holds molten regolith at 2,300 K.', 'Sintered in the Solar Vapour Furnace (circuit 3) or, the first one, in the blast furnace.'],
                silicon_monoxide_dust: ['Silicon Monoxide Dust', 'SiO, condensed on the cold plates of the Solar Vapour Furnace.', 'The blast furnace splits it into silicon and silicon dioxide.'],
                alumina_calcia_residue: ['Alumina-Calcia Residue', 'CaAl2O4, what the sunlight could not boil off.', 'The electrolyser takes aluminium and calcium from it; the furnace sinters it into crucible linings.'],
                iron_tube: ['Iron Tube', 'A seamless iron sheath for magnesium diboride powder.', 'Extruded from iron; used by the Powder-in-Tube Line (circuit 5).']
            }
        },
        es_es: {
            machines: {
                regolith_excavator: {
                    name: 'Excavadora de Regolito',
                    type: 'Excavación de Regolito',
                    tips: [
                        'Dos tambores de cangilones que giran en sentidos opuestos excavan sin fuerza de reacción neta, así la baja gravedad de Mercurio no levanta la máquina. Solo en Mercurio.',
                        '1 tambor de cangilones (se desgasta 1 vez de cada 32 aprox.) + una muestra de veta de iridosmina de Mercurio (no se gasta) -> 64 regolito de Mercurio.',
                        'La única fuente de regolito de Mercurio, para el Horno Solar de Vaporización.',
                        'Necesita un chasis de 9 x 5 x 3 de ladrillo de escudo térmico hermeano con tambores de cangilones (cajas de engranajes de acero de tungsteno) sobre brazos de marco de acero de tungsteno a cada lado, 1 o 2 escotillas de energía, un bus de entrada y un bus de salida.'
                    ]
                },
                solar_vapour_furnace: {
                    name: 'Horno Solar de Vaporización',
                    type: 'Vaporización Solar',
                    tips: [
                        'Los helióstatos concentran la luz solar de Mercurio en una cámara de vacío y evaporan los óxidos del regolito por orden. Solo en la cara diurna de Mercurio: las recetas esperan a la luz del día.',
                        'Circuito 1 (1.400 K): 16 regolito de Mercurio -> sodio-potasio + azufre + 12 regolito despojado. Circuito 2 (2.300 K): 12 regolito despojado -> magnesio + monóxido de silicio + hierro + 4 residuo de alúmina-cal + grafito.',
                        'Ambos desgastan el revestimiento de crisol de regolito (1 vez de cada 16 aprox.). Circuito 3: 4 residuo de alúmina-cal -> 1 revestimiento. El primero sale del alto horno (zafiro + cal viva).',
                        'Necesita 10 espejos de helióstato sobre marcos de acero de tungsteno, una cámara de 5 x 5 x 5 de ladrillo de escudo térmico hermeano bajo un receptor de carcasa de hogar de acero de tungsteno con un crisol a prueba de calor dentro, placas condensadoras de radiador de cielo nocturno en sus flancos, 1 o 2 escotillas de energía, buses de entrada y salida y 1 escotilla de salida.'
                    ]
                }
            },
            items: {
                mercury_regolith: ['Regolito de Mercurio', 'Roca suelta de la superficie de Mercurio: óxidos de silicio, magnesio, aluminio, calcio y hierro, con azufre y grafito.', 'Lo excava la Excavadora de Regolito en Mercurio.'],
                stripped_mercury_regolith: ['Regolito de Mercurio Despojado', 'Regolito al que se le han evaporado el sodio, el potasio y el azufre.', 'Se fabrica en el Horno Solar de Vaporización (circuito 1); vuelve a entrar para el circuito 2.'],
                excavator_bucket_drum: ['Tambor de Cangilones', 'Un tambor de acero de tungsteno rodeado de palas; se desgasta al excavar.', 'Se fabrica en el ensamblador; lo usa la Excavadora de Regolito.'],
                regolith_crucible_lining: ['Revestimiento de Crisol de Regolito', 'Una cerámica de aluminato de calcio que contiene el regolito fundido a 2.300 K.', 'Se sinteriza en el Horno Solar de Vaporización (circuito 3) o, el primero, en el alto horno.'],
                silicon_monoxide_dust: ['Polvo de Monóxido de Silicio', 'SiO, condensado en las placas frías del Horno Solar de Vaporización.', 'El alto horno lo separa en silicio y dióxido de silicio.'],
                alumina_calcia_residue: ['Residuo de Alúmina-Cal', 'CaAl2O4, lo que la luz solar no pudo evaporar.', 'El electrolizador extrae de él aluminio y calcio; el horno lo sinteriza en revestimientos de crisol.'],
                iron_tube: ['Tubo de Hierro', 'Una vaina de hierro sin costura para polvo de diboruro de magnesio.', 'Se extruye a partir de hierro; lo usa la Línea de Polvo en Tubo (circuito 5).']
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
            })
            add('gtceu.regolith_excavation', t.machines.regolith_excavator.type)
            add('gtceu.solar_vaporisation', t.machines.solar_vapour_furnace.type)
            Object.keys(t.items).forEach(function (name) {
                add('item.grindless.' + name, t.items[name][0])
                add('tooltip.grindless.' + name + '.0', t.items[name][1])
                add('tooltip.grindless.' + name + '.1', t.items[name][2])
            })
        })
    })
})()
