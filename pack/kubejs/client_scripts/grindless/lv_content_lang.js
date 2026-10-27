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

    add('grindless.machine.sulfide_roaster.tooltip.0', 'Roasts sulfide ores with air instead of oxygen and turns their sulfur dioxide into sulfuric acid in the same run. In GTM that takes an EBF fed with oxygen and two chemical reactors.')
    add('grindless.machine.sulfide_roaster.tooltip.1', 'Draws 4 A at LV (120 EU/t) from its two energy hatches. A Vanadium Contact Catalyst in the input bus wears out by chance (about 2% of the runs).')
    add('grindless.machine.sulfide_roaster.tooltip.2', 'Air and water go into the input hatches; the acid and the steam of its waste-heat boiler come out of the output hatches. Galena gives silver, and plain sulfur burns into acid.')
    add('grindless.machine.sulfide_roaster.tooltip.3', 'Needs 2 energy hatches, 1 input bus, 2 input hatches, 1 output bus and 2 output hatches.')

    add('grindless.machine.heliostat_tower.tooltip.0', 'A field of 28 mirrors focuses sunlight on the receiver at the top of the tower and boils water with no fuel: 800 mB of steam per tick, a Large Bronze Boiler at full fire.')
    add('grindless.machine.heliostat_tower.tooltip.1', 'Works only by day, with open sky over the tower and its mirrors and no rain falling on it (a desert never stops it). Store the day\'s steam in a multiblock tank for the night.')
    add('grindless.machine.heliostat_tower.tooltip.2', 'The mirror drives draw 16 EU/t. Takes water, or the distilled water the steam turbines give back.')
    add('grindless.machine.heliostat_tower.tooltip.3', 'Needs 1 energy hatch, 1 input hatch and 1 output hatch. Pipe the steam out all the time: an LV output hatch holds two runs.')
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

    add('grindless.machine.sulfide_roaster.tooltip.0', 'Tuesta menas de sulfuro con aire en lugar de oxígeno y convierte su dióxido de azufre en ácido sulfúrico en el mismo ciclo. En GTM hacen falta un EBF con oxígeno y dos reactores químicos.')
    add('grindless.machine.sulfide_roaster.tooltip.1', 'Consume 4 A a LV (120 EU/t) de sus dos escotillas de energía. Un catalizador de contacto de vanadio en el bus de entrada se desgasta por probabilidad (en torno al 2 % de los ciclos).')
    add('grindless.machine.sulfide_roaster.tooltip.2', 'El aire y el agua entran por las escotillas de entrada; el ácido y el vapor de su caldera de recuperación salen por las de salida. La galena da plata, y el azufre suelto se quema en ácido.')
    add('grindless.machine.sulfide_roaster.tooltip.3', 'Necesita 2 escotillas de energía, 1 bus de entrada, 2 escotillas de entrada, 1 bus de salida y 2 escotillas de salida.')

    add('grindless.machine.heliostat_tower.tooltip.0', 'Un campo de 28 espejos concentra el sol en el receptor de lo alto de la torre y hierve agua sin combustible: 800 mB de vapor por tick, lo que una caldera grande de bronce a todo fuego.')
    add('grindless.machine.heliostat_tower.tooltip.1', 'Solo funciona de día, con cielo abierto sobre la torre y sus espejos y sin lluvia encima (en un desierto nunca se para). Guarda el vapor del día en un tanque multibloque para la noche.')
    add('grindless.machine.heliostat_tower.tooltip.2', 'Los motores de los espejos consumen 16 EU/t. Acepta agua, o el agua destilada que devuelven las turbinas de vapor.')
    add('grindless.machine.heliostat_tower.tooltip.3', 'Necesita 1 escotilla de energía, 1 escotilla de entrada y 1 de salida. Saca el vapor todo el rato: en una escotilla de salida LV solo caben dos ciclos.')
    add('grindless.machine.heliostat_tower.no_sun', 'No llega el sol al receptor: hace falta que sea de día, cielo abierto sobre la torre y los espejos, y que no llueva.')

    add('item.grindless.contact_catalyst', 'Catalizador de contacto de vanadio')
    add('tooltip.grindless.contact_catalyst', 'Convierte el dióxido de azufre en ácido sulfúrico en el tostador de sulfuros. Se desgasta por probabilidad (en torno al 2 % de los ciclos). Se mezcla con vanadio y diatomita.')
    add('block.grindless.heliostat_mirror', 'Espejo de heliostato')
    add('tooltip.grindless.heliostat_mirror', 'El campo de espejos de la torre solar de heliostatos: 28, en cuatro filas de siete detrás de la torre.')
})
