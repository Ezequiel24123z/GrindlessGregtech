// priority: 300
// Gregtech Grindless - names and tooltips of ZPM's PAN carbon fibre (startup_scripts/grindless/zpm/pan_fibre.js).
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('material.gtceu.acrylonitrile', 'Acrylonitrile')
    add('material.gtceu.polyacrylonitrile', 'Polyacrylonitrile')
    add('item.grindless.pan_precursor_fibre', 'PAN Precursor Fibre')
    add('item.grindless.stabilised_pan_fibre', 'Stabilised PAN Fibre')
    add('tooltip.grindless.pan_precursor_fibre.0', 'Wet-spun polyacrylonitrile. Oxidise it in hot oxygen to stabilise it.')
    add('tooltip.grindless.stabilised_pan_fibre.0', 'A dark ladder polymer. Carbonise it at 1,600 K under nitrogen.')
})
