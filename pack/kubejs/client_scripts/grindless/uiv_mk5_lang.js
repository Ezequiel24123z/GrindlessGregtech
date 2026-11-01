// priority: 3006
// Gregtech Grindless - names and tooltips of UIV's polarised proton source and Mk5 fusion ring (startup_scripts/grindless/uiv/mk5.js; package UIV-A9):
//
//   block.gtceu.<machine>, gtceu.<type>, material.gtceu.<id>   machine, recipe type and gas names
//   grindless.machine.<machine>.tooltip.N                      controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                     the EMI line of each recipe with a dataKey, including the older rows UIV-A9 appends
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1           the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.polarised_proton_source', 'Polarised Proton Source'],
        ['block.gtceu.uiv_fusion_reactor', 'Mk5 Fusion Reactor'],
        ['gtceu.proton_polarisation', 'Proton Polarisation'],
        ['material.gtceu.detritiated_protium', 'Detritiated Protium'],
        ['material.gtceu.polarised_h_gas', 'Polarised Hydrogen Gas'],
        ['material.gtceu.nitrogen_15_ammonia', 'Nitrogen-15 Ammonia'],

        ['grindless.machine.polarised_proton_source.tooltip.0',
            '\u00a77Polarises hydrogen, Li-6 hydride and 15NH3 for the Mk5 fuels.'],
        ['grindless.machine.polarised_proton_source.tooltip.1',
            'Needs a belt of metallic hydrogen coils.'],
        ['grindless.machine.uiv_fusion_reactor.tooltip.0',
            '\u00a77A second fusion ring that burns three polarised fuels.'],

        ['gtceu.recipe.grindless_proton_polarisation.rf_dissociation',
            'Circuit 1: an RF dissociator splits detritiated H2 into atoms that a sextupole beam polarises; the molecules return.'],
        ['gtceu.recipe.grindless_proton_polarisation.li6h_polarisation',
            'Circuit 2: dynamic nuclear polarisation of frozen Li-6 hydride, cooled by 500 mB liquid helium.'],
        ['gtceu.recipe.grindless_proton_polarisation.nh3_polarisation',
            'Circuit 3: dynamic nuclear polarisation of frozen 15NH3.'],
        // the pyroprocessing cell row UIV-A9 appends to tables/thorium.json
        ['gtceu.recipe.grindless_pyroprocessing.li_sn_eutectic',
            'Circuit 9: lithium and tin melt into the Li-Sn eutectic of the divertor.'],
        ['emi.grindless.info.uiv_mk5.0',
            'The proton source polarises hydrogen, Li-6 hydride and 15NH3; pressed into pellets they are mixed with helium into the He-3 + He-3, p + Li-6 and p + N-15 fuels of the Mk5 ring.'],
        ['emi.grindless.info.uiv_mk5.1',
            'The ring casing is built from the Li-Sn armoured first-wall tile and from the divertor, a stack of Li-Sn wetted capillary meshes. All ash is split into helium, hydrogen, He-3 and carbon-12.']
    ]

    // [name, en, tooltip 0 en, tooltip 1 en]
    var ITEMS = [
        ['li6_hydride', 'Lithium-6 Hydride', 'Li-6 metal hydrided in hydrogen.', 'Polarised in the proton source (circuit 2).'],
        ['polarised_li6h', 'Polarised Li-6H', 'Frozen Li-6 hydride with aligned spins.', 'Pressed into pellets.'],
        ['polarised_h_ice', 'Polarised Hydrogen Ice', 'Polarised H frozen in a superfluid helium bath.', 'Pressed into pellets.'],
        ['polarised_15nh3_ice', 'Polarised 15NH3 Ice', 'Frozen nitrogen-15 ammonia with aligned proton spins.', 'Pressed into pellets.'],
        ['polarised_h_pellet', 'Polarised Hydrogen Pellet', 'A pellet of polarised hydrogen ice.', 'Mixed into the p-Li6 and p-N15 fuels.'],
        ['polarised_li6h_pellet', 'Polarised Li-6H Pellet', 'A pellet of polarised Li-6 hydride.', 'Mixed into the p-Li6 fuel.'],
        ['polarised_15nh3_pellet', 'Polarised 15NH3 Pellet', 'A pellet of polarised 15NH3 ice.', 'Mixed into the p-N15 fuel.'],
        ['polarised_he3_cell', 'Polarised He-3 Cell', 'A glass cell that holds polarised helium-3.', 'Mixed into the He-3 + He-3 fuel; the glass comes back.'],
        ['plasma_sprayed_tile', 'Plasma-Sprayed Tile', 'A W-fibre/RHEA tile quenched in argon plasma.', 'Becomes the first-wall tile.'],
        ['first_wall_tile', 'First-Wall Tile', 'A tile backed with tungsten steel.', 'Armoured with Li-Sn.'],
        ['li_sn_armoured_tile', 'Li-Sn Armoured Tile', 'A first-wall tile wetted with liquid Li-Sn.', 'Builds the UIV fusion casing.'],
        ['near_net_w_mesh', 'Near-Net W Mesh', 'A printed porous mesh, not yet pressed.', 'Pressed into the W mesh.'],
        ['w_mesh', 'W Mesh', 'A capillary porous mesh of refractory metal.', 'Wetted with Li-Sn.'],
        ['cps_wetted_mesh', 'Li-Sn Wetted Mesh', 'A mesh that wicks liquid Li-Sn to the surface.', 'Stacked into a divertor cassette.'],
        ['divertor_cassette', 'Divertor Cassette', 'Four wetted meshes on tungsten steel plates.', 'Two make a divertor.'],
        ['divertor', 'Divertor', 'A capillary porous system that takes the heat and the ash.', 'Builds the UIV fusion casing.']
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
