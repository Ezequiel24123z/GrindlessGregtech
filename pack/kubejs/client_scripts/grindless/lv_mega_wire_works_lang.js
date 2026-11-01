// priority: 6956
// Gregtech Grindless - names and tooltips of the LV Wire Works (startup_scripts/grindless/lv/mega_wire_works.js).
//
//   gtceu:wire_works   (machine name + 3 tooltip lines, en_us)
//
// The mode names in the machine mode tab are GTM's own recipe type names (gtceu.wiremill, gtceu.bender), already translated by GTM.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.wire_works', 'Wire Works')
    add('grindless.machine.wire_works.tooltip.0', '§7A steel hall running the wiremill and the bender, up to 8 at once.')
})

