// Gregtech Grindless - names and tooltips of LuV B5, the asteroid belt (startup_scripts/grindless/luv/asteroid_belt.js): the harpoon
// anchor drill, the asteroid processor, the optical miner, their recipe types and lines, and the belt's vein samples.
ClientEvents.lang('en_us', function (event) {
  var entries = {
    'block.gtceu.harpoon_anchor_drill': 'Harpoon Anchor Drill',
    'block.gtceu.asteroid_processor': 'Asteroid Processor',
    'block.gtceu.optical_miner': 'Optical Miner',
    'gtceu.asteroid_processing': 'Asteroid Processing',
    'gtceu.optical_mining': 'Optical Mining',
    'grindless.machine.harpoon_anchor_drill.tooltip.0': 'Vein drill family, step 7a: the asteroid belt only. A drill pushes itself off the rock where there is almost no gravity, so harpoons hold it down. It runs only its own recipes: the belt\'s M-, S- and C-type veins.',
    'grindless.machine.harpoon_anchor_drill.tooltip.1': '11.25 raw ores and a tuff a run. Wear: the HSS-S drill bit at 0.25% a run and an anchor harpoon at 1%. No fluid: it is vacuum. Up to 256 runs at once, as the energy hatches allow.',
    'grindless.machine.harpoon_anchor_drill.tooltip.2': 'A 7x8x7 spider: a 5x6 pad of asteroid regolith casing, four HSS-S harpoon legs, a 3x3x3 body with a Whipple shield on its back, and a titanium derrick over a tungstensteel drill string. Body: 1-2 energy hatches, 1-2 input buses, 1-2 output buses.',
    'grindless.machine.asteroid_processor.tooltip.0': 'The Mond process: metal and carbon monoxide make gaseous carbonyls that are distilled apart and broken down into pure iron, nickel and cobalt. Platinum metals form no carbonyl and stay behind as the asteroid PGM concentrate, which only this machine makes.',
    'grindless.machine.asteroid_processor.tooltip.1': 'Circuit 1: 16 crushed meteoric iron. Circuit 3: 16 meteoric iron dust. Both need a 1,000 mB carbon monoxide charge in an input hatch, never used up, and keep the concentrate: no item voiding. Circuit 2: the magnetic split of crushed tetrataenite from its kamacite.',
    'grindless.machine.asteroid_processor.tooltip.2': 'A hollow 5x5x6 carbonyl column of steel pipe casing, a 3x3x3 magnetic separator of steel casing and a laminated glass CO gas holder. Separator: 1-2 energy hatches, input/output buses and input hatches. Works anywhere.',
    'grindless.machine.asteroid_processor.no_voiding': 'The asteroid processor keeps its PGM concentrate. Disable item voiding.',
    'grindless.machine.optical_miner.tooltip.0': 'The asteroid belt only. Circuit 1 bags a C-type boulder and spalls it with concentrated sunlight: water, carbon dioxide, carbon and the chondritic extract, which only this machine makes. A capture bag is used up at 5% a run.',
    'grindless.machine.optical_miner.tooltip.1': 'A circuit 1 run starts only by day with the sun on the receiver window and all eight mirrors under open sky. Circuit 2 (Boudouard) turns carbon dioxide and carbon into the asteroid processor\'s carbon monoxide, sun or not. It keeps everything it makes: no voiding.',
    'grindless.machine.optical_miner.tooltip.2': 'Eight heliostat mirrors (laminated glass on titanium posts) round a 3x3x3 robust capture chamber with a laminated glass receiver, a frostproof cold trap and a 3x3x3 hut of asteroid regolith casing. Hut: 1-2 energy hatches, 1 input bus, output buses, up to 1 input hatch and 1-3 output hatches.',
    'grindless.machine.optical_miner.no_voiding': 'The optical miner keeps its water, gases and extract. Disable item and fluid voiding.',
    'grindless.machine.optical_miner.no_sun': 'Optical mining needs the sun on the receiver and every mirror under open sky',
    'grindless.machine.optical_miner.sun.sun': 'In full sun: optical mining can start',
    'grindless.machine.optical_miner.sun.night': 'Night: optical mining waits for the sun',
    'grindless.machine.optical_miner.sun.shaded': 'Shaded: %s of the receiver and the 8 mirrors do not see the sky',
    'gtceu.recipe.grindless_optical_sun.boulder': 'Starts only in full sun on the receiver and all 8 mirrors',
    'tooltip.grindless.vein_sample.drill_harpoon': 'Put it in the input bus of the harpoon anchor drill. It is never used up.',
    'tooltip.grindless.vein_sample.asteroid_belt': 'The asteroid belt: craft it with an empty vein probe and two raw ores of the vein, brought back by hand on the first visit.',
    'item.grindless.vein_sample_m_type_belt': 'M-type Asteroid Vein Sample',
    'item.grindless.vein_sample_s_type_belt': 'S-type Asteroid Vein Sample',
    'item.grindless.vein_sample_c_type_belt': 'C-type Asteroid Vein Sample'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})

ClientEvents.lang('es_es', function (event) {
  var entries = {
    'block.gtceu.harpoon_anchor_drill': 'Perforadora anclada con arpones',
    'block.gtceu.asteroid_processor': 'Procesador de asteroides',
    'block.gtceu.optical_miner': 'Minero óptico',
    'gtceu.asteroid_processing': 'Procesado de asteroides',
    'gtceu.optical_mining': 'Minería óptica',
    'grindless.machine.harpoon_anchor_drill.tooltip.0': 'Familia de perforadoras de vetas, paso 7a: solo en el cinturón de asteroides. Una perforadora se empuja a sí misma lejos de la roca donde casi no hay gravedad, así que unos arpones la sujetan. Solo hace sus propias recetas: las vetas de tipo M, S y C del cinturón.',
    'grindless.machine.harpoon_anchor_drill.tooltip.1': '11,25 menas en bruto y una toba por ciclo. Desgaste: la broca de HSS-S al 0,25 % por ciclo y un arpón de anclaje al 1 %. Sin fluido: es el vacío. Hasta 256 ciclos a la vez, según permitan las escotillas de energía.',
    'grindless.machine.harpoon_anchor_drill.tooltip.2': 'Una araña de 7x8x7: una base de 5x6 de carcasa de regolito asteroidal, cuatro patas-arpón de HSS-S, un cuerpo de 3x3x3 con un escudo Whipple detrás y una torre de titanio sobre una sarta de tubería de acero de tungsteno. Cuerpo: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida.',
    'grindless.machine.asteroid_processor.tooltip.0': 'El proceso Mond: el metal y el monóxido de carbono forman carbonilos gaseosos que se destilan por separado y se descomponen en hierro, níquel y cobalto puros. Los metales del grupo del platino no forman carbonilos y se quedan como concentrado de MGP asteroidal, que solo hace esta máquina.',
    'grindless.machine.asteroid_processor.tooltip.1': 'Circuito 1: 16 de hierro meteórico triturado. Circuito 3: 16 de polvo de hierro meteórico. Ambos necesitan una carga de 1000 mB de monóxido de carbono en una escotilla de entrada, que nunca se gasta, y conservan el concentrado: sin destruir objetos. Circuito 2: la separación magnética de la tetrataenita triturada de su kamacita.',
    'grindless.machine.asteroid_processor.tooltip.2': 'Una columna de carbonilos hueca de 5x5x6 de carcasa de tubería de acero, un separador magnético de 3x3x3 de carcasa de acero y un gasómetro de CO de vidrio laminado. Separador: 1-2 escotillas de energía, buses de entrada/salida y escotillas de entrada. Funciona en cualquier sitio.',
    'grindless.machine.asteroid_processor.no_voiding': 'El procesador de asteroides conserva su concentrado de MGP. Desactiva la destrucción de objetos.',
    'grindless.machine.optical_miner.tooltip.0': 'Solo en el cinturón de asteroides. El circuito 1 embolsa una roca de tipo C y la desconcha con luz solar concentrada: agua, dióxido de carbono, carbono y el extracto condrítico, que solo hace esta máquina. Una bolsa de captura se gasta al 5 % por ciclo.',
    'grindless.machine.optical_miner.tooltip.1': 'Un ciclo del circuito 1 solo empieza de día, con el sol en la ventana receptora y los ocho espejos bajo el cielo abierto. El circuito 2 (Boudouard) convierte el dióxido de carbono y el carbono en el monóxido de carbono del procesador de asteroides, con o sin sol. Conserva todo lo que produce: sin destruir nada.',
    'grindless.machine.optical_miner.tooltip.2': 'Ocho espejos heliostato (vidrio laminado sobre postes de titanio) alrededor de una cámara de captura robusta de 3x3x3 con una ventana receptora de vidrio laminado, una trampa fría resistente a la helada y una caseta de 3x3x3 de carcasa de regolito asteroidal. Caseta: 1-2 escotillas de energía, 1 bus de entrada, buses de salida, hasta 1 escotilla de entrada y 1-3 escotillas de salida.',
    'grindless.machine.optical_miner.no_voiding': 'El minero óptico conserva su agua, sus gases y su extracto. Desactiva la destrucción de objetos y fluidos.',
    'grindless.machine.optical_miner.no_sun': 'La minería óptica necesita el sol en el receptor y todos los espejos bajo el cielo abierto',
    'grindless.machine.optical_miner.sun.sun': 'A pleno sol: la minería óptica puede empezar',
    'grindless.machine.optical_miner.sun.night': 'Noche: la minería óptica espera al sol',
    'grindless.machine.optical_miner.sun.shaded': 'A la sombra: %s entre el receptor y los 8 espejos no ven el cielo',
    'gtceu.recipe.grindless_optical_sun.boulder': 'Solo empieza a pleno sol en el receptor y los 8 espejos',
    'tooltip.grindless.vein_sample.drill_harpoon': 'Ponla en el bus de entrada de la perforadora anclada con arpones. No se gasta.',
    'tooltip.grindless.vein_sample.asteroid_belt': 'El cinturón de asteroides: se hace con una sonda de vetas vacía y dos menas en bruto de la veta traídas a mano en la primera visita.',
    'item.grindless.vein_sample_m_type_belt': 'Muestra de veta de asteroide de tipo M',
    'item.grindless.vein_sample_s_type_belt': 'Muestra de veta de asteroide de tipo S',
    'item.grindless.vein_sample_c_type_belt': 'Muestra de veta de asteroide de tipo C'
  }
  Object.keys(entries).forEach(function (key) { event.add('grindless', key, entries[key]) })
})
