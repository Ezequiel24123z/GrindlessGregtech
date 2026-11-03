// priority: 5842
// Names, tooltips and EMI pages of the OpV casing family (D5-CAS-OPV); the recipes are in server_scripts/grindless/opv/casings.js.
(function () {
    // id, name, tooltip 0, tooltip 1, EMI text
    var BLOCKS = [
        ['chain_lamina_casing', 'Chain Lamina Casing', 'Layers of chain lamina tied by chain strand wire.', 'Body of the bulge-era multiblocks.',
            'Four chain lamina stacks, eight chain strand wires, two neutronium plates and a neutronium frame make four casings in an assembler at 2^28 EU/t. The lamina and the strand come from the OpV chain lines.'],
        ['tpv_wall_casing', 'TPV Wall Casing', 'Ceramic cells tiled with copper and thermophotovoltaic panels.', 'Lines the walls that catch heat.',
            'Two TPV panels, a gamma absorber tile, two copper plates and a chain lamina stack make four casings in an assembler at 2^28 EU/t. The panels and the tile are made only at home.'],
        ['kugelblitz_cavity_casing', 'Kugelblitz Cavity Casing', 'Facets of tungsten carbide and silicon carbide rings round a field-frozen core.', 'Holds a kugelblitz without touching it.',
            'A gamma multilayer mirror, two field-frozen plates, an annihilation shield casing and four chain strand wires make two casings in an assembly line at OpV, behind station research on the mirror.']
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
