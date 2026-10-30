// priority: 1668
// Gregtech Grindless - names and tooltips of UXV's ejecta knot sweeper and annihilation laser works, their items and the package's older rows
// (startup_scripts/grindless/uxv/cas_a.js; package UXV-B5):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   item.grindless.<id>, tooltip.grindless.<id>.N      the package's three items
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.ejecta_knot_sweeper', 'Ejecta Knot Sweeper', 'Barredor de nudos de eyecta'],
        ['block.gtceu.annihilation_laser_works', 'Annihilation Laser Works', 'Taller del láser de aniquilación'],
        ['gtceu.ejecta_sweeping', 'Ejecta Sweeping', 'Barrido de eyecta'],
        ['gtceu.annihilation_lasing', 'Annihilation Lasing', 'Emisión por aniquilación'],

        ['grindless.machine.ejecta_knot_sweeper.tooltip.0',
            'A magnetic scoop on a long boom that sweeps the titanium-rich knots of Cassiopeia A\'s ejecta into dust. It only runs at the Cassiopeia A remnant.',
            'Una cuchara magnética en un brazo largo que barre los nudos de eyecta ricos en titanio de Casiopea A hasta dejarlos en polvo. Solo funciona en el remanente de Casiopea A.'],
        ['grindless.machine.ejecta_knot_sweeper.tooltip.1',
            'Circuit 1: no input but an MH winding (kept, worn out one run in fifty) gives four ejecta knot dusts. It needs 2 A of UIV.',
            'Circuito 1: sin más entrada que un bobinado MH (no se consume, se gasta una vez de cada cincuenta) da cuatro polvos de nudo de eyecta. Necesita 2 A de UIV.'],
        ['grindless.machine.ejecta_knot_sweeper.tooltip.2',
            'Parts go in the front plate of the shield: 1-2 UIV energy hatches, 1 input bus, 1 output bus. Accepts a parallel hatch.',
            'Las piezas van en la placa delantera del escudo: 1-2 escotillas de energía UIV, 1 bus de entrada, 1 bus de salida. Acepta una escotilla de paralelos.'],
        ['grindless.machine.annihilation_laser_works.tooltip.0',
            'A long cryostat that binds positrons into positronium and stimulates it into a 511 keV gamma pulse. It runs on Earth.',
            'Un largo criostato que liga positrones en positronio y lo estimula hasta un pulso gamma de 511 keV. Funciona en la Tierra.'],
        ['grindless.machine.annihilation_laser_works.tooltip.1',
            'Circuit 1: a Ti-44 core (kept, worn out one run in fifty), a neon moderator cartridge and liquid helium give a moderated Ps cell. Circuit 2: the cell, a gamma laser cavity and an MTJ die give a gamma laser module.',
            'Circuito 1: un núcleo de Ti-44 (no se consume, se gasta una vez de cada cincuenta), un cartucho moderador de neón y helio líquido dan una celda de Ps moderada. Circuito 2: la celda, una cavidad láser gamma y un dado MTJ dan un módulo láser gamma.'],
        ['grindless.machine.annihilation_laser_works.tooltip.2',
            'Parts go in the front plate: 1-2 UIV energy hatches, 1-2 input buses, 1 input hatch, 1 output hatch; the module leaves by the output bus at the nose. Accepts a parallel hatch.',
            'Las piezas van en la placa delantera: 1-2 escotillas de energía UIV, 1-2 buses de entrada, 1 escotilla de entrada, 1 de salida; el módulo sale por el bus de salida de la proa. Acepta una escotilla de paralelos.'],

        ['item.grindless.moderated_ps_cell', 'Moderated Ps Cell', 'Celda de Ps moderada'],
        ['tooltip.grindless.moderated_ps_cell.0', 'Positrons slowed in solid neon until they bind as positronium.', 'Positrones frenados en neón sólido hasta ligarse como positronio.'],
        ['tooltip.grindless.moderated_ps_cell.1', 'Stimulated into a gamma laser module by the annihilation laser works.', 'El taller del láser de aniquilación lo estimula hasta un módulo láser gamma.'],
        ['item.grindless.spent_ti44_core', 'Spent Ti-44 Core', 'Núcleo de Ti-44 agotado'],
        ['tooltip.grindless.spent_ti44_core.0', 'A Ti-44 core that has decayed to calcium-44 in its tungsten shell.', 'Un núcleo de Ti-44 que ha decaído a calcio-44 en su cáscara de wolframio.'],
        ['tooltip.grindless.spent_ti44_core.1', 'Reclaimed in the hot cell as calcium dust and tungsten.', 'Se recupera en la celda caliente como polvo de calcio y wolframio.'],
        ['item.grindless.ejecta_ti_fraction_dust', 'Ejecta Titanium Fraction', 'Fracción de titanio de eyecta'],
        ['tooltip.grindless.ejecta_ti_fraction_dust.0', 'The titanium that leaching leaves from Cassiopeia A\'s ejecta dust.', 'El titanio que deja la lixiviación del polvo de eyecta de Casiopea A.'],
        ['tooltip.grindless.ejecta_ti_fraction_dust.1', 'Four go into the calutron for one titanium-44.', 'Cuatro entran en el calutrón para obtener un titanio-44.'],

        ['emi.grindless.info.ejecta_knot_sweeper.0',
            'The titanium-44 knots are Cassiopeia A\'s: the sweeper runs at the remnant and nowhere else, and it needs 2 A of UIV, the most a UIV energy hatch pair carries.',
            'Los nudos de titanio-44 son de Casiopea A: el barredor funciona en el remanente y en ningún otro sitio, y necesita 2 A de UIV, lo máximo que lleva un par de escotillas de energía UIV.'],
        ['emi.grindless.info.ejecta_knot_sweeper.1',
            'The dust is inert apart from its titanium: the extraction cascade (circuit 22) takes the titanium fraction, the calutron (circuit 14) makes titanium-44, and the calcium-silicon and iron-sulphur residues are wollastonite and pyrite dust. The X-ray profiler can also map it.',
            'El polvo es inerte salvo por su titanio: la cascada de extracción (circuito 22) separa la fracción de titanio, el calutrón (circuito 14) hace titanio-44, y los residuos de calcio-silicio y hierro-azufre son polvo de wollastonita y pirita. El perfilador de rayos X también puede cartografiarlo.'],
        ['emi.grindless.info.annihilation_laser_works.0',
            'Titanium-44 is capsuled in tungsten in the hot cell (mode 16). Its decay gives positrons for the moderator; the spent core returns as calcium-44, which is stock calcium dust here, and tungsten (mode 17).',
            'El titanio-44 se encapsula en wolframio en la celda caliente (modo 16). Su desintegración da positrones para el moderador; el núcleo agotado vuelve como calcio-44, que aquí es polvo de calcio de almacén, y wolframio (modo 17).'],
        ['emi.grindless.info.annihilation_laser_works.1',
            'The annihilation heat leaves in liquid helium, which comes out as helium for the cooling loop of the He-3 polariser. The gamma laser module is the emitter\'s source: with lasagna plates it makes the UXV emitter. UV\'s antimatter trap (circuit 5) packs positron cartridges into a positron stack.',
            'El calor de la aniquilación sale en helio líquido, que sale como helio para el circuito de refrigeración del polarizador de He-3. El módulo láser gamma es la fuente del emisor: con placas de lasaña forma el emisor UXV. La trampa de antimateria de UV (circuito 5) empaqueta cartuchos de positrones en una pila de positrones.'],

        ['gtceu.recipe.grindless_ejecta_sweeping.sweep_ejecta_knots',
            'Circuit 1: the magnetic mouth sweeps four ejecta knot dusts; an MH winding is kept and one run in fifty wears it out.',
            'Circuito 1: la boca magnética barre cuatro polvos de nudo de eyecta; el bobinado MH no se consume y una ejecución de cada cincuenta lo desgasta.'],
        ['gtceu.recipe.grindless_annihilation_lasing.moderate_positronium',
            'Circuit 1: positrons from a Ti-44 core are slowed in a neon cartridge; the heat leaves in liquid helium. The core wears out one run in fifty.',
            'Circuito 1: los positrones de un núcleo de Ti-44 se frenan en un cartucho de neón; el calor sale en helio líquido. El núcleo se gasta una ejecución de cada cincuenta.'],
        ['gtceu.recipe.grindless_annihilation_lasing.stimulate_gamma_emission',
            'Circuit 2: a positron stack loads the moderated Ps cell, which condenses in the gamma laser cavity; the MTJ die times the 511 keV pulse.',
            'Circuito 2: una pila de positrones carga la celda de Ps moderada, que se condensa en la cavidad láser gamma; el dado MTJ cronometra el pulso de 511 keV.'],
        ['gtceu.recipe.grindless_antimatter_storage.positron_stack',
            'Circuit 5: four positron cartridges are held in a nitrogen buffer gas as one positron stack; the gas is only a medium.',
            'Circuito 5: cuatro cartuchos de positrones se mantienen en un gas tampón de nitrógeno como una pila de positrones; el gas es solo un medio.'],
        ['gtceu.recipe.grindless_calutron_separation.titanium_44',
            'Circuit 14: the ejecta titanium fraction split by mass; the other titanium goes back to stock as titanium dust',
            'Circuito 14: la fracción de titanio de eyecta separada por masa; el resto del titanio vuelve al almacén como polvo de titanio'],
        ['gtceu.recipe.grindless_hot_cell.ti44_core_capsule',
            'Mode 16: titanium-44 sealed in a tungsten capsule',
            'Modo 16: titanio-44 sellado en una cápsula de wolframio'],
        ['gtceu.recipe.grindless_hot_cell.ti44_core_decay',
            'Mode 17: a spent Ti-44 core reclaimed as calcium dust and tungsten',
            'Modo 17: un núcleo de Ti-44 agotado recuperado como polvo de calcio y wolframio'],
        ['gtceu.recipe.grindless_xray_pulse_profiling.ti44_map',
            'Circuit 3: four ejecta knot dusts profiled onto a data orb as the Ti-44 map of the remnant',
            'Circuito 3: cuatro polvos de nudo de eyecta perfilados en un orbe de datos como el mapa de Ti-44 del remanente']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
