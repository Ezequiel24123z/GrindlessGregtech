// Quest data for uiv_body: the UIV casing family, the body of every large UIV structure (docs/eras/lines-uev-uxv.md, section 9). One quest per member: what it
// is for, how it is made, which machines use it and how many a typical structure takes (counts from the controller shapes in the dump, fb65632509ee, and the recipes
// there). Structures above about 2,300 blocks say so: GTM's Terminal places about 2,300 blocks per pass.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UIV Body', origin: { x: 26.5, y: 21 } },
  filename: 'uiv_body',
  era: 'uiv',
  role: 'body',
  order: 5,
  icon: 'grindless:rhea_casing',
  autofocus: 'B_RHEA',
  title: 'UIV: Body',
  subtitle: ['The casings and the radiator module that wall the UIV structures.'],
};

export const LINKS = [];

const b = (key, title, icon, deps, x, y, teach, count, xpN) => ({
  key, kind: 'process', title, icon, deps, x, y, teach, desc: [], tasks: [it(icon, count)], rewards: [xp(xpN)],
  ...(deps.some((d) => !d.startsWith('B_')) ? { raw: { hide_dependency_lines: 'true' } } : {}),
});

export const QUESTS = [
  b('B_RHEA', 'RHEA Casing', 'grindless:rhea_casing', ['HULL'], 0, 0, {
    for: 'A shell of printed refractory high-entropy alloy that keeps its strength through heat and a field. It is the plain wall of the age: the Matrioshka Computer alone takes about 1,600, and the Mk5 ring about 1,350.',
    needs: 'The powder bed printer (400 ticks): 16 RHEA powders, 6 RHEA plates and 3 tungsten-fibre RHEA billets, for two casings.',
    unlocks: 'The body of nearly every UIV structure: the Pulser (about 1,050), the Penrose Engine (about 620), the BEUV Scanner (about 460), the Droplet Radiator Works (about 630) and the Pulsar Wind Trap (about 480).',
    automate: 'Powder, plates and billets by ME: you need thousands, so build it a dedicated line with several printers.',
  }, 64, 100),
  b('B_MH', 'Metallic Hydrogen Field Casing', 'grindless:mh_field_casing', ['B_RHEA'], 3.5, 0, {
    for: 'A casing wound with metallic hydrogen cable that holds a field strong enough to confine a plasma or a star\'s matter. The reactor, the engine and the neutron machines are lined with it.',
    needs: 'The naquadria magnet works, circuit 12: 16 metallic hydrogen windings, 8 RHEA plates and 4 radiation-hardened controllers, for sixteen casings.',
    unlocks: 'The Penrose Engine (about 1,200), the Mk5 Fusion Reactor (about 1,000), the Pulsar Wind Trap (about 550), the Neutronium Compression Hall (about 540) and the Neutron Drip Works (about 420).',
    automate: 'The windings are the bottleneck; keep the Ramp Compression Pulser running and send them to the works by ME.',
  }, 64, 120),
  b('B_OPT', 'Multilayer Optics Casing', 'grindless:multilayer_optics_casing', ['B_MH'], 7, 0, {
    for: 'A casing faced with lanthanum and boron carbide multilayers, which reflect extreme ultraviolet that every plain mirror absorbs. Machines that work with X-rays and 6.7 nm light are built from it.',
    needs: 'An assembler (400 ticks): 8 La/B4C multilayers, 8 RHEA plates, 4 glass interposers and a UIV sensor, with liquid nitrogen, for eight casings.',
    unlocks: 'The BEUV Scanner (about 740), the X-ray Pulse Profiler (about 515), the STM Lithography Cell (about 350) and the Positronium Condensate Lab (about 250).',
    automate: 'Multilayers and interposers by ME; liquid nitrogen by pipe.',
  }, 64, 120),
  b('B_CRYO', 'Dilution Cryostat Casing', 'grindless:dilution_cryostat_casing', ['B_OPT'], 10.5, 0, {
    for: 'A casing with a dilution refrigerator built in, cold enough that the spins of the matter inside stop moving. The labs that hold a condensate or a polarised source are cased in it.',
    needs: 'The nuclear demagnetisation stage, circuit 8: 8 mK cryostat modules, 8 RHEA plates and a UIV electric pump, with helium-3, for eight casings.',
    unlocks: 'The Positronium Condensate Lab (about 500), the Polarised Proton Source (about 215) and the Neutron Drip Works (about 130).',
    automate: 'Cryostat modules and helium-3 by ME and by pipe; the helium returns to the works.',
  }, 32, 140),
  b('B_SITE', 'Neutron Star Site Casing', 'grindless:neutron_star_site_casing', ['B_CRYO'], 14, 0, {
    for: 'The casing of the machines at the neutron star: osmiridium and reflector plate over radiation-hardened controllers, lined with polybenzimidazole. It is the one that does not leave the star.',
    needs: 'An assembler (600 ticks): 2 radiation-hardened controllers, 6 osmiridium plates, 2 neutron reflectors and polybenzimidazole, for eight casings.',
    unlocks: 'The Neutronium Compression Hall (about 840), the Neutron Drip Works (about 720), the Decay Heat Vault (about 490), the R-Process Decompressor (about 300) and the Crust Lift (about 250).',
    automate: 'Controllers and plates by ME; polybenzimidazole by pipe.',
  }, 64, 140),
  b('B_MK5', 'UIV Fusion Casing', 'grindless:uiv_fusion_casing', ['B_RHEA', 'RING'], 3.5, 2.5, {
    for: 'The first wall of the Mk5 ring: lithium-tin armoured tiles over a tungsten-fibre backing. It faces the plasma, and the divertor casing takes what is left of it.',
    needs: 'An assembler (300 ticks) makes four casings from 4 Li-Sn armoured tiles, 4 W fibre preforms and a UIV electric pump, with liquid Li-Sn. For two divertor casings, take one divertor and 2 Mk3 fusion casings.',
    unlocks: 'The Mk5 Fusion Reactor, which takes about 520 of them. The ring is too large for one pass of GTM\'s Terminal, which places about 2,300 per pass, so it takes two.',
    automate: 'Tiles and preforms by ME; the first-wall line is long, so make casings in a batch before you start the ring.',
  }, 64, 160),
  b('B_RAD', 'Droplet Radiator Module', 'grindless:droplet_radiator_module', ['B_RHEA'], 7, 2.5, {
    for: 'The part of the Matrioshka shell that sheds heat. Each module drops a curtain of tin droplets through free fall, and each one needs a pump to lift the tin back up.',
    needs: 'The assembly line (1,200 ticks, researched from the droplet collector): an orifice plate, 3 electron-beam distilled tin, a droplet collector, 2 UIV electric pumps and a UIV circuit.',
    unlocks: 'The Matrioshka Computer, which takes 22 of them. The shell is too large for one pass of GTM\'s Terminal, which places about 2,300 per pass, so it takes two.',
    automate: 'Pumps by ME, tin by pipe; ship modules down by ME from the orbit.',
  }, 22, 160),
];
