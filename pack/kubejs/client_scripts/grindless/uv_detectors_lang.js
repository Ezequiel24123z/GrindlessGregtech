// priority: 2869
// Gregtech Grindless - names and tooltips of UV's detectors (startup_scripts/grindless/uv/detectors.js):
//
//   gtceu:zone_refining_tower / gtceu:optical_ground_station   machine names + four tooltip lines each
//   gtceu:zone_refining / gtceu:optical_downlink                recipe type names
// The items they make and read (HPGe crystal, SNSPD array, Starshot probe, Proxima approach data) are named by F1's lang file.
(function () {
    var TEXT = {
        en_us: {
            tower: 'Zone Refining Tower', station: 'Optical Ground Station',
            towerType: 'Zone Refining', stationType: 'Optical Downlink',
            towerTips: [
                '§7Refines germanium to thirteen nines for the HPGe crystal.'
            ],
            stationTips: [
                '§7Decodes the Starshot probe\'s laser into Proxima data.'
            ]
        },
        es_es: {
            tower: 'Torre de Refinado por Zonas', station: 'Estacion Optica Terrestre',
            towerType: 'Refinado por zonas', stationType: 'Enlace optico descendente',
            towerTips: [
                '§7Refina germanio a trece nueves para el cristal HPGe.'
            ],
            stationTips: [
                '§7Decodifica el láser de la sonda Starshot en datos de Próxima.'
            ]
        }
    }

    Object.keys(TEXT).forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            var t = TEXT[lang]
            var add = function (key, value) { event.add('grindless', key, value) }

            add('block.gtceu.zone_refining_tower', t.tower)
            add('block.gtceu.optical_ground_station', t.station)
            add('gtceu.zone_refining', t.towerType)
            add('gtceu.optical_downlink', t.stationType)
            for (var i = 0; i < 1; i++) {
                add('grindless.machine.zone_refining_tower.tooltip.' + i, t.towerTips[i])
                add('grindless.machine.optical_ground_station.tooltip.' + i, t.stationTips[i])
            }
        })
    })
})()
