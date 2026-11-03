// priority: 1489
// Gregtech Grindless - names and tooltips of UXV's vdW stacking cell, racetrack fab and YIG LPE furnace (startup_scripts/grindless/uxv/spin_logic.js; package UXV-A5):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each stacking, patterning and epitaxy recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.yig_lpe_furnace', 'YIG LPE Furnace'],
        ['gtceu.vdw_stacking', 'vdW Stacking'],
        ['gtceu.racetrack_patterning', 'Racetrack Patterning'],
        ['gtceu.liquid_phase_epitaxy', 'Liquid Phase Epitaxy'],

        ['grindless.machine.yig_lpe_furnace.tooltip.0',
            '\u00a77Grows YIG films on GGG wafers from a lead-borate flux.'],

        ['emi.grindless.info.yig_lpe_furnace.0',
            'A GGG wafer is dipped into a lead-borate flux holding yttrium and iron oxides in a platinum crucible, and a YIG film grows on it. It needs two UIV energy hatches and a 6N helium-cooled controller.'],
        ['emi.grindless.info.yig_lpe_furnace.1',
            'Most of the flux is reused; the used flux is skimmed back into lead and boron oxides and the dross goes to solvent extraction.'],

        ['gtceu.recipe.grindless_vdw_stacking.wte2_flake',
            'Circuit 1: a WTe2 crystal is cleaved into flakes in argon; broken flakes come back as dust.'],
        ['gtceu.recipe.grindless_vdw_stacking.fgt_flake',
            'Circuit 2: an Fe3GeTe2 crystal is cleaved into flakes in argon; broken flakes come back as dust.'],
        ['gtceu.recipe.grindless_vdw_stacking.hbn_flake',
            'Circuit 3: a megabar hBN crystal is cleaved into encapsulation flakes; broken flakes come back as hBN dust.'],
        ['gtceu.recipe.grindless_vdw_stacking.sot_heterostack',
            'Circuit 4: hBN, WTe2, FGT and hBN flakes are stamped into one SOT heterostack; torn flakes come off as dust.'],
        ['gtceu.recipe.grindless_racetrack_patterning.pattern_track',
            'Circuit 1: the track written by the e-beam is developed and etched; the platinum-group lift-off sludge is collected.'],
        ['gtceu.recipe.grindless_racetrack_patterning.racetrack_chip',
            'Circuit 2: an MTJ die is bonded onto the patterned track as its read head.'],
        ['gtceu.recipe.grindless_liquid_phase_epitaxy.lpe_flux',
            'Circuit 1: lead and boron oxides melt into the lead-borate flux.'],
        ['gtceu.recipe.grindless_liquid_phase_epitaxy.yig_film',
            'Circuit 2: a GGG wafer grows a YIG film in the flux; the platinum crucible is not consumed and most of the flux comes back.'],
        ['gtceu.recipe.grindless_liquid_phase_epitaxy.flux_skim',
            'Circuit 3: the used flux is skimmed; lead and boron oxides return and the dross goes to solvent extraction.'],
        ['gtceu.recipe.grindless_photonic_integration.spintronic_mainframe',
            'Circuit 7: the spintronic mainframe, the only recipe for it; a spintronic die, an MTJ die and a shielded interposer are bonded.']
    ]

    // [name, en, tooltip 0 en, tooltip 1 en]
    var ITEMS = [
        ['wte2_flake', 'WTe2 Flake', 'A thin cleaved flake of tungsten ditelluride.', 'The spin-orbit layer of the SOT heterostack.'],
        ['fgt_flake', 'FGT Flake', 'A thin cleaved flake of Fe3GeTe2.', 'The ferromagnetic layer of the SOT heterostack.'],
        ['hbn_flake', 'hBN Flake', 'A thin cleaved flake of megabar hexagonal boron nitride.', 'Encapsulates the SOT heterostack top and bottom.'],
        ['patterned_track_wafer', 'Patterned Track Wafer', 'A SAF stack with the racetrack pattern written by an e-beam.', 'Gets an MTJ read head in the racetrack fab (circuit 2).'],
        ['pt_crucible_shell', 'Platinum Crucible Shell', 'Four platinum sheets spun into a deep bowl.', 'Welded shut with 5N platinum into the LPE crucible.']
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
