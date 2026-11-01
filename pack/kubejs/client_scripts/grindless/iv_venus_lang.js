// priority: 8400
// Gregtech Grindless - names and tooltips of IV on Venus (startup_scripts/grindless/iv/venus.js): the Pressurized Vein Drill, the Venus
// Heat Engine and the Venus Acid Works, their recipe types, and the controller lines (off site, and why the acid works refuses voiding).
//
//   gtceu:pressurized_vein_drill                                  (machine name + tooltips)
//   gtceu:venus_heat_engine / gtceu:venus_heat                    (machine name + tooltips, recipe type name)
//   gtceu:venus_acid_works / gtceu:acid_cracking                  (machine name + tooltips, recipe type name)
//   grindless.machine.pressurized_vein_drill.off_site, grindless.machine.venus_heat_engine.not_venus,
//   grindless.machine.venus_acid_works.not_venus / .no_voiding    (controller lines)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.pressurized_vein_drill', 'Pressurized Vein Drill')
    add('block.gtceu.venus_heat_engine', 'Venus Heat Engine')
    add('gtceu.venus_heat', 'Venus Heat')
    add('block.gtceu.venus_acid_works', 'Venus Acid Works')
    add('gtceu.acid_cracking', 'Acid Cracking')

    add('grindless.machine.pressurized_vein_drill.tooltip.0', '§7Drills veins on Venus and Mars under high pressure.')

    add('grindless.machine.venus_heat_engine.tooltip.0', '§7Heat engine powered by Venus\'s hot ground.')

    add('grindless.machine.venus_acid_works.tooltip.0', '§7Cracks Venusian sulfuric acid into water and oxygen.')

    add('grindless.machine.pressurized_vein_drill.off_site', 'No vein to drill here: the drill works on Venus and on Mars')
    add('grindless.machine.venus_heat_engine.not_venus', 'No heat here: the engine only works on Venus')
    add('grindless.machine.venus_acid_works.not_venus', 'No clouds here: the acid works only works on Venus')
    add('grindless.machine.venus_acid_works.no_voiding', 'Circuit 2 keeps the sulfur dioxide: turn fluid voiding off, or use circuit 1, which returns it to Venus\'s air')
})

