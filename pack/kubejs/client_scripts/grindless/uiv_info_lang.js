// priority: 3150
// Gregtech Grindless - EMI information pages of the UIV era machines (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in the uiv_*_lang.js files; every key is in en_us.
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
    add('emi.grindless.info.matrioshka_computer.1', "It is the only machine that writes UIV research and the only maker of the neutron-star and Kerr charts. It needs rings of the four Matrioshka blocks and a droplet radiator module block, made on the assembly line in Mercury orbit. It accepts a parallel hatch.")

    add('emi.grindless.info.droplet_radiator_works.0', "The Droplet Radiator Works has one wall open to vacuum, where a sheet of liquid-tin droplets radiates the waste heat of the Matrioshka. It is built from droplet radiator modules, which the assembly line makes in Mercury orbit from an orifice plate, EB-distilled tin and a droplet collector. Circuit 2: TPV tile from InGaAsSb TPV cells and a selective emitter. ")
    add('emi.grindless.info.droplet_radiator_works.1', "It is the only maker of TPV tiles, which the Matrioshka Computer needs. It accepts a parallel hatch.")

    add('emi.grindless.info.pulsar_wind_trap.0', "The Pulsar Wind Trap is a magnetic trap that catches a sample of the electron-positron wind of PSR J0437-4715; the gamma rays are absorbed as heat in its tungsten lining. Circuit 1: a metallic hydrogen coil block, which is not consumed, makes pair plasma and a flow of wind electrons. It works only at PSR J0437-4715.")
    add('emi.grindless.info.pulsar_wind_trap.1', "It has no item output: the plasma and the electrons leave through output hatches and never leave the star. The pair plasma is cooled by the positron accumulator there; the electrons go back into the wind. It accepts a parallel hatch.")

    add('emi.grindless.info.positronium_condensate_lab.0', "The Positronium Condensate Lab forms positronium in aerogel, laser-cools it and condenses it, then makes it annihilate in step. Circuit 1: Ps in aerogel from cooled positrons, a neon moderator cartridge and Ps-converter aerogel. Circuit 2: laser-cooled Ps (the 243 nm laser is kept). Circuit 3: gamma laser cavity from a Ps BEC and two gamma Bragg mirrors.")
    add('emi.grindless.info.positronium_condensate_lab.1', "It is the only maker of the gamma laser cavity, the core of the UIV emitter. The Ps BEC comes from the antimatter storage; the cooled positrons from the positron accumulator. It accepts a parallel hatch.")

    add('emi.grindless.info.xray_pulse_profiler.0', "The X-ray Pulse Profiler folds the X-ray pulses of PSR J0437-4715 at 5.76 ms. Circuit 1: the UEV pulsar navigation chart, which is kept, gives four raw pulse profiles. Circuit 2: four timed profiles and the neutron-star EOS chart give the pulsar navigation solution. It works only at PSR J0437-4715.")
    add('emi.grindless.info.xray_pulse_profiler.1', "The raw profiles must be timed against home by the Deep Space Network before circuit 2. The navigation solution steers a seed across 7,000 light years. It accepts a parallel hatch.")

    add('emi.grindless.info.crust_lift.0', "The Crust Lift lifts neutron-star crust up a tether and a polar-cap electrode. Circuit 1: the electrode, which stays, and a crust lift tether give four neutron-star crust and a worn tether. It works only at RX J1856.5-3754.")
    add('emi.grindless.info.crust_lift.1', "It is the only source of neutron-star crust, the start of the whole RX J1856.5-3754 line. One tether in ten wears out; the worn tether is a real item, not voided. The crust goes on to the Neutron Drip Separator.")


    add('emi.grindless.info.neutronium_cage.0', "The Neutron Drip Works splits the crust at the neutron drip line behind a nickel-58 supermirror guide, then cools the drip neutrons in superfluid helium and cages them in a nickel-58 cage part. Separation, circuit 1: neutron-star crust gives inner-crust matter and outer-crust ions. Circuit 2: inner-crust matter gives crust nuclei and drip neutrons. Caging, circuit 1: drip neutrons and superfluid helium give neutron superfluid. Circuit 2: a cage part and neutron superfluid give a neutronium pellet.")
    add('emi.grindless.info.neutronium_cage.1', "The drip neutrons stay a fluid for the cage and the R-Process Decompressor; the outer-crust ions go to the Decay Heat Vault, where they burn for power. Neutrons that leak out decay to protium, which comes out as a fluid. It needs an output hatch, a 21 x 13 x 29 hall of neutron star site casings, metallic hydrogen field casings and dilution cryostat casings.")

    add('emi.grindless.info.r_process_decompressor.0', "The R-Process Decompressor lets crust nuclei swell in a flood of drip neutrons: the r-process. Circuit 1: crust nuclei give fission fragments and a hot r-process mix. Circuit 2: flashes a uranium-238 target into a flashed target, the einsteinium and fermium debris.")
    add('emi.grindless.info.r_process_decompressor.1', "The fission fragments are fuel for the Decay Heat Vault. The hot mix and the flashed target feed the einsteinium and fermium chemistry.")

    add('emi.grindless.info.decay_heat_vault.0', "The Decay Heat Vault is a generator: it holds a sealed kilonova capsule while its heat decays into electricity, one run at a time. Circuit 1: kilonova capsule to aged capsule, the main power. Circuit 2: opens an aged capsule into r-process ash and helium-4 ash. Circuits 3 and 4: burn fission fragments or outer-crust ions into iron dust.")
    add('emi.grindless.info.decay_heat_vault.1', "Its EU leaves only through its own UIV dynamo hatch, so it needs one. It refuses to void: the ash and the helium-4 ash come out as items and fluid.")
})

