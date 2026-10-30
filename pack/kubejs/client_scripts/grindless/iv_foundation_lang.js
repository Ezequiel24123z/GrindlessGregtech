// priority: 9300
// Gregtech Grindless - names and tooltips of the IV foundation (startup_scripts/grindless/iv/foundation.js):
//
//   grindless:<item> and grindless:<block>                     the shared IV items and the two Mercury blocks, with two tooltip lines each
//   grindless:vein_sample_<vein>                               naquadah_venus, iridosmine_mercury, pitchblende_end (iv/foundation.js) and
//                                                              fluorite (lv/multis_items.js, from veins_overworld_extra.json)
//   tooltip.grindless.vein_sample.<line>                       the machine and where lines of the new samples
//   planet.grindless.venus / mercury                           the planet names of moon/quantum_bridge.js's messages (planets.json)
//   material.gtceu.<material>                                  the six GT materials (GTM names their forms and fluids from these)
//   item.gtceu.<form>                                          es_es only: the Spanish name of every GT form of the new materials; GTM
//                                                              uses an item-specific key when the language has one
//                                                              (TagPrefix.getUnlocalizedName), so en_us keeps GTM's own patterns. Ore blocks
//                                                              keep the prefix pattern "%s_<prefix name>" (item.gtceu.iridosmine_mercury).
//
// Indicators and buckets keep GTM's English patterns in es_es, like every GTM indicator and bucket (no per-item key).
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Quests are English only; names go in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('item.grindless.leu_pellet', 'LEU Pellet')
    add('tooltip.grindless.leu_pellet.0', 'A sintered pellet of low-enriched uranium dioxide.')
    add('tooltip.grindless.leu_pellet.1', 'The fuel fabrication plant stacks the pellets into Zircaloy tubes to make the LEU fuel assembly.')

    add('item.grindless.zircaloy_cladding_tube', 'Zircaloy Cladding Tube')
    add('tooltip.grindless.zircaloy_cladding_tube.0', 'A thin pilgered tube of Zircaloy: zirconium hardly absorbs neutrons, so they reach the moderator instead of the cladding.')
    add('tooltip.grindless.zircaloy_cladding_tube.1', 'The fuel fabrication plant fills it with LEU pellets and helium.')

    add('item.grindless.leu_fuel_assembly', 'LEU Fuel Assembly')
    add('tooltip.grindless.leu_fuel_assembly.0', 'A bundle of Zircaloy rods full of low-enriched uranium pellets, backfilled with helium.')
    add('tooltip.grindless.leu_fuel_assembly.1', 'Fission reactor fuel, with light or heavy water. It burns down into a spent fuel assembly.')

    add('item.grindless.mox_fuel_assembly', 'MOX Fuel Assembly')
    add('tooltip.grindless.mox_fuel_assembly.0', 'Mixed oxide fuel: plutonium and uranium-238 in Zircaloy rods. It burns the plutonium the reactor bred.')
    add('tooltip.grindless.mox_fuel_assembly.1', 'A heavy-water core of the fission reactor, made in the hot cell. It burns down into a spent fuel assembly.')

    add('item.grindless.breeder_fuel_assembly', 'Breeder Fuel Assembly')
    add('tooltip.grindless.breeder_fuel_assembly.0', 'A plutonium core in a blanket of uranium-238, which the core\'s neutrons turn into more plutonium.')
    add('tooltip.grindless.breeder_fuel_assembly.1', 'The fission reactor\'s breeder core, made in the hot cell.')

    add('item.grindless.spent_fuel_assembly', 'Spent Fuel Assembly')
    add('tooltip.grindless.spent_fuel_assembly.0', 'What an LEU or MOX core leaves: uranium, plutonium and fission products, hot and highly radioactive.')
    add('tooltip.grindless.spent_fuel_assembly.1', 'It never passes through hands: the hot cell reprocesses it and gives the uranium and plutonium back.')

    add('item.grindless.spent_breeder_assembly', 'Spent Breeder Assembly')
    add('tooltip.grindless.spent_breeder_assembly.0', 'A breeder core after its run: its blanket now holds more plutonium than the core started with.')
    add('tooltip.grindless.spent_breeder_assembly.1', 'The hot cell reprocesses it.')

    add('item.grindless.pube_neutron_source', 'Pu-Be Neutron Source')
    add('tooltip.grindless.pube_neutron_source.0', 'Plutonium and beryllium sealed in one capsule: the plutonium\'s alpha particles knock neutrons out of the beryllium.')
    add('tooltip.grindless.pube_neutron_source.1', 'Made in the hot cell. It keeps a steady neutron flux where a process needs one, and wears out slowly.')

    add('item.grindless.rtg_pellet', 'RTG Pellet')
    add('tooltip.grindless.rtg_pellet.0', 'Plutonium oxide that keeps itself hot by its own decay, for years.')
    add('tooltip.grindless.rtg_pellet.1', 'Made in the hot cell. It fuels the RTG cell, which powers a base where nothing burns, day and night.')

    add('item.grindless.ion_exchange_resin', 'Ion-Exchange Resin')
    add('tooltip.grindless.ion_exchange_resin.0', 'Sulfonated polystyrene beads: they catch the dissolved uranium out of the leach solution.')
    add('tooltip.grindless.ion_exchange_resin.1', 'It goes in the in-situ leach field and wears out slowly.')

    add('item.grindless.platinum_gauze', 'Platinum Gauze')
    add('tooltip.grindless.platinum_gauze.0', 'Woven platinum-rhodium wire, the catalyst that splits sulfuric acid into water, oxygen and sulfur dioxide.')
    add('tooltip.grindless.platinum_gauze.1', 'It sits in the Venus acid works and wears out very slowly.')

    add('item.grindless.inner_planets_chart', 'Inner Planets Chart')
    add('tooltip.grindless.inner_planets_chart.0', 'A data stick with the radio fixes of Venus and Mercury: their orbits, the transfer windows and two landing sites.')
    add('tooltip.grindless.inner_planets_chart.1', 'Written by the Deep Space Antenna. The tier 3 rocket parts are assembled with it, and it is never used up.')

    add('block.grindless.hermean_heat_shield_brick', 'Hermean Heat-Shield Bricks')
    add('tooltip.grindless.hermean_heat_shield_brick.0', 'Mercury\'s regolith, sintered under concentrated sunlight into pale, heat-proof bricks.')
    add('tooltip.grindless.hermean_heat_shield_brick.1', 'Made only on Mercury, in the solar works. The Mercury vein drill, the solar field and the interferometer stand on them.')

    add('block.grindless.hermean_thin_film_panel', 'Hermean Thin-Film Panel')
    add('tooltip.grindless.hermean_thin_film_panel.0', 'Gallium arsenide evaporated onto a silicon wafer in Mercury\'s free vacuum, under tempered glass on a tungsten steel frame.')
    add('tooltip.grindless.hermean_thin_film_panel.1', 'The panel of the Mercury solar field. Made only on Mercury, in the solar works.')

    add('item.grindless.vein_sample_naquadah_venus', 'Venusian Naquadah Vein Sample')
    add('item.grindless.vein_sample_iridosmine_mercury', 'Hermean Iridosmine Vein Sample')
    add('item.grindless.vein_sample_pitchblende_end', 'End Pitchblende Vein Sample')
    add('item.grindless.vein_sample_fluorite', 'Fluorite Vein Sample')
    add('tooltip.grindless.vein_sample.drill_venus', 'Put it in the input bus of the pressurized vein drill, on Venus. It is never used up.')
    add('tooltip.grindless.vein_sample.venus', 'Venus: craft it with an empty vein probe and two raw ores of the vein, brought back by hand on the first visit.')
    add('tooltip.grindless.vein_sample.drill_mercury', 'Put it in the input bus of the Mercury vein drill. It is never used up.')
    add('tooltip.grindless.vein_sample.mercury', 'Mercury: craft it with an empty vein probe and two raw ores of the vein, brought back by hand on the first visit.')
    add('tooltip.grindless.vein_sample.leach_field', 'Put it in the input bus of the in-situ leach field, in the End: the field dissolves the uranium in place, with no drill bit. It is never used up.')
    add('tooltip.grindless.vein_sample.end_leach', 'End vein: craft it with an empty vein probe, raw pitchblende and raw uraninite. No drill takes it.')

    add('planet.grindless.venus', 'Venus')
    add('planet.grindless.mercury', 'Mercury')
    add('dimension.grindless.mercury_orbit', 'Mercury Orbit')

    add('material.gtceu.heavy_water', 'Heavy Water')
    add('material.gtceu.heavy_water_concentrate', 'Heavy Water Concentrate')
    add('material.gtceu.tritiated_heavy_water', 'Tritiated Heavy Water')
    add('material.gtceu.zircaloy', 'Zircaloy')
    add('material.gtceu.hermean_regolith', 'Hermean Regolith')
    add('material.gtceu.iridosmine', 'Iridosmine')

    add('tooltip.grindless.heavy_water', 'The fission reactor\'s moderator. An electrolyzer splits it into deuterium and oxygen.')
    add('tooltip.grindless.tritiated_heavy_water', 'The reactor\'s used moderator, carrying tritium. Only the tritium removal facility on the Moon takes the tritium out.')
    add('tooltip.grindless.zircaloy', 'Zirconium with a little tin: it hardly absorbs neutrons. The fuel fabrication plant draws it into cladding tubes.')
    add('tooltip.grindless.hermean_regolith_dust', 'Ground Mercury rock. On Mercury, the solar works sinters it into heat-shield bricks.')
    add('tooltip.grindless.iridosmine', 'Native iridium-osmium alloy from Mercury\'s crust. Only the platinum plant splits it into iridium and osmium.')
    add('tooltip.grindless.fluorite', 'Fluorspar, calcium fluoride. The fluorspar kiln digests it in sulfuric acid into hydrogen fluoride.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('item.grindless.leu_pellet', 'Pastilla de LEU')
    add('tooltip.grindless.leu_pellet.0', 'Una pastilla sinterizada de dióxido de uranio poco enriquecido.')
    add('tooltip.grindless.leu_pellet.1', 'La planta de fabricación de combustible apila las pastillas en tubos de zircaloy para hacer el elemento combustible de LEU.')

    add('item.grindless.zircaloy_cladding_tube', 'Tubo de vaina de zircaloy')
    add('tooltip.grindless.zircaloy_cladding_tube.0', 'Un tubo fino de zircaloy laminado en frío: el circonio apenas absorbe neutrones, así que llegan al moderador y no se quedan en la vaina.')
    add('tooltip.grindless.zircaloy_cladding_tube.1', 'La planta de fabricación de combustible lo llena de pastillas de LEU y de helio.')

    add('item.grindless.leu_fuel_assembly', 'Elemento combustible de LEU')
    add('tooltip.grindless.leu_fuel_assembly.0', 'Un haz de varillas de zircaloy llenas de pastillas de uranio poco enriquecido, rellenas de helio.')
    add('tooltip.grindless.leu_fuel_assembly.1', 'Combustible del reactor de fisión, con agua ligera o pesada. Al quemarse deja un elemento combustible gastado.')

    add('item.grindless.mox_fuel_assembly', 'Elemento combustible MOX')
    add('tooltip.grindless.mox_fuel_assembly.0', 'Combustible de óxidos mixtos: plutonio y uranio 238 en varillas de zircaloy. Quema el plutonio que crió el reactor.')
    add('tooltip.grindless.mox_fuel_assembly.1', 'Un núcleo de agua pesada del reactor de fisión, hecho en la celda caliente. Al quemarse deja un elemento combustible gastado.')

    add('item.grindless.breeder_fuel_assembly', 'Elemento combustible reproductor')
    add('tooltip.grindless.breeder_fuel_assembly.0', 'Un núcleo de plutonio dentro de un manto de uranio 238, que los neutrones del núcleo convierten en más plutonio.')
    add('tooltip.grindless.breeder_fuel_assembly.1', 'El núcleo reproductor del reactor de fisión, hecho en la celda caliente.')

    add('item.grindless.spent_fuel_assembly', 'Elemento combustible gastado')
    add('tooltip.grindless.spent_fuel_assembly.0', 'Lo que deja un núcleo de LEU o de MOX: uranio, plutonio y productos de fisión, calientes y muy radiactivos.')
    add('tooltip.grindless.spent_fuel_assembly.1', 'Nunca pasa por las manos: la celda caliente lo reprocesa y devuelve el uranio y el plutonio.')

    add('item.grindless.spent_breeder_assembly', 'Elemento reproductor gastado')
    add('tooltip.grindless.spent_breeder_assembly.0', 'Un núcleo reproductor tras su ciclo: su manto guarda ahora más plutonio del que tenía el núcleo al empezar.')
    add('tooltip.grindless.spent_breeder_assembly.1', 'La celda caliente lo reprocesa.')

    add('item.grindless.pube_neutron_source', 'Fuente de neutrones de Pu-Be')
    add('tooltip.grindless.pube_neutron_source.0', 'Plutonio y berilio sellados en una cápsula: las partículas alfa del plutonio arrancan neutrones del berilio.')
    add('tooltip.grindless.pube_neutron_source.1', 'Se hace en la celda caliente. Da un flujo de neutrones constante donde un proceso lo necesita, y se gasta poco a poco.')

    add('item.grindless.rtg_pellet', 'Pastilla de RTG')
    add('tooltip.grindless.rtg_pellet.0', 'Óxido de plutonio que se mantiene caliente con su propia desintegración, durante años.')
    add('tooltip.grindless.rtg_pellet.1', 'Se hace en la celda caliente. Alimenta la celda RTG, que da energía a una base donde nada arde, de día y de noche.')

    add('item.grindless.ion_exchange_resin', 'Resina de intercambio iónico')
    add('tooltip.grindless.ion_exchange_resin.0', 'Bolitas de poliestireno sulfonado: atrapan el uranio disuelto en la solución de lixiviación.')
    add('tooltip.grindless.ion_exchange_resin.1', 'Va en el campo de lixiviación in situ y se gasta poco a poco.')

    add('item.grindless.platinum_gauze', 'Malla de platino')
    add('tooltip.grindless.platinum_gauze.0', 'Hilo de platino y rodio tejido, el catalizador que descompone el ácido sulfúrico en agua, oxígeno y dióxido de azufre.')
    add('tooltip.grindless.platinum_gauze.1', 'Va en la planta de ácido de Venus y se gasta muy despacio.')

    add('item.grindless.inner_planets_chart', 'Carta de los planetas interiores')
    add('tooltip.grindless.inner_planets_chart.0', 'Una memoria de datos con las posiciones de radio de Venus y Mercurio: sus órbitas, las ventanas de transferencia y dos lugares de aterrizaje.')
    add('tooltip.grindless.inner_planets_chart.1', 'La escribe la antena de espacio profundo. Con ella se montan las piezas del cohete de nivel 3, y no se gasta nunca.')

    add('block.grindless.hermean_heat_shield_brick', 'Ladrillos de escudo térmico de Mercurio')
    add('tooltip.grindless.hermean_heat_shield_brick.0', 'Regolito de Mercurio sinterizado con luz solar concentrada en ladrillos claros que aguantan el calor.')
    add('tooltip.grindless.hermean_heat_shield_brick.1', 'Solo se hacen en Mercurio, en la planta solar. La perforadora de vetas de Mercurio, el campo solar y el interferómetro se apoyan en ellos.')

    add('block.grindless.hermean_thin_film_panel', 'Panel de película fina de Mercurio')
    add('tooltip.grindless.hermean_thin_film_panel.0', 'Arseniuro de galio evaporado sobre una oblea de silicio en el vacío de Mercurio, bajo vidrio templado y en un marco de acero de tungsteno.')
    add('tooltip.grindless.hermean_thin_film_panel.1', 'El panel del campo solar de Mercurio. Solo se hace en Mercurio, en la planta solar.')

    add('item.grindless.vein_sample_naquadah_venus', 'Muestra de veta de naquadah venusiana')
    add('item.grindless.vein_sample_iridosmine_mercury', 'Muestra de veta de iridosmina de Mercurio')
    add('item.grindless.vein_sample_pitchblende_end', 'Muestra de veta de pechblenda del End')
    add('item.grindless.vein_sample_fluorite', 'Muestra de veta de fluorita')
    add('tooltip.grindless.vein_sample.drill_venus', 'Ponla en el bus de entrada de la perforadora de vetas presurizada, en Venus. No se gasta.')
    add('tooltip.grindless.vein_sample.venus', 'Venus: se hace con una sonda de vetas vacía y dos menas en bruto de la veta traídas a mano en la primera visita.')
    add('tooltip.grindless.vein_sample.drill_mercury', 'Ponla en el bus de entrada de la perforadora de vetas de Mercurio. No se gasta.')
    add('tooltip.grindless.vein_sample.mercury', 'Mercurio: se hace con una sonda de vetas vacía y dos menas en bruto de la veta traídas a mano en la primera visita.')
    add('tooltip.grindless.vein_sample.leach_field', 'Ponla en el bus de entrada del campo de lixiviación in situ, en el End: el campo disuelve el uranio en su sitio, sin broca. No se gasta.')
    add('tooltip.grindless.vein_sample.end_leach', 'Veta del End: se hace con una sonda de vetas vacía, pechblenda en bruto y uraninita en bruto. Ninguna perforadora la admite.')

    add('planet.grindless.venus', 'Venus')
    add('planet.grindless.mercury', 'Mercurio')
    add('dimension.grindless.mercury_orbit', 'Órbita de Mercurio')

    add('material.gtceu.heavy_water', 'Agua pesada')
    add('material.gtceu.heavy_water_concentrate', 'Concentrado de agua pesada')
    add('material.gtceu.tritiated_heavy_water', 'Agua pesada tritiada')
    add('material.gtceu.zircaloy', 'Zircaloy')
    add('material.gtceu.hermean_regolith', 'Regolito de Mercurio')
    add('material.gtceu.iridosmine', 'Iridosmina')

    add('tooltip.grindless.heavy_water', 'El moderador del reactor de fisión. Un electrolizador la separa en deuterio y oxígeno.')
    add('tooltip.grindless.tritiated_heavy_water', 'El moderador usado del reactor, cargado de tritio. Solo la planta de extracción de tritio de la Luna le quita el tritio.')
    add('tooltip.grindless.zircaloy', 'Circonio con un poco de estaño: apenas absorbe neutrones. La planta de fabricación de combustible lo estira en tubos de vaina.')
    add('tooltip.grindless.hermean_regolith_dust', 'Roca de Mercurio molida. En Mercurio, la planta solar la sinteriza en ladrillos de escudo térmico.')
    add('tooltip.grindless.iridosmine', 'Aleación nativa de iridio y osmio de la corteza de Mercurio. Solo la planta de platino la separa en iridio y osmio.')
    add('tooltip.grindless.fluorite', 'Espato flúor, fluoruro de calcio. El horno de espato flúor lo digiere en ácido sulfúrico y da fluoruro de hidrógeno.')

    // ---- the GT forms of the new materials
    var dusts = function (material, name) {
        add('item.gtceu.' + material + '_dust', 'Polvo de ' + name)
        add('item.gtceu.small_' + material + '_dust', 'Montón pequeño de polvo de ' + name)
        add('item.gtceu.tiny_' + material + '_dust', 'Montón diminuto de polvo de ' + name)
    }
    dusts('hermean_regolith', 'regolito de Mercurio')
    dusts('iridosmine', 'iridosmina')
    dusts('zircaloy', 'zircaloy')

    add('item.gtceu.zircaloy_ingot', 'Lingote de zircaloy')
    add('item.gtceu.hot_zircaloy_ingot', 'Lingote caliente de zircaloy')
    add('item.gtceu.zircaloy_nugget', 'Pepita de zircaloy')
    add('item.gtceu.zircaloy_block', 'Bloque de zircaloy')

    add('item.gtceu.impure_iridosmine_dust', 'Montón impuro de polvo de iridosmina')
    add('item.gtceu.pure_iridosmine_dust', 'Montón purificado de polvo de iridosmina')
    add('item.gtceu.crushed_iridosmine_ore', 'Mena triturada de iridosmina')
    add('item.gtceu.purified_iridosmine_ore', 'Mena purificada de iridosmina')
    add('item.gtceu.refined_iridosmine_ore', 'Mena refinada de iridosmina')
    add('item.gtceu.raw_iridosmine', 'Iridosmina en bruto')
    add('item.gtceu.raw_iridosmine_block', 'Bloque de iridosmina en bruto')

    // one ore block per stone type (ore prefix name -> where it sits); only the Mercury one generates (the Mercury vein table)
    var stones = {
        stone: '', andesite: ' en andesita', basalt: ' en basalto', blackstone: ' en piedra negra', deepslate: ' en pizarra profunda',
        diorite: ' en diorita', endstone: ' en piedra del End', granite: ' en granito', gravel: ' en grava', marble: ' en mármol',
        mars: ' de Marte', mercury: ' de Mercurio', moon: ' de la Luna', netherrack: ' en netherrack',
        proxima_centauri_b: ' de Próxima Centauri b', red_granite: ' en granito rojo', red_sand: ' en arena roja', sand: ' en arena',
        tuff: ' en toba', venus: ' de Venus'
    }
    Object.keys(stones).forEach(function (stone) {
        add('item.gtceu.iridosmine_' + stone, 'Mena de iridosmina' + stones[stone])
    })
})

// what the new GT forms are for (GTM already shows the chemical formula)
ItemEvents.tooltip(event => {
    event.add('gtceu:heavy_water_bucket', Text.translate('tooltip.grindless.heavy_water').gray())
    event.add('gtceu:tritiated_heavy_water_bucket', Text.translate('tooltip.grindless.tritiated_heavy_water').gray())
    event.add(['gtceu:zircaloy_ingot', 'gtceu:zircaloy_dust'], Text.translate('tooltip.grindless.zircaloy').gray())
    event.add('gtceu:hermean_regolith_dust', Text.translate('tooltip.grindless.hermean_regolith_dust').gray())
    event.add(['gtceu:mercury_iridosmine_ore', 'gtceu:proxima_centauri_b_iridosmine_ore', 'gtceu:raw_iridosmine', 'gtceu:iridosmine_dust'],
        Text.translate('tooltip.grindless.iridosmine').gray())
    event.add(['gcyr:raw_fluorite', 'gcyr:fluorite_dust'], Text.translate('tooltip.grindless.fluorite').gray())
})
