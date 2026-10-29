// Gregtech Grindless - EMI information pages of the UEV era machines and the UEV and UIV hatches (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller (one per hatch family): what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in the uev_*_lang.js files; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.calutron.0', "The Calutron separates isotopes by mass: the ionised chloride runs round a vacuum racetrack and the collector pockets catch each isotope. Circuit 1: calcium pass 1 (40 %). 2: calcium pass 2 (97 %). 3: potassium-40. 4: lithium-6. 5: plutonium-244. 6: plutonium-242 for the high flux reactor. Circuits 7 to 9 are titanium-50, europium-151 and nickel-58.")
    add('emi.grindless.info.calutron.1', "It is the only route to calcium-48, potassium-40, lithium-6 and plutonium-244. It refuses to void: the depleted streams come out as stock, and the depleted plutonium goes back to the MOX line.")

    add('emi.grindless.info.electron_beam_furnace.0', "The Electron Beam Furnace melts metal drop by drop under an electron gun in hard vacuum, and the volatile impurities boil off: 6N purity. Circuit 1: rhenium. 2: hafnium. 3: tantalum. 4: niobium (RRR grade). 5: YSZ coating on an SX blade. 6: onion carbon. Circuits 7 and 8: the niobium-tantalum button and tin distillation.")
    add('emi.grindless.info.electron_beam_furnace.1', "It is the only maker of 6N hafnium, tantalum, niobium and rhenium. Every refining leaves an EB skull, which goes back to the platinum plant.")

    add('emi.grindless.info.entanglement_station.0', "The Entanglement Station entangles photons from a PPKTP source with a europium memory and checks them with SNSPDs. Circuit 1: a quantum repeater node, in one pass. It works only in Earth orbit.")
    add('emi.grindless.info.entanglement_station.1', "It is the only maker of quantum repeater nodes. The memory is held in superfluid helium, which is not used up.")

    add('emi.grindless.info.heavy_ion_cyclotron.0', "The Heavy Ion Cyclotron fires a calcium-48 beam at an actinide target; a helium chamber takes the recoil. Circuit 1: flerovium (plutonium-244). 2: livermorium (curium-248). 3: tennessine (target wheel). 4: oganesson (californium-249). 5: moscovium (americium). 6: a xenon beam on polycarbonate foil. Circuits 7 and 8 are the element 120 and 119 lines.")
    add('emi.grindless.info.heavy_ion_cyclotron.1', "The SRF cavity and the helium are not used up, and the xenon is recovered. It refuses to void: the recoil gases, the helium and the activated target wheel (to the Hot Cell) always have a place to go. The gases go on to the Recoil Separator.")

    add('emi.grindless.info.helium3_polariser.0', "The Helium-3 Polariser aligns the nuclear spins of 6N helium-3 by optical pumping. Circuit 1: polarises the gas. Circuit 2: mixes the polarised gas with deuterium into polarised fuel. Circuit 3: polarises helium-3 for a later era.")
    add('emi.grindless.info.helium3_polariser.1', "The 1,083 nm laser is a tool: it is never consumed. Depolarised gas goes back to the cryogenic plant. The polarised fuel feeds the Mk4 Fusion Reactor.")

    add('emi.grindless.info.megabar_press.0', "The Megabar Press is a multi-anvil press that squeezes matter past a million atmospheres. Circuit 1: (La,Y)H10 superhydride from La-Y foil and ammonia borane charges. Circuit 2: nanotwinned diamond from a pellet of onion carbon. Circuit 3: hot isostatic pressing of a printed RHEA impeller. Circuit 4: HPHT anneal of a C-12 diamond plate.")
    add('emi.grindless.info.megabar_press.1', "The nanotwinned diamond anvil wears: each run has a chance to use one up. An optional output hatch takes the hydrogen the superhydride gives off.")

    add('emi.grindless.info.photonic_integration_hall.0', "The Photonic Integration Hall bonds waveguides, quantum dot sources, detectors and modulators onto one chip. Circuit 1: waveguide circuit. 2: quantum photonic chip. 3: optical computer. Circuits 4 to 6: photonic tensor core, optical mainframe and pulsar-timed repeater.")
    add('emi.grindless.info.photonic_integration_hall.1', "It is the only place the optical computer is made, and the optical computers of the Mk4 Fusion Reactor and of later machines start here.")

    add('emi.grindless.info.quantum_gas_lab.0', "The Quantum Gas Lab cools lithium-6 and potassium-40 into a degenerate Fermi mixture and measures gravity with atom interferometry. Circuit 1: degenerate EOS model. 2: Barnard gravity survey. 3: calibrate the interferometer against the ULE cavity. It works only in Earth orbit.")
    add('emi.grindless.info.quantum_gas_lab.1', "The cooling lasers and the ULE cavity are tools: they are never consumed.")

    add('emi.grindless.info.recoil_separator.0', "The Recoil Separator is a gas-filled separator: dipole magnets bend the recoiling atoms away from the beam and an etched membrane catches them. Circuits 1 to 5, as the Heavy Ion Cyclotron: one recoil gas and one etched membrane give one atom item. Circuits 6 and 7 are the element 120 and 119 lines.")
    add('emi.grindless.info.recoil_separator.1', "The membrane is used up, the helium comes back. It refuses to void: the helium and the atoms must never be thrown away. The atoms go on to the Superheavy Chemistry Lab.")

    add('emi.grindless.info.single_crystal_foundry.0', "The Single-Crystal Foundry casts single-crystal parts in a withdrawal furnace under argon: one grain, no boundaries to creep along. Circuit 1: SX blade. 2: pump impeller. 3: Brayton turbine wheel from eight coated SX blades.")
    add('emi.grindless.info.single_crystal_foundry.1', "It is the only maker of those parts. The argon is never used up, the gate is remelted in a macerator and the dross goes to the platinum plant. It refuses to void.")

    add('emi.grindless.info.snspd_foundry.0', "The SNSPD Foundry is a cryostat that patterns a tungsten silicide film into a nanowire and packages it. Circuit 1: WSi film. 2: nanowire write. 3: waveguide mount. 4: cool and package into an SNSPD. Circuit 5: a niobium Josephson junction wafer.")
    add('emi.grindless.info.snspd_foundry.1', "It is the only maker of SNSPDs. It needs the FZ wafer and a SiN waveguide chip, which come from the photonics lines.")

    add('emi.grindless.info.superheavy_chemistry_lab.0', "The Superheavy Chemistry Lab counts, sorts and seals a few atoms at a time by gas chromatography on gold. Circuit 1: tennessine atoms in a sealed capsule give a sample. Circuit 2: flerovium, livermorium, moscovium and oganesson atoms on gold foil give the superheavy census. Circuit 3: the census of elements 119 and 120.")
    add('emi.grindless.info.superheavy_chemistry_lab.1', "The tennessine sample is only stored: no recipe uses it. It refuses to void: the atoms and the samples are never thrown away.")

    add('emi.grindless.info.uev_fusion_reactor.0', "The Mk4 Fusion Reactor is a tier 10 fusion ring. It runs three fuels, each from one premixed fluid: D-He-3 (circuit 1), p-11B (circuit 2) and polarised D-He-3 (circuit 3). It has an energy buffer far beyond the int range.")
    add('emi.grindless.info.uev_fusion_reactor.1', "Polarised fuel makes 1.5 times the plasma. The plasma is not burned for heat: it feeds the direct energy converter, and it cools back into its fuel fluid.")

    add('emi.grindless.info.vdw_stacker.0', "The VdW Stacker lays two-dimensional crystals on each other with a clean transfer arm. Circuit 1: hBN emitter chip. 2: graphene modulator. 3: graphene between two hBN films.")
    add('emi.grindless.info.vdw_stacker.1', "The films come from the CVD lines on copper foil. The chips and modulators go to the Photonic Integration Hall.")

    add('emi.grindless.info.uev_uiv_machine_hull.0', "The UEV and UIV Machine Hulls are the core that every machine and hatch of their tier is built on: the energy hatches start from one. They are made in an assembler from the tier's machine casing, cables and plates.")
    add('emi.grindless.info.uev_uiv_machine_hull.1', "On its own the hull does nothing; it can stand in a multiblock where a pass-through part is accepted.")

    add('emi.grindless.info.uev_uiv_energy_hatch.0', "The UEV and UIV Energy Hatches bring EU into a multiblock from a cable at their tier's voltage. The plain one takes 2 A and the 16A one takes 16 A, so it carries far more power through one cable. They are made in an assembler from the tier's machine hull and cables.")
    add('emi.grindless.info.uev_uiv_energy_hatch.1', "A multiblock of this tier takes them in its energy slots in the bottom layer. For a hatch with no cable, see the Wireless Energy Hatch.")

    add('emi.grindless.info.uev_uiv_dynamo_hatch.0', "The UEV and UIV Dynamo Hatches carry EU out of a generator multiblock into a cable at their tier's voltage. The plain one gives 2 A and the 16A one gives 16 A. They are made in an assembler from the tier's machine hull and cables.")
    add('emi.grindless.info.uev_uiv_dynamo_hatch.1', "A generator needs one, or its power has nowhere to go. For a hatch with no cable, see the Wireless Dynamo Hatch.")

    add('emi.grindless.info.uiv_parallel_hatch.0', "The Insane Parallel Control Hatch lets a machine that takes parallel hatches run up to 16384 copies of a recipe at once, each at its own EU/t.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.calutron.0', "El calutrón separa isótopos por masa: el cloruro ionizado recorre una pista de vacío y las cavidades colectoras recogen cada isótopo. Circuito 1: calcio, paso 1 (40 %). 2: calcio, paso 2 (97 %). 3: potasio-40. 4: litio-6. 5: plutonio-244. 6: plutonio-242 para el reactor de alto flujo. Los circuitos 7 a 9 son titanio-50, europio-151 y níquel-58.")
    add('emi.grindless.info.calutron.1', "Es la única vía al calcio-48, al potasio-40, al litio-6 y al plutonio-244. Se niega a desechar: las corrientes empobrecidas salen como existencias y el plutonio empobrecido vuelve a la línea de MOX.")

    add('emi.grindless.info.electron_beam_furnace.0', "El horno de haz de electrones funde el metal gota a gota bajo un cañón de electrones en alto vacío, y las impurezas volátiles se evaporan: pureza 6N. Circuito 1: renio. 2: hafnio. 3: tántalo. 4: niobio (grado RRR). 5: recubrimiento de YSZ sobre un álabe SX. 6: carbono cebolla. Circuitos 7 y 8: el botón de niobio-tántalo y la destilación de estaño.")
    add('emi.grindless.info.electron_beam_furnace.1', "Es el único que fabrica hafnio, tántalo, niobio y renio 6N. Cada refinado deja un casquete EB, que vuelve a la planta de platino.")

    add('emi.grindless.info.entanglement_station.0', "La estación de entrelazamiento entrelaza fotones de una fuente de PPKTP con una memoria de europio y los comprueba con SNSPD. Circuito 1: un nodo repetidor cuántico, en una sola pasada. Solo funciona en órbita terrestre.")
    add('emi.grindless.info.entanglement_station.1', "Es la única que fabrica nodos repetidores cuánticos. La memoria se mantiene en helio superfluido, que no se gasta.")

    add('emi.grindless.info.heavy_ion_cyclotron.0', "El ciclotrón de iones pesados dispara un haz de calcio-48 contra un blanco de actínido; una cámara de helio recoge el retroceso. Circuito 1: flerovio (plutonio-244). 2: livermorio (curio-248). 3: téneso (rueda de blancos). 4: oganesón (californio-249). 5: moscovio (americio). 6: un haz de xenón sobre lámina de policarbonato. Los circuitos 7 y 8 son las líneas de los elementos 120 y 119.")
    add('emi.grindless.info.heavy_ion_cyclotron.1', "La cavidad SRF y el helio no se gastan, y el xenón se recupera. Se niega a desechar: los gases de retroceso, el helio y la rueda de blancos activada (a la celda caliente) siempre tienen adónde ir. Los gases pasan al separador de retroceso.")

    add('emi.grindless.info.helium3_polariser.0', "El polarizador de helio-3 alinea los espines nucleares del helio-3 6N por bombeo óptico. Circuito 1: polariza el gas. Circuito 2: mezcla el gas polarizado con deuterio en combustible polarizado. Circuito 3: polariza helio-3 para una era posterior.")
    add('emi.grindless.info.helium3_polariser.1', "El láser de 1.083 nm es una herramienta: no se consume. El gas despolarizado vuelve a la planta criogénica. El combustible polarizado alimenta el reactor de fusión Mk4.")

    add('emi.grindless.info.megabar_press.0', "La prensa de megabares es una prensa de yunques múltiples que comprime la materia por encima del millón de atmósferas. Circuito 1: superhidruro (La,Y)H10 a partir de lámina de La-Y y cargas de amoniaco-borano. Circuito 2: diamante nanomaclado a partir de un pellet de carbono cebolla. Circuito 3: prensado isostático en caliente de un impulsor RHEA impreso. Circuito 4: recocido HPHT de una placa de diamante C-12.")
    add('emi.grindless.info.megabar_press.1', "El yunque de diamante nanomaclado se desgasta: cada pasada tiene una probabilidad de gastar uno. Una escotilla de salida opcional recoge el hidrógeno que desprende el superhidruro.")

    add('emi.grindless.info.photonic_integration_hall.0', "La sala de integración fotónica une guías de onda, fuentes de puntos cuánticos, detectores y moduladores en un solo chip. Circuito 1: circuito de guía de onda. 2: chip fotónico cuántico. 3: ordenador óptico. Circuitos 4 a 6: núcleo tensorial fotónico, mainframe óptico y repetidor sincronizado con púlsar.")
    add('emi.grindless.info.photonic_integration_hall.1', "Es el único lugar donde se fabrica el ordenador óptico, y los ordenadores ópticos del reactor de fusión Mk4 y de las máquinas posteriores empiezan aquí.")

    add('emi.grindless.info.quantum_gas_lab.0', "El laboratorio de gas cuántico enfría litio-6 y potasio-40 hasta una mezcla de Fermi degenerada y mide la gravedad con interferometría atómica. Circuito 1: modelo de la ecuación de estado degenerada. 2: estudio gravitatorio de Barnard. 3: calibra el interferómetro con la cavidad ULE. Solo funciona en órbita terrestre.")
    add('emi.grindless.info.quantum_gas_lab.1', "Los láseres de enfriamiento y la cavidad ULE son herramientas: nunca se consumen.")

    add('emi.grindless.info.recoil_separator.0', "El separador de retroceso es un separador lleno de gas: imanes dipolares desvían los átomos de retroceso fuera del haz y una membrana grabada los recoge. Circuitos 1 a 5, como el ciclotrón de iones pesados: un gas de retroceso y una membrana grabada dan un ítem de átomos. Los circuitos 6 y 7 son las líneas de los elementos 120 y 119.")
    add('emi.grindless.info.recoil_separator.1', "La membrana se gasta y el helio vuelve. Se niega a desechar: el helio y los átomos nunca deben tirarse. Los átomos pasan al laboratorio de química superpesada.")

    add('emi.grindless.info.single_crystal_foundry.0', "La fundición monocristalina cuela piezas monocristalinas en un horno de extracción bajo argón: un solo grano, sin fronteras por donde fluya la fluencia. Circuito 1: álabe SX. 2: impulsor de bomba. 3: rueda de turbina Brayton con ocho álabes SX recubiertos.")
    add('emi.grindless.info.single_crystal_foundry.1', "Es la única que fabrica esas piezas. El argón nunca se gasta, la mazarota se vuelve a fundir tras triturarla y la escoria va a la planta de platino. Se niega a desechar.")

    add('emi.grindless.info.snspd_foundry.0', "La fundición de SNSPD es un criostato que graba una película de siliciuro de wolframio en un nanohilo y lo empaqueta. Circuito 1: película de WSi. 2: escritura del nanohilo. 3: montaje en guía de onda. 4: enfriado y empaquetado en un SNSPD. Circuito 5: una oblea de uniones Josephson de niobio.")
    add('emi.grindless.info.snspd_foundry.1', "Es la única que fabrica SNSPD. Necesita la oblea FZ y un chip de guía de ondas de SiN, que vienen de las líneas de fotónica.")

    add('emi.grindless.info.superheavy_chemistry_lab.0', "El laboratorio de química superpesada cuenta, clasifica y sella unos pocos átomos a la vez por cromatografía de gases sobre oro. Circuito 1: átomos de téneso en una cápsula sellada dan una muestra. Circuito 2: átomos de flerovio, livermorio, moscovio y oganesón sobre lámina de oro dan el censo de superpesados. Circuito 3: el censo de los elementos 119 y 120.")
    add('emi.grindless.info.superheavy_chemistry_lab.1', "La muestra de téneso solo se guarda: ninguna receta la usa. Se niega a desechar: los átomos y las muestras nunca se tiran.")

    add('emi.grindless.info.uev_fusion_reactor.0', "El reactor de fusión Mk4 es un anillo de fusión de nivel 10. Ejecuta tres combustibles, cada uno con un único fluido premezclado: D-He-3 (circuito 1), p-11B (circuito 2) y D-He-3 polarizado (circuito 3). Su búfer de energía supera con mucho el rango de un entero.")
    add('emi.grindless.info.uev_fusion_reactor.1', "El combustible polarizado da 1,5 veces más plasma. El plasma no se quema para obtener calor: alimenta el conversor directo de energía y se enfría de vuelta a su fluido de combustible.")

    add('emi.grindless.info.vdw_stacker.0', "El apilador VdW coloca cristales bidimensionales unos sobre otros con un brazo de transferencia limpio. Circuito 1: chip emisor de hBN. 2: modulador de grafeno. 3: grafeno entre dos películas de hBN.")
    add('emi.grindless.info.vdw_stacker.1', "Las películas vienen de las líneas de CVD sobre lámina de cobre. Los chips y moduladores van a la sala de integración fotónica.")

    add('emi.grindless.info.uev_uiv_machine_hull.0', "Los cascos de máquina UEV y UIV son el núcleo sobre el que se construye toda máquina y escotilla de su tier: las escotillas de energía parten de uno. Se fabrican en un ensamblador con la carcasa de máquina, los cables y las placas del tier.")
    add('emi.grindless.info.uev_uiv_machine_hull.1', "Por sí solo el casco no hace nada; puede ir en un multibloque donde se acepte una pieza de paso.")

    add('emi.grindless.info.uev_uiv_energy_hatch.0', "Las escotillas de energía UEV y UIV llevan EU a un multibloque desde un cable al voltaje de su tier. La normal admite 2 A y la de 16A admite 16 A, así que transporta mucha más potencia por un solo cable. Se fabrican en un ensamblador con el casco de máquina y los cables del tier.")
    add('emi.grindless.info.uev_uiv_energy_hatch.1', "Un multibloque de este tier las admite en sus ranuras de energía de la capa inferior. Para una escotilla sin cable, mira la escotilla de energía inalámbrica.")

    add('emi.grindless.info.uev_uiv_dynamo_hatch.0', "Las escotillas dinamo UEV y UIV sacan EU de un multibloque generador a un cable al voltaje de su tier. La normal da 2 A y la de 16A da 16 A. Se fabrican en un ensamblador con el casco de máquina y los cables del tier.")
    add('emi.grindless.info.uev_uiv_dynamo_hatch.1', "Un generador necesita una, o su energía no tiene adónde ir. Para una escotilla sin cable, mira la escotilla dinamo inalámbrica.")

    add('emi.grindless.info.uiv_parallel_hatch.0', "La escotilla de control paralelo demencial deja que una máquina que acepta escotillas de paralelos ejecute hasta 16384 copias de una receta a la vez, cada una con su EU/t.")
})
