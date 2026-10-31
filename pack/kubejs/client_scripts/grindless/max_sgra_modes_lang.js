// Gregtech Grindless - EMI lines of MAX-D1's rows on older machines (L15, L16 and L24 at Sgr A*):
//
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Same format as max_components_lang.js. Item and fluid names are in max_foundation_lang.js. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_femtosecond_writing.droplet_nozzle_plate', 'Droplet nozzle plate', 'Placa de toberas de gotas'],
        ['gtceu.recipe.grindless_droplet_radiator_assembly.shell_droplet_radiator', 'Shell droplet radiator at Sgr A*', 'Radiador de gotas de la cascara en Sgr A*'],
        ['gtceu.recipe.grindless_disk_skimming.skim_hot_flow', 'Skim the hot flow at Sgr A*', 'Recoger el flujo caliente en Sgr A*'],
        ['gtceu.recipe.grindless_plasma_mass_filtering.hot_flow_filter', 'Filter the hot flow at Sgr A*', 'Filtrar el flujo caliente en Sgr A*'],
        ['gtceu.recipe.grindless_plasma_mass_filtering.cooled_exhaust_return', 'Filter the cooled exhaust', 'Filtrar el escape enfriado'],
        ['gtceu.recipe.grindless_frc_forming.load_flux_frc', 'Load the filtered flow with flux at Sgr A*', 'Cargar el flujo filtrado con flujo magnetico en Sgr A*'],
        ['gtceu.recipe.grindless_blandford_znajek.frc_spin_down', 'Spin-down of Sgr A* through an FRC', 'Frenado de Sgr A* mediante un FRC'],
        ['gtceu.recipe.grindless_penrose_extraction.payload_penrose', 'Penrose extraction from a payload at Sgr A*', 'Extraccion Penrose de una carga en Sgr A*'],
        ['gtceu.recipe.grindless_degenerate_harvesting.degenerate_slug', 'Degenerate matter slug at Sgr A*', 'Lingote de materia degenerada en Sgr A*'],
        ['gtceu.recipe.grindless_megabar.payload_core_press', 'Compressed payload core', 'Nucleo de carga comprimido']
    ];
    ['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1 + li]); });
        });
    });
})();
