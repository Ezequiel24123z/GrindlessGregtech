// priority: 6400
// Gregtech Grindless - names and tooltips of the MV step of the Vein Drill / Greenhouse family.
//
//   gtceu:mv_vein_drill, gtceu:mv_greenhouse   (machine names + tooltips)
//   grindless:vanadium_steel_drill_bit         (drill bit)
//
// Kept out of pack/kubejs/assets/grindless/lang/* (owned by another agent), like lv_multis_lang.js and dimensions_lang.js:
// Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine wherever it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.mv_vein_drill', 'MV Vein Drill')
    add('block.gtceu.mv_greenhouse', 'MV Greenhouse')

    add('grindless.machine.mv_vein_drill.tooltip.0', '§7Drills the vein marked by the vein sample, up to 16 bores at once.')
    add('grindless.machine.mv_vein_drill.tooltip.1', 'Takes a vanadium steel drill bit.')

    add('grindless.machine.mv_greenhouse.tooltip.0', '§7Grows trees, crops, mushrooms and flowers, up to 16 at once.')

    add('item.grindless.vanadium_steel_drill_bit', 'Vanadium Steel Drill Bit')
    add('tooltip.grindless.vanadium_steel_drill_bit', 'Wears out by chance: about 1% of the runs, 0.5% with drilling fluid. Only the MV Vein Drill takes it.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.mv_vein_drill', 'Perforadora de vetas MV')
    add('block.gtceu.mv_greenhouse', 'Invernadero MV')

    add('grindless.machine.mv_vein_drill.tooltip.0', '§7Perfora la veta que marca la muestra, hasta 16 perforaciones a la vez.')
    add('grindless.machine.mv_vein_drill.tooltip.1', 'Usa una broca de acero vanádico.')

    add('grindless.machine.mv_greenhouse.tooltip.0', '§7Cultiva árboles, cosechas, setas y flores, hasta 16 a la vez.')

    add('item.grindless.vanadium_steel_drill_bit', 'Broca de acero vanádico')
    add('tooltip.grindless.vanadium_steel_drill_bit', 'Se desgasta por probabilidad: cerca del 1 % de los ciclos, 0,5 % con lodo de perforación. Solo la admite la perforadora de vetas MV.')
})
