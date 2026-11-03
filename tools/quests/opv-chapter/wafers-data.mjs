// Quest data for opv_wafers: the wafers and multiblocks of OpV that the OpV chapter teaches nowhere else (QUEST-HIGH, #295).
// A wafer hangs from the wafer it is made from; each line of wafers reads left to right. Lines longer than a few rows are hidden: the dependency stays.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: "OpV Wafers", origin: { x: 19.5, y: 26.5 }, heading: { key: 'H_WAF', x: 0, y: 0, deps: ["I_OM_BEAM"], icon: "grindless:si_inp_wafer", desc: [
      "Every wafer of this age, and the machines that were left out of the story.",
      'Each wafer hangs from the one it is made from.',
    ] } },
  filename: "opv_wafers",
  era: "opv",
  role: 'wafers',
  order: 9,
  icon: "grindless:si_inp_wafer",
  autofocus: "W_SI_INP",
  title: "OpV: Wafers",
  subtitle: ["The wafers and machines of this age, one by one."],
};

export const LINKS = [];

export const QUESTS = [
  {
    key: "W_SI_INP", kind: "wafer", title: "Si-InP Wafer", icon: "grindless:si_inp_wafer", deps: ["H_WAF"], x: 2, y: 0,
    teach: {
      for: "The &6Si-InP Wafer&r is a wafer stage on the way to the InAs Qw Wafer.",
      needs: "Made in the &6Cutter&r from the Si InP Boule, with water, in the cleanroom.",
      unlocks: "The InAs Qw Wafer and Arsenic in the Molecular Beam Epitaxy.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:si_inp_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_INAS_QW", kind: "wafer", title: "InAs QW Wafer", icon: "grindless:inas_qw_wafer", deps: ["H_WAF"], x: 2, y: 1.5,
    teach: {
      for: "The &6InAs QW Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made in the &6Molecular Beam Epitaxy&r from the Si-InP Wafer and Seven N Indium, with liquid nitrogen, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:inas_qw_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_INAS_AL", kind: "wafer", title: "InAs-Al Wafer", icon: "grindless:inas_al_wafer", deps: ["W_INAS_QW"], x: 4, y: 1.5,
    teach: {
      for: "The &6InAs-Al Wafer&r is a wafer stage on the way to the hBN Capped 2deg Wafer.",
      needs: "Made from the InAs QW Wafer in the next machine of its line, in the cleanroom.",
      unlocks: "The hBN Capped 2deg Wafer in the Assembler.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:inas_al_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_HBN_CAPPED_2DEG", kind: "wafer", title: "hBN Capped 2DEG Wafer", icon: "grindless:hbn_capped_2deg_wafer", deps: ["W_INAS_AL"], x: 6, y: 1.5,
    teach: {
      for: "The &6hBN Capped 2DEG Wafer&r is a wafer stage on the way to the Gated 2deg Wafer.",
      needs: "Made in the &6Assembler&r from the InAs-Al Wafer and Annealed hBN Film, with chloroform, in the cleanroom.",
      unlocks: "The Gated 2deg Wafer in the STM Lithography.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:hbn_capped_2deg_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_TSV_VIA", kind: "wafer", title: "TSV Via Wafer", icon: "grindless:tsv_via_wafer", deps: ["H_WAF"], x: 2, y: 6,
    teach: {
      for: "The &6TSV Via Wafer&r is a wafer stage on the way to the Nb Filled TSV Wafer.",
      needs: "Made in the &6BEUV Lithography&r from the Tb Droplet Target and FZ Silicon Wafer, in the cleanroom.",
      unlocks: "The Nb Filled TSV Wafer in the MTJ Sputtering.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:tsv_via_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_NB_FILLED_TSV", kind: "wafer", title: "Nb Filled TSV Wafer", icon: "grindless:nb_filled_tsv_wafer", deps: ["H_WAF"], x: 2, y: 7.5,
    teach: {
      for: "The &6Nb Filled TSV Wafer&r is a wafer stage on the way to the Bonded TSV Interposer.",
      needs: "Made in the &6MTJ Sputtering&r from the TSV Via Wafer and Rrr Nb Target, with argon, in the cleanroom.",
      unlocks: "The Bonded TSV Interposer and Silicon in the Ion Slicing.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:nb_filled_tsv_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_LN_ON_SOI", kind: "wafer", title: "LN on SOI Wafer", icon: "grindless:ln_on_soi_wafer", deps: ["H_WAF"], x: 2, y: 9,
    teach: {
      for: "The &6LN on SOI Wafer&r is a wafer stage on the way to the LN SOI Waveguide Wafer.",
      needs: "Made in the &6Ion Slicing&r from the Implanted LN Wafer and Si28 SOI Wafer, in the cleanroom.",
      unlocks: "The LN SOI Waveguide Wafer in the Femtosecond Writing.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:ln_on_soi_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_LN_SOI_WAVEGUIDE", kind: "wafer", title: "LN Waveguide Wafer", icon: "grindless:ln_soi_waveguide_wafer", deps: ["H_WAF"], x: 2, y: 10.5,
    teach: {
      for: "The &6LN Waveguide Wafer&r is a wafer stage on the way to the SNSPD Link Wafer.",
      needs: "Made in the &6Femtosecond Writing&r from the LN on SOI Wafer and Glass, in the cleanroom.",
      unlocks: "The SNSPD Link Wafer in the SNSPD Fabrication.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:ln_soi_waveguide_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_SNSPD_LINK", kind: "wafer", title: "SNSPD Link Wafer", icon: "grindless:snspd_link_wafer", deps: ["H_WAF"], x: 2, y: 12,
    teach: {
      for: "The &6SNSPD Link Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made in the &6SNSPD Fabrication&r from the LN Waveguide Wafer and Niobium, with nitrogen, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:snspd_link_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_INP_HEMT_EPI", kind: "wafer", title: "InP HEMT Epi Wafer", icon: "grindless:inp_hemt_epi_wafer", deps: ["H_WAF"], x: 2, y: 13.5,
    teach: {
      for: "The &6InP HEMT Epi Wafer&r is a wafer stage on the way to the HEMT Gated Wafer.",
      needs: "Made in the &6Molecular Beam Epitaxy&r from the Si-InP Wafer and Seven N Indium, with liquid nitrogen, in the cleanroom.",
      unlocks: "The HEMT Gated Wafer and Fouled BEUV Mirror in the BEUV Lithography.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:inp_hemt_epi_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_HEMT_GATED", kind: "wafer", title: "HEMT Gated Wafer", icon: "grindless:hemt_gated_wafer", deps: ["W_INP_HEMT_EPI"], x: 4, y: 13.5,
    teach: {
      for: "The &6HEMT Gated Wafer&r is a wafer stage on the way to the Isolated HEMT Wafer.",
      needs: "Made in the &6BEUV Lithography&r from the Tb Droplet Target and InP HEMT Epi Wafer, in the cleanroom.",
      unlocks: "The Isolated HEMT Wafer in the Ion Implantation.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:hemt_gated_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_ISOLATED_HEMT", kind: "wafer", title: "Isolated HEMT Wafer", icon: "grindless:isolated_hemt_wafer", deps: ["W_HEMT_GATED"], x: 6, y: 13.5,
    teach: {
      for: "The &6Isolated HEMT Wafer&r is a wafer stage on the way to the HEMT Amplifier.",
      needs: "Made in the &6Ion Implantation&r from the HEMT Gated Wafer, with helium, in the cleanroom.",
      unlocks: "The HEMT Amplifier in the Cutter.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:isolated_hemt_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_HPSI_SIC", kind: "wafer", title: "Hpsi SIC Wafer", icon: "grindless:hpsi_sic_wafer", deps: ["H_WAF"], x: 2, y: 15,
    teach: {
      for: "The &6Hpsi SiC Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made in the &6Chemical Vapour Infiltration&r from the SiC Wafer, with methyltrichlorosilane, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:hpsi_sic_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_GAN_SIC_EPI", kind: "wafer", title: "GaN-on-SiC Epi Wafer", icon: "grindless:gan_sic_epi_wafer", deps: ["H_WAF"], x: 2, y: 16.5,
    teach: {
      for: "The &6GaN-on-SiC Epi Wafer&r is a wafer stage on the way to the GaN Gated Wafer.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The GaN Gated Wafer and Fouled BEUV Mirror in the BEUV Lithography.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:gan_sic_epi_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_GAN_GATED", kind: "wafer", title: "GaN Gated Wafer", icon: "grindless:gan_gated_wafer", deps: ["H_WAF"], x: 2, y: 18,
    teach: {
      for: "The &6GaN Gated Wafer&r is a wafer stage on the way to the GaN Mmic.",
      needs: "Made in the &6BEUV Lithography&r from the Tb Droplet Target and GaN-on-SiC Epi Wafer, in the cleanroom.",
      unlocks: "The GaN Mmic in the Silicon Carbide Devices.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:gan_gated_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_SDD_RING", kind: "wafer", title: "SDD Ring Wafer", icon: "grindless:sdd_ring_wafer", deps: ["H_WAF"], x: 2, y: 19.5,
    teach: {
      for: "The &6SDD Ring Wafer&r is a wafer stage on the way to the SDD Anode Wafer.",
      needs: "Made in the &6Ion Implantation&r from the FZ Silicon Wafer and Boron, in the cleanroom.",
      unlocks: "The SDD Anode Wafer and Fouled BEUV Mirror in the BEUV Lithography.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:sdd_ring_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_SDD_ANODE", kind: "wafer", title: "SDD Anode Wafer", icon: "grindless:sdd_anode_wafer", deps: ["W_SDD_RING"], x: 4, y: 19.5,
    teach: {
      for: "The &6SDD Anode Wafer&r is a wafer stage on the way to the SDD Die.",
      needs: "Made in the &6BEUV Lithography&r from the Tb Droplet Target and SDD Ring Wafer, in the cleanroom.",
      unlocks: "The SDD Die and Silicon in the MTJ Sputtering.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:sdd_anode_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_NBTIN_FILM", kind: "wafer", title: "NbTiN Film Wafer", icon: "grindless:nbtin_film_wafer", deps: ["H_WAF"], x: 2, y: 21,
    teach: {
      for: "The &6NbTiN Film Wafer&r is a wafer stage on the way to the Pickup Array.",
      needs: "Made in the &6MTJ Sputtering&r from the Rrr Nb Target and Titanium, with nitrogen, in the cleanroom.",
      unlocks: "The Pickup Array and Niobium Powder in the Electron Beam Refining.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:nbtin_film_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_GASB", kind: "wafer", title: "GaSb Wafer", icon: "grindless:gasb_wafer", deps: ["H_WAF"], x: 2, y: 22.5,
    teach: {
      for: "The &6GaSb Wafer&r: A polished gallium antimonide wafer.",
      needs: "Made in the &6Cutter&r from the GaSb Boule, with lubricant, in the cleanroom. The MBE reactor grows the InGaAsSb absorber on it.",
      unlocks: "The InGaAsSb TPV Epi Wafer in the Molecular Beam Epitaxy.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:gasb_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_INGAASSB_EPI", kind: "wafer", title: "InGaAsSb Epi Wafer", icon: "grindless:ingaassb_epi_wafer", deps: ["H_WAF"], x: 2, y: 24,
    teach: {
      for: "The &6InGaAsSb Epi Wafer&r: A narrow-bandgap absorber grown lattice-matched on GaSb.",
      needs: "Made in the &6Molecular Beam Epitaxy&r from the GaSb Wafer and Indium, with liquid nitrogen, in the cleanroom. The electron beam brazes it to a copper spreader into the TPV panel.",
      unlocks: "The Tpv Panel in the Electron Beam Refining.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:ingaassb_epi_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_ALN", kind: "wafer", title: "Aln Wafer", icon: "grindless:aln_wafer", deps: ["H_WAF"], x: 2, y: 25.5,
    teach: {
      for: "The &6Aln Wafer&r: A polished aluminium nitride substrate.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe. The MOCVD reactor grows AlGaN on it.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:aln_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_ALGAN_EPI", kind: "wafer", title: "AlGaN Epi Wafer", icon: "grindless:algan_epi_wafer", deps: ["H_WAF"], x: 2, y: 27,
    teach: {
      for: "The &6AlGaN Epi Wafer&r: An AlGaN channel layer grown on aluminium nitride.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe. Its gates are drawn by the BEUV lithography cell.",
      unlocks: "The Gated AlGaN Wafer and Fouled BEUV Mirror in the BEUV Lithography.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:algan_epi_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_ALGAN_PATTERNED", kind: "wafer", title: "AlGaN Patterned Wafer", icon: "grindless:algan_patterned_wafer", deps: ["W_ALGAN_EPI"], x: 4, y: 27,
    teach: {
      for: "The &6AlGaN Patterned Wafer&r: AlGaN transistors with their gates written at 6.7 nm.",
      needs: "Made in the &6BEUV Lithography&r from the Tb Droplet Target and AlGaN Epi Wafer, in the cleanroom. Diced into power dies by the SiC device fab.",
      unlocks: "The AlN Power Die in the Silicon Carbide Devices.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:algan_patterned_wafer")], rewards: [xp(50)],
  },
];
