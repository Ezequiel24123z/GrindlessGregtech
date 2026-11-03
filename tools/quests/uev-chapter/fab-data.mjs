// Quest data for uev_fab: the quantum photonic fab, the long line (E1 of pl_uev, docs/eras/lines-uev-uxv.md, section 8) that turns a float-zone silicon wafer
// into the quantum photonic chip and the optical computer. Eight stages, one quest each; the wafers of the line are taught here and no longer as single wafer
// quests. Machines, circuits and the UEV parts keep their own quests; these ask for what each stage makes. Recipes checked against the dump (804cc913d48a).
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UEV Photonic Fab', origin: { x: 22, y: 40 } },
  filename: 'uev_fab',
  era: 'uev',
  role: 'fab',
  order: 10,
  icon: 'grindless:quantum_photonic_chip',
  autofocus: 'F_SIN',
  title: 'UEV: Photonic Fab',
  subtitle: ['The long line from a silicon wafer to the optical computer.'],
};

export const LINKS = [];

const f = (key, title, icon, deps, x, y, teach, tasks, xpN, far = false) => ({
  key, kind: 'process', title, icon, deps, x, y, teach, desc: [], tasks, rewards: [xp(xpN)],
  ...(far ? { raw: { hide_dependency_lines: 'true' } } : {}),
});

