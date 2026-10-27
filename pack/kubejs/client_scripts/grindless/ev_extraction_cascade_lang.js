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

    add('grindless.machine.extraction_cascade.tooltip.0', 'A line of mixer-settler stages that takes the rare earths of Mars out of merrillite and splits them, as real separation plants do. Programmed circuit 1, leach: 4 merrillite dust + 3,000 mB hydrochloric acid -> 1,000 mB rare earth chloride solution + 1,000 mB phosphoric acid + 3 tricalcium phosphate dust.')
    add('grindless.machine.extraction_cascade.tooltip.1', 'Circuit 2, solvent extraction: 1,000 mB of solution + 3,000 mB hydrochloric acid (the strip) + 1,000 mB kerosene -> 1 samarium chloride + 1 neodymium chloride + 2 mixed rare earth chloride; 950 mB of the kerosene comes back and the strip leaves as 6,000 mB of diluted hydrochloric acid. GTM\'s electrolyzer turns each chloride into its metal and chlorine.')
    add('grindless.machine.extraction_cascade.tooltip.2', 'Only this machine splits merrillite, so samarium only comes from Mars. With one EV hatch: 76,800 EU per leach and 384,000 EU per extraction, no discount and no parallels; two EV hatches overclock both as GTM does (four times the power, half the time). The acids come back: distill the diluted acid and turn the chlorine into hydrochloric acid with hydrogen. Phosphoric acid and tricalcium phosphate are inert: use them or void the surplus.')
    add('grindless.machine.extraction_cascade.tooltip.3', 'Needs, in the floor: 1 or 2 EV energy hatches, 1 input bus (merrillite and the circuit), 1 output bus (the dusts), 1 to 3 input hatches and 1 to 4 output hatches (a hatch holds one fluid: give each fluid its own, or use quadruple hatches). ME buses and hatches fit. If a bus or a hatch fills up, the cascade stops.')
    add('grindless.machine.extraction_cascade.tooltip.4', 'Circuit 5, ZPM mode (needs a ZPM energy hatch): 4,000 mB of GTCA\'s monazite froth + 3,000 mB hydrochloric acid -> 4,000 mB europium chloride solution + 1,000 mB phosphoric acid, 122,880 EU/t for 40 ticks. The solution goes to the Europium Reductor; GTCA\'s froth line stops here.')

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

    add('grindless.machine.extraction_cascade.tooltip.0', 'Una línea de etapas de mezcla y decantación que saca las tierras raras de Marte de la merrillita y las separa, como las plantas de separación reales. Circuito programado 1, lixiviación: 4 de polvo de merrillita + 3 000 mB de ácido clorhídrico -> 1 000 mB de solución de cloruros de tierras raras + 1 000 mB de ácido fosfórico + 3 de polvo de fosfato tricálcico.')
    add('grindless.machine.extraction_cascade.tooltip.1', 'Circuito 2, extracción por disolvente: 1 000 mB de solución + 3 000 mB de ácido clorhídrico (la reextracción) + 1 000 mB de queroseno -> 1 de cloruro de samario + 1 de cloruro de neodimio + 2 de cloruro de tierras raras mixtas; vuelven 950 mB del queroseno y el ácido de reextracción sale como 6 000 mB de ácido clorhídrico diluido. El electrolizador de GTM convierte cada cloruro en su metal y cloro.')
    add('grindless.machine.extraction_cascade.tooltip.2', 'Solo esta máquina separa la merrillita, así que el samario solo viene de Marte. Con una escotilla EV: 76 800 EU por lixiviación y 384 000 EU por extracción, sin descuento y sin paralelos; dos escotillas EV aceleran las dos recetas como lo hace GTM (cuatro veces la potencia, la mitad del tiempo). Los ácidos vuelven: destila el ácido diluido y convierte el cloro en ácido clorhídrico con hidrógeno. El ácido fosfórico y el fosfato tricálcico son inertes: úsalos o tira lo que sobre.')
    add('grindless.machine.extraction_cascade.tooltip.3', 'Necesita, en el suelo: 1 o 2 escotillas de energía EV, 1 bus de entrada (merrillita y el circuito), 1 bus de salida (los polvos), de 1 a 3 escotillas de entrada y de 1 a 4 de salida (cada escotilla guarda un fluido: dale a cada fluido la suya o usa escotillas cuádruples). Valen buses y escotillas ME. Si un bus o una escotilla se llena, la cascada se para.')
    add('grindless.machine.extraction_cascade.tooltip.4', 'Circuito 5, modo ZPM (necesita una escotilla de energia ZPM): 4 000 mB de espuma de monacita de GTCA + 3 000 mB de acido clorhidrico -> 4 000 mB de solucion de cloruro de europio + 1 000 mB de acido fosforico, 122 880 EU/t durante 40 ticks. La solucion va al Reductor de europio; la linea de espuma de GTCA termina aqui.')

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
