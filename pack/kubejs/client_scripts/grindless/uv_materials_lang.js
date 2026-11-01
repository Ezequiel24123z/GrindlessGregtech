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
        }
    }

    ClientEvents.lang('en_us', function (event) {
        var t = TEXT.en_us
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
})()
