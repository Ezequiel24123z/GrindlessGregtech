// Quest data for the MAX processing lines (chart tools/quests/processing-lines/pl-data-max.mjs; recipes read from the VM dump 9f6c31872).
// One quest per line (M1-M8 and the thirteen kept lines) that teaches the line in its own words, and a step quest only where a step brings something new:
// a new multiblock, a recycle loop, a site condition or a byproduct with a destination. The chart already shows every step.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: {
    name: 'MAX lines',
    origin: { x: 76, y: 28 },
    heading: {
      key: 'H_MAX_LINES', x: 0, y: 0, deps: ['LOCK'], icon: 'gtnn:supracausal_mainframe',
      desc: ['The processing lines of the era: strands and tethers, cold metrology, the supracausal stage, Rydberg atoms, the genome archive, the ring imager, the shell segment and the horizon lock, then the shorter lines. Each is taught once; the chart shows every step.'],
    },
  },
};

const q = (key, title, icon, deps, x, y, teach, item, xpN) => ({
  key, kind: 'process', title, icon, deps, x, y, teach, desc: [], tasks: [it(item, 1)], rewards: [xp(xpN)],
});

export const QUESTS = [
  q("LN_M2", "M2: Strand and Tether", "gtceu:horizon_strand_single_wire", ["H_MAX_LINES"], 0, 2.5, {
    for: "The horizon strand is the wire of the era: stable exotic matter is clad in foil, drawn into a single-crystal strand and sleeved in PBO braid. A second row turns a ribbon into the horizon tether.",
    needs: "The &6Strangelet Vault&r for the foil, the &6Pasta Mill&r for preform and wire, the &6PBO Plant&r for the sleeve, the &6Tether Ribbon Works&r and &6Stellar Elevator&r for the tether.",
    unlocks: "Every MAX cable and casing is built from the strand; the tether is what the Geroch winch hangs from.",
    automate: "One belt per row: the clad stages feed the Pasta Mill by pipe and ME, and the cable only needs a steady PBO supply.",
  }, "gtceu:horizon_strand_single_cable", 100),
  q("M2_S1", "Exotic Cladding Foil", "grindless:exotic_cladding_foil", ["LN_M2"], 2.5, 2.5, {
    for: "Stable exotic matter is too violent to draw bare. The foil that clads it is made in a Strangelet Vault, a multiblock new to this line.",
    needs: "In a &6Strangelet Growth&r: a Stable Exotic Matter, a Boron Dust, programmed circuit 4, water.",
    unlocks: "The clad chain strand.",
    automate: "Give the vault its own feed of stable exotic matter and stock the foil by ME.",
  }, "grindless:exotic_cladding_foil", 60),
  q("M2_S2", "Horizon Strand Preform", "grindless:horizon_strand_preform", ["M2_S1"], 5, 2.5, {
    for: "The Pasta Mill extrudes the clad strand into a preform, then draws the preform into the wire: one machine, two recipes.",
    needs: "In a &6Pasta Drawing&r: a Clad Chain Strand, programmed circuit 5.",
    unlocks: "The single wire, and with it every strand cable and casing.",
    automate: "Let ME choose the recipe by pattern; one mill serves both.",
  }, "grindless:horizon_strand_preform", 60),
  q("M2_S3", "Proof Loaded Ribbon", "grindless:proof_loaded_ribbon", ["M2_S2"], 7.5, 2.5, {
    for: "The tether row begins by loading each ribbon in the Stellar Elevator, a lift that works only in orbit.",
    needs: "In a &6Star Lifting&r: a Strand Ribbon, programmed circuit 3, stellar plasma.",
    unlocks: "The coated and cured ribbon, then the horizon tether.",
    automate: "Feed ribbons by ME; the elevator takes one run at a time.",
  }, "grindless:proof_loaded_ribbon", 60),
  q("LN_M5", "M5: Cold Metrology", "grindless:matter_wave_gradiometer", ["LN_M2"], 0, 5, {
    for: "The cold parts every MAX machine is built from: superfluid valve, gradiometer, field coil, composite rod, membrane belt, optical isolator, magnetic bearing and Terfenol stack. The valve row is the longest line of the era.",
    needs: "The &6Aerogel Works&r, &6SHeQUID Works&r and &6Millikelvin Cryostat Works&r for the valve, the &6Atom Interferometer Works&r for the gradiometer, the &6Rare Earth Extraction Cascade&r for YBCO and Tb-Dy.",
    unlocks: "The tensegrity truss (composite rods), the clamp coil casings (field coils) and every MAX machine that wants a cold part.",
    automate: "Each row ends in a part that waits in ME. The cold stages share one helium refrigerator loop, and the reclamation row feeds YBCO back so it never runs dry.",
  }, "grindless:superfluid_valve", 100),
  q("M5_S1", "Aerogel Superleak Plug", "grindless:aerogel_superleak_plug", ["LN_M5"], 2.5, 5, {
    for: "A silica aerogel is the plug through which only superfluid passes. The Aerogel Works makes it, starting a seven-step row.",
    needs: "In a &6Supercritical Drying&r: 2 Silylated Alcogel, ethanol, carbon dioxide.",
    unlocks: "The potted and calibrated superleak, then the valve.",
    automate: "The first stages are slow: run several works side by side.",
  }, "grindless:aerogel_superleak_plug", 60),
  q("M5_S2", "Cold Tested Superleak", "grindless:cold_tested_superleak", ["M5_S1"], 5, 5, {
    for: "Each superleak is cold-tested in the Millikelvin Cryostat Works before it becomes a valve; a bad one never leaves.",
    needs: "In a &6Nuclear Demagnetisation&r: a Calibrated Superleak, a Mk Cryostat Module, programmed circuit 11, he3 he4 mixture.",
    unlocks: "The superfluid valve.",
    automate: "Send only calibrated superleaks in; the cryostat holds the run.",
  }, "grindless:cold_tested_superleak", 60),
  q("M5_S3", "REBCO Tape", "grindless:rebco_tape_max", ["M5_S2"], 7.5, 5, {
    for: "The field coil starts as a REBCO tape on an ITBTC coated conductor. The Coated Conductor Line makes it.",
    needs: "In a &6Coated Conductor&r: 4 Itbtc Coated Conductor, 2 Horizon Strand Single Wire, programmed circuit 5, epoxy.",
    unlocks: "The stabilised tape, the CMC coil former, the winding and the field coil.",
    automate: "The line is continuous: feed it by ME and cap the tape.",
  }, "grindless:rebco_tape_max", 60),
  q("M5_S4", "Exotic Composite Billet", "grindless:exotic_composite_billet", ["M5_S3"], 10, 5, {
    for: "A SiC preform is infiltrated with exotic matter and sintered in the Spark Plasma Sinterer, then balanced.",
    needs: "In a &6Spark Plasma Sintering&r: a Exotic Infiltrated Preform, 2 Graphite Dust, programmed circuit 21.",
    unlocks: "The balanced billet and the exotic composite rod of the truss.",
    automate: "The sinterer is slow: buffer preforms in front of it.",
  }, "grindless:exotic_composite_billet", 60),
  q("M5_S5", "Bi:YIG Film", "grindless:bi_yig_film", ["M5_S4"], 12.5, 5, {
    for: "A bismuth-doped YIG film is grown by liquid-phase epitaxy, then bonded to lithium niobate for the optical isolator.",
    needs: "In a &6Liquid Phase Epitaxy&r: a Yig Film Wafer, 2 Bismuth Dust, a Pt Lpe Crucible, programmed circuit 4, lpe flux.",
    unlocks: "The isolator waveguide die and the MAX optical isolator.",
    automate: "The furnace takes a batch at a time; stock the film.",
  }, "grindless:bi_yig_film", 60),
  q("M5_S6", "Irradiated YBCO Bulk", "grindless:irradiated_ybco_bulk", ["M5_S5"], 15, 5, {
    for: "A single-crystal YBCO bulk is irradiated in the High Flux Reactor to pin its flux, so it can float a rotor.",
    needs: "In a &6High Flux Irradiation&r: a Tsmg Ybco Bulk, a Californium 252 Source, programmed circuit 5, helium.",
    unlocks: "The bearing rotor ring and the magnetic bearing.",
    automate: "The reactor is shared with other lines: give this row its own slot.",
  }, "grindless:irradiated_ybco_bulk", 60),
  q("M5_S7", "YBCO Precursor Powder", "grindless:ybco_precursor_powder", ["M5_S6"], 17.5, 5, {
    for: "The reclamation loop: ablated shell segments are stripped, bioleached and extracted back to YBCO precursor, so nothing is lost.",
    needs: "In a &6Solvent Extraction&r: 4 Yttrium Oxide Dust, programmed circuit 30, nitric acid, water.",
    unlocks: "The YBCO bulk of the bearing, without fresh rare earths.",
    automate: "Return every ablated segment to the reclamation works.",
  }, "grindless:ybco_precursor_powder", 60),
  q("LN_M1", "M1: The Supracausal Stage", "gtnn:supracausal_mainframe", ["LN_M5"], 0, 7.5, {
    for: "The line that grows from the Si-28 qubit line: four tested tetron dies are bonded to a cryo photonic interposer, joined with squeezed light, cooled and shielded into the shielded quantum module. Three branches (squeezed-light chip, tweezer die, interposer) feed it.",
    needs: "The &6TFLN Fab&r, &6Photonic Foundry&r, &6Millikelvin Cryostat Works&r, &6Membrane Line&r and &6Photonic Integration Hall&r in turn, with the tetron dies of the Si-28 line.",
    unlocks: "The supracausal mainframe, the only circuit of MAX: 3 tweezer dies, 7 OpV circuits and the shielded module go into it.",
    automate: "Every module step is slow and holds its machine, so give each its own. Stock the three branch parts by ME.",
  }, "gtnn:supracausal_mainframe", 100),
  q("M1_S1", "Transducer Bonded Stack", "grindless:transducer_bonded_stack", ["LN_M1"], 2.5, 7.5, {
    for: "Four tested tetron dies are bonded to a cryo photonic interposer. The tetron dies come from the Si-28 line and ten percent come back as failed dies.",
    needs: "In a &6Ion Slicing&r: 4 Tested Tetron Die, a Cryo Photonic Interposer, programmed circuit 14.",
    unlocks: "The photonic tetron module.",
    automate: "Return failed dies to the Si-28 line.",
  }, "grindless:transducer_bonded_stack", 60),
  q("M1_S2", "Photonic Tetron Module", "grindless:photonic_tetron_module", ["M1_S1"], 5, 7.5, {
    for: "Light is added: two squeezed-light chips and ultrapure water in the Photonic Foundry, which returns the water.",
    needs: "In a &6Photonic Foundry&r: a Transducer Bonded Stack, 2 Squeezed Light Chip, programmed circuit 17, ultrapure water.",
    unlocks: "The calibrated photonic module.",
    automate: "The water returns by pipe, so a loop covers it.",
  }, "grindless:photonic_tetron_module", 60),
  q("M1_S3", "Calibrated Photonic Module", "grindless:calibrated_photonic_module", ["M1_S2"], 7.5, 7.5, {
    for: "The module is cooled in the nuclear demagnetisation stage of the Millikelvin Cryostat Works, with a He-3/He-4 mixture that comes back.",
    needs: "In a &6Nuclear Demagnetisation&r: a Photonic Tetron Module, a Mk Cryostat Module, programmed circuit 12, he3 he4 mixture.",
    unlocks: "The shielded quantum module.",
    automate: "The mixture is recovered: keep it in its own tank.",
  }, "grindless:calibrated_photonic_module", 60),
  q("M1_S4", "Shielded Quantum Module", "grindless:shielded_quantum_module", ["M1_S3"], 10, 7.5, {
    for: "The Membrane Line wraps the module in a superconducting membrane, so the last step can hold it.",
    needs: "In a &6Membrane Rolling&r: a Calibrated Photonic Module, a Superconducting Membrane, programmed circuit 4, liquid helium.",
    unlocks: "The supracausal mainframe.",
    automate: "Make it just before the hall needs it.",
  }, "grindless:shielded_quantum_module", 60),
  q("LN_M8", "M8: Rydberg Atoms", "grindless:rydberg_logic_array", ["LN_M1"], 0, 10, {
    for: "The Rydberg array is the logic of the genome archive and the horizon lock: a gallium arsenide laser die, a rubidium-87 atom cartridge, a UV fibre harness and a crossed acousto-optic pair, set in a tweezer array.",
    needs: "The &6MOCVD Reactor&r, &6Calutron&r and &6Quantum Gas Lab&r for die and atoms, the &6Fibre Draw Tower&r and &6Femtosecond Writer&r for the harness, the &6Spintronic Cluster Tool&r for the AOD.",
    unlocks: "The Rydberg Array Works, then the Gene Ark, the photon ring imager and the horizon lock.",
    automate: "A spent array is refilled with a new atom cartridge in a short recipe: loop it home by conveyor.",
  }, "grindless:rydberg_logic_array", 100),
  q("M8_S1", "Rydberg Laser Die", "grindless:rydberg_laser_die", ["LN_M8"], 2.5, 10, {
    for: "The laser die is grown on a gallium arsenide wafer in the MOCVD Reactor.",
    needs: "In a &6Mocvd&r: a Gallium Arsenide Wafer, a Indium Dust, a Aluminium Dust, programmed circuit 26, trimethylgallium, arsine.",
    unlocks: "The Rydberg logic array.",
    automate: "Stock by ME: the array takes one.",
  }, "grindless:rydberg_laser_die", 60),
  q("M8_S2", "Rb-87 Atom Cartridge", "grindless:atom_cartridge_rb87", ["M8_S1"], 5, 10, {
    for: "Rubidium-87 is separated in the Calutron and loaded into a cartridge in the Quantum Gas Lab. A spent array is refilled with a fresh cartridge.",
    needs: "In a &6Quantum Degenerate Gas&r: a Rb87 Isotope, a Li Cooling Laser, a Ule Cavity, programmed circuit 6, helium.",
    unlocks: "The Rydberg logic array and its refill.",
    automate: "Keep a cartridge per array.",
  }, "grindless:atom_cartridge_rb87", 60),
  q("M8_S3", "UV Fibre Harness", "grindless:uv_fibre_harness", ["M8_S2"], 7.5, 10, {
    for: "A hollow-core fibre is drawn from ultrapure silica and end-capped by femtosecond writing; it guides UV to the atoms.",
    needs: "In a &6Assembler&r: a Endcapped Hc Fibre, 2 Hollow Core Fibre, a MAX circuit, 2 Tritanium Plate, 4 Tritanium Foil, 2 Horizon Strand Single Wire and more.",
    unlocks: "The Rydberg logic array.",
    automate: "The tower draws long: cut and stock.",
  }, "grindless:uv_fibre_harness", 60),
  q("M8_S4", "Crossed Aod Pair", "grindless:crossed_aod_pair", ["M8_S3"], 10, 10, {
    for: "Two tellurium dioxide crystals, bonded and electroded, steer the tweezers in two directions.",
    needs: "In a &6Assembler&r: 2 Electroded Aod, a Teo2 Aod Blank, a MAX circuit, 2 Tritanium Plate, 4 Tritanium Foil, 2 Horizon Strand Single Wire and more.",
    unlocks: "The Rydberg logic array.",
    automate: "Make two per array.",
  }, "grindless:crossed_aod_pair", 60),
  q("LN_M6", "M6: Genome Archive", "grindless:genome_archive", ["LN_M8"], 0, 12.5, {
    for: "Two rows meet in the archive. One writes the genomes the pack has met, from synthetic oligos to a xeno library; the other builds a minimal cell, hardens it and vitrifies it as the Ark capsule.",
    needs: "The &6Biofoundry&r, &6Organoid Lab&r, &6Ark Biosphere&r and &6Xenobotany Greenhouse&r for the genomes; the &6Vent Bioreactor&r, &6Radiotrophic Vat&r and &6Aerogel Works&r for the capsule.",
    unlocks: "The Gene Ark.",
    automate: "Both rows feed one Gene Ark; a refill recipe re-uses it, so one archive is enough.",
  }, "grindless:genome_archive", 100),
  q("M6_S1", "Synthetic Oligo Pool", "grindless:synthetic_oligo_pool", ["LN_M6"], 2.5, 12.5, {
    for: "The Biofoundry writes the oligos that both rows start from; they are the cheapest input of the archive.",
    needs: "In a &6Sterile Culture&r: 2 Phosphorus Dust, programmed circuit 17, sterilized growth medium, ammonia.",
    unlocks: "The genome set row and the minimal cell row.",
    automate: "Pipe it to both rows.",
  }, "grindless:synthetic_oligo_pool", 60),
  q("M6_S2", "Ark Genome Set", "grindless:ark_genome_set", ["M6_S1"], 5, 12.5, {
    for: "The Ark Biosphere grows the genomes of the pack's own organisms from their extracts.",
    needs: "In a &6Closed Ecosystem&r: a Organoid Genome Extract, a Algae Culture, programmed circuit 4, raw growth medium, water.",
    unlocks: "The xeno genome set and the genome library.",
    automate: "The extracts come by ME: keep the biosphere fed.",
  }, "grindless:ark_genome_set", 60),
  q("M6_S3", "Transplanted Minimal Cell", "grindless:transplanted_minimal_cell", ["M6_S2"], 7.5, 12.5, {
    for: "A synthetic genome is transplanted into a bare mycoplasma cell in the Xenobiochemistry Plant.",
    needs: "In a &6Xenobiochemistry&r: a Recipient Mycoplasma Culture, programmed circuit 5, sterilized growth medium, ultrapure water.",
    unlocks: "The hardened cell and the vitrified capsule.",
    automate: "The culture grows in the vent bioreactor: keep a spare.",
  }, "grindless:transplanted_minimal_cell", 60),
  q("M6_S4", "Vitrified Cell Capsule", "grindless:vitrified_cell_capsule", ["M6_S3"], 10, 12.5, {
    for: "The hardened cell is vitrified in aerogel: the capsule that the Ark carries.",
    needs: "In a &6Supercritical Drying&r: a Hardened Minimal Cell, 2 Silica Aerogel, programmed circuit 6, ethanol, carbon dioxide.",
    unlocks: "The genome archive.",
    automate: "One capsule per archive.",
  }, "grindless:vitrified_cell_capsule", 60),
  q("LN_M7", "M7: Ring Imager", "grindless:sgr_a_spin_map", ["LN_M6"], 0, 15, {
    for: "The spin of Sagittarius A* is read from its ring of light: a gold-coated SiC dish, a niobium SIS mixer, a photonic local oscillator and a cryogenic low-noise amplifier feed the photon ring imager.",
    needs: "The &6SiC Fibre Plant&r and &6CVI Furnace&r for the dish, the &6BEUV Scanner&r for the diodes and junctions, the &6Millikelvin Cryostat Works&r and &6Helium Refrigerator&r for the cold stages.",
    unlocks: "The Sgr A* spin map and the cluster charts.",
    automate: "Four rows feed one imager: give each its own buffer chest and let the imager take what it needs.",
  }, "grindless:sgr_a_spin_map", 100),
  q("M7_S1", "Imager Dish Panel", "grindless:imager_dish_panel", ["LN_M7"], 2.5, 15, {
    for: "A figured, gold-coated SiC dish: the panels of the imager ring.",
    needs: "In a &6Assembler&r: 2 Gold Coated Dish, a MAX circuit, 2 Tritanium Plate, 4 Tritanium Foil, 2 Horizon Strand Single Wire, 2 Tritanium Round and more.",
    unlocks: "The photon ring imager.",
    automate: "A ring needs many panels: batch the CVI Furnace.",
  }, "grindless:imager_dish_panel", 60),
  q("M7_S2", "SIS Mixer", "grindless:sis_mixer", ["M7_S1"], 5, 15, {
    for: "A niobium trilayer is patterned into SIS junctions, tested cold and packaged as the mixer that beats the signal down.",
    needs: "In a &6Assembler&r: 2 Tested Sis Die, a MAX circuit, 2 Tritanium Plate, 4 Tritanium Foil, 2 Horizon Strand Single Wire, 2 Tritanium Round and more.",
    unlocks: "The imager receivers.",
    automate: "The test stage is the bottleneck; buffer in front of it.",
  }, "grindless:sis_mixer", 60),
  q("M7_S3", "Photonic LO Module", "grindless:photonic_lo_module", ["M7_S2"], 7.5, 15, {
    for: "An indium phosphide photodiode that makes the local oscillator by light in the Photonic Foundry.",
    needs: "In a &6Photonic Foundry&r: 2 Utc Die, a Glass Interposer, programmed circuit 24, ultrapure water, soldering alloy.",
    unlocks: "The imager receivers.",
    automate: "Make a few; they are not consumed.",
  }, "grindless:photonic_lo_module", 60),
  q("M7_S4", "Cryo LNA Module", "grindless:cryo_lna_module", ["M7_S3"], 10, 15, {
    for: "An InP HEMT amplifier die, tested cold in the Helium Refrigerator.",
    needs: "In a &6Assembler&r: 2 Cryo Tested Lna, a MAX circuit, 2 Tritanium Plate, 4 Tritanium Foil, 2 Horizon Strand Single Wire, 2 Tritanium Round and more.",
    unlocks: "The imager receivers.",
    automate: "The refrigerator is shared: queue the tests.",
  }, "grindless:cryo_lna_module", 60),
  q("LN_M4", "M4: Shell Segment", "grindless:mirror_shell_segment", ["LN_M7"], 0, 17.5, {
    for: "A mirror shell segment is a truss, a membrane, an albedo panel, a droplet radiator, a cryocooler, a controller, a Halbach coupler and a tunable impedance sheet. Most are made from the rock of the nuclear star cluster.",
    needs: "The &6Cluster-Light Furnace&r, &6Carbonyl Refinery&r and &6Levitation Melter&r for the truss, the &6Nitride Magnet Works&r for the coupler, the &6Droplet Radiator Works&r, and the swarm-segment craft.",
    unlocks: "The Mirror Shell, which is built from segments.",
    automate: "Eight parts feed one craft: buffer each by ME. Spent segments come back through the reclamation works for their rare earths.",
  }, "grindless:mirror_shell_segment", 100),
  q("M4_S1", "Segment Truss", "grindless:segment_truss", ["LN_M4"], 2.5, 17.5, {
    for: "The truss is cast from belt rock: bloom, carbonyl powder, alloy ingot and billet, ending in the Cluster-Light Furnace.",
    needs: "In a &6Extruder&r: 2 Segment Truss Billet, a Rod Extruder Mold.",
    unlocks: "The mirror shell segment.",
    automate: "The furnace casts in bulk: buffer the truss.",
  }, "grindless:segment_truss", 60),
  q("M4_S2", "Halbach Segment Coupler", "grindless:halbach_segment_coupler", ["M4_S1"], 5, 17.5, {
    for: "Cryo-milled iron cores are pressed into tetrataenite and made into a Halbach magnet array.",
    needs: "In a &6Nitride Magnet Synthesis&r: 2 Cold Pressed Tetrataenite, a Fe16n2 Ring Magnet, programmed circuit 20, nitrogen.",
    unlocks: "The mirror shell segment.",
    automate: "Stock one per segment.",
  }, "grindless:halbach_segment_coupler", 60),
  q("M4_S3", "Shell Cryocooler", "grindless:shell_cryocooler", ["M4_S2"], 7.5, 17.5, {
    for: "A pulse tube charged with Er3Ni spheres. Spent coolers are not binned: their erbium goes back through the reclamation works.",
    needs: "In a &6Assembler&r: 2 Charged Pulse Tube, 2 Opv Electric Pump, a Opv Sensor, 2 Tungsten Steel Plate, 2 Gold Foil, 4 Niobium Titanium Foil and more.",
    unlocks: "The segment and the shell's controller.",
    automate: "Return scrap to the Segment Reclamation Works.",
  }, "grindless:shell_cryocooler", 60),
  q("M4_S4", "Segment Controller", "grindless:segment_controller", ["M4_S3"], 10, 17.5, {
    for: "SiC electronics with MRAM and racetrack memory run each segment.",
    needs: "In a &6Assembler&r: 4 Racetrack Memory Die, 2 Opv Sensor, a Opv Robot Arm, 2 Tungsten Steel Plate, 4 Copper Foil, 2 Gold Foil and more.",
    unlocks: "The mirror shell segment.",
    automate: "Stock one per segment.",
  }, "grindless:segment_controller", 60),
  q("M4_S5", "Shell Droplet Radiator", "grindless:shell_droplet_radiator", ["M4_S4"], 12.5, 17.5, {
    for: "A nozzle plate and a collector shell are joined in the Droplet Radiator Works with a tin-lithium eutectic that sprays heat into space.",
    needs: "In a &6Droplet Radiator Assembly&r: a Droplet Nozzle Plate, a Radiator Collector Shell, programmed circuit 5, sn li eutectic.",
    unlocks: "The mirror shell segment.",
    automate: "The eutectic is reused: keep it in its own loop.",
  }, "grindless:shell_droplet_radiator", 60),
  q("M4_S6", "Sealed Hearth Liner", "grindless:sealed_hearth_liner", ["M4_S5"], 15, 17.5, {
    for: "A tantalum-hafnium carbide liner is sealed by CVI; it lines the Cluster-Light Furnace and wears out.",
    needs: "In a &6Chemical Vapour Infiltration&r: a Ta Hf C Billet, programmed circuit 15, methane.",
    unlocks: "The furnace.",
    automate: "Keep spares: the hearth wears.",
  }, "grindless:sealed_hearth_liner", 60),
  q("M4_S7", "Wolter Mirror Module", "grindless:wolter_mirror_module", ["M4_S6"], 17.5, 17.5, {
    for: "Grazing-incidence mirrors of iridium-coated SiC that focus X-rays. They are made from platinum-group residue.",
    needs: "In a &6Assembler&r: 4 Iridium Coated Shell, 2 Tritanium Plate, 4 Tritanium Foil, 2 Tritanium Round, a MAX circuit, a Fine Gold Wire and more.",
    unlocks: "The Accretion Feeder.",
    automate: "Keep a stock.",
  }, "grindless:wolter_mirror_module", 60),
  q("LN_M3", "M3: Horizon Lock", "grindless:horizon_lock", ["LN_M4"], 0, 20, {
    for: "The last recipe of the age takes seed wave packets, stream bundles, phase locks, flux clamps and a Rydberg array, with the maps of the horizon interferometer. This chart is every input of it, row by row.",
    needs: "The &6Ergoregion Synchroniser&r for the phase locks, the &6Horizon Flux Clamp&r, the &6Horizon Interferometer&r, the &6Kugelblitz Forge&r for the wave packets and the &6Mirror Shell&r.",
    unlocks: "The horizon lock, the end of MAX and the opening of MAX+.",
    automate: "Build the horizon machines once and queue the rows through them; the lock itself is one run.",
  }, "grindless:horizon_lock", 100),
  q("M3_S1", "Tunable Impedance Sheet", "grindless:tunable_impedance_sheet", ["LN_M3"], 2.5, 20, {
    for: "A VO2 metasurface on sapphire that changes its impedance on command: a segment input and the first step of the phase lock.",
    needs: "In a &6Assembler&r: 2 Metallised Metasurface, 4 Gold Foil, 2 Niobium Titanium Foil, a Uxv Sensor, a OPV circuit, soldering alloy.",
    unlocks: "The horizon phase lock.",
    automate: "Needed per segment and per lock: keep a stock.",
  }, "grindless:tunable_impedance_sheet", 60),
  q("M3_S2", "SRF Driver Module", "grindless:srf_driver_module", ["M3_S1"], 5, 20, {
    for: "A niobium driver cell, polished, coated with Nb3Sn and conduction-cooled.",
    needs: "In a &6Assembler&r: 4 Conduction Cooled Cell, 2 Opv Electric Motor, a Opv Sensor, 2 Tungsten Steel Plate, 4 Niobium Titanium Foil, a OPV circuit and more.",
    unlocks: "The horizon phase lock.",
    automate: "The refrigerator is shared: queue the cells.",
  }, "grindless:srf_driver_module", 60),
  q("M3_S3", "Seed Wave Packet", "grindless:seed_wave_packet", ["M3_S2"], 7.5, 20, {
    for: "A thorium-229 nuclear clock steers an SRF cavity; its mode is cooled and fed to the Kugelblitz Forge.",
    needs: "In a &6Kugelblitz Forming&r: a Cooled Cavity Mode, a Kugelblitz Seed, 2 Positron Cartridge, 2 Gamma Absorber Tile, programmed circuit 6.",
    unlocks: "The horizon lock.",
    automate: "Four are needed: queue them by pattern.",
  }, "grindless:seed_wave_packet", 60),
  q("M3_S4", "HTS Flux Pump", "grindless:hts_flux_pump", ["M3_S3"], 10, 20, {
    for: "A cooled flux pump is set in a frame with two chain field coils and two MAX circuits: the pump that charges the flux clamp.",
    needs: "In a &6Assembler&r: programmed circuit 17, a Cold Flux Pump, 2 Tungsten Steel Plate, 4 Tungsten Steel Rod, 2 Tungsten Steel Ring, a Tungsten Steel Gear and more.",
    unlocks: "The Horizon Flux Clamp.",
    automate: "Its slow part is the cold flux pump: stock it by ME.",
  }, "grindless:hts_flux_pump", 60),
  q("M3_S5", "Stream Pellet", "grindless:stream_pellet", ["M3_S4"], 12.5, 20, {
    for: "Eight scandium-jacketed pellets are canned in liquid helium. Spent pellets are also reclaimed in the Mass Stream Injector at a small yield.",
    needs: "In a &6Mass Stream Injection&r: programmed circuit 2, a Spent Stream Pellet.",
    unlocks: "The stream bundles of the horizon lock.",
    automate: "Return spent pellets to the injector.",
  }, "grindless:stream_pellet", 60),
  q("LN_K1", "Superconducting Membrane", "grindless:superconducting_membrane", ["LN_M3"], 0, 22.5, {
    for: "A copper foil is electropolished to a single crystal, covered with graphene and hBN, and a REBCO layer is grown on a PBO web. It is the skin of the conveyor, field generator and hatches.",
    needs: "The &6Single-Crystal Foundry&r, &6Van der Waals Stacker&r, &6Coated Conductor Line&r, &6HTS Magnet Works&r and &6Membrane Line&r.",
    unlocks: "The shielded quantum module and the membrane vacuum and shell window casings.",
    automate: "Make the foil and the web in bulk; the membrane waits in ME for the ark, the hall and the casings.",
  }, "grindless:superconducting_membrane", 100),
  q("LN_K2", "Albedo Multilayer Panel", "grindless:albedo_multilayer_panel", ["LN_K1"], 0, 25, {
    for: "A stack of hafnia and silica layers that reflects the light of the cluster back; it faces the sun side of every shell segment and lines the furnace bowl.",
    needs: "The &6Zone Refining Tower&r, &6Electron Beam Furnace&r, &6Spintronic Cluster Tool&r and &6Membrane Line&r.",
    unlocks: "The mirror shell segment, the Cluster Light Furnace and the Geroch Winch.",
    automate: "Make a stock: every segment takes one.",
  }, "grindless:albedo_multilayer_panel", 100),
  q("LN_K3", "Diamond Power Die", "grindless:diamond_power_die", ["LN_K2"], 0, 27.5, {
    for: "A diamond power die switches current that silicon cannot: a plate is boron-doped by ion implant, metallised and cut into dies.",
    needs: "The &6Diamond Lattice Fab&r, &6Ion Implanter&r, &6Spintronic Cluster Tool&r and &6SiC Device Fab&r.",
    unlocks: "The MAX Battery, the Horizon Flux Clamp, the Cluster Light Furnace and the Mass Stream Injector.",
    automate: "A few dies per hatch: keep a small stock by ME.",
  }, "grindless:diamond_power_die", 100),
  q("LN_K4", "Sgr A* Power Loop", "grindless:mh_winding", ["LN_K3"], 0, 30, {
    for: "A closed fluid loop: hot flow plasma from the accretion disk is filtered, shaped into a flux-loaded plasmoid and run through a dynamo that leaves a cooled exhaust. The winding for its magnets is the first step.",
    needs: "The &6Accretion Disk Skimmer&r, &6Plasma Mass Filter&r, &6FRC Former&r and &6BZ Dynamo&r.",
    unlocks: "The Penrose payload, the Mh field casing and the Mh coil formers.",
    automate: "Pipe the exhaust back to the skimmer: nothing is voided.",
  }, "grindless:mh_winding", 100),
  q("LN_K5", "Geroch Canister", "grindless:geroch_canister", ["LN_K4"], 0, 32.5, {
    for: "Radioactive waste is retrieved, cooled in a decay-heat vault, vitrified in a hot cell and sealed: a destination for the era's hottest byproduct.",
    needs: "The &6Waste Retrieval Plant&r, &6Decay Heat Vault&r and &6Hot Cell&r.",
    unlocks: "The Geroch power recipe, which returns a spent tether segment.",
    automate: "Pipe waste in from every plant that makes it; the canister leaves by ME.",
  }, "grindless:geroch_canister", 100),
  q("LN_K6", "Quantum Memory Node", "grindless:quantum_memory_node", ["LN_K5"], 0, 35, {
    for: "A europium-doped crystal is burned with a spectral hole pattern and pigtailed with fibre: a memory that holds a photon.",
    needs: "The &6Crystal Growth Furnace&r, &6Spectral Hole Burner&r and &6Fibre Draw Tower&r.",
    unlocks: "The Photon Ring Imager.",
    automate: "A short line; make a few and keep them in a chest.",
  }, "grindless:quantum_memory_node", 100),
  q("LN_K7", "MAX Penrose Payload", "grindless:max_penrose_payload", ["LN_K6"], 0, 37.5, {
    for: "A core of degenerate matter, compressed under a megabar and cased in SiC: the payload of the Penrose process.",
    needs: "The &6Degenerate Works&r, &6Megabar Press&r and &6Spark Plasma Sinterer&r.",
    unlocks: "The Penrose extraction recipe.",
    automate: "One payload per run: queue them by pattern.",
  }, "grindless:max_penrose_payload", 100),
  q("LN_K8", "XUV Collector Panel", "grindless:xuv_collector_panel", ["LN_K7"], 0, 40, {
    for: "A diamond photocell for extreme ultraviolet: pin-doped, metallised and built into a panel.",
    needs: "The &6Diamond Lattice Fab&r, &6Betavoltaic Fab&r and &6Solar Array Fab&r.",
    unlocks: "The Accretion Feeder.",
    automate: "Keep a spare stock.",
  }, "grindless:xuv_collector_panel", 100),
  q("LN_K9", "Cold SMES Toroid", "grindless:cold_smes_toroid", ["LN_K8"], 0, 42.5, {
    for: "A superconducting toroid that stores energy as current: a REBCO winding braced and cooled.",
    needs: "The &6Coated Conductor Line&r, &6HTS Magnet Works&r, &6Naquadria Magnet Works&r and &6Helium Refrigerator&r.",
    unlocks: "The MAX Battery and the MAX SMES cell.",
    automate: "One per buffer: a short run, no stock needed.",
  }, "grindless:cold_smes_toroid", 100),
  q("LN_K10", "Clock Locked Microcomb", "grindless:clock_locked_microcomb", ["LN_K9"], 0, 45, {
    for: "A microring on a nitride film, trimmed and packaged, then locked to a nuclear clock.",
    needs: "The &6MOCVD Reactor&r, &6BEUV Scanner&r, &6Femtosecond Writer&r, &6Photonic Foundry&r and &6Nuclear Clock Lab&r.",
    unlocks: "The Rydberg logic array and the photon ring imaging recipe.",
    automate: "Make a few; they are not consumed.",
  }, "grindless:clock_locked_microcomb", 100),
  q("LN_K11", "Cryo Reference Cavity", "grindless:cryo_reference_cavity", ["LN_K10"], 0, 47.5, {
    for: "A silicon cavity with crystalline mirrors, held cold: the reference that a laser is stabilised against.",
    needs: "The &6Crystal Growth Furnace&r, &6MBE Reactor&r and &6Helium Refrigerator&r.",
    unlocks: "The matter wave gradiometer.",
    automate: "Make a few, and keep the cooling loop running.",
  }, "grindless:cryo_reference_cavity", 100),
  q("LN_K12", "Cold FCL Module", "grindless:cold_fcl_module", ["LN_K11"], 0, 50, {
    for: "A fault-current limiter on a coated tape, wound into a coil and cooled: it protects the grid from a short.",
    needs: "The &6Coated Conductor Line&r, &6HTS Magnet Works&r and &6Helium Refrigerator&r.",
    unlocks: "The Horizon Flux Clamp, the MAX substation hatches and the MAX 1A energy converter.",
    automate: "One per network: a short run.",
  }, "grindless:cold_fcl_module", 100),
  q("LN_K13", "Cold Glass Cell", "grindless:cold_qualified_cell", ["LN_K12"], 0, 52.5, {
    for: "A laser-welded glass cell, annealed, coated and cold tested: the vessel a cold-atom experiment sits in.",
    needs: "The &6Zone Refining Tower&r, &6Femtosecond Writer&r and &6Helium Refrigerator&r.",
    unlocks: "The Rydberg Array Works.",
    automate: "A few cells cover the era.",
  }, "grindless:cold_qualified_cell", 100),
];
