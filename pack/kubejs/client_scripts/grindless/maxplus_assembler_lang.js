// priority: 7080
// Gregtech Grindless - names and tooltips of MAX+'s condensate assembler (startup_scripts/grindless/maxplus/assembler.js; package XP-H3):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each row of the package that has one (the assembler's rows, the press's
//                                                      c3 row and the T1 to T3, T14 to T16 and P25 steps on older machines whose type carries a data key)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.condensate_assembler', 'Condensate Assembler'],
        ['block.gtceu.condensate_assembler', 'Condensate Assembler'],
        ['grindless.machine.condensate_assembler.tooltip.0', '\u00a77Assembles plates and mesh under a Kerr condensate bath.'],
        ['gtceu.recipe.grindless_condensate_assembler.horizon_containment_plate', 'Circuit 1: laminated containment cores, horizon plates and Kerr strange plates assembled under a condensate bath into a horizon containment plate; the boil-off goes to the refinery (line T1).'],
        ['gtceu.recipe.grindless_condensate_assembler.chevron_core', 'Circuit 2: zone-plate wafers, X-ray mirrors, gamma focusing elements and horizon plates assembled under a condensate bath into a chevron core; the boil-off goes to the refinery (line T2).'],
        ['gtceu.recipe.grindless_condensate_assembler.horizon_mesh', 'Circuit 3: coated meshes, Kerr strange plates and clad strand assembled under a condensate bath into a horizon mesh; the boil-off goes to the refinery (line T3).'],
        ['gtceu.recipe.grindless_condensate_assembler.horizon_frame_part', 'Circuit 4: the four woven meta-materials, horizon mesh and containment plates assembled under a condensate bath into a horizon frame part; the boil-off goes to the refinery (lines T4 to T7, T1, T3).'],
        ['gtceu.recipe.grindless_bound_matter_press.laminated_containment_core', 'Circuit 3: horizon plates, Gd absorber tiles and graded Z billets pressed into laminated containment cores; the press flash is Kerr condensate for the refinery (line T1).'],
        ['gtceu.recipe.grindless_beuv_lithography.zone_plate_wafer', 'Circuit 17: absorber tiles and gold patterned into a zone-plate wafer under argon (line T2).'],
        ['gtceu.recipe.grindless_mtj_sputtering.multilayer_xray_mirror', 'Zone-plate wafer and molybdenum sputtered with niobium into a multilayer X-ray mirror; most of the argon is recovered (line T2).'],
        ['gtceu.recipe.grindless_gamma_optics.gamma_focus_element', 'Circuit 3: zone-plate wafers and iridium ground into a gamma focusing element (line T2).'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.infiltrated_mesh', 'Circuit 19: the Kerr mesh preform infiltrated from methyltrichlorosilane and hydrogen; the hydrochloric acid goes to its users (line T3).'],
        ['gtceu.recipe.grindless_electron_beam.coated_mesh', 'The infiltrated mesh coated with Gd-HfB2 cermet in the electron-beam furnace (line T3).'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.kerr_coated_tape', 'Circuit 10: Kerr strand wire coated with a gadolinium superconducting layer in oxygen; the laser is not consumed (line T14).'],
        ['gtceu.recipe.grindless_magnet_winding.kerr_smes_winding', 'Circuit 20: Kerr coated tape wound into an SMES winding on a liquid helium charge that is not consumed (line T14).'],
        ['gtceu.recipe.grindless_magnet_winding.shielded_absorber', 'Circuit 21: coated absorber sheets and Kerr coated tape wound into a shielded absorber on a liquid helium charge that is not consumed (line T15).'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.fe16n2_absorber_ring', 'Circuit 22: iron nitrided under nitrogen into an Fe16N2 absorber ring (line T15).'],
        ['gtceu.recipe.grindless_megabar.densified_truss_billet', 'Circuit 17: a segment truss billet and a graded Z billet pressed to megabar density (line T16).'],
        ['gtceu.recipe.grindless_electron_beam.coated_truss_billet', 'The densified truss billet coated with Gd-HfB2 cermet in the electron-beam furnace (line T16).'],
        ['gtceu.recipe.grindless_plasma_mass_filtering.he_rich_fraction', 'Circuit 7: raw VMS plasma filtered at 30 Doradus into a helium-rich fraction and a heavy stellar cut (line P25).'],
        ['gtceu.recipe.grindless_closed_loop.cold_kerr_toroid', 'The braced Kerr toroid run cold until it holds its critical current (line T14).'],
        ['gtceu.recipe.grindless_closed_loop.flux_absorber_casing', 'The shielded absorber run cold into a flux absorber casing (line T15).']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
