// priority: 3150
// Gregtech Grindless - EMI information pages of the UIV era machines (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in the uiv_*_lang.js files; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.beuv_scanner.0', "The BEUV Scanner exposes resist with a terbium-plasma source at 6.7 nm through a multilayer mirror train. Circuit 1: a terbium droplet target, an HfO2 resist wafer and a BEUV mirror give an exposed wafer and a fouled mirror. Circuit 2: the exposed wafer, developed in an ethanol bath, is cut into four BEUV driver ASICs. Circuit 3: cleans a fouled mirror.")
    add('emi.grindless.info.beuv_scanner.1', "It is the only maker of BEUV driver ASICs. The mirror comes back clean from circuit 3 and the terbium debris is recovered as dust, so nothing is thrown away. It needs a UIV power supply and accepts a parallel hatch.")

    add('emi.grindless.info.stm_lithography_cell.0', "The STM Lithography Cell is a scanning tunnelling microscope that moves single hydrogen atoms on a Si-28 wafer. Circuit 1: hydrogen termination of a Si-28 SOI wafer. Circuit 2: STM patterning, in liquid helium that is returned as gas. Circuit 3: phosphine dosing.")
    add('emi.grindless.info.stm_lithography_cell.1', "It is the only maker of the patterned and phosphorus-dosed Si-28 wafers. Most of the phosphine comes back out of circuit 3; the excess goes to the scrubber that turns it into phosphoric acid. It accepts a parallel hatch.")

    add('emi.grindless.info.levitation_melter.0', "The Levitation Melter holds the melt in mid-air with a cold-crucible coil under helium, so no wall can foul it. Circuit 1: RHEA ingots. 2: Wf/RHEA billet. 3: titanium-50. 4: bulk metallic glass. 5: PrNi5. Circuits 6 to 8 remelt RHEA swarf, spent RHEA powder and BMG gates.")
    add('emi.grindless.info.levitation_melter.1', "It needs a helium hatch. The oxide dross goes to the extraction cascade and the beryllium fume of the glass is captured as beryllium oxide; remelting recovers metal that would otherwise be scrap. It accepts a parallel hatch.")

    add('emi.grindless.info.ramp_compression_pulser.0', "The Ramp Compression Pulser is a ring of pulsed-power coils that drives a shock ramp through a target. Circuit 1: a solid para-hydrogen target becomes a metallic hydrogen ingot. Circuit 2: pyrolytic graphite becomes lonsdaleite. Circuit 3: a laser-heated nitrogen charge becomes cubic gauche nitrogen.")
    add('emi.grindless.info.ramp_compression_pulser.1', "Metallic hydrogen is the material of the UIV coil blocks and tethers. The para-hydrogen and the nitrogen come back out as fluids, and the lonsdaleite run leaves graphite dust. It accepts a parallel hatch.")

    add('emi.grindless.info.tfln_fab.0', "The TFLN Fab bonds, slices and poles thin-film lithium niobate. Circuit 1: LN-on-Si3N4 wafer. 2: Si-28 SOI wafer and its donor wafer (the hydrogen of the cut comes back). 3: poled LNOI wafer. 4: EO microcomb from an annealed damascene ring.")
    add('emi.grindless.info.tfln_fab.1', "It is the only maker of those wafers and of the EO microcomb. The Si-28 SOI wafer goes on to the STM Lithography Cell. It accepts a parallel hatch.")

    add('emi.grindless.info.femtosecond_writer.0', "The Femtosecond Writer is a laser on an air-bearing stage that writes structures inside glass and metal. Circuit 1: interposer blank from a ULE boule. 2: 2PP lattice from a glass plate and photoresin. 3: orifice plate from a RHEA plate. 4: 5D-crystal blank from a silica storage preform.")
    add('emi.grindless.info.femtosecond_writer.1', "The orifice plate goes to the droplet radiator works, the 5D-crystal blank to the research write of the Matrioshka. The uncured photoresin comes back, and the ULE, glass and RHEA offcuts return as dust. It accepts a parallel hatch.")

    add('emi.grindless.info.millikelvin_cryostat_works.0', "The Millikelvin Cryostat Works cools copper nuclei to millikelvin by adiabatic demagnetisation. Circuit 1: PrNi5 and copper plates make the nuclear stage. Circuit 2: the nuclear stage, a cold plate and the He-3/He-4 mixture make a mK cryostat module; the mixture comes back. Circuit 3: characterises a P:Si die into a P:Si processor.")
    add('emi.grindless.info.millikelvin_cryostat_works.1', "In circuit 3 the module is only a catalyst: it is kept, not consumed. It needs a belt of metallic hydrogen coil blocks around it. It is the only maker of the mK cryostat module and the characterised P:Si processor. It accepts a parallel hatch.")

    add('emi.grindless.info.spectral_hole_burner.0', "The Spectral Hole Burner burns an atomic frequency comb into a rare-earth YSO slab held in superfluid helium. Circuit 1: an Eu-151:YSO slab becomes a six-hour memory slab. Circuit 2: an Er:YSO slab becomes a telecom memory slab.")
    add('emi.grindless.info.spectral_hole_burner.1', "It is the only maker of those memory slabs. The superfluid helium is not used up. It accepts a parallel hatch.")

    add('emi.grindless.info.matrioshka_computer.0', "The Matrioshka Computer is a shell of logic tiles, nodes, emitters and TPV skins around a star-lit core. Circuit 1: writes research onto a blank data module from a 5D data crystal. Circuit 2: neutron-star EOS chart. Circuit 3: Kerr chart. It works only in Mercury orbit.")
    add('emi.grindless.info.matrioshka_computer.1', "It is the only machine that writes UIV research and the only maker of the neutron-star and Kerr charts. It needs rings of the four Matrioshka blocks and a droplet radiator module block, made by the Droplet Radiator Works. It accepts a parallel hatch.")

    add('emi.grindless.info.droplet_radiator_works.0', "The Droplet Radiator Works has one wall open to vacuum, where a sheet of liquid-tin droplets radiates the waste heat of the Matrioshka. Circuit 1: droplet radiator module from an orifice plate, EB-distilled tin and a droplet collector. Circuit 2: TPV tile from InGaAsSb TPV cells and a selective emitter. It works only in Mercury orbit.")
    add('emi.grindless.info.droplet_radiator_works.1', "It is the only maker of droplet radiator modules and TPV tiles, which the Matrioshka Computer needs. The tin overflow comes back as an ingot. It accepts a parallel hatch.")

    add('emi.grindless.info.pulsar_wind_trap.0', "The Pulsar Wind Trap is a magnetic trap that catches a sample of the electron-positron wind of PSR J0437-4715; the gamma rays are absorbed as heat in its tungsten lining. Circuit 1: a metallic hydrogen coil block, which is not consumed, makes pair plasma and a flow of wind electrons. It works only at PSR J0437-4715.")
    add('emi.grindless.info.pulsar_wind_trap.1', "It has no item output: the plasma and the electrons leave through output hatches and never leave the star. The pair plasma is cooled by the positron accumulator there; the electrons go back into the wind. It accepts a parallel hatch.")

    add('emi.grindless.info.positronium_condensate_lab.0', "The Positronium Condensate Lab forms positronium in aerogel, laser-cools it and condenses it, then makes it annihilate in step. Circuit 1: Ps in aerogel from cooled positrons, a neon moderator cartridge and Ps-converter aerogel. Circuit 2: laser-cooled Ps (the 243 nm laser is kept). Circuit 3: gamma laser cavity from a Ps BEC and two gamma Bragg mirrors. It works only at PSR J0437-4715.")
    add('emi.grindless.info.positronium_condensate_lab.1', "It is the only maker of the gamma laser cavity, the core of the UIV emitter. The Ps BEC comes from the antimatter storage; the cooled positrons from the positron accumulator. It accepts a parallel hatch.")

    add('emi.grindless.info.xray_pulse_profiler.0', "The X-ray Pulse Profiler folds the X-ray pulses of PSR J0437-4715 at 5.76 ms. Circuit 1: the UEV pulsar navigation chart, which is kept, gives four raw pulse profiles. Circuit 2: four timed profiles and the neutron-star EOS chart give the pulsar navigation solution. It works only at PSR J0437-4715.")
    add('emi.grindless.info.xray_pulse_profiler.1', "The raw profiles must be timed against home by the Deep Space Network before circuit 2. The navigation solution steers a seed across 7,000 light years. It accepts a parallel hatch.")

    add('emi.grindless.info.crust_lift.0', "The Crust Lift lifts neutron-star crust up a tether and a polar-cap electrode. Circuit 1: the electrode, which stays, and a crust lift tether give four neutron-star crust and a worn tether. It works only at RX J1856.5-3754.")
    add('emi.grindless.info.crust_lift.1', "It is the only source of neutron-star crust, the start of the whole RX J1856.5-3754 line. One tether in ten wears out; the worn tether is a real item, not voided. The crust goes on to the Neutron Drip Separator.")

    add('emi.grindless.info.neutron_drip_separator.0', "The Neutron Drip Separator splits the crust at the neutron drip line behind a nickel-58 supermirror guide, which is kept. Circuit 1: neutron-star crust gives inner-crust matter and outer-crust ions. Circuit 2: inner-crust matter gives crust nuclei and drip neutrons. It works only at RX J1856.5-3754.")
    add('emi.grindless.info.neutron_drip_separator.1', "The drip neutrons stay a fluid for the Neutronium Cage and the R-Process Decompressor. The outer-crust ions go to the Decay Heat Vault, where they burn for power. It needs an output hatch.")

    add('emi.grindless.info.neutronium_cage.0', "The Neutronium Cage cools drip neutrons in superfluid helium and cages them in a nickel-58 cage part. Circuit 1: drip neutrons and superfluid helium give neutron superfluid. Circuit 2: a cage part and neutron superfluid give a neutronium pellet. It needs metallic hydrogen coil blocks and works only at RX J1856.5-3754.")
    add('emi.grindless.info.neutronium_cage.1', "Neutrons that leak out decay to protium, which comes out as a fluid. The neutronium pellet is the product that goes on to the later lines.")

    add('emi.grindless.info.r_process_decompressor.0', "The R-Process Decompressor lets crust nuclei swell in a flood of drip neutrons: the r-process. Circuit 1: crust nuclei give fission fragments and a hot r-process mix. Circuit 2: flashes a uranium-238 target into a flashed target, the einsteinium and fermium debris. It works only at RX J1856.5-3754.")
    add('emi.grindless.info.r_process_decompressor.1', "The fission fragments are fuel for the Decay Heat Vault. The hot mix and the flashed target feed the einsteinium and fermium chemistry.")

    add('emi.grindless.info.decay_heat_vault.0', "The Decay Heat Vault is a generator: it holds a sealed kilonova capsule while its heat decays into electricity, one run at a time. Circuit 1: kilonova capsule to aged capsule, the main power. Circuit 2: opens an aged capsule into r-process ash and helium-4 ash. Circuits 3 and 4: burn fission fragments or outer-crust ions into iron dust. It works only at RX J1856.5-3754.")
    add('emi.grindless.info.decay_heat_vault.1', "Its EU leaves only through its own UIV dynamo hatch, so it needs one. It refuses to void: the ash and the helium-4 ash come out as items and fluid.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.beuv_scanner.0', "El escáner BEUV expone resina con una fuente de plasma de terbio a 6,7 nm a través de un tren de espejos multicapa. Circuito 1: un blanco de gotas de terbio, una oblea de resina de HfO2 y un espejo BEUV dan una oblea expuesta y un espejo ensuciado. Circuito 2: la oblea expuesta, revelada en un baño de etanol, se corta en cuatro ASIC de control BEUV. Circuito 3: limpia un espejo ensuciado.")
    add('emi.grindless.info.beuv_scanner.1', "Es el único que fabrica ASIC de control BEUV. El espejo vuelve limpio del circuito 3 y los restos de terbio se recuperan como polvo, así que nada se desecha. Necesita alimentación UIV y acepta una escotilla de paralelos.")

    add('emi.grindless.info.stm_lithography_cell.0', "La celda de litografía STM es un microscopio de efecto túnel que mueve átomos de hidrógeno individuales sobre una oblea de Si-28. Circuito 1: terminación con hidrógeno de una oblea SOI de Si-28. Circuito 2: patrón STM, en helio líquido que se devuelve como gas. Circuito 3: dosificación con fosfina.")
    add('emi.grindless.info.stm_lithography_cell.1', "Es la única que fabrica las obleas de Si-28 con patrón y dosificadas con fósforo. Casi toda la fosfina vuelve a salir del circuito 3; el exceso va al depurador que la convierte en ácido fosfórico. Acepta una escotilla de paralelos.")

    add('emi.grindless.info.levitation_melter.0', "El fundidor por levitación sostiene la masa fundida en el aire con una bobina de crisol frío bajo helio, así que ninguna pared la ensucia. Circuito 1: lingotes de RHEA. 2: tocho de Wf/RHEA. 3: titanio-50. 4: vidrio metálico masivo. 5: PrNi5. Los circuitos 6 a 8 refunden virutas de RHEA, polvo de RHEA gastado y mazarotas de BMG.")
    add('emi.grindless.info.levitation_melter.1', "Necesita una escotilla de helio. La escoria de óxidos va a la cascada de extracción y el humo de berilio del vidrio se captura como óxido de berilio; al refundir se recupera metal que de otro modo sería chatarra. Acepta una escotilla de paralelos.")

    add('emi.grindless.info.ramp_compression_pulser.0', "El pulsador de compresión en rampa es un anillo de bobinas de potencia pulsada que lanza una rampa de choque por un blanco. Circuito 1: un blanco sólido de parahidrógeno se convierte en un lingote de hidrógeno metálico. Circuito 2: el grafito pirolítico se convierte en lonsdaleíta. Circuito 3: una carga de nitrógeno calentada con láser se convierte en nitrógeno cúbico gauche.")
    add('emi.grindless.info.ramp_compression_pulser.1', "El hidrógeno metálico es el material de los bloques de bobina y de los cables UIV. El parahidrógeno y el nitrógeno vuelven a salir como fluidos, y la lonsdaleíta deja polvo de grafito. Acepta una escotilla de paralelos.")

    add('emi.grindless.info.tfln_fab.0', "La fábrica de TFLN une, corta y polariza niobato de litio de película delgada. Circuito 1: oblea LN sobre Si3N4. 2: oblea SOI de Si-28 y su oblea donante (el hidrógeno del corte vuelve). 3: oblea LNOI polarizada. 4: micropeine EO a partir de un anillo damasquinado recocido.")
    add('emi.grindless.info.tfln_fab.1', "Es la única que fabrica esas obleas y el micropeine EO. La oblea SOI de Si-28 pasa a la celda de litografía STM. Acepta una escotilla de paralelos.")

    add('emi.grindless.info.femtosecond_writer.0', "El escritor de femtosegundos es un láser sobre una platina de cojinete de aire que escribe estructuras dentro de vidrio y metal. Circuito 1: blanco de interpositor a partir de una bola de ULE. 2: retícula 2PP a partir de una placa de vidrio y fotorresina. 3: placa de orificios a partir de una placa de RHEA. 4: blanco de cristal 5D a partir de una preforma de almacenamiento de sílice.")
    add('emi.grindless.info.femtosecond_writer.1', "La placa de orificios va al taller de radiadores de gotas y el blanco de cristal 5D a la escritura de investigación de la matrioska. La fotorresina sin curar vuelve, y los recortes de ULE, vidrio y RHEA regresan como polvo. Acepta una escotilla de paralelos.")

    add('emi.grindless.info.millikelvin_cryostat_works.0', "El taller de criostatos de milikelvin enfría núcleos de cobre hasta milikelvin por desmagnetización adiabática. Circuito 1: PrNi5 y placas de cobre forman la etapa nuclear. Circuito 2: la etapa nuclear, una placa fría y la mezcla de He-3/He-4 forman un módulo criostato de mK; la mezcla vuelve. Circuito 3: caracteriza un dado de P:Si y lo convierte en un procesador de P:Si.")
    add('emi.grindless.info.millikelvin_cryostat_works.1', "En el circuito 3 el módulo es solo un catalizador: se conserva, no se consume. Necesita un cinturón de bloques de bobina de hidrógeno metálico a su alrededor. Es el único que fabrica el módulo criostato de mK y el procesador de P:Si caracterizado. Acepta una escotilla de paralelos.")

    add('emi.grindless.info.spectral_hole_burner.0', "El grabador de agujeros espectrales graba un peine de frecuencias atómicas en una losa de YSO de tierras raras sumergida en helio superfluido. Circuito 1: una losa de Eu-151:YSO se convierte en una losa de memoria de seis horas. Circuito 2: una losa de Er:YSO se convierte en una losa de memoria telecom.")
    add('emi.grindless.info.spectral_hole_burner.1', "Es el único que fabrica esas losas de memoria. El helio superfluido no se gasta. Acepta una escotilla de paralelos.")

    add('emi.grindless.info.matrioshka_computer.0', "El ordenador matrioska es una cáscara de losetas lógicas, nodos, emisores y pieles TPV alrededor de un núcleo iluminado por la estrella. Circuito 1: escribe investigación en un módulo de datos en blanco a partir de un cristal de datos 5D. Circuito 2: carta EOS de estrella de neutrones. Circuito 3: carta de Kerr. Solo funciona en órbita de Mercurio.")
    add('emi.grindless.info.matrioshka_computer.1', "Es la única máquina que escribe investigación UIV y la única que fabrica las cartas de estrella de neutrones y de Kerr. Necesita anillos de los cuatro bloques matrioska y un bloque de módulo radiador de gotas, que fabrica el taller de radiadores de gotas. Acepta una escotilla de paralelos.")

    add('emi.grindless.info.droplet_radiator_works.0', "El taller de radiadores de gotas tiene una pared abierta al vacío, donde una lámina de gotas de estaño líquido irradia el calor residual de la matrioska. Circuito 1: módulo de radiador de gotas a partir de una placa de orificios, estaño destilado por haz de electrones y un colector de gotas. Circuito 2: loseta TPV a partir de celdas TPV de InGaAsSb y un emisor selectivo. Solo funciona en órbita de Mercurio.")
    add('emi.grindless.info.droplet_radiator_works.1', "Es el único que fabrica módulos de radiador de gotas y losetas TPV, que necesita el ordenador matrioska. El exceso de estaño vuelve como lingote. Acepta una escotilla de paralelos.")

    add('emi.grindless.info.pulsar_wind_trap.0', "La trampa de viento de púlsar es una trampa magnética que atrapa una muestra del viento de electrones y positrones de PSR J0437-4715; los rayos gamma se absorben como calor en su revestimiento de wolframio. Circuito 1: un bloque de bobina de hidrógeno metálico, que no se consume, produce plasma de pares y un flujo de electrones del viento. Solo funciona en PSR J0437-4715.")
    add('emi.grindless.info.pulsar_wind_trap.1', "No tiene salida de objetos: el plasma y los electrones salen por escotillas de salida y nunca abandonan la estrella. El plasma de pares lo enfría allí el acumulador de positrones; los electrones vuelven al viento. Acepta una escotilla de paralelos.")

    add('emi.grindless.info.positronium_condensate_lab.0', "El laboratorio de condensado de positronio forma positronio en aerogel, lo enfría con láser y lo condensa, y luego lo hace aniquilarse al unísono. Circuito 1: Ps en aerogel a partir de positrones fríos, un cartucho moderador de neón y aerogel conversor de Ps. Circuito 2: Ps enfriado con láser (el láser de 243 nm se conserva). Circuito 3: cavidad láser gamma a partir de un BEC de Ps y dos espejos de Bragg gamma. Solo funciona en PSR J0437-4715.")
    add('emi.grindless.info.positronium_condensate_lab.1', "Es el único que fabrica la cavidad láser gamma, el núcleo del emisor UIV. El BEC de Ps sale del almacén de antimateria y los positrones fríos del acumulador de positrones. Acepta una escotilla de paralelos.")

    add('emi.grindless.info.xray_pulse_profiler.0', "El perfilador de pulsos de rayos X pliega los pulsos de rayos X de PSR J0437-4715 a 5,76 ms. Circuito 1: la carta de navegación por púlsares UEV, que se conserva, da cuatro perfiles de pulso en bruto. Circuito 2: cuatro perfiles temporizados y la carta EOS de estrella de neutrones dan la solución de navegación por púlsares. Solo funciona en PSR J0437-4715.")
    add('emi.grindless.info.xray_pulse_profiler.1', "La red del espacio profundo debe temporizar los perfiles en bruto frente a casa antes del circuito 2. La solución de navegación guía una semilla a través de 7.000 años luz. Acepta una escotilla de paralelos.")

    add('emi.grindless.info.crust_lift.0', "El elevador de corteza sube corteza de estrella de neutrones por un cable y un electrodo polar. Circuito 1: el electrodo, que se queda, y un cable de elevación dan cuatro de corteza de estrella de neutrones y un cable gastado. Solo funciona en RX J1856.5-3754.")
    add('emi.grindless.info.crust_lift.1', "Es la única fuente de corteza de estrella de neutrones, el comienzo de toda la línea de RX J1856.5-3754. Uno de cada diez cables se desgasta; el cable gastado es un objeto real, no se desecha. La corteza pasa al separador de goteo de neutrones.")

    add('emi.grindless.info.neutron_drip_separator.0', "El separador de goteo de neutrones divide la corteza en la línea de goteo de neutrones tras una guía de supervespejos de níquel-58, que se conserva. Circuito 1: la corteza de estrella de neutrones da materia de corteza interna e iones de corteza externa. Circuito 2: la materia de corteza interna da núcleos de corteza y neutrones de goteo. Solo funciona en RX J1856.5-3754.")
    add('emi.grindless.info.neutron_drip_separator.1', "Los neutrones de goteo siguen siendo un fluido para la jaula de neutronio y el descompresor del proceso r. Los iones de corteza externa van a la cámara de calor de desintegración, donde arden para dar energía. Necesita una escotilla de salida.")

    add('emi.grindless.info.neutronium_cage.0', "La jaula de neutronio enfría neutrones de goteo en helio superfluido y los enjaula en una pieza de jaula de níquel-58. Circuito 1: neutrones de goteo y helio superfluido dan superfluido de neutrones. Circuito 2: una pieza de jaula y superfluido de neutrones dan un pellet de neutronio. Necesita bloques de bobina de hidrógeno metálico y solo funciona en RX J1856.5-3754.")
    add('emi.grindless.info.neutronium_cage.1', "Los neutrones que escapan decaen a protio, que sale como fluido. El pellet de neutronio es el producto que pasa a las líneas posteriores.")

    add('emi.grindless.info.r_process_decompressor.0', "El descompresor del proceso r deja que los núcleos de la corteza se hinchen en un diluvio de neutrones de goteo: el proceso r. Circuito 1: los núcleos de corteza dan fragmentos de fisión y una mezcla caliente del proceso r. Circuito 2: fulmina un blanco de uranio-238 y lo convierte en un blanco fulminado, los restos de einstenio y fermio. Solo funciona en RX J1856.5-3754.")
    add('emi.grindless.info.r_process_decompressor.1', "Los fragmentos de fisión son combustible de la cámara de calor de desintegración. La mezcla caliente y el blanco fulminado alimentan la química del einstenio y el fermio.")

    add('emi.grindless.info.decay_heat_vault.0', "La cámara de calor de desintegración es un generador: guarda una cápsula de kilonova sellada mientras su calor se desintegra en electricidad, una ejecución cada vez. Circuito 1: de cápsula de kilonova a cápsula envejecida, la energía principal. Circuito 2: abre una cápsula envejecida en ceniza del proceso r y ceniza de helio-4. Circuitos 3 y 4: queman fragmentos de fisión o iones de corteza externa hasta polvo de hierro. Solo funciona en RX J1856.5-3754.")
    add('emi.grindless.info.decay_heat_vault.1', "Su EU sale solo por su propia escotilla de dinamo UIV, así que necesita una. Se niega a desechar: la ceniza y la ceniza de helio-4 salen como objetos y fluido.")
})
