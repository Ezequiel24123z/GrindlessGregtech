// priority: 1562
// Gregtech Grindless - names, tooltips and EMI info pages of UXV's Mk6 fusion ring (startup_scripts/grindless/uxv/fusion_mk6.js; package UXV-A7):
//
//   block.gtceu.uxv_fusion_reactor, material.gtceu.<id>   machine and ash gas names
//   grindless.machine.uxv_fusion_reactor.tooltip.N        controller tooltips
//   emi.grindless.info.<page>.N                           the info pages (assets/emi/recipe/additions/grindless/): the ring, the casing,
//                                                         the Si-28 stock for OpV and the ordinary stock the ash splits into
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.uxv_fusion_reactor', 'Mk6 Fusion Reactor', 'Reactor de fusión Mk6'],
        ['material.gtceu.helium_burning_ash', 'Helium-Burning Ash', 'Ceniza de combustión de helio'],
        ['material.gtceu.carbon_burning_ash', 'Carbon-Burning Ash', 'Ceniza de combustión de carbono'],
        ['material.gtceu.oxygen_burning_ash', 'Oxygen-Burning Ash', 'Ceniza de combustión de oxígeno'],

        ['grindless.machine.uxv_fusion_reactor.tooltip.0',
            'The stellar burning ring: a third fusion ring that burns a massive star\'s sequence, each fuel made from the ash of the one before. Stores 10,240,000,000 EU with 16 UXV hatches.',
            'El anillo de combustión estelar: un tercer anillo de fusión que quema la secuencia de una estrella masiva, cada combustible hecho con la ceniza del anterior. Almacena 10.240.000.000 EU con 16 escotillas UXV.'],
        ['grindless.machine.uxv_fusion_reactor.tooltip.1',
            'Runs hot CNO, triple-alpha, carbon burning and oxygen burning. Starts at 6, 8, 9 and 10 billion EU. The plasmas go through the direct energy converter and the ash to the plasma quench caster.',
            'Ejecuta CNO caliente, triple alfa, combustión de carbono y combustión de oxígeno. Arranca con 6, 8, 9 y 10 mil millones de EU. Los plasmas pasan por el convertidor de energía directa y la ceniza por el temple de plasma.'],
        ['grindless.machine.uxv_fusion_reactor.tooltip.2',
            'Needs the UXV fusion casing, metallic hydrogen coils and fusion glass. Parts: energy hatches and fluid hatches. Accepts a parallel hatch.',
            'Necesita la carcasa de fusión UXV, bobinas de hidrógeno metálico y vidrio de fusión. Piezas: escotillas de energía y de fluidos. Acepta una escotilla de paralelos.'],

        ['emi.grindless.info.uxv_fusion_reactor.0',
            'c1 hot CNO: stellar hydrogen cut + CNO cut, start 6 G. c2 triple-alpha fuel, start 8 G. c3 carbon-burning fuel, start 9 G. c4 oxygen-burning fuel, start 10 G at 134,217,728 EU/t, the most a UXV ring can draw.',
            'c1 CNO caliente: corte de hidrógeno estelar + corte de CNO, arranque 6 G. c2 combustible triple alfa, arranque 8 G. c3 combustible de carbono, arranque 9 G. c4 combustible de oxígeno, arranque 10 G a 134.217.728 EU/t, lo máximo que puede consumir un anillo UXV.'],
        ['emi.grindless.info.uxv_fusion_reactor.1',
            'The direct energy converter returns EU and ash. c1 gives back 19 of every 20 mB of the CNO cut, a catalyst; the helium it makes is inert and is vented. c2 ash goes to the plasma quench caster (circuit 3): C-12 for the electron beam furnace and O-16 for the cryogenic plant, so c3 and c4 burn what c2 makes.',
            'El convertidor de energía directa devuelve EU y ceniza. c1 devuelve 19 de cada 20 mB del corte de CNO, un catalizador; el helio que produce es inerte y se ventea. La ceniza de c2 va al temple de plasma (circuito 3): C-12 para el horno de haz de electrones y O-16 para la planta criogénica, así c3 y c4 queman lo que fabrica c2.'],
        ['emi.grindless.info.uxv_fusion_reactor.2',
            'Carbon ash splits into neon, sodium and magnesium (circuit 4). Oxygen ash splits into Si-28 (circuit 5, stock for the next tier), sulfur (circuit 7) and phosphorus (circuit 8). Circuit 6 casts finemet melt into ribbon.',
            'La ceniza de carbono se separa en neón, sodio y magnesio (circuito 4). La ceniza de oxígeno se separa en Si-28 (circuito 5, reserva para el siguiente tier), azufre (circuito 7) y fósforo (circuito 8). El circuito 6 cuela la masa fundida de finemet en cinta.'],
        ['emi.grindless.info.uxv_fusion_casing.0',
            'Built in the assembler from a W-fibre/RHEA billet, a W-184 CVI preform, a metallic hydrogen winding, a UXV field generator and a tritanium frame, with 6N helium as backfill.',
            'Se construye en el ensamblador con un lingote de fibra de W/RHEA, una preforma CVI de W-184, un devanado de hidrógeno metálico, un generador de campo UXV y un marco de tritanio, con helio 6N de relleno.'],
        ['emi.grindless.info.si28_ash.0',
            'Si-28 from oxygen burning, split out by the plasma quench caster at circuit 5. Stock for OpV: nothing in UXV uses it.',
            'Si-28 de la combustión de oxígeno, separado por el temple de plasma con el circuito 5. Reserva para OpV: nada en UXV lo usa.'],
        ['emi.grindless.info.uxv_fusion_stock.0',
            'Ordinary neon, sodium, magnesium, sulfur and phosphorus also come out of the Mk6 ash split (circuits 4, 7 and 8). They are the same stock the rest of the pack uses.',
            'Neón, sodio, magnesio, azufre y fósforo ordinarios también salen de la separación de ceniza del Mk6 (circuitos 4, 7 y 8). Son la misma reserva que usa el resto del pack.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
