// priority: 5064
// Gregtech Grindless - names and tooltips of UEV's electron beam furnace and single-crystal foundry (startup_scripts/grindless/uev/electron_beam.js; package UEV-A4):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.electron_beam_furnace', 'Electron Beam Furnace'],
        ['gtceu.electron_beam_refining', 'Electron Beam Refining'],
        ['block.gtceu.single_crystal_foundry', 'Single-Crystal Foundry'],
        ['gtceu.single_crystal_casting', 'Single-Crystal Casting'],

        ['grindless.machine.electron_beam_furnace.tooltip.0',
            '§7Melts metal under an electron gun in hard vacuum to 6N purity.'],

        ['grindless.machine.single_crystal_foundry.tooltip.0',
            '§7Casts single-crystal blades and wheels in a withdrawal furnace.'],
        ['grindless.machine.single_crystal_foundry.no_voiding',
            'Voiding is off: the gate and the dross must never be thrown away.'],

        ['gtceu.recipe.grindless_electron_beam.rhenium', 'Circuit 1: 6N rhenium; the hearth liner leaves a skull'],
        ['gtceu.recipe.grindless_electron_beam.hafnium', 'Circuit 2: 6N hafnium from the Kroll sponge'],
        ['gtceu.recipe.grindless_electron_beam.tantalum', 'Circuit 3: 6N tantalum from the sodium-reduced powder'],
        ['gtceu.recipe.grindless_electron_beam.niobium_rrr', 'Circuit 4: RRR-grade niobium for superconducting cavities'],
        ['gtceu.recipe.grindless_electron_beam.ysz_coating', 'Circuit 5: a YSZ thermal barrier on a bond-coated SX blade'],
        ['gtceu.recipe.grindless_electron_beam.onion_carbon', 'Circuit 6: diamond dust annealed to onion carbon'],
        ['gtceu.recipe.grindless_single_crystal_casting.sx_blade', 'Circuit 1: an SX turbine blade; the argon is never used up'],
        ['gtceu.recipe.grindless_single_crystal_casting.pump_impeller', 'Circuit 2: an SX pump impeller; the dross goes to the platinum plant'],
        ['gtceu.recipe.grindless_single_crystal_casting.turbine_wheel', 'Circuit 3: a Brayton turbine wheel from eight coated SX blades']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['six_n_hafnium', '6N Hafnium', 'Hafnium refined to six nines.', 'Made only in the electron beam furnace (circuit 2).'],
        ['six_n_tantalum', '6N Tantalum', 'Tantalum refined to six nines.', 'Made only in the electron beam furnace (circuit 3).'],
        ['six_n_niobium', '6N Niobium', 'RRR-grade niobium, clean enough for a superconducting cavity.', 'Made only in the electron beam furnace (circuit 4).'],
        ['six_n_rhenium', '6N Rhenium', 'Rhenium refined to six nines.', 'Made only in the electron beam furnace (circuit 1) from Barnard\'s rhenium.'],
        ['eb_skull', 'EB Skull', 'Iridium-clad hearth liner scrap left by every refining.', 'Goes back to iridium in the platinum plant (circuit 7).'],
        ['onion_carbon', 'Onion Carbon', 'Nested fullerene shells, a dry lubricant and a spark source.', 'Annealed from diamond dust in the electron beam furnace (circuit 6).'],
        ['zr_hf_chloride_dust', 'Zr-Hf Chloride Dust', 'Zircon chlorinated: zirconium and hafnium chloride together.', 'Split in the extraction cascade (circuit 8).'],
        ['zirconium_chloride_dust', 'Zirconium Chloride Dust', 'The zirconium cut of the cascade.', 'Hydrolysed to zirconia for the YSZ line.'],
        ['hafnium_chloride_dust', 'Hafnium Chloride Dust', 'The hafnium cut of the cascade.', 'Hydrolysed to hafnia in a chemical reactor.'],
        ['hafnia_dust', 'Hafnia Dust', 'Hafnium oxide.', 'Carbochlorinated to the tetrachloride.'],
        ['hafnium_tetrachloride_dust', 'Hafnium Tetrachloride Dust', 'Volatile and moisture-hungry.', 'Reduced with magnesium (Kroll) to a sponge.'],
        ['hafnium_sponge', 'Hafnium Sponge', 'Porous metal from the Kroll process.', 'Refined to 6N in the electron beam furnace (circuit 2).'],
        ['tantalite_fluoride_cake', 'Tantalite Fluoride Cake', 'Tantalite digested in hydrofluoric acid.', 'Split into K2TaF7 and niobium oxyfluoride in the cascade (circuit 9).'],
        ['k2taf7_dust', 'K2TaF7 Dust', 'Potassium heptafluorotantalate.', 'Reduced with sodium to tantalum powder.'],
        ['niobium_oxyfluoride_dust', 'Niobium Oxyfluoride Dust', 'The niobium cut of the tantalite digest.', 'Reduced with sodium to niobium powder.'],
        ['tantalum_powder', 'Tantalum Powder', 'Sodium-reduced tantalum.', 'Refined to 6N in the electron beam furnace (circuit 3).'],
        ['niobium_powder', 'Niobium Powder', 'Sodium-reduced niobium.', 'Refined to RRR grade in the electron beam furnace (circuit 4).'],
        ['alkali_fluoride_dust', 'Alkali Fluoride Dust', 'NaF and KF left by the sodium reductions.', 'Returns to the fluorspar kiln as hydrofluoric acid.'],
        ['yttrium_oxide_dust', 'Yttrium Oxide Dust', 'Yttria from the rare-earth cascade.', 'Stabilises zirconia for the YSZ coating.'],
        ['terbium_oxide_dust', 'Terbium Oxide Dust', 'Terbia from the rare-earth cascade.', 'Stripped in the extraction cascade (circuit 10).'],
        ['ysz_powder', 'YSZ Powder', 'Yttria-stabilised zirconia.', 'Pressed to an ingot in a compressor.'],
        ['ysz_ingot', 'YSZ Ingot', 'The target of the thermal barrier coating.', 'Evaporated onto SX blades in the electron beam furnace (circuit 5).'],
        ['sx_master_alloy_dust', 'SX Master Alloy Dust', 'Nickel with rhenium, ruthenium and tantalum.', 'Cast in the single-crystal foundry; gates are remelted into it.'],
        ['ceramic_shell_mould', 'Ceramic Shell Mould', 'A zirconia-alumina investment shell with a grain selector.', 'Fired shell stuccoed in an assembler (circuit 25); one per casting.'],
        ['ceramic_slurry', 'Ceramic Slurry', 'Yttria-stabilised zirconia and sapphire grain in a polyvinyl butyral binder.', 'Mixed (circuit 1); dipped onto a polyethylene pattern in the mixer (circuit 2).'],
        ['green_ceramic_shell', 'Green Ceramic Shell', 'Unfired shell with the polyethylene pattern still inside.', 'Fired in the blast furnace with oxygen (circuit 1); the pattern burns out as carbon dioxide.'],
        ['fired_ceramic_shell', 'Fired Ceramic Shell', 'Sintered shell, hollow where the pattern was.', 'Stuccoed into a mould in an assembler (circuit 25).'],
        ['sx_gate', 'SX Gate', 'The runner left on a casting.', 'Remelted to master alloy in a macerator.'],
        ['sx_dross', 'SX Dross', 'Oxide skin with ruthenium and nickel.', 'Goes to the platinum plant (circuit 6).'],
        ['heat_treated_sx_blade', 'Heat-Treated SX Blade', 'Solution-treated and aged to precipitate gamma prime.', 'Next: a bond coat in an assembler (circuit 26).'],
        ['bond_coated_sx_blade', 'Bond-Coated SX Blade', 'A platinum-aluminide bond coat.', 'Next: the YSZ coating in the electron beam furnace.'],
        ['coated_sx_blade', 'Coated SX Blade', 'Columnar YSZ over the bond coat.', 'Eight go into a Brayton turbine wheel.'],
        ['sx_pump_impeller', 'SX Pump Impeller', 'A single-crystal impeller for hot loops.', 'Cast only in the single-crystal foundry (circuit 2).'],
        ['brayton_turbine_wheel', 'Brayton Turbine Wheel', 'Eight coated SX blades on one disc.', 'Cast only in the single-crystal foundry (circuit 3).'],
        ['nb3sn_srf_cavity', 'Nb3Sn SRF Cavity', 'A niobium cavity coated with Nb3Sn by tin vapour diffusion.', 'Made in the SRF cavity works (circuit 5).']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[3]])
    })

    ENTRIES.push(['material.gtceu.rhenium', 'Rhenium'])

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
