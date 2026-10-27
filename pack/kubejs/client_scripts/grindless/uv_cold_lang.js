// Gregtech Grindless - names and tooltips of UV's cold works (startup_scripts/grindless/uv/cold.js):
//
//   gtceu:superfluid_helium_plant / gtceu:srf_cavity_works   machine names + four tooltip lines each
//   gtceu:superfluid_helium / gtceu:srf_cavity               recipe type names
//   grindless:rrr_niobium_sheet / niobium_scrap / bare_srf_cavity / srf_cavity / mu_metal_shield   names + two tooltip lines each
//   gtceu:electropolish_acid / spent_electropolish_acid      material.gtceu.<n>
(function () {
    var TEXT = {
        en_us: {
            plant: 'Superfluid Helium Plant', works: 'SRF Cavity Works',
            plantType: 'Superfluid Helium', worksType: 'SRF Cavity',
            plantTips: [
                'Helium II at 1.9 K, below the lambda point, which LuV\'s 4 K refrigerator cannot reach. It cools the SRF cavities and the SNSPD receiver.',
                'Liquid helium (from the helium refrigerator): 1,000 mB -> 1,000 mB superfluid helium. Fluid recipes only: no circuit.',
                'Superleak: 1,000 mB Neptune helium -> 990 mB superfluid helium + 10 mB helium-3 concentrate (only helium-4 passes). The concentrate goes to the isotope column.',
                'Needs 7 x 7 x 9 frostproof casing (8 or more among the parts), 1 or 2 energy hatches (UV), 1 or 2 input hatches and 1 or 2 output hatches.'
            ],
            worksTips: [
                'The superconducting radio-frequency cryomodule, the building block of every UV accelerator. Programmed circuit 1: 4 niobium ingots -> 3 RRR niobium sheets + 1 niobium scrap (the scrap melts back into an ingot).',
                'Circuit 2: 9 RRR sheets -> 1 bare cavity. Circuit 3: 1 bare cavity + 500 mB electropolish acid + 100 mB nitrogen -> 1 N-doped cavity + 500 mB spent acid.',
                'Circuit 4: 8 cavities + 4,000 mB superfluid helium + 2 UV field generators + 1 mu-metal shield -> 1 SRF cryomodule. The spent acid is recovered as niobium and fluorite, and fluorite makes hydrofluoric acid again.',
                'Needs 7 x 7 x 9 clean room casing (8 or more among the parts), 1 or 2 energy hatches (UV), input and output buses and hatches.'
            ],
            items: {
                rrr_niobium_sheet: ['RRR Niobium Sheet', 'High residual resistance ratio niobium, electron-beam melted five times.', 'Made in the SRF Cavity Works (circuit 1).'],
                niobium_scrap: ['Niobium Scrap', 'Offcuts of the sheet. Nothing is lost: an electric furnace melts it back into an ingot.', 'Made in the SRF Cavity Works (circuit 1).'],
                bare_srf_cavity: ['Bare Nine-Cell Cavity', 'Nine deep-drawn cells, electron-beam welded. Not yet electropolished.', 'Made in the SRF Cavity Works (circuit 2).'],
                srf_cavity: ['N-Doped SRF Cavity', 'Electropolished and nitrogen-doped: it carries the field at a high quality factor.', 'Made in the SRF Cavity Works (circuit 3).'],
                mu_metal_shield: ['Mu-Metal Shield', 'A nickel-iron shell that keeps stray magnetic fields out of the cryomodule.', 'Made in an assembler from nickel and iron plates and copper foil.']
            },
            materials: { electropolish_acid: 'Electropolish Acid', spent_electropolish_acid: 'Spent Electropolish Acid' }
        },
        es_es: {
            plant: 'Planta de Helio Superfluido', works: 'Taller de Cavidades SRF',
            plantType: 'Helio superfluido', worksType: 'Cavidad SRF',
            plantTips: [
                'Helio II a 1,9 K, por debajo del punto lambda, que el refrigerador de 4 K de LuV no alcanza. Enfria las cavidades SRF y el receptor SNSPD.',
                'Helio liquido (del refrigerador de helio): 1.000 mB -> 1.000 mB de helio superfluido. Solo recetas de fluidos: sin circuito.',
                'Superfuga: 1.000 mB de helio de Neptuno -> 990 mB de helio superfluido + 10 mB de concentrado de helio-3 (solo pasa el helio-4). El concentrado va a la columna de isotopos.',
                'Necesita carcasa anticongelante de 7 x 7 x 9 (8 o mas entre las piezas), 1 o 2 hatches de energia (UV), 1 o 2 hatches de entrada y 1 o 2 de salida.'
            ],
            worksTips: [
                'El criomodulo de radiofrecuencia superconductor, la pieza base de todo acelerador UV. Circuito programado 1: 4 lingotes de niobio -> 3 laminas de niobio RRR + 1 chatarra de niobio (la chatarra vuelve a fundirse en un lingote).',
                'Circuito 2: 9 laminas RRR -> 1 cavidad desnuda. Circuito 3: 1 cavidad desnuda + 500 mB de acido de electropulido + 100 mB de nitrogeno -> 1 cavidad dopada con N + 500 mB de acido gastado.',
                'Circuito 4: 8 cavidades + 4.000 mB de helio superfluido + 2 generadores de campo UV + 1 blindaje de mu-metal -> 1 criomodulo SRF. El acido gastado se recupera como niobio y fluorita, y la fluorita vuelve a dar acido fluorhidrico.',
                'Necesita carcasa de sala limpia de 7 x 7 x 9 (8 o mas entre las piezas), 1 o 2 hatches de energia (UV), buses y hatches de entrada y salida.'
            ],
            items: {
                rrr_niobium_sheet: ['Lamina de niobio RRR', 'Niobio de alta relacion de resistividad residual, fundido cinco veces con haz de electrones.', 'Se hace en el Taller de Cavidades SRF (circuito 1).'],
                niobium_scrap: ['Chatarra de niobio', 'Recortes de la lamina. No se pierde nada: un horno electrico la funde de nuevo en un lingote.', 'Se hace en el Taller de Cavidades SRF (circuito 1).'],
                bare_srf_cavity: ['Cavidad desnuda de nueve celdas', 'Nueve celdas embutidas y soldadas con haz de electrones. Aun sin electropulir.', 'Se hace en el Taller de Cavidades SRF (circuito 2).'],
                srf_cavity: ['Cavidad SRF dopada con N', 'Electropulida y dopada con nitrogeno: lleva el campo con un factor de calidad alto.', 'Se hace en el Taller de Cavidades SRF (circuito 3).'],
                mu_metal_shield: ['Blindaje de mu-metal', 'Una carcasa de niquel y hierro que aisla el criomodulo de campos magneticos parasitos.', 'Se hace en un ensamblador con placas de niquel y hierro y lamina de cobre.']
            },
            materials: { electropolish_acid: 'Acido de electropulido', spent_electropolish_acid: 'Acido de electropulido gastado' }
        }
    }

    Object.keys(TEXT).forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            var t = TEXT[lang]
            var add = function (key, value) { event.add('grindless', key, value) }

            add('block.gtceu.superfluid_helium_plant', t.plant)
            add('block.gtceu.srf_cavity_works', t.works)
            add('gtceu.superfluid_helium', t.plantType)
            add('gtceu.srf_cavity', t.worksType)
            for (var i = 0; i < 4; i++) {
                add('grindless.machine.superfluid_helium_plant.tooltip.' + i, t.plantTips[i])
                add('grindless.machine.srf_cavity_works.tooltip.' + i, t.worksTips[i])
            }
            Object.keys(t.items).forEach(function (name) {
                add('item.grindless.' + name, t.items[name][0])
                add('tooltip.grindless.' + name + '.0', t.items[name][1])
                add('tooltip.grindless.' + name + '.1', t.items[name][2])
            })
            Object.keys(t.materials).forEach(function (name) { add('material.gtceu.' + name, t.materials[name]) })
        })
    })
})()
