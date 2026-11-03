// priority: 3900
// Gregtech Grindless - names and tooltips of UHV's Dyson swarm (startup_scripts/grindless/uhv/swarm.js):
//
//   gtceu:swarm_segment_foundry, gtceu:swarm_control_station, gtceu:solar_probe_bay   machine names + four tooltip lines each
//   gtceu:swarm_segment, gtceu:dyson_swarm, gtceu:solar_probe                         recipe type names
//   grindless:<item>                                                                   name + two tooltip lines
// F1's items (swarm segment, worn swarm segment, coronal field map, aluminium reflector film) are named in uhv_foundation_lang.js.
(function () {
    var TYPES = { swarm_segment_foundry: 'swarm_segment', swarm_control_station: 'dyson_swarm', solar_probe_bay: 'solar_probe' }
    var TEXT = {
        en_us: {
            site: 'Works in Mercury orbit only.',
            machines: {
                swarm_segment_foundry: {
                    name: 'Swarm Segment Foundry',
                    type: 'Swarm Segment Assembly',
                    tip: '§7Builds the Dyson swarm\'s solar collector segments.',
                    tips: [
                        'An assembly gantry over a station truss deck that builds the Dyson swarm\'s solar collectors. Mercury\'s orbit only.',
                        'Circuit 1: 4 aluminium reflector film + 2 IMM solar arrays + a fibre laser module + a C-12 diamond spreader + a SiC power module + 2 betavoltaic cells + a sodium-potassium heat pipe -> 1 swarm segment.',
                        'Circuit 2: a worn swarm segment + 1 reflector film + 1 IMM solar array -> 1 swarm segment + small aluminium dust (the stripped film).',
                        'Needs a 15 x 8 x 23 hangar: a station truss floor with a pipe jig rail, hangar casing walls with laminated glass windows, a tungsten steel frame roof carrying an assembly line grating bridge and an assembly line unit head, 1 or 2 energy hatches, input buses and output buses.'
                    ]
                },
                swarm_control_station: {
                    name: 'Swarm Control Station',
                    type: 'Dyson Swarm',
                    tip: '§7Steers solar swarm segments and takes their power by laser.',
                    tips: [
                        'Steers swarm segments round the Sun and takes their power by laser: a generator. Mercury\'s orbit only. One run at a time; parallel hatches do nothing.',
                        'Circuit 1: 16 swarm segments + 1 oganesson propellant pod (or 1,000 mB krypton, half the run) -> 2,097,152 EU/t; 1 segment wears out and the empty tank returns.',
                        'Circuit 2: 64 swarm segments + a coronal field map (never used up) + 4 pods -> 8,388,608 EU/t; 4 segments wear out. Worn segments go back to the Swarm Segment Foundry.',
                        'Needs a 41 x 7 x 41 hub and four booms: a pressure hull hub with a computer casing column under a sapphire laser receiver roof and a Hermean brick sunshade, laser module heads on the booms, propellant depot rings, 1 to 4 dynamo hatches (a 4 A UHV dynamo carries circuit 2), input buses, an input hatch and output buses.'
                    ]
                },
                solar_probe_bay: {
                    name: 'Solar Probe Bay',
                    type: 'Solar Probe',
                    tip: '§7Builds heat-shielded probes and launches them into the corona.',
                    tips: [
                        'Builds heat-shielded probes and launches them into the Sun\'s corona. Mercury\'s orbit only.',
                        'Circuit 2: a carbon-carbon aeroshell + 4 UHTC tiles + a SiC power module + 2 betavoltaic cells + an HPGe crystal + a UV sensor -> 1 solar probe.',
                        'Circuit 1: 1 solar probe + the heliopause data (never used up) -> 1 coronal field map. The probe burns up: nothing returns.',
                        'Needs a 7 x 5 x 7 station truss deck with tungsten steel frame posts, a tungsten steel pipe casing launch rail, a truss top ring, 1 or 2 energy hatches, input buses and an output bus.'
                    ]
                }
            },
            items: {
                sodium_potassium_heat_pipe: ['Sodium-Potassium Heat Pipe', 'A tungsten steel pipe with a molybdenum wick and NaK inside: it carries a segment\'s waste heat to its radiators.', 'Made in the assembler; used by the Swarm Segment Foundry.'],
                solar_probe: ['Solar Probe', 'A heat-shielded magnetometer probe that dives through the Sun\'s corona.', 'Made in the Solar Probe Bay (circuit 2); flown by it (circuit 1).']
            }
        }
    }

    ClientEvents.lang('en_us', function (event) {
        var t = TEXT.en_us
        var add = function (key, value) { event.add('grindless', key, value) }

        Object.keys(t.machines).forEach(function (name) {
            var m = t.machines[name]
            add('block.gtceu.' + name, m.name)
            for (var i = 0; i < 4; i++) add('emi.grindless.info.' + name + '.' + (2 + i), m.tips[i])
            add('grindless.machine.' + name + '.tooltip.0', m.tip)
            add('grindless.machine.' + name + '.tooltip.1', t.site)
            add('gtceu.' + TYPES[name], m.type)
        })
        Object.keys(t.items).forEach(function (name) {
            add('item.grindless.' + name, t.items[name][0])
            add('tooltip.grindless.' + name + '.0', t.items[name][1])
            add('tooltip.grindless.' + name + '.1', t.items[name][2])
        })
    })
})()
