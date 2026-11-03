// priority: 5686
// Gregtech Grindless - names and tooltips of OpV's tetron fab and gamma optics works (startup_scripts/grindless/opv/tetron_optics.js;
// package OpV-B1):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe of the package's types and of its older rows
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.tetron_fab', 'Tetron Fab'],
        ['gtceu.tetron_assembly', 'Tetron Assembly'],

        ['grindless.machine.tetron_fab.tooltip.0',
            '\u00a77Makes tetron dies and ties tested tetrons into a qubit array.'],

        ['emi.grindless.info.tetron_fab.0',
            'A tetron is two InAs-Al nanowires joined by a superconducting backbone; its qubit is read by interferometric parity measurement. Between the fab\'s two steps each die is In-bumped (UXV MTJ sputter cluster), flip-chip bonded (UIV TFLN fab) and parity-tested (UIV millikelvin works). It needs two UXV energy hatches.'],
        ['emi.grindless.info.tetron_fab.1',
            'The superfluid He-3 bath is not consumed. A die that fails the array\'s calibration goes to the EV extraction cascade (circuit 25), which recovers its indium, aluminium and gold.'],

        ['gtceu.recipe.grindless_tetron_assembly.tetron_die',
            'Circuit 1: a gated 2DEG wafer and a cryo-CMOS die are diced into four tetron dies.'],
        ['gtceu.recipe.grindless_tetron_assembly.tetron_array',
            'Circuit 2: four tested tetrons and a HEMT amplifier in a superfluid He-3 bath (kept); 10 % of runs reject a failed die.'],

        ['block.gtceu.gamma_optics_works', 'Gamma Optics Works'],
        ['gtceu.gamma_optics', 'Gamma Optics'],
        ['grindless.machine.gamma_optics_works.tooltip.0',
            '\u00a77Builds Laue lenses and multilayer mirrors that focus MeV gamma rays.'],
        ['emi.grindless.info.gamma_optics_works.0',
            'A Laue lens focuses gammas by Bragg diffraction in transmission through hundreds of bent Ge and GaAs tiles aligned to arcseconds; a WC/SiC multilayer mirror reflects them at grazing incidence. The tiles come from the UEV megabar (circuit 8) and the UHV crystal growth furnace (circuit 24), the frame and the mirror\'s reflectivity record from the UV synchrotron (circuits 11 and 10).'],
        ['emi.grindless.info.gamma_optics_works.1',
            'Nothing is voided: a tile that drifts out of alignment goes back to the megabar to be re-bent (circuit 9, 3 of 4 back); a mirror whose figure is off goes to the UEV CVI furnace to be stripped and re-coated (circuit 11). It needs two UXV energy hatches.'],
        ['gtceu.recipe.grindless_gamma_optics.laue_lens',
            'Circuit 1: 32 bent Ge and 32 GaAs tiles bonded into the aligned frame; 25 % of runs pull four tiles to be re-bent.'],
        ['gtceu.recipe.grindless_gamma_optics.gamma_multilayer_mirror',
            'Circuit 2: the WC/SiC multilayer on the superpolished blank, figured to its reflectivity record; 10 % of runs reject a mirror.'],

        ['gtceu.recipe.grindless_mtj_sputtering.tetron_bumps',
            'Circuit 11: indium bumps are sputtered onto four tetron dies in argon; most of the argon is recovered.'],
        ['gtceu.recipe.grindless_ion_slicing.bonded_tetron_die',
            'Circuit 8: a bumped tetron die is flip-chip bonded to a niobium TSV interposer.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.tested_tetron_die',
            'Circuit 6: a bonded tetron die is parity-tested at millikelvin on the cryostat module (kept), in 500 mB liquid helium.'],
        ['gtceu.recipe.grindless_mtj_sputtering.wc_sic_multilayer',
            'Circuit 12: hundreds of WC and SiC layers sputtered in argon; the worn target returns as tungsten carbide.'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.superpolished_sic_blank',
            'Circuit 10: a SiC compact densified from MTS into a mirror blank, then superpolished.'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.gamma_mirror_strip',
            'Circuit 11: fluorine strips the multilayer off a rejected mirror (WF6 out), MTS re-coats the blank.'],
        ['gtceu.recipe.grindless_megabar.bent_ge_tile',
            'Circuit 8: 7N germanium tiles bent under pressure for the Laue lens.'],
        ['gtceu.recipe.grindless_megabar.bent_ge_rebend',
            'Circuit 9: four relaxed tiles bent again; three come back, the broken one as germanium.'],
        ['gtceu.recipe.grindless_crystal_growth.gaas_laue_tile',
            'Circuit 24: a GaAs crystal pulled under a boron oxide cap and diced into Laue tiles.'],
        ['gtceu.recipe.grindless_synchrotron.mirror_metrology',
            'Circuit 10: the X-ray reflectivity of a multilayer (kept) is written to a data stick.'],
        ['gtceu.recipe.grindless_synchrotron.laue_frame_alignment',
            'Circuit 11: the tile seats of a tungsten-steel frame are set by X-ray diffraction.']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['bumped_tetron_die', 'Bumped Tetron Die', 'A tetron die with sputtered indium bumps.', 'Flip-chip bonded in the TFLN fab (ion slicing, circuit 8).'],
        ['bonded_tetron_die', 'Bonded Tetron Die', 'A tetron die flip-chip bonded to a niobium TSV interposer.', 'Parity-tested in the millikelvin works (circuit 6).'],
        ['tested_tetron_die', 'Tested Tetron Die', 'A tetron that passed the interferometric parity test.', 'Four make a tetron array in the tetron fab (circuit 2).'],
        ['failed_tetron_die', 'Failed Tetron Die', 'A tetron that failed the array\'s parity calibration.', 'The EV extraction cascade recovers its In, Al and Au (circuit 25).'],
        ['bent_ge_tile', 'Bent Ge Tile', 'A germanium crystal tile bent under pressure, so it diffracts a wider gamma band.', 'Made in the UEV megabar (circuit 8).'],
        ['gaas_laue_tile', 'GaAs Laue Tile', 'A gallium arsenide crystal tile cut for Bragg diffraction.', 'Grown in the UHV crystal growth furnace (circuit 24).'],
        ['aligned_laue_frame', 'Aligned Laue Frame', 'A tungsten-steel ring frame whose tile seats are set by X-ray diffraction.', 'Aligned in the UV synchrotron (circuit 11).'],
        ['rejected_laue_tile', 'Rejected Laue Tile', 'A bent germanium tile whose curvature relaxed out of its Bragg angle.', 'The UEV megabar re-bends it (circuit 9, 3 of 4 back).'],
        ['superpolished_sic_blank', 'Superpolished SiC Blank', 'A CVD silicon carbide mirror blank polished to a fraction of a nanometre.', 'Made in the UEV CVI furnace (circuit 10).'],
        ['wc_sic_multilayer', 'WC/SiC Multilayer', 'Hundreds of alternating tungsten carbide and silicon carbide layers.', 'Sputtered in the UXV MTJ cluster (circuit 12).'],
        ['mirror_metrology_record', 'Mirror Metrology Record', 'The X-ray reflectivity curve of one multilayer.', 'Measured in the UV synchrotron (circuit 10).'],
        ['wc_sputter_target', 'WC Sputter Target', 'A dense tungsten carbide target.', 'Sintered in the UHV spark plasma sinterer (circuit 14).'],
        ['rejected_gamma_mirror', 'Rejected Gamma Mirror', 'A multilayer mirror whose figure is off.', 'The UEV CVI furnace strips and re-coats it (circuit 11).']
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
