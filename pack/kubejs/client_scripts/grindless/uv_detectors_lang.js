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
                'High-purity germanium, thirteen nines, for the HPGe crystal. Programmed circuit 1: 1 germanium dust + 4,000 mB chlorine -> 1,000 mB germanium tetrachloride (also the fibre preform\'s dopant).',
                'Circuit 2: 1,000 mB germanium tetrachloride + 2,000 mB water + 4,000 mB hydrogen -> 1 germanium ingot + 4,000 mB hydrochloric acid; the water comes back.',
                'Circuit 3: 4 germanium ingots -> 1 HPGe crystal + 1 germanium dust (the impure ends, back to circuit 1). Eight RF coils sweep the melt zone up the bar, the puller grows the crystal.',
                'Needs a 3 x 13 x 3 clean room casing tower: 8 naquadah coil blocks in the core and a stainless steel gearbox on top; parts in the floor and the back wall (6 or more casings), 1 or 2 energy hatches (UV).'
            ],
            stationTips: [
                'The only reader of the Starshot: it catches the probe\'s laser photons from four light years away and decodes them into Proxima approach data.',
                '1 Starshot probe in flight + 100 mB superfluid helium -> 1 Proxima approach data + 100 mB helium. Needs an SNSPD array in the input bus (not consumed).',
                'The SNSPD array is made in the ZPM qubit fab (circuit 3) from an NbN film wafer. The boiled-off helium goes back to the vacuum freezer.',
                'Needs a 9 x 9 x 9 UV machine casing dome: a 5 x 5 aluminium block mirror on the floor, 3 computer casings behind it, the roof open in the middle; parts in the floor (50 or more casings), 1 or 2 energy hatches (UV).'
            ]
        },
        es_es: {
            tower: 'Torre de Refinado por Zonas', station: 'Estacion Optica Terrestre',
            towerType: 'Refinado por zonas', stationType: 'Enlace optico descendente',
            towerTips: [
                'Germanio de alta pureza, trece nueves, para el cristal de HPGe. Circuito programado 1: 1 polvo de germanio + 4.000 mB de cloro -> 1.000 mB de tetracloruro de germanio (tambien el dopante de la preforma de fibra).',
                'Circuito 2: 1.000 mB de tetracloruro de germanio + 2.000 mB de agua + 4.000 mB de hidrogeno -> 1 lingote de germanio + 4.000 mB de acido clorhidrico; el agua se recupera.',
                'Circuito 3: 4 lingotes de germanio -> 1 cristal de HPGe + 1 polvo de germanio (los extremos impuros, de vuelta al circuito 1). Ocho bobinas de RF barren la zona fundida por la barra y el extractor crece el cristal.',
                'Necesita una torre de carcasa de sala limpia de 3 x 13 x 3: 8 bloques de bobina de naquadah en el nucleo y una caja de engranajes de acero inoxidable arriba; piezas en el suelo y la pared trasera (6 o mas carcasas), 1 o 2 hatches de energia (UV).'
            ],
            stationTips: [
                'El unico lector del Starshot: capta los fotones laser de la sonda a cuatro anos luz y los descodifica en datos de aproximacion a Proxima.',
                '1 sonda Starshot en vuelo + 100 mB de helio superfluido -> 1 datos de aproximacion a Proxima + 100 mB de helio. Necesita una matriz SNSPD en el bus de entrada (no se consume).',
                'La matriz SNSPD se hace en la fabrica de qubits de ZPM (circuito 3) con una oblea con pelicula de NbN. El helio evaporado vuelve al congelador al vacio.',
                'Necesita una cupula de carcasa de maquina UV de 9 x 9 x 9: un espejo de 5 x 5 bloques de aluminio en el suelo, 3 carcasas de ordenador detras, el techo abierto en el centro; piezas en el suelo (50 o mas carcasas), 1 o 2 hatches de energia (UV).'
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
            for (var i = 0; i < 4; i++) {
                add('grindless.machine.zone_refining_tower.tooltip.' + i, t.towerTips[i])
                add('grindless.machine.optical_ground_station.tooltip.' + i, t.stationTips[i])
            }
        })
    })
})()
