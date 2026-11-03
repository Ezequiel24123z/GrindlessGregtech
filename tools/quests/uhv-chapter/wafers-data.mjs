// Quest data for uhv_wafers: the wafers and multiblocks of UHV that the UHV chapter teaches nowhere else (QUEST-HIGH, #295).
// A wafer hangs from the wafer it is made from; each line of wafers reads left to right. Lines longer than a few rows are hidden: the dependency stays.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: "UHV Wafers", origin: { x: 13, y: 60 }, heading: { key: 'H_WAF', x: 0, y: 0, deps: ["OM_CHEM"], icon: "grindless:implanted_ln_wafer", desc: [
      "Every wafer of this age, and the machines that were left out of the story.",
      'Each wafer hangs from the one it is made from.',
    ] } },
  filename: "uhv_wafers",
  era: "uhv",
  role: 'wafers',
  order: 9,
  icon: "grindless:implanted_ln_wafer",
  autofocus: "W_IMPLANTED_LN",
  title: "UHV: Wafers",
  subtitle: ["The wafers and machines of this age, one by one."],
};

export const LINKS = [];

export const QUESTS = [
  {
    key: "W_IMPLANTED_LN", kind: "wafer", title: "Implanted LN Wafer", icon: "grindless:implanted_ln_wafer", deps: ["H_WAF"], x: 2, y: 0,
    teach: {
      for: "The &6Implanted LN Wafer&r: Lithium niobate with a buried layer of helium bubbles, ready to split.",
      needs: "Made in the &6Ion Implantation&r from the Lithium Niobate Wafer, with helium, in the cleanroom. Made by the ion implanter (circuit 3); bonded and split in the photonic foundry (circuit 1).",
      unlocks: "The LNOI Wafer and Lithium Niobate Wafer in the Photonic Foundry.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:implanted_ln_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_QCL_SUPERLATTICE", kind: "wafer", title: "Superlattice Wafer", icon: "grindless:qcl_superlattice_wafer", deps: ["H_WAF"], x: 2, y: 1.5,
    teach: {
      for: "The &6Superlattice Wafer&r: Hundreds of InGaAs/AlInAs layers, each a few atoms thick, on an indium phosphide wafer.",
      needs: "Made in the &6Molecular Beam Epitaxy&r from the InP Wafer and Indium, with liquid nitrogen, in the cleanroom. Grown in the MBE reactor (circuit 1); cleaved into eight quantum cascade lasers (circuit 2).",
      unlocks: "The Quantum Cascade Laser in the Molecular Beam Epitaxy.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:qcl_superlattice_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_SIC", kind: "wafer", title: "SiC Wafer", icon: "grindless:sic_wafer", deps: ["H_WAF"], x: 2, y: 3,
    teach: {
      for: "The &6SiC Wafer&r: A polished silicon carbide wafer, hard enough to need a diamond wire.",
      needs: "Made in the &6Cutter&r from the SiC Boule, with lubricant, in the cleanroom. Cut from a SiC boule; the SiC device fab grows its epi layer (circuit 2).",
      unlocks: "The Hpsi SiC Wafer and SiC Epi Wafer in the Chemical Vapour Infiltration.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:sic_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_SIC_EPI", kind: "wafer", title: "Epi Wafer", icon: "grindless:sic_epi_wafer", deps: ["W_SIC"], x: 4, y: 3,
    teach: {
      for: "The &6Epi Wafer&r: A silicon carbide wafer with a grown drift layer.",
      needs: "Made in the &6Silicon Carbide Devices&r from the SiC Wafer, with silane, in the cleanroom. Made by the SiC device fab; implanted with aluminium in the ion implanter (circuit 4).",
      unlocks: "The Implanted SiC Wafer in the Ion Implantation.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:sic_epi_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_IMPLANTED_SIC", kind: "wafer", title: "Implanted Wafer", icon: "grindless:implanted_sic_wafer", deps: ["W_SIC_EPI"], x: 6, y: 3,
    teach: {
      for: "The &6Implanted Wafer&r: Aluminium ions in a silicon carbide epi layer, waiting for the 1,700 °C anneal.",
      needs: "Made in the &6Ion Implantation&r from the Epi Wafer and Aluminium, in the cleanroom. Made by the ion implanter (circuit 4); annealed into device wafers in the SiC device fab.",
      unlocks: "The SiC Device Wafer in the Silicon Carbide Devices.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:implanted_sic_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_SIC_DEVICE", kind: "wafer", title: "Device Wafer", icon: "grindless:sic_device_wafer", deps: ["W_IMPLANTED_SIC"], x: 8, y: 3,
    teach: {
      for: "The &6Device Wafer&r: Annealed silicon carbide transistors, still on the wafer.",
      needs: "Made in the &6Silicon Carbide Devices&r from the Implanted Wafer and Graphite, in the cleanroom. Made by the SiC device fab (circuit 3); diced into four power modules (circuit 4).",
      unlocks: "The SiC Power Module in the Silicon Carbide Devices.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:sic_device_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_IMM_EPI", kind: "wafer", title: "IMM Epi Wafer", icon: "grindless:imm_epi_wafer", deps: ["H_WAF"], x: 2, y: 4.5,
    teach: {
      for: "The &6IMM Epi Wafer&r: GaInP, GaAs and InGaAs junctions grown upside down on a gallium arsenide wafer.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe. Made by the MOCVD reactor (circuit 7); lifted off in the solar array fab (circuit 1).",
      unlocks: "The Gallium Arsenide Wafer and Gallium Arsenide in the Space Photovoltaics.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:imm_epi_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "M_DYSON_SYSTEM_CONTROLLER", kind: "machine", title: "Dyson System Controller", icon: "gcyr:dyson_system_controller", deps: ["H_WAF"], x: 2, y: 7.5,
    teach: {
      for: "The &6Dyson System Controller&r runs the Dyson swarm that collects a star's light into power.",
      needs: "The controller takes darmstadtium plates, UHV circuits and an atomic casing.",
      unlocks: "Dyson swarm recipes and the power they return.",
      automate: "Item buses in feed the swarm; the power leaves through its own hatch.",
    },
    desc: [], tasks: [it("gcyr:dyson_system_controller")], rewards: [xp(100)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "M_WEB_HUB", kind: "machine", title: "Web Hub", icon: "gtmutils:web_hub", deps: ["H_WAF"], x: 4, y: 7.5,
    teach: {
      for: "The &6Web Hub&r is the centre of a wireless energy web: every receiver of the web draws from it.",
      needs: "The controller takes a Web Receiver, neutronium plates and a UV sensor.",
      unlocks: "Wireless energy to every receiver in the web.",
      automate: "It takes no items: link it to the power source and its receivers.",
    },
    desc: [], tasks: [it("gtmutils:web_hub")], rewards: [xp(100)],
    raw: { hide_dependency_lines: 'true' },
  },
];
