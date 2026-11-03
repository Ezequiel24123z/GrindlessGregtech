// Quest data for uiv_machines: the 22 UIV multiblocks, and the neutronium compression hall that the mega family adds, in the order a player meets them
// (docs/eras/uiv.md, "Our multiblocks"; docs/reforge/05_quest_design.md, sections 2 and 3.2). Each machine quest asks for the controller and the casings
// and coil blocks new in this era; wafers and chips are taught on the UIV circuits page, and line intermediates on the UIV Lines
// chart, so product quests ask for end products only. Rows start at a link to a uiv_age quest: the place quests for the three stars, START elsewhere.
// Fiction (the metallic hydrogen quench, the crust lift, neutronium, the Penrose run) is said in the text.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UIV Machines', origin: { x: 5, y: 26.25 }, heading: { key: 'H_MACH1', x: 0, y: 0, deps: ['H_LADDER'], icon: 'gtceu:ramp_compression_pulser', desc: [
      'Pulsers, levitation, polarised sources and the shell machine.',
      'The machines of this age start here.',
    ] } },
  filename: 'uiv_machines',
  era: 'uiv',
  role: 'machines',
  order: 2,
  icon: 'gtceu:matrioshka_computer',
  autofocus: 'PULSER',
  title: 'UIV: Machines',
  subtitle: ['Metallic hydrogen and light at home, a fusion ring, a computer round the Sun; then a neutron star, a pulsar and a black hole.'],
};

export const LINKS = [];

// A row's first quest depends on the era quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

const gear = (key, id, title, deps, x, y, teach, extra = [], xpN = 150) => ({
  key, kind: 'machine', title, icon: 'gtceu:' + id, deps: deps_(deps), x, y, teach, desc: [],
  tasks: [it('gtceu:' + id), ...extra], rewards: [xp(xpN)],
});

const prod = (key, title, icon, deps, x, y, desc, xpN = 100) => ({
  key, kind: 'step', title, icon, deps: deps_(deps), x, y, desc, tasks: [it(icon)], rewards: [xp(xpN)],
});

const UEV = it('gtceu:uev_machine_casing');
const UIV = it('gtceu:uiv_machine_casing');
const PHOTO = it('grindless:photonic_casing');
const CRYO = it('grindless:cryostat_casing');
const COILGUN = it('grindless:coilgun_coil_casing');
const MHCOIL = it('grindless:metallic_hydrogen_coil_block');
const SITE = it('grindless:neutron_star_site_casing');

