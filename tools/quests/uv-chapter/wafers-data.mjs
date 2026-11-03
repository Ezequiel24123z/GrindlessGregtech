// Quest data for uv_wafers: the wafers and multiblocks of UV that the UV chapter teaches nowhere else (QUEST-HIGH, #295).
// A wafer hangs from the wafer it is made from; each line of wafers reads left to right. Lines longer than a few rows are hidden: the dependency stays.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: "UV Wafers", origin: { x: 4, y: 27 }, heading: { key: 'H_WAF', x: 0, y: 0, deps: ["PCBF"], icon: "grindless:gallium_arsenide_wafer", desc: [
      "Every wafer of this age, and the machines that were left out of the story.",
      'Each wafer hangs from the one it is made from.',
    ] } },
  filename: "uv_wafers",
  era: "uv",
  role: 'wafers',
  order: 9,
  icon: "grindless:gallium_arsenide_wafer",
  autofocus: "W_GALLIUM_ARSENIDE",
  title: "UV: Wafers",
  subtitle: ["The wafers and machines of this age, one by one."],
};

export const LINKS = [];

export const QUESTS = [
  {
    key: "W_GALLIUM_ARSENIDE", kind: "wafer", title: "Gallium Arsenide Wafer", icon: "grindless:gallium_arsenide_wafer", deps: ["H_WAF"], x: 2, y: 0,
    teach: {
      for: "The &6Gallium Arsenide Wafer&r is a wafer stage on the way to the InAs QD Wafer.",
      needs: "Made in the &6Space Photovoltaics&r from the IMM Epi Wafer, with hydrofluoric acid, in the cleanroom.",
      unlocks: "The InAs QD Wafer and AlGaAs Bragg Stack in the Molecular Beam Epitaxy.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:gallium_arsenide_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_INGAAS_EPI", kind: "wafer", title: "InGaAs Epi Wafer", icon: "grindless:ingaas_epi_wafer", deps: ["H_WAF"], x: 2, y: 1.5,
    teach: {
      for: "The &6InGaAs Epi Wafer&r is a wafer stage on the way to the Red Tuned Solar Array.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The Red Tuned Solar Array in the Space Photovoltaics.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:ingaas_epi_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_EPITAXIAL_SILICON", kind: "wafer", title: "Epitaxial Silicon Wafer", icon: "grindless:epitaxial_silicon_wafer", deps: ["H_WAF"], x: 2, y: 3,
    teach: {
      for: "The &6Epitaxial Silicon Wafer&r: Silicon grown from silane in the wake shield's hard vacuum.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe. The light sail's carrier.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "A pattern provider on the machine of the step before keeps it supplied.",
    },
    desc: [], tasks: [it("grindless:epitaxial_silicon_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_SAPPHIRE", kind: "wafer", title: "Sapphire Wafer", icon: "grindless:sapphire_wafer", deps: ["H_WAF"], x: 2, y: 4.5,
    teach: {
      for: "The &6Sapphire Wafer&r is a wafer stage on the way to the NbTiN Film Wafer.",
      needs: "Made by the first machine of its line; the cleanroom and EMI show the exact recipe.",
      unlocks: "The NbTiN Film Wafer in the MTJ Sputtering.",
      automate: "Feed it by ME from the machine before it; keep a few spare wafers in stock.",
    },
    desc: [], tasks: [it("grindless:sapphire_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_NBN_FILM", kind: "wafer", title: "Niobium Nitride Film Wafer", icon: "grindless:nbn_film_wafer", deps: ["W_SAPPHIRE"], x: 4, y: 4.5,
    teach: {
      for: "The &6Niobium Nitride Film Wafer&r is a stage of the wafer lines of this era.",
      needs: "Made from the Sapphire Wafer in the next machine of its line, in the cleanroom.",
      unlocks: "The next stage of its line, or the chip that is built from it.",
      automate: "Chain the machines by ME, and keep a small buffer of this wafer between steps.",
    },
    desc: [], tasks: [it("grindless:nbn_film_wafer")], rewards: [xp(50)],
  },
  {
    key: "W_PMMA_COATED", kind: "wafer", title: "PMMA Wafer", icon: "grindless:pmma_coated_wafer", deps: ["H_WAF"], x: 2, y: 6,
    teach: {
      for: "The &6PMMA Wafer&r: A high-power wafer under a thick PMMA resist.",
      needs: "Made in the &6Chemical Bath&r from the HPIC Wafer, with PMMA resist, in the cleanroom. Exposed by the synchrotron (circuit 1).",
      unlocks: "The Exposed Wafer in the Synchrotron.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:pmma_coated_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "W_EXPOSED", kind: "wafer", title: "Exposed Wafer", icon: "grindless:exposed_wafer", deps: ["H_WAF"], x: 2, y: 7.5,
    teach: {
      for: "The &6Exposed Wafer&r: The X-rays have cut the pattern deep into the PMMA.",
      needs: "Made in the &6Synchrotron&r from the PMMA Wafer, with liquid helium, in the cleanroom. Developed by the synchrotron (circuit 2).",
      unlocks: "The LIGA-Patterned Wafer in the Synchrotron.",
      automate: "Stock it by ME and let the next step pull it; nothing here needs a hand.",
    },
    desc: [], tasks: [it("grindless:exposed_wafer")], rewards: [xp(50)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "M_MEGA_BLAST_FURNACE", kind: "machine", title: "Mega Blast Furnace", icon: "gtceu:mega_blast_furnace", deps: ["H_WAF"], x: 2, y: 10.5,
    teach: {
      for: "The &6Mega Blast Furnace&r runs Electric Blast Furnace recipes at scale. It is the blast furnace of the UV age.",
      needs: "The controller takes a ZPM field generator, Naquadah springs and Naquadah alloy dense plates; the body follows the structure preview.",
      unlocks: "Big batches of every blast furnace metal, steel and neodymium among them.",
      automate: "Item buses and fluid hatches in, item buses and fluid hatches out.",
    },
    desc: [], tasks: [it("gtceu:mega_blast_furnace")], rewards: [xp(100)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "M_MEGA_VACUUM_FREEZER", kind: "machine", title: "Mega Vacuum Freezer", icon: "gtceu:mega_vacuum_freezer", deps: ["H_WAF"], x: 4, y: 10.5,
    teach: {
      for: "The &6Mega Vacuum Freezer&r runs Vacuum Freezer recipes at scale, cooling hot ingots and cryogenic fluids in bulk.",
      needs: "The controller takes a ZPM field generator, a niobium titanium fluid pipe and rhodium plated palladium dense plates; the body follows the structure preview.",
      unlocks: "Trinaquadalloy and cold-chain recipes in volume.",
      automate: "Item buses and fluid hatches in, item buses and fluid hatches out.",
    },
    desc: [], tasks: [it("gtceu:mega_vacuum_freezer")], rewards: [xp(100)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "M_NETWORK_SWITCH", kind: "machine", title: "Network Switch", icon: "gtceu:network_switch", deps: ["H_WAF"], x: 6, y: 10.5,
    teach: {
      for: "The &6Network Switch&r is the multiblock that routes data between computers. It is the hub of a data network.",
      needs: "The controller takes tritanium foils, a computer casing and a ZPM emitter.",
      unlocks: "Bigger data networks, with more computers talking at once.",
      automate: "It has no inputs to feed: place it and link the data hatches of the computers it serves.",
    },
    desc: [], tasks: [it("gtceu:network_switch")], rewards: [xp(100)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "M_TEGMARK_FORGE", kind: "machine", title: "Tegmark Forge", icon: "gtca:tegmark_forge", deps: ["H_WAF"], x: 8, y: 10.5,
    teach: {
      for: "The &6Tegmark Forge&r is a Community Additions multiblock that forges the exotic alloys of the late game from a single seed of matter.",
      needs: "The controller takes a neutronex frame, a double neutronex plate and a duranium X frame.",
      unlocks: "Adamantium, ohriharukon and orundum ingots.",
      automate: "Item buses and fluid hatches in, item buses out.",
    },
    desc: [], tasks: [it("gtca:tegmark_forge")], rewards: [xp(100)],
    raw: { hide_dependency_lines: 'true' },
  },
  {
    key: "M_WEB_RECEIVER", kind: "machine", title: "Web Receiver", icon: "gtmutils:web_receiver", deps: ["H_WAF"], x: 10, y: 10.5,
    teach: {
      for: "The &6Web Receiver&r is the first piece of a wireless energy web: it catches power from the web and hands it to a machine.",
      needs: "The controller takes an active transformer, Naquadah alloy plates and a UV sensor.",
      unlocks: "The Web Hub, which needs one to be built.",
      automate: "It takes no items: place it next to the machines it should feed.",
    },
    desc: [], tasks: [it("gtmutils:web_receiver")], rewards: [xp(100)],
    raw: { hide_dependency_lines: 'true' },
  },
];
