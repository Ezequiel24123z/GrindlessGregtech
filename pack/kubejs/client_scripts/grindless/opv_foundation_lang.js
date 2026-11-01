// priority: 5756
// Gregtech Grindless - names and tooltips of the OpV foundation (startup_scripts/grindless/opv/foundation.js):
//
//   grindless:<item> and grindless:<block>   item.grindless.<n> / block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<material> (GT material)           material.gtceu.<n>
//   grindless:<material> (GT material)       material.grindless.<n>
//   the two places (startup_scripts/grindless/opv/travel.js, data/grindless/gcyr/planets/{sgr1806_orbit,terzan5_core}.json):
//     level.grindless.<planet> (GCYR's planet names), dimension.grindless.<world>, planet.grindless.<key> (quantum bridge messages)
//
// The gtceu:opv_* and gtceu:max_* names are GTM's own. Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts.
// Names go in en_us.
(function () {
    // id, name, tip 0, tip 1
    var ITEMS = [
        ['bulge_relay_seed', 'Bulge Relay Seed', 'A relay seed of UXV parts: a strand magsail, a SHeQUID gyro and an FRC cartridge.', 'It brakes on the bulge\'s gas near SGR 1806-20.'],
        ['launched_bulge_seed', 'Launched Bulge Seed', 'A bulge relay seed on its way, ready for the warp gate.', 'Spent by the c11 jump to SGR 1806-20.'],
        ['chain_lamina_stack', 'Chain Lamina Stack', 'Thin laminae of chain matter, stacked and bonded.', 'Part of every OpV hull and component.'],
        ['ni_chain_slab', 'Nickel Chain Slab', 'Nickel-64 frozen into chain matter, caged for the trip home.', 'Made at SGR 1806-20; it feeds the superheavy beams.'],
        ['chain_field_coil', 'Chain Field Coil', 'A coil wound with chain strand wire.', 'Part of OpV motors and field generators.'],
        ['chain_composite_rod', 'Chain Composite Rod', 'A rod of chain matter in a sintered matrix.', 'Part of OpV motors and pistons.'],
        ['chain_composite_rotor', 'Chain Composite Rotor', 'A pump rotor that keeps its shape at any speed.', 'Part of the OpV electric pump.'],
        ['superfluid_he3_seal', 'Superfluid He-3 Seal', 'A shaft seal flooded with superfluid helium-3: no friction at all.', 'Part of the OpV electric pump.'],
        ['chain_mesh_belt', 'Chain Mesh Belt', 'A belt woven from chain strand.', 'Part of the OpV conveyor module.'],
        ['opv_harmonic_drive', 'OpV Harmonic Drive', 'A strain-wave gear with a chain-matter flexspline.', 'Part of OpV pistons, robot arms and fluid regulators.'],
        ['th229_lasing_crystal', 'Th-229 Lasing Crystal', 'A crystal doped with thorium-229, the nucleus with an optical transition.', 'The lasing core of the OpV emitter.'],
        ['hpge_compton_crystal', 'HPGe Compton Crystal', 'High-purity germanium, cold enough to count single gamma photons.', 'The detector of the OpV sensor.'],
        ['inas_al_wafer', 'InAs/Al Wafer', 'Indium arsenide quantum wells under an epitaxial aluminium film.', 'The stock of topological qubits.'],
        ['gated_2deg_wafer', 'Gated 2DEG Wafer', 'A two-dimensional electron gas patterned with gates.', 'Cut with a cryo-CMOS die into tetron dies.'],
        ['tetron_die', 'Tetron Die', 'Four Majorana zero modes on one die: a topological qubit.', 'Tiled into tetron arrays.'],
        ['cryo_cmos_die', 'Cryo-CMOS Die', 'Control logic that runs at a few kelvin, beside the qubits.', 'Part of tetron dies and the cosmic mainframe.'],
        ['nb_tsv_interposer', 'Nb TSV Interposer', 'A silicon interposer with superconducting niobium through-vias.', 'Joins cold dies without leaking heat.'],
        ['cryo_optical_link', 'Cryo Optical Link', 'Carries data out of the cryostat as light, not heat.', 'Part of OpV emitters, sensors and the cosmic mainframe.'],
        ['hemt_amplifier', 'HEMT Amplifier', 'A cryogenic high-electron-mobility amplifier for qubit readout.', 'Part of the cosmic mainframe.'],
        ['gan_mmic', 'GaN MMIC', 'A gallium nitride microwave chip on silicon carbide.', 'Drives the transmitter tiles.'],
        ['sdd_die', 'Silicon Drift Detector Die', 'Float-zone silicon with drift rings and a tiny anode.', 'Counts X-rays one at a time.'],
        ['field_frozen_plate', 'Field-Frozen Plate', 'Chain matter pressed in a magnetar\'s field and frozen in shape.', 'Made at SGR 1806-20; OpV energy hatches and field generators.'],
        ['aln_power_die', 'AlN Power Die', 'An AlGaN transistor on aluminium nitride: an ultra-wide bandgap.', 'Switches OpV power in the energy hatches.'],
        ['tetron_array', 'Tetron Array', 'Tetron dies tiled into a fault-tolerant qubit array.', 'Made only at home.'],
        ['gamma_multilayer_mirror', 'Gamma Multilayer Mirror', 'Thousands of alternating layers that reflect gamma rays at grazing angles.', 'Gamma optics are made only at home.'],
        ['laue_lens', 'Laue Lens', 'Rings of crystals that focus gamma rays by diffraction.', 'Focuses the gamma beams of OpV optics.'],
        ['be_beam_window', 'Beryllium Beam Window', 'A thin beryllium window that lets the beam out of the vacuum.', 'Part of the antiproton source.'],
        ['ir_spallation_target', 'Iridium Spallation Target', 'Struck by the jet\'s protons, it yields antiprotons.', 'It wears out into a spent target.'],
        ['spent_ir_target', 'Spent Iridium Target', 'An iridium target worn out by spallation; still radioactive.', 'Recovered by an older machine, never voided.'],
        ['li6_hydride_shield', 'Li-6 Hydride Shield', 'Lithium-6 hydride soaks up the neutrons spallation throws.', 'Shields the antiproton source and the absorber.'],
        ['electron_cooler', 'Electron Cooler', 'A cold electron beam rides along the antiprotons and cools them.', 'Part of the antiproton decelerator.'],
        ['stochastic_cooling_pickup', 'Stochastic Cooling Pickup', 'Senses the beam\'s spread and kicks it back on track.', 'Van der Meer\'s trick at OpV scale.'],
        ['pb208_beam_cell', 'Pb-208 Beam Cell', 'Doubly magic lead-208, ready for the ion source.', 'Feeds the antiproton source and the distiller.'],
        ['octupole_trap_magnet', 'Octupole Trap Magnet', 'A superconducting octupole that holds neutral antihydrogen by its magnetic moment.', 'Part of the antihydrogen trap.'],
        ['levitation_trap_cell', 'Levitation Trap Cell', 'A cell that holds frozen antimatter off its walls.', 'Filled with antihydrogen ice.'],
        ['lyman_alpha_laser', 'Lyman-Alpha Laser', 'A 121.6 nm laser that cools trapped antihydrogen.', 'Part of the antihydrogen trap.'],
        ['gamma_absorber_tile', 'Gamma Absorber Tile', 'A dense tile that turns annihilation gammas into heat.', 'Lines the annihilation engine.'],
        ['tpv_panel', 'TPV Panel', 'A thermophotovoltaic panel: glowing heat in, electricity out.', 'Turns the annihilation engine\'s heat into power.'],
        ['acmf_pellet', 'ACMF Pellet', 'A fusion pellet ignited by a few antiprotons.', 'Burned with an antiproton stack for power.'],
        ['seed_positron_plasma', 'Seed Positron Plasma', 'A few positrons in a Penning trap, to seed the pair converter.', 'Carried from home to SGR 1806-20.'],
        ['dense_positron_cell', 'Dense Positron Cell', 'Positrons from the magnetar\'s pair cascade, packed into a trap.', 'For antihydrogen and the Kugelblitz charge.'],
        ['cold_antiproton_cell', 'Cold Antiproton Cell', 'Antiprotons decelerated and cooled into a trap.', 'Made at Cygnus X-1; stacked, frozen or burned at home.'],
        ['antiproton_stack_opv', 'OpV Antiproton Stack', 'Many cold antiproton cells merged into one dense stack.', 'Fuel for annihilation power.'],
        ['antihydrogen_ice_cell', 'Antihydrogen Ice Cell', 'Solid antihydrogen, levitated in a trap cell.', 'Made only at home.'],
        ['strangelet_seed', 'Strangelet Seed', 'A tiny lump of strange quark matter, kept away from normal matter.', 'Kept in the vault.'],
        ['stable_exotic_matter', 'Stable Exotic Matter', 'Negative-energy matter that stays put.', 'Fuels the Hawking collector and keeps the gate open.'],
        ['kugelblitz_core', 'Kugelblitz Core', 'A tiny black hole made from focused light.', 'Powers the Hawking drive and collector.'],
        ['hawking_drive', 'Hawking Drive', 'Pushes on the light of an evaporating black hole.', 'Brakes the pathfinder at Terzan 5.'],
        ['xnav_unit', 'XNAV Unit', 'Navigates by the timing of millisecond pulsars.', 'Guides probes through Terzan 5.'],
        ['node_power_transmitter', 'Node Power Transmitter', 'Beams power between collector nodes.', 'Part of the Terzan 5 node network.'],
        ['bulge_debris', 'Bulge Debris', 'Rubble from the body at Terzan 5\'s core.', 'Sorted into metal and silicate fractions.'],
        ['metal_feedstock', 'Metal Feedstock', 'Clean metal from the debris, ready for probes to build with.', 'Made at Terzan 5.'],
        ['silicate_debris_fraction', 'Silicate Debris Fraction', 'The rocky half of sorted debris.', 'Reduced to silicon alloy powder and oxygen.'],
        ['si_alloy_powder', 'Silicon Alloy Powder', 'Silicon and metal powder reduced from silicate debris.', 'Sintered into casings.'],
        ['cluster_sinter_casing', 'Cluster Sinter Casing', 'A casing a probe sinters from debris powders.', 'Made at Terzan 5.'],
        ['collector_node', 'Collector Node', 'A self-built node that gathers the cluster core\'s light.', 'It wears out into a spent node.'],
        ['spent_collector_node', 'Spent Collector Node', 'A collector node at the end of its life.', 'Taken back for its parts.'],
        ['deployed_node_pack', 'Deployed Node Pack', 'Four nodes and a probe seed, sent out together.', 'Spreads the node network.'],
        ['probe_seed', 'Probe Seed', 'A self-replicating probe: from feedstock, it builds another.', 'One returned seed makes two.'],
        ['vitamin_kit', 'Vitamin Kit', 'What a probe cannot make from debris: chips and rare elements.', 'Sent from home to Terzan 5.'],
        ['pathfinder_probe', 'Pathfinder Probe', 'A tetron array, an XNAV unit, a SHeQUID gyro and a Hawking drive.', 'Thrown by the c12 jump to Terzan 5.'],
        ['launched_pathfinder', 'Launched Pathfinder', 'A pathfinder on its way, ready for the warp gate.', 'Spent by the c12 jump to Terzan 5.'],
        ['pathfinder_probe_core', 'Pathfinder Probe Core', 'The core the landed pathfinder leaves.', 'Builds the first probe seed.'],
        ['bulge_light_census', 'Bulge Light Census', 'A survey of the starlight in the cluster core.', 'Made at Terzan 5; needed to reach MAX.'],
        ['superheavy_census_iv', 'Superheavy Census IV', 'Elements 124 and 126 and the island nuclide, charted.', 'Needed to reach MAX.'],
        ['element_124_recoil', 'Element 124 Recoil', 'Atoms of element 124 caught as they recoil (fiction above oganesson).', 'Curium-248 struck by a nickel-64 beam.'],
        ['element_126_recoil', 'Element 126 Recoil', 'Atoms of element 126 caught as they recoil (fiction above oganesson).', 'From an irradiated californium-249 target wheel.'],
        ['chain_strand_repeater', 'Chain Strand Repeater', 'Chain strand wire, a pasta strand repeater and a tetron die.', 'Carries OpV power over long links.'],
        ['sgr_a_chart', 'Sgr A* Chart', 'A chart of the galaxy\'s central black hole and its orbits.', 'Researches the MAX machine casing.']
    ]

    var BLOCKS = [
        ['field_frozen_casing', 'Field-Frozen Casing', 'A casing of field-frozen plate.', 'For OpV multiblocks.'],
        ['annihilation_shield_casing', 'Annihilation Shield Casing', 'Absorbs the gammas of matter meeting antimatter.', 'For the annihilation engine.'],
        ['neg_xhv_casing', 'NEG XHV Casing', 'A non-evaporable getter casing for extreme high vacuum.', 'For the antiproton and antihydrogen traps.']
    ]

    // kind, id, name
    var NAMES = [
        ['material', 'chain_strand', 'Chain Strand'],
        ['gmaterial', 'superfluid_helium_3', 'Superfluid Helium-3'],
        ['gmaterial', 'jet_proton_beam', 'Jet Proton Beam'],
        ['gmaterial', 'hot_pair_plasma', 'Hot Pair Plasma']
    ]

    var PREFIX = { material: 'material.gtceu.', gmaterial: 'material.grindless.' }

    // world, travel key, level, dimension, planet
    var PLACES = [
        ['sgr1806_orbit', 'sgr1806', 'SGR 1806-20', 'SGR 1806-20 Orbit', 'SGR 1806-20'],
        ['terzan5_core', 'terzan5', 'Terzan 5 Core', 'Terzan 5 Core', 'Terzan 5']
    ]

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        var tipped = function (kind) {
            return function (e) {
                add(kind + '.grindless.' + e[0], e[1])
                add('tooltip.grindless.' + e[0] + '.0', e[2])
                add('tooltip.grindless.' + e[0] + '.1', e[3])
            }
        }
        ITEMS.forEach(tipped('item'))
        BLOCKS.forEach(tipped('block'))
        NAMES.forEach(function (e) { add(PREFIX[e[0]] + e[1], e[2]) })
        PLACES.forEach(function (p) {
            add('level.grindless.' + p[0], p[2])
            add('dimension.grindless.' + p[0], p[3])
            add('planet.grindless.' + p[1], p[4])
        })
    })
})()
