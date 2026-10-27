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
            'Works only in Earth orbit: a film 100 nm thick cannot survive gravity and air once it is released.',
            'Solo funciona en órbita terrestre: una película de 100 nm no sobrevive a la gravedad y al aire una vez liberada.'],
        ['grindless.machine.light_sail_fab.tooltip.1',
            'A 7 x 7 x 7 box of station truss: a 3 x 3 tungsten heater on the back wall, a whipple shield wall in front of it, parts in the floor.',
            'Una caja de 7 x 7 x 7 de armazón de estación: un calentador de wolframio de 3 x 3 en la pared del fondo, una pared de escudo Whipple delante, las partes en el suelo.'],
        ['grindless.machine.light_sail_fab.tooltip.2',
            'Circuit 1: silane and ammonia lay silicon nitride on an epitaxial wafer. 2: patterned into an hBN metasurface under the X-ray mask (kept).',
            'Circuito 1: silano y amoníaco depositan nitruro de silicio sobre una oblea epitaxial. 2: se graba una metasuperficie de hBN bajo la máscara de rayos X (se conserva).'],
        ['grindless.machine.light_sail_fab.tooltip.3',
            'Circuit 3: xenon difluoride etches the silicon away and frees the sail; the xenon comes back, the silicon tetrafluoride is hydrolysed.',
            'Circuito 3: el difluoruro de xenón elimina el silicio y libera la vela; el xenón vuelve y el tetrafluoruro de silicio se hidroliza.'],

        ['grindless.machine.starchip_fab.tooltip.0',
            'A 5 x 5 x 5 clean room box with a filter casing ceiling and the bonder (a stainless steel gearbox) in the middle of the floor.',
            'Una caja de sala limpia de 5 x 5 x 5 con techo de carcasas de filtro y la soldadora (una caja de engranajes de acero inoxidable) en el centro del suelo.'],
        ['grindless.machine.starchip_fab.tooltip.1',
            'Circuit 1: a photonic chip, an NV diamond chip and an americium micro source bonded on a neutronium wafer: a starchip of a few grams.',
            'Circuito 1: un chip fotónico, un chip de diamante NV y una microfuente de americio unidos sobre una oblea de neutronio: un starchip de pocos gramos.'],
        ['grindless.machine.starchip_fab.tooltip.2',
            'Circuit 2: the starchip mounted on a light sail: a sail-chip ready for the launcher on the Moon.',
            'Circuito 2: el starchip montado en una vela de luz: un sail-chip listo para el lanzador de la Luna.'],
        ['grindless.machine.starchip_fab.tooltip.3',
            'The wafer kerf comes out as silicon dust.',
            'El corte de la oblea sale como polvo de silicio.'],

        ['grindless.machine.laser_sail_launcher.tooltip.0',
            'Works only on the Moon: no air to scatter the beam. A 15 x 15 x 3 phased array of 64 laser module blocks, open to the sky.',
            'Solo funciona en la Luna: no hay aire que disperse el haz. Un array en fase de 15 x 15 x 3 con 64 bloques de módulos láser, abierto al cielo.'],
        ['grindless.machine.laser_sail_launcher.tooltip.1',
            'Four 4 x 4 quadrants of modules, a tungstensteel cooling loop round them, the beam director (a computer casing) in the centre.',
            'Cuatro cuadrantes de 4 x 4 módulos, un circuito de refrigeración de acero de wolframio alrededor y el director del haz (una carcasa de ordenador) en el centro.'],
        ['grindless.machine.laser_sail_launcher.tooltip.2',
            'One sail-chip a launch, aimed with the heliopause data (kept): one Starshot probe in flight. Draws 16 A of UV.',
            'Un sail-chip por lanzamiento, apuntado con los datos de la heliopausa (se conservan): una sonda Starshot en vuelo. Consume 16 A de UV.'],
        ['grindless.machine.laser_sail_launcher.tooltip.3',
            'Each launch wears the array: a fibre laser module from the bus is spent at 64 % and comes out as a spent module for the draw tower.',
            'Cada lanzamiento desgasta el array: un módulo de láser de fibra del bus se gasta al 64 % y sale como módulo gastado para la torre de estirado.'],

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
