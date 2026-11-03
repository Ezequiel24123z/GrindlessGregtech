// Quest data for the six Sagittarius casings, the body of every large MAX structure (recipes read from the VM dump, 9f6c31872, not from the design doc).
// One quest per casing: what it is for, how it is made, which machines are built from it and how to automate it. Block counts are read from structures.json.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: {
    name: 'Sagittarius casings',
    origin: { x: 76, y: 8 },
    heading: {
      key: 'H_MAX_BODY', x: 0, y: 0, deps: ['LOCK'], icon: 'grindless:tensegrity_truss_casing',
      desc: ['The six casings of Sagittarius A*: tensegrity truss, clamp coil, optical table, membrane vacuum, droplet radiator and shell window coil. They wall every large MAX structure, and each needs a part that only this era makes.'],
    },
  },
};

const c = (key, title, icon, deps, x, teach, n, xpN) => ({
  key, kind: 'process', title, icon, deps, x, y: 0, teach, desc: [], tasks: [it(icon, n)], rewards: [xp(xpN)],
});

export const QUESTS = [
  c('B_TRUSS', 'Tensegrity Truss Casing', 'grindless:tensegrity_truss_casing', ['H_MAX_BODY'], 2.5, {
    for: 'A casing of struts held apart by tension, so that a structure the size of a hall keeps its shape in free fall. It is the frame of every MAX machine and the base of the five casings that follow.',
    needs: 'An assembler: two &6Exotic Composite Rods&r (the composite line), four &6Horizon Strand Single Wires&r (the strand line), two Chain Lamina Casings, tungsten steel, a UXV sensor and superfluid helium-3, for four casings.',
    unlocks: 'Every MAX plant and the Mirror Shell, and the clamp coil, optical table, membrane vacuum, droplet radiator and window coil casings.',
    automate: 'Rods and wires by ME, the lamina casings from their line; the helium-3 by pipe. Make them in bulk: a plant takes up to 1,800.',
  }, 4, 80),
  c('B_CLAMP', 'Clamp Coil Casing', 'grindless:clamp_coil_casing', ['B_TRUSS'], 5, {
    for: 'A casing wound with superconducting coil that holds a field against a plasma or a moving mass. The flux clamp, the synchroniser, the injector and the winch use it.',
    needs: 'An assembler, 400 ticks: a &6MAX Field Coil&r (the coil line), two strand wires, a truss casing, a UXV fluid regulator and a UXV conveyor module, with 250 mB of superfluid helium-3, for two casings.',
    unlocks: 'The Horizon Flux Clamp, the Ergoregion Synchroniser, the Mass Stream Injector, the Geroch Winch and the Atom Interferometer Works.',
    automate: 'Field coils by ME from the coil line; they are the slow part, so keep a stock.',
  }, 2, 80),
  c('B_TABLE', 'MAX Optical Table Casing', 'grindless:max_optical_table_casing', ['B_CLAMP'], 7.5, {
    for: 'A casing of a stiff, zero-expansion baseplate with a magnetostrictive layer that damps every vibration. Optics set on it stay aligned to a fraction of a wavelength.',
    needs: 'An assembler, 400 ticks: a &6Zero-Expansion Baseplate&r (the bench line), a &6Laminated Terfenol Stack&r (the Terfenol line), a truss casing and 250 mB of superfluid helium-3, for two casings.',
    unlocks: 'The Photon Ring Imager, the Rydberg Array Works, the Cluster Light Furnace, the Horizon Interferometer and the Atom Interferometer Works.',
    automate: 'Baseplates and Terfenol stacks by ME; the stack is the slow part.',
  }, 2, 80),
  c('B_VAC', 'Membrane Vacuum Casing', 'grindless:membrane_vacuum_casing', ['B_TABLE'], 10, {
    for: 'A casing walled with the superconducting membrane over an extreme-high vacuum liner, with sealed pumps behind it. Whatever must stay clean and cold is built from it.',
    needs: 'An assembler, 400 ticks: a &6Superconducting Membrane&r (the membrane line), two NEG XHV Casings, a truss casing, a MAX electric pump, two FFKM seals and 250 mB of superfluid helium-3, for two casings.',
    unlocks: 'The Gene Ark, the Atom Interferometer Works, the Rydberg Array Works, the Segment Reclamation Works, the Condensate Refinery and the Flux Clamp.',
    automate: 'Membranes by ME; the NEG casings and the seals from their lines.',
  }, 2, 100),
  c('B_RAD', 'Droplet Radiator Casing', 'grindless:droplet_radiator_casing', ['B_VAC'], 12.5, {
    for: 'A casing that sheds heat by a curtain of liquid tin-lithium droplets falling in vacuum. It is made at Sagittarius A*, because the radiator panel is.',
    needs: 'An assembler, 400 ticks: two &6Shell Droplet Radiators&r (made at the hole in the droplet radiator works, from a nozzle plate and a collector shell), a truss casing, a UXV fluid regulator and electric pump, tungsten steel plates, two FFKM seals and 250 mB of superfluid helium-3, for two casings.',
    unlocks: 'The Accretion Feeder, the Cluster Light Furnace, the Photon Ring Imager, the Geroch Winch, the Flux Clamp and the Nickel-56 Burner.',
    automate: 'Radiators by ME from the works, which stands at the hole; the rest of the inputs are shipped.',
  }, 2, 100),
  c('B_WIN', 'Shell Window Coil Casing', 'grindless:shell_window_coil_casing', ['B_RAD'], 15, {
    for: 'A ring of coil and membrane set round a cleanroom glass port. The Mirror Shell has 26 ports, each ringed by these casings, and nothing else uses them.',
    needs: 'An assembler, 400 ticks: a &6MAX Field Coil&r, a &6Superconducting Membrane&r, two strand wires, a truss casing, two UXV sensors and two FFKM seals, with 250 mB of superfluid helium-3, for two casings. The Mirror Shell takes 398 of them.',
    unlocks: 'The Mirror Shell, which closes the age.',
    automate: 'Make them on a dedicated line fed by the coil and membrane lines; the shell needs about two hundred batches.',
  }, 2, 150),
];
