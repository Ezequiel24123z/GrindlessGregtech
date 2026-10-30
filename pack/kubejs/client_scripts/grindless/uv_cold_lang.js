// priority: 2890
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
                '§7Cools helium below its lambda point to 1.9 K.'
            ],
            worksTips: [
                '§7Makes SRF cryomodules, the heart of every UV accelerator.'
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
                '§7Enfría helio por debajo de su punto lambda, a 1,9 K.'
            ],
            worksTips: [
                '§7Fabrica criomódulos SRF, el núcleo de todo acelerador UV.'
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
            for (var i = 0; i < 1; i++) {
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
