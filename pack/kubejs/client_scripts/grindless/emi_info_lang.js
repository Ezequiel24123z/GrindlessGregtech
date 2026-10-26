// Gregtech Grindless - text of our EMI information pages (kubejs/assets/emi/recipe/additions/grindless/*.json: EMI's own data
// recipes, type emi:info; EMI only reads them in the emi namespace). Each page lists its stacks and these translation keys; EMI shows
// the page under both the recipes and the uses of every stack on it. They cover what EMI cannot show as a recipe: right-click
// actions (the travel keys, the wireless covers, the hologram projector), what goes into a structure (GTM's multiblock preview only
// shows the first block of each slot), recipes of GTM's electric furnace (EMI never lists that type) and what an item is kept for.
// What a recipe already shows (the charts' observations, the samples' drilling) gets no page: its recipe must stay visible, which
// the audit checks (a recipe EMI drops for a disabled stack fails it).
// The audit that asks for them is tools/analysis/emi-coverage.mjs. Quests are English only; names and info go in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.travel_keys.0', 'Right-click a travel key to visit its building dimension: the Void Key leads to an empty void, the Flat Key to a flat world, and the End Key to a safe platform in the End, far from the dragon\'s island.')
    add('emi.grindless.info.travel_keys.1', 'Right-click it again there to go back to where you were. From one of these dimensions you can hop straight to another. A key is never used up.')

    add('emi.grindless.info.wireless_covers.0', 'Right-click the side of a single-block GregTech machine with a wireless cover to put it on. A crowbar takes it off and gives it back.')
    add('emi.grindless.info.wireless_covers.1', 'An energy cover goes on a machine of its tier or higher and feeds it from the wireless energy network, up to 2 A, while the network\'s tier is at least the cover\'s. A dynamo cover goes on a generator or battery buffer of its tier or lower and sends its stored EU into the network; 5% is lost on the way in.')
    add('emi.grindless.info.wireless_covers.2', 'The network\'s energy is stored in Wireless Energy Towers. Shift + right-click a covered machine with an empty hand to read the network.')

    add('emi.grindless.info.capacitor_cells.0', 'Capacitor cells are the storage of the Wireless Energy Tower: its 32 cell slots take cells of any tier (the tower\'s casing fills an empty slot), and every formed tower adds the capacity of its cells to the wireless energy network.')
    add('emi.grindless.info.capacitor_cells.1', 'The network sends EU out at the tier of the weakest cell in any formed tower. Swapping a cell unforms its tower; the stored EU stays.')

    add('emi.grindless.info.sagittarius_a_star_signal.0', 'Recorded by the Interferometer on Mercury, at night: it combines a Lunar VLBI Recording from the Moon\'s Deep Space Antenna with the Outer System Chart, which it keeps.')
    add('emi.grindless.info.sagittarius_a_star_signal.1', 'It closes the IV chapter, and no IV recipe uses it up. Keep it: it is one of the items that open LuV, where the journey to the centre of the galaxy goes on.')

    add('emi.grindless.info.hologram_projector.0', 'Right-click an unformed multiblock controller to project its structure for 30 seconds; right-click again to hide it. A formed controller opens its normal screen.')
    add('emi.grindless.info.hologram_projector.1', 'Sneak + right-click to build: it places the structure\'s default blocks from your inventory into empty spaces, one item per block. Hatches, buses and other machine parts are left for you to choose.')

    add('emi.grindless.info.sintered_regolith.0', 'Made only on the Moon. The first bricks come from an electric furnace there: it bakes 4 Lunar Regolith Dust into one block (120 EU/t, 20 s). EMI does not list GregTech\'s electric furnace recipes, so that one only shows here. Later the Regolith Cell sinters them in bulk.')
    add('emi.grindless.info.sintered_regolith.1', 'Every structure of the Moon base stands on these bricks: the Regolith Cell, the EV Tripod Drill, the Sealed Dome, the Cryogenic Plant, the Lunar Solar Array, the Deep Space Antenna and the Tritium Removal Facility.')

    add('emi.grindless.info.night_sky_radiator.0', 'A structure block: the radiator wings of the Cryogenic Plant, and part of the Venus Heat Engine, the Tritium Removal Facility, the Mercury Vein Drill and the Mercury Solar Field. Facing an open night sky, it sheds heat as infrared light.')

    add('emi.grindless.info.solar_wing_panel.0', 'A structure block: the wings of the EV Tripod Drill and the panels of the Lunar Solar Array (one recipe run per panel under open sky). Three more go into the array\'s controller.')
    add('emi.grindless.info.orbital_solar_panel.0', 'A structure block: the Orbital Solar Station has two wings of 32 panels. In Earth orbit, each panel whose top sees open sky adds 630 EU/t to the next run: 40,320 EU/t with all 64 exposed. Orbital midnight does not stop it.')
    add('emi.grindless.info.whipple_shield_casing.0', 'A structure block made as metal foam in the Microgravity Smelter. The Wake Shield Facility needs 69 blocks for its octagonal disc. Keep more for the harpoon drill and the orbital tether: the foam and aramid spread micrometeoroid impacts.')
    add('emi.grindless.info.sapphire_test_mass.0', 'An optical structure block grown in the Zero-G Crystal Grower. Keep four for the Gravitational-Wave Detector on Ganymede: its two vertex mirrors and the mirror at each arm end. The sapphire is a test mass, not a reagent.')

    add('emi.grindless.info.hermean_blocks.0', 'Made only on Mercury, in the Mercury Solar Works. The Mercury Vein Drill, the Mercury Solar Field and the Interferometer stand on the heat-shield bricks; the thin-film panels are the Mercury Solar Field\'s panels, and its controller takes some too.')

    add('emi.grindless.info.heliostat_mirror.0', 'A structure block: the mirror field of the Heliostat Tower (LV) and of the Mercury Solar Works. The Heliostat Tower\'s controller takes some too.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.travel_keys.0', 'Haz clic derecho con una llave de viaje para ir a su dimensión de construcción: la Llave del Vacío lleva a un vacío sin nada, la Llave del Llano a un mundo plano y la Llave del End a una plataforma segura en el End, lejos de la isla del dragón.')
    add('emi.grindless.info.travel_keys.1', 'Vuelve a hacer clic derecho allí para regresar a donde estabas. Desde una de estas dimensiones puedes saltar directamente a otra. La llave nunca se gasta.')

    add('emi.grindless.info.wireless_covers.0', 'Haz clic derecho en un lado de una máquina de GregTech de un solo bloque con una cubierta inalámbrica para ponérsela. Una palanca la quita y te la devuelve.')
    add('emi.grindless.info.wireless_covers.1', 'Una cubierta de energía va en una máquina de su nivel o superior y la alimenta desde la red de energía inalámbrica, hasta 2 A, mientras el nivel de la red llegue al de la cubierta. Una cubierta dinamo va en un generador o un búfer de baterías de su nivel o inferior y envía a la red la EU que guarda; se pierde un 5 % al entrar.')
    add('emi.grindless.info.wireless_covers.2', 'La energía de la red se guarda en torres de energía inalámbrica. Mayús + clic derecho con la mano vacía en una máquina con cubierta muestra el estado de la red.')

    add('emi.grindless.info.capacitor_cells.0', 'Las celdas de condensadores son el almacén de la torre de energía inalámbrica: sus 32 huecos de celda aceptan celdas de cualquier nivel (la carcasa de la torre rellena un hueco vacío), y cada torre formada suma la capacidad de sus celdas a la red de energía inalámbrica.')
    add('emi.grindless.info.capacitor_cells.1', 'La red envía EU al nivel de la celda más débil de todas las torres formadas. Cambiar una celda deshace su torre; la EU guardada se conserva.')

    add('emi.grindless.info.sagittarius_a_star_signal.0', 'La graba el interferómetro en Mercurio, de noche: combina una grabación VLBI lunar de la antena de espacio profundo de la Luna con la carta del sistema exterior, que conserva.')
    add('emi.grindless.info.sagittarius_a_star_signal.1', 'Cierra el capítulo IV y ninguna receta de IV la gasta. Guárdala: es uno de los objetos que abren LuV, donde sigue el viaje al centro de la galaxia.')

    add('emi.grindless.info.hologram_projector.0', 'Haz clic derecho en el controlador de un multibloque sin formar para proyectar su estructura durante 30 segundos; otro clic derecho la oculta. Un controlador formado abre su pantalla normal.')
    add('emi.grindless.info.hologram_projector.1', 'Agachado + clic derecho construye: coloca desde tu inventario los bloques por defecto de la estructura en los huecos vacíos, un objeto por bloque. Las escotillas, los buses y las demás piezas de máquina las eliges tú.')

    add('emi.grindless.info.sintered_regolith.0', 'Solo se hacen en la Luna. Los primeros ladrillos salen de un horno eléctrico allí: cuece 4 polvos de regolito lunar en un bloque (120 EU/t, 20 s). EMI no muestra las recetas del horno eléctrico de GregTech, así que esa solo aparece aquí. Después, la celda de regolito los sinteriza en grandes cantidades.')
    add('emi.grindless.info.sintered_regolith.1', 'Todas las estructuras de la base lunar se apoyan en estos ladrillos: la celda de regolito, la perforadora trípode EV, la cúpula sellada, la planta criogénica, la matriz solar lunar, la antena de espacio profundo y la planta de extracción de tritio.')

    add('emi.grindless.info.night_sky_radiator.0', 'Un bloque de estructura: las alas radiadoras de la planta criogénica, y parte del motor térmico de Venus, la planta de extracción de tritio, la perforadora de vetas de Mercurio y el campo solar de Mercurio. Frente a un cielo nocturno abierto, suelta el calor como luz infrarroja.')

    add('emi.grindless.info.solar_wing_panel.0', 'Un bloque de estructura: las alas de la perforadora trípode EV y los paneles de la matriz solar lunar (una ejecución de receta por panel a cielo abierto). Tres más van en el controlador de la matriz.')
    add('emi.grindless.info.orbital_solar_panel.0', 'Un bloque de estructura: la estación solar orbital tiene dos alas de 32 paneles. En la órbita terrestre, cada panel con el cielo abierto encima añade 630 EU/t al siguiente ciclo: 40.320 EU/t con los 64 expuestos. La medianoche orbital no la detiene.')
    add('emi.grindless.info.whipple_shield_casing.0', 'Un bloque de estructura hecho como espuma metálica en el fundidor de microgravedad. La instalación de escudo de estela necesita 69 bloques para su disco octagonal. Guarda más para la perforadora de arpones y el cable orbital: la espuma y la aramida dispersan los impactos de micrometeoritos.')
    add('emi.grindless.info.sapphire_test_mass.0', 'Un bloque óptico de estructura cultivado en gravedad cero. Guarda cuatro para el detector de ondas gravitacionales de Ganímedes: dos espejos en el vértice y uno al final de cada brazo. El zafiro es una masa de prueba, no un reactivo.')

    add('emi.grindless.info.hermean_blocks.0', 'Solo se hacen en Mercurio, en la planta solar de Mercurio. La perforadora de vetas de Mercurio, el campo solar de Mercurio y el interferómetro se apoyan en los ladrillos de escudo térmico; los paneles de película fina son los paneles del campo solar de Mercurio, y su controlador también lleva algunos.')

    add('emi.grindless.info.heliostat_mirror.0', 'Un bloque de estructura: el campo de espejos de la torre solar de heliostatos (LV) y de la planta solar de Mercurio. El controlador de la torre también lleva algunos.')
})
