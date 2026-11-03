// Quest data for maxplus_wafers: the wafers and multiblocks of MAX+ that the MAX+ chapter teaches nowhere else (QUEST-HIGH, #295).
// A wafer hangs from the wafer it is made from; each line of wafers reads left to right. Lines longer than a few rows are hidden: the dependency stays.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: "MAX+ Wafers", origin: { x: 12, y: 12.5 }, heading: { key: 'H_WAF', x: 0, y: 0, deps: ["CI_CTRL"], icon: "grindless:zone_plate_wafer", desc: [
      "Every wafer of this age, and the machines that were left out of the story.",
      'Each wafer hangs from the one it is made from.',
    ] } },
  filename: "maxplus_wafers",
  era: "maxplus",
  role: 'wafers',
  order: 9,
  icon: "grindless:zone_plate_wafer",
  autofocus: "W_ZONE_PLATE",
  title: "MAX+: Wafers",
  subtitle: ["The wafers and machines of this age, one by one."],
};

export const LINKS = [];

export const QUESTS = [
  {
    key: "W_ZONE_PLATE", kind: "wafer", title: "Zone Plate Wafer", icon: "grindless:zone_plate_wafer", deps: ["H_WAF"], x: 2, y: 0,
    teach: {
      for: "The &6Zone Plate Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:zone_plate_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_PATTERNED_ENGINE", kind: "wafer", title: "Patterned Engine Wafer", icon: "grindless:patterned_engine_wafer", deps: ["H_WAF"], x: 2, y: 1.5,
    teach: {
      for: "The &6Patterned Engine Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:patterned_engine_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_READOUT", kind: "wafer", title: "Readout Wafer", icon: "grindless:readout_wafer", deps: ["H_WAF"], x: 2, y: 3,
    teach: {
      for: "The &6Readout Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:readout_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_HORIZON_LOGIC", kind: "wafer", title: "Horizon Logic Wafer", icon: "grindless:horizon_logic_wafer", deps: ["H_WAF"], x: 2, y: 4.5,
    teach: {
      for: "The &6Horizon Logic Wafer&r is a wafer stage on the way to the Spin Interconnect Wafer.",
      needs: "Made in the &6BEUV Lithography&r from the Tb Droplet Target and Si28 Boule, in the cleanroom.",
      unlocks: "The Spin Interconnect Wafer in the MTJ Sputtering.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:horizon_logic_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_SPIN_INTERCONNECT", kind: "wafer", title: "Spin Interconnect Wafer", icon: "grindless:spin_interconnect_wafer", deps: ["H_WAF"], x: 2, y: 6,
    teach: {
      for: "The &6Spin Interconnect Wafer&r is a wafer stage on the way to the Stacked Logic Wafer.",
      needs: "Made in the &6MTJ Sputtering&r from the Horizon Logic Wafer and Rrr Nb Target, with argon, in the cleanroom.",
      unlocks: "The Stacked Logic Wafer and Platinum Group Sludge in the Racetrack Patterning.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:spin_interconnect_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_STACKED_LOGIC", kind: "wafer", title: "Stacked Logic Wafer", icon: "grindless:stacked_logic_wafer", deps: ["H_WAF"], x: 2, y: 7.5,
    teach: {
      for: "The &6Stacked Logic Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made in the &6Racetrack Patterning&r from the Spin Interconnect Wafer and Patterned Track Wafer, with argon, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:stacked_logic_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_PHOTONIC_QPU", kind: "wafer", title: "Photonic Qpu Wafer", icon: "grindless:photonic_qpu_wafer", deps: ["H_WAF"], x: 2, y: 9,
    teach: {
      for: "The &6Photonic QPU Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:photonic_qpu_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_DETECTOR_LAYER", kind: "wafer", title: "Detector Layer Wafer", icon: "grindless:detector_layer_wafer", deps: ["H_WAF"], x: 2, y: 10.5,
    teach: {
      for: "The &6Detector Layer Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:detector_layer_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
];
