// priority: 2000
// Gregtech Grindless - names and tooltips of UV's propulsion (startup_scripts/grindless/uv/propulsion.js):
//
//   gtceu:cryotank_winder / thruster_works              machine names + four tooltip lines each
//   gtceu:cryotank_winding / thruster_assembly          recipe type names
//   grindless:ion_thruster / hall_thruster / thruster_pod / molybdenum_grid / lanthanum_hexaboride_cathode / bn_discharge_channel /
//   uv_electromagnet / propellant_tank                  names + two tooltip lines each
// The BNNT fuel tank the winder makes (grindless:bnnt_fuel_tank) is F1's and named in uv_foundation_lang.js.
(function () {
    var TEXT = {
        en_us: {
            winder: 'Cryotank Winder', works: 'Thruster Works',
            winderType: 'Cryotank Winding', worksType: 'Thruster Assembly',
            winderTips: [
                '§7Winds the BNNT fuel tank for tier 11 rockets.'
            ],
            worksTips: [
                '§7Builds gridded ion thrusters for the probes.'
            ],
            items: {
                ion_thruster: ['Gridded Ion Thruster', 'Xenon ions accelerated through two molybdenum grids: high efficiency, gentle thrust.', 'Made in the thruster works (circuit 1); goes into the thruster pod.'],
                hall_thruster: ['Hall Thruster', 'Krypton ionised in a boron nitride channel by a crossed magnetic field: more thrust per watt.', 'Made in the thruster works (circuit 2); goes into the thruster pod.'],
                thruster_pod: ['Thruster Pod', 'An ion and a Hall thruster with their power unit and propellant: the delta-v no chemical stage gives.', 'Made in the thruster works (circuit 3); the interceptor and the precursor probe carry it.'],
                molybdenum_grid: ['Molybdenum Grid', 'A laser-drilled molybdenum sheet: thousands of apertures that focus and accelerate the ions.', 'Laser engraver: 4 molybdenum foil with a sapphire lens.'],
                lanthanum_hexaboride_cathode: ['Lanthanum Hexaboride Cathode', 'LaB6 sheds electrons at a low work function: the hollow cathode that neutralises the beam.', 'Electric blast furnace (2,500 K): 1 lanthanum + 6 boron dust under argon.'],
                bn_discharge_channel: ['BN Discharge Channel', 'Boron nitride and silica ceramic: the ring the Hall thruster\'s plasma erodes slowest.', 'Forming press: 3 hBN dust + 1 silicon dioxide dust.'],
                uv_electromagnet: ['UV Electromagnet', 'A soft iron core in fine copper wire insulated with polybenzimidazole: shapes the Hall field.', 'Assembler (circuit 7). The Hall thruster takes four.'],
                propellant_tank: ['Propellant Tank', 'A titanium liner overwrapped with carbon nanotube yarn, with its own flow control.', 'Assembler (circuit 8). Goes into the thruster pod.']
            }
        },
        es_es: {
            winder: 'Bobinadora de Criotanques', works: 'Taller de Propulsores',
            winderType: 'Bobinado de Criotanques', worksType: 'Montaje de Propulsores',
            winderTips: [
                '§7Bobina el depósito de BNNT para cohetes de nivel 11.'
            ],
            worksTips: [
                '§7Construye propulsores iónicos de rejilla para las sondas.'
            ],
            items: {
                ion_thruster: ['Propulsor Iónico de Rejillas', 'Iones de xenón acelerados a través de dos rejillas de molibdeno: gran eficiencia, empuje suave.', 'Se hace en el taller de propulsores (circuito 1); va al módulo de propulsores.'],
                hall_thruster: ['Propulsor Hall', 'Kriptón ionizado en un canal de nitruro de boro por un campo magnético cruzado: más empuje por vatio.', 'Se hace en el taller de propulsores (circuito 2); va al módulo de propulsores.'],
                thruster_pod: ['Módulo de Propulsores', 'Un propulsor iónico y uno Hall con su unidad de potencia y su propelente: el delta-v que ninguna etapa química da.', 'Se hace en el taller de propulsores (circuito 3); lo llevan el interceptor y la sonda precursora.'],
                molybdenum_grid: ['Rejilla de Molibdeno', 'Una lámina de molibdeno perforada por láser: miles de aberturas que enfocan y aceleran los iones.', 'Grabador láser: 4 láminas de molibdeno con una lente de zafiro.'],
                lanthanum_hexaboride_cathode: ['Cátodo de Hexaboruro de Lantano', 'El LaB6 emite electrones con una función de trabajo baja: el cátodo hueco que neutraliza el haz.', 'Alto horno eléctrico (2.500 K): 1 de lantano + 6 de polvo de boro bajo argón.'],
                bn_discharge_channel: ['Canal de Descarga de BN', 'Cerámica de nitruro de boro y sílice: el anillo que el plasma del propulsor Hall erosiona más despacio.', 'Prensa de formado: 3 de polvo de hBN + 1 de polvo de dióxido de silicio.'],
                uv_electromagnet: ['Electroimán UV', 'Un núcleo de hierro dulce en hilo fino de cobre aislado con polibencimidazol: da forma al campo Hall.', 'Ensambladora (circuito 7). El propulsor Hall lleva cuatro.'],
                propellant_tank: ['Tanque de Propelente', 'Un revestimiento de titanio envuelto en hilo de nanotubos de carbono, con su propio control de flujo.', 'Ensambladora (circuito 8). Va al módulo de propulsores.']
            }
        }
    }

    Object.keys(TEXT).forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            var t = TEXT[lang]
            var add = function (key, value) { event.add('grindless', key, value) }

            add('block.gtceu.cryotank_winder', t.winder)
            add('block.gtceu.thruster_works', t.works)
            add('gtceu.cryotank_winding', t.winderType)
            add('gtceu.thruster_assembly', t.worksType)
            for (var i = 0; i < 1; i++) {
                add('grindless.machine.cryotank_winder.tooltip.' + i, t.winderTips[i])
                add('grindless.machine.thruster_works.tooltip.' + i, t.worksTips[i])
            }
            Object.keys(t.items).forEach(function (name) {
                add('item.grindless.' + name, t.items[name][0])
                add('tooltip.grindless.' + name + '.0', t.items[name][1])
                add('tooltip.grindless.' + name + '.1', t.items[name][2])
            })
        })
    })
})()
