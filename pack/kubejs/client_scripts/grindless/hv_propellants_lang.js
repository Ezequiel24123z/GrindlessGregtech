// priority: 9625
// Gregtech Grindless - names and tooltips of the HV propellant fluid (startup_scripts/grindless/hv/propellant_items.js):
//
//   material.gtceu.aerozine_50   the GT material (GTM names its fluid and bucket from it)
//
// and a note on GT--'s chemical plant, the only route to hydrogen peroxide: it runs a recipe only up to the tier of its machine casings
// (GT-- 1.3.10, ChemicalPlantMachine#getRealRecipe), and a lower tier leaves it idle with no failure reason. Its preview with aluminium
// plant casings draws MV machine casings, so the 480 EU/t peroxide and hydrazine stages need the casings changed to HV ones.
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. English only.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('material.gtceu.aerozine_50', 'Aerozine 50')
    add('tooltip.grindless.aerozine_50', 'Hydrazine and unsymmetrical dimethylhydrazine, half and half: a storable hypergolic fuel.')
    add('tooltip.grindless.aerozine_50.1', 'Mixed from the chemical plant\'s hydrazine and the UDMH reactors. A mixer turns it and dinitrogen tetroxide into rocket fuel.')
    add('tooltip.grindless.exxonmobil_chemical_plant.casings.0', 'Its machine casings cap the recipe voltage it runs.')
    add('tooltip.grindless.exxonmobil_chemical_plant.casings.1', 'Peroxide and hydrazine need HV machine casings.')
})

ItemEvents.tooltip(event => {
    event.add('gtceu:aerozine_50_bucket', Text.translate('tooltip.grindless.aerozine_50').gray())
    event.add('gtceu:aerozine_50_bucket', Text.translate('tooltip.grindless.aerozine_50.1').gray())
    event.add('gtnn:exxonmobil_chemical_plant', Text.translate('tooltip.grindless.exxonmobil_chemical_plant.casings.0').gold())
    event.add('gtnn:exxonmobil_chemical_plant', Text.translate('tooltip.grindless.exxonmobil_chemical_plant.casings.1').gold())
})
