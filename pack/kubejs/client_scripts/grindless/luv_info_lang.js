// priority: 7550
// Gregtech Grindless - EMI information pages of the LuV era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in the luv_*_lang.js files; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.harpoon_anchor_drill.0', "The Harpoon Anchor Drill is the vein drill of the asteroid belt. Put the M-, S- or C-type vein sample and an HSS-S drill bit in the input bus; it gives 11.25 raw ores a run and wears the bit and an anchor harpoon.")
    add('emi.grindless.info.harpoon_anchor_drill.1', "It works only in the belt and runs only its own recipes. No fluid: it is vacuum. Up to 256 runs at once, as the energy hatches allow.")

    add('emi.grindless.info.asteroid_processor.0', "The Asteroid Processor runs the Mond process. Circuit 1: crushed meteoric iron. Circuit 3: meteoric iron dust. Both give iron, nickel and cobalt and leave the asteroid PGM concentrate. Circuit 2: splits crushed tetrataenite from its kamacite.")
    add('emi.grindless.info.asteroid_processor.1', "Circuits 1 and 3 need a 1,000 mB carbon monoxide charge in an input hatch, never used up. It keeps the concentrate and refuses item voiding. Works anywhere.")

    add('emi.grindless.info.optical_miner.0', "The Optical Miner works only in the asteroid belt. Circuit 1 bags a C-type boulder and spalls it with sunlight: water, carbon dioxide, carbon and the chondritic extract. Circuit 2 turns carbon dioxide and carbon into carbon monoxide.")
    add('emi.grindless.info.optical_miner.1', "Circuit 1 starts only by day, with the sun on the receiver and all eight mirrors under open sky. Circuit 2 needs no sun. It keeps everything and refuses voiding. The carbon monoxide feeds the Asteroid Processor.")

    add('emi.grindless.info.biofoundry.0', "The Biofoundry is GregTech's sterile chain in one hall, with no sterile cleanroom. Circuits 1-2: collagen. 3: gelatin. 4: agar. 5: bacterial sludge. 6: mutagen. 7: sterile growth medium. 8: stem cells.")
    add('emi.grindless.info.biofoundry.1', "Everything goes in and out through the back wall. It refuses voiding: sludge, acid and phosphorus go back into the chain. Its products feed the Organoid Lab.")

    add('emi.grindless.info.coated_conductor_line.0', "The Coated Conductor Line makes second-generation superconducting tape. Circuit 1: nickel-tungsten tape from nickel and tungsten dust. Circuit 2: ITBTC coated conductor from that tape, ITBTC dust, oxygen and molten silver.")
    add('emi.grindless.info.coated_conductor_line.1', "It needs no 6,000 K blast furnace and no liquid helium. The coated conductor goes to the HTS Magnet Works.")

    add('emi.grindless.info.algae_bioreactor.0', "The Algae Bioreactor grows living matter. Circuit 1, anywhere: algae turn water and CO2 into biomass and oxygen. Circuit 2, Europa only: Europan brine, hydrogen peroxide, hydrogen and chondritic extract make bacteria, seeded by the ocean sample.")
    add('emi.grindless.info.algae_bioreactor.1', "The ocean sample is kept. It is the only source of bacteria in the pack and refuses voiding.")

    add('emi.grindless.info.cryobot.0', "The Cryobot is the vein drill of Europa. Circuit 1: a cryobot probe melts down to the ocean and brings back the ocean sample and 1,000 mB of brine. Circuit 2: 8,000 mB of Europan brine and 2,000 mB of water a run.")
    add('emi.grindless.info.cryobot.1', "It works only on Europa and runs only its own recipes. The melt head wears 0.25% a run and the RTG pellet lasts about an hour. It refuses voiding.")

    add('emi.grindless.info.gravitational_wave_detector.0', "The Gravitational-Wave Detector works only on Ganymede. Circuit 1: a data orb, 100 mB of liquid helium and the Sagittarius A* Signal (kept) give a Gravitational-Wave Catalogue after a 12,000-tick run.")
    add('emi.grindless.info.gravitational_wave_detector.1', "Keep the whole L loaded while it listens. It keeps its catalogues and refuses item voiding.")

    add('emi.grindless.info.coilgun_launcher.0', "The Coilgun Probe Launcher works only on Ganymede. Circuit 1 fires a Jupiter entry probe for the Jovian Atmosphere Survey. Circuit 2 sends a Saturn flyby probe on a Jupiter slingshot for the Saturn Transfer Chart.")
    add('emi.grindless.info.coilgun_launcher.1', "No air and 110 K: the coils superconduct with no cryostat. It keeps the probes' data and refuses item voiding.")

    add('emi.grindless.info.helium_refrigerator.0', "The Helium Refrigerator is a closed-loop helium cooler. It does the vacuum freezer's job on hot ingots and on molten metal in an ingot mold, but spends 25 mB of liquid helium a run instead of 250 mB.")
    add('emi.grindless.info.helium_refrigerator.1', "It pays the difference in EU to liquefy the helium again. 50 mB of liquid nitrogen precools the loop and leaves as nitrogen gas.")

    add('emi.grindless.info.hts_magnet_works.0', "The HTS Magnet Works makes magnets from superconducting tape. Circuit 1: HTS coil (superconducting coil block). 2: LuV SMES cell. 3: coilgun coil casings. 4: magnetic bearing.")
    add('emi.grindless.info.hts_magnet_works.1', "The HTS coil takes ITBTC coated conductor, niobium-titanium foils, trinium and epoxy, with far less trinium than GTM's LuV recipe. The SMES cell is the wireless network's LuV cell.")

    add('emi.grindless.info.flux_tube_tether.0', "The Flux-Tube Tether is a power plant in Io orbit only. A bare tether sweeps Io's plasma torus and burns nothing. Each 20 s run needs circuit 1, 50 mB of argon and two tether spools in the bus.")
    add('emi.grindless.info.flux_tube_tether.1', "It makes 65,536 EU/t per reel cell: 131,072 EU/t with both. A spool wears out about once an hour.")

    add('emi.grindless.info.fumarole_condenser.0', "The Fumarole Condenser works Io's volcanic gases. Circuit 1, only on Io: SO2, sulfur and an Ionian sublimate. Circuit 2, anywhere: sublimates, hydrogen and an HCl charge give germanium and indium. Circuit 3, only on Io: sulfur concrete.")
    add('emi.grindless.info.fumarole_condenser.1', "The HCl charge is kept. It refuses voiding. It is the only source of germanium before ZPM.")

    add('emi.grindless.info.volcanic_intake.0', "The Volcanic Intake is a power plant on Io only. It burns nothing: a sulfur dioxide loop runs between the patera's magma and Io's cold sky. Each 20 s run needs circuit 1 and a 4,000 mB SO2 charge, kept.")
    add('emi.grindless.info.volcanic_intake.1', "It makes 32,768 EU/t per complete turbine module, up to 131,072 EU/t. A heat exchanger bundle per module wears out about once an hour.")

    add('emi.grindless.info.mega_chemical_complex.0', "The Mega Chemical Complex has two modes picked in the controller: every chemical reactor and large chemical reactor recipe, or the long PTFE, epoxy and para-aramid lines in one step with every byproduct as an output.")
    add('emi.grindless.info.mega_chemical_complex.1', "Parallels are 2^(coil temperature / 900 K) times the parallel hatch. Each copy pays full EU/t, so the energy hatches set how many run. Coils above Cupronickel cut the energy by 5%, down to 80%.")

    add('emi.grindless.info.hydroponic_ring.0', "The Rotating Hydroponic Ring is orbit-only molecular farming, not a crop multiplier. Circuit 5: kept barley seed, water and CO2 give neurotrophic factor. Circuit 6: kept tobacco seed gives plant collagen. Both also make biomass and oxygen.")
    add('emi.grindless.info.hydroponic_ring.1', "Biomass feeds the Biofoundry and the neurotrophic factor feeds the Organoid Lab. Oxygen supports the station. It refuses voiding.")

    add('emi.grindless.info.organoid_lab.0', "The Organoid Lab works in orbit only, with a cleanroom or a cleaning maintenance hatch. Circuit 1 grows a neural organoid from stem cells, sterile medium and neurotrophic factor. Circuit 2 assembles a neuro processing unit.")
    add('emi.grindless.info.organoid_lab.1', "The processing unit takes 30,720 EU/t for 1,563 ticks. Stem cells come from the Biofoundry, neurotrophic factor from the Hydroponic Ring. It keeps all products and refuses voiding.")

    add('emi.grindless.info.zero_g_crystal_grower.0', "The Zero-G Crystal Grower works in orbit only, with a cleanroom or a cleaning maintenance hatch. Circuits 1-5 grow raw crystal chips with 100% certainty in 3,000 ticks, at GregTech's dopant doses. Circuit 6 grows a sapphire test mass.")
    add('emi.grindless.info.zero_g_crystal_grower.1', "The sapphire test mass is a part of the gravitational-wave detector.")

    add('emi.grindless.info.microgravity_smelter.0', "The Microgravity Smelter works in any orbit. Circuit 1: ZBLAN optical pipes. Circuit 2: Whipple shield foam. Circuit 3: cold naquadah alloy with no helium.")
    add('emi.grindless.info.microgravity_smelter.1', "Blend the ZBLAN in the Large Mixing Vessel. Optical pipes cannot be recycled and need a cleaning maintenance hatch. It takes an optional parallel hatch.")

    add('emi.grindless.info.wake_shield_facility.0', "The Wake Shield Facility works in any orbit and always needs a cleanroom or a cleaning maintenance hatch. Circuit 1: UHPIC wafer. Circuit 2: HPIC wafer. Circuit 3: triple-junction wafer.")
    add('emi.grindless.info.wake_shield_facility.1', "Power wafers take half the source and time. A triple-junction wafer can be cut into four solar cells. It takes an optional parallel hatch.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.harpoon_anchor_drill.0', "La perforadora anclada con arpones es la perforadora de vetas del cinturón de asteroides. Pon la muestra de veta tipo M, S o C y una broca HSS-S en el bus de entrada; da 11,25 menas en bruto por ciclo y desgasta la broca y un arpón de anclaje.")
    add('emi.grindless.info.harpoon_anchor_drill.1', "Solo funciona en el cinturón y solo hace sus propias recetas. Sin fluido: es vacío. Hasta 256 ciclos a la vez, según permitan los hatches de energía.")

    add('emi.grindless.info.asteroid_processor.0', "El procesador de asteroides ejecuta el proceso Mond. Circuito 1: hierro meteórico triturado. Circuito 3: polvo de hierro meteórico. Ambos dan hierro, níquel y cobalto y dejan el concentrado de PGM de asteroide. Circuito 2: separa la tetrataenita triturada de su kamacita.")
    add('emi.grindless.info.asteroid_processor.1', "Los circuitos 1 y 3 necesitan una carga de 1000 mB de monóxido de carbono en un hatch de entrada, que no se gasta. Conserva el concentrado y se niega a eliminar objetos. Funciona en cualquier sitio.")

    add('emi.grindless.info.optical_miner.0', "El minero óptico solo funciona en el cinturón de asteroides. El circuito 1 embolsa un bloque de tipo C y lo descascara con luz solar: agua, dióxido de carbono, carbono y el extracto condrítico. El circuito 2 convierte dióxido de carbono y carbono en monóxido de carbono.")
    add('emi.grindless.info.optical_miner.1', "El circuito 1 solo arranca de día, con el sol sobre el receptor y los ocho espejos a cielo abierto. El circuito 2 no necesita sol. Lo conserva todo y se niega a eliminar. El monóxido de carbono alimenta el procesador de asteroides.")

    add('emi.grindless.info.biofoundry.0', "La biofundición es la cadena estéril de GregTech en una sola nave, sin sala limpia estéril. Circuitos 1-2: colágeno. 3: gelatina. 4: agar. 5: lodo bacteriano. 6: mutágeno. 7: medio de cultivo estéril. 8: células madre.")
    add('emi.grindless.info.biofoundry.1', "Todo entra y sale por el muro trasero. Se niega a eliminar: el lodo, el ácido y el fósforo vuelven a la cadena. Sus productos alimentan el laboratorio de organoides.")

    add('emi.grindless.info.coated_conductor_line.0', "La línea de conductor recubierto fabrica cinta superconductora de segunda generación. Circuito 1: cinta de níquel-wolframio con polvo de níquel y de wolframio. Circuito 2: conductor recubierto de ITBTC con esa cinta, polvo de ITBTC, oxígeno y plata fundida.")
    add('emi.grindless.info.coated_conductor_line.1', "No necesita alto horno de 6000 K ni helio líquido. El conductor recubierto va a la fábrica de imanes HTS.")

    add('emi.grindless.info.algae_bioreactor.0', "El biorreactor de algas cultiva materia viva. Circuito 1, en cualquier sitio: las algas convierten agua y CO2 en biomasa y oxígeno. Circuito 2, solo en Europa: salmuera europana, peróxido de hidrógeno, hidrógeno y extracto condrítico dan bacterias, sembradas con la muestra del océano.")
    add('emi.grindless.info.algae_bioreactor.1', "La muestra del océano se conserva. Es la única fuente de bacterias del pack y se niega a eliminar.")

    add('emi.grindless.info.cryobot.0', "El criobot es la perforadora de vetas de Europa. Circuito 1: una sonda criobot se funde hasta el océano y trae la muestra del océano y 1000 mB de salmuera. Circuito 2: 8000 mB de salmuera europana y 2000 mB de agua por ciclo.")
    add('emi.grindless.info.cryobot.1', "Solo funciona en Europa y solo hace sus propias recetas. La cabeza de fusión se gasta un 0,25 % por ciclo y la pastilla de RTG dura más o menos una hora. Se niega a eliminar.")

    add('emi.grindless.info.gravitational_wave_detector.0', "El detector de ondas gravitacionales solo funciona en Ganímedes. Circuito 1: un orbe de datos, 100 mB de helio líquido y la señal de Sagitario A* (se conserva) dan un catálogo de ondas gravitacionales tras 12 000 ticks.")
    add('emi.grindless.info.gravitational_wave_detector.1', "Mantén cargada toda la L mientras escucha. Conserva sus catálogos y se niega a eliminar objetos.")

    add('emi.grindless.info.coilgun_launcher.0', "El lanzador de sondas por bobinas solo funciona en Ganímedes. El circuito 1 dispara una sonda de entrada en Júpiter para el estudio atmosférico joviano. El circuito 2 envía una sonda de sobrevuelo de Saturno con asistencia de Júpiter para la carta de transferencia a Saturno.")
    add('emi.grindless.info.coilgun_launcher.1', "Sin aire y a 110 K: las bobinas superconducen sin criostato. Conserva los datos de las sondas y se niega a eliminar objetos.")

    add('emi.grindless.info.helium_refrigerator.0', "El refrigerador de helio es un enfriador de helio en circuito cerrado. Hace el trabajo del congelador al vacío con lingotes calientes y con metal fundido en un molde de lingote, pero gasta 25 mB de helio líquido por receta en vez de 250 mB.")
    add('emi.grindless.info.helium_refrigerator.1', "Paga la diferencia en EU para volver a licuar el helio. 50 mB de nitrógeno líquido preenfrían el circuito y salen como nitrógeno gaseoso.")

    add('emi.grindless.info.hts_magnet_works.0', "La fábrica de imanes HTS hace imanes con cinta superconductora. Circuito 1: bobina HTS (bloque de bobina superconductora). 2: celda SMES LuV. 3: carcasas de bobina de cañón de bobinas. 4: cojinete magnético.")
    add('emi.grindless.info.hts_magnet_works.1', "La bobina HTS lleva conductor recubierto de ITBTC, láminas de niobio-titanio, trinio y epoxi, con mucho menos trinio que la receta LuV de GTM. La celda SMES es la celda LuV de la red inalámbrica.")

    add('emi.grindless.info.flux_tube_tether.0', "El cable del tubo de flujo es una central solo en la órbita de Ío. Un cable desnudo barre el toro de plasma de Ío y no quema nada. Cada ciclo de 20 s necesita el circuito 1, 50 mB de argón y dos carretes de cable en el bus.")
    add('emi.grindless.info.flux_tube_tether.1', "Da 65 536 EU/t por celda de carrete: 131 072 EU/t con las dos. Un carrete se gasta más o menos una vez por hora.")

    add('emi.grindless.info.fumarole_condenser.0', "El condensador de fumarolas trabaja los gases volcánicos de Ío. Circuito 1, solo en Ío: SO2, azufre y un sublimado jónico. Circuito 2, en cualquier sitio: sublimados, hidrógeno y una carga de HCl dan germanio e indio. Circuito 3, solo en Ío: hormigón de azufre.")
    add('emi.grindless.info.fumarole_condenser.1', "La carga de HCl se conserva. Se niega a eliminar. Es la única fuente de germanio antes de ZPM.")

    add('emi.grindless.info.volcanic_intake.0', "La toma volcánica es una central solo en Ío. No quema nada: un ciclo de dióxido de azufre corre entre el magma de la pátera y el cielo frío de Ío. Cada ciclo de 20 s necesita el circuito 1 y una carga de 4000 mB de SO2, que se conserva.")
    add('emi.grindless.info.volcanic_intake.1', "Da 32 768 EU/t por módulo de turbina completo, hasta 131 072 EU/t. Un haz intercambiador de calor por módulo se gasta más o menos una vez por hora.")

    add('emi.grindless.info.mega_chemical_complex.0', "El complejo químico mega tiene dos modos que se eligen en el controlador: todas las recetas del reactor químico y del reactor químico grande, o las líneas largas de PTFE, epoxi y para-aramida en un solo paso con cada subproducto como salida.")
    add('emi.grindless.info.mega_chemical_complex.1', "El paralelo es 2^(temperatura de bobina / 900 K) por el parallel hatch. Cada copia paga su EU/t completo, así que los hatches de energía fijan cuántas corren. Las bobinas por encima de cuproníquel recortan la energía un 5 %, hasta el 80 %.")

    add('emi.grindless.info.hydroponic_ring.0', "El anillo hidropónico giratorio es cultivo molecular solo en órbita, no un multiplicador de cosechas. Circuito 5: semilla de cebada (se conserva), agua y CO2 dan factor neurotrófico. Circuito 6: semilla de tabaco (se conserva) da colágeno vegetal. Ambos dan también biomasa y oxígeno.")
    add('emi.grindless.info.hydroponic_ring.1', "La biomasa alimenta la biofundición y el factor neurotrófico, el laboratorio de organoides. El oxígeno sostiene la estación. Se niega a eliminar.")

    add('emi.grindless.info.organoid_lab.0', "El laboratorio de organoides funciona solo en órbita, con sala limpia o un hatch de mantenimiento con limpieza. El circuito 1 cultiva un organoide neuronal con células madre, medio estéril y factor neurotrófico. El circuito 2 monta una unidad de procesamiento neuronal.")
    add('emi.grindless.info.organoid_lab.1', "La unidad de procesamiento gasta 30 720 EU/t durante 1563 ticks. Las células madre vienen de la biofundición y el factor neurotrófico, del anillo hidropónico. Conserva todo y se niega a eliminar.")

    add('emi.grindless.info.zero_g_crystal_grower.0', "El cultivador de cristales en gravedad cero funciona solo en órbita, con sala limpia o un hatch de mantenimiento con limpieza. Los circuitos 1-5 cultivan chips de cristal en bruto con 100 % de certeza en 3000 ticks, con las dosis de dopante de GregTech. El circuito 6 cultiva una masa de prueba de zafiro.")
    add('emi.grindless.info.zero_g_crystal_grower.1', "La masa de prueba de zafiro es una pieza del detector de ondas gravitacionales.")

    add('emi.grindless.info.microgravity_smelter.0', "La fundición de microgravedad funciona en cualquier órbita. Circuito 1: tubos ópticos de ZBLAN. Circuito 2: espuma de escudo Whipple. Circuito 3: aleación de naquadah fría sin helio.")
    add('emi.grindless.info.microgravity_smelter.1', "Mezcla el ZBLAN en el recipiente de mezcla grande. Los tubos ópticos no se pueden reciclar y piden un hatch de mantenimiento con limpieza. Admite un parallel hatch opcional.")

    add('emi.grindless.info.wake_shield_facility.0', "La instalación de escudo de estela funciona en cualquier órbita y siempre pide sala limpia o un hatch de mantenimiento con limpieza. Circuito 1: oblea UHPIC. Circuito 2: oblea HPIC. Circuito 3: oblea de triple unión.")
    add('emi.grindless.info.wake_shield_facility.1', "Las obleas de potencia llevan la mitad de fuente y de tiempo. Una oblea de triple unión se puede cortar en cuatro células solares. Admite un parallel hatch opcional.")
})
