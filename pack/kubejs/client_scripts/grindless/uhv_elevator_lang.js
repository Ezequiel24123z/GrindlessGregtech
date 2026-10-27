// Gregtech Grindless - names and tooltips of UHV's fibres and the space elevator (startup_scripts/grindless/uhv/elevator.js):
//
//   gtceu:pbo_plant / gtceu:tether_ribbon_works   machine names + four tooltip lines each
//   gtceu:pbo_synthesis / gtceu:tether_ribbon     recipe type names
//   grindless:geo_assembled_stage                 name + two tooltip lines
//   gtceu:trichlorobenzene / dinitrotrichlorobenzene / polyphosphoric_acid / chlorodinitroresorcinol / diaminoresorcinol /
//   terephthalic_acid                             material.gtceu.<n>
(function () {
    var TEXT = {
        en_us: {
            plant: 'PBO Plant', works: 'Tether Ribbon Works',
            plantType: 'PBO Synthesis', worksType: 'Tether Ribbon',
            plantTips: [
                'Zylon, the strongest polymer fibre: the tether\'s backbone. Programmed circuit 1: trichlorobenzene + nitration mixture -> dinitrotrichlorobenzene + diluted sulfuric acid. Circuit 2: + sodium hydroxide -> chlorodinitroresorcinol + salt.',
                'Circuit 3: chlorodinitroresorcinol + hydrogen + hydrochloric acid, palladium kept -> diaminoresorcinol + water. Circuit 4: diaminoresorcinol + terephthalic acid + polyphosphoric acid -> PBO dope + hydrochloric acid.',
                'Circuit 5: 1,000 mB PBO dope + 2,000 mB water -> 8 PBO fibre + phosphoric acid, which goes back to polyphosphoric acid. The hydrochloric acid feeds circuit 3, the salt and the acids GTM\'s electrolyser and distillery.',
                'Needs 7 x 5 x 9 chemically inert casing with PTFE pipe casings and a tungstensteel gearbox (8 or more casings among the floor parts), 1 or 2 energy hatches (UHV), input and output buses and hatches.'
            ],
            worksTips: [
                'Braids the space elevator\'s tether and builds the climber that rides it.',
                'Programmed circuit 1: 8 carbon nanotube yarn + 4 BNNT yarn + 4 PBO fibre -> 1 tether ribbon segment.',
                'Circuit 2: 1 InGaAs epi wafer (the laser receiver) + 2 SiC power modules + 2 betavoltaic cells -> 1 tether climber.',
                'Needs 11 x 5 x 5 robust tungstensteel casing with tungstensteel gearboxes and a tungsten steel frame (12 or more casings among the floor parts), 1 or 2 energy hatches (UHV), input and output buses.'
            ],
            items: {
                geo_assembled_stage: ['GEO-Assembled Stage', 'A heavy rocket stage put together at the top of the tether, where it never had to fight its way out of the gravity well.', 'Made by the Space Elevator (GEO lift); the level 8 rocket takes it.']
            },
            materials: {
                trichlorobenzene: 'Trichlorobenzene', dinitrotrichlorobenzene: 'Dinitrotrichlorobenzene', polyphosphoric_acid: 'Polyphosphoric Acid',
                chlorodinitroresorcinol: 'Chlorodinitroresorcinol', diaminoresorcinol: 'Diaminoresorcinol', terephthalic_acid: 'Terephthalic Acid'
            }
        },
        es_es: {
            plant: 'Planta de PBO', works: 'Taller de Cinta de Amarre',
            plantType: 'Sintesis de PBO', worksType: 'Cinta de amarre',
            plantTips: [
                'Zylon, la fibra polimerica mas resistente: la espina del amarre. Circuito programado 1: triclorobenceno + mezcla nitrante -> dinitrotriclorobenceno + acido sulfurico diluido. Circuito 2: + hidroxido de sodio -> clorodinitrorresorcinol + sal.',
                'Circuito 3: clorodinitrorresorcinol + hidrogeno + acido clorhidrico, el paladio se conserva -> diaminorresorcinol + agua. Circuito 4: diaminorresorcinol + acido tereftalico + acido polifosforico -> pasta de PBO + acido clorhidrico.',
                'Circuito 5: 1.000 mB de pasta de PBO + 2.000 mB de agua -> 8 fibras de PBO + acido fosforico, que vuelve a acido polifosforico. El acido clorhidrico alimenta el circuito 3; la sal y los acidos, el electrolizador y la destileria de GTM.',
                'Necesita carcasa quimicamente inerte de 7 x 5 x 9 con carcasas de tuberia de PTFE y una caja de engranajes de acero de tungsteno (8 o mas carcasas entre las piezas del suelo), 1 o 2 hatches de energia (UHV), buses y hatches de entrada y salida.'
            ],
            worksTips: [
                'Trenza el amarre del ascensor espacial y construye el escalador que sube por el.',
                'Circuito programado 1: 8 hilos de nanotubos de carbono + 4 hilos de BNNT + 4 fibras de PBO -> 1 segmento de cinta de amarre.',
                'Circuito 2: 1 oblea epitaxial de InGaAs (el receptor laser) + 2 modulos de potencia de SiC + 2 celdas betavoltaicas -> 1 escalador de amarre.',
                'Necesita carcasa robusta de acero de tungsteno de 11 x 5 x 5 con cajas de engranajes de acero de tungsteno y un marco de acero de tungsteno (12 o mas carcasas entre las piezas del suelo), 1 o 2 hatches de energia (UHV), buses de entrada y salida.'
            ],
            items: {
                geo_assembled_stage: ['Etapa ensamblada en GEO', 'Una etapa de cohete pesada montada en lo alto del amarre, donde nunca tuvo que salir del pozo gravitatorio a empujones.', 'La hace el Ascensor Espacial (elevacion a GEO); la usa el cohete de nivel 8.']
            },
            materials: {
                trichlorobenzene: 'Triclorobenceno', dinitrotrichlorobenzene: 'Dinitrotriclorobenceno', polyphosphoric_acid: 'Acido polifosforico',
                chlorodinitroresorcinol: 'Clorodinitrorresorcinol', diaminoresorcinol: 'Diaminorresorcinol', terephthalic_acid: 'Acido tereftalico'
            }
        }
    }

    Object.keys(TEXT).forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            var t = TEXT[lang]
            var add = function (key, value) { event.add('grindless', key, value) }

            add('block.gtceu.pbo_plant', t.plant)
            add('block.gtceu.tether_ribbon_works', t.works)
            add('gtceu.pbo_synthesis', t.plantType)
            add('gtceu.tether_ribbon', t.worksType)
            for (var i = 0; i < 4; i++) {
                add('grindless.machine.pbo_plant.tooltip.' + i, t.plantTips[i])
                add('grindless.machine.tether_ribbon_works.tooltip.' + i, t.worksTips[i])
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
