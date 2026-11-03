// priority: 5076
// Gregtech Grindless - names and tooltips of UEV's quantum gas lab and entanglement station (startup_scripts/grindless/uev/earth_orbit.js; package UEV-A8):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1              the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.quantum_gas_lab', 'Quantum Gas Lab'],
        ['gtceu.quantum_degenerate_gas', 'Quantum Degenerate Gas'],
        ['block.gtceu.entanglement_station', 'Entanglement Station'],
        ['gtceu.entanglement_distribution', 'Entanglement Distribution'],

        ['grindless.machine.quantum_gas_lab.tooltip.0',
            '§7Cools Li-6 and K-40 into a Fermi gas and runs atom interferometry.'],
        ['grindless.machine.quantum_gas_lab.tooltip.1', 'Works in Earth orbit only.'],

        ['grindless.machine.entanglement_station.tooltip.0',
            '§7Entangles photons with a memory to make quantum repeater nodes.'],
        ['grindless.machine.entanglement_station.tooltip.1', 'Works in Earth orbit only.'],

        ['gtceu.recipe.grindless_quantum_degenerate_gas.degenerate_eos_model', 'Circuit 1: a Li-6 and K-40 Fermi mixture cooled by the two lasers: the EOS model'],
        ['gtceu.recipe.grindless_quantum_degenerate_gas.barnard_gravity_survey', 'Circuit 2: the calibrated gravimeter measures Barnard core rock'],
        ['gtceu.recipe.grindless_quantum_degenerate_gas.calibrate_gravimeter', 'Circuit 3: the atom interferometer is referenced to the ULE cavity, which is not consumed'],
        ['gtceu.recipe.grindless_entanglement_distribution.quantum_repeater_node', 'Circuit 1: source, memory, QD source, detectors and hollow-core fibre in one node'],
        ['gtceu.recipe.grindless_crystal_growth.tgg', 'Circuit 6: terbium gallium garnet pulled from the melt in an iridium crucible'],
        ['gtceu.recipe.grindless_crystal_growth.ktp', 'Circuit 7: KTP grown from a flux in an iridium crucible']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['cnt_sock', 'CNT Sock', 'A sleeve of carbon nanotubes grown on floating iron.', 'Made in the methane pyrolyser, circuit 3.'],
        ['cnt_ribbon', 'CNT Ribbon', 'The sock slit and drawn flat into two aligned ribbons.', 'Drawn in the lathe; the spare carbon comes out as dust. Densified in a chemical reactor.'],
        ['cnt_densified_yarn', 'Densified CNT Yarn', 'The ribbon drawn through ethanol into a dense yarn.', 'The iron catalyst comes back as dust. Annealed in the blast furnace.'],
        ['cnt_annealed_yarn', 'Annealed CNT Yarn', 'Yarn healed of defects under argon.', 'Sized with epoxy in a chemical reactor.'],
        ['cnt_sized_yarn', 'Sized CNT Yarn', 'Yarn coated in epoxy so it holds a twist.', 'Four of them are twisted in the assembler.'],
        ['cnt_twisted_yarn', 'Twisted CNT Yarn', 'Four yarns twisted into one.', 'Made in the assembler.'],
        ['cnt_coiled_muscle', 'Coiled CNT Muscle', 'A coiled yarn that contracts when heated.', 'Four of them move a UEV robot arm.'],
        ['gallium_oxide_dust', 'Gallium Oxide Dust', 'Gallium burned in oxygen.', 'Part of the TGG line.'],
        ['tgg_hydroxide_cake', 'TGG Hydroxide Cake', 'Terbium and gallium coprecipitated with ammonia.', 'Calcined into TGG powder.'],
        ['tgg_boule', 'TGG Boule', 'A terbium gallium garnet crystal.', 'Cut into rods.'],
        ['tgg_rod', 'TGG Rod', 'A rough rod of garnet.', 'Polished on a lathe.'],
        ['tgg_polished_rod', 'Polished TGG Rod', 'Optical grade, ready for a magnet.', 'The heart of a Faraday isolator.'],
        ['fused_silica_tube', 'Fused Silica Tube', 'Silica melted into a tube.', 'Capillaries and preforms start here.'],
        ['hollow_capillaries', 'Hollow Capillaries', 'Thin silica tubes from the fibre draw tower.', 'Stacked around a larger tube.'],
        ['stacked_preform', 'Stacked Preform', 'Capillaries packed around a tube.', 'Fused into a cane.'],
        ['caned_preform', 'Caned Preform', 'The stack fused under helium.', 'Drawn into fibre.'],
        ['drawn_hollow_fibre', 'Drawn Hollow Fibre', 'Hair-thin fibre with an air core.', 'Coated with epoxy.'],
        ['mcp_lead_glass', 'MCP Lead Glass', 'Glass melted with lead.', 'Cladding of the channel plate.'],
        ['etchable_core_tube', 'Etchable Core Tube', 'A glass core inside lead-glass cladding.', 'Drawn into a multi-fibre.'],
        ['mcp_multifibre', 'MCP Multi-fibre', 'A bundle of core tubes drawn together.', 'Fused into a boule.'],
        ['mcp_boule', 'MCP Boule', 'A fused block of channel fibres.', 'Sliced into plates.'],
        ['mcp_plate', 'MCP Plate', 'A slice across the fibres.', 'The core is etched out with acid.'],
        ['mcp_etched_plate', 'Etched MCP Plate', 'A plate of empty channels.', 'Reduced in hydrogen.'],
        ['mcp_reduced_plate', 'Reduced MCP Plate', 'Channel walls that now emit electrons.', 'Electrodes make it a lobster-eye MCP.'],
        ['kh2po4_dust', 'KH2PO4 Dust', 'Potassium dihydrogen phosphate.', 'The flux of the KTP line.'],
        ['ktp_flux', 'KTP Flux', 'Phosphate and rutile ready to melt.', 'Grown in the crystal furnace, circuit 7.'],
        ['ktp_boule', 'KTP Boule', 'A potassium titanyl phosphate crystal.', 'Sliced into wafers.'],
        ['ktp_wafer', 'KTP Wafer', 'A thin slice of KTP.', 'Gets gold electrodes.'],
        ['ktp_electroded_wafer', 'Electroded and Poled KTP Wafer', 'Electroded and poled: the crystal of a photon-pair source.', 'Goes into the SPDC source.'],
        ['spdc_source', 'SPDC Source', 'A poled KTP wafer pumped by an emitter.', 'Makes entangled photon pairs.'],
        ['ule_soot', 'ULE Soot', 'Silica and titania from flame hydrolysis.', 'The chlorine goes to the chlorine users.'],
        ['ule_boule', 'ULE Boule', 'Ultra-low expansion glass.', 'Turned into a spacer.'],
        ['ule_spacer', 'ULE Spacer', 'A rod that barely changes length.', 'Mirrors go on both ends.'],
        ['ule_mirrored_spacer', 'Mirrored ULE Spacer', 'Tantalum oxide mirror coats on both ends.', 'Housed in vacuum.'],
        ['ule_cavity', 'ULE Cavity', 'A frequency reference. It is never used up.', 'Kept in the quantum gas lab.'],
        ['li_cooling_laser', 'Lithium Cooling Laser', 'Locked to the lithium transition.', 'Kept in the quantum gas lab.'],
        ['k_cooling_laser', 'Potassium Cooling Laser', 'Locked to the potassium transition.', 'Kept in the quantum gas lab.'],
        ['atom_interferometer', 'Atom Interferometer', 'A sensor and two cooling lasers.', 'Needs calibration against the ULE cavity.'],
        ['calibrated_gravimeter', 'Calibrated Gravimeter', 'An interferometer tied to the ULE cavity.', 'Measures Barnard core rock.']
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
