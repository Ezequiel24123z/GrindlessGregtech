// Gregtech Grindless - names and tooltips of the UXV casing family (startup_scripts/grindless/uxv/casings.js):
//   block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1). Names go in en_us.
(function () {
    var ENTRIES = [
        ['gum_metal_casing',
            ['Gum Metal Casing', 'A superelastic titanium-niobium frame with W-184 fibre panels.', 'Body of every UXV structure. Takes the thermal strain of huge halls.', 'A structure block: a superelastic gum metal frame with W-184 fibre panels, made in the Assembler from gum metal billets and W-184 CVI preforms. It is the structural body of every UXV structure.']],
        ['mu_metal_shield_casing',
            ['Mu-Metal Shield Casing', 'Annealed mu-metal panels over a gum metal frame.', 'Field-free rooms. Its sensor is the active-compensation magnetometer.', 'A structure block: annealed mu-metal foil on a gum metal frame, made in the Assembler with a UXV sensor. It is the magnetic shielding of the spintronic fab, the YIG furnace and the SHeQUID gyroscope.']],
        ['pulsed_field_casing',
            ['Pulsed Field Casing', 'Metallic hydrogen windings driven by Ga2O3 switches and Finemet cores.', 'Pulsed magnet of the Cygnus plasma machines, the MNT beam line and the Mk6.', 'A structure block: metallic hydrogen windings with Ga2O3 power dies and Finemet induction cores, made in the Naquadria Magnet Works (circuit 15) with a UIV emitter as the laser trigger of the switches. It is the pulsed field magnet of the UXV machines.']],
        ['pasta_containment_casing',
            ['Pasta Containment Casing', 'FRC cartridges and UIV cage parts on a gum metal frame.', 'Contains nuclear pasta at Vela. Built before Vela with a UIV field generator.', 'A structure block: field-reversed ring cartridges and UIV cage parts on a gum metal frame, made in the Assembler with a UIV field generator. It is the containment of the nuclear pasta structures at Vela.']]
    ]
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            var n = e[0]
            var t = e[1]
            event.add('grindless', 'block.grindless.' + n, t[0])
            event.add('grindless', 'tooltip.grindless.' + n + '.0', t[1])
            event.add('grindless', 'tooltip.grindless.' + n + '.1', t[2])
            event.add('grindless', 'emi.grindless.info.' + n + '.0', t[3])
        })
    })
})()
