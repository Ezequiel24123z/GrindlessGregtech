// priority: 10700
// Gregtech Grindless - names and tooltips of the EV Rare Earth Extraction Cascade and the GT materials of its line
// (startup_scripts/grindless/ev/extraction_cascade.js):
//
//   gtceu:extraction_cascade                       (machine name + tooltips)
//   gtceu:solvent_extraction                       (recipe type name)
//   material.gtceu.rare_earth_chloride_solution / samarium_chloride / neodymium_chloride / mixed_rare_earth_chloride
//                                                  (the GT materials: GTM names their forms and the fluid from these)
//   item.gtceu.<form>                              (es_es only: the Spanish name of every dust form of the new materials, as in
//                                                  ev_foundation_lang.js; the bucket keeps GTM's "%s Bucket" pattern, which has no
//                                                  per-item key)
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

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.extraction_cascade', 'Cascada de extracción de tierras raras')
    add('gtceu.solvent_extraction', 'Extracción por disolvente')

    add('grindless.machine.extraction_cascade.tooltip.0', '§7Separa la merrillita marciana en tierras raras.')

    add('material.gtceu.rare_earth_chloride_solution', 'Solución de cloruros de tierras raras')
    add('material.gtceu.samarium_chloride', 'Cloruro de samario')
    add('material.gtceu.neodymium_chloride', 'Cloruro de neodimio')
    add('material.gtceu.mixed_rare_earth_chloride', 'Cloruro de tierras raras mixtas')

    add('tooltip.grindless.rare_earth_chloride_solution', 'El lixiviado de la cascada de extracción (circuito 1): todas las tierras raras de la merrillita, como cloruros en agua ácida. Solo la extracción por disolvente de la cascada (circuito 2) lo separa.')
    add('tooltip.grindless.samarium_chloride', 'Electrolízalo: 4 de polvo -> 1 de samario + 3 000 mB de cloro. El samario es para el superconductor IV (SmFeAsO) y los imanes de los motores LuV: guárdalo.')
    add('tooltip.grindless.neodymium_chloride', 'Electrolízalo: 4 de polvo -> 1 de neodimio + 3 000 mB de cloro, para los imanes de los motores, junto al neodimio del Nether.')
    add('tooltip.grindless.mixed_rare_earth_chloride', 'El resto de las tierras raras marcianas: lantano, cerio, praseodimio, itrio y las pesadas. Electrolízalo en polvo de tierras raras (+ 3 000 mB de cloro), que una centrifugadora separa.')

    // ---- the GT dust forms of the new materials
    var dusts = function (material, name) {
        add('item.gtceu.' + material + '_dust', 'Polvo de ' + name)
        add('item.gtceu.small_' + material + '_dust', 'Montón pequeño de polvo de ' + name)
        add('item.gtceu.tiny_' + material + '_dust', 'Montón diminuto de polvo de ' + name)
    }
    dusts('samarium_chloride', 'cloruro de samario')
    dusts('neodymium_chloride', 'cloruro de neodimio')
    dusts('mixed_rare_earth_chloride', 'cloruro de tierras raras mixtas')
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
