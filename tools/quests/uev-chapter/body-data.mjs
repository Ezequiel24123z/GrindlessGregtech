// Quest data for uev_body: the UEV casing family, the body of every large UEV structure (docs/eras/lines-uev-uxv.md, section 9). One quest per member: what it
// is for, how it is made, which machines use it and how many a typical structure takes (counts from the controller shapes in the dump, 804cc913d48a). Structures
// above about 2,300 blocks name their Terminal passes: GTM's Terminal places about 2,300 blocks per pass.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UEV Body', origin: { x: 44, y: 6 } },
  filename: 'uev_body',
  era: 'uev',
  role: 'body',
  order: 12,
  icon: 'grindless:sic_composite_casing',
  autofocus: 'B_SIC',
  title: 'UEV: Body',
  subtitle: ['The six casings of the UEV family.'],
};

export const LINKS = [];

const b = (key, title, icon, deps, x, y, teach, count, xpN) => ({
  key, kind: 'process', title, icon, deps, x, y, teach, desc: [], tasks: [it(icon, count)], rewards: [xp(xpN)],
  ...(deps.some((d) => !d.startsWith('B_')) ? { raw: { hide_dependency_lines: 'true' } } : {}),
});

export const QUESTS = [
  b('B_SIC', 'SiC Composite Casing', 'grindless:sic_composite_casing', ['CVI'], 0, 0, {
    for: 'The workhorse of the age: a silicon carbide composite shell light and hard enough to wall a structure the size of a hangar. Nearly every UEV controller uses it; the Superheavy Factory alone takes about 1,400.',
    needs: 'An assembler: 16 SiC/SiC plates from the CVI Furnace, 8 SiC fibre preforms, 8 six-nines tantalum and a little epoxy, for two casings.',
    unlocks: 'The body of every UEV structure, and the base the other five casings are built beside.',
    automate: 'Stock plates, preforms and tantalum by ME and let a pattern provider run the assembler: you need hundreds, so build it a dedicated line.',
  }, 64, 100),
  b('B_MAG', 'Superhydride Magnet Casing', 'grindless:superhydride_magnet_casing', ['B_SIC', 'MAG', 'HYD'], 3.5, 0, {
    for: 'A casing wound with lanthanum superhydride cable, which carries current with no loss while pressed. It holds the field of a calutron, the Superheavy Factory and the Degenerate Works.',
    needs: 'The naquadria magnet works, circuit 11: 64 lanthanum superhydride single wires, 16 SiC/SiC plates and a UEV sensor, for sixteen casings.',
    unlocks: 'Structures that bend or hold a beam: the Calutron (about 330), the Superheavy Factory (about 580), the Degenerate Works (about 500) and the Mk4 reactor (about 260).',
    automate: 'The superhydride wire is the bottleneck; keep the Megabar Press busy and send wire to the works by ME.',
  }, 32, 120),
  b('B_PHOT', 'Photonic Casing', 'grindless:photonic_casing', ['B_SIC', 'CVI'], 7, 0, {
    for: 'A casing of ultra-low-expansion glass and hollow-core fibre that keeps a structure optically still. The photonic machines are built from it.',
    needs: 'An assembler: 16 ULE boules, 8 hollow-core fibres, 8 SiC mirror blanks, two UHV emitters and a little epoxy, for sixteen casings.',
    unlocks: 'The Photonic Integration Hall (its largest user), the SNSPD Foundry, the Van der Waals Stacker and the quantum, nebula and pulsar machines.',
    automate: 'One assembler run makes sixteen, so a single line usually covers a whole structure.',
  }, 64, 120),
  b('B_HF', 'HfTaCN Lining Casing', 'grindless:hftacn_lining_casing', ['B_SIC', 'COIL'], 10.5, 0, {
    for: 'A lining of hafnium tantalum carbonitride, the most heat-resistant ceramic known, for the hot structures.',
    needs: 'A spark plasma sinterer, circuit 20: 20 HfTaCN powders, 4 SiC/SiC plates and 2 YSZ ingots, for two casings.',
    unlocks: 'The Stellar Forge (about 750), the Mk4 reactor (about 460), the Electron Beam Furnace (about 435), the Megabar Press (about 410) and the Calutron (about 200).',
    automate: 'Powder and plates by ME; the sintering takes time, so run more than one sinterer.',
  }, 64, 120),
  b('B_DEG', 'Degenerate Containment Casing', 'grindless:degenerate_containment_casing', ['B_SIC', 'DEG'], 0, 3, {
    for: 'The casing that stops degenerate matter, which would otherwise expand, from reaching anything else. It lines the Degenerate Works.',
    needs: 'An assembler: 64 SiC/SiC plates, 32 hollow-core fibres, 8 UEV sensors and a little epoxy, for sixty-four casings.',
    unlocks: 'The Degenerate Works, whose recipes are the only ones that bottle degenerate matter into pellets.',
    automate: 'A single run makes sixty-four; the sensors are the costly input, so build it only when the works is ready to be placed.',
  }, 64, 120),
  b('B_FUS', 'UEV Fusion Casing', 'grindless:uev_fusion_casing', ['B_SIC', 'COIL', 'HULL'], 3.5, 3, {
    for: 'The ring casing of the Mk4 Fusion Reactor. It is an upgraded Mk3 casing that can bear Mk4 plasma.',
    needs: 'An assembler: a Mk3 fusion casing, 2 Wf/W tiles, a SiC/SiC plate and tritanium, for one casing.',
    unlocks: 'The Mk4 Fusion Reactor, which takes about 400 of them in its ring.',
    automate: 'Make them one at a time from existing Mk3 casings; the reactor is the only machine that needs them.',
  }, 32, 120),
];
