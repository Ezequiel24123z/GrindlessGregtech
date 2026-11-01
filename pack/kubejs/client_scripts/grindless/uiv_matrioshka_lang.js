// priority: 3048
// Gregtech Grindless - names and tooltips of UIV's Matrioshka computer and droplet radiator works (startup_scripts/grindless/uiv/matrioshka.js; package UIV-A10):
//
//   block.gtceu.<machine>, gtceu.<type>                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N              controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each recipe, and of each row the package appends to an older table
//   item.grindless.<n>, block.grindless.<n>, tooltip.grindless.<n>.0 / .1   the package's own items and blocks
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['emi.grindless.info.uiv_matrioshka.0',
            'The Matrioshka computer is built from five blocks: the nodes, the logic tiles, the TPV shell and the emitter shell around the core. The droplet radiator module is the radiator works\' block. All five are made on the assembly line (the module only in Mercury orbit) and placed in the structure.'],
        ['emi.grindless.info.uiv_matrioshka.1',
            'The radiation-hardened controller is made on the assembly line and is read by the machines built from it. The InGaAsSb epi wafer comes from the MOCVD reactor, which EMI does not show.'],
        ['block.gtceu.matrioshka_computer', 'Matrioshka Computer'],
        ['block.gtceu.droplet_radiator_works', 'Droplet Radiator Works'],
        ['gtceu.matrioshka_computing', 'Matrioshka Computing'],
        ['gtceu.droplet_radiator_assembly', 'Droplet Radiator Assembly'],
        ['material.gtceu.stibine', 'Stibine'],

        ['grindless.machine.matrioshka_computer.tooltip.0',
            '\u00a77Writes UIV research and makes the neutron-star and Kerr charts.'],
        ['grindless.machine.droplet_radiator_works.tooltip.0',
            '\u00a77Makes TPV tiles in open vacuum.'],

        ['gtceu.recipe.grindless_matrioshka_computing.research_write',
            'Circuit 1: the 5D data crystal burns the radiation-hardened controller research into a blank data module.'],
        ['gtceu.recipe.grindless_matrioshka_computing.ns_eos_chart',
            'Circuit 2: a timed X-ray pulse and a degenerate pellet give the neutron-star equation-of-state chart.'],
        ['gtceu.recipe.grindless_matrioshka_computing.kerr_chart',
            'Circuit 3: correlated Kerr data resolves into the Kerr chart.'],
        ['gtceu.recipe.grindless_droplet_radiator_assembly.tpv_tile',
            'Circuit 2: four TPV cells and a selective emitter make a TPV tile.'],

        ['gtceu.recipe.grindless_electron_beam.tin_distill',
            'Circuit 8: the electron beam distils tin; the skull is left behind.'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.glassy_carbon_lattice',
            'Circuit 4: methane pyrolyses onto the 2PP lattice into glassy carbon; the hydrogen is returned.'],
        ['gtceu.recipe.grindless_snspd_fabrication.nb_jj_wafer',
            'Circuit 5: the niobium trilayer is patterned into Josephson junctions.'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.nb_trilayer',
            'Circuit 8: a niobium target grows the Nb/AlOx/Nb trilayer on silicon.'],
        ['gtceu.recipe.grindless_photonic_foundry.air_bridge',
            'Circuit 14: gold air bridges are plated on the InGaAsSb epi wafer.'],
        ['gtceu.recipe.grindless_photonic_foundry.diamond_contacts',
            'Circuit 15: Ti/Pt/Au contacts are deposited on the boron-doped C-12 diamond.'],
        ['gtceu.recipe.grindless_photonic_foundry.w_photonic_crystal',
            'Circuit 16: the sputtered tungsten wafer is etched into a photonic crystal.']
    ]

    // [name, en, tooltip 0, tooltip 1]; blocks are listed in BLOCKS
    var ITEMS = [
        ['eb_distilled_tin', 'Distilled Tin', 'Tin distilled in the electron beam furnace.', 'Sprayed into droplets in the droplet radiator works.'],
        ['glassy_carbon_lattice', 'Glassy Carbon Lattice', 'A 2PP lattice pyrolysed into glassy carbon.', 'Coated with SiC for the droplet wick.'],
        ['sic_coated_lattice', 'SiC-Coated Lattice', 'Glassy carbon wrapped in silicon carbide.', 'Becomes a droplet wick.'],
        ['droplet_wick', 'Droplet Wick', 'A porous wick that feeds liquid tin.', 'Two make a droplet collector.'],
        ['droplet_collector', 'Droplet Collector', 'Catches the tin droplets for reuse.', 'Goes into the droplet radiator works (circuit 1).'],
        ['ingaasb_epi_wafer', 'InGaAsSb Epi Wafer', 'A GaAs wafer grown with an InGaAsSb absorber.', 'Gets gold air bridges in the photonic foundry.'],
        ['air_bridge_wafer', 'Air-Bridge Wafer', 'A TPV wafer with gold air bridges.', 'Diced into TPV cells.'],
        ['ingaasb_tpv_cell', 'InGaAsSb TPV Cell', 'Turns thermal radiation back into electricity.', 'Four go into a TPV tile.'],
        ['tpv_tile', 'TPV Tile', 'Four TPV cells under a selective emitter.', 'Made in the droplet radiator works (circuit 2).'],
        ['tpv_segment', 'TPV Segment', 'Four tiles joined with gold.', 'Four make a TPV shell.'],
        ['tipt_au_stack', 'Ti/Pt/Au Contact Stack', 'A titanium, platinum and gold metal stack.', 'Deposited as diamond contacts; the gold is recycled.'],
        ['nb_target', 'Niobium Target', 'Sintered niobium for epitaxy.', 'Grows the Josephson trilayer.'],
        ['w_target', 'Tungsten Target', 'Sintered tungsten for sputtering.', 'Sputtered onto silicon.'],
        ['nb_trilayer', 'Nb Trilayer Wafer', 'A Nb/AlOx/Nb trilayer on silicon.', 'Patterned into Josephson junctions.'],
        ['nb_jj_wafer', 'Josephson Junction Wafer', 'A wafer of niobium Josephson junctions.', 'Engraved into AQFP dies.'],
        ['aqfp_die', 'AQFP Die', 'An adiabatic quantum-flux-parametron logic die.', 'Bonded to a glass interposer.'],
        ['aqfp_module', 'AQFP Module', 'An AQFP die on its interposer.', 'Four make a logic tile.'],
        ['c12_cvd_plate', 'C-12 CVD Plate', 'Isotopically pure diamond grown from the fusion ash.', 'Polished, doped or metallised.'],
        ['c12_polished_plate', 'Polished C-12 Plate', 'A mirror-flat C-12 diamond plate.', 'Metallised for a computing node.'],
        ['c12_metallised_plate', 'Metallised C-12 Plate', 'A C-12 plate with titanium traces.', 'Two make a computing node.'],
        ['c12_boron_diamond', 'Boron-Doped C-12 Diamond', 'A p-type C-12 diamond plate.', 'Receives Ti/Pt/Au contacts.'],
        ['diamond_contact_wafer', 'Diamond Contact Wafer', 'Doped diamond with its metal contacts.', 'Makes a Schottky die.'],
        ['diamond_schottky_die', 'Diamond Schottky Die', 'A radiation-hard diamond diode.', 'Four go into the radiation-hardened controller.'],
        ['sputtered_w_wafer', 'Sputtered Tungsten Wafer', 'A silicon wafer with a tungsten film.', 'Etched into a photonic crystal.'],
        ['w_photonic_crystal', 'Tungsten Photonic Crystal', 'A crystal that radiates only in a narrow band.', 'Passivated with hafnia.'],
        ['hfo2_passivated_crystal', 'Passivated Photonic Crystal', 'A tungsten crystal sealed with hafnia.', 'Becomes a selective emitter.'],
        ['selective_emitter', 'Selective Emitter', 'Emits heat only where the TPV cell can use it.', 'Goes into TPV tiles and emitter shells.'],
        ['rad_hard_controller', 'Radiation-Hardened Controller', 'A controller built to run beside a star.', 'Made on the assembly line; the research is written by the Matrioshka computer.'],
        ['matrioshka_logic_tile', 'Matrioshka Logic Tile', 'Four AQFP modules in a niobium frame.', 'Ring block of the Matrioshka computer.'],
        ['matrioshka_node', 'Matrioshka Node', 'Two metallised C-12 plates.', 'Ring block of the Matrioshka computer.'],
        ['matrioshka_emitter_shell', 'Matrioshka Emitter Shell', 'Four selective emitters on titanium.', 'Ring block of the Matrioshka computer.'],
        ['matrioshka_tpv_shell', 'Matrioshka TPV Shell', 'Four TPV segments on tungsten.', 'Ring block of the Matrioshka computer.'],
        ['droplet_radiator_module', 'Droplet Radiator Module', 'A sheet of liquid-tin droplets in a frame.', 'Ring block of the Matrioshka computer.']
    ]
    var BLOCKS = {
        matrioshka_logic_tile: true, matrioshka_node: true, matrioshka_emitter_shell: true, matrioshka_tpv_shell: true, droplet_radiator_module: true
    }

    ITEMS.forEach(function (i) {
        ENTRIES.push([(BLOCKS[i[0]] ? 'block.grindless.' : 'item.grindless.') + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[3]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
