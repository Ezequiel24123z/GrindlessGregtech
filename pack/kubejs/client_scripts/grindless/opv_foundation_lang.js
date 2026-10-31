// priority: 5752
// Gregtech Grindless - names and tooltips of the OpV foundation (startup_scripts/grindless/opv/foundation.js):
//
//   grindless:<item> and grindless:<block>   item.grindless.<n> / block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<material> (GT material)           material.gtceu.<n>
//   grindless:<material> (GT material)       material.grindless.<n>
//   the two places (startup_scripts/grindless/opv/travel.js, data/grindless/gcyr/planets/{sgr1806_orbit,terzan5_core}.json):
//     level.grindless.<planet> (GCYR's planet names), dimension.grindless.<world>, planet.grindless.<key> (quantum bridge messages)
//
// The gtceu:opv_* and gtceu:max_* names are GTM's own. Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts.
// Names go in en_us and es_es.
(function () {
    // id, en name, es name, en tip 0, es tip 0, en tip 1, es tip 1
    var ITEMS = [
        ['bulge_relay_seed', 'Bulge Relay Seed', 'Semilla de relé del bulbo', 'A relay seed of UXV parts: a strand magsail, a SHeQUID gyro and an FRC cartridge.', 'Una semilla de relé de piezas UXV: vela magnética de hebra, giroscopio SHeQUID y cartucho FRC.', 'It brakes on the bulge\'s gas near SGR 1806-20.', 'Frena en el gas del bulbo cerca de SGR 1806-20.'],
        ['launched_bulge_seed', 'Launched Bulge Seed', 'Semilla del bulbo lanzada', 'A bulge relay seed on its way, ready for the warp gate.', 'Una semilla de relé del bulbo en camino, lista para la puerta warp.', 'Spent by the c11 jump to SGR 1806-20.', 'Se gasta en el salto c11 a SGR 1806-20.'],
        ['chain_lamina_stack', 'Chain Lamina Stack', 'Pila de láminas de cadena', 'Thin laminae of chain matter, stacked and bonded.', 'Láminas finas de materia en cadena, apiladas y unidas.', 'Part of every OpV hull and component.', 'Forma parte de cada casco y componente OpV.'],
        ['ni_chain_slab', 'Nickel Chain Slab', 'Losa de níquel en cadena', 'Nickel-64 frozen into chain matter, caged for the trip home.', 'Níquel 64 congelado en materia en cadena, enjaulado para el viaje.', 'Made at SGR 1806-20; it feeds the superheavy beams.', 'Se hace en SGR 1806-20; alimenta los haces de superpesados.'],
        ['chain_field_coil', 'Chain Field Coil', 'Bobina de campo de cadena', 'A coil wound with chain strand wire.', 'Una bobina devanada con alambre de hebra de cadena.', 'Part of OpV motors and field generators.', 'Parte de los motores y generadores de campo OpV.'],
        ['chain_composite_rod', 'Chain Composite Rod', 'Varilla de compuesto de cadena', 'A rod of chain matter in a sintered matrix.', 'Una varilla de materia en cadena en una matriz sinterizada.', 'Part of OpV motors and pistons.', 'Parte de los motores y pistones OpV.'],
        ['chain_composite_rotor', 'Chain Composite Rotor', 'Rotor de compuesto de cadena', 'A pump rotor that keeps its shape at any speed.', 'Un rotor de bomba que mantiene su forma a cualquier velocidad.', 'Part of the OpV electric pump.', 'Parte de la bomba eléctrica OpV.'],
        ['superfluid_he3_seal', 'Superfluid He-3 Seal', 'Sello de He-3 superfluido', 'A shaft seal flooded with superfluid helium-3: no friction at all.', 'Un sello de eje inundado de helio 3 superfluido: sin fricción alguna.', 'Part of the OpV electric pump.', 'Parte de la bomba eléctrica OpV.'],
        ['chain_mesh_belt', 'Chain Mesh Belt', 'Cinta de malla de cadena', 'A belt woven from chain strand.', 'Una cinta tejida con hebra de cadena.', 'Part of the OpV conveyor module.', 'Parte del módulo transportador OpV.'],
        ['opv_harmonic_drive', 'OpV Harmonic Drive', 'Reductor armónico OpV', 'A strain-wave gear with a chain-matter flexspline.', 'Un engranaje de onda de deformación con flexspline de materia en cadena.', 'Part of OpV pistons, robot arms and fluid regulators.', 'Parte de los pistones, brazos robóticos y reguladores de fluido OpV.'],
        ['th229_lasing_crystal', 'Th-229 Lasing Crystal', 'Cristal láser de Th-229', 'A crystal doped with thorium-229, the nucleus with an optical transition.', 'Un cristal dopado con torio 229, el núcleo con una transición óptica.', 'The lasing core of the OpV emitter.', 'El núcleo láser del emisor OpV.'],
        ['hpge_compton_crystal', 'HPGe Compton Crystal', 'Cristal Compton de HPGe', 'High-purity germanium, cold enough to count single gamma photons.', 'Germanio de alta pureza, lo bastante frío para contar fotones gamma uno a uno.', 'The detector of the OpV sensor.', 'El detector del sensor OpV.'],
        ['inas_al_wafer', 'InAs/Al Wafer', 'Oblea de InAs/Al', 'Indium arsenide quantum wells under an epitaxial aluminium film.', 'Pozos cuánticos de arseniuro de indio bajo una película epitaxial de aluminio.', 'The stock of topological qubits.', 'La base de los cúbits topológicos.'],
        ['gated_2deg_wafer', 'Gated 2DEG Wafer', 'Oblea 2DEG con puertas', 'A two-dimensional electron gas patterned with gates.', 'Un gas de electrones bidimensional con puertas litografiadas.', 'Cut with a cryo-CMOS die into tetron dies.', 'Se corta con un chip CMOS criogénico en chips tetrón.'],
        ['tetron_die', 'Tetron Die', 'Chip tetrón', 'Four Majorana zero modes on one die: a topological qubit.', 'Cuatro modos cero de Majorana en un chip: un cúbit topológico.', 'Tiled into tetron arrays.', 'Se agrupa en matrices de tetrones.'],
        ['cryo_cmos_die', 'Cryo-CMOS Die', 'Chip CMOS criogénico', 'Control logic that runs at a few kelvin, beside the qubits.', 'Lógica de control que funciona a pocos kelvin, junto a los cúbits.', 'Part of tetron dies and the cosmic mainframe.', 'Parte de los chips tetrón y del mainframe cósmico.'],
        ['nb_tsv_interposer', 'Nb TSV Interposer', 'Interposer de TSV de Nb', 'A silicon interposer with superconducting niobium through-vias.', 'Un interposer de silicio con vías pasantes de niobio superconductor.', 'Joins cold dies without leaking heat.', 'Une chips fríos sin fugas de calor.'],
        ['cryo_optical_link', 'Cryo Optical Link', 'Enlace óptico criogénico', 'Carries data out of the cryostat as light, not heat.', 'Saca los datos del criostato como luz, no como calor.', 'Part of OpV emitters, sensors and the cosmic mainframe.', 'Parte de los emisores, sensores y el mainframe cósmico OpV.'],
        ['hemt_amplifier', 'HEMT Amplifier', 'Amplificador HEMT', 'A cryogenic high-electron-mobility amplifier for qubit readout.', 'Un amplificador criogénico de alta movilidad electrónica para leer cúbits.', 'Part of the cosmic mainframe.', 'Parte del mainframe cósmico.'],
        ['gan_mmic', 'GaN MMIC', 'MMIC de GaN', 'A gallium nitride microwave chip on silicon carbide.', 'Un chip de microondas de nitruro de galio sobre carburo de silicio.', 'Drives the transmitter tiles.', 'Excita las losetas transmisoras.'],
        ['sdd_die', 'Silicon Drift Detector Die', 'Chip detector de deriva de silicio', 'Float-zone silicon with drift rings and a tiny anode.', 'Silicio de zona flotante con anillos de deriva y un ánodo diminuto.', 'Counts X-rays one at a time.', 'Cuenta rayos X de uno en uno.'],
        ['field_frozen_plate', 'Field-Frozen Plate', 'Placa congelada en campo', 'Chain matter pressed in a magnetar\'s field and frozen in shape.', 'Materia en cadena prensada en el campo de un magnetar y congelada en su forma.', 'Made at SGR 1806-20; OpV energy hatches and field generators.', 'Se hace en SGR 1806-20; hatches de energía y generadores de campo OpV.'],
        ['aln_power_die', 'AlN Power Die', 'Chip de potencia de AlN', 'An AlGaN transistor on aluminium nitride: an ultra-wide bandgap.', 'Un transistor de AlGaN sobre nitruro de aluminio: banda prohibida ultraancha.', 'Switches OpV power in the energy hatches.', 'Conmuta la energía OpV en los hatches de energía.'],
        ['tetron_array', 'Tetron Array', 'Matriz de tetrones', 'Tetron dies tiled into a fault-tolerant qubit array.', 'Chips tetrón agrupados en una matriz de cúbits tolerante a fallos.', 'Made only at home.', 'Solo se hace en casa.'],
        ['gamma_multilayer_mirror', 'Gamma Multilayer Mirror', 'Espejo multicapa gamma', 'Thousands of alternating layers that reflect gamma rays at grazing angles.', 'Miles de capas alternas que reflejan rayos gamma con incidencia rasante.', 'Gamma optics are made only at home.', 'La óptica gamma solo se hace en casa.'],
        ['laue_lens', 'Laue Lens', 'Lente de Laue', 'Rings of crystals that focus gamma rays by diffraction.', 'Anillos de cristales que enfocan rayos gamma por difracción.', 'Focuses the gamma beams of OpV optics.', 'Enfoca los haces gamma de la óptica OpV.'],
        ['be_beam_window', 'Beryllium Beam Window', 'Ventana de haz de berilio', 'A thin beryllium window that lets the beam out of the vacuum.', 'Una ventana fina de berilio que deja salir el haz del vacío.', 'Part of the antiproton source.', 'Parte de la fuente de antiprotones.'],
        ['ir_spallation_target', 'Iridium Spallation Target', 'Blanco de espalación de iridio', 'Struck by the jet\'s protons, it yields antiprotons.', 'Golpeado por los protones del chorro, produce antiprotones.', 'It wears out into a spent target.', 'Se desgasta hasta ser un blanco agotado.'],
        ['spent_ir_target', 'Spent Iridium Target', 'Blanco de iridio agotado', 'An iridium target worn out by spallation; still radioactive.', 'Un blanco de iridio gastado por la espalación; aún radiactivo.', 'Recovered by an older machine, never voided.', 'Lo recupera una máquina anterior; nunca se destruye.'],
        ['li6_hydride_shield', 'Li-6 Hydride Shield', 'Escudo de hidruro de Li-6', 'Lithium-6 hydride soaks up the neutrons spallation throws.', 'El hidruro de litio 6 absorbe los neutrones que lanza la espalación.', 'Shields the antiproton source and the absorber.', 'Protege la fuente de antiprotones y el absorbedor.'],
        ['electron_cooler', 'Electron Cooler', 'Enfriador de electrones', 'A cold electron beam rides along the antiprotons and cools them.', 'Un haz frío de electrones acompaña a los antiprotones y los enfría.', 'Part of the antiproton decelerator.', 'Parte del decelerador de antiprotones.'],
        ['stochastic_cooling_pickup', 'Stochastic Cooling Pickup', 'Captador de enfriamiento estocástico', 'Senses the beam\'s spread and kicks it back on track.', 'Detecta la dispersión del haz y lo devuelve a su trayectoria.', 'Van der Meer\'s trick at OpV scale.', 'El truco de Van der Meer a escala OpV.'],
        ['pb208_beam_cell', 'Pb-208 Beam Cell', 'Celda de haz de Pb-208', 'Doubly magic lead-208, ready for the ion source.', 'Plomo 208 doblemente mágico, listo para la fuente de iones.', 'Feeds the antiproton source and the distiller.', 'Alimenta la fuente de antiprotones y el destilador.'],
        ['octupole_trap_magnet', 'Octupole Trap Magnet', 'Imán de trampa octupolar', 'A superconducting octupole that holds neutral antihydrogen by its magnetic moment.', 'Un octupolo superconductor que retiene el antihidrógeno neutro por su momento magnético.', 'Part of the antihydrogen trap.', 'Parte de la trampa de antihidrógeno.'],
        ['levitation_trap_cell', 'Levitation Trap Cell', 'Celda de trampa de levitación', 'A cell that holds frozen antimatter off its walls.', 'Una celda que mantiene la antimateria congelada lejos de sus paredes.', 'Filled with antihydrogen ice.', 'Se llena de hielo de antihidrógeno.'],
        ['lyman_alpha_laser', 'Lyman-Alpha Laser', 'Láser Lyman-alfa', 'A 121.6 nm laser that cools trapped antihydrogen.', 'Un láser de 121,6 nm que enfría el antihidrógeno atrapado.', 'Part of the antihydrogen trap.', 'Parte de la trampa de antihidrógeno.'],
        ['gamma_absorber_tile', 'Gamma Absorber Tile', 'Loseta absorbente gamma', 'A dense tile that turns annihilation gammas into heat.', 'Una loseta densa que convierte los gammas de aniquilación en calor.', 'Lines the annihilation engine.', 'Recubre el motor de aniquilación.'],
        ['tpv_panel', 'TPV Panel', 'Panel termofotovoltaico', 'A thermophotovoltaic panel: glowing heat in, electricity out.', 'Un panel termofotovoltaico: entra calor incandescente, sale electricidad.', 'Turns the annihilation engine\'s heat into power.', 'Convierte el calor del motor de aniquilación en energía.'],
        ['acmf_pellet', 'ACMF Pellet', 'Pastilla ACMF', 'A fusion pellet ignited by a few antiprotons.', 'Una pastilla de fusión que encienden unos pocos antiprotones.', 'Burned with an antiproton stack for power.', 'Se quema con una pila de antiprotones para obtener energía.'],
        ['seed_positron_plasma', 'Seed Positron Plasma', 'Plasma semilla de positrones', 'A few positrons in a Penning trap, to seed the pair converter.', 'Unos pocos positrones en una trampa de Penning, para cebar el convertidor de pares.', 'Carried from home to SGR 1806-20.', 'Se lleva de casa a SGR 1806-20.'],
        ['dense_positron_cell', 'Dense Positron Cell', 'Celda densa de positrones', 'Positrons from the magnetar\'s pair cascade, packed into a trap.', 'Positrones de la cascada de pares del magnetar, comprimidos en una trampa.', 'For antihydrogen and the Kugelblitz charge.', 'Para el antihidrógeno y la carga Kugelblitz.'],
        ['cold_antiproton_cell', 'Cold Antiproton Cell', 'Celda de antiprotones fríos', 'Antiprotons decelerated and cooled into a trap.', 'Antiprotones decelerados y enfriados en una trampa.', 'Made at Cygnus X-1; stacked, frozen or burned at home.', 'Se hace en Cygnus X-1; se apila, congela o quema en casa.'],
        ['antiproton_stack_opv', 'OpV Antiproton Stack', 'Pila de antiprotones OpV', 'Many cold antiproton cells merged into one dense stack.', 'Muchas celdas de antiprotones fríos fusionadas en una pila densa.', 'Fuel for annihilation power.', 'Combustible para la energía de aniquilación.'],
        ['antihydrogen_ice_cell', 'Antihydrogen Ice Cell', 'Celda de hielo de antihidrógeno', 'Solid antihydrogen, levitated in a trap cell.', 'Antihidrógeno sólido, levitando en una celda de trampa.', 'Made only at home.', 'Solo se hace en casa.'],
        ['strangelet_seed', 'Strangelet Seed', 'Semilla de strangelet', 'A tiny lump of strange quark matter, kept away from normal matter.', 'Un trocito de materia de quarks extraños, aislado de la materia normal.', 'Kept in the vault.', 'Se guarda en la bóveda.'],
        ['stable_exotic_matter', 'Stable Exotic Matter', 'Materia exótica estable', 'Negative-energy matter that stays put.', 'Materia de energía negativa que se mantiene estable.', 'Fuels the Hawking collector and keeps the gate open.', 'Alimenta el colector Hawking y mantiene abierta la puerta.'],
        ['kugelblitz_core', 'Kugelblitz Core', 'Núcleo Kugelblitz', 'A tiny black hole made from focused light.', 'Un agujero negro diminuto hecho de luz concentrada.', 'Powers the Hawking drive and collector.', 'Alimenta el propulsor y el colector Hawking.'],
        ['hawking_drive', 'Hawking Drive', 'Propulsor Hawking', 'Pushes on the light of an evaporating black hole.', 'Empuja con la luz de un agujero negro que se evapora.', 'Brakes the pathfinder at Terzan 5.', 'Frena la sonda exploradora en Terzan 5.'],
        ['xnav_unit', 'XNAV Unit', 'Unidad XNAV', 'Navigates by the timing of millisecond pulsars.', 'Navega por la cadencia de los púlsares de milisegundos.', 'Guides probes through Terzan 5.', 'Guía las sondas por Terzan 5.'],
        ['node_power_transmitter', 'Node Power Transmitter', 'Transmisor de energía de nodo', 'Beams power between collector nodes.', 'Transmite energía entre nodos colectores.', 'Part of the Terzan 5 node network.', 'Parte de la red de nodos de Terzan 5.'],
        ['bulge_debris', 'Bulge Debris', 'Escombros del bulbo', 'Rubble from the body at Terzan 5\'s core.', 'Escombros del cuerpo en el núcleo de Terzan 5.', 'Sorted into metal and silicate fractions.', 'Se separa en fracciones metálica y silicatada.'],
        ['metal_feedstock', 'Metal Feedstock', 'Materia prima metálica', 'Clean metal from the debris, ready for probes to build with.', 'Metal limpio de los escombros, listo para que las sondas construyan.', 'Made at Terzan 5.', 'Se hace en Terzan 5.'],
        ['silicate_debris_fraction', 'Silicate Debris Fraction', 'Fracción silicatada de escombros', 'The rocky half of sorted debris.', 'La mitad rocosa de los escombros separados.', 'Reduced to silicon alloy powder and oxygen.', 'Se reduce a polvo de aleación de silicio y oxígeno.'],
        ['si_alloy_powder', 'Silicon Alloy Powder', 'Polvo de aleación de silicio', 'Silicon and metal powder reduced from silicate debris.', 'Polvo de silicio y metal reducido de escombros silicatados.', 'Sintered into casings.', 'Se sinteriza en carcasas.'],
        ['cluster_sinter_casing', 'Cluster Sinter Casing', 'Carcasa sinterizada del cúmulo', 'A casing a probe sinters from debris powders.', 'Una carcasa que una sonda sinteriza con polvos de escombros.', 'Made at Terzan 5.', 'Se hace en Terzan 5.'],
        ['collector_node', 'Collector Node', 'Nodo colector', 'A self-built node that gathers the cluster core\'s light.', 'Un nodo autoconstruido que recoge la luz del núcleo del cúmulo.', 'It wears out into a spent node.', 'Se desgasta hasta ser un nodo agotado.'],
        ['spent_collector_node', 'Spent Collector Node', 'Nodo colector agotado', 'A collector node at the end of its life.', 'Un nodo colector al final de su vida.', 'Taken back for its parts.', 'Se recupera por sus piezas.'],
        ['deployed_node_pack', 'Deployed Node Pack', 'Paquete de nodos desplegado', 'Four nodes and a probe seed, sent out together.', 'Cuatro nodos y una semilla de sonda, enviados juntos.', 'Spreads the node network.', 'Extiende la red de nodos.'],
        ['probe_seed', 'Probe Seed', 'Semilla de sonda', 'A self-replicating probe: from feedstock, it builds another.', 'Una sonda autorreplicante: con materia prima, construye otra.', 'One returned seed makes two.', 'Una semilla devuelta da dos.'],
        ['vitamin_kit', 'Vitamin Kit', 'Kit de vitaminas', 'What a probe cannot make from debris: chips and rare elements.', 'Lo que una sonda no puede hacer con escombros: chips y elementos raros.', 'Sent from home to Terzan 5.', 'Se envía de casa a Terzan 5.'],
        ['pathfinder_probe', 'Pathfinder Probe', 'Sonda exploradora', 'A tetron array, an XNAV unit, a SHeQUID gyro and a Hawking drive.', 'Una matriz de tetrones, una unidad XNAV, un giroscopio SHeQUID y un propulsor Hawking.', 'Thrown by the c12 jump to Terzan 5.', 'La lanza el salto c12 a Terzan 5.'],
        ['launched_pathfinder', 'Launched Pathfinder', 'Sonda exploradora lanzada', 'A pathfinder on its way, ready for the warp gate.', 'Una sonda exploradora en camino, lista para la puerta warp.', 'Spent by the c12 jump to Terzan 5.', 'Se gasta en el salto c12 a Terzan 5.'],
        ['pathfinder_probe_core', 'Pathfinder Probe Core', 'Núcleo de sonda exploradora', 'The core the landed pathfinder leaves.', 'El núcleo que deja la sonda exploradora al aterrizar.', 'Builds the first probe seed.', 'Construye la primera semilla de sonda.'],
        ['bulge_light_census', 'Bulge Light Census', 'Censo de luz del bulbo', 'A survey of the starlight in the cluster core.', 'Un estudio de la luz estelar del núcleo del cúmulo.', 'Made at Terzan 5; needed to reach MAX.', 'Se hace en Terzan 5; necesario para llegar a MAX.'],
        ['superheavy_census_iv', 'Superheavy Census IV', 'Censo de superpesados IV', 'Elements 124 and 126 and the island nuclide, charted.', 'Los elementos 124 y 126 y el nucleido de la isla, cartografiados.', 'Needed to reach MAX.', 'Necesario para llegar a MAX.'],
        ['element_124_recoil', 'Element 124 Recoil', 'Retroceso del elemento 124', 'Atoms of element 124 caught as they recoil (fiction above oganesson).', 'Átomos del elemento 124 atrapados al retroceder (ficción más allá del oganesón).', 'Curium-248 struck by a nickel-64 beam.', 'Curio 248 golpeado por un haz de níquel 64.'],
        ['element_126_recoil', 'Element 126 Recoil', 'Retroceso del elemento 126', 'Atoms of element 126 caught as they recoil (fiction above oganesson).', 'Átomos del elemento 126 atrapados al retroceder (ficción más allá del oganesón).', 'From an irradiated californium-249 target wheel.', 'De una rueda de blancos de californio 249 irradiada.'],
        ['chain_strand_repeater', 'Chain Strand Repeater', 'Repetidor de hebra de cadena', 'Chain strand wire, a pasta strand repeater and a tetron die.', 'Alambre de hebra de cadena, un repetidor de hebra de pasta y un chip tetrón.', 'Carries OpV power over long links.', 'Lleva la energía OpV por enlaces largos.'],
        ['sgr_a_chart', 'Sgr A* Chart', 'Carta de Sgr A*', 'A chart of the galaxy\'s central black hole and its orbits.', 'Una carta del agujero negro central de la galaxia y sus órbitas.', 'Researches the MAX machine casing.', 'Investiga la carcasa de máquina MAX.']
    ]

    var BLOCKS = [
        ['field_frozen_casing', 'Field-Frozen Casing', 'Carcasa congelada en campo', 'A casing of field-frozen plate.', 'Una carcasa de placa congelada en campo.', 'For OpV multiblocks.', 'Para multibloques OpV.'],
        ['annihilation_shield_casing', 'Annihilation Shield Casing', 'Carcasa de escudo de aniquilación', 'Absorbs the gammas of matter meeting antimatter.', 'Absorbe los gammas del encuentro de materia y antimateria.', 'For the annihilation engine.', 'Para el motor de aniquilación.'],
        ['neg_xhv_casing', 'NEG XHV Casing', 'Carcasa XHV de NEG', 'A non-evaporable getter casing for extreme high vacuum.', 'Una carcasa de getter no evaporable para vacío extremo.', 'For the antiproton and antihydrogen traps.', 'Para las trampas de antiprotones y antihidrógeno.']
    ]

    // kind, id, en, es
    var NAMES = [
        ['material', 'chain_strand', 'Chain Strand', 'Hebra de cadena'],
        ['gmaterial', 'superfluid_helium_3', 'Superfluid Helium-3', 'Helio 3 superfluido'],
        ['gmaterial', 'jet_proton_beam', 'Jet Proton Beam', 'Haz de protones del chorro'],
        ['gmaterial', 'hot_pair_plasma', 'Hot Pair Plasma', 'Plasma de pares caliente']
    ]

    var PREFIX = { material: 'material.gtceu.', gmaterial: 'material.grindless.' }

    // world, travel key, level en, level es, dimension en, dimension es, planet en, planet es
    var PLACES = [
        ['sgr1806_orbit', 'sgr1806', 'SGR 1806-20', 'SGR 1806-20', 'SGR 1806-20 Orbit', 'Órbita de SGR 1806-20', 'SGR 1806-20', 'SGR 1806-20'],
        ['terzan5_core', 'terzan5', 'Terzan 5 Core', 'Núcleo de Terzan 5', 'Terzan 5 Core', 'Núcleo de Terzan 5', 'Terzan 5', 'Terzan 5']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            var add = function (key, value) { event.add('grindless', key, value) }
            var tipped = function (kind) {
                return function (e) {
                    add(kind + '.grindless.' + e[0], e[1 + li])
                    add('tooltip.grindless.' + e[0] + '.0', e[3 + li])
                    add('tooltip.grindless.' + e[0] + '.1', e[5 + li])
                }
            }
            ITEMS.forEach(tipped('item'))
            BLOCKS.forEach(tipped('block'))
            NAMES.forEach(function (e) { add(PREFIX[e[0]] + e[1], e[2 + li]) })
            PLACES.forEach(function (p) {
                add('level.grindless.' + p[0], p[2 + li])
                add('dimension.grindless.' + p[0], p[4 + li])
                add('planet.grindless.' + p[1], p[6 + li])
            })
        })
    })
})()
