// priority: 1634
// Gregtech Grindless - names and tooltips of UXV's stellar elevator, plasma mass filter and stellar condensation tower
// (startup_scripts/grindless/uxv/cygnus_lift.js; package UXV-B2):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   emi.grindless.info.uxv_cygnus_lift_stock.0         the info page of the three solid condensates (stock for OpV)
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.stellar_elevator', 'Stellar Elevator', 'Ascensor estelar'],
        ['block.gtceu.plasma_mass_filter', 'Plasma Mass Filter', 'Filtro de masa de plasma'],
        ['block.gtceu.stellar_condensation_tower', 'Stellar Condensation Tower', 'Torre de condensación estelar'],
        ['gtceu.star_lifting', 'Star Lifting', 'Extracción estelar'],
        ['gtceu.plasma_mass_filtering', 'Plasma Mass Filtering', 'Filtrado de masa de plasma'],
        ['gtceu.stellar_condensation', 'Stellar Condensation', 'Condensación estelar'],

        ['grindless.machine.stellar_elevator.tooltip.0',
            'A funnel and boom lying on its side over the Cygnus X-1 donor star: a magnetic funnel lifts stellar plasma out of the star. It only runs in Cygnus X-1 orbit.',
            'Un embudo y una pluma tumbados sobre la estrella donante de Cygnus X-1: un embudo magnético eleva plasma estelar de la estrella. Solo funciona en la órbita de Cygnus X-1.'],
        ['grindless.machine.stellar_elevator.tooltip.1',
            'Circuit 1 lift: liquid helium cools the tube and comes back warm; circuit 2 elevator log: a data module samples the plasma column.',
            'Circuito 1 extracción: el helio líquido enfría el tubo y vuelve caliente; circuito 2 registro del ascensor: un módulo de datos muestrea la columna de plasma.'],
        ['grindless.machine.stellar_elevator.tooltip.2',
            'Parts go in the base at the front (plasma, helium, energy) and the four ports of the crown at the back: 1-2 energy hatches, 1-2 input hatches, 1-2 output hatches, 1 input bus, 1 output bus. Accepts a parallel hatch.',
            'Las piezas van en la base, delante (plasma, helio, energía) y en los cuatro puertos de la corona, detrás: 1-2 escotillas de energía, 1-2 de entrada, 1-2 de salida, 1 bus de entrada, 1 bus de salida. Acepta una escotilla de paralelos.'],
        ['grindless.machine.plasma_mass_filter.tooltip.0',
            'An octagonal solenoid that sorts plasma by mass. Stellar plasma from Cygnus X-1 orbit splits into four cuts there; the disk row works anywhere.',
            'Un solenoide octogonal que ordena el plasma por masa. El plasma estelar de la órbita de Cygnus X-1 se divide allí en cuatro cortes; la fila del disco funciona en cualquier sitio.'],
        ['grindless.machine.plasma_mass_filter.tooltip.1',
            'Circuit 1 stellar cuts (hydrogen, helium, CNO, heavy); circuit 2 disk plasma into filtered disk plasma and the heavy cut.',
            'Circuito 1 cortes estelares (hidrógeno, helio, CNO, pesado); circuito 2 plasma de disco en plasma de disco filtrado y el corte pesado.'],
        ['grindless.machine.plasma_mass_filter.tooltip.2',
            'Plasma goes in at the front floor; cuts leave through the back cap and the two side ports: 1-2 energy hatches, 1 input hatch, 1-6 output hatches, 1 input bus. Accepts a parallel hatch.',
            'El plasma entra por el suelo delantero; los cortes salen por la tapa trasera y los dos puertos laterales: 1-2 escotillas de energía, 1 de entrada, 1-6 de salida, 1 bus de entrada. Acepta una escotilla de paralelos.'],
        ['grindless.machine.stellar_condensation_tower.tooltip.0',
            'A seven-stage column lying on its side: the heavy cut condenses stage by stage. It only runs in Cygnus X-1 orbit, where the cuts come from.',
            'Una columna de siete etapas tumbada: el corte pesado se condensa etapa a etapa. Solo funciona en la órbita de Cygnus X-1, de donde vienen los cortes.'],
        ['grindless.machine.stellar_condensation_tower.tooltip.1',
            'Circuit 1: heavy cut and hydrogen cut give refractory, metal and silicate condensate and the volatile condensate.',
            'Circuito 1: el corte pesado y el de hidrógeno dan condensado refractario, metálico y de silicatos, y el condensado volátil.'],
        ['grindless.machine.stellar_condensation_tower.tooltip.2',
            'Feed at the hot base, the front; condensates leave through buses on the lower draw-offs and the volatile at the top: 1-2 energy hatches, 1-2 input hatches, 1 output hatch, 1 input bus, 1-3 output buses. Accepts a parallel hatch.',
            'La carga entra por la base caliente, delante; los condensados salen por buses en las extracciones bajas y el volátil por arriba: 1-2 escotillas de energía, 1-2 de entrada, 1 de salida, 1 bus de entrada, 1-3 buses de salida. Acepta una escotilla de paralelos.'],

        ['emi.grindless.info.stellar_elevator.0',
            'All of its matter comes from the Cygnus X-1 donor star, lifted in Cygnus X-1 orbit through two UIV energy hatches. It needs a 6N helium-cooled controller. It lies on its side: orbit has no up.',
            'Toda su materia viene de la estrella donante de Cygnus X-1, elevada en la órbita de Cygnus X-1 con dos escotillas de energía UIV. Necesita un controlador refrigerado con helio 6N. Está tumbado: la órbita no tiene arriba.'],
        ['emi.grindless.info.stellar_elevator.1',
            'The helium is not lost: 900 mB leave warm, the LuV refrigerator recondenses them and they return to the UV cold works. The elevator log is the record of a lift, kept for the pack\'s data work.',
            'El helio no se pierde: 900 mB salen calientes, el refrigerador LuV los recondensa y vuelven a la planta de frío UV. El registro del ascensor es el historial de una extracción, guardado para el trabajo de datos.'],
        ['emi.grindless.info.plasma_mass_filter.0',
            'Stellar plasma from the Cygnus X-1 donor star is lifted by the stellar elevator and sorted here, in Cygnus X-1 orbit: hydrogen, helium, CNO and heavy cuts. The disk row also sorts accretion-disk plasma.',
            'El plasma estelar de la estrella donante de Cygnus X-1 lo eleva el ascensor estelar y se ordena aquí, en la órbita de Cygnus X-1: cortes de hidrógeno, helio, CNO y pesado. La fila del disco también ordena el plasma del disco de acreción.'],
        ['emi.grindless.info.plasma_mass_filter.1',
            'Every cut has a use: the helium cut becomes triple-alpha fuel for the Mk6 fusion ring, the hydrogen and CNO cuts feed the ring directly, the hydrogen cut also carries the volatiles in the condensation tower, and the heavy cut is condensed there.',
            'Cada corte tiene un uso: el de helio se convierte en combustible triple alfa para el anillo de fusión Mk6, los de hidrógeno y CNO alimentan el anillo directamente, el de hidrógeno también arrastra los volátiles en la torre de condensación, y el pesado se condensa allí.'],
        ['emi.grindless.info.stellar_condensation_tower.0',
            'The heavy cut and the hydrogen cut come from Cygnus X-1 orbit, so the tower runs there. Seven stages condense the heavy cut in order: the refractory condensate at the hot base, the metal and then the silicate condensate up the column.',
            'El corte pesado y el de hidrógeno vienen de la órbita de Cygnus X-1, así que la torre funciona allí. Siete etapas condensan el corte pesado en orden: el condensado refractario en la base caliente, el metálico y después el de silicatos columna arriba.'],
        ['emi.grindless.info.stellar_condensation_tower.1',
            'Nothing is vented: the volatile condensate (methane, ammonia and water) goes to the syngas plant, which reforms it into hydrogen, carbon dioxide and nitrogen. The three condensates are stock for the next era\'s refining, kept in AE2 storage.',
            'Nada se ventila: el condensado volátil (metano, amoníaco y agua) va a la planta de gas de síntesis, que lo reforma en hidrógeno, dióxido de carbono y nitrógeno. Los tres condensados son reserva para el refinado de la siguiente era, guardados en el almacenamiento de AE2.'],
        ['emi.grindless.info.uxv_cygnus_lift_stock.0',
            'Stock for OpV: the refractory, metal and silicate condensates of Cygnus X-1 have no use in UXV; the next era refines them. They are inert, so AE2 storage holds them safely.',
            'Reserva para OpV: los condensados refractario, metálico y de silicatos de Cygnus X-1 no tienen uso en UXV; la próxima era los refina. Son inertes, así que el almacenamiento de AE2 los guarda sin riesgo.'],

        ['gtceu.recipe.grindless_star_lifting.stellar_lift',
            'Circuit 1: liquid helium cools the lift tube while the magnetic funnel draws plasma off the Cygnus X-1 donor; 900 mB of warm helium comes back.',
            'Circuito 1: el helio líquido enfría el tubo mientras el embudo magnético extrae plasma de la donante de Cygnus X-1; vuelven 900 mB de helio caliente.'],
        ['gtceu.recipe.grindless_star_lifting.elevator_log',
            'Circuit 2: a data module records the flow of the plasma column and uses up 100 mB of the plasma it samples.',
            'Circuito 2: un módulo de datos registra el flujo de la columna de plasma y consume 100 mB del plasma que muestrea.'],
        ['gtceu.recipe.grindless_plasma_mass_filtering.stellar_cuts',
            'Circuit 1: the solenoid sorts stellar plasma by mass into the hydrogen, helium, CNO and heavy cuts.',
            'Circuito 1: el solenoide ordena el plasma estelar por masa en los cortes de hidrógeno, helio, CNO y pesado.'],
        ['gtceu.recipe.grindless_plasma_mass_filtering.disk_filter',
            'Circuit 2: accretion-disk plasma is filtered; its heavy tenth leaves as the heavy cut.',
            'Circuito 2: se filtra el plasma del disco de acreción; su décima parte pesada sale como corte pesado.'],
        ['gtceu.recipe.grindless_stellar_condensation.condense',
            'Circuit 1: the heavy cut condenses in sequence into the refractory, metal and silicate condensates; the hydrogen cut carries the volatiles off the top.',
            'Circuito 1: el corte pesado se condensa en secuencia en los condensados refractario, metálico y de silicatos; el corte de hidrógeno arrastra los volátiles por arriba.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
