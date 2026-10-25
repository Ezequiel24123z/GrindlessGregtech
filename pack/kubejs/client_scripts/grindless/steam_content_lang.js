// Gregtech Grindless - names and tooltips of the Steam Age additions of the journey plan (docs/journey.md):
//
//   gtceu:steam_blast_furnace, gtceu:coking_battery     (machine names + tooltips)
//   gtceu:steelmaking, gtceu:coking                     (recipe type names)
//   #grindless:blast_furnace_fluxes                     (tag name, shown by EMI)
//
// Kept out of pack/kubejs/assets/grindless/lang/* (owned by another agent): Minecraft merges lang entries from every
// script, so ClientEvents.lang works wherever it is declared (same approach as lv_multis_lang.js).
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.steam_blast_furnace', 'Steam Blast Furnace')
    add('block.gtceu.coking_battery', 'By-product Coke Battery')
    add('gtceu.steelmaking', 'Steelmaking')
    add('gtceu.coking', 'Coking')
    add('tag.item.grindless.blast_furnace_fluxes', 'Blast Furnace Fluxes')

    add('grindless.machine.steam_blast_furnace.tooltip.0', 'Turns iron ore straight into steel: the furnace and the Primitive Blast Furnace in one. Takes raw or crushed iron ores, iron ingots and iron dust.')
    add('grindless.machine.steam_blast_furnace.tooltip.1', '4 iron + 4 coke + 1 calcite flux (raw, dust or block) -> 4 steel + 1 ash. Runs 4 batches at once: about 5 steel a minute, as much as 6 or 7 Primitive Blast Furnaces.')
    add('grindless.machine.steam_blast_furnace.tooltip.2', 'The hot blast is driven by steam: about 57 mB/t while it works. The ash is the slag: void it, or keep it for fertilizer at LV.')
    add('grindless.machine.steam_blast_furnace.tooltip.3', 'Needs 1 steam input hatch, 1 steam input bus and 1 or 2 steam output buses in the hearth. Keep the shaft empty.')

    add('grindless.machine.coking_battery.tooltip.0', 'Cokes coal like the coke oven but keeps the gas: 1 coal -> 1 coke + 500 mB creosote + 125 mB coal gas.')
    add('grindless.machine.coking_battery.tooltip.1', 'Runs 4 chambers at once, as fast as 6 or 7 coke ovens, for about 28 mB/t of steam.')
    add('grindless.machine.coking_battery.tooltip.2', 'Coal gas is poisonous: keep it in tanks. From LV it fuels gas turbines and the distillery. When its hatch is full, the battery stops.')
    add('grindless.machine.coking_battery.tooltip.3', 'Needs 1 steam input hatch and 1 or 2 steam output buses in the base, and 1 steam input bus and 2 fluid output hatches in the roof.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.steam_blast_furnace', 'Alto horno de vapor')
    add('block.gtceu.coking_battery', 'Batería de coque con subproductos')
    add('gtceu.steelmaking', 'Fabricación de acero')
    add('gtceu.coking', 'Coquización')
    add('tag.item.grindless.blast_furnace_fluxes', 'Fundentes de alto horno')

    add('grindless.machine.steam_blast_furnace.tooltip.0', 'Convierte la mena de hierro directamente en acero: el horno y el alto horno primitivo en una sola máquina. Admite menas de hierro en bruto o trituradas, lingotes y polvo de hierro.')
    add('grindless.machine.steam_blast_furnace.tooltip.1', '4 de hierro + 4 de coque + 1 de calcita como fundente (en bruto, en polvo o en bloque) -> 4 de acero + 1 de ceniza. Hace 4 cargas a la vez: unos 5 lingotes por minuto, lo mismo que 6 o 7 altos hornos primitivos.')
    add('grindless.machine.steam_blast_furnace.tooltip.2', 'El viento caliente lo mueve el vapor: unos 57 mB/t mientras trabaja. La ceniza es la escoria: tírala o guárdala para el fertilizante de LV.')
    add('grindless.machine.steam_blast_furnace.tooltip.3', 'Necesita 1 escotilla de vapor, 1 bus de entrada de vapor y 1 o 2 buses de salida de vapor en el crisol. El hueco de dentro tiene que quedar vacío.')

    add('grindless.machine.coking_battery.tooltip.0', 'Coquiza el carbón como el horno de coque, pero se queda el gas: 1 de carbón -> 1 de coque + 500 mB de creosota + 125 mB de gas de hulla.')
    add('grindless.machine.coking_battery.tooltip.1', 'Trabaja con 4 cámaras a la vez, tan rápido como 6 o 7 hornos de coque, y gasta unos 28 mB/t de vapor.')
    add('grindless.machine.coking_battery.tooltip.2', 'El gas de hulla es venenoso: guárdalo en tanques. Desde LV alimenta las turbinas de gas y la destiladora. Si su escotilla se llena, la batería se para.')
    add('grindless.machine.coking_battery.tooltip.3', 'Necesita 1 escotilla de vapor y 1 o 2 buses de salida de vapor en la base, y 1 bus de entrada de vapor y 2 escotillas de salida de fluidos en el techo.')
})
