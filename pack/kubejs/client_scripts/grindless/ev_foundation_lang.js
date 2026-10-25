// Gregtech Grindless - names and tooltips of the EV foundation (startup_scripts/grindless/ev/foundation.js):
//
//   grindless:sintered_regolith, molten_salt_charge, ruthenium_catalyst, mars_chart     (block and items)
//   material.gtceu.lunar_regolith / merrillite / methalox                              (the GT materials: GTM names their forms from these)
//   grindless.fluid.liquid_nitrogen                                                    (the name of gtceu:liquid_nitrogen, in both languages)
//   item.gtceu.<form>                                                                  (es_es only: the Spanish name of every GT form of the
//                                                                                      new materials; GTM uses an item-specific key when the
//                                                                                      language has one, TagPrefix.getUnlocalizedName, so
//                                                                                      en_us keeps GTM's own patterns)
//
// GTM ships no es_es file, so its patterns ("%s Dust", "Crushed %s Ore"...) would mix English with a Spanish material name. The forms
// below are every item GTM 7.5.3 makes for these materials in this pack (one ore block per stone type of GTM, GCYR and the addons).
// The item-specific key is item.gtceu.<the prefix's idPattern with the material>: for dusts, crushed ores and raw ores that is the item
// path, but an ore block prefix keeps TagPrefix's default pattern "%s_<prefix name>", so the key of gtceu:mars_merrillite_ore is
// item.gtceu.merrillite_mars (and of the stone one item.gtceu.merrillite_stone). The indicator is named by the global
// block.surface_rock pattern (SurfaceRockBlock) and buckets by GTM's "%s Bucket" (GTBucketItem): neither has a per-item key, so they
// keep GTM's English pattern in es_es, like every GTM indicator and bucket.
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Quests are English only; names go in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.grindless.sintered_regolith', 'Sintered Regolith Bricks')
    add('tooltip.grindless.sintered_regolith.0', 'Lunar regolith fused into hard, glassy bricks. Every structure of the Moon base stands on them.')
    add('tooltip.grindless.sintered_regolith.1', 'Made only on the Moon: an electric furnace bakes 4 lunar regolith dust into one block.')

    add('item.grindless.molten_salt_charge', 'Molten Salt Charge')
    add('tooltip.grindless.molten_salt_charge.0', 'A titanium crucible of calcium chloride with a titanium cathode basket. In the Regolith Cell the salt melts, and the ilmenite in the basket gives up its oxygen and leaves titanium: no chlorine, no magnesium.')
    add('tooltip.grindless.molten_salt_charge.1', 'It sits in the cell\'s input bus and is never used up.')

    add('item.grindless.ruthenium_catalyst', 'Ruthenium Catalyst')
    add('tooltip.grindless.ruthenium_catalyst.0', 'Ruthenium on alumina pellets, the Sabatier catalyst: carbon dioxide and hydrogen become methane and water.')
    add('tooltip.grindless.ruthenium_catalyst.1', 'It goes in the input bus of the Atmosphere Processor and is used up by chance.')

    add('item.grindless.mars_chart', 'Mars Transfer Chart')
    add('tooltip.grindless.mars_chart.0', 'A data stick with the radio fixes of Mars: its orbit, the next transfer window and a landing ellipse on the northern plains.')
    add('tooltip.grindless.mars_chart.1', 'Written by the Deep Space Antenna on the far side of the Moon. The tier 2 rocket parts are assembled with it, and it is never used up.')

    add('material.gtceu.lunar_regolith', 'Lunar Regolith')
    add('material.gtceu.merrillite', 'Merrillite')
    add('material.gtceu.methalox', 'Methalox')
    add('grindless.fluid.liquid_nitrogen', 'Liquid Nitrogen')

    add('tooltip.grindless.lunar_regolith_dust', 'Ground lunar soil: basalt, glass beads and a little solar-wind gas. On the Moon it sinters into bricks.')
    add('tooltip.grindless.merrillite', 'The phosphate that carries the rare earths of Mars. Only the extraction cascade splits it into samarium, neodymium and the rest.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.grindless.sintered_regolith', 'Ladrillos de regolito sinterizado')
    add('tooltip.grindless.sintered_regolith.0', 'Regolito lunar fundido en ladrillos duros y vítreos. Todas las estructuras de la base lunar se apoyan en ellos.')
    add('tooltip.grindless.sintered_regolith.1', 'Solo se hacen en la Luna: un horno eléctrico cuece 4 polvos de regolito lunar en un bloque.')

    add('item.grindless.molten_salt_charge', 'Carga de sal fundida')
    add('tooltip.grindless.molten_salt_charge.0', 'Un crisol de titanio con cloruro de calcio y una cesta catódica de titanio. En la celda de regolito la sal se funde, y la ilmenita de la cesta suelta su oxígeno y deja titanio: sin cloro y sin magnesio.')
    add('tooltip.grindless.molten_salt_charge.1', 'Va en el bus de entrada de la celda y no se gasta nunca.')

    add('item.grindless.ruthenium_catalyst', 'Catalizador de rutenio')
    add('tooltip.grindless.ruthenium_catalyst.0', 'Bolitas de alúmina con rutenio, el catalizador de Sabatier: el dióxido de carbono y el hidrógeno se vuelven metano y agua.')
    add('tooltip.grindless.ruthenium_catalyst.1', 'Va en el bus de entrada del procesador atmosférico y se gasta por azar.')

    add('item.grindless.mars_chart', 'Carta de transferencia a Marte')
    add('tooltip.grindless.mars_chart.0', 'Una memoria de datos con las posiciones de radio de Marte: su órbita, la próxima ventana de transferencia y una elipse de aterrizaje en las llanuras del norte.')
    add('tooltip.grindless.mars_chart.1', 'La escribe la antena de espacio profundo desde la cara oculta de la Luna. Con ella se montan las piezas del cohete de nivel 2, y no se gasta nunca.')

    add('material.gtceu.lunar_regolith', 'Regolito lunar')
    add('material.gtceu.merrillite', 'Merrillita')
    add('material.gtceu.methalox', 'Metalox')
    add('grindless.fluid.liquid_nitrogen', 'Nitrógeno líquido')

    add('tooltip.grindless.lunar_regolith_dust', 'Suelo lunar molido: basalto, perlas de vidrio y un poco de gas del viento solar. En la Luna se sinteriza en ladrillos.')
    add('tooltip.grindless.merrillite', 'El fosfato que lleva las tierras raras de Marte. Solo la cascada de extracción lo separa en samario, neodimio y el resto.')

    // ---- the GT forms of the new materials
    var dusts = function (material, name) {
        add('item.gtceu.' + material + '_dust', 'Polvo de ' + name)
        add('item.gtceu.small_' + material + '_dust', 'Montón pequeño de polvo de ' + name)
        add('item.gtceu.tiny_' + material + '_dust', 'Montón diminuto de polvo de ' + name)
    }
    dusts('lunar_regolith', 'regolito lunar')
    dusts('merrillite', 'merrillita')

    add('item.gtceu.impure_merrillite_dust', 'Montón impuro de polvo de merrillita')
    add('item.gtceu.pure_merrillite_dust', 'Montón purificado de polvo de merrillita')
    add('item.gtceu.crushed_merrillite_ore', 'Mena triturada de merrillita')
    add('item.gtceu.purified_merrillite_ore', 'Mena purificada de merrillita')
    add('item.gtceu.refined_merrillite_ore', 'Mena refinada de merrillita')
    add('item.gtceu.raw_merrillite', 'Merrillita en bruto')
    add('item.gtceu.raw_merrillite_block', 'Bloque de merrillita en bruto')

    // one ore block per stone type (ore prefix name -> where it sits); only the Mars one generates (the Mars vein table)
    var stones = {
        stone: '', andesite: ' en andesita', basalt: ' en basalto', blackstone: ' en piedra negra', deepslate: ' en pizarra profunda',
        diorite: ' en diorita', endstone: ' en piedra del End', granite: ' en granito', gravel: ' en grava', marble: ' en mármol',
        mars: ' de Marte', mercury: ' de Mercurio', moon: ' de la Luna', netherrack: ' en netherrack',
        proxima_centauri_b: ' de Próxima Centauri b', red_granite: ' en granito rojo', red_sand: ' en arena roja', sand: ' en arena',
        tuff: ' en toba', venus: ' de Venus'
    }
    Object.keys(stones).forEach(function (stone) {
        add('item.gtceu.merrillite_' + stone, 'Mena de merrillita' + stones[stone])
    })
})

// what the new GT forms are for (GTM already shows the chemical formula)
ItemEvents.tooltip(event => {
    event.add('gtceu:lunar_regolith_dust', Text.translate('tooltip.grindless.lunar_regolith_dust').gray())
    event.add(['gtceu:mars_merrillite_ore', 'gtceu:raw_merrillite', 'gtceu:merrillite_dust'], Text.translate('tooltip.grindless.merrillite').gray())
})
