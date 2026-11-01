// priority: 4600
// Gregtech Grindless - names and tooltips of the UHV foundation (startup_scripts/grindless/uhv/foundation.js):
//
//   grindless:<item> and grindless:<block>   item.grindless.<n> / block.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<material> (GT material)           material.gtceu.<n>
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // kind, id, [name, tip 0, tip 1]
    var ENTRIES = [
        ['item', 'berkelium_249',
            ['Berkelium-249', 'A few milligrams of a metal that half decays in under a year.', 'Separated by the transuranium facility. Stored for the next era.']],
        ['item', 'californium_252',
            ['Californium-252 Charge', 'A speck of californium that sheds neutrons on its own.', 'Separated by the transuranium facility. The high flux reactor seals it into a source.']],
        ['item', 'californium_252_source',
            ['Sealed Californium-252 Source', 'A double-walled capsule that floods its surroundings with neutrons.', 'Sealed by the high flux reactor. The cold-trap drill logs the ice with it.']],
        ['item', 'thorium_229',
            ['Thorium-229', 'The only nucleus whose excited state a laser can reach.', 'Milked from aged uranium-233 by the transuranium facility. The crystal growth furnace dopes a crystal with it.']],
        ['item', 'nickel_62_target',
            ['Nickel-62 Target', 'Enriched nickel pressed into a reactor target.', 'Made by the hot cell. The high flux reactor turns it into nickel-63.']],
        ['item', 'nickel_63_target',
            ['Nickel-63 Target', 'A target that glows faintly with beta decay for a century.', 'Irradiated by the high flux reactor. The betavoltaic fab plates it onto diodes.']],
        ['item', 'hfir_driver_element',
            ['HFIR Driver Element', 'Curved plates of uranium-233 in aluminium, packed around a flux trap.', 'Made by the fuel fabrication plant. The high flux reactor burns six per cycle.']],
        ['item', 'spent_hfir_driver_element',
            ['Spent HFIR Driver Element', 'Burnt-out driver plates, hot with fission products.', 'Contained waste of the high flux reactor. The pyroprocessing cell recovers its uranium-233.']],
        ['item', 'transcurium_target',
            ['Transcurium Target', 'Heavy curium and americium oxide in an aluminium cermet.', 'Loaded into the high flux reactor\'s flux trap.']],
        ['item', 'irradiated_transcurium_target',
            ['Irradiated Transcurium Target', 'A target soaked with neutrons, now holding berkelium and californium.', 'Made by the high flux reactor. The transuranium facility dissolves it.']],
        ['item', 'nuclear_clock',
            ['Nuclear Clock', 'A thorium-doped crystal ticking with its own nucleus, locked to a VUV comb.', 'Made by the nuclear clock lab. The UHV link of the wireless network and the warp gate\'s timebase.']],
        ['item', 'lithium_niobate_boule',
            ['Lithium Niobate Boule', 'A pale yellow crystal pulled from an iridium crucible.', 'Grown by the crystal growth furnace. Cut into wafers for thin-film photonics.']],
        ['item', 'lithium_niobate_wafer',
            ['Lithium Niobate Wafer', 'A polished slice of lithium niobate.', 'Cut from a boule. The photonic foundry bonds it into thin-film wafers.']],
        ['item', 'vuv_caf2_boule',
            ['VUV Calcium Fluoride Boule', 'A fluoride crystal clear down to the vacuum ultraviolet.', 'Grown by the crystal growth furnace. Cut into the optics of a VUV frequency comb.']],
        ['item', 'thorium_caf2_crystal',
            ['Th:CaF2 Crystal', 'Calcium fluoride with thorium-229 locked in its lattice.', 'Grown by the crystal growth furnace. The heart of the nuclear clock.']],
        ['item', 'eu_yso_boule',
            ['Eu:YSO Boule', 'Europium-doped yttrium orthosilicate that holds light for hours.', 'Grown by the crystal growth furnace. The photonic foundry cuts quantum memories from it.']],
        ['item', 'inp_boule',
            ['Indium Phosphide Boule', 'A dark crystal pulled under a boron oxide cap.', 'Grown by the crystal growth furnace. Cut into wafers for quantum cascade lasers.']],
        ['item', 'inp_wafer',
            ['Indium Phosphide Wafer', 'A polished slice of indium phosphide.', 'Cut from a boule. The MBE reactor grows superlattices on it.']],
        ['item', 'quantum_cascade_laser',
            ['Quantum Cascade Laser', 'Hundreds of layers a few atoms thick that glow in the mid-infrared.', 'Made by the MBE reactor. Optical processors and thermal sensors use it.']],
        ['item', 'thin_film_ln_modulator',
            ['Thin-Film LN Modulator', 'A lithium niobate waveguide that switches light at hundreds of gigahertz.', 'Made by the photonic foundry. The warp gate and the astrometer are lined with them.']],
        ['item', 'sic_power_module',
            ['SiC Power Module', 'Silicon carbide switches that hold kilovolts at 200 °C.', 'Made by the SiC device fab. Arrays, segments, the gate and the ICAN motor use it.']],
        ['item', 'sic_mirror_blank',
            ['SiC Mirror Blank', 'A light, stiff silicon carbide mirror substrate.', 'Made by the SiC device fab. The astrometer\'s mirrors and the Casimir plates start here.']],
        ['item', 'nbn_coated_sic_plate',
            ['NbN-Coated SiC Plate', 'A mirror blank coated with superconducting niobium nitride.', 'Coated by the MOCVD reactor. The Casimir array stacks it into cavities.']],
        ['item', 'imm_solar_array',
            ['IMM Solar Array', 'Inverted metamorphic cells: a third of the sunlight turned to power.', 'Made by the solar array fab. The swarm segments carry them.']],
        ['item', 'red_tuned_solar_array',
            ['Red-Tuned Solar Array', 'Multijunction cells tuned to a red dwarf\'s light.', 'Made by the solar array fab. Proxima b\'s solar field uses them.']],
        ['item', 'betavoltaic_cell',
            ['Betavoltaic Cell', 'Nickel-63 on a diamond diode: microwatts for a century.', 'Made by the betavoltaic fab. Segments, rovers and probes stay alive through the dark with it.']],
        ['item', 'c12_diamond_spreader',
            ['C-12 Diamond Spreader', 'Isotopically pure diamond, the best heat conductor there is.', 'Made by the diamond lattice fab. Each swarm segment cools its laser on one.']],
        ['item', 'positron_cartridge',
            ['Positron Cartridge', 'A Penning trap holding a cloud of cooled positrons.', 'Filled by the positron accumulator. The antimatter trap pairs it with antiprotons.']],
        ['item', 'antihydrogen_cartridge',
            ['Antihydrogen Cartridge', 'A magnetic bottle of neutral antihydrogen atoms.', 'Filled by the antimatter trap. The warp gate spends it.']],
        ['item', 'exotic_matter_cell',
            ['Exotic Matter Cell', 'A pocket of negative energy density between Casimir plates.', 'Harvested by the Casimir array. The warp gate holds its throat open with it.']],
        ['item', 'zblan_fibre',
            ['ZBLAN Fibre Spool', 'Fluoride glass fibre drawn in free fall, clear far into the infrared.', 'Drawn by the ZBLAN draw tower in orbit. The gate and the astrometer carry their light in it.']],
        ['item', 'pbo_fibre',
            ['PBO Fibre', 'A golden polymer fibre stronger than steel by weight many times over.', 'Spun by the PBO plant. The tether ribbon works weaves it.']],
        ['item', 'tether_ribbon_segment',
            ['Tether Ribbon Segment', 'A woven ribbon of PBO and nanotube yarn, kilometres long.', 'Made by the tether ribbon works. The space elevator is built from them.']],
        ['item', 'tether_climber',
            ['Tether Climber', 'A laser-powered cabin that crawls up the ribbon.', 'Made by the tether ribbon works. The space elevator sends cargo up with it.']],
        ['item', 'uhtc_tile',
            ['UHTC Tile', 'Zirconium diboride and silicon carbide that shrug off 3,000 °C.', 'Sintered by the spark plasma sinterer. Nozzles and the solar probe\'s shield use it.']],
        ['item', 'uhtc_nozzle',
            ['UHTC Nozzle', 'A rocket nozzle of ultra-high-temperature ceramic lined with tantalum carbide.', 'Sintered by the spark plasma sinterer. The ICAN motor is built around it.']],
        ['item', 'organoid_processor',
            ['Organoid Processor', 'Living neurons on a chitosan scaffold, wired to electrodes.', 'Grown by the organoid array. Wetware that learns.']],
        ['item', 'proxima_flora_sample',
            ['Proxima Flora Sample', 'A sealed jar of dark, red-light-hungry growth from Proxima b.', 'Brought back by the xenoflora rover bay. Only a BSL-4 facility may open it.']],
        ['item', 'proxima_regolith_survey',
            ['Proxima Regolith Survey', 'A data orb of the ground the rovers crossed.', 'Recorded by the xenoflora rover bay. The cold-trap drill needs it to find the ice.']],
        ['item', 'characterised_xeno_strain',
            ['Characterised Xeno Strain', 'A Proxima organism, sequenced and safe to handle.', 'Released by the sample receiving facility. The greenhouse grows it.']],
        ['item', 'xeno_genome_data',
            ['Xeno Genome Data', 'A data orb holding the genes of an alien life.', 'Read by the sample receiving facility. The biofoundry builds its xeno cultures from it.']],
        ['item', 'proxima_ice_core',
            ['Proxima Night-Side Ice Core', 'Ice from the dark side, rich in deuterium and flare-cooked organics.', 'Drilled by the cold-trap drill. Heavy water and sample receiving use it.']],
        ['item', 'cold_trap_regolith',
            ['Cold-Trap Regolith', 'Frozen dirt from where the sun never shines, laced with metals.', 'Drilled by the cold-trap drill. The biomining heap leaches it.']],
        ['item', 'chitosan_scaffold',
            ['Chitosan Scaffold', 'A porous sponge cast from xeno fungal walls.', 'Made by the xenobiochemistry plant. Organoids grow on it.']],
        ['item', 'xeno_radioprotectant',
            ['Xeno Radioprotectant', 'An extract that lets cells survive Proxima\'s flares.', 'Made by the xenobiochemistry plant. The organoid lab sterilises its medium with it.']],
        ['item', 'infrared_pigment',
            ['Infrared Pigment', 'A pigment that drinks light far past the red.', 'Made by the xenobiochemistry plant. It coats the astrometer\'s and the clock\'s optics.']],
        ['item', 'aluminium_reflector_film',
            ['Aluminium Reflector Film', 'A sheet of aluminised polymer thinner than a soap bubble.', 'Made by the light sail fab from Mercury\'s aluminium. The swarm segments spread it.']],
        ['item', 'swarm_segment',
            ['Swarm Segment', 'A reflector, solar cells and a fibre laser that beams power home.', 'Made by the swarm segment foundry. The swarm control station flies them.']],
        ['item', 'worn_swarm_segment',
            ['Worn Swarm Segment', 'A segment scoured by the solar wind, its film torn.', 'Returned by the swarm control station. The segment foundry refurbishes it.']],
        ['item', 'coronal_field_map',
            ['Coronal Field Map', 'A data orb of the Sun\'s magnetic field, measured from inside its corona.', 'Recorded by the solar probe bay. The swarm dodges coronal mass ejections with it.']],
        ['item', 'stellar_neighbourhood_chart',
            ['Stellar Neighbourhood Chart', 'A data orb with the nearby stars placed to a microarcsecond.', 'Made by the baseline astrometer. The research of the next era\'s casing needs it.']],
        ['item', 'proxima_gate_seed',
            ['Proxima Gate Seed', 'A tuned resonator that tells a warp gate where its other end is.', 'Made from the stellar chart. The warp gate pairs Earth with Proxima b through it.']],
        ['block', 'bsl4_casing',
            ['BSL-4 Casing', 'A sealed, negative-pressure wall panel with a decontamination seam.', 'Structure block of the sample receiving facility, the xenobotany greenhouse and the xenobiochemistry plant.']],
        ['block', 'warp_gate_casing',
            ['Warp Gate Casing', 'A ring segment of superconducting coils and modulator mounts.', 'Structure block of the warp gate, at both ends.']],
        ['block', 'hangar_casing',
            ['Hangar Casing', 'A pressurised bay wall with docking rails.', 'Structure block of the solar probe bay and the xenoflora rover bay.']],

        ['material', 'zirconia', ['Zirconia']],
        ['material', 'zirconium_diboride', ['Zirconium Diboride']],
        ['material', 'niobium_oxide', ['Niobium Oxide']],
        ['material', 'lead_fluoride', ['Lead Fluoride']],
        ['material', 'ultrapure_water', ['Ultrapure Water']],
        ['material', 'proxima_pgm_liquor', ['Proxima PGM Liquor']],
        ['material', 'proxima_ree_liquor', ['Proxima REE Liquor']],
        ['material', 'sterilised_growth_medium', ['Sterilised Growth Medium']],
        ['material', 'hdehp_solvent', ['HDEHP Solvent']],
        ['material', 'pbo_dope', ['PBO Dope']],
        ['material', 'oganesson_propellant', ['Oganesson Propellant']],
        ['material', 'deuterium_enriched_water', ['Deuterium-Enriched Water']]
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
            add(kind + '.grindless.' + id, t[0])
            add('tooltip.grindless.' + id + '.0', t[1])
            add('tooltip.grindless.' + id + '.1', t[2])
        })
    })
})()
