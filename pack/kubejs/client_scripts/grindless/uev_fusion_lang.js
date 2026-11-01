// priority: 5038
// Gregtech Grindless - names and tooltips of UEV's helium-3 polariser, Mk4 fusion ring and fusion materials (startup_scripts/grindless/uev/fusion.js; package UEV-A7):
//
//   block.gtceu.<machine>, gtceu.<recipe type>      machine and recipe type names
//   grindless.machine.<machine>.tooltip.N           controller tooltips
//   item.grindless.<n>, tooltip.grindless.<n>.0/.1  the package's own items
//   material.gtceu.<n>                              the package's gases (6N helium-3, polarised helium-3, helium-4 ash, three plasmas, BF3)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.helium3_polariser', 'Helium-3 Polariser'],
        ['block.gtceu.uev_fusion_reactor', 'Mk4 Fusion Reactor'],
        ['gtceu.spin_polarisation', 'Spin Polarisation'],
        ['grindless.machine.helium3_polariser.tooltip.0', '§7Aligns helium-3 nuclear spins by optical pumping.'],
        ['grindless.machine.uev_fusion_reactor.tooltip.0', '§7A tier 10 fusion ring running D-He-3, p-11B and polarised fuel.'],
        ['material.gtceu.helium_3_6n', '6N Helium-3'],
        ['material.gtceu.polarised_helium_3', 'Polarised Helium-3'],
        ['material.gtceu.helium_4_ash', 'Helium-4 Ash'],
        ['material.gtceu.uev_dhe3_plasma', 'D-He-3 Plasma'],
        ['material.gtceu.uev_pb11_plasma', 'p-11B Plasma'],
        ['material.gtceu.uev_polarised_plasma', 'Polarised D-He-3 Plasma'],
        ['material.gtceu.boron_trifluoride', 'Boron Trifluoride']
    ]

    // [name, display name, tooltip 0, tooltip 1]
    var ITEMS = [
        ['boron_11_powder', 'Boron-11 Powder', 'Boron enriched in its 11 isotope.', 'Mixed with hydrogen into p-11B fuel.'],
        ['laser_1083nm', '1,083 nm Laser', 'A Yb fibre laser tuned to the helium metastable line.', 'A tool of the helium-3 polariser: never consumed.']
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
