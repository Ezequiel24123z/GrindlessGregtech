// priority: 4538
// Gregtech Grindless - EMI information pages of the UHV era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, its circuit modes, what it needs. Their recipes show in EMI under the controller itself.
// Every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.baseline_astrometer.0', "The Baseline Astrometer turns SiC mirror blanks, ZBLAN fibre, quantum cascade lasers, thin-film modulators, infrared pigment, the Sagittarius A* image and an organoid processor into the stellar neighbourhood chart. It only works in Proxima b orbit.")
    add('emi.grindless.info.baseline_astrometer.1', "The chart is what the warp gate and the relays navigate by.")

    add('emi.grindless.info.betavoltaic_fab.0', "The Betavoltaic Fab makes nuclear batteries. Circuit 1: nickel-63 plating liquor from targets and nitric acid. Circuit 2: 8 betavoltaic cells from diamond diodes and the liquor. Circuit 3: strips the depleted bath into nickel dust and nitric acid.")
    add('emi.grindless.info.betavoltaic_fab.1', "It refuses to void: the depleted bath is always recovered.")

    add('emi.grindless.info.biomining_heap.0', "The Biomining Heap leaches regolith with bacteria. Circuit 1: platinum-group metals (Chromobacterium). Circuit 2: rare earths (Sphingomonas). Circuit 3: biocement from cold-trap regolith (Sporosarcina). Circuit 4: biocement from lunar regolith.")
    add('emi.grindless.info.biomining_heap.1', "Circuits 1 to 3 only work on Proxima b. The leached tailings are a byproduct.")

    add('emi.grindless.info.cold_trap_drill.0', "The Cold Trap Drill digs the permanent shadow of Proxima b with a coring head, the regolith survey and a californium-252 source. It gives a Proxima ice core and 16 cold-trap regolith.")
    add('emi.grindless.info.cold_trap_drill.1', "It only works on the night side of Proxima b.")

    add('emi.grindless.info.crystal_growth_furnace.0', "The Crystal Growth Furnace grows single crystals. Circuit 1: LiNbO3. 2: VUV CaF2. 3: Th:CaF2. 4: Eu:YSO. 5: InP. 6: TGG. 7: KTP. 8: Eu-151:YSO. 9: Er:YSO.")
    add('emi.grindless.info.crystal_growth_furnace.1', "It needs an iridium crucible that wears out and comes back as a worn crucible. It refuses to void.")

    add('emi.grindless.info.high_flux_reactor.0', "The High Flux Reactor irradiates targets with 6 HFIR driver elements and distilled water. Circuit 1: transcurium target. 2: nickel-62 targets into nickel-63. 3: californium-252 source. 4: plutonium target.")
    add('emi.grindless.info.high_flux_reactor.1', "It is not a generator. Spent driver elements and radioactive waste come out; it refuses to void.")

    add('emi.grindless.info.mbe_reactor.0', "The MBE Reactor grows layers atom by atom. Circuit 1: QCL superlattice wafer. 2: 8 quantum cascade lasers. 3: InAs quantum dots. 4: Ni-58/Ti multilayer. 5: La/B4C multilayer. 6: phosphorus overgrowth. 7: ThF4 film. 8: niobium trilayer.")
    add('emi.grindless.info.mbe_reactor.1', "Most circuits use liquid nitrogen, which comes back as gas. It refuses to void.")

    add('emi.grindless.info.nuclear_clock_lab.0', "The Nuclear Clock Lab. Circuit 1: VUV frequency comb from a fibre laser module, VUV CaF2 optics and xenon. Circuit 2: the nuclear clock from a Th:CaF2 crystal and the comb. Circuit 3: the chip-scale nuclear clock from a capped ThF4 film.")
    add('emi.grindless.info.nuclear_clock_lab.1', "Circuits 2 and 3 also need a UHV circuit. The clock is needed to open the warp gate.")

    add('emi.grindless.info.organoid_array.0', "The Organoid Array grows computing tissue. Circuit 1: organoid processor from 4 stem cells, chitosan scaffold, ultrapure water and sterile growth medium. Circuit 2: wetware mainframe, wired from 4 organoids and 4 neural processing units with a SiC power module and an optical assembly.")
    add('emi.grindless.info.organoid_array.1', "It only works on Earth. It refuses to void fluids: the spent medium goes to the LuV biofoundry.")

    add('emi.grindless.info.pbo_plant.0', "The PBO Plant makes PBO fibre. Circuit 1: nitrate. 2: hydrolyse. 3: reduce. 4: polymerise into PBO dope. 5: spin into fibre.")
    add('emi.grindless.info.pbo_plant.1', "The fibre goes into tethers and space elevator cables.")

    add('emi.grindless.info.photonic_foundry.0', "The Photonic Foundry makes photonic chips. Circuit 1: LNOI. 2: PCM dies. 3: quantum memory chips. 4: optical processor. 5: optical assembly. 6: thin-film modulators. Circuits 7 to 16 make waveguides, transceivers, interposers, crossbars and other photonic parts.")
    add('emi.grindless.info.photonic_foundry.1', "Every recipe uses 1000 mB of ultrapure water, which comes back as water.")

    add('emi.grindless.info.positron_accumulator.0', "The Positron Accumulator. Circuit 1: moderated source from a sodium-22 target and high-purity neon. Circuit 2: accumulates positrons into a cartridge. Circuit 3: strips a spent source. Circuit 4: cools a pair-plasma bunch.")
    add('emi.grindless.info.positron_accumulator.1', "It refuses to void. The positron cartridge is its main product.")

    add('emi.grindless.info.quantum_fabricator.0', "The Quantum Fabricator runs assembler, circuit assembler, forming press, laser engraver and cutter recipes. It has a mode tab, accepts a parallel hatch up to 1024 copies, overclocks perfectly and has batch mode.")
    add('emi.grindless.info.quantum_fabricator.1', "It needs a fluid input hatch and stands inside a formed cleanroom.")

    add('emi.grindless.info.radiotrophic_vat.0', "The Radiotrophic Vat grows melanised biomass from 4 xeno biomass, a Cladosporium culture and water. It gives 8 melanised biomass and some biomass back.")
    add('emi.grindless.info.radiotrophic_vat.1', "It only works on Proxima b.")

    add('emi.grindless.info.regolith_excavator.0', "The Regolith Excavator digs 64 Mercury regolith from a bucket drum and an iridosmine vein sample. The sample is not used up.")
    add('emi.grindless.info.regolith_excavator.1', "It only works on the ground of Mercury.")

    add('emi.grindless.info.sample_receiving_facility.0', "The Sample Receiving Facility handles Proxima samples. Circuit 1: sterilises a flora sample with hydrogen peroxide into an extract and genome data. Circuit 2: isolates a characterised xeno strain. Circuit 3: extracts sterile organics from an ice core.")
    add('emi.grindless.info.sample_receiving_facility.1', "It only works on Earth. The strains feed the xenobotany greenhouse.")

    add('emi.grindless.info.sic_device_fab.0', "The SiC Device Fab. Circuit 1: SiC boule. 2: epi wafer. 3: anneal. 4: four power modules. 5: SiC mirror blank.")
    add('emi.grindless.info.sic_device_fab.1', "The power modules go into solar arrays, probes and tethers.")

    add('emi.grindless.info.solar_array_fab.0', "The Solar Array Fab. Circuit 1: IMM lift-off into film. 2: IMM solar array. 3: red-tuned solar array.")
    add('emi.grindless.info.solar_array_fab.1', "The lift-off returns the gallium arsenide substrate wafers.")

    add('emi.grindless.info.solar_probe_bay.0', "The Solar Probe Bay. Circuit 2: assembles the solar probe. Circuit 1: flies the probe into the corona and returns the coronal field map. Circuit 3: a second flight that makes the alpha coronal field map. It only works in Mercury orbit.")
    add('emi.grindless.info.solar_probe_bay.1', "The map is needed by the swarm control station.")

    add('emi.grindless.info.solar_vapour_furnace.0', "The Solar Vapour Furnace splits Mercury regolith by heat. Circuit 1: low fraction (1400 K). Circuit 2: high fraction (2300 K). Circuit 3: sinters the crucible lining.")
    add('emi.grindless.info.solar_vapour_furnace.1', "It only works on the day side of Mercury.")

    add('emi.grindless.info.spark_plasma_sinterer.0', "The Spark Plasma Sinterer presses powders into dense parts without fluids. Circuit 1: UHTC tile. 2: TaC liner. 3: UHTC nozzle. 4: HfTaCN billet. 5: B4C target. 6: Nb target. 7: W target.")
    add('emi.grindless.info.spark_plasma_sinterer.1', "The tiles and nozzles are used in probes and thrusters.")

    add('emi.grindless.info.swarm_control_station.0', "The Swarm Control Station is a generator. Segments are the catalyst and oganesson propellant pods or krypton are the fuel. Circuit 1: 1 segment, 8,388,608 EU/t. Circuit 2: 4 segments. Circuits 3 and 4 use more segments and the alpha coronal field map.")
    add('emi.grindless.info.swarm_control_station.1', "Segments come back worn and can be refurbished. It takes no parallel hatch, needs 4 A UHV dynamo hatches and only works in Mercury orbit.")

    add('emi.grindless.info.swarm_segment_foundry.0', "The Swarm Segment Foundry. Circuit 1: builds a swarm segment from reflector films, IMM arrays, a fibre laser module, a diamond spreader, a SiC power module, betavoltaic cells and a heat pipe. Circuit 2: refurbishes a worn segment.")
    add('emi.grindless.info.swarm_segment_foundry.1', "It only works in Mercury orbit.")

    add('emi.grindless.info.tether_ribbon_works.0', "The Tether Ribbon Works. Circuit 1: tether ribbon from CNT, BNNT and PBO fibre. Circuit 2: tether climber. Circuit 3: MH tether from a braided tether and a ribbon. Circuit 4: recovers CNT yarn from a worn tether.")
    add('emi.grindless.info.tether_ribbon_works.1', "The ribbon is the core of the space elevator cable.")

    add('emi.grindless.info.transuranium_facility.0', "The Transuranium Facility. Circuit 1: dissolves irradiated targets. 2: HDEHP separation into berkelium, californium and heavy curium. 3: decay store, Th-229 from aged U-233 (never overclocked). 4: new target. 5: evaporates fission-product liquor. 6: incinerates spent solvent. 7 to 9: plutonium, curium-californium and einsteinium extraction.")
    add('emi.grindless.info.transuranium_facility.1', "Waste liquors are evaporated and the solvent is burned, not voided.")

    add('emi.grindless.info.ultrapure_water_plant.0', "The Ultrapure Water Plant turns 8000 mB of water, sodium hydroxide, ion-exchange resin and hydrochloric acid into 6000 mB of ultrapure water.")
    add('emi.grindless.info.ultrapure_water_plant.1', "The reverse-osmosis concentrate can be voided. It takes one parallel hatch.")

    add('emi.grindless.info.warp_gate.0', "The Warp Gate. Circuit 1: opens the gate and makes the Proxima gate seed from exotic matter cells, antihydrogen, approach data, a nuclear clock and an organoid processor. Circuit 2: holds the gate open for a minute with an exotic matter cell. Circuits 3 to 6 hold it with other catalysts.")
    add('emi.grindless.info.warp_gate.1', "Players inside the ring are carried; items travel by AE2. It is built at Earth orbit and at Proxima b orbit.")

    add('emi.grindless.info.xenobiochem_plant.0', "The Xenobiochemistry Plant. Circuit 1: radioprotectant. 2: infrared pigment. 3: chitosan scaffolds from xeno mushrooms. 4: clarified lysate from xeno biomass.")
    add('emi.grindless.info.xenobiochem_plant.1', "It only works on Proxima b.")

    add('emi.grindless.info.xenobotany_greenhouse.0', "The Xenobotany Greenhouse grows a characterised xeno strain with water and CO2. Circuit 1: xeno biomass and oxygen. Circuit 2: xeno mushrooms. Circuit 3: far-red pigment from biomass.")
    add('emi.grindless.info.xenobotany_greenhouse.1', "It is sealed and only works on Proxima b.")

    add('emi.grindless.info.xenoflora_rover_bay.0', "The Xenoflora Rover Bay sends a Proxima rover with the approach data and returns 4 flora samples, the regolith survey and an americium micro source.")
    add('emi.grindless.info.xenoflora_rover_bay.1', "It only works on Proxima b. The samples go to the Sample Receiving Facility.")

    add('emi.grindless.info.zblan_draw_tower.0', "The ZBLAN Draw Tower. Circuit 1: glass preform from zirconium tetrafluoride, barium, lanthanum and other fluorides. Circuit 2: draws 8 ZBLAN fibres from a preform.")
    add('emi.grindless.info.zblan_draw_tower.1', "It only works in Earth orbit.")

    add('emi.grindless.info.uhv_parallel_hatch.0', "The Hyper Parallel Control Hatch lets a machine that takes parallel hatches run up to 1024 copies of a recipe at once, each at its own EU/t.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.baseline_astrometer.0', "El astrómetro de línea base convierte espejos de SiC, fibra ZBLAN, láseres de cascada cuántica, moduladores de película fina, pigmento infrarrojo, la imagen de Sagitario A* y un procesador de organoides en la carta del vecindario estelar. Solo funciona en la órbita de Próxima b.")
    add('emi.grindless.info.baseline_astrometer.1', "La carta es con lo que navegan la puerta de salto y los relés.")

    add('emi.grindless.info.betavoltaic_fab.0', "La fábrica betavoltaica hace baterías nucleares. Circuito 1: licor de chapado de níquel-63 a partir de blancos y ácido nítrico. Circuito 2: 8 celdas betavoltaicas con diodos de diamante y el licor. Circuito 3: recupera el baño agotado en polvo de níquel y ácido nítrico.")
    add('emi.grindless.info.betavoltaic_fab.1', "No elimina residuos: el baño agotado siempre se recupera.")

    add('emi.grindless.info.biomining_heap.0', "El montón de biominería lixivia regolito con bacterias. Circuito 1: metales del grupo del platino (Chromobacterium). Circuito 2: tierras raras (Sphingomonas). Circuito 3: biocemento con regolito de trampa fría (Sporosarcina). Circuito 4: biocemento con regolito lunar.")
    add('emi.grindless.info.biomining_heap.1', "Los circuitos 1 a 3 solo funcionan en Próxima b. Los residuos lixiviados son un subproducto.")

    add('emi.grindless.info.cold_trap_drill.0', "El taladro de trampa fría excava la sombra permanente de Próxima b con una cabeza de testigo, el estudio de regolito y una fuente de californio-252. Da un testigo de hielo de Próxima y 16 de regolito de trampa fría.")
    add('emi.grindless.info.cold_trap_drill.1', "Solo funciona en el lado nocturno de Próxima b.")

    add('emi.grindless.info.crystal_growth_furnace.0', "El horno de crecimiento de cristales hace crecer monocristales. Circuito 1: LiNbO3. 2: CaF2 VUV. 3: Th:CaF2. 4: Eu:YSO. 5: InP. 6: TGG. 7: KTP. 8: Eu-151:YSO. 9: Er:YSO.")
    add('emi.grindless.info.crystal_growth_furnace.1', "Necesita un crisol de iridio que se desgasta y vuelve como crisol gastado. No elimina residuos.")

    add('emi.grindless.info.high_flux_reactor.0', "El reactor de alto flujo irradia blancos con 6 elementos impulsores HFIR y agua destilada. Circuito 1: blanco de transcurio. 2: blancos de níquel-62 a níquel-63. 3: fuente de californio-252. 4: blanco de plutonio.")
    add('emi.grindless.info.high_flux_reactor.1', "No es un generador. Salen elementos impulsores gastados y residuos radiactivos; no elimina residuos.")

    add('emi.grindless.info.mbe_reactor.0', "El reactor MBE hace crecer capas átomo a átomo. Circuito 1: oblea de superred QCL. 2: 8 láseres de cascada cuántica. 3: puntos cuánticos de InAs. 4: multicapa de Ni-58/Ti. 5: multicapa de La/B4C. 6: sobrecrecimiento de fósforo. 7: película de ThF4. 8: tricapa de niobio.")
    add('emi.grindless.info.mbe_reactor.1', "La mayoría de circuitos usan nitrógeno líquido, que vuelve como gas. No elimina residuos.")

    add('emi.grindless.info.nuclear_clock_lab.0', "El laboratorio de reloj nuclear. Circuito 1: peine de frecuencias VUV con un módulo láser de fibra, ópticas de CaF2 VUV y xenón. Circuito 2: el reloj nuclear con un cristal de Th:CaF2 y el peine. Circuito 3: el reloj nuclear en chip con una película de ThF4 sellada.")
    add('emi.grindless.info.nuclear_clock_lab.1', "Los circuitos 2 y 3 necesitan además un circuito UHV. El reloj hace falta para abrir la puerta de salto.")

    add('emi.grindless.info.organoid_array.0', "La matriz de organoides hace crecer tejido de cómputo. Circuito 1: procesador de organoides con 4 células madre, andamio de quitosano, agua ultrapura y medio de crecimiento estéril. Circuito 2: mainframe de wetware, cableado con 4 organoides y 4 unidades de procesamiento neural, un módulo de potencia de SiC y un ensamblaje óptico.")
    add('emi.grindless.info.organoid_array.1', "Solo funciona en la Tierra. No elimina fluidos: el medio gastado va a la biofundición de LuV.")

    add('emi.grindless.info.pbo_plant.0', "La planta de PBO fabrica fibra de PBO. Circuito 1: nitrar. 2: hidrolizar. 3: reducir. 4: polimerizar en solución de PBO. 5: hilar en fibra.")
    add('emi.grindless.info.pbo_plant.1', "La fibra se usa en cables y en los cables del ascensor espacial.")

    add('emi.grindless.info.photonic_foundry.0', "La fundición fotónica fabrica chips fotónicos. Circuito 1: LNOI. 2: troqueles PCM. 3: chips de memoria cuántica. 4: procesador óptico. 5: ensamblaje óptico. 6: moduladores de película fina. Los circuitos 7 a 16 hacen guías de onda, transceptores, interpositores, matrices cruzadas y otras piezas fotónicas.")
    add('emi.grindless.info.photonic_foundry.1', "Cada receta usa 1000 mB de agua ultrapura, que vuelve como agua.")

    add('emi.grindless.info.positron_accumulator.0', "El acumulador de positrones. Circuito 1: fuente moderada con un blanco de sodio-22 y neón de alta pureza. Circuito 2: acumula positrones en un cartucho. Circuito 3: recupera una fuente gastada. Circuito 4: enfría un paquete de plasma de pares.")
    add('emi.grindless.info.positron_accumulator.1', "No elimina residuos. El cartucho de positrones es su producto principal.")

    add('emi.grindless.info.quantum_fabricator.0', "El fabricador cuántico ejecuta recetas de ensambladora, ensambladora de circuitos, prensa de formas, grabador láser y cortadora. Tiene una pestaña de modo, acepta una escotilla paralela de hasta 1024 copias, hace sobrerrelojes perfectos y tiene modo por lotes.")
    add('emi.grindless.info.quantum_fabricator.1', "Necesita una escotilla de entrada de fluidos y se levanta dentro de una sala limpia formada.")

    add('emi.grindless.info.radiotrophic_vat.0', "La cuba radiotrófica hace crecer biomasa melanizada con 4 de biomasa xeno, un cultivo de Cladosporium y agua. Da 8 de biomasa melanizada y algo de biomasa de vuelta.")
    add('emi.grindless.info.radiotrophic_vat.1', "Solo funciona en Próxima b.")

    add('emi.grindless.info.regolith_excavator.0', "La excavadora de regolito saca 64 de regolito de Mercurio con un tambor de cangilones y una muestra de veta de iridosmio. La muestra no se consume.")
    add('emi.grindless.info.regolith_excavator.1', "Solo funciona en el suelo de Mercurio.")

    add('emi.grindless.info.sample_receiving_facility.0', "La instalación de recepción de muestras gestiona muestras de Próxima. Circuito 1: esteriliza una muestra de flora con peróxido de hidrógeno en un extracto y datos del genoma. Circuito 2: aísla una cepa xeno caracterizada. Circuito 3: extrae orgánicos estériles de un testigo de hielo.")
    add('emi.grindless.info.sample_receiving_facility.1', "Solo funciona en la Tierra. Las cepas alimentan el invernadero de xenobotánica.")

    add('emi.grindless.info.sic_device_fab.0', "La fábrica de dispositivos de SiC. Circuito 1: bola de SiC. 2: oblea epitaxial. 3: recocido. 4: cuatro módulos de potencia. 5: espejo en bruto de SiC.")
    add('emi.grindless.info.sic_device_fab.1', "Los módulos de potencia se usan en matrices solares, sondas y cables.")

    add('emi.grindless.info.solar_array_fab.0', "La fábrica de matrices solares. Circuito 1: despegue IMM en película. 2: matriz solar IMM. 3: matriz solar sintonizada al rojo.")
    add('emi.grindless.info.solar_array_fab.1', "El despegue devuelve las obleas de sustrato de arseniuro de galio.")

    add('emi.grindless.info.solar_probe_bay.0', "La bahía de sondas solares. Circuito 2: ensambla la sonda solar. Circuito 1: lanza la sonda a la corona y devuelve el mapa del campo coronal. Circuito 3: un segundo vuelo que da el mapa alfa del campo coronal. Solo funciona en la órbita de Mercurio.")
    add('emi.grindless.info.solar_probe_bay.1', "El mapa lo necesita la estación de control del enjambre.")

    add('emi.grindless.info.solar_vapour_furnace.0', "El horno de vapor solar separa regolito de Mercurio con calor. Circuito 1: fracción baja (1400 K). Circuito 2: fracción alta (2300 K). Circuito 3: sinteriza el revestimiento del crisol.")
    add('emi.grindless.info.solar_vapour_furnace.1', "Solo funciona en el lado diurno de Mercurio.")

    add('emi.grindless.info.spark_plasma_sinterer.0', "El sinterizador por plasma de chispa prensa polvos en piezas densas sin fluidos. Circuito 1: baldosa UHTC. 2: revestimiento de TaC. 3: tobera UHTC. 4: lingote de HfTaCN. 5: blanco de B4C. 6: blanco de Nb. 7: blanco de W.")
    add('emi.grindless.info.spark_plasma_sinterer.1', "Las baldosas y toberas se usan en sondas y propulsores.")

    add('emi.grindless.info.swarm_control_station.0', "La estación de control del enjambre es un generador. Los segmentos son el catalizador y las cápsulas de oganesón o el kriptón son el combustible. Circuito 1: 1 segmento, 8.388.608 EU/t. Circuito 2: 4 segmentos. Los circuitos 3 y 4 usan más segmentos y el mapa alfa del campo coronal.")
    add('emi.grindless.info.swarm_control_station.1', "Los segmentos vuelven desgastados y se pueden reacondicionar. No acepta escotilla paralela, necesita escotillas dinamo UHV de 4 A y solo funciona en la órbita de Mercurio.")

    add('emi.grindless.info.swarm_segment_foundry.0', "La fundición de segmentos de enjambre. Circuito 1: construye un segmento de enjambre con películas reflectoras, matrices IMM, un módulo láser de fibra, un disipador de diamante, un módulo de potencia de SiC, celdas betavoltaicas y un tubo de calor. Circuito 2: reacondiciona un segmento desgastado.")
    add('emi.grindless.info.swarm_segment_foundry.1', "Solo funciona en la órbita de Mercurio.")

    add('emi.grindless.info.tether_ribbon_works.0', "La fábrica de cintas de cable. Circuito 1: cinta con fibra de CNT, BNNT y PBO. Circuito 2: escalador del cable. Circuito 3: cable de MH con un cable trenzado y una cinta. Circuito 4: recupera hilo de CNT de un cable gastado.")
    add('emi.grindless.info.tether_ribbon_works.1', "La cinta es el núcleo del cable del ascensor espacial.")

    add('emi.grindless.info.transuranium_facility.0', "La instalación de transuránicos. Circuito 1: disuelve blancos irradiados. 2: separación con HDEHP en berkelio, californio y curio pesado. 3: almacén de desintegración, Th-229 a partir de U-233 envejecido (nunca se sobrerrelojea). 4: blanco nuevo. 5: evapora el licor de productos de fisión. 6: incinera el disolvente gastado. 7 a 9: extracción de plutonio, curio-californio y einstenio.")
    add('emi.grindless.info.transuranium_facility.1', "Los licores residuales se evaporan y el disolvente se quema, no se elimina.")

    add('emi.grindless.info.ultrapure_water_plant.0', "La planta de agua ultrapura convierte 8000 mB de agua, hidróxido de sodio, resina de intercambio iónico y ácido clorhídrico en 6000 mB de agua ultrapura.")
    add('emi.grindless.info.ultrapure_water_plant.1', "El concentrado de ósmosis inversa se puede eliminar. Acepta una escotilla paralela.")

    add('emi.grindless.info.warp_gate.0', "La puerta de salto. Circuito 1: abre la puerta y fabrica la semilla de la puerta de Próxima con celdas de materia exótica, antihidrógeno, datos de aproximación, un reloj nuclear y un procesador de organoides. Circuito 2: mantiene la puerta abierta un minuto con una celda de materia exótica. Los circuitos 3 a 6 la mantienen con otros catalizadores.")
    add('emi.grindless.info.warp_gate.1', "Los jugadores dentro del anillo viajan con ella; los objetos van por AE2. Se construye en la órbita de la Tierra y en la de Próxima b.")

    add('emi.grindless.info.xenobiochem_plant.0', "La planta de xenobioquímica. Circuito 1: radioprotector. 2: pigmento infrarrojo. 3: andamios de quitosano a partir de hongos xeno. 4: lisado clarificado a partir de biomasa xeno.")
    add('emi.grindless.info.xenobiochem_plant.1', "Solo funciona en Próxima b.")

    add('emi.grindless.info.xenobotany_greenhouse.0', "El invernadero de xenobotánica cultiva una cepa xeno caracterizada con agua y CO2. Circuito 1: biomasa xeno y oxígeno. Circuito 2: hongos xeno. Circuito 3: pigmento de rojo lejano a partir de biomasa.")
    add('emi.grindless.info.xenobotany_greenhouse.1', "Es hermético y solo funciona en Próxima b.")

    add('emi.grindless.info.xenoflora_rover_bay.0', "La bahía del rover de xenoflora envía un rover a Próxima con los datos de aproximación y devuelve 4 muestras de flora, el estudio de regolito y una microfuente de americio.")
    add('emi.grindless.info.xenoflora_rover_bay.1', "Solo funciona en Próxima b. Las muestras van a la instalación de recepción de muestras.")

    add('emi.grindless.info.zblan_draw_tower.0', "La torre de estirado de ZBLAN. Circuito 1: preforma de vidrio con tetrafluoruro de circonio, bario, lantano y otros fluoruros. Circuito 2: estira 8 fibras de ZBLAN a partir de una preforma.")
    add('emi.grindless.info.zblan_draw_tower.1', "Solo funciona en la órbita de la Tierra.")

    add('emi.grindless.info.uhv_parallel_hatch.0', "La escotilla de control paralelo hiper deja que una máquina que acepta escotillas paralelas ejecute hasta 1024 copias de una receta a la vez, cada una con su EU/t.")
})
