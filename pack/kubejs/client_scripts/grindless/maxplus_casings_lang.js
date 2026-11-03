// priority: 6858
// Names, tooltips and EMI pages of the MAX+ casing family and the iron-56 material (D5-CAS-MAXP); the recipes are in server_scripts/grindless/maxplus/casings.js.
(function () {
    // id, name, tooltip 0, tooltip 1, EMI text
    var BLOCKS = [
        ['bound_lattice_casing', 'Bound Lattice Casing', 'A near-black hexagonal lattice with condensate-blue lines.', 'The structure of the horizon machines.',
            'A bound degenerate billet, two Kerr strand wires and two tensegrity truss casings make four casings in an assembler at 2^30.9 EU/t. The billet is the lattice, the truss the frame.'],
        ['kerr_coil_casing', 'Kerr Coil Casing', 'Helical pale-gold bands round a dark core.', 'A passive coil: it never lights.',
            'A Kerr field coil and a bound lattice casing make two casings in an assembler at 2^30.9 EU/t.'],
        ['fe56_shield_casing', 'Fe-56 Shield Casing', 'Cold grey slabs of iron-56 with a violet seam.', 'Iron-56 is the most tightly bound nucleus: it cannot fission or fuse.',
            'Six iron-56 plates, two lithium-6 dusts and a tungsten plate make four casings in an assembler at 2^30.9 EU/t. The iron-56 comes from spent Fe-56 casks opened in a hot cell.'],
        ['primordial_cryostat_casing', 'Primordial Cryostat Casing', 'Frosted pale-blue panels over an iron-56 shell.', 'Holds helium-3 liquid at the Stream\'s cold.',
            'Two iron-56 plates, a He-4 dewar, pristine helium-3 and an NEG XHV casing make two casings in an assembler at 2^30.9 EU/t.'],
        ['void_diamond_window', 'Void Diamond Window', 'A clear lilac-white pane in a steel frame.', 'Void-grown diamond: no flaws, no absorption.',
            'Two void-grown diamonds and an iron-56 plate make two windows in an assembler at 2^30.9 EU/t.'],
        ['horizon_gate_casing', 'Horizon Gate Casing', 'A dark plate with gold-white chevron arcs and a violet edge.', 'The frame of every horizon gate.',
            'Four iron-56 plates, a void-grown diamond, a MAX field coil and pristine helium-3 make two casings in an assembly line at 2^30.9 EU/t. The research is the MAX field coil.']
    ]

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        BLOCKS.forEach(function (e) {
            add('block.grindless.' + e[0], e[1])
            add('tooltip.grindless.' + e[0] + '.0', e[2])
            add('tooltip.grindless.' + e[0] + '.1', e[3])
            add('emi.grindless.info.' + e[0] + '.0', e[4])
        })
        add('material.gtceu.iron_56', 'Iron-56')
    })
})()
