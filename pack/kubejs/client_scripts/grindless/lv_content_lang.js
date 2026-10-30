// priority: 6900
// Gregtech Grindless - names and tooltips of the LV "more reinforced" content: the Sulfide Roaster and the Heliostat Tower.
//
//   gtceu:sulfide_roaster, gtceu:heliostat_tower        (machine names + tooltips + the heliostat's "no sun" reason)
//   gtceu:sulfide_roasting, gtceu:solar_steam           (recipe type names)
//   grindless:contact_catalyst, grindless:heliostat_mirror
//
// Registered by startup_scripts/grindless/lv/sulfide_roaster.js and lv/heliostat_tower.js; recipes in server_scripts/grindless/lv/.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.sulfide_roaster', 'Sulfide Roaster')
    add('block.gtceu.heliostat_tower', 'Heliostat Tower')
    add('gtceu.sulfide_roasting', 'Sulfide Roasting')
    add('gtceu.solar_steam', 'Solar Steam')

    add('grindless.machine.sulfide_roaster.tooltip.0', '§7Roasts sulfide ores with air and makes sulfuric acid in the same run.')
    add('grindless.machine.sulfide_roaster.tooltip.1', 'Needs a Vanadium Contact Catalyst in the input bus.')

    add('grindless.machine.heliostat_tower.tooltip.0', '§7Boils water with sunlight and no fuel: 800 mB of steam per tick.')
    add('grindless.machine.heliostat_tower.tooltip.1', 'Works only by day, with open sky and no rain.')
    add('grindless.machine.heliostat_tower.no_sun', 'No sun on the receiver: it needs daytime, open sky over the tower and the mirrors, and no rain.')

    add('item.grindless.contact_catalyst', 'Vanadium Contact Catalyst')
    add('tooltip.grindless.contact_catalyst', 'Turns sulfur dioxide into sulfuric acid in the Sulfide Roaster. Wears out by chance (about 2% of the runs). Mixed from vanadium and diatomite.')
    add('block.grindless.heliostat_mirror', 'Heliostat Mirror')
    add('tooltip.grindless.heliostat_mirror', 'The mirror field of the Heliostat Tower: 28 of them, in four rows of seven behind the tower.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.sulfide_roaster', 'Tostador de sulfuros')
    add('block.gtceu.heliostat_tower', 'Torre solar de heliostatos')
    add('gtceu.sulfide_roasting', 'Tostación de sulfuros')
    add('gtceu.solar_steam', 'Vapor solar')

    add('grindless.machine.sulfide_roaster.tooltip.0', '§7Tuesta menas de sulfuro con aire y hace ácido sulfúrico en el mismo ciclo.')
    add('grindless.machine.sulfide_roaster.tooltip.1', 'Pide un catalizador de contacto de vanadio en el bus.')

    add('grindless.machine.heliostat_tower.tooltip.0', '§7Hierve agua con luz solar y sin combustible: 800 mB de vapor por tick.')
    add('grindless.machine.heliostat_tower.tooltip.1', 'Solo funciona de día, con cielo abierto y sin lluvia.')
    add('grindless.machine.heliostat_tower.no_sun', 'No llega el sol al receptor: hace falta que sea de día, cielo abierto sobre la torre y los espejos, y que no llueva.')

    add('item.grindless.contact_catalyst', 'Catalizador de contacto de vanadio')
    add('tooltip.grindless.contact_catalyst', 'Convierte el dióxido de azufre en ácido sulfúrico en el tostador de sulfuros. Se desgasta por probabilidad (en torno al 2 % de los ciclos). Se mezcla con vanadio y diatomita.')
    add('block.grindless.heliostat_mirror', 'Espejo de heliostato')
    add('tooltip.grindless.heliostat_mirror', 'El campo de espejos de la torre solar de heliostatos: 28, en cuatro filas de siete detrás de la torre.')
})
