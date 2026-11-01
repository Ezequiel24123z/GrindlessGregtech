// priority: 5107
// Gregtech Grindless - names and tooltips of UEV's nitride magnet works, SiC fibre plant and CVI furnace (startup_scripts/grindless/uev/composites.js; package UEV-A5):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / composites.no_voiding   controller tooltips and the refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items; material.gtceu.<n> its GT materials
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.nitride_magnet_works', 'Nitride Magnet Works'],
        ['gtceu.nitride_magnet_synthesis', 'Nitride Magnet Synthesis'],
        ['block.gtceu.sic_fibre_plant', 'SiC Fibre Plant'],
        ['gtceu.sic_fibre_spinning', 'SiC Fibre Spinning'],
        ['block.gtceu.cvi_furnace', 'CVI Furnace'],
        ['gtceu.chemical_vapour_infiltration', 'Chemical Vapour Infiltration'],

        ['grindless.machine.nitride_magnet_works.tooltip.0',
            '§7Nitrides iron to Fe16N2 and bonds rare-earth-free magnets.'],
        ['emi.grindless.info.nitride_magnet_works.1',
            'Reduced iron powder is nitrided with ammonia to Fe16N2, strain-annealed and bonded: a rare-earth-free magnet.'],
        ['emi.grindless.info.nitride_magnet_works.2',
            'Circuit 1 Fe16N2 powder (the only source; the hydrogen goes to the methane pyrolyser), 2 strain anneal, 3 bonded magnet.'],
        ['grindless.machine.sic_fibre_plant.tooltip.0',
            '§7Spins and cures polycarbosilane into continuous SiC fibre.'],
        ['emi.grindless.info.sic_fibre_plant.1',
            'Polycarbosilane is spun, cured with an electron beam and pyrolysed to continuous silicon carbide fibre.'],
        ['emi.grindless.info.sic_fibre_plant.2',
            'Circuit 1 green fibre, 2 e-beam cure, 3 SiC fibre. The methane and hydrogen go to the methane pyrolyser.'],
        ['grindless.machine.cvi_furnace.tooltip.0',
            '§7Infiltrates woven preforms with gas to deposit SiC/SiC and W/W parts.'],
        ['emi.grindless.info.cvi_furnace.1',
            'Gas seeps into a woven preform and deposits the matrix fibre by fibre, over days: slow, and nothing else makes these parts.'],
        ['emi.grindless.info.cvi_furnace.2',
            'Circuit 1 SiC/SiC plate (HCl to the extraction cascade), 2 Wf/W divertor tile (HF to the fluorspar kiln).'],
        ['grindless.machine.composites.tooltip.parts',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, an output bus, hatches for the fluids. Accepts a parallel hatch.'],
        ['grindless.machine.composites.no_voiding',
            'Voiding is off: the methane, hydrogen, HCl and HF must have somewhere to go.'],

        ['gtceu.recipe.grindless_nitride_magnet_synthesis.fe16n2_powder', 'Circuit 1: Fe16N2 powder from reduced iron and ammonia'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.strain_anneal', 'Circuit 2: strain anneal to the ordered phase'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.bonded_magnet', 'Circuit 3: a bonded Fe16N2 magnet'],
        ['gtceu.recipe.grindless_sic_fibre_spinning.green_fibre', 'Circuit 1: polycarbosilane spun to green fibre'],
        ['gtceu.recipe.grindless_sic_fibre_spinning.ebeam_cure', 'Circuit 2: electron beam cure'],
        ['gtceu.recipe.grindless_sic_fibre_spinning.sic_fibre', 'Circuit 3: pyrolysis to SiC fibre; methane and hydrogen to the pyrolyser'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.sic_sic_plate', 'Circuit 1: a SiC/SiC plate; the HCl goes to the cascade'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.wf_w_tile', 'Circuit 2: a Wf/W divertor tile; the HF goes to the kiln'],

        ['material.gtceu.methyltrichlorosilane', 'Methyltrichlorosilane'],
        ['material.gtceu.tungsten_hexafluoride', 'Tungsten Hexafluoride'],
        ['material.gtceu.chlorodifluoromethane', 'Chlorodifluoromethane'],
        ['material.gtceu.pmve', 'Perfluoromethyl Vinyl Ether'],

        ['emi.grindless.info.nitride_magnet_works.0', 'The only maker of Fe16N2 powder and bonded Fe16N2 magnets. The Fe(CO)5 it starts from comes from Barnard.'],
        ['emi.grindless.info.sic_fibre_plant.0', 'Spins, cures and pyrolyses SiC fibre; the byproduct methane and hydrogen go to the methane pyrolyser.'],
        ['emi.grindless.info.cvi_furnace.0', 'The only maker of SiC/SiC plates and Wf/W divertor tiles; cycles of 9,600 ticks.']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['tantalum_pentoxide_dust', 'Tantalum Pentoxide Dust', 'Ta2O5, burnt from 6N tantalum powder.', 'Mixed into the HfTaC blend.'],
        ['hftac_blend_dust', 'HfTaC Oxide-Carbon Blend', 'Hafnia, tantalum pentoxide and carbon, milled together.', 'Reduced in an electric blast furnace.'],
        ['hftac_dust', 'HfTaC Dust', 'Hafnium-tantalum carbide from the carbothermal step.', 'The carbon monoxide goes to the syngas line. Nitrided next.'],
        ['hftacn_crude_dust', 'Crude HfTaCN', 'Hafnium-tantalum carbonitride, coarse.', 'Milled in a macerator.'],
        ['hftacn_powder', 'HfTaCN Powder', 'Milled hafnium-tantalum carbonitride.', 'Sintered with 6N hafnium in the spark plasma sinterer (circuit 4).'],
        ['hftacn_heating_element', 'HfTaCN Heating Element', 'The hottest-running resistor in the pack.', 'Eight make an HfTaCN coil block.'],
        ['carbonyl_iron_powder', 'Carbonyl Iron Powder', 'Spherical iron from decomposed iron pentacarbonyl.', 'The carbon monoxide is recycled. Reduced in an electric blast furnace.'],
        ['reduced_iron_powder', 'Reduced Iron Powder', 'Carbonyl iron with its oxide skin removed by hydrogen.', 'Nitrided in the nitride magnet works (circuit 1).'],
        ['strain_annealed_fe16n2_powder', 'Strain-Annealed Fe16N2 Powder', 'The ordered alpha-double-prime phase.', 'Bonded in the nitride magnet works (circuit 3).'],
        ['polydimethylsilane_dust', 'Polydimethylsilane Dust', 'Wurtz-coupled dimethyldichlorosilane.', 'Rearranged to polycarbosilane in a chemical reactor.'],
        ['polycarbosilane_dust', 'Polycarbosilane Dust', 'The preceramic polymer of SiC fibre.', 'Spun in the SiC fibre plant (circuit 1).'],
        ['green_sic_fibre', 'Green SiC Fibre', 'Spun polycarbosilane, still a polymer.', 'Cured in the SiC fibre plant (circuit 2).'],
        ['cured_sic_fibre', 'Cured SiC Fibre', 'Cross-linked by an electron beam.', 'Pyrolysed in the SiC fibre plant (circuit 3).'],
        ['sic_fibre', 'SiC Fibre', 'Continuous silicon carbide fibre.', 'Coated with BN in the boron nitride reactor (circuit 5).'],
        ['bn_coated_sic_fibre', 'BN-Coated SiC Fibre', 'The boron nitride interphase lets a crack slip along the fibre.', 'Woven into a preform in an assembler.'],
        ['sic_fibre_preform', 'SiC Fibre Preform', 'A woven preform waiting for its matrix.', 'Infiltrated in the CVI furnace (circuit 1).'],
        ['coated_w_wire', 'Coated Tungsten Wire', 'Tungsten wire with a yttria interlayer.', 'Woven into a preform in an assembler.'],
        ['w_fibre_preform', 'Tungsten Fibre Preform', 'A woven tungsten preform.', 'Infiltrated in the CVI furnace (circuit 2).'],
        ['ffkm_seal', 'FFKM Seal', 'Perfluoroelastomer, cured. Shrugs off hot acid.', 'Goes into the UEV electric motor.']
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
