// priority: 4538
// Gregtech Grindless - EMI information pages of the UHV era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, its circuit modes, what it needs. Their recipes show in EMI under the controller itself.
// Every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.baseline_astrometer.0', "The Baseline Astrometer turns SiC mirror blanks, ZBLAN fibre, quantum cascade lasers, thin-film modulators, infrared pigment, the Sagittarius A* image and an organoid processor into the stellar neighbourhood chart. It only works in Proxima b orbit.")
    add('emi.grindless.info.baseline_astrometer.1', "The chart is what the warp gate and the relays navigate by.")
    add('emi.grindless.info.baseline_astrometer.2', 'Two views of the same stars, a long way apart, give their distances. Sgr A*\'s image is the reference; silicon carbide mirrors, ZBLAN fibre, quantum cascade lasers and thin-film modulators make the instrument, and an infrared pigment coats the optics.')
    add('emi.grindless.info.baseline_astrometer.3', 'Proxima b\'s orbit only: the baseline is the trip. The image and the organoid processor are kept; the pigment is used up. The only source of the stellar neighbourhood chart, which is the research of the UEV machine casing.')
    add('emi.grindless.info.baseline_astrometer.4', 'A 7x5x7 station truss deck and roof on four stainless steel frame posts round a tungstensteel gearbox dish drive; 1-2 input buses, an output bus and 1-2 energy hatches in the deck.')

    add('emi.grindless.info.betavoltaic_fab.0', "The Betavoltaic Fab makes nuclear batteries. Circuit 1: nickel-63 plating liquor from targets and nitric acid. Circuit 2: 8 betavoltaic cells from diamond diodes and the liquor. Circuit 3: strips the depleted bath into nickel dust and nitric acid.")
    add('emi.grindless.info.betavoltaic_fab.1', "It refuses to void: the depleted bath is always recovered.")
    add('emi.grindless.info.betavoltaic_fab.2', 'A shielded plating line: nickel-63 is dissolved and plated onto diamond diodes, which turn its beta decay into a trickle of current for decades.')
    add('emi.grindless.info.betavoltaic_fab.3', 'Circuit 1: nickel-63 targets in nitric acid to plating liquor. 2: the liquor and eight diamond diodes to eight cells. 3: the spent bath stripped back to nitric acid and nickel.')
    add('emi.grindless.info.betavoltaic_fab.4', 'Parts in the bottom layer: 1-2 energy hatches, 1-2 input buses, an input hatch, an output bus, an output hatch.')

    add('emi.grindless.info.biomining_heap.0', "The Biomining Heap leaches regolith with bacteria. Circuit 1: platinum-group metals (Chromobacterium). Circuit 2: rare earths (Sphingomonas). Circuit 3: biocement from cold-trap regolith (Sporosarcina). Circuit 4: biocement from lunar regolith.")
    add('emi.grindless.info.biomining_heap.1', "Circuits 1 to 3 only work on Proxima b. The leached tailings are a byproduct.")
    add('emi.grindless.info.biomining_heap.2', 'A lined heap irrigated from above, where bacteria do the mining: Chromobacterium leaches the platinum metals with its own cyanide (broken down again in the heap), Sphingomonas the rare earths, and Sporosarcina sets the regolith into stone.')
    add('emi.grindless.info.biomining_heap.3', 'Proxima b only; the culture is kept. Circuit 1: PGM liquor. 2: REE liquor. 3: biocemented regolith. 4: biocement from lunar regolith (half the yield, for the first pad). The only source of both liquors.')
    add('emi.grindless.info.biomining_heap.4', 'Parts go in the liner (the bottom layer): 1-2 energy hatches, 1-2 input buses, an input hatch, 1-2 output buses, an output hatch. An inert casing berm; PTFE pipe drip lines across the top.')

    add('emi.grindless.info.cold_trap_drill.0', "The Cold Trap Drill digs the permanent shadow of Proxima b with a coring head, the regolith survey and a californium-252 source. It gives a Proxima ice core and 16 cold-trap regolith.")
    add('emi.grindless.info.cold_trap_drill.1', "It only works on the night side of Proxima b.")
    add('emi.grindless.info.cold_trap_drill.2', 'A tidally locked world freezes its water on the night side. A californium-252 source logs the buried ice by its neutrons, the regolith survey says where to bite, and a coring head brings up an ice core and cold-trap regolith.')
    add('emi.grindless.info.cold_trap_drill.3', 'Proxima b\'s night side only (the far-side biome). The survey and the source are kept; the coring head wears out one run in 32. The only source of ice cores and cold-trap regolith.')
    add('emi.grindless.info.cold_trap_drill.4', 'Parts go in the pad (the bottom layer, Proxima base casing): 1-2 energy hatches, 1-2 input buses, 1-2 output buses. Four naquadah alloy frame legs, a tungstensteel pipe drill string, a tungstensteel gearbox top drive.')

    add('emi.grindless.info.crystal_growth_furnace.0', "The Crystal Growth Furnace grows single crystals. Circuit 1: LiNbO3. 2: VUV CaF2. 3: Th:CaF2. 4: Eu:YSO. 5: InP. 6: TGG. 7: KTP. 8: Eu-151:YSO. 9: Er:YSO.")
    add('emi.grindless.info.crystal_growth_furnace.1', "It needs an iridium crucible that wears out and comes back as a worn crucible. It refuses to void.")
    add('emi.grindless.info.crystal_growth_furnace.2', 'Oxide, fluoride and III-V single crystals, which GTM cannot grow: Czochralski in an iridium crucible (LiNbO3, Eu:YSO), vertical gradient freeze (CaF2, Th:CaF2) and liquid-encapsulated Czochralski (InP), under argon.')
    add('emi.grindless.info.crystal_growth_furnace.3', 'One circuit per boule: 1 LiNbO3, 2 VUV CaF2, 3 Th:CaF2, 4 Eu:YSO, 5 InP. The argon, the lead fluoride scavenger and the boron oxide cap are never used up. The iridium crucible wears out in 1 run in 32; the worn one goes back to iridium in the platinum plant (circuit 5).')
    add('emi.grindless.info.crystal_growth_furnace.4', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output buses. Accepts a parallel hatch.')

    add('emi.grindless.info.high_flux_reactor.0', "The High Flux Reactor irradiates targets with 6 HFIR driver elements and distilled water. Circuit 1: transcurium target. 2: nickel-62 targets into nickel-63. 3: californium-252 source. 4: plutonium target.")
    add('emi.grindless.info.high_flux_reactor.1', "It is not a generator. Spent driver elements and radioactive waste come out; it refuses to void.")
    add('emi.grindless.info.high_flux_reactor.2', 'ORNL\'s HFIR: a flux trap in a light-water pool, ringed by uranium-233 driver elements and a beryllium reflector. Curium and americium targets breed berkelium-249 and californium-252; nickel-62 breeds nickel-63.')
    add('emi.grindless.info.high_flux_reactor.3', 'Circuit 1: a transcurium target. 2: four nickel-62 targets. 3: californium-252 sealed as a neutron source. A cycle burns 6 driver elements; the spent ones go back to the pyroprocessing cell. The pool water is a charge that is never used up.')
    add('emi.grindless.info.high_flux_reactor.4', 'It uses energy; its heat is rejected, not sold. Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, an input hatch, 1-2 output buses.')

    add('emi.grindless.info.mbe_reactor.0', "The MBE Reactor grows layers atom by atom. Circuit 1: QCL superlattice wafer. 2: 8 quantum cascade lasers. 3: InAs quantum dots. 4: Ni-58/Ti multilayer. 5: La/B4C multilayer. 6: phosphorus overgrowth. 7: ThF4 film. 8: niobium trilayer.")
    add('emi.grindless.info.mbe_reactor.1', "Most circuits use liquid nitrogen, which comes back as gas. It refuses to void.")
    add('emi.grindless.info.mbe_reactor.2', 'Molecular beam epitaxy (Faist et al., Bell Labs, 1994): hundreds of InGaAs/AlInAs layers a few atoms thick on indium phosphide, the quantum cascade lasers of the mid-infrared. Effusion cells fire into ultra-high vacuum past a liquid-nitrogen cryoshroud.')
    add('emi.grindless.info.mbe_reactor.3', 'Circuit 1: the superlattice wafer; half the runs scrape an arsenic dust off the cryoshroud. 2: eight quantum cascade lasers from one wafer and gold contacts.')
    add('emi.grindless.info.mbe_reactor.4', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, an input hatch, an output bus, an output hatch. Accepts a parallel hatch.')

    add('emi.grindless.info.nuclear_clock_lab.0', "The Nuclear Clock Lab. Circuit 1: VUV frequency comb from a fibre laser module, VUV CaF2 optics and xenon. Circuit 2: the nuclear clock from a Th:CaF2 crystal and the comb. Circuit 3: the chip-scale nuclear clock from a capped ThF4 film.")
    add('emi.grindless.info.nuclear_clock_lab.1', "Circuits 2 and 3 also need a UHV circuit. The clock is needed to open the warp gate.")
    add('emi.grindless.info.nuclear_clock_lab.2', 'JILA\'s 2024 nuclear clock: a VUV frequency comb locked to the 8.4 eV isomer of thorium-229 in a Th:CaF2 crystal, the only nuclear transition a laser can reach. A vibration-isolated clean room round a vacuum chamber on an optical table.')
    add('emi.grindless.info.nuclear_clock_lab.3', 'Circuit 1: a VUV comb from a fibre laser and two CaF2 optics; the xenon is a charge that is never used up. 2: the nuclear clock, made nowhere else.')
    add('emi.grindless.info.nuclear_clock_lab.4', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, an input hatch, an output bus. Accepts a parallel hatch.')

    add('emi.grindless.info.organoid_array.0', "The Organoid Array grows computing tissue. Circuit 1: organoid processor from 4 stem cells, chitosan scaffold, ultrapure water and sterile growth medium. Circuit 2: wetware mainframe, wired from 4 organoids and 4 neural processing units with a SiC power module and an optical assembly.")
    add('emi.grindless.info.organoid_array.1', "It only works on Earth. It refuses to void fluids: the spent medium goes to the LuV biofoundry.")
    add('emi.grindless.info.organoid_array.2', 'Cortical Labs\' CL1 and FinalSpark\'s Neuroplatform at scale: human cortical organoids grown on microelectrode arrays and wired into GregTech\'s wetware mainframe. Earth only.')
    add('emi.grindless.info.organoid_array.3', 'Circuit 1: 4 stem cells on a chitosan scaffold, with ultrapure water and sterilised growth medium, grow an organoid processor. 2: 4 organoid processors, 4 neuro processing units, a SiC power module and an optical assembly make 4 wetware mainframes.')
    add('emi.grindless.info.organoid_array.4', 'The sterilised medium comes from the LuV organoid lab (circuit 3, a xeno radioprotectant; give the lab an output hatch). The spent medium leaves as bacterial sludge for the biofoundry\'s mutagen.')
    add('emi.grindless.info.organoid_array.5', 'A 7x5x7 plascrete clean room with perfusion racks and a sterilizing filter ceiling. Parts go in the floor: 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output buses, 1-2 output hatches.')

    add('emi.grindless.info.pbo_plant.0', "The PBO Plant makes PBO fibre. Circuit 1: nitrate. 2: hydrolyse. 3: reduce. 4: polymerise into PBO dope. 5: spin into fibre.")
    add('emi.grindless.info.pbo_plant.1', "The fibre goes into tethers and space elevator cables.")

    add('emi.grindless.info.photonic_foundry.0', "The Photonic Foundry makes photonic chips. Circuit 1: LNOI. 2: PCM dies. 3: quantum memory chips. 4: optical processor. 5: optical assembly. 6: thin-film modulators. Circuits 7 to 16 make waveguides, transceivers, interposers, crossbars and other photonic parts.")
    add('emi.grindless.info.photonic_foundry.1', "Every recipe uses 1000 mB of ultrapure water, which comes back as water.")
    add('emi.grindless.info.photonic_foundry.2', 'Thin-film lithium niobate on insulator (HyperLight, Harvard), phase-change GST weights (IBM) and europium-doped YSO memory (ANU, 2015) in one clean room: a wafer bonder and a sputter chamber under filters. The only maker of the optical processor and the optical assembly.')
    add('emi.grindless.info.photonic_foundry.3', 'Circuit 1: LNOI by smart-cut. 2: PCM dies. 3: quantum memory chips. 4: optical processors. 5: optical assemblies. 6: thin-film modulators. Every recipe rinses with 1,000 mB of ultrapure water, which comes back as water.')
    add('emi.grindless.info.photonic_foundry.4', 'Parts go in the bottom layer: 1-2 energy hatches, 1-3 input buses, 1-3 input hatches, 1-2 output buses, an output hatch. Accepts a parallel hatch.')

    add('emi.grindless.info.positron_accumulator.0', "The Positron Accumulator. Circuit 1: moderated source from a sodium-22 target and high-purity neon. Circuit 2: accumulates positrons into a cartridge. Circuit 3: strips a spent source. Circuit 4: cools a pair-plasma bunch.")
    add('emi.grindless.info.positron_accumulator.1', "It refuses to void. The positron cartridge is its main product.")
    add('emi.grindless.info.positron_accumulator.2', 'Sodium-22 emits positrons; a film of solid neon slows them and a Surko buffer-gas trap stacks them by the billion into a Penning trap (CERN\'s ALPHA and AEgIS). The only maker of positron cartridges.')
    add('emi.grindless.info.positron_accumulator.3', 'Circuit 1: moderated source (sodium-22 target under 99.999 % neon). 2: fill an empty Penning trap; the nitrogen buffer gas stays, the source wears out 1 run in 16. 3: strip a spent source: the neon back, the sodium-22 as radioactive waste.')
    add('emi.grindless.info.positron_accumulator.4', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, an input hatch, 1-2 output buses, an output hatch. Never voids its outputs. Accepts a parallel hatch.')

    add('emi.grindless.info.quantum_fabricator.0', "The Quantum Fabricator runs assembler, circuit assembler, forming press, laser engraver and cutter recipes. It has a mode tab, accepts a parallel hatch up to 1024 copies, overclocks perfectly and has batch mode.")
    add('emi.grindless.info.quantum_fabricator.1', "It needs a fluid input hatch and stands inside a formed cleanroom.")
    add('emi.grindless.info.quantum_fabricator.2', 'A UHV casing hall that runs the assembler, circuit assembler, forming press, laser engraver and cutter: up to 1,024 recipes at once, 1,024 times the parallel hatch\'s figure with one (UV hatch: 262,144; UHV hatch: 1,048,576). Choose the machine in the controller\'s machine mode tab: one mode at a time, with the single blocks\' own recipes.')
    add('emi.grindless.info.quantum_fabricator.3', 'Each copy pays its full EU/t, so the energy hatches set how many run: floor(hatch voltage / recipe EU/t), up to the ceiling. Spare voltage overclocks perfectly (every step is twice as fast for four times the power per copy, so the energy per item does not change) and batch mode is on. No energy discount: it saves machines and buses, and time, not power.')
    add('emi.grindless.info.quantum_fabricator.4', 'Circuit assembler recipes that need a cleanroom still do (the sterile one where a recipe says so): the fabricator must stand inside a formed cleanroom. It is 11 wide, 10 high and 12 deep, so it fits the largest cleanroom (13 x 13 x 13 inside); leave one block between its front and the cleanroom wall.')
    add('emi.grindless.info.quantum_fabricator.5', 'Needs, in any casing cell: 1 maintenance hatch, 1 to 2 energy hatches, 2 to 6 input buses, 1 to 4 output buses, 1 to 4 input hatches (the circuit assembler adds molten tin) and optionally 1 parallel hatch. A ring of field ring casings round the walls, laminated glass above it in the side walls, an empty hall inside.')

    add('emi.grindless.info.radiotrophic_vat.0', "The Radiotrophic Vat grows melanised biomass from 4 xeno biomass, a Cladosporium culture and water. It gives 8 melanised biomass and some biomass back.")
    add('emi.grindless.info.radiotrophic_vat.1', "It only works on Proxima b.")
    add('emi.grindless.info.radiotrophic_vat.2', 'Cladosporium sphaerospermum, the fungus that grew towards Chernobyl\'s reactor and shielded a sensor on the ISS, fed by the flares through a glass window.')
    add('emi.grindless.info.radiotrophic_vat.3', 'Proxima b only. The culture is kept; xeno biomass and water become melanised biomass, the shielding of line 15. The spent medium is biomass for the biorefinery.')
    add('emi.grindless.info.radiotrophic_vat.4', 'Parts go in the bottom layer: 1-2 energy hatches, an input bus, an input hatch, an output bus, an output hatch. A tungstensteel core.')

    add('emi.grindless.info.regolith_excavator.0', "The Regolith Excavator digs 64 Mercury regolith from a bucket drum and an iridosmine vein sample. The sample is not used up.")
    add('emi.grindless.info.regolith_excavator.1', "It only works on the ground of Mercury.")

    add('emi.grindless.info.sample_receiving_facility.0', "The Sample Receiving Facility handles Proxima samples. Circuit 1: sterilises a flora sample with hydrogen peroxide into an extract and genome data. Circuit 2: isolates a characterised xeno strain. Circuit 3: extracts sterile organics from an ice core.")
    add('emi.grindless.info.sample_receiving_facility.1', "It only works on Earth. The strains feed the xenobotany greenhouse.")
    add('emi.grindless.info.sample_receiving_facility.2', 'The Mars Sample Return receiving facility, built for Proxima: a BSL-4 hall behind two airlocks, where an alien sample is opened, sterilised and read before anything leaves.')
    add('emi.grindless.info.sample_receiving_facility.3', 'Earth only, and the only machine that takes the samples. Circuit 1: sterilised extract and genome data. 2: a characterised strain. 3: the organics of a Proxima ice core.')
    add('emi.grindless.info.sample_receiving_facility.4', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, an input hatch (hydrogen peroxide vapour), 1-2 output buses. The incinerator is heatproof casing.')

    add('emi.grindless.info.sic_device_fab.0', "The SiC Device Fab. Circuit 1: SiC boule. 2: epi wafer. 3: anneal. 4: four power modules. 5: SiC mirror blank.")
    add('emi.grindless.info.sic_device_fab.1', "The power modules go into solar arrays, probes and tethers.")
    add('emi.grindless.info.sic_device_fab.2', 'Silicon carbide switches kilovolts at 200 °C (Cree/Wolfspeed): a boule grown by physical vapour transport at 2,500 °C, an epitaxial drift layer, the ion implanter\'s aluminium and a 1,700 °C anneal. The only maker of SiC power modules and SiC mirror blanks.')
    add('emi.grindless.info.sic_device_fab.3', 'Circuit 1: boule. 2: epi wafer (the hydrogen comes back). 3: anneal of the implanted wafer under argon. 4: four power modules. 5: a reaction-bonded mirror blank. Cut the boule into wafers in a cutter.')
    add('emi.grindless.info.sic_device_fab.4', 'Parts go in the bottom layer: 1-2 energy hatches, 1-3 input buses, 1-3 input hatches, an output bus, an output hatch. Accepts a parallel hatch.')

    add('emi.grindless.info.solar_array_fab.0', "The Solar Array Fab. Circuit 1: IMM lift-off into film. 2: IMM solar array. 3: red-tuned solar array.")
    add('emi.grindless.info.solar_array_fab.1', "The lift-off returns the gallium arsenide substrate wafers.")
    add('emi.grindless.info.solar_array_fab.2', 'Inverted metamorphic multijunction cells (NREL): GaInP, GaAs and InGaAs grown upside down, 33 % efficient in sunlight above the air, lifted off their substrate and laminated under cerium-doped coverglass (Rocket Lab/SolAero).')
    add('emi.grindless.info.solar_array_fab.3', 'Circuit 1: lift-off of eight IMM wafers: eight films, seven GaAs substrates back, the worn one as gallium arsenide dust, a little arsine for the MOCVD reactor. 2: the IMM solar array. 3: the red-tuned array.')
    add('emi.grindless.info.solar_array_fab.4', 'Parts go in the bottom layer: 1-2 energy hatches, 1-3 input buses, an input hatch, 1-3 output buses, an output hatch. Accepts a parallel hatch.')

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
    add('emi.grindless.info.transuranium_facility.2', 'ORNL\'s REDC: a shielded cave with a glovebox train, HDEHP extraction and ion-exchange columns. Berkelium-249 and californium-252 are made only here.')
    add('emi.grindless.info.transuranium_facility.3', 'Circuit 1: dissolve. 2: separate (the solvent comes back less 1 %). 3: decay store, thorium-229 milked from aged uranium-233, never overclocked. 4: the curium back into a new target. 5: the fission products evaporated to waste. 6: the spent solvent burned to phosphoric acid.')
    add('emi.grindless.info.transuranium_facility.4', 'The nitric acid comes back; the waste goes to the waste retrieval plant. Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output buses, 1-3 output hatches.')

    add('emi.grindless.info.ultrapure_water_plant.0', "The Ultrapure Water Plant turns 8000 mB of water, sodium hydroxide, ion-exchange resin and hydrochloric acid into 6000 mB of ultrapure water.")
    add('emi.grindless.info.ultrapure_water_plant.1', "The reverse-osmosis concentrate can be voided. It takes one parallel hatch.")
    add('emi.grindless.info.ultrapure_water_plant.2', 'A semiconductor fab\'s water train: PTFE pipe racks, reverse osmosis filters and an ion exchange bed. Plain water goes in; water for the UHV processes comes out.')
    add('emi.grindless.info.ultrapure_water_plant.3', 'The resin is kept; hydrochloric acid and sodium hydroxide regenerate it. The reverse osmosis concentrate leaves as salt water. It is the only source of ultrapure water.')
    add('emi.grindless.info.ultrapure_water_plant.4', 'Parts in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output hatches, and one parallel hatch if you want.')

    add('emi.grindless.info.warp_gate.0', "The Warp Gate. Circuit 1: opens the gate and makes the Proxima gate seed from exotic matter cells, antihydrogen, approach data, a nuclear clock and an organoid processor. Circuit 2: holds the gate open for a minute with an exotic matter cell. Circuits 3 to 6 hold it with other catalysts.")
    add('emi.grindless.info.warp_gate.1', "Players inside the ring are carried; items travel by AE2. It is built at Earth orbit and at Proxima b orbit.")
    add('emi.grindless.info.warp_gate.2', 'A ring of casing built at both ends, in Earth orbit and in Proxima b\'s orbit. Open it with exotic matter cells and antihydrogen cartridges (circuit 1): the shells go back to UV\'s antimatter trap and a Proxima gate seed comes out.')
    add('emi.grindless.info.warp_gate.3', 'Circuit 2 holds it open for a minute (one exotic matter cell, 16 A UHV). While both ends hold, a player standing inside one ring is carried to the centre of the other. Items do not cross: they go by AE2.')
    add('emi.grindless.info.warp_gate.4', 'A 15x15x3 ring of warp gate casing round open air; the controller on the front face, six UHV casing mounts on the top row for the modulators, 1-2 input buses, 1-2 output buses and 1-4 energy hatches in the bottom row. Earth and Proxima b orbits only.')

    add('emi.grindless.info.xenobiochem_plant.0', "The Xenobiochemistry Plant. Circuit 1: radioprotectant. 2: infrared pigment. 3: chitosan scaffolds from xeno mushrooms. 4: clarified lysate from xeno biomass.")
    add('emi.grindless.info.xenobiochem_plant.1', "It only works on Proxima b.")
    add('emi.grindless.info.xenobiochem_plant.2', 'Where the life grows, its chemistry is done: a lysate clarified in ultrapure water, a Dsup-like radioprotectant, an infrared pigment and chitosan from the mushrooms.')
    add('emi.grindless.info.xenobiochem_plant.3', 'Proxima b only. Circuit 1: radioprotectant. 2: infrared pigment. 3: chitosan scaffold (the salt water goes to the electrolyser). 4: clarified lysate.')
    add('emi.grindless.info.xenobiochem_plant.4', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, 1-2 output buses, 1-2 output hatches. Four PTFE columns round a clean reactor.')

    add('emi.grindless.info.xenobotany_greenhouse.0', "The Xenobotany Greenhouse grows a characterised xeno strain with water and CO2. Circuit 1: xeno biomass and oxygen. Circuit 2: xeno mushrooms. Circuit 3: far-red pigment from biomass.")
    add('emi.grindless.info.xenobotany_greenhouse.1', "It is sealed and only works on Proxima b.")
    add('emi.grindless.info.xenobotany_greenhouse.2', 'Sealed glass at the terminator: Proxima\'s life grows under a red dwarf, its pigments reaching into the far red. There is no air to breathe outside.')
    add('emi.grindless.info.xenobotany_greenhouse.3', 'Proxima b only. Circuit 1: xeno biomass and oxygen. 2: xeno mushrooms. 3: far-red pigment pressed from the biomass. The strain is kept.')
    add('emi.grindless.info.xenobotany_greenhouse.4', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 input hatches, an output bus, 1-2 output hatches. A soil bed and GT lamps inside.')

    add('emi.grindless.info.xenoflora_rover_bay.0', "The Xenoflora Rover Bay sends a Proxima rover with the approach data and returns 4 flora samples, the regolith survey and an americium micro source.")
    add('emi.grindless.info.xenoflora_rover_bay.1', "It only works on Proxima b. The samples go to the Sample Receiving Facility.")
    add('emi.grindless.info.xenoflora_rover_bay.2', 'A hangar on Proxima b: rovers on an americium heat source and betavoltaic cells (the night side has no sun) drive out to the terminator and bring back flora samples and a regolith survey.')
    add('emi.grindless.info.xenoflora_rover_bay.3', 'Proxima b only. The approach data is kept; a rover wears out one run in eight and its americium source comes back as often. The only source of flora samples.')
    add('emi.grindless.info.xenoflora_rover_bay.4', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses. The console is computer casing.')

    add('emi.grindless.info.zblan_draw_tower.0', "The ZBLAN Draw Tower. Circuit 1: glass preform from zirconium tetrafluoride, barium, lanthanum and other fluorides. Circuit 2: draws 8 ZBLAN fibres from a preform.")
    add('emi.grindless.info.zblan_draw_tower.1', "It only works in Earth orbit.")

    add('emi.grindless.info.uhv_parallel_hatch.0', "The Hyper Parallel Control Hatch lets a machine that takes parallel hatches run up to 1024 copies of a recipe at once, each at its own EU/t.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.baseline_astrometer.0', "El astrómetro de línea base convierte espejos de SiC, fibra ZBLAN, láseres de cascada cuántica, moduladores de película fina, pigmento infrarrojo, la imagen de Sagitario A* y un procesador de organoides en la carta del vecindario estelar. Solo funciona en la órbita de Próxima b.")
    add('emi.grindless.info.baseline_astrometer.1', "La carta es con lo que navegan la puerta de salto y los relés.")
    add('emi.grindless.info.baseline_astrometer.2', 'Dos vistas de las mismas estrellas, muy separadas, dan sus distancias. La imagen de Sgr A* es la referencia; espejos de carburo de silicio, fibra ZBLAN, láseres de cascada cuántica y moduladores de película fina forman el instrumento, y un pigmento infrarrojo recubre la óptica.')
    add('emi.grindless.info.baseline_astrometer.3', 'Solo en la órbita de Próxima b: la línea base es el viaje. La imagen y el procesador de organoides se conservan; el pigmento se gasta. La única fuente del mapa del vecindario estelar, que es la investigación de la carcasa de máquina UEV.')
    add('emi.grindless.info.baseline_astrometer.4', 'Una cubierta y un techo de armazón de estación de 7x5x7 sobre cuatro postes de bastidor de acero inoxidable alrededor de un accionamiento de plato de caja de engranajes de acero de tungsteno; 1-2 buses de entrada, un bus de salida y 1-2 escotillas de energía en la cubierta.')

    add('emi.grindless.info.betavoltaic_fab.0', "La fábrica betavoltaica hace baterías nucleares. Circuito 1: licor de chapado de níquel-63 a partir de blancos y ácido nítrico. Circuito 2: 8 celdas betavoltaicas con diodos de diamante y el licor. Circuito 3: recupera el baño agotado en polvo de níquel y ácido nítrico.")
    add('emi.grindless.info.betavoltaic_fab.1', "No elimina residuos: el baño agotado siempre se recupera.")
    add('emi.grindless.info.betavoltaic_fab.2', 'Una línea de chapado blindada: el níquel-63 se disuelve y se deposita sobre diodos de diamante, que convierten su desintegración beta en un hilo de corriente durante décadas.')
    add('emi.grindless.info.betavoltaic_fab.3', 'Circuito 1: blancos de níquel-63 en ácido nítrico a licor de chapado. 2: el licor y ocho diodos de diamante a ocho celdas. 3: el baño gastado se recupera como ácido nítrico y níquel.')
    add('emi.grindless.info.betavoltaic_fab.4', 'Partes en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, una escotilla de entrada, un bus de salida, una escotilla de salida.')

    add('emi.grindless.info.biomining_heap.0', "El montón de biominería lixivia regolito con bacterias. Circuito 1: metales del grupo del platino (Chromobacterium). Circuito 2: tierras raras (Sphingomonas). Circuito 3: biocemento con regolito de trampa fría (Sporosarcina). Circuito 4: biocemento con regolito lunar.")
    add('emi.grindless.info.biomining_heap.1', "Los circuitos 1 a 3 solo funcionan en Próxima b. Los residuos lixiviados son un subproducto.")
    add('emi.grindless.info.biomining_heap.2', 'Una pila impermeabilizada y regada desde arriba, donde las bacterias hacen la minería: Chromobacterium lixivia los metales del platino con su propio cianuro (que se degrada en la pila), Sphingomonas las tierras raras y Sporosarcina convierte el regolito en piedra.')
    add('emi.grindless.info.biomining_heap.3', 'Solo en Próxima b; el cultivo se conserva. Circuito 1: licor de MGP. 2: licor de TR. 3: regolito biocementado. 4: biocemento de regolito lunar (la mitad, para la primera plataforma). La única fuente de ambos licores.')
    add('emi.grindless.info.biomining_heap.4', 'Las piezas van en el revestimiento (la capa inferior): 1-2 escotillas de energía, 1-2 buses de entrada, una escotilla de entrada, 1-2 buses de salida, una escotilla de salida. Un muro de carcasa inerte; líneas de goteo de tubería de PTFE por encima.')

    add('emi.grindless.info.cold_trap_drill.0', "El taladro de trampa fría excava la sombra permanente de Próxima b con una cabeza de testigo, el estudio de regolito y una fuente de californio-252. Da un testigo de hielo de Próxima y 16 de regolito de trampa fría.")
    add('emi.grindless.info.cold_trap_drill.1', "Solo funciona en el lado nocturno de Próxima b.")
    add('emi.grindless.info.cold_trap_drill.2', 'Un mundo en rotación síncrona congela su agua en la cara nocturna. Una fuente de californio-252 detecta el hielo enterrado por sus neutrones, el estudio del regolito indica dónde morder y un cabezal saca un núcleo de hielo y regolito de trampa fría.')
    add('emi.grindless.info.cold_trap_drill.3', 'Solo en la cara nocturna de Próxima b (el bioma de la cara opuesta). El estudio y la fuente se conservan; el cabezal se desgasta una perforación de cada 32. La única fuente de núcleos de hielo y de regolito de trampa fría.')
    add('emi.grindless.info.cold_trap_drill.4', 'Las piezas van en la plataforma (la capa inferior, carcasa de base de Próxima): 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida. Cuatro patas de bastidor de aleación de naquadah, una sarta de tubería de acero de tungsteno y un cabezal motor de caja de engranajes de acero de tungsteno.')

    add('emi.grindless.info.crystal_growth_furnace.0', "El horno de crecimiento de cristales hace crecer monocristales. Circuito 1: LiNbO3. 2: CaF2 VUV. 3: Th:CaF2. 4: Eu:YSO. 5: InP. 6: TGG. 7: KTP. 8: Eu-151:YSO. 9: Er:YSO.")
    add('emi.grindless.info.crystal_growth_furnace.1', "Necesita un crisol de iridio que se desgasta y vuelve como crisol gastado. No elimina residuos.")
    add('emi.grindless.info.crystal_growth_furnace.2', 'Monocristales de óxidos, fluoruros y III-V, que GTM no sabe crecer: Czochralski en un crisol de iridio (LiNbO3, Eu:YSO), congelación por gradiente vertical (CaF2, Th:CaF2) y Czochralski encapsulado en líquido (InP), bajo argón.')
    add('emi.grindless.info.crystal_growth_furnace.3', 'Un circuito por lingote: 1 LiNbO3, 2 CaF2 VUV, 3 Th:CaF2, 4 Eu:YSO, 5 InP. El argón, el captador de fluoruro de plomo y la capa de óxido de boro nunca se gastan. El crisol de iridio se desgasta en 1 de cada 32 ciclos; el gastado vuelve a iridio en la planta de platino (circuito 5).')
    add('emi.grindless.info.crystal_growth_furnace.4', 'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 escotillas de entrada, 1-2 buses de salida. Acepta una escotilla de paralelos.')

    add('emi.grindless.info.high_flux_reactor.0', "El reactor de alto flujo irradia blancos con 6 elementos impulsores HFIR y agua destilada. Circuito 1: blanco de transcurio. 2: blancos de níquel-62 a níquel-63. 3: fuente de californio-252. 4: blanco de plutonio.")
    add('emi.grindless.info.high_flux_reactor.1', "No es un generador. Salen elementos impulsores gastados y residuos radiactivos; no elimina residuos.")
    add('emi.grindless.info.high_flux_reactor.2', 'El HFIR de ORNL: una trampa de flujo en una piscina de agua ligera, rodeada de elementos impulsores de uranio-233 y un reflector de berilio. Los blancos de curio y americio crían berkelio-249 y californio-252; el níquel-62 cría níquel-63.')
    add('emi.grindless.info.high_flux_reactor.3', 'Circuito 1: un blanco de transcurio. 2: cuatro blancos de níquel-62. 3: californio-252 sellado como fuente de neutrones. Un ciclo quema 6 elementos impulsores; los gastados vuelven a la celda de pirorrefinado. El agua de la piscina es una carga que nunca se gasta.')
    add('emi.grindless.info.high_flux_reactor.4', 'Consume energía; su calor se disipa, no se vende. Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, una escotilla de entrada, 1-2 buses de salida.')

    add('emi.grindless.info.mbe_reactor.0', "El reactor MBE hace crecer capas átomo a átomo. Circuito 1: oblea de superred QCL. 2: 8 láseres de cascada cuántica. 3: puntos cuánticos de InAs. 4: multicapa de Ni-58/Ti. 5: multicapa de La/B4C. 6: sobrecrecimiento de fósforo. 7: película de ThF4. 8: tricapa de niobio.")
    add('emi.grindless.info.mbe_reactor.1', "La mayoría de circuitos usan nitrógeno líquido, que vuelve como gas. No elimina residuos.")
    add('emi.grindless.info.mbe_reactor.2', 'Epitaxia de haces moleculares (Faist et al., Bell Labs, 1994): cientos de capas de InGaAs/AlInAs de pocos átomos de espesor sobre fosfuro de indio, los láseres de cascada cuántica del infrarrojo medio. Las celdas de efusión disparan en ultra alto vacío junto a un criopanel de nitrógeno líquido.')
    add('emi.grindless.info.mbe_reactor.3', 'Circuito 1: la oblea de superred; la mitad de los ciclos raspan un polvo de arsénico del criopanel. 2: ocho láseres de cascada cuántica de una oblea y contactos de oro.')
    add('emi.grindless.info.mbe_reactor.4', 'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, una escotilla de entrada, un bus de salida, una escotilla de salida. Acepta una escotilla de paralelos.')

    add('emi.grindless.info.nuclear_clock_lab.0', "El laboratorio de reloj nuclear. Circuito 1: peine de frecuencias VUV con un módulo láser de fibra, ópticas de CaF2 VUV y xenón. Circuito 2: el reloj nuclear con un cristal de Th:CaF2 y el peine. Circuito 3: el reloj nuclear en chip con una película de ThF4 sellada.")
    add('emi.grindless.info.nuclear_clock_lab.1', "Los circuitos 2 y 3 necesitan además un circuito UHV. El reloj hace falta para abrir la puerta de salto.")
    add('emi.grindless.info.nuclear_clock_lab.2', 'El reloj nuclear de JILA de 2024: un peine de frecuencias VUV enganchado al isómero de 8,4 eV del torio-229 en un cristal de Th:CaF2, la única transición nuclear que alcanza un láser. Una sala limpia aislada de vibraciones alrededor de una cámara de vacío sobre una mesa óptica.')
    add('emi.grindless.info.nuclear_clock_lab.3', 'Circuito 1: un peine VUV a partir de un láser de fibra y dos ópticas de CaF2; el xenón es una carga que nunca se gasta. 2: el reloj nuclear, que no se fabrica en ningún otro sitio.')
    add('emi.grindless.info.nuclear_clock_lab.4', 'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, una escotilla de entrada, un bus de salida. Acepta una escotilla de paralelos.')

    add('emi.grindless.info.organoid_array.0', "La matriz de organoides hace crecer tejido de cómputo. Circuito 1: procesador de organoides con 4 células madre, andamio de quitosano, agua ultrapura y medio de crecimiento estéril. Circuito 2: mainframe de wetware, cableado con 4 organoides y 4 unidades de procesamiento neural, un módulo de potencia de SiC y un ensamblaje óptico.")
    add('emi.grindless.info.organoid_array.1', "Solo funciona en la Tierra. No elimina fluidos: el medio gastado va a la biofundición de LuV.")
    add('emi.grindless.info.organoid_array.2', 'El CL1 de Cortical Labs y la Neuroplatform de FinalSpark a escala: organoides corticales humanos cultivados sobre matrices de microelectrodos y cableados en el mainframe de wetware de GregTech. Solo en la Tierra.')
    add('emi.grindless.info.organoid_array.3', 'Circuito 1: 4 células madre sobre un andamio de quitosano, con agua ultrapura y medio de cultivo esterilizado, crecen un procesador de organoides. 2: 4 procesadores de organoides, 4 unidades de neuroprocesamiento, un módulo de potencia de SiC y un conjunto óptico hacen 4 mainframes de wetware.')
    add('emi.grindless.info.organoid_array.4', 'El medio esterilizado viene del laboratorio de organoides de LuV (circuito 3, un radioprotector xeno; dale al laboratorio una escotilla de salida). El medio gastado sale como lodo bacteriano para el mutágeno de la biofundición.')
    add('emi.grindless.info.organoid_array.5', 'Una sala limpia de plascreto de 7x5x7 con bastidores de perfusión y un techo de filtros esterilizantes. Las piezas van en el suelo: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 escotillas de entrada, 1-2 buses de salida, 1-2 escotillas de salida.')

    add('emi.grindless.info.pbo_plant.0', "La planta de PBO fabrica fibra de PBO. Circuito 1: nitrar. 2: hidrolizar. 3: reducir. 4: polimerizar en solución de PBO. 5: hilar en fibra.")
    add('emi.grindless.info.pbo_plant.1', "La fibra se usa en cables y en los cables del ascensor espacial.")

    add('emi.grindless.info.photonic_foundry.0', "La fundición fotónica fabrica chips fotónicos. Circuito 1: LNOI. 2: troqueles PCM. 3: chips de memoria cuántica. 4: procesador óptico. 5: ensamblaje óptico. 6: moduladores de película fina. Los circuitos 7 a 16 hacen guías de onda, transceptores, interpositores, matrices cruzadas y otras piezas fotónicas.")
    add('emi.grindless.info.photonic_foundry.1', "Cada receta usa 1000 mB de agua ultrapura, que vuelve como agua.")
    add('emi.grindless.info.photonic_foundry.2', 'Niobato de litio en capa fina sobre aislante (HyperLight, Harvard), pesos de cambio de fase GST (IBM) y memoria de YSO dopado con europio (ANU, 2015) en una sala limpia: una soldadora de obleas y una cámara de pulverización bajo filtros. El único fabricante del procesador óptico y del ensamblaje óptico.')
    add('emi.grindless.info.photonic_foundry.3', 'Circuito 1: LNOI por smart-cut. 2: chips PCM. 3: chips de memoria cuántica. 4: procesadores ópticos. 5: ensamblajes ópticos. 6: moduladores de capa fina. Cada receta enjuaga con 1.000 mB de agua ultrapura, que vuelve como agua.')
    add('emi.grindless.info.photonic_foundry.4', 'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-3 buses de entrada, 1-3 escotillas de entrada, 1-2 buses de salida, una escotilla de salida. Acepta una escotilla de paralelos.')

    add('emi.grindless.info.positron_accumulator.0', "El acumulador de positrones. Circuito 1: fuente moderada con un blanco de sodio-22 y neón de alta pureza. Circuito 2: acumula positrones en un cartucho. Circuito 3: recupera una fuente gastada. Circuito 4: enfría un paquete de plasma de pares.")
    add('emi.grindless.info.positron_accumulator.1', "No elimina residuos. El cartucho de positrones es su producto principal.")
    add('emi.grindless.info.positron_accumulator.2', 'El sodio-22 emite positrones; una película de neón sólido los frena y una trampa de gas amortiguador de Surko los apila por miles de millones en una trampa de Penning (ALPHA y AEgIS del CERN). El único fabricante de cartuchos de positrones.')
    add('emi.grindless.info.positron_accumulator.3', 'Circuito 1: fuente moderada (blanco de sodio-22 bajo neón al 99,999 %). 2: llena una trampa de Penning vacía; el nitrógeno amortiguador se queda, la fuente se gasta 1 vez de cada 16. 3: desmonta una fuente gastada: el neón vuelve, el sodio-22 sale como residuo radiactivo.')
    add('emi.grindless.info.positron_accumulator.4', 'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, una escotilla de entrada, 1-2 buses de salida, una escotilla de salida. Nunca destruye sus salidas. Acepta una escotilla paralela.')

    add('emi.grindless.info.quantum_fabricator.0', "El fabricador cuántico ejecuta recetas de ensambladora, ensambladora de circuitos, prensa de formas, grabador láser y cortadora. Tiene una pestaña de modo, acepta una escotilla paralela de hasta 1024 copias, hace sobrerrelojes perfectos y tiene modo por lotes.")
    add('emi.grindless.info.quantum_fabricator.1', "Necesita una escotilla de entrada de fluidos y se levanta dentro de una sala limpia formada.")
    add('emi.grindless.info.quantum_fabricator.2', 'Una nave de carcasas UHV que ejecuta el ensamblador, el ensamblador de circuitos, la prensa de formado, el grabador láser y el cortador: hasta 1.024 recetas a la vez, 1.024 veces la cifra de la escotilla de paralelos si la hay (escotilla UV: 262.144; escotilla UHV: 1.048.576). Elige la máquina en la pestaña de modo del controlador: un modo a la vez, con las recetas de las máquinas individuales.')
    add('emi.grindless.info.quantum_fabricator.3', 'Cada copia paga su EU/t completo, así que las escotillas de energía fijan cuántas corren: floor(voltaje de la escotilla / EU/t de la receta), hasta el techo. El voltaje sobrante sobrecarga a la perfección (cada paso es el doble de rápido por cuatro veces la potencia de cada copia, así que la energía por objeto no cambia) y el modo por lotes está activo. Sin descuento de energía: ahorra máquinas, buses y tiempo, no energía.')
    add('emi.grindless.info.quantum_fabricator.4', 'Las recetas del ensamblador de circuitos que piden sala blanca la siguen pidiendo (la estéril donde la receta lo diga): el fabricador debe estar dentro de una sala blanca formada. Mide 11 de ancho, 10 de alto y 12 de fondo, así que cabe en la mayor sala blanca (13 x 13 x 13 por dentro); deja un bloque entre su frente y la pared de la sala blanca.')
    add('emi.grindless.info.quantum_fabricator.5', 'Necesita, en cualquier celda de carcasa: 1 escotilla de mantenimiento, 1 a 2 escotillas de energía, 2 a 6 buses de entrada, 1 a 4 buses de salida, 1 a 4 escotillas de entrada (el ensamblador de circuitos añade estaño fundido) y opcionalmente 1 escotilla de paralelos. Un anillo de carcasas de anillo de campo alrededor de las paredes, cristal laminado encima en los lados y un salón vacío dentro.')

    add('emi.grindless.info.radiotrophic_vat.0', "La cuba radiotrófica hace crecer biomasa melanizada con 4 de biomasa xeno, un cultivo de Cladosporium y agua. Da 8 de biomasa melanizada y algo de biomasa de vuelta.")
    add('emi.grindless.info.radiotrophic_vat.1', "Solo funciona en Próxima b.")
    add('emi.grindless.info.radiotrophic_vat.2', 'Cladosporium sphaerospermum, el hongo que creció hacia el reactor de Chernóbil y blindó un sensor en la ISS, alimentado por las fulguraciones a través de una ventana de cristal.')
    add('emi.grindless.info.radiotrophic_vat.3', 'Solo en Próxima b. El cultivo se conserva; la biomasa xeno y el agua se vuelven biomasa melanizada, el blindaje de la línea 15. El medio gastado es biomasa para la biorrefinería.')
    add('emi.grindless.info.radiotrophic_vat.4', 'Las piezas van en la capa inferior: 1-2 escotillas de energía, un bus de entrada, una escotilla de entrada, un bus de salida, una escotilla de salida. Un núcleo de acero de tungsteno.')

    add('emi.grindless.info.regolith_excavator.0', "La excavadora de regolito saca 64 de regolito de Mercurio con un tambor de cangilones y una muestra de veta de iridosmio. La muestra no se consume.")
    add('emi.grindless.info.regolith_excavator.1', "Solo funciona en el suelo de Mercurio.")

    add('emi.grindless.info.sample_receiving_facility.0', "La instalación de recepción de muestras gestiona muestras de Próxima. Circuito 1: esteriliza una muestra de flora con peróxido de hidrógeno en un extracto y datos del genoma. Circuito 2: aísla una cepa xeno caracterizada. Circuito 3: extrae orgánicos estériles de un testigo de hielo.")
    add('emi.grindless.info.sample_receiving_facility.1', "Solo funciona en la Tierra. Las cepas alimentan el invernadero de xenobotánica.")
    add('emi.grindless.info.sample_receiving_facility.2', 'La instalación de recepción del retorno de muestras de Marte, construida para Próxima: una sala BSL-4 tras dos esclusas, donde una muestra alienígena se abre, se esteriliza y se lee antes de que nada salga.')
    add('emi.grindless.info.sample_receiving_facility.3', 'Solo en la Tierra, y la única máquina que acepta las muestras. Circuito 1: extracto esterilizado y datos genómicos. 2: una cepa caracterizada. 3: los orgánicos de un testigo de hielo de Próxima.')
    add('emi.grindless.info.sample_receiving_facility.4', 'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, una escotilla de entrada (vapor de peróxido de hidrógeno), 1-2 buses de salida. El incinerador es carcasa termorresistente.')

    add('emi.grindless.info.sic_device_fab.0', "La fábrica de dispositivos de SiC. Circuito 1: bola de SiC. 2: oblea epitaxial. 3: recocido. 4: cuatro módulos de potencia. 5: espejo en bruto de SiC.")
    add('emi.grindless.info.sic_device_fab.1', "Los módulos de potencia se usan en matrices solares, sondas y cables.")
    add('emi.grindless.info.sic_device_fab.2', 'El carburo de silicio conmuta kilovoltios a 200 °C (Cree/Wolfspeed): un lingote crecido por transporte físico de vapor a 2.500 °C, una capa de deriva epitaxial, el aluminio del implantador de iones y un recocido a 1.700 °C. El único fabricante de módulos de potencia de SiC y de bloques de espejo de SiC.')
    add('emi.grindless.info.sic_device_fab.3', 'Circuito 1: lingote. 2: oblea epitaxial (el hidrógeno vuelve). 3: recocido de la oblea implantada bajo argón. 4: cuatro módulos de potencia. 5: un bloque de espejo por unión reactiva. El lingote se corta en obleas en una cortadora.')
    add('emi.grindless.info.sic_device_fab.4', 'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-3 buses de entrada, 1-3 escotillas de entrada, un bus de salida, una escotilla de salida. Acepta una escotilla de paralelos.')

    add('emi.grindless.info.solar_array_fab.0', "La fábrica de matrices solares. Circuito 1: despegue IMM en película. 2: matriz solar IMM. 3: matriz solar sintonizada al rojo.")
    add('emi.grindless.info.solar_array_fab.1', "El despegue devuelve las obleas de sustrato de arseniuro de galio.")
    add('emi.grindless.info.solar_array_fab.2', 'Células multiunión metamórficas invertidas (NREL): GaInP, GaAs e InGaAs crecidos boca abajo, con un 33 % de eficiencia a la luz del sol sobre la atmósfera, despegadas de su sustrato y laminadas bajo vidrio de cubierta dopado con cerio (Rocket Lab/SolAero).')
    add('emi.grindless.info.solar_array_fab.3', 'Circuito 1: despegue de ocho obleas IMM: ocho películas, siete sustratos de GaAs de vuelta, el gastado como polvo de arseniuro de galio, un poco de arsina para el reactor MOCVD. 2: el panel solar IMM. 3: el panel ajustado al rojo.')
    add('emi.grindless.info.solar_array_fab.4', 'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-3 buses de entrada, una escotilla de entrada, 1-3 buses de salida, una escotilla de salida. Acepta una escotilla de paralelos.')

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
    add('emi.grindless.info.transuranium_facility.2', 'El REDC de ORNL: una celda blindada con un tren de cajas de guantes, extracción con HDEHP y columnas de intercambio iónico. El berkelio-249 y el californio-252 solo se hacen aquí.')
    add('emi.grindless.info.transuranium_facility.3', 'Circuito 1: disolver. 2: separar (el disolvente vuelve menos un 1 %). 3: almacén de decaimiento, torio-229 ordeñado del uranio-233 envejecido, nunca con overclock. 4: el curio vuelve a un blanco nuevo. 5: los productos de fisión se evaporan a residuo. 6: el disolvente gastado se quema a ácido fosfórico.')
    add('emi.grindless.info.transuranium_facility.4', 'El ácido nítrico vuelve; el residuo va a la planta de recuperación de residuos. Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 escotillas de entrada, 1-2 buses de salida, 1-3 escotillas de salida.')

    add('emi.grindless.info.ultrapure_water_plant.0', "La planta de agua ultrapura convierte 8000 mB de agua, hidróxido de sodio, resina de intercambio iónico y ácido clorhídrico en 6000 mB de agua ultrapura.")
    add('emi.grindless.info.ultrapure_water_plant.1', "El concentrado de ósmosis inversa se puede eliminar. Acepta una escotilla paralela.")
    add('emi.grindless.info.ultrapure_water_plant.2', 'El tren de agua de una fábrica de semiconductores: bastidores de tubería de PTFE, filtros de ósmosis inversa y un lecho de intercambio iónico. Entra agua corriente; sale agua para los procesos de UHV.')
    add('emi.grindless.info.ultrapure_water_plant.3', 'La resina se conserva; el ácido clorhídrico y el hidróxido de sodio la regeneran. El concentrado de la ósmosis inversa sale como agua salada. Es la única fuente de agua ultrapura.')
    add('emi.grindless.info.ultrapure_water_plant.4', 'Partes en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 escotillas de entrada, 1-2 escotillas de salida y, si se quiere, una escotilla paralela.')

    add('emi.grindless.info.warp_gate.0', "La puerta de salto. Circuito 1: abre la puerta y fabrica la semilla de la puerta de Próxima con celdas de materia exótica, antihidrógeno, datos de aproximación, un reloj nuclear y un procesador de organoides. Circuito 2: mantiene la puerta abierta un minuto con una celda de materia exótica. Los circuitos 3 a 6 la mantienen con otros catalizadores.")
    add('emi.grindless.info.warp_gate.1', "Los jugadores dentro del anillo viajan con ella; los objetos van por AE2. Se construye en la órbita de la Tierra y en la de Próxima b.")
    add('emi.grindless.info.warp_gate.2', 'Un anillo de carcasa construido en ambos extremos, en la órbita de la Tierra y en la de Próxima b. Ábrela con celdas de materia exótica y cartuchos de antihidrógeno (circuito 1): las carcasas vuelven a la trampa de antimateria del UV y sale una semilla de puerta de Próxima.')
    add('emi.grindless.info.warp_gate.3', 'El circuito 2 la mantiene abierta un minuto (una celda de materia exótica, 16 A UHV). Mientras ambos extremos aguantan, un jugador dentro de un anillo pasa al centro del otro. Los objetos no cruzan: van por AE2.')
    add('emi.grindless.info.warp_gate.4', 'Un anillo de 15x15x3 de carcasa de puerta de salto alrededor de aire libre; el controlador en la cara frontal, seis soportes de carcasa UHV en la fila superior para los moduladores, 1-2 buses de entrada, 1-2 de salida y 1-4 escotillas de energía en la fila inferior. Solo en las órbitas de la Tierra y de Próxima b.')

    add('emi.grindless.info.xenobiochem_plant.0', "La planta de xenobioquímica. Circuito 1: radioprotector. 2: pigmento infrarrojo. 3: andamios de quitosano a partir de hongos xeno. 4: lisado clarificado a partir de biomasa xeno.")
    add('emi.grindless.info.xenobiochem_plant.1', "Solo funciona en Próxima b.")
    add('emi.grindless.info.xenobiochem_plant.2', 'Donde crece la vida se hace su química: un lisado clarificado en agua ultrapura, un radioprotector tipo Dsup, un pigmento infrarrojo y quitosano de las setas.')
    add('emi.grindless.info.xenobiochem_plant.3', 'Solo en Próxima b. Circuito 1: radioprotector. 2: pigmento infrarrojo. 3: andamio de quitosano (el agua salada va al electrolizador). 4: lisado clarificado.')
    add('emi.grindless.info.xenobiochem_plant.4', 'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 escotillas de entrada, 1-2 buses de salida, 1-2 escotillas de salida. Cuatro columnas de PTFE alrededor de un reactor limpio.')

    add('emi.grindless.info.xenobotany_greenhouse.0', "El invernadero de xenobotánica cultiva una cepa xeno caracterizada con agua y CO2. Circuito 1: biomasa xeno y oxígeno. Circuito 2: hongos xeno. Circuito 3: pigmento de rojo lejano a partir de biomasa.")
    add('emi.grindless.info.xenobotany_greenhouse.1', "Es hermético y solo funciona en Próxima b.")
    add('emi.grindless.info.xenobotany_greenhouse.2', 'Cristal sellado en el terminador: la vida de Próxima crece bajo una enana roja, con pigmentos que llegan al rojo lejano. Fuera no hay aire que respirar.')
    add('emi.grindless.info.xenobotany_greenhouse.3', 'Solo en Próxima b. Circuito 1: biomasa xeno y oxígeno. 2: setas xeno. 3: pigmento de rojo lejano prensado de la biomasa. La cepa se conserva.')
    add('emi.grindless.info.xenobotany_greenhouse.4', 'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 escotillas de entrada, un bus de salida, 1-2 escotillas de salida. Dentro, un lecho de tierra y lámparas de GT.')

    add('emi.grindless.info.xenoflora_rover_bay.0', "La bahía del rover de xenoflora envía un rover a Próxima con los datos de aproximación y devuelve 4 muestras de flora, el estudio de regolito y una microfuente de americio.")
    add('emi.grindless.info.xenoflora_rover_bay.1', "Solo funciona en Próxima b. Las muestras van a la instalación de recepción de muestras.")
    add('emi.grindless.info.xenoflora_rover_bay.2', 'Un hangar en Próxima b: rovers con una fuente de calor de americio y celdas betavoltaicas (la cara nocturna no tiene sol) salen al terminador y traen muestras de flora y una prospección del regolito.')
    add('emi.grindless.info.xenoflora_rover_bay.3', 'Solo en Próxima b. Los datos de aproximación se conservan; un rover se desgasta una salida de cada ocho y su fuente de americio vuelve con la misma frecuencia. La única fuente de muestras de flora.')
    add('emi.grindless.info.xenoflora_rover_bay.4', 'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida. La consola es carcasa de ordenador.')

    add('emi.grindless.info.zblan_draw_tower.0', "La torre de estirado de ZBLAN. Circuito 1: preforma de vidrio con tetrafluoruro de circonio, bario, lantano y otros fluoruros. Circuito 2: estira 8 fibras de ZBLAN a partir de una preforma.")
    add('emi.grindless.info.zblan_draw_tower.1', "Solo funciona en la órbita de la Tierra.")

    add('emi.grindless.info.uhv_parallel_hatch.0', "La escotilla de control paralelo hiper deja que una máquina que acepta escotillas paralelas ejecute hasta 1024 copias de una receta a la vez, cada una con su EU/t.")
})
