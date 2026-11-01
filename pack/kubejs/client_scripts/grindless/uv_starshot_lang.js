// priority: 1900
// Gregtech Grindless - names and tooltips of UV's Starshot (startup_scripts/grindless/uv/starshot.js; package UV-A12):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   item.grindless.<item>, tooltip.grindless.<item>.0/.1          the new items
//   material.gtceu.<n>                                            the new GT materials
//
// The light sail, starchip, sail-chip and Starshot probe are F1's and named in uv_foundation_lang.js. Kept out of
// pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.light_sail_fab', 'Light Sail Fab'],
        ['gtceu.light_sail', 'Light Sail'],
        ['block.gtceu.starchip_fab', 'Starchip Fab'],
        ['gtceu.starchip', 'Starchip'],
        ['block.gtceu.laser_sail_launcher', 'Laser Sail Launcher'],
        ['gtceu.laser_sail_launch', 'Laser Sail Launch'],

        ['grindless.machine.light_sail_fab.tooltip.0',
            '§7Casts the 100 nm light sail film.'],
        ['grindless.machine.light_sail_fab.tooltip.1',
            'Works only in Earth orbit.'],

        ['grindless.machine.starchip_fab.tooltip.0',
            '§7Builds the Starshot\'s starchip in a clean room.'],

        ['grindless.machine.laser_sail_launcher.tooltip.0',
            '§7A phased laser array that launches the light sail.'],
        ['grindless.machine.laser_sail_launcher.tooltip.1',
            'Works only on the Moon.'],

        ['item.grindless.epitaxial_silicon_wafer', 'Epitaxial Silicon Wafer'],
        ['tooltip.grindless.epitaxial_silicon_wafer.0', 'Silicon grown from silane in the wake shield\'s hard vacuum.'],
        ['tooltip.grindless.epitaxial_silicon_wafer.1', 'The light sail\'s carrier.'],
        ['item.grindless.nitride_coated_carrier', 'Nitride-Coated Carrier'],
        ['tooltip.grindless.nitride_coated_carrier.0', '100 nm of silicon nitride on the epitaxial wafer.'],
        ['tooltip.grindless.nitride_coated_carrier.1', 'Patterned next in the light sail fab.'],
        ['item.grindless.patterned_sail_carrier', 'Patterned Sail Carrier'],
        ['tooltip.grindless.patterned_sail_carrier.0', 'The film cut into an hBN-backed reflecting metasurface.'],
        ['tooltip.grindless.patterned_sail_carrier.1', 'Xenon difluoride frees the sail from the silicon.'],

        ['material.gtceu.silane', 'Silane'],
        ['material.gtceu.xenon_difluoride', 'Xenon Difluoride'],
        ['material.gtceu.silicon_tetrafluoride', 'Silicon Tetrafluoride']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
