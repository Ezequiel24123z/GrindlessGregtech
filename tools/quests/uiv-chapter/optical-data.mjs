// Quest data for uiv_optical: the optical mainframe (I1 of pl_uiv, docs/eras/lines-uev-uxv.md, section 8). Four quests follow the trunk of the line (the compute module, the comb, the comb-fed tensor core, the feeders); the tensor core and the mainframe stay on the circuits page, so the circuit that ends the age reads in one place. Recipes checked against the dump (fb65632509ee).
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UIV Optical Mainframe', origin: { x: 22, y: 13 } },
  filename: 'uiv_optical',
  era: 'uiv',
  role: 'optical',
  order: 4,
  icon: 'gtnn:optical_mainframe',
  autofocus: 'O_COMPUTE',
  title: 'UIV: Optical Mainframe',
  subtitle: ['Four passes through the photonic integration hall, and the feeders that supply them.'],
};

export const LINKS = [];

const o = (key, kind, title, icon, deps, x, y, teach, tasks, xpN) => ({
  key, kind, title, icon, deps, x, y, teach, desc: [], tasks, rewards: [xp(xpN)],
  ...(deps.some((d) => !d.startsWith('O_')) ? { raw: { hide_dependency_lines: 'true' } } : {}),
});

export const QUESTS = [
  o('O_COMPUTE', 'process', 'Photonic Compute Module', 'grindless:photonic_compute_module', ['CH_ASIC'], 0, 0, {
    for: 'The &6Photonic Integration Hall&r joins chips by light. The first pass puts a Quantum Photonic Chip on a crossbar and makes the &6Photonic Compute Module&r, the part every later pass builds on.',
    needs: 'In the photonic integration hall (a circuit 12 program): a Quantum Photonic Chip and a Crossbar on Interposer. The crossbar is a phase-change memory array (four PCM photonic dies and a GST target, in the photonic foundry with ultrapure water and argon) set on an etched glass interposer in an assembler.',
    unlocks: 'The photonic tensor core, the next pass of the same hall.',
    automate: 'Chips and crossbars by ME; the hall makes one module per run, so give it its own pattern provider.',
  }, [it('grindless:quantum_photonic_chip'), it('grindless:crossbar_on_interposer'), it('grindless:photonic_compute_module')], 150),
  o('O_COMB', 'process', 'Electro-Optic Microcomb', 'grindless:eo_microcomb', ['CH_LNSIN'], 0, 2.5, {
    for: 'A ring of silicon nitride turns one laser into hundreds of evenly spaced colours, and a lithium niobate layer on it lets a voltage steer them. The &6EO Microcomb&r is the clock of the tensor core.',
    needs: 'In the TFLN Fab (a circuit 4 program): an annealed damascene ring and an LNOI wafer. The ring is the damascene silicon nitride wafer annealed in the photonic foundry (circuit 10) with ultrapure water and argon.',
    unlocks: 'The comb-fed tensor core.',
    automate: 'Rings and wafers by ME; one comb goes into each tensor core, so keep a small stock.',
  }, [it('grindless:annealed_damascene_ring'), it('grindless:eo_microcomb')], 150),
  o('O_COMBFED', 'circuit', 'Comb-Fed Tensor Core', 'grindless:comb_fed_tensor_core', ['CH_TENSOR', 'O_COMPUTE', 'O_COMB'], 3.5, 1.25, {
    for: 'The third pass of the hall sets the comb on the tensor core, so every multiplication is timed by the same colours. The &6Comb-Fed Tensor Core&r is the arithmetic of the mainframe.',
    needs: 'In the photonic integration hall (a circuit 13 program): a Photonic Tensor Core and an EO Microcomb.',
    unlocks: 'The optical mainframe.',
    automate: 'Feed the hall by ME from the two stocks; one core per mainframe.',
  }, [it('grindless:comb_fed_tensor_core')], 180),
  {
    key: 'O_FEED', kind: 'reading', title: 'The Feeders of the Mainframe', icon: 'gtceu:photonic_integration_hall',
    deps: ['O_COMBFED'], x: 7, y: 3.75,
    desc: [
      'The mainframe is the fourth pass of the hall, and four lines feed it.',
      'The &6Crossbar on Interposer&r goes in at the first pass. The &6BEUV Driver ASIC&r, with its scanner, mirrors and comb, goes in at the second. The &6EO Microcomb&r, from the TFLN Fab, joins at the third.',
      'At the last pass come the &6Six-Hour Memory&r, the &6P:Si Processor&r and two &6Optical Assemblies&r, each made from three optical processors and three quantum memory chips in the photonic foundry (circuit 5). Three more feeders (an EO transceiver, a telecom memory and a pumped EDFA) are the optical processors\' own parts.',
      'The UIV Lines chart draws the whole of it, and every feeder can be automated apart from the others.',
    ],
    tasks: [{ type: 'checkmark' }], rewards: [xp(25)],
  },
];
