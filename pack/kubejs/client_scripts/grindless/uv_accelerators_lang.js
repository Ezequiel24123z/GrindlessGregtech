// priority: 2911
// Gregtech Grindless - names and tooltips of UV's accelerators (startup_scripts/grindless/uv/accelerators.js; package UV-A5):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / .no_voiding           controller tooltips and the refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<item>, tooltip.grindless.<item>.0/.1          the new items
//   material.gtceu.<n>                                            the new GT materials
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.synchrotron', 'Synchrotron'],
        ['gtceu.synchrotron', 'Synchrotron'],
        ['block.gtceu.muon_fusion_cell', 'Muon Fusion Cell'],
        ['gtceu.muon_catalysed_fusion', 'Muon-Catalysed Fusion'],
        ['block.gtceu.antimatter_trap', 'Antimatter Trap'],
        ['gtceu.antimatter_storage', 'Antimatter Storage'],

        ['grindless.machine.synchrotron.tooltip.0',
            '§7A particle ring: X-rays for LIGA, protons for antiprotons.'],
        ['grindless.machine.synchrotron.no_voiding',
            'Voiding is off: the activated target must never be thrown away.'],

        ['grindless.machine.muon_fusion_cell.tooltip.0',
            '§7Muon-catalysed fusion of liquid deuterium-tritium at 20 K.'],
        ['grindless.machine.muon_fusion_cell.no_voiding',
            'Voiding is off: the bred tritium must never be thrown away.'],

        ['grindless.machine.antimatter_trap.tooltip.0',
            '§7A Penning trap that stores antiprotons.'],
        ['grindless.machine.antimatter_trap.tooltip.1',
            'Works only in Earth orbit.'],

        ['gtceu.recipe.grindless_synchrotron.expose',
            'Circuit 1: X-ray exposure through the gold mask; the mask is kept'],
        ['gtceu.recipe.grindless_synchrotron.develop',
            'Circuit 2: LIGA development; the developer is never drained'],
        ['gtceu.recipe.grindless_synchrotron.photonic',
            'Circuit 3: a patterned wafer and a silicon nitride film to 4 photonic chips'],
        ['gtceu.recipe.grindless_synchrotron.antiprotons',
            'Circuit 4: protons on the tungsten target; the activated target goes to the chemical bath, the beam\'s hydrogen to any hydrogen use'],
        ['gtceu.recipe.grindless_muon_catalysed_fusion.deuterium_tritium',
            'Liquid D-T: 786,432 EU/t; 60 % of the tritium bred back, 40 % make-up (extrapolation)'],
        ['gtceu.recipe.grindless_antimatter_storage.stack',
            'Circuit 1: four cartridges stacked into a charged trap; Earth orbit only'],
        ['gtceu.recipe.grindless_antimatter_storage.ican',
            'Circuit 2: antiproton-catalysed microfission pellets; the trap comes back empty; Earth orbit only'],

        ['item.grindless.pmma_coated_wafer', 'PMMA-Coated Wafer'],
        ['tooltip.grindless.pmma_coated_wafer.0', 'A high-power wafer under a thick PMMA resist.'],
        ['tooltip.grindless.pmma_coated_wafer.1', 'Exposed by the synchrotron (circuit 1).'],
        ['item.grindless.x_ray_mask', 'X-Ray Mask'],
        ['tooltip.grindless.x_ray_mask.0', 'Gold absorbers on a silicon nitride membrane.'],
        ['tooltip.grindless.x_ray_mask.1', 'Kept by every exposure in the synchrotron.'],
        ['item.grindless.exposed_wafer', 'Exposed Wafer'],
        ['tooltip.grindless.exposed_wafer.0', 'The X-rays have cut the pattern deep into the PMMA.'],
        ['tooltip.grindless.exposed_wafer.1', 'Developed by the synchrotron (circuit 2).'],
        ['item.grindless.patterned_wafer', 'LIGA-Patterned Wafer'],
        ['tooltip.grindless.patterned_wafer.0', 'High-aspect-ratio structures no optical stepper can draw.'],
        ['tooltip.grindless.patterned_wafer.1', 'Cut into 4 UHPIC chips, or made into photonic chips.'],
        ['item.grindless.photonic_chip', 'Photonic Chip'],
        ['tooltip.grindless.photonic_chip.0', 'Silicon nitride waveguides on a LIGA-patterned die.'],
        ['tooltip.grindless.photonic_chip.1', 'For the optical circuits of the eras ahead.'],
        ['item.grindless.silicon_nitride_film', 'Silicon Nitride Film'],
        ['tooltip.grindless.silicon_nitride_film.0', 'A thin, stiff membrane grown from silicon and ammonia.'],
        ['tooltip.grindless.silicon_nitride_film.1', 'The mask\'s membrane and the photonic chip\'s waveguides.'],
        ['item.grindless.tungsten_target', 'Tungsten Target'],
        ['tooltip.grindless.tungsten_target.0', 'A water-cooled tungsten block brazed to copper.'],
        ['tooltip.grindless.tungsten_target.1', 'Wears 2 % a run in the synchrotron (circuit 4).'],
        ['item.grindless.activated_tungsten_target', 'Activated Tungsten Target'],
        ['tooltip.grindless.activated_tungsten_target.0', 'Made radioactive by the proton beam.'],
        ['tooltip.grindless.activated_tungsten_target.1', 'Cools in a chemical bath back to tungsten and copper dust.'],
        ['item.grindless.empty_antiproton_cartridge', 'Empty Antiproton Cartridge'],
        ['tooltip.grindless.empty_antiproton_cartridge.0', 'A small field-held vacuum bottle.'],
        ['tooltip.grindless.empty_antiproton_cartridge.1', 'Filled by the synchrotron (circuit 4); comes back from the antimatter trap.'],
        ['item.grindless.empty_antiproton_trap', 'Empty Antiproton Trap'],
        ['tooltip.grindless.empty_antiproton_trap.0', 'A portable Penning trap, cold and evacuated.'],
        ['tooltip.grindless.empty_antiproton_trap.1', 'Charged by the antimatter trap in Earth orbit.'],
        ['item.grindless.antiproton_trap', 'Charged Antiproton Trap'],
        ['tooltip.grindless.antiproton_trap.0', 'Four cartridges of antiprotons held in one trap.'],
        ['tooltip.grindless.antiproton_trap.1', 'Spent on ICAN pellets; comes back empty.'],
        ['item.grindless.ican_pellet', 'ICAN Pellet'],
        ['tooltip.grindless.ican_pellet.0', 'Uranium and D-T sparked by antiprotons: Penn State\'s ICAN-II microfission.'],
        ['tooltip.grindless.ican_pellet.1', 'For the propulsion and power of the eras ahead.'],
        ['item.grindless.lithium_breeder_blanket', 'Lithium Breeder Blanket'],
        ['tooltip.grindless.lithium_breeder_blanket.0', 'Lithium and a beryllium multiplier in a tungstensteel frame.'],
        ['tooltip.grindless.lithium_breeder_blanket.1', 'Kept by the muon fusion cell: breeds back 60 % of its tritium.'],

        ['material.gtceu.pmma_resist', 'PMMA Resist'],
        ['material.gtceu.liga_developer', 'LIGA Developer']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
