// priority: 1050
// Gregtech Grindless - EMI information pages of the ZPM era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in the zpm_*_lang.js files; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.waste_retrieval_plant.0', "The Waste Retrieval Plant dissolves the radioactive waste stored since IV. Circuit 1: waste and nitric acid give radium dust, actinide raffinate, synroc and nitrogen dioxide. Circuit 2: a radium capsule and helium give radon. Circuit 3: radium dust and platinum foil make the capsule.")
    add('emi.grindless.info.waste_retrieval_plant.1', "It needs radiation proof casings and refuses to run while it voids: keep the synroc. The raffinate feeds the Actinide Partitioning Plant.")

    add('emi.grindless.info.actinide_partitioning_plant.0', "The Actinide Partitioning Plant splits the raffinate. Circuit 1: raffinate and a kerosene charge give minor actinide strip and lanthanide nitrate. Circuit 2: the strip gives americium, curium oxide and synroc.")
    add('emi.grindless.info.actinide_partitioning_plant.1', "It needs radiation proof casings and refuses to run while it voids. Americium goes to the Mk3 fuel; the lanthanide nitrate goes back to the extraction cascade.")

    add('emi.grindless.info.europium_reductor.0', "The Europium Reductor is the only way to europium dust. Circuit 1: europium chloride solution, zinc and sulfuric acid give europium sulfate. Circuit 2: the sulfate fired with oxygen gives europium oxide. Circuit 3: the oxide and lanthanum give europium dust.")
    add('emi.grindless.info.europium_reductor.1', "It needs inert casings and a mercury charge that is never used up. The acids return to the extraction cascade and the sulfur trioxide makes sulfuric acid.")

    add('emi.grindless.info.plasma_quench_caster.0', "The Plasma Quench Caster casts molten duranium, tritanium and darmstadtium straight into plate (circuit 1) or four foils (circuit 2, not darmstadtium) under an argon shroud.")
    add('emi.grindless.info.plasma_quench_caster.1', "Most of the argon comes back. The heat leaves as steam, so send it to a turbine and turn fluid voiding off.")

    add('emi.grindless.info.direct_energy_converter.0', "The Direct Energy Converter turns helium plasma and tin plasma into EU without a turbine, 1.25 times what the plasma turbine makes from them. The cooled gas or molten tin comes out of the output hatch.")
    add('emi.grindless.info.direct_energy_converter.1', "It needs one or more energy output hatches, wireless ones too, and runs up to 128 runs at once. Turn fluid voiding off.")

    add('emi.grindless.info.naquadria_magnet_works.0', "The Naquadria Magnet Works winds the magnets of the wireless network. Circuit 1: ZPM SMES cell. Circuit 2: URhNq2 single wires. Circuit 3: HTS insert. Circuit 4: UV SMES cell.")
    add('emi.grindless.info.naquadria_magnet_works.1', "The cells need a 1,000 mB liquid helium charge in an input hatch for the cold test; it is never used up. The cells fill the Wireless Energy Tower.")

    add('emi.grindless.info.assembly_hall.0', "The Assembly Hall runs the assembler and the circuit assembler, up to 64 recipes at once. Choose the machine in the controller's machine mode tab: one mode runs at a time, with the single blocks' own recipes. The assembly line is not included.")
    add('emi.grindless.info.assembly_hall.1', "It saves machines and buses, not power: each copy pays its full EU/t, so the energy hatches set how many run.")

    add('emi.grindless.info.naquadria_refinery.0', "The Naquadria Refinery refines the impure naquadria solution into naquadria in one tower. Circuit 1: solution and hydrogen give naquadria, gallium sulfide and enriched naquadah solution. Circuit 2: stored naquadria waste.")
    add('emi.grindless.info.naquadria_refinery.1', "It needs a sulfuric acid charge that is never used up, and voids nothing. The enriched solution feeds the Naquadah Plant and the sulfide the gallium line.")

    add('emi.grindless.info.naquadah_fuel_works.0', "The Naquadah Fuel Works burns the naquadah fuel loop in one plant. Circuit 1: naquadria and a cerium and neodymium make-up give naquadah fuel. Circuit 2: depleted fuel gives naquadah, a chance of europium and xenon.")
    add('emi.grindless.info.naquadah_fuel_works.1', "Naquadah goes to the Naquadah Plant, europium to the motor line and xenon to GTM's xenon uses.")

    add('emi.grindless.info.neutrino_observatory.0', "The Neutrino Observatory watches heavy water in a shielded vessel. Circuit 1: a data orb and heavy water give the Solar-Core Survey. Circuit 2: the same plus a Gravitational-Wave Catalogue give the Multi-Messenger Catalogue.")
    add('emi.grindless.info.neutrino_observatory.1', "The structure is a 15 x 15 x 15 shell of photomultiplier casing around a water shield. The UV energy hatch needs its survey. The catalogue is kept.")

    add('emi.grindless.info.deep_space_network.0', "The Deep Space Network turns probe recordings into data. Circuit 1: a Neptune recording, a data orb and liquid helium give Neptune flyby data. Circuit 2: the same with a Triton recording. Circuit 3: both datasets and a Kuiper target list give the Pluto-Kuiper chart. Circuit 4: a Titan probe recording, a data orb, a ZPM sensor and liquid helium give a lake sampler for the next Titan descent.")
    add('emi.grindless.info.deep_space_network.1', "It needs a dish deck over a frostproof cryo-cabin. The Neptune and Triton recordings come from the Flyby Probe Bay, the Titan recording from the Entry Probe Bay's haze descent, and the target list from the Kuiper Survey Telescope.")

    add('emi.grindless.info.kuiper_survey_telescope.0', "The Kuiper Survey Telescope turns a data orb and a CVD diamond plate into a Kuiper target list. It works only in Earth orbit.")
    add('emi.grindless.info.kuiper_survey_telescope.1', "It needs a sapphire block as the secondary mirror in a tube of station truss casing. The list goes to the Deep Space Network.")

    add('emi.grindless.info.vent_bioreactor.0', "The Vent Bioreactor feeds Europa's bacteria a vent chemistry. Circuit 1: bacteria, Enceladus brine, hydrogen and CO2 give archaeal cultures and methane. Circuit 2: tholin, brine and mutagen give raw growth medium.")
    add('emi.grindless.info.vent_bioreactor.1', "No meat, no sugar and no sterile cleanroom. It needs plascrete in the floor, and a culture that is not consumed in circuit 2.")

    add('emi.grindless.info.aerogel_works.0', "The Aerogel Works gels silica nanograins with ethanol and dries them under supercritical CO2 into silica aerogel. The ethanol and the CO2 loop: only the grains are used up.")
    add('emi.grindless.info.aerogel_works.1', "It needs stable casings in the floor. Aerogel lines the level 6 fuel tank and makes the cartridges of the Plume Sampler.")

    add('emi.grindless.info.methane_pyrolyser.0', "The Methane Pyrolyser cracks methane in molten tin and nickel. Circuit 1: hydrogen and graphene dust. Circuit 2: a carbon nanotube yarn, slower.")
    add('emi.grindless.info.methane_pyrolyser.1', "There is no CO2: the carbon comes out solid. It needs heat-proof casings in the floor. The yarn wraps the tanks of the Aerogel Works.")

    add('emi.grindless.info.diamond_lattice_fab.0', "The Diamond Lattice Fab grows diamond by plasma CVD on a seed that is never used up. Circuit 1: methane and hydrogen give a CVD diamond plate. Circuit 2: the same with nitrogen gives a nitrogen-doped plate.")
    add('emi.grindless.info.diamond_lattice_fab.1', "It needs cleanroom casings in the floor. Most of the hydrogen comes back. The plates feed the Ion Implanter and the Qubit Fab.")

    add('emi.grindless.info.ion_implanter.0', "The Ion Implanter is a beam line. Circuit 1: a nitrogen-doped plate and nitrogen give NV diamond chips. Circuit 2: a silicon-28 wafer and phosphorus dust give a donor qubit wafer.")
    add('emi.grindless.info.ion_implanter.1', "It needs cleanroom casings and has no byproducts. The Hot Cell's circuit 5 mode makes the silicon-28 dust. Its wafers and chips feed the Qubit Fab.")

    add('emi.grindless.info.qubit_fab.0', "The Qubit Fab is a millikelvin cryostat. Circuit 1: 4 donor qubit wafers make a qubit array. Circuit 2: 16 NV diamond chips make one, slower.")
    add('emi.grindless.info.qubit_fab.1', "It needs cryostat casings and a helium charge that is never used up; each run takes a little Saturn helium. The arrays replace circuits in the alternative HPCA component recipes.")

    add('emi.grindless.info.plume_sampler.0', "The Plume Sampler flies an aerogel cartridge through Enceladus's plume and gives Enceladus brine, silica nanograins and hydrogen. It works only in Saturn orbit.")
    add('emi.grindless.info.plume_sampler.1', "The cartridge is used up. It needs probe bay casings and keeps its grains and brine: disable voiding. The grains make aerogel, and aerogel makes more cartridges.")

    add('emi.grindless.info.ring_seismometer.0', "The Ring Seismometer reads Saturn's interior from its ring waves. Circuit 1: a data orb, the Saturn transfer chart and liquid helium give the Saturn interior model. Circuit 2: the model and a data orb give the Uranus transfer chart.")
    add('emi.grindless.info.ring_seismometer.1', "It works only in Saturn orbit, keeps its data (disable voiding) and needs station truss casings. The chart and the model are kept, not used up.")

    add('emi.grindless.info.gas_giant_siphon.0', "The Gas Giant Siphon dips a tethered probe into Saturn's cloud deck. Circuit 1: hydrogen and Saturn helium. Circuit 2: methane and ammonia.")
    add('emi.grindless.info.gas_giant_siphon.1', "It works only in Saturn orbit and needs station truss casings. The Jovian atmosphere survey is the catalyst and is never used up; the scoop head wears slowly.")

    add('emi.grindless.info.isotope_column.0', "The Isotope Column is a cryogenic column. Circuit 1: Saturn helium gives helium-3. Circuit 2: hydrogen gives deuterium. It works only in Saturn orbit.")
    add('emi.grindless.info.isotope_column.1', "It needs frostproof casings in the floor. With Uranus it is the bulk source of both isotopes; the Moon's helium-3 trickle is untouched.")

    add('emi.grindless.info.ring_harvester.0', "The Ring Harvester drags a net through Saturn's rings. Circuit 1: a ring sail net gives ring ice and silicon dioxide dust. Circuit 2: a glass bottle and the net give a ring ice sample.")
    add('emi.grindless.info.ring_harvester.1', "It works only in Saturn orbit and needs station truss casings. The net wears slowly. The sample is the seed of the Saturnian quantum seed.")

    add('emi.grindless.info.entry_probe_bay.0', "The Entry Probe Bay launches probes at Titan. Circuit 1: an entry probe and nitrogen give tholin and a Titan probe recording. Circuit 2: an entry probe and a lake sampler give methane and ethane.")
    add('emi.grindless.info.entry_probe_bay.1', "It works only in Saturn orbit and needs probe bay casings. The probe is used up. Tholin feeds the Tholin Reformer; the recording is decoded in the Deep Space Network.")

    add('emi.grindless.info.tholin_reformer.0', "The Tholin Reformer breaks Titan's haze organics into chemistry. Circuit 1: tholin and water give nitrile mix. Circuit 2: nitrile mix gives carbon fibres and ammonia. Circuit 3: nitrile mix, ammonia and zinc dust give diaminobenzidine.")
    add('emi.grindless.info.tholin_reformer.1', "It works only in Saturn orbit and needs station truss casings. The hydrogen cyanide never leaves the column and the zinc is not used up.")

    add('emi.grindless.info.ice_giant_siphon.0', "The Ice-Giant Siphon lowers a scoop into Uranus. Circuit 1: hydrogen and helium. 2: methane and hydrogen sulfide. 3: diamond slurry. 4: a glass bottle gives an atmosphere sample.")
    add('emi.grindless.info.ice_giant_siphon.1', "It works only in Uranus orbit and needs pressure hull casings and Saturn's interior model, which is kept. It keeps its gases: disable voiding. The scoop head wears.")

    add('emi.grindless.info.slurry_separator.0', "The Slurry Separator decompresses diamond slurry with hydrogen sulfide into diamond dust, an ice giant diamond seed, sulfur, ammonia and water.")
    add('emi.grindless.info.slurry_separator.1', "It works only in Uranus orbit and needs pressure hull casings. It keeps its diamonds and seeds: disable voiding. The slurry comes from the Ice-Giant Siphon.")

    add('emi.grindless.info.flyby_probe_bay.0', "The Flyby Probe Bay launches a probe on Voyager 2's route. Circuit 1: a Neptune flyby probe and silica aerogel give a Neptune recording and sample. Circuit 2: with a Titan entry probe as lander it gives a Triton recording and nitrogen.")
    add('emi.grindless.info.flyby_probe_bay.1', "It works only in Uranus orbit and needs probe bay casings. It keeps its recordings: disable voiding. The Deep Space Network decodes them.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.waste_retrieval_plant.0', "La planta de recuperación de residuos disuelve de nuevo los residuos radiactivos guardados desde IV. Circuito 1: residuos y ácido nítrico dan polvo de radio, refinado de actínidos, synroc y dióxido de nitrógeno. Circuito 2: una cápsula de radio y helio dan radón. Circuito 3: polvo de radio y lámina de platino hacen la cápsula.")
    add('emi.grindless.info.waste_retrieval_plant.1', "Necesita carcasas a prueba de radiación y se niega a funcionar mientras elimina: conserva el synroc. El refinado alimenta la planta de partición de actínidos.")

    add('emi.grindless.info.actinide_partitioning_plant.0', "La planta de partición de actínidos separa el refinado. Circuito 1: refinado y una carga de queroseno dan tira de actínidos menores y nitrato de lantánidos. Circuito 2: la tira da americio, óxido de curio y synroc.")
    add('emi.grindless.info.actinide_partitioning_plant.1', "Necesita carcasas a prueba de radiación y se niega a funcionar mientras elimina. El americio va al combustible Mk3; el nitrato de lantánidos vuelve a la cascada de extracción.")

    add('emi.grindless.info.europium_reductor.0', "El reductor de europio es la única vía al polvo de europio. Circuito 1: solución de cloruro de europio, zinc y ácido sulfúrico dan sulfato de europio. Circuito 2: el sulfato calcinado con oxígeno da óxido de europio. Circuito 3: el óxido y lantano dan polvo de europio.")
    add('emi.grindless.info.europium_reductor.1', "Necesita carcasas inertes y una carga de mercurio que nunca se gasta. Los ácidos vuelven a la cascada de extracción y el trióxido de azufre hace ácido sulfúrico.")

    add('emi.grindless.info.plasma_quench_caster.0', "La fundidora de temple de plasma cuela duranio, tritanio y darmstadtio fundidos directamente en placa (circuito 1) o en cuatro láminas (circuito 2, no el darmstadtio) bajo un manto de argón.")
    add('emi.grindless.info.plasma_quench_caster.1', "Casi todo el argón vuelve. El calor sale como vapor: mándalo a una turbina y desactiva la eliminación de fluidos.")

    add('emi.grindless.info.direct_energy_converter.0', "El convertidor directo de energía convierte plasma de helio y plasma de estaño en EU sin turbina, 1,25 veces lo que saca la turbina de plasma. El gas enfriado o el estaño fundido sale por la escotilla de salida.")
    add('emi.grindless.info.direct_energy_converter.1', "Necesita una o más escotillas de salida de energía, también inalámbricas, y ejecuta hasta 128 recetas a la vez. Desactiva la eliminación de fluidos.")

    add('emi.grindless.info.naquadria_magnet_works.0', "La fábrica de imanes de naquadria bobina los imanes de la red inalámbrica. Circuito 1: celda SMES ZPM. Circuito 2: cables simples de URhNq2. Circuito 3: inserto HTS. Circuito 4: celda SMES UV.")
    add('emi.grindless.info.naquadria_magnet_works.1', "Las celdas necesitan una carga de 1.000 mB de helio líquido en una escotilla de entrada para la prueba en frío; nunca se gasta. Las celdas llenan la torre de energía inalámbrica.")

    add('emi.grindless.info.assembly_hall.0', "La sala de ensamblaje ejecuta el ensamblador y el ensamblador de circuitos, hasta 64 recetas a la vez. Elige la máquina en la pestaña de modo del controlador: corre un modo cada vez, con las recetas de los bloques simples. La línea de ensamblaje no está incluida.")
    add('emi.grindless.info.assembly_hall.1', "Ahorra máquinas y buses, no energía: cada copia paga su EU/t completo, así que las escotillas de energía fijan cuántas corren.")

    add('emi.grindless.info.naquadria_refinery.0', "La refinería de naquadria refina en una sola torre la solución de naquadria impura hasta naquadria. Circuito 1: solución e hidrógeno dan naquadria, sulfuro de galio y solución de naquadah enriquecida. Circuito 2: residuo de naquadria guardado.")
    add('emi.grindless.info.naquadria_refinery.1', "Necesita una carga de ácido sulfúrico que nunca se gasta y no elimina nada. La solución enriquecida alimenta la planta de naquadah y el sulfuro, la línea del galio.")

    add('emi.grindless.info.naquadah_fuel_works.0', "La planta de combustible de naquadah reúne en una sola planta el ciclo del combustible de naquadah. Circuito 1: naquadria y una reposición de cerio y neodimio dan combustible de naquadah. Circuito 2: el combustible agotado da naquadah, probabilidad de europio y xenón.")
    add('emi.grindless.info.naquadah_fuel_works.1', "El naquadah va a la planta de naquadah, el europio a la línea de motores y el xenón a los usos del xenón de GTM.")

    add('emi.grindless.info.neutrino_observatory.0', "El observatorio de neutrinos vigila agua pesada en un recipiente blindado. Circuito 1: un orbe de datos y agua pesada dan el Sondeo del Núcleo Solar. Circuito 2: lo mismo más un Catálogo de Ondas Gravitacionales dan el Catálogo Multimensajero.")
    add('emi.grindless.info.neutrino_observatory.1', "La estructura es una cáscara de 15 x 15 x 15 de carcasa de fotomultiplicadores alrededor de un blindaje de agua. La escotilla de energía UV necesita su sondeo. El catálogo se conserva.")

    add('emi.grindless.info.deep_space_network.0', "La red de espacio profundo convierte grabaciones de sondas en datos. Circuito 1: una grabación de Neptuno, un orbe de datos y helio líquido dan datos del sobrevuelo de Neptuno. Circuito 2: igual con una grabación de Tritón. Circuito 3: ambos conjuntos y una lista de objetivos de Kuiper dan la carta Plutón-Kuiper. Circuito 4: una grabación de sonda de Titán, un orbe de datos, un sensor ZPM y helio líquido dan un muestreador de lagos para el siguiente descenso a Titán.")
    add('emi.grindless.info.deep_space_network.1', "Necesita una cubierta con antena sobre una cabina criogénica a prueba de escarcha. Las grabaciones de Neptuno y Tritón salen de la bahía de sondas de sobrevuelo, la de Titán del descenso por la bruma de la bahía de sondas de entrada, y la lista de objetivos, del telescopio de Kuiper.")

    add('emi.grindless.info.kuiper_survey_telescope.0', "El telescopio de sondeo de Kuiper convierte un orbe de datos y una placa de diamante CVD en una lista de objetivos de Kuiper. Solo funciona en órbita terrestre.")
    add('emi.grindless.info.kuiper_survey_telescope.1', "Necesita un bloque de zafiro como espejo secundario dentro de un tubo de carcasa de cercha de estación. La lista va a la red de espacio profundo.")

    add('emi.grindless.info.vent_bioreactor.0', "El biorreactor de fuentes alimenta las bacterias de Europa con una química de fuente hidrotermal. Circuito 1: bacterias, salmuera de Encélado, hidrógeno y CO2 dan cultivos arqueales y metano. Circuito 2: tolina, salmuera y mutágeno dan medio de crecimiento en bruto.")
    add('emi.grindless.info.vent_bioreactor.1', "Sin carne, sin azúcar y sin sala blanca estéril. Necesita plascreto en el suelo, y en el circuito 2 un cultivo que no se gasta.")

    add('emi.grindless.info.aerogel_works.0', "La planta de aerogel gelifica nanogranos de sílice con etanol y los seca bajo CO2 supercrítico hasta obtener aerogel de sílice. El etanol y el CO2 circulan: solo se gastan los granos.")
    add('emi.grindless.info.aerogel_works.1', "Necesita carcasas estables en el suelo. El aerogel reviste el tanque de combustible de nivel 6 y hace los cartuchos del muestreador de penacho.")

    add('emi.grindless.info.methane_pyrolyser.0', "El pirolizador de metano craquea metano en estaño y níquel fundidos. Circuito 1: hidrógeno y polvo de grafeno. Circuito 2: un hilo de nanotubos de carbono, más lento.")
    add('emi.grindless.info.methane_pyrolyser.1', "No hay CO2: el carbono sale sólido. Necesita carcasas resistentes al calor en el suelo. El hilo envuelve los tanques de la planta de aerogel.")

    add('emi.grindless.info.diamond_lattice_fab.0', "La fábrica de redes de diamante hace crecer diamante por CVD de plasma sobre una semilla que nunca se gasta. Circuito 1: metano e hidrógeno dan una placa de diamante CVD. Circuito 2: lo mismo con nitrógeno da una placa dopada con nitrógeno.")
    add('emi.grindless.info.diamond_lattice_fab.1', "Necesita carcasas de sala blanca en el suelo. Casi todo el hidrógeno vuelve. Las placas alimentan el implantador de iones y la fábrica de qubits.")

    add('emi.grindless.info.ion_implanter.0', "El implantador de iones es una línea de haz. Circuito 1: una placa dopada con nitrógeno y nitrógeno dan chips de diamante NV. Circuito 2: una oblea de silicio-28 y polvo de fósforo dan una oblea de qubits donantes.")
    add('emi.grindless.info.ion_implanter.1', "Necesita carcasas de sala blanca y no tiene subproductos. El modo de circuito 5 de la celda caliente hace el polvo de silicio-28. Sus obleas y chips alimentan la fábrica de qubits.")

    add('emi.grindless.info.qubit_fab.0', "La fábrica de qubits es un criostato de milikelvin. Circuito 1: 4 obleas de qubits donantes hacen una matriz de qubits. Circuito 2: 16 chips de diamante NV hacen una, más lento.")
    add('emi.grindless.info.qubit_fab.1', "Necesita carcasas de criostato y una carga de helio que nunca se gasta; cada tanda usa un poco de helio de Saturno. Las matrices sustituyen a circuitos en las recetas alternativas de los componentes del HPCA.")

    add('emi.grindless.info.plume_sampler.0', "El muestreador de penacho hace volar un cartucho de aerogel por el penacho de Encélado y da salmuera de Encélado, nanogranos de sílice e hidrógeno. Solo funciona en órbita de Saturno.")
    add('emi.grindless.info.plume_sampler.1', "El cartucho se gasta. Necesita carcasas de bahía de sondas y conserva sus granos y su salmuera: desactiva la eliminación. Los granos hacen aerogel, y el aerogel hace más cartuchos.")

    add('emi.grindless.info.ring_seismometer.0', "El sismómetro de anillos lee el interior de Saturno por las ondas de sus anillos. Circuito 1: un orbe de datos, la carta de transferencia de Saturno y helio líquido dan el modelo interior de Saturno. Circuito 2: el modelo y un orbe de datos dan la carta de transferencia de Urano.")
    add('emi.grindless.info.ring_seismometer.1', "Solo funciona en órbita de Saturno, conserva sus datos (desactiva la eliminación) y necesita carcasas de cercha de estación. La carta y el modelo se conservan, no se gastan.")

    add('emi.grindless.info.gas_giant_siphon.0', "El sifón de gigante gaseoso sumerge una sonda con cable en las nubes de Saturno. Circuito 1: hidrógeno y helio de Saturno. Circuito 2: metano y amoníaco.")
    add('emi.grindless.info.gas_giant_siphon.1', "Solo funciona en órbita de Saturno y necesita carcasas de cercha de estación. El sondeo de la atmósfera joviana es el catalizador y nunca se gasta; la cabeza de la cuchara se desgasta despacio.")

    add('emi.grindless.info.isotope_column.0', "La columna de isótopos es una columna criogénica. Circuito 1: helio de Saturno da helio-3. Circuito 2: hidrógeno da deuterio. Solo funciona en órbita de Saturno.")
    add('emi.grindless.info.isotope_column.1', "Necesita carcasas a prueba de escarcha en el suelo. Junto con Urano es la fuente a granel de ambos isótopos; el goteo de helio-3 de la Luna queda intacto.")

    add('emi.grindless.info.ring_harvester.0', "La cosechadora de anillos arrastra una red por los anillos de Saturno. Circuito 1: una red de vela de anillo da hielo de anillo y polvo de dióxido de silicio. Circuito 2: una botella de vidrio y la red dan una muestra de hielo de anillo.")
    add('emi.grindless.info.ring_harvester.1', "Solo funciona en órbita de Saturno y necesita carcasas de cercha de estación. La red se desgasta despacio. La muestra es la semilla de la semilla cuántica saturniana.")

    add('emi.grindless.info.entry_probe_bay.0', "La bahía de sondas de entrada lanza sondas hacia Titán. Circuito 1: una sonda de entrada y nitrógeno dan tolina y una grabación de sonda de Titán. Circuito 2: una sonda de entrada y un muestreador de lagos dan metano y etano.")
    add('emi.grindless.info.entry_probe_bay.1', "Solo funciona en órbita de Saturno y necesita carcasas de bahía de sondas. La sonda se gasta. La tolina alimenta el reformador de tolinas; la grabación se decodifica en la red de espacio profundo.")

    add('emi.grindless.info.tholin_reformer.0', "El reformador de tolinas devuelve a la química los orgánicos de la bruma de Titán. Circuito 1: tolina y agua dan mezcla de nitrilos. Circuito 2: la mezcla da fibras de carbono y amoníaco. Circuito 3: mezcla, amoníaco y polvo de zinc dan diaminobencidina.")
    add('emi.grindless.info.tholin_reformer.1', "Solo funciona en órbita de Saturno y necesita carcasas de cercha de estación. El cianuro de hidrógeno nunca sale de la columna y el zinc no se gasta.")

    add('emi.grindless.info.ice_giant_siphon.0', "El sifón de gigante de hielo baja una cuchara a Urano. Circuito 1: hidrógeno y helio. 2: metano y sulfuro de hidrógeno. 3: lodo de diamante. 4: una botella de vidrio da una muestra de atmósfera.")
    add('emi.grindless.info.ice_giant_siphon.1', "Solo funciona en órbita de Urano y necesita carcasas de casco presurizado y el modelo interior de Saturno, que se conserva. Conserva sus gases: desactiva la eliminación. La cabeza de la cuchara se desgasta.")

    add('emi.grindless.info.slurry_separator.0', "El separador de lodo descomprime lodo de diamante con sulfuro de hidrógeno y da polvo de diamante, una semilla de diamante de gigante de hielo, azufre, amoníaco y agua.")
    add('emi.grindless.info.slurry_separator.1', "Solo funciona en órbita de Urano y necesita carcasas de casco presurizado. Conserva sus diamantes y semillas: desactiva la eliminación. El lodo viene del sifón de gigante de hielo.")

    add('emi.grindless.info.flyby_probe_bay.0', "La bahía de sondas de sobrevuelo lanza una sonda por la ruta de la Voyager 2. Circuito 1: una sonda de sobrevuelo de Neptuno y aerogel de sílice dan una grabación y una muestra de Neptuno. Circuito 2: con una sonda de entrada de Titán como módulo de aterrizaje da una grabación de Tritón y nitrógeno.")
    add('emi.grindless.info.flyby_probe_bay.1', "Solo funciona en órbita de Urano y necesita carcasas de bahía de sondas. Conserva sus grabaciones: desactiva la eliminación. La red de espacio profundo las decodifica.")
})
