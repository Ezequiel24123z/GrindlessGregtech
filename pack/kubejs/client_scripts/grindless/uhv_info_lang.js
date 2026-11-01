// priority: 4538
// Gregtech Grindless - EMI information pages of the UHV era multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, its circuit modes, what it needs. Their recipes show in EMI under the controller itself.
// Every key is in en_us.
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

