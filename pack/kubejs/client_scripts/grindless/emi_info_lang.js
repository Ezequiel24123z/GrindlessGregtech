// Gregtech Grindless - text of our EMI information pages (kubejs/assets/emi/recipe/additions/grindless/*.json: EMI's own data
// recipes, type emi:info; EMI only reads them in the emi namespace). Each page lists its stacks and these translation keys; EMI shows
// the page under both the recipes and the uses of every stack on it. They cover what EMI cannot show as a recipe: right-click
// actions (the travel keys, the wireless covers, the hologram projector), what goes into a structure, observations that depend on
// the sky or the world, recipes of GTM's electric furnace (EMI never lists that type) and what an item is kept for.
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

    add('emi.grindless.info.lunar_charts.0', 'Navigation data only comes from looking at the sky. Each observatory makes its chart in a 30-second observation at night, and the next instrument keeps the previous chart as its guide: it is never used up.')
    add('emi.grindless.info.lunar_charts.1', 'Clockwork Observatory (Steam): the Lunar Chart (Draft), under a clear sky, with the controller at Y 100 or higher. Optical Observatory (LV): the Photographic Lunar Map and the Lunar Ephemeris, under a clear sky. Radio Telescope (MV): the Lunar Landing-Site Chart, in any weather but a thunderstorm.')
    add('emi.grindless.info.lunar_charts.2', 'The Lunar Landing-Site Chart goes into your first rocket\'s ID chip and calibrates the Moon\'s Deep Space Antenna. Any chart copies by hand: the chart and a blank (paper and coal dust, or a photographic plate for the map) make two.')

    add('emi.grindless.info.deep_space_charts.0', 'The Deep Space Antenna listens only on the Moon, at night. Keeping the Lunar Landing-Site Chart, it writes a data stick into the Mars Transfer Chart; keeping that, the Inner Planets Chart; keeping the Inner Planets Chart, it writes a data orb into a Lunar VLBI Recording.')
    add('emi.grindless.info.deep_space_charts.1', 'The Interferometer on Mercury, at night, adds its half of the baseline: a Lunar VLBI Recording with the Inner Planets Chart (kept) gives the Outer System Chart, and with the Outer System Chart (kept) the Sagittarius A* Signal.')
    add('emi.grindless.info.deep_space_charts.2', 'Charts are never used up: the rocket parts that need them keep them (the Mars chart for the advanced tank and motor, the Inner Planets Chart for the elite ones). Copy a chart by hand with a data stick, or a data orb for the Outer System Chart.')

    add('emi.grindless.info.vein_samples.0', 'A vein sample tells a vein drill which vein to drill. Put it in the drill\'s input bus: it is never used up, and the drill brings up that vein\'s ores and stone run after run.')
    add('emi.grindless.info.vein_samples.1', 'Craft one from an Empty Vein Probe and two raw ores of the vein. Higher-tier drills take deeper and rarer veins; EMI\'s Vein Drilling recipes show which drill and drill bit each sample needs.')
    add('emi.grindless.info.vein_samples.2', 'Samples of other worlds only drill on their world: the Moon\'s in the Lunar Drill and the EV Tripod Drill, Mars\' in the EV Tripod Drill and the Pressurized Vein Drill, Venus\' in the Pressurized Vein Drill and Mercury\'s in the Mercury Vein Drill. The End\'s pitchblende sample goes in the In-Situ Leach Field.')

    add('emi.grindless.info.sintered_regolith.0', 'Made only on the Moon. The first bricks come from an electric furnace there: it bakes 4 Lunar Regolith Dust into one block (120 EU/t, 20 s). EMI does not list GregTech\'s electric furnace recipes, so that one only shows here. Later the Regolith Cell sinters them in bulk.')
    add('emi.grindless.info.sintered_regolith.1', 'Every structure of the Moon base stands on these bricks: the Regolith Cell, the EV Tripod Drill, the Sealed Dome, the Cryogenic Plant, the Lunar Solar Array, the Deep Space Antenna and the Tritium Removal Facility.')

    add('emi.grindless.info.night_sky_radiator.0', 'A structure block: the radiator wings of the Cryogenic Plant, and part of the Venus Heat Engine, the Tritium Removal Facility, the Mercury Vein Drill and the Mercury Solar Field. Facing an open night sky, it sheds heat as infrared light.')

    add('emi.grindless.info.solar_wing_panel.0', 'A structure block: the wings of the EV Tripod Drill and the panels of the Lunar Solar Array (one recipe run per panel under open sky). Three more go into the array\'s controller.')

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

    add('emi.grindless.info.lunar_charts.0', 'Los datos de navegación solo salen de mirar el cielo. Cada observatorio hace su carta en una observación de 30 segundos de noche, y el siguiente instrumento conserva la carta anterior como guía: nunca se gasta.')
    add('emi.grindless.info.lunar_charts.1', 'Observatorio de relojería (vapor): la carta lunar (borrador), con el cielo despejado y el controlador a Y 100 o más. Observatorio óptico (LV): el mapa fotográfico de la Luna y las efemérides lunares, con el cielo despejado. Radiotelescopio (MV): la carta del lugar de alunizaje, con cualquier tiempo salvo tormenta.')
    add('emi.grindless.info.lunar_charts.2', 'La carta del lugar de alunizaje entra en el chip de identificación de tu primer cohete y calibra la antena de espacio profundo de la Luna. Cualquier carta se copia a mano: la carta y un soporte en blanco (papel y polvo de carbón, o una placa fotográfica para el mapa) dan dos.')

    add('emi.grindless.info.deep_space_charts.0', 'La antena de espacio profundo solo escucha en la Luna, de noche. Conservando la carta del lugar de alunizaje, graba una memoria de datos con la carta de transferencia a Marte; conservando esa, la carta de los planetas interiores; y conservando la de los planetas interiores, graba un orbe de datos con una grabación VLBI lunar.')
    add('emi.grindless.info.deep_space_charts.1', 'El interferómetro de Mercurio, de noche, añade su mitad de la línea de base: una grabación VLBI lunar con la carta de los planetas interiores (que conserva) da la carta del sistema exterior, y con la carta del sistema exterior (que conserva), la señal de Sagitario A*.')
    add('emi.grindless.info.deep_space_charts.2', 'Las cartas nunca se gastan: las piezas de cohete que las necesitan las conservan (la carta de Marte para el tanque y el motor avanzados, la de los planetas interiores para los de élite). Copia una carta a mano con una memoria de datos, o con un orbe de datos la del sistema exterior.')

    add('emi.grindless.info.vein_samples.0', 'Una muestra de veta le dice a una perforadora de vetas qué veta perforar. Ponla en el bus de entrada de la perforadora: nunca se gasta, y la perforadora saca las menas y la piedra de esa veta una y otra vez.')
    add('emi.grindless.info.vein_samples.1', 'Se fabrica con una sonda de vetas vacía y dos menas en bruto de la veta. Las perforadoras de más nivel aceptan vetas más profundas y raras; las recetas de perforación de vetas de EMI muestran qué perforadora y qué broca necesita cada muestra.')
    add('emi.grindless.info.vein_samples.2', 'Las muestras de otros mundos solo perforan en su mundo: las de la Luna en la perforadora lunar y la perforadora trípode EV, las de Marte en la trípode EV y la perforadora de vetas presurizada, las de Venus en la presurizada y las de Mercurio en la perforadora de vetas de Mercurio. La muestra de pechblenda del End va en el campo de lixiviación in situ.')

    add('emi.grindless.info.sintered_regolith.0', 'Solo se hacen en la Luna. Los primeros ladrillos salen de un horno eléctrico allí: cuece 4 polvos de regolito lunar en un bloque (120 EU/t, 20 s). EMI no muestra las recetas del horno eléctrico de GregTech, así que esa solo aparece aquí. Después, la celda de regolito los sinteriza en grandes cantidades.')
    add('emi.grindless.info.sintered_regolith.1', 'Todas las estructuras de la base lunar se apoyan en estos ladrillos: la celda de regolito, la perforadora trípode EV, la cúpula sellada, la planta criogénica, la matriz solar lunar, la antena de espacio profundo y la planta de extracción de tritio.')

    add('emi.grindless.info.night_sky_radiator.0', 'Un bloque de estructura: las alas radiadoras de la planta criogénica, y parte del motor térmico de Venus, la planta de extracción de tritio, la perforadora de vetas de Mercurio y el campo solar de Mercurio. Frente a un cielo nocturno abierto, suelta el calor como luz infrarroja.')

    add('emi.grindless.info.solar_wing_panel.0', 'Un bloque de estructura: las alas de la perforadora trípode EV y los paneles de la matriz solar lunar (una ejecución de receta por panel a cielo abierto). Tres más van en el controlador de la matriz.')

    add('emi.grindless.info.hermean_blocks.0', 'Solo se hacen en Mercurio, en la planta solar de Mercurio. La perforadora de vetas de Mercurio, el campo solar de Mercurio y el interferómetro se apoyan en los ladrillos de escudo térmico; los paneles de película fina son los paneles del campo solar de Mercurio, y su controlador también lleva algunos.')

    add('emi.grindless.info.heliostat_mirror.0', 'Un bloque de estructura: el campo de espejos de la torre solar de heliostatos (LV) y de la planta solar de Mercurio. El controlador de la torre también lleva algunos.')
})
