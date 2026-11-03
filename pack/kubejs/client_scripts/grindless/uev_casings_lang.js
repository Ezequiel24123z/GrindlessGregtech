// priority: 5051
// Gregtech Grindless - names and tooltips of the UEV casing family (startup_scripts/grindless/uev/casings.js):
//   block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1). Names go in en_us.
(function () {
    var ENTRIES = [
        ['sic_composite_casing',
            ['SiC Composite Casing', 'A stiff, light SiC/SiC sandwich with 6N tantalum inserts at the joints.', 'Body of the UEV halls and workhorses. Holds 1,600 C.']],
        ['superhydride_magnet_casing',
            ['Superhydride Magnet Casing', 'Lanthanum yttrium superhydride windings on a Fe16N2 yoke.', 'Passive field magnet of the UEV machines. Its sensor detects quenches.']],
        ['hftacn_lining_casing',
            ['HfTaCN Lining Casing', 'Hafnium tantalum carbonitride bricks, the most refractory wall known.', 'Hot-zone lining of the UEV furnaces. Bonded with YSZ.']]
    ]
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            var n = e[0]
            var t = e[1]
            event.add('grindless', 'block.grindless.' + n, t[0])
            event.add('grindless', 'tooltip.grindless.' + n + '.0', t[1])
            event.add('grindless', 'tooltip.grindless.' + n + '.1', t[2])
        })
    })
})()
