// priority: 5670
// Gregtech Grindless - names and tooltips of OpV's tetron fab and gamma optics works (startup_scripts/grindless/opv/tetron_optics.js;
// package OpV-B1):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe of the package's types and of its older rows
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.tetron_fab', 'Tetron Fab', 'Fábrica de tetrones'],
        ['gtceu.tetron_assembly', 'Tetron Assembly', 'Ensamblaje de tetrones'],

        ['grindless.machine.tetron_fab.tooltip.0',
            '\u00a77Makes tetron dies and ties tested tetrons into a qubit array.',
            '\u00a77Fabrica troqueles de tetrón y une tetrones probados en una matriz de cúbits.'],

        ['emi.grindless.info.tetron_fab.0',
            'A tetron is two InAs-Al nanowires joined by a superconducting backbone; its qubit is read by interferometric parity measurement. Between the fab\'s two steps each die is In-bumped (UXV MTJ sputter cluster), flip-chip bonded (UIV TFLN fab) and parity-tested (UIV millikelvin works). It needs two UXV energy hatches.',
            'Un tetrón son dos nanohilos de InAs-Al unidos por una columna superconductora; su cúbit se lee por medida interferométrica de paridad. Entre los dos pasos de la fábrica cada troquel recibe protuberancias de In (clúster de pulverización MTJ UXV), se une en flip-chip (fábrica TFLN UIV) y se prueba su paridad (taller de milikelvin UIV). Necesita dos escotillas de energía UXV.'],
        ['emi.grindless.info.tetron_fab.1',
            'The superfluid He-3 bath is not consumed. A die that fails the array\'s calibration goes to the EV extraction cascade (circuit 25), which recovers its indium, aluminium and gold.',
            'El baño de He-3 superfluido no se consume. Un troquel que falla la calibración de la matriz va a la cascada de extracción EV (circuito 25), que recupera su indio, aluminio y oro.'],

        ['gtceu.recipe.grindless_tetron_assembly.tetron_die',
            'Circuit 1: a gated 2DEG wafer and a cryo-CMOS die are diced into four tetron dies.',
            'Circuito 1: una oblea 2DEG con puertas y un troquel cryo-CMOS se cortan en cuatro troqueles de tetrón.'],
        ['gtceu.recipe.grindless_tetron_assembly.tetron_array',
            'Circuit 2: four tested tetrons and a HEMT amplifier in a superfluid He-3 bath (kept); 10 % of runs reject a failed die.',
            'Circuito 2: cuatro tetrones probados y un amplificador HEMT en un baño de He-3 superfluido (se conserva); el 10 % de las tandas rechaza un troquel fallido.'],

        ['block.gtceu.gamma_optics_works', 'Gamma Optics Works', 'Taller de óptica gamma'],
        ['gtceu.gamma_optics', 'Gamma Optics', 'Óptica gamma'],
        ['grindless.machine.gamma_optics_works.tooltip.0',
            '\u00a77Builds Laue lenses and multilayer mirrors that focus MeV gamma rays.',
            '\u00a77Construye lentes de Laue y espejos multicapa que enfocan rayos gamma de MeV.'],
        ['emi.grindless.info.gamma_optics_works.0',
            'A Laue lens focuses gammas by Bragg diffraction in transmission through hundreds of bent Ge and GaAs tiles aligned to arcseconds; a WC/SiC multilayer mirror reflects them at grazing incidence. The tiles come from the UEV megabar (circuit 8) and the UHV crystal growth furnace (circuit 24), the frame and the mirror\'s reflectivity record from the UV synchrotron (circuits 11 and 10).',
            'Una lente de Laue enfoca rayos gamma por difracción de Bragg en transmisión a través de cientos de teselas curvadas de Ge y GaAs alineadas al segundo de arco; un espejo multicapa de WC/SiC los refleja con incidencia rasante. Las teselas vienen de la prensa megabar UEV (circuito 8) y del horno de crecimiento de cristales UHV (circuito 24), el marco y el registro de reflectividad del espejo del sincrotrón UV (circuitos 11 y 10).'],
        ['emi.grindless.info.gamma_optics_works.1',
            'Nothing is voided: a tile that drifts out of alignment goes back to the megabar to be re-bent (circuit 9, 3 of 4 back); a mirror whose figure is off goes to the UEV CVI furnace to be stripped and re-coated (circuit 11). It needs two UXV energy hatches.',
            'Nada se desecha: una tesela que se desalinea vuelve a la megabar para curvarse de nuevo (circuito 9, vuelven 3 de 4); un espejo con la figura desviada va al horno CVI UEV para decaparlo y recubrirlo (circuito 11). Necesita dos escotillas de energía UXV.'],
        ['gtceu.recipe.grindless_gamma_optics.laue_lens',
            'Circuit 1: 32 bent Ge and 32 GaAs tiles bonded into the aligned frame; 25 % of runs pull four tiles to be re-bent.',
            'Circuito 1: 32 teselas de Ge curvado y 32 de GaAs pegadas en el marco alineado; el 25 % de las tandas retira cuatro teselas para curvarlas de nuevo.'],
        ['gtceu.recipe.grindless_gamma_optics.gamma_multilayer_mirror',
            'Circuit 2: the WC/SiC multilayer on the superpolished blank, figured to its reflectivity record; 10 % of runs reject a mirror.',
            'Circuito 2: la multicapa de WC/SiC sobre el bloque superpulido, ajustada a su registro de reflectividad; el 10 % de las tandas rechaza un espejo.'],

        ['gtceu.recipe.grindless_mtj_sputtering.tetron_bumps',
            'Circuit 9: indium bumps are sputtered onto four tetron dies in argon; most of the argon is recovered.',
            'Circuito 9: se depositan protuberancias de indio sobre cuatro troqueles de tetrón en argón; se recupera casi todo el argón.'],
        ['gtceu.recipe.grindless_ion_slicing.bonded_tetron_die',
            'Circuit 8: a bumped tetron die is flip-chip bonded to a niobium TSV interposer.',
            'Circuito 8: un troquel de tetrón con protuberancias se une en flip-chip a un intercalador TSV de niobio.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.tested_tetron_die',
            'Circuit 6: a bonded tetron die is parity-tested at millikelvin on the cryostat module (kept).',
            'Circuito 6: se prueba la paridad de un troquel de tetrón unido a milikelvin sobre el módulo criostato (se conserva).'],
        ['gtceu.recipe.grindless_mtj_sputtering.wc_sic_multilayer',
            'Circuit 10: hundreds of WC and SiC layers sputtered in argon; the worn target returns as tungsten carbide.',
            'Circuito 10: cientos de capas de WC y SiC depositadas en argón; el blanco gastado vuelve como carburo de wolframio.'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.superpolished_sic_blank',
            'Circuit 10: a SiC compact densified from MTS into a mirror blank, then superpolished.',
            'Circuito 10: un compacto de SiC densificado con MTS en un bloque de espejo y luego superpulido.'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.gamma_mirror_strip',
            'Circuit 11: fluorine strips the multilayer off a rejected mirror (WF6 out), MTS re-coats the blank.',
            'Circuito 11: el flúor decapa la multicapa de un espejo rechazado (sale WF6) y el MTS recubre el bloque.'],
        ['gtceu.recipe.grindless_megabar.bent_ge_tile',
            'Circuit 8: 7N germanium tiles bent under pressure for the Laue lens.',
            'Circuito 8: teselas de germanio 7N curvadas a presión para la lente de Laue.'],
        ['gtceu.recipe.grindless_megabar.bent_ge_rebend',
            'Circuit 9: four relaxed tiles bent again; three come back, the broken one as germanium.',
            'Circuito 9: cuatro teselas relajadas se curvan de nuevo; vuelven tres y la rota como germanio.'],
        ['gtceu.recipe.grindless_crystal_growth.gaas_laue_tile',
            'Circuit 24: a GaAs crystal pulled under a boron oxide cap and diced into Laue tiles.',
            'Circuito 24: un cristal de GaAs estirado bajo una capa de óxido de boro y cortado en teselas de Laue.'],
        ['gtceu.recipe.grindless_synchrotron.mirror_metrology',
            'Circuit 10: the X-ray reflectivity of a multilayer (kept) is written to a data stick.',
            'Circuito 10: la reflectividad de rayos X de una multicapa (se conserva) se graba en una memoria de datos.'],
        ['gtceu.recipe.grindless_synchrotron.laue_frame_alignment',
            'Circuit 11: the tile seats of a tungsten-steel frame are set by X-ray diffraction.',
            'Circuito 11: los asientos de las teselas de un marco de acero de wolframio se ajustan por difracción de rayos X.']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['bumped_tetron_die', 'Bumped Tetron Die', 'Troquel de tetrón con protuberancias', 'A tetron die with sputtered indium bumps.', 'Un troquel de tetrón con protuberancias de indio pulverizado.', 'Flip-chip bonded in the TFLN fab (ion slicing, circuit 8).', 'Se une en flip-chip en la fábrica TFLN (corte iónico, circuito 8).'],
        ['bonded_tetron_die', 'Bonded Tetron Die', 'Troquel de tetrón unido', 'A tetron die flip-chip bonded to a niobium TSV interposer.', 'Un troquel de tetrón unido en flip-chip a un intercalador TSV de niobio.', 'Parity-tested in the millikelvin works (circuit 6).', 'Se prueba su paridad en el taller de milikelvin (circuito 6).'],
        ['tested_tetron_die', 'Tested Tetron Die', 'Troquel de tetrón probado', 'A tetron that passed the interferometric parity test.', 'Un tetrón que superó la prueba interferométrica de paridad.', 'Four make a tetron array in the tetron fab (circuit 2).', 'Cuatro forman una matriz de tetrones en la fábrica de tetrones (circuito 2).'],
        ['failed_tetron_die', 'Failed Tetron Die', 'Troquel de tetrón fallido', 'A tetron that failed the array\'s parity calibration.', 'Un tetrón que falló la calibración de paridad de la matriz.', 'The EV extraction cascade recovers its In, Al and Au (circuit 25).', 'La cascada de extracción EV recupera su In, Al y Au (circuito 25).'],
        ['bent_ge_tile', 'Bent Ge Tile', 'Tesela de Ge curvada', 'A germanium crystal tile bent under pressure, so it diffracts a wider gamma band.', 'Una tesela de cristal de germanio curvada a presión, para que difracte una banda gamma más ancha.', 'Made in the UEV megabar (circuit 8).', 'Se hace en la prensa megabar UEV (circuito 8).'],
        ['gaas_laue_tile', 'GaAs Laue Tile', 'Tesela de Laue de GaAs', 'A gallium arsenide crystal tile cut for Bragg diffraction.', 'Una tesela de cristal de arseniuro de galio cortada para difracción de Bragg.', 'Grown in the UHV crystal growth furnace (circuit 24).', 'Se crece en el horno de crecimiento de cristales UHV (circuito 24).'],
        ['aligned_laue_frame', 'Aligned Laue Frame', 'Marco de Laue alineado', 'A tungsten-steel ring frame whose tile seats are set by X-ray diffraction.', 'Un marco de anillos de acero de wolframio cuyos asientos se ajustan por difracción de rayos X.', 'Aligned in the UV synchrotron (circuit 11).', 'Se alinea en el sincrotrón UV (circuito 11).'],
        ['rejected_laue_tile', 'Rejected Laue Tile', 'Tesela de Laue rechazada', 'A bent germanium tile whose curvature relaxed out of its Bragg angle.', 'Una tesela de germanio curvado cuya curvatura se relajó fuera de su ángulo de Bragg.', 'The UEV megabar re-bends it (circuit 9, 3 of 4 back).', 'La megabar UEV la curva de nuevo (circuito 9, vuelven 3 de 4).'],
        ['superpolished_sic_blank', 'Superpolished SiC Blank', 'Bloque de SiC superpulido', 'A CVD silicon carbide mirror blank polished to a fraction of a nanometre.', 'Un bloque de espejo de carburo de silicio CVD pulido a una fracción de nanómetro.', 'Made in the UEV CVI furnace (circuit 10).', 'Se hace en el horno CVI UEV (circuito 10).'],
        ['wc_sic_multilayer', 'WC/SiC Multilayer', 'Multicapa de WC/SiC', 'Hundreds of alternating tungsten carbide and silicon carbide layers.', 'Cientos de capas alternas de carburo de wolframio y carburo de silicio.', 'Sputtered in the UXV MTJ cluster (circuit 10).', 'Se pulveriza en el clúster MTJ UXV (circuito 10).'],
        ['mirror_metrology_record', 'Mirror Metrology Record', 'Registro de metrología del espejo', 'The X-ray reflectivity curve of one multilayer.', 'La curva de reflectividad de rayos X de una multicapa.', 'Measured in the UV synchrotron (circuit 10).', 'Se mide en el sincrotrón UV (circuito 10).'],
        ['wc_sputter_target', 'WC Sputter Target', 'Blanco de pulverización de WC', 'A dense tungsten carbide target.', 'Un blanco denso de carburo de wolframio.', 'Sintered in the UHV spark plasma sinterer (circuit 14).', 'Se sinteriza en el sinterizador por plasma de chispa UHV (circuito 14).'],
        ['rejected_gamma_mirror', 'Rejected Gamma Mirror', 'Espejo gamma rechazado', 'A multilayer mirror whose figure is off.', 'Un espejo multicapa con la figura desviada.', 'The UEV CVI furnace strips and re-coats it (circuit 11).', 'El horno CVI UEV lo decapa y lo recubre (circuito 11).']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1], i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[3], i[4]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[5], i[6]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
