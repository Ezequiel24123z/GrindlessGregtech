// priority: 4990
// Gregtech Grindless - names and tooltips of UEV's megabar press (startup_scripts/grindless/uev/megabar.js; package UEV-A3):
//
//   block.gtceu.megabar_press, gtceu.megabar_synthesis            machine and recipe type names
//   grindless.machine.megabar_press.tooltip.N                     controller tooltips
//   gtceu.recipe.grindless_megabar.<recipe>                       the EMI line of each press recipe (the superhydride quench is named fiction)
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.megabar_press', 'Megabar Press', 'Prensa de megabar'],
        ['gtceu.megabar_synthesis', 'Megabar Synthesis', 'Síntesis a megabar'],

        ['grindless.machine.megabar_press.tooltip.0',
            '§7Squeezes matter past a million atmospheres: superhydride and diamond.',
            '§7Comprime materia a más de un millón de atmósferas: superhidruro y diamante.'],

        ['gtceu.recipe.grindless_megabar.superhydride',
            'Fiction: real (La,Y)H10 exists only above ~100 GPa and falls apart on release; here the press quenches it so the ingot survives at one atmosphere. Anvil wear: 10 % per run. Hydrogen is voidable.',
            'Ficción: el (La,Y)H10 real solo existe por encima de ~100 GPa y se descompone al liberar la presión; aquí la prensa lo templa y el lingote sobrevive a una atmósfera. Desgaste del yunque: 10 % por ciclo. El hidrógeno se puede desechar.'],
        ['gtceu.recipe.grindless_megabar.nanotwinned_diamond',
            'Onion carbon pressed at high temperature becomes nanotwinned diamond, harder than any single crystal (Huang et al., Nature 2014).',
            'El carbono cebolla prensado a alta temperatura se convierte en diamante nanomaclado, más duro que cualquier monocristal (Huang et al., Nature 2014).']
    ]

    // [name, en, es, tooltip 0 en, tooltip 0 es, tooltip 1 en, tooltip 1 es]
    var ITEMS = [
        ['la_y_alloy_ingot', 'La-Y Alloy Ingot', 'Lingote de aleación La-Y', 'Lanthanum and yttrium reduced from their oxides by calcium.', 'Lantano e itrio reducidos de sus óxidos con calcio.', 'Bent to foil in a bender.', 'Se dobla a lámina en una dobladora.'],
        ['la_y_foil', 'La-Y Foil', 'Lámina de La-Y', 'Thin enough to sandwich a hydrogen source.', 'Lo bastante fina para intercalar una fuente de hidrógeno.', 'Pressed with ammonia borane in the megabar press (circuit 1).', 'Se prensa con amoníaco borano en la prensa de megabar (circuito 1).'],
        ['trimethyl_borate_ampoule', 'Trimethyl Borate Ampoule', 'Ampolla de borato de trimetilo', 'Boric acid esterified with methanol; flammable.', 'Ácido bórico esterificado con metanol; inflamable.', 'Reacts with sodium hydride to sodium borohydride.', 'Reacciona con hidruro de sodio y da borohidruro de sodio.'],
        ['sodium_hydride_dust', 'Sodium Hydride Dust', 'Polvo de hidruro de sodio', 'Sodium that has taken up hydrogen.', 'Sodio que ha absorbido hidrógeno.', 'Reduces trimethyl borate in a chemical reactor.', 'Reduce el borato de trimetilo en un reactor químico.'],
        ['sodium_borohydride_dust', 'Sodium Borohydride Dust', 'Polvo de borohidruro de sodio', 'A mild, selective reducing agent.', 'Un agente reductor suave y selectivo.', 'Becomes ammonia borane with ammonium chloride.', 'Se convierte en amoníaco borano con cloruro de amonio.'],
        ['sodium_methoxide_dust', 'Sodium Methoxide Dust', 'Polvo de metóxido de sodio', 'What the borohydride synthesis leaves behind.', 'Lo que deja la síntesis del borohidruro.', 'Hydrolysed back to methanol and sodium hydroxide.', 'Se hidroliza de nuevo a metanol e hidróxido de sodio.'],
        ['ammonia_borane_charge', 'Ammonia Borane Charge', 'Carga de amoníaco borano', 'Ammonia borane pressed to a pellet: 19 % hydrogen by weight.', 'Amoníaco borano prensado en pellet: un 19 % de hidrógeno en peso.', 'The hydrogen source of the megabar press (circuit 1).', 'La fuente de hidrógeno de la prensa de megabar (circuito 1).'],
        ['nanodiamond_dust', 'Nanodiamond Dust', 'Polvo de nanodiamante', 'Diamond grit crushed from a CVD plate, still coated in graphitic soot.', 'Grano de diamante triturado de una placa CVD, aún cubierto de hollín grafítico.', 'Cleaned in hydrogen in a chemical reactor.', 'Se limpia con hidrógeno en un reactor químico.'],
        ['nanodiamond_pellet', 'Nanodiamond Pellet', 'Pellet de nanodiamante', 'Onion carbon pressed into a pellet.', 'Carbono cebolla prensado en un pellet.', 'Becomes nanotwinned diamond in the megabar press (circuit 2).', 'Se convierte en diamante nanomaclado en la prensa de megabar (circuito 2).'],
        ['nanotwinned_diamond', 'Nanotwinned Diamond', 'Diamante nanomaclado', 'Harder than a single crystal: the twins block every crack.', 'Más duro que un monocristal: las maclas frenan cada grieta.', 'Made only in the megabar press; goes into anvils and drill bits.', 'Se fabrica solo en la prensa de megabar; sirve para yunques y brocas.'],
        ['nanotwinned_diamond_anvil', 'Nanotwinned Diamond Anvil', 'Yunque de diamante nanomaclado', 'The anvil of the megabar press; it wears.', 'El yunque de la prensa de megabar; se desgasta.', 'A tenth of a run is lost per superhydride pressing.', 'Se pierde una décima parte por cada prensado de superhidruro.'],
        ['nanotwinned_diamond_bit', 'Nanotwinned Diamond Bit', 'Broca de diamante nanomaclado', 'A drill bit that outlasts tungsten carbide.', 'Una broca que dura más que el carburo de tungsteno.', 'Wears down in use.', 'Se desgasta con el uso.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1], i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[3], i[4]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[5], i[6]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
