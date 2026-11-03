// priority: 5124
// Gregtech Grindless - names and tooltips of the UIV casing family (startup_scripts/grindless/uiv/casings.js):
//   block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1). Names go in en_us.
(function () {
    var ENTRIES = [
        ['rhea_casing',
            ['RHEA Casing', 'A printed gyroid lattice of W-Mo-Nb-Ta-Hf between RHEA faces.', 'Body of the UIV halls and workhorses. Holds 1,600 C.', 'A structure block: a gyroid lattice of the refractory high-entropy alloy printed from RHEA powder, closed between RHEA plates and bonded with a tungsten-fibre RHEA billet, made in the Powder Bed Printer. It is the structural body of the UIV halls and workhorses.']],
        ['mh_field_casing',
            ['MH Field Casing', 'Metallic hydrogen windings behind RHEA plates.', 'Passive field magnet of the UIV machines. A rad-hard controller handles quench and power.', 'A structure block: metallic hydrogen windings behind RHEA plates, with a rad-hard diamond controller for quench and power, made in the Naquadria Magnet Works (circuit 12). It is the passive field magnet of the UIV machines.']],
        ['multilayer_optics_casing',
            ['Multilayer Optics Casing', 'La/B4C multilayer mirrors in a hydrogen-flushed vacuum bench.', 'Optical bench of the UIV machines. Its UIV sensor is the stage metrology.', 'A structure block: La/B4C multilayer reflectors, the 6.7 nm and X-ray mirrors, on glass interposers in RHEA plates, made in the Assembler with a UIV sensor. It is the optical bench of the UIV lithography, photonics and positronium machines.']],
        ['dilution_cryostat_casing',
            ['Dilution Cryostat Casing', 'Nested frosted shields round a PrNi5 millikelvin module.', 'Cryogenic can of the UIV machines. Its pump circulates the helium-3.', 'A structure block: PrNi5 millikelvin modules in nested RHEA shields with a UIV electric pump to circulate the helium-3, made in the Millikelvin Cryostat Works (circuit 8) with a helium-3 charge. It is the cryogenic stage of the UIV machines.']]
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
