// priority: 1900
// Gregtech Grindless - names and tooltips of UV's Starshot (startup_scripts/grindless/uv/starshot.js; package UV-A12):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   item.grindless.<item>, tooltip.grindless.<item>.0/.1          the new items
//   material.gtceu.<n>                                            the new GT materials
//
// The light sail, starchip, sail-chip and Starshot probe are F1's and named in uv_foundation_lang.js. Kept out of
// pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.light_sail_fab', 'Light Sail Fab', 'Fábrica de velas de luz'],
        ['gtceu.light_sail', 'Light Sail', 'Vela de luz'],
        ['block.gtceu.starchip_fab', 'Starchip Fab', 'Fábrica de starchips'],
        ['gtceu.starchip', 'Starchip', 'Starchip'],
        ['block.gtceu.laser_sail_launcher', 'Laser Sail Launcher', 'Lanzador de velas láser'],
        ['gtceu.laser_sail_launch', 'Laser Sail Launch', 'Lanzamiento de vela láser'],

        ['grindless.machine.light_sail_fab.tooltip.0',
            '§7Casts the 100 nm light sail film.',
            '§7Fabrica la película de la vela de luz de 100 nm.'],
        ['grindless.machine.light_sail_fab.tooltip.1',
            'Works only in Earth orbit.',
            'Solo funciona en órbita terrestre.'],

        ['grindless.machine.starchip_fab.tooltip.0',
            '§7Builds the Starshot\'s starchip in a clean room.',
            '§7Construye el starchip de Starshot en una sala blanca.'],

        ['grindless.machine.laser_sail_launcher.tooltip.0',
            '§7A phased laser array that launches the light sail.',
            '§7Una matriz láser en fase que lanza la vela de luz.'],
        ['grindless.machine.laser_sail_launcher.tooltip.1',
            'Works only on the Moon.',
            'Solo funciona en la Luna.'],

        ['item.grindless.epitaxial_silicon_wafer', 'Epitaxial Silicon Wafer', 'Oblea de silicio epitaxial'],
        ['tooltip.grindless.epitaxial_silicon_wafer.0', 'Silicon grown from silane in the wake shield\'s hard vacuum.', 'Silicio crecido a partir de silano en el vacío del escudo de estela.'],
        ['tooltip.grindless.epitaxial_silicon_wafer.1', 'The light sail\'s carrier.', 'El soporte de la vela de luz.'],
        ['item.grindless.nitride_coated_carrier', 'Nitride-Coated Carrier', 'Soporte recubierto de nitruro'],
        ['tooltip.grindless.nitride_coated_carrier.0', '100 nm of silicon nitride on the epitaxial wafer.', '100 nm de nitruro de silicio sobre la oblea epitaxial.'],
        ['tooltip.grindless.nitride_coated_carrier.1', 'Patterned next in the light sail fab.', 'Se graba después en la fábrica de velas de luz.'],
        ['item.grindless.patterned_sail_carrier', 'Patterned Sail Carrier', 'Soporte de vela grabado'],
        ['tooltip.grindless.patterned_sail_carrier.0', 'The film cut into an hBN-backed reflecting metasurface.', 'La película grabada en una metasuperficie reflectante sobre hBN.'],
        ['tooltip.grindless.patterned_sail_carrier.1', 'Xenon difluoride frees the sail from the silicon.', 'El difluoruro de xenón libera la vela del silicio.'],

        ['material.gtceu.silane', 'Silane', 'Silano'],
        ['material.gtceu.xenon_difluoride', 'Xenon Difluoride', 'Difluoruro de xenón'],
        ['material.gtceu.silicon_tetrafluoride', 'Silicon Tetrafluoride', 'Tetrafluoruro de silicio']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
