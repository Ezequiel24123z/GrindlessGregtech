// priority: 10700
// Gregtech Grindless - names and tooltips of the EV Rare Earth Extraction Cascade and the GT materials of its line
// (startup_scripts/grindless/ev/extraction_cascade.js):
//
//   gtceu:extraction_cascade                       (machine name + tooltips)
//   gtceu:solvent_extraction                       (recipe type name)
//   material.gtceu.rare_earth_chloride_solution / samarium_chloride / neodymium_chloride / mixed_rare_earth_chloride
//                                                  (the GT materials: GTM names their forms and the fluid from these)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.extraction_cascade', 'Rare Earth Extraction Cascade')
    add('gtceu.solvent_extraction', 'Solvent Extraction')

    add('grindless.machine.extraction_cascade.tooltip.0', '§7Splits Martian merrillite into rare earths.')

    add('material.gtceu.rare_earth_chloride_solution', 'Rare Earth Chloride Solution')
    add('material.gtceu.samarium_chloride', 'Samarium Chloride')
    add('material.gtceu.neodymium_chloride', 'Neodymium Chloride')
    add('material.gtceu.mixed_rare_earth_chloride', 'Mixed Rare Earth Chloride')

    add('tooltip.grindless.rare_earth_chloride_solution', 'The leach liquor of the extraction cascade (circuit 1): every rare earth of the merrillite, as chlorides in acid water. Only the cascade\'s solvent extraction (circuit 2) splits it.')
    add('tooltip.grindless.samarium_chloride', 'Electrolyze it: 4 dust -> 1 samarium + 3,000 mB chlorine. Samarium is for the IV superconductor (SmFeAsO) and the magnets of LuV motors: store it.')
    add('tooltip.grindless.neodymium_chloride', 'Electrolyze it: 4 dust -> 1 neodymium + 3,000 mB chlorine, for motor magnets, alongside the Nether\'s neodymium.')
    add('tooltip.grindless.mixed_rare_earth_chloride', 'The rest of the Martian rare earths: lanthanum, cerium, praseodymium, yttrium and the heavies. Electrolyze it into rare earth dust (+ 3,000 mB chlorine), which a centrifuge separates.')
})

// what the new GT forms are for (GTM already shows the chemical formula)
ItemEvents.tooltip(event => {
    event.add('gtceu:rare_earth_chloride_solution_bucket', Text.translate('tooltip.grindless.rare_earth_chloride_solution').gray())
    event.add(['gtceu:samarium_chloride_dust', 'gtceu:small_samarium_chloride_dust', 'gtceu:tiny_samarium_chloride_dust'],
        Text.translate('tooltip.grindless.samarium_chloride').gray())
    event.add(['gtceu:neodymium_chloride_dust', 'gtceu:small_neodymium_chloride_dust', 'gtceu:tiny_neodymium_chloride_dust'],
        Text.translate('tooltip.grindless.neodymium_chloride').gray())
    event.add(['gtceu:mixed_rare_earth_chloride_dust', 'gtceu:small_mixed_rare_earth_chloride_dust', 'gtceu:tiny_mixed_rare_earth_chloride_dust'],
        Text.translate('tooltip.grindless.mixed_rare_earth_chloride').gray())
})
