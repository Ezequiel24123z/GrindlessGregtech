// priority: 4500
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
                    tip: '§7Digs Mercury regolith with counter-rotating bucket drums.',
                    site: 'Works on Mercury only.',
                    tips: [
                        'Two counter-rotating bucket drums dig with no net reaction force, so Mercury\'s low gravity cannot lift the machine. Mercury only.',
                        '1 excavator bucket drum (worn about 1 run in 32) + an iridosmine vein sample from Mercury (never used up) -> 64 Mercury regolith.',
                        'The only source of Mercury regolith, for the Solar Vapour Furnace.',
                        'Needs a 9 x 8 x 17 bucket-wheel excavator: Hermean heat-shield brick crawler tracks and chassis, a tungsten steel gearbox bucket wheel on a frame boom with a pipe conveyor, a cab and a heatproof counterweight, 1 or 2 energy hatches, an input bus and an output bus.'
                    ]
                },
                solar_vapour_furnace: {
                    name: 'Solar Vapour Furnace',
                    type: 'Solar Vaporisation',
                    tip: '§7Boils Mercury regolith\'s oxides off with focused sunlight.',
                    site: 'Works on Mercury\'s day side only.',
                    tips: [
                        'Heliostats focus Mercury\'s sunlight on a vacuum chamber and boil the regolith\'s oxides off in order. Mercury\'s day side only: the recipes wait for daylight.',
                        'Circuit 1 (1,400 K): 16 Mercury regolith -> sodium-potassium + sulfur + 12 stripped regolith. Circuit 2 (2,300 K): 12 stripped regolith -> magnesium + silicon monoxide + iron + 4 alumina-calcia residue + graphite.',
                        'Both wear the regolith crucible lining (about 1 run in 16). Circuit 3: 4 alumina-calcia residue -> 1 lining. The first lining comes from the blast furnace (sapphire + quicklime).',
                        'Needs a 15 x 11 x 21 furnace: a bed of 49 heliostat mirrors on tungsten steel frames, a brick shield, a 9 x 5 x 5 Hermean heat-shield brick chamber under a tungsten steel firebox receiver and tower with a heatproof crucible inside, night-sky radiator condenser plates on its flanks, 1 or 2 energy hatches, input and output buses and 1 output hatch.'
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
        }
    }

    ClientEvents.lang('en_us', function (event) {
        var t = TEXT.en_us
        var add = function (key, value) { event.add('grindless', key, value) }

        Object.keys(t.machines).forEach(function (name) {
            var m = t.machines[name]
            add('block.gtceu.' + name, m.name)
            add('grindless.machine.' + name + '.tooltip.0', m.tip)
            add('grindless.machine.' + name + '.tooltip.1', m.site)
            for (var i = 0; i < 4; i++) add('emi.grindless.info.' + name + '.' + (2 + i), m.tips[i])
        })
        add('gtceu.regolith_excavation', t.machines.regolith_excavator.type)
        add('gtceu.solar_vaporisation', t.machines.solar_vapour_furnace.type)
        Object.keys(t.items).forEach(function (name) {
            add('item.grindless.' + name, t.items[name][0])
            add('tooltip.grindless.' + name + '.0', t.items[name][1])
            add('tooltip.grindless.' + name + '.1', t.items[name][2])
        })
    })
})()
