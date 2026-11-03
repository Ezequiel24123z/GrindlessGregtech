// Quest data for uev_wafers: the wafers and multiblocks of UEV that the UEV chapter teaches nowhere else (QUEST-HIGH, #295).
// A wafer hangs from the wafer it is made from; each line of wafers reads left to right. Lines longer than a few rows are hidden: the dependency stays.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: "UEV Wafers", origin: { x: 16.25, y: 23.75 }, heading: { key: 'H_WAF', x: 0, y: 0, deps: ["I_OM_CHEM"], icon: "grindless:fz_silicon_wafer", desc: [
      "Every wafer of this age, and the machines that were left out of the story.",
      'Each wafer hangs from the one it is made from.',
    ] } },
  filename: "uev_wafers",
  era: "uev",
  role: 'wafers',
  order: 9,
  icon: "grindless:fz_silicon_wafer",
  autofocus: "W_FZ_SILICON",
  title: "UEV: Wafers",
  subtitle: ["The wafers and machines of this age, one by one."],
};

export const LINKS = [];

export const QUESTS = [
  {
    key: "W_FZ_SILICON", kind: "wafer", title: "FZ Silicon Wafer", icon: "grindless:fz_silicon_wafer", deps: ["H_WAF"], x: 2, y: 0,
    teach: {
      for: "The &6FZ Silicon Wafer&r is a wafer stage on the way to the TSV Via Wafer.",
      needs: "Made in the &6Cutter&r from the FZ Silicon Boule, with water, in the cleanroom.",
      unlocks: "The TSV Via Wafer and Fouled BEUV Mirror in the BEUV Lithography.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:fz_silicon_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_WSI", kind: "wafer", title: "WSi Wafer", icon: "grindless:wsi_wafer", deps: ["W_FZ_SILICON"], x: 4, y: 0,
    teach: {
      for: "The &6WSi Wafer&r is a wafer stage on the way to the WSi Nanowire Wafer.",
      needs: "Made in the &6SNSPD Fabrication&r from the FZ Silicon Wafer and Tungsten Silicide, with argon, in the cleanroom.",
      unlocks: "The WSi Nanowire Wafer in the SNSPD Fabrication.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:wsi_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_WSI_NANOWIRE", kind: "wafer", title: "Nanowire Wafer", icon: "grindless:wsi_nanowire_wafer", deps: ["W_WSI"], x: 6, y: 0,
    teach: {
      for: "The &6Nanowire Wafer&r is a wafer stage on the way to the SNSPD Die.",
      needs: "Made in the &6SNSPD Fabrication&r from the WSi Wafer, with PMMA resist, in the cleanroom.",
      unlocks: "The SNSPD Die in the SNSPD Fabrication.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:wsi_nanowire_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_OXIDISED", kind: "wafer", title: "Oxidised Wafer", icon: "grindless:oxidised_wafer", deps: ["W_FZ_SILICON"], x: 4, y: 1.5,
    teach: {
      for: "The &6Oxidised Wafer&r is a wafer stage on the way to the Trenched Oxide Wafer.",
      needs: "Made in the &6Electric Blast Furnace&r from the FZ Silicon Wafer, with oxygen, in the cleanroom.",
      unlocks: "The Trenched Oxide Wafer and SDD Implanted Wafer in the Synchrotron.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:oxidised_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_SIN_COATED", kind: "wafer", title: "SiN-Coated Wafer", icon: "grindless:sin_coated_wafer", deps: ["W_OXIDISED"], x: 6, y: 1.5,
    teach: {
      for: "The &6SiN-Coated Wafer&r is a wafer stage on the way to the Sin Lithographed Wafer.",
      needs: "Made in the &6Chemical Reactor&r from the Oxidised Wafer, with silane, in the cleanroom.",
      unlocks: "The Sin Lithographed Wafer and LN On Sin Wafer in the Synchrotron.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:sin_coated_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_SIN_LITHOGRAPHED", kind: "wafer", title: "Lithographed Wafer", icon: "grindless:sin_lithographed_wafer", deps: ["W_SIN_COATED"], x: 8, y: 1.5,
    teach: {
      for: "The &6Lithographed Wafer&r is a wafer stage on the way to the Sin Etched Wafer.",
      needs: "Made in the &6Synchrotron&r from the SiN-Coated Wafer, with PMMA resist, in the cleanroom.",
      unlocks: "The Sin Etched Wafer and Silicon in the Chemical Reactor.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:sin_lithographed_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_SIN_ETCHED", kind: "wafer", title: "Etched Wafer", icon: "grindless:sin_etched_wafer", deps: ["W_SIN_LITHOGRAPHED"], x: 10, y: 1.5,
    teach: {
      for: "The &6Etched Wafer&r is a wafer stage on the way to the Annealed Sin Chip.",
      needs: "Made in the &6Chemical Reactor&r from the Lithographed Wafer, with distilled water, in the cleanroom.",
      unlocks: "The Annealed Sin Chip in the Photonic Foundry.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:sin_etched_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_MICROPILLAR", kind: "wafer", title: "Micropillar Wafer", icon: "grindless:micropillar_wafer", deps: ["H_WAF"], x: 2, y: 4.5,
    teach: {
      for: "The &6Micropillar Wafer&r is a wafer stage on the way to the QD Source.",
      needs: "Made in the &6Chemical Reactor&r from the InAs QD Wafer, with distilled water, in the cleanroom.",
      unlocks: "The QD Source in the Assembler.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:micropillar_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_SDD_IMPLANTED", kind: "wafer", title: "Implanted Wafer", icon: "grindless:sdd_implanted_wafer", deps: ["W_OXIDISED"], x: 6, y: 3,
    teach: {
      for: "The &6Implanted Wafer&r is a wafer stage on the way to the SDD Annealed Wafer.",
      needs: "Made in the &6Ion Implantation&r from the Oxidised Wafer and Boron, in the cleanroom.",
      unlocks: "The SDD Annealed Wafer in the Electric Blast Furnace.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:sdd_implanted_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_SDD_ANNEALED", kind: "wafer", title: "Annealed Wafer", icon: "grindless:sdd_annealed_wafer", deps: ["W_SDD_IMPLANTED"], x: 8, y: 3,
    teach: {
      for: "The &6Annealed Wafer&r is a wafer stage on the way to the SDD.",
      needs: "Made in the &6Electric Blast Furnace&r from the Implanted Wafer, with argon, in the cleanroom.",
      unlocks: "The SDD in the Assembler.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:sdd_annealed_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_KTP", kind: "wafer", title: "KTP Wafer", icon: "grindless:ktp_wafer", deps: ["H_WAF"], x: 2, y: 6,
    teach: {
      for: "The &6KTP Wafer&r is a wafer stage on the way to the KTP Electroded Wafer.",
      needs: "Made in the &6Cutter&r from the KTP Boule, in the cleanroom.",
      unlocks: "The KTP Electroded Wafer in the Assembler.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:ktp_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_KTP_ELECTRODED", kind: "wafer", title: "Electroded Wafer", icon: "grindless:ktp_electroded_wafer", deps: ["W_KTP"], x: 4, y: 6,
    teach: {
      for: "The &6Electroded Wafer&r is a wafer stage the poled crystal of the SPDC source.",
      needs: "Made in the &6Assembler&r from the KTP Wafer and Gold Foil, with argon, in the cleanroom.",
      unlocks: "The SPDC source.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:ktp_electroded_wafer")], rewards: [xp(50)],
  },
  {
    key: "M_SPACE_ELEVATOR", kind: "machine", title: "Space Elevator", icon: "gcyr:space_elevator", deps: ["H_WAF"], x: 2, y: 9,
    teach: {
      for: "The &6Space Elevator&r is the cable that lifts payloads to orbit, and the base that the Dyson Sphere parts are built from.",
      needs: "The controller takes a robust machine casing, trinaquadalloy dense plates and a UEV machine hull.",
      unlocks: "The Dyson Solar Cell, the Dyson Sphere Casing and the Dyson Sphere Maintenance Port.",
      automate: "Item buses and fluid hatches in, item buses out.",
    },
    desc: [], tasks: [it("gcyr:space_elevator")], rewards: [xp(100)],
    raw: { hide_dependency_lines: 'true' },
  },
];
