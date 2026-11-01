// Quest data for uev_machines: the 25 UEV multiblocks in the order a player meets them (docs/eras/uev.md, "Our multiblocks"; docs/reforge/05_quest_design.md,
// sections 2 and 3.2). Each machine quest asks for the controller and the casing new in this era; hulls and components belong to the circuits chapter,
// and line intermediates to the UEV Lines chart, so product quests ask for end products only. Rows start at a link to a uev_age quest. The core drill is
// taught in the uev_age Barnard quest and not repeated here.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'uev_machines',
  era: 'uev',
  role: 'machines',
  order: 2,
  icon: 'gtceu:calutron',
  autofocus: 'CAL',
  title: 'UEV: Machines',
  subtitle: ['Isotopes, a megabar of pressure, light and a new fusion reactor at home; then Alpha Centauri, Barnard b and a white dwarf.'],
};

export const LINKS = [
  { key: 'M_L_ISO', ref: 'MK1', x: 0, y: 0 },
  { key: 'M_L_PRESS', ref: 'MK1', x: 0, y: 3 },
  { key: 'M_L_EBF', ref: 'MK1', x: 0, y: 5.5 },
  { key: 'M_L_MAG', ref: 'MK1', x: 0, y: 8 },
  { key: 'M_L_FIBRE', ref: 'MK1', x: 0, y: 10.5 },
  { key: 'M_L_SNS', ref: 'MK1', x: 0, y: 13.5 },
  { key: 'M_L_VDW', ref: 'MK1', x: 0, y: 15 },
  { key: 'M_L_POL', ref: 'MK1', x: 0, y: 17.5 },
  { key: 'M_L_QGL', ref: 'MK1', x: 0, y: 21 },
  { key: 'M_L_NEB', ref: 'ALPHA', x: 0, y: 23 },
  { key: 'M_L_DUST', ref: 'ALPHA', x: 0, y: 24.5 },
  { key: 'M_L_PULS', ref: 'ALPHA', x: 0, y: 26 },
  { key: 'M_L_MOND', ref: 'BARN', x: 0, y: 28.5 },
  { key: 'M_L_SPEC', ref: 'SIRIUS', x: 0, y: 31 },
];

// A row's first quest depends on the era quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

const gear = (key, id, title, deps, x, y, teach, extra = [], xpN = 120) => ({
  key, kind: 'machine', title, icon: 'gtceu:' + id, deps: deps_(deps), x, y, teach, desc: [],
  tasks: [it('gtceu:' + id), ...extra], rewards: [xp(xpN)],
});

const prod = (key, title, icon, deps, x, y, desc, xpN = 80) => ({
  key, kind: 'step', title, icon, deps: deps_(deps), x, y, desc, tasks: [it(icon)], rewards: [xp(xpN)],
});

const STABLE = it('gtceu:stable_machine_casing');
const ROBUST = it('gtceu:robust_machine_casing');
const CLEAN = it('gtceu:clean_machine_casing');
const HEAT = it('gtceu:heatproof_machine_casing');
const PHOTO = it('grindless:photonic_casing');

