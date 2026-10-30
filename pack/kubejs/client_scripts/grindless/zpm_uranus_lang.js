// priority: 100
// Gregtech Grindless - names and tooltips of ZPM's Uranus orbit machines (startup_scripts/grindless/zpm/uranus.js):
// gtceu:ice_giant_siphon, gtceu:slurry_separator, gtceu:flyby_probe_bay and their recipe types.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.ice_giant_siphon', 'Ice-Giant Siphon')
    add('block.gtceu.slurry_separator', 'Slurry Separator')
    add('block.gtceu.flyby_probe_bay', 'Flyby Probe Bay')
    add('gtceu.ice_giant_siphon', 'Ice-Giant Siphoning')
    add('gtceu.slurry_separation', 'Slurry Separation')
    add('gtceu.outer_flyby', 'Outer Flyby')

    add('grindless.machine.ice_giant_siphon.tooltip.0', '§7Lowers a scoop into Uranus\'s atmosphere.')
    add('grindless.machine.ice_giant_siphon.no_voiding', 'The siphon keeps its gases. Disable voiding.')

    add('grindless.machine.slurry_separator.tooltip.0', '§7Separates diamond slurry in a cascade of cyclones.')
    add('grindless.machine.slurry_separator.no_voiding', 'The separator keeps its diamonds and seeds. Disable voiding.')

    add('grindless.machine.flyby_probe_bay.tooltip.0', '§7Launches a probe on Voyager 2\'s route to Neptune.')
    add('grindless.machine.flyby_probe_bay.no_voiding', 'The bay keeps its recordings. Disable voiding.')
    add('emi.grindless.info.pressure_hull_casing.0', 'A thick-walled casing that holds out against the pressure of an ice giant. It builds the walls, roof and floor of the Ice-Giant Siphon and the Slurry Separator.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.ice_giant_siphon', 'Sif\u00f3n de gigante de hielo')
    add('block.gtceu.slurry_separator', 'Separador de lodo')
    add('block.gtceu.flyby_probe_bay', 'Bah\u00eda de sondas de sobrevuelo')
    add('gtceu.ice_giant_siphon', 'Sifonado de gigante de hielo')
    add('gtceu.slurry_separation', 'Separaci\u00f3n de lodo')
    add('gtceu.outer_flyby', 'Sobrevuelo exterior')

    add('grindless.machine.ice_giant_siphon.tooltip.0', '§7Baja una cuchara a la atmósfera de Urano.')
    add('grindless.machine.ice_giant_siphon.no_voiding', 'El sif\u00f3n conserva sus gases. Desactiva el descarte.')

    add('grindless.machine.slurry_separator.tooltip.0', '§7Separa lodo de diamante en una cascada de ciclones.')
    add('grindless.machine.slurry_separator.no_voiding', 'El separador conserva sus diamantes y semillas. Desactiva el descarte.')

    add('grindless.machine.flyby_probe_bay.tooltip.0', '§7Lanza una sonda por la ruta de la Voyager 2 a Neptuno.')
    add('grindless.machine.flyby_probe_bay.no_voiding', 'La bah\u00eda conserva sus grabaciones. Desactiva el descarte.')
    add('emi.grindless.info.pressure_hull_casing.0', 'Una carcasa de paredes gruesas que resiste la presi\u00f3n de un gigante de hielo. Construye las paredes, el techo y el suelo del Sif\u00f3n de gigante de hielo y del Separador de lodo.')
})
