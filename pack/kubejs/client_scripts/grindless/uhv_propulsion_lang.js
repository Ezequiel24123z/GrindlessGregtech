// priority: 4200
// Gregtech Grindless - names and tooltips of UHV's ceramics and the level 8 rocket (startup_scripts/grindless/uhv/propulsion.js):
//
//   gtceu:spark_plasma_sinterer           machine name + four tooltip lines
//   gtceu:spark_plasma_sintering          recipe type name
//   grindless:tantalum_carbide_liner / oganesson_propellant_pod   name + two tooltip lines
//   grindless:ican_rocket_motor           block name (its block item uses it) + item name
//   gtceu:boron_carbide / uhtc_blend      material.gtceu.<n>
(function () {
    var TEXT = {
        en_us: {
            sinterer: 'Spark Plasma Sinterer',
            sinterType: 'Spark Plasma Sintering',
            sinterTip: '§7Sinters ceramic powder with pulsed current into UHTC parts.',
            sintererTips: [
                'Presses ceramic powder in a graphite die and drives a pulsed current through it: dense ultra-high-temperature ceramics in minutes. Programmed circuit 1: 8 UHTC blend + 1 graphite dust -> 2 UHTC tiles + 1 carbon dust (the worn die).',
                'Circuit 2: 2 tantalum dust + 2 carbon dust -> 1 tantalum carbide liner. Circuit 3: 4 UHTC tiles + 1 tantalum carbide liner -> 1 UHTC nozzle, the ICAN rocket motor\'s throat.',
                'The blend comes from zircon: zirconia in the electric blast furnace, zirconium diboride with boron carbide (its carbon monoxide goes to the syngas plant), then a mixer with silicon carbide.',
                'Needs 5 x 5 x 7 robust tungsten steel casing with tungsten steel pipe casings, frames and gearboxes inside (4 or more casings among the floor parts of both ends), 1 or 2 energy hatches (UHV), input and output buses.'
            ],
            motor: 'ICAN Rocket Motor',
            items: {
                tantalum_carbide_liner: ['Tantalum Carbide Liner',
                    'The UHTC nozzle\'s throat: tantalum carbide melts near 4,000 C.',
                    'Spark plasma sinterer, circuit 2.'],
                oganesson_propellant_pod: ['Oganesson Propellant Pod',
                    'A propellant tank filled with oganesson propellant.',
                    'Fuel of the swarm control station.']
            },
            materials: {
                boron_carbide: 'Boron Carbide',
                uhtc_blend: 'UHTC Blend'
            }
        },
        es_es: {
            sinterer: 'Sinterizadora por Plasma de Chispa',
            sinterType: 'Sinterizado por Plasma de Chispa',
            sinterTip: '§7Sinteriza polvo cerámico con corriente pulsada en piezas UHTC.',
            sintererTips: [
                'Prensa polvo ceramico en un molde de grafito y lo atraviesa con corriente pulsada: ceramicas de ultra alta temperatura densas en minutos. Circuito programado 1: 8 mezcla UHTC + 1 polvo de grafito -> 2 losetas UHTC + 1 polvo de carbono (el molde gastado).',
                'Circuito 2: 2 polvo de tantalo + 2 polvo de carbono -> 1 revestimiento de carburo de tantalo. Circuito 3: 4 losetas UHTC + 1 revestimiento de carburo de tantalo -> 1 tobera UHTC, la garganta del motor cohete ICAN.',
                'La mezcla sale del circon: circona en el alto horno electrico, diboruro de circonio con carburo de boro (su monoxido de carbono va a la planta de gas de sintesis), y luego una mezcladora con carburo de silicio.',
                'Necesita 5 x 5 x 7 de carcasa robusta de acero de tungsteno con carcasas de tuberia, marcos y cajas de engranajes de acero de tungsteno dentro (4 o mas carcasas entre las piezas del suelo de ambos extremos), 1 o 2 escotillas de energia (UHV), buses de entrada y salida.'
            ],
            motor: 'Motor Cohete ICAN',
            items: {
                tantalum_carbide_liner: ['Revestimiento de Carburo de Tantalo',
                    'La garganta de la tobera UHTC: el carburo de tantalo funde cerca de 4.000 C.',
                    'Sinterizadora por plasma de chispa, circuito 2.'],
                oganesson_propellant_pod: ['Capsula de Propelente de Oganeson',
                    'Un tanque de propelente lleno de propelente de oganeson.',
                    'Combustible de la estacion de control del enjambre.']
            },
            materials: {
                boron_carbide: 'Carburo de Boro',
                uhtc_blend: 'Mezcla UHTC'
            }
        }
    }

    Object.keys(TEXT).forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            var t = TEXT[lang]
            var add = function (key, value) { event.add('grindless', key, value) }

            add('block.gtceu.spark_plasma_sinterer', t.sinterer)
            add('gtceu.spark_plasma_sintering', t.sinterType)
            add('grindless.machine.spark_plasma_sinterer.tooltip.0', t.sinterTip)
            for (var i = 0; i < 4; i++) add('emi.grindless.info.spark_plasma_sinterer.' + (2 + i), t.sintererTips[i])
            add('block.grindless.ican_rocket_motor', t.motor)
            add('item.grindless.ican_rocket_motor', t.motor)
            Object.keys(t.items).forEach(function (name) {
                add('item.grindless.' + name, t.items[name][0])
                add('tooltip.grindless.' + name + '.0', t.items[name][1])
                add('tooltip.grindless.' + name + '.1', t.items[name][2])
            })
            Object.keys(t.materials).forEach(function (name) { add('material.gtceu.' + name, t.materials[name]) })
        })
    })
})()
