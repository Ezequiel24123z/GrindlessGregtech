// priority: 1511
// Gregtech Grindless - names and tooltips of UXV's MTJ sputter cluster and oxide PLD chamber (startup_scripts/grindless/uxv/spin_deposition.js; package UXV-A4):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each sputter and PLD recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.mtj_sputter_cluster', 'Spintronic Cluster Tool'],
        ['gtceu.mtj_sputtering', 'MTJ Sputtering'],
        ['gtceu.pulsed_laser_deposition', 'Pulsed Laser Deposition'],

        ['grindless.machine.mtj_sputter_cluster.tooltip.0',
            '\u00a77Sputters MTJ and SAF stacks, deposits oxide films, patterns racetracks.'],

        ['emi.grindless.info.mtj_sputter_cluster.0',
            'A central vacuum wafer handler feeds eight radial chambers: magnetron guns, a KrF pulsed-laser deposition chamber with its beam line, the racetrack e-beam bay, etch, anneal and the load locks. It needs two UIV energy hatches and a 6N helium-cooled controller.'],
        ['emi.grindless.info.mtj_sputter_cluster.1',
            'Nothing is wasted: the spent CoFeB target goes to the powder-bed re-press, the Heusler and ruthenium overspray comes out as powder, the argon is recovered, and the volatile RuO4 and bismuth-rich BFO fume of the laser chamber are collected, never vented. The KrF excimer laser is built on an assembly line and kept in the tool, not consumed.'],
        ['gtceu.recipe.grindless_mtj_sputtering.mtj_stack',
            'Circuit 1: CoFeB, MgO, a Ta seed and ruthenium are sputtered on an H-terminated Si-28 wafer; the CoFeB target comes out spent.'],
        ['gtceu.recipe.grindless_mtj_sputtering.mram_stack',
            'Circuit 2: a Heusler layer and an MgO barrier make the MRAM stack; the Heusler overspray returns as powder.'],
        ['gtceu.recipe.grindless_mtj_sputtering.saf_track',
            'Circuit 3: the synthetic antiferromagnet target set is sputtered into a racetrack stack; the ruthenium overspray returns as powder.'],
        ['gtceu.recipe.grindless_mtj_sputtering.stno_stack',
            'Circuit 4: a Heusler free layer, an MgO barrier and a Ta seed make the spin-torque oscillator stack.'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.srruo3_electrode',
            'Circuit 1: the KrF laser ablates a SrRuO3 target onto a DyScO3 substrate in oxygen; the volatile RuO4 is collected.'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.bfo_film',
            'Circuit 2: a La-doped BiFeO3 film grows on the electrode; the bismuth-rich plume condenses as BFO fume.'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.me_switch',
            'Circuit 3: a CoFe layer on the multiferroic film makes the magnetoelectric switch; the target offcut is cobalt dust.']
    ]

    // [name, en, tooltip 0 en, tooltip 1 en]
    var ITEMS = [
        ['cofe_target', 'CoFe Target', 'Cobalt and iron plate on a copper backing, indium-bonded.', 'Sputtered onto the multiferroic film in the PLD chamber (circuit 3).'],
        ['bfo_film_wafer', 'BiFeO3 Film Wafer', 'A multiferroic film on an oxide electrode.', 'Gets its CoFe layer in the PLD chamber (circuit 3).'],
        ['krf_discharge_tube_blank', 'KrF Discharge Tube Blank', 'Two VUV CaF2 windows and cupronickel electrodes in a tungsten steel body.', 'Filled and conditioned in a chemical reactor.'],
        ['krf_discharge_tube', 'KrF Discharge Tube', 'Filled with krypton and fluorine and conditioned by a test discharge.', 'The heart of the KrF excimer laser.'],
        ['pulsed_power_head', 'Pulsed Power Head', 'Capacitor banks and a field generator that switch nanosecond pulses.', 'Drives the discharge tube of the KrF excimer laser.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[3]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
