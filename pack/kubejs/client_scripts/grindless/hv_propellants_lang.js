// Gregtech Grindless - names and tooltips of the HV propellant fluid (startup_scripts/grindless/hv/propellant_items.js):
//
//   material.gtceu.aerozine_50   the GT material (GTM names its fluid and bucket from it)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. English only.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('material.gtceu.aerozine_50', 'Aerozine 50')
    add('tooltip.grindless.aerozine_50', 'Hydrazine and unsymmetrical dimethylhydrazine, half and half: a storable hypergolic fuel.')
    add('tooltip.grindless.aerozine_50.1', 'Mixed from the chemical plant\'s hydrazine and the UDMH reactors. A mixer turns it and dinitrogen tetroxide into rocket fuel.')
})

ItemEvents.tooltip(event => {
    event.add('gtceu:aerozine_50_bucket', Text.translate('tooltip.grindless.aerozine_50').gray())
    event.add('gtceu:aerozine_50_bucket', Text.translate('tooltip.grindless.aerozine_50.1').gray())
})
