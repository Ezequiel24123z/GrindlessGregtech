// priority: 10900
// Gregtech Grindless - names and tooltips of the EV Combined-Cycle Plant and Hot Strip Mill, their recipe types, and the reason both show
// when the controller is set to void fluids.
//
//   gtceu:combined_cycle_plant / gtceu:combined_cycle   (machine name + tooltips, recipe type name)
//   gtceu:hot_strip_mill / gtceu:hot_rolling            (machine name + tooltips, recipe type name)
//   grindless.steam_outputs.no_voiding                  (why the run does not start)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.combined_cycle_plant', 'Combined-Cycle Plant')
    add('gtceu.combined_cycle', 'Combined Cycle')
    add('block.gtceu.hot_strip_mill', 'Hot Strip Mill')
    add('gtceu.hot_rolling', 'Hot Rolling')

    add('grindless.machine.combined_cycle_plant.tooltip.0', '§7Gas turbine with a heat-recovery boiler: power plus steam.')

    add('grindless.machine.hot_strip_mill.tooltip.0', '§7Rolls hot ingots straight into plates, rods or foil.')

    add('grindless.steam_outputs.no_voiding', 'The steam must leave through its hatch: turn fluid voiding off')
})

