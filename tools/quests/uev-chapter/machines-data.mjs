// Quest data for uev_machines: the 25 UEV multiblocks in the order a player meets them (docs/eras/uev.md, "Our multiblocks"; docs/reforge/05_quest_design.md,
// sections 2 and 3.2). Each machine quest asks for the controller and the casing new in this era; hulls and components belong to the UEV circuits quests,
// and line intermediates to the UEV Lines chart, so product quests ask for end products only. Rows start at a link to a uev_age quest. The core drill is
// taught in the uev_age Barnard quest and not repeated here.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UEV Machines', origin: { x: 4, y: 24.5 }, heading: { key: 'H_NUC', x: 6.25, y: -31, deps: ['J_HOME'], icon: 'gtceu:calutron', desc: [
      'Heavy isotopes, megabar presses and magnets.',
      'The machines of this age start here.',
    ] } },
  filename: 'uev_machines',
  era: 'uev',
  role: 'machines',
  order: 2,
  icon: 'gtceu:calutron',
  autofocus: 'CAL',
  title: 'UEV: Machines',
  subtitle: ['Isotopes, a megabar of pressure, light and a new fusion reactor at home; then Alpha Centauri, Barnard b and a white dwarf.'],
};

export const LINKS = [];

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
  gear('CAL', 'calutron', 'Calutron', ['H_NUC'], 9.75, -40.5, {
    for: 'The &6Calutron&r bends a beam of ions in a magnet, and each isotope lands in its own cup.',
    needs: 'Two UHV hulls, three UV sensors, three UV field generators, three SRF cryomodules, a Nb3Sn cavity, two zircaloy tubes, any UHV circuit and the stable casing.',
    unlocks: 'Calcium-48 and plutonium-244, the bullet and the target of every superheavy run.',
    automate: 'Feed the ore dust by ME and send each isotope to its own chest; the rest returns for another pass.',
  }, [STABLE]),
  prod('CA48', 'Calcium-48', 'gtceu:calcium_48_dust', ['CAL'], 11, -42.25, ['The rare isotope that a superheavy run fires. The UEV Lines chart shows how much one run uses.']),
  prod('PU', 'Plutonium-244', 'gtceu:plutonium_244_dust', ['CAL'], 13.25, -41.5, ['The heavy target the beam hits. Keep a stock of it before the cyclotron.']),
  gear('HIC', 'heavy_ion_cyclotron', 'Superheavy Factory', ['CAL'], 14, -39.25, {
    for: 'The &6Superheavy Factory&r accelerates calcium-48 until it can fuse with a plutonium target, then picks the few new atoms out of the beam on the same line.',
    needs: 'Four UHV hulls, eight UV sensors, seven UV field generators, fifteen UHV circuits, seven calcium-48 beams, three target wheels, three Nb3Sn cavities, fifteen polycarbonate foils and the stable casing; the Calutron is its research. A very large structure (31x11x47), and GTM\'s Terminal places it in three passes.',
    unlocks: 'Irradiation and recoil separation in one machine: counted atoms of flerovium and heavier, ready for the chemistry lab.',
    automate: 'Beam, target, membranes and foils arrive by ME; sort the few atoms by element.',
  }, [STABLE]),
  gear('SHL', 'superheavy_chemistry_lab', 'Superheavy Chemistry Lab', ['HIC'], 25, -40, {
    for: 'The &6Superheavy Chemistry Lab&r studies a handful of atoms before they decay.',
    needs: 'Four UHV hulls, eight UV sensors, eight UV field generators, sixteen UHV circuits, eight sealed capsules, four polycarbonate foils, four etched membranes and the stable casing; the Superheavy Factory is its research.',
        unlocks: 'The tennessine sample and the superheavy census, which the Warp Gate hold and the later lines ask for.',
    automate: 'Atoms come by hatch from the Superheavy Factory; log the results, then discard the decayed rest.',
  }, [STABLE]),
  prod('CEN', 'Superheavy Census', 'grindless:superheavy_census', ['SHL'], 27.75, -41.5, ['A record of what the lab learned. The UEV Lines chart shows where it is spent.']),

  // ------------------------------------------------------------------ pressure
  gear('MEGA', 'megabar_press', 'Megabar Press', ['H_NUC'], 10, -32.25, {
    for: 'The &6Megabar Press&r squeezes a sample between diamond anvils to a million atmospheres.',
    needs: 'Seven UHV hulls, twenty-one UHV pistons, motors and pumps each, twenty-seven UHV circuits, thirteen LaY foils, thirteen ammonia borane charges, seven nanodiamond pellets and the robust casing.',
    unlocks: 'Superhydrides, which hold their superconducting state under pressure.',
    automate: 'Feed samples and nanotwinned diamond by ME; anvils wear, so keep spares.',
  }, [ROBUST]),
  prod('HYD', 'Squeeze a Hydride', 'gtceu:lay_superhydride_ingot', ['MEGA'], 12, -32.75, ['A lanthanum superhydride, pressed in the megabar press. The UEV Lines chart shows what it feeds.']),

  // ------------------------------------------------------------------ electron beam and single crystals
  gear('EBF', 'electron_beam_furnace', 'Electron Beam Furnace', ['H_NUC'], 11, -37.75, {
      for: 'The &6Electron Beam Furnace&r melts metal in a vacuum with a beam, so it comes out purer than a coil could make it.',
      needs: 'Two UHV hulls, four UV emitters, eight UHV circuits, four SRF cryomodules, eight SRF cavities, three near-net neutronium gears and the clean casing.',
    unlocks: 'Six-nines hafnium and tantalum for the single-crystal foundry.',
    automate: 'Feed bars by ME; the vacuum pump has a hatch of its own.',
  }, [CLEAN]),
  gear('SX', 'single_crystal_foundry', 'Single-Crystal Foundry', ['EBF'], 19.75, -36.75, {
    for: 'The &6Single-Crystal Foundry&r pulls a metal blade as one grain, with no boundaries to fail.',
    needs: 'Five UHV hulls, eight UV robot arms, sixteen UHV circuits, four SRF cryomodules, eight SRF cavities, seventeen near-net neutronium gears and the heatproof casing; the pure metal comes from the Electron Beam Furnace.',
    unlocks: 'The single-crystal blade: a turbine wheel of these survives a hot core.',
    automate: 'Pure metal by ME; keep a stock of blanks and send blades on by ME.',
  }, [HEAT]),
  prod('SXB', 'Single-Crystal Blade', 'grindless:sx_blade', ['SX'], 24.75, -33.25, ['A blade grown as a single grain. The UEV Lines chart shows how a turbine wheel is built from it.']),

  // ------------------------------------------------------------------ magnets
  gear('MAG', 'nitride_magnet_works', 'Nitride Magnet Works', ['H_NUC'], 13.5, -36.25, {
    for: 'The &6Nitride Magnet Works&r makes a magnet of iron and nitrogen, stronger than any rare earth.',
    needs: 'Four UHV hulls, ten UHV motors, pumps and robot arms each, thirteen UHV circuits, seven HfTaC dusts, three FFKM seals, three Ta2O5 dusts and the heatproof casing.',
    unlocks: 'Bonded magnets for the UEV motor and the Mk2 drive.',
    automate: 'Iron and nitrogen come by ME and pipe; bonding runs on a timer.',
  }, [HEAT]),
  prod('MAGP', 'Bonded Magnet', 'grindless:bonded_fe16n2_magnet', ['MAG'], 23.5, -32, ['An iron nitride magnet in a bonded body, ready for a motor. The UEV Lines chart shows which ones need it.']),

  // ------------------------------------------------------------------ composites
  gear('FIBRE', 'sic_fibre_plant', 'SiC Fibre Plant', ['H_FIBRE'], 11, -13, {
    for: 'The &6SiC Fibre Plant&r spins silicon carbide into a fibre as strong as steel and a quarter of the weight.',
    needs: 'Three UHV hulls, nine UHV pumps, eight robot arms, eight conveyor modules, eleven UHV circuits, six polycarbosilane dusts, three HfTaC dusts, three FFKM seals and the clean casing; the Nitride Magnet Works is its research.',
    unlocks: 'Fibre for the SiC composite plates that the CVI furnace infiltrates.',
    automate: 'Feed the precursor by pipe; fibre rolls out by ME.',
  }, [CLEAN]),
  prod('FIBP', 'SiC Fibre', 'grindless:sic_fibre', ['FIBRE'], 14.75, -12.25, ['A spool of silicon carbide fibre. Keep a stock for the furnace.']),
  gear('CVI', 'cvi_furnace', 'CVI Furnace', ['FIBRE'], 16.5, -13.75, {
    for: 'The &6CVI Furnace&r fills a woven preform with gas that deposits carbide in the gaps.',
    needs: 'Four UHV hulls, eleven UHV pumps, ten UHV emitters and sensors each, fourteen UHV circuits, four SiC preforms, four tungsten preforms, three FFKM seals and the heatproof casing; the SiC Fibre Plant is its research.',
    unlocks: 'SiC composite plates, and the HfTaCN coil that the stellar forge uses.',
    automate: 'Preforms arrive by ME; the cycle is long, so run several furnaces.',
  }, [HEAT]),
  prod('COIL', 'HfTaCN Coil', 'grindless:hftacn_coil_block', ['CVI'], 18.5, -12.75, ['The hottest coil in the pack. The UEV Lines chart shows what it gives.']),
  gear('FORGE', 'stellar_forge', 'Stellar Forge', ['COIL', 'HULL'], 19.5, -14.75, {
    for: 'The &6Stellar Forge&r is a furnace that holds a fragment of a star.',
      needs: 'A UEV hull, eleven electric blast furnaces, twenty-three HfTaCN coil blocks, four UEV field generators, five UEV pumps, three UEV sensors, three ULE cavities, three HfTaCN heating elements and six UEV circuits. It is a large structure (15x23x15): GTM\'s Terminal places about 2,300 per pass and this one takes two.',
    unlocks: 'The hottest recipes in the pack, which the Mk4 plasma line runs on.',
    automate: 'Fuel and heat sinks by ME; plan for the byproducts before you start.',
    }, [], 150),

  // ------------------------------------------------------------------ photonics
  gear('SNSPD', 'snspd_foundry', 'SNSPD Foundry', ['CH_SIN'], 7, -20.25, {
    for: 'The &6SNSPD Foundry&r grows a nanowire detector that counts single photons.',
      needs: 'Four UHV hulls, ten UHV sensors, ten UHV emitters, eleven UHV pumps, fourteen UHV circuits, three float-zone silicon wafers, four SiN Waveguide Chips, three silicon drift detectors and the photonic casing. It takes the detector stages of the Photonic Fab.',
      unlocks: 'The single-photon detector, which the UEV sensor, the quantum photonic chip and the repeater node take.',
      automate: 'Wafers and chips by ME and superfluid helium by pipe for the cold stage; send finished detectors on by ME.',
  }, [PHOTO]),
    gear('VDW', 'vdw_stacker', 'Van der Waals Stacker', ['SNSPD'], 9.75, -22.5, {
    for: 'The &6Van der Waals Stacker&r lays one atomic film on another, in the order the design asks for.',
      needs: 'Three UHV hulls, nine UHV robot arms, nine conveyor modules, nine pistons, eleven UHV circuits, three hBN films, five annealed hBN films, two graphene films and the photonic casing. It lays the films of the Photonic Fab.',
    unlocks: 'The graphene modulator and the hBN emitter chip.',
    automate: 'Films by ME; the stacker returns finished chips in a chest.',
  }, [PHOTO]),
  gear('PHOT', 'photonic_integration_hall', 'Photonic Integration Hall', ['SNSPD', 'VDW', 'CH_GRM', 'CH_QD', 'CH_SIN'], 12.75, -17.75, {
    for: 'The &6Photonic Integration Hall&r bonds waveguides, sources and detectors into one optical chip.',
      needs: 'Five UHV hulls, thirteen UHV emitters, thirteen sensors, thirteen motors, seventeen UHV circuits, four quantum dot sources, four graphene modulators, five SiN Waveguide Chips and the photonic casing; the Van der Waals Stacker is its research. It is a large structure (23x11x23): GTM\'s Terminal places about 2,300 per pass and this one takes two.',
    unlocks: 'The waveguide circuit, the quantum photonic chip and the optical computer.',
    automate: 'Parts in matched counts by ME; keep a stock of finished chips and send them to the assembler.',
  }, [PHOTO, it('gtceu:laminated_glass')], 150),

  // ------------------------------------------------------------------ fusion
  gear('POL', 'helium3_polariser', 'Helium-3 Polariser', ['H_FIBRE'], 15, -10.25, {
    for: 'The &6Helium-3 Polariser&r aligns the spin of each nucleus, so more of them fuse.',
    needs: 'Four UHV hulls, ten UHV emitters and sensors each, eleven UHV pumps, fourteen UHV circuits, four 1083 nm lasers, seven Wf/W tiles, three SiC/SiC plates and the clean casing.',
    unlocks: 'Polarised helium-3, the fuel of the Mk4 ring.',
    automate: 'Helium-3 by pipe; keep the polarised stock sealed and ready.',
  }, [CLEAN]),
  prod('HE3', 'Polarised Helium-3', 'gtceu:polarised_helium_3_bucket', ['POL'], 18, -9.75, ['A bucket of polarised helium-3. Fusion at Mk4 starts from this.']),
  gear('MK4', 'uev_fusion_reactor', 'Mk4 Fusion Reactor', ['POL', 'COIL', 'HULL'], 24.5, -15, {
    for: 'The &6Mk4 Fusion Reactor&r is a ring that burns polarised helium-3 and deuterium into the most energy a reactor makes.',
      needs: 'A UEV hull, five UEV emitters, four UEV sensors, four UEV field generators, nine UEV circuits, two UEV fusion casings, two HfTaCN coil blocks and a Wf/W tile; the Helium-3 Polariser is its research. It is a large structure (33x9x33) and GTM\'s Terminal places about 2,300 per pass, so plan two.',
      unlocks: 'The plasma and burn quests that follow it.',
    automate: 'Fuel and coolant by pipe; build the plant before you light it.',
    }, [it('grindless:uev_fusion_casing')], 180),

  // ------------------------------------------------------------------ quantum gases and entanglement
  gear('QGL', 'quantum_gas_lab', 'Quantum Gas Lab', ['COOL'], 21.75, -9.75, {
    for: 'The &6Quantum Gas Lab&r holds a cloud of atoms a millionth of a degree above zero.',
      needs: 'Eight UHV hulls, sixteen UV sensors, thirty-two UHV circuits, eight lithium and seven potassium cooling lasers, eight ULE cavities and the photonic casing; the atom interferometer is its research.',
      unlocks: 'The degenerate EOS model, and cold atoms for the entanglement station.',
    automate: 'Atoms by hatch and lasers by ME; the lab is slow and small, so run two.',
  }, [PHOTO]),
    prod('COOL', 'Cooling Lasers', 'grindless:li_cooling_laser', ['H_FIBRE'], 11.75, -8.25, ['The lithium and potassium cooling lasers come from a fibre draw run on a UEV emitter, lithium-6 and potassium-40. The Quantum Gas Lab needs both.']),
    prod('EOS', 'Degenerate EOS Model', 'grindless:degenerate_eos_model', ['QGL'], 28, -17, ['Computed in the Quantum Gas Lab in Earth orbit from the lithium and potassium isotope dusts, the two cooling lasers and helium. The Degenerate Harvester and the Warp Gate hold both consume one.'], 100),
    gear('ENT', 'entanglement_station', 'Entanglement Station', ['QGL', 'SNSPD'], 27.25, -13.25, {
      for: 'The &6Entanglement Station&r ties two photons together across a distance.',
      needs: 'Eight UHV hulls, sixteen UV emitters, thirty-two UHV circuits, eight SPDC sources, eight hollow-core fibres, eight SNSPDs and the photonic casing; the Quantum Gas Lab is its research.',
      unlocks: 'The quantum repeater node, which the wireless hatches take.',
      automate: 'Parts by ME; send the nodes on by ME.',
    }, [PHOTO], 150),

  // ------------------------------------------------------------------ Alpha Centauri
  gear('NEB', 'nebula_collector', 'Nebula Collector', ['H_ALPHA', 'HULL'], 21.25, -29.5, {
    for: 'The &6Nebula Collector&r gathers gas from a nebula and sorts it by element.',
      needs: 'A UEV hull, five UEV pumps, four UEV sensors, three UEV emitters, three scoop coils, three aerogel tiles, any UEV circuit and the photonic casing.',
      unlocks: 'Gas streams that the Alpha Centauri lines consume, and the Interstellar Dust Lab.',
    automate: 'Run it on a pipe loop to the plant and send the surplus to a tank.',
  }, [PHOTO], 150),
    gear('DUST', 'interstellar_dust_lab', 'Interstellar Dust Lab', ['NEB'], 22.75, -29.5, {
    for: 'The &6Interstellar Dust Lab&r studies grains of dust that formed around other stars.',
      needs: 'A UEV hull, five UEV robot arms, five UEV pumps, three UEV sensors, three aerogel tiles, a TEOS flask, any UEV circuit and the photonic casing; the Nebula Collector is its research.',
      unlocks: 'The iron-60 record and the dust data the star charts use, and the Pulsar Timing Station.',
    automate: 'Dust by ME; log the records and store the rest.',
  }, [PHOTO], 150),
    gear('PULS', 'pulsar_timing_station', 'Pulsar Timing Station', ['DUST'], 23.5, -28, {
    for: 'The &6Pulsar Timing Station&r keeps time with a pulsar and finds the way by it.',
      needs: 'A UEV hull, five UEV emitters, four UEV sensors, three UEV robot arms, two lobster-eye MCPs, three silicon drift detectors, two nuclear clocks, any UEV circuit and the photonic casing; the Interstellar Dust Lab is its research.',
      unlocks: 'The Pulsar Navigation Chart, which the way to Sirius B and the UIV casing line need.',
    automate: 'The station asks for little by ME; keep a stock of charts for the gate.',
  }, [PHOTO], 150),

  // ------------------------------------------------------------------ Barnard b
  gear('MOND', 'carbonyl_refinery', 'Carbonyl Refinery', ['H_BARN', 'HULL'], 25.5, -20.75, {
    for: 'The &6Carbonyl Refinery&r turns iron and carbon monoxide into a liquid and back, leaving a very pure metal.',
      needs: 'Two UEV hulls, fourteen UEV circuits, seven UEV pumps and fluid regulators each, five UEV pistons, five FFKM seals, two Ta2O5 dusts and the inert casing; the Barnard core drill is its research.',
    unlocks: 'Iron pentacarbonyl and pure iron, for the nitride magnets.',
    automate: 'Contain the carbon monoxide; keep the loop sealed and vented to a scrubber.',
  }, [it('gtceu:inert_machine_casing')], 150),
  prod('IPC', 'Iron Pentacarbonyl', 'gtceu:iron_pentacarbonyl_bucket', ['MOND'], 27.75, -21.75, ['The carrier that purifies Barnard iron. Handle it as a toxic fluid.']),

  // ------------------------------------------------------------------ Sirius B
  gear('SPEC', 'white_dwarf_spectrograph', 'White Dwarf Spectrograph', ['H_SIRIUS', 'HULL', 'SNSPD'], 30.75, -22.5, {
    for: 'The &6White Dwarf Spectrograph&r reads a dead star\'s light and from it the mass and radius.',
      needs: 'A UEV hull, four UEV sensors, five UEV emitters, three UEV pumps, an ULE cavity, three SNSPDs, two nuclear clocks, any UEV circuit and the photonic casing.',
      unlocks: 'The mass-radius chart, made in Sirius B orbit, and the Degenerate Works.',
    automate: 'The station asks for little by ME; keep a stock of charts.',
  }, [PHOTO], 150),
    gear('DEG', 'degenerate_harvester', 'Degenerate Works', ['SPEC', 'EOS'], 33.25, -24, {
    for: 'The &6Degenerate Works&r takes matter from a white dwarf and bottles it into a pellet that can be carried safely.',
      needs: 'A UEV hull, five UEV arms, five pumps, three sensors, five emitters, three regulators, nine UEV circuits, an EOS model, a mass-radius chart, two hollow-core fibres, two Faraday isolators, two SPDC sources and the degenerate containment casing; the spectrograph is its research. It is a large structure (21x15x29), so GTM\'s Terminal places it in two passes.',
      unlocks: 'Degenerate matter, made in Sirius B orbit, which the same works bottles at once: it runs the degenerate containment recipes itself.',
    automate: 'Keep the plant behind a containment loop; never pipe this matter. Cells and pellets move by ME.',
  }, [it('grindless:degenerate_containment_casing')], 150),
    { key: 'PELP', kind: 'step', title: 'Degenerate Pellet', icon: 'grindless:degenerate_pellet', deps: ['DEG'], x: 39, y: -26.25,
      desc: ['The pellet is taught in &6A White Dwarf in a Bottle&r; tick this once the Degenerate Works runs.'], tasks: [{ type: 'checkmark' }], rewards: [xp(20)] },
    prod('TENS', 'Tennessine Sample', 'grindless:tennessine_sample', ['SHL'], 36.25, -32, ['Counted tennessine atoms sealed in a capsule with aerogel, made in the Superheavy Chemistry Lab. The Warp Gate hold takes one and keeps it stored.'], 100),
  {
    key: 'H_ALPHA', kind: 'reading', title: 'Work at Alpha Centauri', icon: 'gtceu:nebula_collector',
    deps: ['ALPHA'], x: 19.5, y: -29.25,
    desc: [
      'What the first other star gives.',
      'Nebula gas, dust and the pulsar clock.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
  {
    key: 'H_SIRIUS', kind: 'reading', title: 'Work at Sirius B', icon: 'gtceu:white_dwarf_spectrograph',
    deps: ['SIRIUS'], x: 30, y: -24.5,
    desc: [
      'The white dwarf and its degenerate gas.',
      'The spectrograph, the gas and the pellet.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
  {
    key: 'H_BARN', kind: 'reading', title: 'Work at Barnard b', icon: 'gtceu:carbonyl_refinery',
    deps: ['BARN'], x: 19.75, y: -20.25,
    desc: [
      'The iron world and its carbonyl.',
      'The Mond line and the link to the network.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
  {
    key: 'H_FIBRE', kind: 'reading', title: 'Fibre and Quantum Lines', icon: 'gtceu:sic_fibre_plant',
    deps: ['J_HOME'], x: 2.75, y: -15.25,
    desc: [
      'Fibre, detectors, polarisers and the quantum gas line.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
];

// Long forward links to the chart quests: the lines are hidden, the dependencies stay.
for (const q of QUESTS) if (['ENT', 'SPEC', 'NEB'].includes(q.key)) q.raw = { ...(q.raw || {}), hide_dependency_lines: 'true' };
