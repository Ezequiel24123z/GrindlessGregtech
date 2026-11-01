// priority: 1586
// Gregtech Grindless - names, tooltips and EMI info pages of UXV's Mk6 fusion ring (startup_scripts/grindless/uxv/fusion_mk6.js; package UXV-A7):
//
//   block.gtceu.uxv_fusion_reactor, material.gtceu.<id>   machine and ash gas names
//   grindless.machine.uxv_fusion_reactor.tooltip.N        controller tooltips
//   emi.grindless.info.<page>.N                           the info pages (assets/emi/recipe/additions/grindless/): the ring, the casing,
//                                                         the Si-28 stock for OpV and the ordinary stock the ash splits into
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.uxv_fusion_reactor', 'Mk6 Fusion Reactor'],
        ['material.gtceu.helium_burning_ash', 'Helium-Burning Ash'],
        ['material.gtceu.carbon_burning_ash', 'Carbon-Burning Ash'],
        ['material.gtceu.oxygen_burning_ash', 'Oxygen-Burning Ash'],

        ['grindless.machine.uxv_fusion_reactor.tooltip.0',
            '\u00a77The stellar burning ring: a third fusion ring for a massive star\'s fuels.'],

        ['emi.grindless.info.uxv_fusion_reactor.0',
            'c1 hot CNO: stellar hydrogen cut + CNO cut, start 6 G. c2 triple-alpha fuel, start 8 G. c3 carbon-burning fuel, start 9 G. c4 oxygen-burning fuel, start 10 G at 134,217,728 EU/t, the most a UXV ring can draw.'],
        ['emi.grindless.info.uxv_fusion_reactor.1',
            'The direct energy converter returns EU and ash. c1 gives back 19 of every 20 mB of the CNO cut, a catalyst; the helium it makes is inert and is vented. c2 ash goes to the plasma quench caster (circuit 3): C-12 for the electron beam furnace and O-16 for the cryogenic plant, so c3 and c4 burn what c2 makes.'],
        ['emi.grindless.info.uxv_fusion_reactor.2',
            'Carbon ash splits into neon, sodium and magnesium (circuit 4). Oxygen ash splits into Si-28 (circuit 5, stock for the next tier), sulfur (circuit 7) and phosphorus (circuit 8). Circuit 6 casts finemet melt into ribbon.'],
        ['emi.grindless.info.uxv_fusion_reactor.3',
            'Each fuel is made from the ash of the one before. With 16 UXV energy hatches it stores 10,240,000,000 EU. It needs the UXV fusion casing, metallic hydrogen coils and fusion glass; parts: energy hatches and fluid hatches.'],
        ['emi.grindless.info.uxv_fusion_casing.0',
            'Built in the assembler from a W-fibre/RHEA billet, a W-184 CVI preform, a metallic hydrogen winding, a UXV field generator and a tritanium frame, with 6N helium as backfill.'],
        ['emi.grindless.info.si28_ash.0',
            'Si-28 from oxygen burning, split out by the plasma quench caster at circuit 5. Stock for OpV: nothing in UXV uses it.'],
        ['emi.grindless.info.uxv_fusion_stock.0',
            'Ordinary neon, sodium, magnesium, sulfur and phosphorus also come out of the Mk6 ash split (circuits 4, 7 and 8). They are the same stock the rest of the pack uses.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
