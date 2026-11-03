// Quest data for zpm_integration ("ZPM: Power and Scale"): the era's power plant, the Mk2, the network and the older machines' new modes
// (docs/reforge/05_quest_design.md, sections 2 and 3.2; docs/eras/zpm.md, "Older machines, new modes", "Power", "AE2 between planets").
// BIG, MK2, DEC, EXC, ANEU, NETZ and SIXTYFOUR moved here from zpm_age: they keep their keys and ids, and the power chart still points at
// BIG, MK2 and DEC. Every row starts at a link to the zpm_age quest that opens it, and its first quest depends on that quest.
// Positions: columns every 2, rows every 1.5.
const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });

import { SECTIONS, place } from './layout.mjs';

export const CHAPTER = {
  section: SECTIONS.integration,
  filename: 'zpm_integration',
  era: 'zpm',
  role: 'integration',
  order: 3,
  icon: 'gtceu:zpm_fusion_reactor',
  autofocus: 'EXC',
  title: 'ZPM: Power and Scale',
  subtitle: ['Naquadria burnt at home, the Mk2 and its converter, a network that reaches Uranus, and four older machines learning new tricks.'],
};

export const LINKS = [
  { key: 'I_L_PW', ref: 'START', x: 0, y: 0 },
  { key: 'I_L_HE', ref: 'STN3', x: 0, y: 2 },
  { key: 'I_L_OM', ref: 'START', x: 0, y: 4 },
  { key: 'I_L_AE', ref: 'STN4', x: 0, y: 6 },
];

