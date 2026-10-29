// priority: 2650
// Gregtech Grindless - EMI information pages of the UV era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, its circuit modes, what it needs. Their recipes show in EMI under the controller itself.
// Every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.accelerator_driven_reactor.0', "The Accelerator-Driven Reactor is a generator: it burns a thorium oxide or thorium nitride fuel assembly in 1000 mB of lead-bismuth eutectic and gives 1,572,864 EU/t.")
    add('emi.grindless.info.accelerator_driven_reactor.1', "It leaves a spent fuel assembly and polonium-210. The spent assembly goes to the Pyroprocessing Cell.")

    add('emi.grindless.info.amorphous_ice_annealer.0', "The Amorphous Ice Annealer warms a planetesimal sample into water, carbon monoxide, nitrogen and Kuiper noble gas. It only works in Pluto orbit.")
    add('emi.grindless.info.amorphous_ice_annealer.1', "It has no output bus: the inert dust stays in the machine.")

    add('emi.grindless.info.antimatter_trap.0', "The Antimatter Trap works with antiprotons. Circuit 1: stacks 4 cartridges into a charged trap. Circuit 2: ICAN pellets from the trap, uranium dust and deuterium-tritium. Circuit 3: antihydrogen cartridge. Circuit 4: positronium condensate.")
    add('emi.grindless.info.antimatter_trap.1', "It needs superfluid helium and only works in Earth orbit.")

    add('emi.grindless.info.ark_biosphere.0', "The Ark Biosphere is a closed ecosystem. Circuit 1: the closed cycle, where algae and archaeal culture turn CO2, ammonia and water into oxygen, growth medium and biomass. Circuit 2: culture seed, which today turns 1 algae and 1 archaeal culture with 1000 mB of biomass into 2 of each. Circuit 3: inoculates algae from agar.")
    add('emi.grindless.info.ark_biosphere.1', "It needs no other starting point than its own cultures.")

    add('emi.grindless.info.boron_nitride_reactor.0', "The Boron Nitride Reactor makes boron nitride materials. Circuit 1: hBN. Circuit 2: BNNT. Circuit 3: BNNT yarn. Circuit 4: hBN from boron-10 trifluoride. Circuit 5: BN interphase on SiC fibre. Circuit 6: BN-coated CNT yarn.")
    add('emi.grindless.info.boron_nitride_reactor.1', "The yarns go into tanks and tethers.")

    add('emi.grindless.info.cryotank_winder.0', "The Cryotank Winder builds the BNNT fuel tank from an aerogel tank, BNNT or CNT yarn, hBN, the Pluto-Kuiper chart and epoxy.")
    add('emi.grindless.info.cryotank_winder.1', "It is the tank for level-7 rockets with elite motors.")

    add('emi.grindless.info.event_horizon_interferometer.0', "The Event Horizon Interferometer combines an HPGe crystal, 4 data orbs and the multimessenger catalogue into the Sagittarius A* image. It only works in Pluto orbit.")
    add('emi.grindless.info.event_horizon_interferometer.1', "The Baseline Astrometer uses the image.")

    add('emi.grindless.info.fibre_draw_tower.0', "The Fibre Draw Tower makes optical fibre products. Circuit 1: Yb preform. 2: draw fibre. 3: fibre laser module. 4: refurbish a spent module. 5: 1083 nm laser. 6: hollow capillaries. 7: MCP multifibre. 8: cooling lasers. 9: silica storage preform. 10: Er:YSO pigtail. 11: Er MCVD preform.")
    add('emi.grindless.info.fibre_draw_tower.1', "The fibre laser module is consumed by other machines, which return it spent for refurbishing here.")

    add('emi.grindless.info.heat_source_works.0', "The Heat Source Works builds radioisotope heat sources. Circuit 1: curium pellet. 2: GPHS cladding. 3: probe RTG. 4: americium micro source. 5: curium RTG pellet.")
    add('emi.grindless.info.heat_source_works.1', "It never voids: heavy curium oxide is kept for the transuranium line.")

    add('emi.grindless.info.kuiper_interceptor_bay.0', "The Kuiper Interceptor Bay launches a Kuiper interceptor with the Pluto-Kuiper chart and returns a planetesimal sample and a sample canister. It only works in Pluto orbit.")
    add('emi.grindless.info.kuiper_interceptor_bay.1', "The sample goes to the Amorphous Ice Annealer.")

    add('emi.grindless.info.laser_fusion_chamber.0', "The Laser Fusion Chamber is a generator of 2,621,440 EU/t. Circuit 1: p-B11 capsule. Circuit 2: D-He3 capsule. Each run needs a fibre laser module.")
    add('emi.grindless.info.laser_fusion_chamber.1', "The spent laser module comes back and can be refurbished.")

    add('emi.grindless.info.laser_sail_launcher.0', "The Laser Sail Launcher fires sails from the Moon. Circuit 1: launches the Starshot probe (sailcraft, heliopause data and a fibre laser module). Circuit 2: launches the relay seed.")
    add('emi.grindless.info.laser_sail_launcher.1', "It only works on the Moon.")

    add('emi.grindless.info.light_sail_fab.0', "The Light Sail Fab builds sail parts. Circuit 1: nitride film. 2: metasurface pattern. 3: sail release. 4: aluminium reflector film. It only works in Earth orbit.")
    add('emi.grindless.info.light_sail_fab.1', "The reflector film is also used for swarm segments.")

    add('emi.grindless.info.mocvd_reactor.0', "The MOCVD Reactor grows semiconductor layers. Circuit 1: organometallics. 2: InGaAs epi. 3: diode bars. 4: NbN film. 5: pump module. 6: arsine scrubbing. 7: IMM epi. 8: NbN SiC plate. 12: InGaAsSb epi.")
    add('emi.grindless.info.mocvd_reactor.1', "The wafers feed lasers, pump modules and solar arrays.")

    add('emi.grindless.info.muon_fusion_cell.0', "The Muon Fusion Cell is a generator with no circuit: a lithium breeder blanket and 500 mB of liquid deuterium-tritium give 500 mB of helium and 150 mB of tritium.")
    add('emi.grindless.info.muon_fusion_cell.1', "It runs without a circuit.")

    add('emi.grindless.info.neptune_deep_siphon.0', "The Neptune Deep Siphon draws gas from Neptune. Circuit 4: Neptune hydrogen and helium. Circuit 5: methane and hydrogen sulfide. It needs a Neptune sample and a scoop head, and only works in Neptune orbit.")
    add('emi.grindless.info.neptune_deep_siphon.1', "It keeps every output: nothing is voided.")

    add('emi.grindless.info.neural_culture_vat.0', "The Neural Culture Vat grows neural tissue. Circuit 1: 64 stem cells from gelatin, neural organoid and growth medium. Circuit 2: 4 neural processing units from 8 stem cells and a wetware PCB.")
    add('emi.grindless.info.neural_culture_vat.1', "The stem cells are also what the organoid computers of UHV start from.")

    add('emi.grindless.info.optical_ground_station.0', "The Optical Ground Station turns a Starshot probe, an SNSPD array and 100 mB of superfluid helium into the Proxima approach data. It has no circuit.")
    add('emi.grindless.info.optical_ground_station.1', "The data is needed to open the warp gate and to send the rover.")

    add('emi.grindless.info.penetrator_probe_bay.0', "The Penetrator Probe Bay fires a penetrator probe at a moon. Circuit 1: Sputnik core. Circuit 2: Charon core. It only works in Pluto orbit.")
    add('emi.grindless.info.penetrator_probe_bay.1', "Nothing is voided; the cores go to the Volatile Ice Fractionator.")

    add('emi.grindless.info.powder_bed_printer.0', "The Powder Bed Printer makes metal parts. Circuit 1: atomises powder. 2: near-net gear or rotor. 3: press. 4: thruster chamber. 5: array mount. 6: probe frame. 7: Rhea impeller. 8: tungsten mesh.")
    add('emi.grindless.info.powder_bed_printer.1', "Each print consumes a fibre laser module.")

    add('emi.grindless.info.powder_in_tube_line.0', "The Powder-in-Tube Line makes superconducting wire. Circuit 1: EnTED powder. 2: billet. 3: EnTED wire. 4: RTAN wire. 5: MgB2 wire in an iron tube. 6: LaY superhydride wire.")
    add('emi.grindless.info.powder_in_tube_line.1', "The wires are used for superconducting hatches and structures of the later eras.")

    add('emi.grindless.info.precursor_probe_bay.0', "The Precursor Probe Bay flies a precursor probe with 4 ICAN pellets and returns the heliopause data. It only works in Pluto orbit.")
    add('emi.grindless.info.precursor_probe_bay.1', "The data is used by the Laser Sail Launcher and the Solar Probe Bay.")

    add('emi.grindless.info.pyroprocessing_cell.0', "The Pyroprocessing Cell reprocesses fuel. Circuit 1: reduces spent oxide fuel to ThU metal. 2: refines U-233 and thorium. 3: nitride fuel (N-15 comes back). 4: cleans the loaded salt. 5: HFIR driver row. 6: Ti-50 sponge. 7: Ni-58 metal. 8: Li-6 metal. 9: Li-Sn eutectic.")
    add('emi.grindless.info.pyroprocessing_cell.1', "It refuses to void.")

    add('emi.grindless.info.srf_cavity_works.0', "The SRF Cavity Works builds superconducting cavities. Circuit 1: RRR niobium sheets. 2: bare cavity. 3: surface treatment with electropolish acid. 4: cryomodule (needs superfluid helium). 5: Nb3Sn diffusion and para-H2 target. 6: polarised H ice. 7: solid neon cone.")
    add('emi.grindless.info.srf_cavity_works.1', "The cavities are parts for accelerators and cryomodules.")

    add('emi.grindless.info.starchip_fab.0', "The Starchip Fab builds interstellar hardware. Circuit 1: starchip. 2: sailcraft. 3: relay seed. 4: ergosphere probe. It only works in Earth orbit and needs a clean room.")
    add('emi.grindless.info.starchip_fab.1', "Sailcraft and relay seeds are launched by the Laser Sail Launcher.")

    add('emi.grindless.info.superfluid_helium_plant.0', "The Superfluid Helium Plant has no circuit. It makes superfluid helium from liquid helium, or from Neptune helium (with a helium-3 concentrate byproduct), mixes helium-3 and helium-4, and splits PLi6 ash into helium-3 and helium.")
    add('emi.grindless.info.superfluid_helium_plant.1', "Superfluid helium cools the cavities, the antimatter trap and the optical station.")

    add('emi.grindless.info.synchrotron.0', "The Synchrotron works with X-rays. Circuit 1: exposes a PMMA wafer. 2: LIGA develop. 3: photonic chips. 4: antiprotons (the activated tungsten target comes back as a byproduct). 5: sodium-22 target. 6: SiN waveguide lithography. 7: damascene trench lithography.")
    add('emi.grindless.info.synchrotron.1', "Antiprotons are made here.")

    add('emi.grindless.info.thruster_works.0', "The Thruster Works builds propulsion. Circuit 1: ion thruster (xenon). 2: Hall thruster (krypton). 3: thruster pod. 4: ICAN rocket motor. 5: oganesson propellant pod. 6: DFD Mk1 motor. 7: DFD Mk2 motor.")
    add('emi.grindless.info.thruster_works.1', "Oganesson pods are the fuel of the swarm.")

    add('emi.grindless.info.triton_geyser_sampler.0', "The Triton Geyser Sampler works with an aerogel cartridge. Circuit 1: with the Triton probe recording, tholin and Triton nitrogen. Circuit 2: Triton ice core and nitrogen. It only works in Neptune orbit.")
    add('emi.grindless.info.triton_geyser_sampler.1', "Nothing is voided.")

    add('emi.grindless.info.volatile_ice_fractionator.0', "The Volatile Ice Fractionator separates cores. Circuit 1: Sputnik core into tholin, nitrogen, carbon monoxide and methane. Circuit 2: Charon core into silica, water and ammonia. It only works in Pluto orbit.")
    add('emi.grindless.info.volatile_ice_fractionator.1', "Nothing is voided.")

    add('emi.grindless.info.zone_refining_tower.0', "The Zone Refining Tower purifies crystals. Circuit 1: GeCl4. 2: germanium reduction. 3: HPGe crystal. 4: float-zone silicon. 5: 7N indium. 6: Si-28 float-zone ingot. 7: Si-28 donor regrowth.")
    add('emi.grindless.info.zone_refining_tower.1', "HPGe crystals go into detectors and interferometers.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.accelerator_driven_reactor.0', "El reactor impulsado por acelerador es un generador: quema un ensamblaje de combustible de óxido o nitruro de torio en 1000 mB de eutéctico de plomo y bismuto y da 1.572.864 EU/t.")
    add('emi.grindless.info.accelerator_driven_reactor.1', "Deja un ensamblaje gastado y polonio-210. El ensamblaje gastado puede ir a la celda de piroprocesado.")

    add('emi.grindless.info.amorphous_ice_annealer.0', "El recocedor de hielo amorfo calienta una muestra de planetesimal hasta obtener agua, monóxido de carbono, nitrógeno y gas noble de Kuiper. Solo funciona en la órbita de Plutón.")
    add('emi.grindless.info.amorphous_ice_annealer.1', "No tiene bus de salida: el polvo inerte se queda dentro de la máquina.")

    add('emi.grindless.info.antimatter_trap.0', "La trampa de antimateria trabaja con antiprotones. Circuito 1: apila 4 cartuchos en una trampa cargada. Circuito 2: pellets ICAN con la trampa, polvo de uranio y deuterio-tritio. Circuito 3: cartucho de antihidrógeno. Circuito 4: condensado de positronio.")
    add('emi.grindless.info.antimatter_trap.1', "Necesita helio superfluido y solo funciona en la órbita de la Tierra.")

    add('emi.grindless.info.ark_biosphere.0', "La biosfera arca es un ecosistema cerrado. Circuito 1: el ciclo cerrado, donde algas y cultivo arqueal convierten CO2, amoníaco y agua en oxígeno, medio de crecimiento y biomasa. Circuito 2: semilla de cultivo, que hoy convierte 1 alga y 1 cultivo arqueal con 1000 mB de biomasa en 2 de cada uno. Circuito 3: inocula algas a partir de agar.")
    add('emi.grindless.info.ark_biosphere.1', "No necesita más punto de partida que sus propios cultivos.")

    add('emi.grindless.info.boron_nitride_reactor.0', "El reactor de nitruro de boro fabrica materiales de nitruro de boro. Circuito 1: hBN. Circuito 2: BNNT. Circuito 3: hilo de BNNT. Circuito 4: hBN a partir de trifluoruro de boro-10. Circuito 5: interfase de BN en fibra de SiC. Circuito 6: hilo de CNT recubierto de BN.")
    add('emi.grindless.info.boron_nitride_reactor.1', "Los hilos se usan en tanques y cables.")

    add('emi.grindless.info.cryotank_winder.0', "El bobinador de criotanques construye el tanque de combustible de BNNT con un tanque de aerogel, hilo de BNNT o CNT, hBN, la carta Plutón-Kuiper y epoxi.")
    add('emi.grindless.info.cryotank_winder.1', "Es el tanque de los cohetes de nivel 7 con motores de élite.")

    add('emi.grindless.info.event_horizon_interferometer.0', "El interferómetro del horizonte de sucesos combina un cristal de HPGe, 4 orbes de datos y el catálogo multimensajero en la imagen de Sagitario A*. Solo funciona en la órbita de Plutón.")
    add('emi.grindless.info.event_horizon_interferometer.1', "El astrómetro de línea base usa la imagen.")

    add('emi.grindless.info.fibre_draw_tower.0', "La torre de estirado de fibra fabrica productos de fibra óptica. Circuito 1: preforma de Yb. 2: estirar fibra. 3: módulo láser de fibra. 4: reacondicionar un módulo gastado. 5: láser de 1083 nm. 6: capilares huecos. 7: multifibra MCP. 8: láseres de enfriamiento. 9: preforma de almacenamiento de sílice. 10: pigtail de Er:YSO. 11: preforma de Er por MCVD.")
    add('emi.grindless.info.fibre_draw_tower.1', "Otras máquinas consumen el módulo láser de fibra y lo devuelven gastado para reacondicionarlo aquí.")

    add('emi.grindless.info.heat_source_works.0', "La fábrica de fuentes de calor construye fuentes de calor radioisotópicas. Circuito 1: pellet de curio. 2: revestimiento GPHS. 3: RTG de sonda. 4: microfuente de americio. 5: pellet de curio para RTG.")
    add('emi.grindless.info.heat_source_works.1', "Nunca elimina residuos: el óxido de curio pesado se conserva para la línea de transuránicos.")

    add('emi.grindless.info.kuiper_interceptor_bay.0', "La bahía de interceptores de Kuiper lanza un interceptor de Kuiper con la carta Plutón-Kuiper y devuelve una muestra de planetesimal y un contenedor de muestras. Solo funciona en la órbita de Plutón.")
    add('emi.grindless.info.kuiper_interceptor_bay.1', "La muestra va al recocedor de hielo amorfo.")

    add('emi.grindless.info.laser_fusion_chamber.0', "La cámara de fusión láser es un generador de 2.621.440 EU/t. Circuito 1: cápsula de p-B11. Circuito 2: cápsula de D-He3. Cada ciclo necesita un módulo láser de fibra.")
    add('emi.grindless.info.laser_fusion_chamber.1', "El módulo láser gastado vuelve y se puede reacondicionar.")

    add('emi.grindless.info.laser_sail_launcher.0', "El lanzador de velas láser dispara velas desde la Luna. Circuito 1: lanza la sonda Starshot (nave de vela, datos de la heliopausa y un módulo láser de fibra). Circuito 2: lanza la semilla de relé.")
    add('emi.grindless.info.laser_sail_launcher.1', "Solo funciona en la Luna.")

    add('emi.grindless.info.light_sail_fab.0', "La fábrica de velas solares construye piezas de vela. Circuito 1: película de nitruro. 2: patrón de metasuperficie. 3: liberación de la vela. 4: película reflectora de aluminio. Solo funciona en la órbita de la Tierra.")
    add('emi.grindless.info.light_sail_fab.1', "La película reflectora también se usa para los segmentos del enjambre.")

    add('emi.grindless.info.mocvd_reactor.0', "El reactor MOCVD hace crecer capas de semiconductor. Circuito 1: organometálicos. 2: epitaxia de InGaAs. 3: barras de diodos. 4: película de NbN. 5: módulo de bombeo. 6: depuración de arsina. 7: epitaxia IMM. 8: placa de NbN sobre SiC. 12: epitaxia de InGaAsSb.")
    add('emi.grindless.info.mocvd_reactor.1', "Las obleas alimentan láseres, módulos de bombeo y matrices solares.")

    add('emi.grindless.info.muon_fusion_cell.0', "La celda de fusión por muones es un generador sin circuito: una manta reproductora de litio y 500 mB de deuterio-tritio líquido dan 500 mB de helio y 150 mB de tritio.")
    add('emi.grindless.info.muon_fusion_cell.1', "Funciona sin circuito.")

    add('emi.grindless.info.neptune_deep_siphon.0', "El sifón profundo de Neptuno extrae gas de Neptuno. Circuito 4: hidrógeno y helio de Neptuno. Circuito 5: metano y sulfuro de hidrógeno. Necesita una muestra de Neptuno y una cabeza de cuchara, y solo funciona en la órbita de Neptuno.")
    add('emi.grindless.info.neptune_deep_siphon.1', "Conserva todas las salidas: no se elimina nada.")

    add('emi.grindless.info.neural_culture_vat.0', "La cuba de cultivo neural hace crecer tejido neural. Circuito 1: 64 células madre a partir de gelatina, organoide neural y medio de crecimiento. Circuito 2: 4 unidades de procesamiento neural con 8 células madre y una PCB de wetware.")
    add('emi.grindless.info.neural_culture_vat.1', "Las células madre son también el punto de partida de los ordenadores de organoides de UHV.")

    add('emi.grindless.info.optical_ground_station.0', "La estación óptica terrestre convierte una sonda Starshot, una matriz SNSPD y 100 mB de helio superfluido en los datos de aproximación a Próxima. No tiene circuito.")
    add('emi.grindless.info.optical_ground_station.1', "Los datos hacen falta para abrir la puerta de salto y enviar el rover.")

    add('emi.grindless.info.penetrator_probe_bay.0', "La bahía de sondas penetradoras dispara una sonda penetradora contra una luna. Circuito 1: núcleo de Sputnik. Circuito 2: núcleo de Caronte. Solo funciona en la órbita de Plutón.")
    add('emi.grindless.info.penetrator_probe_bay.1', "No se elimina nada; los núcleos van al fraccionador de hielos volátiles.")

    add('emi.grindless.info.powder_bed_printer.0', "La impresora de lecho de polvo fabrica piezas metálicas. Circuito 1: atomiza polvo. 2: engranaje o rotor casi final. 3: prensado. 4: cámara de propulsor. 5: soporte de matriz. 6: marco de sonda. 7: impulsor de Rea. 8: malla de wolframio.")
    add('emi.grindless.info.powder_bed_printer.1', "Cada impresión consume un módulo láser de fibra.")

    add('emi.grindless.info.powder_in_tube_line.0', "La línea de polvo en tubo fabrica cable superconductor. Circuito 1: polvo de EnTED. 2: lingote. 3: cable de EnTED. 4: cable de RTAN. 5: cable de MgB2 en tubo de hierro. 6: cable de superhidruro de LaY.")
    add('emi.grindless.info.powder_in_tube_line.1', "Los cables se usan en escotillas y estructuras superconductoras de las eras posteriores.")

    add('emi.grindless.info.precursor_probe_bay.0', "La bahía de sondas precursoras lanza una sonda precursora con 4 pellets ICAN y devuelve los datos de la heliopausa. Solo funciona en la órbita de Plutón.")
    add('emi.grindless.info.precursor_probe_bay.1', "Los datos los usan el lanzador de velas láser y la bahía de sondas solares.")

    add('emi.grindless.info.pyroprocessing_cell.0', "La celda de piroprocesado reprocesa combustible. Circuito 1: reduce el combustible de óxido gastado a metal ThU. 2: refina U-233 y torio. 3: combustible de nitruro (vuelve el N-15). 4: limpia la sal cargada. 5: fila del impulsor HFIR. 6: esponja de Ti-50. 7: metal de Ni-58. 8: metal de Li-6. 9: eutéctico Li-Sn.")
    add('emi.grindless.info.pyroprocessing_cell.1', "No elimina residuos.")

    add('emi.grindless.info.srf_cavity_works.0', "La fábrica de cavidades SRF construye cavidades superconductoras. Circuito 1: láminas de niobio RRR. 2: cavidad desnuda. 3: tratamiento de superficie con ácido de electropulido. 4: criomódulo (necesita helio superfluido). 5: difusión de Nb3Sn y blanco de para-H2. 6: hielo de H polarizado. 7: cono de neón sólido.")
    add('emi.grindless.info.srf_cavity_works.1', "Las cavidades son piezas para aceleradores y criomódulos.")

    add('emi.grindless.info.starchip_fab.0', "La fábrica de starchips construye hardware interestelar. Circuito 1: starchip. 2: nave de vela. 3: semilla de relé. 4: sonda de ergosfera. Solo funciona en la órbita de la Tierra y necesita sala limpia.")
    add('emi.grindless.info.starchip_fab.1', "Las naves de vela y las semillas de relé las lanza el lanzador de velas láser.")

    add('emi.grindless.info.superfluid_helium_plant.0', "La planta de helio superfluido no tiene circuito. Hace helio superfluido a partir de helio líquido o de helio de Neptuno (con concentrado de helio-3 como subproducto), mezcla helio-3 y helio-4 y separa la ceniza de PLi6 en helio-3 y helio.")
    add('emi.grindless.info.superfluid_helium_plant.1', "El helio superfluido enfría las cavidades, la trampa de antimateria y la estación óptica.")

    add('emi.grindless.info.synchrotron.0', "El sincrotrón trabaja con rayos X. Circuito 1: expone una oblea de PMMA. 2: revelado LIGA. 3: chips fotónicos. 4: antiprotones (el blanco de wolframio activado vuelve como subproducto). 5: blanco de sodio-22. 6: litografía de guías de onda de SiN. 7: litografía de zanjas damasquinadas.")
    add('emi.grindless.info.synchrotron.1', "Aquí se hacen los antiprotones.")

    add('emi.grindless.info.thruster_works.0', "La fábrica de propulsores construye propulsión. Circuito 1: propulsor iónico (xenón). 2: propulsor Hall (kriptón). 3: cápsula de propulsor. 4: motor de cohete ICAN. 5: cápsula de propelente de oganesón. 6: motor DFD Mk1. 7: motor DFD Mk2.")
    add('emi.grindless.info.thruster_works.1', "Las cápsulas de oganesón son el combustible del enjambre.")

    add('emi.grindless.info.triton_geyser_sampler.0', "El muestreador de géiseres de Tritón trabaja con un cartucho de aerogel. Circuito 1: con la grabación de la sonda de Tritón, tolina y nitrógeno de Tritón. Circuito 2: núcleo de hielo de Tritón y nitrógeno. Solo funciona en la órbita de Neptuno.")
    add('emi.grindless.info.triton_geyser_sampler.1', "No se elimina nada.")

    add('emi.grindless.info.volatile_ice_fractionator.0', "El fraccionador de hielos volátiles separa núcleos. Circuito 1: núcleo de Sputnik en tolina, nitrógeno, monóxido de carbono y metano. Circuito 2: núcleo de Caronte en sílice, agua y amoníaco. Solo funciona en la órbita de Plutón.")
    add('emi.grindless.info.volatile_ice_fractionator.1', "No se elimina nada.")

    add('emi.grindless.info.zone_refining_tower.0', "La torre de refinado por zonas purifica cristales. Circuito 1: GeCl4. 2: reducción de germanio. 3: cristal de HPGe. 4: silicio de zona flotante. 5: indio 7N. 6: lingote de Si-28 de zona flotante. 7: recrecimiento de donante de Si-28.")
    add('emi.grindless.info.zone_refining_tower.1', "Los cristales de HPGe van a detectores e interferómetros.")
})
