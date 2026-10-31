// priority: 6640
// Gregtech Grindless - names and tooltips of MAX's atom interferometer works (startup_scripts/grindless/max/interferometer.js; package MAX-B2):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltip
//   emi.grindless.info.<machine>.N                     the EMI info page of the controller
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe of the package's type and of its older rows
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.atom_interferometer_works', 'Atom Interferometer Works', 'Taller de interferómetros atómicos'],
        ['gtceu.atom_interferometry', 'Atom Interferometry', 'Interferometría atómica'],

        ['grindless.machine.atom_interferometer_works.tooltip.0',
            '\u00a77Drops a Sr cloud down a shielded shaft: gradiometers and gradient maps.',
            '\u00a77Deja caer una nube de Sr por un pozo blindado: gradiómetros y mapas.'],

        ['emi.grindless.info.atom_interferometer_works.0',
            'A matter-wave gradiometer splits a cloud of ultracold strontium-88 into two paths, lets both fall through the shield and reads the phase between them. The cartridge is spent: it comes back as a spent Sr cartridge, which the calutron turns back into Sr-88 (circuit 17).',
            'Un gradiómetro de ondas de materia divide una nube de estroncio-88 ultrafrío en dos caminos, deja caer ambos por el blindaje y lee la fase entre ellos. El cartucho se gasta: vuelve como cartucho de Sr gastado, que el calutrón devuelve a Sr-88 (circuito 17).'],
        ['emi.grindless.info.atom_interferometer_works.1',
            'The cavity, the AlGaAs mirror pair and the silicon spacer that frame it are made on older machines (crystal growth, MBE, chemical bath, laser engraver, helium refrigerator). Circuit 2 calibrates a gradiometer on the Sgr A* spin map and needs it from the Sgr A* route.',
            'La cavidad, el par de espejos de AlGaAs y el espaciador de silicio que la enmarcan se hacen en máquinas anteriores (crecimiento de cristales, MBE, baño químico, grabador láser, refrigerador de helio). El circuito 2 calibra un gradiómetro con el mapa de espín de Sgr A* y lo necesita de la ruta de Sgr A*.'],

        ['gtceu.recipe.grindless_atom_interferometry.matter_wave_gradiometer', 'Circuit 1: a degenerate Sr cartridge, a squeezed-light chip, a rotation reference, a modulator and a cryo cavity in a superfluid He-3 bath; the cartridge comes back spent.',
            'Circuito 1: un cartucho de Sr degenerado, un chip de luz comprimida, una referencia de rotación, un modulador y una cavidad criogénica en un baño de He-3 superfluido; el cartucho vuelve gastado.'],
        ['gtceu.recipe.grindless_atom_interferometry.shell_gradient_map', 'Circuit 2: a gradiometer is calibrated against the Sgr A* spin map and yields the shell gradient map.',
            'Circuito 2: un gradiómetro se calibra con el mapa de espín de Sgr A* y da el mapa de gradiente de la envoltura.'],

        ['gtceu.recipe.grindless_calutron_separation.strontium_88', 'Circuit 16: strontium carbonate is ionised and separated; 15 of 16 come back as carbonate.',
            'Circuito 16: el carbonato de estroncio se ioniza y se separa; 15 de 16 vuelven como carbonato.'],
        ['gtceu.recipe.grindless_calutron_separation.spent_sr_cartridge', 'Circuit 17: a spent Sr cartridge is stripped back to Sr-88.',
            'Circuito 17: un cartucho de Sr gastado se reduce de nuevo a Sr-88.'],
        ['gtceu.recipe.grindless_quantum_degenerate_gas.degenerate_sr_cartridge', 'Circuit 5: Sr-88 is laser cooled below the condensation point in a cavity (kept).',
            'Circuito 5: el Sr-88 se enfría con láser por debajo del punto de condensación en una cavidad (se conserva).'],
        ['gtceu.recipe.grindless_shequid_assembly.shequid_rotation_ref', 'Circuit 6: a cryo-CMOS die and a niobium film are closed around a weak-link cell (kept) in superfluid helium.',
            'Circuito 6: un troquel cryo-CMOS y una película de niobio se cierran sobre una celda de enlace débil (se conserva) en helio superfluido.'],
        ['gtceu.recipe.grindless_ion_slicing.atom_optics_modulator', 'Circuit 11: a lithium niobate wafer is sliced on a float-zone silicon wafer into a beam-splitter modulator.',
            'Circuito 11: una oblea de niobato de litio se corta sobre una oblea de silicio de zona flotante en un modulador divisor de haz.'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.algaas_bragg_stack', 'Circuit 13: AlGaAs layers are grown on a GaAs wafer in liquid nitrogen.',
            'Circuito 13: se crecen capas de AlGaAs sobre una oblea de GaAs en nitrógeno líquido.'],
        ['gtceu.recipe.grindless_crystal_growth.silicon_cavity_spacer', 'Circuit 31: silicon is grown in an iridium crucible (31 % wear) into a cavity spacer.',
            'Circuito 31: el silicio se crece en un crisol de iridio (31 % de desgaste) hasta un espaciador de cavidad.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