export const QUESTS = [
  // ------------------------------------------------------------------ power at home
  {
    key: 'EXC', kind: 'step', title: 'Excited', icon: 'gtceu:radon_bucket', size: 0.75,
    deps: ['START'], x: 2, y: 0,
    desc: [
      "Fuel only gets worth burning once the Mk2 has excited it with radon. That's a big start for a small amount, so the order is the network, then the Mk2, then the reactor.",
    ],
    tasks: [ck()],
    rewards: [xp(30)],
  },
  {
    key: 'NETZ', kind: 'machine', title: 'The Network Goes ZPM', icon: 'grindless:zpm_smes_cell', shape: 'rsquare', size: 1.25,
    deps: ['EXC'], x: 4, y: 0,
    teach: {
      for: 'A &6ZPM SMES cell&r and a wireless hatch put another tier on the network. Sunlight is a rumour at Saturn, so everything out there draws from it.',
      needs: 'The cold room that winds the wire, a ZPM energy hatch for each cell bank, and enough cells to carry the Mk2 start.',
      unlocks: 'The Mk2 next, and stations at Saturn and Uranus that run on power made at home.',
      automate: 'Nothing to feed: size the cells for your busiest hour and add more when it dips.',
    },
    desc: [],
    tasks: [it('grindless:zpm_smes_cell'), it('gtceu:zpm_energy_input_hatch'), it('gtceu:zpm_wireless_energy_hatch')],
    rewards: [xp(100)],
  },
  {
    key: 'MK2', kind: 'machine', title: 'Second Ring', icon: 'gtceu:zpm_fusion_reactor', shape: 'gear', size: 1.5,
    deps: ['NETZ'], x: 6, y: 0,
    teach: {
      for: 'The &6Fusion Reactor Mk2&r makes duranium, excites fuel and runs the aneutronic burn. Its start is huge, so give it plenty of ZPM hatches.',
      needs: 'Four ZPM energy hatches on the network, and gallium and radon for the first batches.',
      unlocks: 'Duranium and excited fuel for the large reactor, and the metals UV asks for early.',
      automate: 'Feed it from tanks by pipe, and keep the hatches topped from the network.',
    },
    desc: [],
    tasks: [it('gtceu:zpm_fusion_reactor'), it('gtceu:zpm_energy_input_hatch', 4), it('gtceu:duranium_ingot')],
    rewards: [xp(150)],
  },
  {
    key: 'BIG', kind: 'plant', title: 'The Big Reactor', icon: 'gtnn:large_naquadah_reactor', shape: 'gear', size: 1.5,
    deps: ['MK2'], x: 8, y: 0,
    teach: {
      for: "The &6Large Naquadah Reactor&r burns excited fuel and is the era's main plant. It tops the naquadah ladder: three small reactors from an enriched ingot (0.8, 0.9 and 1.0 G EU), then two more and the large one from a naquadria ingot (1.5, 1.75 and 2.0 G EU).",
      needs: 'Excited fuel from the Mk2, and a fuel works ready to take the spent fuel back.',
      unlocks: "Power on a scale ZPM's machines expect, with a fuel loop that never leaves the base.",
      automate: 'Pipe spent fuel straight back to the fuel works and let ME top up the radon.',
    },
    desc: [],
    tasks: [it('gtnn:large_naquadah_reactor'), it('gtceu:duranium_frame')],
    rewards: [xp(150)],
  },
  {
    key: 'SIXTYFOUR', kind: 'machine', title: 'Sixty-Four at Once', icon: 'gtceu:zpm_parallel_hatch', size: 0.75, optional: true,
    deps: ['MK2'], x: 8, y: 1.5,
    teach: {
      for: 'The &6ZPM Parallel Hatch&r runs one machine on far more at a time. Worth a few for any line that keeps backing up.',
      needs: 'A machine that accepts one, and the power to match what it now eats.',
      unlocks: 'Throughput without another hall.',
      automate: 'Larger batches mean larger input buffers: check your pipes can keep up.',
    },
    desc: [],
    tasks: [it('gtceu:zpm_parallel_hatch')],
    rewards: [xp(60)],
  },

  // ------------------------------------------------------------------ helium-3 power
  {
    key: 'ANEU', kind: 'process', title: 'Aneutronic', icon: 'gtceu:helium_3_bucket',
    deps: ['STN3'], x: 2, y: 2,
    teach: {
      for: "Deuterium and helium-3 fuse into helium with almost no stray neutrons. It runs on the Mk2 only, and it's the clean way to turn Saturn's gas into power.",
      needs: "Helium-3 and deuterium from the isotope column, and a Mk2 that's already running.",
      unlocks: 'Power from Saturn that needs no reactor waste.',
      automate: 'Send the helium-3 home by the pair and let ME keep the Mk2 stocked.',
    },
    desc: [],
    tasks: [it('gtceu:zpm_fusion_reactor'), it('gtceu:helium_3_bucket')],
    rewards: [xp(120)],
  },
  {
    key: 'DEC', kind: 'machine', title: 'Direct Conversion', icon: 'gtceu:direct_energy_converter', shape: 'gear', size: 1.25,
    deps: ['ANEU'], x: 4, y: 2,
    teach: {
      for: 'The &6Direct Energy Converter&r takes charge straight off the plasma, with no turbine in between. The cooled gas goes back, so nothing is lost but heat.',
      needs: 'Helium plasma from the Mk2, and a hatch to carry the output.',
      unlocks: 'The cleanest power of the era, and the best use of Saturn.',
      automate: 'Return the cooled gas to the isotope column and the loop closes.',
    },
    desc: [],
    tasks: [it('gtceu:direct_energy_converter')],
    rewards: [xp(120)],
  },

  // ------------------------------------------------------------------ older machines, new modes
  {
    key: 'ZI_NAQ', kind: 'process', title: 'Mode Three', icon: 'gtceu:naquadah_plant',
    deps: ['START'], x: 2, y: 4,
    teach: {
      for: 'The IV &6Naquadah Plant&r learns a third mode: the leftover solution from the refinery becomes enriched naquadah dust, and the acid comes back.',
      needs: 'Enriched naquadah solution from the naquadria refinery, and the right circuit in the plant.',
      unlocks: 'Starts for the Mk2 and fuel for the reactor, from what used to be waste.',
      automate: 'Pipe the solution in, the acid back to the refinery, and the dust to ME.',
    },
    desc: [],
    tasks: [it('gtceu:naquadah_plant'), ck()],
    rewards: [xp(80)],
  },
  {
    key: 'ZI_CAS', kind: 'process', title: 'Cascade, Reloaded', icon: 'gtceu:extraction_cascade',
    deps: ['ZI_NAQ'], x: 4, y: 4,
    teach: {
      for: 'The EV &6Extraction Cascade&r takes monazite froth in its ZPM mode and hands back a rare-earth chloride with europium in it.',
      needs: 'Froth from the monazite line and the ZPM circuit, nothing new to build.',
      unlocks: 'The europium reductor, without waiting on fusion.',
      automate: 'Feed it froth by pipe and send the chloride on to the reductor.',
    },
    desc: [],
    tasks: [it('gtceu:extraction_cascade'), ck()],
    rewards: [xp(80)],
  },
  {
    key: 'ZI_HOT', kind: 'process', title: 'Silicon-28, Slowly', icon: 'grindless:silicon_28_dust',
    deps: ['ZI_CAS'], x: 6, y: 4,
    teach: {
      for: 'The IV &6Hot Cell&r gets a silicon-28 mode: silicon and hydrofluoric acid in, the pure isotope out, the rest looped back.',
      needs: 'Silicon, hydrofluoric acid and the uranium centrifuges the hot cell already feeds.',
      unlocks: "Silicon-28 for the ion implanter, and so for the qubit arrays.",
      automate: 'The spare silicon and acid return on their own: just keep both tanks topped.',
    },
    desc: [],
    tasks: [it('gtceu:hot_cell'), it('grindless:silicon_28_dust')],
    rewards: [xp(100)],
  },
  {
    key: 'ZI_AUT', kind: 'process', title: 'Ablator', icon: 'grindless:pica_heat_shield',
    deps: ['ZI_HOT'], x: 8, y: 4,
    teach: {
      for: 'The HV &6Composite Autoclave&r bakes carbon fibre and resin into a &6PICA Heat Shield&r, the skin a probe needs to survive a haze.',
      needs: 'Carbon fibre and phenolic resin, and the circuit for its new mode.',
      unlocks: 'Entry probes for Titan and flyby probes past Neptune.',
      automate: 'Shields are bulky: store them in ME and let the probe bays pull what they need.',
    },
    desc: [],
    tasks: [it('gtceu:composite_autoclave'), it('grindless:pica_heat_shield')],
    rewards: [xp(100)],
  },

  // ------------------------------------------------------------------ AE2 between planets
  {
    key: 'ZI_AE1', kind: 'step', title: 'Saturn on the Network', icon: 'grindless:station_truss_casing',
    deps: ['STN4'], x: 2, y: 6,
    desc: [
      "Saturn orbit gets its own &6AE2 pair&r, so what the station makes goes home and what it needs comes out. Power doesn't need it: the wireless network already carries that.",
    ],
    tasks: [ck()],
    rewards: [xp(80)],
  },
  {
    key: 'ZI_AE2', kind: 'step', title: 'Uranus on the Network', icon: 'grindless:station_truss_casing',
    deps: ['ZI_AE1'], x: 4, y: 6,
    desc: [
      'Same again at Uranus orbit. Chunk-load both stations, because the far machines only run while their chunks are loaded.',
    ],
    tasks: [ck()],
    rewards: [xp(80)],
  },
  {
    key: 'ZI_AE3', kind: 'step', title: 'Fluids in Bulk', icon: 'gtceu:gas_giant_siphon', size: 0.75, optional: true,
    deps: ['ZI_AE2'], x: 6, y: 6,
    desc: [
      'The stations send hydrogen, helium and methane by the tankful. Fluid cells and extra coprocessors matter far more here than item storage.',
    ],
    tasks: [ck()],
    rewards: [xp(60)],
  },
];
QUESTS.splice(0, QUESTS.length, ...place(QUESTS));
