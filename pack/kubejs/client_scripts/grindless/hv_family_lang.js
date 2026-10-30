// priority: 9700
// Gregtech Grindless - names and tooltips of the HV step of the Vein Drill / Greenhouse family.
//
//   gtceu:hv_vein_drill, gtceu:hv_greenhouse   (machine names + tooltips)
//   grindless:stainless_steel_drill_bit        (drill bit; HV has no titanium)
//   grindless:titanium_drill_bit               (the old HV bit; since EV the EV Tripod Drill's bit again, ev/tripod.js)
//   grindless:vein_sample_<end vein>           (4 End vein samples, and the old scheelite one that saves keep)
//
// Kept out of pack/kubejs/assets/grindless/lang/* (owned by another agent), like lv_multis_lang.js and mv_family_lang.js:
// Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine wherever it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.hv_vein_drill', 'HV Vein Drill')
    add('block.gtceu.hv_greenhouse', 'HV Greenhouse')

    add('grindless.machine.hv_vein_drill.tooltip.0', '§7Drills the vein marked by the vein sample, up to 32 bores at once.')
    add('grindless.machine.hv_vein_drill.tooltip.1', 'Takes a stainless steel drill bit.')

    add('grindless.machine.hv_greenhouse.tooltip.0', '§7Grows trees, crops, mushrooms and flowers, up to 32 at once.')

    add('item.grindless.stainless_steel_drill_bit', 'Stainless Steel Drill Bit')
    add('tooltip.grindless.stainless_steel_drill_bit', 'Wears out by chance: about 0.5% of the runs, 0.25% with drilling fluid. Only the HV Vein Drill and better take it.')
    add('item.grindless.titanium_drill_bit', 'Titanium Drill Bit')
    add('tooltip.grindless.titanium_drill_bit', 'The bit of the EV Tripod Drill, turned on an EV lathe. Wears out by chance: about 1% of the runs drilling dry, 0.25% cooled with liquid nitrogen.')

    add('tooltip.grindless.vein_sample.drill_hv', 'Put it in the input bus of the MV Vein Drill (vanadium steel bit) or the HV one (vanadium steel or stainless steel bit), with drilling fluid in its fluid hatch. It is never used up.')
    add('tooltip.grindless.vein_sample.end', 'End vein: it only drills with drilling fluid, in the MV Vein Drill and better. Craft it with an empty vein probe and two raw ores of the vein: one trip to the End is enough.')

    add('item.grindless.vein_sample_bauxite_end', 'End Bauxite Vein Sample')
    add('item.grindless.vein_sample_magnetite_end', 'End Magnetite Vein Sample')
    add('item.grindless.vein_sample_sheldonite', 'End Sheldonite Vein Sample')
    add('item.grindless.vein_sample_scheelite', 'End Scheelite Vein Sample (old)')
    add('tooltip.grindless.vein_sample.legacy', 'Old sample: its vein left the End (scheelite comes back on Mars). Craft it back into an empty vein probe.')
    add('item.grindless.vein_sample_zirconium', 'End Zirconium Vein Sample')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.hv_vein_drill', 'Perforadora de vetas HV')
    add('block.gtceu.hv_greenhouse', 'Invernadero HV')

    add('grindless.machine.hv_vein_drill.tooltip.0', '§7Perfora la veta que marca la muestra, hasta 32 perforaciones a la vez.')
    add('grindless.machine.hv_vein_drill.tooltip.1', 'Usa una broca de acero inoxidable.')

    add('grindless.machine.hv_greenhouse.tooltip.0', '§7Cultiva árboles, cosechas, setas y flores, hasta 32 a la vez.')

    add('item.grindless.stainless_steel_drill_bit', 'Broca de acero inoxidable')
    add('tooltip.grindless.stainless_steel_drill_bit', 'Se desgasta por probabilidad: cerca del 0,5 % de los ciclos, 0,25 % con lodo de perforación. Solo la admiten la perforadora de vetas HV y las mejores.')
    add('item.grindless.titanium_drill_bit', 'Broca de titanio')
    add('tooltip.grindless.titanium_drill_bit', 'La broca de la perforadora trípode EV, torneada en un torno EV. Se desgasta por probabilidad: cerca del 1 % de los ciclos en seco, 0,25 % refrigerada con nitrógeno líquido.')

    add('tooltip.grindless.vein_sample.drill_hv', 'Ponla en el bus de entrada de la perforadora de vetas MV (broca de acero vanádico) o de la HV (de acero vanádico o de acero inoxidable), con lodo de perforación en su escotilla de fluidos. No se gasta.')
    add('tooltip.grindless.vein_sample.end', 'Veta del End: solo se perfora con lodo de perforación, con la perforadora de vetas MV y las mejores. Se hace con una sonda de vetas vacía y dos menas en bruto de la veta: basta un viaje al End.')

    add('item.grindless.vein_sample_bauxite_end', 'Muestra de veta de bauxita del End')
    add('item.grindless.vein_sample_magnetite_end', 'Muestra de veta de magnetita del End')
    add('item.grindless.vein_sample_sheldonite', 'Muestra de veta de sheldonita del End')
    add('item.grindless.vein_sample_scheelite', 'Muestra de veta de scheelita del End (antigua)')
    add('tooltip.grindless.vein_sample.legacy', 'Muestra antigua: su veta ya no está en el End (la scheelita vuelve en Marte). Fabrica con ella una sonda de vetas vacía.')
    add('item.grindless.vein_sample_zirconium', 'Muestra de veta de circonio del End')
})
