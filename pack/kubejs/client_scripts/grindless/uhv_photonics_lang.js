// priority: 4400
// Gregtech Grindless - names and tooltips of UHV's photonics (startup_scripts/grindless/uhv/photonics.js; package UHV-A4):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items (the F1 items are in uhv_foundation_lang.js)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.mbe_reactor', 'MBE Reactor'],
        ['gtceu.molecular_beam_epitaxy', 'Molecular Beam Epitaxy'],
        ['block.gtceu.photonic_foundry', 'Photonic Foundry'],
        ['gtceu.photonic_foundry', 'Photonic Foundry'],

        ['grindless.machine.mbe_reactor.tooltip.0',
            '§7Grows atom-thin InGaAs/AlInAs layers for quantum cascade lasers.'],
        ['grindless.machine.mbe_reactor.no_voiding',
            'Voiding is off: the arsenic scraped off the cryoshroud is stored, never thrown away.'],

        ['grindless.machine.photonic_foundry.tooltip.0',
            '§7Makes optical processors and assemblies on thin-film lithium niobate.'],

        ['gtceu.recipe.grindless_molecular_beam_epitaxy.qcl_superlattice',
            'Circuit 1: an InGaAs/AlInAs superlattice grown on indium phosphide; arsenic off the cryoshroud half the time'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.quantum_cascade_lasers',
            'Circuit 2: the superlattice cleaved into eight lasers with gold contacts'],
        ['gtceu.recipe.grindless_photonic_foundry.lnoi_wafer',
            'Circuit 1: the implanted LN wafer bonded to oxidised silicon and split; the donor wafer comes back 2 runs in 3; the HF etch leaves as fluorite'],
        ['gtceu.recipe.grindless_photonic_foundry.pcm_dies',
            'Circuit 2: GST sputtered onto LNOI under argon (never used up); the spent target goes back to the blast furnace'],
        ['gtceu.recipe.grindless_photonic_foundry.quantum_memory_chips',
            'Circuit 3: an Eu:YSO boule diced into four quantum memory chips'],
        ['gtceu.recipe.grindless_photonic_foundry.optical_processor',
            'Circuit 4: LNOI, PCM dies, a quantum cascade laser and modulators: two optical processors'],
        ['gtceu.recipe.grindless_photonic_foundry.optical_assembly',
            'Circuit 5: optical processors and quantum memory: an optical assembly'],
        ['gtceu.recipe.grindless_photonic_foundry.thin_film_modulators',
            'Circuit 6: one etched LNOI wafer given gold electrodes and diced into sixteen thin-film modulators'],
        ['gtceu.recipe.grindless_photonic_foundry.lnoi_etch',
            'Circuit 28: ridge waveguides milled into the LNOI film by argon ions (never used up); the rinse water comes back'],

        ['item.grindless.etched_lnoi_wafer', 'Etched LNOI Wafer'],
        ['tooltip.grindless.etched_lnoi_wafer.0',
            'An LNOI wafer with ridge waveguides milled into its film, still bare of electrodes.'],
        ['tooltip.grindless.etched_lnoi_wafer.1',
            'Made by the photonic foundry (circuit 28); gold electrodes make it sixteen modulators (circuit 6).'],

        ['item.grindless.qcl_superlattice_wafer', 'QCL Superlattice Wafer'],
        ['tooltip.grindless.qcl_superlattice_wafer.0',
            'Hundreds of InGaAs/AlInAs layers, each a few atoms thick, on an indium phosphide wafer.'],
        ['tooltip.grindless.qcl_superlattice_wafer.1',
            'Grown in the MBE reactor (circuit 1); cleaved into eight quantum cascade lasers (circuit 2).'],
        ['item.grindless.implanted_ln_wafer', 'Implanted LN Wafer'],
        ['tooltip.grindless.implanted_ln_wafer.0',
            'Lithium niobate with a buried layer of helium bubbles, ready to split.'],
        ['tooltip.grindless.implanted_ln_wafer.1',
            'Made by the ion implanter (circuit 3); bonded and split in the photonic foundry (circuit 1).'],
        ['item.grindless.lnoi_wafer', 'LNOI Wafer'],
        ['tooltip.grindless.lnoi_wafer.0',
            'A film of lithium niobate under a micron thick on oxidised silicon.'],
        ['tooltip.grindless.lnoi_wafer.1',
            'Made by the photonic foundry (circuit 1). The base of its PCM dies and etched wafers, and the substrate of its optical processors.'],
        ['item.grindless.gst_target', 'GST Target'],
        ['tooltip.grindless.gst_target.0',
            'A sputtering target of Ge2Sb2Te5, the phase-change alloy of rewritable discs.'],
        ['tooltip.grindless.gst_target.1',
            'Cast in an electric blast furnace under argon; sputtered in the photonic foundry (circuit 2).'],
        ['item.grindless.spent_gst_target', 'Spent GST Target'],
        ['tooltip.grindless.spent_gst_target.0',
            'A target eroded into a racetrack groove by the sputter magnetron.'],
        ['tooltip.grindless.spent_gst_target.1',
            'Three remelt into two new targets in an electric blast furnace.'],
        ['item.grindless.pcm_photonic_die', 'PCM Photonic Die'],
        ['tooltip.grindless.pcm_photonic_die.0',
            'LNOI waveguides crossed by GST cells: weights that stay set without power.'],
        ['tooltip.grindless.pcm_photonic_die.1',
            'Made by the photonic foundry (circuit 2). Two go into each pair of optical processors.'],
        ['item.grindless.quantum_memory_chip', 'Quantum Memory Chip'],
        ['tooltip.grindless.quantum_memory_chip.0',
            'A slice of europium-doped yttrium orthosilicate that holds light for hours.'],
        ['tooltip.grindless.quantum_memory_chip.1',
            'Made by the photonic foundry (circuit 3). Two go into each optical assembly.'],
        ['item.grindless.sic_epi_wafer', 'SiC Epi Wafer'],
        ['tooltip.grindless.sic_epi_wafer.0',
            'A silicon carbide wafer with a grown drift layer.'],
        ['tooltip.grindless.sic_epi_wafer.1',
            'Made by the SiC device fab; implanted with aluminium in the ion implanter (circuit 4).'],
        ['item.grindless.implanted_sic_wafer', 'Implanted SiC Wafer'],
        ['tooltip.grindless.implanted_sic_wafer.0',
            'Aluminium ions in a silicon carbide epi layer, waiting for the 1,700 °C anneal.'],
        ['tooltip.grindless.implanted_sic_wafer.1',
            'Made by the ion implanter (circuit 4); annealed into device wafers in the SiC device fab.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