export const QUESTS = [
  // ------------------------------------------------------------------ metallic hydrogen and RHEA
  gear('PULSER', 'ramp_compression_pulser', 'Ramp Compression', ['H_MACH1'], 3, -4.75, {
    for: 'The &6Ramp Compression Pulser&r squeezes cold hydrogen until it turns metallic. The squeeze is real; the quench is fiction, as nobody has kept metallic hydrogen once the pressure is gone.',
    needs: 'A UEV machine hull, three UEV pistons, UEV circuits, three balanced RHEA impellers, two strain-wave gears and three FFKM seals; the UEV casing and the coilgun coil casing that pulses the pressure.',
    unlocks: 'Metallic hydrogen, and lonsdaleite and cubic gauche nitrogen beside it.',
    automate: 'Hydrogen by pipe; spent shards return to the cryogenic plant, so loop them.',
  }, [UEV, COILGUN]),
  prod('P_MH', 'Metallic Hydrogen', 'gtceu:metallic_hydrogen_ingot', ['PULSER'], 5.5, -4.75, ['An ingot of metallic hydrogen. The UIV Lines chart shows how far one run stretches it, and what the cable and the coil take.']),
  gear('LEV', 'levitation_melter', 'Levitation Melter', ['H_MACH1'], 3, -2.75, {
    for: 'A melt held in the air by a magnetic field never touches a crucible, so nothing dissolves into it. The &6Levitation Melter&r pours RHEA and the alloys that crucibles ruin.',
    needs: 'A UEV machine hull, three UEV pistons, UEV circuits, halbach arrays, impregnated GdBCO and iridium crucibles; the UEV casing and a levitation trap.',
    unlocks: 'The RHEA ingot, and the glass and tile lines that start from it.',
    automate: 'Alloy powders by ME; the beryllium fume is captured, so route the scrubber output.',
  }, [UEV]),
  prod('P_RHEA', 'RHEA Ingot', 'gtceu:rhea_ingot', ['LEV'], 5.5, -2.75, ['Five refractory metals melted together without a crucible. The UIV parts are cased in it.']),
  prod('HULL', 'UIV Machine Hull', 'gtceu:uiv_machine_hull', ['P_MH', 'P_RHEA'], 8, -3.75, ['The assembly line joins 2 UIV casings, 3 metallic hydrogen cables, 6 RHEA plates, 3 FFKM seals (compressed from FFKM dust, and the research) with soldering alloy, lubricant and neutronium. It takes no circuit. Every UIV controller, hatch and the circuit assembler is built on it.'], 150),

  // ------------------------------------------------------------------ light and the mainframe
  gear('LNSIN', 'tfln_fab', 'TFLN Fab', ['H_MACH2'], 3.5, 6, {
    for: 'The &6TFLN Fab&r slices thin lithium niobate onto silicon nitride, and also makes silicon-28 wafers, poled niobate and the electro-optic comb, in a cleanroom.',
    needs: 'A UIV hull, the UEV casing and the photonic casing.',
    unlocks: 'The LN-on-Si3N4 wafer on the UIV circuits page.',
    automate: 'LNOI and nitride wafers by ME; the donor silicon goes back to refining.',
  }, [UEV, PHOTO]),
  gear('FIVED', 'femtosecond_writer', 'Femtosecond Writer', ['LNSIN'], 6, 6, {
    for: 'A laser pulse a millionth of a millionth of a second long can write inside glass. The &6Femtosecond Writer&r etches the 5D crystal and prints lattices.',
    needs: 'A UIV hull, the UEV casing and the photonic casing for the air-bearing stage.',
    unlocks: 'The 5D crystal, and printed parts that no mill can reach.',
    automate: 'Silica blanks by ME; solvent recovery takes the uncured resin.',
  }, [UEV, PHOTO]),
  gear('BEUV', 'beuv_scanner', 'BEUV Scanner', ['FIVED'], 8.5, 6, {
    for: 'A terbium plasma gives light at a wavelength nobody built a scanner for before. The &6BEUV Scanner&r exposes wafers at 6.7 nanometres.',
    needs: 'A UIV hull, the UEV casing and the photonic casing.',
    unlocks: 'The BEUV-exposed wafer and the driver ASIC.',
    automate: 'Terbium debris returns by pipe after the mirrors are cleaned; wafers by ME.',
  }, [UEV, PHOTO]),
  gear('SIXH', 'spectral_hole_burner', 'Spectral Hole Burner', ['BEUV'], 11, 6, {
    for: 'The &6Spectral Hole Burner&r burns a comb of holes into a europium-doped YSO crystal slab with superfluid helium, so it remembers light for hours.',
    needs: 'A UIV hull and the cryostat casing, on superfluid helium.',
    unlocks: 'The slab of the six-hour memory.',
    automate: 'Crystals by ME and helium by pipe; it gives off nothing else.',
  }, [CRYO]),
  gear('PSI', 'stm_lithography_cell', 'STM Lithography Cell', ['SIXH'], 13.5, 6, {
    for: 'The &6STM Lithography Cell&r peels hydrogen off silicon one atom at a time with a scanning tip, and a second step doses the holes with phosphine.',
    needs: 'A UIV hull, the UEV casing and the photonic casing around an ultra-high vacuum chamber.',
    unlocks: 'The patterned wafer; the P:Si die follows in molecular beam epitaxy.',
    automate: 'Phosphine is contained, then scrubbed to phosphoric acid; run two cells, the tip is slow.',
  }, [UEV, PHOTO]),
  gear('MK', 'millikelvin_cryostat_works', 'Millikelvin Cryostat Works', ['PSI'], 16, 6, {
    for: 'Colder than the superfluid helium plant ever gets. The &6Millikelvin Cryostat Works&r makes the mK cryostat module and finishes the P:Si processor.',
    needs: 'A UIV hull, the cryostat casing and metallic hydrogen coil blocks for the magnet.',
    unlocks: 'The cryostat module and the P:Si processor.',
    automate: 'The helium mixture returns to the works; send modules on by ME.',
  }, [CRYO, MHCOIL], 180),

  // ------------------------------------------------------------------ polarised fusion
  gear('POLSRC', 'polarised_proton_source', 'Polarised Proton Source', ['H_MACH1'], 3, -0.75, {
    for: 'Fuse nuclei with their spins lined up and you get about half as much again. The &6Polarised Proton Source&r freezes hydrogen, lithium hydride and ammonia into pellets that remember.',
    needs: 'A UIV hull, the cryostat casing and metallic hydrogen coil blocks for the polarising magnet.',
    unlocks: 'Polarised pellets, the fuel of the Mk5 ring.',
    automate: 'Gas by pipe; depolarised gas returns to the source, so close the loop.',
  }, [CRYO, MHCOIL], 180),
  prod('P_PELLET', 'Polarised Pellet', 'grindless:polarised_h_pellet', ['POLSRC'], 3, 1, ['Frozen hydrogen that remembers its spin. Mk5 burns three fuels, and each one starts at this source.']),
  gear('RING', 'uiv_fusion_reactor', 'Mk5 Fusion Reactor', ['POLSRC', 'HULL'], 10.5, -0.75, {
      for: 'The &6Mk5 Fusion Reactor&r has an octagon of casing round an empty channel, lined with metallic hydrogen coils. It holds a very large buffer and takes sixteen hatches.',
      needs: 'Two UIV hulls, UIV components, UIV circuits, about 520 UIV fusion casings, 1,350 RHEA casings, 1,000 metallic hydrogen field casings, 80 metallic hydrogen coil blocks and sixteen UIV energy hatches. The ring is too large for one pass of GTM\'s Terminal, which places about 2,300 per pass, so it takes two.',
    unlocks: 'The three polarised burns, and the direct energy converter that turns plasma into power.',
    automate: 'Build the fuel plant before you light the ring; helium-3 and protons return to their lines.',
  }, [it('grindless:uiv_fusion_casing'), MHCOIL], 250),

  // ------------------------------------------------------------------ Mercury
  gear('MATR', 'matrioshka_computer', 'Matrioshka Computer', ['H_MACH1'], 3, 3, {
    for: 'A computer built in shells, in nine times Earth\'s sunlight, running logic that makes barely any heat. The &6Matrioshka Computer&r is where UIV research is written.',
    needs: 'Two UIV hulls, UIV components, UIV circuits, the UIV casing, about 1,600 RHEA casings, 22 droplet radiator modules and 200 logic tiles. It is too large for one pass of GTM\'s Terminal, which places about 2,300 per pass, so it takes two. Its chart and research rows run in Mercury orbit.',
    unlocks: 'Verified writes, the Kerr and equation of state charts, and the radiators that carry its heat.',
    automate: 'Logic tiles are among the longest builds here: stock them by ME and send the waste heat to the radiators.',
  }, [UIV], 250),
  gear('RAD', 'droplet_radiator_works', 'Droplet Radiators', ['MATR'], 5.5, 3, {
    for: 'Heat has nowhere to go in space but out. Liquid tin droplets falling in free fall carry it away, which only works in orbit. The &6Droplet Radiator Works&r builds the modules.',
    needs: 'A UIV hull, UIV components and the UIV casing; the modules need no particular place.',
    unlocks: 'Radiator modules, and the TPV tiles of the Matrioshka shell.',
    automate: 'Tin overflow returns to stock; ship modules down by ME.',
  }, [UIV], 200),
  prod('P_MODULE', 'Radiator Module', 'grindless:droplet_radiator_module', ['RAD'], 8, 3, ['A module of droplet radiator. The UIV Lines chart shows what it cools.']),

  // ------------------------------------------------------------------ RX J1856.5-3754
  gear('CRUST', 'crust_lift', 'Crust Lift', ['H_CRUST'], 14, -35.25, {
    for: 'A tether down to the poles and the star\'s own electric field carry a little of the crust up. The &6Crust Lift&r is fiction: no tether survives that gravity, and the yield is a game number.',
    needs: 'A UIV hull, the UIV casing and the neutron star site casing, with a winch.',
    unlocks: 'Crust matter, which the Neutron Drip Works takes apart.',
    automate: 'Nothing here is voided: crust ions and nuclei go to their own tanks.',
  }, [UIV, SITE], 250),
  prod('P_CRUST', 'Neutron Star Crust', 'grindless:neutron_star_crust', ['CRUST'], 14, -37, ['A slab of crust, lifted from a star that has no ground. Everything taken from it is contained.']),
  gear('DRIP', 'neutronium_cage', 'Neutron Drip Works', ['CRUST'], 16.5, -35.25, {
    for: 'Deep in the crust neutrons leak out between the nuclei. The &6Neutron Drip Works&r takes them away, then cools them into a superfluid and shuts it in a cage: the neutronium pellet, which is fiction, a spoonful of neutron matter held by a field. Pick the separation or cage recipe type.',
    needs: 'A UIV hull, the UIV casing, the neutron star site casing (about 720), the metallic hydrogen field casing (about 420) and the dilution cryostat casing (about 130), with 24 coil blocks. It measures 21 by 13 by 29.',
    unlocks: 'Drip neutrons for the r-process, and the neutronium pellet that the stored proof asks for.',
    automate: 'Drip neutrons decay if you wait: use them at once. Keep pellets by ME.',
  }, [UIV, SITE, it('grindless:mh_field_casing'), it('grindless:dilution_cryostat_casing')], 300),
  prod('P_DRIP', 'Drip Neutrons', 'gtceu:drip_neutrons_bucket', ['DRIP'], 16.5, -37, ['A bucket of free neutrons that will not wait. Use it the moment it arrives.']),
  {
    key: 'P_PELLET_N', kind: 'reading', title: 'What the Pellet Is', icon: 'grindless:neutronium_pellet',
    deps: ['DRIP'], x: 19, y: -37,
    desc: ['It is not the neutronium of the other mods: it is a pellet of neutron matter. The journey asks for it once; keep one for the hall and one for the stored proof.'],
    tasks: [{ type: 'checkmark' }], rewards: [xp(25)],
  },
  gear('HALL', 'neutronium_compression_hall', 'Neutronium Compression Hall', ['DRIP'], 21.5, -35.25, {
    for: 'The &6Neutronium Compression Hall&r reads the pellets in its bus as parallels, and never uses them up. The mega family adds it at UIV.',
    needs: 'A UIV hull, the neutron star site casing and a pellet in its bus.',
    unlocks: 'Parallel runs of older recipes; its implosion mode keeps the explosive, so switch the mode in its own window first.',
    automate: 'Pellets stay in the hall; feed the batches by ME.',
  }, [SITE], 250),
  gear('E119', 'r_process_decompressor', 'R-Process Decompressor', ['DRIP'], 16.5, -32.75, {
    for: 'Decompress a bit of crust and the heavy elements are born, as in a kilonova. The &6R-Process Decompressor&r also hits uranium with the same neutrons, for einsteinium and fermium.',
    needs: 'A UIV hull, the UIV casing and the neutron star site casing, with a neutron guide.',
    unlocks: 'The Element 119 Recoil Record, Census II and the sealed kilonova capsule.',
    automate: 'Sort the output by element; ash goes to the platinum plant.',
  }, [UIV, SITE], 300),
  gear('VAULT', 'decay_heat_vault', 'Decay Heat Vault', ['E119'], 19, -32.75, {
    for: 'Fresh r-process matter keeps decaying and giving off heat. The &6Decay Heat Vault&r burns a sealed capsule for power, and its power is local to the site.',
    needs: 'A UIV hull, the UIV casing and the neutron star site casing, and the generator recipes the controller runs.',
    unlocks: 'Site power for the star, so the machines there do not wait on the wireless grid.',
    automate: 'Capsules by ME; the ash goes back to the platinum plant.',
  }, [UIV, SITE], 250),

  // ------------------------------------------------------------------ PSR J0437-4715
  gear('WIND', 'pulsar_wind_trap', 'Pair Wind', ['H_WIND'], 21.5, -21.75, {
    for: 'A pulsar blows a wind of electrons and positrons. The &6Pulsar Wind Trap&r catches a sample in a tungsten-lined magnet, and the gamma rays heat the lining.',
    needs: 'A UIV hull and the UIV casing, with a lining that takes the heat.',
    unlocks: 'Pair plasma, which the condensate lab cools.',
    automate: 'Pair plasma stays sealed; pipe it to the lab and cool the lining.',
  }, [UIV], 250),
  prod('P_PAIR', 'Pair Plasma', 'gtceu:pair_plasma_bucket', ['WIND'], 21.5, -20, ['A bucket of electrons and positrons held in a field. It annihilates if the field fails, so keep it sealed.']),
  gear('PS', 'positronium_condensate_lab', 'Positronium Condensate Lab', ['WIND'], 24, -21.75, {
    for: 'An electron and a positron orbiting each other, laser-cooled in aerogel until they act as one. The &6Positronium Condensate Lab&r makes the Ps BEC. Nobody has made one yet, so this one is a proposal.',
    needs: 'A UIV hull, the UIV casing and the cryostat casing.',
    unlocks: 'The Ps BEC, and with it the gamma laser cavity of the UIV emitter.',
    automate: 'Aerogel by ME and pair plasma by pipe; run two labs, because the condensate is short-lived.',
  }, [UIV, CRYO], 250),
  gear('PROF', 'xray_pulse_profiler', 'Pulse Profile', ['H_WIND'], 21.5, -18, {
    for: 'A pulsar blinks hundreds of times a second. The &6X-ray Pulse Profiler&r folds the blinks into a profile and times it against a clock at home.',
    needs: 'A UIV hull and the UIV casing; it is the observatory step after the UEV pulsar station.',
    unlocks: 'Timed profiles, four of which the navigation solution needs.',
    automate: 'Run it on a loop and send each timed profile on by ME.',
  }, [UIV]),

  // ------------------------------------------------------------------ Cygnus X-1
  gear('PROBE', 'ergosphere_probe_bay', 'Probe Run', ['H_PROBE'], 29, -36.75, {
    for: 'Drop a probe into the ergosphere and read how fast the hole spins. The probe does not come back, and nobody needs it to. The &6Ergosphere Probe Bay&r also loads the sleds.',
    needs: 'A UIV hull and the UIV casing, with a drop rail.',
    unlocks: 'Probe data for the Kerr chart, and loaded sleds for the Penrose engine.',
    automate: 'Probes by ME; send the data home, since it is the only thing that returns.',
  }, [UIV], 250),
  prod('P_PROBED', 'Kerr Probe Data', 'grindless:kerr_probe_data', ['PROBE'], 31.5, -36.75, ['A record of how the hole spins. The Matrioshka turns it into the Kerr chart that the gate asks for.']),
  gear('PENROSE', 'penrose_engine', 'Penrose Engine', ['PROBE'], 29, -34.75, {
    for: 'The &6Penrose Engine&r drops a sled into the ergosphere. The sled splits, one half falls in and the other comes out with more energy than it took in. The hole spins a little slower. It is fiction.',
    needs: 'A UIV hull and the UIV casing, with a drop rail; about 1,200 metallic hydrogen field casings, 620 RHEA casings and 64 coil blocks. It fills about one whole pass of GTM\'s Terminal.',
    unlocks: 'Power for the gate load, and the recovered half-sled for the gate store.',
    automate: 'Sleds by ME; send each recovered half back to the bay for a refit.',
  }, [UIV], 300),
  {
    key: 'P_HALF', kind: 'reading', title: 'Recovered Half-Sled', icon: 'grindless:recovered_half_sled',
    deps: ['PENROSE'], x: 31.5, y: -34.75,
    desc: ['The half that comes back. It goes to the bay for a refit, and one goes into the stored proof; the journey asks for it once.'],
    tasks: [{ type: 'checkmark' }], rewards: [xp(25)],
  },
  {
    key: 'H_CRUST', kind: 'reading', title: 'Work at the Dead Star', icon: 'gtceu:crust_lift',
    deps: ['JUMP1'], x: 11, y: -34,
    desc: [
      'The crust of the neutron star.',
      'Lifting it, dripping it and the machines that follow.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
  {
    key: 'H_PROBE', kind: 'reading', title: 'Work at Cygnus X-1', icon: 'gtceu:ergosphere_probe_bay',
    deps: ['JUMP3'], x: 26, y: -34,
    desc: [
      'The spinning hole and what it gives.',
      'The probe, the Penrose extraction and the sensor row.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
  {
    key: 'H_WIND', kind: 'reading', title: 'Work at the Pulsar', icon: 'gtceu:pulsar_wind_trap',
    deps: ['JUMP2'], x: 18.5, y: -19,
    desc: [
      'The wind of a lighthouse star.',
      'Pair plasma and the timed profile.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
  {
    key: 'H_MACH2', kind: 'reading', title: 'Light on Niobate', icon: 'gtceu:tfln_fab',
    deps: ['H_MACH1'], x: 0.5, y: 6.75,
    desc: [
      'The niobate on silicon line, five dimensional storage and extreme light.',
    ],
    tasks: [{ type: 'checkmark' }],
    rewards: [],
  },
];
