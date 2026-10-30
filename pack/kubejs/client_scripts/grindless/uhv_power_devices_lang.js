// priority: 4300
// Gregtech Grindless - names and tooltips of UHV's power devices and photovoltaics (startup_scripts/grindless/uhv/power_devices.js;
// package UHV-A5):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items (the F1 items are in uhv_foundation_lang.js)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.sic_device_fab', 'SiC Device Fab', 'Fábrica de dispositivos de SiC'],
        ['gtceu.silicon_carbide', 'Silicon Carbide Devices', 'Dispositivos de carburo de silicio'],
        ['block.gtceu.solar_array_fab', 'Solar Array Fab', 'Fábrica de paneles solares'],
        ['gtceu.space_photovoltaics', 'Space Photovoltaics', 'Fotovoltaica espacial'],

        ['grindless.machine.sic_device_fab.tooltip.0',
            '§7Makes silicon carbide power modules and mirror blanks.',
            '§7Fabrica módulos de potencia y espejos en bruto de carburo de silicio.'],

        ['grindless.machine.solar_array_fab.tooltip.0',
            '§7Makes space-grade IMM multijunction solar arrays.',
            '§7Fabrica paneles solares IMM multiunión de grado espacial.'],

        ['gtceu.recipe.grindless_silicon_carbide.sic_boule',
            'Circuit 1: silicon carbide powder sublimed onto a seed at 2,500 °C under argon (never used up)',
            'Circuito 1: polvo de carburo de silicio sublimado sobre una semilla a 2.500 °C bajo argón (nunca se gasta)'],
        ['gtceu.recipe.grindless_silicon_carbide.sic_epi',
            'Circuit 2: a drift layer grown from silane and propane in hydrogen; the hydrogen comes back',
            'Circuito 2: una capa de deriva crecida con silano y propano en hidrógeno; el hidrógeno vuelve'],
        ['gtceu.recipe.grindless_silicon_carbide.sic_anneal',
            'Circuit 3: the implanted wafer annealed at 1,700 °C under argon (never used up)',
            'Circuito 3: la oblea implantada recocida a 1.700 °C bajo argón (nunca se gasta)'],
        ['gtceu.recipe.grindless_silicon_carbide.sic_power_modules',
            'Circuit 4: the device wafer diced and silver-sintered onto copper: four power modules',
            'Circuito 4: la oblea de dispositivos cortada y sinterizada con plata sobre cobre: cuatro módulos de potencia'],
        ['gtceu.recipe.grindless_silicon_carbide.sic_mirror_blank',
            'Circuit 5: silicon carbide powder and carbon infiltrated with molten silicon: a reaction-bonded mirror blank',
            'Circuito 5: polvo de carburo de silicio y carbono infiltrados con silicio fundido: un bloque de espejo por unión reactiva'],
        ['gtceu.recipe.grindless_space_photovoltaics.imm_lift_off',
            'Circuit 1: hydrofluoric acid dissolves the release layer: eight films, seven substrates back, the worn one as dust',
            'Circuito 1: el ácido fluorhídrico disuelve la capa de liberación: ocho películas, siete sustratos de vuelta, el gastado como polvo'],
        ['gtceu.recipe.grindless_space_photovoltaics.imm_array',
            'Circuit 2: four films under coverglass with a SiC power module: an IMM solar array',
            'Circuito 2: cuatro películas bajo vidrio de cubierta con un módulo de potencia de SiC: un panel solar IMM'],
        ['gtceu.recipe.grindless_space_photovoltaics.red_tuned_array',
            'Circuit 3: as circuit 2 with an InGaAs-rich junction for a red sun: a red-tuned array',
            'Circuito 3: como el circuito 2 con una unión rica en InGaAs para un sol rojo: un panel ajustado al rojo'],

        ['item.grindless.sic_boule', 'SiC Boule', 'Lingote de SiC'],
        ['tooltip.grindless.sic_boule.0',
            'A single crystal of 4H silicon carbide grown by physical vapour transport.',
            'Un monocristal de carburo de silicio 4H crecido por transporte físico de vapor.'],
        ['tooltip.grindless.sic_boule.1',
            'Made by the SiC device fab (circuit 1); a cutter slices it into eight wafers.',
            'La fabrica la fábrica de dispositivos de SiC (circuito 1); una cortadora lo corta en ocho obleas.'],
        ['item.grindless.sic_wafer', 'SiC Wafer', 'Oblea de SiC'],
        ['tooltip.grindless.sic_wafer.0',
            'A polished silicon carbide wafer, hard enough to need a diamond wire.',
            'Una oblea pulida de carburo de silicio, tan dura que necesita hilo de diamante.'],
        ['tooltip.grindless.sic_wafer.1',
            'Cut from a SiC boule; the SiC device fab grows its epi layer (circuit 2).',
            'Se corta de un lingote de SiC; la fábrica de dispositivos de SiC le crece la capa epitaxial (circuito 2).'],
        ['item.grindless.sic_device_wafer', 'SiC Device Wafer', 'Oblea de dispositivos de SiC'],
        ['tooltip.grindless.sic_device_wafer.0',
            'Annealed silicon carbide transistors, still on the wafer.',
            'Transistores de carburo de silicio recocidos, todavía en la oblea.'],
        ['tooltip.grindless.sic_device_wafer.1',
            'Made by the SiC device fab (circuit 3); diced into four power modules (circuit 4).',
            'La fabrica la fábrica de dispositivos de SiC (circuito 3); se corta en cuatro módulos de potencia (circuito 4).'],
        ['item.grindless.imm_epi_wafer', 'IMM Epi Wafer', 'Oblea epitaxial IMM'],
        ['tooltip.grindless.imm_epi_wafer.0',
            'GaInP, GaAs and InGaAs junctions grown upside down on a gallium arsenide wafer.',
            'Uniones de GaInP, GaAs e InGaAs crecidas boca abajo sobre una oblea de arseniuro de galio.'],
        ['tooltip.grindless.imm_epi_wafer.1',
            'Made by the MOCVD reactor (circuit 7); lifted off in the solar array fab (circuit 1).',
            'La fabrica el reactor MOCVD (circuito 7); se despega en la fábrica de paneles solares (circuito 1).'],
        ['item.grindless.imm_film', 'IMM Film', 'Película IMM'],
        ['tooltip.grindless.imm_film.0',
            'A flexible three-junction solar cell a few microns thick, free of its substrate.',
            'Una célula solar flexible de tres uniones de pocas micras, libre de su sustrato.'],
        ['tooltip.grindless.imm_film.1',
            'Made by the solar array fab (circuit 1); four go into each array.',
            'La fabrica la fábrica de paneles solares (circuito 1); cuatro van en cada panel.'],
        ['item.grindless.cerium_coverglass', 'Cerium Coverglass', 'Vidrio de cubierta con cerio'],
        ['tooltip.grindless.cerium_coverglass.0',
            'Borosilicate glass doped with ceria, which keeps it clear under ultraviolet and protons.',
            'Vidrio de borosilicato dopado con óxido de cerio, que lo mantiene transparente bajo ultravioleta y protones.'],
        ['tooltip.grindless.cerium_coverglass.1',
            'Made in an alloy smelter; two cover each solar array.',
            'Se hace en una fundidora de aleaciones; dos cubren cada panel solar.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
