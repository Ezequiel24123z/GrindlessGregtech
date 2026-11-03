// priority: 6858
// Names, tooltips and EMI pages of the MAX casing family (D5-CAS-MAX); the recipes are in server_scripts/grindless/max/casings.js (and flux_clamp.js for the clamp).
(function () {
    // id, name, tooltip 0, tooltip 1, EMI text
    var BLOCKS = [
        ['tensegrity_truss_casing', 'Tensegrity Truss Casing', 'Graphite struts braced in an X, held by horizon strand tendons.', 'Structure of every MAX multiblock.',
            'Two exotic composite rods, four horizon strand wires and two chain lamina casings make four casings in an assembler at 2^30.9 EU/t. The strand is the tendon, the rods the struts.'],
        ['membrane_vacuum_casing', 'Membrane Vacuum Casing', 'A superconducting liner under a gold-violet grid, flanged and bolted.', 'Keeps the vacuum and screens stray fields.',
            'A superconducting membrane, two NEG XHV casings and a tensegrity truss casing make two casings in an assembler at 2^30.9 EU/t. The membrane screens stray magnetic fields.'],
        ['droplet_radiator_casing', 'Droplet Radiator Casing', 'Sn-Li droplet sheets falling past collector slots.', 'Rejects heat where fins would weigh too much.',
            'Two shell droplet radiators and a tensegrity truss casing make two casings in an assembler at 2^30.9 EU/t. The radiators are made at Sagittarius A*, so only machines there use this casing.'],
        ['shell_window_coil_casing', 'Shell Window Coil Casing', 'Concentric windings of white-gold strand round a dark core.', 'A passive coil that keeps the trapped mode off the ports.',
            'A MAX field coil, a superconducting membrane, two horizon strand wires and a tensegrity truss casing make two casings in an assembler at 2^30.9 EU/t. It is passive: it never lights.']
    ]

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        BLOCKS.forEach(function (e) {
            add('block.grindless.' + e[0], e[1])
            add('tooltip.grindless.' + e[0] + '.0', e[2])
            add('tooltip.grindless.' + e[0] + '.1', e[3])
            add('emi.grindless.info.' + e[0] + '.0', e[4])
        })
    })
})()
