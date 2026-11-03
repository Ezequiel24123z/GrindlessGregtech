// priority: 5014
// Gregtech Grindless - EMI information pages of the UEV era machines and the UEV and UIV hatches (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller (one per hatch family): what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in the uev_*_lang.js files; every key is in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.calutron.0', "The Calutron separates isotopes by mass: the ionised chloride runs round a vacuum racetrack and the collector pockets catch each isotope. Circuit 1: calcium pass 1 (40 %). 2: calcium pass 2 (97 %). 3: potassium-40. 4: lithium-6. 5: plutonium-244. 6: plutonium-242 for the high flux reactor. Circuits 7 to 9 are titanium-50, europium-151 and nickel-58.")
    add('emi.grindless.info.calutron.1', "It is the only route to calcium-48, potassium-40, lithium-6 and plutonium-244. It refuses to void: the depleted streams come out as stock, and the depleted plutonium goes back to the MOX line.")
    add('emi.grindless.info.calutron.2', 'Y-12\'s calutron: an electromagnetic racetrack in a vacuum tank, a superconducting coil round the track and collector pockets. The ionised chloride splits by mass. The only route to calcium-48, potassium-40, lithium-6 and plutonium-244.')
    add('emi.grindless.info.calutron.3', 'It uses energy. Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-3 output buses.')

    add('emi.grindless.info.electron_beam_furnace.0', "The Electron Beam Furnace melts metal drop by drop under an electron gun in hard vacuum, and the volatile impurities boil off: 6N purity. Circuit 1: rhenium. 2: hafnium. 3: tantalum. 4: niobium (RRR grade). 5: YSZ coating on an SX blade. 6: onion carbon. Circuits 7 and 8: the niobium-tantalum button and tin distillation.")
    add('emi.grindless.info.electron_beam_furnace.1', "It is the only maker of 6N hafnium, tantalum, niobium and rhenium. Every refining leaves an EB skull, which goes back to the platinum plant.")
    add('emi.grindless.info.electron_beam_furnace.2', 'A hearth under an electron gun in hard vacuum: the metal is melted drop by drop and the volatile impurities boil off, leaving 6N purity.')
    add('emi.grindless.info.electron_beam_furnace.3', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional input hatch. Accepts a parallel hatch.')

    add('emi.grindless.info.entanglement_station.0', "The Entanglement Station entangles photons from an SPDC source with a europium memory and checks them with SNSPDs. Circuit 1: a quantum repeater node, in one pass.")
    add('emi.grindless.info.entanglement_station.1', "It is the only maker of quantum repeater nodes. The memory is held in superfluid helium, which is not used up.")
    add('emi.grindless.info.entanglement_station.2', 'Entangles photons from an SPDC source with an Eu:YSO memory and checks them with SNSPDs: the only maker of quantum repeater nodes.')
    add('emi.grindless.info.entanglement_station.3', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional input hatch. Accepts a parallel hatch.')

    add('emi.grindless.info.heavy_ion_cyclotron.0', "The Superheavy Factory (the Heavy Ion Cyclotron) fires a calcium-48 beam at an actinide target; a helium chamber takes the recoil. Circuit 1: flerovium (plutonium-244). 2: livermorium (curium-248). 3: tennessine (target wheel). 4: oganesson (californium-249). 5: moscovium (americium). 6: a xenon beam on polycarbonate foil. Circuits 7 and 8 are the element 120 and 119 lines.")
    add('emi.grindless.info.heavy_ion_cyclotron.1', "The SRF cavity and the helium are not used up, and the xenon is recovered. It refuses to void: the recoil gases, the helium and the activated target wheel (to the Hot Cell) always have a place to go. The same machine then runs the recoil separation: one recoil gas and one etched membrane give one atom item, and the atoms go on to the Superheavy Chemistry Lab.")

    add('emi.grindless.info.helium3_polariser.0', "The Helium-3 Polariser aligns the nuclear spins of 6N helium-3 by optical pumping. Circuit 1: polarises the gas. Circuit 2: mixes the polarised gas with deuterium into polarised fuel. Circuit 3: polarises helium-3 for a later era.")
    add('emi.grindless.info.helium3_polariser.1', "The 1,083 nm laser is a tool: it is never consumed. Depolarised gas goes back to the cryogenic plant. The polarised fuel feeds the Mk4 Fusion Reactor.")
    add('emi.grindless.info.helium3_polariser.2', 'Optical pumping at 1,083 nm aligns the nuclear spins of 6N helium-3.')

    add('emi.grindless.info.megabar_press.0', "The Megabar Press is a multi-anvil press that squeezes matter past a million atmospheres. Circuit 1: (La,Y)H10 superhydride from La-Y foil and ammonia borane charges. Circuit 2: nanotwinned diamond from a pellet of onion carbon. Circuit 3: hot isostatic pressing of a printed RHEA impeller. Circuit 4: HPHT anneal of a C-12 diamond plate.")
    add('emi.grindless.info.megabar_press.1', "The nanotwinned diamond anvil wears: each run has a chance to use one up. An optional output hatch takes the hydrogen the superhydride gives off.")
    add('emi.grindless.info.megabar_press.2', 'A multi-anvil press that squeezes matter past a million atmospheres: it makes (La,Y)H10 superhydride and nanotwinned diamond.')
    add('emi.grindless.info.megabar_press.3', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional output hatch (hydrogen). Accepts a parallel hatch.')

    add('emi.grindless.info.photonic_integration_hall.0', "The Photonic Integration Hall bonds waveguides, quantum dot sources, detectors and modulators onto one chip. Circuit 1: waveguide circuit. 2: quantum photonic chip. 3: optical computer. Circuits 4 to 6: photonic tensor core, optical mainframe and pulsar-timed repeater.")
    add('emi.grindless.info.photonic_integration_hall.1', "It is the only place the optical computer is made, and the optical computers of the Mk4 Fusion Reactor and of later machines start here.")
    add('emi.grindless.info.photonic_integration_hall.2', 'Bonds waveguides, quantum dot sources, detectors and modulators onto one chip: the only place an optical computer is made.')
    add('emi.grindless.info.photonic_integration_hall.3', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional input hatch. Accepts a parallel hatch.')

    add('emi.grindless.info.quantum_gas_lab.0', "The Quantum Gas Lab cools lithium-6 and potassium-40 into a degenerate Fermi mixture and measures gravity with atom interferometry. Circuit 1: degenerate EOS model. 2: Barnard gravity survey. 3: calibrate the interferometer against the ULE cavity. It works only in Earth orbit.")
    add('emi.grindless.info.quantum_gas_lab.1', "The cooling lasers and the ULE cavity are tools: they are never consumed.")
    add('emi.grindless.info.quantum_gas_lab.2', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional input hatch. Accepts a parallel hatch.')


    add('emi.grindless.info.single_crystal_foundry.0', "The Single-Crystal Foundry casts single-crystal parts in a withdrawal furnace under argon: one grain, no boundaries to creep along. Circuit 1: SX blade. 2: pump impeller. 3: Brayton turbine wheel from eight coated SX blades.")
    add('emi.grindless.info.single_crystal_foundry.1', "It is the only maker of those parts. The argon is never used up, the gate is remelted in a macerator and the dross goes to the platinum plant. It refuses to void.")
    add('emi.grindless.info.single_crystal_foundry.2', 'Circuit 1 SX blade, 2 pump impeller, 3 Brayton turbine wheel. The gate goes back to the master alloy in a macerator; the dross goes to the platinum plant. The argon is never used up.')
    add('emi.grindless.info.single_crystal_foundry.3', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, an input hatch, 1-2 output buses. Accepts a parallel hatch.')

    add('emi.grindless.info.snspd_foundry.0', "The SNSPD Foundry is a cryostat that patterns a tungsten silicide film into a nanowire and packages it. Circuit 1: WSi film. 2: nanowire write. 3: waveguide mount. 4: cool and package into an SNSPD. Circuit 5: a niobium Josephson junction wafer.")
    add('emi.grindless.info.snspd_foundry.1', "It is the only maker of SNSPDs. It needs the FZ wafer and a SiN waveguide chip, which come from the photonics lines.")
    add('emi.grindless.info.snspd_foundry.2', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional input hatch. Accepts a parallel hatch.')

    add('emi.grindless.info.superheavy_chemistry_lab.0', "The Superheavy Chemistry Lab counts, sorts and seals a few atoms at a time by gas chromatography on gold. Circuit 1: tennessine atoms in a sealed capsule give a sample. Circuit 2: flerovium, livermorium, moscovium and oganesson atoms on gold foil give the superheavy census. Circuit 3: the census of elements 119 and 120.")
    add('emi.grindless.info.superheavy_chemistry_lab.1', "The tennessine sample is only stored: no recipe uses it. It refuses to void: the atoms and the samples are never thrown away.")

    add('emi.grindless.info.uev_fusion_reactor.0', "The Mk4 Fusion Reactor is a tier 10 fusion ring. It runs three fuels, each from one premixed fluid: D-He-3 (circuit 1), p-11B (circuit 2) and polarised D-He-3 (circuit 3). It has an energy buffer far beyond the int range.")
    add('emi.grindless.info.uev_fusion_reactor.1', "Polarised fuel makes 1.5 times the plasma. The plasma is not burned for heat: it feeds the direct energy converter, and it cools back into its fuel fluid.")
    add('emi.grindless.info.uev_fusion_reactor.2', 'A tier 10 fusion ring: its energy buffer is far beyond the int range.')
    add('emi.grindless.info.uev_fusion_reactor.3', 'Runs D-He-3, p-11B and polarised D-He-3, each from one premixed fuel fluid.')

    add('emi.grindless.info.vdw_stacker.0', "The VdW Stacker lays two-dimensional crystals on each other with a clean transfer arm. Circuit 1: hBN emitter chip. 2: graphene modulator. 3: graphene between two hBN films.")
    add('emi.grindless.info.vdw_stacker.1', "The films come from the CVD lines on copper foil. The chips and modulators go to the Photonic Integration Hall.")
    add('emi.grindless.info.vdw_stacker.2', 'Lays two-dimensional crystals on each other with a clean transfer arm: hBN chips, graphene modulators, hBN-encapsulated graphene.')
    add('emi.grindless.info.vdw_stacker.3', 'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses, an optional input hatch. Accepts a parallel hatch.')

    add('emi.grindless.info.uev_uiv_machine_hull.0', "The UEV and UIV Machine Hulls are the core that every machine and hatch of their tier is built on: the energy hatches start from one. They are made in an assembler from the tier's machine casing, cables and plates.")
    add('emi.grindless.info.uev_uiv_machine_hull.1', "On its own the hull does nothing; it can stand in a multiblock where a pass-through part is accepted.")

    add('emi.grindless.info.uev_uiv_energy_hatch.0', "The UEV and UIV Energy Hatches bring EU into a multiblock from a cable at their tier's voltage. The plain one takes 2 A and the 16A one takes 16 A, so it carries far more power through one cable. They are made in an assembler from the tier's machine hull and cables.")
    add('emi.grindless.info.uev_uiv_energy_hatch.1', "A multiblock of this tier takes them in its energy slots in the bottom layer. For a hatch with no cable, see the Wireless Energy Hatch.")

    add('emi.grindless.info.uev_uiv_dynamo_hatch.0', "The UEV and UIV Dynamo Hatches carry EU out of a generator multiblock into a cable at their tier's voltage. The plain one gives 2 A and the 16A one gives 16 A. They are made in an assembler from the tier's machine hull and cables.")
    add('emi.grindless.info.uev_uiv_dynamo_hatch.1', "A generator needs one, or its power has nowhere to go. For a hatch with no cable, see the Wireless Dynamo Hatch.")

    add('emi.grindless.info.uiv_parallel_hatch.0', "The Insane Parallel Control Hatch lets a machine that takes parallel hatches run up to 16384 copies of a recipe at once, each at its own EU/t.")
})

