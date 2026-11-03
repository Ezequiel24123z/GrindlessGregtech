// Quest data for max_wafers: the wafers and multiblocks of MAX that the MAX chapter teaches nowhere else (QUEST-HIGH, #295).
// A wafer hangs from the wafer it is made from; each line of wafers reads left to right. Lines longer than a few rows are hidden: the dependency stays.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: "MAX Wafers", origin: { x: 69.5, y: 24 }, heading: { key: 'H_WAF', x: 0, y: 0, deps: ["H_RECL"], icon: "grindless:ppln_thin_film_wafer", desc: [
      "Every wafer of this age, and the machines that were left out of the story.",
      'Each wafer hangs from the one it is made from.',
    ] } },
  filename: "max_wafers",
  era: "max",
  role: 'wafers',
  order: 9,
  icon: "grindless:ppln_thin_film_wafer",
  autofocus: "W_PPLN_THIN_FILM",
  title: "MAX: Wafers",
  subtitle: ["The wafers and machines of this age, one by one."],
};

export const LINKS = [];

export const QUESTS = [
  {
    key: "W_PPLN_THIN_FILM", kind: "wafer", title: "Ppln Thin Film Wafer", icon: "grindless:ppln_thin_film_wafer", deps: ["H_WAF"], x: 2, y: 0,
    teach: {
      for: "The &6Ppln Thin Film Wafer&r is a wafer stage on the way to the Squeezer Waveguide Die.",
      needs: "Made in the &6Ion Slicing&r from the PPLN Boule and FZ Silicon Wafer, in the cleanroom.",
      unlocks: "The Squeezer Waveguide Die in the Femtosecond Writing.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:ppln_thin_film_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_QUARTZ_CRYSTAL", kind: "wafer", title: "Quartz Crystal Wafer", icon: "grindless:quartz_crystal_wafer", deps: ["H_WAF"], x: 2, y: 1.5,
    teach: {
      for: "The &6Quartz Crystal Wafer&r is a wafer stage on the way to the Metalens Wafer.",
      needs: "Made in the &6Crystal Growth&r from the Silicon Dioxide and Sodium Hydroxide, with distilled water, in the cleanroom.",
      unlocks: "The Metalens Wafer and Fouled BEUV Mirror in the BEUV Lithography.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:quartz_crystal_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_METALENS", kind: "wafer", title: "Metalens Wafer", icon: "grindless:metalens_wafer", deps: ["H_WAF"], x: 2, y: 3,
    teach: {
      for: "The &6Metalens Wafer&r is a wafer stage on the way to the Coated Metalens.",
      needs: "Made in the &6BEUV Lithography&r from the Tb Droplet Target and Quartz Crystal Wafer, in the cleanroom.",
      unlocks: "The Coated Metalens and Gold Overspray in the MTJ Sputtering.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:metalens_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_ALN_ON_SI", kind: "wafer", title: "Aln On Si Wafer", icon: "grindless:aln_on_si_wafer", deps: ["H_WAF"], x: 2, y: 4.5,
    teach: {
      for: "The &6Aln On Si Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:aln_on_si_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_TRANSDUCER", kind: "wafer", title: "Transducer Wafer", icon: "grindless:transducer_wafer", deps: ["H_WAF"], x: 2, y: 6,
    teach: {
      for: "The &6Transducer Wafer&r is a wafer stage on the way to the Cryo Photonic Interposer.",
      needs: "Made in the &6Ion Slicing&r from the Piezo Optomech Layer and Lithium Niobate Wafer, in the cleanroom.",
      unlocks: "The Cryo Photonic Interposer in the Nuclear Demagnetisation.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:transducer_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_NITRIDE_FILM", kind: "wafer", title: "Nitride Film Wafer", icon: "grindless:nitride_film_wafer", deps: ["H_WAF"], x: 2, y: 7.5,
    teach: {
      for: "The &6Nitride Film Wafer&r is a wafer stage on the way to the Microring Wafer.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The Microring Wafer and Fouled BEUV Mirror in the BEUV Lithography.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:nitride_film_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_MICRORING", kind: "wafer", title: "Microring Wafer", icon: "grindless:microring_wafer", deps: ["H_WAF"], x: 2, y: 9,
    teach: {
      for: "The &6Microring Wafer&r is a wafer stage on the way to the Trimmed Microring.",
      needs: "Made in the &6BEUV Lithography&r from the Tb Droplet Target and Nitride Film Wafer, in the cleanroom.",
      unlocks: "The Trimmed Microring in the Femtosecond Writing.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:microring_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_YIG_ON_LN", kind: "wafer", title: "YIG On Ln Wafer", icon: "grindless:yig_on_ln_wafer", deps: ["H_WAF"], x: 2, y: 10.5,
    teach: {
      for: "The &6YIG On LN Wafer&r is a wafer stage on the way to the Isolator Waveguide Die.",
      needs: "Made in the &6Ion Slicing&r from the Bi YIG Film and LNOI Wafer, in the cleanroom.",
      unlocks: "The Isolator Waveguide Die in the Femtosecond Writing.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:yig_on_ln_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_DIAMOND_POWER", kind: "wafer", title: "Diamond Power Wafer", icon: "grindless:diamond_power_wafer", deps: ["H_WAF"], x: 2, y: 12,
    teach: {
      for: "The &6Diamond Power Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made in the &6Silicon Carbide Devices&r from the Metallised Diamond and SiC Substrate Wafer, with silane, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:diamond_power_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_SIC_SUBSTRATE", kind: "wafer", title: "SIC Substrate Wafer", icon: "grindless:sic_substrate_wafer", deps: ["H_WAF"], x: 2, y: 13.5,
    teach: {
      for: "The &6SIC Substrate Wafer&r is a wafer stage on the way to the SiC CMOS Wafer.",
      needs: "Made in the &6Crystal Growth&r from the Silicon Carbide, in the cleanroom.",
      unlocks: "The SiC CMOS Wafer and Diamond Power Wafer in the Silicon Carbide Devices.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:sic_substrate_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_SIC_CMOS", kind: "wafer", title: "SIC Cmos Wafer", icon: "grindless:sic_cmos_wafer", deps: ["H_WAF"], x: 2, y: 15,
    teach: {
      for: "The &6SIC CMOS Wafer&r is a wafer stage on the way to the MRAM Stack Wafer.",
      needs: "Made in the &6Silicon Carbide Devices&r from the SiC Substrate Wafer and Aluminium, with silane, in the cleanroom.",
      unlocks: "The MRAM Stack Wafer and Heusler Am Powder in the MTJ Sputtering.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:sic_cmos_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_SEMI_INSULATING_INP", kind: "wafer", title: "Semi Insulating INP Wafer", icon: "grindless:semi_insulating_inp_wafer", deps: ["H_WAF"], x: 2, y: 16.5,
    teach: {
      for: "The &6Semi Insulating InP Wafer&r is a wafer stage on the way to the InP HEMT Epi.",
      needs: "Made in the &6Crystal Growth&r from the Indium and Phosphorus, in the cleanroom.",
      unlocks: "The InP HEMT Epi in the Molecular Beam Epitaxy.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:semi_insulating_inp_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_INP_UTC_EPI", kind: "wafer", title: "INP UTC Epi Wafer", icon: "grindless:inp_utc_epi_wafer", deps: ["H_WAF"], x: 2, y: 18,
    teach: {
      for: "The &6INP UTC Epi Wafer&r is a wafer stage on the way to the UTC Photodiode Wafer.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The UTC Photodiode Wafer and Fouled BEUV Mirror in the BEUV Lithography.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:inp_utc_epi_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_UTC_PHOTODIODE", kind: "wafer", title: "UTC Photodiode Wafer", icon: "grindless:utc_photodiode_wafer", deps: ["H_WAF"], x: 2, y: 19.5,
    teach: {
      for: "The &6UTC Photodiode Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made in the &6BEUV Lithography&r from the Tb Droplet Target and InP UTC Epi Wafer, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:utc_photodiode_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_PASSIVATED_UTC", kind: "wafer", title: "Passivated UTC Wafer", icon: "grindless:passivated_utc_wafer", deps: ["W_UTC_PHOTODIODE"], x: 4, y: 19.5,
    teach: {
      for: "The &6Passivated UTC Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made from the UTC Photodiode Wafer in the next machine of its line, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:passivated_utc_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_HEMT_GATE", kind: "wafer", title: "Hemt Gate Wafer", icon: "grindless:hemt_gate_wafer", deps: ["H_WAF"], x: 2, y: 21,
    teach: {
      for: "The &6Hemt Gate Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made in the &6BEUV Lithography&r from the Tb Droplet Target and InP HEMT Epi, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:hemt_gate_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_SIS_JUNCTION", kind: "wafer", title: "SIS Junction Wafer", icon: "grindless:sis_junction_wafer", deps: ["H_WAF"], x: 2, y: 22.5,
    teach: {
      for: "The &6SIS Junction Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made in the &6BEUV Lithography&r from the Tb Droplet Target and Nb Alox Nb Trilayer, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:sis_junction_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_ANODISED_JUNCTION", kind: "wafer", title: "Anodised Junction Wafer", icon: "grindless:anodised_junction_wafer", deps: ["W_SIS_JUNCTION"], x: 4, y: 22.5,
    teach: {
      for: "The &6Anodised Junction Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made from the SIS Junction Wafer in the next machine of its line, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:anodised_junction_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_FZ", kind: "wafer", title: "Fz Wafer", icon: "grindless:fz_wafer", deps: ["H_WAF"], x: 2, y: 24,
    teach: {
      for: "The &6Fz Wafer&r is a wafer stage on the way to the Simox SOI Wafer.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The Simox SOI Wafer in the Ion Implantation.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:fz_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_SIMOX_SOI", kind: "wafer", title: "Simox SOI Wafer", icon: "grindless:simox_soi_wafer", deps: ["H_WAF"], x: 2, y: 25.5,
    teach: {
      for: "The &6Simox SOI Wafer&r is a wafer stage on the way to the Rad Hard FPGA Wafer.",
      needs: "Made in the &6Ion Implantation&r from the FZ Wafer, with oxygen, in the cleanroom.",
      unlocks: "The Rad Hard FPGA Wafer and Fouled BEUV Mirror in the BEUV Lithography.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:simox_soi_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_RAD_HARD_FPGA", kind: "wafer", title: "Rad Hard Fpga Wafer", icon: "grindless:rad_hard_fpga_wafer", deps: ["H_WAF"], x: 2, y: 27,
    teach: {
      for: "The &6Rad Hard FPGA Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made in the &6BEUV Lithography&r from the Tb Droplet Target and Simox SOI Wafer, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:rad_hard_fpga_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_SAPPHIRE_WEB", kind: "wafer", title: "Sapphire Web Wafer", icon: "grindless:sapphire_web_wafer", deps: ["H_WAF"], x: 2, y: 28.5,
    teach: {
      for: "The &6Sapphire Web Wafer&r is a wafer stage on the way to the Vo2 On Sapphire.",
      needs: "Made in the &6Crystal Growth&r from the Sapphire and Iridium Crucible, in the cleanroom.",
      unlocks: "The Vo2 On Sapphire in the Pulsed Laser Deposition.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:sapphire_web_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
];
