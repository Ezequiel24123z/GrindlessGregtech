// priority: 4700
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
            plantTip: '§7Synthesises PBO (Zylon) fibre, the tether\'s strongest polymer.',
            worksTip: '§7Braids the space elevator\'s tether and builds its climber.',
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
        }
    }

    ClientEvents.lang('en_us', function (event) {
        var t = TEXT.en_us
        var add = function (key, value) { event.add('grindless', key, value) }

        add('block.gtceu.pbo_plant', t.plant)
        add('block.gtceu.tether_ribbon_works', t.works)
        add('gtceu.pbo_synthesis', t.plantType)
        add('gtceu.tether_ribbon', t.worksType)
        add('grindless.machine.pbo_plant.tooltip.0', t.plantTip)
        add('grindless.machine.tether_ribbon_works.tooltip.0', t.worksTip)
        // the long text moved to the EMI info pages (keys 0 and 1 are in uhv_info_lang.js)
        for (var i = 0; i < 4; i++) {
            add('emi.grindless.info.pbo_plant.' + (2 + i), t.plantTips[i])
            add('emi.grindless.info.tether_ribbon_works.' + (2 + i), t.worksTips[i])
        }
        Object.keys(t.items).forEach(function (name) {
            add('item.grindless.' + name, t.items[name][0])
            add('tooltip.grindless.' + name + '.0', t.items[name][1])
            add('tooltip.grindless.' + name + '.1', t.items[name][2])
        })
        Object.keys(t.materials).forEach(function (name) { add('material.gtceu.' + name, t.materials[name]) })
    })
})()
