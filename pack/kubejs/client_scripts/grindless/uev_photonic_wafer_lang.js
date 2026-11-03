// Gregtech Grindless - names, tooltips and EMI lines of UEV's monolithic photonic wafer flow (startup_scripts/grindless/uev/photonic_wafer.js;
// package D4-UEV-PHOTON), kept out of pack/kubejs/assets/grindless/lang/*. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['gtceu.recipe.grindless_snspd_fabrication.wsi_on_waveguides', 'Circuit 10: tungsten silicide sputtered over the waveguide circuit'],
        ['gtceu.recipe.grindless_snspd_fabrication.wsi_nanowires_on_waveguides', 'Circuit 11: nanowire detectors written in resist and etched on the waveguides'],
        ['gtceu.recipe.grindless_vdw_assembly.graphene_rings', 'Circuit 4: graphene transferred onto the ring resonators'],
        ['gtceu.recipe.grindless_vdw_assembly.encapsulate_rings', 'Circuit 5: an hBN film encapsulates the graphene rings'],
        ['gtceu.recipe.grindless_vdw_assembly.print_dots', 'Circuit 6: InAs quantum-dot micropillars transfer-printed onto the waveguides'],
        ['gtceu.recipe.grindless_photonic_foundry.wafer_electrodes', 'Circuit 29: Ti/Au contacts and TiN thermal phase shifters in nitrogen'],
        ['gtceu.recipe.grindless_mocvd.silica_cladding', 'Circuit 9: a PECVD silica upper cladding from silane and oxygen; the water is returned'],
        ['gtceu.recipe.grindless_photonic_integration.pigtail_die', 'Circuit 11: a fibre array attached to the diced die']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['wsi_waveguide_wafer', 'WSi Waveguide Wafer', 'Tungsten silicide over the waveguide circuit.', 'Made in the SNSPD foundry (circuit 10).'],
        ['detector_waveguide_wafer', 'Detector Waveguide Wafer', 'Nanowire detectors on the waveguides.', 'Made in the SNSPD foundry (circuit 11).'],
        ['graphene_ring_wafer', 'Graphene Ring Wafer', 'Graphene over the ring resonators.', 'Made in the van der Waals stacker (circuit 4).'],
        ['encapsulated_ring_wafer', 'Encapsulated Ring Wafer', 'The graphene rings under hBN.', 'Made in the van der Waals stacker (circuit 5).'],
        ['electroded_photonic_wafer', 'Electroded Photonic Wafer', 'Contacts and thermal phase shifters in place.', 'Made in the photonic foundry (circuit 29).'],
        ['hybrid_quantum_wafer', 'Hybrid Quantum Wafer', 'Quantum dots printed onto the waveguides.', 'Made in the van der Waals stacker (circuit 6).'],
        ['clad_quantum_wafer', 'Clad Quantum Wafer', 'Buried under a silica upper cladding.', 'Made in the MOCVD reactor (circuit 9); dice it next.'],
        ['quantum_photonic_die', 'Quantum Photonic Die', 'One of four dies cut from a clad wafer.', 'Cut in a cutter; pigtail it in the integration hall.'],
        ['pigtailed_quantum_die', 'Pigtailed Quantum Die', 'A die with its fibre array attached.', 'Made in the photonic integration hall (circuit 11).']
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
