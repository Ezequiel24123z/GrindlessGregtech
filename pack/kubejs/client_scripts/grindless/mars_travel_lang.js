// priority: 6728
// Gregtech Grindless - names and tooltips of Mars (end of EV, startup_scripts/grindless/mars/travel.js):
//
//   grindless:vein_sample_<Mars vein>     (scheelite_mars, merrillite_mars, ice_mars: data/grindless/tables/veins_mars.json)
//   material.gtceu.deuterium_rich_ice     (the GT material: GTM names its forms from this key)
//   item.gtceu.<form>                     (es_es only: the Spanish name of every GT form of the ice; GTM uses an item-specific key when the
//                                         language has one, TagPrefix.getUnlocalizedName, so en_us keeps GTM's own patterns)
//
// GTM ships no es_es file, so its patterns ("%s Dust", "Crushed %s Ore"...) would mix English with a Spanish material name. The forms
// below are every item GTM 7.5.3 makes for the ice in this pack (one ore block per stone type of GTM, GCYR and the addons). An ore
// block prefix keeps TagPrefix's default pattern "%s_<prefix name>", so the key of gtceu:mars_deuterium_rich_ice_ore is
// item.gtceu.deuterium_rich_ice_mars. The indicator and the buckets keep GTM's English pattern in es_es, like every GTM one.
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Quests are English only; names go in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('item.grindless.vein_sample_scheelite_mars', 'Martian Scheelite Vein Sample')
    add('item.grindless.vein_sample_merrillite_mars', 'Martian Merrillite Vein Sample')
    add('item.grindless.vein_sample_ice_mars', 'Martian Ice Vein Sample')
    add('tooltip.grindless.vein_sample.drill_martian', 'Put it in the input bus of the EV vein drill (the tripod), on Mars, with a titanium drill bit. It is never used up.')
    add('tooltip.grindless.vein_sample.mars', 'Mars: craft it with an empty vein probe and two raw ores of the vein brought back by hand on the first visit.')

    add('material.gtceu.deuterium_rich_ice', 'Deuterium-Rich Ice')
    add('tooltip.grindless.deuterium_rich_ice', 'Martian ground ice with about five times the deuterium of Earth\'s water. Keep it for IV: melted and enriched, it becomes heavy water.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('item.grindless.vein_sample_scheelite_mars', 'Muestra de veta de scheelita marciana')
    add('item.grindless.vein_sample_merrillite_mars', 'Muestra de veta de merrillita marciana')
    add('item.grindless.vein_sample_ice_mars', 'Muestra de veta de hielo marciano')
    add('tooltip.grindless.vein_sample.drill_martian', 'Ponla en el bus de entrada de la perforadora de vetas EV (el trípode), en Marte, con una broca de titanio. No se gasta.')
    add('tooltip.grindless.vein_sample.mars', 'Marte: se hace con una sonda de vetas vacía y dos menas en bruto de la veta traídas a mano en la primera visita.')

    add('material.gtceu.deuterium_rich_ice', 'Hielo rico en deuterio')
    add('tooltip.grindless.deuterium_rich_ice', 'Hielo del subsuelo de Marte con unas cinco veces el deuterio del agua de la Tierra. Guárdalo para IV: fundido y enriquecido, da agua pesada.')

    // ---- the GT forms of the ice
    var name = 'hielo rico en deuterio'
    add('item.gtceu.deuterium_rich_ice_dust', 'Polvo de ' + name)
    add('item.gtceu.small_deuterium_rich_ice_dust', 'Montón pequeño de polvo de ' + name)
    add('item.gtceu.tiny_deuterium_rich_ice_dust', 'Montón diminuto de polvo de ' + name)
    add('item.gtceu.impure_deuterium_rich_ice_dust', 'Montón impuro de polvo de ' + name)
    add('item.gtceu.pure_deuterium_rich_ice_dust', 'Montón purificado de polvo de ' + name)
    add('item.gtceu.crushed_deuterium_rich_ice_ore', 'Mena triturada de ' + name)
    add('item.gtceu.purified_deuterium_rich_ice_ore', 'Mena purificada de ' + name)
    add('item.gtceu.refined_deuterium_rich_ice_ore', 'Mena refinada de ' + name)
    add('item.gtceu.raw_deuterium_rich_ice', 'Hielo rico en deuterio en bruto')
    add('item.gtceu.raw_deuterium_rich_ice_block', 'Bloque de hielo rico en deuterio en bruto')

    // one ore block per stone type (ore prefix name -> where it sits); only the Mars one generates (the Mars vein table)
    var stones = {
        stone: '', andesite: ' en andesita', basalt: ' en basalto', blackstone: ' en piedra negra', deepslate: ' en pizarra profunda',
        diorite: ' en diorita', endstone: ' en piedra del End', granite: ' en granito', gravel: ' en grava', marble: ' en mármol',
        mars: ' de Marte', mercury: ' de Mercurio', moon: ' de la Luna', netherrack: ' en netherrack',
        proxima_centauri_b: ' de Próxima Centauri b', red_granite: ' en granito rojo', red_sand: ' en arena roja', sand: ' en arena',
        tuff: ' en toba', venus: ' de Venus'
    }
    Object.keys(stones).forEach(function (stone) {
        add('item.gtceu.deuterium_rich_ice_' + stone, 'Mena de ' + name + stones[stone])
    })
})

// what the ice is for (GTM already shows the chemical formula)
ItemEvents.tooltip(event => {
    event.add(['gtceu:mars_deuterium_rich_ice_ore', 'gtceu:raw_deuterium_rich_ice', 'gtceu:deuterium_rich_ice_dust'],
        Text.translate('tooltip.grindless.deuterium_rich_ice').gray())
})
