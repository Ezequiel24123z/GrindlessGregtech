// priority: 5050
// Gregtech Grindless - names and tooltips of the UEV foundation (startup_scripts/grindless/uev/foundation.js):
//
//   grindless:<item> and grindless:<block>   item.grindless.<n> / block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<material> (GT material)           material.gtceu.<n>
//   gtceu:uev_<machine> (hull and hatches)   block.gtceu.uev_<n>
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // kind, id, [name, tip 0, tip 1]
    var ENTRIES = [
        ['item', 'ca48_beam',
            ['Calcium-48 Beam Charge', 'Enough calcium-48 ions to fire at a target for a run.', 'Made from enriched calcium. Fired at a target wheel.']],
        ['item', 'target_wheel',
            ['Target Wheel', 'A spinning ring of actinide target segments.', 'It spreads the beam heat. Worn out by the run.']],
        ['item', 'tennessine_sample',
            ['Tennessine Sample', 'A handful of atoms that lasted long enough to be counted.', 'Proof of the superheavy facility. Feeds the census.']],
        ['item', 'superheavy_census',
            ['Superheavy Census', 'A tally of every superheavy decay chain seen so far.', 'Needed to check the island of stability model.']],
        ['item', 'degenerate_eos_model',
            ['Degenerate EOS Model', 'An equation of state fitted to matter crushed past atoms.', 'Made in Earth orbit. Used by the degenerate matter line.']],
        ['item', 'barnard_gravity_survey',
            ['Barnard Gravity Survey', 'A map of the pull under a red dwarf rocky world.', 'Made in Earth orbit. Guides the core drill.']],
        ['item', 'quantum_repeater_node',
            ['Quantum Repeater Node', 'A node that carries entanglement over a long link.', 'Made in Earth orbit. Used by the networked machines.']],
        ['item', 'pulsar_navigation_chart',
            ['Pulsar Navigation Chart', 'A chart of the clock stars that tell a probe where it is.', 'Made from timing a set of pulsars.']],
        ['item', 'mass_radius_chart',
            ['Mass-Radius Chart', 'A chart of how big each dense star is for its mass.', 'Made from a survey of compact stars.']],
        ['item', 'degenerate_matter',
            ['Degenerate Matter', 'Atoms packed until the electrons push back.', 'Made at Sirius B. Pressed into pellets.']],
        ['item', 'degenerate_pellet',
            ['Degenerate Pellet', 'A pressed pellet of degenerate matter, held by magnetic force.', 'Needs the degenerate containment casing.']],
        ['item', 'sx_blade',
            ['Single-Crystal Blade', 'A turbine blade grown as one crystal.', 'It holds its shape at white heat.']],
        ['item', 'sic_sic_plate',
            ['SiC/SiC Plate', 'A ceramic composite plate of silicon carbide fibre in silicon carbide.', 'Made in the CVI furnace. Feeds the UEV hull.']],
        ['item', 'wf_w_tile',
            ['Wf/W Tile', 'A tungsten fibre in tungsten tile that faces the plasma.', 'Lines the fusion chamber.']],
        ['item', 'snspd',
            ['SNSPD', 'A superconducting nanowire that counts single photons.', 'Used by the quantum link and the telescopes.']],
        ['item', 'qd_source',
            ['Quantum Dot Source', 'A quantum dot that emits one photon at a time.', 'Used by the quantum link.']],
        ['item', 'sdd',
            ['Silicon Drift Detector', 'An X-ray detector that tells which element was hit.', 'Used by the survey instruments.']],
        ['item', 'lobster_eye_mcp',
            ['Lobster-Eye MCP', 'A microchannel plate that focuses X-rays like a lobster eye.', 'Used by the X-ray telescope.']],
        ['item', 'aerogel_tile',
            ['Aerogel Tile', 'A tile of glass foam that is nearly all air.', 'It catches dust without breaking it.']],
        ['item', 'hollow_core_fibre',
            ['Hollow-Core Fibre', 'A fibre that guides light through an air channel.', 'Used by the quantum link.']],
        ['item', 'faraday_isolator',
            ['Faraday Isolator', 'An optical one-way valve for a laser beam.', 'Made with terbium gallium garnet.']],
        ['item', 'bonded_fe16n2_magnet',
            ['Bonded Fe16N2 Magnet', 'A rare-earth-free magnet from iron nitride powder.', 'Used by the UEV electric motor.']],
        ['item', 'barnard_core_rock',
            ['Barnard Core Rock', 'A core sample from a rocky world around a red dwarf.', 'Made by the core drill. Feeds the survey.']],
        ['block', 'uev_fusion_casing',
            ['UEV Fusion Casing', 'A plasma-facing wall of tungsten composite tiles.', 'Structure block of the UEV fusion reactor.']],
        ['block', 'degenerate_containment_casing',
            ['Degenerate Containment Casing', 'A shell that holds matter crushed past atoms.', 'Structure block of the degenerate matter machines.']],
        ['block', 'photonic_casing',
            ['Photonic Casing', 'A sealed wall of cleanroom grade for light-based machines.', 'Structure block of the photonic machines.']],
        ['block', 'hftacn_coil_block',
            ['HfTaCN Coil Block', 'A coil of hafnium tantalum carbonitride that runs at 12,600 K.', 'The hottest coil of the UEV era.']],

        ['material', 'calcium_48', ['Calcium-48']],
        ['material', 'potassium_40', ['Potassium-40']],
        ['material', 'lithium_6', ['Lithium-6']],
        ['material', 'plutonium_244', ['Plutonium-244']],
        ['material', 'curium_248', ['Curium-248']],
        ['material', 'californium_249', ['Californium-249']],
        ['material', 'lay_superhydride', ['Lanthanum Yttrium Superhydride']],
        ['material', 'ammonia_borane', ['Ammonia Borane']],
        ['material', 'fe16n2', ['Iron Nitride (Fe16N2)']],
        ['material', 'iron_pentacarbonyl', ['Iron Pentacarbonyl']],
        ['material', 'hftacn', ['Hafnium Tantalum Carbonitride']],
        ['material', 'sic_sic', ['SiC/SiC Composite']],
        ['material', 'tungsten_silicide', ['Tungsten Silicide']],
        ['material', 'tgg', ['Terbium Gallium Garnet']],
        ['material', 'ppktp', ['PPKTP']],
        ['material', 'ffkm', ['FFKM']],
        ['material', 'polycarbonate', ['Polycarbonate']],
        ['material', 'ule_glass', ['ULE Glass']],
        ['material', 'interstellar_gas', ['Interstellar Gas']],
        ['material', 'compressed_interstellar_gas', ['Compressed Interstellar Gas']],
        ['material', 'hydrogen_deuterium_fraction', ['Hydrogen-Deuterium Fraction']],
        ['material', 'helium_fraction', ['Helium Fraction']],
        ['material', 'dhe3_fuel_mix', ['D-He3 Fuel Mix']],
        ['material', 'pb11_fuel', ['p-B11 Fuel']],
        ['material', 'polarised_dhe3_fuel', ['Polarised D-He3 Fuel']],

        ['machine', 'uev_machine_hull', ['UEV Machine Hull']],
        ['machine', 'uev_energy_input_hatch', ['UEV Energy Hatch']],
        ['machine', 'uev_energy_output_hatch', ['UEV Dynamo Hatch']],
        ['machine', 'uev_energy_input_hatch_16a', ['UEV 16A Energy Hatch']],
        ['machine', 'uev_energy_output_hatch_16a', ['UEV 16A Dynamo Hatch']]
    ]

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        ENTRIES.forEach(function (e) {
            var kind = e[0]
            var id = e[1]
            var t = e[2]
            if (kind === 'material') {
                add('material.gtceu.' + id, t[0])
                return
            }
            if (kind === 'machine') {
                add('block.gtceu.' + id, t[0])
                return
            }
            add(kind + '.grindless.' + id, t[0])
            add('tooltip.grindless.' + id + '.0', t[1])
            add('tooltip.grindless.' + id + '.1', t[2])
        })
    })
})()
