// priority: 10000
// Gregtech Grindless - names and tooltips of the EV Tripod Drill (the EV step of the Vein Drill family, ev/tripod.js).
//
//   gtceu:ev_vein_drill            (machine name + tooltips)
//   grindless:solar_wing_panel     (the block of its solar wings)
//
// The titanium drill bit keeps its keys in hv_family_lang.js (the item was registered in HV). Minecraft merges lang entries from
// every namespace/script, so ClientEvents.lang works fine wherever it is declared. Names go in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.ev_vein_drill', 'EV Tripod Drill')
    add('grindless.machine.ev_vein_drill.tooltip.0', '§7Drills ore veins on the Moon and Mars.')

    add('block.grindless.solar_wing_panel', 'Solar Wing Panel')
    add('tooltip.grindless.solar_wing_panel', 'Silicon cells on a titanium frame: the wings of the EV Tripod Drill. By day they pay part of its energy.')
})

