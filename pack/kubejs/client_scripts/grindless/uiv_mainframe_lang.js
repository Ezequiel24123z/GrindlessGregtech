// priority: 3058
// Gregtech Grindless - names and tooltips of UIV's optical mainframe line (startup_scripts/grindless/uiv/mainframe.js; package UIV-A7):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each row the package appends to an older table
//   emi.grindless.info.uiv_mainframe.N                 the EMI info page of the mainframe, tensor core, repeater and sensor
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['emi.grindless.info.uiv_mainframe.0',
            'The optical mainframe comes only from the photonic integration hall (circuit 5): a six-hour memory, a P:Si processor and a comb-fed tensor core, itself built on a compute module (the quantum photonic chip bonded to a GST crossbar on a glass interposer).'],
        ['emi.grindless.info.uiv_mainframe.1',
            'The pulsar-timed repeater needs a clock core disciplined at the pulsar timing station; the UIV sensor needs the EO microcomb and a chip nuclear clock.'],

        ['gtceu.recipe.grindless_photonic_integration.photonic_compute_module',
            'Circuit 12: the quantum photonic chip and the crossbar on its glass interposer, bonded 2.5D.'],
        ['gtceu.recipe.grindless_photonic_integration.photonic_tensor_core',
            'Circuit 4: the BEUV driver ASIC and four modulators turn the compute module into a photonic tensor core.'],
        ['gtceu.recipe.grindless_photonic_integration.comb_fed_tensor_core',
            'Circuit 13: the EO microcomb feeds the tensor core with many wavelengths at once.'],
        ['gtceu.recipe.grindless_photonic_integration.optical_mainframe',
            'Circuit 5: the optical mainframe, the only recipe for it.'],
        ['gtceu.recipe.grindless_photonic_integration.pulsar_timed_repeater',
            'Circuit 6: the pulsar-timed repeater, the wireless link of UIV.'],
        ['gtceu.recipe.grindless_photonic_foundry.pcm_crossbar',
            'Circuit 13: a 64 x 64 GST crossbar patterned from PCM dies; the spent target goes back to the foundry.'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.thf4_film',
            'Circuit 7: a thorium fluoride film grown on a silicon wafer.'],
        ['gtceu.recipe.grindless_nuclear_clock.chip_clock',
            'Circuit 3: the comb interrogates the capped film into a chip nuclear clock; the comb is not consumed.'],
        ['gtceu.recipe.grindless_pulsar_timing.repeater_discipline',
            'Circuit 3: the pulsar chart locks a repeater clock core; the nuclear clock is not consumed.'],
        ['gtceu.recipe.grindless_fluorspar_kiln.thf4_from_thorium_229',
            'Th-229 and hydrofluoric acid make thorium fluoride; the hydrogen is returned.']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['pcm_crossbar', 'PCM Crossbar', 'A 64 x 64 crossbar of GST phase-change cells.', 'Bonded to a glass interposer in the assembler.'],
        ['crossbar_on_interposer', 'Crossbar on Interposer', 'A PCM crossbar bonded to a glass interposer.', 'Bonded to the quantum photonic chip in the hall (circuit 12).'],
        ['photonic_tensor_core', 'Photonic Tensor Core', 'Matrix products done in light, driven by a BEUV ASIC.', 'Fed by an EO microcomb in the hall (circuit 13).'],
        ['thf4', 'Thorium Fluoride', 'ThF4, fluorinated from thorium-229.', 'Grown into a thin film in the MBE reactor (circuit 7).'],
        ['thf4_film', 'ThF4 Thin Film', 'A thorium fluoride film on a silicon wafer.', 'Capped with glass in the assembler.'],
        ['capped_thf4_film', 'Capped ThF4 Film', 'A ThF4 film under a glass cap.', 'Interrogated by the VUV comb in the nuclear clock lab (circuit 3).'],
        ['chip_nuclear_clock', 'Chip Nuclear Clock', 'A solid-state thorium nuclear clock.', 'Part of the UIV sensor.'],
        ['disciplined_clock_core', 'Disciplined Clock Core', 'A repeater clock locked to the pulsars.', 'Made at the pulsar timing station; goes into the pulsar-timed repeater.']
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
