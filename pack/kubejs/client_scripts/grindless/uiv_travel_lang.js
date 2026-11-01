// priority: 2963
// Gregtech Grindless - names of UIV travel (startup_scripts/grindless/uiv/travel.js, server_scripts/grindless/uiv/travel.js and
// data/grindless/gcyr/planets/{rx_j1856_orbit,psr_j0437_orbit,cygnus_x1_orbit}.json):
//
//   item.grindless.<n> + tooltip.grindless.<n>.0/.1   the three items
//   level.grindless.<planet>                           GCYR's planet names (each planet file's "translation")
//   dimension.grindless.<world>                        the three new dimensions
//   planet.grindless.<key>                             the planet names of the quantum bridge messages (planets.json keys)
//   gtceu.recipe.grindless_warp_gate.<name>            EMI lines of the three warp gate rows appended to tables/gate.json
//   emi.grindless.info.uiv_travel.<n>                  EMI info of the items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // id, [en name, en tip 0, en tip 1], [es name, es tip 0, es tip 1]
    var ITEMS = [
        ['relay_seed',
            ['Relay Seed', 'A starchip with a sealed degenerate pellet and an exotic-matter cell.', 'Launched from the Moon, then bent along the pulsar chart by the warp gate.']],
        ['launched_relay_seed',
            ['Launched Relay Seed', 'A relay seed at about 0.2 c, still tied to its laser.', 'The warp gate at Sirius B throws it along the pulsar navigation chart.']],
        ['ergosphere_probe',
            ['Ergosphere Probe', 'A radiation-hardened starchip built to skim a rotating black hole.', 'Carried to Cygnus X-1 by a later jump.']]
    ]
    var PLACES = [
        ['rx_j1856_orbit', 'rx_j1856', 'RX J1856.5-3754'],
        ['psr_j0437_orbit', 'psr_j0437', 'PSR J0437-4715'],
        ['cygnus_x1_orbit', 'cygnus_x1', 'Cygnus X-1']
    ]
    var GATE = [
        ['hold_rx_j1856', 'Jump to RX J1856: a launched relay seed bent along the chart'],
        ['hold_psr_j0437', 'Jump to PSR J0437: a launched relay seed bent along the chart'],
        ['hold_cygnus_x1', 'Jump to Cygnus X-1: a seed, the navigation solution and a neutronium pellet']
    ]
    var INFO = [
        ['0', 'UV\'s starchip fab makes the relay seed (circuit 3) and the ergosphere probe (circuit 4). The laser sail launcher on the Moon throws a seed at about 0.2 c (circuit 2). At the Sirius B relay the warp gate bends it along UEV\'s pulsar chart: circuit 4 to RX J1856, 5 to PSR J0437, 6 to Cygnus X-1. A relay platform with a far ring, a wireless hatch pair and an AE2 seed forms where it lands.']
    ]

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        ITEMS.forEach(function (e) {
            var t = e[1]
            add('item.grindless.' + e[0], t[0])
            add('tooltip.grindless.' + e[0] + '.0', t[1])
            add('tooltip.grindless.' + e[0] + '.1', t[2])
        })
        PLACES.forEach(function (p) {
            var n = p[2]
            add('level.grindless.' + p[0], n)
            add('dimension.grindless.' + p[0], n + ' Orbit')
            add('planet.grindless.' + p[1], n)
        })
        GATE.forEach(function (g) { add('gtceu.recipe.grindless_warp_gate.' + g[0], g[1]) })
        INFO.forEach(function (i) { add('emi.grindless.info.uiv_travel.' + i[0], i[1]) })
    })
})()