export const QUESTS = [
  // ------------------------------------------------------------------ isotopes and superheavy elements
  gear('CAL', 'calutron', 'Calutron', ['M_L_ISO'], 2, 0, {
    for: 'The &6Calutron&r bends a beam of ions in a magnet, and each isotope lands in its own cup.',
    needs: 'A UHV hull, the stable casing and the ion source parts, with power for the magnet.',
    unlocks: 'Calcium-48 and plutonium-244, the bullet and the target of every superheavy run.',
    automate: 'Feed the ore dust by ME and send each isotope to its own chest; the rest returns for another pass.',
  }, [STABLE]),
  prod('CA48', 'Calcium-48', 'gtceu:calcium_48_dust', ['CAL'], 2, -1.5, ['The rare isotope that a superheavy run fires. The UEV Lines chart shows how much one run uses.']),
  prod('PU', 'Plutonium-244', 'gtceu:plutonium_244_dust', ['CAL'], 4.5, -1.5, ['The heavy target the beam hits. Keep a stock of it before the cyclotron.']),
  gear('HIC', 'heavy_ion_cyclotron', 'Heavy Ion Cyclotron', ['CAL'], 4.5, 0, {
    for: 'The &6Heavy Ion Cyclotron&r accelerates calcium-48 until it can fuse with a plutonium target.',
    needs: 'A UHV hull, the stable casing and the cyclotron parts, and a calcium-48 supply.',
    unlocks: 'Atoms of flerovium and heavier, which the recoil separator catches.',
    automate: 'Beam and target arrive by ME; the output is a few atoms, so route it straight to the separator.',
  }, [STABLE]),
  gear('REC', 'recoil_separator', 'Recoil Separator', ['HIC'], 7, 0, {
    for: 'The &6Recoil Separator&r picks the few new atoms out of the beam, in the milliseconds they live.',
    needs: 'A UHV hull, the stable casing and the cyclotron output.',
    unlocks: 'Counted superheavy atoms, ready for the chemistry lab.',
    automate: 'Link it to the cyclotron by pipe and hatch; sort the atoms by element.',
  }, [STABLE]),
  gear('SHL', 'superheavy_chemistry_lab', 'Superheavy Chemistry Lab', ['REC'], 9.5, 0, {
    for: 'The &6Superheavy Chemistry Lab&r studies a handful of atoms before they decay.',
    needs: 'A UHV hull, the stable casing and a steady supply of counted atoms.',
    unlocks: 'The superheavy census, and the data the later lines ask for.',
    automate: 'Atoms come by hatch from the separator; log the results, then discard the decayed rest.',
  }, [STABLE]),
  prod('CEN', 'Superheavy Census', 'grindless:superheavy_census', ['SHL'], 9.5, -1.5, ['A record of what the lab learned. The UEV Lines chart shows where it is spent.']),

  // ------------------------------------------------------------------ pressure
  gear('MEGA', 'megabar_press', 'Megabar Press', ['M_L_PRESS'], 2, 3, {
    for: 'The &6Megabar Press&r squeezes a sample between diamond anvils to a million atmospheres.',
    needs: 'A UHV hull, the robust casing and the diamond anvil parts.',
    unlocks: 'Superhydrides, which hold their superconducting state under pressure.',
    automate: 'Feed samples and nanotwinned diamond by ME; anvils wear, so keep spares.',
  }, [ROBUST]),
  prod('HYD', 'Squeeze a Hydride', 'gtceu:lay_superhydride_ingot', ['MEGA'], 4.5, 3, ['A lanthanum superhydride, pressed in the megabar press. The UEV Lines chart shows what it feeds.']),

  // ------------------------------------------------------------------ electron beam and single crystals
  gear('EBF', 'electron_beam_furnace', 'Electron-Beam Furnace', ['M_L_EBF'], 2, 5.5, {
    for: 'The &6Electron-Beam Furnace&r melts metal in a vacuum with a beam, so it comes out purer than a coil could make it.',
    needs: 'A UHV hull, the clean casing and a vacuum system.',
    unlocks: 'Six-nines hafnium and tantalum for the single-crystal foundry.',
    automate: 'Feed bars by ME; the vacuum pump has a hatch of its own.',
  }, [CLEAN]),
  gear('SX', 'single_crystal_foundry', 'Single-Crystal Foundry', ['EBF'], 4.5, 5.5, {
    for: 'The &6Single-Crystal Foundry&r pulls a metal blade as one grain, with no boundaries to fail.',
    needs: 'A UHV hull, the heatproof casing and pure metal from the beam furnace.',
    unlocks: 'The single-crystal blade: a turbine wheel of these survives a hot core.',
    automate: 'Pure metal by ME; keep a stock of blanks and send blades on by ME.',
  }, [HEAT]),
  prod('SXB', 'Single-Crystal Blade', 'grindless:sx_blade', ['SX'], 7, 5.5, ['A blade grown as a single grain. The UEV Lines chart shows how a turbine wheel is built from it.']),

  // ------------------------------------------------------------------ magnets
  gear('MAG', 'nitride_magnet_works', 'Nitride Magnet Works', ['M_L_MAG'], 2, 8, {
    for: 'The &6Nitride Magnet Works&r makes a magnet of iron and nitrogen, stronger than any rare earth.',
    needs: 'A UHV hull, the heatproof casing and iron from the Barnard line.',
    unlocks: 'Bonded magnets for the UEV motor and the Mk2 drive.',
    automate: 'Iron and nitrogen come by ME and pipe; bonding runs on a timer.',
  }, [HEAT]),
  prod('MAGP', 'Bonded Magnet', 'grindless:bonded_fe16n2_magnet', ['MAG'], 4.5, 8, ['An iron nitride magnet in a bonded body, ready for a motor. The UEV Lines chart shows which ones need it.']),

  // ------------------------------------------------------------------ composites
  gear('FIBRE', 'sic_fibre_plant', 'SiC Fibre Plant', ['M_L_FIBRE'], 2, 10.5, {
    for: 'The &6SiC Fibre Plant&r spins silicon carbide into a fibre as strong as steel and a quarter of the weight.',
    needs: 'A UHV hull, the clean casing and a spinning line.',
    unlocks: 'Fibre for the SiC composite plates that the CVI furnace infiltrates.',
    automate: 'Feed the precursor by pipe; fibre rolls out by ME.',
  }, [CLEAN]),
  prod('FIBP', 'SiC Fibre', 'grindless:sic_fibre', ['FIBRE'], 2, 12, ['A spool of silicon carbide fibre. Keep a stock for the furnace.']),
  gear('CVI', 'cvi_furnace', 'CVI Furnace', ['FIBRE'], 4.5, 10.5, {
    for: 'The &6CVI Furnace&r fills a woven preform with gas that deposits carbide in the gaps.',
    needs: 'A UHV hull, the heatproof casing and a gas supply.',
    unlocks: 'SiC composite plates, and the HfTaCN coil that the stellar forge uses.',
    automate: 'Preforms arrive by ME; the cycle is long, so run several furnaces.',
  }, [HEAT]),
  prod('COIL', 'HfTaCN Coil', 'grindless:hftacn_coil_block', ['CVI'], 7, 10.5, ['The hottest coil in the pack. The UEV Lines chart shows what it gives.']),
  gear('FORGE', 'stellar_forge', 'Stellar Forge', ['COIL'], 9.5, 10.5, {
    for: 'The &6Stellar Forge&r is a furnace that holds a fragment of a star.',
    needs: 'A UEV hull, two UEV components, two optical computers and the HfTaCN coil block.',
    unlocks: 'The hottest recipes in the pack, which the Mk4 plasma line runs on.',
    automate: 'Fuel and heat sinks by ME; plan for the byproducts before you start.',
  }, [it('grindless:hftacn_coil_block')], 150),

  // ------------------------------------------------------------------ photonics
  gear('SNSPD', 'snspd_foundry', 'SNSPD Foundry', ['M_L_SNS'], 2, 13.5, {
    for: 'The &6SNSPD Foundry&r grows a nanowire detector that counts single photons.',
    needs: 'A UHV hull, the photonic casing and superfluid helium for the cold stage.',
    unlocks: 'The single-photon detector in the circuits chapter.',
    automate: 'Helium by pipe; send finished detectors on by ME.',
  }, [PHOTO]),
  gear('VDW', 'vdw_stacker', 'Van der Waals Stacker', ['M_L_VDW'], 2, 15, {
    for: 'The &6Van der Waals Stacker&r lays one atomic film on another, in the order the design asks for.',
    needs: 'A UHV hull, the photonic casing and films from the cleanroom.',
    unlocks: 'The graphene modulator and the hBN emitter chip.',
    automate: 'Films by ME; the stacker returns finished chips in a chest.',
  }, [PHOTO]),
  gear('PHOT', 'photonic_integration_hall', 'Photonic Integration Hall', ['SNSPD', 'VDW'], 4.5, 14.25, {
    for: 'The &6Photonic Integration Hall&r bonds waveguides, sources and detectors into one optical chip.',
    needs: 'A UHV hull, the photonic casing and every part the UEV chip asks for.',
    unlocks: 'The waveguide circuit, the quantum photonic chip and the optical computer.',
    automate: 'Parts in matched counts by ME; keep a stock of finished chips and send them to the assembler.',
  }, [PHOTO, it('gtceu:laminated_glass')], 150),

  // ------------------------------------------------------------------ fusion
  gear('POL', 'helium3_polariser', 'Helium-3 Polariser', ['M_L_POL'], 2, 17.5, {
    for: 'The &6Helium-3 Polariser&r aligns the spin of each nucleus, so more of them fuse.',
    needs: 'A UHV hull, the clean casing and a helium-3 supply.',
    unlocks: 'Polarised helium-3, the fuel of the Mk4 ring.',
    automate: 'Helium-3 by pipe; keep the polarised stock sealed and ready.',
  }, [CLEAN]),
  prod('HE3', 'Polarised Helium-3', 'gtceu:polarised_helium_3_bucket', ['POL'], 2, 19, ['A bucket of polarised helium-3. Fusion at Mk4 starts from this.']),
  gear('MK4', 'uev_fusion_reactor', 'Mk4 Fusion Reactor', ['POL'], 4.5, 17.5, {
    for: 'The &6Mk4 Fusion Reactor&r is a ring that burns polarised helium-3 and deuterium into the most energy a reactor makes.',
    needs: 'A UEV hull, two UEV components, two optical computers, the UEV fusion casing and the HfTaCN coil block.',
    unlocks: 'The plasma and burn quests in the integration chapter.',
    automate: 'Fuel and coolant by pipe; build the plant before you light it.',
  }, [it('grindless:uev_fusion_casing'), it('grindless:hftacn_coil_block')], 180),

  // ------------------------------------------------------------------ quantum gases and entanglement
  gear('QGL', 'quantum_gas_lab', 'Quantum Gas Lab', ['M_L_QGL'], 2, 21, {
    for: 'The &6Quantum Gas Lab&r holds a cloud of atoms a millionth of a degree above zero.',
    needs: 'A UHV hull, the photonic casing and cooling lasers.',
    unlocks: 'Cold atoms, which the entanglement station uses as memory.',
    automate: 'Atoms by hatch and lasers by ME; the lab is slow and small, so run two.',
  }, [PHOTO]),
  prod('COOL', 'Cold Atoms', 'grindless:li_cooling_laser', ['QGL'], 4.5, 21, ['The cooling laser that gets atoms cold. The UEV Lines chart shows its line.']),
  gear('ENT', 'entanglement_station', 'Entanglement Station', ['COOL'], 7, 21, {
    for: 'The &6Entanglement Station&r in Earth orbit ties two photons together across a distance.',
    needs: 'A UEV hull, two UEV components, two optical computers and the photonic casing.',
    unlocks: 'The quantum repeater node in the circuits chapter.',
    automate: 'Ship the parts to orbit by ME and bring the nodes back.',
  }, [PHOTO], 150),

  // ------------------------------------------------------------------ Alpha Centauri
  gear('NEB', 'nebula_collector', 'Nebula Collector', ['M_L_NEB'], 2, 23, {
    for: 'The &6Nebula Collector&r gathers gas from a nebula and sorts it by element.',
    needs: 'A UEV hull, two UEV components, two optical computers and the photonic casing.',
    unlocks: 'Gas streams that the Alpha Centauri lines consume.',
    automate: 'Run it on a pipe loop to the plant and send the surplus to a tank.',
  }, [PHOTO], 150),
  gear('DUST', 'interstellar_dust_lab', 'Interstellar Dust Lab', ['M_L_DUST'], 2, 24.5, {
    for: 'The &6Interstellar Dust Lab&r studies grains of dust that formed around other stars.',
    needs: 'A UEV hull, two UEV components, two optical computers and the photonic casing.',
    unlocks: 'The iron-60 record and the dust data the star charts use.',
    automate: 'Dust by ME; log the records and store the rest.',
  }, [PHOTO], 150),
  gear('PULS', 'pulsar_timing_station', 'Pulsar Timing Station', ['M_L_PULS'], 2, 26, {
    for: 'The &6Pulsar Timing Station&r keeps time with a pulsar and finds the way by it.',
    needs: 'A UEV hull, two UEV components, two optical computers and the photonic casing.',
    unlocks: 'The pulsar navigation chart that the way to Sirius B needs.',
    automate: 'The station asks for little by ME; keep a stock of charts for the gate.',
  }, [PHOTO], 150),

  // ------------------------------------------------------------------ Barnard b
  gear('MOND', 'carbonyl_refinery', 'Carbonyl Refinery', ['M_L_MOND'], 2, 28.5, {
    for: 'The &6Carbonyl Refinery&r turns iron and carbon monoxide into a liquid and back, leaving a very pure metal.',
    needs: 'A UEV hull, two UEV components, two optical computers and the inert casing.',
    unlocks: 'Iron pentacarbonyl and pure iron, for the nitride magnets.',
    automate: 'Contain the carbon monoxide; keep the loop sealed and vented to a scrubber.',
  }, [it('gtceu:inert_machine_casing')], 150),
  prod('IPC', 'Iron Pentacarbonyl', 'gtceu:iron_pentacarbonyl_bucket', ['MOND'], 4.5, 28.5, ['The carrier that purifies Barnard iron. Handle it as a toxic fluid.']),

  // ------------------------------------------------------------------ Sirius B
  gear('SPEC', 'white_dwarf_spectrograph', 'White Dwarf Spectrograph', ['M_L_SPEC'], 2, 31, {
    for: 'The &6White Dwarf Spectrograph&r reads a dead star\'s light and from it the mass and radius.',
    needs: 'A UEV hull, two UEV components, two optical computers and the photonic casing.',
    unlocks: 'The mass-radius chart and the degenerate harvester.',
    automate: 'The station asks for little by ME; keep a stock of charts.',
  }, [PHOTO], 150),
  gear('DEG', 'degenerate_harvester', 'Degenerate Harvester', ['SPEC'], 4.5, 31, {
    for: 'The &6Degenerate Harvester&r takes matter from a white dwarf, in which atoms are crushed together.',
    needs: 'A UEV hull, two UEV components, two optical computers and the degenerate containment casing.',
    unlocks: 'Degenerate matter, which the containment works bottles.',
    automate: 'Put the plant behind a safe containment loop; never route this matter by plain pipe.',
  }, [it('grindless:degenerate_containment_casing')], 150),
  gear('PEL', 'containment_works', 'Containment Works', ['DEG'], 7, 31, {
    for: 'The &6Containment Works&r bottles degenerate matter into a pellet that can be carried safely.',
    needs: 'A UEV hull, two UEV components, two optical computers and the degenerate containment casing.',
    unlocks: 'The degenerate pellet, the last item the gate at UEV asks for.',
    automate: 'Feed the matter from the harvester by hatch; ship pellets by ME.',
  }, [it('grindless:degenerate_containment_casing')], 150),
  prod('PELP', 'Degenerate Pellet', 'grindless:degenerate_pellet', ['PEL'], 9.5, 31, ['A pellet of degenerate matter, bottled. The gate at UEV is built from it.']),
];
