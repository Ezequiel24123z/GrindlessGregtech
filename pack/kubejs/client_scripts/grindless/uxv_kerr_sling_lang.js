// priority: 1553
// Gregtech Grindless - names of UXV-B1, the Kerr sling (server_scripts/grindless/uxv/kerr_sling.js, startup_scripts/grindless/uxv/travel.js and
// data/grindless/gcyr/planets/{vela_pulsar_orbit,cas_a_remnant}.json):
//
//   level.grindless.<planet>                 GCYR's planet names (each planet file's "translation")
//   dimension.grindless.<world>              the two new dimensions
//   planet.grindless.<key>                   the planet names of the quantum bridge messages
//   gtceu.recipe.grindless_warp_gate.<name>  EMI lines of the c8 and c9 warp gate rows appended to tables/gate.json
//   gtceu.recipe.grindless_ergosphere_probing.<n>  EMI line of the probe bay's c5 row
//   emi.grindless.info.uxv_kerr_sling.<n>    the info pages of the two jump items, each naming its place
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    var PLACES = [
        ['vela_pulsar_orbit', 'vela_pulsar', 'Vela Pulsar'],
        ['cas_a_remnant', 'cas_a', 'Cassiopeia A']
    ]
    var GATE = [
        ['hold_vela_pulsar', 'Jump to the Vela Pulsar: a launched relay seed and an FRC cartridge'],
        ['hold_cas_a', 'Jump to Cassiopeia A: a launched relay seed and a Whipple shield']
    ]
    var INFO = [
        ['vela', 'Spent at the warp gate (circuit 8) with a launched relay seed to jump from Cygnus X-1 to the Vela Pulsar. A relay platform forms there. The cartridge is formed from filtered disk plasma at Cygnus X-1.'],
        ['cas_a', 'Spent at the warp gate (circuit 9) with a launched relay seed to jump from Cygnus X-1 to Cassiopeia A, where the expanding shell throws dust and fragments at the ring. A relay platform forms there. Assembled at home on a Whipple shield casing with a RHEA plate and a CNT bumper weave.']
    ]
    var ROWS = [
        ['ergosphere_probing', 'relay_seed', 'Probe bay: launch a relay seed from the ergosphere on a tungsten steel block']
    ]

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        PLACES.forEach(function (p) {
            var n = p[2]
            add('level.grindless.' + p[0], n)
            add('dimension.grindless.' + p[0], n + ' Orbit')
            add('planet.grindless.' + p[1], n)
        })
        GATE.forEach(function (g) { add('gtceu.recipe.grindless_warp_gate.' + g[0], g[1]) })
        ROWS.forEach(function (r) { add('gtceu.recipe.grindless_' + r[0] + '.' + r[1], r[2]) })
        INFO.forEach(function (i) { add('emi.grindless.info.uxv_kerr_sling.' + i[0], i[1]) })
    })
})()
