// priority: 4990
// Gregtech Grindless - names and tooltips of UEV's megabar press (startup_scripts/grindless/uev/megabar.js; package UEV-A3):
//
//   block.gtceu.megabar_press, gtceu.megabar_synthesis            machine and recipe type names
//   grindless.machine.megabar_press.tooltip.N                     controller tooltips
//   gtceu.recipe.grindless_megabar.<recipe>                       the EMI line of each press recipe (the superhydride quench is named fiction)
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.megabar_press', 'Megabar Press'],
        ['gtceu.megabar_synthesis', 'Megabar Synthesis'],

        ['grindless.machine.megabar_press.tooltip.0',
            '§7Squeezes matter past a million atmospheres: superhydride and diamond.'],

        ['gtceu.recipe.grindless_megabar.superhydride',
            'Fiction: real (La,Y)H10 exists only above ~100 GPa and falls apart on release; here the press quenches it so the ingot survives at one atmosphere. Anvil wear: 10 % per run. Hydrogen is voidable.'],
        ['gtceu.recipe.grindless_megabar.nanotwinned_diamond',
            'Onion carbon pressed at high temperature becomes nanotwinned diamond, harder than any single crystal (Huang et al., Nature 2014).']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['la_y_alloy_ingot', 'La-Y Alloy Ingot', 'Lanthanum and yttrium reduced from their oxides by calcium.', 'Bent to foil in a bender.'],
        ['la_y_foil', 'La-Y Foil', 'Thin enough to sandwich a hydrogen source.', 'Pressed with ammonia borane in the megabar press (circuit 1).'],
        ['trimethyl_borate_ampoule', 'Trimethyl Borate Ampoule', 'Boric acid esterified with methanol; flammable.', 'Reacts with sodium hydride to sodium borohydride.'],
        ['sodium_hydride_dust', 'Sodium Hydride Dust', 'Sodium that has taken up hydrogen.', 'Reduces trimethyl borate in a chemical reactor.'],
        ['sodium_borohydride_dust', 'Sodium Borohydride Dust', 'A mild, selective reducing agent.', 'Becomes ammonia borane with ammonium chloride.'],
        ['sodium_methoxide_dust', 'Sodium Methoxide Dust', 'What the borohydride synthesis leaves behind.', 'Hydrolysed back to methanol and sodium hydroxide.'],
        ['ammonia_borane_charge', 'Ammonia Borane Charge', 'Ammonia borane pressed to a pellet: 19 % hydrogen by weight.', 'The hydrogen source of the megabar press (circuit 1).'],
        ['nanodiamond_dust', 'Nanodiamond Dust', 'Diamond grit crushed from a CVD plate, still coated in graphitic soot.', 'Cleaned in hydrogen in a chemical reactor.'],
        ['nanodiamond_pellet', 'Nanodiamond Pellet', 'Onion carbon pressed into a pellet.', 'Becomes nanotwinned diamond in the megabar press (circuit 2).'],
        ['nanotwinned_diamond', 'Nanotwinned Diamond', 'Harder than a single crystal: the twins block every crack.', 'Made only in the megabar press; goes into anvils and drill bits.'],
        ['nanotwinned_diamond_anvil', 'Nanotwinned Diamond Anvil', 'The anvil of the megabar press; it wears.', 'A tenth of a run is lost per superhydride pressing.'],
        ['nanotwinned_diamond_bit', 'Nanotwinned Diamond Bit', 'A drill bit that outlasts tungsten carbide.', 'Wears down in use.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[3]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