export const QUESTS = [
  f('F_SIN', 'The Silicon Nitride Platform', 'grindless:sin_etched_wafer', ['CH_SIN'], 0, 0, {
    for: 'Light travels in silicon nitride with almost no loss, so the fab starts with a platform of it.',
    needs: 'Float-zone silicon wafers from the &6Cutter&r; the &6Electric Blast Furnace&r at 1800 K with oxygen; a reactor with silane and ammonia; the &6Synchrotron&r with an X-ray mask and PMMA (circuit 6); a reactor with water and hydrofluoric acid; the photonic foundry with ultrapure water and argon (circuit 7).',
    unlocks: 'The annealed SiN chip, bonded to lithium niobate as the waveguide circuit.',
    automate: 'Every stage is a plain machine fed by ME, one pattern provider each. The X-ray mask is the only part that is not used up; keep a spare.',
  }, [it('grindless:sin_lithographed_wafer'), it('grindless:sin_etched_wafer')], 120, true),
  f('F_DET', 'Waveguides and Detectors', 'grindless:detector_waveguide_wafer', ['F_SIN', 'SNSPD', 'CH_WG'], 3, 0, {
    for: 'The waveguide circuit carries the light; the nanowire that counts single photons is grown on top of it. Two passes through the &6SNSPD Foundry&r make the detector wafer.',
    needs: 'The waveguide circuit (an annealed SiN chip and an LNOI wafer in the Photonic Integration Hall, circuit 1); then tungsten silicide dust with argon in the foundry (circuit 10) for the WSi waveguide wafer, and PMMA resist (circuit 11) to pattern the nanowire.',
    unlocks: 'The detector waveguide wafer: every later stage of the fab builds on it, and the stages after it.',
    automate: 'Keep tungsten silicide and PMMA stocked by ME. The foundry is a big machine, so queue both passes from one pattern provider.',
  }, [it('grindless:wsi_waveguide_wafer'), it('grindless:detector_waveguide_wafer')], 140, true),
  f('F_MOD', 'Graphene on Boron Nitride', 'grindless:encapsulated_ring_wafer', ['F_DET', 'VDW', 'CH_GRM'], 6, 0, {
    for: 'A ring modulator needs a sheet of graphene held between two sheets of boron nitride. The &6Van der Waals Stacker&r lays them one on the other, with no glue.',
    needs: 'A graphene film (PMMA-coated graphene washed in acetone) and annealed hBN film (ammonia borane to borazine, grown on copper foil, then annealed in the electric blast furnace at 1800 K with argon). The stacker adds the graphene (circuit 4), then the boron nitride (circuit 5).',
    unlocks: 'The encapsulated ring wafer, and the graphene modulator that the quantum photonic chip and the UEV emitter take.',
    automate: 'Films are small and cheap; stock both by ME. The stacker returns one wafer per pass, so give it a dedicated output.',
  }, [it('grindless:graphene_film'), it('grindless:annealed_hbn_film'), it('grindless:encapsulated_ring_wafer')], 140, true),
  f('F_ELEC', 'Electrodes', 'grindless:electroded_photonic_wafer', ['F_MOD'], 9, 0, {
    for: 'Voltage has to reach the modulator and the detector. The photonic foundry deposits the gold and titanium electrodes.',
    needs: 'The encapsulated ring wafer, gold foil, titanium foil and nitrogen in the photonic foundry (circuit 29).',
    unlocks: 'The electroded photonic wafer, ready to receive its light sources.',
    automate: 'Foils by ME; this is a single machine step with a short buffer, so it rarely needs attention.',
  }, [it('grindless:electroded_photonic_wafer')], 100),
  f('F_QD', 'Quantum Dot Sources', 'grindless:hybrid_quantum_wafer', ['F_ELEC', 'CH_QD'], 12, 0, {
    for: 'A single-photon source is an indium arsenide dot a few nanometres wide. A micropillar wafer is bonded onto the electroded wafer in the stacker to make the hybrid.',
    needs: 'The InAs quantum dot wafer (MBE with arsine, gallium arsenide wafer and seven-nines indium), a chemical reactor with distilled water for the micropillar wafer, and the stacker (circuit 6) to join it to the electroded wafer. The same micropillar wafer, with gold and indium dust, makes the QD source of the UEV parts.',
    unlocks: 'The hybrid quantum wafer.',
    automate: 'Contain the arsine loop. One micropillar wafer is spent per hybrid wafer and one more per source, so size the MBE to both.',
  }, [it('grindless:micropillar_wafer'), it('grindless:hybrid_quantum_wafer')], 140, true),
  f('F_CLAD', 'Cladding and Dicing', 'grindless:quantum_photonic_die', ['F_QD', 'PHOT'], 15, 0, {
    for: 'The finished wafer is sealed under a cladding layer and cut into dies. One wafer gives four.',
    needs: 'MOCVD with silane and oxygen (circuit 9) for the clad quantum wafer, which gives back water; then the &6Cutter&r with water.',
    unlocks: 'The quantum photonic die.',
    automate: 'Run the cutter on its own line and send the four dies on by ME; a cracked cut cannot be undone, so never feed it by hand.',
  }, [it('grindless:clad_quantum_wafer'), it('grindless:quantum_photonic_die')], 120, true),
  f('F_PACK', 'Pigtail and Cryopackage', 'grindless:quantum_photonic_chip', ['F_CLAD'], 18, 0, {
    for: 'A die is useless until fibre reaches it and it sits in cold helium. The Photonic Integration Hall pigtails and packages it.',
    needs: 'A quantum photonic die and a normal optical pipe in the hall (circuit 11) for the pigtailed die; then superfluid helium (circuit 2) for the quantum photonic chip.',
    unlocks: 'The quantum photonic chip, the core of the UEV circuit.',
    automate: 'Superfluid helium by pipe; keep the optical pipes by ME. A few chips in stock is enough: the next stage takes one each.',
  }, [it('grindless:pigtailed_quantum_die'), it('grindless:quantum_photonic_chip')], 160),
  f('F_COMP', 'The Optical Computer Line', 'gtnn:optical_computer', ['F_PACK'], 21, 0, {
    for: 'The last stage mounts the chip on two optical assemblies: the &6Optical Computer&r, the circuit of the whole age.',
    needs: 'A quantum photonic chip and two optical assemblies in the Photonic Integration Hall (circuit 3).',
    unlocks: 'Every UEV circuit slot. To automate the whole line, keep the fab in one connected block of machines with wafers moving by ME, the hall as the last stop, and one chest of computers at the end.',
    automate: 'Give each wafer stage its own pattern provider and a two-wafer buffer, route the byproducts (silicon dust, water, hydrogen) to storage or a void, and craft computers only as the hulls ask for them.',
  }, [it('gtnn:optical_computer')], 200),
];
