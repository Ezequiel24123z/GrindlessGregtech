// priority: 2400
// Gregtech Grindless - names and tooltips of UV's materials (startup_scripts/grindless/uv/materials.js):
//
//   gtceu:boron_nitride_reactor / powder_in_tube_line / powder_bed_printer   machine names + four tooltip lines each
//   gtceu:boron_nitride / powder_in_tube / powder_bed_fusion                 recipe type names
//   grindless:bnnt_dust / silver_tube / pit_billet / near_net_* / printed_*  names + two tooltip lines each
//   gtceu:boric_acid / boron_trioxide                                        material.gtceu.<n>
// The F1 items these machines make (hbn_dust, bnnt_yarn, ented_powder, <metal>_am_powder) are named in uv_foundation_lang.js.
(function () {
    var TEXT = {
        en_us: {
            reactor: 'Boron Nitride Reactor', line: 'Powder-in-Tube Line', printer: 'Powder Bed Printer',
            reactorType: 'Boron Nitride', lineType: 'Powder in Tube', printerType: 'Powder Bed Fusion',
            reactorTips: [
                'Hexagonal boron nitride and boron nitride nanotubes: as strong as carbon nanotubes, stable to 900 C in air. Circuit 1: 2 boron trioxide + 2,500 mB ammonia -> 2 hBN + 3,000 mB steam + 500 mB ammonia back.',
                'Circuit 2: 1 hBN + 500 mB hydrogen -> 1 BNNT dust in the induction plasma (the hydrogen comes back). Circuit 3: 5 BNNT dust -> 1 BNNT yarn + 1 hBN (the fines go back to circuit 2).',
                'Circuit 4: 1,000 mB boron-10 trifluoride (the hot cell\'s enrichment tails) + 1,000 mB ammonia -> 1 hBN + 3,000 mB hydrofluoric acid. The only maker of BNNT yarn.',
                'Needs 7 x 7 x 9 UV casing (8 or more among the parts), naquadah coils, PTFE pipe casing, tungsten steel gearboxes, 1 or 2 energy hatches (UV), input and output buses and hatches.'
            ],
            lineTips: [
                'EnTED wire, GTM\'s UV superconductor, at four wires per ingot of powder. Circuit 1: 4 enriched naquadah + 3 trinium + 2 europium + 1 duranium dust -> 10 EnTED powder.',
                'Circuit 2: 4 EnTED powder + 1 silver tube -> 1 PIT billet. Circuit 3: 1 billet -> 16 EnTED single wires + 1 silver dust (the sheath, back into tubes).',
                'The only maker of EnTED wire: the wiremill, extruder and wire cutter routes are gone. Doubling, fine wire and cables still start from its single wire.',
                'Needs a 3 x 5 x 15 line of UV casing (8 or more among the parts), steel pipe casing, tungsten steel gearboxes, assembly line units, trinium coils, 1 or 2 energy hatches (UV), input and output buses.'
            ],
            printerTips: [
                'UV parts in one piece with less metal. Circuit 1 atomises: 4 ingots + 1,000 mB argon -> 4 AM powder + 950 mB argon.',
                'Printing burns a fibre laser module (2 % wear: a spent module comes out at the same chance). Circuit 2: neutronium and tritanium gears and darmstadtium rotors at 75 % of the ingots; circuits 4 to 6: the thruster chamber, the array mount and the probe frame.',
                'Circuit 3 presses the near-net part: + 1,000 mB argon -> the part, all the argon back. The unsintered powder and the spatter go back to the bed.',
                'Needs 7 x 7 x 7 UV casing (8 or more among the parts), naquadah coils, PTFE pipe casing, assembly line grating, tungsten steel firebox casing and frames, 1 or 2 energy hatches (UV), input and output buses and hatches.'
            ],
            items: {
                bnnt_dust: ['BNNT Dust', 'Boron nitride nanotubes, grown in an RF induction plasma.', 'Made in the Boron Nitride Reactor (circuit 2), spun into yarn there (circuit 3).'],
                silver_tube: ['Silver Tube', 'The sheath of a powder-in-tube billet.', 'Made in an extruder from a silver ingot (tiny pipe mould).'],
                pit_billet: ['PIT Billet', 'EnTED powder packed into a silver tube, swaged shut.', 'Made in the Powder-in-Tube Line (circuit 2), drawn into wire there (circuit 3).'],
                near_net_neutronium_gear: ['Near-Net Neutronium Gear', 'A printed gear, still porous.', 'Printed in the Powder Bed Printer (circuit 2), pressed there (circuit 3).'],
                near_net_darmstadtium_rotor: ['Near-Net Darmstadtium Rotor', 'A printed rotor, still porous.', 'Printed in the Powder Bed Printer (circuit 2), pressed there (circuit 3).'],
                near_net_tritanium_gear: ['Near-Net Tritanium Gear', 'A printed gear, still porous.', 'Printed in the Powder Bed Printer (circuit 2), pressed there (circuit 3).'],
                near_net_thruster_chamber: ['Near-Net Thruster Chamber', 'A printed chamber with its cooling channels, still porous.', 'Printed in the Powder Bed Printer (circuit 4), pressed there (circuit 3).'],
                near_net_array_mount: ['Near-Net Array Mount', 'A printed mount for the launcher\'s laser array, still porous.', 'Printed in the Powder Bed Printer (circuit 5), pressed there (circuit 3).'],
                near_net_probe_frame: ['Near-Net Probe Frame', 'A printed lattice frame, still porous.', 'Printed in the Powder Bed Printer (circuit 6), pressed there (circuit 3).'],
                printed_thruster_chamber: ['Printed Thruster Chamber', 'A regeneratively cooled tritanium chamber in one piece.', 'Pressed in the Powder Bed Printer. Goes into the Thruster Works.'],
                printed_array_mount: ['Printed Array Mount', 'A neutronium mount that does not creep under the laser array\'s heat.', 'Pressed in the Powder Bed Printer. Goes into the Laser Sail Launcher.'],
                printed_probe_frame: ['Printed Probe Frame', 'A darmstadtium lattice too light to machine.', 'Pressed in the Powder Bed Printer. Goes into the deep-space probes.']
            },
            materials: { boric_acid: 'Boric Acid', boron_trioxide: 'Boron Trioxide' }
        },
        es_es: {
            reactor: 'Reactor de Nitruro de Boro', line: 'Linea de Polvo en Tubo', printer: 'Impresora de Lecho de Polvo',
            reactorType: 'Nitruro de boro', lineType: 'Polvo en tubo', printerType: 'Fusion en lecho de polvo',
            reactorTips: [
                'Nitruro de boro hexagonal y nanotubos de nitruro de boro: tan fuertes como los de carbono, estables a 900 C en aire. Circuito 1: 2 de trioxido de boro + 2.500 mB de amoniaco -> 2 hBN + 3.000 mB de vapor + 500 mB de amoniaco de vuelta.',
                'Circuito 2: 1 hBN + 500 mB de hidrogeno -> 1 polvo de BNNT en el plasma de induccion (el hidrogeno vuelve). Circuito 3: 5 polvos de BNNT -> 1 hilo de BNNT + 1 hBN (los finos vuelven al circuito 2).',
                'Circuito 4: 1.000 mB de trifluoruro de boro-10 (las colas de enriquecimiento de la celda caliente) + 1.000 mB de amoniaco -> 1 hBN + 3.000 mB de acido fluorhidrico. El unico que hace hilo de BNNT.',
                'Necesita carcasa UV de 7 x 7 x 9 (8 o mas entre las piezas), bobinas de naquadah, carcasa de tuberia de PTFE, cajas de engranajes de acero de tungsteno, 1 o 2 hatches de energia (UV), buses y hatches de entrada y salida.'
            ],
            lineTips: [
                'Cable de EnTED, el superconductor UV de GTM, a cuatro cables por lingote de polvo. Circuito 1: 4 de naquadah enriquecido + 3 de trinio + 2 de europio + 1 de duranio en polvo -> 10 polvos de EnTED.',
                'Circuito 2: 4 polvos de EnTED + 1 tubo de plata -> 1 tocho PIT. Circuito 3: 1 tocho -> 16 cables simples de EnTED + 1 polvo de plata (la funda, que vuelve a ser tubo).',
                'El unico que hace cable de EnTED: ya no hay trefiladora, extrusora ni cortacables. Duplicar, el cable fino y los cables aislados siguen saliendo de su cable simple.',
                'Necesita una linea de carcasa UV de 3 x 5 x 15 (8 o mas entre las piezas), carcasa de tuberia de acero, cajas de engranajes de acero de tungsteno, unidades de cadena de montaje, bobinas de trinio, 1 o 2 hatches de energia (UV), buses de entrada y salida.'
            ],
            printerTips: [
                'Piezas UV de una sola pieza con menos metal. El circuito 1 atomiza: 4 lingotes + 1.000 mB de argon -> 4 polvos AM + 950 mB de argon.',
                'Imprimir gasta un modulo laser de fibra (2 % de desgaste: sale un modulo gastado con la misma probabilidad). Circuito 2: engranajes de neutronio y tritanio y rotores de darmstadtio al 75 % de los lingotes; circuitos 4 a 6: la camara del propulsor, el soporte del array y el bastidor de sonda.',
                'El circuito 3 prensa la pieza casi final: + 1.000 mB de argon -> la pieza, con todo el argon de vuelta. El polvo sin sinterizar y las salpicaduras vuelven al lecho.',
                'Necesita carcasa UV de 7 x 7 x 7 (8 o mas entre las piezas), bobinas de naquadah, carcasa de tuberia de PTFE, rejilla de cadena de montaje, carcasa de hogar de acero de tungsteno y marcos, 1 o 2 hatches de energia (UV), buses y hatches de entrada y salida.'
            ],
            items: {
                bnnt_dust: ['Polvo de BNNT', 'Nanotubos de nitruro de boro crecidos en un plasma de induccion RF.', 'Se hace en el Reactor de Nitruro de Boro (circuito 2) y alli se hila (circuito 3).'],
                silver_tube: ['Tubo de plata', 'La funda de un tocho de polvo en tubo.', 'Se hace en una extrusora con un lingote de plata (molde de tuberia diminuta).'],
                pit_billet: ['Tocho PIT', 'Polvo de EnTED prensado en un tubo de plata y cerrado por forja rotativa.', 'Se hace en la Linea de Polvo en Tubo (circuito 2) y alli se trefila (circuito 3).'],
                near_net_neutronium_gear: ['Engranaje de neutronio casi final', 'Un engranaje impreso, aun poroso.', 'Se imprime en la Impresora de Lecho de Polvo (circuito 2) y alli se prensa (circuito 3).'],
                near_net_darmstadtium_rotor: ['Rotor de darmstadtio casi final', 'Un rotor impreso, aun poroso.', 'Se imprime en la Impresora de Lecho de Polvo (circuito 2) y alli se prensa (circuito 3).'],
                near_net_tritanium_gear: ['Engranaje de tritanio casi final', 'Un engranaje impreso, aun poroso.', 'Se imprime en la Impresora de Lecho de Polvo (circuito 2) y alli se prensa (circuito 3).'],
                near_net_thruster_chamber: ['Camara de propulsor casi final', 'Una camara impresa con sus canales de refrigeracion, aun porosa.', 'Se imprime en la Impresora de Lecho de Polvo (circuito 4) y alli se prensa (circuito 3).'],
                near_net_array_mount: ['Soporte de array casi final', 'Un soporte impreso para el array laser del lanzador, aun poroso.', 'Se imprime en la Impresora de Lecho de Polvo (circuito 5) y alli se prensa (circuito 3).'],
                near_net_probe_frame: ['Bastidor de sonda casi final', 'Un bastidor de celosia impreso, aun poroso.', 'Se imprime en la Impresora de Lecho de Polvo (circuito 6) y alli se prensa (circuito 3).'],
                printed_thruster_chamber: ['Camara de propulsor impresa', 'Una camara de tritanio con refrigeracion regenerativa, de una sola pieza.', 'Se prensa en la Impresora de Lecho de Polvo. Va al Taller de Propulsores.'],
                printed_array_mount: ['Soporte de array impreso', 'Un soporte de neutronio que no fluye bajo el calor del array laser.', 'Se prensa en la Impresora de Lecho de Polvo. Va al Lanzador de Velas Laser.'],
                printed_probe_frame: ['Bastidor de sonda impreso', 'Una celosia de darmstadtio demasiado ligera para mecanizarla.', 'Se prensa en la Impresora de Lecho de Polvo. Va a las sondas de espacio profundo.']
            },
            materials: { boric_acid: 'Acido borico', boron_trioxide: 'Trioxido de boro' }
        }
    }

    Object.keys(TEXT).forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            var t = TEXT[lang]
            var add = function (key, value) { event.add('grindless', key, value) }

            add('block.gtceu.boron_nitride_reactor', t.reactor)
            add('block.gtceu.powder_in_tube_line', t.line)
            add('block.gtceu.powder_bed_printer', t.printer)
            add('gtceu.boron_nitride', t.reactorType)
            add('gtceu.powder_in_tube', t.lineType)
            add('gtceu.powder_bed_fusion', t.printerType)
            for (var i = 0; i < 4; i++) {
                add('grindless.machine.boron_nitride_reactor.tooltip.' + i, t.reactorTips[i])
                add('grindless.machine.powder_in_tube_line.tooltip.' + i, t.lineTips[i])
                add('grindless.machine.powder_bed_printer.tooltip.' + i, t.printerTips[i])
            }
            Object.keys(t.items).forEach(function (name) {
                add('item.grindless.' + name, t.items[name][0])
                add('tooltip.grindless.' + name + '.0', t.items[name][1])
                add('tooltip.grindless.' + name + '.1', t.items[name][2])
            })
            Object.keys(t.materials).forEach(function (name) { add('material.gtceu.' + name, t.materials[name]) })
        })
    })
})()
