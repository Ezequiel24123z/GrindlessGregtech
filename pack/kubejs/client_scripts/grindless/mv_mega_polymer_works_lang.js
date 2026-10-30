// priority: 6150
// Gregtech Grindless - names and tooltips of the MV Polymer Works (startup_scripts/grindless/mv/mega_polymer_works.js).
//
//   gtceu:polymer_works / gtceu.polymer_works   (machine name + 3 tooltip lines, recipe type name; en_us and es_es)
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.polymer_works', 'Polymer Works')
    add('gtceu.polymer_works', 'Polymer Works')
    add('grindless.machine.polymer_works.tooltip.0', '§7A steel hall running whole polyethylene and rubber plate lines, 16 at once.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.polymer_works', 'Taller de Polímeros')
    add('gtceu.polymer_works', 'Taller de Polímeros')
    add('grindless.machine.polymer_works.tooltip.0', '§7Líneas enteras de placas de polietileno y caucho, 16 a la vez.')
})
