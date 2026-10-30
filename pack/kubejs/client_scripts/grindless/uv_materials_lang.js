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
                '§7Makes hBN and boron nitride nanotubes.'
            ],
            lineTips: [
                '§7Makes EnTED wire, the UV superconductor.'
            ],
            printerTips: [
                '§7Prints UV parts in one piece from atomised metal powder.'
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
                '§7Fabrica hBN y nanotubos de nitruro de boro.'
            ],
            lineTips: [
                '§7Fabrica cable EnTED, el superconductor UV.'
            ],
            printerTips: [
                '§7Imprime piezas UV de una sola pieza con polvo metálico atomizado.'
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
            for (var i = 0; i < 1; i++) {
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
