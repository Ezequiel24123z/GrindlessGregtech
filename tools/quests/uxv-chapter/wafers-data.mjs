// Quest data for uxv_wafers: the wafers and multiblocks of UXV that the UXV chapter teaches nowhere else (QUEST-HIGH, #295).
// A wafer hangs from the wafer it is made from; each line of wafers reads left to right. Lines longer than a few rows are hidden: the dependency stays.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: "UXV Wafers", origin: { x: 27, y: 19.5 }, heading: { key: 'H_WAF', x: 0, y: 0, deps: ["SENSOR"], icon: "grindless:srruo3_electrode_wafer", desc: [
      "Every wafer of this age, and the machines that were left out of the story.",
      'Each wafer hangs from the one it is made from.',
    ] } },
  filename: "uxv_wafers",
  era: "uxv",
  role: 'wafers',
  order: 9,
  icon: "grindless:srruo3_electrode_wafer",
  autofocus: "W_SRRUO3_ELECTRODE",
  title: "UXV: Wafers",
  subtitle: ["The wafers and machines of this age, one by one."],
};

export const LINKS = [];

export const QUESTS = [
  {
    key: "W_SRRUO3_ELECTRODE", kind: "wafer", title: "SrRuO3 Electrode Wafer", icon: "grindless:srruo3_electrode_wafer", deps: ["H_WAF"], x: 2, y: 0,
    teach: {
      for: "The &6SrRuO3 Electrode Wafer&r is a wafer stage on the way to the BFO Film Wafer.",
      needs: "Made in the &6Pulsed Laser Deposition&r from the Srruo3 Target and Dysco3 Substrate, with oxygen, in the cleanroom.",
      unlocks: "The BFO Film Wafer and BFO Fume in the Pulsed Laser Deposition.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:srruo3_electrode_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_SI28_FZ", kind: "wafer", title: "Si-28 FZ Wafer", icon: "grindless:si28_fz_wafer", deps: ["H_WAF"], x: 2, y: 1.5,
    teach: {
      for: "The &6Si-28 FZ Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made in the &6Cutter&r from the Si28 FZ, with water, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:si28_fz_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_H_SI28", kind: "wafer", title: "H Si-28 Wafer", icon: "grindless:h_si28_wafer", deps: ["W_SI28_FZ"], x: 4, y: 1.5,
    teach: {
      for: "The &6H Si-28 Wafer&r is a wafer stage on the way to the MTJ Stack Wafer.",
      needs: "Made from the Si-28 FZ Wafer in the next machine of its line, in the cleanroom.",
      unlocks: "The MTJ Stack Wafer and Spent Cofeb Target in the MTJ Sputtering.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:h_si28_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_MTJ_STACK", kind: "wafer", title: "MTJ Stack Wafer", icon: "grindless:mtj_stack_wafer", deps: ["H_WAF"], x: 2, y: 3,
    teach: {
      for: "The &6MTJ Stack Wafer&r is a wafer stage on the way to the Annealed MTJ Wafer.",
      needs: "Made in the &6MTJ Sputtering&r from the Cofeb Target and Mgo Target, with argon, in the cleanroom.",
      unlocks: "The Annealed MTJ Wafer in the Nitride Magnet Synthesis.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:mtj_stack_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_ANNEALED_MTJ", kind: "wafer", title: "Annealed MTJ Wafer", icon: "grindless:annealed_mtj_wafer", deps: ["W_MTJ_STACK"], x: 4, y: 3,
    teach: {
      for: "The &6Annealed MTJ Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made in the &6Nitride Magnet Synthesis&r from the MTJ Stack Wafer, with argon, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:annealed_mtj_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_ETCHED_MTJ", kind: "wafer", title: "Etched MTJ Wafer", icon: "grindless:etched_mtj_wafer", deps: ["W_ANNEALED_MTJ"], x: 6, y: 3,
    teach: {
      for: "The &6Etched MTJ Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made from the Annealed MTJ Wafer in the next machine of its line, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:etched_mtj_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_MRAM_STACK", kind: "wafer", title: "Mram Stack Wafer", icon: "grindless:mram_stack_wafer", deps: ["H_WAF"], x: 2, y: 4.5,
    teach: {
      for: "The &6Mram Stack Wafer&r is a wafer stage on the way to the Annealed MRAM Wafer.",
      needs: "Made in the &6MTJ Sputtering&r from the Heusler Target and Mgo Target, with argon, in the cleanroom.",
      unlocks: "The Annealed MRAM Wafer and Racetrack Memory Die in the Nitride Magnet Synthesis.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:mram_stack_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_ANNEALED_MRAM", kind: "wafer", title: "Annealed MRAM Wafer", icon: "grindless:annealed_mram_wafer", deps: ["W_MRAM_STACK"], x: 4, y: 4.5,
    teach: {
      for: "The &6Annealed MRAM Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made in the &6Nitride Magnet Synthesis&r from the MRAM Stack Wafer, with argon, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:annealed_mram_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_ETCHED_MRAM", kind: "wafer", title: "Etched MRAM Wafer", icon: "grindless:etched_mram_wafer", deps: ["W_ANNEALED_MRAM"], x: 6, y: 4.5,
    teach: {
      for: "The &6Etched MRAM Wafer&r is a wafer stage on the way to the MRAM Wafer.",
      needs: "Made from the Annealed MRAM Wafer in the next machine of its line, in the cleanroom.",
      unlocks: "The MRAM Wafer in the Photonic Foundry.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:etched_mram_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_SAF_TRACK", kind: "wafer", title: "SAF Track Wafer", icon: "grindless:saf_track_wafer", deps: ["H_WAF"], x: 2, y: 6,
    teach: {
      for: "The &6SAF Track Wafer&r is a wafer stage on the way to the Annealed SAF Wafer.",
      needs: "Made in the &6MTJ Sputtering&r from the SAF Target Set and H Si-28 Wafer, with argon, in the cleanroom.",
      unlocks: "The Annealed SAF Wafer in the Nitride Magnet Synthesis.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:saf_track_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_ANNEALED_SAF", kind: "wafer", title: "Annealed SAF Wafer", icon: "grindless:annealed_saf_wafer", deps: ["W_SAF_TRACK"], x: 4, y: 6,
    teach: {
      for: "The &6Annealed SAF Wafer&r is a wafer stage on the way to the Written Track Wafer.",
      needs: "Made in the &6Nitride Magnet Synthesis&r from the SAF Track Wafer, with argon, in the cleanroom.",
      unlocks: "The Written Track Wafer in the Electron Beam Refining.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:annealed_saf_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_WRITTEN_TRACK", kind: "wafer", title: "Written Track Wafer", icon: "grindless:written_track_wafer", deps: ["W_ANNEALED_SAF"], x: 6, y: 6,
    teach: {
      for: "The &6Written Track Wafer&r is a wafer stage on the way to the Patterned Track Wafer.",
      needs: "Made in the &6Electron Beam Refining&r from the Annealed SAF Wafer, with argon, in the cleanroom.",
      unlocks: "The Patterned Track Wafer and Platinum Group Sludge in the Racetrack Patterning.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:written_track_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_PATTERNED_TRACK", kind: "wafer", title: "Patterned Track Wafer", icon: "grindless:patterned_track_wafer", deps: ["W_WRITTEN_TRACK"], x: 8, y: 6,
    teach: {
      for: "The &6Patterned Track Wafer&r is a wafer stage on the way to the Racetrack Chip.",
      needs: "Made in the &6Racetrack Patterning&r from the Written Track Wafer, with argon, in the cleanroom.",
      unlocks: "The Racetrack Chip and Racetrack Memory Die in the Racetrack Patterning.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:patterned_track_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_STNO_STACK", kind: "wafer", title: "STNO Stack Wafer", icon: "grindless:stno_stack_wafer", deps: ["H_WAF"], x: 2, y: 7.5,
    teach: {
      for: "The &6STNO Stack Wafer&r is a wafer stage on the way to the STNO Defined Wafer.",
      needs: "Made in the &6MTJ Sputtering&r from the Heusler Target and Mgo Target, with argon, in the cleanroom.",
      unlocks: "The STNO Defined Wafer in the Electron Beam Refining.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:stno_stack_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_STNO_DEFINED", kind: "wafer", title: "STNO Defined Wafer", icon: "grindless:stno_defined_wafer", deps: ["H_WAF"], x: 2, y: 9,
    teach: {
      for: "The &6STNO Defined Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made in the &6Electron Beam Refining&r from the STNO Stack Wafer, with argon, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:stno_defined_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_STNO_MILLED", kind: "wafer", title: "STNO Milled Wafer", icon: "grindless:stno_milled_wafer", deps: ["W_STNO_DEFINED"], x: 4, y: 9,
    teach: {
      for: "The &6STNO Milled Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made from the STNO Defined Wafer in the next machine of its line, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:stno_milled_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_STNO_CLEAN", kind: "wafer", title: "STNO Clean Wafer", icon: "grindless:stno_clean_wafer", deps: ["W_STNO_MILLED"], x: 6, y: 9,
    teach: {
      for: "The &6STNO Clean Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made from the STNO Milled Wafer in the next machine of its line, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:stno_clean_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_STNO_PLANARISED", kind: "wafer", title: "STNO Planarised Wafer", icon: "grindless:stno_planarised_wafer", deps: ["W_STNO_CLEAN"], x: 8, y: 9,
    teach: {
      for: "The &6STNO Planarised Wafer&r is a wafer stage on the way to the STNO Array.",
      needs: "Made from the STNO Clean Wafer in the next machine of its line, in the cleanroom.",
      unlocks: "The STNO Array in the Photonic Foundry.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:stno_planarised_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_BFO_FILM", kind: "wafer", title: "BFO Film Wafer", icon: "grindless:bfo_film_wafer", deps: ["H_WAF"], x: 2, y: 10.5,
    teach: {
      for: "The &6BFO Film Wafer&r is a wafer stage on the way to the Cofe Me Wafer.",
      needs: "Made in the &6Pulsed Laser Deposition&r from the SrRuO3 Electrode Wafer and La BFO Target, with oxygen, in the cleanroom.",
      unlocks: "The Cofe Me Wafer and Small Cobalt in the Pulsed Laser Deposition.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:bfo_film_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_COFE_ME", kind: "wafer", title: "CoFe ME Wafer", icon: "grindless:cofe_me_wafer", deps: ["W_BFO_FILM"], x: 4, y: 10.5,
    teach: {
      for: "The &6CoFe ME Wafer&r is a wafer stage on the way to the Me Switch Wafer.",
      needs: "Made in the &6Pulsed Laser Deposition&r from the BFO Film Wafer and Cofe Target, with oxygen, in the cleanroom.",
      unlocks: "The Me Switch Wafer in the Electron Beam Refining.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:cofe_me_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_ME_SWITCH", kind: "wafer", title: "ME Switch Wafer", icon: "grindless:me_switch_wafer", deps: ["W_COFE_ME"], x: 6, y: 10.5,
    teach: {
      for: "The &6ME Switch Wafer&r is a wafer stage on the way to the Meso Logic Die.",
      needs: "Made in the &6Electron Beam Refining&r from the CoFe ME Wafer, with argon, in the cleanroom.",
      unlocks: "The Meso Logic Die in the Photonic Foundry.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:me_switch_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_GGG", kind: "wafer", title: "GGG Wafer", icon: "grindless:ggg_wafer", deps: ["H_WAF"], x: 2, y: 12,
    teach: {
      for: "The &6GGG Wafer&r is a wafer stage on the way to the YIG Film Wafer.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The YIG Film Wafer in the Liquid Phase Epitaxy.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:ggg_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_YIG_FILM", kind: "wafer", title: "YIG Film Wafer", icon: "grindless:yig_film_wafer", deps: ["H_WAF"], x: 2, y: 13.5,
    teach: {
      for: "The &6YIG Film Wafer&r is a wafer stage on the way to the YIG Waveguide Wafer.",
      needs: "Made in the &6Liquid Phase Epitaxy&r from the Yttrium Oxide and Hematite, with lpe flux, in the cleanroom.",
      unlocks: "The YIG Waveguide Wafer in the Electron Beam Refining.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:yig_film_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_YIG_WAVEGUIDE", kind: "wafer", title: "YIG Waveguide Wafer", icon: "grindless:yig_waveguide_wafer", deps: ["W_YIG_FILM"], x: 4, y: 13.5,
    teach: {
      for: "The &6YIG Waveguide Wafer&r is a wafer stage on the way to the Magnonic Bus.",
      needs: "Made in the &6Electron Beam Refining&r from the YIG Film Wafer, with argon, in the cleanroom.",
      unlocks: "The Magnonic Bus in the Assembler.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:yig_waveguide_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_GA2O3", kind: "wafer", title: "Ga2O3 Wafer", icon: "grindless:ga2o3_wafer", deps: ["H_WAF"], x: 2, y: 15,
    teach: {
      for: "The &6Ga2O3 Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:ga2o3_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_GA2O3_EPI", kind: "wafer", title: "Ga2O3 Epi Wafer", icon: "grindless:ga2o3_epi_wafer", deps: ["H_WAF"], x: 2, y: 16.5,
    teach: {
      for: "The &6Ga2O3 Epi Wafer&r is a wafer stage on the way to the Ga2O3 Gated Wafer.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The Ga2O3 Gated Wafer in the Electron Beam Refining.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:ga2o3_epi_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_GA2O3_GATED", kind: "wafer", title: "Ga2O3 Gated Wafer", icon: "grindless:ga2o3_gated_wafer", deps: ["W_GA2O3_EPI"], x: 4, y: 16.5,
    teach: {
      for: "The &6Ga2O3 Gated Wafer&r is a wafer stage on the way to the Ga2O3 Power Die.",
      needs: "Made in the &6Electron Beam Refining&r from the Ga2O3 Epi Wafer, with argon, in the cleanroom.",
      unlocks: "The Ga2O3 Power Die and Gallium Oxide in the Photonic Foundry.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:ga2o3_gated_wafer")], rewards: [xp(50)],
  },
];
