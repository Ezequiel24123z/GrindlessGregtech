// Quest data for maxplus_machines: machines 1 to 11 of ours and the Hyperfactory (docs/eras/maxplus.md, "Machines" and "Mega member";
// docs/reforge/05_quest_design.md, sections 2.3 and 3.2). Machines 12 to 17 are XP-C2c's. One gear per machine, in the order a player meets them: the refinery
// and the press at the shell, the slingshot, the two machines of 30 Doradus and the burner, the Stream's gas works and torus, then M31, the filament and home.
// Each gear asks for the controller and the casings that are new in this era; hull, components and circuits belong to maxplus_circuits, line intermediates to
// the charts, so the product quests ask only for what the machine exists to make or for the parts it wears. The two generators are taught as machines here;
// how they feed the wireless network is maxplus_integration's (PW_NI, PW_TORUS). Each gear hangs from the journey key that first needs it, never from a quest its
// own machine produces. All keys are new (prefix MA_).
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  filename: 'maxplus_machines',
  era: 'maxplus',
  role: 'machines',
  order: 4,
  icon: 'gtceu:hyperfactory',
  autofocus: 'MA_REF',
  title: 'MAX+: Machines',
  subtitle: ['From a refinery for bound matter to a slingshot, a stellar lift, a fusion torus and the Hyperfactory.'],
};

export const LINKS = [
  { key: 'MA_L_TAP', ref: 'TAP', x: 0, y: 0 },
  { key: 'MA_L_SETTLED', ref: 'SETTLED', x: 0, y: 4.5 },
  { key: 'MA_L_CW', ref: 'CW', x: 0, y: 6.5 },
  { key: 'MA_L_PROBE', ref: 'PROBE', x: 0, y: 8 },
  { key: 'MA_L_LMC', ref: 'LMC', x: 0, y: 10 },
  { key: 'MA_L_RAW', ref: 'RAW', x: 0, y: 12 },
  { key: 'MA_L_CASK', ref: 'CASK', x: 0, y: 15.5 },
  { key: 'MA_L_STREAM', ref: 'STREAM', x: 0, y: 17.5 },
  { key: 'MA_L_PD', ref: 'PD', x: 0, y: 19.5 },
  { key: 'MA_L_PHE3', ref: 'PHE3', x: 0, y: 21 },
  { key: 'MA_L_M31', ref: 'M31', x: 0, y: 23 },
  { key: 'MA_L_TETHER', ref: 'TETHER', x: 0, y: 24.5 },
  { key: 'MA_L_VOID', ref: 'VOID', x: 0, y: 26 },
  { key: 'MA_L_SCALE', ref: 'SCALE', x: 0, y: 28 },
];

// A row's first quest depends on the quest its link points at.
const REF = Object.fromEntries(LINKS.map((l) => [l.key, l.ref]));
const deps_ = (d) => d.map((k) => REF[k] || k);

const gear = (key, id, title, deps, x, y, teach, extra = [], xpN = 150, kind = 'machine') => ({
  key, kind, title, icon: 'gtceu:' + id, deps: deps_(deps), x, y, teach, desc: [],
  tasks: [it('gtceu:' + id), ...extra], rewards: [xp(xpN)],
});

const prod = (key, title, icon, deps, x, y, desc, xpN = 100) => ({
  key, kind: 'step', title, icon, deps: deps_(deps), x, y, desc, tasks: [it(icon)], rewards: [xp(xpN)],
});

