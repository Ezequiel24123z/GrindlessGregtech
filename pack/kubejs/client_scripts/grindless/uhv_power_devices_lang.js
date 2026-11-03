// priority: 4300
// Gregtech Grindless - names and tooltips of UHV's power devices and photovoltaics (startup_scripts/grindless/uhv/power_devices.js;
// package UHV-A5):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items (the F1 items are in uhv_foundation_lang.js)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.sic_device_fab', 'SiC Device Fab'],
        ['gtceu.silicon_carbide', 'Silicon Carbide Devices'],
        ['block.gtceu.solar_array_fab', 'Solar Array Fab'],
        ['gtceu.space_photovoltaics', 'Space Photovoltaics'],

        ['grindless.machine.sic_device_fab.tooltip.0',
            '§7Makes silicon carbide power modules and mirror blanks.'],

        ['grindless.machine.solar_array_fab.tooltip.0',
            '§7Makes space-grade IMM multijunction solar arrays.'],

        ['gtceu.recipe.grindless_silicon_carbide.sic_boule',
            'Circuit 1: silicon carbide source powder sublimed onto a seed at 2,500 °C under argon (never used up)'],
        ['gtceu.recipe.grindless_silicon_carbide.sic_source_powder',
            'Circuit 11: electronic-grade polysilicon and graphite fired into silicon carbide source powder under argon (never used up)'],
        ['item.grindless.sic_source_powder', 'SiC Source Powder'],
        ['tooltip.grindless.sic_source_powder.0',
            'Phase-pure silicon carbide grains, synthesised from silicon and carbon of electronic grade.'],
        ['tooltip.grindless.sic_source_powder.1',
            'Made by the SiC device fab (circuit 11); the SiC boule is grown from it (circuit 1).'],
        ['gtceu.recipe.grindless_silicon_carbide.sic_epi',
            'Circuit 2: a drift layer grown from silane and propane in hydrogen; the hydrogen comes back'],
        ['gtceu.recipe.grindless_silicon_carbide.sic_anneal',
            'Circuit 3: the implanted wafer annealed at 1,700 °C under argon (never used up)'],
        ['gtceu.recipe.grindless_silicon_carbide.sic_power_modules',
            'Circuit 4: the device wafer diced and silver-sintered onto copper: four power modules'],
        ['gtceu.recipe.grindless_silicon_carbide.sic_mirror_blank',
            'Circuit 5: silicon carbide powder and carbon infiltrated with molten silicon: a reaction-bonded mirror blank'],
        ['gtceu.recipe.grindless_space_photovoltaics.imm_lift_off',
            'Circuit 1: hydrofluoric acid dissolves the release layer: eight films, seven substrates back, the worn one as dust'],
        ['gtceu.recipe.grindless_space_photovoltaics.imm_array',
            'Circuit 2: four films under coverglass with a SiC power module: an IMM solar array'],
        ['gtceu.recipe.grindless_space_photovoltaics.red_tuned_array',
            'Circuit 3: as circuit 2 with an InGaAs-rich junction for a red sun: a red-tuned array'],

        ['item.grindless.sic_boule', 'SiC Boule'],
        ['tooltip.grindless.sic_boule.0',
            'A single crystal of 4H silicon carbide grown by physical vapour transport.'],
        ['tooltip.grindless.sic_boule.1',
            'Made by the SiC device fab (circuit 1); a cutter slices it into eight wafers.'],
        ['item.grindless.sic_wafer', 'SiC Wafer'],
        ['tooltip.grindless.sic_wafer.0',
            'A polished silicon carbide wafer, hard enough to need a diamond wire.'],
        ['tooltip.grindless.sic_wafer.1',
            'Cut from a SiC boule; the SiC device fab grows its epi layer (circuit 2).'],
        ['item.grindless.sic_device_wafer', 'SiC Device Wafer'],
        ['tooltip.grindless.sic_device_wafer.0',
            'Annealed silicon carbide transistors, still on the wafer.'],
        ['tooltip.grindless.sic_device_wafer.1',
            'Made by the SiC device fab (circuit 3); diced into four power modules (circuit 4).'],
        ['item.grindless.imm_epi_wafer', 'IMM Epi Wafer'],
        ['tooltip.grindless.imm_epi_wafer.0',
            'GaInP, GaAs and InGaAs junctions grown upside down on a gallium arsenide wafer.'],
        ['tooltip.grindless.imm_epi_wafer.1',
            'Made by the MOCVD reactor (circuit 7); lifted off in the solar array fab (circuit 1).'],
        ['item.grindless.imm_film', 'IMM Film'],
        ['tooltip.grindless.imm_film.0',
            'A flexible three-junction solar cell a few microns thick, free of its substrate.'],
        ['tooltip.grindless.imm_film.1',
            'Made by the solar array fab (circuit 1); four go into each array.'],
        ['item.grindless.cerium_coverglass', 'Cerium Coverglass'],
        ['tooltip.grindless.cerium_coverglass.0',
            'Borosilicate glass doped with ceria, which keeps it clear under ultraviolet and protons.'],
        ['tooltip.grindless.cerium_coverglass.1',
            'Made in an alloy smelter; two cover each solar array.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
