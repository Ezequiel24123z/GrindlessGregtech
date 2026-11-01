// priority: 5862
// Gregtech Grindless - names and tooltips of the OpV beam hardware (startup_scripts/grindless/opv/beam_hardware.js, package OpV-D1):
//
//   grindless:<item>                    item.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   grindless:<material> (GT material)  material.grindless.<n>
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // id, name, tip 0, tip 1
    var ITEMS = [
        ['be_fluoride_dust', 'Beryllium Fluoride Dust', 'BeF2 from the fluorspar kiln: beryllium or window scrap in hydrogen fluoride.', 'Reduced with calcium under the electron beam.'],
        ['eb_beryllium_ingot', 'Electron Beam Beryllium Ingot', 'Beryllium melted clean under the electron beam, with no oxide left in it.', 'Hot rolled into window foil.'],
        ['be_window_foil', 'Beryllium Window Foil', 'Beryllium rolled thin enough for the beam to pass.', 'Brazed to a titanium flange under the electron beam.'],
        ['brazed_be_window', 'Brazed Beryllium Window', 'Two beryllium foils brazed to a titanium flange, vacuum tight.', 'Assembled into the beam window.'],
        ['be_window_scrap', 'Beryllium Window Scrap', 'The braze trim cut off a beryllium window.', 'Fluorinated back to beryllium fluoride in the fluorspar kiln.'],
        ['ir_target_rod', 'Iridium Target Rod', 'A rod of 5N iridium, sintered dense.', 'Clad with tantalum by sputtering.'],
        ['ta_clad_ir_rod', 'Tantalum-Clad Iridium Rod', 'An iridium rod under a sputtered tantalum skin.', 'Four make an iridium spallation target.'],
        ['decladded_ir_core', 'Decladded Iridium Core', 'The iridium of a spent target, its activated cladding removed in the hot cell.', 'Refined back to 5N iridium in the platinum plant.'],
        ['ir_spallation_residue', 'Iridium Spallation Residue', 'What the beam turned part of the iridium into: osmium and tungsten.', 'Leached in aqua regia in the platinum plant.'],
        ['li6h_tile', 'Lithium-6 Hydride Tile', 'Lithium-6 hydride, sintered into a tile.', 'Canned in stainless steel under the electron beam.'],
        ['canned_li6h_block', 'Canned Lithium-6 Hydride Block', 'Lithium-6 hydride sealed in a welded stainless steel can.', 'Assembled into the neutron shield.'],
        ['ceb6_powder', 'Cerium Hexaboride Powder', 'CeB6 made from cerium and boron in the blast furnace.', 'Grown into a boule by float zone.'],
        ['ceb6_boule', 'Cerium Hexaboride Boule', 'A single crystal of CeB6, grown with no crucible.', 'Turned into cathodes on the lathe.'],
        ['ceb6_cathode', 'Cerium Hexaboride Cathode', 'A CeB6 tip: a bright, cool electron source.', 'The heart of the cooler\'s electron gun.'],
        ['cooler_electron_gun', 'Cooler Electron Gun', 'A CeB6 cathode in chain field coils.', 'Run cold in the helium refrigerator.'],
        ['pickup_array', 'Pickup Array', 'NbTiN film loops on high-purity niobium sheet.', 'Brazed into a stainless steel tank.'],
        ['brazed_pickup_tank', 'Brazed Pickup Tank', 'A pickup array brazed into its vacuum tank.', 'Run cold in the helium refrigerator.'],
        ['tizrv_ingot', 'TiZrV Ingot', 'Titanium, zirconium and vanadium melted together: a getter alloy.', 'Sintered into sputtering targets.'],
        ['tizrv_target', 'TiZrV Target', 'A sputtering target of the getter alloy.', 'Coats the inside of eight vacuum chambers.'],
        ['neg_coated_chamber', 'NEG-Coated Chamber', 'A stainless steel chamber with a non-evaporable getter film inside.', 'Activated under the electron beam.'],
        ['activated_neg_chamber', 'Activated NEG Chamber', 'Its getter film baked clean: it now pumps gas on its own.', 'Assembled into the XHV casing and the cooler electron gun.'],
        ['spent_neg_chamber', 'Spent NEG Chamber', 'A chamber whose getter film did not activate.', 'Re-melted in the levitation melter.']
    ]

    // kind, key, name
    var NAMES = [
        ['gmaterial', 'bred_tritium_gas', 'Bred Tritium Gas']
    ]

    var PREFIX = { gmaterial: 'material.grindless.' }

    // recipe lines of the rows OpV-D1 appended to older machines' tables: key, text
    var RECIPES = [
        ['gtceu.recipe.grindless_electron_beam.be_reduction',
            'Circuit 24: beryllium fluoride reduced by calcium and beam-melted into a clean ingot; fluorite comes back.'],
        ['gtceu.recipe.grindless_electron_beam.be_window_braze',
            'Circuit 25: beryllium foil brazed onto a titanium flange; the trimmed foil comes back as scrap.'],
        ['gtceu.recipe.grindless_electron_beam.li6h_canning',
            'Circuit 26: lithium-6 hydride tiles sealed in a stainless steel can.'],
        ['gtceu.recipe.grindless_electron_beam.neg_activation',
            'Circuit 30: getter chambers baked under the beam; one in eight does not activate.'],
        ['gtceu.recipe.grindless_electron_beam.pickup_array',
            'Circuit 31: NbTiN film loops welded onto high-purity niobium sheet; the kerf comes back as niobium powder.'],
        ['gtceu.recipe.grindless_crystal_growth.ceb6_boule',
            'Circuit 23: cerium hexaboride powder grown into a single-crystal boule under argon.'],
        ['gtceu.recipe.grindless_levitation_melting.tizrv_melt',
            'Circuit 17: titanium, zirconium and vanadium levitation-melted into the TiZrV getter alloy.'],
        ['gtceu.recipe.grindless_levitation_melting.neg_chamber_remelt',
            'Circuit 18: spent getter chambers remelted; the steel and the getter alloy separate, sometimes with dross.'],
        ['gtceu.recipe.grindless_hot_cell.spent_ir_target_decladding',
            'Mode 18: a spent iridium target stripped of its tantalum cladding; the cladding goes to radioactive waste.'],
        ['gtceu.recipe.grindless_mtj_sputtering.ta_clad_ir_rod',
            'Circuit 9: iridium target rods clad in sputtered tantalum.'],
        ['gtceu.recipe.grindless_mtj_sputtering.neg_coated_chamber',
            'Circuit 10: a TiZrV getter film sputtered inside stainless steel chambers.']
    ]

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        ITEMS.forEach(function (e) {
            add('item.grindless.' + e[0], e[1])
            add('tooltip.grindless.' + e[0] + '.0', e[2])
            add('tooltip.grindless.' + e[0] + '.1', e[3])
        })
        NAMES.forEach(function (e) { add(PREFIX[e[0]] + e[1], e[2]) })
        RECIPES.forEach(function (e) { add(e[0], e[1]) })
    })
})()
