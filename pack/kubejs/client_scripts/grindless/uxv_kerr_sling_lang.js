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
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    var PLACES = [
        ['vela_pulsar_orbit', 'vela_pulsar', 'Vela Pulsar', 'Púlsar de Vela'],
        ['cas_a_remnant', 'cas_a', 'Cassiopeia A', 'Casiopea A']
    ]
    var GATE = [
        ['hold_vela_pulsar', 'Jump to the Vela Pulsar: a launched relay seed and an FRC cartridge', 'Salto al púlsar de Vela: una semilla de relé lanzada y un cartucho FRC'],
        ['hold_cas_a', 'Jump to Cassiopeia A: a launched relay seed and a Whipple shield', 'Salto a Casiopea A: una semilla de relé lanzada y un escudo Whipple']
    ]
    var INFO = [
        ['vela', 'Spent at the warp gate (circuit 8) with a launched relay seed to jump from Cygnus X-1 to the Vela Pulsar. A relay platform forms there. The cartridge is formed from filtered disk plasma at Cygnus X-1.',
            'Se gasta en la puerta de salto (circuito 8) con una semilla de relé lanzada para saltar de Cygnus X-1 al púlsar de Vela. Allí se forma una plataforma de relé. El cartucho se forma con plasma de disco filtrado en Cygnus X-1.'],
        ['cas_a', 'Spent at the warp gate (circuit 9) with a launched relay seed to jump from Cygnus X-1 to Cassiopeia A, where the expanding shell throws dust and fragments at the ring. A relay platform forms there. Assembled at home on a Whipple shield casing with a RHEA plate and a CNT bumper weave.',
            'Se gasta en la puerta de salto (circuito 9) con una semilla de relé lanzada para saltar de Cygnus X-1 a Casiopea A, donde la envoltura en expansión lanza polvo y fragmentos contra el anillo. Allí se forma una plataforma de relé. Se ensambla en casa sobre una carcasa de escudo Whipple con una placa de RHEA y un tejido paragolpes de CNT.']
    ]
    var ROWS = [
        ['ergosphere_probing', 'relay_seed', 'Probe bay: launch a relay seed from the ergosphere on a tungsten steel block', 'Bahía de sondas: lanzar una semilla de relé desde la ergosfera sobre un bloque de acero de tungsteno']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            var add = function (key, value) { event.add('grindless', key, value) }
            PLACES.forEach(function (p) {
                var n = p[2 + li]
                add('level.grindless.' + p[0], n)
                add('dimension.grindless.' + p[0], li === 0 ? n + ' Orbit' : 'Órbita de ' + n)
                add('planet.grindless.' + p[1], n)
            })
            GATE.forEach(function (g) { add('gtceu.recipe.grindless_warp_gate.' + g[0], g[1 + li]) })
            ROWS.forEach(function (r) { add('gtceu.recipe.grindless_' + r[0] + '.' + r[1], r[2 + li]) })
            INFO.forEach(function (i) { add('emi.grindless.info.uxv_kerr_sling.' + i[0], i[1 + li]) })
        })
    })
})()
