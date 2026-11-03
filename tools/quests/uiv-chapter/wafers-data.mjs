// Quest data for uiv_wafers: the wafers and multiblocks of UIV that the UIV chapter teaches nowhere else (QUEST-HIGH, #295).
// A wafer hangs from the wafer it is made from; each line of wafers reads left to right. Lines longer than a few rows are hidden: the dependency stays.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: "UIV Wafers", origin: { x: 9, y: 57 }, heading: { key: 'H_WAF', x: 0, y: 0, deps: ["H_FUS"], icon: "grindless:trenched_oxide_wafer", desc: [
      "Every wafer of this age, and the machines that were left out of the story.",
      'Each wafer hangs from the one it is made from.',
    ] } },
  filename: "uiv_wafers",
  era: "uiv",
  role: 'wafers',
  order: 9,
  icon: "grindless:trenched_oxide_wafer",
  autofocus: "W_TRENCHED_OXIDE",
  title: "UIV: Wafers",
  subtitle: ["The wafers and machines of this age, one by one."],
};

export const LINKS = [];

export const QUESTS = [
  {
    key: "W_TRENCHED_OXIDE", kind: "wafer", title: "Trenched Oxide Wafer", icon: "grindless:trenched_oxide_wafer", deps: ["H_WAF"], x: 2, y: 0,
    teach: {
      for: "The &6Trenched Oxide Wafer&r is a wafer stage on the way to the Damascene Sin Wafer.",
      needs: "Made in the &6Synchrotron&r from the Oxidised Wafer, with PMMA resist, in the cleanroom.",
      unlocks: "The Damascene Sin Wafer in the Chemical Reactor.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:trenched_oxide_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_DAMASCENE_SIN", kind: "wafer", title: "Damascene Sin Wafer", icon: "grindless:damascene_sin_wafer", deps: ["W_TRENCHED_OXIDE"], x: 4, y: 0,
    teach: {
      for: "The &6Damascene Sin Wafer&r is a wafer stage on the way to the Annealed Damascene Ring.",
      needs: "Made in the &6Chemical Reactor&r from the Trenched Oxide Wafer, with silane, in the cleanroom.",
      unlocks: "The Annealed Damascene Ring and Quartz Sand in the Photonic Foundry.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:damascene_sin_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_POLED_LNOI", kind: "wafer", title: "Poled LNOI Wafer", icon: "grindless:poled_lnoi_wafer", deps: ["H_WAF"], x: 2, y: 1.5,
    teach: {
      for: "The &6Poled LNOI Wafer&r is a wafer stage on the way to the PPLN Waveguide.",
      needs: "Made in the &6Ion Slicing&r from the LNOI Wafer and Gold Foil, in the cleanroom.",
      unlocks: "The PPLN Waveguide and LN On Insulator Plus in the Photonic Foundry.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:poled_lnoi_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_H_TERMINATED", kind: "wafer", title: "H Terminated Wafer", icon: "grindless:h_terminated_wafer", deps: ["H_WAF"], x: 2, y: 3,
    teach: {
      for: "The &6H Terminated Wafer&r is a wafer stage on the way to the Stm Patterned Wafer.",
      needs: "Made in the &6STM Lithography&r from the Si28 SOI Wafer, with hydrogen, in the cleanroom.",
      unlocks: "The Stm Patterned Wafer in the STM Lithography.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:h_terminated_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_PH3_DOSED", kind: "wafer", title: "Ph3 Dosed Wafer", icon: "grindless:ph3_dosed_wafer", deps: ["H_WAF"], x: 2, y: 4.5,
    teach: {
      for: "The &6Ph3 Dosed Wafer&r is a wafer stage on the way to the P Si Die.",
      needs: "Made in the &6STM Lithography&r from the Stm Patterned Wafer, with phosphine, in the cleanroom.",
      unlocks: "The P Si Die in the Molecular Beam Epitaxy.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:ph3_dosed_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_NB_JJ", kind: "wafer", title: "NB Jj Wafer", icon: "grindless:nb_jj_wafer", deps: ["H_WAF"], x: 2, y: 6,
    teach: {
      for: "The &6NB Jj Wafer&r is a wafer stage on the way to the Aqfp Die.",
      needs: "Made in the &6SNSPD Fabrication&r from the Nb Trilayer, with PMMA resist, in the cleanroom.",
      unlocks: "The Aqfp Die in the Laser Engraver.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:nb_jj_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_INGAASB_EPI", kind: "wafer", title: "Ingaasb Epi Wafer", icon: "grindless:ingaasb_epi_wafer", deps: ["H_WAF"], x: 2, y: 7.5,
    teach: {
      for: "The &6Ingaasb Epi Wafer&r is a wafer stage on the way to the Air Bridge Wafer.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The Air Bridge Wafer in the Photonic Foundry.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:ingaasb_epi_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_AIR_BRIDGE", kind: "wafer", title: "Air Bridge Wafer", icon: "grindless:air_bridge_wafer", deps: ["H_WAF"], x: 2, y: 9,
    teach: {
      for: "The &6Air Bridge Wafer&r is a wafer stage on the way to the InGaAsB Tpv Cell.",
      needs: "Made in the &6Photonic Foundry&r from the InGaAsB Epi Wafer and Gold, with ultrapure water, in the cleanroom.",
      unlocks: "The InGaAsB Tpv Cell in the Cutter.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:air_bridge_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_DIAMOND_CONTACT", kind: "wafer", title: "Diamond Contact Wafer", icon: "grindless:diamond_contact_wafer", deps: ["H_WAF"], x: 2, y: 10.5,
    teach: {
      for: "The &6Diamond Contact Wafer&r is a wafer stage on the way to the Diamond Schottky Die.",
      needs: "Made in the &6Photonic Foundry&r from the C12 Boron Diamond and Tipt Au Stack, with ultrapure water, in the cleanroom.",
      unlocks: "The Diamond Schottky Die in the Assembler.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:diamond_contact_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_SPUTTERED_W", kind: "wafer", title: "Sputtered W Wafer", icon: "grindless:sputtered_w_wafer", deps: ["H_WAF"], x: 2, y: 12,
    teach: {
      for: "The &6Sputtered W Wafer&r is a wafer stage on the way to the W Photonic Crystal.",
      needs: "Made in the &6Chemical Reactor&r from the W Target and Silicon Wafer, with argon, in the cleanroom.",
      unlocks: "The W Photonic Crystal in the Photonic Foundry.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:sputtered_w_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_HFO2_RESIST", kind: "wafer", title: "Hfo2 Resist Wafer", icon: "grindless:hfo2_resist_wafer", deps: ["H_WAF"], x: 2, y: 13.5,
    teach: {
      for: "The &6Hfo2 Resist Wafer&r is a wafer stage on the way to the BEUV Exposed Wafer.",
      needs: "Made in the &6Photonic Foundry&r from the Silicon Wafer and Hafnia, with ultrapure water, in the cleanroom.",
      unlocks: "The BEUV Exposed Wafer and Fouled BEUV Mirror in the BEUV Lithography.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:hfo2_resist_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "M_NEUTRON_ACTIVATOR", kind: "machine", title: "Neutron Activator", icon: "gtnn:neutron_activator", deps: ["H_WAF"], x: 2, y: 16.5,
    teach: {
      for: "The &6Neutron Activator&r bombards matter with neutrons from a source and activates it into new compounds.",
      needs: "The controller takes a quark core, an EV sensor and a neutron source.",
      unlocks: "Enriched Naquadah Sulfate, Naquadria Sulfate and Titanium Trifluoride dusts.",
      automate: "Item buses and fluid hatches in, item buses and fluid hatches out.",
    },
    desc: [], tasks: [it("gtnn:neutron_activator")], rewards: [xp(100)],
    raw: { hide_dependency_lines: 'true' },
  },
];
