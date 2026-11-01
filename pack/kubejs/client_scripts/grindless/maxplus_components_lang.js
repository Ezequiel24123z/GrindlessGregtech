// priority: 6886
// Gregtech Grindless - the EMI lines of the MAX+ component steps that run on a custom machine
// (server_scripts/grindless/maxplus/components.js; package XP-A2). The other steps run on GTM machines and need no key.
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
//   gtceu.recipe.grindless_<recipe type>.<recipe name>
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_condensate_refinery.condensate_loaded_cavity', 'Circuit 7: a niobium-coated cavity is flooded with settled condensate until it holds a standing field (line C5).'],
        ['gtceu.recipe.grindless_magnet_winding.kerr_coil_winding', 'Circuit 22: stabilised Kerr wire wound on the CMC coil former and potted in epoxy (line C1).'],
        ['gtceu.recipe.grindless_membrane_rolling.horizon_belt', 'Circuit 4: horizon membrane and strand wire rolled into the horizon belt (line C6).'],
        ['gtceu.recipe.grindless_shequid_assembly.balanced_bound_billet', 'Circuit 10: a bound degenerate billet is balanced against the weak-link cell in superfluid helium (line C2).'],
        ['gtceu.recipe.grindless_mtj_sputtering.wear_coated_rotor', 'Circuit 32: a bound rotor blank sputtered with a niobium wear coat (line C2).'],
        ['gtceu.recipe.grindless_mtj_sputtering.nb_coated_cavity', 'Circuit 32: a confinement cavity sputtered with niobium (line C5).'],
        ['gtceu.recipe.grindless_mtj_sputtering.electroded_pmn_stack', 'Circuit 32: PMN-PT plates sputtered with gold electrodes and stacked (line C7).'],
        ['gtceu.recipe.grindless_ion_slicing.ln_on_diamond', 'Circuit 15: a lithium niobate wafer sliced onto the thick C-12 diamond plate (line C3).'],
        ['gtceu.recipe.grindless_beuv_lithography.patterned_engine_wafer', 'Circuit 19: the photonic engine pattern printed with a fresh BEUV mirror (line C3).'],
        ['gtceu.recipe.grindless_beuv_lithography.readout_wafer', 'Circuit 20: the readout wafer printed with a fresh BEUV mirror (line C4).'],
        ['gtceu.recipe.grindless_photonic_foundry.horizon_photonic_engine', 'Circuit 31: the patterned wafer bonded to a glass interposer in ultrapure water (line C3).'],
        ['gtceu.recipe.grindless_photonic_foundry.horizon_phase_sensor_core', 'Circuit 32: the cold SNSPD module bonded to a readout die in ultrapure water (line C4).'],
        ['gtceu.recipe.grindless_snspd_fabrication.snspd_array_die', 'Circuit 8: four SNSPDs and gold wired into an array die in superfluid helium (line C4).'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.cold_snspd_module', 'Circuit 16: the array die and a readout die cooled to millikelvin in the cryostat (line C4).'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.condensate_field_cell', 'Circuit 17: the sealed field cavity cooled to millikelvin until the condensate locks (line C5).'],
        ['gtceu.recipe.grindless_electron_beam.refractory_coated_web', 'Circuit 32: the primed Kerr web coated with tungsten under the beam (line C6).'],
        ['gtceu.recipe.grindless_crystal_growth.pmn_pt_boule', 'Circuit 32: PMN-PT precursor oxides grown into a boule in an iridium crucible (line C7).']
    ]
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
