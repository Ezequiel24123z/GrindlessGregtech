// Quest data for uv_machines: one gear per multiblock of ours, the casings and parts each one asks for that are new in this era, and the product
// quests that close each row (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/uv.md, "Our multiblocks"). Gear keys moved here from
// uv_age keep their ids. Intermediates belong to the pl_uv chart.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.machines,
  filename: 'uv_machines',
  era: 'uv',
  role: 'machines',
  order: 2,
  icon: 'gtceu:laser_fusion_chamber',
  autofocus: 'U233',
  title: 'UV: Machines',
  subtitle: ['Thorium and cold, light and materials, a closed ark, and the stations at Neptune and Pluto.'],
};

export const LINKS = [
  { key: 'M_L_TH', ref: 'START', x: 0, y: 0 },
  { key: 'M_L_HEAT', ref: 'START', x: 0, y: 1.5 },
  { key: 'M_L_FUS', ref: 'START', x: 0, y: 3 },
  { key: 'M_L_COLD', ref: 'START', x: 0, y: 4.5 },
  { key: 'M_L_ACC', ref: 'START', x: 0, y: 6 },
  { key: 'M_L_FIB', ref: 'START', x: 0, y: 7.5 },
  { key: 'M_L_DET', ref: 'START', x: 0, y: 9 },
  { key: 'M_L_MAT', ref: 'START', x: 0, y: 10.5 },
  { key: 'M_L_PRINT', ref: 'START', x: 0, y: 12 },
  { key: 'M_L_PROP', ref: 'START', x: 0, y: 13.5 },
  { key: 'M_L_LIFE', ref: 'START', x: 0, y: 15 },
  { key: 'M_L_SAIL', ref: 'START', x: 0, y: 16.5 },
  { key: 'M_L_FAC', ref: 'START', x: 0, y: 18 },
  { key: 'M_L_NEP', ref: 'STN5', x: 0, y: 21 },
  { key: 'M_L_HRT', ref: 'STN6', x: 0, y: 24 },
  { key: 'M_L_KBO', ref: 'STN6', x: 0, y: 25.5 },
  { key: 'M_L_EDGE', ref: 'STN6', x: 0, y: 27 },
];

// A row's first quest depends on the era quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

// One multiblock gear: controller plus the casings and parts new in this era.
const gear = (key, id, title, deps, x, y, teach, tasks, xpN = 120) => ({
  key, kind: 'machine', title, icon: id.includes(':') ? id : `gtceu:${id}`, deps: deps_(deps), x, y,
  teach, desc: [], tasks: [it(id.includes(':') ? id : `gtceu:${id}`), ...tasks], rewards: [xp(xpN)],
});

// One product or material quest that closes a row.
const prod = (key, title, icon, deps, x, y, text, tasks, xpN = 80) => ({
  key, title, icon, deps: deps_(deps), x, y, desc: [text], tasks, rewards: [xp(xpN)],
});

const UVC = 'gtceu:uv_machine_casing';
const SHIELD = 'gtnn:radiation_proof_machine_casing';
const CLEAN = 'gtceu:clean_machine_casing';
const TRUSS = 'grindless:station_truss_casing';
const CRYO = 'grindless:srf_cryomodule_block';
const LASER = 'grindless:laser_module_block';
const CRYOSTAT = 'grindless:cryostat_casing';
const HULL = 'grindless:pressure_hull_casing';

