// priority: 1652
// Gregtech Grindless - names and tooltips of UXV's accretion disk skimmer, FRC former and BZ dynamo, and the strand coil
// (startup_scripts/grindless/uxv/cygnus_disk.js; package UXV-B3):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   item.grindless.strand_coil, tooltip.grindless.strand_coil.N
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   emi.grindless.info.<machine>.N                     the EMI info pages of the controllers
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.accretion_disk_skimmer', 'Accretion Disk Skimmer'],
        ['block.gtceu.frc_former', 'FRC Former'],
        ['block.gtceu.bz_dynamo', 'BZ Dynamo'],
        ['gtceu.disk_skimming', 'Disk Skimming'],
        ['gtceu.frc_forming', 'FRC Forming'],
        ['gtceu.blandford_znajek', 'Blandford-Znajek'],
        ['item.grindless.strand_coil', 'Strand Coil'],
        ['tooltip.grindless.strand_coil.0', 'An FRC cartridge wound in strand tape.'],
        ['tooltip.grindless.strand_coil.1', 'Made in the naquadria magnet works; two go into a UXV field generator.'],

        ['grindless.machine.accretion_disk_skimmer.tooltip.0',
            '\u00a77A magnetic scoop that takes plasma from the accretion disk.'],
        ['grindless.machine.frc_former.tooltip.0',
            '\u00a77Forms field-reversed plasmoids and flux-loaded plasma.'],
        ['grindless.machine.bz_dynamo.tooltip.0',
            '\u00a77Power from a black hole\'s spin: the Blandford-Znajek process.'],
        ['grindless.machine.bz_dynamo.tooltip.1',
            'Dynamo: 2 UIV or 1 UXV 16 A hatch.'],

        ['emi.grindless.info.accretion_disk_skimmer.0',
            'The disk plasma it takes is the accretion disk\'s own, so the skimmer must stand in Cygnus X-1 orbit. It needs a hydrogen-cooled controller and a metallic hydrogen winding that wears slowly.'],
        ['emi.grindless.info.accretion_disk_skimmer.1',
            'Nothing is wasted: the plasma goes to the plasma mass filter, whose filtered disk plasma feeds the FRC former, and from there the cartridges, the field generator and the BZ dynamo\'s fuel.'],
        ['emi.grindless.info.frc_former.0',
            'Cartridges are formed anywhere from carried plasma and carry the field-reversed plasmoid for the rest of the game. Flux loading works anywhere the plasma is carried.'],
        ['emi.grindless.info.frc_former.1',
            'The cartridge makes the field generator\'s strand coil and shields the trip through Vela\'s wind. The plasma lost in flux loading recombines to 100 mB of hydrogen a run, which goes to stock.'],
        ['emi.grindless.info.bz_dynamo.0',
            'It stands in Cygnus X-1 orbit beside the black hole: field lines threading the horizon carry the spin\'s power out through the jet. Only 400 mB of flux-loaded plasma are needed per 200 t.'],
        ['emi.grindless.info.bz_dynamo.1',
            'Generous, never free: skimming, filtering and flux loading the 400 mB cost about 1.3e11 EU; one run returns 2.15e11 EU, about 1.6 times the chain. It leaves nothing behind and its power is for the wireless network.'],
        ['emi.grindless.info.bz_dynamo.2',
            'One run gives 1,073,741,824 EU/t for 200 t, one at a time, through two UIV 16 A dynamo hatches or one UXV 16 A dynamo hatch. The flux-plasma input sits on the front spoke and the dynamo hatches on the outer rim: 1 input bus, 1 input hatch, 1-2 dynamo hatches.'],

        ['gtceu.recipe.grindless_disk_skimming.skim_disk',
            'Circuit 1: the scoop takes 1,000 mB of the accretion disk\'s plasma; its metallic hydrogen winding wears 5%.'],
        ['gtceu.recipe.grindless_frc_forming.form_cartridge',
            'Circuit 1: a theta-pinch on four MH windings (10% worn) traps a field-reversed plasmoid in a cartridge.'],
        ['gtceu.recipe.grindless_frc_forming.load_flux',
            'Circuit 2: the pinch loads the plasma with flux for the BZ dynamo; the plasma lost recombines to hydrogen.'],
        ['gtceu.recipe.grindless_blandford_znajek.spin_down',
            'Circuit 1: field lines carry the black hole\'s spin out through the jet: 400 mB of flux-loaded plasma, 2^30 EU/t for 200 t.'],
        ['gtceu.recipe.grindless_naquadria_magnets.strand_coil',
            'Circuit 9: four turns of strand tape wind an FRC cartridge on a tungsten steel former; cold-tested in the helium charge.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
