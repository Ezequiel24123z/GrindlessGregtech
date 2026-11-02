// priority: 4954
// Gregtech Grindless - names and tooltips of UEV's SNSPD foundry, van der Waals stacker and photonic integration hall (startup_scripts/grindless/uev/photonics.js; package UEV-A6):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.snspd_foundry', 'SNSPD Foundry'],
        ['gtceu.snspd_fabrication', 'SNSPD Fabrication'],
        ['block.gtceu.vdw_stacker', 'Van der Waals Stacker'],
        ['gtceu.vdw_assembly', 'Van der Waals Assembly'],
        ['block.gtceu.photonic_integration_hall', 'Photonic Integration Hall'],
        ['gtceu.photonic_integration', 'Photonic Integration'],

        ['grindless.machine.snspd_foundry.tooltip.0',
            '§7Patterns tungsten silicide nanowires into SNSPD detectors.'],

        ['grindless.machine.vdw_stacker.tooltip.0',
            '§7Stacks two-dimensional crystals with a clean transfer arm.'],

        ['grindless.machine.photonic_integration_hall.tooltip.0',
            '§7Bonds waveguides, sources and detectors into an optical computer.'],

        ['gtceu.recipe.grindless_snspd_fabrication.wsi_film', 'Circuit 1: sputter a tungsten silicide film on an FZ wafer'],
        ['gtceu.recipe.grindless_snspd_fabrication.nanowire_write', 'Circuit 2: write the nanowire meander in resist'],
        ['gtceu.recipe.grindless_snspd_fabrication.waveguide_mount', 'Circuit 3: etch the wires and mount them on a SiN waveguide chip'],
        ['gtceu.recipe.grindless_snspd_fabrication.cool_and_package', 'Circuit 4: cool in superfluid helium, bond the contacts: an SNSPD'],
        ['gtceu.recipe.grindless_vdw_assembly.hbn_emitter_chip', 'Circuit 1: two annealed hBN films and an electrode'],
        ['gtceu.recipe.grindless_vdw_assembly.graphene_modulator', 'Circuit 2: electrodes on hBN-encapsulated graphene'],
        ['gtceu.recipe.grindless_vdw_assembly.encapsulate_graphene', 'Circuit 3: graphene between two hBN films'],
        ['gtceu.recipe.grindless_photonic_integration.waveguide_circuit', 'Circuit 1: a SiN waveguide chip bonded to an LNOI wafer'],
        ['gtceu.recipe.grindless_photonic_integration.quantum_photonic_chip', 'Circuit 2: source, detectors, modulator and emitter on the circuit'],
        ['gtceu.recipe.grindless_photonic_integration.optical_computer', 'Circuit 3: the optical computer, the only recipe for it'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.inas_quantum_dots', 'Circuit 3: InAs quantum dots on GaAs; the arsine is used up, hydrogen is returned'],
        ['gtceu.recipe.grindless_photonic_foundry.sin_waveguide_anneal', 'Circuit 7: anneal the etched SiN waveguides under argon'],
        ['gtceu.recipe.grindless_synchrotron.sin_waveguide_lithography', 'Circuit 6: X-ray lithography of SiN waveguides through the mask']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['fz_silicon_boule', 'FZ Silicon Boule', 'Float-zone silicon: no crucible, so no oxygen.', 'Made in the zone refining tower (circuit 4).'],
        ['fz_silicon_wafer', 'FZ Silicon Wafer', 'A float-zone silicon wafer.', 'Cut from a boule in a cutter; feeds the SNSPD, SiN and SDD lines.'],
        ['oxidised_wafer', 'Oxidised Wafer', 'A wafer with a thermal oxide skin.', 'Grown in a blast furnace under oxygen.'],
        ['sdd_implanted_wafer', 'Drift-Ring Wafer', 'Boron drift rings implanted in the oxide.', 'Made in the ion implanter (circuit 5); anneal it next.'],
        ['sdd_annealed_wafer', 'Annealed Drift Wafer', 'Implant damage healed.', 'Next: contacts in an assembler.'],
        ['sin_coated_wafer', 'SiN-Coated Wafer', 'A wafer under a low-stress silicon nitride film.', 'LPCVD from silane and ammonia; the hydrogen is kept.'],
        ['sin_lithographed_wafer', 'Lithographed SiN Wafer', 'Waveguides exposed in resist.', 'Exposed in the synchrotron (circuit 6).'],
        ['sin_etched_wafer', 'Etched SiN Wafer', 'Waveguides etched in the nitride.', 'Annealed in the photonic foundry (circuit 7).'],
        ['annealed_sin_chip', 'SiN Waveguide Chip', 'Low-loss silicon nitride waveguides.', 'Goes to the SNSPD foundry and the integration hall.'],
        ['wsi_wafer', 'WSi Wafer', 'A wafer under a thin tungsten silicide film.', 'Made in the SNSPD foundry (circuit 1).'],
        ['wsi_nanowire_wafer', 'Nanowire Wafer', 'A nanowire meander written in resist.', 'Made in the SNSPD foundry (circuit 2).'],
        ['snspd_die', 'SNSPD Die', 'A nanowire on a waveguide, not yet cold.', 'Packaged in the SNSPD foundry (circuit 4).'],
        ['borazine_ampoule', 'Borazine Ampoule', 'A sealed ampoule of borazine, the inorganic benzene.', 'From ammonia borane in a chemical reactor.'],
        ['hbn_copper_foil', 'hBN on Copper Foil', 'A one-layer hBN film grown on copper.', 'The copper comes back after the transfer.'],
        ['hbn_film', 'hBN Film', 'A freestanding hBN film.', 'Anneal it in a blast furnace next.'],
        ['annealed_hbn_film', 'Annealed hBN Film', 'A clean, flat hBN film.', 'Used by the van der Waals stacker and the UEV pump.'],
        ['hbn_emitter_chip', 'hBN Emitter Chip', 'A single-photon emitter in hBN.', 'Made in the van der Waals stacker (circuit 1).'],
        ['electropolished_copper_foil', 'Electropolished Copper Foil', 'Smooth copper for large single-layer graphene.', 'The acid bath is not used up.'],
        ['graphene_copper_foil', 'Graphene on Copper Foil', 'CVD graphene from methane.', 'The hydrogen it gives off is kept.'],
        ['pmma_graphene_foil', 'PMMA-Coated Graphene Foil', 'A support layer of resist over the graphene.', 'Next: the persulfate bath.'],
        ['pmma_graphene_film', 'PMMA-Graphene Film', 'Graphene floating free on its support.', 'Acetone strips the PMMA, which is recovered.'],
        ['graphene_film', 'Graphene Film', 'A clean transferred graphene film.', 'Used by the stacker, the UEV conveyor and piston.'],
        ['encapsulated_graphene', 'hBN-Encapsulated Graphene', 'Graphene between two hBN films.', 'Made in the van der Waals stacker (circuit 3).'],
        ['graphene_modulator', 'Graphene Modulator', 'An electro-optic modulator on a waveguide.', 'Made in the van der Waals stacker (circuit 2).'],
        ['seven_n_indium', '7N Indium', 'Indium zone-refined to seven nines.', 'Made in the zone refining tower (circuit 5).'],
        ['inas_qd_wafer', 'InAs Quantum Dot Wafer', 'Self-assembled InAs dots on GaAs.', 'Grown in the MBE reactor (circuit 3); it takes all the arsine.'],
        ['micropillar_wafer', 'Micropillar Wafer', 'Dots inside etched micropillar cavities.', 'Mounted into a QD source in an assembler.'],
        ['waveguide_circuit', 'Waveguide Circuit', 'A SiN circuit bonded to lithium niobate.', 'Made in the photonic integration hall (circuit 1).'],
        ['quantum_photonic_chip', 'Quantum Photonic Chip', 'Source, detectors, modulator and emitter on one circuit.', 'Made in the photonic integration hall (circuit 2).']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[3]])
    })

    ENTRIES.push(['gtceu.recipe.grindless_snspd_fabrication.detector_layer_wafer',
        'Circuit 9: 2 photonic QPU wafers, 16 nanowire wafers, 16 SNSPD dies and 32 electronic grade silicon in 16000 mB of helium make 2 detector layer wafers'])
    ENTRIES.push(['gtceu.recipe.grindless_photonic_integration.photonic_qpu',
        'Circuit 15: 4 detector layer wafers, 16 SNSPD link wafers, 8 horizon logic dies and 4 quantum photonic chips bonded with 2304 mB of epoxy make 1 photonic QPU'])

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
