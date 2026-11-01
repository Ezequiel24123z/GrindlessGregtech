// priority: 2974
// Gregtech Grindless - names and tooltips of UIV's TFLN fab and femtosecond writer (startup_scripts/grindless/uiv/tfln_femtosecond.js; package UIV-A4):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each fab and writer recipe
//   material.gtceu.<fluid>                             spent KOH etchant, photoresin and uncured photoresin
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.tfln_fab', 'TFLN Fab'],
        ['block.gtceu.femtosecond_writer', 'Femtosecond Writer'],
        ['gtceu.ion_slicing', 'Ion Slicing'],
        ['gtceu.femtosecond_writing', 'Femtosecond Writing'],

        ['material.gtceu.spent_koh_etchant', 'Spent KOH Etchant'],
        ['material.gtceu.photoresin', 'Photoresin'],
        ['material.gtceu.uncured_photoresin', 'Uncured Photoresin'],

        ['grindless.machine.tfln_fab.tooltip.0',
            '\u00a77Bonds, slices and poles lithium niobate wafers.'],
        ['grindless.machine.femtosecond_writer.tooltip.0',
            '\u00a77Writes structures inside glass and metal with a femtosecond laser.'],

        ['gtceu.recipe.grindless_ion_slicing.ln_on_sin',
            'Circuit 1: an LNOI film bonded onto a Si3N4-coated wafer.'],
        ['gtceu.recipe.grindless_ion_slicing.si28_soi',
            'Circuit 2: hydrogen-implanted Si-28 cleaves off a thin layer onto an oxidised wafer; the donor wafer is reused and the hydrogen is released.'],
        ['gtceu.recipe.grindless_ion_slicing.poled_lnoi',
            'Circuit 3: periodic electric-field poling of an LNOI wafer.'],
        ['gtceu.recipe.grindless_ion_slicing.eo_microcomb',
            'Circuit 4: an annealed damascene Si3N4 ring bonded to LNOI makes the electro-optic microcomb.'],
        ['gtceu.recipe.grindless_femtosecond_writing.interposer_blank',
            'Circuit 1: a ULE boule is written with the interposer lines; the ablated glass dust goes back to stock.'],
        ['gtceu.recipe.grindless_femtosecond_writing.lattice_2pp',
            'Circuit 2: two-photon polymerisation of photoresin in a glass plate; the uncured resin is recovered.'],
        ['gtceu.recipe.grindless_femtosecond_writing.orifice_plate',
            'Circuit 3: a rhenium-alloy plate drilled with micro-orifices; the ablated dust goes back to stock.'],
        ['gtceu.recipe.grindless_femtosecond_writing.crystal_blank',
            'Circuit 4: voxels written inside a silica storage preform (5D optical storage); the ablated dust goes back to stock.'],
        ['gtceu.recipe.grindless_photonic_foundry.eo_transceiver',
            'Circuit 8: platinum electrodes on a thinned LN-on-Si3N4 wafer make the electro-optic transceiver.'],
        ['gtceu.recipe.grindless_photonic_foundry.glass_interposer',
            'Circuit 9: the written interposer blank is etched and filled with copper vias.'],
        ['gtceu.recipe.grindless_photonic_foundry.damascene_ring',
            'Circuit 10: the damascene Si3N4 wafer is polished and annealed into rings; the polishing silica goes back as quartz sand.'],
        ['gtceu.recipe.grindless_photonic_foundry.ppln_waveguide',
            'Circuit 11: a poled LNOI wafer is etched into periodically poled waveguides.'],
        ['gtceu.recipe.grindless_synchrotron.damascene_trench',
            'Circuit 7: X-ray lithography cuts deep trenches into an oxidised wafer for damascene Si3N4.']
    ]

    // [name, en, tooltip 0 en, tooltip 1 en]
    var ITEMS = [
        ['ln_on_sin_wafer', 'LN-on-Si3N4 Wafer', 'Thin-film lithium niobate on a silicon nitride wafer.', 'Thinned in the cutter before it becomes a transceiver.'],
        ['ln_on_sin_thinned', 'Thinned LN-on-Si3N4 Wafer', 'Ground to the final film thickness.', 'Takes platinum electrodes to make an EO transceiver.'],
        ['eo_transceiver', 'EO Transceiver', 'An electro-optic modulator on thin-film lithium niobate.', 'Made from a thinned wafer and platinum electrodes.'],
        ['si28_soi_wafer', 'Si-28 SOI Wafer', 'Isotopically pure silicon on insulator.', 'Only the TFLN fab makes it (circuit 2).'],
        ['si28_donor_wafer', 'Si-28 Donor Wafer', 'The wafer left after the thin layer is cleaved off.', 'It can be reimplanted and reused.'],
        ['poled_lnoi_wafer', 'Poled LNOI Wafer', 'A lithium niobate wafer with periodic domain inversion.', 'Cut into PPLN waveguides in the photonic foundry.'],
        ['written_interposer_blank', 'Written Interposer Blank', 'A ULE glass boule with laser-written channels.', 'Etched in KOH to open the channels.'],
        ['etched_interposer_blank', 'Etched Interposer Blank', 'The written channels opened by KOH.', 'Filled with copper in the photonic foundry.'],
        ['glass_interposer', 'Glass Interposer', 'A glass substrate with copper through-glass vias.', 'Carries the chiplets of the later circuits.'],
        ['trenched_oxide_wafer', 'Trenched Oxide Wafer', 'An oxidised wafer with ring trenches exposed by X-ray lithography.', 'Filled with Si3N4 in the chemical reactor.'],
        ['damascene_sin_wafer', 'Damascene Si3N4 Wafer', 'Trenches filled with silicon nitride.', 'Polished and annealed into a ring.'],
        ['annealed_damascene_ring', 'Annealed Damascene Ring', 'A low-loss Si3N4 microring.', 'Bonded to LNOI it makes the EO microcomb.'],
        ['ppln_waveguide', 'PPLN Waveguide', 'Periodically poled lithium niobate for frequency doubling.', 'Two stages make the positronium cooling laser.'],
        ['shg_486_stage', '486 nm SHG Stage', 'A frequency-doubling stage fed by a UEV emitter.', 'The first half of the positronium cooling laser.'],
        ['lattice_2pp', '2PP Lattice', 'A glass plate with a two-photon-polymerised lattice.', 'A micro-structured part for later machines.'],
        ['orifice_plate', 'Orifice Plate', 'A rhenium-alloy plate with laser-drilled micro-orifices.', 'Written in the femtosecond writer (circuit 3).'],
        ['silica_storage_preform', 'Silica Storage Preform', 'High-purity silica drawn for optical storage.', 'Written with voxels in the femtosecond writer.'],
        ['written_crystal_blank', 'Written Crystal Blank', 'A silica crystal with written voxels.', 'Read back and verified before annealing.'],
        ['verified_crystal', 'Verified Crystal', 'A written crystal that passed its read-back.', 'Annealed into a 5D data crystal.']
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
