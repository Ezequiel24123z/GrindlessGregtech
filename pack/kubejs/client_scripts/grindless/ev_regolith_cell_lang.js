// priority: 10200
// Gregtech Grindless - names and tooltips of the EV Regolith Cell.
//
//   gtceu:regolith_cell            (machine name + tooltips)
//   gtceu:regolith_processing      (recipe type name)
//   grindless:platinum_electrode   (one more tooltip line: it is also the cell's anode; its name and first line are in ev_platinum_plant_lang.js)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.regolith_cell', 'Regolith Cell')
    add('gtceu.regolith_processing', 'Regolith Processing')

    add('grindless.machine.regolith_cell.tooltip.0', '§7Processes lunar regolith into its gases and minerals.')

    add('tooltip.grindless.platinum_electrode.regolith_cell', 'Also the anode of the Regolith Cell\'s electrolysis, on the Moon.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.regolith_cell', 'Celda de regolito')
    add('gtceu.regolith_processing', 'Procesado de regolito')

    add('grindless.machine.regolith_cell.tooltip.0', '§7Procesa regolito lunar en sus gases y minerales.')

    add('tooltip.grindless.platinum_electrode.regolith_cell', 'También es el ánodo de la electrólisis de la celda de regolito, en la Luna.')
})

ItemEvents.tooltip(event => {
    event.add('grindless:platinum_electrode', Text.translate('tooltip.grindless.platinum_electrode.regolith_cell').darkGray())
})
