// priority: 6100
// Gregtech Grindless - names and tooltips of the MV Ore Plant and Biorefinery.
//
//   gtceu:ore_plant, gtceu:biorefinery            (machine names + tooltips)
//   gtceu:ore_processing, gtceu:bio_distillation  (recipe type names)
//
// Same approach as lv_multis_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.ore_plant', 'Ore Plant')
    add('gtceu.ore_processing', 'Ore Processing')

    add('grindless.machine.ore_plant.tooltip.0', '§7The whole ore chain in one pass: macerate, wash, centrifuge, macerate.')

    add('block.gtceu.biorefinery', 'Biorefinery')
    add('gtceu.bio_distillation', 'Bio Distillation')

    add('grindless.machine.biorefinery.tooltip.0', '§7A distillation column for organic fluids: every fraction in one pass.')
    add('grindless.machine.biorefinery.tooltip.1', 'Every layer needs exactly one output hatch.')
})