export const QUESTS = [
  // ------------------------------------------------------------------ thorium
  gear('U233', 'pyroprocessing_cell', 'Pyroprocessing', ['M_L_TH'], 2, 0, {
    for: 'The &6Pyroprocessing Cell&r takes spent thorium fuel apart in molten salt and gives back uranium-233 and nitrogen-15.',
    needs: 'Its controller and the &6Radiation-Proof Casing&r that contains the salt.',
    unlocks: 'Uranium-233 for fuel rods, and nitrogen-15 for the nitride fuel.',
    automate: 'Feed spent fuel by ME and loop the salt in its own tank; never let it run dry.',
  }, [it(SHIELD)]),
  gear('ADR', 'accelerator_driven_reactor', 'Accelerator-Driven Reactor', ['U233'], 4, 0, {
    for: 'The &6Accelerator-Driven Reactor&r burns the thorium you stored at IV, kept subcritical by a proton beam. Power from it stops the moment the beam does.',
    needs: 'Its controller, UV machine casing, superconducting coils and the &6SRF Cryomodule Block&r that holds the beam cold.',
    unlocks: 'Thorium as a generator, and the fuel assemblies the cell recycles.',
    automate: 'Fuel assemblies by ME from the fabrication plant; spent ones go straight back to the cell.',
  }, [it(UVC), it(CRYO)]),
  prod('P_U233', 'Uranium-233 Rod', 'grindless:u233_fuel_rod', ['ADR'], 6, 0,
    'The cell\'s uranium-233 becomes a &6U-233 Fuel Rod&r for the fission reactor you built at IV. Thorium fuel closes its own loop.',
    [it('grindless:u233_fuel_rod')]),

  // ------------------------------------------------------------------ heat sources
  gear('CURIUM', 'heat_source_works', 'Heat Source Works', ['M_L_HEAT'], 2, 1.5, {
    for: 'The &6Heat Source Works&r presses and sinters curium-244 into the pellets a probe carries in place of sunlight.',
    needs: 'Its controller and radiation-proof casing; the curium comes from the ZPM partitioning plant.',
    unlocks: 'The probe RTG and the americium micro source.',
    automate: 'Curium moves in sealed pipes and buses only; send the pellets on by ME.',
  }, [it(SHIELD)]),
  prod('P_PELLET', 'Curium Heat', 'grindless:curium_244_pellet', ['CURIUM'], 4, 1.5,
    'A &6Curium-244 Pellet&r gives off heat for years. Wrapped in a &6GPHS Module&r it is the only power a probe has past Neptune.',
    [it('grindless:curium_244_pellet'), it('grindless:gphs_module')]),

  // ------------------------------------------------------------------ fusion
  gear('ALPHA', 'laser_fusion_chamber', 'Laser Fusion Chamber', ['M_L_FUS'], 2, 3, {
    for: 'The &6Laser Fusion Chamber&r fuses a proton and boron-11 into three alpha particles. No neutrons, and the output is helium-4.',
    needs: 'Its controller, UV casing and the &6Laser Module Block&r ring that focuses the beams.',
    unlocks: 'Aneutronic power from boron capsules.',
    automate: 'Capsules arrive by ME and the helium goes back to the compressor loop.',
  }, [it(UVC), it(LASER)], 150),
  gear('MUCF', 'muon_fusion_cell', 'Muon Fusion Cell', ['P_CAV'], 8, 4.5, {
    for: 'The &6Muon Fusion Cell&r makes cold fusion with muons as the catalyst: deuterium and tritium fuse close to room temperature.',
    needs: 'Its controller, the cryostat casing and the &6SRF Cryomodule Block&r that drives the muon channel.',
    unlocks: 'A second fusion generator that needs no plasma.',
    automate: 'Keep a deuterium-tritium tank on a pipe and let the helium out by ME.',
  }, [it(CRYOSTAT), it(CRYO)]),

  // ------------------------------------------------------------------ cold and accelerators
  gear('HE2', 'superfluid_helium_plant', 'Superfluid Helium', ['M_L_COLD'], 2, 4.5, {
    for: 'The &6Superfluid Helium Plant&r cools helium below its lambda point, where it flows without friction, and splits Neptune\'s helium with a superleak.',
    needs: 'Its controller, the &6Cryostat Casing&r, a &6Mu-Metal Shield&r that keeps stray fields off the cold stage, and the stainless gearboxes that run the cold compressors.',
    unlocks: 'Helium II for the cryomodules and the cavity works.',
    automate: 'Gas arrives by pipe; stock helium II in a dedicated tank.',
  }, [it(CRYOSTAT), it('grindless:mu_metal_shield')]),
  gear('CAV', 'srf_cavity_works', 'Cavity Works', ['HE2'], 4, 4.5, {
    for: 'The &6SRF Cavity Works&r melts niobium very pure (RRR sheet), deep-draws it into half-cells (two from each sheet), welds eighteen half-cells into a nine-cell bare cavity, polishes it in acid, and welds on a titanium helium vessel to dress it.',
    needs: 'Its controller and clean room casing; niobium ingots and helium II run through it.',
    unlocks: 'Dressed cavities (eight make a string) for the cryomodule, the accelerators and the synchrotron.',
    automate: 'The spent acid is electrolysed back to niobium and both acids: keep that loop closed. Take cavities out by ME.',
  }, [it(CLEAN), it('grindless:rrr_niobium_sheet'), it('grindless:niobium_half_cell'), it('grindless:bare_srf_cavity')]),
  prod('P_CAV', 'Niobium Cavity', 'grindless:srf_cavity', ['CAV'], 6, 4.5,
    'A finished &6SRF Cavity&r is niobium cut to a few microns of surface roughness; welded into its helium vessel it becomes a &6Dressed SRF Cavity&r, and eight dressed cavities in superfluid helium make the cryomodule. Every beam machine of this era sits on them.',
    [it('grindless:srf_cavity'), it('grindless:dressed_srf_cavity'), it('grindless:mu_metal_shield')]),

  gear('SYNC', 'synchrotron', 'Synchrotron', ['M_L_ACC'], 2, 6, {
    for: 'Bend a beam round a ring and it shines X-rays. The &6Synchrotron&r prints through an X-ray mask and makes the antiprotons the trap stores.',
    needs: 'Its controller, UV casing and the &6SRF Cryomodule Block&r; the target is activated and has to be contained.',
    unlocks: 'Patterned wafers for the photonic chip, and antiprotons.',
    automate: 'Run it off a stock of masks and wafers by ME; the target goes out sealed.',
  }, [it(UVC), it(CRYO)]),
  prod('P_ANTI', 'Antiproton Cartridge', 'grindless:antiproton_cartridge', ['SYNC'], 4, 6,
    'Protons on a tungsten target throw off a trickle of antiprotons. An &6Antiproton Cartridge&r is the only way to carry them out of the ring.',
    [it('grindless:antiproton_cartridge')]),
  gear('ANTI', 'antimatter_trap', 'Antimatter Trap', ['P_ANTI'], 6, 6, {
    for: 'The &6Antimatter Trap&r holds antiprotons in a magnetic bottle in Earth orbit, far from anything they could touch.',
    needs: 'Its controller and the &6Station Truss Casing&r of an orbital build.',
    unlocks: 'ICAN pellets for the sail and the launch.',
    automate: 'Hand cartridges to the trap by ME; never stack more than one trap on a hatch.',
  }, [it(TRUSS)]),

  // ------------------------------------------------------------------ light
  gear('YBF', 'fibre_draw_tower', 'Fibre Draw Tower', ['M_L_FIB'], 2, 7.5, {
    for: 'The &6Fibre Draw Tower&r pulls a preform of ytterbium-doped glass into optical fibre, and writes the grating that makes it a laser. MCVD makes the preform in three operations: soot deposited inside a fused silica tube, solution doping with ytterbium, then drying, sintering and collapse. Ultraviolet light writes the Bragg grating.',
    needs: 'Its controller, clean room casing, PTFE pipe and a heatproof draw furnace; fused silica tubes, silicon tetrachloride and ytterbium chloride solution.',
    unlocks: 'The fibre laser modules for the fusion chamber and the sail launcher.',
    automate: 'Chlorine from the soot goes to the network and the glass dust goes back in; keep both sealed and stock the fibre by ME.',
  }, [it(CLEAN), it('grindless:fused_silica_tube'), it('grindless:mcvd_soot_tube'), it('grindless:doped_soot_tube'), it('grindless:yb_doped_preform')]),
  prod('P_FIBRE', 'Fibre Laser Module', 'grindless:fibre_laser_module', ['YBF'], 4, 7.5,
    'A length of fibre with a Bragg grating at each end is a laser. The &6Fibre Laser Module&r is what the big chambers fire.',
    [it('grindless:fibre_laser_module')]),
  gear('PUMP', 'mocvd_reactor', 'MOCVD Reactor', ['P_FIBRE'], 6, 7.5, {
    for: 'The &6MOCVD Reactor&r grows compound semiconductors one atomic layer at a time. It makes the organometallics, grows indium gallium arsenide, cleaves diode bars (eight per wafer), coats the facets with alumina and titania mirrors, and mounts four bars on copper as a pump module. A niobium nitride film is its other job.',
    needs: 'Its controller, clean room casing, an inert casing for the gas cabinet and a filter hood; gallium, gallium arsenide wafers and arsine.',
    unlocks: 'InGaAs pump modules, which light the fibre, and the SNSPD film.',
    automate: 'Arsenic is contained: the arsine by-product goes to the scrubber as arsenic and hydrogen. Keep the scrubber supplied and the modules going out by ME.',
  }, [it(CLEAN), it('gtceu:inert_machine_casing'), it('grindless:ingaas_diode_bar'), it('grindless:coated_diode_bar')]),
  prod('P_DIODE', 'Pump Diode Module', 'grindless:ingaas_pump_module', ['PUMP'], 8, 7.5,
    'Diode bars stacked in a cooled mount make the &6InGaAs Pump Module&r that lights the fibre laser. The diode line builds it from InGaAs bars and a cooled mount, so it needs the pump line running. It unlocks the fibre laser and what that laser powers. Diodes go out by ME, a few at a time.',
    [it('grindless:ingaas_pump_module')]),

  // ------------------------------------------------------------------ detectors
  gear('HPGE', 'zone_refining_tower', 'Zone Refining Tower', ['M_L_DET'], 2, 9, {
    for: 'The &6Zone Refining Tower&r sweeps germanium\'s impurities to the ends of a bar, over and over, until it is purer than almost anything you make.',
    needs: 'Its controller and clean room casing; eight RF coils ring the tower.',
    unlocks: 'The HPGe crystal, further along.',
    automate: 'Germanium bars in and crystals out by ME; the tower runs for a long time per bar.',
  }, [it(CLEAN)]),
  gear('PROX', 'optical_ground_station', 'Optical Ground Station', ['HPGE'], 4, 9, {
    for: 'The &6Optical Ground Station&r is the only reader of the Starshot: a primary mirror, adaptive optics and a photon counter.',
    needs: 'Its controller, UV casing, aluminium mirror blocks, computer casings for the optics bench and an SNSPD array.',
    unlocks: 'The Proxima approach data.',
    automate: 'Nothing to automate: it waits for the probe. Keep it powered and chunk-loaded.',
  }, [it(UVC), it('gtceu:computer_casing')]),

  // ------------------------------------------------------------------ materials
  gear('BNNT', 'boron_nitride_reactor', 'Boron Nitride Reactor', ['M_L_MAT'], 2, 10.5, {
    for: 'The &6Boron Nitride Reactor&r grows hexagonal BN and boron nitride nanotubes, a fibre stronger than carbon that shrugs off neutrons.',
    needs: 'Its controller, UV casing, naquadah coils and a PTFE pipe run.',
    unlocks: 'BNNT yarn for the tank and the probe frames.',
    automate: 'Boron-10 comes from the hot cell; send the yarn on by ME.',
  }, [it(UVC)]),
  prod('P_YARN', 'BNNT Yarn', 'grindless:bnnt_yarn', ['BNNT'], 4, 10.5,
    'Spin the tubes and you get &6BNNT Yarn&r: light, strong and transparent to neutrons, so it is the fibre of the lightest parts. The yarn spinner makes it from boron nitride nanotubes, which need boron-10 from the hot cell. It unlocks the powder-in-tube line. Keep the tubes coming by ME and send the yarn on the same way.',
    [it('grindless:bnnt_yarn'), it('grindless:hbn_dust')]),
  gear('PIT', 'powder_in_tube_line', 'Powder-in-Tube Line', ['P_YARN'], 6, 10.5, {
    for: 'The &6Powder-in-Tube Line&r packs a wire powder into a silver sheath and draws it down, turning one ingot of material into four.',
    needs: 'Its controller and UV casing, a drawing bench and a furnace coil.',
    unlocks: 'EnTED wire for the UV network.',
    automate: 'Each billet eats one silver tube; the wire step returns silver dust. Remelt it into tubes and keep them stocked.',
  }, [it(UVC), it('grindless:silver_tube')]),
  prod('P_BILLET', 'Powder Billet', 'grindless:pit_billet', ['PIT'], 8, 10.5,
    'A drawn &6PIT Billet&r is a silver sheath filled with powder, ready to be rolled into wire. The powder-in-tube line makes it, and each one eats a silver tube. It unlocks the wire step and EnTED wire for the UV network. Remelt the returned silver into tubes and keep them stocked by ME.',
    [it('grindless:pit_billet'), it('grindless:silver_tube')]),

  gear('PRINT', 'powder_bed_printer', 'Powder Bed Printer', ['M_L_PRINT'], 2, 12, {
    for: 'The &6Powder Bed Printer&r melts atomised metal powder layer by layer into parts that no machine tool could cut.',
    needs: 'Its controller, UV casing and a heated bed under an argon blanket.',
    unlocks: 'Thruster chambers, array mounts and probe frames.',
    automate: 'Printing consumes most of its powder, and atomising loses a little argon. Keep both stocked and store the parts by ME.',
  }, [it(UVC)]),
  prod('P_PRINT', 'Printed Probe Frame', 'grindless:printed_probe_frame', ['PRINT'], 4, 12,
    'The &6Printed Probe Frame&r is the lightest rigid thing you build; the probe hangs from it. The powder bed printer prints it from atomised metal powder under argon. It unlocks the cryotank winder and every probe after it. Keep powder and argon stocked and store the frames in ME.',
    [it('grindless:printed_probe_frame')]),
  gear('TANK', 'cryotank_winder', 'Cryotank Winder', ['P_PRINT'], 6, 12, {
    for: 'The &6Cryotank Winder&r winds BNNT yarn round a liner into the tier 11 tank that level 7 rockets need.',
    needs: 'Its controller and UV casing; the resin trim is voidable.',
    unlocks: 'The level 7 fuel tank.',
    automate: 'Yarn and liners by ME; trim goes to a void.',
  }, [it(UVC)]),

  // ------------------------------------------------------------------ propulsion
  gear('KRYPTON', 'thruster_works', 'Thruster Works', ['M_L_PROP'], 2, 13.5, {
    for: 'The &6Thruster Works&r builds gridded ion and Hall thrusters that run on xenon and krypton instead of burning anything.',
    needs: 'Its controller, UV casing, a frostproof column and PTFE pipe.',
    unlocks: 'The thruster pod and the probe\'s long burn.',
    automate: 'Noble gas comes from the cryogenic plant by pipe; stock thrusters by ME.',
  }, [it(UVC)]),
  prod('P_ION', 'Ion Thrusters', 'grindless:ion_thruster', ['KRYPTON'], 4, 13.5,
    'Two kinds of thruster, one gas: the &6Ion Thruster&r for a long cruise and the &6Hall Thruster&r for a quick correction.',
    [it('grindless:ion_thruster'), it('grindless:hall_thruster')]),

  // ------------------------------------------------------------------ life
  gear('ARK', 'ark_biosphere', 'The Ark', ['M_L_LIFE'], 2, 15, {
    for: 'The &6Ark Biosphere&r is a closed ecosystem fed by Pluto\'s ices. It is the first greenhouse that keeps its own air.',
    needs: 'Its controller, a UV casing floor, glass walls and an anaerobic core of inert casing.',
    unlocks: 'The stem cells and feedstock the vat uses.',
    automate: 'Ice by ME from Pluto; the ark recycles the rest itself.',
  }, [it(UVC), it('gtceu:inert_machine_casing')]),
  gear('NEURO', 'neural_culture_vat', 'Neural Culture Vat', ['ARK'], 4, 15, {
    for: 'The &6Neural Culture Vat&r grows stem cells and neuro processing units in a single run.',
    needs: 'Its controller, plascrete, filter casing hoods and robust casing for the bioprinter.',
    unlocks: 'The wetware computer, further along.',
    automate: 'Media and stem cells by ME; the vat ships the units out.',
  }, [it('gtceu:plascrete')]),

  // ------------------------------------------------------------------ sail and launch
  gear('SAIL', 'light_sail_fab', 'Light Sail Fab', ['M_L_SAIL'], 2, 16.5, {
    for: 'The &6Light Sail Fab&r deposits a film a hundred nanometres thick on a carrier, then lifts it free as a sail.',
    needs: 'Its controller, the station truss casing, a Whipple shield and a tungsten heater.',
    unlocks: 'The sail every probe hangs from.',
    automate: 'Xenon and silicon tetrafluoride are kept: loop them; sails go out by ME.',
  }, [it(TRUSS)]),
  prod('P_SAIL', 'Light Sail', 'grindless:light_sail', ['SAIL'], 4, 16.5,
    'A &6Light Sail&r weighs almost nothing and reflects almost everything, so light alone can push a probe to another star. It is made at the sail line from thin reflective film, in an orbital build with a truss casing. It unlocks the Starchip Fab and the launch. Sails go out by ME, one for each run.',
    [it('grindless:light_sail')]),
  gear('SCFAB', 'starchip_fab', 'Starchip Fab', ['P_SAIL'], 6, 16.5, {
    for: 'The &6Starchip Fab&r bonds a photonic chip, an NV diamond chip and an americium micro source onto a neutronium wafer and dices out a one-gram starchip. The circuit picks the step: 1 the starchip, 2 the sailcraft (a starchip on a light sail).',
    needs: 'Its controller in a clean room hall: clean machine casing, stainless steel frames, plascrete, laminated glass, a filter casing ceiling and a gearbox bonding line. One Terminal pass.',
    unlocks: 'The starchip and the sailcraft that the launcher fires.',
    automate: 'Parts by ME; the wafer kerf is silicon dust, so loop it back to the silicon line.',
  }, [it(CLEAN)]),
  gear('LAUNCH', 'laser_sail_launcher', 'Laser Sail Launcher', ['SCFAB'], 8, 16.5, {
    for: 'The &6Laser Sail Launcher&r works on the Moon only, where no air scatters the beam. Circuit 1 pushes a sailcraft out of the Solar System as a Starshot probe; the heliopause data sets the course and is kept.',
    needs: 'Its controller in an open-sky array: UV casing, tungsten steel frames and pipe casings, fusion glass, a computer casing as beam director and a checkerboard of 228 &6Laser Module Blocks&r. One Terminal pass; it draws 16 A of UV.',
    unlocks: 'The probe in flight, and the data it sends home.',
    automate: 'Each launch spends a fibre laser module at 64 % and returns a spent one for the draw tower: keep sailcraft and modules stocked by ME.',
  }, [it(UVC), it(LASER)], 150),

  gear('MFAC', 'mega_factory', 'Mega Factory', ['M_L_FAC'], 2, 18, {
    for: 'The &6Mega Factory&r has sockets, and each takes a module that adds its own recipe types. Every installed module drinks PCB coolant.',
    needs: 'Its controller, a shell of UV casing, naquadah coils and the modules you mean to run.',
    unlocks: 'Separation, forming, cutting, mixing and heat in a single frame.',
    automate: 'Keep a PCB coolant tank on a pipe; the modules share it.',
  }, [it(UVC)], 200),

  // ------------------------------------------------------------------ Neptune
  gear('DEEPN', 'neptune_deep_siphon', 'Deep Neptune', ['M_L_NEP'], 2, 21, {
    for: 'The &6Neptune Deep Siphon&r drops a scoop through the methane deck for hydrogen rich in deuterium, and helium with a trace of helium-3.',
    needs: 'Its controller and the station truss casing; at least fourteen casings among its floor cells.',
    unlocks: 'The helium for the superleak and the Neptunian quantum seed.',
    automate: 'Pipe the gas home through the seed; no hand work.',
  }, [it(TRUSS)]),
  gear('TRITON', 'triton_geyser_sampler', 'Triton\'s Geysers', ['DEEPN'], 4, 21, {
    for: 'The &6Triton Geyser Sampler&r flies through the plumes of nitrogen ice that Triton throws, and brings back an ice core.',
    needs: 'Its controller, the station truss casing and a probe hangar of titanium frames.',
    unlocks: 'Triton nitrogen, and the ice core that grows the next seed.',
    automate: 'A cartridge per run by ME; collect the core and the nitrogen from the hatches.',
  }, [it(TRUSS)]),
  prod('P_TRITON', 'Triton Ice Core', 'grindless:triton_ice_core', ['TRITON'], 6, 21,
    'A &6Triton Ice Core&r is the catalyst the Pluto penetrator drills with, cut from Triton ice. It is made in the Triton line from the ice a probe brings back, so it needs that run first. It unlocks the Pluto penetrator. Keep the line stocked by ME, since the penetrator uses a core for every bore.',
    [it('grindless:triton_ice_core')]),

  // ------------------------------------------------------------------ Pluto
  gear('HEART', 'penetrator_probe_bay', 'Into the Heart', ['M_L_HRT'], 2, 24, {
    for: 'The &6Penetrator Probe Bay&r drops a probe that melts its way into the glacier of Sputnik Planitia and sends a core up.',
    needs: 'Its controller, the station truss casing and a pressure hull casing.',
    unlocks: 'The Sputnik ice core and the Plutonian quantum seed.',
    automate: 'Probes by ME; the bay returns the core in the same pass.',
  }, [it(TRUSS), it(HULL)]),
  prod('P_SPUT', 'Sputnik Ice Core', 'grindless:sputnik_ice_core', ['HEART'], 4, 24,
    'The &6Sputnik Ice Core&r is a column of nitrogen ice from the glacier, still layered the way it formed.',
    [it('grindless:sputnik_ice_core')]),
  gear('ICES', 'volatile_ice_fractionator', 'Ices Apart', ['P_SPUT', 'P_SAMPLE'], 6, 24, {
    for: 'The &6Volatile Ice Fractionator&r warms a core and collects each ice as it turns to gas. Circuit 1 splits a Sputnik core into nitrogen, carbon monoxide, methane and tholin; 2 a Charon core into water, ammonia and silica; 3 anneals a Kuiper sample at about 140 K, so its noble gases escape.',
    needs: 'Its controller in a cold tower: station truss casings, titanium frames, laminated glass, frostproof bands, a steel pipe cold finger and a ring of cryostat casings. One Terminal pass.',
    unlocks: 'The gases at their sources, and the Kuiper noble gas that the cryogenic plant splits into argon, krypton and xenon.',
    automate: 'Cores and samples in by ME, each fluid to its own hatch. The annealing dust is voided inside the machine.',
  }, [it(TRUSS), it('gtceu:frostproof_machine_casing'), it(CRYOSTAT)]),

  gear('KUIPER', 'kuiper_interceptor_bay', 'Arrokoth\'s Kin', ['M_L_KBO'], 2, 25.5, {
    for: 'The &6Kuiper Interceptor Bay&r launches a probe at a Kuiper belt object and brings a sample back.',
    needs: 'Its controller, the station truss casing and the probe hangar rail.',
    unlocks: 'The planetesimal sample.',
    automate: 'Probes by ME; the sample comes out in a canister.',
  }, [it(TRUSS)]),
  prod('P_SAMPLE', 'Planetesimal Sample', 'grindless:planetesimal_sample', ['KUIPER'], 4, 25.5,
    'A &6Planetesimal Sample&r is ice and dust that has not changed since the Solar System formed, so it is the one thing that shows what the young system was made of. A probe brings it back from the Kuiper Belt in a canister, so you need the probe line and a launch. It unlocks the annealing carousel of the fractionator, which keeps the ice as it was. Probes go out by ME and the canister comes back the same way.',
    [it('grindless:planetesimal_sample')]),
  gear('HELIO', 'precursor_probe_bay', 'Heliopause', ['M_L_EDGE'], 2, 27, {
    for: 'The &6Precursor Probe Bay&r sends a probe ahead along a rail to the edge of the Sun\'s wind, and listens to what it finds.',
    needs: 'Its controller, the station truss casing, a pressure hull casing and a computer casing relay.',
    unlocks: 'The heliopause data.',
    automate: 'Probes by ME; the data is one item per flight.',
  }, [it(TRUSS), it(HULL)]),
  gear('SHADOW', 'event_horizon_interferometer', 'The Shadow', ['HELIO'], 4, 27, {
    for: 'The &6Event Horizon Interferometer&r combines dishes across the Solar System into one telescope, aimed at the black hole at the galaxy\'s centre.',
    needs: 'Its controller, the station truss casing, a pressure hull casing, a dish and a maser clock.',
    unlocks: 'The Sgr A* image, the end of the Pluto row.',
    automate: 'Catalogue and data by ME; it needs no other input.',
  }, [it(TRUSS), it(HULL), it('gtceu:advanced_computer_casing')], 150),
  gear('NANO', 'gtca:nano_forge', 'Nano Forge', ['M_L_FAC'], 2, 21, {
    for: 'The &6Nano Forge&r is the UV hall that works matter by the atom, building nanoscale parts that no assembler can place.',
    needs: 'Its controller, built on an assembly line, and a UV energy hatch: it draws about 491,520 EU/t while it runs.',
    unlocks: 'The nanoscale parts of the late-game lines.',
    automate: 'Feed inputs by ME and pull the parts out by bus; give it its own power line.',
  }, [it(UVC)]),
  gear('PCBF', 'gtca:pcb_factory_mki', 'PCB Factory Mk I', ['M_L_FAC'], 2, 21, {
    for: 'The &6PCB Factory Mk I&r prints circuit boards in bulk, so the board and chip lines keep up with UV demand.',
    needs: 'Its controller, built on an assembly line, a cleanroom and a UV energy hatch: it draws about 491,520 EU/t while it runs.',
    unlocks: 'Boards at a rate the single assembler cannot hold, for every era after this one.',
    automate: 'Feed the inputs by ME and send the finished boards on by bus.',
  }, [it(UVC)]),
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
