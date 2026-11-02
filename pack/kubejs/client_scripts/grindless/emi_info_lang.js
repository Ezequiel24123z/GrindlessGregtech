// priority: 11100
// Gregtech Grindless - text of our EMI information pages (kubejs/assets/emi/recipe/additions/grindless/*.json: EMI's own data
// recipes, type emi:info; EMI only reads them in the emi namespace). Each page lists its stacks and these translation keys; EMI shows
// the page under both the recipes and the uses of every stack on it. They cover what EMI cannot show as a recipe: right-click
// actions (the travel keys, the wireless covers, the hologram projector), what goes into a structure (GTM's multiblock preview only
// shows the first block of each slot), recipes of GTM's electric furnace (EMI never lists that type) and what an item is kept for.
// What a recipe already shows (the charts' observations, the samples' drilling) gets no page: its recipe must stay visible, which
// the audit checks (a recipe EMI drops for a disabled stack fails it).
// The audit that asks for them is tools/analysis/emi-coverage.mjs. Quests are English only; names and info go in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.alkali_sulfate_dust.0', 'Inert sodium and potassium sulfate: the fluorspar kiln\'s leftover when it digests fluorspar with sulfuric acid into hydrofluoric acid. It is harmless and no recipe uses it.')
    add('emi.grindless.info.alkali_sulfate_dust.1', 'Void it: it is the byproduct the pack deliberately lets go (an inert one may be voided), so it needs no storage line and nothing waits for it.')

    add('emi.grindless.info.travel_keys.0', 'Right-click a travel key to visit its building dimension: the Void Key leads to an empty void, the Flat Key to a flat world, and the End Key to a safe platform in the End, far from the dragon\'s island.')
    add('emi.grindless.info.travel_keys.1', 'Right-click it again there to go back to where you were. From one of these dimensions you can hop straight to another. A key is never used up.')

    add('emi.grindless.info.wireless_covers.0', 'Right-click the side of a single-block GregTech machine with a wireless cover to put it on. A crowbar takes it off and gives it back.')
    add('emi.grindless.info.wireless_covers.1', 'An energy cover goes on a machine of its tier or higher and feeds it from the wireless energy network, up to 2 A, while a formed tower holds a cell of the cover\'s tier or higher (a MAX cell feeds every tier). A dynamo cover goes on a generator or battery buffer of its tier or lower and sends its stored EU into the network; 5% is lost on the way in.')
    add('emi.grindless.info.wireless_covers.2', 'The network\'s energy is stored in Wireless Energy Towers. Shift + right-click a covered machine with an empty hand to read the network.')


    add('emi.grindless.info.capacitor_cells.0', 'Capacitor cells are the storage of the Wireless Energy Tower: its 32 cell slots take cells of any tier (the tower\'s casing fills an empty slot), and every formed tower adds the capacity of its cells to the wireless energy network.')
    add('emi.grindless.info.capacitor_cells.1', 'The network sends EU out at the tier of the strongest cell in any formed tower, so one MAX cell feeds every tier. Swapping a cell unforms its tower; the stored EU stays.')
    add('emi.grindless.info.capacitor_cells.2', 'Most cells come from the assembler. The LuV cell is a superconducting magnetic energy storage (SMES) coil, wound and cold-tested in the HTS Magnet Works; the ZPM and UV cells come from the Naquadria Magnet Works.')

    add('emi.grindless.info.jovian_atmosphere_survey.0', 'Written on Ganymede by the Coilgun Probe Launcher (circuit 1): a Jupiter entry probe falls into the clouds and radios hydrogen, helium and the helium-3 ratio back, as Galileo\'s probe did in 1995.')
    add('emi.grindless.info.jovian_atmosphere_survey.1', 'Keep it: it closes the LuV chapter, and ZPM\'s gas giant siphon needs it to know what it is drawing. No LuV recipe uses it up.')
    add('emi.grindless.info.saturn_transfer_chart.0', 'Written on Ganymede by the Coilgun Probe Launcher (circuit 2): a Saturn flyby probe swings past Jupiter and reaches Saturn, as Pioneer 11, the Voyagers and Cassini did. A data orb copies it by hand.')
    add('emi.grindless.info.saturn_transfer_chart.1', 'Keep it: it is the next trip, to Saturn, in ZPM. No LuV recipe uses it up.')
    add('emi.grindless.info.coilgun_coil_casing.0', 'Wound in the HTS magnet works (circuit 3) from Hg-1223 superconducting wire on an HSS-S frame, potted in epoxy and cold-tested in liquid helium.')
    add('emi.grindless.info.coilgun_coil_casing.1', 'They are the barrel of the Coilgun Probe Launcher on Ganymede: 33 rings of eight (264 casings) around an open bore. At Ganymede\'s 110 K the Hg-1223 superconducts with no cryostat. No recipe uses them up.')
    add('emi.grindless.info.magnetic_bearing.0', 'Made in the HTS magnet works (circuit 4): 4 tetrataenite rods, an HSS-S ring and 2 titanium plates, cold-tested in liquid helium. Tetrataenite, a meteorite-only magnet, comes only from the asteroid belt.')
    add('emi.grindless.info.magnetic_bearing.1', 'A rare-earth-free permanent-magnet bearing: the hub of the rotating hydroponic ring in Earth orbit.')

    add('emi.grindless.info.hologram_projector.0', 'Right-click an unformed multiblock controller to project its structure for 30 seconds; right-click again to hide it. A formed controller opens its normal screen.')
    add('emi.grindless.info.hologram_projector.1', 'Sneak + right-click to build: it places the structure\'s default blocks from your inventory into empty spaces, one item per block. Hatches, buses and other machine parts are left for you to choose.')

    add('emi.grindless.info.sintered_regolith.0', 'Made anywhere. The first bricks come from an electric furnace: it bakes 4 Lunar Regolith Dust into one block (120 EU/t, 20 s). EMI does not list GregTech\'s electric furnace recipes, so that one only shows here. Later the Regolith Cell sinters them in bulk.')
    add('emi.grindless.info.sintered_regolith.1', 'Every structure of the Moon base stands on these bricks: the Regolith Cell, the EV Tripod Drill, the Sealed Dome, the Cryogenic Plant, the Lunar Solar Array, the Deep Space Antenna and the Tritium Removal Facility.')

    add('emi.grindless.info.night_sky_radiator.0', 'A structure block: the radiator wings of the Cryogenic Plant, and part of the Venus Heat Engine, the Tritium Removal Facility, the Mercury Vein Drill and the Mercury Solar Field. Facing an open night sky, it sheds heat as infrared light.')

    add('emi.grindless.info.solar_wing_panel.0', 'A structure block: the wings of the EV Tripod Drill and the panels of the Lunar Solar Array (one recipe run per panel under open sky). Three more go into the array\'s controller.')
    add('emi.grindless.info.orbital_solar_panel.0', 'A structure block: the Orbital Solar Station has two wings of 32 panels. In Earth orbit, each panel whose top sees open sky adds 630 EU/t to the next run: 40,320 EU/t with all 64 exposed. Orbital midnight does not stop it.')
    add('emi.grindless.info.whipple_shield_casing.0', 'A structure block made as metal foam in the Microgravity Smelter. The Wake Shield Facility needs 69 blocks for its octagonal disc. Keep more for the harpoon drill and the orbital tether: the foam and aramid spread micrometeoroid impacts.')
    add('emi.grindless.info.radiation_vault_casing.0', 'A structure block: graded-Z shielding, titanium then tantalum, like Juno\'s electronics vault. Near Jupiter the radiation kills electronics, so every machine of ours on Io, Europa and in Io orbit keeps its hatches and buses in a vault housing. The Fumarole Condenser needs at least 24 and the Volcanic Intake at least 30.')
    add('emi.grindless.info.asteroid_regolith_casing.0', 'A structure block sintered from the belt\'s tuff, only on the asteroid belt (alloy smelter, with titanium dust). The Harpoon Anchor Drill stands on a 29-block pad and its body takes up to 23 more; the Optical Miner\'s hut takes up to 26.')
    add('emi.grindless.info.sapphire_test_mass.0', 'An optical structure block grown in the Zero-G Crystal Grower. Keep four for the Gravitational-Wave Detector on Ganymede: its two vertex mirrors and the mirror at each arm end. The sapphire is a test mass, not a reagent.')
    add('emi.grindless.info.station_truss_casing.0', 'A structure block: the casing of every orbital machine of ours, the Orbital Solar Station, the Microgravity Smelter, the Zero-G Crystal Grower, the Rotating Hydroponic Ring and the Organoid Lab. Build them in an orbit.')
    add('emi.grindless.info.space_station.0', 'A space station is built on Earth and flown up. Build it on the Space Station Packager\'s platform, then give the packager a blank Space Station Package and an ID Chip programmed for the orbit: it packs the build into the package, keeps the chip and puts out a Keycard that identifies the station.')
    add('emi.grindless.info.space_station.1', 'Load the package into the rocket\'s satellite slot and fly to that orbit: the station unpacks on its own 512 x 512 plot. LuV builds the first in Earth orbit, for the Orbital Solar Station and the other orbital machines, and the second in Io orbit, for the Flux-Tube Tether. Orbits are at 3 K: wear freeze protection.')
    add('emi.grindless.info.cryogenic_fuel_tank.0', 'A part of a GCYR rocket: build it into the rocket like any fuel tank and scan it with the rocket scanner. Elite rocket motors with only Cryogenic Fuel Tanks make a level 4 rocket, which reaches the asteroid belt, Io, Europa and Ganymede. One Elite Fuel Tank in the build drops it to level 3. Each tank holds 16,000 mB; a launch needs 14,000 mB, so build two.')

    add('emi.grindless.info.hermean_blocks.0', 'Made only on Mercury, in the Mercury Solar Works. The Mercury Vein Drill, the Mercury Solar Field and the Interferometer stand on the heat-shield bricks; the thin-film panels are the Mercury Solar Field\'s panels, and its controller takes some too.')

    add('emi.grindless.info.heliostat_mirror.0', 'A structure block: the mirror field of the Heliostat Tower (LV) and of the Mercury Solar Works. The Heliostat Tower\'s controller takes some too.')

    add('emi.grindless.info.engineered_seeds.0', 'Made in the Biofoundry (LuV), with Europa\'s bacteria as the vector that carries the gene into the seed.')
    add('emi.grindless.info.engineered_seeds.1', 'Keep them: they are planted in the Rotating Hydroponic Ring, LuV\'s molecular farm on the first station in Earth orbit, and are not used up there. The barley grows the neurotrophic factor the LuV neuro processing unit needs; the tobacco grows plant collagen.')

    add('emi.grindless.info.naquadah_fuel_tank.0', 'A part of a GCYR rocket: build it into the rocket like any fuel tank. Elite rocket motors with only Naquadah Fuel Tanks make a level 5 rocket, which reaches Saturn orbit. One lower tank in the build drops the level. Each tank holds 64,000 mB.')
    add('emi.grindless.info.aerogel_fuel_tank.0', 'A part of a GCYR rocket: build it into the rocket like any fuel tank. Elite rocket motors with only Aerogel Fuel Tanks make a level 6 rocket, which reaches Uranus orbit. One lower tank in the build drops the level. Each tank holds 256,000 mB.')
    add('emi.grindless.info.bnnt_fuel_tank.0', 'A part of a GCYR rocket: build it into the rocket like any fuel tank. Elite rocket motors with only BNNT Fuel Tanks make a level 7 rocket, which reaches Pluto orbit. One lower tank in the build drops the level. Each tank holds 1,024,000 mB.')
    add('emi.grindless.info.saturnian_quantum_seed.0', 'Made in a chemical reactor, from a ring ice sample, an ender pearl and helium-3. Blow it up beside an AE2 singularity to get the far half of the Earth-Saturn quantum link.')
    add('emi.grindless.info.uranian_quantum_seed.0', 'Made in a chemical reactor, from an ice-giant atmosphere sample, an ender pearl and helium-3. Blow it up beside an AE2 singularity to get the far half of the Earth-Uranus quantum link.')
    add('emi.grindless.info.neptunian_quantum_seed.0', 'Made in a chemical reactor, from an ender pearl and helium-3, with 1,000 mB of the deep siphon\'s Neptune helium in the reactor (not used up). Blow it up beside an AE2 singularity to get the far half of the Earth-Neptune quantum link.')
    add('emi.grindless.info.plutonian_quantum_seed.0', 'Made in a chemical reactor, from an ender pearl and helium-3, with a Sputnik ice core from the penetrator in the reactor (not used up). Blow it up beside an AE2 singularity to get the far half of the Earth-Pluto quantum link.')
    add('emi.grindless.info.hermean_quantum_seed.0', 'Two routes: from Hermean regolith dust, an ender pearl and helium-3; or, from UHV, from an ender pearl and helium-3 with a swarm segment in the reactor (not used up). Either seed makes the same Earth-Mercury quantum link.')
  add('emi.grindless.info.srf_cryomodule_block.0', 'A structure block: one SRF cryomodule (eight nitrogen-doped niobium cavities in superfluid helium, made in the SRF Cavity Works) placed as a block, 1:1 in the crafting grid either way. The Accelerator-Driven Reactor needs four in its back wall: they are the linac that drives its spallation target.')
  add('emi.grindless.info.laser_module_block.0', 'A structure block: one fibre laser module (Yb fibre pumped by InGaAs diodes, made in the Fibre Draw Tower) placed as a block, 1:1 in the crafting grid either way. The Laser Fusion Chamber needs 32 of them in its ring of beamlines; the laser sail launcher uses them too.')
  add('emi.grindless.info.bsl4_casing.0', 'A structure block: a sealed, negative-pressure wall panel made in the Assembler. It builds the Sample Receiving Facility, the Xenobotany Greenhouse, the Xenobiochemistry Plant and the Radiotrophic Vat, which keep Proxima b life contained.')
  add('emi.grindless.info.hangar_casing.0', 'A structure block: a pressurised bay wall with docking rails, made in the Assembler. It builds the Solar Probe Bay and the Xenoflora Rover Bay.')
  add('emi.grindless.info.photonic_casing.0', 'A structure block: a dark, vibration-damped clean wall on a float-zone silicon base, made in the Assembler. It builds the SNSPD Foundry, the Van der Waals Stacker and the Photonic Integration Hall.')
  add('emi.grindless.info.uev_fusion_casing.0', 'A structure block: the Mk4 first wall, a Mk3 fusion casing faced with tungsten-fibre tungsten tiles and backed by a SiC/SiC plate, made in the Assembler. It builds the Mk4 Fusion Reactor.')
  add('emi.grindless.info.hftacn_coil_block.0', 'A heating coil: 12,600 K, the hottest before UIV. Eight HfTaCN heating elements on a tritanium frame, made in the Assembler. It fits every coil slot: the Electric Blast Furnace and the other multiblocks that read coil temperature or coil parallels.')
  add('emi.grindless.info.metallic_hydrogen_coil_block.0', 'A heating coil: 14,400 K, the hottest in the pack. Four impregnated metallic hydrogen coils on RHEA plates, made in the Assembler. It fits every coil slot (the Electric Blast Furnace and the other multiblocks that read coil temperature or coil parallels), and it is the magnet belt of the Millikelvin Cryostat Works.')
  add('emi.grindless.info.horizon_collector.0', 'Not craftable: the quest The Horizon Collector gives the machine, its horizon shard and two LV solar covers. Put the shard in the machine (it is never used up), set a circuit from 1 to 10 and power it with a solar cover on top: every 8 seconds each run gives several full stacks of logs, cobblestone, sand, gravel, clay, coal, flint or raw copper, tin or iron (64 to 256 items).')
  add('emi.grindless.info.dfd_motors.0', 'A GCYR rocket motor made in the Thruster Works (UV). The Mk1 is motor tier 7: with UV\'s BNNT tank it makes a level 9 rocket (Alpha Centauri AB orbit, Barnard b). The Mk2 is motor tier 9: with the same tank it makes a level 10 rocket (Sirius B orbit).')
  add('emi.grindless.info.ican_motor.0', 'A GCYR rocket motor made in the Thruster Works (UV). The ICAN motor is motor tier 6: with UV\'s BNNT tank it makes a level 8 rocket (Proxima b).')
})

