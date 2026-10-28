// priority: 5107
// Gregtech Grindless - names and tooltips of UEV's nitride magnet works, SiC fibre plant and CVI furnace (startup_scripts/grindless/uev/composites.js; package UEV-A5):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N / composites.no_voiding   controller tooltips and the refusal to void
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items; material.gtceu.<n> its GT materials
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.nitride_magnet_works', 'Nitride Magnet Works', 'Planta de imanes de nitruro'],
        ['gtceu.nitride_magnet_synthesis', 'Nitride Magnet Synthesis', 'Síntesis de imanes de nitruro'],
        ['block.gtceu.sic_fibre_plant', 'SiC Fibre Plant', 'Planta de fibra de SiC'],
        ['gtceu.sic_fibre_spinning', 'SiC Fibre Spinning', 'Hilado de fibra de SiC'],
        ['block.gtceu.cvi_furnace', 'CVI Furnace', 'Horno CVI'],
        ['gtceu.chemical_vapour_infiltration', 'Chemical Vapour Infiltration', 'Infiltración química en fase vapor'],

        ['grindless.machine.nitride_magnet_works.tooltip.0',
            'Reduced iron powder is nitrided with ammonia to Fe16N2, strain-annealed and bonded: a rare-earth-free magnet.',
            'El polvo de hierro reducido se nitrura con amoníaco hasta Fe16N2, se recuece por deformación y se aglomera: un imán sin tierras raras.'],
        ['grindless.machine.nitride_magnet_works.tooltip.1',
            'Circuit 1 Fe16N2 powder (the only source; the hydrogen goes to the methane pyrolyser), 2 strain anneal, 3 bonded magnet.',
            'Circuito 1 polvo de Fe16N2 (la única fuente; el hidrógeno va al pirolizador de metano), 2 recocido por deformación, 3 imán aglomerado.'],
        ['grindless.machine.sic_fibre_plant.tooltip.0',
            'Polycarbosilane is spun, cured with an electron beam and pyrolysed to continuous silicon carbide fibre.',
            'El policarbosilano se hila, se cura con haz de electrones y se pirolisa hasta fibra continua de carburo de silicio.'],
        ['grindless.machine.sic_fibre_plant.tooltip.1',
            'Circuit 1 green fibre, 2 e-beam cure, 3 SiC fibre. The methane and hydrogen go to the methane pyrolyser.',
            'Circuito 1 fibra verde, 2 curado por haz de electrones, 3 fibra de SiC. El metano y el hidrógeno van al pirolizador de metano.'],
        ['grindless.machine.cvi_furnace.tooltip.0',
            'Gas seeps into a woven preform and deposits the matrix fibre by fibre, over days: slow, and nothing else makes these parts.',
            'El gas se infiltra en una preforma tejida y deposita la matriz fibra a fibra, durante días: lento, y nada más fabrica estas piezas.'],
        ['grindless.machine.cvi_furnace.tooltip.1',
            'Circuit 1 SiC/SiC plate (HCl to the extraction cascade), 2 Wf/W divertor tile (HF to the fluorspar kiln).',
            'Circuito 1 placa SiC/SiC (el HCl va a la cascada de extracción), 2 teja de divertor Wf/W (el HF va al horno de fluorita).'],
        ['grindless.machine.composites.tooltip.parts',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, an output bus, hatches for the fluids. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, un bus de salida, escotillas para los fluidos. Acepta una escotilla de paralelos.'],
        ['grindless.machine.composites.no_voiding',
            'Voiding is off: the methane, hydrogen, HCl and HF must have somewhere to go.',
            'El desecho está desactivado: el metano, el hidrógeno, el HCl y el HF deben tener adónde ir.'],

        ['gtceu.recipe.grindless_nitride_magnet_synthesis.fe16n2_powder', 'Circuit 1: Fe16N2 powder from reduced iron and ammonia', 'Circuito 1: polvo de Fe16N2 a partir de hierro reducido y amoníaco'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.strain_anneal', 'Circuit 2: strain anneal to the ordered phase', 'Circuito 2: recocido por deformación hasta la fase ordenada'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.bonded_magnet', 'Circuit 3: a bonded Fe16N2 magnet', 'Circuito 3: un imán aglomerado de Fe16N2'],
        ['gtceu.recipe.grindless_sic_fibre_spinning.green_fibre', 'Circuit 1: polycarbosilane spun to green fibre', 'Circuito 1: policarbosilano hilado a fibra verde'],
        ['gtceu.recipe.grindless_sic_fibre_spinning.ebeam_cure', 'Circuit 2: electron beam cure', 'Circuito 2: curado por haz de electrones'],
        ['gtceu.recipe.grindless_sic_fibre_spinning.sic_fibre', 'Circuit 3: pyrolysis to SiC fibre; methane and hydrogen to the pyrolyser', 'Circuito 3: pirólisis a fibra de SiC; metano e hidrógeno al pirolizador'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.sic_sic_plate', 'Circuit 1: a SiC/SiC plate; the HCl goes to the cascade', 'Circuito 1: una placa SiC/SiC; el HCl va a la cascada'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.wf_w_tile', 'Circuit 2: a Wf/W divertor tile; the HF goes to the kiln', 'Circuito 2: una teja de divertor Wf/W; el HF va al horno'],

        ['material.gtceu.methyltrichlorosilane', 'Methyltrichlorosilane', 'Metiltriclorosilano'],
        ['material.gtceu.tungsten_hexafluoride', 'Tungsten Hexafluoride', 'Hexafluoruro de wolframio'],
        ['material.gtceu.chlorodifluoromethane', 'Chlorodifluoromethane', 'Clorodifluorometano'],
        ['material.gtceu.pmve', 'Perfluoromethyl Vinyl Ether', 'Éter perfluorometil vinílico'],

        ['emi.grindless.info.nitride_magnet_works.0', 'The only maker of Fe16N2 powder and bonded Fe16N2 magnets. The Fe(CO)5 it starts from comes from Barnard.', 'La única que fabrica polvo de Fe16N2 e imanes aglomerados de Fe16N2. El Fe(CO)5 del que parte viene de Barnard.'],
        ['emi.grindless.info.sic_fibre_plant.0', 'Spins, cures and pyrolyses SiC fibre; the byproduct methane and hydrogen go to the methane pyrolyser.', 'Hila, cura y pirolisa fibra de SiC; el metano y el hidrógeno de subproducto van al pirolizador de metano.'],
        ['emi.grindless.info.cvi_furnace.0', 'The only maker of SiC/SiC plates and Wf/W divertor tiles; cycles of 9,600 ticks.', 'La única que fabrica placas SiC/SiC y tejas de divertor Wf/W; ciclos de 9.600 ticks.']
    ]

    // [name, en, es, tooltip 0 en, es, tooltip 1 en, es]
    var ITEMS = [
        ['tantalum_pentoxide_dust', 'Tantalum Pentoxide Dust', 'Polvo de pentóxido de tántalo', 'Ta2O5, burnt from 6N tantalum powder.', 'Ta2O5, quemado a partir de polvo de tántalo.', 'Mixed into the HfTaC blend.', 'Se mezcla en la mezcla de HfTaC.'],
        ['hftac_blend_dust', 'HfTaC Oxide-Carbon Blend', 'Mezcla de óxido y carbono de HfTaC', 'Hafnia, tantalum pentoxide and carbon, milled together.', 'Hafnia, pentóxido de tántalo y carbono, molidos juntos.', 'Reduced in an electric blast furnace.', 'Se reduce en un horno eléctrico de arco.'],
        ['hftac_dust', 'HfTaC Dust', 'Polvo de HfTaC', 'Hafnium-tantalum carbide from the carbothermal step.', 'Carburo de hafnio y tántalo del paso carbotérmico.', 'The carbon monoxide goes to the syngas line. Nitrided next.', 'El monóxido de carbono va a la línea de gas de síntesis. Se nitrura después.'],
        ['hftacn_crude_dust', 'Crude HfTaCN', 'HfTaCN en bruto', 'Hafnium-tantalum carbonitride, coarse.', 'Carbonitruro de hafnio y tántalo, grueso.', 'Milled in a macerator.', 'Se muele en un pulverizador.'],
        ['hftacn_powder', 'HfTaCN Powder', 'Polvo de HfTaCN', 'Milled hafnium-tantalum carbonitride.', 'Carbonitruro de hafnio y tántalo molido.', 'Sintered with 6N hafnium in the spark plasma sinterer (circuit 4).', 'Se sinteriza con hafnio 6N en el sinterizador de plasma (circuito 4).'],
        ['hftacn_heating_element', 'HfTaCN Heating Element', 'Elemento calefactor de HfTaCN', 'The hottest-running resistor in the pack.', 'La resistencia que más calor soporta del pack.', 'Eight make an HfTaCN coil block.', 'Ocho forman un bloque de bobina de HfTaCN.'],
        ['carbonyl_iron_powder', 'Carbonyl Iron Powder', 'Polvo de hierro carbonilo', 'Spherical iron from decomposed iron pentacarbonyl.', 'Hierro esférico de pentacarbonilo de hierro descompuesto.', 'The carbon monoxide is recycled. Reduced in an electric blast furnace.', 'El monóxido de carbono se recicla. Se reduce en un horno eléctrico de arco.'],
        ['reduced_iron_powder', 'Reduced Iron Powder', 'Polvo de hierro reducido', 'Carbonyl iron with its oxide skin removed by hydrogen.', 'Hierro carbonilo sin su película de óxido, quitada con hidrógeno.', 'Nitrided in the nitride magnet works (circuit 1).', 'Se nitrura en la planta de imanes de nitruro (circuito 1).'],
        ['strain_annealed_fe16n2_powder', 'Strain-Annealed Fe16N2 Powder', 'Polvo de Fe16N2 recocido por deformación', 'The ordered alpha-double-prime phase.', 'La fase ordenada alfa doble prima.', 'Bonded in the nitride magnet works (circuit 3).', 'Se aglomera en la planta de imanes de nitruro (circuito 3).'],
        ['polydimethylsilane_dust', 'Polydimethylsilane Dust', 'Polvo de polidimetilsilano', 'Wurtz-coupled dimethyldichlorosilane.', 'Dimetildiclorosilano acoplado por Wurtz.', 'Rearranged to polycarbosilane in a chemical reactor.', 'Se reordena a policarbosilano en un reactor químico.'],
        ['polycarbosilane_dust', 'Polycarbosilane Dust', 'Polvo de policarbosilano', 'The preceramic polymer of SiC fibre.', 'El polímero precerámico de la fibra de SiC.', 'Spun in the SiC fibre plant (circuit 1).', 'Se hila en la planta de fibra de SiC (circuito 1).'],
        ['green_sic_fibre', 'Green SiC Fibre', 'Fibra de SiC verde', 'Spun polycarbosilane, still a polymer.', 'Policarbosilano hilado, todavía un polímero.', 'Cured in the SiC fibre plant (circuit 2).', 'Se cura en la planta de fibra de SiC (circuito 2).'],
        ['cured_sic_fibre', 'Cured SiC Fibre', 'Fibra de SiC curada', 'Cross-linked by an electron beam.', 'Reticulada con un haz de electrones.', 'Pyrolysed in the SiC fibre plant (circuit 3).', 'Se pirolisa en la planta de fibra de SiC (circuito 3).'],
        ['sic_fibre', 'SiC Fibre', 'Fibra de SiC', 'Continuous silicon carbide fibre.', 'Fibra continua de carburo de silicio.', 'Coated with BN in the boron nitride reactor (circuit 5).', 'Se recubre de BN en el reactor de nitruro de boro (circuito 5).'],
        ['bn_coated_sic_fibre', 'BN-Coated SiC Fibre', 'Fibra de SiC recubierta de BN', 'The boron nitride interphase lets a crack slip along the fibre.', 'La interfase de nitruro de boro deja que una grieta resbale por la fibra.', 'Woven into a preform in an assembler.', 'Se teje en una preforma en un ensamblador.'],
        ['sic_fibre_preform', 'SiC Fibre Preform', 'Preforma de fibra de SiC', 'A woven preform waiting for its matrix.', 'Una preforma tejida que espera su matriz.', 'Infiltrated in the CVI furnace (circuit 1).', 'Se infiltra en el horno CVI (circuito 1).'],
        ['coated_w_wire', 'Coated Tungsten Wire', 'Alambre de wolframio recubierto', 'Tungsten wire with a yttria interlayer.', 'Alambre de wolframio con una capa intermedia de itria.', 'Woven into a preform in an assembler.', 'Se teje en una preforma en un ensamblador.'],
        ['w_fibre_preform', 'Tungsten Fibre Preform', 'Preforma de fibra de wolframio', 'A woven tungsten preform.', 'Una preforma tejida de wolframio.', 'Infiltrated in the CVI furnace (circuit 2).', 'Se infiltra en el horno CVI (circuito 2).'],
        ['ffkm_seal', 'FFKM Seal', 'Junta de FFKM', 'Perfluoroelastomer, cured. Shrugs off hot acid.', 'Perfluoroelastómero, curado. Aguanta ácido caliente.', 'Goes into the UEV electric motor.', 'Va en el motor eléctrico UEV.']
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
