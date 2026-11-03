// Quest data for uxv_body: the UXV casing family, the body of every large UXV structure (docs/eras/lines-uev-uxv.md, section 9). One quest per member: what it is
// for, how it is made, which machines use it and how many a typical structure takes (counts from the controller shapes and the recipes in the dump, 9f6c318722c0, and
// server_scripts/grindless/uxv/casings.js). Structures above about 2,300 blocks say so: GTM's Terminal places about 2,300 blocks per pass.
const it = (item, count) => ({ type: 'item', item, count });
const xp = (n) => ({ type: 'xp', xp: n });

export const CHAPTER = {
  section: { name: 'UXV Body', origin: { x: 22.5, y: 12.5 } },
  filename: 'uxv_body',
  era: 'uxv',
  role: 'body',
  order: 11,
  icon: 'grindless:gum_metal_casing',
  autofocus: 'B_GUM',
  title: 'UXV: Body',
  subtitle: ['The casings that wall the UXV structures, from the plain gum metal shell to the Mk6 ring.'],
};

export const LINKS = [];

const b = (key, title, icon, deps, x, y, teach, count, xpN) => ({
  key, kind: 'process', title, icon, deps, x, y, teach, desc: [], tasks: [it(icon, count)], rewards: [xp(xpN)],
  ...(deps.some((d) => !d.startsWith('B_')) ? { raw: { hide_dependency_lines: 'true' } } : {}),
});

export const QUESTS = [
  b('B_GUM', 'Gum Metal Casing', 'grindless:gum_metal_casing', ['HULL'], 0, 0, {
    for: 'A shell of gum metal, a titanium alloy that bends without breaking, backed by a tungsten-184 preform. It is the plain wall of the age: the Spintronic Cluster Tool, the Mk6 ring and the polar cap tap are mostly made of it.',
    needs: 'An assembler (400 ticks): 8 gum metal billets, 4 tungsten-184 CVI preforms, 4 annealed mu-metal foils and 8 tungsten-184 single wires, with epoxy, for two casings.',
    unlocks: 'Most UXV structures: the Mk6 Fusion Reactor (about 2,000), the MNT Collider (about 2,000), the Stellar Fractionation Hall (about 1,800), the Pasta Mill (about 1,700), the BZ Dynamo (about 1,400), the Spintronic Cluster Tool (about 1,400), the Stellar Condensation Tower (about 860) and the FRC Former (about 690).',
    automate: 'Billets, preforms and foils by ME: a structure takes thousands, so build the casing a dedicated line.',
  }, 64, 100),
  b('B_PULSE', 'Pulsed Field Casing', 'grindless:pulsed_field_casing', ['B_GUM'], 3.5, 0, {
    for: 'A casing wound with metallic hydrogen cable and finemet cores that holds a field pulsed fast enough to steer a plasma, a beam or a stream of dense matter. The reactor, the collider and the elevator ring are lined with it.',
    needs: 'The naquadria magnet works, circuit 15: 12 metallic hydrogen windings, 6 Ga2O3 power dies, 3 finemet cores, 6 gum metal billets and 4 UIV emitters, for twelve casings.',
    unlocks: 'The Mk6 Fusion Reactor (about 1,300), the Pasta Mill (about 810), the MNT Collider (about 800), the BZ Dynamo (about 790), the Stellar Elevator (about 740), the FRC Former (about 460) and the Plasma Mass Filter (about 260).',
    automate: 'The windings are the bottleneck; send them and the dies to the works by ME and keep the power dies stocked.',
  }, 64, 120),
  b('B_MU', 'Mu-Metal Shield Casing', 'grindless:mu_metal_shield_casing', ['B_GUM'], 7, 0, {
    for: 'A casing of annealed mu-metal that bends a magnetic field around what it covers. The magnetic layers of the spintronic fab would be erased by a stray field, so the Spintronic Cluster Tool is shielded with it.',
    needs: 'An assembler (500 ticks): 16 annealed mu-metal foils, 4 gum metal billets, 4 tungsten-184 CVI preforms and 2 UIV sensors, with epoxy, for eight casings. It takes UIV sensors, not UXV ones: the Cluster Tool makes the dies a UXV sensor is built from.',
    unlocks: 'The Spintronic Cluster Tool, which takes about 870 of them.',
    automate: 'Foils and billets by ME; the sensors are the costly part, so make them ahead of the batch.',
  }, 64, 120),
  b('B_PASTA', 'Pasta Containment Casing', 'grindless:pasta_containment_casing', ['B_PULSE'], 3.5, 2.5, {
    for: 'A violet-black casing with magenta striations, built to hold nuclear pasta, the matter in a neutron star\'s crust. Each is a cage of field-reversed rings around a gum metal wall.',
    needs: 'An assembler (600 ticks): 32 FRC cartridges, 32 cage parts, 32 gum metal billets and a UIV field generator, with epoxy, for sixty-four casings.',
    unlocks: 'The pasta structures of Vela: the Pasta Extractor (about 260) and the Pasta Mill (about 1,670) are walled with it. Its FRC cartridges and cage parts are all made before Vela, so you can stock it before the jump.',
    automate: 'FRC cartridges by ME from the field-reversed line; the cage parts and billets by ME.',
  }, 64, 120),
  b('B_MK6', 'UXV Fusion Casing', 'grindless:uxv_fusion_casing', ['B_GUM'], 0, 2.5, {
    for: 'The first wall of the Mk6 ring: a refractory high-entropy tile on a tungsten-184 preform, wound with metallic hydrogen cable and framed in tritanium. It faces the plasma.',
    needs: 'An assembler (600 ticks): 12 tungsten-fibre RHEA billets, 12 tungsten-184 CVI preforms, 12 metallic hydrogen windings, 12 tritanium frames and a UXV field generator, with 6N helium, for twenty-four casings.',
    unlocks: 'The Mk6 Fusion Reactor, which takes about 250 of them. The ring is about 4,100 blocks, too large for one pass of GTM\'s Terminal, which places about 2,300 per pass, so it takes two.',
    automate: 'Billets, preforms and windings by ME; make the casings in a batch before you start the ring.',
  }, 64, 160),
];