export const QUESTS = [
  // ------------------------------------------------------------------ the condensate refinery
  gear('MA_REF', 'condensate_refinery', 'Condensate Refinery', ['MA_L_TAP'], 2.5, 0, {
    for: 'The only machine that handles &6Kerr Condensate&r. It settles the fluid and binds older exotic matter into it: strange matter, neutronium, degenerate billets, strand cladding and the cells the components use.',
    needs: 'The MAX hull, a shell of condensate vessel casing round a superfluid core, and condensate from the mirror shell.',
    unlocks: 'Every bound material, and the strand that makes the MAX+ cable.',
    automate: 'Its boil-off goes back into the first recipe, and spent cells go to the helium plant, so nothing is vented.',
  }, [it('grindless:condensate_vessel_casing')]),
  prod('MA_CLAD', 'Strand Cladding', 'grindless:kerr_clad_strand', ['MA_REF'], 5, 0, [
    'Its fourth recipe clads a strand of strange matter in condensate. It is the start of the cable line, which the circuits chapter finishes at the wire.',
  ]),
  prod('MA_CELL', 'Jacketed Condensate Cell', 'grindless:jacketed_condensate_cell', ['MA_REF'], 5, 1.5, [
    'Condensate will not travel loose, so the helium plant jackets it in a cell. This is the form in which it leaves the shell.',
  ]),
  prod('MA_BIND', 'Bound Neutronium Ingot', 'grindless:bound_neutronium_ingot', ['MA_REF'], 5, 3, [
    'Neutronium pellets, pressed at a megabar, are bound into the fluid here. The press then turns the ingot into the plate that half the era is built from.',
  ]),

  // ------------------------------------------------------------------ the bound-matter press
  gear('MA_PRESS', 'bound_matter_press', 'Bound-Matter Press', ['MA_L_SETTLED'], 2.5, 4.5, {
    for: 'The only place a plate can be pressed under the shell\'s field. The &6Bound-Matter Press&r makes the compressed plate, and a laminate, in numbers no other machine can reach.',
    needs: 'The MAX hull, a block of bound press casing, and bound ingots from the refinery. Parts and wear are explained in the casing\'s tooltip.',
    unlocks: 'Horizon compressed plate by the ten thousand, and graded laminate for shielding.',
    automate: 'Feed ingots by ME and send the plates onward on a belt; the press flash goes back to its own input.',
  }, [it('grindless:bound_press_casing')]),
  prod('MA_LAM', 'Graded Laminate', 'grindless:graded_horizon_laminate', ['MA_PRESS'], 5, 4.5, [
    'A ceramic cermet pressed in layers, the second use of the press. It is the first piece of the shielding that the loom weaves later.',
  ]),

  // ------------------------------------------------------------------ the slingshot, the signature machine
  gear('MA_SLING', 'hills_slingshot', 'Hills Slingshot', ['MA_L_CW', 'MA_L_PROBE'], 2.5, 7.25, {
    for: 'Out of the Galaxy without a rocket. It binds a probe to a counterweight, then drops the pair on a plunging orbit past the hole. The tide splits them, and the probe leaves at speed.',
    needs: 'The MAX hull, a capture ring of slingshot coil casing, a counterweight and a probe, and a full wireless hatch.',
    unlocks: 'The launched probe, and with it every gate that leaves the Galaxy.',
    automate: 'One counterweight per launch. The weight falls into the hole, so make them in bulk.',
  }, [it('grindless:slingshot_coil_casing')], 250, 'signature'),

  // ------------------------------------------------------------------ 30 Doradus
  gear('MA_LIFT', 'tarantula_stellar_lift', 'Tarantula Stellar Lift', ['MA_L_LMC'], 2.5, 10, {
    for: 'Magnetic fields heat a star\'s outer layers and funnel them off. At the very massive stars of R136 the lift reaches core plasma that no smaller star shows.',
    needs: 'The MAX hull, a tower of lift nozzle casing, nozzles, and a full wireless hatch at the Tarantula.',
    unlocks: 'The plasma that the crucible burns, and a helium-rich fraction.',
    automate: 'Its nozzle wears one in thirty-two runs. Keep a pattern for spare nozzles.',
  }, [it('grindless:lift_nozzle_casing')]),
  prod('MA_NOZ', 'Lift Nozzle', 'grindless:vms_lift_nozzle', ['MA_LIFT'], 5, 10, [
    'The nozzle sits in the hottest part of the lift and wears out. A spare in the bus is a lift that never stops.',
  ]),
  gear('MA_CRUC', 'pair_instability_crucible', 'Pair-Instability Crucible', ['MA_L_RAW'], 2.5, 12, {
    for: 'Stars above about 140 solar masses end by making nickel-56 in bulk. The crucible forces that burn on lifted plasma in a magnetic pinch.',
    needs: 'The MAX hull, a sphere of crucible liner casing, confined plasma, and liner spares.',
    unlocks: 'Nickel-56 slugs, the fuel of the burner, and a silicon-rich ash.',
    automate: 'The ash is not waste: it goes to the 30 Doradus separation row. The liner wears one in sixteen runs.',
  }, [it('grindless:crucible_liner_casing')]),
  prod('MA_ASH', 'Intermediate-Mass Ash', 'grindless:ime_ash', ['MA_CRUC'], 5, 13.5, [
    'Silicon, sulfur, calcium and argon come out of the pinch with the nickel. A separation row takes them back, so the crucible makes no waste.',
  ]),
  prod('MA_LINER', 'Crucible Liner', 'grindless:crucible_liner', ['MA_CRUC'], 5, 12, [
    'The liner takes the whole pinch. It wears quickly, so a spare belongs in every chest the crucible draws from.',
  ]),

  // ------------------------------------------------------------------ the nickel-56 burner
  gear('MA_BURN', 'nickel_56_burner', 'Nickel-56 Burner', ['MA_L_CASK'], 2.5, 15.5, {
    for: 'A supernova glows on the decay of nickel-56 into cobalt, then iron. The burner turns that heat into power through supercritical carbon dioxide, in two recipes.',
    needs: 'The MAX hull, atomic casing and coils, and shielded casks of nickel-56 from the crucible.',
    unlocks: 'A generator of the era. The network lesson is the integration chapter\'s.',
    automate: 'A cask is used twice and comes out as iron. Loop it to the hot cell.',
  }),
  prod('MA_FE', 'Spent Iron Cask', 'grindless:spent_fe56_cask', ['MA_BURN'], 5, 15.5, [
    'After two decays the cask holds iron-56. The hot cell takes it apart and gives the iron back.',
  ]),

  // ------------------------------------------------------------------ the Magellanic Stream
  gear('MA_GAS', 'pristine_gas_works', 'Pristine Gas Works', ['MA_L_STREAM'], 2.5, 17.5, {
    for: 'The Stream\'s gas has a tenth of solar metals, with deuterium close to the Big Bang value. A magnetic scoop gathers it as the &6Pristine Gas&r the works refines.',
    needs: 'The MAX hull, atomic casing and coils in a ring, and a magnetic scoop module.',
    unlocks: 'Primordial deuterium and pristine helium-3, the fuel of the torus.',
    automate: 'The protium it leaves goes to the home hydrogen line by AE2.',
  }),
  prod('MA_SCOOP', 'Magnetic Scoop Module', 'grindless:magnetic_scoop_module', ['MA_GAS'], 5, 17.5, [
    'A cold coil on a long arm. It gathers the gas, and without one the works makes nothing.',
  ]),
  gear('MA_TORUS', 'primordial_fusion_torus', 'Primordial Fusion Torus', ['MA_L_PD', 'MA_L_PHE3'], 2.5, 20.25, {
    for: 'Deuterium and helium-3 fuse with few neutrons, and a direct converter catches their charged products. It is a generator of ours, not a GTM fusion tier.',
    needs: 'The MAX hull, a torus of atomic casing, deuterium and helium-3 together, a beam injector and a converter stack.',
    unlocks: 'A second generator of the era. How it feeds the network is in the integration chapter.',
    automate: 'Both fuels arrive by pipe from the works; each runs 2,400 ticks.',
  }),
  prod('MA_NBI', 'Neutral Beam Injector', 'grindless:neutral_beam_injector', ['MA_TORUS'], 5, 19.5, [
    'It heats the fuel to ignition and wears one in sixty-four runs.',
  ]),
  prod('MA_DCS', 'Direct Converter Stack', 'grindless:direct_converter_stack', ['MA_TORUS'], 5, 21, [
    'The stack turns the charged products of the fusion straight into current. It wears one in a hundred and twenty-eight runs.',
  ]),

  // ------------------------------------------------------------------ M31, the filament and home
  gear('MA_FORGE', 'blueshift_forge', 'Blueshift Forge', ['MA_L_M31', 'MA_L_TETHER'], 2.5, 23.75, {
    for: 'Light falling to a factory held near a horizon arrives blueshifted, as gamma rays. The forge uses that bath for photonuclear reactions that make the rare isotopes.',
    needs: 'The MAX hull, horizon casing in a tower over a tether well, a deep tether and a molybdenum target.',
    unlocks: 'Photonuclear isotopes, which no other machine can make.',
    automate: 'The tether and window wear one in thirty-two runs; keep spares.',
  }, [], 150),
  prod('MA_TARGET', 'Enriched Molybdenum Target', 'grindless:enriched_mo_target', ['MA_FORGE'], 5, 23.75, [
    'The target takes the gamma bath and comes out as a mix of isotopes. Enrich it from older stock; the forge only irradiates.',
  ]),
  gear('MA_FAB', 'void_crystal_fab', 'Void Crystal Fab', ['MA_L_VOID'], 2.5, 26, {
    for: 'The emptiest place in the pack has no dust and no heat to spoil a crystal. The fab grows diamond there, and holds the holographic block that the creative store needs.',
    needs: 'The MAX hull, an open frame of horizon casing, and seed plates cut at home.',
    unlocks: 'Void-grown diamond and the engineered lattice that ends the stage.',
    automate: 'Seed plates and blocks travel by chest. Run it by pattern.',
  }, []),
  gear('MA_LOOM', 'meta_material_loom', 'Meta-Material Loom', ['MA_L_SCALE'], 2.5, 28, {
    for: 'Four meta-materials in one machine: shielding, waveguide, conduit and valve. It weaves them from bound plates, strand and condensate, several steps in one.',
    needs: 'The MAX hull, horizon casing, plates from the press, and no pump or regulator: the loom uses its own valve.',
    unlocks: 'About 380,000 of each meta-material for the gate, and the valves for pumps.',
    automate: 'Run four recipes at once and give each its own output bus.',
  }, []),
  gear('MA_HYPER', 'hyperfactory', 'Hyperfactory', ['MA_L_SCALE'], 2.5, 30, {
    for: 'The top of the mega family. It runs assembler, circuit assembler, assembly line, forming press and laser engraver at four thousand times a hatch\'s parallel.',
    needs: 'The MAX hull, horizon casing, the MAX+ parallel hatch and a pattern bus for every recipe it should take.',
    unlocks: 'The millions of parts the tree and the gate need. It is a convenience, not a step.',
    automate: 'Feed it by ME and let the parallels do the counting.',
  }, [], 250),
];
