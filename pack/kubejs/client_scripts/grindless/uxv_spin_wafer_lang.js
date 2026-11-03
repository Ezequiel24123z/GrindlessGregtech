// priority: 1478
// Gregtech Grindless - names and tooltips of UXV's spintronic wafer (startup_scripts/grindless/uxv/spin_wafer.js; package D4-UXV-SPIN):
//
//   gtceu.recipe.grindless_<type>.<recipe>   the EMI lines of the new X1 rows (tables/spin_logic.json)
//   item.grindless.<n>, tooltip.grindless.<n>.0   the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['gtceu.recipe.grindless_mocvd.si28_cmos_wafer', 'Circuit 10: a hafnia gate dielectric and a titanium nitride gate grown on the 28Si wafer; the reaction gives off hydrochloric acid.'],
        ['gtceu.recipe.grindless_photonic_foundry.si28_m1_wafer', 'Circuit 17: tungsten vias and the first copper layer on the CMOS wafer.'],
        ['gtceu.recipe.grindless_photonic_foundry.spintronic_wafer', 'Circuit 30: the copper and gold top layers close the MESO spin wafer.'],
        ['gtceu.recipe.grindless_vdw_assembly.me_on_spin_wafer', 'Circuit 7: the magnetoelectric membrane is transferred onto the magnonic bus wafer.'],
        ['gtceu.recipe.grindless_vdw_assembly.meso_spin_wafer', 'Circuit 8: the SOT readout stack is laid over the magnetoelectric layer.']
    ]

    // [name, en, tooltip 0]
    var ITEMS = [
        ['si28_cmos_wafer', '28Si CMOS Wafer', 'A 28Si wafer with its gate dielectric and gates grown.'],
        ['si28_m1_wafer', '28Si M1 Wafer', 'A CMOS wafer with tungsten vias and a first copper layer.'],
        ['me_on_spin_wafer', 'ME-on-Spin Wafer', 'The magnonic bus wafer under a magnetoelectric membrane.'],
        ['meso_spin_wafer', 'MESO Spin Wafer', 'Memory, bus, switch and spin-orbit readout on one wafer.'],
        ['spintronic_wafer', 'Spintronic Wafer', 'The finished wafer, ready to be diced into spintronic dies.'],
        ['spintronic_die', 'Spintronic Die', 'Logic, memory and spin-wave bus of a spintronic mainframe.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
