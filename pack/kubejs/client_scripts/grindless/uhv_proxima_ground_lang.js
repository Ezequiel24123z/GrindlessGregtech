// priority: 4100
// Gregtech Grindless - names and tooltips of UHV's Proxima ground (startup_scripts/grindless/uhv/proxima_ground.js; package UHV-B5):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, block.grindless.<n>, tooltip.grindless.<n>.0/.1   the new items and blocks
//   emi.grindless.info.proxima_base_casing.0                      the casing's EMI page (assets/emi/recipe/additions/grindless/
//                                                                 uhv_proxima_ground_base_casing.json)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.cold_trap_drill', 'Cold-Trap Drill', 'Taladro de trampa fría'],
        ['gtceu.cold_trap_drilling', 'Cold-Trap Drilling', 'Perforación de trampa fría'],
        ['block.gtceu.biomining_heap', 'Biomining Heap', 'Pila de biominería'],
        ['gtceu.biomining', 'Biomining', 'Biominería'],

        ['grindless.machine.cold_trap_drill.tooltip.0',
            '§7Cores buried ice and cold-trap regolith with a neutron-logged drill.',
            '§7Perfora hielo enterrado y regolito de trampa fría guiada por neutrones.'],
        ['grindless.machine.cold_trap_drill.tooltip.1', 'Works on Proxima b\'s night side only.', 'Solo funciona en la cara nocturna de Próxima b.'],

        ['grindless.machine.biomining_heap.tooltip.0',
            '§7A bacterial heap that leaches platinum metals and rare earths.',
            '§7Un montón bacteriano que lixivia metales del platino y tierras raras.'],
        ['grindless.machine.biomining_heap.tooltip.1', 'Works on Proxima b only.', 'Solo funciona en Próxima b.'],

        ['gtceu.recipe.grindless_cold_trap_drilling.dig', 'Core the night-side cold trap: an ice core and cold-trap regolith', 'Perforar la trampa fría nocturna: un núcleo de hielo y regolito de trampa fría'],
        ['gtceu.recipe.grindless_biomining.pgm_leach', 'Cyanide bioleach: platinum-group liquor', 'Biolixiviación con cianuro: licor de metales del grupo del platino'],
        ['gtceu.recipe.grindless_biomining.ree_leach', 'Basalt bioleach: rare-earth liquor', 'Biolixiviación del basalto: licor de tierras raras'],
        ['gtceu.recipe.grindless_biomining.biocement', 'Microbial calcite: biocemented regolith', 'Calcita microbiana: regolito biocementado'],
        ['gtceu.recipe.grindless_biomining.lunar_biocement', 'Microbial calcite on lunar regolith: half the yield, for the first pad', 'Calcita microbiana sobre regolito lunar: la mitad, para la primera plataforma'],

        ['item.grindless.leached_tailings', 'Leached Tailings', 'Relaves lixiviados'],
        ['tooltip.grindless.leached_tailings.0', 'What the bacteria leave behind: silicates, calcium and iron.', 'Lo que dejan las bacterias: silicatos, calcio y hierro.'],
        ['tooltip.grindless.leached_tailings.1', 'Hydrochloric acid gives calcium chloride and silica (chemical reactor); the Moon\'s regolith cell makes oxygen, iron and silica from them (circuit 2).', 'El ácido clorhídrico da cloruro de calcio y sílice (reactor químico); la celda de regolito de la Luna saca de ellos oxígeno, hierro y sílice (circuito 2).'],
        ['item.grindless.urea', 'Urea', 'Urea'],
        ['tooltip.grindless.urea.0', 'Ammonia and carbon dioxide under pressure (Bosch-Meiser), in a chemical reactor.', 'Amoníaco y dióxido de carbono a presión (Bosch-Meiser), en un reactor químico.'],
        ['tooltip.grindless.urea.1', 'Sporosarcina splits it to set calcite in the biomining heap.', 'Sporosarcina la descompone para fijar calcita en la pila de biominería.'],
        ['item.grindless.cold_trap_coring_head', 'Cold-Trap Coring Head', 'Cabezal de perforación de trampa fría'],
        ['tooltip.grindless.cold_trap_coring_head.0', 'An HSS-S bit in a naquadah alloy barrel with tungsten carbide cutters.', 'Una broca de HSS-S en un tubo de aleación de naquadah con cuchillas de carburo de tungsteno.'],
        ['tooltip.grindless.cold_trap_coring_head.1', 'The cold-trap drill wears one out every 32 runs.', 'El taladro de trampa fría desgasta uno cada 32 perforaciones.'],

        ['block.grindless.biocemented_regolith', 'Biocemented Regolith', 'Regolito biocementado'],
        ['tooltip.grindless.biocemented_regolith.0', 'Regolith grains bound by bacterial calcite.', 'Granos de regolito unidos por calcita bacteriana.'],
        ['tooltip.grindless.biocemented_regolith.1', 'Assembled with flare shield panels into Proxima base casing.', 'Se ensambla con paneles contra fulguraciones en carcasa de base de Próxima.'],
        ['block.grindless.proxima_base_casing', 'Proxima Base Casing', 'Carcasa de base de Próxima'],
        ['tooltip.grindless.proxima_base_casing.0', 'A biocement pad faced with flare shield panels on a naquadah alloy frame.', 'Una plataforma de biocemento revestida de paneles contra fulguraciones sobre un bastidor de aleación de naquadah.'],
        ['tooltip.grindless.proxima_base_casing.1', 'The pad of the cold-trap drill.', 'La plataforma del taladro de trampa fría.'],
        ['emi.grindless.info.proxima_base_casing.0',
            'A structure block: biocemented regolith faced with flare shield panels on a naquadah alloy frame, made in the Assembler. The Cold-Trap Drill stands on a 5x5 pad of it (up to 23 blocks; the hatches take the rest). The first pad comes from lunar regolith cemented in the Biomining Heap, which is built from inert casing.',
            'Un bloque de estructura: regolito biocementado revestido de paneles contra fulguraciones sobre un bastidor de aleación de naquadah, hecho en el ensamblador. El taladro de trampa fría se apoya en una plataforma de 5x5 (hasta 23 bloques; las escotillas ocupan el resto). La primera plataforma sale del regolito lunar cementado en la pila de biominería, que se construye con carcasa inerte.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
